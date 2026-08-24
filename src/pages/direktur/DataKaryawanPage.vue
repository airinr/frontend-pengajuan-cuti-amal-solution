<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  direkturApi,
  type KaryawanItem,
  type DepartemenItem,
} from "../../services/direktur.service";

const activeTab = ref<"karyawan" | "departemen">("karyawan");
const searchKaryawan = ref("");
const searchDepartemen = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const summary = ref({ total_karyawan: 0, total_departemen: 0, total_pm: 0 });
const karyawanList = ref<KaryawanItem[]>([]);
const departemenList = ref<DepartemenItem[]>([]);
const departemenOptions = ref<
  { id_departemen: number; nama_departemen: string }[]
>([]);

// Filter states
const showFilterModal = ref(false);
const filterStatus = ref("semua");
const filterDept = ref("semua");

// Karyawan Modal States
const showAddKaryawanModal = ref(false);
const showEditKaryawanModal = ref(false);
const editingKaryawan = ref<KaryawanItem | null>(null);
const karyawanForm = ref({
  id_karyawan: "",
  nama: "",
  email: "",
  id_departemen: 0,
  departemen: "",
  jabatan: "",
  status: "aktif",
});
const karyawanSubmitting = ref(false);

// Departemen Modal States
const showAddDepartemenModal = ref(false);
const showEditDepartemenModal = ref(false);
const editingDepartemen = ref<DepartemenItem | null>(null);
const departemenForm = ref({
  id_departemen: 0,
  nama_departemen: "",
  jumlah_karyawan: 0,
});
const departemenSubmitting = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const [summaryRes, karyawanRes, departemenRes] = await Promise.allSettled([
      direkturApi.getDataKaryawanSummary(),
      direkturApi.getDataKaryawan(),
      direkturApi.getDataDepartemen(),
    ]);

    if (summaryRes.status === "fulfilled" && summaryRes.value.data) {
      summary.value = summaryRes.value.data;
    }
    if (karyawanRes.status === "fulfilled" && Array.isArray(karyawanRes.value.data)) {
      karyawanList.value = karyawanRes.value.data;
    }
    if (departemenRes.status === "fulfilled" && Array.isArray(departemenRes.value.data)) {
      departemenList.value = departemenRes.value.data;
      departemenOptions.value = departemenRes.value.data;
    }
  } catch {
    // silent fail
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const filteredKaryawan = computed(() => {
  return karyawanList.value.filter((k) => {
    const q = searchKaryawan.value.toLowerCase();
    const matchSearch =
      !searchKaryawan.value ||
      k.nama.toLowerCase().includes(q) ||
      k.id_karyawan.toLowerCase().includes(q) ||
      k.email.toLowerCase().includes(q) ||
      (k.departemen && k.departemen.toLowerCase().includes(q));

    const matchStatus =
      filterStatus.value === "semua" ||
      k.status.toLowerCase() === filterStatus.value.toLowerCase();

    const matchDept =
      filterDept.value === "semua" ||
      k.departemen === filterDept.value;

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

const totalItems = computed(() =>
  activeTab.value === "karyawan"
    ? filteredKaryawan.value.length
    : filteredDepartemen.value.length,
);

const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage) || 1,
);

const currentKaryawanData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredKaryawan.value.slice(start, start + itemsPerPage);
});

const currentDepartemenData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredDepartemen.value.slice(start, start + itemsPerPage);
});

const switchTab = (tab: "karyawan" | "departemen") => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const handleAddClick = () => {
  if (activeTab.value === "karyawan") {
    openAddKaryawan();
  } else {
    openAddDepartemen();
  }
};

// Karyawan Actions
const openAddKaryawan = () => {
  editingKaryawan.value = null;
  karyawanForm.value = {
    id_karyawan: "",
    nama: "",
    email: "",
    id_departemen: departemenOptions.value[0]?.id_departemen || 0,
    departemen: departemenOptions.value[0]?.nama_departemen || "",
    jabatan: "",
    status: "aktif",
  };
  showAddKaryawanModal.value = true;
};

const openEditKaryawan = (item: KaryawanItem) => {
  editingKaryawan.value = item;
  const dept = departemenOptions.value.find(
    (d) => d.nama_departemen === item.departemen,
  );
  karyawanForm.value = {
    id_karyawan: item.id_karyawan,
    nama: item.nama,
    email: item.email,
    id_departemen: dept?.id_departemen || 0,
    departemen: item.departemen,
    jabatan: item.jabatan,
    status: item.status,
  };
  showEditKaryawanModal.value = true;
};

const saveNewKaryawan = async () => {
  if (!karyawanForm.value.nama || !karyawanForm.value.email) return;
  karyawanSubmitting.value = true;
  try {
    await direkturApi.createKaryawan({
      id_karyawan: karyawanForm.value.id_karyawan,
      nama: karyawanForm.value.nama,
      email: karyawanForm.value.email,
      id_departemen: karyawanForm.value.id_departemen,
      jabatan: karyawanForm.value.jabatan,
    });
    showAddKaryawanModal.value = false;
    await fetchData();
  } catch {
    // silent fail
  } finally {
    karyawanSubmitting.value = false;
  }
};

