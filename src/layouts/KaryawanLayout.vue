<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Sidebar from "../components/Sidebar.vue";
import { authApi } from "../services/auth.service";
import type { CurrentUser } from "../types";

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const sidebarOpen = ref(false);
const user = ref<CurrentUser | null>(null);

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  }
);

const toggleLocale = () => {
  const newLocale = locale.value === 'id' ? 'en' : 'id';
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
};

const goToProfile = () => {
  router.push("/karyawan/profil");
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  router.push("/login");
};

onMounted(async () => {
  try {
    const res = await authApi.me();
    user.value = res.data;
  } catch {
    // silent fail
  }
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar :open="sidebarOpen" :user="user" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col lg:ml-0">
      <header class="bg-gray-100 border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-30">
        <div class="flex justify-between items-center">
          <button
            @click="sidebarOpen = true"
            class="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex items-center gap-3 ml-auto">
            <button
              @click="toggleLocale"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {{ locale === 'id' ? 'EN' : 'ID' }}
            </button>
            <div
              @click="goToProfile"
              class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors"
            >
              A
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
