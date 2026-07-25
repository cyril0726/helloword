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
- Un accent unique et désaturé, sélectionnable parmi 6 presets (slate, sage, brass, coral, violet, cyan)
- Cartes comme brique centrale (bordure fine, élévation légère au hover)
- Navbar discrète, transitions rapides et douces (150–250ms)
- Sans-serif nette pour l'UI (**Inter**, corrigé après un bug de scaffold qui affichait tout le site en monospace)
- Mono réservé aux zones techniques ponctuelles (ex: `DbPlayground.vue`)

À éviter : dégradés flashy, glow, glassmorphism, couleurs saturées.

Voir `/docs/Architecture.md` pour le détail du système de tokens et de l'architecture des jeux.

---

## 🛠️ Tech Stack

### Frontend
Vue 3, Vite, Vue Router, TypeScript

### Backend
Cloudflare Workers, Hono framework, Durable Objects (temps réel)

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
    /views                   → pages (Home, Lab, About, Dashboard)
    /views/games             → point d'entrée de chaque jeu
    /components              → composants UI génériques
    /components/games/<jeu>  → composants UI spécifiques à un jeu
    /components/system       → widgets de statut API/DB (Dashboard)
    /components/tools         → outils de debug (DbPlayground)
    /composables/games/<jeu> → logique métier d'un jeu, sans DOM
    /composables/system       → useApiHealth (logique de statut partagée)
    /layouts                 → PublicLayout, GameLayout, DashboardLayout
    /styles                  → design system (tokens.css, global.css, design-system.css)
    /router                  → routes + meta (layout, title)
  .env / .env.production     → VITE_API_URL
  env.d.ts                   → typage .vue + ImportMetaEnv

/backend
  /migrations                → fichiers SQL numérotés séquentiellement
  /src/routes/<jeu>.ts       → routes HTTP dédiées à un jeu
  /src/durable-objects/      → classes Durable Object (jeux temps réel)

/docs               → Project documentation
init.bat                → migrations DB (local)
init-prod.bat           → migrations DB (remote) + déploiement backend
start.bat               → lance l'environnement de dev complet
```

---

## 🚀 Features

### Public interface

- Landing page (hero avec mini-preview animé du Lab)
- Lab (grille interactive d'expériences)
- About (carte d'identité produit avec sceau CG)
- Sélecteur de thème (accent personnalisable, persistant en localStorage)
- Teaser compte/login retiré (fonctionnalité en pause, voir Roadmap)
- RouterView + Transition centralisés dans `App.vue`, partagés par tous les layouts

### Jeux — tous en ligne (`live`)

| Jeu | Route | Type | Techno |
|---|---|---|---|
| Hangman (Pendu) | `/lab/hangman` | solo | composable pur |
| Tables | `/lab/tables` | solo | composable pur |
| Flags (Drapeaux) | `/lab/flags` | solo | fetch JSON statique + SVG |
| TicTacToe (Morpion) | `/lab/tictactoe` | multi (tour par tour) | Hono + D1, polling |
| QuickDraw | `/lab/quickdraw` | multi (temps réel, 2-8 joueurs) | Durable Object + WebSocket |

### Dashboard (interne, non public)

- `Sidebar` / `Topbar` (scaffold, non branché à de vraies données pour Topbar)
- `TopStatusBar`, `SystemHealth`, `ApiCard` — statut API/DB via `useApiHealth` (composable partagé, adoption en cours)
- `DbCard`, `DbPlayground` — outils de test D1
- État actuel : fonctionnel mais hétérogène, harmonisation prévue (voir Roadmap)

---

## 🎨 UI / Design System

- `.page`, `.card` / `.card.is-hoverable`, `.btn` / `.btn--primary`
- Focus clavier (`:focus-visible`) désormais centralisé dans `design-system.css`
- Tokens de statut (`--status-wip`, `--status-live`, `--status-locked`) indépendants du thème
- Tokens d'accent (`--accent`, `--accent-hover`, `--accent-soft`) pilotés par `[data-theme]`, avec repli dans `:root`
- `--danger` / `--danger-bg` — **ajoutés lors du nettoyage**, manquaient depuis le début malgré leur utilisation dans une dizaine de composants

---

## 🔌 API

```
/api/hello
/api/messages                 GET / POST / DELETE
/api/tictactoe/create         POST
/api/tictactoe/:code/join     POST
/api/tictactoe/:code          GET
/api/tictactoe/:code/move     POST
/api/tictactoe/:code/rematch  POST
/api/quickdraw/create         POST  (HTTP classique, retourne un code)
/api/quickdraw/:code/ws       GET   (upgrade WebSocket → Durable Object)
```

---

## 🧪 Scripts disponibles

### Racine du projet

| Script | Action |
|---|---|
| `npm run dev` | Lance frontend + backend simultanément |
| `npm run dev:front` | Frontend seul (Vite) |
| `npm run dev:back` | Backend seul (Wrangler) |
| `npm run db:init` | Migrations D1 en local (alias `init`) |

### Backend

| Script | Action |
|---|---|
| `npm run dev` / `start` | Wrangler en local |
| `npm run deploy` | Déploie le Worker |
| `npm run test` | Vitest |
| `npm run db:dev` | Migrations D1 locales |
| `npm run db:prod` | Migrations D1 remote |

### Scripts `.bat`

| Script | Action |
|---|---|
| `start.bat` | Environnement de dev complet |
| `init.bat` | Migrations locales |
| `init-prod.bat` | Migrations remote + déploiement |

**Déploiement prod** : le code se déploie automatiquement (push Git). Les migrations D1 restent **manuelles** — lancer `init-prod.bat` après tout ajout de migration, avant de pousser le code qui en dépend.

---

## 📌 Status

- Architecture : ✅
- Routing : ✅, layouts harmonisés (un seul mécanisme RouterView/Transition)
- UI system / Design tokens : ✅ stable, bug critique `--danger` corrigé
- Lab system : ✅ 5 jeux en ligne (3 solo, 2 multijoueurs dont 1 temps réel)
- Backend API : ✅ stable — HTTP classique (Hono/D1) + temps réel (Durable Objects/WebSocket)
- **Grand nettoyage : ✅ terminé** (voir Roadmap Phase 4 pour le détail complet des corrections)
- Dashboard : ⚙️ fonctionnel mais hétérogène, harmonisation prévue (Roadmap)

---

## 📚 Documentation

Voir `/docs` : Architecture, Roadmap