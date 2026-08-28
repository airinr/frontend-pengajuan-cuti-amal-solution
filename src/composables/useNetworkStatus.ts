import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const isServerUp = ref(true)
const lastChecked = ref<Date>(new Date())
let healthInterval: ReturnType<typeof setInterval> | null = null

async function checkServer() {
  if (!navigator.onLine) {
    isOnline.value = false
    isServerUp.value = false
    lastChecked.value = new Date()
    return
  }
  try {
    const resp = await fetch('/api/departemen', { method: 'GET', signal: AbortSignal.timeout(5000) })
    isServerUp.value = resp.ok || resp.status < 500
  } catch {
    isServerUp.value = false
  }
  lastChecked.value = new Date()
}

function startHealthCheck() {
  if (healthInterval) clearInterval(healthInterval)
  healthInterval = setInterval(checkServer, 30000)
}

function stopHealthCheck() {
  if (healthInterval) {
    clearInterval(healthInterval)
    healthInterval = null
  }
}

function handleOnline() {
  isOnline.value = true
  checkServer()
}

function handleOffline() {
  isOnline.value = false
  isServerUp.value = false
}

export function useNetworkStatus() {
  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    checkServer()
    startHealthCheck()
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    stopHealthCheck()
  })

  return {
    isOnline,
    isServerUp,
    lastChecked,
    checkServer,
  }
}
