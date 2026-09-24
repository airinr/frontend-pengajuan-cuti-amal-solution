<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  hrApi,
  type RingkasanPersetujuan,
} from "../../services/hr.service";
import { approvalApi, type ApprovalQueueItem } from "../../services/approval.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import { useFormatTanggal } from "../../composables/useFormatTanggal";

const { t } = useI18n();
const { showError } = useErrorPopup();
const { formatTanggal } = useFormatTanggal();

const activeTab = ref<"menunggu">("menunggu");
const pendingList = ref<ApprovalQueueItem[]>([]);
const ringkasan = ref<RingkasanPersetujuan | null>(null);
const loading = ref(true);
const processingId = ref<number | null>(null);

const showApproveModal = ref(false);
const approveTarget = ref<ApprovalQueueItem | null>(null);

const showRejectModal = ref(false);
const rejectTarget = ref<ApprovalQueueItem | null>(null);
const rejectAlasan = ref("");
const rejectLoading = ref(false);
const showApproveSuccessPopup = ref(false);
const showRejectSuccessPopup = ref(false);

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const fetchPending = async () => {
  try {
    const [pendingRes, ringkasanRes] = await Promise.allSettled([
      approvalApi.getApprovalQueue(),
      hrApi.getRingkasan(),
    ]);
    if (pendingRes.status === "fulfilled") pendingList.value = pendingRes.value.data || [];
    if (ringkasanRes.status === "fulfilled") ringkasan.value = ringkasanRes.value.data;
  } catch (err) {
    showError(err);
  }
};

const openApproveModal = (item: ApprovalQueueItem) => {
  approveTarget.value = item;
  showApproveModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  approveTarget.value = null;
};

