<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { holidayApi, type Holiday } from "../../services/holiday.service";

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const holidays = ref<Holiday[]>([]);
const loading = ref(true);

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; currentMonth: boolean; date: Date; isSunday: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      date: d,
      isSunday: d.getDay() === 0,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      day: i,
      currentMonth: true,
      date: d,
      isSunday: d.getDay() === 0,
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      day: i,
      currentMonth: false,
      date: d,
      isSunday: d.getDay() === 0,
    });
  }

  return days;
});

const isCurrentDay = (date: Date) => formatDate(date) === formatDate(today);

const getHolidayOnDate = (date: Date): Holiday | undefined => {
  const dateStr = formatDate(date);
  return holidays.value.find((h) => h.date === dateStr);
};

const isCutiBersama = (date: Date) => {
  const h = getHolidayOnDate(date);
  return h?.is_cuti_bersama === true;
};

const isLiburNasional = (date: Date) => {
  const h = getHolidayOnDate(date);
  return h && !h.is_cuti_bersama;
};

const holidaysThisMonth = computed(() => {
  return holidays.value.filter((h) => {
    const d = new Date(h.date);
    return (
      d.getMonth() === currentMonth.value &&
      d.getFullYear() === currentYear.value
    );
  });
});

const holidaysByMonth = computed(() => {
  const map = new Map<string, (Holiday & { dayName: string; dayNum: string })[]>();
  const dayNamesShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  holidays.value.forEach((h) => {
    const d = new Date(h.date);
    const key = `${monthNames[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
    const item = {
      ...h,
      dayName: dayNamesShort[d.getDay()],
      dayNum: String(d.getDate()).padStart(2, "0"),
    };
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  });

  return Array.from(map.entries()).map(([monthKey, items]) => ({
    month: monthKey,
    items,
  }));
});

// Modal States
const showAddModal = ref(false);
const showSyncModal = ref(false);
const isSyncing = ref(false);
const syncSuccess = ref(false);

const liburForm = ref({
  nama: "",
  tanggal: "",
  jenis: "Libur Nasional", // "Libur Nasional" | "Cuti Bersama"
  keterangan: "",
});

const fetchHolidays = async (year: number) => {
  loading.value = true;
  try {
    const res = await holidayApi.getByYear(year);
    if (res.data?.data) {
      holidays.value = res.data.data;
    }
  } catch {
    // silent fail
  } finally {
    loading.value = false;
  }
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
    fetchHolidays(currentYear.value);
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
    fetchHolidays(currentYear.value);
  } else {
    currentMonth.value++;
  }
};

const handleSaveLibur = () => {
  if (!liburForm.value.nama || !liburForm.value.tanggal) return;
  holidays.value.push({
    date: liburForm.value.tanggal,
    name: liburForm.value.nama,
    is_civic: true,
    is_religious: false,
    is_cuti_bersama: liburForm.value.jenis === "Cuti Bersama",
  });
  showAddModal.value = false;
  liburForm.value = { nama: "", tanggal: "", jenis: "Libur Nasional", keterangan: "" };
};

const handleSyncApi = async () => {
  isSyncing.value = true;
  try {
    await fetchHolidays(currentYear.value);
    syncSuccess.value = true;
    setTimeout(() => {
      syncSuccess.value = false;
      showSyncModal.value = false;
    }, 1200);
  } catch {
    // silent fail
  } finally {
    isSyncing.value = false;
  }
};

onMounted(() => {
  fetchHolidays(currentYear.value);
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Top Header Area -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          Kalender Operasional
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Kelola jadwal libur nasional dan cuti bersama tahunan.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Sinkronisasi button -->
        <button
          @click="showSyncModal = true"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#e8eef9] hover:bg-[#dbe4f6] text-[#0f4bb4] rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sinkronisasi
        </button>

        <!-- Tambah Libur button -->
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 px-6 py-2.5 bg-[#0f4bb4] hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Libur
        </button>

        <!-- Top Right Legend Card -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 text-xs font-medium text-gray-700">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full border-2 border-red-500"></span>
            <span>Libur Nasional</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full border-2 border-[#0f4bb4]"></span>
            <span>Cuti Bersama</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full border-2 border-[#0f4bb4] flex items-center justify-center">
              <span class="w-1 h-1 bg-[#0f4bb4] rounded-full"></span>
            </span>
            <span>Hari Ini</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid: Calendar (8 Cols) + Holiday List (4 Cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Calendar Card -->
      <div class="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-7">
        <!-- Month Navigator -->
        <div class="flex items-center gap-6 mb-6">
          <button @click="prevMonth" class="p-1 text-gray-600 hover:text-gray-900 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-xl font-bold text-gray-900">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </h2>
          <button @click="nextMonth" class="p-1 text-gray-600 hover:text-gray-900 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          <div v-for="(d, i) in dayNames" :key="d" :class="i === 0 ? 'text-red-500' : ''">
            {{ d }}
          </div>
        </div>

        <!-- Calendar Days Grid -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(cell, idx) in calendarDays"
            :key="idx"
            :class="[
              'h-20 lg:h-24 p-2.5 rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden',
              !cell.currentMonth
                ? 'border-transparent text-gray-300'
                : isCurrentDay(cell.date)
                ? 'border-2 border-[#0f4bb4] bg-white shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200'
            ]"
          >
            <!-- Day Number -->
            <div class="flex items-start justify-between">
              <span
                :class="[
                  'text-xs font-bold',
                  !cell.currentMonth
                    ? 'text-gray-300'
                    : isLiburNasional(cell.date) || cell.isSunday
                    ? 'text-red-500'
                    : isCutiBersama(cell.date)
                    ? 'text-[#0f4bb4]'
                    : 'text-gray-800'
                ]"
              >
                {{ cell.day }}
              </span>

              <!-- Blue dot if Today -->
              <span
                v-if="isCurrentDay(cell.date)"
                class="w-2 h-2 rounded-full bg-[#0f4bb4]"
              ></span>
            </div>

            <!-- Bottom Badge in cell -->
            <div v-if="getHolidayOnDate(cell.date)" class="mt-auto">
              <span
                :class="[
                  'block text-[9px] font-bold text-center py-0.5 px-1 rounded truncate leading-tight',
                  isLiburNasional(cell.date)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-[#0f4bb4]'
                ]"
                :title="getHolidayOnDate(cell.date)?.name"
              >
                {{ isLiburNasional(cell.date) ? 'Libur Nasional' : 'Cuti Bersama' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Holiday & Leave List Card -->
      <div class="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 max-h-[640px] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
          <h2 class="text-base lg:text-lg font-bold text-gray-900">
            Daftar Libur & Cuti
          </h2>
          <span class="text-xs text-gray-400 font-medium">Tahun {{ currentYear }}</span>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#0f4bb4]"></div>
        </div>

        <div v-else-if="holidaysByMonth.length === 0" class="py-12 text-center text-gray-400 text-xs font-medium">
          Tidak ada data hari libur resmi pada tahun {{ currentYear }}.
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="group in holidaysByMonth"
            :key="group.month"
          >
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              {{ group.month }}
            </p>

            <div class="space-y-3">
              <div
                v-for="item in group.items"
                :key="item.date + item.name"
                class="p-3 bg-[#f8fafc] rounded-xl flex items-center gap-3 border border-gray-50"
              >
                <div
                  :class="[
                    'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold',
                    item.is_cuti_bersama
                      ? 'bg-blue-100 text-[#0f4bb4]'
                      : 'bg-red-100 text-red-600'
                  ]"
                >
                  <span class="text-[10px] font-bold uppercase leading-none">{{ item.dayName }}</span>
                  <span class="text-base font-extrabold leading-none mt-0.5">{{ item.dayNum }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-gray-900 leading-snug truncate" :title="item.name">
                    {{ item.name }}
                  </p>
                  <p
                    :class="[
                      'text-[11px] font-medium mt-0.5',
                      item.is_cuti_bersama ? 'text-blue-600' : 'text-gray-500'
                    ]"
                  >
                    {{ item.is_cuti_bersama ? 'Cuti Bersama' : 'Libur Nasional' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 1: TAMBAH HARI LIBUR -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-gray-900">
            Tambah Hari Libur
          </h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-3.5 text-xs">
          <!-- 1. Nama Hari Libur -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Nama Hari Libur</label>
            <input
              v-model="liburForm.nama"
              type="text"
              placeholder="Contoh: Hari Raya Idul Fitri"
              class="w-full px-3.5 py-2.5 bg-[#f0f5ff]/70 border border-transparent rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-[#0f4bb4] transition-all"
            />
          </div>

          <!-- 2. Tanggal -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Tanggal (YYYY-MM-DD)</label>
            <div class="relative">
              <input
                v-model="liburForm.tanggal"
                type="date"
                class="w-full px-3.5 py-2.5 bg-[#f0f5ff]/70 border border-transparent rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-[#0f4bb4] pr-10 cursor-pointer transition-all"
              />
            </div>
          </div>

          <!-- 3. Jenis Libur -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Jenis Libur</label>
            <div class="grid grid-cols-2 gap-3">
              <!-- Libur Nasional Card -->
              <label
                :class="[
                  'flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  liburForm.jenis === 'Libur Nasional'
                    ? 'border-gray-300 bg-white text-gray-900 shadow-xs'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="liburForm.jenis"
                  value="Libur Nasional"
                  class="accent-red-500 w-3.5 h-3.5"
                />
                <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span class="truncate">Libur Nasional</span>
              </label>

              <!-- Cuti Bersama Card -->
              <label
                :class="[
                  'flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold',
                  liburForm.jenis === 'Cuti Bersama'
                    ? 'border-gray-300 bg-white text-gray-900 shadow-xs'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <input
                  type="radio"
                  v-model="liburForm.jenis"
                  value="Cuti Bersama"
                  class="accent-[#0f4bb4] w-3.5 h-3.5"
                />
                <span class="w-2 h-2 rounded-full bg-[#0f4bb4] shrink-0"></span>
                <span class="truncate">Cuti Bersama</span>
              </label>
            </div>
          </div>

          <!-- 4. Keterangan -->
          <div>
            <label class="block font-semibold text-gray-800 mb-1.5">Keterangan</label>
            <textarea
              v-model="liburForm.keterangan"
              rows="3"
              placeholder="Tambahkan catatan tambahan..."
              class="w-full p-3 bg-[#f0f5ff]/70 border border-transparent rounded-xl text-xs text-gray-800 outline-none focus:bg-white focus:border-[#0f4bb4] transition-all min-h-[80px]"
            ></textarea>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="showAddModal = false"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handleSaveLibur"
            class="px-7 py-2.5 text-xs font-bold text-white bg-[#0f4bb4] hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL 2: Sinkronisasi API -->
    <div
      v-if="showSyncModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
        <div class="w-12 h-12 rounded-full bg-blue-100 text-[#0f4bb4] flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <div>
          <h3 class="text-base font-bold text-gray-900">Sinkronisasi Data Libur</h3>
          <p class="text-xs text-gray-500 mt-1">
            Apakah Anda ingin menyinkronkan data hari libur nasional resmi tahun {{ currentYear }} dari server pemerintah?
          </p>
        </div>

        <div v-if="syncSuccess" class="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">
          ✓ Sinkronisasi data libur berhasil!
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="showSyncModal = false"
            class="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="handleSyncApi"
            :disabled="isSyncing"
            class="flex-1 py-2 text-xs font-bold text-white bg-[#0f4bb4] rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
          >
            {{ isSyncing ? "Menyinkronkan..." : "Mulai Sinkronisasi" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
