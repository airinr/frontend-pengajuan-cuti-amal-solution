<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authApi } from "../../services/auth.service";
import {
  departmentApi,
  type Department,
} from "../../services/department.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import type { CurrentUser } from "../../types";

const { t, locale } = useI18n();
const { showError } = useErrorPopup();
const router = useRouter();

const user = ref<CurrentUser | null>(null);
const departments = ref<Department[]>([]);
const loading = ref(true);
const errorMessage = ref("");
const successMessage = ref("");

const departmentName = computed(() => {
  const dept = departments.value.find(
    (d) => d.id_departemen === user.value?.id_departemen,
  );
  return dept?.nama_departemen || "-";
});

const profileForm = ref({
  email: "",
  no_telp: "",
});
const profileLoading = ref(false);

const passwordForm = ref({
  password_lama: "",
  password_baru: "",
  konfirmasi_password_baru: "",
});
const showPasswordForm = ref(false);
const showLanguageModal = ref(false);
const passwordLoading = ref(false);
const passwordError = ref("");
const showPasswordSuccessPopup = ref(false);
const showProfileSuccessPopup = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const currentLanguage = computed(() =>
  locale.value === "id" ? "Bahasa Indonesia" : "English",
);

const roleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    karyawan: "Karyawan",
    pm: "Project Manager",
    hr_manager: "HR Manager",
    staff_hr: "Staff HR",
    direktur: "Direktur",
  };
  return roleMap[user.value?.role || ""] || user.value?.role || "-";
});

const selectLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
  showLanguageModal.value = false;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const profileEmailError = computed(() => {
  if (!profileForm.value.email) return "";
  return emailRegex.test(profileForm.value.email)
    ? ""
    : t("error.invalidEmail");
});

const profilePhoneError = computed(() => {
  if (!profileForm.value.no_telp) return "";
  return /^\d+$/.test(profileForm.value.no_telp) ? "" : t("error.invalidPhone");
});

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

