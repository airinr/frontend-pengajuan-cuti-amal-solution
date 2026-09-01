import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

app.config.errorHandler = (err) => {
  console.error('[Vue Error]', err)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason)
})

app.use(router).use(i18n).mount('#app')
