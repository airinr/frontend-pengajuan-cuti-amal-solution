<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  hrApi,
  type RingkasanKaryawan,
  type KaryawanItem,
  type DepartemenItem,
} from "../../services/hr.service";

const activeTab = ref<"karyawan" | "departemen">("karyawan");
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const summary = ref<RingkasanKaryawan>({
  total_karyawan: 0,
  total_departemen: 0,
  total_project_manager: 0,
});
const karyawanList = ref<KaryawanItem[]>([]);
const departemenList = ref<DepartemenItem[]>([]);

const filteredKaryawan = computed(() => {
  if (!searchQuery.value) return karyawanList.value;
  const q = searchQuery.value.toLowerCase();
  return karyawanList.value.filter(
    (item) =>
      item.nama.toLowerCase().includes(q) ||
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
    const [summaryRes, karyawanRes, departemenRes] = await Promise.allSettled([
      hrApi.getDataKaryawanSummary(),
      hrApi.getDataKaryawan(),
      hrApi.getDataDepartemen(),
    ]);
    if (summaryRes.status === "fulfilled")
      summary.value = summaryRes.value.data;
    if (karyawanRes.status === "fulfilled")
      karyawanList.value = karyawanRes.value.data || [];
    if (departemenRes.status === "fulfilled")
      departemenList.value = departemenRes.value.data || [];
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
            {{ summary.total_project_manager }}
            <span class="text-sm font-normal text-gray-500">Terdaftar</span>
          </p>
        </div>
      </div>

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
        </div>
      </div>

      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
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
                <td colspan="7" class="text-center py-8 text-gray-400 text-sm">
                  Tidak ada data
                </td>
              </tr>
              <tr
                v-for="(item, index) in currentData as KaryawanItem[]"
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-500 text-center">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
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
                      item.status === 'Aktif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    ]"
                  >
                    {{ item.status === "Aktif" ? "Aktif" : "Non-aktif" }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
                :key="index"
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
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
  </div>
</template>
