<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  hrApi,
  type RekapItem,
  type LogCutiItem,
} from "../../services/hr.service";
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
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
};

const filteredRekap = computed(() => {
  return rekapList.value.filter((item) => {
    const matchSearch = !searchQuery.value || item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchSearch;
  });
});

const filteredLog = computed(() => {
  return logList.value.filter((item) => {
    const matchSearch = !searchQuery.value || item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = selectedStatus.value === "semua" || item.status.includes(selectedStatus.value);
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

const fetchData = async () => {
  loading.value = true;
  try {
    const [rekapRes, logRes] = await Promise.allSettled([
      hrApi.getRekap(),
      hrApi.getLogCuti(),
    ]);
    if (rekapRes.status === "fulfilled") rekapList.value = rekapRes.value.data || [];
    if (logRes.status === "fulfilled") logList.value = logRes.value.data || [];
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const switchTab = (tab: "rekapitulasi" | "log") => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

watch([selectedYear, selectedStatus], () => {
  currentPage.value = 1;
});

const exportRekapCsv = async () => {
  exporting.value = true;
  try {
    const res = await hrApi.exportCuti(selectedYear.value);
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
    const res = await hrApi.exportCuti(selectedYear.value);
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

const canExport = computed(() => userRole.value === "hr" || userRole.value === "direktur");

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
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Log & Rekapitulasi Cuti</h1>
      <p class="text-sm text-gray-500">Laporan historis dan statistik penggunaan cuti karyawan.</p>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <!-- Tab Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-0.5">
          <button
            @click="switchTab('rekapitulasi')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === 'rekapitulasi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Rekapitulasi
          </button>
          <button
            @click="switchTab('log')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === 'log'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Log Cuti
          </button>
        </div>

        <!-- Search -->
        <div class="relative flex-1 max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Cari karyawan..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Year Filter -->
        <select
          v-model="selectedYear"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>

        <!-- Status Filter (hanya untuk Log tab) -->
        <div v-if="activeTab === 'log'" class="flex bg-gray-100 rounded-lg p-0.5">
          <button
            @click="selectedStatus = 'semua'"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              selectedStatus === 'semua' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Semua
          </button>
          <button
            @click="selectedStatus = 'disetujui'"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              selectedStatus === 'disetujui' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Disetujui
          </button>
          <button
            @click="selectedStatus = 'ditolak'"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              selectedStatus === 'ditolak' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Ditolak
          </button>
        </div>

        <!-- Export CSV Button -->
        <button
          v-if="canExport"
          @click="activeTab === 'rekapitulasi' ? exportRekapCsv() : exportLogCsv()"
          :disabled="exporting"
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
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

    <!-- Content -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <template v-else>
        <!-- ========== REKAPITULASI TABLE ========== -->
        <div v-if="activeTab === 'rekapitulasi'" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">No.</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Departemen</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Cuti/Tahun (Hari)</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sisa Cuti (Hari)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="currentData.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-400 text-sm">Tidak ada data</td>
              </tr>
              <tr
                v-for="(item, index) in currentData"
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                      {{ getInitials(item.nama) }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{ item.nama }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.nama_departemen }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.total_cuti }}</td>
                <td class="px-4 py-3 text-sm font-medium text-center" :class="item.sisa_cuti <= 2 ? 'text-red-600' : 'text-gray-800'">
                  {{ item.sisa_cuti }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ========== LOG CUTI TABLE ========== -->
        <div v-if="activeTab === 'log'" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">No.</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tanggal Cuti</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Durasi</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Jenis Cuti</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pengganti</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">HR/Approver</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="currentData.length === 0">
                <td colspan="9" class="text-center py-8 text-gray-400 text-sm">Tidak ada data</td>
              </tr>
              <tr
                v-for="(item, index) in (currentData as LogCutiItem[])"
                :key="item.id_log_cuti"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 text-center">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                      {{ getInitials(item.nama) }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{ item.nama }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.durasi }} Hari</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.jenis_cuti }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{{ item.keterangan || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.pengganti || '-' }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'inline-block text-[10px] px-2.5 py-1 rounded-full font-medium',
                      item.status.includes('disetujui') ? 'bg-green-100 text-green-700' :
                      item.status.includes('ditolak') ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700',
                    ]"
                  >
                    {{ item.status.includes('disetujui') ? 'Disetujui' : item.status.includes('ditolak') ? 'Ditolak' : item.status.replace('menunggu_', 'Menunggu ').replace('_', ' ').toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.hr_approved_by || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-500">
            Menampilkan {{ currentData.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} dari {{ totalItems }} {{ activeTab === 'rekapitulasi' ? 'data' : 'log cuti' }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
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
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
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
