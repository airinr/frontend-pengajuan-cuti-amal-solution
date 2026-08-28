<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../../services/auth.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import type { CurrentUser } from "../../types";

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
const passwordSuccess = ref("");

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
  passwordSuccess.value = "";

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
    passwordSuccess.value = "Kata sandi berhasil diubah";
    setTimeout(() => {
      showPasswordModal.value = false;
      passwordForm.value = { password_lama: "", password_baru: "", konfirmasi: "" };
      passwordSuccess.value = "";
    }, 1200);
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
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f4bb4]"></div>
    </div>

    <!-- Main 2-Column Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Avatar & Role Card (4 Cols) -->
      <div class="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
        <!-- Circle Avatar Placeholder -->
        <div class="w-32 h-32 rounded-full border-4 border-gray-100 bg-gray-50/50 flex items-center justify-center mb-6 text-gray-300 shadow-xs">
          <svg class="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        <h2 class="text-xl font-bold text-gray-900">{{ user?.nama }}</h2>
        <p class="text-xs text-gray-500 mt-1 mb-4">{{ user?.role }}</p>

        <!-- Administrator Aktif Badge -->
        <div class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0f4bb4] text-white rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          ADMINISTRATOR AKTIF
        </div>
      </div>

      <!-- Right Column: Informasi Pribadi & Keamanan (8 Cols) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- 1. Informasi Pribadi Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7">
          <div class="flex items-center gap-2 mb-6">
            <svg class="w-5 h-5 text-[#0f4bb4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 class="text-base font-bold text-gray-900">Informasi Pribadi</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">NAMA LENGKAP</p>
              <p class="text-sm font-bold text-gray-900 mt-1">{{ user?.nama }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">JABATAN</p>
              <p class="text-sm font-bold text-gray-900 mt-1 capitalize">{{ user?.role }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL</p>
              <input
                v-model="profileForm.email"
                type="email"
                placeholder="Masukkan email"
                class="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
              />
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">NOMOR TELEPON</p>
              <input
                v-model="profileForm.no_telp"
                type="text"
                placeholder="Masukkan nomor telepon"
                class="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
              />
            </div>
          </div>
        </div>

        <!-- 2. Keamanan & Preferensi Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7 space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 class="text-base font-bold text-gray-900">Keamanan & Preferensi</h3>
          </div>

          <div class="divide-y divide-gray-50">
            <!-- Ubah Kata Sandi Row -->
            <div
              @click="showPasswordModal = true; passwordError = ''; passwordSuccess = ''"
              class="py-3.5 flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span class="text-xs font-bold text-gray-800">Ubah Kata Sandi</span>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <!-- Bahasa Row -->
            <div class="py-3.5 flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <div>
                  <p class="text-xs font-bold text-gray-800">Bahasa</p>
                  <p class="text-[10px] text-gray-400 font-medium">Bahasa Indonesia</p>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 3. Bottom Action Buttons -->
        <div v-if="successMessage" class="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 rounded-xl text-xs">
          {{ errorMessage }}
        </div>
        <div class="flex items-center justify-end gap-3 pt-2">
          <!-- Keluar Akun Button -->
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#fee2e2] hover:bg-red-200 text-[#ef4444] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Akun
          </button>

          <!-- Simpan Perubahan Button -->
          <button
            @click="handleSaveProfile"
            :disabled="profileLoading"
            class="px-6 py-2.5 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ profileLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
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
        <h3 class="text-base font-bold text-gray-900">Ubah Kata Sandi</h3>

        <div v-if="passwordError" class="p-3 bg-red-50 text-red-600 rounded-xl text-xs">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold">
          {{ passwordSuccess }}
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi Lama</label>
            <input
              v-model="passwordForm.password_lama"
              type="password"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi Baru</label>
            <input
              v-model="passwordForm.password_baru"
              type="password"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              v-model="passwordForm.konfirmasi"
              type="password"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f4bb4] focus:bg-white"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="showPasswordModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            @click="handleChangePassword"
            :disabled="passwordLoading"
            class="px-4 py-2 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {{ passwordLoading ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
