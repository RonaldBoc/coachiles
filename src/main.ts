import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { config } from './utils/config'
import { useAuthStore } from './stores/auth'

// Import Supabase to trigger connection test if not using mock data
if (!config.useMockData) {
  import('./utils/supabase')
}

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

  // Initialize auth store before router to ensure auth state is ready
  const authStore = useAuthStore()
  await authStore.initialize()

  app.use(router)
  app.mount('#app')
}

initializeApp().catch(console.error)
