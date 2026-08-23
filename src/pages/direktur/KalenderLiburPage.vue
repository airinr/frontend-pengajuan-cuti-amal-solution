<script setup lang="ts">
import { ref } from "vue";

const currentMonth = ref(2); // Maret (0-indexed)
const currentYear = ref(2024);

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

// Hardcoded sample days for Maret 2024 matching screenshot
const calendarCells = ref([
  { day: 25, currentMonth: false, isSunday: true },
  { day: 26, currentMonth: false },
  { day: 27, currentMonth: false },
  { day: 28, currentMonth: false },
  { day: 29, currentMonth: false },
  { day: 1, currentMonth: true },
  { day: 2, currentMonth: true },
  { day: 3, currentMonth: true, isSunday: true },
  { day: 4, currentMonth: true },
  { day: 5, currentMonth: true },
  { day: 6, currentMonth: true },
  { day: 7, currentMonth: true },
  { day: 8, currentMonth: true },
  { day: 9, currentMonth: true, badge: "Libur Nasional", badgeType: "red" },
  { day: 10, currentMonth: true, isSunday: true, badge: "Libur Nasional", badgeType: "red" },
  { day: 11, currentMonth: true, badge: "Cuti Bersama", badgeType: "blue" },
  { day: 12, currentMonth: true, badge: "Cuti Bersama", badgeType: "blue" },
  { day: 13, currentMonth: true, isToday: true },
  { day: 14, currentMonth: true },
  { day: 15, currentMonth: true },
  { day: 16, currentMonth: true },
  { day: 17, currentMonth: true, isSunday: true },
  { day: 18, currentMonth: true },
  { day: 19, currentMonth: true },
  { day: 20, currentMonth: true },
  { day: 21, currentMonth: true },
  { day: 22, currentMonth: true },
  { day: 23, currentMonth: true },
  { day: 24, currentMonth: true, isSunday: true },
  { day: 25, currentMonth: true },
  { day: 26, currentMonth: true },
  { day: 27, currentMonth: true },
  { day: 28, currentMonth: true, badge: "Libur Nasional", badgeType: "red" },
  { day: 29, currentMonth: true },
  { day: 30, currentMonth: true },
]);

// Modal States
const showAddModal = ref(false);
const showSyncModal = ref(false);
const isSyncing = ref(false);
const syncSuccess = ref(false);

const liburForm = ref({
  nama: "",
  tanggal: "",
  jenis: "Libur Nasional", // "Libur Nasional" | "Cuti Bersama"
  keterangan: "",
});

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const handleSaveLibur = () => {
  if (!liburForm.value.nama) return;
  showAddModal.value = false;
  liburForm.value = { nama: "", tanggal: "", jenis: "Libur Nasional", keterangan: "" };
};

