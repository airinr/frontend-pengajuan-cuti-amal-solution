<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  direkturApi,
  type DepartemenItem,
} from "../../services/direktur.service";
import { authApi } from "../../services/auth.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import type { CurrentUser } from "../../types";

const { t } = useI18n();
const { showError } = useErrorPopup();

interface EmployeeLeaveItem {
  id: number;
  id_karyawan: string;
  nama: string;
  departemen: string;
  cuti_tahunan: number;
  cuti_khusus: number;
  cuti_terpakai: number;
  sisa_saldo: number;
}

const searchQuery = ref("");
const selectedDept = ref("semua");
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const totalKaryawanAktif = ref(0);
const totalKaryawanCuti = ref(0);

const employeeLeaves = ref<EmployeeLeaveItem[]>([]);
const departemenList = ref<DepartemenItem[]>([]);
const currentUser = ref<CurrentUser | null>(null);

// Modal State
const showAdjustModal = ref(false);
const adjustForm = ref({
  tahun: new Date().getFullYear(),
  jatahCutiTahunan: 0,
  keterangan: "",
});
const adjustLoading = ref(false);
const adjustError = ref("");
const adjustSuccess = ref("");

const isFormValid = computed(() => {
  return adjustForm.value.jatahCutiTahunan > 0 && adjustForm.value.keterangan.trim() !== "";
});

const openAdjustModal = () => {
  adjustForm.value = {
    tahun: new Date().getFullYear(),
    jatahCutiTahunan: 0,
    keterangan: "",
  };
  adjustError.value = "";
  adjustSuccess.value = "";
  showAdjustModal.value = true;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [statsRes, daftarRes, deptRes, userRes] = await Promise.allSettled([
      direkturApi.getManajemenJatahCuti(),
      direkturApi.getDaftarCutiKaryawan(),
      direkturApi.getDataDepartemen(),
      authApi.me(),
    ]);

    if (statsRes.status === "fulfilled" && statsRes.value.data) {
      totalKaryawanAktif.value = statsRes.value.data.total_karyawan_aktif ?? 0;
      totalKaryawanCuti.value = statsRes.value.data.total_karyawan_cuti ?? 0;
    }

    if (
      daftarRes.status === "fulfilled" &&
      Array.isArray(daftarRes.value.data)
    ) {
      employeeLeaves.value = daftarRes.value.data.map((item, idx) => ({
        id: idx + 1,
        id_karyawan: (item as any).id_karyawan || `0${idx + 1}0000`,
        nama: item.nama,
        departemen: item.nama_departemen || (item as any).departemen || "-",
        cuti_tahunan: item.total_cuti ?? 12,
        cuti_khusus: 1,
        cuti_terpakai: item.cuti_terpakai ?? 0,
        sisa_saldo:
          item.sisa_cuti ??
          Math.max(0, (item.total_cuti ?? 12) - (item.cuti_terpakai ?? 0)),
      }));
    }

    if (deptRes.status === "fulfilled" && Array.isArray(deptRes.value.data)) {
      departemenList.value = deptRes.value.data;
    }

    if (userRes.status === "fulfilled") {
      currentUser.value = userRes.value.data;
    }
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const totalAktif = computed(
  () => totalKaryawanAktif.value || employeeLeaves.value.length,
);
const sedangCuti = computed(
  () =>
    totalKaryawanCuti.value ||
    employeeLeaves.value.filter(
      (d) => d.cuti_terpakai > 0 && d.sisa_saldo < d.cuti_tahunan,
    ).length,
);

const filteredList = computed(() => {
  return employeeLeaves.value.filter((item) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(q) ||
      item.departemen.toLowerCase().includes(q);
    const matchDept =
      selectedDept.value === "semua" || item.departemen === selectedDept.value;
    return matchSearch && matchDept;
  });
});

const totalItems = computed(() => filteredList.value.length);
const totalPages = computed(
  () => Math.ceil(totalItems.value / itemsPerPage) || 1,
);

