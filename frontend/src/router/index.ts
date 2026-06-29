import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Dashboard from '../views/Dashboard.vue'

import Home from '../views/Home.vue'
import About from '../views/About.vue'
import guestbook from '../views/GuestbookView.vue'

/*const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/guestbook', name: 'guestbook',  component: guestbook }
]*/

const routes = [
  { path: '/', component: Dashboard }
]

/*const router = createRouter({
  history: createWebHistory(),
  routes
})*/



export default createRouter({
  history: createWebHistory(),
  routes
})