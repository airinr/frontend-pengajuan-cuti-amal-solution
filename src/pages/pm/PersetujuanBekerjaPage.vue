<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  approvalApi,
  type PenambahanKerjaQueueItem,
} from "../../services/approval.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { showError } = useErrorPopup();

const pendingList = ref<PenambahanKerjaQueueItem[]>([]);
const loading = ref(true);
const processingId = ref<number | null>(null);

const showApproveModal = ref(false);
const approveTarget = ref<PenambahanKerjaQueueItem | null>(null);

const showRejectModal = ref(false);
const rejectTarget = ref<PenambahanKerjaQueueItem | null>(null);
const rejectAlasan = ref("");
const rejectLoading = ref(false);

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  if (start === end) {
    return `${s.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
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
    const res = await approvalApi.getPenambahanKerjaQueue();
    pendingList.value = res.data || [];
  } catch (err) {
    showError(err);
  }
};

const openApproveModal = (item: PenambahanKerjaQueueItem) => {
  approveTarget.value = item;
  showApproveModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  approveTarget.value = null;
};

const handleApprove = async () => {
  if (!approveTarget.value) return;
  const id = approveTarget.value.id_pengajuan_kerja;
  processingId.value = id;
  try {
    await approvalApi.approvePenambahanKerja(id);
    pendingList.value = pendingList.value.filter(
      (item) => item.id_pengajuan_kerja !== id
    );
    closeApproveModal();
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const openRejectModal = (item: PenambahanKerjaQueueItem) => {
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
  processingId.value = rejectTarget.value.id_pengajuan_kerja;
  try {
    await approvalApi.rejectPenambahanKerja(
      rejectTarget.value.id_pengajuan_kerja,
      rejectAlasan.value
    );
    pendingList.value = pendingList.value.filter(
      (item) => item.id_pengajuan_kerja !== rejectTarget.value!.id_pengajuan_kerja
    );
    closeRejectModal();
  } catch (err) {
    showError(err);
  } finally {
    rejectLoading.value = false;
    processingId.value = null;
  }
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
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
        Persetujuan Bekerja
      </h1>
      <p class="text-sm text-gray-500">
        Kelola pengajuan tetap bekerja anggota tim Anda.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <div v-if="pendingList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        Tidak ada pengajuan yang menunggu persetujuan
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in pendingList"
          :key="item.id_pengajuan_kerja"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="flex">
            <div class="w-1 bg-blue-500 flex-shrink-0"></div>
            <div class="flex-1 p-4 lg:p-5">
              <!-- Header -->
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
              <div class="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Tanggal</p>
                  <p class="text-xs font-medium text-gray-700 mt-0.5">{{ formatDateRange(item.tanggal_mulai, item.tanggal_selesai) }}</p>
                </div>
                <div>
                  <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">Keterangan</p>
                  <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.keterangan || '-' }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3">
                <button
                  @click="openRejectModal(item)"
                  :disabled="processingId === item.id_pengajuan_kerja"
                  class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Tolak
                </button>
                <button
                  @click="openApproveModal(item)"
                  :disabled="processingId === item.id_pengajuan_kerja"
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
              Anda akan menyetujui pengajuan bekerja dari <span class="font-semibold text-gray-800">{{ approveTarget?.nama }}</span>.
              Apakah Anda yakin ingin menyetujui?
            </p>

            <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p><span class="text-gray-500">Tanggal:</span> <span class="font-medium text-gray-800">{{ approveTarget ? formatDateRange(approveTarget.tanggal_mulai, approveTarget.tanggal_selesai) : '' }}</span></p>
              <p><span class="text-gray-500">Keterangan:</span> <span class="font-medium text-gray-800">{{ approveTarget?.keterangan }}</span></p>
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
              <h3 class="text-lg font-bold text-gray-800">Penolakan Bekerja</h3>
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
              Anda akan menolak permintaan dari karyawan. Tolong berikan alasan atas keputusan ini.
            </p>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Alasan Penolakan <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="rejectAlasan"
                rows="3"
                placeholder="contoh: Tidak ada kebutuhan operasional yang mendesak"
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
