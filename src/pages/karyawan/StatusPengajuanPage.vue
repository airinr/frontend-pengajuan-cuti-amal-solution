<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { karyawanApi, type OngoingCuti } from '../../services/karyawan.service'
import { authApi } from '../../services/auth.service'
import { useErrorPopup } from '../../composables/useErrorPopup'

const { t } = useI18n()
const router = useRouter()
const { showError } = useErrorPopup()

const ongoingList = ref<OngoingCuti[]>([])
const loading = ref(true)
const userRole = ref<string>('karyawan')

const stepsByRole = computed(() => ({
  karyawan: [
    { label: t('status.submitted'), statusKey: 'submitted', completedLabel: t('status.submitted'), rejectedLabel: t('status.rejected') },
    { label: t('status.waitingPM'), statusKey: 'pm', completedLabel: t('status.approvedPM'), rejectedLabel: t('status.rejectedPM') },
    { label: t('status.waitingHR'), statusKey: 'hr', completedLabel: t('status.approvedHR'), rejectedLabel: t('status.rejectedHR') },
    { label: t('status.completed'), statusKey: 'selesai', completedLabel: t('status.completed'), rejectedLabel: t('status.rejected') },
  ],
  pm: [
    { label: t('status.submitted'), statusKey: 'submitted', completedLabel: t('status.submitted'), rejectedLabel: t('status.rejected') },
    { label: t('status.waitingHR'), statusKey: 'hr', completedLabel: t('status.approvedHR'), rejectedLabel: t('status.rejectedHR') },
    { label: t('status.completed'), statusKey: 'selesai', completedLabel: t('status.completed'), rejectedLabel: t('status.rejected') },
  ],
  staff_hr: [
    { label: t('status.submitted'), statusKey: 'submitted', completedLabel: t('status.submitted'), rejectedLabel: t('status.rejected') },
    { label: t('status.waitingHR'), statusKey: 'hr', completedLabel: t('status.approvedHR'), rejectedLabel: t('status.rejectedHR') },
    { label: t('status.completed'), statusKey: 'selesai', completedLabel: t('status.completed'), rejectedLabel: t('status.rejected') },
  ],
  hr: [
    { label: t('status.submitted'), statusKey: 'submitted', completedLabel: t('status.submitted'), rejectedLabel: t('status.rejected') },
    { label: t('status.waitingDirector'), statusKey: 'direktur', completedLabel: t('status.approvedDirector'), rejectedLabel: t('status.rejectedDirector') },
    { label: t('status.completed'), statusKey: 'selesai', completedLabel: t('status.completed'), rejectedLabel: t('status.rejected') },
  ],
  direktur: [
    { label: t('status.submitted'), statusKey: 'submitted', completedLabel: t('status.submitted'), rejectedLabel: t('status.rejected') },
    { label: t('status.completed'), statusKey: 'selesai', completedLabel: t('status.completed'), rejectedLabel: t('status.rejected') },
  ],
}))

const currentSteps = computed(() => stepsByRole.value[userRole.value] || stepsByRole.value.karyawan)

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

