<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authApi } from "../../services/auth.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import type { CurrentUser } from "../../types";

const { t, locale } = useI18n();
const { showError } = useErrorPopup();
const router = useRouter();

const user = ref<CurrentUser | null>(null);
const loading = ref(true);
const successMessage = ref("");
const errorMessage = ref("");

const profileForm = ref({
  email: "",
  no_telp: "",
});
const profileLoading = ref(false);

const showPasswordModal = ref(false);
const passwordForm = ref({
  password_lama: "",
  password_baru: "",
  konfirmasi: "",
});
const passwordLoading = ref(false);
const passwordError = ref("");
const showPasswordSuccessPopup = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const showLanguageModal = ref(false);

const currentLanguage = computed(() =>
  locale.value === "id" ? "Bahasa Indonesia" : "English",
);

const roleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    karyawan: 'Karyawan',
    pm: 'Project Manager',
    hr_manager: 'HR Manager',
    staff_hr: 'Staff HR',
    direktur: 'Direktur',
  };
  return roleMap[user.value?.role || ''] || user.value?.role || '-';
});

const selectLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
  showLanguageModal.value = false;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const profileEmailError = computed(() => {
  if (!profileForm.value.email) return '';
  return emailRegex.test(profileForm.value.email) ? '' : t('error.invalidEmail');
});

const profilePhoneError = computed(() => {
  if (!profileForm.value.no_telp) return '';
  return /^\d+$/.test(profileForm.value.no_telp) ? '' : t('error.invalidPhone');
});

