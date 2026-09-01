<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  penambahanKerjaApi,
  type PenambahanKerjaItem,
} from "../../services/penambahanKerja.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { t } = useI18n();
const { showError } = useErrorPopup();

const loading = ref(true);
const statusList = ref<PenambahanKerjaItem[]>([]);

const steps = computed(() => [
  { label: t('status.submitted'), statusKey: "submitted" },
  { label: t('status.waitingPM'), statusKey: "pm" },
  { label: t('status.completed'), statusKey: "selesai" },
]);

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (start === end) {
    return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
    menunggu_pm: { label: "Menunggu PM", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    disetujui_pm: { label: "Disetujui PM", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    disetujui: { label: "Disetujui", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    ditolak_pm: { label: "Ditolak PM", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
  };
  return configs[status] || { label: status, color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
};

const getStepStatus = (item: PenambahanKerjaItem, stepIndex: number) => {
  const status = item.status;
  const step = steps[stepIndex];
  if (!step) return "pending";

  if (status.includes("ditolak")) {
    if (stepIndex === 0) return "completed";
    if (step.statusKey === "pm") return "rejected";
    return "pending";
  }

  if (stepIndex === 0) return "completed";

  if (status === `menunggu_${step.statusKey}`) return "active";
  if (status === `disetujui_${step.statusKey}` || status === "disetujui") return "completed";

  return "pending";
};

const getCardBorderColor = (item: PenambahanKerjaItem) => {
  if (item.status.includes("ditolak")) return "border-l-red-400";
  return "border-l-blue-400";
};

onMounted(async () => {
  try {
    const res = await penambahanKerjaApi.getMyPenambahanKerja();
    statusList.value = res.data || [];
  } catch (err) {
    showError(err);
    statusList.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div class="bg-blue-50 rounded-xl p-6 mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('workStatus.title') }}</h1>
      <p class="text-sm text-gray-600">
        {{ t('workStatus.subtitle') }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else>
      <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ t('workStatus.activeRequests') }}</h2>

      <div
        v-if="statusList.length === 0"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm"
      >
        {{ t('workStatus.noActive') }}
      </div>

      <div v-else class="space-y-4 lg:space-y-6">
        <div
          v-for="(item, index) in statusList"
          :key="index"
          :class="[
            'bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 overflow-hidden',
            getCardBorderColor(item),
          ]"
        >
          <div class="p-4 lg:p-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">CUTI BERSAMA</span>
                  <span class="px-2 py-0.5 bg-blue-100 rounded text-xs font-medium text-blue-700">Kerja</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">{{ item.keterangan_pengajuan }}</h3>
                <div class="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}
                </div>
              </div>

              <div
                :class="[
                  'px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 self-start',
                  getStatusConfig(item.status).bgColor,
                  getStatusConfig(item.status).color,
                  getStatusConfig(item.status).borderColor,
                ]"
              >
                <svg
                  v-if="item.status.includes('ditolak')"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ t('workStatus.currentStatus') }}</span>
                <span class="font-semibold">{{ getStatusConfig(item.status).label }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between relative">
              <div class="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
              <div
                class="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all"
                :style="{
                  width: item.status.includes('ditolak')
                    ? `${100 / (steps.length * 2)}%`
                    : getStepStatus(item, steps.length - 1) === 'completed'
                      ? '100%'
                      : `${((steps.length - 1) / steps.length) * 100}%`,
                }"
              ></div>

              <div
                v-for="(step, stepIndex) in steps"
                :key="stepIndex"
                class="flex flex-col items-center relative z-10"
              >
                <div
                  :class="[
                    'w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-4 border-white',
                    getStepStatus(item, stepIndex) === 'completed'
                      ? 'bg-blue-600 text-white'
                      : getStepStatus(item, stepIndex) === 'rejected'
                        ? 'bg-red-500 text-white'
                        : getStepStatus(item, stepIndex) === 'active'
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-400',
                  ]"
                >
                  <svg
                    v-if="getStepStatus(item, stepIndex) === 'completed'"
                    class="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg
                    v-else-if="getStepStatus(item, stepIndex) === 'rejected'"
                    class="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg
                    v-else-if="getStepStatus(item, stepIndex) === 'active'"
                    class="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span v-else class="text-xs lg:text-sm font-medium">{{ stepIndex + 1 }}</span>
                </div>
                <p
                  :class="[
                    'text-[10px] lg:text-xs font-medium mt-2 text-center',
                    getStepStatus(item, stepIndex) === 'active'
                      ? 'text-blue-600'
                      : getStepStatus(item, stepIndex) === 'rejected'
                        ? 'text-red-500'
                        : getStepStatus(item, stepIndex) === 'completed'
                          ? 'text-gray-800'
                          : 'text-gray-400',
                  ]"
                >
                  {{
                    getStepStatus(item, stepIndex) === "completed" && step.statusKey !== "submitted"
                      ? step.statusKey === "selesai"
                        ? "Selesai"
                        : `Disetujui ${step.label.replace("Menunggu ", "")}`
                      : getStepStatus(item, stepIndex) === "rejected"
                        ? `Ditolak ${step.label.replace("Menunggu ", "")}`
                        : step.label
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
