/*Point d'entrée
-> démarre Vue
-> injecte le router
-> monte l'app dans #app*/

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 🐛 CORRIGÉ — BUG MAJEUR : "./style.css" (retiré) était le CSS de démo
// par défaut du scaffold Vite, jamais nettoyé. Il contenait notamment
// `#app { font-family: monospace }` — un sélecteur d'ID, plus spécifique
// que le `body { font-family: var(--font-base) }` de global.css, qui
// faisait donc afficher TOUT le site en monospace depuis le début,
// contredisant frontalement la direction artistique "Inter sans-serif"
// posée dès le départ. Les 2 règles réellement utiles de ce fichier
// (reset box-sizing, transition .page-enter/leave-*) ont été récupérées
// dans global.css avant suppression complète du fichier — voir
// /docs/Architecture.md pour le détail de cette correction.
// import "./style.css"  ← supprimé, voir ci-dessus

// Ordre IMPORTANT et volontaire : tokens.css doit être chargé en premier
// (déclare les variables), puis global.css (fondations qui consomment
// ces variables), puis design-system.css (composants réutilisables qui
// en dépendent aussi) — inverser cet ordre casserait les var(--...)
// non encore définies au moment où global.css/design-system.css
// seraient évalués.
import '@/styles/tokens.css'
import '@/styles/global.css'
import '@/styles/design-system.css'

createApp(App).use(router).mount('#app')