const handleSyncApi = () => {
  isSyncing.value = true;
  setTimeout(() => {
    isSyncing.value = false;
    syncSuccess.value = true;
    setTimeout(() => {
      syncSuccess.value = false;
      showSyncModal.value = false;
    }, 1200);
  }, 1000);
};
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Top Header Area -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          Kalender Operasional
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Kelola jadwal libur nasional dan cuti bersama tahunan.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Sinkronisasi button -->
        <button
          @click="showSyncModal = true"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#e8eef9] hover:bg-[#dbe4f6] text-[#0f4bb4] rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sinkronisasi
        </button>

        <!-- Tambah Libur button -->
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 px-6 py-2.5 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Libur
        </button>

        <!-- Top Right Legend Card -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 text-xs font-medium text-gray-700">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full border-2 border-red-500"></span>
            <span>Libur Nasional</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full border-2 border-[#0f4bb4]"></span>
            <span>Cuti Bersama</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full border-2 border-[#0f4bb4] flex items-center justify-center">
              <span class="w-1 h-1 bg-[#0f4bb4] rounded-full"></span>
            </span>
            <span>Hari Ini</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid: Calendar (8 Cols) + Holiday List (4 Cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Calendar Card -->
      <div class="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7">
        <!-- Month Navigator -->
        <div class="flex items-center gap-6 mb-6">
          <button @click="prevMonth" class="p-1 text-gray-600 hover:text-gray-900 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-xl font-bold text-gray-900">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </h2>
          <button @click="nextMonth" class="p-1 text-gray-600 hover:text-gray-900 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          <div v-for="(d, i) in dayNames" :key="d" :class="i === 0 ? 'text-red-500' : ''">
            {{ d }}
          </div>
        </div>

        <!-- Calendar Days Grid -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            :class="[
              'h-20 lg:h-24 p-2.5 rounded-xl border flex flex-col justify-between transition-all relative',
              !cell.currentMonth
                ? 'border-transparent text-gray-300'
                : cell.isToday
                ? 'border-2 border-[#0f4bb4] bg-white shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200'
            ]"
          >
            <!-- Day Number -->
            <div class="flex items-start justify-between">
              <span
                :class="[
                  'text-xs font-bold',
                  !cell.currentMonth
                    ? 'text-gray-300'
                    : cell.isSunday
                    ? 'text-red-500'
                    : 'text-gray-800'
                ]"
              >
                {{ cell.day }}
              </span>

              <!-- Blue dot if Today -->
              <span
                v-if="cell.isToday"
                class="w-2 h-2 rounded-full bg-[#0f4bb4]"
              ></span>
            </div>

            <!-- Bottom Badge in cell -->
            <div v-if="cell.badge" class="mt-auto">
              <span
                :class="[
                  'block text-[9px] font-bold text-center py-0.5 px-1 rounded truncate leading-tight',
                  cell.badgeType === 'red'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-[#0f4bb4]'
                ]"
              >
                {{ cell.badge }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Holiday & Leave List Card -->
      <div class="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 class="text-base lg:text-lg font-bold text-gray-900">
            Daftar Libur & Cuti
          </h2>
          <button class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        <!-- MARET 2024 -->
        <div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            MARET 2024
          </p>

          <div class="space-y-3">
            <!-- Item 1 -->
            <div class="p-3 bg-[#f8fafc] rounded-xl flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex flex-col items-center justify-center shrink-0">
                <span class="text-[10px] font-bold uppercase leading-none">Sab</span>
                <span class="text-base font-extrabold leading-none mt-0.5">09</span>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-900">Hari Raya Nyepi</p>
                <p class="text-[11px] text-gray-500 mt-0.5">Libur Nasional</p>
              </div>
            </div>

            <!-- Item 2 -->
            <div class="p-3 bg-[#f8fafc] rounded-xl flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex flex-col items-center justify-center shrink-0">
                <span class="text-[10px] font-bold uppercase leading-none">Min</span>
                <span class="text-base font-extrabold leading-none mt-0.5">10</span>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-900">Cuti Bersama Nyepi</p>
                <p class="text-[11px] text-gray-500 mt-0.5">Dikoreksi menjadi Libur</p>
              </div>
            </div>
          </div>
        </div>

        <!-- APRIL 2024 -->
        <div class="pt-2">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            APRIL 2024
          </p>

          <div class="space-y-3">
            <!-- Item 3 -->
            <div class="p-3 bg-[#f8fafc] rounded-xl flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-[#0f4bb4] flex flex-col items-center justify-center shrink-0">
                <span class="text-[10px] font-bold uppercase leading-none">Sen</span>
                <span class="text-base font-extrabold leading-none mt-0.5">08</span>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-900">Cuti Bersama Idul Fitri</p>
                <p class="text-[11px] text-gray-500 mt-0.5">Cuti Bersama</p>
              </div>
            </div>

            <!-- Item 4 -->
            <div class="p-3 bg-[#f8fafc] rounded-xl flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-[#0f4bb4] flex flex-col items-center justify-center shrink-0">
                <span class="text-[10px] font-bold uppercase leading-none">Sel</span>
                <span class="text-base font-extrabold leading-none mt-0.5">09</span>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-900">Cuti Bersama Idul Fitri</p>
                <p class="text-[11px] text-gray-500 mt-0.5">Cuti Bersama</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 1: TAMBAH HARI LIBUR (EXACTLY MATCHING USER SCREENSHOT 2) -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            Tambah Hari Libur
          </h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-3.5 text-xs">
          <!-- 1. Nama Hari Libur -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Nama Hari Libur</label>
            <input
              v-model="liburForm.nama"
              type="text"
              placeholder="Contoh: Hari Raya Idul Fitri"
              class="w-full px-3.5 py-2.5 bg-[#f0f5ff]/70 border border-transparent rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-[#0f4bb4] transition-all"
            />
          </div>

          <!-- 2. Tanggal -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Tanggal</label>
            <div class="relative">
              <input
                v-model="liburForm.tanggal"
                type="text"
                placeholder="Pilih tanggal"
                class="w-full px-3.5 py-2.5 bg-[#f0f5ff]/70 border border-transparent rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-[#0f4bb4] pr-10 cursor-pointer transition-all"
              />
              <svg class="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- 3. Jenis Libur -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Jenis Libur</label>
            <div class="grid grid-cols-2 gap-3">
              <!-- Libur Nasional Card -->
              <label
                :class="[
                  'flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  liburForm.jenis === 'Libur Nasional'
                    ? 'border-gray-300 bg-white text-gray-900 shadow-xs'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="liburForm.jenis"
                  value="Libur Nasional"
                  class="accent-red-500 w-3.5 h-3.5"
                />
                <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span class="truncate">Libur Nasional</span>
              </label>

              <!-- Cuti Bersama Card -->
              <label
                :class="[
                  'flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  liburForm.jenis === 'Cuti Bersama'
                    ? 'border-gray-300 bg-white text-gray-900 shadow-xs'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="liburForm.jenis"
                  value="Cuti Bersama"
                  class="accent-[#0f4bb4] w-3.5 h-3.5"
                />
                <span class="w-2 h-2 rounded-full bg-[#0f4bb4] shrink-0"></span>
                <span class="truncate">Cuti Bersama</span>
              </label>
            </div>
          </div>

          <!-- 4. Keterangan -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Keterangan</label>
            <textarea
              v-model="liburForm.keterangan"
              rows="3"
              placeholder="Tambahkan catatan tambahan..."
              class="w-full p-3 bg-[#f0f5ff]/70 border border-transparent rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-[#0f4bb4] transition-all min-h-[80px]"
            ></textarea>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="showAddModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handleSaveLibur"
            class="px-7 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 2: Sinkronisasi API -->
    <div
      v-if="showSyncModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
        <div class="w-12 h-12 rounded-full bg-blue-100 text-[#0f4bb4] flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <div>
          <h3 class="text-base font-bold text-gray-900">Sinkronisasi Data Libur</h3>
          <p class="text-xs text-gray-500 mt-1">
            Apakah Anda ingin menyinkronkan data hari libur nasional resmi tahun {{ currentYear }} dari server pemerintah?
          </p>
        </div>

        <div v-if="syncSuccess" class="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">
          ✓ Sinkronisasi data libur berhasil!
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="showSyncModal = false"
            class="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handleSyncApi"
            :disabled="isSyncing"
            class="flex-1 py-2 text-xs font-bold text-white bg-[#0f4bb4] rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
          >
            {{ isSyncing ? "Menyinkronkan..." : "Mulai Sinkronisasi" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
