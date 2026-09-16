<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authApi } from "../../services/auth.service";
import {
  karyawanApi,
  type OngoingCuti,
  type ActivityItem,
  type RiwayatCuti,
  type RingkasanCuti,
} from "../../services/karyawan.service";
import { holidayApi, type Holiday } from "../../services/holiday.service";
import { getNetworkErrorMessage } from "../../lib/api";
import { useCalendarNames } from "../../composables/useCalendarNames";
import type { CurrentUser } from "../../types";

const { t } = useI18n();
const router = useRouter();
const { monthNamesShort } = useCalendarNames();

const user = ref<CurrentUser | null>(null);
const ringkasan = ref<RingkasanCuti | null>(null);
const ongoingList = ref<OngoingCuti[]>([]);
const riwayatList = ref<RiwayatCuti[]>([]);
const upcomingHolidays = ref<Holiday[]>([]);
const activities = ref<ActivityItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const totalCuti = computed(() => ringkasan.value?.total_cuti ?? user.value?.total_cuti ?? "-");
const sisaCuti = computed(() => ringkasan.value?.sisa_cuti ?? user.value?.sisa_cuti ?? "-");
const terpakai = computed(() => ringkasan.value?.cuti_terpakai ?? "-");

const usedApproved = computed(() => {
  return riwayatList.value
    .filter((item) => item.status === "disetujui")
    .reduce((sum, item) => sum + item.durasi, 0);
});

