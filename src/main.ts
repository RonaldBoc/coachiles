import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

console.log('🚀 App starting...')

async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // Initialize auth store early and wait for it to complete
  const { useAuthStore } = await import('./stores/auth')
  const authStore = useAuthStore()

  try {
    await authStore.initialize()
    console.log('✅ Auth store initialized successfully')
  } catch (error) {
    console.error('❌ Auth store initialization failed:', error)
  }

  app.mount('#app')
}

initializeApp().catch(console.error)
