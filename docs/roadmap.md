# 🗺️ Roadmap

## ✅ Phase 1 — Foundation (DONE)
## ✅ Phase 2 — UI System (DONE)

*(inchangées, voir historique)*

---

## ✅ Phase 3 — Lab System Expansion (TERMINÉE)

- [x] Système de cartes à 3 états (locked / wip / live)
- [x] `GameLayout` centralisé, architecture standardisée (vue → composant → composable)
- [x] **Hangman, Tables, Flags** — live
- [x] **TicTacToe** (multi tour par tour, Hono + D1, polling) — live
- [x] **QuickDraw** (multi temps réel, Durable Objects + WebSocket) — live
- [ ] Boîte à idées — retirée du Lab pour l'instant (inutilisée)
- [ ] Améliorer `ExplorerGrid` (tri, filtres par statut ?)
- [ ] Mettre en avant des expériences "featured"

---

## ✅ Phase 4 — Grand Nettoyage (TERMINÉE)

Passage complet fichier par fichier, frontend et backend. Détail complet dans `/docs/Architecture.md`.

- [x] Commentaires intelligents sur l'ensemble des fichiers (backend + frontend)
- [x] **Bug critique** : `--danger`/`--danger-bg` manquants dans `tokens.css` — corrigé
- [x] **Bug critique** : site entier en monospace à cause de `style.css` (scaffold Vite jamais nettoyé) — corrigé, fichier supprimé
- [x] **Bug** : `ThemeSwitcher.vue`, `ref="root"` manquant — clic extérieur ne fermait jamais le panneau
- [x] **Bug** : lien cassé `/lab/pendu` dans `ExplorerGrid.vue`
- [x] **Bug** : `.continent-btn` sans point dans `FlagsGame.vue`
- [x] **Bug** : `.pendu-form` résiduel dans `HangmanGame.vue`
- [x] **Bug** : `PublicLayout.vue` non scopé depuis le tout premier message du projet
- [x] Harmonisation des 3 layouts sur un seul mécanisme (`<slot />` partout, `RouterView`+`Transition` centralisés dans `App.vue`)
- [x] Sidebar/Topbar : conversion tokens + "HelloWord" → "CraftGuild"
- [x] `index.html` : `lang="en"` → `lang="fr"`
- [x] `env.d.ts` : typage `ImportMetaEnv` ajouté (fin des casts manuels `as string`)
- [x] `useApiHealth.ts` créé (factorisation ApiCard/TopStatusBar/SystemHealth) — **adoption mise en pause**, voir Phase 6
- [ ] Incohérence UX "Rejouer" (`useTables` retour menu vs `useFlags` relance directe) — à trancher
- [ ] `document.title` jamais synchronisé avec `route.meta.title` — à décider
- [ ] Favicon toujours celui du scaffold Vite — à remplacer par le sceau CG
- [ ] `refreshAll()` dans `Dashboard.vue` : imprécision sur la conflation d'erreurs api/db
- [ ] `setTimeout` non nettoyés dans `useHangman.ts` (impact jugé faible)
- [ ] `isConnected` non réactif dans `useQuickdraw.ts` (code mort actuellement, sans impact)

---

## 🧹 Phase 5 — Amélioration / Harmonisation du Dashboard

Le Dashboard fonctionne mais reste hétérogène — chantier dédié pour le rendre cohérent, pas juste fonctionnel.

- [ ] Adopter réellement `useApiHealth.ts` dans `ApiCard`/`TopStatusBar`/`SystemHealth` (composable déjà écrit, jamais mis en production)
- [ ] `Topbar.vue` : "Dashboard" et "API OK" sont statiques, jamais connectés à de vraies données — à rendre dynamique
- [ ] `Sidebar.vue` : lien mort `/projects`, à retirer ou à câbler sur une vraie route
- [ ] Corriger l'imprécision de `refreshAll()` (Dashboard.vue) sur la gestion d'erreur api/db
- [ ] Décider d'un vrai visuel pour le Dashboard (actuellement un mélange de scaffold jamais assumé comme direction artistique propre — piste évoquée plus tôt : terminal/glassmorphism, cohérent avec un espace "technique" distinct du Lab public)
- [ ] Authentification/accès restreint au Dashboard (actuellement ouvert à quiconque connaît l'URL `/dashboard`)
- [ ] Nettoyer/harmoniser `ApiCard`/`DbCard` (styles quasi dupliqués, à passer sur le même composant de carte générique si pertinent)

---

## 🔔 Phase 6 — Ajout d'une application de notifications

Nouvelle idée à explorer — pas encore cadrée en détail.

- [ ] Définir le besoin exact : notifications in-app (toasts persistants, centre de notifications) vs notifications navigateur (Push API) vs les deux
- [ ] Cas d'usage à clarifier : alertes de statut système (Dashboard), invitations à une partie (TicTacToe/QuickDraw), autre ?
- [ ] Si notifications navigateur : nécessite un Service Worker + permission utilisateur + (potentiellement) un backend pour le Push
- [ ] Si notifications in-app uniquement : plus simple, extension du système de toast déjà présent dans plusieurs jeux (pattern `message` + `afficherMessage()` répété dans plusieurs composables — bon candidat à factoriser en un composable partagé `useToast()` au passage)

---

## 🎨 Phase 7 — UI Polish

- [ ] Responsive complet (mobile first pass)
- [ ] Page 404 dans l'esprit de la DA
- [ ] `prefers-reduced-motion` sur les animations
- [ ] Écran de fin de jeu plus posé (Hangman notamment)
- [ ] `Lab.vue` : typographie ajoutée lors du nettoyage, à revoir si besoin d'un vrai passage visuel plus poussé

---

## 🔌 Phase 8 — Backend Expansion

- [ ] Restreindre le CORS au domaine de prod (`origin: "*"` actuellement)
- [ ] Nettoyage des sessions TicTacToe abandonnées (pas de TTL/purge)
- [ ] Étendre le schéma D1 si de nouveaux jeux serveur l'exigent

---

## 🧠 Phase 9 — Productization Layer

- Flow de navigation unifié
- Système d'expériences "featured" (optionnel)

---

## 🚀 Phase 10 — Future Extensions (LATER / EN PAUSE)

- **Compte (login/mdp/email) + leaderboard + mode arcade + badge** — ⏸️ en pause, idée sans finalité confirmée pour l'instant
- **Autres jeux multijoueurs temps réel** — QuickDraw sert de gabarit réutilisable
- Dashboard admin avancé, partage public des expériences

---

## 🧹 Ongoing Principles

- Cohérence UI avant quantité de features
- Logique de jeu séparée de l'affichage (composables purs)
- Validation métier des jeux multijoueurs toujours côté serveur
- Ne jamais supposer qu'un état de Durable Object survit à l'hibernation sans le persister explicitement
- URL d'API jamais en dur — toujours via variable d'environnement typée
- Toujours vérifier le scoping des styles Vue (plusieurs bugs de longue date venaient de là)
- Ne pas construire d'infrastructure avant d'avoir une envie confirmée qui en dépend réellement