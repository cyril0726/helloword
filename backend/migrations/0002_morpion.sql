-- backend/migrations/0002_tictactoe.sql
--
-- Table dédiée au jeu TicTacToe (multijoueur, tour par tour). Une ligne =
-- une partie/session, identifiée par son `code` partageable (voir
-- backend/src/routes/tictactoe.ts pour toute la logique associée).
--
-- Contrairement à QuickDraw (jeu temps réel), qui ne possède AUCUNE table
-- D1 — son état vit entièrement dans un Durable Object — TicTacToe utilise
-- D1 classique car la latence du polling HTTP (~1.5s côté client) est
-- largement suffisante pour un jeu au tour par tour.
CREATE TABLE IF NOT EXISTS tictactoe_sessions (
  code TEXT PRIMARY KEY,                                  -- identifiant partagé, ex: "K7XPQ3"

  -- Plateau sérialisé en JSON (SQLite n'a pas de type array natif) :
  -- un tableau de 9 chaînes, "" | "X" | "O", index 0-8 en grille 3x3.
  board TEXT NOT NULL DEFAULT '["","","","","","","","",""]',

  current_player TEXT NOT NULL DEFAULT 'X',               -- à qui le tour

  -- SQLite n'a pas de vrai type booléen : 0/1, converti en bool JS côté
  -- API (voir serializeRow() dans tictactoe.ts). Le créateur de la partie
  -- devient toujours X (déjà "joined" par défaut) ; O rejoint via /join.
  player_x_joined INTEGER NOT NULL DEFAULT 1,
  player_o_joined INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'waiting',                 -- waiting | playing | finished
  winner TEXT,                                            -- null | 'X' | 'O' | 'draw'

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP           -- mis à jour à chaque coup/rematch
);