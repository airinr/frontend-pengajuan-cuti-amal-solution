<script setup lang="ts">
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Status Pengajuan</h1>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="p-6 border-b border-gray-100">
        <div class="flex gap-4">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Semua
          </button>
          <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
            Pending
          </button>
          <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
            Disetujui
          </button>
          <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
            Ditolak
          </button>
        </div>
      </div>

      <div class="p-6 text-center text-gray-400 text-sm">-</div>
    </div>
  </div>
</template>
