<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  hrApi,
  type PersetujuanItem,
  type RingkasanPersetujuan,
} from "../../services/hr.service";

const pendingList = ref<PersetujuanItem[]>([
  {
    id_log_cuti: 1,
    id_user: 11,
    nama: "Rani Mawar",
    jabatan: "Staff",
    departemen: "Human Resource • Manajemen Perusahaan",
    jenis_cuti: "Cuti Tahunan",
    tanggal_mulai: "2023-11-20",
    tanggal_selesai: "2023-11-24",
    durasi: 5,
    delegasi_tugas: "Dina S.",
    sisa_cuti: 6,
    disetujui_oleh: "HR Manager",
    keterangan: "Liburan keluarga tahunan yang sudah direncanakan sejak lama.",
    status: "Menunggu",
  },
]);

const ringkasan = ref<RingkasanPersetujuan>({
  menunggu: 1,
  disetujui_bulan_ini: 2,
  ditolak_bulan_ini: 0,
});

const processingId = ref<number | null>(null);

// Modal States
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const selectedItem = ref<PersetujuanItem | null>(null);
const rejectReason = ref("");

const openApproveConfirm = (item: PersetujuanItem) => {
  selectedItem.value = item;
  showApproveModal.value = true;
};

const openRejectConfirm = (item: PersetujuanItem) => {
  selectedItem.value = item;
  rejectReason.value = "";
  showRejectModal.value = true;
};

const confirmApprove = async () => {
  if (!selectedItem.value) return;
  const id = selectedItem.value.id_log_cuti;
  processingId.value = id;
  try {
    await hrApi.approve(id);
  } catch {
    // local update
  } finally {
    pendingList.value = pendingList.value.filter((item) => item.id_log_cuti !== id);
    ringkasan.value.menunggu = Math.max(0, ringkasan.value.menunggu - 1);
    ringkasan.value.disetujui_bulan_ini += 1;
    processingId.value = null;
    showApproveModal.value = false;
    selectedItem.value = null;
  }
};

const confirmReject = async () => {
  if (!selectedItem.value || !rejectReason.value.trim()) return;
  const id = selectedItem.value.id_log_cuti;
  processingId.value = id;
  try {
    await hrApi.reject(id, rejectReason.value);
  } catch {
    // local update
  } finally {
    pendingList.value = pendingList.value.filter((item) => item.id_log_cuti !== id);
    ringkasan.value.menunggu = Math.max(0, ringkasan.value.menunggu - 1);
    ringkasan.value.ditolak_bulan_ini += 1;
    processingId.value = null;
    showRejectModal.value = false;
    selectedItem.value = null;
    rejectReason.value = "";
  }
};

