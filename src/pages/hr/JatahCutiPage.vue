<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  hrApi,
  type ManajemenJatahCuti,
  type DaftarCutiKaryawan,
} from "../../services/hr.service";
import { authApi } from "../../services/auth.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import type { CurrentUser } from "../../types";

const { t } = useI18n();
const { showError } = useErrorPopup();

const searchQuery = ref("");
const filterDepartemen = ref("semua");
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const summary = ref<ManajemenJatahCuti>({
  total_karyawan_aktif: 0,
  total_karyawan_cuti: 0,
});
const daftarList = ref<DaftarCutiKaryawan[]>([]);
const currentUser = ref<CurrentUser | null>(null);

const departemenList = computed(() => {
  const depts = [...new Set(daftarList.value.map((d) => d.nama_departemen))];
  return depts.sort();
});

const filteredData = computed(() => {
  return daftarList.value.filter((item) => {
    const matchSearch =
      !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchDept =
      filterDepartemen.value === "semua" ||
      item.nama_departemen === filterDepartemen.value;
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

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const showModal = ref(false);
const formTahun = ref(new Date().getFullYear());
const formKuota = ref(0);
const formKeterangan = ref("");
const applyLoading = ref(false);
const applyError = ref("");
const applySuccess = ref("");
const showSuccessPopup = ref(false);

const isFormValid = computed(() => {
  return formKuota.value !== 0 && formKeterangan.value.trim() !== "";
});

const openModal = () => {
  formTahun.value = new Date().getFullYear();
  formKuota.value = 0;
  formKeterangan.value = "";
  applyError.value = "";
  applySuccess.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleApply = async () => {
  if (!currentUser.value) {
    applyError.value = t('leaveQuota.userNotFound');
    return;
  }

  applyLoading.value = true;
  applyError.value = "";
  applySuccess.value = "";
  try {
    await hrApi.tambahCuti({
      id_user: currentUser.value.id_user,
      jumlah_hari: formKuota.value,
      keterangan: formKeterangan.value || t('leaveQuota.defaultDescription'),
    });
    closeModal();
    applySuccess.value = formKuota.value < 0 
      ? t('leaveQuota.applySuccessSubtract') 
      : t('leaveQuota.applySuccess');
    showSuccessPopup.value = true;
    await fetchData();
  } catch (err: any) {
    applyError.value = err.response?.data?.detail || t('leaveQuota.applyFailed');
  } finally {
    applyLoading.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [summaryRes, daftarRes, userRes] = await Promise.allSettled([
      hrApi.getManajemenJatahCuti(),
      hrApi.getDaftarCutiKaryawan(),
      authApi.me(),
    ]);
    if (summaryRes.status === "fulfilled")
      summary.value = summaryRes.value.data;
    if (daftarRes.status === "fulfilled")
      daftarList.value = daftarRes.value.data || [];
    if (userRes.status === "fulfilled")
      currentUser.value = userRes.value.data;
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6"
    >
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          {{ t('leaveQuota.managementTitle') }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ t('leaveQuota.subtitle') }}
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
            :placeholder="t('leaveQuota.searchPlaceholder')"
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
          {{ t('leaveQuota.addQuota') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p
            class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            {{ t('leaveQuota.activeEmployees') }}
          </p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_karyawan_aktif }}
            <span class="text-sm font-normal text-gray-500">{{ t('leaveQuota.people') }}</span>
          </p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p
            class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1"
          >
            {{ t('leaveQuota.onLeaveEmployees') }}
          </p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_karyawan_cuti }}
            <span class="text-sm font-normal text-gray-500">{{ t('leaveQuota.people') }}</span>
          </p>
        </div>
      </div>

      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div
          class="p-4 border-b border-gray-100 flex items-center justify-between"
        >
          <h3 class="font-semibold text-gray-800">
            {{ t('leaveQuota.employeeList') }}
          </h3>
          <select
            v-model="filterDepartemen"
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="semua">{{ t('leaveQuota.allDepartments') }}</option>
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
                  class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12"
                >
                  {{ t('leaveQuota.no') }}
                </th>
                <th
                  class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t('leaveQuota.employeeName') }}
                </th>
                <th
                  class="text-left px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t('leaveQuota.department') }}
                </th>
                <th
                  class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t('leaveQuota.annualLeave') }}
                </th>
                <th
                  class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t('leaveQuota.leaveUsed') }}
                </th>
                <th
                  class="text-center px-5 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {{ t('leaveQuota.balance') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="currentData.length === 0">
                <td colspan="6" class="text-center py-8 text-gray-400 text-sm">
                  {{ t('leaveQuota.noData') }}
                </td>
              </tr>
              <tr
                v-for="(item, index) in currentData"
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-4 text-sm text-gray-500 text-center">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-5 py-4 text-sm font-medium text-gray-800">
                  {{ item.nama }}
                </td>
                <td class="px-5 py-4 text-sm text-gray-600">
                  {{ item.nama_departemen }}
                </td>
                <td class="px-5 py-4 text-sm text-gray-600 text-center">
                  {{ item.total_cuti }} {{ t('leaveQuota.days') }}
                </td>
                <td class="px-5 py-4 text-sm text-gray-600 text-center">
                  {{ item.cuti_terpakai }} {{ t('leaveQuota.days') }}
                </td>
                <td class="px-5 py-4 text-center">
                  <span
                    :class="[
                      'inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold',
                      item.sisa_cuti <= 2
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700',
                    ]"
                  >
                    {{ item.sisa_cuti }}
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
            {{ t('leaveQuota.showing') }}
            {{
              currentData.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0
            }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} {{ t('leaveQuota.of') }}
            {{ totalItems }} {{ t('leaveQuota.employees') }}
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

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-800">
                {{ t('leaveQuota.adjustTitle') }}
              </h3>
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
              {{ t('leaveQuota.adjustDescription') }}
            </p>
            <div class="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <svg class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-blue-700">
                {{ t('leaveQuota.quotaNote') }}
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  {{ t('leaveQuota.leaveYear') }}
                </label>
                <div class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-700">
                  {{ formTahun }}
                </div>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  {{ t('leaveQuota.annualQuota') }} <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-2">
                  <button
                    @click="formKuota--"
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
                    <span class="text-xs text-gray-500 ml-1">{{ t('leaveQuota.days') }}</span>
                  </div>
                  <button
                    @click="formKuota++"
                    class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer text-lg font-medium"
                  >
                    +
                  </button>
                </div>
                <p 
                  v-if="formKuota !== 0"
                  class="text-xs mt-2 font-medium"
                  :class="formKuota < 0 ? 'text-red-500' : 'text-green-500'"
                >
                  {{ formKuota < 0 
                    ? t('leaveQuota.subtractInfo', { days: Math.abs(formKuota) }) 
                    : t('leaveQuota.addInfo', { days: formKuota }) 
                  }}
                </p>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1"
                >
                  {{ t('leaveQuota.description') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formKeterangan"
                  type="text"
                  :placeholder="t('leaveQuota.descriptionPlaceholder')"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div v-if="applyError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {{ applyError }}
            </div>
            <div v-if="applySuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {{ applySuccess }}
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {{ t('leaveQuota.cancel') }}
              </button>
              <button
                @click="handleApply"
                :disabled="applyLoading || !isFormValid"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ applyLoading ? t('leaveQuota.saving') : t('leaveQuota.apply') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('common.success') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ applySuccess }}</p>
            <button
              @click="showSuccessPopup = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              {{ t('common.close') }}
            </button>
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
