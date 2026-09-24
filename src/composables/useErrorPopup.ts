import { ref } from "vue";
import i18n from "../i18n";

const { t } = i18n.global;

const isVisible = ref(false);
const errorMessage = ref("");
const errorCode = ref<number | null>(null);

export function useErrorPopup() {
  const showError = (error: any) => {
    const detail = error?.response?.data?.detail || error?.response?.data?.message || '';

    if (detail && (detail.includes('already exists') || detail.includes('sudah ada') || detail.includes('Duplicate'))) {
      errorMessage.value = 'Data sudah digunakan. Silakan gunakan data lain.';
    } else if (error?.response?.status === 422) {
      errorMessage.value = 'Data yang dikirim tidak valid. Periksa kembali isian form.';
    } else if (error?.response?.status >= 500) {
      errorMessage.value = 'Server sedang bermasalah. Silakan coba lagi nanti.';
    } else if (detail) {
      errorMessage.value = detail;
    } else if (error?.message) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = t('network.unknown');
    }
    errorCode.value = error?.response?.status || null;
    isVisible.value = true;
  };

  const closeError = () => {
    isVisible.value = false;
    errorMessage.value = "";
    errorCode.value = null;
  };

  return { isVisible, errorMessage, errorCode, showError, closeError };
}
