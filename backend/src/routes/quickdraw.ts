import { Hono } from "hono";

// Import de TYPE uniquement (pas de code exécuté) : sert à typer le binding
// ci-dessous, pour que TypeScript connaisse les méthodes RPC de la classe
// (roomExists) directement sur le stub, sans dépendre du runtime.
// À la différence de index.ts, ce fichier n'a jamais besoin de la vraie
// classe (pas d'export Wrangler à faire ici) — juste de sa forme/typage.
import type { QuickdrawRoom } from "../durable-objects/QuickdrawRoom";

// Binding Cloudflare injecté depuis wrangler.jsonc.
// Le paramètre générique <QuickdrawRoom> permet à TypeScript de connaître
// les méthodes RPC exposées par la classe (ex: roomExists()) directement
// sur le stub retourné par .get(id) — sans lui, TS voit un stub générique
// sans méthode connue, d'où l'erreur "Property 'roomExists' does not exist".
type Env = {
  QUICKDRAW_ROOM: DurableObjectNamespace<QuickdrawRoom>;
};

// Création du routeur Hono dédié à Quickdraw.
// Il sera monté dans index.ts avec : app.route("/api/quickdraw", quickdraw)
const quickdraw = new Hono<{ Bindings: Env }>();

// Même alphabet que TicTacToe : pas de caractères ambigus (0/O, 1/I)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Génère un code aléatoire de salle. Exemple : "X7KP92"
function generateCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// POST /api/quickdraw/create
// Création d'une nouvelle partie. Retourne le code de salle.
//
// Contrairement à tictactoe.ts (qui vérifie la collision via une requête D1
// classique), QuickDraw n'a pas de base de données — l'état d'une salle vit
// uniquement dans son Durable Object. On vérifie donc la collision en
// appelant directement une méthode RPC exposée par la classe QuickdrawRoom
// (roomExists()) plutôt qu'une requête SQL. idFromName(code) étant
// déterministe, réutiliser un code déjà pris renverrait sinon la même
// instance qu'une salle existante (avec ses joueurs déjà connectés).
quickdraw.post("/create", async (c) => {
  let code = generateCode();

  for (let attempts = 0; attempts < 5; attempts++) {
    const id = c.env.QUICKDRAW_ROOM.idFromName(code);
    const stub = c.env.QUICKDRAW_ROOM.get(id);

    // Appel RPC direct sur le stub (pas de fetch() ici) : Cloudflare permet
    // d'invoquer une méthode publique de la classe Durable Object comme une
    // fonction normale, elle réveille/instancie l'objet si besoin.
    const exists = await stub.roomExists();
    if (!exists) break;

    code = generateCode();
  }

  return c.json({ code });
});

// GET /api/quickdraw/:code/ws  → upgrade WebSocket, routé vers le Durable Object
//
// Le .toUpperCase() ici doit rester cohérent avec le composable frontend
// (qui uppercase aussi le code avant envoi) — sinon deux joueurs tapant
// "abc123" et "ABC123" atterriraient sur deux instances DO différentes
// (idFromName est sensible à la casse).
quickdraw.get("/:code/ws", async (c) => {
  const code = c.req.param("code").toUpperCase();

  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.text("Expected WebSocket upgrade", 426);
  }

  const id = c.env.QUICKDRAW_ROOM.idFromName(code);
  const room = c.env.QUICKDRAW_ROOM.get(id);

  // Transmet directement la requête HTTP brute au Durable Object — c'est lui
  // (sa méthode fetch(), voir QuickdrawRoom.ts) qui gère réellement l'upgrade
  // WebSocket, cette route ne fait que router vers la bonne instance.
  return room.fetch(c.req.raw);
});

export default quickdraw;
