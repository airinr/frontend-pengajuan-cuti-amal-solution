<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  direkturApi,
  type RekapItem,
  type LogCutiItem,
} from "../../services/direktur.service";
import { authApi } from "../../services/auth.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { showError } = useErrorPopup();

const activeTab = ref<"rekapitulasi" | "log">("rekapitulasi");
const searchQuery = ref("");
const selectedYear = ref(new Date().getFullYear());
const selectedStatus = ref("semua");
const currentPage = ref(1);
const itemsPerPage = 10;

const rekapList = ref<RekapItem[]>([]);
const logList = ref<LogCutiItem[]>([]);
const loading = ref(true);
const userRole = ref("");
const exporting = ref(false);

const years = computed(() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - i);
});

const formatDateRange = (start: string, end: string) => {
  if (!start) return "-";
  const s = new Date(start);
  const e = new Date(end || start);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [rekapRes, logRes] = await Promise.allSettled([
      direkturApi.getRekap(),
      direkturApi.getLogCuti(),
    ]);
    if (rekapRes.status === "fulfilled" && Array.isArray(rekapRes.value.data)) {
      rekapList.value = rekapRes.value.data;
    }
    if (logRes.status === "fulfilled" && Array.isArray(logRes.value.data)) {
      logList.value = logRes.value.data;
    }
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const filteredRekap = computed(() => {
  return rekapList.value.filter((item) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(q) ||
      item.nama_departemen.toLowerCase().includes(q);
    return matchSearch;
  });
});

const filteredLog = computed(() => {
  return logList.value.filter((item) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(q) ||
      (item.pengganti && item.pengganti.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q));
    const matchStatus =
      selectedStatus.value === "semua" ||
      item.status.includes(selectedStatus.value);
    return matchSearch && matchStatus;
  });
});

const currentData = computed(() => {
  const data = activeTab.value === "rekapitulasi" ? filteredRekap.value : filteredLog.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  return data.slice(start, start + itemsPerPage);
});

const totalItems = computed(() => {
  return activeTab.value === "rekapitulasi" ? filteredRekap.value.length : filteredLog.value.length;
});

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage) || 1);

const switchTab = (tab: "rekapitulasi" | "log") => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

watch([selectedYear, selectedStatus], () => {
  currentPage.value = 1;
});

const canExport = computed(() => userRole.value === "hr" || userRole.value === "direktur");

