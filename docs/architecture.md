# 🏗️ Architecture

## Overview

CraftGuild est un lab web interactif full-stack, construit avec Vue 3 et Cloudflare Workers.
Le projet est structuré autour d'un **système de design variabilisé** (tokens CSS) et d'expériences interactives (mini-jeux, outils, prototypes) — certaines purement front, d'autres nécessitant un vrai backend (jeux multijoueurs).

---

## 🧭 System Design

1. **UI Layer (Frontend)** — Vue 3 SPA, design system piloté par tokens CSS
2. **API Layer (Backend)** — Cloudflare Workers, Hono, API REST
3. **Data Layer** — Cloudflare D1 (SQLite-like)

---

## 🖥️ Frontend (Vue 3)

```
/views
  HomeView.vue, LabView.vue, AboutView.vue, DashboardView.vue
  /games
    HangmanView.vue, TablesView.vue, FlagsView.vue, TicTacToeView.vue

/components
  /layout       → Navbar, Footer, PublicLayout
  /games/<jeu>  → composants UI spécifiques à un jeu
  LabCard.vue, ThemeSwitcher.vue, AccountTeaser.vue, ...

/layouts
  PublicLayout.vue, GameLayout.vue, DashboardLayout.vue

/composables
  /games/<jeu>  → logique métier pure d'un jeu (ex: /games/tictactoe/useTicTacToe.ts)

/styles
  tokens.css, global.css, design-system.css
```

### Variables d'environnement

```
.env              → VITE_API_URL=http://localhost:8787   (dev)
.env.production   → VITE_API_URL=https://<worker>.workers.dev
```

Tout composable qui appelle le backend construit son URL via `import.meta.env.VITE_API_URL` — jamais d'URL en dur dans le code, pour que le même build fonctionne en dev et en prod sans modification.

---

## 📝 Convention de nommage

Noms de fichiers/dossiers techniques **en anglais**, y compris pour des jeux au nom affiché en français (Pendu → `Hangman*`, Drapeaux → `Flags*`, Morpion → `TicTacToe*`). Le nom affiché vit uniquement dans le contenu (`route.meta.title`), jamais dans le nom de fichier.

Toute vue porte le suffixe `View`. Sous-dossier par jeu dès que plus d'un fichier existe dans `/components/games` ou `/composables/games`.

---

## 🎨 Design System

Chargés dans cet ordre (`main.ts`) : `tokens.css` → `global.css` → `design-system.css`.

```css
:root {
  --bg, --bg-elevated, --border, --border-hover
  --text, --text-muted, --text-faint
  --accent, --accent-hover, --accent-soft   /* piloté par thème */
  --status-wip, --status-live, --status-locked
  --danger, --danger-bg
  --font-base, --space-1..6, --radius-sm/md, --ease
}
```

`[data-theme]` sur `<html>` pilote l'accent (6 presets), géré par `ThemeSwitcher.vue`, persisté en `localStorage`.

---

## 🧪 Lab System

`ExplorerGrid.vue` + `LabCard.vue`, 3 états (`locked` / `wip` / `live`), rendu conditionnel via `<component :is="isClickable ? RouterLink : 'div'">`.

---

## 🎮 Architecture d'un jeu

### Jeux solo (front uniquement)

```
Route → meta: { layout: 'game', title, description }
Vue (views/games/<Jeu>View.vue) → point d'entrée minimal
Composant (components/games/<jeu>/<Jeu>Game.vue) → UI
Composable (composables/games/<jeu>/use<Jeu>.ts) → logique pure, sans DOM
```

Assets statiques référencés par URL (fetch, `<img>`) → `/public`, jamais `/src` :
```
public/data/games/<jeu>/<jeu>.json
public/images/games/<jeu>/*.svg
```

**Hangman, Tables, Flags** suivent ce modèle. Flags est le plus complexe : chargement JSON asynchrone, options à choix multiples restreintes au continent de la question courante.

### Jeux multijoueurs (front + backend)

Premier exemple : **TicTacToe**. Diffère structurellement des jeux solo — nécessite un état partagé entre deux clients, donc une vraie source de vérité côté serveur.

```
Backend (backend/src/routes/<jeu>.ts)
  → table D1 dédiée (ex: tictactoe_sessions)
  → endpoints : create / join / get (état) / move / rematch
  → toute la logique de jeu (validation du tour, calcul du gagnant)
    tourne côté serveur — jamais fait confiance au client

Frontend (composables/games/<jeu>/use<Jeu>.ts)
  → gère la session (créer / rejoindre via code ou ?code= dans l'URL)
  → polling HTTP régulier (setInterval, ~1.5s) vers GET /:code
    pour récupérer l'état à jour
  → mise à jour optimiste locale sur les actions (ex: un coup joué
    s'affiche immédiatement, confirmé/corrigé au poll suivant)
```

