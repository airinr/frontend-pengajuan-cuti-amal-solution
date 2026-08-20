<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  pmApi,
  type RekapSaldoItem,
  type RekapTimSummary,
} from "../../services/pm.service";

const summary = ref<RekapTimSummary | null>(null);
const allSaldoList = ref<RekapSaldoItem[]>([]);
const saldoList = ref<RekapSaldoItem[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const fetchSummary = async () => {
  try {
    const res = await pmApi.getRekapSummary();
    summary.value = res.data;
  } catch {
    // silent fail
  }
};

const fetchSaldo = async () => {
  try {
    const res = await pmApi.getRekapSaldo();
    allSaldoList.value = res.data || [];
    totalItems.value = allSaldoList.value.length;
    totalPages.value = Math.ceil(totalItems.value / 10) || 1;
    applyPagination();
  } catch {
    // silent fail
  }
};

const applyPagination = () => {
  const start = (currentPage.value - 1) * 10;
  const end = start + 10;
  const filtered = allSaldoList.value.filter((item) => {
    if (!searchQuery.value) return true;
    return item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
  totalItems.value = filtered.length;
  totalPages.value = Math.ceil(filtered.length / 10) || 1;
  saldoList.value = filtered.slice(start, end);
};

const handleSearch = () => {
  currentPage.value = 1;
  applyPagination();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  applyPagination();
};

const getUsagePercentage = (item: RekapSaldoItem) => {
  const total = item.penggunaan_cuti + item.sisa_cuti;
  if (total === 0) return 0;
  return Math.round((item.penggunaan_cuti / total) * 100);
};

const getBarColor = (item: RekapSaldoItem) => {
  const pct = getUsagePercentage(item);
  if (pct >= 80) return "bg-red-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-blue-500";
};

const handleExportCsv = async () => {
  try {
    const res = await pmApi.exportRekapCsv();
    const blob = new Blob([res.data as string], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-cuti-tim-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch {
    // silent fail
  }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchSummary(), fetchSaldo()]);
  loading.value = false;
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Rekap Cuti Tim</h1>
        <p class="text-sm text-gray-500">Ringkasan saldo dan penggunaan cuti untuk seluruh anggota tim.</p>
      </div>
      <button
        @click="handleExportCsv"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer self-start"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Ringkasan Tim</p>
              <p class="text-2xl font-bold text-gray-800">
                {{ summary?.total_anggota_aktif ?? '-' }}
                <span class="text-sm font-normal text-gray-500">Anggota Aktif</span>
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Cuti Digunakan</p>
              <p class="text-2xl font-bold text-gray-800">
                {{ summary?.total_cuti_all ?? '-' }}
                <span class="text-sm font-normal text-gray-500">Hari</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Saldo Karyawan -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-4 lg:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 class="font-semibold text-gray-800">Detail Saldo Karyawan</h3>
          <div class="flex items-center gap-3">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Cari nama karyawan..."
                class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                <th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Departemen</th>
                <th class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Penggunaan Cuti</th>
                <th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Sisa</th>
                <th class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="saldoList.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400 text-sm">Tidak ada data</td>
              </tr>
              <tr
                v-for="(item, index) in saldoList"
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {{ getInitials(item.nama) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ item.nama }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-600">{{ item.nama_departemen }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        :class="['h-full rounded-full', getBarColor(item)]"
                        :style="{ width: `${getUsagePercentage(item)}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-600">{{ item.penggunaan_cuti }} Hari</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-center text-sm font-medium" :class="item.sisa_cuti <= 2 ? 'text-red-600' : 'text-gray-800'">
                  {{ item.sisa_cuti }} Hari
                </td>
                <td class="px-5 py-4 text-center">
                  <span
                    :class="[
                      'inline-block text-[10px] px-2.5 py-1 rounded-full font-medium',
                      item.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                    ]"
                  >
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-500">
            Menampilkan {{ saldoList.length > 0 ? ((currentPage - 1) * 10 + 1) : 0 }}-{{ Math.min(currentPage * 10, totalItems) }} dari {{ totalItems }} karyawan
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
      </div>
    </template>
  </div>
</template>
