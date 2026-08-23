<script setup lang="ts">
import { ref, computed } from "vue";

const searchQuery = ref("");
const selectedDept = ref("semua");

const employeeLeaves = ref([
  {
    id: 1,
    id_karyawan: "010000",
    nama: "Budi Santoso",
    departemen: "Teknologi Informasi",
    cuti_tahunan: 12,
    cuti_khusus: 1,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
  {
    id: 2,
    id_karyawan: "020000",
    nama: "Siti Aminah",
    departemen: "Sumber Daya Manusia",
    cuti_tahunan: 12,
    cuti_khusus: 1,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
  {
    id: 3,
    id_karyawan: "030000",
    nama: "Rizky Darmawan",
    departemen: "Pemasaran",
    cuti_tahunan: 12,
    cuti_khusus: 1,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
  {
    id: 4,
    id_karyawan: "040000",
    nama: "Dewi Lestari",
    departemen: "Operasional",
    cuti_tahunan: 12,
    cuti_khusus: 1,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
]);

// Modal State
const showAdjustModal = ref(false);
const adjustForm = ref({
  departemen: "Semua Departemen",
  karyawan: "Semua Karyawan",
  tahun: 2024,
  jatahCutiTahunan: 12,
});

const handleSaveAdjustment = () => {
  if (adjustForm.value.karyawan === "Semua Karyawan") {
    employeeLeaves.value.forEach((item) => {
      if (
        adjustForm.value.departemen === "Semua Departemen" ||
        item.departemen === adjustForm.value.departemen
      ) {
        item.cuti_tahunan = adjustForm.value.jatahCutiTahunan;
        item.sisa_saldo = adjustForm.value.jatahCutiTahunan - item.cuti_terpakai;
      }
    });
  } else {
    const target = employeeLeaves.value.find((e) => e.nama === adjustForm.value.karyawan);
    if (target) {
      target.cuti_tahunan = adjustForm.value.jatahCutiTahunan;
      target.sisa_saldo = adjustForm.value.jatahCutiTahunan - target.cuti_terpakai;
    }
  }
  showAdjustModal.value = false;
};

const filteredList = computed(() => {
  return employeeLeaves.value.filter((item) => {
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.id_karyawan.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchDept =
      selectedDept.value === "semua" || item.departemen === selectedDept.value;
    return matchSearch && matchDept;
  });
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Search and Action -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          Manajemen Jatah Cuti
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Pantau dan kelola alokasi cuti tahunan, cuti khusus, dan sisa saldo untuk seluruh karyawan.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative min-w-[280px] sm:min-w-[340px]">
          <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari karyawan berdasarkan nama atau ID..."
            class="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white outline-none"
          />
        </div>

        <!-- Button Sesuaikan Kuota -->
        <button
          @click="showAdjustModal = true"
          class="flex items-center gap-2 px-5 py-2 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Sesuaikan Kuota
        </button>
      </div>
    </div>

    <!-- 2 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      <!-- Total Karyawan Aktif -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          TOTAL KARYAWAN AKTIF
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          30 <span class="text-xs font-medium text-gray-400 ml-1">Orang</span>
        </p>
      </div>

      <!-- Karyawan Yang Sedang Cuti -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          KARYAWAN YANG SEDANG CUTI
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          0 <span class="text-xs font-medium text-gray-400 ml-1">Orang</span>
        </p>
      </div>
    </div>

    <!-- Table Card: Daftar Jatah Cuti Karyawan -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Card Header -->
      <div class="p-5 lg:p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-base lg:text-lg font-bold text-gray-900">
          Daftar Jatah Cuti Karyawan
        </h2>

        <!-- Department Filter -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <select
              v-model="selectedDept"
              class="appearance-none pl-4 pr-9 py-2 bg-[#f0f5ff] text-[#0f4bb4] border border-transparent rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              <option value="semua">Semua Departemen</option>
              <option value="Teknologi Informasi">Teknologi Informasi</option>
              <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
              <option value="Pemasaran">Pemasaran</option>
              <option value="Operasional">Operasional</option>
            </select>
            <svg class="w-4 h-4 text-[#0f4bb4] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th class="py-3.5 px-6">ID KARYAWAN</th>
              <th class="py-3.5 px-6">NAMA KARYAWAN</th>
              <th class="py-3.5 px-6">DEPARTEMEN</th>
              <th class="py-3.5 px-6 text-center">CUTI TAHUNAN</th>
              <th class="py-3.5 px-6 text-center">CUTI KHUSUS</th>
              <th class="py-3.5 px-6 text-center">CUTI TERPAKAI</th>
              <th class="py-3.5 px-6 text-center">SISA SALDO</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 font-medium text-gray-700">
            <tr v-for="item in filteredList" :key="item.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-4 px-6 font-mono text-gray-600">{{ item.id_karyawan }}</td>
              <td class="py-4 px-6 font-bold text-gray-900">{{ item.nama }}</td>
              <td class="py-4 px-6 text-gray-600">{{ item.departemen }}</td>
              <td class="py-4 px-6 text-center font-bold text-gray-900">{{ item.cuti_tahunan }} Hari</td>
              <td class="py-4 px-6 text-center font-semibold text-gray-700">{{ item.cuti_khusus || 1 }} Hari</td>
              <td class="py-4 px-6 text-center font-semibold text-gray-600">{{ item.cuti_terpakai }} Hari</td>
              <td class="py-4 px-6 text-center">
                <div class="w-10 h-10 rounded-full bg-[#dbeafe] text-[#0f4bb4] flex flex-col items-center justify-center mx-auto shadow-xs font-bold text-[10px] leading-tight">
                  <span>{{ item.sisa_saldo }}</span>
                  <span class="text-[8px] font-normal">Hari</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <p>Menampilkan 1-4 dari 248 karyawan</p>
        <div class="flex items-center gap-1.5">
          <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0f4bb4] text-white font-bold text-xs cursor-pointer shadow-sm">
            1
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer">
            2
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer">
            3
          </button>
          <span class="px-1 text-gray-400">...</span>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer">
            12
          </button>
          <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL: SESUAIKAN KUOTA CUTI (EXACTLY MATCHING USER SCREENSHOT 1) -->
    <div
      v-if="showAdjustModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">
              Sesuaikan Kuota Cuti
            </h3>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Atur jatah cuti tahunan dan khusus untuk karyawan secara massal atau individu.
            </p>
          </div>
          <button @click="showAdjustModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4 text-xs pt-1">
          <!-- 1. PILIH DEPARTEMEN -->
          <div>
            <label class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5">
              PILIH DEPARTEMEN
            </label>
            <div class="relative">
              <select
                v-model="adjustForm.departemen"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4] cursor-pointer pr-10"
              >
                <option value="Semua Departemen">Semua Departemen</option>
                <option value="Teknologi Informasi">Teknologi Informasi</option>
                <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                <option value="Pemasaran">Pemasaran</option>
                <option value="Operasional">Operasional</option>
              </select>
              <svg class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- 2. PILIH KARYAWAN -->
          <div>
            <label class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5">
              PILIH KARYAWAN
            </label>
            <div class="relative">
              <select
                v-model="adjustForm.karyawan"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4] cursor-pointer pr-10"
              >
                <option value="Semua Karyawan">Semua Karyawan</option>
                <option v-for="emp in employeeLeaves" :key="emp.id" :value="emp.nama">
                  {{ emp.nama }} ({{ emp.id_karyawan }})
                </option>
              </select>
              <svg class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- 3. TAHUN JATAH -->
          <div>
            <label class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5">
              TAHUN JATAH
            </label>
            <div class="relative">
              <select
                v-model="adjustForm.tahun"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4] cursor-pointer pr-10"
              >
                <option :value="2025">2025</option>
                <option :value="2024">2024</option>
                <option :value="2023">2023</option>
              </select>
              <svg class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- 4. JATAH CUTI TAHUNAN (Counter) -->
          <div>
            <label class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5">
              JATAH CUTI TAHUNAN
            </label>
            <div class="flex items-center gap-2">
              <button
                @click="adjustForm.jatahCutiTahunan = Math.max(0, adjustForm.jatahCutiTahunan - 1)"
                class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm font-bold cursor-pointer"
              >
                —
              </button>
              <div class="flex-1 h-10 bg-[#f0f5ff] rounded-xl flex items-center justify-center text-xs font-bold text-gray-800">
                <span>{{ adjustForm.jatahCutiTahunan }}</span>
                <span class="text-gray-500 font-normal ml-1">Hari</span>
              </div>
              <button
                @click="adjustForm.jatahCutiTahunan += 1"
                class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-4">
          <button
            @click="showAdjustModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handleSaveAdjustment"
            class="px-6 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Terapkan Perubahan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
