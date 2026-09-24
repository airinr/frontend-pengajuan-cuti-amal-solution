<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  hrApi,
  type RekapPenambahanKerjaItem,
  type LogPenambahanKerjaItem,
} from "../../services/hr.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import { useFormatTanggal } from "../../composables/useFormatTanggal";

const { t } = useI18n();
const { showError } = useErrorPopup();
const { formatTanggal } = useFormatTanggal();

const activeTab = ref<"rekapitulasi" | "log">("rekapitulasi");
const searchQuery = ref("");
const selectedYear = ref(new Date().getFullYear());
const selectedStatus = ref("semua");
const currentPage = ref(1);
const itemsPerPage = 10;

const rekapList = ref<RekapPenambahanKerjaItem[]>([]);
const logList = ref<LogPenambahanKerjaItem[]>([]);
const loading = ref(true);

const years = computed(() => {
  const current = new Date().getFullYear();
  const startYear = 2026;
  return Array.from({ length: current - startYear + 1 }, (_, i) => startYear + i);
});

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const month = months[date.getMonth()];
  return `${day} ${month}`;
};

const filteredRekap = computed(() => {
  return rekapList.value.filter((item) => {
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchSearch;
  });
});

const filteredLog = computed(() => {
  return logList.value
    .filter((item) => {
      const itemYear = new Date(item.tanggal[0]).getFullYear();
      const isPending = item.status.includes("menunggu");
      const matchSearch =
        !searchQuery.value ||
        item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchStatus =
        selectedStatus.value === "semua" ||
        item.status.includes(selectedStatus.value);
      return itemYear === selectedYear.value && !isPending && matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.tanggal_pengajuan).getTime() - new Date(a.tanggal_pengajuan).getTime());
});

const currentData = computed(() => {
  const data =
    activeTab.value === "rekapitulasi"
      ? filteredRekap.value
      : filteredLog.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  return data.slice(start, start + itemsPerPage);
});

const totalItems = computed(() => {
  return activeTab.value === "rekapitulasi"
    ? filteredRekap.value.length
    : filteredLog.value.length;
});

const totalPages = computed(
  () => Math.ceil(totalItems.value / itemsPerPage) || 1,
);

const fetchData = async () => {
  loading.value = true;
  try {
    const [rekapRes, logRes] = await Promise.allSettled([
      hrApi.getRekapPenambahanKerja(),
      hrApi.getLogPenambahanKerja(),
    ]);
    if (rekapRes.status === "fulfilled")
      rekapList.value = rekapRes.value.data || [];
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
  if (tab === "rekapitulasi") searchQuery.value = "";
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

const viewLogForEmployee = (nama: string) => {
  activeTab.value = "log";
  searchQuery.value = nama;
  currentPage.value = 1;
};

const getApprovalPercentage = (item: RekapPenambahanKerjaItem) => {
  if (item.total_pengajuan === 0) return 0;
  return Math.round((item.disetujui / item.total_pengajuan) * 100);
};

const getBarColor = (item: RekapPenambahanKerjaItem) => {
  const pct = getApprovalPercentage(item);
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-blue-500";
};

watch([selectedYear, selectedStatus], () => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
        {{ t("logRekapKerja.title") }}
      </h1>
      <p class="text-sm text-gray-500">{{ t("logRekapKerja.subtitle") }}</p>
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
            {{ t("leaveLog.rekapTab") }}
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
            {{ t("logRekapKerja.logTab") }}
          </button>
        </div>

        <!-- Search -->
        <div class="relative flex-1 max-w-xs">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            :placeholder="t('leaveLog.searchPlaceholder')"
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
        <div
          v-if="activeTab === 'log'"
          class="flex bg-gray-100 rounded-lg p-0.5"
        >
          <button
            @click="selectedStatus = 'semua'"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              selectedStatus === 'semua'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            {{ t("leaveLog.all") }}
          </button>
          <button
            @click="selectedStatus = 'disetujui'"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              selectedStatus === 'disetujui'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            {{ t("leaveLog.approved") }}
          </button>
          <button
            @click="selectedStatus = 'ditolak'"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer',
              selectedStatus === 'ditolak'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            {{ t("leaveLog.rejected") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>

      <template v-else>
        <!-- ========== REKAPITULASI TABLE ========== -->
        <div v-if="activeTab === 'rekapitulasi'" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th
                  class="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.employee") }}
                </th>
                <th
                  class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider max-w-[120px]"
                >
                  {{ t("leaveLog.department") }}
                </th>
                <th
                  class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("logRekapKerja.totalSubmissions") }}
                </th>
                <th
                  class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("logRekapKerja.approved") }}
                </th>
                <th
                  class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("logRekapKerja.rejected") }}
                </th>
                <th
                  class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="currentData.length === 0">
                <td colspan="6" class="text-center py-6 text-gray-400 text-sm">
                  {{ t("leaveLog.noData") }}
                </td>
              </tr>
              <tr
                v-for="(item, index) in currentData"
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-3 py-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-[9px] font-medium"
                    >
                      {{ getInitials(item.nama) }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{
                      item.nama
                    }}</span>
                  </div>
                </td>
                <td
                  class="px-2 py-2 text-xs text-gray-600 max-w-[120px] truncate"
                >
                  {{ item.nama_departemen }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-800 text-center font-medium">
                  {{ item.total_pengajuan }}
                </td>
                <td class="px-3 py-2 text-center">
                  <span class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                    {{ item.disetujui }}
                  </span>
                </td>
                <td class="px-3 py-2 text-center">
                  <span class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                    {{ item.ditolak }}
                  </span>
                </td>
                <td class="px-3 py-2 text-center">
                  <button
                    @click="viewLogForEmployee(item.nama)"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ========== LOG PENGAJUAN KERJA TABLE ========== -->
        <div v-if="activeTab === 'log'" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12"
                >
                  {{ t("leaveLog.no") }}
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.employee") }}
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.submissionDate") }}
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("logRekapKerja.workDate") }}
                </th>
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.duration") }}
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.description") }}
                </th>
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.status") }}
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t("leaveLog.approver") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="currentData.length === 0">
                <td colspan="8" class="text-center py-8 text-gray-400 text-sm">
                  {{ t("leaveLog.noData") }}
                </td>
              </tr>
              <tr
                v-for="(item, index) in currentData as LogPenambahanKerjaItem[]"
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 text-center">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                    >
                      {{ getInitials(item.nama) }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{
                      item.nama
                    }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ formatDateShort(item.tanggal_pengajuan) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ formatTanggal(item.tanggal) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 text-center">
                  {{ item.durasi }} {{ t("leaveLog.days") }}
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate"
                  :title="item.keterangan || '-'"
                >
                  {{ item.keterangan || "-" }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'inline-block text-[10px] px-2.5 py-1 rounded-full font-medium',
                      item.status.includes('disetujui')
                        ? 'bg-green-100 text-green-700'
                        : item.status.includes('ditolak')
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700',
                    ]"
                  >
                    {{
                      item.status.includes("disetujui")
                        ? t("leaveLog.approved")
                        : item.status.includes("ditolak")
                          ? t("leaveLog.rejected")
                          : item.status
                              .replace("menunggu_", t("status.waiting") + " ")
                              .replace("_", " ")
                              .toUpperCase()
                    }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ item.approved_by || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
        >
          <p class="text-xs text-gray-500">
            {{ t("leaveLog.showing") }}
            {{
              currentData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
            }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}
            {{ t("leaveLog.of") }} {{ totalItems }}
            {{
              activeTab === "rekapitulasi"
                ? t("leaveLog.data")
                : t("logRekapKerja.workLogData")
            }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
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
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
