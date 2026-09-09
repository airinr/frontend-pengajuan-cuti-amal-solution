<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  hrApi,
  type RingkasanKaryawan,
  type KaryawanItem,
} from "../../services/hr.service";
import { authApi } from "../../services/auth.service";
import { departmentApi } from "../../services/department.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { t } = useI18n();
const { showError } = useErrorPopup();

const searchQuery = ref("");
const selectedDepartemen = ref("");
const loading = ref(true);

const summary = ref<RingkasanKaryawan>({
  total_karyawan: 0,
  total_departemen: 0,
  total_project_manager: 0,
});
const karyawanList = ref<KaryawanItem[]>([]);
const departemenList = ref<{ id_departemen: number; nama_departemen: string }[]>([]);
const pmList = ref<{ id_user: number; nama: string }[]>([]);

const showAddModal = ref(false);
const showEditModal = ref(false);
const addSubmitting = ref(false);
const editSubmitting = ref(false);
const showAddPassword = ref(false);
const showSuccessPopup = ref(false);

const showAddDeptModal = ref(false);
const showEditDeptModal = ref(false);
const addDeptSubmitting = ref(false);
const editDeptSubmitting = ref(false);
const addDeptName = ref("");
const editDeptName = ref("");
const editDeptId = ref<number | null>(null);
const showDeptSuccessPopup = ref(false);
const deptSuccessMessage = ref("");

const addForm = ref({
  username: "",
  nama: "",
  password: "",
  role: "karyawan",
  id_departemen: 1,
  id_pm: null as number | null,
});

const editForm = ref({
  nama: "",
  role: "karyawan",
  id_departemen: 0,
  id_pm: null as number | null,
  email: "",
  no_telp: "",
  tanggal_bergabung: "",
  status: "Aktif",
});
const editUserId = ref<number | null>(null);

const departemenOptions = computed(() => departemenList.value);

const filteredKaryawan = computed(() => {
  return karyawanList.value.filter((item) => {
    const matchSearch = !searchQuery.value ||
      item.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchDept = !selectedDepartemen.value ||
      item.departemen === selectedDepartemen.value;
    return matchSearch && matchDept;
  });
});

