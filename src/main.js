import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'
import router from './router'

// ── Apply saved theme BEFORE first paint (avoids flash) ───────────────────────
const saved = localStorage.getItem('sp_dark_mode')
// Default to dark if never set
if (saved === 'false') {
  document.documentElement.classList.remove('dark')
} else {
  document.documentElement.classList.add('dark')
}

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')

// ── Init theme store AFTER pinia is ready so it can sync ─────────────────────
import('./stores/theme.store.js').then(({ useThemeStore }) => {
  useThemeStore().init()
})

