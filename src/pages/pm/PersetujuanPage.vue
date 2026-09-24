<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  pmApi,
  type HistoryCutiItem,
  type RingkasanTim,
} from "../../services/pm.service";
import { approvalApi, type ApprovalQueueItem } from "../../services/approval.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import { useCalendarNames } from "../../composables/useCalendarNames";
import { useFormatTanggal } from "../../composables/useFormatTanggal";

const { t, locale } = useI18n();
const { showError } = useErrorPopup();
const { monthNamesShort } = useCalendarNames();
const { formatTanggal } = useFormatTanggal();

const activeTab = ref<"menunggu" | "riwayat">("menunggu");
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

const pendingList = ref<ApprovalQueueItem[]>([]);
const allHistoryList = ref<HistoryCutiItem[]>([]);
const historyList = ref<HistoryCutiItem[]>([]);
const ringkasan = ref<RingkasanTim | null>(null);
const loading = ref(true);

const processingId = ref<number | null>(null);

const showApproveModal = ref(false);
const approveTarget = ref<ApprovalQueueItem | null>(null);

const showRejectModal = ref(false);
const rejectTarget = ref<ApprovalQueueItem | null>(null);
const rejectAlasan = ref("");
const rejectLoading = ref(false);
const showApproveSuccessPopup = ref(false);
const showRejectSuccessPopup = ref(false);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate();
  return `${day} ${monthNamesShort.value[d.getMonth()]} ${d.getFullYear()}`;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const fetchPending = async () => {
  try {
    const [pendingRes, ringkasanRes] = await Promise.allSettled([
      approvalApi.getApprovalQueue(),
      pmApi.getRingkasanTim(),
    ]);
    if (pendingRes.status === "fulfilled") pendingList.value = pendingRes.value.data || [];
    if (ringkasanRes.status === "fulfilled") ringkasan.value = ringkasanRes.value.data;
  } catch (err) {
    showError(err);
  }
};

const fetchHistory = async () => {
  try {
    const res = await pmApi.getHistoryCutiTim();
    allHistoryList.value = res.data || [];
    totalItems.value = allHistoryList.value.length;
    totalPages.value = Math.ceil(totalItems.value / 10) || 1;
    applyPagination();
  } catch (err) {
    showError(err);
  }
};

const applyPagination = () => {
  const start = (currentPage.value - 1) * 10;
  const end = start + 10;
  const filtered = allHistoryList.value.filter((item) => {
    const statusMatch = item.status === 'Disetujui' || item.status === 'disetujui_hr';
    if (!searchQuery.value) return statusMatch;
    const q = searchQuery.value.toLowerCase();
    return statusMatch && (
      item.nama.toLowerCase().includes(q) ||
      item.jenis_cuti.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q)
    );
  });
  totalItems.value = filtered.length;
  totalPages.value = Math.ceil(filtered.length / 10) || 1;
  historyList.value = filtered.slice(start, end);
};

const openApproveModal = (item: ApprovalQueueItem) => {
  approveTarget.value = item;
  showApproveModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  approveTarget.value = null;
};

