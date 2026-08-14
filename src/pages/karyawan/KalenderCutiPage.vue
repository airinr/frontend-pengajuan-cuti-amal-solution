<script setup lang="ts">
import { ref, computed } from "vue";

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

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

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = firstDay - 1; i >= 0; i--) {
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

const isToday = (date: Date) => {
  return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
};

const isLeaveDate = (date: Date) => {
  const leaveDates = [
    "2026-08-20",
    "2026-08-21",
    "2026-08-22",
    "2026-10-15",
    "2026-10-16",
    "2026-10-17",
    "2026-10-18",
  ];
  return leaveDates.includes(date.toISOString().split("T")[0]);
};

const isHoliday = (date: Date) => {
  const holidays = ["2026-08-17", "2026-12-25", "2026-12-26", "2027-01-01"];
  return holidays.includes(date.toISOString().split("T")[0]);
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
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Kalender Cuti</h1>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
        <h2 class="text-lg font-semibold text-gray-800">
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

      <div
        class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden"
      >
        <div
          v-for="day in dayNames"
          :key="day"
          class="bg-gray-50 p-3 text-center text-xs font-medium text-gray-500"
        >
          {{ day }}
        </div>

        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'p-3 text-center text-sm',
            !day.currentMonth && 'bg-white text-gray-300',
            day.currentMonth && 'bg-white text-gray-700',
            day.currentMonth &&
              isToday(day.date) &&
              'ring-2 ring-blue-400 font-medium',
            day.currentMonth &&
              isLeaveDate(day.date) &&
              'bg-blue-100 text-blue-700 font-medium',
            day.currentMonth &&
              isHoliday(day.date) &&
              'bg-red-100 text-red-600 font-medium',
          ]"
        >
          {{ day.day }}
        </div>
      </div>

      <div class="mt-6 flex items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span class="text-sm text-gray-600">Cuti Anda</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span class="text-sm text-gray-600">Hari Libur</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-white border border-gray-300 rounded"></div>
          <span class="text-sm text-gray-600">Hari Aktif</span>
        </div>
      </div>
    </div>
  </div>
</template>
