import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { config } from './utils/config'

console.log('🚀 App starting...')
console.log('🔧 Environment check:', {
  VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
  NODE_ENV: import.meta.env.NODE_ENV,
  DEV: import.meta.env.DEV,
})
console.log('⚙️ Config useMockData:', config.useMockData)

async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  
  // Initialize auth store after mounting to avoid blocking the app
  if (!config.useMockData) {
    const { useAuthStore } = await import('./stores/auth')
    const authStore = useAuthStore()
    authStore.initialize().catch(console.error)
  }
  
  app.mount('#app')
}

initializeApp().catch(console.error)