const saveEditKaryawan = async () => {
  if (!editingKaryawan.value || !karyawanForm.value.nama || !karyawanForm.value.email) return;
  karyawanSubmitting.value = true;
  try {
    await direkturApi.updateKaryawan(editingKaryawan.value.id_user, {
      nama: karyawanForm.value.nama,
      email: karyawanForm.value.email,
      id_departemen: karyawanForm.value.id_departemen,
      jabatan: karyawanForm.value.jabatan,
      status: karyawanForm.value.status,
    });
    showEditKaryawanModal.value = false;
    editingKaryawan.value = null;
    await fetchData();
  } catch {
    // silent fail
  } finally {
    karyawanSubmitting.value = false;
  }
};

// Departemen Actions
const openAddDepartemen = () => {
  editingDepartemen.value = null;
  departemenForm.value = {
    id_departemen: 0,
    nama_departemen: "",
    jumlah_karyawan: 0,
  };
  showAddDepartemenModal.value = true;
};

const openEditDepartemen = (item: DepartemenItem) => {
  editingDepartemen.value = item;
  departemenForm.value = {
    id_departemen: item.id_departemen,
    nama_departemen: item.nama_departemen,
    jumlah_karyawan: item.jumlah_karyawan || 0,
  };
  showEditDepartemenModal.value = true;
};

const saveNewDepartemen = async () => {
  if (!departemenForm.value.nama_departemen.trim()) return;
  departemenSubmitting.value = true;
  try {
    await direkturApi.createDepartemen({
      nama_departemen: departemenForm.value.nama_departemen,
    });
    showAddDepartemenModal.value = false;
    await fetchData();
  } catch {
    // silent fail
  } finally {
    departemenSubmitting.value = false;
  }
};

const saveEditDepartemen = async () => {
  if (!editingDepartemen.value || !departemenForm.value.nama_departemen.trim()) return;
  departemenSubmitting.value = true;
  try {
    await direkturApi.updateDepartemen(editingDepartemen.value.id_departemen, {
      nama_departemen: departemenForm.value.nama_departemen,
    });
    showEditDepartemenModal.value = false;
    editingDepartemen.value = null;
    await fetchData();
  } catch {
    // silent fail
  } finally {
    departemenSubmitting.value = false;
  }
};

const handleDeptChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const deptId = parseInt(select.value);
  karyawanForm.value.id_departemen = deptId;
  const found = departemenOptions.value.find((d) => d.id_departemen === deptId);
  if (found) {
    karyawanForm.value.departemen = found.nama_departemen;
  }
};
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
          {{ summary.total_karyawan }}
        </p>
      </div>

      <!-- Departemen -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          DEPARTEMEN
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          {{ summary.total_departemen }} <span class="text-xs font-medium text-gray-400 ml-1">Divisi Aktif</span>
        </p>
      </div>

      <!-- Project Manager -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          PROJECT MANAGER
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          {{ summary.total_pm }} <span class="text-xs font-medium text-gray-400 ml-1">Terdaftar</span>
        </p>
      </div>
    </div>

    <!-- Toolbar: Tab + Filter & Tambah Baru -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <!-- Left: Segmented Pill -->
      <div class="flex bg-[#e8eef9] p-1 rounded-xl">
        <button
          @click="switchTab('karyawan')"
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
          @click="switchTab('departemen')"
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
        <!-- Search Input -->
        <div class="relative w-48 sm:w-64">
          <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-if="activeTab === 'karyawan'"
            v-model="searchKaryawan"
            type="text"
            placeholder="Cari karyawan..."
            class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] outline-none shadow-sm"
          />
          <input
            v-else
            v-model="searchDepartemen"
            type="text"
            placeholder="Cari departemen..."
            class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] outline-none shadow-sm"
          />
        </div>

        <button
          v-if="activeTab === 'karyawan'"
          @click="showFilterModal = true"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Data
        </button>
        <button
          @click="handleAddClick"
          class="flex items-center gap-2 px-5 py-2 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Baru
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4bb4]"></div>
      </div>

      <template v-else>
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
            <tbody v-if="currentKaryawanData.length === 0">
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400 text-xs">
                  Tidak ada data karyawan yang ditemukan.
                </td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-gray-50 font-medium text-gray-700">
              <tr v-for="(k, idx) in currentKaryawanData" :key="k.id_user" class="hover:bg-gray-50/60 transition-colors">
                <td class="py-4 px-6">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td class="py-4 px-6 font-bold text-gray-900">
                  <p class="leading-tight">{{ k.nama }}</p>
                  <p class="text-[10px] font-normal text-gray-400 mt-0.5">{{ k.jabatan }}</p>
                </td>
                <td class="py-4 px-6">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {{ k.departemen || '-' }}
                  </span>
                </td>
                <td class="py-4 px-6 text-gray-600 max-w-[180px] truncate">{{ k.email }}</td>
                <td class="py-4 px-6 text-center">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize',
                      k.status.toLowerCase() === 'aktif'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    ]"
                  >
                    {{ k.status }}
                  </span>
                </td>
                <td class="py-4 px-6 text-gray-800 font-semibold">{{ k.nama_pm || '-' }}</td>
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
            <tbody v-if="currentDepartemenData.length === 0">
              <tr>
                <td colspan="4" class="py-12 text-center text-gray-400 text-xs">
                  Tidak ada data departemen yang ditemukan.
                </td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-gray-50 font-medium text-gray-700">
              <tr v-for="(dept, idx) in currentDepartemenData" :key="dept.id_departemen" class="hover:bg-gray-50/60 transition-colors">
                <td class="py-4 px-6 font-bold text-gray-900">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
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
          <p>
            Menampilkan {{ totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} dari {{ totalItems }} {{ activeTab === 'karyawan' ? 'Karyawan' : 'Departemen' }}
          </p>
          <div v-if="totalPages > 1" class="flex items-center gap-1.5">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer',
                currentPage === page
                  ? 'bg-[#0f4bb4] text-white shadow-sm'
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- POPUP MODAL 1: TAMBAH KARYAWAN BARU -->
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
              placeholder="Contoh: 010000"
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
                :value="karyawanForm.id_departemen"
                @change="handleDeptChange"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0f4bb4] focus:ring-1 focus:ring-[#0f4bb4] text-gray-700 cursor-pointer pr-10"
              >
                <option value="0" disabled>Pilih Departemen</option>
                <option
                  v-for="dept in departemenOptions"
                  :key="dept.id_departemen"
                  :value="dept.id_departemen"
                >
                  {{ dept.nama_departemen }}
                </option>
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
            :disabled="karyawanSubmitting"
            class="px-6 py-2 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ karyawanSubmitting ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 2: EDIT DATA KARYAWAN -->
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
              disabled
              class="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-500 outline-none cursor-not-allowed"
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
                :value="karyawanForm.id_departemen"
                @change="handleDeptChange"
                class="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4] cursor-pointer pr-10"
              >
                <option
                  v-for="dept in departemenOptions"
                  :key="dept.id_departemen"
                  :value="dept.id_departemen"
                >
                  {{ dept.nama_departemen }}
                </option>
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

          <!-- Col 7 & 8: Status Karyawan Radio Buttons -->
          <div class="sm:col-span-2">
            <label class="block font-semibold text-gray-800 mb-1.5">Status Karyawan</label>
            <div class="grid grid-cols-2 gap-4">
              <!-- Aktif -->
              <label
                :class="[
                  'flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  karyawanForm.status.toLowerCase() === 'aktif'
                    ? 'border-[#0f4bb4] bg-blue-50/40 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="karyawanForm.status"
                  value="aktif"
                  class="accent-[#0f4bb4] w-4 h-4"
                />
                <span>Aktif</span>
              </label>

              <!-- Non-aktif -->
              <label
                :class="[
                  'flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  karyawanForm.status.toLowerCase() === 'non-aktif' || karyawanForm.status.toLowerCase() === 'nonaktif'
                    ? 'border-[#0f4bb4] bg-blue-50/40 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="karyawanForm.status"
                  value="nonaktif"
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
            :disabled="karyawanSubmitting"
            class="px-6 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ karyawanSubmitting ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 3: TAMBAH DEPARTEMEN BARU -->
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
            :disabled="departemenSubmitting"
            class="px-5 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ departemenSubmitting ? "Menyimpan..." : "Simpan Departemen" }}
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 4: EDIT DEPARTEMEN -->
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
            <label class="block font-medium text-gray-800 mb-1">Jumlah Karyawan Terdaftar</label>
            <div class="w-full px-3.5 py-2.5 bg-[#f0f5ff] rounded-xl text-xs font-bold text-gray-800">
              {{ departemenForm.jumlah_karyawan }} Orang
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
            :disabled="departemenSubmitting"
            class="px-5 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ departemenSubmitting ? "Menyimpan..." : "Simpan Perubahan" }}
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
              <option
                v-for="dept in departemenOptions"
                :key="dept.id_departemen"
                :value="dept.nama_departemen"
              >
                {{ dept.nama_departemen }}
              </option>
            </select>
          </div>
          <div>
            <label class="block font-medium text-gray-800 mb-1">Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0f4bb4]"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-aktif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            @click="filterDept = 'semua'; filterStatus = 'semua'; showFilterModal = false; currentPage = 1"
            class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
          >
            Reset
          </button>
          <button
            @click="showFilterModal = false; currentPage = 1"
            class="px-5 py-2 text-xs font-bold text-white bg-[#0f4bb4] rounded-xl cursor-pointer hover:bg-blue-700"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
