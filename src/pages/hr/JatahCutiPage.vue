<script setup lang="ts">
import { ref, computed } from "vue";

const searchQuery = ref("");
const filterDepartemen = ref("semua");
const currentPage = ref(1);
const itemsPerPage = 10;

const mockData = ref([
  {
    id: 1,
    id_karyawan: "010000",
    nama: "Budi Santoso",
    departemen: "Teknologi Informasi",
    cuti_tahunan: 12,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
  {
    id: 2,
    id_karyawan: "020000",
    nama: "Siti Aminah",
    departemen: "Sumber Daya Manusia",
    cuti_tahunan: 12,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
  {
    id: 3,
    id_karyawan: "030000",
    nama: "Rizky Damansyah",
    departemen: "Pemasaran",
    cuti_tahunan: 12,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
  {
    id: 4,
    id_karyawan: "040000",
    nama: "Dewi Lestari",
    departemen: "Operasional",
    cuti_tahunan: 12,
    cuti_terpakai: 0,
    sisa_saldo: 12,
  },
]);

const departemenList = computed(() => {
  const depts = [...new Set(mockData.value.map((d) => d.departemen))];
  return depts.sort();
});

const filteredData = computed(() => {
  return mockData.value.filter((item) => {
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.id_karyawan.includes(searchQuery.value);
    const matchDept =
      filterDepartemen.value === "semua" ||
      item.departemen === filterDepartemen.value;
    return matchSearch && matchDept;
  });
});

const totalItems = computed(() => filteredData.value.length);
const totalPages = computed(
  () => Math.ceil(totalItems.value / itemsPerPage) || 1,
);

const currentData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredData.value.slice(start, start + itemsPerPage);
});

const totalAktif = computed(() => mockData.value.length);
const sedangCuti = computed(
  () =>
    mockData.value.filter(
      (d) => d.cuti_terpakai > 0 && d.sisa_saldo < d.cuti_tahunan,
    ).length,
);

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const showModal = ref(false);
const formDepartemen = ref("semua");
const formKaryawan = ref("semua");
const formTahun = ref(new Date().getFullYear());
const formKuota = ref(12);

const karyawanList = computed(() => {
  if (formDepartemen.value === "semua") return mockData.value;
  return mockData.value.filter((d) => d.departemen === formDepartemen.value);
});

const years = computed(() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - i);
});

const openModal = () => {
  formDepartemen.value = "semua";
  formKaryawan.value = "semua";
  formTahun.value = new Date().getFullYear();
  formKuota.value = 12;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleApply = () => {
  if (formKaryawan.value === "semua") {
    const targets =
      formDepartemen.value === "semua"
        ? mockData.value
        : mockData.value.filter((d) => d.departemen === formDepartemen.value);
    targets.forEach((item) => {
      item.cuti_tahunan = formKuota.value;
      item.sisa_saldo = formKuota.value - item.cuti_terpakai;
    });
  } else {
    const item = mockData.value.find(
      (d) => d.id_karyawan === formKaryawan.value,
    );
    if (item) {
      item.cuti_tahunan = formKuota.value;
      item.sisa_saldo = formKuota.value - item.cuti_terpakai;
    }
  }
  closeModal();
};
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6"
    >
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          Manajemen Jatah Cuti
        </h1>
        <p class="text-sm text-gray-500">
          Pantau dan kelola cuti tahunan, cuti khusus, dan sisa saldo untuk
          seluruh karyawan.
        </p>
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
            type="text"
            placeholder="Cari karyawan berdasarkan nama atau ID..."
            class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        <button
          @click="openModal"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
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
          Tambah Jatah Cuti
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p
          class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
        >
          Total Karyawan Aktif
        </p>
        <p class="text-2xl font-bold text-gray-800">
          {{ totalAktif }}
          <span class="text-sm font-normal text-gray-500">Orang</span>
        </p>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p
          class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
        >
          Karyawan Yang Sedang Cuti
        </p>
        <p class="text-2xl font-bold text-gray-800">
          {{ sedangCuti }}
          <span class="text-sm font-normal text-gray-500">Orang</span>
        </p>
      </div>
    </div>

    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div
        class="p-4 border-b border-gray-100 flex items-center justify-between"
      >
        <h3 class="font-semibold text-gray-800">Daftar Jatah Cuti Karyawan</h3>
        <select
          v-model="filterDepartemen"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="semua">Semua Departemen</option>
          <option v-for="dept in departemenList" :key="dept" :value="dept">
            {{ dept }}
          </option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th
                class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                ID Karyawan
              </th>
              <th
                class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Nama Karyawan
              </th>
              <th
                class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Departemen
              </th>
              <th
                class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Cuti Tahunan
              </th>
              <th
                class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Cuti Terpakai
              </th>
              <th
                class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Sisa Saldo
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="currentData.length === 0">
              <td colspan="6" class="text-center py-8 text-gray-400 text-sm">
                Tidak ada data
              </td>
            </tr>
            <tr
              v-for="item in currentData"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-4 text-sm text-gray-600 font-mono">
                {{ item.id_karyawan }}
              </td>
              <td class="px-5 py-4 text-sm font-medium text-gray-800">
                {{ item.nama }}
              </td>
              <td class="px-5 py-4 text-sm text-gray-600">
                {{ item.departemen }}
              </td>
              <td class="px-5 py-4 text-sm text-gray-600 text-center">
                {{ item.cuti_tahunan }} Hari
              </td>
              <td class="px-5 py-4 text-sm text-gray-600 text-center">
                {{ item.cuti_terpakai }} Hari
              </td>
              <td class="px-5 py-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold',
                    item.sisa_saldo <= 2
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700',
                  ]"
                >
                  {{ item.sisa_saldo }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex items-center justify-between px-5 py-3 border-t border-gray-100"
      >
        <p class="text-xs text-gray-500">
          Menampilkan
          {{
            currentData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
          }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} dari
          {{ totalItems }} karyawan
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

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-800">Tambah Kuota Cuti</h3>
              <button
                @click="closeModal"
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
            <p class="text-sm text-gray-500 mb-5">
              Atur jatah cuti tahunan dan khusus untuk karyawan secara masal
              atau individu.
            </p>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Pilih Departemen
                </label>
                <select
                  v-model="formDepartemen"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="semua">Semua Departemen</option>
                  <option
                    v-for="dept in departemenList"
                    :key="dept"
                    :value="dept"
                  >
                    {{ dept }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Pilih Karyawan
                </label>
                <select
                  v-model="formKaryawan"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="semua">Semua Karyawan</option>
                  <option
                    v-for="k in karyawanList"
                    :key="k.id_karyawan"
                    :value="k.id_karyawan"
                  >
                    {{ k.nama }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Tahun Jatah
                </label>
                <select
                  v-model="formTahun"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option v-for="y in years" :key="y" :value="y">
                    {{ y }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  Jatah Cuti Tahunan
                </label>
                <div class="flex items-center gap-2">
                  <button
                    @click="formKuota = Math.max(0, formKuota - 1)"
                    class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer text-lg font-medium"
                  >
                    -
                  </button>
                  <div
                    class="flex-1 flex items-center justify-center border border-gray-200 rounded-lg py-2"
                  >
                    <span class="text-sm font-medium text-gray-800">{{
                      formKuota
                    }}</span>
                    <span class="text-xs text-gray-500 ml-1">Hari</span>
                  </div>
                  <button
                    @click="formKuota++"
                    class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="handleApply"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Terapkan Perubahan
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
