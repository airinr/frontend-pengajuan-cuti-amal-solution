<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";
import Sidebar from "../components/Sidebar.vue";

const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'KaryawanDashboard': 'Dashboard',
    'KaryawanPengajuanCuti': 'Ajuan Cuti',
    'KaryawanStatusPengajuan': 'Status Pengajuan',
    'KaryawanRiwayatCuti': 'Riwayat Cuti',
    'KaryawanKalenderCuti': 'Kalender Cuti',
    'KaryawanProfil': 'Profil'
  }
  return titles[route.name as string] || ''
});

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_type");
  router.push("/login");
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar />

    <div class="flex-1 flex flex-col">
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex justify-end items-center">
          <div class="flex items-center gap-4">
            <div
              class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
            >
              A
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
