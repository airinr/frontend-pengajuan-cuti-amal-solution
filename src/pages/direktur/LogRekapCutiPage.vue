<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"rekapitulasi" | "log">("log");
const searchQuery = ref("");
const selectedYear = ref(2023);
const selectedStatus = ref("semua");

const rekapData = ref([
  {
    id: 1,
    nama: "Budi Santoso",
    departemen: "IT Dept",
    tanggal: "12 Okt - 14 Okt 2023",
    total_cuti: 6,
    cuti_diambil: 3,
    sisa_cuti: 3,
    status: "Disetujui",
  },
  {
    id: 2,
    nama: "Anita Wulandari",
    departemen: "Marketing",
    tanggal: "20 Nov 2023",
    total_cuti: 12,
    cuti_diambil: 1,
    sisa_cuti: 11,
    status: "Disetujui",
  },
  {
    id: 3,
    nama: "Budi santoso",
    departemen: "IT Dept",
    tanggal: "05 Des - 08 Des 2023",
    total_cuti: 12,
    cuti_diambil: 4,
    sisa_cuti: 6,
    status: "Disetujui",
  },
]);

const logData = ref([
  {
    id: 1,
    nama: "Dian Sastro",
    tanggal_cuti: "12 - 14 Okt 2023",
    durasi: "3 Hari",
    jenis_cuti: "Cuti Tahunan",
    keterangan: "Liburan keluarga",
    backup: "Budi Santoso",
    status: "Disetujui",
    approver: "Anita W.",
  },
  {
    id: 2,
    nama: "Agus Pratama",
    tanggal_cuti: "18 Okt 2023",
    durasi: "1 Hari",
    jenis_cuti: "Cuti Tahunan",
    keterangan: "Liburan",
    backup: "Rani Rania",
    status: "Disetujui",
    approver: "Anita W.",
  },
  {
    id: 3,
    nama: "Rina Fitriani",
    tanggal_cuti: "03 - 06 Okt 2023",
    durasi: "4 Hari",
    jenis_cuti: "Cuti Tahunan",
    keterangan: "Liburan",
    backup: "Siti Aminah",
    status: "Ditolak",
    approver: "Anita W.",
  },
]);

const filteredRekap = computed(() => {
  return rekapData.value.filter((item) => {
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.departemen.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus =
      selectedStatus.value === "semua" ||
      item.status.toLowerCase() === selectedStatus.value.toLowerCase();
    return matchSearch && matchStatus;
  });
});

