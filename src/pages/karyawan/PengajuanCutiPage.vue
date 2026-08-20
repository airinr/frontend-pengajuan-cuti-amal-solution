<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authApi, type UserList } from "../../services/auth.service";
import { leaveApi } from "../../services/leave.service";
import { holidayApi, type Holiday } from "../../services/holiday.service";
import type { CurrentUser } from "../../types";

const router = useRouter();

const user = ref<CurrentUser | null>(null);
const users = ref<UserList[]>([]);
const loading = ref(true);
const submitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const warningMessage = ref("");
const holidays = ref<Holiday[]>([]);
const showDropdown = ref(false);
const searchQuery = ref("");

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const form = ref({
  tanggal_mulai: "",
  tanggal_selesai: "",
  keterangan: "",
  pengganti: null as number | null,
  setuju_aturan: false,
});

const selectedDates = ref<string[]>([]);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter((u) =>
    u.nama.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const selectedUserName = computed(() => {
  const found = users.value.find((u) => u.id_user === form.value.pengganti);
  return found?.nama || "";
});

const selectUser = (userId: number, name: string) => {
  form.value.pengganti = userId;
  searchQuery.value = name;
  showDropdown.value = false;
};

const closeDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

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

  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];

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

const isDateSelected = (date: Date) => {
  return selectedDates.value.includes(formatDate(date));
};

const isToday = (date: Date) => {
  return formatDate(date) === formatDate(today);
};

const isPastDate = (date: Date) => {
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const minDate = new Date(todayStart);
  minDate.setDate(minDate.getDate() + 10);
  return date < minDate;
};

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
  const holiday = holidays.value.find((h) => h.date === dateStr);
  return holiday?.name || "";
};

const MAX_CUTI_DAYS = 4;

const selectedDaysCount = computed(() => selectedDates.value.length);

