<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  direkturApi,
  type RingkasanKaryawan,
  type KaryawanItem,
} from "../../services/direktur.service";
import { hrApi } from "../../services/hr.service";
import { authApi } from "../../services/auth.service";
import { departmentApi } from "../../services/department.service";
import { useErrorPopup } from "../../composables/useErrorPopup";

const { t } = useI18n();
const { showError } = useErrorPopup();

const searchQuery = ref("");
const selectedDepartemen = ref("");
const loading = ref(true);
const collapsedDepartments = reactive(new Set<string>());

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
  email: "",
  no_telp: "",
  tanggal_bergabung: "",
  id_pm_list: [] as number[],
});

const addSelectedPmList = ref<{ id_user: number; nama: string }[]>([]);
const addPmDropdownOpen = ref(false);

const addAvailablePmList = computed(() => {
  return pmList.value.filter((pm) => !addSelectedPmList.value.find((p) => p.id_user === pm.id_user));
});

const addPmToList = (pm: { id_user: number; nama: string }) => {
  if (!addSelectedPmList.value.find((p) => p.id_user === pm.id_user)) {
    addSelectedPmList.value.push(pm);
    addForm.value.id_pm_list = addSelectedPmList.value.map((p) => p.id_user);
  }
  addPmDropdownOpen.value = false;
};

const removePmFromAddList = (pm: { id_user: number; nama: string }) => {
  addSelectedPmList.value = addSelectedPmList.value.filter((p) => p.id_user !== pm.id_user);
  addForm.value.id_pm_list = addSelectedPmList.value.map((p) => p.id_user);
};

const editForm = ref({
  nama: "",
  role: "karyawan",
  id_departemen: 0,
  email: "",
  no_telp: "",
  tanggal_bergabung: "",
  status: "Aktif",
});
const editUserId = ref<number | null>(null);
const editSelectedPmList = ref<{ id_user: number; nama: string }[]>([]);
const editPmAdd = ref<number[]>([]);
const editPmRemove = ref<number[]>([]);
const editPmDropdownOpen = ref(false);

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

