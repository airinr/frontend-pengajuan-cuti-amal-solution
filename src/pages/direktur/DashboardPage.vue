<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { hrApi, type ActivityItem } from "../../services/hr.service";

const router = useRouter();

interface DirekturStats {
  total_karyawan: number;
  menunggu_direktur: number;
  cuti_bulan_ini: number;
  cuti_mendatang: number;
}

interface CutiMendatangItem {
  id?: number;
  nama: string;
  jenis_cuti: string;
  departemen: string;
  waktu_teks: string;
  status: string;
}

const stats = ref<DirekturStats>({
  total_karyawan: 30,
  menunggu_direktur: 8,
  cuti_bulan_ini: 3,
  cuti_mendatang: 5,
});

const cutiMendatangList = ref<CutiMendatangItem[]>([
  {
    nama: "Rani Mawar",
    jenis_cuti: "Cuti Tahunan",
    departemen: "Human Resource",
    waktu_teks: "Besok",
    status: "Menunggu",
  },
]);

const activities = ref<ActivityItem[]>([
  {
    id: 1,
    deskripsi: "Budi Santoso disetujui cuti tahunan (2 hari).",
    waktu: "10 menit yang lalu",
    tipe: "approve",
  },
  {
    id: 2,
    deskripsi: "Siti Aminah mengajukan cuti sakit.",
    waktu: "1 jam yang lalu",
    tipe: "reject", // pink/red highlight icon
  },
  {
    id: 3,
    deskripsi: "Andi Wijaya mengubah pengajuan cuti.",
    waktu: "3 jam yang lalu",
    tipe: "submit", // file/edit icon
  },
  {
    id: 4,
    deskripsi: "Sistem memperbarui saldo cuti bulanan.",
    waktu: "Kemarin",
    tipe: "system", // calendar icon
  },
]);

const loading = ref(false);

const goToKalender = () => {
  router.push("/direktur/kalender-libur");
};

const goToSemuaAktivitas = () => {
  router.push("/direktur/log-rekap-cuti");
};