const handleDateClick = (day: {
  day: number;
  currentMonth: boolean;
  date: Date;
}) => {
  if (!day.currentMonth || isHoliday(day.date)) return;

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const minDate = new Date(todayStart);
  minDate.setDate(minDate.getDate() + 10);

  if (day.date < minDate) {
    warningMessage.value = "Pengajuan cuti minimal H-10 sebelum tanggal cuti";
    setTimeout(() => {
      warningMessage.value = "";
    }, 3000);
    return;
  }

  const dateStr = formatDate(day.date);
  const index = selectedDates.value.indexOf(dateStr);

  if (index > -1) {
    selectedDates.value.splice(index, 1);
    warningMessage.value = "";
  } else {
    if (selectedDates.value.length >= MAX_CUTI_DAYS) {
      warningMessage.value = `Maksimal ${MAX_CUTI_DAYS} hari cuti`;
      setTimeout(() => {
        warningMessage.value = "";
      }, 3000);
      return;
    }
    selectedDates.value.push(dateStr);
    selectedDates.value.sort();
    warningMessage.value = "";
  }

  const sorted = [...selectedDates.value].sort();
  form.value.tanggal_mulai = sorted[0] || "";
  form.value.tanggal_selesai = sorted[sorted.length - 1] || "";
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

const clearDates = () => {
  selectedDates.value = [];
  form.value.tanggal_mulai = "";
  form.value.tanggal_selesai = "";
};

const calculateDuration = () => {
  return selectedDates.value.length;
};

onMounted(async () => {
  try {
    const [userRes, holidayRes, usersRes] = await Promise.all([
      authApi.me(),
      holidayApi.getByYear(currentYear.value),
      authApi.getAllUsers(),
    ]);
    user.value = userRes.data;
    holidays.value = holidayRes.data.data || [];
    users.value = usersRes.data || [];
  } catch {
    // silent fail
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!form.value.tanggal_mulai || !form.value.tanggal_selesai) {
    errorMessage.value = "Pilih tanggal cuti terlebih dahulu";
    return;
  }

  if (!form.value.pengganti) {
    errorMessage.value = "Pilih delegasi tugas (pengganti)";
    return;
  }

  if (!form.value.keterangan) {
    errorMessage.value = "Masukkan keterangan cuti";
    return;
  }

  if (!form.value.setuju_aturan) {
    errorMessage.value = "Anda harus menyetujui aturan pengajuan";
    return;
  }

  submitting.value = true;
  try {
    await leaveApi.createKaryawan({
      tanggal_mulai: form.value.tanggal_mulai,
      tanggal_selesai: form.value.tanggal_selesai,
      keterangan: form.value.keterangan,
      pengganti: form.value.pengganti,
    });
    successMessage.value = "Pengajuan cuti berhasil dikirim!";
    form.value = {
      tanggal_mulai: "",
      tanggal_selesai: "",
      keterangan: "",
      pengganti: null,
      setuju_aturan: false,
    };
    selectedDates.value = [];
    searchQuery.value = "";
    setTimeout(() => {
      router.push("/karyawan/status-pengajuan");
    }, 2000);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.detail || "Gagal mengajukan cuti";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Pengajuan Cuti</h1>
    <p class="text-sm text-gray-500 mb-6">
      Silakan lengkapi formulir di bawah ini untuk mengajukan permohonan cuti
      Anda.<br />
      Pastikan Anda telah membaca aturan yang berlaku.
    </p>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <!-- Left - Form -->
      <div class="flex-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <!-- Pilih Tanggal -->
          <div class="p-4 lg:p-6 border-b border-gray-100 bg-blue-50">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-800">Pilih Tanggal</h3>
              <div class="flex items-center gap-4">
                <span
                  v-if="selectedDaysCount > 0"
                  class="text-sm text-blue-600 font-medium"
                >
                  {{ selectedDaysCount }} hari dipilih
                </span>
                <button
                  @click="clearDates"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Clear dates
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
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
              <h4 class="text-xl font-bold text-gray-800">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h4>
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

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="grid grid-cols-7">
                <div
                  v-for="day in dayNames"
                  :key="day"
                  class="text-center text-xs font-bold py-3 border-b border-gray-200 text-gray-700 bg-gray-50"
                >
                  {{ day }}
                </div>
              </div>

              <div class="grid grid-cols-7">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  @click="handleDateClick(day)"
                  :class="[
                    'min-h-[80px] p-1 border-b border-r border-gray-200 text-sm transition-colors relative',
                    !day.currentMonth && 'text-gray-300',
                    day.currentMonth && isToday(day.date) && 'bg-yellow-100',
                    day.currentMonth &&
                      isCutiBersama(day.date) &&
                      !isDateSelected(day.date) &&
                      'bg-orange-50',
                    day.currentMonth &&
                      isHoliday(day.date) &&
                      !isCutiBersama(day.date) &&
                      !isDateSelected(day.date) &&
                      'bg-red-50',
                    day.currentMonth &&
                      !isPastDate(day.date) &&
                      !isDateSelected(day.date) &&
                      !isHoliday(day.date) &&
                      'hover:bg-blue-100 cursor-pointer',
                    isDateSelected(day.date) &&
                      'bg-blue-900 text-white font-medium',
                  ]"
                >
                  <span
                    :class="[
                      'inline-block w-7 h-7 leading-7 text-center rounded-full text-sm',
                      isDateSelected(day.date) && 'bg-blue-900 text-white',
                      !isDateSelected(day.date) &&
                        day.currentMonth &&
                        (index % 7 === 0 || index % 7 === 6) &&
                        'text-red-400',
                    ]"
                  >
                    {{ day.day }}
                  </span>
                  <div
                    v-if="
                      isHoliday(day.date) &&
                      day.currentMonth &&
                      !isDateSelected(day.date)
                    "
                    class="mt-0.5 px-1 py-0.5 bg-red-500 text-white text-[9px] rounded leading-tight"
                  >
                    {{ getHolidayName(day.date) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4 text-xs text-gray-500 mt-4">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 bg-red-50 border border-red-300 rounded-full"
                ></div>
                <span>Hari Libur</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 bg-orange-50 border border-orange-300 rounded-full"
                ></div>
                <span>Cuti Bersama</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-900 rounded-full"></div>
                <span>Hari terpilih</span>
              </div>
            </div>

            <div
              v-if="warningMessage"
              class="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-600 font-medium"
            >
              {{ warningMessage }}
            </div>
          </div>

          <!-- Form Fields -->
          <div class="p-4 lg:p-6 border-b border-gray-100 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Jenis Cuti</label
                >
                <input
                  type="text"
                  value="Cuti Tahunan"
                  disabled
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Nama Pengganti (Backup)</label
                >
                <input
                  v-model="searchQuery"
                  @focus="showDropdown = true"
                  @blur="closeDropdown"
                  @input="form.pengganti = null"
                  placeholder="Cari nama rekan kerja..."
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div
                  v-if="showDropdown && filteredUsers.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <div
                    v-for="u in filteredUsers"
                    :key="u.id_user"
                    @mousedown.prevent="selectUser(u.id_user, u.nama)"
                    class="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    {{ u.nama }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Alasan Cuti</label
              >
              <textarea
                v-model="form.keterangan"
                rows="3"
                placeholder="Jelaskan secara singkat alasan pengambilan cuti Anda..."
                class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Checkbox & Submit -->
          <div class="p-4 lg:p-6">
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 class="font-semibold text-gray-800 mb-2">
                Pernyataan Pengajuan Cuti
              </h4>
              <p class="text-sm text-gray-600 mb-3">
                Saya mengajukan cuti pada tanggal
                <span class="font-medium">{{ form.tanggal_mulai || "-" }}</span>
                s.d.
                <span class="font-medium">{{
                  form.tanggal_selesai || "-"
                }}</span>
                (<span class="font-medium">{{ selectedDaysCount }}</span> hari),
                dengan alasan:
                <span class="font-medium">{{ form.keterangan || "-" }}</span
                >.
              </p>
              <p class="text-sm text-gray-600 mb-2">
                Dengan ini saya menyatakan bahwa:
              </p>
              <ul class="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>
                  Pengajuan cuti ini telah saya diskusikan dengan tim dan
                  disetujui oleh anggota tim terkait.
                </li>
                <li>
                  Pekerjaan/tanggung jawab saya selama masa cuti telah memiliki
                  personel pengganti (backup).
                </li>
                <li>
                  Saya bertanggung jawab penuh atas kebenaran informasi yang
                  saya sampaikan di atas.
                </li>
              </ul>
            </div>

            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="form.setuju_aturan"
                type="checkbox"
                class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-600">
                Saya menyetujui pernyataan di atas.
              </span>
            </label>

            <div class="mt-4 flex justify-end">
              <button
                @click="handleSubmit"
                :disabled="submitting || !form.setuju_aturan"
                class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                {{ submitting ? "Mengirim..." : "Kirim Pengajuan" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right - Sidebar -->
      <div class="w-full lg:w-80 space-y-4 lg:space-y-6">
        <!-- Aturan Pengajuan -->
        <div class="bg-blue-50 rounded-xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M1 21h12v2H1v-2zM5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828L5.245 8.07zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66L12.317 1zM3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657 2.828-2.828z"
              />
            </svg>
            <h3 class="font-bold text-gray-800 text-lg">Aturan Pengajuan</h3>
          </div>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <span
                class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-sm text-gray-700"
                >Maksimal <strong>4 hari</strong> berturut-turut untuk cuti
                reguler.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-sm text-gray-700"
                >Pengajuan minimal dilakukan <strong>H-3</strong> sebelum
                tanggal cuti.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-sm text-gray-700"
                >Saldo cuti tahunan Anda harus mencukupi jumlah hari yang
                diajukan.</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span class="text-sm text-gray-700"
                >Pastikan tidak ada <strong>konflik jadwal</strong> penting di
                departemen Anda.</span
              >
            </li>
          </ul>
        </div>

        <!-- Sisa Cuti -->
        <div class="bg-gray-600 rounded-xl shadow-sm p-6 text-white">
          <p class="text-xs text-gray-200 uppercase tracking-wide mb-1">
            Sisa Cuti Anda
          </p>
          <p class="text-4xl font-bold mb-4">
            {{ user?.sisa_cuti || 0 }}
            <span class="text-lg font-normal text-gray-200">Hari</span>
          </p>
          <div class="w-full bg-gray-400 rounded-full h-2 mb-3">
            <div
              class="bg-white rounded-full h-2"
              :style="{
                width:
                  (((user?.total_cuti || 0) - (user?.sisa_cuti || 0)) /
                    (user?.total_cuti || 1)) *
                    100 +
                  '%',
              }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-200">
            <span
              >Digunakan:
              {{ (user?.total_cuti || 0) - (user?.sisa_cuti || 0) }}</span
            >
            <span>Total: {{ user?.total_cuti || 0 }}</span>
          </div>
        </div>

        <!-- Error/Success Messages -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>
        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
