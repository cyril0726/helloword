import { Hono } from "hono";

type Env = {
  DB: D1Database;
};

type Board = string[]; // 9 cases, "" | "X" | "O"

interface TictactoeRow {
  code: string;
  board: string;
  current_player: "X" | "O";
  player_x_joined: number;
  player_o_joined: number;
  status: "waiting" | "playing" | "finished";
  winner: string | null;
}

const tictactoe = new Hono<{ Bindings: Env }>();

// Caractères sans ambiguïté visuelle (pas de 0/O, 1/I)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6]             // diagonales
];

function checkWinner(board: Board): "X" | "O" | "draw" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as "X" | "O";
    }
  }
  if (board.every(cell => cell !== "")) return "draw";
  return null;
}

function serializeRow(row: TictactoeRow) {
  return {
    code: row.code,
    board: JSON.parse(row.board) as Board,
    currentPlayer: row.current_player,
    playerXJoined: !!row.player_x_joined,
    playerOJoined: !!row.player_o_joined,
    status: row.status,
    winner: row.winner
  };
}

// POST /api/tictactoe/create
tictactoe.post("/create", async (c) => {
  let code = generateCode();

  // évite (rare) une collision de code déjà existant
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await c.env.DB
      .prepare("SELECT code FROM tictactoe_sessions WHERE code = ?")
      .bind(code)
      .first();
    if (!existing) break;
    code = generateCode();
  }

  await c.env.DB
    .prepare(
      "INSERT INTO tictactoe_sessions (code, player_x_joined, player_o_joined, status) VALUES (?, 1, 0, 'waiting')"
    )
    .bind(code)
    .run();

  return c.json({ code, role: "X" });
});

// POST /api/tictactoe/:code/join
tictactoe.post("/:code/join", async (c) => {
  const code = c.req.param("code").toUpperCase();

  const row = await c.env.DB
    .prepare("SELECT * FROM tictactoe_sessions WHERE code = ?")
    .bind(code)
    .first<TictactoeRow>();

  if (!row) {
    return c.json({ error: "Session introuvable" }, 404);
  }

  if (row.player_o_joined) {
    return c.json({ error: "Cette partie est déjà complète" }, 409);
  }

  await c.env.DB
    .prepare(
      "UPDATE tictactoe_sessions SET player_o_joined = 1, status = 'playing', updated_at = CURRENT_TIMESTAMP WHERE code = ?"
    )
    .bind(code)
    .run();

  return c.json({ code, role: "O" });
});

// GET /api/tictactoe/:code
tictactoe.get("/:code", async (c) => {
  const code = c.req.param("code").toUpperCase();

  const row = await c.env.DB
    .prepare("SELECT * FROM tictactoe_sessions WHERE code = ?")
    .bind(code)
    .first<TictactoeRow>();

  if (!row) {
    return c.json({ error: "Session introuvable" }, 404);
  }

  return c.json(serializeRow(row));
});

// POST /api/tictactoe/:code/move  { index, player }
tictactoe.post("/:code/move", async (c) => {
  const code = c.req.param("code").toUpperCase();
  const body = await c.req.json<{ index: number; player: "X" | "O" }>();

  const row = await c.env.DB
    .prepare("SELECT * FROM tictactoe_sessions WHERE code = ?")
    .bind(code)
    .first<TictactoeRow>();

  if (!row) {
    return c.json({ error: "Session introuvable" }, 404);
  }

  if (row.status !== "playing") {
    return c.json({ error: "La partie n'est pas en cours" }, 400);
  }

  if (row.current_player !== body.player) {
    return c.json({ error: "Ce n'est pas ton tour" }, 400);
  }

  const board: Board = JSON.parse(row.board);

  if (body.index < 0 || body.index > 8 || board[body.index] !== "") {
    return c.json({ error: "Case invalide" }, 400);
  }

  board[body.index] = body.player;

  const result = checkWinner(board);
  const nextPlayer = body.player === "X" ? "O" : "X";
  const newStatus = result ? "finished" : "playing";
  const winner = result === "draw" ? "draw" : result;

  await c.env.DB
    .prepare(
      `UPDATE tictactoe_sessions
       SET board = ?, current_player = ?, status = ?, winner = ?, updated_at = CURRENT_TIMESTAMP
       WHERE code = ?`
    )
    .bind(JSON.stringify(board), nextPlayer, newStatus, winner, code)
    .run();

  return c.json({ success: true });
});

// POST /api/tictactoe/:code/rematch
tictactoe.post("/:code/rematch", async (c) => {
  const code = c.req.param("code").toUpperCase();

  const row = await c.env.DB
    .prepare("SELECT * FROM tictactoe_sessions WHERE code = ?")
    .bind(code)
    .first<TictactoeRow>();

  if (!row) {
    return c.json({ error: "Session introuvable" }, 404);
  }

  await c.env.DB
    .prepare(
      `UPDATE tictactoe_sessions
       SET board = '["","","","","","","","",""]', current_player = 'X', status = 'playing', winner = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE code = ?`
    )
    .bind(code)
    .run();

  return c.json({ success: true });
});

export default tictactoe;