onMounted(async () => {
  try {
    const [statsRes, mendatangRes, activityRes] = await Promise.allSettled([
      hrApi.getDashboardStats(),
      hrApi.getCutiMendatang(),
      hrApi.getRecentActivity(),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.data) {
      stats.value = {
        total_karyawan: statsRes.value.data.total_karyawan ?? 30,
        menunggu_direktur: (statsRes.value.data as any).menunggu_direktur ?? statsRes.value.data.menunggu_hr ?? 8,
        cuti_bulan_ini: statsRes.value.data.cuti_bulan_ini ?? 3,
        cuti_mendatang: statsRes.value.data.cuti_mendatang ?? 5,
      };
    }

    if (mendatangRes.status === "fulfilled" && mendatangRes.value.data && mendatangRes.value.data.length > 0) {
      cutiMendatangList.value = mendatangRes.value.data.map((item) => ({
        nama: item.nama,
        jenis_cuti: item.jenis_cuti || "Cuti Tahunan",
        departemen: item.keterangan || "Human Resource",
        waktu_teks: item.tanggal ? "Mendatang" : "Besok",
        status: item.status || "Menunggu",
      }));
    }

    if (activityRes.status === "fulfilled" && activityRes.value.data && activityRes.value.data.length > 0) {
      activities.value = activityRes.value.data;
    }
  } catch {
    // Gunakan fallback default yang sudah disesuaikan persis dengan rancangan
  }
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
        Dashboard Direktur
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Ringkasan aktivitas cuti dan persetujuan yang membutuhkan perhatian Anda hari ini.
      </p>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      <!-- 1. Total Karyawan -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div>
          <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4">
            TOTAL KARYAWAN
          </p>
        </div>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">
          {{ stats.total_karyawan }}
        </p>
        <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50/40 rounded-full blur-xl pointer-events-none"></div>
      </div>

      <!-- 2. Menunggu Direktur -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div>
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500 shadow-sm">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12v3l2 2" />
            </svg>
          </div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4">
            MENUNGGU DIREKTUR
          </p>
        </div>
        <p class="text-3xl lg:text-4xl font-extrabold text-red-600 mt-1 tracking-tight">
          {{ stats.menunggu_direktur }}
        </p>
        <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-red-50/40 rounded-full blur-xl pointer-events-none"></div>
      </div>

      <!-- 3. Cuti Bulan Ini -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4">
            CUTI BULAN INI
          </p>
        </div>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">
          {{ stats.cuti_bulan_ini }}
        </p>
        <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-50/40 rounded-full blur-xl pointer-events-none"></div>
      </div>

      <!-- 4. Cuti Mendatang -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div>
          <div class="w-12 h-12 bg-[#334155] rounded-xl flex items-center justify-center text-white shadow-sm">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 15l2-2-2-2" />
            </svg>
          </div>
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-4">
            CUTI MENDATANG
          </p>
        </div>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">
          {{ stats.cuti_mendatang }}
        </p>
        <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50/40 rounded-full blur-xl pointer-events-none"></div>
      </div>
    </div>

    <!-- Main Content Section: Cuti Mendatang + Aktivitas Terbaru -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
      <!-- Cuti Karyawan Mendatang (8 Cols) -->
      <div class="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between min-h-[260px]">
        <div>
          <!-- Header Bar -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-50">
            <h2 class="text-base lg:text-lg font-bold text-gray-900">
              Cuti Karyawan Mendatang
            </h2>
            <button
              @click="goToKalender"
              class="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
            >
              Lihat Kalender
            </button>
          </div>

          <!-- Items List -->
          <div class="pt-4 space-y-3">
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
                  {{ item.jenis_cuti }} • {{ item.departemen }}
                </p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <span class="text-xs font-medium text-gray-500">
                  {{ item.waktu_teks }}
                </span>
                <span
                  class="inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold border bg-red-50 text-red-500 border-red-100"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aktivitas Terbaru (5 Cols) -->
      <div class="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <h2 class="text-base lg:text-lg font-bold text-gray-900 mb-5">
          Aktivitas Terbaru
        </h2>

        <!-- Vertical Timeline List -->
        <div class="relative space-y-6 pl-1">
          <!-- Continuous vertical line connecting all items -->
          <div class="absolute left-[19px] top-4 bottom-5 w-[1.5px] bg-gray-100"></div>

          <div
            v-for="activity in activities"
            :key="activity.id"
            class="relative flex items-start gap-3.5 z-10"
          >
            <!-- Timeline Icon -->
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-white',
                activity.tipe === 'approve'
                  ? 'border-blue-100 text-blue-600 bg-blue-50/50'
                  : activity.tipe === 'reject'
                  ? 'border-red-100 text-red-500 bg-red-50/50'
                  : activity.tipe === 'submit'
                  ? 'border-gray-200 text-gray-500 bg-gray-50'
                  : 'border-gray-200 text-gray-500 bg-gray-50'
              ]"
            >
              <!-- Checkmark for approve -->
              <svg v-if="activity.tipe === 'approve'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>

              <!-- Alert/Clipboard for reject or submit -->
              <svg v-else-if="activity.tipe === 'reject'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>

              <!-- Document / edit icon -->
              <svg v-else-if="activity.tipe === 'submit'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>

              <!-- Calendar / system icon -->
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Timeline Content -->
            <div class="flex-1 min-w-0 pt-0.5">
              <p class="text-sm font-semibold text-gray-800 leading-snug">
                {{ activity.deskripsi }}
              </p>
              <p class="text-xs text-gray-400 mt-1 font-medium">
                {{ activity.waktu }}
              </p>
            </div>
          </div>
        </div>

        <!-- Lihat Semua Aktivitas link -->
        <button
          @click="goToSemuaAktivitas"
          class="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 mt-6 pt-3 border-t border-gray-50 cursor-pointer transition-colors"
        >
          Lihat Semua Aktivitas
        </button>
      </div>
    </div>
  </div>
</template>
