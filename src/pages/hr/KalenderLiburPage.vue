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

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

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

  const startDay = firstDay;
  const days: { day: number; currentMonth: boolean; date: Date }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      currentMonth: true,
      date: new Date(year, month, i),
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  return days;
});

const isToday = (date: Date) => formatDate(date) === formatDate(today);

const getHolidayOnDate = (date: Date): Holiday | undefined => {
  const dateStr = formatDate(date);
  return holidays.value.find((h) => h.date === dateStr);
};

const isHoliday = (date: Date) => !!getHolidayOnDate(date);

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
  const grouped: {
    month: string;
    items: (Holiday & { dayName: string; dayNum: number })[];
  }[] = [];
  const monthMap = new Map<
    string,
    (Holiday & { dayName: string; dayNum: number })[]
  >();

  holidays.value.forEach((h) => {
    const d = new Date(h.date);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const dayNamesFull = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const item = {
      ...h,
      dayName: dayNamesFull[d.getDay()],
      dayNum: d.getDate(),
    };
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(item);
  });

  monthMap.forEach((items, month) => {
    grouped.push({ month, items });
  });

  return grouped;
});

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const fetchHolidays = async () => {
  loading.value = true;
  try {
    const res = await holidayApi.getByYear(currentYear.value);
    holidays.value = res.data.data || [];
  } catch {
    // silent fail
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHolidays();
});

const showModal = ref(false);
const formNama = ref("");
const formTanggal = ref("");
const formJenis = ref("nasional");
const formKeterangan = ref("");

