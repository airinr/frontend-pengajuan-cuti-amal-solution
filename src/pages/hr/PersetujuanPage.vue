<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  hrApi,
  type PersetujuanItem,
  type RingkasanPersetujuan,
} from "../../services/hr.service";

const activeTab = ref<"menunggu" | "riwayat">("menunggu");
const pendingList = ref<PersetujuanItem[]>([]);
const historyList = ref<PersetujuanItem[]>([]);
const ringkasan = ref<RingkasanPersetujuan | null>(null);
const loading = ref(true);
const processingId = ref<number | null>(null);

const showRejectModal = ref(false);
const rejectTarget = ref<PersetujuanItem | null>(null);
const rejectAlasan = ref("");
const rejectLoading = ref(false);

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
  return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
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
      hrApi.getPendingApprovals(),
      hrApi.getRingkasan(),
    ]);
    if (pendingRes.status === "fulfilled") pendingList.value = pendingRes.value.data || [];
    if (ringkasanRes.status === "fulfilled") ringkasan.value = ringkasanRes.value.data;
  } catch {
    // silent fail
  }
};

const fetchHistory = async () => {
  try {
    const res = await hrApi.getApprovalHistory();
    historyList.value = res.data || [];
  } catch {
    // silent fail
  }
};

const switchTab = (tab: "menunggu" | "riwayat") => {
  activeTab.value = tab;
  if (tab === "riwayat" && historyList.value.length === 0) {
    fetchHistory();
  }
};

const handleApprove = async (id: number) => {
  if (processingId.value) return;
  processingId.value = id;
  try {
    await hrApi.approve(id);
    pendingList.value = pendingList.value.filter((item) => item.id_log_cuti !== id);
    if (ringkasan.value) {
      ringkasan.value.menunggu = Math.max(0, ringkasan.value.menunggu - 1);
      ringkasan.value.disetujui_bulan_ini += 1;
    }
  } catch {
    // silent fail
  } finally {
    processingId.value = null;
  }
};

const openRejectModal = (item: PersetujuanItem) => {
  rejectTarget.value = item;
  rejectAlasan.value = "";
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectTarget.value = null;
  rejectAlasan.value = "";
};

const handleReject = async () => {
  if (!rejectTarget.value || !rejectAlasan.value.trim()) return;
  rejectLoading.value = true;
  try {
    await hrApi.reject(rejectTarget.value.id_log_cuti, rejectAlasan.value);
    pendingList.value = pendingList.value.filter(
      (item) => item.id_log_cuti !== rejectTarget.value!.id_log_cuti
    );
    if (ringkasan.value) {
      ringkasan.value.menunggu = Math.max(0, ringkasan.value.menunggu - 1);
      ringkasan.value.ditolak_bulan_ini += 1;
    }
    closeRejectModal();
  } catch {
    // silent fail
  } finally {
    rejectLoading.value = false;
  }
};

const currentList = computed(() =>
  activeTab.value === "menunggu" ? pendingList.value : historyList.value
);

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
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Persetujuan Cuti</h1>
        <p class="text-sm text-gray-500">Kelola pengajuan cuti karyawan yang menunggu persetujuan Anda.</p>
      </div>
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

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Left: Cards -->
        <div class="flex-1 space-y-4">
          <div v-if="currentList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
            {{ activeTab === 'menunggu' ? 'Tidak ada pengajuan yang menunggu' : 'Belum ada riwayat' }}
          </div>

          <div
            v-for="item in currentList"
            :key="item.id_log_cuti"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div class="flex">
              <!-- Left border color -->
              <div
                :class="[
                  'w-1 flex-shrink-0',
                  item.status === 'menunggu_hr' ? 'bg-red-500' :
                  item.status === 'disetujui' ? 'bg-green-500' :
                  'bg-red-500',
                ]"
              ></div>
              <div class="flex-1 p-4 lg:p-5">
                <!-- Header: Avatar + Name + Status -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {{ getInitials(item.nama) }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-800">{{ item.nama }}</p>
                      <p class="text-xs text-gray-500">{{ item.jabatan }} &bull; {{ item.departemen }}</p>
                    </div>
                  </div>
                  <span
                    v-if="activeTab === 'menunggu'"
                    class="flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full"
                  >
                    <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    MENUNGGU
                  </span>
                  <span
                    v-else
                    :class="[
                      'text-xs font-medium px-2.5 py-1 rounded-full',
                      item.status === 'disetujui' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                    ]"
                  >
                    {{ item.status === 'disetujui' ? 'Disetujui' : 'Ditolak' }}
                  </span>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-6 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
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
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.delegasi_tugas || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Sisa Cuti</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.sisa_cuti }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Disetujui</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.disetujui_oleh || '-' }}</p>
                  </div>
                </div>

                <!-- Alasan -->
                <div class="mb-4">
                  <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-1">Alasan / Catatan</p>
                  <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{{ item.keterangan || '-' }}</p>
                </div>

                <!-- Actions -->
                <div v-if="activeTab === 'menunggu'" class="flex items-center justify-end gap-3">
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
                    @click="handleApprove(item.id_log_cuti)"
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
        <div class="w-full lg:w-72">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-4">Ringkasan Persetujuan</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Menunggu</span>
                <span class="text-lg font-bold text-gray-800">{{ ringkasan?.menunggu ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Disetujui Bulan Ini</span>
                <span class="text-lg font-bold text-green-600">{{ ringkasan?.disetujui_bulan_ini ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Ditolak Bulan Ini</span>
                <span class="text-lg font-bold text-red-600">{{ ringkasan?.ditolak_bulan_ini ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

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
              Kamu akan menolak permintaan dari karyawan. Tolong berikan alasan atas keputusan ini. Alasan ini akan dikirim ke karyawan tersebut.
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
