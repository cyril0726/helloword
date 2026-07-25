# 🏗️ Architecture

## Overview

CraftGuild est un lab web interactif full-stack, construit avec Vue 3 et Cloudflare Workers.
Le projet est structuré autour d'un **système de design variabilisé** (tokens CSS) et d'expériences interactives — certaines purement front, d'autres nécessitant un backend classique (HTTP/D1), d'autres du temps réel (WebSocket/Durable Objects).

---

## 🧭 System Design

1. **UI Layer (Frontend)** — Vue 3 SPA, design system piloté par tokens CSS
2. **API Layer (Backend)** — Cloudflare Workers, Hono, API REST
3. **Realtime Layer (Backend)** — Durable Objects + WebSocket, pour les jeux nécessitant une synchronisation immédiate
4. **Data Layer** — Cloudflare D1 (SQLite-like), pour les données durables

---

## 🖥️ Frontend (Vue 3)

```
/views
  HomeView.vue, LabView.vue, AboutView.vue, DashboardView.vue
  /games
    HangmanView.vue, TablesView.vue, FlagsView.vue, TictactoeView.vue, QuickdrawView.vue

/components
  /layout       → Navbar, Footer, PublicLayout, Sidebar, Topbar
  /games/<jeu>  → composants UI spécifiques à un jeu
  /system       → ApiCard, DbCard, TopStatusBar, SystemHealth (Dashboard)
  /tools        → DbPlayground (outil de debug D1)
  LabCard.vue, ThemeSwitcher.vue, ...

/layouts
  PublicLayout.vue, GameLayout.vue, DashboardLayout.vue

/composables
  /games/<jeu>  → logique métier pure d'un jeu
  /system       → useApiHealth (logique de statut partagée)

/styles
  tokens.css, global.css, design-system.css

/router
  index.ts (routes + meta: layout, title)

env.d.ts        → typage .vue + ImportMetaEnv (VITE_API_URL)
```

### Variables d'environnement

```
.env              → VITE_API_URL=http://localhost:8787   (dev)
.env.production   → VITE_API_URL=https://<worker>.workers.dev
```

Typées via `env.d.ts` (`ImportMetaEnv`) — évite les casts manuels `as string` répétés dans les composables réseau.

---

## 📝 Convention de nommage

Noms de fichiers/dossiers techniques **en anglais**, contenu affiché **en français** (Pendu → `Hangman*`, Drapeaux → `Flags*`, Morpion → `Tictactoe*`). Toute vue porte le suffixe `View`. Sous-dossier par jeu dès que plus d'un fichier existe dans `/components/games` ou `/composables/games`.

---

## 🎨 Design System

Chargés dans cet ordre (`main.ts`) : `tokens.css` → `global.css` → `design-system.css`.

```css
:root {
  --bg, --bg-elevated, --border, --border-hover
  --text, --text-muted, --text-faint
  --accent, --accent-hover, --accent-soft   /* piloté par thème, repli dans :root */
  --status-wip, --status-live, --status-locked
  --danger, --danger-bg
  --font-base, --space-1..6, --radius-sm/md, --ease
}
```

`[data-theme]` sur `<html>` pilote l'accent (6 presets), géré par `ThemeSwitcher.vue`, persisté en `localStorage`.

**Focus clavier** (`:focus-visible`) centralisé sur `.card.is-hoverable` dans `design-system.css` — toute future carte interactive en hérite automatiquement.

---

## 🧪 Lab System

`ExplorerGrid.vue` + `LabCard.vue`, 3 états (`locked` / `wip` / `live`), rendu conditionnel via `<component :is="isClickable ? RouterLink : 'div'">`.

---

## 🎮 Architecture d'un jeu

### Jeux solo (front uniquement)

```
Route → meta: { layout: 'game', title, description? }
Vue → Composant (UI) → Composable (logique pure, sans DOM)
```

**Hangman, Tables, Flags** suivent ce modèle. Flags charge un JSON statique (`/public/data/games/flags/`), sans passer par le backend.

