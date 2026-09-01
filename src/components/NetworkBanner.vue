<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNetworkStatus } from '../composables/useNetworkStatus'

const { t } = useI18n()
const { isOnline, isServerUp } = useNetworkStatus()

const showOfflineBanner = computed(() => !isOnline.value)
const showServerDownBanner = computed(() => isOnline.value && !isServerUp.value)
</script>

<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="showOfflineBanner"
        class="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-white text-center py-2.5 px-4 text-sm font-medium shadow-lg"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 2.122a1.5 1.5 0 112.121 2.121 1.5 1.5 0 01-2.121-2.121z" />
          </svg>
          {{ t('network.noConnection') }}
        </div>
      </div>
    </Transition>
    <Transition name="slide">
      <div
        v-if="showServerDownBanner"
        class="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center py-2.5 px-4 text-sm font-medium shadow-lg"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {{ t('network.serverError') }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
