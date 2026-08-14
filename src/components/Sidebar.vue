<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authApi } from "../services/auth.service";
import type { CurrentUser } from "../types";

const route = useRoute();
const router = useRouter();

const user = ref<CurrentUser | null>(null);

const menuItems = [
  {
    label: "Dashboard",
    icon: "grid",
    route: "/karyawan/dashboard",
  },
  {
    label: "Pengajuan Cuti",
    icon: "file-plus",
    route: "/karyawan/pengajuan-cuti",
  },
  {
    label: "Status Pengajuan",
    icon: "clock",
    route: "/karyawan/status-pengajuan",
  },
  {
    label: "Riwayat Cuti",
    icon: "history",
    route: "/karyawan/riwayat-cuti",
  },
  {
    label: "Kalender Cuti",
    icon: "calendar",
    route: "/karyawan/kalender-cuti",
  },
  {
    label: "Profil",
    icon: "user",
    route: "/karyawan/profil",
  },
];

const isActive = (itemRoute: string) => {
  return route.path === itemRoute;
};

const navigateTo = (itemRoute: string) => {
  router.push(itemRoute);
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

onMounted(async () => {
  try {
    const res = await authApi.me();
    user.value = res.data;
  } catch {
    // silent fail - sidebar will show fallback
  }
});
</script>

<template>
  <aside
    class="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col"
  >
    <div class="p-6 border-b border-gray-100">
      <h1 class="text-xl font-bold text-blue-600 flex items-center gap-2">
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
        </svg>
        AjuanCuti
      </h1>
    </div>

    <nav class="flex-1 p-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.route">
          <button
            @click="navigateTo(item.route)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              isActive(item.route)
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
            ]"
          >
            <svg
              v-if="item.icon === 'grid'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'file-plus'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'clock'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'history'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'calendar'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'user'"
              class="w-5 h-5"
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
            {{ item.label }}
          </button>
        </li>
      </ul>
    </nav>

    <div class="p-4 border-t border-gray-100">
      <div class="flex items-center gap-3 px-4 py-2">
        <div
          class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
        >
          {{ user ? getInitials(user.nama) : "..." }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">
            {{ user?.nama || "Loading..." }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ user?.username ? `${user.username}@company.com` : "" }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
