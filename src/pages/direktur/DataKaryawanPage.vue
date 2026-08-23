<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"karyawan" | "departemen">("karyawan");
const searchKaryawan = ref("");
const searchDepartemen = ref("");

// Data List
const karyawanList = ref([
  {
    id: 1,
    id_karyawan: "010000",
    nama: "Budi Santoso",
    departemen: "Technology",
    jabatan: "Senior Software Engineer",
    email: "budi.santoso@company.com",
    project_manager: "Diana Rosalina",
    status: "Aktif",
  },
  {
    id: 2,
    id_karyawan: "020000",
    nama: "Siti Aminah",
    departemen: "Product & Design",
    jabatan: "Product Designer",
    email: "siti.aminah@company.com",
    project_manager: "Ahmad Rizal",
    status: "Aktif",
  },
  {
    id: 3,
    id_karyawan: "030000",
    nama: "Hendro Wijaya",
    departemen: "Technology",
    jabatan: "QA Specialist",
    email: "hendro.wijaya@company.com",
    project_manager: "Diana Rosalina",
    status: "Aktif",
  },
]);

const departemenList = ref([
  {
    id: 1,
    nama_departemen: "Manajemen Perusahaan",
    jumlah_karyawan: 7,
  },
  {
    id: 2,
    nama_departemen: "Project & Product Development",
    jumlah_karyawan: 15,
  },
  {
    id: 3,
    nama_departemen: "IT Support Operation",
    jumlah_karyawan: 5,
  },
]);

// Modal States
const showAddKaryawanModal = ref(false);
const showEditKaryawanModal = ref(false);
const karyawanForm = ref({
  id: 0,
  id_karyawan: "",
  nama: "",
  email: "",
  departemen: "Technology",
  jabatan: "",
  project_manager: "Diana Rosalina",
  status: "Aktif",
});

const showAddDepartemenModal = ref(false);
const showEditDepartemenModal = ref(false);
const departemenForm = ref({
  id: 0,
  nama_departemen: "",
  jumlah_karyawan: 0,
});

const showFilterModal = ref(false);
const filterStatus = ref("semua");
const filterDept = ref("semua");

// Karyawan Actions
const openAddKaryawan = () => {
  karyawanForm.value = {
    id: Date.now(),
    id_karyawan: "",
    nama: "",
    email: "",
    departemen: "",
    jabatan: "",
    project_manager: "Diana Rosalina",
    status: "Aktif",
  };
  showAddKaryawanModal.value = true;
};

const openEditKaryawan = (item: any) => {
  karyawanForm.value = { ...item };
  showEditKaryawanModal.value = true;
};

const saveNewKaryawan = () => {
  if (!karyawanForm.value.nama || !karyawanForm.value.email) return;
  karyawanList.value.push({
    ...karyawanForm.value,
    id_karyawan: karyawanForm.value.id_karyawan || `0${karyawanList.value.length + 1}0000`,
    departemen: karyawanForm.value.departemen || "Technology",
    status: "Aktif",
    project_manager: "Diana Rosalina",
  });
  showAddKaryawanModal.value = false;
};

const saveEditKaryawan = () => {
  if (!karyawanForm.value.nama || !karyawanForm.value.email) return;
  const idx = karyawanList.value.findIndex((k) => k.id === karyawanForm.value.id);
  if (idx !== -1) {
    karyawanList.value[idx] = { ...karyawanForm.value };
  }
  showEditKaryawanModal.value = false;
};

// Departemen Actions
const openAddDepartemen = () => {
  departemenForm.value = {
    id: Date.now(),
    nama_departemen: "",
    jumlah_karyawan: 0,
  };
  showAddDepartemenModal.value = true;
};

const openEditDepartemen = (item: any) => {
  departemenForm.value = {
    id: item.id,
    nama_departemen: item.nama_departemen,
    jumlah_karyawan: typeof item.jumlah_karyawan === "number" ? item.jumlah_karyawan : parseInt(item.jumlah_karyawan) || 5,
  };
  showEditDepartemenModal.value = true;
};

const saveNewDepartemen = () => {
  if (!departemenForm.value.nama_departemen) return;
  departemenList.value.push({
    id: Date.now(),
    nama_departemen: departemenForm.value.nama_departemen,
    jumlah_karyawan: 0,
  });
  showAddDepartemenModal.value = false;
};

