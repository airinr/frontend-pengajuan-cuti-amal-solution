<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { holidayApi, type Holiday } from "../../services/holiday.service";
import { penambahanKerjaApi } from "../../services/penambahanKerja.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { t } = useI18n();
const { showError } = useErrorPopup();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const showSuccessPopup = ref(false);
const holidays = ref<Holiday[]>([]);
const errorMessage = ref("");

const form = ref({
  tanggal_cuti_bersama: "",
  keterangan: "",
});

const currentYear = new Date().getFullYear();

const cutiBersamaDates = ref<Holiday[]>([]);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDropdownLabel = (h: Holiday) => {
  return `${formatDate(h.date)} - ${h.name}`;
};

const handleCancel = () => {
  router.push("/karyawan/dashboard");
};

const handleSubmit = async () => {
  errorMessage.value = "";

  if (!form.value.tanggal_cuti_bersama) {
    errorMessage.value = "Pilih tanggal cuti bersama terlebih dahulu";
    return;
  }

  if (!form.value.keterangan) {
    errorMessage.value = "Alasan tetap bekerja wajib diisi";
    return;
  }

  submitting.value = true;
  try {
    await penambahanKerjaApi.submit({
      tanggal: [form.value.tanggal_cuti_bersama],
      keterangan: form.value.keterangan,
    });
    showSuccessPopup.value = true;
    form.value = { tanggal_cuti_bersama: "", keterangan: "" };
  } catch (err) {
    showError(err);
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await holidayApi.getByYear(currentYear);
    const allHolidays = res.data.data || [];
    const today = new Date().toISOString().split("T")[0];
    cutiBersamaDates.value = allHolidays
      .filter((h) => h.is_cuti_bersama && h.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div class="flex-1">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('workRequest.title') }}</h1>
          <p class="text-sm text-gray-500">
            {{ t('workRequest.subtitle') }}
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('workRequest.selectCollectiveLeave') }} <span class="text-red-500">*</span></label>
              <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  v-model="form.tanggal_cuti_bersama"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Pilih tanggal cuti bersama...</option>
                  <option v-for="h in cutiBersamaDates" :key="h.date" :value="h.date">
                    {{ formatDropdownLabel(h) }}
                  </option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('workRequest.workReason') }} <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.keterangan"
                rows="4"
                placeholder="Jelaskan secara detail alasan Anda perlu tetap bekerja pada tanggal tersebut..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="handleCancel"
              class="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              @click="handleSubmit"
              :disabled="submitting || !form.tanggal_cuti_bersama || !form.keterangan"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {{ submitting ? t('workRequest.submitting') : t('workRequest.submit') }}
            </button>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-80 space-y-4">
        <div class="bg-blue-50 rounded-xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 class="font-bold text-gray-800 text-lg">{{ t('workRequest.policy') }}</h3>
          </div>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <span class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span class="text-sm text-gray-700">
                {{ t('workRequest.noDeduction') }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showSuccessPopup"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="showSuccessPopup = false"
  >
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('workRequest.submitSuccess') }}</h3>
      <p class="text-sm text-gray-500 mb-6">{{ t('workRequest.submitSuccessMsg') }}</p>
      <button
        @click="showSuccessPopup = false"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        {{ t('common.success') }}
      </button>
    </div>
  </div>
</template>
