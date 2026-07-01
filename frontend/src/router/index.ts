import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Lab from '../views/Lab.vue'

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