-- backend/migrations/0002_tictactoe.sql
CREATE TABLE IF NOT EXISTS tictactoe_sessions (
  code TEXT PRIMARY KEY,
  board TEXT NOT NULL DEFAULT '["","","","","","","","",""]',
  current_player TEXT NOT NULL DEFAULT 'X',
  player_x_joined INTEGER NOT NULL DEFAULT 1,
  player_o_joined INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting',
  winner TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);