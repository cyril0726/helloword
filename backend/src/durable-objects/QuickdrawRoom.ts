import { DurableObject } from "cloudflare:workers";

type Env = {};

type Status = "waiting" | "round_pending" | "round_live" | "finished";

interface PlayerState {
  connected: boolean;
  score: number;
}

interface RoundClick {
  pseudo: string;
  reactionMs: number;
}

interface PersistedState {
  players: [string, PlayerState][];
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

export class QuickdrawRoom extends DurableObject<Env> {
  // Reconstruit à chaque réveil via constructeur + sockets restaurées par Cloudflare
  private sockets: Map<WebSocket, string> = new Map(); // ws -> pseudo

  // État persisté manuellement (ctx.storage), car il doit survivre à l'hibernation
  private players: Map<string, PlayerState> = new Map();
  private hostPseudo: string | null = null;
  private status: Status = "waiting";
  private currentRound = 0;

  // État volatile de manche en cours : acceptable de le perdre en cas d'hibernation
  // en plein milieu d'une manche (cas rare, la manche redémarrerait proprement)
  private roundStartTimestamp: number | null = null;
  private roundClicks: RoundClick[] = [];
  private roundFaults: Set<string> = new Set();
  private roundTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

  private stateLoaded = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    // Restaure les sockets déjà acceptés (survivent nativement à l'hibernation)
    for (const ws of ctx.getWebSockets()) {
      const pseudo = ws.deserializeAttachment()?.pseudo;
      if (pseudo) this.sockets.set(ws, pseudo);
    }

    // Charge l'état persisté AVANT de traiter le moindre message
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

  private async persistState() {
    const data: PersistedState = {
      players: Array.from(this.players.entries()),
      hostPseudo: this.hostPseudo,
      status: this.status,
      currentRound: this.currentRound
    };
    await this.ctx.storage.put(STATE_KEY, data);
  }

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  private send(ws: WebSocket, data: unknown) {
    try {
      ws.send(JSON.stringify(data));
    } catch {
      // socket probablement fermé, ignoré silencieusement
    }
  }

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

  private publicPlayersList() {
    return Array.from(this.players.entries()).map(([pseudo, state]) => ({
      pseudo,
      connected: state.connected,
      score: state.score
    }));
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    // sécurité : si un message arrive avant la fin du chargement (cas quasi impossible
    // vu blockConcurrencyWhile, mais gardé par prudence)
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

  private async handleJoin(ws: WebSocket, pseudoRaw: string) {
    const pseudo = (pseudoRaw || "").trim().slice(0, 20);

    if (!pseudo) {
      this.send(ws, { type: "error", message: "Pseudo invalide" });
      return;
    }

    const existing = this.players.get(pseudo);

    if (existing && existing.connected) {
      this.send(ws, { type: "error", message: "Pseudo déjà pris" });
      return;
    }

    if (this.status !== "waiting" && !existing) {
      this.send(ws, { type: "error", message: "La partie a déjà démarré" });
      return;
    }

    // reconnexion : le joueur existait déjà mais était déconnecté
    if (existing) {
      existing.connected = true;
    } else {
      this.players.set(pseudo, { connected: true, score: 0 });
      if (!this.hostPseudo) this.hostPseudo = pseudo;
    }

    this.sockets.set(ws, pseudo);
    ws.serializeAttachment({ pseudo });

    await this.persistState();

    this.send(ws, {
      type: "joined",
      pseudo,
      isHost: pseudo === this.hostPseudo,
      status: this.status,
      currentRound: this.currentRound,
      maxRounds: MAX_ROUNDS,
      players: this.publicPlayersList()
    });

    this.broadcast(
      { type: "player_list", players: this.publicPlayersList() },
      ws
    );
  }

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

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

    setTimeout(() => this.triggerGo(), delay);
  }

  private async triggerGo() {
    if (this.status !== "round_pending") return; // sécurité si la partie a été reset entre temps

    this.status = "round_live";
    this.roundStartTimestamp = Date.now();

    await this.persistState();

    this.broadcast({ type: "go", timestamp: this.roundStartTimestamp });

    this.roundTimeoutHandle = setTimeout(() => this.endRound(), ROUND_TIMEOUT_MS);
  }

  private handleClick(ws: WebSocket) {
    const pseudo = this.sockets.get(ws);
    if (!pseudo) return;

    const now = Date.now();

    // clic avant le signal = faute
    if (this.status === "round_pending") {
      this.roundFaults.add(pseudo);
      this.send(ws, { type: "fault" });
      this.broadcast({ type: "player_faulted", pseudo }, ws);
      return;
    }

    if (this.status !== "round_live" || this.roundStartTimestamp === null) {
      return; // clic hors fenêtre valide, ignoré
    }

    // déjà cliqué ou déjà en faute cette manche
    if (this.roundFaults.has(pseudo)) return;
    if (this.roundClicks.some(c => c.pseudo === pseudo)) return;

    const reactionMs = now - this.roundStartTimestamp;
    this.roundClicks.push({ pseudo, reactionMs });

    this.broadcast({ type: "player_clicked", pseudo, reactionMs });

    const activePlayers = Array.from(this.players.keys()).filter(
      p => !this.roundFaults.has(p)
    );

    if (this.roundClicks.length >= activePlayers.length) {
      if (this.roundTimeoutHandle) clearTimeout(this.roundTimeoutHandle);
      this.endRound();
    }
  }

  private async endRound() {
    if (this.status !== "round_live") return;

    const ranking = [...this.roundClicks].sort((a, b) => a.reactionMs - b.reactionMs);

    ranking.forEach((entry, index) => {
      const points = POINTS_BY_RANK[index] ?? 0;
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

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws);
  }
}