const fetchProfile = async () => {
  loading.value = true;
  try {
    const res = await authApi.me();
    user.value = res.data;
    profileForm.value = {
      email: user.value?.email || "",
      no_telp: user.value?.no_telp || "",
    };
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  passwordError.value = "";

  if (passwordForm.value.password_baru !== passwordForm.value.konfirmasi) {
    passwordError.value = "Konfirmasi kata sandi baru tidak cocok";
    return;
  }

  passwordLoading.value = true;
  try {
    await authApi.changePassword({
      password_lama: passwordForm.value.password_lama,
      password_baru: passwordForm.value.password_baru,
      konfirmasi_password_baru: passwordForm.value.konfirmasi,
    });
    showPasswordModal.value = false;
    showPasswordSuccessPopup.value = true;
    passwordForm.value = { password_lama: "", password_baru: "", konfirmasi: "" };
  } catch (err: any) {
    passwordError.value = err.response?.data?.detail || "Gagal mengubah kata sandi";
  } finally {
    passwordLoading.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  router.push("/login");
};

const handleSaveProfile = async () => {
  profileLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";
  try {
    await authApi.updateProfile(profileForm.value);
    successMessage.value = "Profil berhasil disimpan";
    const res = await authApi.me();
    user.value = res.data;
  } catch (err: any) {
    errorMessage.value = err.response?.data?.detail || "Gagal menyimpan profil";
  } finally {
    profileLoading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f4bb4]"
      ></div>
    </div>

    <!-- Main 2-Column Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Avatar & Role Card (4 Cols) -->
      <div
        class="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center"
      >
        <!-- Circle Avatar Placeholder -->
        <div
          class="w-32 h-32 rounded-full border-4 border-gray-100 bg-gray-50/50 flex items-center justify-center mb-6 text-gray-300 shadow-xs"
        >
          <svg
            class="w-16 h-16 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>

        <h2 class="text-xl font-bold text-gray-900">{{ user?.nama }}</h2>
        <p class="text-xs text-gray-500 mt-1 mb-4">{{ roleLabel }}</p>

        <!-- Administrator Aktif Badge -->
      </div>

      <!-- Right Column: Informasi Pribadi & Keamanan (8 Cols) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- 1. Informasi Pribadi Card -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7"
        >
          <div class="flex items-center gap-2 mb-6">
            <svg
              class="w-5 h-5 text-[#0f4bb4]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 class="text-base font-bold text-gray-900">
              {{ t("profile.accountInfo") }}
            </h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p
                class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                {{ t("auth.fullName") }}
              </p>
              <p class="text-sm font-bold text-gray-900 mt-1">
                {{ user?.nama }}
              </p>
            </div>
            <div>
              <p
                class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                {{ t("employee.position") }}
              </p>
              <p class="text-sm font-bold text-gray-900 mt-1 capitalize">
                {{ user?.role }}
              </p>
            </div>
            <div>
              <p
                class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                Email
              </p>
              <input
                v-model="profileForm.email"
                type="email"
                autocomplete="email"
                placeholder="Masukkan email"
                :class="['w-full mt-1 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white', profileEmailError ? 'border border-red-300' : 'border border-gray-200']"
              />
              <p v-if="profileEmailError" class="text-xs text-red-500 mt-1">{{ profileEmailError }}</p>
            </div>
            <div>
              <p
                class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                {{ t("employee.phone") }}
              </p>
              <input
                v-model="profileForm.no_telp"
                type="text"
                autocomplete="off"
                placeholder="Masukkan nomor telepon"
                :class="['w-full mt-1 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white', profilePhoneError ? 'border border-red-300' : 'border border-gray-200']"
              />
              <p v-if="profilePhoneError" class="text-xs text-red-500 mt-1">{{ profilePhoneError }}</p>
            </div>
          </div>
        </div>

        <!-- 2. Keamanan & Preferensi Card -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7 space-y-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <svg
              class="w-5 h-5 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h3 class="text-base font-bold text-gray-900">
              {{ t("profile.security") }}
            </h3>
          </div>

          <div class="divide-y divide-gray-50">
            <!-- Ubah Kata Sandi Row -->
            <div
              @click="
                showPasswordModal = true;
                passwordError = '';
                passwordSuccess = '';
              "
              class="py-3.5 flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-4 h-4 text-gray-700"
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
                <span class="text-xs font-bold text-gray-800">{{
                  t("profile.changePassword")
                }}</span>
              </div>
              <svg
                class="w-4 h-4 text-gray-400"
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
            </div>

            <!-- Bahasa Row -->
            <div
              @click="showLanguageModal = true"
              class="py-3.5 flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-4 h-4 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <div>
                  <p class="text-xs font-bold text-gray-800">
                    {{ t("profile.language") }}
                  </p>
                  <p class="text-[10px] text-gray-400 font-medium">
                    {{ currentLanguage }}
                  </p>
                </div>
              </div>
              <svg
                class="w-4 h-4 text-gray-400"
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
            </div>
          </div>
        </div>

        <!-- 3. Bottom Action Buttons -->
        <div
          v-if="successMessage"
          class="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold"
        >
          {{ successMessage }}
        </div>
        <div
          v-if="errorMessage"
          class="p-3 bg-red-50 text-red-600 rounded-xl text-xs"
        >
          {{ errorMessage }}
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <!-- Keluar Akun Button -->
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#fee2e2] hover:bg-red-200 text-[#ef4444] rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {{ t("profile.logout") }}
          </button>

          <!-- Simpan Perubahan Button -->
          <button
            @click="handleSaveProfile"
            :disabled="profileLoading"
            class="px-6 py-2.5 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{
              profileLoading ? t("profile.saving") : t("profile.saveChanges")
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ubah Kata Sandi -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-gray-900">
          {{ t("profile.changePassword") }}
        </h3>

        <div
          v-if="passwordError"
          class="p-3 bg-red-50 text-red-600 rounded-xl text-xs"
        >
          {{ passwordError }}
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">{{
              t("profile.oldPassword")
            }}</label>
            <div class="relative">
              <input
                v-model="passwordForm.password_lama"
                :type="showOldPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                class="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
              />
              <button type="button" @click="showOldPassword = !showOldPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg v-if="showOldPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">{{
              t("profile.newPassword")
            }}</label>
            <div class="relative">
              <input
                v-model="passwordForm.password_baru"
                :type="showNewPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
              />
              <button type="button" @click="showNewPassword = !showNewPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg v-if="showNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">{{
              t("profile.confirmNewPassword")
            }}</label>
            <div class="relative">
              <input
                v-model="passwordForm.konfirmasi"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                class="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
              />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg v-if="showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="showPasswordModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="handleChangePassword"
            :disabled="passwordLoading"
            class="px-4 py-2 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {{
              passwordLoading
                ? t("profile.saving")
                : t("profile.changePassword")
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Language Modal -->
    <div
      v-if="showLanguageModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      @click.self="showLanguageModal = false"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-gray-900">
            {{ t("profile.language") }}
          </h3>
          <button
            @click="showLanguageModal = false"
            class="text-gray-400 hover:text-gray-600 cursor-pointer"
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

        <div class="space-y-2">
          <button
            @click="selectLanguage('id')"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
              locale === 'id'
                ? 'bg-blue-50 border-2 border-[#0f4bb4]'
                : 'border-2 border-gray-200 hover:bg-gray-50',
            ]"
          >
            <span class="text-2xl">🇮🇩</span>
            <div>
              <p class="text-xs font-bold text-gray-800">Bahasa Indonesia</p>
            </div>
            <svg
              v-if="locale === 'id'"
              class="w-4 h-4 text-[#0f4bb4] ml-auto"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              />
            </svg>
          </button>

          <button
            @click="selectLanguage('en')"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
              locale === 'en'
                ? 'bg-blue-50 border-2 border-[#0f4bb4]'
                : 'border-2 border-gray-200 hover:bg-gray-50',
            ]"
          >
            <span class="text-2xl">🇬🇧</span>
            <div>
              <p class="text-xs font-bold text-gray-800">English</p>
            </div>
            <svg
              v-if="locale === 'en'"
              class="w-4 h-4 text-[#0f4bb4] ml-auto"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Password Changed Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showPasswordSuccessPopup"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="handleLogout"
        >
          <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('error.passwordChanged') }}</h3>
            <p class="text-sm text-gray-500 mb-6">Silakan login kembali dengan kata sandi baru.</p>
            <button
              @click="handleLogout"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
