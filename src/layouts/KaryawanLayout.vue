<script setup lang="ts">
import { ref, provide, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import Sidebar from "../components/Sidebar.vue";

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(false);

provide("sidebarOpen", sidebarOpen);

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  }
);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  router.push("/login");
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

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
          <div class="flex items-center gap-4 ml-auto">
            <div
              class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
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
