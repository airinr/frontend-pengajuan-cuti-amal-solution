<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  hrApi,
  type KaryawanItem,
  type DepartemenItem,
} from "../../services/hr.service";

const activeTab = ref<"karyawan" | "departemen">("karyawan");
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const summary = ref({ total_karyawan: 0, total_departemen: 0, total_pm: 0 });
const karyawanList = ref<KaryawanItem[]>([]);
const departemenList = ref<DepartemenItem[]>([]);
const departemenOptions = ref<
  { id_departemen: number; nama_departemen: string }[]
>([]);

// Karyawan modal
const showKaryawanModal = ref(false);
const editingKaryawan = ref<KaryawanItem | null>(null);
const karyawanForm = ref({
  id_karyawan: "",
  nama: "",
  email: "",
  id_departemen: 0,
  jabatan: "",
  status: "aktif",
});
const karyawanSubmitting = ref(false);

// Departemen modal
const showDepartemenModal = ref(false);
const editingDepartemen = ref<DepartemenItem | null>(null);
const departemenForm = ref({ nama_departemen: "" });
const departemenSubmitting = ref(false);

const filteredKaryawan = computed(() => {
  if (!searchQuery.value) return karyawanList.value;
  const q = searchQuery.value.toLowerCase();
  return karyawanList.value.filter(
    (item) =>
      item.nama.toLowerCase().includes(q) ||
      item.id_karyawan.toLowerCase().includes(q) ||
      item.departemen.toLowerCase().includes(q),
  );
});

const filteredDepartemen = computed(() => {
  if (!searchQuery.value) return departemenList.value;
  const q = searchQuery.value.toLowerCase();
  return departemenList.value.filter((item) =>
    item.nama_departemen.toLowerCase().includes(q),
  );
});

const currentData = computed(() => {
  const data =
    activeTab.value === "karyawan"
      ? filteredKaryawan.value
      : filteredDepartemen.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  return data.slice(start, start + itemsPerPage);
});

const totalItems = computed(() =>
  activeTab.value === "karyawan"
    ? filteredKaryawan.value.length
    : filteredDepartemen.value.length,
);

const totalPages = computed(
  () => Math.ceil(totalItems.value / itemsPerPage) || 1,
);

const fetchData = async () => {
  loading.value = true;
  try {
    const [summaryRes, karyawanRes, departemenRes, deptOptionsRes] =
      await Promise.allSettled([
        hrApi.getDataKaryawanSummary(),
        hrApi.getDataKaryawan(),
        hrApi.getDataDepartemen(),
        hrApi.getDataDepartemen(),
      ]);
    if (summaryRes.status === "fulfilled")
      summary.value = summaryRes.value.data;
    if (karyawanRes.status === "fulfilled")
      karyawanList.value = karyawanRes.value.data || [];
    if (departemenRes.status === "fulfilled")
      departemenList.value = departemenRes.value.data || [];
    if (deptOptionsRes.status === "fulfilled")
      departemenOptions.value = deptOptionsRes.value.data || [];
  } catch {
    // silent fail
  } finally {
    loading.value = false;
  }
};

const switchTab = (tab: "karyawan" | "departemen") => {
  activeTab.value = tab;
  searchQuery.value = "";
  currentPage.value = 1;
};

const handleSearch = () => {
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// Karyawan CRUD
const openAddKaryawan = () => {
  editingKaryawan.value = null;
  karyawanForm.value = {
    id_karyawan: "",
    nama: "",
    email: "",
    id_departemen: 0,
    jabatan: "",
    status: "aktif",
  };
  showKaryawanModal.value = true;
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
    jabatan: item.jabatan,
    status: item.status,
  };
  showKaryawanModal.value = true;
};

const closeKaryawanModal = () => {
  showKaryawanModal.value = false;
  editingKaryawan.value = null;
};

const handleSaveKaryawan = async () => {
  karyawanSubmitting.value = true;
  try {
    if (editingKaryawan.value) {
      await hrApi.updateKaryawan(editingKaryawan.value.id_user, {
        nama: karyawanForm.value.nama,
        email: karyawanForm.value.email,
        id_departemen: karyawanForm.value.id_departemen,
        jabatan: karyawanForm.value.jabatan,
        status: karyawanForm.value.status,
      });
    } else {
      await hrApi.createKaryawan(karyawanForm.value);
    }
    closeKaryawanModal();
    await fetchData();
  } catch {
    // silent fail
  } finally {
    karyawanSubmitting.value = false;
  }
};