const filteredLog = computed(() => {
  return logData.value.filter((item) => {
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.backup.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus =
      selectedStatus.value === "semua" ||
      item.status.toLowerCase() === selectedStatus.value.toLowerCase();
    return matchSearch && matchStatus;
  });
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
        Log & Rekapitulasi Cuti
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Laporan historis dan statistik penggunaan cuti karyawan.
      </p>
    </div>

    <!-- Filter Bar Card -->
    <div class="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-4">
        <!-- Left: Segmented Switcher -->
        <div class="flex bg-[#e8eef9] p-1 rounded-xl shrink-0">
          <button
            @click="activeTab = 'rekapitulasi'"
            :class="[
              'px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
              activeTab === 'rekapitulasi'
                ? 'bg-[#0f4bb4] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            Rekapitulasi
          </button>
          <button
            @click="activeTab = 'log'"
            :class="[
              'px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
              activeTab === 'log'
                ? 'bg-[#0f4bb4] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            Log Cuti
          </button>
        </div>

        <!-- Center: Search Input -->
        <div class="relative flex-1 max-w-md w-full">
          <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari karyawan..."
            class="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white outline-none"
          />
        </div>

        <!-- Center Right: Year Dropdown -->
        <div>
          <select
            v-model="selectedYear"
            class="px-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#0f4bb4] outline-none cursor-pointer"
          >
            <option :value="2024">2024</option>
            <option :value="2023">2023</option>
            <option :value="2022">2022</option>
          </select>
        </div>

        <!-- Right: Status Filter Pills -->
        <div class="flex items-center gap-2">
          <button
            @click="selectedStatus = 'semua'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              selectedStatus === 'semua'
                ? 'bg-[#0f4bb4] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
          >
            Semua
          </button>
          <button
            @click="selectedStatus = 'Disetujui'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              selectedStatus === 'Disetujui'
                ? 'bg-[#0f4bb4] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
          >
            Disetujui
          </button>
          <button
            @click="selectedStatus = 'Ditolak'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              selectedStatus === 'Ditolak'
                ? 'bg-[#0f4bb4] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
          >
            Ditolak
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Rekapitulasi Table -->
      <div v-if="activeTab === 'rekapitulasi'" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th class="py-3.5 px-6">NO</th>
              <th class="py-3.5 px-6">KARYAWAN</th>
              <th class="py-3.5 px-6">DEPARTEMEN</th>
              <th class="py-3.5 px-6">TANGGAL</th>
              <th class="py-3.5 px-6 text-center">TOTAL CUTI/TAHUN (HARI)</th>
              <th class="py-3.5 px-6 text-center">CUTI DIAMBIL (HARI)</th>
              <th class="py-3.5 px-6 text-center">SISA CUTI (HARI)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 font-medium text-gray-700">
            <tr v-for="(row, idx) in filteredRekap" :key="row.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-4 px-6">{{ idx + 1 }}</td>
              <td class="py-4 px-6 font-bold text-gray-900 leading-tight">
                {{ row.nama }}
              </td>
              <td class="py-4 px-6 text-gray-600">{{ row.departemen }}</td>
              <td class="py-4 px-6 text-gray-600">{{ row.tanggal }}</td>
              <td class="py-4 px-6 text-center font-semibold text-gray-800">{{ row.total_cuti }}</td>
              <td class="py-4 px-6 text-center font-semibold text-gray-800">{{ row.cuti_diambil }}</td>
              <td class="py-4 px-6 text-center font-bold text-gray-900">{{ row.sisa_cuti }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Log Cuti Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th class="py-3.5 px-6">NO.</th>
              <th class="py-3.5 px-6">KARYAWAN</th>
              <th class="py-3.5 px-6">TANGGAL CUTI</th>
              <th class="py-3.5 px-6">DURASI</th>
              <th class="py-3.5 px-6">JENIS CUTI</th>
              <th class="py-3.5 px-6">KETERANGAN</th>
              <th class="py-3.5 px-6">BACKUP</th>
              <th class="py-3.5 px-6">STATUS</th>
              <th class="py-3.5 px-6">HR/APPROVER</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 font-medium text-gray-700">
            <tr v-for="(item, idx) in filteredLog" :key="item.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-4 px-6">{{ idx + 1 }}</td>
              <td class="py-4 px-6 font-bold text-gray-900 leading-tight">
                {{ item.nama }}
              </td>
              <td class="py-4 px-6 text-gray-600">{{ item.tanggal_cuti }}</td>
              <td class="py-4 px-6 text-gray-900 font-semibold">{{ item.durasi }}</td>
              <td class="py-4 px-6 text-gray-600">{{ item.jenis_cuti }}</td>
              <td class="py-4 px-6 text-gray-600">{{ item.keterangan }}</td>
              <td class="py-4 px-6 text-gray-600">{{ item.backup }}</td>
              <td class="py-4 px-6">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold',
                    item.status === 'Disetujui'
                      ? 'bg-[#dbeafe] text-[#0f4bb4]'
                      : 'bg-gray-200 text-gray-700',
                  ]"
                >
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full',
                      item.status === 'Disetujui' ? 'bg-[#0f4bb4]' : 'bg-gray-500',
                    ]"
                  ></span>
                  {{ item.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-gray-600">{{ item.approver }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <p>
          Menampilkan 1-3 dari {{ activeTab === 'log' ? '45 log cuti' : '3 data' }}
        </p>
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
          <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
