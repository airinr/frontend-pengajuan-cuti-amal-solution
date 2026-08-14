<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../../services/auth.service'
import type { CurrentUser } from '../../types'

const router = useRouter()

const user = ref<CurrentUser | null>(null)
const loading = ref(true)

const totalCuti = computed(() => user.value?.total_cuti ?? '-')
const sisaCuti = computed(() => user.value?.sisa_cuti ?? '-')
const terpakai = computed(() => {
  if (!user.value) return '-'
  return user.value.total_cuti - user.value.sisa_cuti
})

onMounted(async () => {
  try {
    const res = await authApi.me()
    user.value = res.data
  } catch {
    // silent fail
  } finally {
    loading.value = false
  }
})

const goToPengajuan = () => {
  router.push('/karyawan/pengajuan-cuti')
}
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Ringkasan Cuti</h1>
        <p class="text-xs lg:text-sm text-gray-500">Periode Tahun 2024</p>
      </div>
      <button
        @click="goToPengajuan"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
      >
        + Buat Pengajuan
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Total Hak Cuti</p>
              <p class="text-xl lg:text-2xl font-bold text-gray-800">{{ totalCuti }} <span class="text-sm font-normal text-gray-500">Hari</span></p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Terpakai</p>
              <p class="text-xl lg:text-2xl font-bold text-gray-800">{{ terpakai }} <span class="text-sm font-normal text-gray-500">Hari</span></p>
            </div>
          </div>
        </div>

        <div class="bg-gray-600 rounded-xl p-4 lg:p-6 shadow-sm text-white sm:col-span-2 lg:col-span-1">
          <p class="text-xs text-gray-200 uppercase tracking-wide mb-1">Sisa Cuti Anda</p>
          <div class="flex items-center gap-4 lg:gap-6">
            <div class="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#9CA3AF" stroke-width="8" />
                <circle
                  cx="40" cy="40" r="35"
                  fill="none"
                  stroke="white"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="220"
                  :stroke-dashoffset="220 - (220 * (terpakai / (user?.total_cuti || 1)))"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg lg:text-xl font-bold">{{ sisaCuti }}</span>
              </div>
            </div>
            <div>
              <p class="text-2xl lg:text-3xl font-bold">{{ sisaCuti }} <span class="text-sm lg:text-base font-normal text-gray-200">Hari</span></p>
              <p class="text-xs text-gray-200 mt-1">Tersisa dari {{ user?.total_cuti || '-' }} hari</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div class="lg:col-span-2 space-y-4 lg:space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="p-4 lg:p-6 border-b border-gray-100">
              <div class="flex justify-between items-center">
                <h3 class="font-semibold text-gray-800">Pengajuan Sedang Diproses</h3>
              </div>
            </div>
            <div class="p-4 lg:p-6 text-center text-gray-400 text-sm">-</div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <h3 class="font-semibold text-gray-800 mb-4">Hari Libur Mendatang</h3>
            <div class="text-center text-gray-400 text-sm">-</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 class="font-semibold text-gray-800">Aktivitas Terbaru</h3>
          </div>
          <div class="text-center text-gray-400 text-sm">-</div>
        </div>
      </div>
    </template>
  </div>
</template>