// Departemen CRUD
const openAddDepartemen = () => {
  editingDepartemen.value = null;
  departemenForm.value = { nama_departemen: "" };
  showDepartemenModal.value = true;
};

const openEditDepartemen = (item: DepartemenItem) => {
  editingDepartemen.value = item;
  departemenForm.value = { nama_departemen: item.nama_departemen };
  showDepartemenModal.value = true;
};

const closeDepartemenModal = () => {
  showDepartemenModal.value = false;
  editingDepartemen.value = null;
};

const handleSaveDepartemen = async () => {
  if (!departemenForm.value.nama_departemen.trim()) return;
  departemenSubmitting.value = true;
  try {
    if (editingDepartemen.value) {
      await hrApi.updateDepartemen(
        editingDepartemen.value.id_departemen,
        departemenForm.value,
      );
    } else {
      await hrApi.createDepartemen(departemenForm.value);
    }
    closeDepartemenModal();
    await fetchData();
  } catch {
    // silent fail
  } finally {
    departemenSubmitting.value = false;
  }
};

watch(activeTab, () => {
  searchQuery.value = "";
  currentPage.value = 1;
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Data Karyawan</h1>
      <p class="text-sm text-gray-500">
        Kelola informasi personalia dan alokasi departemen dalam satu dasbor
        terpusat.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p
            class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Total Karyawan
          </p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_karyawan }}
          </p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p
            class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Departemen
          </p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_departemen }}
            <span class="text-sm font-normal text-gray-500">Divisi Aktif</span>
          </p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p
            class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            Project Manager
          </p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_pm }}
            <span class="text-sm font-normal text-gray-500">Terdaftar</span>
          </p>
        </div>
      </div>

      <!-- Toolbar -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
      >
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div class="flex bg-gray-100 rounded-lg p-0.5">
            <button
              @click="switchTab('karyawan')"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                activeTab === 'karyawan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800',
              ]"
            >
              Karyawan
            </button>
            <button
              @click="switchTab('departemen')"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
                activeTab === 'departemen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800',
              ]"
            >
              Departemen
            </button>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative">
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                :placeholder="
                  activeTab === 'karyawan'
                    ? 'Cari karyawan...'
                    : 'Cari departemen...'
                "
                class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button
              @click="
                activeTab === 'karyawan'
                  ? openAddKaryawan()
                  : openAddDepartemen()
              "
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Tambah Baru
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- ========== KARYAWAN TABLE ========== -->
        <div v-if="activeTab === 'karyawan'" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12"
                >
                  No.
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  ID Karyawan
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Nama Lengkap
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Departemen
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Jabatan
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="currentData.length === 0">
                <td colspan="8" class="text-center py-8 text-gray-400 text-sm">
                  Tidak ada data
                </td>
              </tr>
              <tr
                v-for="(item, index) in currentData as KaryawanItem[]"
                :key="item.id_user"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 text-center">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">
                  {{ item.id_karyawan }}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-gray-800">
                  {{ item.nama }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700"
                  >
                    {{ item.departemen }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ item.jabatan }}
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate"
                >
                  {{ item.email }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'inline-block text-[10px] px-2 py-0.5 rounded-full font-medium',
                      item.status === 'aktif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    ]"
                  >
                    {{ item.status === "aktif" ? "Aktif" : "Non-aktif" }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openEditKaryawan(item)"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ========== DEPARTEMEN TABLE ========== -->
        <div v-if="activeTab === 'departemen'" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12"
                >
                  No.
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Nama Departemen
                </th>
                <th
                  class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Jumlah Karyawan
                </th>
                <th
                  class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="currentData.length === 0">
                <td colspan="4" class="text-center py-8 text-gray-400 text-sm">
                  Tidak ada data
                </td>
              </tr>
              <tr
                v-for="(item, index) in currentData as DepartemenItem[]"
                :key="item.id_departemen"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 text-center">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-gray-800">
                  {{ item.nama_departemen }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ item.jumlah_karyawan }} orang
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openEditDepartemen(item)"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
        >
          <p class="text-xs text-gray-500">
            Menampilkan
            {{
              currentData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
            }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} dari
            {{ totalItems }}
            {{ activeTab === "karyawan" ? "Karyawan" : "Departemen" }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
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
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== KARYAWAN MODAL ========== -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showKaryawanModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeKaryawanModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">
                {{
                  editingKaryawan
                    ? "Edit Data Karyawan"
                    : "Tambah Karyawan Baru"
                }}
              </h3>
              <button
                @click="closeKaryawanModal"
                class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p v-if="!editingKaryawan" class="text-sm text-gray-500 mb-4">
              Masukkan informasi karyawan baru ke dalam sistem.
            </p>
            <p v-else class="text-sm text-gray-500 mb-4">
              Perbarui informasi detail karyawan di sistem.
            </p>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >ID Karyawan</label
                >
                <input
                  v-model="karyawanForm.id_karyawan"
                  type="text"
                  :disabled="!!editingKaryawan"
                  placeholder="Masukkan ID karyawan"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{
                  editingKaryawan ? "Nama Lengkap" : "Nama Karyawan"
                }}</label>
                <input
                  v-model="karyawanForm.nama"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Email</label
                >
                <input
                  v-model="karyawanForm.email"
                  type="email"
                  placeholder="nama@company.com"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Pilih Departemen</label
                >
                <select
                  v-model="karyawanForm.id_departemen"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option :value="0" disabled>Pilih Departemen</option>
                  <option
                    v-for="dept in departemenOptions"
                    :key="dept.id_departemen"
                    :value="dept.id_departemen"
                  >
                    {{ dept.nama_departemen }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Jabatan</label
                >
                <input
                  v-model="karyawanForm.jabatan"
                  type="text"
                  placeholder="Masukkan jabatan"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div v-if="editingKaryawan">
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Status Karyawan</label
                >
                <div class="flex gap-3">
                  <label
                    :class="[
                      'flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                      karyawanForm.status === 'aktif'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="karyawanForm.status"
                      value="aktif"
                      class="sr-only"
                    />
                    <span
                      class="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                      :class="
                        karyawanForm.status === 'aktif'
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="karyawanForm.status === 'aktif'"
                        class="w-1.5 h-1.5 bg-blue-500 rounded-full"
                      ></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                  <label
                    :class="[
                      'flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                      karyawanForm.status === 'non-aktif'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="karyawanForm.status"
                      value="non-aktif"
                      class="sr-only"
                    />
                    <span
                      class="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                      :class="
                        karyawanForm.status === 'non-aktif'
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="karyawanForm.status === 'non-aktif'"
                        class="w-1.5 h-1.5 bg-blue-500 rounded-full"
                      ></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700"
                      >Non-aktif</span
                    >
                  </label>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                @click="closeKaryawanModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="handleSaveKaryawan"
                :disabled="karyawanSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{
                  karyawanSubmitting
                    ? "Menyimpan..."
                    : editingKaryawan
                      ? "Simpan Perubahan"
                      : "Simpan"
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ========== DEPARTEMEN MODAL ========== -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDepartemenModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeDepartemenModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">
                {{
                  editingDepartemen
                    ? "Edit Departemen"
                    : "Tambah Departemen Baru"
                }}
              </h3>
              <button
                @click="closeDepartemenModal"
                class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Nama Departemen</label
                >
                <input
                  v-model="departemenForm.nama_departemen"
                  type="text"
                  :placeholder="editingDepartemen ? '' : 'Contoh: Operasional'"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div v-if="editingDepartemen">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Jumlah Karyawan</label
                >
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500"
                    >{{ editingDepartemen.jumlah_karyawan }} orang</span
                  >
                </div>
              </div>
              <div v-else>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Jumlah Karyawan</label
                >
                <input
                  type="text"
                  value="0 orang"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                @click="closeDepartemenModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="handleSaveDepartemen"
                :disabled="
                  !departemenForm.nama_departemen.trim() || departemenSubmitting
                "
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{
                  departemenSubmitting
                    ? "Menyimpan..."
                    : editingDepartemen
                      ? "Simpan Perubahan"
                      : "Simpan Departemen"
                }}
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
