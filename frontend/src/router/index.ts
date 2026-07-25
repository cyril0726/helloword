import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Lab from '../views/Lab.vue'
import Hangman from '../views/games/HangmanView.vue'
import Tables from '../views/games/TablesView.vue'
import Flags from '../views/games/FlagsView.vue'
import Tictactoe from '../views/games/TictactoeView.vue'
import Quickdraw from '../views/games/QuickdrawView.vue'

// Convention : title (et description, quand présent) vivent dans route.meta
// plutôt que d'être gérés par la vue elle-même — décision prise après
// plusieurs essais (props, provide/inject) avant de converger vers
// route.meta comme pattern le plus standard côté écosystème Vue Router
// (voir /docs/Architecture.md). GameLayout.vue lit route.meta.title
// directement pour afficher le titre dans sa topbar.
const routes = [
  {
    path: '/',
    component: Home,
    meta: { layout: 'public' }
  },
  {
    path: '/lab',
    component: Lab,
    meta: { layout: 'public' }
  },
  {
    path: '/lab/hangman',
    component: Hangman,
    meta: {
      layout: 'game',
      title: 'Pendu'
      // ⚠️ Pas de "description" ici, contrairement à QuickDraw plus bas
      // — incohérence mineure. Actuellement sans impact : GameLayout.vue
      // n'affiche que meta.title, meta.description n'est consommé nulle
      // part pour l'instant sur aucune route. À harmoniser (ajouter
      // partout, ou retirer de QuickDraw) selon si ce champ doit servir
      // à quelque chose bientôt (ex: sous-titre dans la topbar, meta SEO).
    }
  },
  {
    path: '/lab/tables',
    component: Tables,
    meta: {
      layout: 'game',
      title: 'Tables'
    }
  },
  {
    path: '/lab/flags',
    component: Flags,
    meta: {
      layout: 'game',
      title: 'Flags'
    }
  },
  {
    path: '/lab/tictactoe',
    component: Tictactoe,
    meta: {
      layout: 'game',
      title: 'Morpion'
    }
  },
  {
    path: '/lab/quickdraw',
    component: Quickdraw,
    meta: {
      layout: 'game',
      title: 'QuickDraw',
      description: 'Sois le plus rapide à réagir au signal.'
    }
  },
  {
    path: '/about',
    component: About,
    meta: { layout: 'public' }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { layout: 'dashboard' }
  }

  // Pas de route catch-all (404) pour l'instant — gap déjà identifié
  // dans /docs/Roadmap.md (Phase 5, "Page 404 dans l'esprit de la DA").
  // À ajouter : { path: '/:pathMatch(.*)*', component: NotFoundView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})