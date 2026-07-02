# 🏗️ Architecture

## Overview

CraftGuild est un lab web interactif full-stack, construit avec Vue 3 et Cloudflare Workers.
Le projet est structuré autour d'un **système de design variabilisé** (tokens CSS) et d'expériences interactives (mini-jeux, outils, prototypes).

---

## 🧭 System Design

Le projet repose sur 3 couches principales :

1. **UI Layer (Frontend)**
   - Vue 3 SPA
   - Architecture par composants
   - Design system entièrement piloté par tokens CSS
2. **API Layer (Backend)**
   - Cloudflare Workers
   - Hono framework
   - API REST simple
3. **Data Layer**
   - Cloudflare D1 (SQLite-like)
   - Utilisée pour les expériences (messages / données de test)

---

## 🖥️ Frontend (Vue 3)

### Stack

- Vue 3
- Vite
- Vue Router
- TypeScript

### Architecture Style

```
/views       → pages (Home, Lab, About)
/components
  /layout    → Navbar, Footer, PublicLayout
  /lab       → ExplorerGrid, LabCard
  /brand     → LogoSeal, ThemeSwitcher
/styles      → design system (voir ci-dessous)
/router      → définitions des routes
```

---

## 🎨 Design System — architecture en 3 fichiers

Le CSS est séparé en trois responsabilités distinctes, chargées dans cet ordre (`main.ts`) :

```ts
import '@/styles/tokens.css'
import '@/styles/global.css'
import '@/styles/design-system.css'
```

### 1. `tokens.css` — le vocabulaire

Uniquement des variables CSS, aucune règle appliquée à un sélecteur.

```css
:root {
  /* Surfaces */
  --bg, --bg-elevated, --border, --border-hover

  /* Texte */
  --text, --text-muted, --text-faint

  /* Accent (piloté par thème) */
  --accent, --accent-hover, --accent-soft

  /* Statuts (indépendants du thème) */
  --status-wip, --status-wip-bg, --status-live, --status-live-bg

  /* Typo, espacement, radius, transitions */
  --font-base, --space-1..6, --radius-sm/md, --ease
}
```

### 2. `global.css` — les fondations

Règles appliquées aux éléments HTML natifs / conteneurs structurels (`body`, `.page`). Portée large, change rarement.

### 3. `design-system.css` — les composants réutilisables

Classes appliquées volontairement à plusieurs endroits : `.card`, `.card.is-hoverable`, `.btn`, `.btn--primary`. C'est la couche appelée à grossir avec le temps (futurs `.badge`, `.input`, etc.).

**Pourquoi cette séparation :** lisibilité (on sait où chercher), évite les valeurs magiques dupliquées, facilite l'onboarding futur (la structure de dossier raconte déjà l'architecture).

---

## 🎭 Système de thèmes

L'accent du site est personnalisable via un attribut `[data-theme]` posé sur `<html>`.

```css
[data-theme="slate"]  { --accent: #6e85a6; --accent-hover: #8299bc; --accent-soft: ...; }
[data-theme="sage"]   { ... }
[data-theme="brass"]  { ... }
[data-theme="coral"]  { ... }
[data-theme="violet"] { ... }
[data-theme="cyan"]   { ... }
```

Géré par le composant `ThemeSwitcher.vue` :

- Petit déclencheur circulaire dans la navbar (pas de bouton texte, pas d'emoji — cohérent avec la sobriété de la navbar)
- Panel de swatches avec transition d'apparition (`Transition` Vue, 150ms)
- Fermeture au clic extérieur (`document.addEventListener`) et via `Échap`
- Choix persisté en `localStorage` (`cg-theme`)

**Ce qui suit le thème :** boutons primaires, eyebrow du hero, mini-tuiles "live" du hero, sceau CG de l'About, bordure au hover/focus des cartes Lab.

**Ce qui ne suit PAS le thème (volontaire) :** les badges de statut Lab (`--status-wip` / `--status-live`) — le statut d'un jeu ne doit pas changer de couleur selon l'esthétique choisie.

---

## 🧪 Lab System

Le Lab est le cœur du projet : une grille d'expériences interactives.

- `ExplorerGrid.vue` → contient la liste des items et génère la grille
- `LabCard.vue` → une carte par expérience
  - États : `wip` / `live`
  - Rendu conditionnel : `<component :is="isLive ? RouterLink : 'div'">` — une carte WIP n'est pas navigable et n'a pas l'effet hover, pour éviter de mener vers une page vide
  - Badge de statut avec label mappé (`wip` → "en travaux", `live` → "live")
  - Accessibilité : focus visible sur les cartes cliquables

---

## 🎯 Signature visuelle

### Hero (page d'accueil)

Mini-preview asymétrique du Lab (bento layout, 4 tuiles) : chaque tuile a une micro-icône SVG (trait fin, cohérent avec `--accent`), un point de statut, et une pulsation douce sur les tuiles "live". Sert de teaser honnête vers la vraie page Lab plutôt qu'un motif décoratif abstrait.

### About

Sceau/monogramme "CG" dans un cercle en trait fin — signature d'identité, distincte du rôle du hero (qui évoque le contenu, pas la marque).

---

## ⚙️ Backend (Cloudflare Workers)

### Stack

- Cloudflare Workers
- Hono framework

### Role

API légère utilisée pour :

- tester des endpoints
- stocker des données expérimentales
- soutenir de futures fonctionnalités du Lab

### API endpoints

```
GET    /api/hello
GET    /api/messages
POST   /api/messages
DELETE /api/messages
```

---

## 🗄️ Database (D1)

### Table: messages

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
text TEXT NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

Usage : guestbook experiment, API testing layer, data flow validation.

---

## 🔌 Data Flow

```
Frontend → API → D1
```

1. Un composant Vue appelle `/api/messages`
2. Le Worker traite la requête via Hono
3. D1 retourne les données
4. L'UI se met à jour de façon réactive

---

## 🚀 Deployment

**Frontend** — Cloudflare Pages, build via Vite
**Backend** — Cloudflare Workers, déploiement via Wrangler

---

## 🧠 Key Design Decisions

- SPA architecture pour la simplicité
- Component-first UI design
- Design system entièrement variabilisé (tokens) plutôt que valeurs codées en dur
- Accent personnalisable, statuts fonctionnels indépendants de l'esthétique
- Lab-first mindset (expériences avant contenu)
- Stack Cloudflare-native pour la performance edge

---

## 📌 Current Status

- UI System / Design tokens : ✅ stable v1
- Système de thèmes : ✅ fonctionnel (6 presets)
- Lab system : ⚙️ en développement actif (intégration des premiers jeux)
- Backend API : ⚙️ expérimental mais stable
- Admin dashboard : ❌ non implémenté (hors scope actuel)