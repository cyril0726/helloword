import { DurableObject } from "cloudflare:workers";

// Pas de bindings externes nécessaires pour ce Durable Object (pas de D1,
// pas d'appel à un autre service) — l'état vit entièrement en local.
type Env = {};

type Status = "waiting" | "round_pending" | "round_live" | "finished";

interface PlayerState {
  connected: boolean;
  score: number;
}

// Un clic valide enregistré pendant une manche (après le signal "go").
interface RoundClick {
  pseudo: string;
  reactionMs: number; // temps écoulé entre le signal et la réception du clic, côté serveur
}

// Forme de l'état persisté en ctx.storage — uniquement ce qui DOIT survivre
// à une hibernation du Durable Object (voir constructeur et persistState()).
interface PersistedState {
  players: [string, PlayerState][]; // Map non sérialisable telle quelle → tableau de paires
  hostPseudo: string | null;
  status: Status;
  currentRound: number;
}

const MAX_ROUNDS = 5;
const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 5000;
const ROUND_TIMEOUT_MS = 3000;
const POINTS_BY_RANK = [3, 2, 1]; // 1er, 2e, 3e ; au-delà : 0 point
const STATE_KEY = "state";

// ============================================================================
// QuickdrawRoom : une instance = une salle de jeu (identifiée par son code).
// Gère 2 à 8 joueurs connectés en WebSocket, diffuse un signal simultané à
// tous, et calcule le classement par temps de réaction.
//
// Protocole des messages échangés (JSON), côté client → serveur :
//   { type: 'join', pseudo }         → rejoindre la salle
//   { type: 'start_round' }          → lancer une manche (hôte uniquement)
//   { type: 'click' }                → réagir au signal (ou faute si trop tôt)
//
// Et serveur → client(s), en réponse ou diffusés à tous :
//   joined, error, player_list, round_pending, go, fault, player_faulted,
//   player_clicked, round_result, game_over
// (voir chaque handler ci-dessous pour le détail de chaque message)
// ============================================================================
export class QuickdrawRoom extends DurableObject<Env> {
  // Reconstruit à chaque réveil via constructeur + sockets restaurées par
  // Cloudflare nativement (voir plus bas) — pas besoin de le persister.
  private sockets: Map<WebSocket, string> = new Map(); // ws -> pseudo

  // État persisté manuellement (ctx.storage), car il doit survivre à
  // l'hibernation du Durable Object (voir constructeur + persistState()).
  private players: Map<string, PlayerState> = new Map();
  private hostPseudo: string | null = null;
  private status: Status = "waiting";
  private currentRound = 0;

  // État volatile de la manche EN COURS : acceptable de le perdre en cas
  // d'hibernation en plein milieu d'une manche (fenêtre de quelques
  // secondes) — l'hôte relancerait simplement une nouvelle manche, seuls
  // les scores/joueurs/statut de partie doivent absolument survivre.
  private roundStartTimestamp: number | null = null;
  private roundClicks: RoundClick[] = [];
  private roundFaults: Set<string> = new Set();
  private roundTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

  private stateLoaded = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    // Les connexions WebSocket, elles, survivent NATIVEMENT à l'hibernation
    // (c'est tout l'intérêt de l'API Hibernation ctx.acceptWebSocket) —
    // Cloudflare les restaure automatiquement ici, sans qu'on ait besoin
    // de les persister nous-mêmes comme le reste de l'état.
    for (const ws of ctx.getWebSockets()) {
      const pseudo = ws.deserializeAttachment()?.pseudo;
      if (pseudo) this.sockets.set(ws, pseudo);
    }

