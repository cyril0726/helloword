# 🏗️ Architecture

## Overview

CraftGuild est un lab web interactif full-stack, construit avec Vue 3 et Cloudflare Workers.
Le projet est structuré autour d'un **système de design variabilisé** (tokens CSS) et d'expériences interactives (mini-jeux, outils, prototypes).

---

## 🧭 System Design

Le projet repose sur 3 couches principales :

1. **UI Layer (Frontend)** — Vue 3 SPA, design system piloté par tokens CSS
2. **API Layer (Backend)** — Cloudflare Workers, Hono, API REST simple
3. **Data Layer** — Cloudflare D1 (SQLite-like), utilisée pour les expériences

---

## 🖥️ Frontend (Vue 3)

### Stack

Vue 3, Vite, Vue Router, TypeScript

### Architecture Style

```
/views
  HomeView.vue
  LabView.vue
  AboutView.vue
  DashboardView.vue
  /games
    HangmanView.vue
    TablesView.vue
    FlagsView.vue

/components
  /layout       → Navbar, Footer, PublicLayout
  /games/<jeu>  → composants UI spécifiques à un jeu (ex: /games/hangman/HangmanGame.vue)
  LabCard.vue, ThemeSwitcher.vue, ...

/layouts
  PublicLayout.vue
  GameLayout.vue
  DashboardLayout.vue

/composables
  /games/<jeu>  → logique métier pure d'un jeu (ex: /games/hangman/useHangman.ts)

/styles
  tokens.css, global.css, design-system.css
```

---

## 📝 Convention de nommage

**Tous les noms de fichiers et de dossiers techniques sont en anglais**, y compris pour des jeux dont le nom affiché est en français (ex: "Pendu" → fichiers `Hangman*`, "Drapeaux" → fichiers `Flags*`). Le nom d'affichage (français) vit uniquement dans le contenu (`route.meta.title`, labels UI) — jamais dans le nom de fichier.

**Toute vue (`/views`) porte le suffixe `View`** : `HomeView.vue`, `LabView.vue`, `HangmanView.vue`. Convention standard Vue (générée par `create-vue`), qui distingue sans ambiguïté un point d'entrée de route d'un composant réutilisable.