const usedPending = computed(() => {
  return ongoingList.value
    .filter((item) => item.status_sekarang.includes("menunggu"))
    .reduce((sum, item) => sum + item.durasi, 0);
});

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate();
  return `${day} ${monthNamesShort.value[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDateRange = (start: string, end: string) => {
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    menunggu_pm: t("status.waitingPM"),
    menunggu_hr: t("status.waitingHR"),
    menunggu_direktur: t("status.waitingDirector"),
    disetujui: t("status.approved"),
    ditolak: t("status.rejected"),
  };
  return labels[status] || status;
};

const statusColor = (status: string) => {
  if (status.includes("menunggu")) return "bg-yellow-100 text-yellow-700";
  if (status === "disetujui") return "bg-green-100 text-green-700";
  if (status === "ditolak") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const goToPengajuan = () => {
  router.push("/karyawan/pengajuan-cuti");
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [userRes, ringkasanRes, ongoingRes, riwayatRes, holidayRes, activitiesRes] =
      await Promise.allSettled([
        authApi.me(),
        karyawanApi.getRingkasanCuti(),
        karyawanApi.getOngoingCuti(),
        karyawanApi.getRiwayatCuti(),
        holidayApi.getByYear(new Date().getFullYear()),
        karyawanApi.getActivities(),
      ]);
    if (userRes.status === "fulfilled") user.value = userRes.value.data;
    if (ringkasanRes.status === "fulfilled") ringkasan.value = ringkasanRes.value.data;
    if (ongoingRes.status === "fulfilled")
      ongoingList.value = ongoingRes.value.data || [];
    if (riwayatRes.status === "fulfilled")
      riwayatList.value = riwayatRes.value.data || [];
    if (holidayRes.status === "fulfilled") {
      const today = new Date().toISOString().split("T")[0];
      const holidays = holidayRes.value.data.data || [];
      upcomingHolidays.value = holidays
        .filter((h) => h.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    if (activitiesRes.status === "fulfilled")
      activities.value = activitiesRes.value.data || [];
  } catch (err: any) {
    error.value = getNetworkErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
    >
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          {{ t("dashboard.leaveSummary") }}
        </h1>
        <p class="text-xs lg:text-sm text-gray-500">
          {{ t("dashboard.yearPeriod") }} {{ new Date().getFullYear() }}
        </p>
      </div>
      <button
        @click="goToPengajuan"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
      >
        {{ t("dashboard.createLeave") }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
    >
      <div
        class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg
          class="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <p class="text-gray-600 text-sm mb-4">{{ error }}</p>
      <button
        @click="fetchData"
        class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        {{ t("common.retry") }}
      </button>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          class="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
        >
          <p class="text-xs text-gray-500 uppercase mb-2">
            {{ t("dashboard.totalLeave") }}
          </p>
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-2xl lg:text-3xl font-bold text-gray-800">
              {{ totalCuti }}
            </p>
            <span class="text-sm text-gray-500">{{ t("dashboard.days") }}</span>
          </div>
          <p class="text-[10px] text-gray-400">
            {{ t("dashboard.totalLeaveDescription") }}
          </p>
        </div>

        <div
          class="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
        >
          <p class="text-xs text-gray-500 uppercase mb-2">
            {{ t("dashboard.used") }}
          </p>
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-2xl lg:text-3xl font-bold text-gray-800">
              {{ terpakai }}
            </p>
            <span class="text-sm text-gray-500">{{ t("dashboard.days") }}</span>
          </div>
          <p class="text-[10px] text-gray-400">
            {{ t("dashboard.usedDescription", { count: terpakai }) }}
          </p>
        </div>

        <div
          class="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
        >
          <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {{ t("dashboard.remainingLeave") }}
          </p>
          <div class="flex items-center gap-4 lg:gap-6">
            <div class="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#E5E7EB"
                  stroke-width="8"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="#3B82F6"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="220"
                  :stroke-dashoffset="
                    220 - 220 * (terpakai / (user?.total_cuti || 1))
                  "
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg lg:text-xl font-bold text-gray-800">{{
                  sisaCuti
                }}</span>
              </div>
            </div>
            <div>
              <p class="text-2xl lg:text-3xl font-bold text-gray-800">
                {{ sisaCuti }}
                <span class="text-sm lg:text-base font-normal text-gray-500">{{
                  t("dashboard.days")
                }}</span>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ t("dashboard.remainingFrom") }} {{ user?.total_cuti || "-" }}
                {{ t("dashboard.days") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div class="lg:col-span-2 space-y-4 lg:space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="p-4 lg:p-6 border-b border-gray-100">
              <div class="flex justify-between items-center">
                <h3 class="font-semibold text-gray-800">
                  {{ t("dashboard.processing") }}
                </h3>
              </div>
            </div>
            <div class="p-4 lg:p-6">
              <div
                v-if="ongoingList.length === 0"
                class="text-center text-gray-400 text-sm py-4"
              >
                {{ t("dashboard.noProcessing") }}
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="(item, i) in ongoingList"
                  :key="i"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ item.jenis_cuti }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{
                        formatDateRange(
                          item.tanggal_mulai,
                          item.tanggal_selesai,
                        )
                      }}
                      &bull; {{ item.durasi }} Hari
                    </p>
                    <p
                      v-if="item.keterangan_cuti"
                      class="text-xs text-gray-400 mt-1"
                    >
                      {{ item.keterangan_cuti }}
                    </p>
                  </div>
                  <span
                    :class="[
                      'inline-block text-[10px] px-2.5 py-1 rounded-full font-medium',
                      statusColor(item.status_sekarang),
                    ]"
                  >
                    {{ statusLabel(item.status_sekarang) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
          >
            <h3 class="font-semibold text-gray-800 mb-4">
              {{ t("dashboard.upcomingHolidays") }}
            </h3>
            <div v-if="upcomingHolidays.length > 0" class="space-y-2">
              <div
                v-for="(h, i) in upcomingHolidays"
                :key="i"
                class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
              >
                <div
                  class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ h.name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatDate(h.date) }}</p>
                </div>
                <span
                  :class="[
                    'inline-block text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                    h.is_cuti_bersama
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700',
                  ]"
                >
                  {{
                    h.is_cuti_bersama
                      ? t("leave.collective")
                      : t("leave.nationalHoliday")
                  }}
                </span>
              </div>
            </div>
            <div v-else class="text-center text-gray-400 text-sm">
              {{ t("dashboard.noHolidays") }}
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
        >
          <div class="flex items-center gap-2 mb-4">
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 class="font-semibold text-gray-800">
              {{ t("dashboard.latestActivities") }}
            </h3>
          </div>
          <div
            v-if="activities.length === 0"
            class="text-center text-gray-400 text-sm py-4"
          >
            {{ t("dashboard.noActivities") }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, i) in activities"
              :key="i"
              class="flex items-start gap-3"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  item.jenis_aktivitas === 'pengajuan'
                    ? 'bg-blue-100'
                    : item.jenis_aktivitas === 'disetujui'
                      ? 'bg-green-100'
                      : item.jenis_aktivitas === 'ditolak'
                        ? 'bg-red-100'
                        : 'bg-gray-100',
                ]"
              >
                <svg
                  v-if="item.jenis_aktivitas === 'pengajuan'"
                  class="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <svg
                  v-else-if="item.jenis_aktivitas === 'disetujui'"
                  class="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else-if="item.jenis_aktivitas === 'ditolak'"
                  class="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700">{{ item.keterangan.replace(/\b(\w+)\s+\1\b/gi, '$1') }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ formatDate(item.tanggal) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
