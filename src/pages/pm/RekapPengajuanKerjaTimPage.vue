<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  pmApi,
  type RekapPengajuanKerjaItem,
} from "../../services/pm.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import { useFormatTanggal } from "../../composables/useFormatTanggal";

const { t } = useI18n();
const { showError } = useErrorPopup();
const { formatTanggal } = useFormatTanggal();

const allList = ref<RekapPengajuanKerjaItem[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredList = computed(() => {
  if (!searchQuery.value) return allList.value;
  return allList.value.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.nama_departemen.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage));

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredList.value.slice(start, start + itemsPerPage);
});

const summary = computed(() => ({
  total: allList.value.length,
  totalPengajuan: allList.value.reduce((sum, item) => sum + item.total_pengajuan, 0),
  disetujui: allList.value.reduce((sum, item) => sum + item.disetujui, 0),
  ditolak: allList.value.reduce((sum, item) => sum + item.ditolak, 0),
}));

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const showModal = ref(false);
const selectedItem = ref<RekapPengajuanKerjaItem | null>(null);

const openDetail = (item: RekapPengajuanKerjaItem) => {
  selectedItem.value = item;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedItem.value = null;
};

onMounted(async () => {
  try {
    const res = await pmApi.getRekapPengajuanKerja();
    allList.value = res.data || [];
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ t('rekapWork.title') }}</h1>
      <p class="text-sm text-gray-500">{{ t('rekapWork.subtitle') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <!-- Summary Card - Left aligned compact -->
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{{ t('rekapWork.totalMembers') }}</p>
            <p class="text-lg font-bold text-gray-800">
              {{ summary.total }}
              <span class="text-xs font-normal text-gray-500">{{ t('approval.activeMembers') }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div class="relative max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            :placeholder="t('approval.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('leaveLog.employee') }}</th>
                <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('leaveLog.department') }}</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('rekapWork.totalSubmissions') }}</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('rekapWork.approved') }}</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('rekapWork.rejected') }}</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{{ t('employee.status') }}</th>
                <th class="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="paginatedList.length === 0">
                <td colspan="7" class="text-center py-8 text-gray-400 text-sm">{{ t('leaveLog.noData') }}</td>
              </tr>
              <tr v-for="(item, index) in paginatedList" :key="index" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                      {{ getInitials(item.nama) }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{ item.nama }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ item.nama_departemen }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 text-center font-medium">{{ item.total_pengajuan }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">{{ item.disetujui }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">{{ item.ditolak }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="['inline-block text-[10px] px-2 py-0.5 rounded-full font-medium', item.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openDetail(item)"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-500">
            {{ t('leaveLog.showing') }}
            {{ filteredList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}
            -{{ Math.min(currentPage * itemsPerPage, filteredList.length) }}
            {{ t('leaveLog.of') }} {{ filteredList.length }}
          </p>
          <div class="flex items-center gap-1">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="['w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer', page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50']">
              {{ page }}
            </button>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ selectedItem?.nama }}</h3>
              <button @click="closeModal" class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">{{ t('rekapWork.workDates') }}</p>
              <div v-if="selectedItem?.tanggal_kerja?.length > 0">
                <div v-for="(tk, i) in selectedItem.tanggal_kerja" :key="i" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm text-gray-700">{{ formatTanggal(tk.tanggal) }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400 text-center py-4">{{ t('leaveLog.noData') }}</p>
            </div>
            <div class="flex justify-end mt-4">
              <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                {{ t('employee.close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
