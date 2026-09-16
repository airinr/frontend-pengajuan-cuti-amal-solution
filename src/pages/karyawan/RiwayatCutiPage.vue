<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { karyawanApi, type RiwayatCuti } from '../../services/karyawan.service'
import { useErrorPopup } from '../../composables/useErrorPopup'
import { useCalendarNames } from '../../composables/useCalendarNames'

const { t } = useI18n()
const { showError } = useErrorPopup()
const { monthNamesShort } = useCalendarNames()
const riwayat = ref<RiwayatCuti[]>([])
const loading = ref(true)
const selectedYear = ref(new Date().getFullYear())
const sortDirection = ref<'desc' | 'asc'>('desc')
const currentPage = ref(1)
const itemsPerPage = 5

const years = computed(() => {
  const current = new Date().getFullYear();
  const startYear = 2026;
  return Array.from({ length: current - startYear + 1 }, (_, i) => startYear + i);
})

const filteredRiwayat = computed(() => {
  const filtered = riwayat.value.filter(item => {
    const itemYear = new Date(item.tanggal_mulai).getFullYear()
    const yearMatch = itemYear === selectedYear.value
    return yearMatch
  })
  return filtered.sort((a, b) => {
    const dateA = new Date(a.tanggal_pengajuan).getTime()
    const dateB = new Date(b.tanggal_pengajuan).getTime()
    return sortDirection.value === 'desc' ? dateB - dateA : dateA - dateB
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
  const month = monthNamesShort.value[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)

  if (start === end) {
    return `${s.getDate()} ${monthNamesShort.value[s.getMonth()]} ${s.getFullYear()}`
  }

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${monthNamesShort.value[s.getMonth()]} ${s.getFullYear()}`
  }

  return `${s.getDate()} ${monthNamesShort.value[s.getMonth()]} - ${e.getDate()} ${monthNamesShort.value[e.getMonth()]} ${s.getFullYear()}`
}

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    'disetujui': 'bg-green-100 text-green-700',
    'disetujui_hr': 'bg-green-100 text-green-700',
    'disetujui_direktur': 'bg-green-100 text-green-700',
  }
  return styles[status] || 'bg-gray-50 text-gray-600 border border-gray-200'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'disetujui': t('status.approved'),
    'disetujui_hr': t('status.approved'),
    'disetujui_direktur': t('status.approved'),
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
    const res = await karyawanApi.getRiwayatCuti()
    riwayat.value = res.data
  } catch (err) {
    showError(err)
    riwayat.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('history.title') }}</h1>
    <p class="text-sm text-gray-500 mb-6">{{ t('history.subtitle') }}</p>

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
              v-model="sortDirection"
              class="w-full sm:w-auto px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="desc">{{ t('history.newest') }}</option>
              <option value="asc">{{ t('history.oldest') }}</option>
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
              <th class="px-6 py-4">{{ t('history.leaveDate') }}</th>
              <th class="px-6 py-4">{{ t('history.duration') }}</th>
              <th class="px-6 py-4">{{ t('history.leaveType') }}</th>
              <th class="px-6 py-4">{{ t('history.backup') }}</th>
              <th class="px-6 py-4">{{ t('history.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedRiwayat.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400 text-sm">
                {{ t('history.noHistory') }}
              </td>
            </tr>
            <tr
              v-for="(item, index) in paginatedRiwayat"
              :key="index"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="text-xs text-gray-400">{{ t('history.submitted') }}: {{ formatDate(item.tanggal_pengajuan) }}</p>
                <p class="font-medium text-gray-800 mt-0.5">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700">{{ item.durasi }} {{ t('history.days') }}</span>
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
          {{ t('history.noHistory') }}
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="(item, index) in paginatedRiwayat"
            :key="index"
            class="p-4 space-y-2"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs text-gray-400">{{ t('history.submitted') }}: {{ formatDate(item.tanggal_pengajuan) }}</p>
                <p class="font-medium text-gray-800 mt-0.5">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
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
              <span>{{ item.durasi }} {{ t('history.days') }}</span>
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
            {{ t('history.showing') }} {{ paginatedRiwayat.length }} {{ t('history.of') }} {{ filteredRiwayat.length }} {{ t('history.data') }}
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
