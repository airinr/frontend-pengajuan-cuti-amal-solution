<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authApi } from "../services";
import type { LoginRequest } from "../types";

const { t } = useI18n();
const router = useRouter();

onMounted(() => {
  localStorage.clear();
  sessionStorage.clear();
});

const emit = defineEmits<{
  switchToRegister: [];
}>();

const form = ref<LoginRequest>({ username: "", password: "" });
const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

const showForgotPasswordConfirm = ref(false);
const forgotPasswordLoading = ref(false);
const showForgotPasswordSuccess = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = null;

  try {
    const response = await authApi.login(form.value);
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("token_type", response.data.token_type);

    const payload = JSON.parse(atob(response.data.access_token.split('.')[1]));
    const role = payload.role?.toLowerCase();
    if (role === "pm") {
      router.push("/pm/dashboard");
    } else if (role === "hr_manager") {
      router.push("/hr/dashboard");
    } else if (role === "direktur") {
      router.push("/direktur/dashboard");
    } else if (role === "staff_hr") {
      router.push("/staff_hr/dashboard");
    } else {
      router.push("/karyawan/dashboard");
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || t('error.loginFailed');
  } finally {
    loading.value = false;
  }
};

const openForgotPasswordConfirm = () => {
  if (!form.value.username.trim()) {
    error.value = t('error.usernameRequired');
    return;
  }
  error.value = null;
  showForgotPasswordConfirm.value = true;
};

const closeForgotPasswordConfirm = () => {
  showForgotPasswordConfirm.value = false;
};

const handleForgotPassword = async () => {
  forgotPasswordLoading.value = true;
  try {
    await authApi.forgotPassword({ username: form.value.username });
    showForgotPasswordConfirm.value = false;
    showForgotPasswordSuccess.value = true;
  } catch (err: any) {
    showForgotPasswordConfirm.value = false;
    error.value = err.response?.data?.detail || t('error.forgotPasswordFailed');
  } finally {
    forgotPasswordLoading.value = false;
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

        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">{{ t('auth.login') }}</h1>

        <div
          v-if="error"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
        >
          {{ error }}
        </div>

        <form @submit="handleSubmit" class="space-y-4" autocomplete="off">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"
              >{{ t('auth.username') }} <span class="text-red-500">*</span></label
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
                autocomplete="username"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-sm font-medium text-gray-700"
                >{{ t('auth.password') }} <span class="text-red-500">*</span></label
              >
              <button
                type="button"
                @click="openForgotPasswordConfirm"
                class="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {{ t('auth.forgotPassword') }}
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
                autocomplete="new-password"
                class="w-full pl-10 pr-12 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                :placeholder="t('auth.password')"
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
              {{ t('auth.loginButton') }}
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

        <p class="mt-4 text-center text-xs text-gray-400">
          {{ t('auth.accountCreatedBy') }}
        </p>
      </div>
    </div>
  </div>

  <!-- Forgot Password Confirmation Popup -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showForgotPasswordConfirm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeForgotPasswordConfirm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">{{ t('auth.forgotPasswordConfirmTitle') }}</h3>
            <button @click="closeForgotPasswordConfirm" class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="mb-6">
            <div class="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p class="text-sm text-gray-600 text-center">{{ t('auth.forgotPasswordConfirmMsg') }}</p>
            <p class="text-sm font-semibold text-gray-800 text-center mt-2">"{{ form.username }}"</p>
          </div>
          <div class="flex items-center justify-end gap-3">
            <button @click="closeForgotPasswordConfirm" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('common.cancel') }}</button>
            <button @click="handleForgotPassword" :disabled="forgotPasswordLoading" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
              {{ forgotPasswordLoading ? t('auth.sending') : t('auth.send') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Forgot Password Success Popup -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showForgotPasswordSuccess" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showForgotPasswordSuccess = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('auth.forgotPasswordSuccess') }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ t('auth.forgotPasswordSuccessMsg') }}</p>
          <button @click="showForgotPasswordSuccess = false" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
