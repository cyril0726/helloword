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

À éviter : dégradés violet/bleu génériques, glow, glassmorphism, couleurs flashy.

Voir `/docs/Architecture.md` pour le détail du système de tokens.

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
/frontend → Vue application (public UI + lab + pages)
/backend  → API (Hono + Workers)
/docs     → Project documentation
```

Frontend styles :

```
/styles
  tokens.css          → variables globales (couleurs, espacement, thèmes)
  global.css           → fondations (body, .page)
  design-system.css    → composants réutilisables (.card, .btn)
```

---

## 🚀 Features

### Public interface

- Landing page (hero avec mini-preview animé du Lab)
- Lab (grille interactive d'expériences)
- About (carte d'identité produit avec sceau CG)
- Sélecteur de thème (accent personnalisable, persistant en localStorage)

### Lab system

- Interactive cards system (`ExplorerGrid` + `LabCard`)
- États WIP / Live, avec navigation conditionnelle (une carte WIP n'est pas cliquable)
- Badges de statut indépendants du thème d'accent
- Navigation via `RouterLink` natif (accessibilité clavier incluse)

---

## 🎨 UI / Design System

Design system léger, entièrement variabilisé via `tokens.css` :

- `.page` → conteneur de layout global
- `.card` / `.card.is-hoverable` → conteneur UI réutilisable
- `.btn` / `.btn--primary` → boutons unifiés
- Tokens de statut (`--status-wip`, `--status-live`) → indépendants du thème
- Tokens d'accent (`--accent`, `--accent-hover`, `--accent-soft`) → pilotés par `[data-theme]`

Design philosophy :

> consistency over page-specific styling

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
- Lab system : ⚙️ en cours (premiers jeux en intégration)
- Backend API : ✅ stable

---

## 📚 Documentation

Voir `/docs` :

- Architecture
- Roadmap