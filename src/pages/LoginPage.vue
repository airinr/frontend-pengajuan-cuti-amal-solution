<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../services";
import type { LoginRequest } from "../types";

const router = useRouter();

const emit = defineEmits<{
  switchToRegister: [];
}>();

const form = ref<LoginRequest>({ username: "", password: "" });
const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = null;

  try {
    const response = await authApi.login(form.value);
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("token_type", response.data.token_type);

    const userRes = await authApi.me();
    const role = userRes.data?.role?.toLowerCase();
    console.log("Login role:", role);
    if (role === "pm") {
      router.push("/pm/dashboard");
    } else if (role === "hr") {
      router.push("/hr/dashboard");
    } else {
      router.push("/karyawan/dashboard");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    error.value = err.response?.data?.detail || "Username atau password salah";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-3xl shadow-lg p-8">
        <div class="flex justify-center mb-6">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>

        <div
          v-if="error"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
        >
          {{ error }}
        </div>

        <form @submit="handleSubmit" class="space-y-4">
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
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-sm font-medium text-gray-700"
                >Kata Sandi</label
              >
              <button
                type="button"
                class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Lupa kata sandi?
              </button>
            </div>
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
                placeholder="Masukkan kata sandi"
                required
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

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <div
              v-if="loading"
              class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
            />
            <template v-else>
              Masuk
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

        <p class="mt-6 text-center text-sm text-gray-500">
          Belum punya akun?
          <button
            type="button"
            @click="router.push('/register')"
            class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
