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

- Vue 3
- Vite
- Vue Router
- TypeScript

### Backend

- Cloudflare Workers
- Hono framework

### Database

- Cloudflare D1 (SQLite-like)

### Deployment

- Cloudflare Pages (frontend)
- Cloudflare Workers (backend)

---

## 📦 Structure

```
/frontend
  /public
    /data/games/<jeu>/       → données statiques (JSON) par jeu
    /images/games/<jeu>/     → assets images par jeu
  /src
    /views                   → pages (HomeView, LabView, AboutView, DashboardView)
    /views/games             → point d'entrée de chaque jeu (ex: HangmanView.vue)
    /components              → composants UI génériques (LabCard, GameLayout, ThemeSwitcher...)
    /components/games/<jeu>  → composants UI spécifiques à un jeu
    /composables/games/<jeu> → logique métier d'un jeu (state, règles), sans DOM
    /styles                  → design system (tokens.css, global.css, design-system.css)
/backend  → API (Hono + Workers)
/docs     → Project documentation
```

---

## 🚀 Features

### Public interface

- Landing page (hero avec mini-preview animé du Lab)
- Lab (grille interactive d'expériences, 3 états : locked / wip / live)
- About (carte d'identité produit avec sceau CG)
- Sélecteur de thème (accent personnalisable, persistant en localStorage)

### Lab system

- `ExplorerGrid` + `LabCard`, navigation conditionnelle selon le statut
- `GameLayout` : layout dédié plein écran pour les jeux (topbar fine, pas de navbar publique)
- Titre/description de chaque jeu déclarés dans `route.meta`

### Jeux migrés

| Jeu | Route | Statut |
|---|---|---|
| Hangman (Pendu) | `/lab/hangman` | ✅ porté, logique + UI complètes |
| Tables | `/lab/tables` | ✅ porté (mode Challenge chrono / Entraînement zen) |
| Flags (Drapeaux) | `/lab/flags` | ✅ porté (données JSON + images SVG statiques) |
| Morpion | — | ⏳ à venir |
| Boîte à idées | — | ⏳ à venir |

---

## 🎨 UI / Design System

Design system léger, entièrement variabilisé via `tokens.css` :

- `.page` → conteneur de layout global
- `.card` / `.card.is-hoverable` → conteneur UI réutilisable
- `.btn` / `.btn--primary` → boutons unifiés
- Tokens de statut (`--status-wip`, `--status-live`, `--status-locked`) → indépendants du thème
- Tokens d'accent (`--accent`, `--accent-hover`, `--accent-soft`) → pilotés par `[data-theme]`
- `--danger` / `--danger-bg` → retours d'erreur (timer critique, mauvaise réponse)

---

## 🔌 API

Backend exposé sous :

```
/api/*
```

Exemples :

- GET `/api/hello`
- GET `/api/messages`
- POST `/api/messages`
- DELETE `/api/messages`

---

## 🧪 Development

```bash
npm run dev
```

Lance :

- Frontend (Vite)
- Backend (Wrangler)
- Environnement local

---

## 📌 Status

Projet actuellement en développement actif :

- Architecture : ✅
- Routing : ✅
- UI system / Design tokens : ✅ v1 stable
- Lab system : ⚙️ en cours (3 jeux sur 5 portés)
- Backend API : ✅ stable

---

## 📚 Documentation

Voir `/docs` :

- Architecture
- Roadmap