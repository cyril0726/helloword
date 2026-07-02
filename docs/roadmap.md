# 🗺️ Roadmap

## ✅ Phase 1 — Foundation (DONE)

- Vue 3 + Vite setup
- Router system
- Backend Cloudflare Workers (basic API)
- D1 database integration
- Project structure setup

---

## ✅ Phase 2 — UI System (DONE)

Transformation complète en système UI orienté produit.

- Système de tokens CSS centralisé (`tokens.css` / `global.css` / `design-system.css`)
- Direction artistique définie et appliquée : **"Structured Dark Lab"**
- Système de thèmes d'accent (6 presets : slate, sage, brass, coral, violet, cyan) via `ThemeSwitcher.vue`
- Composants de base : `.card`, `.btn`, `.btn--primary`
- Statuts fonctionnels indépendants du thème (`--status-wip`, `--status-live`)
- Hero repensé : mini-preview asymétrique et animée du Lab (signature visuelle)
- About repensé : sceau/monogramme CG, carte d'identité
- Navbar sobre avec sélecteur de thème intégré
- Accessibilité de base : focus visible, navigation clavier sur les cartes

---

## 🧩 Phase 3 — Lab System Expansion (EN COURS)

Le Lab devient le produit central.

- [x] Système de cartes avec navigation conditionnelle (WIP non cliquable)
- [x] Badge de statut WIP / Live
- [ ] Ajouter les premiers vrais mini-jeux (un par un)
- [ ] Standardiser la structure d'un jeu
- [ ] Ajouter l'état **Locked** (idées futures) en plus de WIP / Live
- [ ] Améliorer le système de navigation du Lab
- [ ] Améliorer `ExplorerGrid` (tri, filtres par statut ?)
- [ ] Mettre en avant des expériences "featured"
- [ ] Traiter la carte "Boîte à idées" différemment des vraies expériences (gabarit distinct)

---

## 🎨 Phase 4 — UI Polish

- [ ] Passage en revue responsive complet (mobile first pass)
- [ ] Micro-interactions supplémentaires (au-delà du hero/theme switcher actuels)
- [ ] Audit de cohérence design sur l'ensemble du site
- [ ] Raffinement du système typographique
- [ ] Standardisation fine du système d'espacement
- [ ] Page 404 dans l'esprit de la DA
- [ ] Vérification `prefers-reduced-motion` sur les animations (pulsation hero, transitions thème)

---

## 🔌 Phase 5 — Backend Expansion (OPTIONAL / SUPPORTING ROLE)

Le backend reste secondaire (support du Lab uniquement) :

- Persister des interactions simples du Lab
- Étendre le schéma D1 si nécessaire
- Affiner l'API (endpoints propres)
- Stockage optionnel d'expériences

---

## 🧠 Phase 6 — Productization Layer

Transformer le projet en véritable "produit web" cohérent.

- Home comme point d'entrée produit
- Lab comme expérience principale
- About comme carte d'identité (✅ posée avec le sceau CG)
- Flow de navigation unifié
- Système d'expériences "featured" (optionnel)

---

## 🚀 Phase 7 — Future Extensions (LATER)

Seulement si nécessaire :

- Système d'authentification (outils admin)
- Dashboard admin (basse priorité) — pourrait réutiliser une DA différente (terminal / glassmorphism, écartées pour le public mais pertinentes pour un espace technique)
- Partage public des expériences
- Système de projets avancé (couche portfolio)

---

## 🧹 Ongoing Principles

- Cohérence UI avant quantité de features
- Lab-first mindset (les expériences d'abord)
- Composants réutilisables uniquement
- Le design system évolue graduellement, toujours via tokens
- Éviter le style page-spécifique autant que possible