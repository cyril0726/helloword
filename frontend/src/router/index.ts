import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Lab from '../views/Lab.vue'
import Pendu from '../views/games/HangmanView.vue'
import Tables from '../views/games/TablesView.vue'
import Flags from '../views/games/FlagsView.vue'
import Tictactoe from '../views/games/TictactoeView.vue'

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
    path: '/lab/pendu',
    component: Pendu,
    meta: {
    layout: 'game',
    title: 'Pendu',
  }
  },
  {
    path: '/lab/tables',
    component: Tables,
    meta: { layout: 'game' }
  },
  {
    path: '/lab/flags',
    component: Flags,
    meta: { layout: 'game' }
  },
  {
    path: '/lab/tictactoe',
    component: Tictactoe,
    meta: { layout: 'game' }
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
]

export default createRouter({
  history: createWebHistory(),
  routes
})