import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { initializeMsal } from './services/msal'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Initialize MSAL (non-blocking — app works without Entra)
initializeMsal().catch(() => {})

app.mount('#app')