const currentData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredList.value.slice(start, start + itemsPerPage);
});

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const handleSaveAdjustment = async () => {
  if (!currentUser.value) {
    adjustError.value = "Data user tidak ditemukan";
    return;
  }

  adjustLoading.value = true;
  adjustError.value = "";
  adjustSuccess.value = "";
  try {
    await direkturApi.tambahCuti({
      id_user: currentUser.value.id_user,
      jumlah_hari: adjustForm.value.jatahCutiTahunan,
      keterangan: adjustForm.value.keterangan || "Penyesuaian kuota cuti",
    });
    adjustSuccess.value =
      "Kuota cuti berhasil ditambahkan untuk semua karyawan";
    await fetchData();
  } catch (err: any) {
    adjustError.value =
      err.response?.data?.detail || "Gagal menambahkan kuota cuti";
  } finally {
    adjustLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Search and Action -->
    <div
      class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          {{ t("leaveQuota.managementTitle") }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Pantau dan kelola alokasi cuti tahunan, cuti khusus, dan sisa saldo
          untuk seluruh karyawan.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative min-w-[280px] sm:min-w-[340px]">
          <svg
            class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
            placeholder="Cari karyawan berdasarkan nama..."
            class="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white outline-none"
          />
        </div>

        <!-- Button Sesuaikan Kuota -->
        <button
          @click="showAdjustModal = true"
          class="flex items-center gap-2 px-5 py-2 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
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
          Sesuaikan Kuota
        </button>
      </div>
    </div>

    <!-- 2 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 lg:gap-6">
      <!-- Total Karyawan Aktif -->
      <div
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
      >
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          TOTAL KARYAWAN AKTIF
        </p>
        <p class="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">
          {{ totalAktif }}
          <span class="text-xs font-medium text-gray-400 ml-1">Orang</span>
        </p>
      </div>
    </div>

    <!-- Table Card: Daftar Jatah Cuti Karyawan -->
    <div
      class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Card Header -->
      <div
        class="p-5 lg:p-6 border-b border-gray-100 flex items-center justify-between"
      >
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
              <option
                v-for="dept in departemenList"
                :key="dept.nama_departemen"
                :value="dept.nama_departemen"
              >
                {{ dept.nama_departemen }}
              </option>
            </select>
            <svg
              class="w-4 h-4 text-[#0f4bb4] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f4bb4]"
        ></div>
      </div>

      <!-- Table Body -->
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead
              class="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider"
            >
              <tr>
                <th class="py-3.5 px-6">NO</th>
                <th class="py-3.5 px-6">NAMA KARYAWAN</th>
                <th class="py-3.5 px-6">DEPARTEMEN</th>
                <th class="py-3.5 px-6 text-center">CUTI TAHUNAN</th>
                <th class="py-3.5 px-6 text-center">CUTI KHUSUS</th>
                <th class="py-3.5 px-6 text-center">CUTI TERPAKAI</th>
                <th class="py-3.5 px-6 text-center">SISA SALDO</th>
              </tr>
            </thead>
            <tbody v-if="currentData.length === 0">
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400 text-xs">
                  Tidak ada data jatah cuti karyawan yang ditemukan.
                </td>
              </tr>
            </tbody>
            <tbody
              v-else
              class="divide-y divide-gray-50 font-medium text-gray-700"
            >
              <tr
                v-for="(item, idx) in currentData"
                :key="item.id"
                class="hover:bg-gray-50/60 transition-colors"
              >
                <td class="py-4 px-6 text-gray-500 text-center">
                  {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>
                <td class="py-4 px-6 font-bold text-gray-900">
                  {{ item.nama }}
                </td>
                <td class="py-4 px-6 text-gray-600">{{ item.departemen }}</td>
                <td class="py-4 px-6 text-center font-bold text-gray-900">
                  {{ item.cuti_tahunan }} Hari
                </td>
                <td class="py-4 px-6 text-center font-semibold text-gray-700">
                  {{ item.cuti_khusus }} Hari
                </td>
                <td class="py-4 px-6 text-center font-semibold text-gray-600">
                  {{ item.cuti_terpakai }} Hari
                </td>
                <td class="py-4 px-6 text-center">
                  <div
                    class="w-10 h-10 rounded-full bg-[#dbeafe] text-[#0f4bb4] flex flex-col items-center justify-center mx-auto shadow-xs font-bold text-[10px] leading-tight"
                  >
                    <span>{{ item.sisa_saldo }}</span>
                    <span class="text-[8px] font-normal">Hari</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer Pagination -->
        <div
          class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500"
        >
          <p>
            Menampilkan
            {{ totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{
              Math.min(currentPage * itemsPerPage, totalItems)
            }}
            dari {{ totalItems }} karyawan
          </p>
          <div v-if="totalPages > 1" class="flex items-center gap-1.5">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer',
                currentPage === page
                  ? 'bg-[#0f4bb4] text-white shadow-sm'
                  : 'hover:bg-gray-100 text-gray-700',
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
      </template>
    </div>

    <!-- POPUP MODAL: SESUAIKAN KUOTA CUTI -->
    <div
      v-if="showAdjustModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">
              Sesuaikan Kuota Cuti
            </h3>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Atur jatah cuti tahunan dan khusus untuk karyawan secara massal
              atau individu.
            </p>
          </div>
          <button
            @click="showAdjustModal = false"
            class="text-gray-400 hover:text-gray-600 cursor-pointer"
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

        <!-- Form Fields -->
        <div class="space-y-4 text-xs pt-1">
          <!-- 1. TAHUN JATAH -->
          <div>
            <label
              class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5"
            >
              TAHUN JATAH
            </label>
            <div class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
              {{ adjustForm.tahun }}
            </div>
          </div>

          <!-- 2. JATAH CUTI TAHUNAN (Counter) -->
          <div>
            <label
              class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5"
            >
              JATAH CUTI TAHUNAN <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <button
                @click="
                  adjustForm.jatahCutiTahunan = Math.max(
                    0,
                    adjustForm.jatahCutiTahunan - 1,
                  )
                "
                class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm font-bold cursor-pointer"
              >
                —
              </button>
              <div
                class="flex-1 h-10 bg-[#f0f5ff] rounded-xl flex items-center justify-center text-xs font-bold text-gray-800"
              >
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

        <!-- 3. KETERANGAN -->
        <div>
          <label
            class="block font-bold text-gray-600 uppercase text-[10px] tracking-wider mb-1.5"
          >
            KETERANGAN <span class="text-red-500">*</span>
          </label>
          <input
            v-model="adjustForm.keterangan"
            type="text"
            placeholder="Contoh: Penyesuaian kuota cuti tahunan"
            class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#0f4bb4]"
          />
        </div>

        <!-- Error/Success Messages -->
        <div
          v-if="adjustError"
          class="p-3 bg-red-50 text-red-600 rounded-xl text-xs"
        >
          {{ adjustError }}
        </div>
        <div
          v-if="adjustSuccess"
          class="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold"
        >
          {{ adjustSuccess }}
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
            :disabled="adjustLoading || !isFormValid"
            class="px-6 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ adjustLoading ? "Menyimpan..." : "Terapkan Perubahan" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
