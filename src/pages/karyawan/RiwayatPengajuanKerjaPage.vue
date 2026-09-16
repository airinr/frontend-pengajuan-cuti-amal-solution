<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { penambahanKerjaApi, type PenambahanKerjaItem } from '../../services/penambahanKerja.service'
import { useErrorPopup } from '../../composables/useErrorPopup'
import { useCalendarNames } from '../../composables/useCalendarNames'

const { t } = useI18n()
const { showError } = useErrorPopup()
const { monthNamesShort } = useCalendarNames()
const riwayat = ref<PenambahanKerjaItem[]>([])
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
    const statusMatch = item.status === 'disetujui_hr' || item.status === 'disetujui_pm' || item.status === 'ditolak_pm' || item.status === 'ditolak_hr'
    return yearMatch && statusMatch
  })
  return filtered.sort((a, b) => {
    const dateA = new Date(a.tanggal_mulai).getTime()
    const dateB = new Date(b.tanggal_mulai).getTime()
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

  return `${s.getDate()} ${monthNamesShort.value[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${monthNamesShort.value[e.getMonth()]} ${e.getFullYear()}`
}

const getStatusBadge = (status: string) => {
  if (status.includes('disetujui')) {
    return { label: t('status.approved'), class: 'bg-green-100 text-green-700' }
  }
  if (status.includes('ditolak')) {
    return { label: t('status.rejected'), class: 'bg-red-100 text-red-700' }
  }
  return { label: status, class: 'bg-gray-100 text-gray-700' }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

onMounted(async () => {
  try {
    const res = await penambahanKerjaApi.getMyPenambahanKerja()
    riwayat.value = res.data || []
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
    <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('workHistory.title') }}</h1>
    <p class="text-sm text-gray-500 mb-6">{{ t('workHistory.subtitle') }}</p>

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
              <th class="px-6 py-4">{{ t('workHistory.workDate') }}</th>
              <th class="px-6 py-4">{{ t('history.duration') }}</th>
              <th class="px-6 py-4">{{ t('history.keterangan') }}</th>
              <th class="px-6 py-4">{{ t('history.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedRiwayat.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm">
                {{ t('workHistory.noHistory') }}
              </td>
            </tr>
            <tr
              v-for="(item, index) in paginatedRiwayat"
              :key="index"
              class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-medium text-gray-800">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ t('history.submitted') }}: {{ formatDate(item.tanggal_pengajuan) }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700">{{ item.durasi || 1 }} {{ t('history.days') }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700">{{ item.keterangan_pengajuan || '-' }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-block px-3 py-1 rounded-full text-xs font-medium',
                    getStatusBadge(item.status).class
                  ]"
                >
                  {{ getStatusBadge(item.status).label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden divide-y divide-gray-100">
        <div v-if="paginatedRiwayat.length === 0" class="p-8 text-center text-gray-400 text-sm">
          {{ t('workHistory.noHistory') }}
        </div>
        <div
          v-for="(item, index) in paginatedRiwayat"
          :key="index"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between mb-2">
            <p class="font-medium text-gray-800">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-medium',
                getStatusBadge(item.status).class
              ]"
            >
              {{ getStatusBadge(item.status).label }}
            </span>
          </div>
          <div class="space-y-1 text-sm text-gray-600">
            <p>{{ t('history.duration') }}: {{ item.durasi || 1 }} {{ t('history.days') }}</p>
            <p>{{ t('history.keterangan') }}: {{ item.keterangan_pengajuan || '-' }}</p>
            <p class="text-xs text-gray-400">{{ t('history.submitted') }}: {{ formatDate(item.tanggal_pengajuan) }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <p class="text-sm text-gray-500">
          {{ t('history.showing') }}
          {{ filteredRiwayat.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}
          -{{ Math.min(currentPage * itemsPerPage, filteredRiwayat.length) }}
          {{ t('history.of') }} {{ filteredRiwayat.length }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('common.previous') }}
          </button>
          <span class="text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('common.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
