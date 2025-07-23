import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { config } from './utils/config'

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

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
