# 🗺️ Roadmap

## ✅ Phase 1 — Foundation (DONE)

- Vue 3 + Vite setup, Router system
- Backend Cloudflare Workers (basic API), D1 database integration
- Project structure setup

---

## ✅ Phase 2 — UI System (DONE)

- Système de tokens CSS centralisé, direction artistique **"Structured Dark Lab"**
- Système de thèmes d'accent (6 presets)
- Composants de base (`.card`, `.btn`), statuts fonctionnels indépendants du thème
- Hero, About, Navbar finalisés

---

## 🧩 Phase 3 — Lab System Expansion (EN COURS)

- [x] Système de cartes à 3 états (locked / wip / live)
- [x] `GameLayout` centralisé, architecture standardisée (vue → composant → composable)
- [x] Conventions de nommage et de gestion des assets statiques
- [x] **Hangman** porté
- [x] **Tables** porté
- [x] **Flags** porté
- [x] **TicTacToe (multijoueur)** — premier jeu serveur : sessions par code partageable, polling, validation côté backend
- [ ] **Boîte à idées** — traitement différent des vrais jeux
- [ ] Ajouter l'état **Locked** visible pour les prochains jeux (voir idées ci-dessous)
- [ ] Améliorer `ExplorerGrid` (tri, filtres par statut ?)
- [ ] Mettre en avant des expériences "featured"

### Idées de jeux à explorer (non planifiées)

- *(à compléter au fil des idées — noter ici avant d'oublier)*

---

## 🎨 Phase 4 — UI Polish

- [ ] Responsive complet (mobile first pass)
- [ ] Micro-interactions supplémentaires
- [ ] Audit de cohérence design
- [ ] Page 404 dans l'esprit de la DA
- [ ] Favicon décliné du sceau CG
- [ ] `prefers-reduced-motion` sur les animations
- [ ] Écran de fin de jeu plus posé (confirmation plutôt que redémarrage auto, Hangman notamment)

---

## 🔌 Phase 5 — Backend Expansion

- [ ] Restreindre le CORS au domaine de prod (actuellement `origin: "*"`)
- [ ] Nettoyage des sessions TicTacToe abandonnées (pas de TTL/purge actuellement)
- [ ] Étendre le schéma D1 si de nouveaux jeux serveur l'exigent
- [ ] Persister scores/streaks des jeux solo (optionnel)

---

## 🧠 Phase 6 — Productization Layer

- Home, Lab, About cohérents comme un vrai produit (✅ largement posé)
- Flow de navigation unifié
- Système d'expériences "featured" (optionnel)

---

## 🚀 Phase 7 — Future Extensions (LATER)

- **Système de compte (login/mot de passe)** — teasing déjà en place (icône navbar désactivée, `AccountTeaser.vue`). Prérequis potentiel pour : sauvegarde de scores, profils, historique de parties TicTacToe.
- **Autres jeux multijoueurs** — TicTacToe sert de gabarit (sessions par code + polling) réutilisable pour de futurs jeux à 2 joueurs. Si un jeu nécessite une synchronisation plus fine/rapide que le polling, réévaluer WebSocket / Durable Objects à ce moment-là.
- Dashboard admin (basse priorité) — DA distincte possible (terminal / glassmorphism)
- Partage public des expériences
- Système de projets avancé (couche portfolio)

---

## 🧹 Ongoing Principles

- Cohérence UI avant quantité de features
- Lab-first mindset
- Composants réutilisables uniquement
- Logique de jeu séparée de l'affichage (composables purs)
- Validation métier des jeux multijoueurs toujours côté serveur
- URL d'API jamais en dur — toujours via variable d'environnement
- Design system évolue graduellement, toujours via tokens