    // Charge l'état persisté AVANT de traiter le moindre message.
    // blockConcurrencyWhile garantit qu'aucun webSocketMessage() n'est
    // exécuté tant que cette promesse n'est pas résolue — évite une race
    // condition où un message arriverait avant que l'état soit rechargé.
    ctx.blockConcurrencyWhile(async () => {
      const saved = await ctx.storage.get<PersistedState>(STATE_KEY);
      if (saved) {
        this.players = new Map(saved.players);
        this.hostPseudo = saved.hostPseudo;
        this.status = saved.status;
        this.currentRound = saved.currentRound;
      }
      this.stateLoaded = true;
    });
  }

  // Sauvegarde l'état critique. Appelé après chaque mutation significative
  // (join, start_round, triggerGo, endRound, déconnexion) — pas à chaque
  // micro-changement, pour limiter les écritures inutiles.
  private async persistState() {
    const data: PersistedState = {
      players: Array.from(this.players.entries()),
      hostPseudo: this.hostPseudo,
      status: this.status,
      currentRound: this.currentRound
    };
    await this.ctx.storage.put(STATE_KEY, data);
  }

  // Point d'entrée HTTP du Durable Object, appelé depuis routes/quickdraw.ts
  // (room.fetch(c.req.raw)) uniquement pour l'upgrade WebSocket initial —
  // aucune autre route HTTP n'est gérée ici.
  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // acceptWebSocket (API Hibernation) plutôt que server.accept() classique :
    // permet à Cloudflare d'hiberner cet objet entre deux messages tout en
    // gardant la connexion ouverte côté client, réduisant les coûts.
    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  // Envoie un message à un seul client. Le try/catch protège contre une
  // socket déjà fermée côté client (déconnexion brutale, onglet fermé)
  // sans faire planter le reste du traitement du message en cours.
  private send(ws: WebSocket, data: unknown) {
    try {
      ws.send(JSON.stringify(data));
    } catch {
      // socket probablement fermé, ignoré silencieusement
    }
  }

  // Diffuse un message à tous les clients connectés, sauf `exclude` si
  // fourni (utile pour ne pas renvoyer à l'émetteur d'un événement une
  // info qu'il connaît déjà via sa propre réponse directe).
  private broadcast(data: unknown, exclude?: WebSocket) {
    const payload = JSON.stringify(data);
    for (const ws of this.sockets.keys()) {
      if (ws === exclude) continue;
      try {
        ws.send(payload);
      } catch {
        // ignore
      }
    }
  }

  // Méthode RPC, appelée directement depuis routes/quickdraw.ts (pas via
  // fetch()) — Cloudflare permet d'invoquer une méthode publique d'un
  // Durable Object comme une fonction normale sur son stub. Sert
  // uniquement à la boucle anti-collision de code lors de la création
  // d'une nouvelle salle : "cette instance a-t-elle déjà un état enregistré ?"
  async roomExists(): Promise<boolean> {
    return this.players.size > 0;
  }

  // Vue "publique" de la liste des joueurs (celle envoyée aux clients) —
  // ne renvoie que ce qui est utile côté UI, pas la structure interne brute.
  private publicPlayersList() {
    return Array.from(this.players.entries()).map(([pseudo, state]) => ({
      pseudo,
      connected: state.connected,
      score: state.score
    }));
  }

  // Point d'entrée de tous les messages WebSocket entrants — appelé
  // automatiquement par Cloudflare (callback de l'API Hibernation) à
  // chaque message reçu sur une socket acceptée via acceptWebSocket().
  async webSocketMessage(ws: WebSocket, message: string) {
    // Sécurité : si un message arrive avant la fin du chargement (cas
    // quasi impossible vu blockConcurrencyWhile, mais gardé par prudence).
    if (!this.stateLoaded) {
      this.send(ws, { type: "error", message: "Salle en cours d'initialisation, réessaie" });
      return;
    }

    let data: any;
    try {
      data = JSON.parse(message);
    } catch {
      this.send(ws, { type: "error", message: "Message invalide" });
      return;
    }

    switch (data.type) {
      case "join":
        return this.handleJoin(ws, data.pseudo);
      case "start_round":
        return this.handleStartRound(ws);
      case "click":
        return this.handleClick(ws);
      default:
        this.send(ws, { type: "error", message: "Type de message inconnu" });
    }
  }

  // { type: 'join', pseudo }
  // Gère à la fois la première connexion d'un joueur ET sa reconnexion
  // (même pseudo, après une déconnexion) — distinction faite via `existing`.
  private async handleJoin(ws: WebSocket, pseudoRaw: string) {
    const pseudo = (pseudoRaw || "").trim().slice(0, 20);

    if (!pseudo) {
      this.send(ws, { type: "error", message: "Pseudo invalide" });
      return;
    }

    const existing = this.players.get(pseudo);

    // Un pseudo "connecté" ne peut pas être repris par quelqu'un d'autre —
    // mais un pseudo existant et DÉCONNECTÉ peut être récupéré (reconnexion).
    if (existing && existing.connected) {
      this.send(ws, { type: "error", message: "Pseudo déjà pris" });
      return;
    }

    // Nouvelle salle "fermée" dès qu'une partie a démarré : on refuse un
    // nouveau joueur (jamais vu avant) si la partie n'est plus en attente.
    if (this.status !== "waiting" && !existing) {
      this.send(ws, { type: "error", message: "La partie a déjà démarré" });
      return;
    }

    if (existing) {
      // Reconnexion : le score et l'historique du joueur sont conservés.
      existing.connected = true;
    } else {
      this.players.set(pseudo, { connected: true, score: 0 });
      // Le tout premier joueur à rejoindre devient l'hôte, définitivement
      // (aucun transfert d'hôte prévu si celui-ci se déconnecte).
      if (!this.hostPseudo) this.hostPseudo = pseudo;
    }

    this.sockets.set(ws, pseudo);
    // serializeAttachment : attache le pseudo à CETTE socket spécifique,
    // pour que ctx.getWebSockets() (au réveil d'hibernation, voir
    // constructeur) puisse retrouver qui est qui sans autre info.
    ws.serializeAttachment({ pseudo });

    await this.persistState();

    // Réponse individuelle au joueur qui vient de rejoindre : son propre
    // statut (isHost, état actuel de la partie) pour initialiser son écran.
    this.send(ws, {
      type: "joined",
      pseudo,
      isHost: pseudo === this.hostPseudo,
      status: this.status,
      currentRound: this.currentRound,
      maxRounds: MAX_ROUNDS,
      players: this.publicPlayersList()
    });

    // Diffusion aux AUTRES joueurs déjà présents : mise à jour de la liste
    // (exclu l'émetteur, qui a déjà sa propre liste dans le message ci-dessus).
    this.broadcast(
      { type: "player_list", players: this.publicPlayersList() },
      ws
    );
  }

  // { type: 'start_round' } — hôte uniquement.
  //
  // ⚠️ POINT DE VIGILANCE : le délai avant le signal (setTimeout ci-dessous)
  // NE SURVIT PAS à une hibernation du Durable Object, contrairement à
  // l'état persisté via ctx.storage. Si l'objet hiberne pendant cette
  // fenêtre de 1 à 5 secondes (peu probable en usage actif, mais possible),
  // le setTimeout programmé est perdu : le signal "go" ne serait jamais
  // envoyé, la manche resterait bloquée en "round_pending" indéfiniment.
  // Solution correcte si ce risque devient gênant en usage réel :
  // remplacer ce setTimeout par ctx.storage.setAlarm(Date.now() + delay),
  // qui est le mécanisme natif des Durable Objects conçu justement pour
  // survivre à l'hibernation (contrairement aux timers JS classiques).
  // Non corrigé pour l'instant : risque jugé faible tant que les parties
  // se jouent avec des connexions WebSocket actives en continu.
  private async handleStartRound(ws: WebSocket) {
    const pseudo = this.sockets.get(ws);

    if (!pseudo || pseudo !== this.hostPseudo) {
      this.send(ws, { type: "error", message: "Seul l'hôte peut lancer la manche" });
      return;
    }

    if (this.status !== "waiting" && this.status !== "round_pending") {
      this.send(ws, { type: "error", message: "Manche déjà en cours" });
      return;
    }

    if (this.currentRound >= MAX_ROUNDS) {
      this.send(ws, { type: "error", message: "La partie est terminée" });
      return;
    }

    this.currentRound++;
    this.status = "round_pending";
    this.roundClicks = [];
    this.roundFaults = new Set();
    this.roundStartTimestamp = null;

    await this.persistState();

    this.broadcast({
      type: "round_pending",
      round: this.currentRound,
      maxRounds: MAX_ROUNDS
    });

    // Délai aléatoire avant le signal : empêche toute anticipation, chaque
    // manche a un timing imprévisible. Voir avertissement ci-dessus sur la
    // fiabilité de ce setTimeout face à l'hibernation.
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

    setTimeout(() => this.triggerGo(), delay);
  }

  // Envoie le signal "go" à tous les clients SIMULTANÉMENT (c'est le cœur
  // du besoin temps réel du jeu) et arme un timeout de sécurité pour clore
  // la manche même si un joueur ne clique jamais (AFK, déconnexion...).
  // Même avertissement hibernation que handleStartRound ci-dessus pour ce
  // second setTimeout (ROUND_TIMEOUT_MS).
  private async triggerGo() {
    if (this.status !== "round_pending") return; // sécurité si la partie a été reset entre temps

    this.status = "round_live";
    this.roundStartTimestamp = Date.now();

    await this.persistState();

    this.broadcast({ type: "go", timestamp: this.roundStartTimestamp });

    this.roundTimeoutHandle = setTimeout(() => this.endRound(), ROUND_TIMEOUT_MS);
  }

  // { type: 'click' }
  // Gère 3 cas : clic avant le signal (faute), clic valide pendant la
  // fenêtre active, ou clic ignoré (hors contexte / déjà traité).
  private handleClick(ws: WebSocket) {
    const pseudo = this.sockets.get(ws);
    if (!pseudo) return;

    const now = Date.now();

    // Clic reçu pendant "round_pending" (avant le signal "go") = faute.
    // Le joueur est exclu du classement de cette manche, quel qu'ait été
    // son temps — empêche le spam anticipé pour maximiser ses chances.
    if (this.status === "round_pending") {
      this.roundFaults.add(pseudo);
      this.send(ws, { type: "fault" });
      this.broadcast({ type: "player_faulted", pseudo }, ws);
      return;
    }

    // Clic hors fenêtre valide (partie pas en "round_live", ou signal pas
    // encore émis pour une raison quelconque) : ignoré silencieusement.
    if (this.status !== "round_live" || this.roundStartTimestamp === null) {
      return;
    }

    // Un joueur déjà en faute, ou ayant déjà cliqué cette manche, ne peut
    // pas re-cliquer une seconde fois (évite un double comptage).
    if (this.roundFaults.has(pseudo)) return;
    if (this.roundClicks.some(c => c.pseudo === pseudo)) return;

    const reactionMs = now - this.roundStartTimestamp;
    this.roundClicks.push({ pseudo, reactionMs });

    // Diffusion "live" : chaque clic valide est annoncé immédiatement à
    // tous, avant même la fin de la manche — c'est ce qui permet d'afficher
    // "Kevin a cliqué en 340ms" en direct côté frontend.
    this.broadcast({ type: "player_clicked", pseudo, reactionMs });

    // Si tous les joueurs actifs (ni en faute — note : les déconnectés ne
    // sont pas filtrés ici, voir limite ci-dessous) ont cliqué, on peut
    // clore la manche sans attendre le timeout de sécurité.
    const activePlayers = Array.from(this.players.keys()).filter(
      p => !this.roundFaults.has(p)
    );

    if (this.roundClicks.length >= activePlayers.length) {
      if (this.roundTimeoutHandle) clearTimeout(this.roundTimeoutHandle);
      this.endRound();
    }
  }

  // Calcule le classement de la manche, attribue les points, et notifie
  // tout le monde. Déclenche aussi la fin de partie si c'est la dernière
  // manche (MAX_ROUNDS atteint).
  private async endRound() {
    if (this.status !== "round_live") return;

    const ranking = [...this.roundClicks].sort((a, b) => a.reactionMs - b.reactionMs);

    ranking.forEach((entry, index) => {
      const points = POINTS_BY_RANK[index] ?? 0; // au-delà du 3e : 0 point
      const player = this.players.get(entry.pseudo);
      if (player) player.score += points;
    });

    const isLastRound = this.currentRound >= MAX_ROUNDS;
    this.status = isLastRound ? "finished" : "waiting";

    await this.persistState();

    this.broadcast({
      type: "round_result",
      round: this.currentRound,
      ranking,
      faults: Array.from(this.roundFaults),
      scores: this.publicPlayersList()
    });

    if (isLastRound) {
      const finalRanking = this.publicPlayersList().sort((a, b) => b.score - a.score);
      this.broadcast({ type: "game_over", finalRanking });
    }
  }

  // Callback Cloudflare, appelé quand une socket se ferme (fermeture
  // propre ou perte de connexion détectée). Le joueur n'est PAS retiré de
  // `players` — juste marqué déconnecté, pour permettre sa reconnexion
  // ultérieure avec son score conservé (voir handleJoin).
  async webSocketClose(ws: WebSocket) {
    const pseudo = this.sockets.get(ws);
    this.sockets.delete(ws);

    if (pseudo) {
      const player = this.players.get(pseudo);
      if (player) player.connected = false;
      await this.persistState();
      this.broadcast({ type: "player_list", players: this.publicPlayersList() });
    }
  }

  // Une erreur de socket est traitée comme une fermeture — même logique
  // de déconnexion propre, pas de gestion différenciée pour l'instant.
  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }
}