const saveEditDepartemen = () => {
  if (!departemenForm.value.nama_departemen) return;
  const idx = departemenList.value.findIndex((d) => d.id === departemenForm.value.id);
  if (idx !== -1) {
    departemenList.value[idx].nama_departemen = departemenForm.value.nama_departemen;
    departemenList.value[idx].jumlah_karyawan = departemenForm.value.jumlah_karyawan;
  }
  showEditDepartemenModal.value = false;
};

const handleAddClick = () => {
  if (activeTab.value === "karyawan") {
    openAddKaryawan();
  } else {
    openAddDepartemen();
  }
};

const filteredKaryawan = computed(() => {
  return karyawanList.value.filter((k) => {
    const matchSearch =
      !searchKaryawan.value ||
      k.nama.toLowerCase().includes(searchKaryawan.value.toLowerCase()) ||
      k.id_karyawan.toLowerCase().includes(searchKaryawan.value.toLowerCase()) ||
      k.email.toLowerCase().includes(searchKaryawan.value.toLowerCase());
    const matchStatus = filterStatus.value === "semua" || k.status === filterStatus.value;
    const matchDept = filterDept.value === "semua" || k.departemen === filterDept.value;
    return matchSearch && matchStatus && matchDept;
  });
});

const filteredDepartemen = computed(() => {
  return departemenList.value.filter((d) => {
    return (
      !searchDepartemen.value ||
      d.nama_departemen.toLowerCase().includes(searchDepartemen.value.toLowerCase())
    );
  });
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
        Data Karyawan
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Kelola informasi personalia, alokasi departemen, dan penugasan Project Manager dalam satu dasbor terpusat.
      </p>
    </div>

    <!-- 3 Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
      <!-- Total Karyawan -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          TOTAL KARYAWAN
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          30
        </p>
      </div>

      <!-- Departemen -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          DEPARTEMEN
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          4 <span class="text-xs font-medium text-gray-400 ml-1">Divisi Aktif</span>
        </p>
      </div>

      <!-- Project Manager -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          PROJECT MANAGER
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          5 <span class="text-xs font-medium text-gray-400 ml-1">Terdaftar</span>
        </p>
      </div>
    </div>

    <!-- Toolbar: Tab + Filter & Tambah Baru -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <!-- Left: Segmented Pill -->
      <div class="flex bg-[#e8eef9] p-1 rounded-xl">
        <button
          @click="activeTab = 'karyawan'"
          :class="[
            'px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
            activeTab === 'karyawan'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          Karyawan
        </button>
        <button
          @click="activeTab = 'departemen'"
          :class="[
            'px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
            activeTab === 'departemen'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          Departemen
        </button>
      </div>

      <!-- Right Action Buttons -->
      <div class="flex items-center gap-3">
        <button
          v-if="activeTab === 'karyawan'"
          @click="showFilterModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Data
        </button>
        <button
          @click="handleAddClick"
          class="flex items-center gap-2 px-5 py-2 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Baru
        </button>
      </div>
    </div>

    <!-- Search Input (if in Departemen view) -->
    <div v-if="activeTab === 'departemen'" class="max-w-sm">
      <div class="relative">
        <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchDepartemen"
          type="text"
          placeholder="Cari departemen..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white outline-none"
        />
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Karyawan Table -->
      <div v-if="activeTab === 'karyawan'" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th class="py-3.5 px-6">NO</th>
              <th class="py-3.5 px-6">KARYAWAN</th>
              <th class="py-3.5 px-6">DEPARTEMEN</th>
              <th class="py-3.5 px-6">EMAIL</th>
              <th class="py-3.5 px-6 text-center">STATUS</th>
              <th class="py-3.5 px-6">PROJECT MANAGER</th>
              <th class="py-3.5 px-6 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 font-medium text-gray-700">
            <tr v-for="(k, idx) in filteredKaryawan" :key="k.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-4 px-6">{{ idx + 1 }}</td>
              <td class="py-4 px-6 font-bold text-gray-900">
                <p class="leading-tight">{{ k.nama }}</p>
                <p class="text-[10px] font-normal text-gray-400 mt-0.5">{{ k.jabatan }}</p>
              </td>
              <td class="py-4 px-6">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] font-bold',
                    k.departemen === 'Technology'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-200 text-gray-700',
                  ]"
                >
                  {{ k.departemen }}
                </span>
              </td>
              <td class="py-4 px-6 text-gray-600 max-w-[180px] truncate">{{ k.email }}</td>
              <td class="py-4 px-6 text-center">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {{ k.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-gray-800 font-semibold">{{ k.project_manager || '-' }}</td>
              <td class="py-4 px-6 text-center">
                <button
                  @click="openEditKaryawan(k)"
                  class="px-3 py-1.5 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Departemen Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            <tr>
              <th class="py-3.5 px-6">NO.</th>
              <th class="py-3.5 px-6">NAMA DEPARTEMEN</th>
              <th class="py-3.5 px-6">JUMLAH KARYAWAN</th>
              <th class="py-3.5 px-6 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 font-medium text-gray-700">
            <tr v-for="(dept, idx) in filteredDepartemen" :key="dept.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-4 px-6 font-bold text-gray-900">{{ idx + 1 }}</td>
              <td class="py-4 px-6 font-bold text-gray-900">{{ dept.nama_departemen }}</td>
              <td class="py-4 px-6 text-gray-600">{{ dept.jumlah_karyawan }} orang</td>
              <td class="py-4 px-6 text-center">
                <button
                  @click="openEditDepartemen(dept)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Pagination -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <p>Menampilkan 1-3 dari 30 Karyawan</p>
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

    <!-- POPUP MODAL 1: TAMBAH KARYAWAN BARU (MATCHING USER SCREENSHOT) -->
    <div
      v-if="showAddKaryawanModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Tambah Karyawan Baru
          </h3>
          <button @click="showAddKaryawanModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-gray-800 mb-1">ID Karyawan</label>
            <input
              v-model="karyawanForm.id_karyawan"
              type="text"
              placeholder="Masukkan ID karyawan"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4]"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-800 mb-1">Nama Karyawan</label>
            <input
              v-model="karyawanForm.nama"
              type="text"
              placeholder="Masukkan nama lengkap"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4]"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-800 mb-1">Email</label>
            <input
              v-model="karyawanForm.email"
              type="email"
              placeholder="nama@company.com"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4]"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-800 mb-1">Pilih Departemen</label>
            <div class="relative">
              <select
                v-model="karyawanForm.departemen"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4] text-gray-700 cursor-pointer pr-10"
              >
                <option value="" disabled selected>Pilih Departemen</option>
                <option value="Technology">Technology</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Manajemen Perusahaan">Manajemen Perusahaan</option>
                <option value="IT Support Operation">IT Support Operation</option>
              </select>
              <svg class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <label class="block font-medium text-gray-800 mb-1">Jabatan</label>
            <input
              v-model="karyawanForm.jabatan"
              type="text"
              placeholder="Masukkan jabatan"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4]"
            />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            @click="showAddKaryawanModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveNewKaryawan"
            class="px-6 py-2 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 2: EDIT DATA KARYAWAN (EXACTLY MATCHING SCREENSHOT 1) -->
    <div
      v-if="showEditKaryawanModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 class="text-lg font-bold text-gray-900">
              Edit Data Karyawan
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Perbarui informasi detail karyawan di sistem.
            </p>
          </div>
          <button @click="showEditKaryawanModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form 2 Columns Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Col 1: ID Karyawan -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">ID Karyawan</label>
            <input
              v-model="karyawanForm.id_karyawan"
              type="text"
              class="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
            />
          </div>

          <!-- Col 2: Nama Lengkap -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Nama Lengkap</label>
            <input
              v-model="karyawanForm.nama"
              type="text"
              placeholder="Masukkan nama lengkap"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4]"
            />
          </div>

          <!-- Col 3: Alamat Email -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Alamat Email</label>
            <input
              v-model="karyawanForm.email"
              type="email"
              placeholder="nama@company.com"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4]"
            />
          </div>

          <!-- Col 4: Pilih Departemen -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Pilih Departemen</label>
            <div class="relative">
              <select
                v-model="karyawanForm.departemen"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4] cursor-pointer pr-10"
              >
                <option value="Technology">Technology</option>
                <option value="Product Development">Product Development</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Manajemen Perusahaan">Manajemen Perusahaan</option>
                <option value="IT Support Operation">IT Support Operation</option>
              </select>
              <svg class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Col 5: Jabatan -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Jabatan</label>
            <input
              v-model="karyawanForm.jabatan"
              type="text"
              placeholder="Masukkan jabatan"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4]"
            />
          </div>

          <!-- Empty Col 6 for alignment -->
          <div></div>

          <!-- Col 7 & 8: Status Karyawan Radio Buttons (Full Width) -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-gray-800 mb-1.5">Status Karyawan</label>
            <div class="grid grid-cols-2 gap-4">
              <!-- Aktif -->
              <label
                :class="[
                  'flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  karyawanForm.status === 'Aktif'
                    ? 'border-[#0f4bb4] bg-blue-50/40 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="karyawanForm.status"
                  value="Aktif"
                  class="accent-[#0f4bb4] w-4 h-4"
                />
                <span>Aktif</span>
              </label>

              <!-- Non-aktif -->
              <label
                :class="[
                  'flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  karyawanForm.status === 'Non-aktif'
                    ? 'border-[#0f4bb4] bg-blue-50/40 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="karyawanForm.status"
                  value="Non-aktif"
                  class="accent-[#0f4bb4] w-4 h-4"
                />
                <span>Non-aktif</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            @click="showEditKaryawanModal = false"
            class="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveEditKaryawan"
            class="px-6 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 3: TAMBAH DEPARTEMEN BARU (EXACTLY MATCHING SCREENSHOT 2) -->
    <div
      v-if="showAddDepartemenModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Tambah Departemen Baru
          </h3>
          <button @click="showAddDepartemenModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-gray-800 mb-1">Nama Departemen</label>
            <input
              v-model="departemenForm.nama_departemen"
              type="text"
              placeholder="Contoh: Operasional"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4]"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-800 mb-1">Jumlah Karyawan</label>
            <input
              type="text"
              value="0 orang"
              disabled
              class="w-full px-3.5 py-2.5 bg-[#f0f5ff] border border-transparent rounded-xl text-xs text-gray-700 font-medium outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            @click="showAddDepartemenModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveNewDepartemen"
            class="px-5 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan Departemen
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 4: EDIT DEPARTEMEN (EXACTLY MATCHING SCREENSHOT 3) -->
    <div
      v-if="showEditDepartemenModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Edit Departemen
          </h3>
          <button @click="showEditDepartemenModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-3.5 text-xs">
          <div>
            <label class="block font-medium text-gray-800 mb-1">Nama Departemen</label>
            <input
              v-model="departemenForm.nama_departemen"
              type="text"
              placeholder="IT Department"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4]"
            />
          </div>

          <div>
            <label class="block font-medium text-gray-800 mb-1">Jumlah Karyawan</label>
            <!-- Counter with - and + buttons -->
            <div class="flex items-center gap-2">
              <button
                @click="departemenForm.jumlah_karyawan = Math.max(0, departemenForm.jumlah_karyawan - 1)"
                class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm font-bold cursor-pointer"
              >
                —
              </button>
              <div class="flex-1 h-10 bg-[#f0f5ff] rounded-xl flex items-center justify-center text-xs font-bold text-gray-800">
                <span>{{ departemenForm.jumlah_karyawan }}</span>
                <span class="text-gray-500 font-normal ml-1">Orang</span>
              </div>
              <button
                @click="departemenForm.jumlah_karyawan += 1"
                class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            @click="showEditDepartemenModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveEditDepartemen"
            class="px-5 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 5: Filter Data Karyawan -->
    <div
      v-if="showFilterModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 class="text-base font-bold text-gray-900">Filter Data Karyawan</h3>
          <button @click="showFilterModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-medium text-gray-800 mb-1">Departemen</label>
            <select
              v-model="filterDept"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0f4bb4]"
            >
              <option value="semua">Semua Departemen</option>
              <option value="Technology">Technology</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Manajemen Perusahaan">Manajemen Perusahaan</option>
              <option value="IT Support Operation">IT Support Operation</option>
            </select>
          </div>
          <div>
            <label class="block font-medium text-gray-800 mb-1">Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0f4bb4]"
            >
              <option value="semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-aktif">Non-aktif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            @click="filterDept = 'semua'; filterStatus = 'semua'; showFilterModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer"
          >
            Reset
          </button>
          <button
            @click="showFilterModal = false"
            class="px-5 py-2 text-xs font-bold text-white bg-[#0f4bb4] rounded-xl cursor-pointer"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