### Jeux multijoueurs

**Tour par tour (TicTacToe)** — table D1 dédiée, endpoints create/join/get/move/rematch, polling HTTP (~1.5s) côté client.

**Temps réel (QuickDraw)** — Durable Object dédié par salle, WebSocket avec Hibernation API, diffusion simultanée à tous les clients. Pas de table D1 : état géré en mémoire/`ctx.storage`.

**Leçon critique retenue (Durable Objects)** : l'API Hibernation permet à Cloudflare de décharger l'objet de la mémoire entre deux messages. Seules les WebSockets survivent nativement à ce cycle — tout autre état (joueurs, hôte, statut) doit être explicitement persisté via `ctx.storage`, sinon il repart à zéro au réveil. Les `setTimeout` classiques (contrairement à `ctx.storage.setAlarm()`) **ne survivent pas non plus** à l'hibernation — risque documenté mais non corrigé sur `QuickdrawRoom.ts` (délai avant signal, timeout de fin de manche), jugé faible tant que les parties se jouent en connexion active continue.

---

## 🖇️ Layouts — mécanisme harmonisé

**Avant le nettoyage** : `PublicLayout.vue` avait son propre `<RouterView>` + `<Transition>` interne, tandis que `GameLayout.vue`/`DashboardLayout.vue` utilisaient `<slot />` pour recevoir le contenu depuis `App.vue` — deux mécanismes différents pour le même besoin.

**Après harmonisation** : `App.vue` centralise l'unique `<RouterView>` + `<Transition name="page">`, transmis en slot par défaut à n'importe quel layout actif :

```vue
<!-- App.vue -->
<component :is="layout">
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</component>
```

Chaque layout (`PublicLayout`, `GameLayout`, `DashboardLayout`) se contente désormais de placer `<slot />`. Effet de bord assumé : Game et Dashboard héritent maintenant aussi de la transition de page, qu'ils n'avaient pas avant.

Les classes CSS `.page-enter-active` / `.page-leave-active` / etc. vivent dans `global.css`.

---

## 🐛 Grand nettoyage — bugs corrigés (récapitulatif)

Passage complet fichier par fichier sur tout le frontend et le backend. Principales trouvailles :

**Critiques :**
- **`--danger` / `--danger-bg` n'existaient pas dans `tokens.css`** malgré leur utilisation dans ~10 composants — tous les indicateurs d'erreur retombaient silencieusement sur la couleur héritée au lieu du rouge prévu.
- **`style.css`** (résidu du scaffold Vite, jamais nettoyé) contenait `#app { font-family: monospace }` — un sélecteur d'ID plus spécifique que `body { font-family: var(--font-base) }`, faisant afficher **tout le site en monospace** depuis le début, au lieu d'Inter. Fichier supprimé ; ses 2 règles utiles (reset `box-sizing`, transition `.page-enter/leave-*`) récupérées dans `global.css`.
- **`ThemeSwitcher.vue`** : `ref="root"` jamais attaché au template — le clic extérieur ne fermait jamais le panneau de thème, fonctionnalité silencieusement cassée depuis sa mise en place.
- **`ExplorerGrid.vue`** : lien cassé `/lab/pendu` (résidu du renommage Pendu → Hangman), carte jamais cliquable vers une route réelle.

**Notables :**
- `.continent-btn` sans son point (`FlagsGame.vue`) — sélecteur de balise HTML inexistante plutôt que de classe, boutons sans style de base.
- `.pendu-form` (résidu du renommage) au lieu de `.hangman-form` dans `HangmanGame.vue`.
- `PublicLayout.vue` non scopé depuis le tout premier message du projet.
- `Dashboard.vue` : classe `.page` en collision avec `global.css` (renommée `.dashboard-page`).
- `Sidebar.vue`/`Topbar.vue` : scaffold jamais aligné aux tokens, "HelloWord" au lieu de "CraftGuild".
- `index.html` : `lang="en"` alors que le site est en français.
- `env.d.ts` : absence de typage `ImportMetaEnv`, causant des casts manuels répétés.

