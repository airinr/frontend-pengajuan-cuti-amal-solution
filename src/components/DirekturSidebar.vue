<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authApi, type CurrentUser } from "../services/auth.service";

const props = defineProps<{
  open?: boolean;
  isOpen?: boolean;
}>();

const isSidebarOpen = computed(() => props.open ?? props.isOpen ?? false);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const route = useRoute();
const router = useRouter();

const user = ref<CurrentUser | null>(null);

const direkturMenu = [
  { label: "Dashboard", route: "/direktur/dashboard" },
  { label: "Persetujuan", route: "/direktur/persetujuan" },
  { label: "Log & Rekap Cuti", route: "/direktur/log-rekap-cuti" },
  { label: "Data Karyawan", route: "/direktur/data-karyawan" },
  { label: "Jatah Cuti", route: "/direktur/jatah-cuti" },
  { label: "Kalender & Libur", route: "/direktur/kalender-libur" },
];

const personalMenu = [
  { label: "Profil", route: "/direktur/profil" },
];

const isActive = (itemRoute: string) => {
  return route.path === itemRoute;
};

const navigateTo = (itemRoute: string) => {
  router.push(itemRoute);
  emit("close");
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
    // silent fail
  }
});
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isSidebarOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-200"
    />

    <!-- Sidebar Container -->
    <aside
      :class="[
        'fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:shrink-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo Header -->
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#0f4bb4] rounded-xl flex items-center justify-center text-white shadow-sm">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-[#0f4bb4] tracking-tight">
            AjuanCuti
          </h1>
        </div>
        <button
          @click="emit('close')"
          class="lg:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 p-4 overflow-y-auto">
        <!-- Direktur Admin -->
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
          DIREKTUR ADMIN
        </p>
        <ul class="space-y-1 mb-6">
          <li v-for="item in direkturMenu" :key="item.route">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer',
                isActive(item.route)
                  ? 'bg-[#0f4bb4] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ]"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>

        <!-- Personal -->
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
          PERSONAL
        </p>
        <ul class="space-y-1">
          <li v-for="item in personalMenu" :key="item.route">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer',
                isActive(item.route)
                  ? 'bg-[#0f4bb4] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ]"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </nav>

      <!-- Bottom User Profile -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 px-3 py-2">
          <div
            class="w-9 h-9 bg-[#0f4bb4] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          >
            {{ user ? getInitials(user.nama) : "D" }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-gray-800 truncate">
              {{ user?.nama || "Direktur" }}
            </p>
            <p class="text-[10px] text-gray-400 truncate">
              {{ user?.jabatan || "Direktur" }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