**Partage de session** : un code court (6 caractères, alphabet sans caractères ambigus type 0/O ou 1/I) sert à la fois d'identifiant de partie et de paramètre d'URL (`/lab/tictactoe?code=XXXXXX`). Ouvrir ce lien déclenche automatiquement un `join`.

**Pourquoi polling plutôt que WebSocket** : plus simple à mettre en œuvre sur Cloudflare Workers sans infrastructure supplémentaire (Durable Objects). Suffisant pour un jeu au tour par tour à faible fréquence d'action. À reconsidérer si un futur jeu nécessite une synchronisation temps réel plus fine.

---

## 🗄️ Migrations D1

Fichiers numérotés séquentiellement dans `backend/migrations/`, jamais modifiés une fois **réellement appliqués** sur un environnement partagé (remote/prod). Local et remote ont des historiques de migrations indépendants (`wrangler d1 migrations list DB --local|--remote`).

**En développement local actif (avant toute vraie donnée en jeu)**, il est acceptable de renommer/corriger une migration pas encore poussée en remote, à condition de réinitialiser la base locale ensuite (`Remove-Item -Recurse -Force .wrangler` puis `npm run db:dev`) pour repartir d'un historique propre.

**Une fois qu'une migration existe en remote** (même juste "en attente", listée par `wrangler d1 migrations list --remote`), le fichier local doit rester synchronisé avec ce que remote attend — sinon on ajoute une nouvelle migration corrective (ex: `ALTER TABLE ... RENAME TO ...`) plutôt que d'éditer l'historique.

```
0001_init.sql          → table messages (test/dashboard)
0002_tictactoe.sql      → table tictactoe_sessions
```

---

## ⚙️ Backend (Cloudflare Workers)

Stack : Cloudflare Workers, Hono.

```
backend/src/
  index.ts              → montage des routes (app.route(...)), CORS
  routes/
    tictactoe.ts         → logique complète du jeu multijoueur
```

CORS actuellement permissif (`origin: "*"`) — à restreindre au domaine de prod une fois le site stabilisé (Phase 5).

```
GET    /api/hello
GET    /api/messages
POST   /api/messages
DELETE /api/messages
POST   /api/tictactoe/create
POST   /api/tictactoe/:code/join
GET    /api/tictactoe/:code
POST   /api/tictactoe/:code/move
POST   /api/tictactoe/:code/rematch
```

---

## 🗄️ Database (D1)

```sql
-- messages (test)
id INTEGER PRIMARY KEY AUTOINCREMENT
text TEXT NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

-- tictactoe_sessions
code TEXT PRIMARY KEY
board TEXT NOT NULL DEFAULT '["","","","","","","","",""]'
current_player TEXT NOT NULL DEFAULT 'X'
player_x_joined INTEGER NOT NULL DEFAULT 1
player_o_joined INTEGER NOT NULL DEFAULT 0
status TEXT NOT NULL DEFAULT 'waiting'
winner TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## 🚀 Deployment

**Frontend** — Cloudflare Pages, build Vite (utilise `.env.production` pour `VITE_API_URL`)
**Backend** — Cloudflare Workers via Wrangler

```bash
npm run init-prod   # db:prod (migrations remote) puis deploy
```

---

## 🧠 Key Design Decisions

- SPA architecture, component-first UI design
- Design system entièrement variabilisé (tokens)
- Nommage technique anglais / contenu affiché français
- Logique de jeu portée en composables purs (testables, sans DOM)
- Assets statiques (`/public`) strictement séparés du code compilé (`/src`)
- Validation métier des jeux multijoueurs faite côté serveur, jamais côté client seul
- URL d'API pilotée par variable d'environnement, jamais en dur

---

## 📌 Current Status

- UI System / Design tokens : ✅ stable v1
- Système de thèmes : ✅ fonctionnel (6 presets)
- Lab system : ⚙️ 4 jeux portés (Hangman, Tables, Flags, TicTacToe), 1 restant (Boîte à idées)
- Backend API : ✅ stable, premier vrai cas d'usage serveur (sessions multijoueur) en place
- Admin dashboard : ❌ non implémenté (hors scope actuel)