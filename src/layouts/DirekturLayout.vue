<script setup lang="ts">
import { ref, provide, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import DirekturSidebar from "../components/DirekturSidebar.vue";
import { authApi } from "../services/auth.service";
import type { CurrentUser } from "../types";

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();
const sidebarOpen = ref(false);
const user = ref<CurrentUser | null>(null);

provide("sidebarOpen", sidebarOpen);

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
  <div class="flex min-h-screen bg-[#f8fafc]">
    <DirekturSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Navbar / Header -->
      <header class="bg-[#f8fafc] px-4 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <button
          @click="sidebarOpen = true"
          class="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-200/60 rounded-lg cursor-pointer transition-colors"
          aria-label="Open sidebar"
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
          <router-link
            to="/direktur/profil"
            class="w-10 h-10 bg-[#0f4bb4] text-white rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            title="Profil"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </router-link>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 px-4 lg:px-8 pb-8 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
