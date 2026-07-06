# 🚀 CraftGuild

Full-stack web project: interactive web lab + portfolio system + backend API.
Built with Vue 3 frontend and Cloudflare Workers backend.

---

## 🧭 Vision

CraftGuild is a personal interactive web lab focused on building:

- experiments
- mini-games
- UI prototypes
- developer tools

It is not a traditional portfolio, but a **living product lab**.

---

## 🎨 Design Direction

**Style : "Structured Dark Lab"** — dark mode épuré et discipliné (inspiration Linear)
appliqué à un espace de découverte ludique (inspiration game launcher).

- Fond sombre, jamais noir pur
- Un accent unique et désaturé, sélectionnable parmi plusieurs presets (slate, sage, brass, coral, violet, cyan)
- Cartes comme brique centrale (bordure fine, élévation légère au hover)
- Navbar discrète, transitions rapides et douces (150–250ms)
- Sans-serif nette pour l'UI (Inter), pas de mono ni d'emoji hors du Lab

À éviter : dégradés flashy, glow, glassmorphism, couleurs saturées.

Voir `/docs/Architecture.md` pour le détail du système de tokens et de l'architecture des jeux.

---

## 🛠️ Tech Stack

### Frontend
Vue 3, Vite, Vue Router, TypeScript

### Backend
Cloudflare Workers, Hono framework

### Database
Cloudflare D1 (SQLite-like)

### Deployment
Cloudflare Pages (frontend), Cloudflare Workers (backend)

---

## 📦 Structure

```
/frontend
  /public
    /data/games/<jeu>/       → données statiques (JSON) par jeu
    /images/games/<jeu>/     → assets images par jeu
  /src
    /views                   → pages (HomeView, LabView, AboutView, DashboardView)
    /views/games             → point d'entrée de chaque jeu
    /components              → composants UI génériques
    /components/games/<jeu>  → composants UI spécifiques à un jeu
    /composables/games/<jeu> → logique métier d'un jeu, sans DOM
    /styles                  → design system (tokens.css, global.css, design-system.css)
  .env                       → VITE_API_URL (local)
  .env.production            → VITE_API_URL (Worker déployé)

/backend
  /migrations                → fichiers SQL numérotés séquentiellement (0001, 0002...)
  /src/routes/<jeu>.ts       → routes API dédiées à un jeu multijoueur/serveur

/docs     → Project documentation
```

---

## 🚀 Features

### Public interface

- Landing page (hero avec mini-preview animé du Lab)
- Lab (grille interactive d'expériences, 3 états : locked / wip / live)
- About (carte d'identité produit avec sceau CG)
- Sélecteur de thème (accent personnalisable, persistant en localStorage)
- Teaser compte/login (icône navbar désactivée, fonctionnalité à venir)

### Jeux

| Jeu | Route | Type | Statut |
|---|---|---|---|
| Hangman (Pendu) | `/lab/hangman` | solo | ✅ porté |
| Tables | `/lab/tables` | solo | ✅ porté |
| Flags (Drapeaux) | `/lab/flags` | solo | ✅ porté |
| TicTacToe (Morpion) | `/lab/tictactoe` | **multijoueur** | ✅ porté |
| Boîte à idées | — | — | ⏳ à venir |

**TicTacToe** est le premier jeu multijoueur du Lab : partie créée via un code de session partageable par lien, synchronisation par polling HTTP (pas de WebSocket), état de jeu et validation des coups gérés côté serveur (Hono + D1).

---

## 🎨 UI / Design System

- `.page`, `.card` / `.card.is-hoverable`, `.btn` / `.btn--primary`
- Tokens de statut (`--status-wip`, `--status-live`, `--status-locked`) indépendants du thème
- Tokens d'accent (`--accent`, `--accent-hover`, `--accent-soft`) pilotés par `[data-theme]`
- `--danger` / `--danger-bg` pour les retours d'erreur

---

## 🔌 API

```
/api/hello
/api/messages         GET / POST / DELETE
/api/tictactoe/create         POST
/api/tictactoe/:code/join     POST
/api/tictactoe/:code          GET
/api/tictactoe/:code/move     POST
/api/tictactoe/:code/rematch  POST
```

---

## 🧪 Development

```bash
npm run dev
```

Lance frontend (Vite) + backend (Wrangler) en local.

**Backend — commandes utiles :**
```bash
npm run db:dev      # applique les migrations en local
npm run db:prod     # applique les migrations en remote (prod)
npm run deploy      # déploie le Worker
npm run init-prod   # db:prod puis deploy, enchaînés
```

---

## 📌 Status

- Architecture : ✅
- Routing : ✅
- UI system / Design tokens : ✅ v1 stable
- Lab system : ⚙️ en cours (4 jeux sur 5 portés, dont 1 multijoueur)
- Backend API : ✅ stable, première fonctionnalité serveur réelle (TicTacToe) en place

---

## 📚 Documentation

Voir `/docs` : Architecture, Roadmap