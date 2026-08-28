import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.errorHandler = (err) => {
  console.error('[Vue Error]', err)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason)
})

app.use(router).mount('#app')