const toggleDept = (deptName: string) => {
  if (collapsedDepartments.has(deptName)) {
    collapsedDepartments.delete(deptName);
  } else {
    collapsedDepartments.add(deptName);
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [summaryRes, karyawanRes, departemenRes, pmRes] = await Promise.allSettled([
      direkturApi.getDataKaryawanSummary(),
      direkturApi.getDataKaryawan(),
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
    email: "",
    no_telp: "",
    tanggal_bergabung: "",
    id_pm_list: [],
  };
  addSelectedPmList.value = [];
  addPmDropdownOpen.value = false;
  showAddPassword.value = false;
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const handleAddSubmit = async () => {
  addSubmitting.value = true;
  try {
    await authApi.registerAdmin({
      username: addForm.value.username,
      nama: addForm.value.nama,
      password: addForm.value.password,
      role: addForm.value.role,
      id_departemen: addForm.value.id_departemen,
      email: addForm.value.email,
      no_telp: addForm.value.no_telp,
      tanggal_bergabung: addForm.value.tanggal_bergabung,
      id_pm_list: addForm.value.id_pm_list,
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
    email: item.email || "",
    no_telp: item.no_telp || "",
    tanggal_bergabung: item.tanggal_bergabung || "",
    status: item.status || "Aktif",
  };
  editSelectedPmList.value = (item.nama_pm || []).map((nama: string) => {
    const found = pmList.value.find((p) => p.nama === nama);
    return found || { id_user: 0, nama };
  });
  editPmAdd.value = [];
  editPmRemove.value = [];
  editPmDropdownOpen.value = false;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editUserId.value = null;
  editPmDropdownOpen.value = false;
};

const addPmToEdit = (pm: { id_user: number; nama: string }) => {
  if (!editSelectedPmList.value.find((p) => p.id_user === pm.id_user)) {
    editSelectedPmList.value.push(pm);
    if (pm.id_user > 0 && !editPmRemove.value.includes(pm.id_user)) {
      editPmAdd.value.push(pm.id_user);
    }
  }
  editPmDropdownOpen.value = false;
};

const removePmFromEdit = (pm: { id_user: number; nama: string }) => {
  editSelectedPmList.value = editSelectedPmList.value.filter((p) => p.id_user !== pm.id_user);
  if (pm.id_user > 0) {
    editPmAdd.value = editPmAdd.value.filter((id) => id !== pm.id_user);
    editPmRemove.value.push(pm.id_user);
  }
};

const editAvailablePmList = computed(() => {
  return pmList.value.filter((pm) => !editSelectedPmList.value.find((p) => p.id_user === pm.id_user));
});

const handleEditSubmit = async () => {
  if (!editUserId.value || !editForm.value.nama) return;
  editSubmitting.value = true;
  try {
    await authApi.updateKaryawan(editUserId.value, {
      nama: editForm.value.nama,
      role: editForm.value.role,
      id_departemen: editForm.value.id_departemen,
      email: editForm.value.email,
      no_telp: editForm.value.no_telp,
      tanggal_bergabung: editForm.value.tanggal_bergabung || new Date().toISOString().split('T')[0],
      status: editForm.value.status,
      pm_add: editPmAdd.value.length > 0 ? editPmAdd.value : undefined,
      pm_remove: editPmRemove.value.length > 0 ? editPmRemove.value : undefined,
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
          <div
            class="bg-gray-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between cursor-pointer select-none"
            @click="toggleDept(deptName)"
          >
            <div class="flex items-center gap-2">
              <svg
                :class="['w-4 h-4 transition-transform duration-200', !collapsedDepartments.has(deptName) && 'rotate-90']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-xs font-bold text-gray-700 uppercase tracking-wide">{{ deptName }}</span>
              <span class="text-[10px] text-gray-500 font-normal">({{ employees.length }})</span>
            </div>
            <button
              @click.stop="openEditDeptModal({ id_departemen: departemenList.find(d => d.nama_departemen === deptName)?.id_departemen || 0, nama_departemen: deptName })"
              class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              {{ t('employee.edit') }}
            </button>
          </div>
          <table v-show="!collapsedDepartments.has(deptName)" class="w-full" style="table-layout: fixed">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[5%]">No</th>
                <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[12%]">Nama</th>
                <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Jabatan</th>
                <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Email</th>
                <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[10%]">No. Telp</th>
                <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Tgl Gabung</th>
                <th class="text-left px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Project Manager</th>
                <th class="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Status</th>
                <th class="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(item, index) in employees"
                :key="item.id_user || index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-2 py-2 text-sm text-gray-500 text-center">{{ index + 1 }}</td>
                <td class="px-2 py-2 text-sm font-medium text-gray-800">{{ item.nama }}</td>
                <td class="px-2 py-2 text-sm text-gray-600 truncate" :title="item.jabatan === 'pm' ? 'Project Manager' : item.jabatan === 'hr' ? 'Human Resources' : item.jabatan === 'staff_hr' ? 'Staff HR' : item.jabatan">{{ item.jabatan === 'pm' ? 'PM' : item.jabatan === 'hr' ? 'HR' : item.jabatan === 'staff_hr' ? 'Staff HR' : item.jabatan }}</td>
                <td class="px-2 py-2 text-sm text-gray-600 truncate" :title="item.email">{{ item.email }}</td>
                <td class="px-2 py-2 text-sm text-gray-600 truncate" :title="item.no_telp || '-'">{{ item.no_telp || '-' }}</td>
                <td class="px-2 py-2 text-sm text-gray-600 truncate" :title="item.tanggal_bergabung || '-'">{{ item.tanggal_bergabung || '-' }}</td>
                <td class="px-2 py-2 text-sm text-gray-600">
                  <span v-if="item.departemen !== 'Manajemen Perusahaan' && item.nama_pm && item.nama_pm.length > 0">{{ item.nama_pm.join(', ') }}</span>
                  <span v-else-if="item.departemen === 'MANAJEMEN PERUSAHAAN'" class="text-gray-400">-</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-2 py-2 text-center">
                  <span :class="['inline-block text-[10px] px-2 py-0.5 rounded-full font-medium', item.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-2 py-2 text-center">
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
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
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
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.role') }} <span class="text-red-500">*</span></label>
                <select v-model="addForm.role" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="karyawan">{{ t('employee.karyawanTab') }}</option>
                  <option value="pm">{{ t('employee.projectManager') }}</option>
                  <option value="hr">HR</option>
                  <option value="staff_hr">Staff HR</option>
                  <option value="direktur">Direktur</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.department') }} <span class="text-red-500">*</span></label>
                <select v-model="addForm.id_departemen" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option v-for="dept in departemenOptions" :key="dept.id_departemen" :value="dept.id_departemen">{{ dept.nama_departemen }}</option>
                </select>
              </div>
              <div v-if="addForm.id_departemen && departemenOptions.find(d => d.id_departemen === addForm.id_departemen)?.nama_departemen !== 'Manajemen Perusahaan'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                <div class="relative">
                  <button
                    type="button"
                    @click="addPmDropdownOpen = !addPmDropdownOpen"
                    class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between bg-white"
                  >
                    <span class="text-gray-500">Pilih Project Manager</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <div v-if="addPmDropdownOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div v-if="addAvailablePmList.length === 0" class="px-4 py-2 text-sm text-gray-400">
                      Semua PM sudah dipilih
                    </div>
                    <button
                      v-for="pm in addAvailablePmList"
                      :key="pm.id_user"
                      @click="addPmToList(pm)"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                    >
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {{ pm.nama }}
                    </button>
                  </div>
                </div>
                <div v-if="addSelectedPmList.length > 0" class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="pm in addSelectedPmList"
                    :key="pm.id_user"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {{ pm.nama }}
                    <button @click="removePmFromAddList(pm)" class="hover:text-blue-900 cursor-pointer">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.email') }} <span class="text-red-500">*</span></label>
                <input v-model="addForm.email" type="email" :placeholder="t('employee.emailPlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.phone') }} <span class="text-red-500">*</span></label>
                <input v-model="addForm.no_telp" type="text" :placeholder="t('employee.phonePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.joinDate') }} <span class="text-red-500">*</span></label>
                <input v-model="addForm.tanggal_bergabung" type="date" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button @click="closeAddModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('employee.cancel') }}</button>
              <button @click="handleAddSubmit" :disabled="addSubmitting" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
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
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
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
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.role') }} <span class="text-red-500">*</span></label>
                <select v-model="editForm.role" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="karyawan">{{ t('employee.karyawanTab') }}</option>
                  <option value="pm">{{ t('employee.projectManager') }}</option>
                  <option value="hr">HR</option>
                  <option value="staff_hr">Staff HR</option>
                  <option value="direktur">Direktur</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.department') }} <span class="text-red-500">*</span></label>
                <select v-model="editForm.id_departemen" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option v-for="dept in departemenOptions" :key="dept.id_departemen" :value="dept.id_departemen">{{ dept.nama_departemen }}</option>
                </select>
              </div>
              <div v-if="editForm.id_departemen && departemenOptions.find(d => d.id_departemen === editForm.id_departemen)?.nama_departemen !== 'Manajemen Perusahaan'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                <div class="relative">
                  <button
                    type="button"
                    @click="editPmDropdownOpen = !editPmDropdownOpen"
                    class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between bg-white"
                  >
                    <span class="text-gray-500">Pilih Project Manager</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <div v-if="editPmDropdownOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div v-if="editAvailablePmList.length === 0" class="px-4 py-2 text-sm text-gray-400">
                      Semua PM sudah dipilih
                    </div>
                    <button
                      v-for="pm in editAvailablePmList"
                      :key="pm.id_user"
                      @click="addPmToEdit(pm)"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                    >
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {{ pm.nama }}
                    </button>
                  </div>
                </div>
                <div v-if="editSelectedPmList.length > 0" class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="pm in editSelectedPmList"
                    :key="pm.id_user"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {{ pm.nama }}
                    <button @click="removePmFromEdit(pm)" class="hover:text-blue-900 cursor-pointer">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.email') }}</label>
                <input v-model="editForm.email" type="email" :placeholder="t('employee.emailPlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.phone') }} <span class="text-red-500">*</span></label>
                <input v-model="editForm.no_telp" type="text" :placeholder="t('employee.phonePlaceholder')" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.status') }} <span class="text-red-500">*</span></label>
                <select v-model="editForm.status" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="Aktif">{{ t('employee.active') }}</option>
                  <option value="Cuti">{{ t('employee.inactive') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('employee.joinDate') }} <span class="text-red-500">*</span></label>
                <input v-model="editForm.tanggal_bergabung" type="date" class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
              <button @click="closeEditModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">{{ t('employee.cancel') }}</button>
              <button @click="handleEditSubmit" :disabled="editSubmitting" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
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
