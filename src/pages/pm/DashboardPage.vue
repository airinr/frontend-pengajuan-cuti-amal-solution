<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../../services/auth.service";
import {
  pmApi,
  type DashboardStats,
  type DashboardTimItem,
  type ActivityItem,
} from "../../services/pm.service";
import type { CurrentUser } from "../../types";

const router = useRouter();

const user = ref<CurrentUser | null>(null);
const stats = ref<DashboardStats | null>(null);
const pendingLeaves = ref<DashboardTimItem[]>([]);
const activities = ref<ActivityItem[]>([]);
const loading = ref(true);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 18) return "Selamat Siang";
  return "Selamat Malam";
});

const goToKalender = () => {
  router.push("/pm/kalender-tim");
};

const goToSemuaAktivitas = () => {
  router.push("/pm/rekap-cuti-tim");
};

onMounted(async () => {
  try {
    const userRes = await authApi.me();
    user.value = userRes.data;
  } catch {
    // silent fail
  }

  try {
    const statsRes = await pmApi.getDashboardStats();
    stats.value = statsRes.data;
  } catch {
    // silent fail
  }

  try {
    const pendingRes = await pmApi.getDashboardTim();
    pendingLeaves.value = pendingRes.data || [];
  } catch {
    // silent fail
  }

  try {
    const activityRes = await pmApi.getRecentActivity();
    activities.value = activityRes.data || [];
  } catch {
    // silent fail
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
        {{ greeting }}, Project Manager
      </h1>
      <p class="text-sm text-gray-500">
        Berikut adalah ringkasan tim dan status cuti Anda hari ini.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Sisa Cuti -->
        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100"
        >
          <p
            class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Sisa Cuti
          </p>
          <p class="text-2xl lg:text-3xl font-bold text-gray-800">
            {{ stats?.sisa_cuti ?? "-" }}
            <span class="text-sm font-normal text-gray-500">Hari</span>
          </p>
        </div>

        <!-- Cuti Terpakai -->
        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100"
        >
          <p
            class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Cuti Terpakai
          </p>
          <p class="text-2xl lg:text-3xl font-bold text-gray-800">
            {{ stats?.cuti_terpakai ?? "-" }}
            <span class="text-sm font-normal text-gray-500">Hari</span>
          </p>
        </div>

        <!-- Menunggu -->
        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100 relative"
        >
          <p
            class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Menunggu
          </p>
          <div class="flex items-center gap-2">
            <p class="text-2xl lg:text-3xl font-bold text-gray-800">
              {{ stats?.tim_menunggu_appoval ?? "-" }}
              <span class="text-sm font-normal text-gray-500">Tim</span>
            </p>
            <div
              v-if="stats && stats.tim_menunggu_appoval > 0"
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

        <!-- Rekap Bulan Ini -->
        <div
          class="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100"
        >
          <p
            class="text-[10px] lg:text-xs text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Rekap Bulan Ini
          </p>
          <p class="text-2xl lg:text-3xl font-bold text-gray-800">
            {{ stats?.total_pengajuan_tim ?? "-" }}
            <span class="text-sm font-normal text-gray-500">Pengajuan</span>
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-green-600 font-medium"
              >{{ stats?.total_pengajuan_acc_tim ?? 0 }} Setuju</span
            >
            <span class="text-xs text-red-500 font-medium"
              >{{ stats?.total_pengajuan_decline_tim ?? 0 }} Tolak</span
            >
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <!-- Cuti Anggota Tim Mendatang -->
        <div
          class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div class="p-4 lg:p-6 border-b border-gray-100">
            <div class="flex justify-between items-center">
              <h3 class="font-semibold text-gray-800">
                Cuti Anggota Tim Mendatang
              </h3>
              <button
                @click="goToKalender"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Lihat Kalender
              </button>
            </div>
          </div>
          <div class="p-4 lg:p-6">
            <div
              v-if="pendingLeaves.length === 0"
              class="text-center text-gray-400 text-sm py-4"
            >
              Tidak ada cuti mendatang
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="(item, i) in pendingLeaves"
                :key="i"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{
                      item.nama
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ item.nama }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ item.jenis_cuti }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">
                    {{ item.tanggal_mulai }} - {{ item.tanggal_selesai }}
                  </p>
                  <span
                    :class="[
                      'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
                      item.status === 'menunggu_pm'
                        ? 'bg-yellow-100 text-yellow-700'
                        : item.status === 'disetujui'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'ditolak'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700',
                    ]"
                  >
                    {{ item.status === 'menunggu_pm' ? 'Menunggu' : item.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aktivitas Terbaru -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-4 lg:p-6 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Aktivitas Terbaru</h3>
          </div>
          <div class="p-4 lg:p-6">
            <div
              v-if="activities.length === 0"
              class="text-center text-gray-400 text-sm py-4"
            >
              Belum ada aktivitas
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
                    item.tipe === 'approve'
                      ? 'bg-green-100'
                      : item.tipe === 'reject'
                        ? 'bg-red-100'
                        : item.tipe === 'submit'
                          ? 'bg-blue-100'
                          : 'bg-gray-100',
                  ]"
                >
                  <svg
                    v-if="item.tipe === 'approve'"
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
                    v-else-if="item.tipe === 'reject'"
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
                    v-else-if="item.tipe === 'submit'"
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
                  <p class="text-sm text-gray-700">{{ item.deskripsi }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ item.waktu }}</p>
                </div>
              </div>
            </div>
            <button
              v-if="activities.length > 0"
              @click="goToSemuaAktivitas"
              class="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium text-center cursor-pointer"
            >
              Lihat Semua Aktivitas
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