const handleApprove = async () => {
  if (!approveTarget.value) return;
  const id = approveTarget.value.id_log_cuti;
  processingId.value = id;
  try {
    await approvalApi.approve(id);
    pendingList.value = pendingList.value.filter((item) => item.id_log_cuti !== id);
    if (ringkasan.value) {
      ringkasan.value.total_menunggu = Math.max(0, ringkasan.value.total_menunggu - 1);
      ringkasan.value.disetujui_bulan_ini += 1;
    }
    closeApproveModal();
    showApproveSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const openRejectModal = (item: ApprovalQueueItem) => {
  rejectTarget.value = item;
  rejectAlasan.value = "";
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectTarget.value = null;
  rejectAlasan.value = "";
};

const handleReject = async () => {
  if (!rejectTarget.value || !rejectAlasan.value.trim()) return;
  rejectLoading.value = true;
  try {
    await approvalApi.reject(rejectTarget.value.id_log_cuti, rejectAlasan.value);
    pendingList.value = pendingList.value.filter(
      (item) => item.id_log_cuti !== rejectTarget.value!.id_log_cuti
    );
    if (ringkasan.value) {
      ringkasan.value.total_menunggu = Math.max(0, ringkasan.value.total_menunggu - 1);
      ringkasan.value.ditolak_bulan_ini += 1;
    }
    closeRejectModal();
    showRejectSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    rejectLoading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await fetchPending();
  loading.value = false;
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ t('approval.leaveApproval') }}</h1>
        <p class="text-sm text-gray-500">{{ t('approval.manageTeamLeave') }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Left: Cards -->
        <div class="flex-1 space-y-4">
          <div v-if="pendingList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
            {{ t('approval.noPending') }}
          </div>

          <div
            v-for="item in pendingList"
            :key="item.id_log_cuti"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div class="flex">
              <!-- Left border color -->
              <div
                class="w-1 flex-shrink-0 bg-red-500"
              ></div>
              <div class="flex-1 p-4 lg:p-5">
                <!-- Header: Avatar + Name + Status -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {{ getInitials(item.nama) }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-800">{{ item.nama }}</p>
                      <p class="text-xs text-gray-500">{{ item.nama_departemen }}</p>
                    </div>
                  </div>
                  <span
                    class="flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full"
                  >
                    <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    {{ t('status.pending').toUpperCase() }}
                  </span>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.jenisCuti') }}</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.jenis_cuti }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.dateRange') }}</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ formatTanggal(item.tanggal) }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.duration') }}</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.durasi }} Hari</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.delegasiTugas') }}</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.pengganti || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{{ t('approval.remainingLeave') }}</p>
                    <p class="text-xs font-medium text-gray-700 mt-0.5">{{ item.sisa_cuti }}</p>
                  </div>
                </div>

                <!-- Alasan -->
                <div class="mb-4">
                  <p class="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-1">{{ t('approval.leaveReason') }}</p>
                  <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{{ item.alasan || '-' }}</p>
                </div>

                <!-- PM Approval Details -->
                <div v-if="item.approval_pm_detail && item.approval_pm_detail.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p class="text-xs font-semibold text-blue-800 mb-2">
                    {{ t('status.approvalPM') }}
                    <span v-if="item.approval_pm_detail.length > 1" class="font-normal">
                      ({{ item.approval_pm_detail.filter(pm => pm.status === 'disetujui').length }}/{{ item.approval_pm_detail.length }})
                    </span>
                  </p>
                  <div class="space-y-1.5">
                    <div v-for="(pm, i) in item.approval_pm_detail" :key="i" class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div :class="[
                          'w-5 h-5 rounded-full flex items-center justify-center',
                          pm.status === 'disetujui' ? 'bg-green-100' : pm.status === 'ditolak' ? 'bg-red-100' : 'bg-gray-100'
                        ]">
                          <svg v-if="pm.status === 'disetujui'" class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <svg v-else-if="pm.status === 'ditolak'" class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span v-else class="text-[10px] text-gray-500">{{ i + 1 }}</span>
                        </div>
                        <span class="text-xs text-gray-700">{{ pm.nama_pm }}</span>
                      </div>
                      <span :class="[
                        'text-[10px] font-medium',
                        pm.status === 'disetujui' ? 'text-green-600' : pm.status === 'ditolak' ? 'text-red-600' : 'text-gray-400'
                      ]">
                        {{ pm.status === 'disetujui' ? t('status.approved') : pm.status === 'ditolak' ? t('status.rejected') : t('status.waiting') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-3">
                  <button
                    @click="openRejectModal(item)"
                    :disabled="processingId === item.id_log_cuti"
                    class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ t('approval.reject') }}
                  </button>
                  <button
                    @click="openApproveModal(item)"
                    :disabled="processingId === item.id_log_cuti"
                    class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ t('approval.approve') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="w-full lg:w-72">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-4">{{ t('approval.summary') }}</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">{{ t('approval.waiting') }}</span>
                <span class="text-lg font-bold text-gray-800">{{ ringkasan?.total_menunggu ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">{{ t('approval.disetujuiBulanIni') }}</span>
                <span class="text-lg font-bold text-green-600">{{ ringkasan?.disetujui_bulan_ini ?? '-' }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">{{ t('approval.ditolakBulanIni') }}</span>
                <span class="text-lg font-bold text-red-600">{{ ringkasan?.ditolak_bulan_ini ?? '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Reject Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRejectModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeRejectModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('approval.rejectTitle') }}</h3>
              <button
                @click="closeRejectModal"
                class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="text-sm text-gray-500 mb-4">
              {{ t('approval.rejectMessage') }}
            </p>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('approval.rejectReason') }} <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="rejectAlasan"
                rows="3"
                placeholder="contoh: Jadwal sudah padat, tidak bisa diganti dengan rekan lain"
                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeRejectModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="handleReject"
                :disabled="!rejectAlasan.trim() || rejectLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ rejectLoading ? t('approval.rejecting') : t('approval.confirmReject') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Approve Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showApproveModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeApproveModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ t('approval.approveConfirm') }}</h3>
              <button
                @click="closeApproveModal"
                class="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="text-sm text-gray-500 mb-4">
              Anda akan menyetujui pengajuan cuti dari <span class="font-semibold text-gray-800">{{ approveTarget?.nama }}</span>.
              Apakah Anda yakin ingin menyetujui?
            </p>

            <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p><span class="text-gray-500">Jenis Cuti:</span> <span class="font-medium text-gray-800">{{ approveTarget?.jenis_cuti }}</span></p>
              <p><span class="text-gray-500">Tanggal:</span> <span class="font-medium text-gray-800">{{ approveTarget ? formatTanggal(approveTarget.tanggal) : '' }}</span></p>
              <p><span class="text-gray-500">Durasi:</span> <span class="font-medium text-gray-800">{{ approveTarget?.durasi }} Hari</span></p>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeApproveModal"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="handleApprove"
                :disabled="processingId !== null"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {{ processingId ? t('approval.approving') : t('approval.approve') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Approve Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showApproveSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showApproveSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('approval.approveSuccess') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.approveSuccessMsg') }}</p>
            <button
              @click="showApproveSuccessPopup = false"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reject Success Popup -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRejectSuccessPopup"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="showRejectSuccessPopup = false"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('approval.rejectSuccess') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.rejectSuccessMsg') }}</p>
            <button
              @click="showRejectSuccessPopup = false"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
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