const handleApprove = async () => {
  if (!approveTarget.value) return;
  const id = approveTarget.value.id_log_cuti;
  processingId.value = id;
  try {
    await approvalApi.approve(id);
    pendingList.value = pendingList.value.filter((item) => item.id_log_cuti !== id);
    if (ringkasan.value) {
      ringkasan.value.menunggu_persetujuan = Math.max(0, ringkasan.value.menunggu_persetujuan - 1);
    }
    closeApproveModal();
    showApproveSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const handleReject = async () => {
  if (!rejectTarget.value || !rejectAlasan.value.trim()) return;
  rejectLoading.value = true;
  processingId.value = rejectTarget.value.id_log_cuti;
  try {
    await approvalApi.reject(rejectTarget.value.id_log_cuti, rejectAlasan.value);
    pendingList.value = pendingList.value.filter((item) => item.id_log_cuti !== rejectTarget.value!.id_log_cuti);
    if (ringkasan.value) {
      ringkasan.value.menunggu_persetujuan = Math.max(0, ringkasan.value.menunggu_persetujuan - 1);
    }
    closeRejectModal();
    showRejectSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    rejectLoading.value = false;
    processingId.value = null;
  }
};

const openRejectModal = (item: ApprovalQueueItem) => {
  rejectTarget.value = item;
  rejectAlasan.value = "";
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectTarget.value = null;
  rejectAlasan.value = "";
};

const switchTab = (tab: "menunggu" | "riwayat") => {
  activeTab.value = tab;
  if (tab === "riwayat") {
    currentPage.value = 1;
    fetchHistory();
  }
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

onMounted(async () => {
  loading.value = true;
  await fetchPending();
  loading.value = false;
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          {{ activeTab === 'menunggu' ? t('approval.leaveApproval') : t('approval.history') }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ activeTab === 'menunggu'
            ? t('approval.manageTeamLeave')
            : t('approval.manageProcessed')
          }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Filter Periode -->
        <div class="relative">
          <select class="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>{{ t('approval.allPeriods') }}</option>
            <option>{{ t('approval.thisMonth') }}</option>
            <option>{{ t('approval.last3Months') }}</option>
          </select>
          <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <!-- Toggle Tabs -->
        <div class="flex bg-gray-100 rounded-lg p-0.5">
          <button
            @click="switchTab('menunggu')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === 'menunggu'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            {{ t('approval.waiting') }}
          </button>
          <button
            @click="switchTab('riwayat')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === 'riwayat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            {{ t('approval.historyTab') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <!-- ==================== VIEW MENUNGGU ==================== -->
      <template v-if="activeTab === 'menunggu'">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left: Pending Cards -->
          <div class="flex-1 space-y-4">
            <div v-if="pendingList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
              {{ t('approval.noPending') }}
            </div>

            <div
              v-for="item in pendingList"
              :key="item.id_log_cuti"
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <!-- Red left border -->
              <div class="flex">
                <div class="w-1 bg-red-500 flex-shrink-0"></div>
                <div class="flex-1 p-4 lg:p-5">
                  <!-- Header: Avatar + Name + Status -->
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {{ getInitials(item.nama) }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-800">{{ item.nama }}</p>
                        <p class="text-xs text-gray-500">{{ item.nama_departemen }}</p>
                      </div>
                    </div>
                    <span class="flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
                      <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      {{ t('status.pending').toUpperCase() }}
                    </span>
                  </div>

                  <!-- Info Grid -->
                  <div class="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.jenisCuti') }}</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.jenis_cuti }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.dateRange') }}</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ formatTanggal(item.tanggal) }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.duration') }}</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.durasi }} {{ t('history.days') }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.delegasiTugas') }}</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.pengganti || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.remainingLeave') }}</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.sisa_cuti }}</p>
                    </div>
                  </div>

                  <!-- Alasan -->
                  <div class="mb-4">
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-1">{{ t('approval.leaveReason') }}</p>
                    <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{{ item.alasan || '-' }}</p>
                  </div>

                  <!-- PM Approval Details -->
                  <div v-if="item.approval_pm_detail && item.approval_pm_detail.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-xs font-semibold text-blue-800 mb-2">
                      {{ t('status.approvalPM') }}
                      <span v-if="item.approval_pm_detail.length > 1" class="font-normal">
                        ({{ item.approval_pm_detail.filter(pm => pm.status === 'disetujui').length }}/{{ item.approval_pm_detail.length }})
                      </span>
                    </p>
                    <div class="space-y-1.5">
                      <div v-for="(pm, i) in item.approval_pm_detail" :key="i" class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div :class="[
                            'w-5 h-5 rounded-full flex items-center justify-center',
                            pm.status === 'disetujui' ? 'bg-green-100' : pm.status === 'ditolak' ? 'bg-red-100' : 'bg-gray-100'
                          ]">
                            <svg v-if="pm.status === 'disetujui'" class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <svg v-else-if="pm.status === 'ditolak'" class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span v-else class="text-[10px] text-gray-500">{{ i + 1 }}</span>
                          </div>
                          <span class="text-xs text-gray-700">{{ pm.nama_pm }}</span>
                        </div>
                        <span :class="[
                          'text-[10px] font-medium',
                          pm.status === 'disetujui' ? 'text-green-600' : pm.status === 'ditolak' ? 'text-red-600' : 'text-gray-400'
                        ]">
                          {{ pm.status === 'disetujui' ? t('status.approved') : pm.status === 'ditolak' ? t('status.rejected') : t('status.waiting') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="openRejectModal(item)"
                      :disabled="processingId === item.id_log_cuti"
                      class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {{ t('approval.reject') }}
                    </button>
                    <button
                      @click="openApproveModal(item)"
                      :disabled="processingId === item.id_log_cuti"
                      class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ t('approval.approve') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="w-full lg:w-72 flex flex-col gap-4">
            <!-- Ringkasan Tim -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 class="text-sm font-bold text-gray-800 mb-1">{{ t('approval.summary') }}</h3>
              <p class="text-xs text-gray-400 mb-4">{{ t('approval.month') }} {{ new Date().toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' }) }}</p>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{{ t('approval.totalSubmissions') }}</span>
                  <span class="text-lg font-bold text-gray-800">{{ ringkasan?.total_pengajuan ?? '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{{ t('approval.waitingApproval') }}</span>
                  <span class="text-lg font-bold text-gray-800">{{ ringkasan?.menunggu_persetujuan ?? '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{{ t('approval.onLeave') }}</span>
                  <span class="text-lg font-bold text-gray-800">{{ ringkasan?.sedang_cuti ?? '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ==================== VIEW RIWAYAT ==================== -->
      <template v-if="activeTab === 'riwayat'">
        <!-- Search + Filter -->
        <div class="flex items-center gap-3 mb-4">
          <div class="relative flex-1 max-w-md">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              :placeholder="t('approval.searchPlaceholder')"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {{ t('approval.filter') }}
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.dateRange') }}</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.karyawan') }}</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.jenisCuti') }}</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.keterangan') }}</th>
                  <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.jmlHari') }}</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.backup') }}</th>
                  <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('approval.status') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="historyList.length === 0">
                  <td colspan="7" class="text-center py-8 text-gray-400 text-sm">{{ t('approval.noData') }}</td>
                </tr>
                <tr
                  v-for="(item, index) in historyList"
                  :key="index"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ formatTanggal(item.tanggal) }}
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ item.nama }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.jenis_cuti }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{{ item.keterangan || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.durasi }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.pengganti || '-' }}</td>
                  <td class="px-4 py-3 text-center">
                    <span
                      :class="[
                        'inline-block text-[10px] px-2.5 py-1 rounded-full font-medium',
                        item.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                        item.status === 'disetujui_hr' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700',
                      ]"
                    >
                      {{ t('status.approved') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              {{ t('approval.showing') }} {{ historyList.length > 0 ? ((currentPage - 1) * 10 + 1) : 0 }}-{{ Math.min(currentPage * 10, totalItems) }} {{ t('approval.of') }} {{ totalItems }} {{ t('approval.data') }}
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
    </template>

    <!-- Approve Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showApproveModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeApproveModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('approval.approveConfirm') }}</h3>
              <button
                @click="closeApproveModal"
                class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="text-sm text-gray-500 mb-4">
              {{ t('approval.approveMessage') }} <span class="font-semibold text-gray-800">{{ approveTarget?.nama }}</span>.
              {{ t('approval.approveQuestion') }}
            </p>

            <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p><span class="text-gray-500">{{ t('approval.jenisCuti') }}:</span> <span class="font-medium text-gray-800">{{ approveTarget?.jenis_cuti }}</span></p>
              <p><span class="text-gray-500">{{ t('approval.dateRange') }}:</span> <span class="font-medium text-gray-800">{{ approveTarget ? formatTanggal(approveTarget.tanggal) : '' }}</span></p>
              <p><span class="text-gray-500">{{ t('approval.duration') }}:</span> <span class="font-medium text-gray-800">{{ approveTarget?.durasi }} {{ t('history.days') }}</span></p>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeApproveModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="handleApprove"
                :disabled="processingId !== null"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ processingId ? t('approval.approving') : t('approval.approve') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reject Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRejectModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeRejectModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('approval.rejectTitle') }}</h3>
              <button
                @click="closeRejectModal"
                class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="text-sm text-gray-500 mb-4">
              {{ t('approval.rejectMessage') }}
            </p>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('approval.rejectReason') }} <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="rejectAlasan"
                rows="3"
                :placeholder="t('approval.rejectPlaceholder')"
                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeRejectModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="handleReject"
                :disabled="!rejectAlasan.trim() || rejectLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ rejectLoading ? t('approval.rejecting') : t('approval.confirmReject') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Approve Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showApproveSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showApproveSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('approval.approveSuccess') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.approveSuccessMsg') }}</p>
            <button
              @click="showApproveSuccessPopup = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reject Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRejectSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showRejectSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('approval.rejectSuccess') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.rejectSuccessMsg') }}</p>
            <button
              @click="showRejectSuccessPopup = false"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
