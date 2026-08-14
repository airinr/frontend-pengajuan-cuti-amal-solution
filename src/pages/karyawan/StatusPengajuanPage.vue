<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { leaveApi, type OngoingCuti } from '../../services/leave.service'

const ongoingList = ref<OngoingCuti[]>([])
const loading = ref(true)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const day = date.getDate()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr)
  const day = date.getDate()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const month = monthNames[date.getMonth()]
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month}, ${hours}:${minutes}`
}

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start)
  const e = new Date(end)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  if (start === end) {
    return `${s.getDate()} ${monthNames[s.getMonth()]} ${s.getFullYear()}`
  }

  return `${s.getDate()} ${monthNames[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${monthNames[e.getMonth()]} ${e.getFullYear()}`
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    'menunggu_pm': { label: 'Menunggu PM', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'menunggu_hr': { label: 'Menunggu HRD', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'menunggu_direktur': { label: 'Menunggu Direktur', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'disetujui_pm': { label: 'Disetujui PM', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'disetujui_hr': { label: 'Disetujui HRD', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'disetujui_direktur': { label: 'Disetujui Direktur', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'ditolak_pm': { label: 'Ditolak PM', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    'ditolak_hr': { label: 'Ditolak HRD', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    'ditolak_direktur': { label: 'Ditolak Direktur', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  }
  return configs[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
}

const getStepStatus = (item: OngoingCuti, step: number) => {
  const status = item.status_sekarang

  if (status.includes('ditolak')) {
    if (step === 1) return 'completed'
    if (step === 2 && status.includes('ditolak_pm')) return 'rejected'
    return 'pending'
  }

  if (step === 1) return 'completed'

  if (step === 2) {
    if (item.disetujui_pm) return 'completed'
    if (status === 'menunggu_pm') return 'active'
    return 'pending'
  }

  if (step === 3) {
    if (item.disetujui_hr) return 'completed'
    if (status === 'menunggu_hr') return 'active'
    return 'pending'
  }

  if (step === 4) {
    if (item.disetujui_direktur) return 'completed'
    if (status === 'menunggu_direktur') return 'active'
    return 'pending'
  }

  return 'pending'
}

const getStepDate = (item: OngoingCuti, step: number) => {
  if (step === 1) return item.tanggal_mulai
  if (step === 2) return item.approved_at_pm
  if (step === 3) return item.approved_at_hr
  if (step === 4) return item.approved_at_direktur
  return null
}

const getCardBorderColor = (item: OngoingCuti) => {
  if (item.status_sekarang.includes('ditolak')) return 'border-l-red-400'
  return 'border-l-blue-400'
}

onMounted(async () => {
  try {
    const res = await leaveApi.getOngoingCuti()
    ongoingList.value = res.data
  } catch {
    ongoingList.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="bg-blue-50 rounded-xl p-6 mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Status Pengajuan Cuti</h1>
      <p class="text-sm text-gray-600">
        Pantau proses persetujuan pengajuan cuti Anda secara real-time. Hubungi atasan jika
        status belum berubah dalam 2x24 jam.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Pengajuan Aktif</h2>

      <div v-if="ongoingList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
        Tidak ada pengajuan aktif
      </div>

      <div v-else class="space-y-4 lg:space-y-6">
        <div
          v-for="(item, index) in ongoingList"
          :key="index"
          :class="[
            'bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 overflow-hidden',
            getCardBorderColor(item)
          ]"
        >
          <div class="p-4 lg:p-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ item.jenis_cuti }}</span>
                  <span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">{{ item.durasi }} Hari</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">{{ item.keterangan }}</h3>
                <div class="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}
                </div>
              </div>

              <div :class="[
                'px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 self-start',
                getStatusConfig(item.status_sekarang).bgColor,
                getStatusConfig(item.status_sekarang).color,
                getStatusConfig(item.status_sekarang).borderColor
              ]">
                <svg v-if="item.status_sekarang.includes('ditolak')" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Status Saat Ini</span>
                <span class="font-semibold">{{ getStatusConfig(item.status_sekarang).label }}</span>
              </div>
            </div>

            <div v-if="item.alasan_penolakan && item.status_sekarang.includes('ditolak')" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm font-semibold text-red-600 mb-1">Alasan Penolakan:</p>
                  <p class="text-sm text-red-600">{{ item.alasan_penolakan }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between relative">
              <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div class="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all" :style="{ width: item.status_sekarang.includes('ditolak') ? '25%' : getStepStatus(item, 4) === 'completed' ? '100%' : getStepStatus(item, 3) === 'completed' ? '66%' : getStepStatus(item, 2) === 'completed' ? '33%' : '0%' }"></div>

              <div class="flex flex-col items-center relative z-10">
                <div :class="[
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-4 border-white',
                  getStepStatus(item, 1) === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                ]">
                  <svg v-if="getStepStatus(item, 1) === 'completed'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else class="text-xs lg:text-sm font-medium">1</span>
                </div>
                <p class="text-[10px] lg:text-xs font-medium text-gray-800 mt-2 text-center">Diajukan</p>
                <p class="text-[10px] lg:text-xs text-gray-400 text-center">{{ formatDateShort(item.tanggal_mulai) }}</p>
              </div>

              <div class="flex flex-col items-center relative z-10">
                <div :class="[
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-4 border-white',
                  getStepStatus(item, 2) === 'completed' ? 'bg-blue-600 text-white' :
                  getStepStatus(item, 2) === 'rejected' ? 'bg-red-500 text-white' :
                  getStepStatus(item, 2) === 'active' ? 'bg-blue-600 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                ]">
                  <svg v-if="getStepStatus(item, 2) === 'completed'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="getStepStatus(item, 2) === 'rejected'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg v-else-if="getStepStatus(item, 2) === 'active'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span v-else class="text-xs lg:text-sm font-medium">2</span>
                </div>
                <p :class="[
                  'text-[10px] lg:text-xs font-medium mt-2 text-center',
                  getStepStatus(item, 2) === 'active' ? 'text-blue-600' :
                  getStepStatus(item, 2) === 'rejected' ? 'text-red-500' :
                  getStepStatus(item, 2) === 'completed' ? 'text-gray-800' : 'text-gray-400'
                ]">
                  {{ getStepStatus(item, 2) === 'completed' ? 'Disetujui PM' :
                     getStepStatus(item, 2) === 'rejected' ? 'Ditolak PM' :
                     getStepStatus(item, 2) === 'active' ? 'Menunggu PM' : 'Menunggu PM' }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ getStepDate(item, 2) ? formatDateShort(getStepDate(item, 2)!) : '-' }}
                </p>
              </div>

              <div class="flex flex-col items-center relative z-10">
                <div :class="[
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-4 border-white',
                  getStepStatus(item, 3) === 'completed' ? 'bg-blue-600 text-white' :
                  getStepStatus(item, 3) === 'active' ? 'bg-blue-600 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                ]">
                  <svg v-if="getStepStatus(item, 3) === 'completed'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="getStepStatus(item, 3) === 'active'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <svg v-else class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p :class="[
                  'text-[10px] lg:text-xs font-medium mt-2 text-center',
                  getStepStatus(item, 3) === 'active' ? 'text-blue-600' :
                  getStepStatus(item, 3) === 'completed' ? 'text-gray-800' : 'text-gray-400'
                ]">
                  {{ getStepStatus(item, 3) === 'completed' ? 'Disetujui HRD' : 'Menunggu HRD' }}
                </p>
                <p class="text-[10px] lg:text-xs text-gray-400 text-center">
                  {{ getStepDate(item, 3) ? formatDateShort(getStepDate(item, 3)!) : '-' }}
                </p>
              </div>

              <div class="flex flex-col items-center relative z-10">
                <div :class="[
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-4 border-white',
                  getStepStatus(item, 4) === 'completed' ? 'bg-blue-600 text-white' :
                  getStepStatus(item, 4) === 'active' ? 'bg-blue-600 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                ]">
                  <svg v-if="getStepStatus(item, 4) === 'completed'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="getStepStatus(item, 4) === 'active'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <svg v-else class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p :class="[
                  'text-[10px] lg:text-xs font-medium mt-2 text-center',
                  getStepStatus(item, 4) === 'active' ? 'text-blue-600' :
                  getStepStatus(item, 4) === 'completed' ? 'text-gray-800' : 'text-gray-400'
                ]">
                  Selesai
                </p>
                <p class="text-[10px] lg:text-xs text-gray-400 text-center">
                  {{ getStepDate(item, 4) ? formatDateShort(getStepDate(item, 4)!) : '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