const openModal = () => {
  formNama.value = "";
  formTanggal.value = "";
  formJenis.value = "nasional";
  formKeterangan.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleSimpan = () => {
  if (!formNama.value.trim() || !formTanggal.value) return;

  const newHoliday: Holiday = {
    date: formTanggal.value,
    name: formNama.value,
    is_civic: formJenis.value === "nasional",
    is_religious: false,
    is_cuti_bersama: formJenis.value === "cuti_bersama",
  };

  holidays.value.push(newHoliday);
  holidays.value.sort((a, b) => a.date.localeCompare(b.date));
  closeModal();
};
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6"
    >
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">
          Kalender Operasional
        </h1>
        <p class="text-sm text-gray-500">
          Kelola jadwal libur nasional dan cuti bersama tahunan.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Sinkronisasi
        </button>
        <button
          @click="openModal"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Tambah Libur
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Kalender -->
      <div
        class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <button
            @click="prevMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 class="text-base font-semibold text-gray-800">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </h2>
          <button
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            Libur Nasional
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
            Cuti Bersama
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
            >
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </span>
            Hari Ini
          </div>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>

        <div
          v-else
          class="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden"
        >
          <div
            v-for="day in dayNames"
            :key="day"
            class="text-center text-xs font-bold py-3 border-b border-gray-200 text-gray-600 bg-gray-50"
          >
            {{ day }}
          </div>

          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'min-h-[72px] p-1.5 border-b border-r border-gray-200 text-sm relative',
              !day.currentMonth && 'bg-gray-50/50 text-gray-300',
              day.currentMonth && 'bg-white text-gray-700',
              day.currentMonth &&
                isToday(day.date) &&
                'ring-2 ring-inset ring-blue-500 bg-blue-50',
            ]"
          >
            <span
              :class="[
                'inline-block w-7 h-7 leading-7 text-center rounded-full text-sm font-medium',
                isToday(day.date) && 'bg-blue-600 text-white',
                !isToday(day.date) &&
                  day.currentMonth &&
                  (day.date.getDay() === 0 || day.date.getDay() === 6) &&
                  'text-red-400',
              ]"
            >
              {{ day.day }}
            </span>

            <!-- Libur Nasional Badge -->
            <div
              v-if="day.currentMonth && isLiburNasional(day.date)"
              class="mt-0.5"
            >
              <span
                class="block text-[7px] leading-tight px-1 py-0.5 bg-red-500 text-white rounded truncate"
              >
                Libur Nasional
              </span>
            </div>

            <!-- Cuti Bersama Badge -->
            <div
              v-if="day.currentMonth && isCutiBersama(day.date)"
              class="mt-0.5"
            >
              <span
                class="block text-[7px] leading-tight px-1 py-0.5 bg-blue-500 text-white rounded truncate"
              >
                Cuti Bersama
              </span>
            </div>

            <!-- Holiday dot -->
            <div
              v-if="
                day.currentMonth &&
                isHoliday(day.date) &&
                !isLiburNasional(day.date) &&
                !isCutiBersama(day.date)
              "
              class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
            ></div>
          </div>
        </div>
      </div>

      <!-- Sidebar: Daftar Libur & Cuti -->
      <div class="w-full lg:w-80">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-gray-800">Daftar Libur & Cuti</h3>
            <button
              class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>

          <div
            v-if="holidaysByMonth.length === 0"
            class="text-center text-gray-400 text-sm py-4"
          >
            Tidak ada data libur
          </div>

          <div v-else class="space-y-5 max-h-[500px] overflow-y-auto">
            <div v-for="group in holidaysByMonth" :key="group.month">
              <p
                class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
              >
                {{ group.month }}
              </p>
              <div class="space-y-2">
                <div
                  v-for="item in group.items"
                  :key="item.date"
                  class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    :class="[
                      'w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0',
                      item.is_cuti_bersama ? 'bg-blue-100' : 'bg-red-100',
                    ]"
                  >
                    <span
                      :class="[
                        'text-[9px] font-semibold uppercase',
                        item.is_cuti_bersama ? 'text-blue-600' : 'text-red-600',
                      ]"
                    >
                      {{
                        ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][
                          new Date(item.date).getDay()
                        ]
                      }}
                    </span>
                    <span
                      :class="[
                        'text-sm font-bold leading-tight',
                        item.is_cuti_bersama ? 'text-blue-700' : 'text-red-700',
                      ]"
                    >
                      {{ new Date(item.date).getDate() }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800">
                      {{ item.name }}
                    </p>
                    <p
                      :class="[
                        'text-xs',
                        item.is_cuti_bersama ? 'text-blue-600' : 'text-red-600',
                      ]"
                    >
                      {{
                        item.is_cuti_bersama ? "Cuti Bersama" : "Libur Nasional"
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-bold text-gray-800">Tambah Hari Libur</h3>
              <button
                @click="closeModal"
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

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Nama Hari Libur</label
                >
                <input
                  v-model="formNama"
                  type="text"
                  placeholder="Contoh: Hari Raya Idul Fitri"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Tanggal</label
                >
                <input
                  v-model="formTanggal"
                  type="date"
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Jenis Libur</label
                >
                <div class="flex gap-3">
                  <label
                    :class="[
                      'flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                      formJenis === 'nasional'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="formJenis"
                      value="nasional"
                      class="sr-only"
                    />
                    <span
                      class="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                      :class="
                        formJenis === 'nasional'
                          ? 'border-red-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="formJenis === 'nasional'"
                        class="w-1.5 h-1.5 bg-red-500 rounded-full"
                      ></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700"
                      >Libur Nasional</span
                    >
                  </label>
                  <label
                    :class="[
                      'flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                      formJenis === 'konflik'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="formJenis"
                      value="konflik"
                      class="sr-only"
                    />
                    <span
                      class="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                      :class="
                        formJenis === 'konflik'
                          ? 'border-yellow-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="formJenis === 'konflik'"
                        class="w-1.5 h-1.5 bg-yellow-500 rounded-full"
                      ></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700"
                      >Konflik</span
                    >
                  </label>
                  <label
                    :class="[
                      'flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                      formJenis === 'cuti_bersama'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="formJenis"
                      value="cuti_bersama"
                      class="sr-only"
                    />
                    <span
                      class="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                      :class="
                        formJenis === 'cuti_bersama'
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="formJenis === 'cuti_bersama'"
                        class="w-1.5 h-1.5 bg-blue-500 rounded-full"
                      ></span>
                    </span>
                    <span class="text-sm font-medium text-gray-700"
                      >Cuti Bersama</span
                    >
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Keterangan</label
                >
                <textarea
                  v-model="formKeterangan"
                  rows="3"
                  placeholder="Tambahkan catatan tambahan..."
                  class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="handleSimpan"
                :disabled="!formNama.trim() || !formTanggal"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Simpan
              </button>
            </div>
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