const exportRekapCsv = async () => {
  exporting.value = true;
  try {
    const res = await direkturApi.exportCuti(selectedYear.value);
    const blob = new Blob([res.data as BlobPart], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekapitulasi-cuti-${selectedYear.value}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(err);
  } finally {
    exporting.value = false;
  }
};

const exportLogCsv = async () => {
  exporting.value = true;
  try {
    const res = await direkturApi.exportCuti(selectedYear.value);
    const blob = new Blob([res.data as BlobPart], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `log-cuti-${selectedYear.value}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showError(err);
  } finally {
    exporting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await fetchData();
    const userRes = await authApi.me().catch(() => null);
    if (userRes?.data) userRole.value = userRes.data.role || "";
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
        Log & Rekapitulasi Cuti
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Laporan historis dan statistik penggunaan cuti karyawan.
      </p>
    </div>

    <!-- Filter Bar Card -->
    <div class="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
        <!-- Left: Segmented Switcher -->
        <div class="flex bg-[#e8eef9] p-1 rounded-xl shrink-0">
          <button
            @click="switchTab('rekapitulasi')"
            :class="[
              'px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
              activeTab === 'rekapitulasi'
                ? 'bg-[#0f4bb4] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            Rekapitulasi
          </button>
          <button
            @click="switchTab('log')"
            :class="[
              'px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
              activeTab === 'log'
                ? 'bg-[#0f4bb4] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            Log Cuti
          </button>
        </div>

        <!-- Center: Search Input -->
        <div class="relative flex-1 max-w-md w-full">
          <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari karyawan..."
            class="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white outline-none"
          />
        </div>

        <!-- Center Right: Year Dropdown -->
        <div>
          <select
            v-model="selectedYear"
            class="px-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#0f4bb4] outline-none cursor-pointer"
          >
            <option v-for="yr in years" :key="yr" :value="yr">
              {{ yr }}
            </option>
          </select>
        </div>

        <!-- Right: Status Filter Pills -->
        <div class="flex items-center gap-2">
          <button
            @click="selectedStatus = 'semua'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              selectedStatus === 'semua'
                ? 'bg-[#0f4bb4] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
          >
            Semua
          </button>
          <button
            @click="selectedStatus = 'disetujui'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              selectedStatus === 'disetujui'
                ? 'bg-[#0f4bb4] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
          >
            Disetujui
          </button>
          <button
            @click="selectedStatus = 'ditolak'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              selectedStatus === 'ditolak'
                ? 'bg-[#0f4bb4] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
          >
            Ditolak
          </button>

          <!-- Export CSV Button -->
          <button
            v-if="canExport"
            @click="activeTab === 'rekapitulasi' ? exportRekapCsv() : exportLogCsv()"
            :disabled="exporting"
            class="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg v-if="!exporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ exporting ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading Indicator -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4bb4]"></div>
      </div>

      <template v-else>
        <!-- Rekapitulasi Table -->
        <div v-if="activeTab === 'rekapitulasi'" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              <tr>
                <th class="py-3.5 px-6">NO</th>
                <th class="py-3.5 px-6">KARYAWAN</th>
                <th class="py-3.5 px-6">DEPARTEMEN</th>
                <th class="py-3.5 px-6">TANGGAL</th>
                <th class="py-3.5 px-6 text-center">TOTAL CUTI/TAHUN (HARI)</th>
                <th class="py-3.5 px-6 text-center">SISA CUTI (HARI)</th>
              </tr>
            </thead>
            <tbody v-if="currentData.length === 0">
              <tr>
                <td colspan="6" class="py-12 text-center text-gray-400 text-xs">
                  Tidak ada data rekapitulasi cuti yang ditemukan.
                </td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-gray-50 font-medium text-gray-700">
              <tr v-for="(row, idx) in (currentData as RekapItem[])" :key="idx" class="hover:bg-gray-50/60 transition-colors">
                <td class="py-4 px-6">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td class="py-4 px-6 font-bold text-gray-900 leading-tight">
                  {{ row.nama }}
                </td>
                <td class="py-4 px-6 text-gray-600">{{ row.nama_departemen || '-' }}</td>
                <td class="py-4 px-6 text-gray-600">{{ formatDateRange(row.tanggal_mulai, row.tanggal_selesai) }}</td>
                <td class="py-4 px-6 text-center font-semibold text-gray-800">{{ row.total_cuti }}</td>
                <td class="py-4 px-6 text-center font-bold text-gray-900">{{ row.sisa_cuti }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Log Cuti Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              <tr>
                <th class="py-3.5 px-6">NO.</th>
                <th class="py-3.5 px-6">KARYAWAN</th>
                <th class="py-3.5 px-6">TANGGAL CUTI</th>
                <th class="py-3.5 px-6">DURASI</th>
                <th class="py-3.5 px-6">JENIS CUTI</th>
                <th class="py-3.5 px-6">KETERANGAN</th>
                <th class="py-3.5 px-6">PENGGANTI</th>
                <th class="py-3.5 px-6">STATUS</th>
                <th class="py-3.5 px-6">HR/APPROVER</th>
              </tr>
            </thead>
            <tbody v-if="currentData.length === 0">
              <tr>
                <td colspan="9" class="py-12 text-center text-gray-400 text-xs">
                  Tidak ada data log cuti yang ditemukan.
                </td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-gray-50 font-medium text-gray-700">
              <tr v-for="(item, idx) in (currentData as LogCutiItem[])" :key="idx" class="hover:bg-gray-50/60 transition-colors">
                <td class="py-4 px-6">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td class="py-4 px-6 font-bold text-gray-900 leading-tight">
                  {{ item.nama }}
                </td>
                <td class="py-4 px-6 text-gray-600">
                  {{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}
                </td>
                <td class="py-4 px-6 text-gray-900 font-semibold">{{ item.durasi }} Hari</td>
                <td class="py-4 px-6 text-gray-600">{{ item.jenis_cuti }}</td>
                <td class="py-4 px-6 text-gray-600 max-w-[200px] truncate">{{ item.keterangan || '-' }}</td>
                <td class="py-4 px-6 text-gray-600">{{ item.pengganti || '-' }}</td>
                <td class="py-4 px-6">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold',
                      item.status.includes('disetujui')
                        ? 'bg-[#dbeafe] text-[#0f4bb4]'
                        : item.status.includes('ditolak')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700',
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        item.status.includes('disetujui') ? 'bg-[#0f4bb4]' : item.status.includes('ditolak') ? 'bg-red-500' : 'bg-yellow-500',
                      ]"
                    ></span>
                    {{ item.status.includes('disetujui') ? 'Disetujui' : item.status.includes('ditolak') ? 'Ditolak' : item.status.replace('menunggu_', 'Menunggu ').replace('_', ' ').toUpperCase() }}
                  </span>
                </td>
                <td class="py-4 px-6 text-gray-600">{{ item.hr_approved_by || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Pagination -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <p>
            Menampilkan {{ totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} dari {{ totalItems }} {{ activeTab === 'log' ? 'log cuti' : 'data rekapitulasi' }}
          </p>
          <div v-if="totalPages > 1" class="flex items-center gap-1.5">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer',
                currentPage === page
                  ? 'bg-[#0f4bb4] text-white shadow-sm'
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
