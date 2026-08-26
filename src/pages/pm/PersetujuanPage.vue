<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  pmApi,
  type HistoryCutiItem,
  type RingkasanTim,
} from "../../services/pm.service";
import { approvalApi, type ApprovalQueueItem } from "../../services/approval.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { showError } = useErrorPopup();

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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
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
  } catch {
    // silent fail
  }
};

const fetchHistory = async () => {
  try {
    const res = await pmApi.getHistoryCutiTim();
    allHistoryList.value = res.data || [];
    totalItems.value = allHistoryList.value.length;
    totalPages.value = Math.ceil(totalItems.value / 10) || 1;
    applyPagination();
  } catch {
    // silent fail
  }
};

const applyPagination = () => {
  const start = (currentPage.value - 1) * 10;
  const end = start + 10;
  const filtered = allHistoryList.value.filter((item) => {
    if (!searchQuery.value) return true;
    const q = searchQuery.value.toLowerCase();
    return (
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
          {{ activeTab === 'menunggu' ? 'Persetujuan Cuti' : 'Riwayat Persetujuan Cuti' }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ activeTab === 'menunggu'
            ? 'Kelola pengajuan cuti anggota tim Anda.'
            : 'Kelola dan pantau seluruh permohonan cuti karyawan yang telah diproses.'
          }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Filter Periode -->
        <div class="relative">
          <select class="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Semua Periode</option>
            <option>Bulan Ini</option>
            <option>3 Bulan Terakhir</option>
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
            Menunggu
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
            Riwayat
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
              Tidak ada pengajuan yang menunggu persetujuan
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
                      MENUNGGU
                    </span>
                  </div>

                  <!-- Info Grid -->
                  <div class="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Jenis Cuti</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.jenis_cuti }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Tanggal</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Durasi</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.durasi }} Hari</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Delegasi Tugas</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.pengganti || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Sisa Cuti</p>
                      <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.sisa_cuti }}</p>
                    </div>
                  </div>

                  <!-- Alasan -->
                  <div class="mb-4">
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-1">Alasan Cuti</p>
                    <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{{ item.alasan || '-' }}</p>
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
                      Tolak
                    </button>
                    <button
                      @click="openApproveModal(item)"
                      :disabled="processingId === item.id_log_cuti"
                      class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Setujui
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
              <h3 class="text-sm font-bold text-gray-800 mb-1">Ringkasan Tim</h3>
              <p class="text-xs text-gray-400 mb-4">Bulan {{ new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}</p>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Total Pengajuan</span>
                  <span class="text-lg font-bold text-gray-800">{{ ringkasan?.total_pengajuan ?? '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Menunggu Persetujuan</span>
                  <span class="text-lg font-bold text-gray-800">{{ ringkasan?.menunggu_persetujuan ?? '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Sedang Cuti</span>
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
              placeholder="Cari nama karyawan, jenis cuti..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Tanggal Cuti</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Jenis Cuti</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                  <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Jml Hari</th>
                  <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Backup</th>
                  <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="historyList.length === 0">
                  <td colspan="7" class="text-center py-8 text-gray-400 text-sm">Tidak ada data</td>
                </tr>
                <tr
                  v-for="(item, index) in historyList"
                  :key="index"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}
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
                        item.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700',
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
          <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Menampilkan {{ historyList.length > 0 ? ((currentPage - 1) * 10 + 1) : 0 }}-{{ Math.min(currentPage * 10, totalItems) }} dari {{ totalItems }} data
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
              <h3 class="text-lg font-bold text-gray-800">Konfirmasi Persetujuan</h3>
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
              Anda akan menyetujui pengajuan cuti dari <span class="font-semibold text-gray-800">{{ approveTarget?.nama }}</span>.
              Apakah Anda yakin ingin menyetujui?
            </p>

            <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p><span class="text-gray-500">Jenis Cuti:</span> <span class="font-medium text-gray-800">{{ approveTarget?.jenis_cuti }}</span></p>
              <p><span class="text-gray-500">Tanggal:</span> <span class="font-medium text-gray-800">{{ approveTarget ? formatDateRange(approveTarget.tanggal_mulai, approveTarget.tanggal_selesai) : '' }}</span></p>
              <p><span class="text-gray-500">Durasi:</span> <span class="font-medium text-gray-800">{{ approveTarget?.durasi }} Hari</span></p>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeApproveModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="handleApprove"
                :disabled="processingId !== null"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ processingId ? 'Menyetujui...' : 'Setujui' }}
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
              <h3 class="text-lg font-bold text-gray-800">Penolakan Cuti</h3>
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
              Anda akan menolak permintaan dari karyawan. Tolong berikan alasan atas keputusan ini. Alasan ini akan dikirim ke karyawan tersebut.
            </p>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Alasan Penolakan <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="rejectAlasan"
                rows="3"
                placeholder="contoh: Ada meeting dengan client"
                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeRejectModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="handleReject"
                :disabled="!rejectAlasan.trim() || rejectLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ rejectLoading ? 'Mengirim...' : 'Konfirmasi Tolak' }}
              </button>
            </div>
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
