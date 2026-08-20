<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authApi, departmentApi } from "../services";
import type { RegisterRequest, Department } from "../types";

const emit = defineEmits<{
  switchToLogin: [];
}>();

const form = ref<RegisterRequest>({
  username: "",
  nama: "",
  password: "",
  id_departemen: 0,
});
const confirmPassword = ref("");
const departments = ref<Department[]>([]);
const showPassword = ref(false);
const showConfirm = ref(false);
const agreeTerms = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  departmentApi.getAll().then((res) => (departments.value = res.data));
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  error.value = null;

  if (form.value.password !== confirmPassword.value) {
    error.value = "Password dan konfirmasi password tidak cocok";
    return;
  }

  if (!agreeTerms.value) {
    error.value = "Anda harus menyetujui syarat dan ketentuan";
    return;
  }

  loading.value = true;
  try {
    await authApi.register(form.value);
    emit("switchToLogin");
  } catch (err: any) {
    error.value = err.response?.data?.detail || "Gagal mendaftarkan akun";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div
            class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center"
          >
            <svg
              class="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Buat Akun Baru</h1>
        <p class="text-gray-500 mt-1">
          Bergabung dengan sistem manajemen cuti kami.
        </p>
      </div>

      <div class="bg-white rounded-3xl shadow-lg p-8">
        <div
          v-if="error"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
        >
          {{ error }}
        </div>

        <form @submit="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Nama Lengkap</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    stroke-width="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                v-model="form.nama"
                type="text"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="nama lengkap anda"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Username</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    stroke-width="1.5"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                v-model="form.username"
                type="text"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="nama@perusahaan.com"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Kata Sandi</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    stroke-width="1.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Minimal 8 karakter"
                required
                minlength="8"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg
                  v-if="showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Konfirmasi Kata Sandi</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </span>
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Ulangi kata sandi"
                required
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg
                  v-if="showConfirm"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >Pilih Departemen</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                    stroke-width="1.5"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              <select
                v-model="form.id_departemen"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                required
              >
                <option :value="0" disabled>Pilih Departemen Anda</option>
                <option
                  v-for="dept in departments"
                  :key="dept.id_departemen"
                  :value="dept.id_departemen"
                >
                  {{ dept.nama_departemen }}
                </option>
              </select>
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          </div>

          <label class="flex items-start gap-3 cursor-pointer pt-2">
            <input
              v-model="agreeTerms"
              type="checkbox"
              class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm text-gray-500">
              Saya setuju dengan
              <button
                type="button"
                class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Syarat
              </button>
              dan
              <button
                type="button"
                class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Ketentuan
              </button>
              yang berlaku.
            </span>
          </label>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <div
              v-if="loading"
              class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
            />
            <template v-else>
              Daftar Sekarang
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </template>
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?
        <button
          type="button"
          @click="router.push('/login')"
          class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
        >
          Masuk di sini
        </button>
      </p>
    </div>
  </div>
</template>
