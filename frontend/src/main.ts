/*Point d'entrée 
-> démarre Vue
-> injecte le router
-> monte l’app dans #app*/


import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "./style.css"
createApp(App).use(router).mount('#app')