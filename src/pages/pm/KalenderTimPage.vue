<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { holidayApi, type Holiday } from "../../services/holiday.service";
import { calendarApi, type KalenderItem } from "../../services/calendar.service";

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref<Date>(today);

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const dayFullName = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

const holidays = ref<Holiday[]>([]);
const teamCalendar = ref<KalenderItem[]>([]);

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

  const startDay = firstDay === 0 ? 6 : firstDay - 1;
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
const isSelected = (date: Date) => formatDate(date) === formatDate(selectedDate.value);

const isHoliday = (date: Date) => {
  const dateStr = formatDate(date);
  return holidays.value.some((h) => h.date === dateStr);
};

const isCutiBersama = (date: Date) => {
  const dateStr = formatDate(date);
  return holidays.value.some((h) => h.date === dateStr && h.is_cuti_bersama);
};

const getHolidayName = (date: Date) => {
  const dateStr = formatDate(date);
  return holidays.value.find((h) => h.date === dateStr)?.name || "";
};

const getTeamLeaveOnDate = (date: Date) => {
  const dateStr = formatDate(date);
  return teamCalendar.value.filter((item) => item.tanggal === dateStr);
};

const selectedDateTeamLeave = computed(() => getTeamLeaveOnDate(selectedDate.value));

const selectedDateLabel = computed(() => {
  const d = selectedDate.value;
  const dayNum = d.getDate();
  const monthName = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${dayNum} ${monthName} ${year}`;
});

const selectedDateDayName = computed(() => dayFullName[selectedDate.value.getDay()]);

const goToToday = () => {
  const now = new Date();
  currentMonth.value = now.getMonth();
  currentYear.value = now.getFullYear();
  selectedDate.value = now;
};

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

const selectDate = (date: Date) => {
  selectedDate.value = date;
};

onMounted(async () => {
  try {
    const [holidayRes, teamRes] = await Promise.all([
      holidayApi.getByYear(currentYear.value),
      calendarApi.getTeamCalendar(),
    ]);
    holidays.value = holidayRes.data.data || [];
    teamCalendar.value = teamRes.data || [];
  } catch {
    // silent fail
  }
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">Kalender Cuti</h1>
      <p class="text-sm text-gray-500">Pantau jadwal cuti Anda, tim, dan hari libur nasional.</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Kalender -->
      <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <!-- Header: Hari ini + Navigasi Bulan -->
        <div class="flex items-center justify-between mb-6">
          <button
            @click="goToToday"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Hari ini
          </button>

          <div class="flex items-center gap-3">
            <button
              @click="prevMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-base font-semibold text-gray-800 min-w-[160px] text-center">
              {{ monthNames[currentMonth] }} {{ currentYear }}
            </span>
            <button
              @click="nextMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Grid Kalender -->
        <div class="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
          <!-- Header Hari -->
          <div
            v-for="day in dayNames"
            :key="day"
            class="text-center text-xs font-bold py-3 border-b border-gray-200 text-gray-600 bg-gray-50"
          >
            {{ day }}
          </div>

          <!-- Cell Tanggal -->
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            @click="selectDate(day.date)"
            :class="[
              'min-h-[72px] p-1.5 border-b border-r border-gray-200 text-sm transition-colors relative cursor-pointer',
              !day.currentMonth && 'bg-gray-50/50 text-gray-300',
              day.currentMonth && !isSelected(day.date) && 'bg-white hover:bg-gray-50',
              isSelected(day.date) && 'ring-2 ring-inset ring-blue-500 bg-blue-50',
              day.currentMonth && isToday(day.date) && !isSelected(day.date) && 'bg-blue-50/50',
            ]"
          >
            <span
              :class="[
                'inline-block w-7 h-7 leading-7 text-center rounded-full text-sm font-medium',
                isSelected(day.date) && 'bg-blue-600 text-white',
                !isSelected(day.date) && day.currentMonth && isToday(day.date) && 'bg-blue-100 text-blue-700',
                !isSelected(day.date) && day.currentMonth && (day.date.getDay() === 0 || day.date.getDay() === 6) && 'text-red-400',
              ]"
            >
              {{ day.day }}
            </span>

            <!-- Badge Team Leave -->
            <div
              v-if="day.currentMonth && getTeamLeaveOnDate(day.date).length > 0"
              class="mt-0.5"
            >
              <span
                v-for="(item, i) in getTeamLeaveOnDate(day.date).slice(0, 2)"
                :key="i"
                class="block text-[8px] leading-tight px-1 py-0.5 bg-gray-400 text-white rounded truncate mb-0.5"
              >
                {{ item.nama.split(' ')[0] }}.
              </span>
              <span
                v-if="getTeamLeaveOnDate(day.date).length > 2"
                class="block text-[8px] leading-tight text-gray-500"
              >
                +{{ getTeamLeaveOnDate(day.date).length - 2 }} lagi
              </span>
            </div>

            <!-- Libur Nasional -->
            <div
              v-if="day.currentMonth && isHoliday(day.date)"
              class="mt-0.5"
            >
              <span
                :class="[
                  'block text-[7px] leading-tight px-1 py-0.5 rounded truncate text-white',
                  isCutiBersama(day.date) ? 'bg-green-500' : 'bg-red-500',
                ]"
              >
                {{ isCutiBersama(day.date) ? 'Cuti B.' : getHolidayName(day.date).split(' ').slice(0, 2).join(' ') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Kanan -->
      <div class="w-full lg:w-80 flex flex-col gap-4">
        <!-- Info Tanggal Terpilih -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-800">{{ selectedDateLabel }}</p>
              <p class="text-sm text-gray-500">{{ selectedDateDayName }}</p>
            </div>
          </div>

          <!-- Jadwal Tim -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
              <span class="text-sm font-semibold text-gray-700">Jadwal Tim</span>
            </div>
            <div v-if="selectedDateTeamLeave.length > 0" class="space-y-2">
              <div
                v-for="(item, i) in selectedDateTeamLeave"
                :key="i"
                class="p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <p class="text-sm font-medium text-gray-800">{{ item.nama }}</p>
                <p class="text-xs text-gray-500">{{ item.keterangan || item.jenis_cuti }}</p>
                <span
                  :class="[
                    'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
                    item.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                    item.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700',
                  ]"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Tidak ada jadwal tim pada tanggal ini</p>
          </div>
        </div>

        <!-- Keterangan / Legenda -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-gray-800 mb-3">Keterangan</h3>
          <div class="space-y-2.5">
            <div class="flex items-center gap-2.5">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Cuti Saya</span>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Libur Nasional</span>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Cuti Bersama</span>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span class="text-sm text-gray-600">Jadwal Tim (Disetujui)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