**Règle de sous-dossiers pour les jeux :** dès qu'un jeu a plus d'un fichier dans `/components/games` ou `/composables/games`, il obtient son propre sous-dossier (`/games/hangman/`, `/games/flags/`). Un seul fichier peut rester à plat. `/views/games/` reste à plat par nature (une vue = un point d'entrée par jeu).

---

## 🎨 Design System — architecture en 3 fichiers

Chargés dans cet ordre (`main.ts`) :

```ts
import '@/styles/tokens.css'
import '@/styles/global.css'
import '@/styles/design-system.css'
```

### 1. `tokens.css` — le vocabulaire

Uniquement des variables CSS :

```css
:root {
  --bg, --bg-elevated, --border, --border-hover
  --text, --text-muted, --text-faint
  --accent, --accent-hover, --accent-soft   /* piloté par thème */
  --status-wip, --status-wip-bg
  --status-live, --status-live-bg
  --status-locked, --status-locked-bg       /* indépendants du thème */
  --danger, --danger-bg                      /* erreurs, alertes (ex: timer critique) */
  --font-base, --space-1..6, --radius-sm/md, --ease
}
```

### 2. `global.css` — les fondations

Règles appliquées aux éléments HTML natifs / conteneurs structurels (`body`, `.page`).

### 3. `design-system.css` — les composants réutilisables

`.card`, `.card.is-hoverable`, `.btn`, `.btn--primary`.

---

## 🎭 Système de thèmes

Accent personnalisable via `[data-theme]` sur `<html>` — 6 presets (slate, sage, brass, coral, violet, cyan), géré par `ThemeSwitcher.vue`, persisté en `localStorage`.

**Ce qui suit le thème :** boutons primaires, eyebrow du hero, mini-tuiles "live" du hero, sceau CG de l'About, bordure hover/focus des cartes Lab.

**Ce qui ne suit PAS le thème (volontaire) :** badges de statut Lab, `--danger` (les couleurs fonctionnelles ne doivent pas changer avec l'esthétique).

---

## 🧪 Lab System

- `ExplorerGrid.vue` → génère la grille depuis une liste d'items
- `LabCard.vue` → 3 états :
  - `locked` → non cliquable, pas de route existante
  - `wip` → route existe, cliquable, contenu en construction
  - `live` → jeu complet et jouable
  - Rendu conditionnel via `<component :is="isClickable ? RouterLink : 'div'">`
  - Focus visible, accessibilité clavier

---

## 🎮 Architecture d'un jeu

Chaque jeu suit le même découpage à 3 niveaux :

```
Route (router/index.ts)
  → meta: { layout: 'game', title, description }
  → pointe vers /views/games/<Jeu>View.vue

Vue (views/games/<Jeu>View.vue)
  → point d'entrée minimal, importe et affiche le composant du jeu

Composant (components/games/<jeu>/<Jeu>Game.vue)
  → UI du jeu (template + style), utilise le composable pour l'état/la logique

Composable (composables/games/<jeu>/use<Jeu>.ts)
  → logique métier pure (state réactif, règles, calculs), aucune manipulation DOM
```

**Layout partagé (`GameLayout.vue`) :** plein écran, topbar fine (marque CraftGuild / titre du jeu / retour au Lab), sans la navbar publique classique — l'espace de jeu prime sur la navigation standard. Le titre/description viennent de `route.meta`, lu directement par le layout.

### Assets statiques (données + images)

Les fichiers référencés **par une URL à l'exécution** (chargés via `fetch`, ou affichés via `<img src>`) vivent dans `/public`, **jamais dans `/src`** — `/src` est exclusivement pour le code compilé/importé par le bundler.

```
public/
  data/games/<jeu>/<jeu>.json     → données chargées via fetch()
  images/games/<jeu>/*.svg        → images référencées par chemin dans les données
```

Exemple (Flags) :
```
public/data/games/flags/flags.json
public/images/games/flags/al.svg
```
Le JSON référence ses images en chemin absolu depuis la racine : `"/images/games/flags/al.svg"`.

### Jeux portés

**Hangman** (`useHangman.ts` + `HangmanGame.vue`) — état simple (mot, lettres, erreurs), aucun asset externe.

**Tables** (`useTables.ts` + `TablesGame.vue`) — 3 écrans (menu / jeu / fin), 2 modes (chrono 60s / zen 20 questions), système de streak.

**Flags** (`useFlags.ts` + `FlagsGame.vue`) — le plus complexe : chargement JSON asynchrone (`fetch('/data/games/flags/flags.json')`), sélection continents + difficulté, génération d'options à choix multiples **restreinte au continent de la question courante** (pour éviter des mauvaises réponses hors-sujet), timer, système de rank.

---

## ⚙️ Backend (Cloudflare Workers)

Stack : Cloudflare Workers, Hono. API légère (test d'endpoints, stockage expérimental, support futur du Lab).

```
GET    /api/hello
GET    /api/messages
POST   /api/messages
DELETE /api/messages
```

---

## 🗄️ Database (D1)

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
text TEXT NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

Usage : guestbook experiment, API testing layer.

---

## 🔌 Data Flow

```
Frontend → API → D1
```

---

## 🚀 Deployment

**Frontend** — Cloudflare Pages, build via Vite
**Backend** — Cloudflare Workers, déploiement via Wrangler

---

## 🧠 Key Design Decisions

- SPA architecture pour la simplicité
- Component-first UI design
- Design system entièrement variabilisé (tokens) plutôt que valeurs codées en dur
- Nommage technique en anglais, contenu affiché en français — séparation stricte
- Logique de jeu portée en composables purs (testables, indépendants du DOM et de l'affichage)
- Assets statiques (`/public`) strictement séparés du code compilé (`/src`)
- Lab-first mindset (expériences avant contenu)

---

## 📌 Current Status

- UI System / Design tokens : ✅ stable v1
- Système de thèmes : ✅ fonctionnel (6 presets)
- Lab system : ⚙️ en développement actif — 3 jeux portés (Hangman, Tables, Flags), 2 restants (Morpion, Boîte à idées)
- Backend API : ⚙️ expérimental mais stable
- Admin dashboard : ❌ non implémenté (hors scope actuel)