onMounted(async () => {
  try {
    const [pendingRes, ringkasanRes] = await Promise.allSettled([
      hrApi.getPendingApprovals(),
      hrApi.getRingkasan(),
    ]);
    if (pendingRes.status === "fulfilled" && pendingRes.value.data && pendingRes.value.data.length > 0) {
      pendingList.value = pendingRes.value.data;
    }
    if (ringkasanRes.status === "fulfilled" && ringkasanRes.value.data) {
      ringkasan.value = ringkasanRes.value.data;
    }
  } catch {
    // fallback
  }
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
        Persetujuan Cuti
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Kelola pengajuan cuti karyawan yang menunggu persetujuan Anda.
      </p>
    </div>

    <!-- Content Layout: 2 Columns -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Pending Leaves List (8 Cols) -->
      <div class="lg:col-span-8 space-y-5">
        <div v-if="pendingList.length === 0" class="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p class="text-base font-semibold text-gray-800">Tidak ada pengajuan cuti</p>
          <p class="text-sm text-gray-400 mt-1">Semua pengajuan cuti telah selesai diproses.</p>
        </div>

        <div
          v-for="item in pendingList"
          :key="item.id_log_cuti"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7 space-y-5"
        >
          <!-- User Info Header -->
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ item.nama }}</h2>
            <p class="text-xs text-gray-500 mt-1">{{ item.departemen }}</p>
          </div>

          <!-- Metadata Pill Box -->
          <div class="bg-[#f0f5ff] rounded-xl p-4 lg:p-5">
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-left">
              <div>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">JENIS CUTI</p>
                <p class="text-xs font-bold text-gray-900 mt-1">{{ item.jenis_cuti }}</p>
              </div>
              <div>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">TANGGAL</p>
                <p class="text-xs font-bold text-gray-900 mt-1">20 - 24 Nov 2023</p>
              </div>
              <div>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">DURASI</p>
                <p class="text-xs font-bold text-gray-900 mt-1">{{ item.durasi }} Hari</p>
              </div>
              <div>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">DELEGASI TUGAS</p>
                <p class="text-xs font-bold text-gray-900 mt-1">{{ item.delegasi_tugas || '-' }}</p>
              </div>
              <div>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">SISA CUTI</p>
                <p class="text-xs font-bold text-gray-900 mt-1">{{ item.sisa_cuti }}</p>
              </div>
            </div>
          </div>

          <!-- Reason / Notes Section -->
          <div>
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">ALASAN / CATATAN</p>
            <div class="bg-[#f0f5ff] rounded-xl p-4 text-xs text-gray-700 leading-relaxed font-normal">
              {{ item.keterangan }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              @click="openRejectConfirm(item)"
              class="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Tolak</span>
            </button>
            <button
              @click="openApproveConfirm(item)"
              class="px-6 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Setujui</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Ringkasan Persetujuan (4 Cols) -->
      <div class="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 class="text-base lg:text-lg font-bold text-gray-900">
          Ringkasan Persetujuan
        </h2>

        <div class="space-y-3 pt-1">
          <!-- Menunggu -->
          <div class="bg-[#f0f5ff] rounded-xl p-4 flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-700">Menunggu</span>
            <span class="text-xl font-extrabold text-[#0f4bb4]">{{ ringkasan.menunggu }}</span>
          </div>

          <!-- Disetujui Bulan Ini -->
          <div class="bg-[#f0f5ff] rounded-xl p-4 flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-700">Disetujui Bulan Ini</span>
            <span class="text-xl font-extrabold text-[#0f4bb4]">{{ ringkasan.disetujui_bulan_ini }}</span>
          </div>

          <!-- Ditolak Bulan Ini -->
          <div class="bg-[#f0f5ff] rounded-xl p-4 flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-700">Ditolak Bulan Ini</span>
            <span class="text-xl font-extrabold text-red-600">{{ ringkasan.ditolak_bulan_ini }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL: Konfirmasi Setujui Cuti -->
    <div
      v-if="showApproveModal && selectedItem"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div class="w-12 h-12 rounded-full bg-blue-100 text-[#0f4bb4] flex items-center justify-center mx-auto shadow-xs">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div class="text-center space-y-1">
          <h3 class="text-lg font-bold text-gray-900">Setujui Pengajuan Cuti</h3>
          <p class="text-xs text-gray-500">
            Apakah Anda yakin ingin menyetujui pengajuan cuti untuk karyawan berikut?
          </p>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-500">Nama Karyawan:</span>
            <span class="font-bold text-gray-900">{{ selectedItem.nama }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Jenis Cuti:</span>
            <span class="font-semibold text-[#0f4bb4]">{{ selectedItem.jenis_cuti }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Durasi:</span>
            <span class="font-bold text-gray-900">{{ selectedItem.durasi }} Hari</span>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            @click="showApproveModal = false"
            class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmApprove"
            :disabled="processingId !== null"
            class="flex-1 py-2.5 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ processingId !== null ? "Memproses..." : "Ya, Setujui" }}
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL: PENOLAKAN CUTI (EXACTLY MATCHING USER SCREENSHOT) -->
    <div
      v-if="showRejectModal && selectedItem"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            Penolakan Cuti
          </h3>
          <button @click="showRejectModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Description Note -->
        <p class="text-xs text-gray-600 leading-relaxed">
          Harap berikan alasan yang jelas dan informatif terkait penolakan permohonan cuti ini, karena ini akan dikirimkan langsung kepada pemohon.
        </p>

        <!-- Form Textarea -->
        <div>
          <label class="block text-xs font-bold text-gray-900 mb-1.5">
            Alasan Penolakan <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="rejectReason"
            rows="3"
            placeholder="Tulis alasan penolakan..."
            class="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs outline-none focus:border-red-500 focus:bg-white transition-all text-gray-800"
          ></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="showRejectModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="confirmReject"
            :disabled="!rejectReason.trim() || processingId !== null"
            class="px-5 py-2.5 bg-[#c91818] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ processingId !== null ? "Memproses..." : "Konfirmasi Tolak" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
