<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { direkturApi } from "../../services/direktur.service";
import {
  karyawanApi,
  type ActivityItem,
} from "../../services/karyawan.service";
import { getNetworkErrorMessage } from "../../lib/api";

const { t } = useI18n();
const router = useRouter();

interface DirekturStats {
  total_karyawan: number;
  menunggu: number;
  total_cuti_bulan_ini: number;
  total_cuti_bulan_depan: number;
}

interface CutiMendatangItem {
  nama: string;
  jenis_cuti: string;
  departemen: string;
  waktu_teks: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
}

const stats = ref<DirekturStats>({
  total_karyawan: 0,
  menunggu: 0,
  total_cuti_bulan_ini: 0,
  total_cuti_bulan_depan: 0,
});

const cutiMendatangList = ref<CutiMendatangItem[]>([]);
const activities = ref<ActivityItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const goToKalender = () => {
  router.push("/direktur/kalender-tim");
};

const goToSemuaAktivitas = () => {
  router.push("/direktur/log-rekap-cuti");
};

const formatDateRange = (start: string, end?: string) => {
  if (!start) return "Mendatang";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const formatFull = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const s = new Date(start);
  if (!end) return formatFull(s);
  const e = new Date(end);
  return `${formatFull(s)} - ${formatFull(e)}`;
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [statsRes, mendatangRes, activityRes] = await Promise.allSettled([
      direkturApi.getDashboardStats(),
      direkturApi.getCutiMendatang(),
      karyawanApi.getActivities(),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.data) {
      stats.value = {
        total_karyawan: statsRes.value.data.total_karyawan ?? 0,
        menunggu: statsRes.value.data.menunggu ?? 0,
        total_cuti_bulan_ini: statsRes.value.data.total_cuti_bulan_ini ?? 0,
        total_cuti_bulan_depan: statsRes.value.data.total_cuti_bulan_depan ?? 0,
      };
    }

    if (
      mendatangRes.status === "fulfilled" &&
      Array.isArray(mendatangRes.value.data)
    ) {
      cutiMendatangList.value = mendatangRes.value.data.map((item: any) => ({
        nama: item.nama,
        jenis_cuti: item.jenis_cuti || "Cuti Tahunan",
        departemen: item.keterangan || "General",
        waktu_teks: item.tanggal_mulai
          ? formatDateRange(item.tanggal_mulai, item.tanggal_selesai || item.tanggal_mulai)
          : "Mendatang",
        tanggal_mulai: item.tanggal_mulai || "",
        tanggal_selesai: item.tanggal_selesai || item.tanggal_mulai || "",
        status: item.status || "Menunggu",
      }));
    }

    if (
      activityRes.status === "fulfilled" &&
      Array.isArray(activityRes.value.data)
    ) {
      activities.value = activityRes.value.data;
    }
  } catch (err: any) {
    error.value = getNetworkErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
        {{ t("dashboard.title") }} Direktur
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        {{ t("dashboard.leaveSummary") }}
      </p>
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
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
      >
        <div
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div>
            <div
              class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p
              class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4"
            >
              {{ t("dashboard.totalEmployees") }}
            </p>
          </div>
          <p
            class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight"
          >
            {{ stats.total_karyawan }}
          </p>
          <div
            class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50/40 rounded-full blur-xl pointer-events-none"
          ></div>
        </div>

        <div
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div>
            <div
              class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500 shadow-sm"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 12v3l2 2"
                />
              </svg>
            </div>
            <p
              class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4"
            >
              {{ t("status.waiting") }}
            </p>
          </div>
          <p
            class="text-3xl lg:text-4xl font-extrabold text-red-600 mt-1 tracking-tight"
          >
            {{ stats.menunggu }}
          </p>
          <div
            class="absolute -right-4 -bottom-4 w-20 h-20 bg-red-50/40 rounded-full blur-xl pointer-events-none"
          ></div>
        </div>

        <div
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p
              class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4"
            >
              CUTI BULAN INI
            </p>
          </div>
          <p
            class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight"
          >
            {{ stats.total_cuti_bulan_ini }}
          </p>
          <div
            class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50/40 rounded-full blur-xl pointer-events-none"
          ></div>
        </div>

        <div
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div>
            <div
              class="w-12 h-12 bg-[#334155] rounded-xl flex items-center justify-center text-white shadow-sm"
            >
              <svg
                class="w-6 h-6"
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
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 15l2-2-2-2"
                />
              </svg>
            </div>
            <p
              class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4"
            >
              {{ t("dashboard.upcomingLeave") }}
            </p>
          </div>
          <p
            class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight"
          >
            {{ stats.total_cuti_bulan_depan }}
          </p>
          <div
            class="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50/40 rounded-full blur-xl pointer-events-none"
          ></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div
          class="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between min-h-[260px]"
        >
          <div>
            <div
              class="flex items-center justify-between pb-4 border-b border-gray-50"
            >
              <h2 class="text-base lg:text-lg font-bold text-gray-900">
                {{ t("dashboard.teamLeaveUpcoming") }}
              </h2>
              <button
                @click="goToKalender"
                class="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              >
                {{ t("dashboard.viewCalendar") }}
              </button>
            </div>
            <div
              v-if="cutiMendatangList.length === 0"
              class="py-10 text-center text-gray-400 text-xs font-medium"
            >
              {{ t("dashboard.noTeamLeave") }}
            </div>
            <div v-else class="pt-4 space-y-3">
              <div
                v-for="(item, index) in cutiMendatangList"
                :key="index"
                class="flex items-center justify-between py-2"
              >
                <div>
                  <p class="text-sm font-bold text-gray-900 leading-snug">
                    {{ item.nama }}
                  </p>
                  <p class="text-xs text-gray-400 font-medium mt-0.5">
                    {{ item.jenis_cuti }}
                  </p>
                  <p class="text-xs text-gray-400 font-medium mt-0.5">
                    {{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}
                  </p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span
                    class="inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold border bg-blue-50 text-blue-600 border-blue-100"
                    >{{ item.status }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
        >
          <h2 class="text-base lg:text-lg font-bold text-gray-900 mb-5">
            {{ t("dashboard.latestActivities") }}
          </h2>
          <div
            v-if="activities.length === 0"
            class="py-10 text-center text-gray-400 text-xs font-medium"
          >
            {{ t("dashboard.noActivities") }}
          </div>
          <div v-else class="relative space-y-6 pl-1">
            <div
              class="absolute left-[19px] top-4 bottom-5 w-[1.5px] bg-gray-100"
            ></div>
            <div
              v-for="(activity, index) in activities.slice(0, 5)"
              :key="index"
              class="relative flex items-start gap-3.5 z-10"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-white',
                  activity.jenis_aktivitas === 'approve'
                    ? 'border-blue-100 text-blue-600 bg-blue-50/50'
                    : activity.jenis_aktivitas === 'reject'
                      ? 'border-red-100 text-red-500 bg-red-50/50'
                      : 'border-gray-200 text-gray-500 bg-gray-50',
                ]"
              >
                <svg
                  v-if="activity.jenis_aktivitas === 'approve'"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else-if="activity.jenis_aktivitas === 'reject'"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z"
                  />
                </svg>
                <svg
                  v-else-if="activity.jenis_aktivitas === 'submit'"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4"
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
              <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-semibold text-gray-800 leading-snug">
                  {{ activity.keterangan }}
                </p>
                <p class="text-xs text-gray-400 mt-1 font-medium">
                  {{ activity.tanggal }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