**Signalés, non corrigés (jugement délibéré ou décision différée) :**
- Course de lecture non-atomique dans `tictactoe.ts` (risque négligeable à l'échelle actuelle).
- `setTimeout` non nettoyés dans `useHangman.ts` (pas de crash, juste un travail résiduel possible).
- `isConnected` dans `useQuickdraw.ts` : computed non réactif (variable `ws` non-ref) — actuellement du code mort, jamais consommé.
- Incohérence UX "Rejouer" entre `useTables` (retour menu complet) et `useFlags` (relance directe) — à trancher.
- `refreshAll()` dans `Dashboard.vue` : un échec du second fetch peut écraser un diagnostic déjà correct du premier.
- Favicon toujours celui du scaffold Vite, pas le sceau CG.
- `document.title` jamais synchronisé avec `route.meta.title` — l'onglet du navigateur affiche toujours "CraftGuild".
- Duplication entre `ApiCard`/`DbCard`/`TopStatusBar`/`SystemHealth` — factorisée dans `useApiHealth.ts`, mais adoption/priorité de ce refactor mise en pause par choix.

---

## ⚙️ Backend (Cloudflare Workers)

```
backend/src/
  index.ts                    → montage des routes, CORS, export des Durable Objects
  routes/
    tictactoe.ts               → logique HTTP/D1 du jeu tour par tour
    quickdraw.ts                → route de création + pont WebSocket
  durable-objects/
    QuickdrawRoom.ts            → classe gérant une salle de jeu temps réel
```

Config `wrangler.jsonc` — **jamais** créer de `wrangler.toml` en parallèle (Wrangler ignore silencieusement le `.toml` si les deux existent).

CORS actuellement permissif (`origin: "*"`) — à restreindre en Phase 5.

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
POST   /api/quickdraw/create
GET    /api/quickdraw/:code/ws
```

---

## 🗄️ Migrations D1

Fichiers numérotés séquentiellement, jamais modifiés une fois appliqués sur un environnement partagé. Convention : `<numéro>_<verbe>_<sujet>.sql`.

```
0001_init.sql          → table messages (nommage historique, non renommé)
0002_tictactoe.sql       → table tictactoe_sessions (nommage historique, non renommé)
```

Convention des tables : transverse (pas de préfixe) vs dédiée à un jeu (préfixée). QuickDraw n'a pas de table D1 (état en Durable Object).

---

## 🚀 Deployment

```bash
npm run init-prod   # db:prod (migrations D1 remote) puis deploy
```

Déploiement du **code** automatique (push Git). Migrations D1 **manuelles**.

---

## 🧠 Key Design Decisions

- SPA architecture, component-first UI design
- Design system entièrement variabilisé (tokens), un seul mécanisme de layout/transition
- Nommage technique anglais / contenu affiché français
- Logique de jeu portée en composables purs (testables, sans DOM)
- Choix polling vs WebSocket décidé au cas par cas selon la sensibilité à la latence
- Tout état de Durable Object destiné à survivre doit être explicitement persisté
- URL d'API (HTTP et WebSocket) pilotée par variable d'environnement typée, jamais en dur
- Toujours vérifier/scoper les styles Vue — plusieurs bugs de longue date provenaient d'oublis sur ce point précis

---

## 📌 Current Status

- UI System / Design tokens : ✅ stable, bugs critiques corrigés (police, `--danger`)
- Système de thèmes : ✅ fonctionnel (6 presets), bug de fermeture au clic extérieur corrigé
- Lab system : ✅ 5 jeux en ligne
- Backend API : ✅ stable
- Layouts : ✅ harmonisés (mécanisme unique)
- Dashboard : ⚙️ fonctionnel mais hétérogène (voir Roadmap)
- Compte/leaderboard : ⏸️ en pause