const getStatusConfig = (status: string, item?: OngoingCuti) => {
  const configs: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    'menunggu_pm': { label: t('status.waitingPM'), color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'menunggu_hr': { label: t('status.waitingHR'), color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'menunggu_direktur': { label: t('status.waitingDirector'), color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'disetujui_pm': { label: t('status.approvedPM'), color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'disetujui_hr': { label: t('status.approvedHR'), color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'disetujui_direktur': { label: t('status.approvedDirector'), color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    'ditolak_pm': { label: t('status.rejectedPM'), color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    'ditolak_hr': { label: t('status.rejectedHR'), color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    'ditolak_direktur': { label: t('status.rejectedDirector'), color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  }

  if (status === 'menunggu_pm' && item?.approval_pm_detail && item.approval_pm_detail.length > 1) {
    const approved = item.approval_pm_detail.filter(pm => pm.status === 'disetujui').length
    const total = item.approval_pm_detail.length
    return { label: `${t('status.waitingPM')} (${approved}/${total})`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
  }

  return configs[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
}

const hasMultiplePm = (item: OngoingCuti) => {
  return item.approval_pm_detail && item.approval_pm_detail.length > 1
}

const getPmApprovalStatus = (item: OngoingCuti) => {
  if (!item.approval_pm_detail || item.approval_pm_detail.length === 0) return null
  const approved = item.approval_pm_detail.filter(pm => pm.status === 'disetujui').length
  const rejected = item.approval_pm_detail.filter(pm => pm.status === 'ditolak').length
  const total = item.approval_pm_detail.length
  return { approved, rejected, total }
}

const getStepStatus = (item: OngoingCuti, stepIndex: number) => {
  const status = item.status_sekarang
  const steps = currentSteps.value
  const step = steps[stepIndex]
  if (!step) return 'pending'

  if (status.includes('ditolak')) {
    if (stepIndex === 0) return 'completed'
    const rejectKey = status.replace('ditolak_', '')
    if (step.statusKey === rejectKey) return 'rejected'
    return 'pending'
  }

  if (stepIndex === 0) return 'completed'

  if (status === 'disetujui_hr' || status === 'disetujui_direktur') return 'completed'

  const prevStep = steps[stepIndex - 1]
  if (prevStep.statusKey === 'submitted') {
    if (step.statusKey === 'pm' && (status === 'menunggu_hr' || status === 'menunggu_direktur')) return 'completed'
    if (status === `menunggu_${step.statusKey}`) return 'active'
    if (status === `disetujui_${step.statusKey}` || status.includes(`disetujui_${step.statusKey}`)) return 'completed'
    if (status === 'menunggu_pm' || status === 'menunggu_hr' || status === 'menunggu_direktur') {
      return 'pending'
    }
    return 'pending'
  }

  if (status === `menunggu_${step.statusKey}`) return 'active'
  if (status === `disetujui_${step.statusKey}` || status.includes(`disetujui_${step.statusKey}`)) return 'completed'

  const allStatuses = ['pm', 'hr', 'direktur']
  const currentIdx = allStatuses.indexOf(step.statusKey)
  const prevStatuses = allStatuses.slice(0, currentIdx)
  const allPrevApproved = prevStatuses.every(s => status.includes(`disetujui_${s}`) || item[`disetujui_${s}` as keyof OngoingCuti])

  if (allPrevApproved) {
    if (status === `menunggu_${step.statusKey}`) return 'active'
    return 'pending'
  }

  return 'pending'
}

const getStepDate = (item: OngoingCuti, stepIndex: number) => {
  const steps = currentSteps.value
  const step = steps[stepIndex]
  if (!step) return null
  if (stepIndex === 0) return item.tanggal_pengajuan
  if (step.statusKey === 'hr') return item.processed_at_hr
  if (step.statusKey === 'direktur') return item.processed_at_direktur
  return null
}

const getCardBorderColor = (item: OngoingCuti) => {
  if (item.status_sekarang.includes('ditolak')) return 'border-l-red-400'
  return 'border-l-blue-400'
}

const goToEdit = (item: OngoingCuti) => {
  sessionStorage.setItem('editCuti', JSON.stringify({
    id: item.id_log_cuti,
    tanggal_mulai: item.tanggal_mulai,
    tanggal_selesai: item.tanggal_selesai,
    keterangan_cuti: item.keterangan_cuti,
    pengganti: item.id_pengganti,
  }))
  const routeMap: Record<string, string> = {
    karyawan: '/karyawan/pengajuan-cuti',
    pm: '/pm/pengajuan-cuti',
    staff_hr: '/staff_hr/pengajuan-cuti',
    hr: '/hr/pengajuan-cuti',
  }
  router.push(routeMap[userRole.value] || '/karyawan/pengajuan-cuti')
}

onMounted(async () => {
  try {
    const [cutiRes, userRes] = await Promise.allSettled([
      karyawanApi.getOngoingCuti(),
      authApi.me(),
    ])
    if (cutiRes.status === 'fulfilled') {
      ongoingList.value = (cutiRes.value.data || [])
        .filter((item) => !item.status_sekarang.includes('disetujui_hr') && item.status_sekarang !== 'disetujui_direktur')
        .sort((a, b) => 
          new Date(b.tanggal_pengajuan).getTime() - new Date(a.tanggal_pengajuan).getTime()
        )
    }
    if (userRes.status === 'fulfilled') userRole.value = userRes.value.data?.role || 'karyawan'
  } catch (err) {
    showError(err)
    ongoingList.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="bg-blue-50 rounded-xl p-6 mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('statusPage.title') }}</h1>
      <p class="text-sm text-gray-600">
        {{ t('statusPage.subtitle') }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ t('statusPage.activeRequests') }}</h2>

      <div v-if="ongoingList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
        {{ t('statusPage.noActive') }}
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
                getStatusConfig(item.status_sekarang, item).bgColor,
                getStatusConfig(item.status_sekarang, item).color,
                getStatusConfig(item.status_sekarang, item).borderColor
              ]">
                <svg v-if="item.status_sekarang.includes('ditolak')" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ t('statusPage.currentStatus') }}</span>
                <span class="font-semibold">{{ getStatusConfig(item.status_sekarang, item).label }}</span>
              </div>
            </div>

            <!-- Multiple PM Approval Details -->
            <div v-if="item.approval_pm_detail && item.approval_pm_detail.length > 0" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm font-semibold text-blue-800 mb-3">{{ t('status.waitingPM') }}</p>
              <div class="space-y-2">
                <div v-for="(pm, i) in item.approval_pm_detail" :key="i" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center',
                      pm.status === 'disetujui' ? 'bg-green-100' : pm.status === 'ditolak' ? 'bg-red-100' : 'bg-gray-100'
                    ]">
                      <svg v-if="pm.status === 'disetujui'" class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else-if="pm.status === 'ditolak'" class="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span v-else class="text-xs text-gray-500">{{ i + 1 }}</span>
                    </div>
                    <span class="text-sm text-gray-700">{{ pm.nama_pm }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="pm.status === 'disetujui'" class="text-xs text-green-600 font-medium">Disetujui</span>
                    <span v-else-if="pm.status === 'ditolak'" class="text-xs text-red-600 font-medium">Ditolak</span>
                    <span v-else class="text-xs text-gray-400">{{ t('status.waiting') }}</span>
                    <span v-if="pm.processed_at" class="text-[10px] text-gray-400">{{ formatDateShort(pm.processed_at) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="item.alasan_penolakan && item.status_sekarang.includes('ditolak')" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-red-600 mb-1">{{ t('statusPage.rejectionReason') }}</p>
                  <p class="text-sm text-red-600">{{ item.alasan_penolakan }}</p>
                </div>
                <button
                  @click="goToEdit(item)"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-blue-200"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {{ t('leave.editRequest') }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between relative">
              <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div
                class="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all"
                :style="{
                  width: item.status_sekarang.includes('ditolak')
                    ? `${100 / (currentSteps.length * 2)}%`
                    : getStepStatus(item, currentSteps.length - 1) === 'completed'
                      ? '100%'
                      : `${((currentSteps.length - 1) / currentSteps.length) * 100}%`
                }"
              ></div>

              <div
                v-for="(step, stepIndex) in currentSteps"
                :key="stepIndex"
                class="flex flex-col items-center relative z-10"
              >
                <div :class="[
                  'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-4 border-white',
                  getStepStatus(item, stepIndex) === 'completed' ? 'bg-blue-600 text-white' :
                  getStepStatus(item, stepIndex) === 'rejected' ? 'bg-red-500 text-white' :
                  getStepStatus(item, stepIndex) === 'active' ? 'bg-blue-600 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                ]">
                  <svg v-if="getStepStatus(item, stepIndex) === 'completed'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="getStepStatus(item, stepIndex) === 'rejected'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg v-else-if="getStepStatus(item, stepIndex) === 'active'" class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span v-else class="text-xs lg:text-sm font-medium">{{ stepIndex + 1 }}</span>
                </div>
                <p :class="[
                  'text-[10px] lg:text-xs font-medium mt-2 text-center',
                  getStepStatus(item, stepIndex) === 'active' ? 'text-blue-600' :
                  getStepStatus(item, stepIndex) === 'rejected' ? 'text-red-500' :
                  getStepStatus(item, stepIndex) === 'completed' ? 'text-gray-800' : 'text-gray-400'
                ]">
                  {{ getStepStatus(item, stepIndex) === 'completed' && step.statusKey !== 'submitted'
                    ? (step.statusKey === 'selesai' ? t('status.completed') : step.completedLabel)
                    : getStepStatus(item, stepIndex) === 'rejected'
                      ? step.rejectedLabel
                      : step.label }}
                </p>
                <p class="text-[10px] lg:text-xs text-gray-400 text-center">
                  {{ getStepDate(item, stepIndex) ? formatDateShort(getStepDate(item, stepIndex)!) : '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
