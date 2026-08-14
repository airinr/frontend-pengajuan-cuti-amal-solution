<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { leaveApi, type RiwayatCuti } from '../../services/leave.service'

const riwayat = ref<RiwayatCuti[]>([])
const loading = ref(true)
const selectedYear = ref(new Date().getFullYear())
const selectedStatus = ref('semua')
const currentPage = ref(1)
const itemsPerPage = 5

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

const statusOptions = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'disetujui_pm', label: 'Disetujui PM' },
  { value: 'disetujui_direktur', label: 'Disetujui Direktur' },
  { value: 'menunggu_pm', label: 'Menunggu PM' },
  { value: 'menunggu_direktur', label: 'Menunggu Direktur' },
  { value: 'ditolak', label: 'Ditolak' },
]

const filteredRiwayat = computed(() => {
  return riwayat.value.filter(item => {
    const itemYear = new Date(item.tanggal_mulai).getFullYear()
    const yearMatch = itemYear === selectedYear.value
    const statusMatch = selectedStatus.value === 'semua' || item.status === selectedStatus.value
    return yearMatch && statusMatch
  })
})

const totalPages = computed(() => Math.ceil(filteredRiwayat.value.length / itemsPerPage))

const paginatedRiwayat = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRiwayat.value.slice(start, start + itemsPerPage)
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const day = date.getDate()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  if (start === end) {
    return `${s.getDate()} ${monthNames[s.getMonth()]} ${s.getFullYear()}`
  }

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${monthNames[s.getMonth()]} ${s.getFullYear()}`
  }

  return `${s.getDate()} ${monthNames[s.getMonth()]} - ${e.getDate()} ${monthNames[e.getMonth()]} ${s.getFullYear()}`
}

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    'disetujui_pm': 'bg-blue-50 text-blue-600 border border-blue-200',
    'disetujui_direktur': 'bg-blue-50 text-blue-600 border border-blue-200',
    'menunggu_pm': 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    'menunggu_direktur': 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    'ditolak': 'bg-red-50 text-red-600 border border-red-200',
  }
  return styles[status] || 'bg-gray-50 text-gray-600 border border-gray-200'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'disetujui_pm': 'Disetujui',
    'disetujui_direktur': 'Disetujui',
    'menunggu_pm': 'Menunggu',
    'menunggu_direktur': 'Menunggu',
    'ditolak': 'Ditolak',
  }
  return labels[status] || status
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

onMounted(async () => {
  try {
    const res = await leaveApi.getRiwayatCuti()
    riwayat.value = res.data
  } catch {
    riwayat.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Riwayat Cuti</h1>
    <p class="text-sm text-gray-500 mb-6">Lacak rekam jejak dan status pengajuan cuti Anda sebelumnya.</p>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100">
      <!-- Filters -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 w-full sm:w-auto">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <select v-model="selectedYear" class="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div class="relative w-full sm:w-auto">
            <select
              v-model="selectedStatus"
              class="w-full sm:w-auto px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 outline-none cursor-pointer appearance-none pr-8"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th class="px-6 py-4">Tanggal Cuti</th>
              <th class="px-6 py-4">Durasi</th>
              <th class="px-6 py-4">Jenis Cuti</th>
              <th class="px-6 py-4">Backup</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedRiwayat.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400 text-sm">
                Tidak ada data riwayat cuti
              </td>
            </tr>
            <tr
              v-for="(item, index) in paginatedRiwayat"
              :key="index"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-gray-800">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">Diajukan: {{ formatDate(item.tanggal_mulai) }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700">{{ item.durasi }} Hari</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700 capitalize">{{ item.jenis_cuti }}</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="item.nama_pengganti" class="flex items-center gap-2">
                  <div class="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                    {{ getInitials(item.nama_pengganti) }}
                  </div>
                  <span class="text-sm text-gray-700">{{ item.nama_pengganti }}</span>
                </div>
                <div v-else class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-gray-400">-</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', getStatusStyle(item.status)]">
                  <span :class="[
                    'w-1.5 h-1.5 rounded-full',
                    item.status.includes('disetujui') ? 'bg-blue-500' : 
                    item.status.includes('menunggu') ? 'bg-yellow-500' : 'bg-red-500'
                  ]"></span>
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden">
        <div v-if="paginatedRiwayat.length === 0" class="p-6 text-center text-gray-400 text-sm">
          Tidak ada data riwayat cuti
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="(item, index) in paginatedRiwayat"
            :key="index"
            class="p-4 space-y-2"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-800">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">Diajukan: {{ formatDate(item.tanggal_mulai) }}</p>
              </div>
              <span :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', getStatusStyle(item.status)]">
                <span :class="[
                  'w-1.5 h-1.5 rounded-full',
                  item.status.includes('disetujui') ? 'bg-blue-500' : 
                  item.status.includes('menunggu') ? 'bg-yellow-500' : 'bg-red-500'
                ]"></span>
                {{ getStatusLabel(item.status) }}
              </span>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>{{ item.durasi }} Hari</span>
              <span class="capitalize">{{ item.jenis_cuti }}</span>
            </div>
            <div v-if="item.nama_pengganti" class="flex items-center gap-2">
              <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-medium text-blue-700">
                {{ getInitials(item.nama_pengganti) }}
              </div>
              <span class="text-sm text-gray-600">{{ item.nama_pengganti }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-4 lg:px-6 py-4 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <p class="text-xs lg:text-sm text-gray-500">
            Menampilkan {{ paginatedRiwayat.length }} dari {{ filteredRiwayat.length }} data
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer',
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
