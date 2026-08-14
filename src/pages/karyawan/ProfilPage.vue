<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../../services/auth.service'
import type { CurrentUser } from '../../types'

const router = useRouter()

const user = ref<CurrentUser | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const passwordForm = ref({
  password_lama: '',
  password_baru: '',
  konfirmasi_password_baru: ''
})
const showPasswordForm = ref(false)
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

onMounted(async () => {
  try {
    const res = await authApi.me()
    user.value = res.data
  } catch {
    errorMessage.value = 'Gagal memuat data profil'
  } finally {
    loading.value = false
  }
})

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (passwordForm.value.password_baru !== passwordForm.value.konfirmasi_password_baru) {
    passwordError.value = 'Konfirmasi password baru tidak cocok'
    return
  }

  passwordLoading.value = true
  try {
    await authApi.changePassword(passwordForm.value)
    passwordSuccess.value = 'Password berhasil diubah'
    passwordForm.value = { password_lama: '', password_baru: '', konfirmasi_password_baru: '' }
    showPasswordForm.value = false
  } catch (err: any) {
    passwordError.value = err.response?.data?.detail || 'Gagal mengubah password'
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('token_type')
  router.push('/login')
}
</script>

<template>
  <div>
    <h1 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">Profil Pengguna</h1>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="user" class="space-y-4 lg:space-y-6">
      <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <!-- Left Card - Avatar -->
        <div class="w-full lg:w-72 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-6 flex flex-col items-center">
          <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
            {{ getInitials(user.nama) }}
          </div>
          <h2 class="text-lg font-semibold text-gray-800">{{ user.nama }}</h2>
          <p class="text-sm text-gray-500 mb-3">{{ user.role === 'karyawan' ? 'Karyawan' : 'Admin' }}</p>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {{ user.username.toUpperCase() }}
          </span>
        </div>

        <!-- Right Content -->
        <div class="flex-1 space-y-4 lg:space-y-6">
          <!-- Informasi Akun -->
          <div class="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-4 lg:p-6">
            <div class="flex items-center gap-2 mb-4 lg:mb-6">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 class="font-semibold text-gray-800">Informasi Akun</h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label class="block text-sm text-gray-500 mb-1">Email</label>
                <div class="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm text-gray-700">-</span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Nomor Telepon</label>
                <div class="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-sm text-gray-700">-</span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Departemen</label>
                <div class="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span class="text-sm text-gray-700">{{ user.id_departemen }}</span>
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-1">Tanggal Bergabung</label>
                <div class="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm text-gray-700">-</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Keamanan & Preferensi -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div class="flex items-center gap-2 mb-4 lg:mb-6">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 class="font-semibold text-gray-800">Keamanan & Preferensi</h3>
            </div>

            <div class="space-y-4">
              <button
                @click="showPasswordForm = !showPasswordForm"
                class="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">Ubah Kata Sandi</p>
                  <p class="text-xs text-gray-500">Terakhir diubah 3 bulan lalu</p>
                </div>
              </button>

              <div class="flex items-center gap-3 p-3">
                <div class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">Bahasa</p>
                  <p class="text-xs text-gray-500">Bahasa Indonesia</p>
                </div>
              </div>
            </div>

            <!-- Password Form -->
            <div v-if="showPasswordForm" class="mt-6 pt-6 border-t border-gray-100">
              <div v-if="passwordError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {{ passwordError }}
              </div>
              <div v-if="passwordSuccess" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                {{ passwordSuccess }}
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                  <input
                    v-model="passwordForm.password_lama"
                    type="password"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input
                    v-model="passwordForm.password_baru"
                    type="password"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <input
                    v-model="passwordForm.konfirmasi_password_baru"
                    type="password"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="flex justify-end gap-3">
                  <button
                    @click="showPasswordForm = false"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    @click="handleChangePassword"
                    :disabled="passwordLoading"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {{ passwordLoading ? 'Menyimpan...' : 'Ubah Password' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Buttons -->
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <button
          @click="handleLogout"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar Akun
        </button>
        <button
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Simpan Perubahan
        </button>
      </div>
    </div>
  </div>
</template>
