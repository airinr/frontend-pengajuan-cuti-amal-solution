import { ref } from "vue";
import i18n from "../i18n";

const { t } = i18n.global;

const isVisible = ref(false);
const errorMessage = ref("");
const errorCode = ref<number | null>(null);

export function useErrorPopup() {
  const showError = (error: any) => {
    if (error?.response?.data?.detail) {
      errorMessage.value = error.response.data.detail;
    } else if (error?.response?.data?.message) {
      errorMessage.value = error.response.data.message;
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