const groupedKaryawan = computed(() => {
  const groups: Record<string, KaryawanItem[]> = {};
  for (const item of filteredKaryawan.value) {
    const dept = item.departemen || 'Tanpa Departemen';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(item);
  }
  return groups;
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [summaryRes, karyawanRes, departemenRes, pmRes] = await Promise.allSettled([
      hrApi.getDataKaryawanSummary(),
      hrApi.getDataKaryawan(),
      departmentApi.getAll(),
      hrApi.getAllPm(),
    ]);
    if (summaryRes.status === "fulfilled")
      summary.value = summaryRes.value.data;
    if (karyawanRes.status === "fulfilled")
      karyawanList.value = karyawanRes.value.data || [];
    if (departemenRes.status === "fulfilled")
      departemenList.value = departemenRes.value.data || [];
    if (pmRes.status === "fulfilled")
      pmList.value = pmRes.value.data || [];
  } catch (err) {
    showError(err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  addForm.value = {
    username: "",
    nama: "",
    password: "",
    role: "karyawan",
    id_departemen: departemenOptions.value[0]?.id_departemen || 1,
    id_pm: null,
  };
  showAddPassword.value = false;
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const handleAddSubmit = async () => {
  if (!addForm.value.username || !addForm.value.nama || !addForm.value.password) return;
  addSubmitting.value = true;
  try {
    await authApi.registerAdmin({
      username: addForm.value.username,
      nama: addForm.value.nama,
      password: addForm.value.password,
      role: addForm.value.role,
      id_departemen: addForm.value.id_departemen,
      id_pm: addForm.value.id_pm,
    });
    closeAddModal();
    showSuccessPopup.value = true;
    await fetchData();
  } catch (err) {
    showError(err);
  } finally {
    addSubmitting.value = false;
  }
};

const openEditModal = (item: any) => {
  editUserId.value = item.id_user || null;
  editForm.value = {
    nama: item.nama || "",
    role: item.role || "karyawan",
    id_departemen: departemenOptions.value.find((d) => d.nama_departemen === item.departemen)?.id_departemen || 0,
    id_pm: item.id_pm || null,
    email: item.email || "",
    no_telp: item.no_telp || "",
    tanggal_bergabung: item.tanggal_bergabung || "",
    status: item.status || "Aktif",
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editUserId.value = null;
};

const handleEditSubmit = async () => {
  if (!editUserId.value || !editForm.value.nama) return;
  editSubmitting.value = true;
  try {
    await authApi.updateKaryawan(editUserId.value, {
      nama: editForm.value.nama,
      role: editForm.value.role,
      id_departemen: editForm.value.id_departemen,
      id_pm: editForm.value.id_pm,
      email: editForm.value.email,
      no_telp: editForm.value.no_telp,
      tanggal_bergabung: editForm.value.tanggal_bergabung || new Date().toISOString().split('T')[0],
      status: editForm.value.status,
    });
    closeEditModal();
    await fetchData();
  } catch (err) {
    showError(err);
  } finally {
    editSubmitting.value = false;
  }
};

const handleSearch = () => {
  // search is reactive via filteredKaryawan
};

watch(searchQuery, () => {
  // search is reactive
});

const openAddDeptModal = () => {
  addDeptName.value = "";
  showAddDeptModal.value = true;
};

const closeAddDeptModal = () => {
  showAddDeptModal.value = false;
};

const handleAddDeptSubmit = async () => {
  if (!addDeptName.value.trim()) return;
  addDeptSubmitting.value = true;
  try {
    await departmentApi.create({ nama_departemen: addDeptName.value });
    closeAddDeptModal();
    await fetchData();
    deptSuccessMessage.value = t('employee.departmentAdded');
    showDeptSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    addDeptSubmitting.value = false;
  }
};

const openEditDeptModal = (item: { id_departemen: number; nama_departemen: string }) => {
  editDeptId.value = item.id_departemen;
  editDeptName.value = item.nama_departemen;
  showEditDeptModal.value = true;
};

const closeEditDeptModal = () => {
  showEditDeptModal.value = false;
  editDeptId.value = null;
};

const handleEditDeptSubmit = async () => {
  if (!editDeptId.value || !editDeptName.value.trim()) return;
  editDeptSubmitting.value = true;
  try {
    await departmentApi.update(editDeptId.value, { nama_departemen: editDeptName.value });
    closeEditDeptModal();
    await fetchData();
    deptSuccessMessage.value = t('employee.departmentUpdated');
    showDeptSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    editDeptSubmitting.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ t('employee.title') }}</h1>
        <p class="text-sm text-gray-500">
          {{ t('employee.subtitle') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="openAddModal"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ t('employee.addEmployee') }}
        </button>
        <button
          @click="openAddDeptModal"
          class="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ t('employee.addDepartment') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{{ t('employee.totalEmployees') }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ summary.total_karyawan }}</p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{{ t('employee.department') }}</p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_departemen }}
            <span class="text-sm font-normal text-gray-500">{{ t('employee.activeDivisions') }}</span>
          </p>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{{ t('employee.projectManager') }}</p>
          <p class="text-2xl font-bold text-gray-800">
            {{ summary.total_project_manager }}
            <span class="text-sm font-normal text-gray-500">{{ t('employee.registered') }}</span>
          </p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('employee.searchKaryawan')"
              class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div class="w-px h-8 bg-gray-300"></div>
          <select
            v-model="selectedDepartemen"
            class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[180px]"
          >
            <option value="">Semua Departemen</option>
            <option v-for="dept in departemenList" :key="dept.id_departemen" :value="dept.nama_departemen">
              {{ dept.nama_departemen }}
            </option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="Object.keys(groupedKaryawan).length === 0" class="p-8 text-center text-gray-400 text-sm">
          {{ t('employee.noData') }}
        </div>

        <template v-for="(employees, deptName) in groupedKaryawan" :key="deptName">
          <div class="bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-700 uppercase tracking-wide">{{ deptName }}</span>
            <button
              @click="openEditDeptModal({ id_departemen: departemenList.find(d => d.nama_departemen === deptName)?.id_departemen || 0, nama_departemen: deptName })"
              class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              {{ t('employee.edit') }}
            </button>
          </div>
          <table class="w-full table-fixed">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-12">No</th>
                <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[25%]">Nama</th>
                <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Jabatan</th>
                <th class="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[25%]">Email</th>
                <th class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-24">Status</th>
                <th class="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(item, index) in employees"
                :key="item.id_user || index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-3 py-2 text-sm text-gray-500 text-center">{{ index + 1 }}</td>
                <td class="px-3 py-2 text-sm font-medium text-gray-800 truncate">{{ item.nama }}</td>
                <td class="px-3 py-2 text-sm text-gray-600 truncate">{{ item.jabatan }}</td>
                <td class="px-3 py-2 text-sm text-gray-600 truncate">{{ item.email }}</td>
                <td class="px-3 py-2 text-center">
                  <span :class="['inline-block text-[10px] px-2 py-0.5 rounded-full font-medium', item.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                    {{ item.status === "Aktif" ? t('employee.active') : t('employee.inactive') }}
                  </span>
                </td>
                <td class="px-3 py-2 text-center">
                  <button @click="openEditModal(item)" class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">{{ t('employee.edit') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
    </template>

    <!-- Modal Tambah Karyawan -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeAddModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('employee.addModalTitle') }}</h3>
              <button @click="closeAddModal" class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.username') }} <span class="text-red-500">*</span></label>
                <input v-model="addForm.username" type="text" :placeholder="t('employee.usernamePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.name') }} <span class="text-red-500">*</span></label>
                <input v-model="addForm.nama" type="text" :placeholder="t('employee.namePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.password') }} <span class="text-red-500">*</span></label>
                <div class="relative">
                  <input v-model="addForm.password" :type="showAddPassword ? 'text' : 'password'" :placeholder="t('employee.passwordPlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" @click="showAddPassword = !showAddPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <svg v-if="showAddPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.role') }}</label>
                <select v-model="addForm.role" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="karyawan">{{ t('employee.karyawanTab') }}</option>
                  <option value="pm">{{ t('employee.projectManager') }}</option>
                  <option value="hr">HR</option>
                  <option value="direktur">Direktur</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.department') }}</label>
                <select v-model="addForm.id_departemen" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option v-for="dept in departemenOptions" :key="dept.id_departemen" :value="dept.id_departemen">{{ dept.nama_departemen }}</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button @click="closeAddModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('employee.cancel') }}</button>
              <button @click="handleAddSubmit" :disabled="addSubmitting || !addForm.username || !addForm.nama || !addForm.password" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                {{ addSubmitting ? t('employee.saving') : t('employee.save') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Edit Karyawan -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeEditModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('employee.editModalTitle') }}</h3>
              <button @click="closeEditModal" class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.name') }} <span class="text-red-500">*</span></label>
                <input v-model="editForm.nama" type="text" :placeholder="t('employee.namePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.role') }}</label>
                <select v-model="editForm.role" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="karyawan">{{ t('employee.karyawanTab') }}</option>
                  <option value="pm">{{ t('employee.projectManager') }}</option>
                  <option value="hr">HR</option>
                  <option value="direktur">Direktur</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.department') }}</label>
                <select v-model="editForm.id_departemen" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option v-for="dept in departemenOptions" :key="dept.id_departemen" :value="dept.id_departemen">{{ dept.nama_departemen }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                <select v-model="editForm.id_pm" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option :value="null">-</option>
                  <option v-for="pm in pmList" :key="pm.id_user" :value="pm.id_user">{{ pm.nama }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.email') }}</label>
                <input v-model="editForm.email" type="email" :placeholder="t('employee.emailPlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.phone') }}</label>
                <input v-model="editForm.no_telp" type="text" :placeholder="t('employee.phonePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.status') }}</label>
                <select v-model="editForm.status" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="Aktif">{{ t('employee.active') }}</option>
                  <option value="Cuti">{{ t('employee.inactive') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.joinDate') }}</label>
                <input v-model="editForm.tanggal_bergabung" type="date" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button @click="closeEditModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('employee.cancel') }}</button>
              <button @click="handleEditSubmit" :disabled="editSubmitting || !editForm.nama" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                {{ editSubmitting ? t('employee.saving') : t('employee.save') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('employee.success') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('employee.successMsg') }}</p>
            <button
              @click="showSuccessPopup = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              {{ t('employee.close') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Tambah Departemen -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddDeptModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeAddDeptModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('employee.addDepartment') }}</h3>
              <button @click="closeAddDeptModal" class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.departmentNameLabel') }} <span class="text-red-500">*</span></label>
                <input v-model="addDeptName" type="text" :placeholder="t('employee.departmentNamePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 mt-6">
              <button @click="closeAddDeptModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('employee.cancel') }}</button>
              <button @click="handleAddDeptSubmit" :disabled="addDeptSubmitting || !addDeptName.trim()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                {{ addDeptSubmitting ? t('employee.saving') : t('employee.save') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Edit Departemen -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditDeptModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeEditDeptModal">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('employee.editDepartment') }}</h3>
              <button @click="closeEditDeptModal" class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.departmentNameLabel') }} <span class="text-red-500">*</span></label>
                <input v-model="editDeptName" type="text" :placeholder="t('employee.departmentNamePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 mt-6">
              <button @click="closeEditDeptModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('employee.cancel') }}</button>
              <button @click="handleEditDeptSubmit" :disabled="editDeptSubmitting || !editDeptName.trim()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                {{ editDeptSubmitting ? t('employee.saving') : t('employee.save') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Department Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeptSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showDeptSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('common.success') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ deptSuccessMessage }}</p>
            <button
              @click="showDeptSuccessPopup = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              {{ t('common.close') }}
            </button>
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
