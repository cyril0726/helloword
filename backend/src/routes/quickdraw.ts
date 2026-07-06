import { Hono } from "hono";

type Env = {
  QUICKDRAW_ROOM: DurableObjectNamespace;
};

const quickdraw = new Hono<{ Bindings: Env }>();

// Même alphabet que TicTacToe : pas de caractères ambigus (0/O, 1/I)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// POST /api/quickdraw/create
quickdraw.post("/create", async (c) => {
  const code = generateCode();

  // Force la création de l'instance Durable Object associée à ce code
  // (elle sera réellement initialisée au premier appel fetch/WebSocket)
  const id = c.env.QUICKDRAW_ROOM.idFromName(code);
  c.env.QUICKDRAW_ROOM.get(id);

  return c.json({ code });
});

// GET /api/quickdraw/:code/ws  → upgrade WebSocket, routé vers le Durable Object
quickdraw.get("/:code/ws", async (c) => {
  const code = c.req.param("code").toUpperCase();

  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.text("Expected WebSocket upgrade", 426);
  }

  const id = c.env.QUICKDRAW_ROOM.idFromName(code);
  const room = c.env.QUICKDRAW_ROOM.get(id);

  // Transmet directement la requête au Durable Object, qui gère l'upgrade lui-même
  return room.fetch(c.req.raw);
});

export default quickdraw;