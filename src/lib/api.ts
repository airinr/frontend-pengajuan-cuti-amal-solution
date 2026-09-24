import axios from "axios";
import i18n from "../i18n";

const { t } = i18n.global;

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRedirecting = false;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting && window.location.pathname !== "/login") {
      isRedirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export function getNetworkErrorMessage(error: any): string {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return t('network.timeout');
    }
    if (error.message === 'Network Error' || !navigator.onLine) {
      return t('network.noConnection');
    }
    return t('network.cannotConnect');
  }

  const status = error.response.status;
  if (status === 403) return t('network.forbidden');
  if (status === 404) return t('network.notFound');
  if (status >= 500) return t('network.serverError');

  return error.response?.data?.detail || error.response?.data?.message || t('network.unknown');
}

export default api;
