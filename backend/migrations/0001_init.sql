-- backend/migrations/0001_init.sql
--
-- Table de test/dashboard ("guestbook" expérimental), sans lien avec les
-- jeux du Lab — sert uniquement à valider la connectivité D1 depuis
-- l'API (voir /api/messages dans backend/src/index.ts) et depuis un
-- futur Dashboard.
--
-- Note de convention (établie après coup, non appliquée rétroactivement
-- à ce fichier puisqu'il est déjà appliqué en remote — voir
-- /docs/Architecture.md) : les migrations suivantes utilisent le format
-- de nom <numéro>_<verbe>_<sujet>.sql plutôt que ce nom générique "init".
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);