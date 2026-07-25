import { Hono } from "hono";

// Contrairement à quickdraw.ts, pas de Durable Object ici : TicTacToe est
// un jeu tour par tour, la latence du polling HTTP (côté client, ~1.5s)
// est largement suffisante — pas besoin de temps réel WebSocket.
type Env = {
  DB: D1Database;
};

type Board = string[]; // 9 cases, "" | "X" | "O"

// Reflète exactement les colonnes de la table tictactoe_sessions (snake_case,
// tel que D1/SQLite les retourne). Converti en camelCase pour le frontend
// via serializeRow() plus bas — l'API ne renvoie jamais ce type brut.
interface TictactoeRow {
  code: string;
  board: string; // stocké en JSON stringifié (SQLite n'a pas de type array natif)
  current_player: "X" | "O";
  player_x_joined: number; // 0 ou 1 (SQLite n'a pas de vrai booléen)
  player_o_joined: number;
  status: "waiting" | "playing" | "finished";
  winner: string | null;
}

const tictactoe = new Hono<{ Bindings: Env }>();

// Caractères sans ambiguïté visuelle (pas de 0/O, 1/I)
// Identique à quickdraw.ts — dupliqué plutôt que partagé pour l'instant,
// candidat à extraire dans un utilitaire commun lors du nettoyage général.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// Index du plateau (0 à 8), disposés ainsi :
//   0 | 1 | 2
//   3 | 4 | 5
//   6 | 7 | 8
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6]             // diagonales
];

// Renvoie "X"/"O" si une ligne est complète, "draw" si le plateau est plein
// sans vainqueur, ou null si la partie continue.
function checkWinner(board: Board): "X" | "O" | "draw" | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as "X" | "O";
    }
  }
  if (board.every(cell => cell !== "")) return "draw";
  return null;
}

// Traduit une ligne SQL brute (snake_case, board en string JSON, booléens
// en 0/1) vers la forme que consomme le frontend (camelCase, board en vrai
// tableau, booléens JS réels). Point de passage unique pour cette
// conversion — si le format API doit changer un jour, c'est ici seulement.
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
// Le créateur devient toujours "X" et démarre en "waiting" (en attente
// qu'un second joueur rejoigne via /join, qui deviendra "O").
tictactoe.post("/create", async (c) => {
  let code = generateCode();

  // Évite (rare) une collision de code déjà existant.
  // Ici la vérification passe par une requête D1 classique — contrairement
  // à quickdraw.ts qui, sans base de données, doit interroger directement
  // le Durable Object via une méthode RPC pour le même besoin.
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
// Le second joueur à rejoindre devient systématiquement "O" et fait
// passer la partie en "playing". Refuse si la place O est déjà prise.
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
// Endpoint interrogé en polling par le frontend (~1.5s) pour connaître
// l'état à jour de la partie — plateau, tour, victoire éventuelle.
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
// Valide et applique un coup. Toute la logique de jeu (tour valide, case
// libre, calcul du vainqueur) est faite ici, côté serveur — jamais fait
// confiance au client, qui pourrait sinon forcer un coup illégal.
//
// ⚠️ Point de vigilance (non bloquant à l'échelle actuelle du projet) :
// la séquence lire-modifier-écrire ci-dessous (SELECT puis UPDATE) n'est
// pas atomique. Si, de façon très improbable, deux requêtes /move arrivaient
// à quelques millisecondes d'intervalle pour la même partie, les deux
// pourraient lire le même état avant qu'aucune n'écrive, menant à un coup
// perdu ou incohérent. Risque quasi nul en pratique ici (un coup par joueur,
// à tour de rôle, avec un temps de réflexion humain entre chaque), mais à
// garder en tête si ce pattern est réutilisé pour un jeu à cadence plus
// rapide — une transaction D1 ou un verrou applicatif serait alors requis.
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
// Réinitialise uniquement le plateau et le tour — garde la même session
// (même code, mêmes joueurs déjà connectés en X/O) plutôt que d'en créer
// une nouvelle, pour que les deux joueurs restent sur le même lien partagé.
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