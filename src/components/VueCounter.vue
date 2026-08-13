<template>
  <div class="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
    <h2 class="text-2xl font-bold mb-4">{{ title }}</h2>
    <p class="mb-4 text-purple-100">{{ description }}</p>
    <div class="flex items-center gap-4">
      <button
        @click="count++"
        class="bg-white text-purple-600 font-semibold px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
      >
        Count: {{ count }}
      </button>
      <button
        @click="$emit('reset')"
        class="bg-purple-400/30 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-400/50 transition-colors cursor-pointer"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  description: string
}>()

defineEmits<{
  reset: []
}>()

const count = ref(0)
</script>
