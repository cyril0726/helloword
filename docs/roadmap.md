# 🗺️ Roadmap

## ✅ Phase 1 — Foundation (DONE)

- Vue 3 + Vite setup
- Router system
- Backend Cloudflare Workers (basic API)
- D1 database integration
- Project structure setup

---

## ✅ Phase 2 — UI System (DONE)

- Système de tokens CSS centralisé (`tokens.css` / `global.css` / `design-system.css`)
- Direction artistique définie et appliquée : **"Structured Dark Lab"**
- Système de thèmes d'accent (6 presets) via `ThemeSwitcher.vue`
- Composants de base : `.card`, `.btn`, `.btn--primary`
- Statuts fonctionnels indépendants du thème (`--status-wip`, `--status-live`, `--status-locked`)
- Hero repensé : mini-preview asymétrique et animée du Lab
- About repensé : sceau/monogramme CG
- Navbar sobre avec sélecteur de thème intégré
- Accessibilité de base : focus visible, navigation clavier

---

## 🧩 Phase 3 — Lab System Expansion (EN COURS)

- [x] Système de cartes avec navigation conditionnelle (3 états : locked / wip / live)
- [x] `GameLayout` centralisé (topbar fine, titre/description via `route.meta`)
- [x] Architecture standardisée pour les jeux (vue → composant → composable)
- [x] Convention de nommage établie (anglais technique / français affiché)
- [x] Convention de gestion des assets statiques (`/public/data`, `/public/images`, namespacés par jeu)
- [x] **Hangman** porté (logique + UI complètes)
- [x] **Tables** porté (mode Challenge chrono / Entraînement zen)
- [x] **Flags** porté (JSON + SVG, options limitées au continent de la question)
- [ ] **Morpion** à porter/créer
- [ ] **Boîte à idées** — traitement différent des vrais jeux (pas un mini-jeu, un espace de concept)
- [ ] Ajouter l'état **Locked** visible sur les jeux pas encore commencés (Morpion, Boîte à idées actuellement)
- [ ] Améliorer `ExplorerGrid` (tri, filtres par statut ?)
- [ ] Mettre en avant des expériences "featured"

---

## 🎨 Phase 4 — UI Polish

- [ ] Passage en revue responsive complet (mobile first pass)
- [ ] Micro-interactions supplémentaires
- [ ] Audit de cohérence design sur l'ensemble du site
- [ ] Raffinement typographique et système d'espacement
- [ ] Page 404 dans l'esprit de la DA
- [ ] Favicon décliné du sceau CG
- [ ] Vérification `prefers-reduced-motion` sur les animations (pulsation hero, shake Hangman, transitions thème)
- [ ] Écran de fin de jeu plus posé (confirmation "Rejouer" plutôt que redémarrage automatique, notamment Hangman)

---

## 🔌 Phase 5 — Backend Expansion (OPTIONAL / SUPPORTING ROLE)

- Persister des interactions simples du Lab (scores, meilleurs streaks ?)
- Étendre le schéma D1 si nécessaire
- Affiner l'API (endpoints propres)
- Stockage optionnel d'expériences

---

## 🧠 Phase 6 — Productization Layer

- Home comme point d'entrée produit
- Lab comme expérience principale
- About comme carte d'identité (✅ posée avec le sceau CG)
- Flow de navigation unifié
- Système d'expériences "featured" (optionnel)

---

## 🚀 Phase 7 — Future Extensions (LATER)

- Système d'authentification (outils admin)
- Dashboard admin (basse priorité) — DA distincte possible (terminal / glassmorphism)
- Partage public des expériences
- Système de projets avancé (couche portfolio)

---

## 🧹 Ongoing Principles

- Cohérence UI avant quantité de features
- Lab-first mindset (les expériences d'abord)
- Composants réutilisables uniquement
- Logique de jeu séparée de l'affichage (composables purs, testables)
- Le design system évolue graduellement, toujours via tokens
- Éviter le style page-spécifique autant que possible