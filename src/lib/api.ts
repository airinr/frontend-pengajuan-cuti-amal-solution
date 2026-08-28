import axios from "axios";

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
    if (error.response?.status === 401 && !isRedirecting) {
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
      return 'Permintaan melewati batas waktu. Server mungkin sedang lambat.';
    }
    if (error.message === 'Network Error' || !navigator.onLine) {
      return 'Tidak ada koneksi ke server. Periksa jaringan Anda.';
    }
    return 'Tidak dapat terhubung ke server.';
  }

  const status = error.response.status;
  if (status === 403) return 'Anda tidak memiliki akses ke data ini.';
  if (status === 404) return 'Data tidak ditemukan.';
  if (status >= 500) return 'Server sedang bermasalah. Silakan coba lagi nanti.';

  return error.response?.data?.detail || error.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.';
}

export default api;
