
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Downloads from '@/views/Downloads.vue'
import Logs from '@/views/Logs.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/downloads', component: Downloads },
    { path: '/logs', component: Logs },
    { path: '/settings', component: Settings }
  ]
})

export default router