onMounted(async () => {
  try {
    const [userRes, deptRes] = await Promise.all([
      authApi.me(),
      departmentApi.getAll(),
    ]);
    user.value = userRes.data;
    departments.value = deptRes.data || [];
    profileForm.value = {
      email: user.value?.email || "",
      no_telp: user.value?.no_telp || "",
    };
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
});

const handleChangePassword = async () => {
  passwordError.value = "";

  if (
    passwordForm.value.password_baru !==
    passwordForm.value.konfirmasi_password_baru
  ) {
    passwordError.value = t("error.passwordMismatchConfirm");
    return;
  }

  passwordLoading.value = true;
  try {
    await authApi.changePassword(passwordForm.value);
    showPasswordForm.value = false;
    showPasswordSuccessPopup.value = true;
    passwordForm.value = {
      password_lama: "",
      password_baru: "",
      konfirmasi_password_baru: "",
    };
  } catch (err: any) {
    passwordError.value =
      err.response?.data?.detail || t("error.passwordChangeFailed");
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
    const res = await authApi.me();
    user.value = res.data;
    showProfileSuccessPopup.value = true;
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.detail || t("error.profileSaveFailed");
  } finally {
    profileLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">
      {{ t("profile.title") }}
    </h1>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else-if="user" class="space-y-4 lg:space-y-6">
      <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <!-- Left Card - Avatar -->
        <div
          class="w-full lg:w-72 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-6 flex flex-col items-center"
        >
          <div
            class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4"
          >
            {{ getInitials(user.nama) }}
          </div>
          <h2 class="text-lg font-semibold text-gray-800">{{ user.nama }}</h2>
          <p class="text-sm text-gray-500 mb-3">{{ roleLabel }}</p>
          <span
            class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
          >
            {{ user.username.toUpperCase() }}
          </span>
        </div>

        <!-- Right Content -->
        <div class="flex-1 space-y-4 lg:space-y-6">
          <!-- Informasi Akun -->
          <div
            class="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-4 lg:p-6"
          >
            <div class="flex items-center gap-2 mb-4 lg:mb-6">
              <svg
                class="w-5 h-5 text-blue-600"
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
              <h3 class="font-semibold text-gray-800">
                {{ t("profile.accountInfo") }}
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <!-- Non-editable fields -->
              <div>
                <label class="block text-sm text-gray-500 mb-1">{{
                  t("auth.username")
                }}</label>
                <div
                  class="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg"
                >
                  <svg
                    class="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <span class="text-sm text-gray-500">{{ user.username }}</span>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">
                  Diisi oleh perusahaan
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">{{
                  t("employee.department")
                }}</label>
                <div
                  class="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg"
                >
                  <svg
                    class="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <span class="text-sm text-gray-500">{{
                    departmentName
                  }}</span>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">
                  Diisi oleh perusahaan
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1"
                  >Tanggal Bergabung</label
                >
                <div
                  class="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg"
                >
                  <svg
                    class="w-4 h-4 text-gray-400 flex-shrink-0"
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
                  <span class="text-sm text-gray-500">{{
                    user.tanggal_bergabung
                      ? formatDate(user.tanggal_bergabung)
                      : "-"
                  }}</span>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">
                  Diisi oleh perusahaan
                </p>
              </div>
              <div></div>

              <!-- Editable fields -->
              <div>
                <label class="block text-sm text-gray-500 mb-1"
                  >Email <span class="text-red-500">*</span></label
                >
                <input
                  v-model="profileForm.email"
                  type="email"
                  autocomplete="email"
                  placeholder="email@example.com"
                  :class="[
                    'w-full px-4 py-3 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white',
                    profileEmailError
                      ? 'border border-red-300'
                      : 'border border-blue-200',
                  ]"
                />
                <p v-if="profileEmailError" class="text-xs text-red-500 mt-1">
                  {{ profileEmailError }}
                </p>
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1"
                  >{{ t("employee.phone") }}
                  <span class="text-red-500">*</span></label
                >
                <input
                  v-model="profileForm.no_telp"
                  type="text"
                  autocomplete="off"
                  placeholder="08xxxxxxxxxx"
                  :class="[
                    'w-full px-4 py-3 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white',
                    profilePhoneError
                      ? 'border border-red-300'
                      : 'border border-blue-200',
                  ]"
                />
                <p v-if="profilePhoneError" class="text-xs text-red-500 mt-1">
                  {{ profilePhoneError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Keamanan & Preferensi -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
          >
            <div class="flex items-center gap-2 mb-4 lg:mb-6">
              <svg
                class="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 class="font-semibold text-gray-800">
                {{ t("profile.security") }}
              </h3>
            </div>

            <div class="space-y-4">
              <!-- Change Password -->
              <button
                @click="showPasswordForm = !showPasswordForm"
                class="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div
                  class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">
                    {{ t("profile.changePassword") }}
                  </p>
                </div>
              </button>

              <!-- Language Toggle -->
              <button
                @click="showLanguageModal = true"
                class="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div
                  class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">
                    {{ t("profile.language") }}
                  </p>
                  <p class="text-xs text-gray-500">{{ currentLanguage }}</p>
                </div>
              </button>
            </div>

            <!-- Password Form -->
            <div
              v-if="showPasswordForm"
              class="mt-6 pt-6 border-t border-gray-100"
            >
              <div
                v-if="passwordError"
                class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
              >
                {{ passwordError }}
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{
                    t("profile.oldPassword")
                  }}</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.password_lama"
                      :type="showOldPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="showOldPassword = !showOldPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg
                        v-if="showOldPassword"
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{
                    t("profile.newPassword")
                  }}</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.password_baru"
                      :type="showNewPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg
                        v-if="showNewPassword"
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{
                    t("profile.confirmNewPassword")
                  }}</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.konfirmasi_password_baru"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg
                        v-if="showConfirmPassword"
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="flex justify-end gap-3">
                  <button
                    @click="showPasswordForm = false"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {{ t("common.cancel") }}
                  </button>
                  <button
                    @click="handleChangePassword"
                    :disabled="passwordLoading"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
          </div>
        </div>
      </div>

      <!-- Bottom Buttons -->
      <div
        v-if="successMessage"
        class="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600"
      >
        {{ successMessage }}
      </div>
      <div
        v-if="errorMessage && !loading"
        class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button
          @click="handleLogout"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
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
        <button
          @click="handleSaveProfile"
          :disabled="profileLoading"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          {{ profileLoading ? t("profile.saving") : t("profile.saveChanges") }}
        </button>
      </div>
    </div>

    <!-- Language Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLanguageModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showLanguageModal = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">
                {{ t("profile.language") }}
              </h3>
              <button
                @click="showLanguageModal = false"
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

            <div class="space-y-2">
              <button
                @click="selectLanguage('id')"
                :class="[
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                  locale === 'id'
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'border-2 border-gray-200 hover:bg-gray-50',
                ]"
              >
                <span class="text-2xl">🇮🇩</span>
                <div>
                  <p class="text-sm font-medium text-gray-800">
                    Bahasa Indonesia
                  </p>
                </div>
                <svg
                  v-if="locale === 'id'"
                  class="w-5 h-5 text-blue-600 ml-auto"
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
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                  locale === 'en'
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'border-2 border-gray-200 hover:bg-gray-50',
                ]"
              >
                <span class="text-2xl">🇬🇧</span>
                <div>
                  <p class="text-sm font-medium text-gray-800">English</p>
                </div>
                <svg
                  v-if="locale === 'en'"
                  class="w-5 h-5 text-blue-600 ml-auto"
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
      </Transition>
    </Teleport>

    <!-- Profile Saved Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showProfileSuccessPopup"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="showProfileSuccessPopup = false"
        >
          <div
            class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
          >
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              {{ t("profile.updateSuccess") }}
            </h3>
            <p class="text-sm text-gray-500 mb-6">
              {{ t("profile.updateSuccessMsg") }}
            </p>
            <button
              @click="showProfileSuccessPopup = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Password Changed Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showPasswordSuccessPopup"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="handleLogout"
        >
          <div
            class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
          >
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              {{ t("error.passwordChanged") }}
            </h3>
            <p class="text-sm text-gray-500 mb-6">
              Silakan login kembali dengan kata sandi baru.
            </p>
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
