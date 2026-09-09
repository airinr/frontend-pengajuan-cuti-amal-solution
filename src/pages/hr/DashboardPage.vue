<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  hrApi,
  type DashboardStats,
  type CutiMendatangItem,
} from "../../services/hr.service";
import {
  karyawanApi,
  type ActivityItem,
} from "../../services/karyawan.service";
import { authApi } from "../../services/auth.service";
import { getNetworkErrorMessage } from "../../lib/api";
import type { CurrentUser } from "../../types";

const { t } = useI18n();
const router = useRouter();

const stats = ref<DashboardStats | null>(null);
const cutiMendatang = ref<CutiMendatangItem[]>([]);
const activities = ref<ActivityItem[]>([]);
const currentUser = ref<CurrentUser | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const filteredCutiMendatang = computed(() =>
  cutiMendatang.value.filter((item) => item.nama !== currentUser.value?.nama)
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return t('greeting.morning');
  if (hour < 18) return t('greeting.afternoon');
  return t('greeting.evening');
});

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]}`;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const goToKalender = () => {
  router.push("/hr/kalender-tim");
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [statsRes, mendatangRes, activityRes, userRes] = await Promise.allSettled([
      hrApi.getDashboardStats(),
      hrApi.getCutiMendatang(),
      karyawanApi.getActivities(),
      authApi.me(),
    ]);
    if (statsRes.status === "fulfilled") stats.value = statsRes.value.data;
    if (mendatangRes.status === "fulfilled")
      cutiMendatang.value = mendatangRes.value.data || [];
    if (activityRes.status === "fulfilled")
      activities.value = activityRes.value.data || [];
    if (userRes.status === "fulfilled")
      currentUser.value = userRes.value.data;
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
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ t('dashboard.title') || 'Dashboard HR' }}</h1>
      <p class="text-sm text-gray-500">
        {{ t('dashboard.leaveSummary') }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else-if="error" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p class="text-gray-600 text-sm mb-4">{{ error }}</p>
      <button @click="fetchData" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        {{ t('common.retry') }}
      </button>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p
                class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium"
              >
                {{ t('dashboard.totalEmployees') }}
              </p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-800">
                {{ stats?.total_karyawan ?? "-" }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100 relative"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-red-600"
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
            </div>
            <div>
                <p
                  class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium"
                >
                  {{ t('status.waiting') }}
                </p>
                <div class="flex items-center gap-2">
                  <p class="text-2xl lg:text-3xl font-bold text-gray-800">
                    {{ stats?.menunggu ?? "-" }}
                  </p>
                  <div
                    v-if="stats && stats.menunggu > 0"
                    class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-3 h-3 text-white"
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
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
            <div>
              <p
                class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium"
              >
                Cuti Bulan Ini
              </p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-800">
                {{ stats?.total_cuti_bulan_ini ?? "-" }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
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
            <div>
              <p
                class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium"
              >
                {{ t('dashboard.upcomingLeave') }}
              </p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-800">
                {{ stats?.total_cuti_bulan_depan ?? "-" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div
          class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div class="p-4 lg:p-6 border-b border-gray-100">
            <div class="flex justify-between items-center">
              <h3 class="font-semibold text-gray-800">
                {{ t('dashboard.teamLeaveUpcoming') }}
              </h3>
              <button
                @click="goToKalender"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {{ t('dashboard.viewCalendar') }}
              </button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <div
              v-if="filteredCutiMendatang.length === 0"
              class="text-center text-gray-400 text-sm py-4"
            >
              {{ t('dashboard.noTeamLeave') }}
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="(item, i) in filteredCutiMendatang"
                :key="i"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{ getInitials(item.nama) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ item.nama }}
                    </p>
                    <p class="text-xs text-gray-500">{{ item.jenis_cuti }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">
                    {{
                      formatDateRange(item.tanggal_mulai, item.tanggal_selesai)
                    }}
                  </p>
                  <span
                    :class="[
                      'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
                      item.status === 'Disetujui'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'Ditolak'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700',
                    ]"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-4 lg:p-6 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">{{ t('dashboard.latestActivities') }}</h3>
          </div>
          <div class="p-4 lg:p-6">
            <div
              v-if="activities.length === 0"
              class="text-center text-gray-400 text-sm py-4"
            >
              {{ t('dashboard.noActivities') }}
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="item in activities.slice(0, 5)"
                :key="item.id"
                class="flex items-start gap-3"
              >
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    item.jenis_aktivitas === 'approve'
                      ? 'bg-green-100'
                      : item.jenis_aktivitas === 'reject'
                        ? 'bg-red-100'
                        : item.jenis_aktivitas === 'submit'
                          ? 'bg-blue-100'
                          : 'bg-gray-100',
                  ]"
                >
                  <svg
                    v-if="item.jenis_aktivitas === 'approve'"
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
                    v-else-if="item.jenis_aktivitas === 'reject'"
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
                    v-else-if="item.jenis_aktivitas === 'submit'"
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
                  <p class="text-sm text-gray-700">{{ item.keterangan }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ item.tanggal }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
