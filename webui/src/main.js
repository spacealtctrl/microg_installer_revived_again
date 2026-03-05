
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { i18n } from './i18n.js'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')

import { useThemeStore } from '@/stores/Theme.js'
const themeStore = useThemeStore()
themeStore.loadSettings()
