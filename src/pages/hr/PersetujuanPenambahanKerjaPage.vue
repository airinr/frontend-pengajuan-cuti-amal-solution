<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  approvalApi,
  type PenambahanKerjaQueueItem,
} from "../../services/approval.service";
import { useErrorPopup } from "../../composables/useErrorPopup";
import { useFormatTanggal } from "../../composables/useFormatTanggal";

const { t } = useI18n();
const { showError } = useErrorPopup();
const { formatTanggal } = useFormatTanggal();

const pendingList = ref<PenambahanKerjaQueueItem[]>([]);
const loading = ref(true);
const processingId = ref<number | null>(null);

const showApproveModal = ref(false);
const approveTarget = ref<PenambahanKerjaQueueItem | null>(null);

const showRejectModal = ref(false);
const rejectTarget = ref<PenambahanKerjaQueueItem | null>(null);
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

const hasMultiplePm = (item: PenambahanKerjaQueueItem) => {
  return item.approval_pm_detail && item.approval_pm_detail.length > 1;
};

const getPmApprovalStatus = (item: PenambahanKerjaQueueItem) => {
  if (!item.approval_pm_detail) return { approved: 0, total: 0 };
  const approved = item.approval_pm_detail.filter(pm => pm.status === 'disetujui').length;
  return { approved, total: item.approval_pm_detail.length };
};

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const month = months[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes}`;
};

const fetchPending = async () => {
  try {
    const res = await approvalApi.getPenambahanKerjaQueue();
    pendingList.value = res.data || [];
  } catch (err) {
    showError(err);
    pendingList.value = [];
  }
};

const openApproveModal = (item: PenambahanKerjaQueueItem) => {
  approveTarget.value = item;
  showApproveModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  approveTarget.value = null;
};

const handleApprove = async () => {
  if (!approveTarget.value) return;
  processingId.value = approveTarget.value.id_pengajuan_kerja;
  try {
    await approvalApi.approvePenambahanKerja(approveTarget.value.id_pengajuan_kerja);
    pendingList.value = pendingList.value.filter(
      (item) => item.id_pengajuan_kerja !== approveTarget.value?.id_pengajuan_kerja
    );
    closeApproveModal();
    showApproveSuccessPopup.value = true;
  } catch (err) {
    showError(err);
  } finally {
    processingId.value = null;
  }
};

const openRejectModal = (item: PenambahanKerjaQueueItem) => {
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
    await approvalApi.rejectPenambahanKerja(rejectTarget.value.id_pengajuan_kerja, rejectAlasan.value);
    pendingList.value = pendingList.value.filter(
      (item) => item.id_pengajuan_kerja !== rejectTarget.value?.id_pengajuan_kerja
    );
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
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-bold text-gray-800">{{ t('approval.workApproval') }}</h1>
      <p class="text-sm text-gray-500">{{ t('approval.approveWorkDescription') }}</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <template v-else>

      <div v-if="pendingList.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
        {{ t('approval.noPending') }}
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in pendingList"
          :key="item.id_pengajuan_kerja"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div class="flex">
            <div class="w-1 bg-yellow-500"></div>
            <div class="flex-1 p-4 lg:p-5">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ getInitials(item.nama) }}
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-gray-800">{{ item.nama }}</h3>
                    <p class="text-xs text-gray-500">{{ item.nama_departemen }}</p>
                  </div>
                </div>
                <span class="inline-block text-[10px] px-2.5 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                  {{ t('approval.waiting') }}
                </span>
              </div>

              <div class="bg-gray-50 rounded-lg p-3 mb-3">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p class="text-gray-400 mb-0.5">Keterangan</p>
                    <p class="font-medium text-gray-700">{{ item.keterangan || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 mb-0.5">{{ t('approval.dateRange') }}</p>
                    <p class="font-medium text-gray-700">{{ formatTanggal(item.tanggal) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400 mb-0.5">Tanggal Pengajuan</p>
                    <p class="font-medium text-gray-700">{{ formatDateShort(item.tanggal_pengajuan) }}</p>
                  </div>
                </div>
              </div>

              <!-- PM Approval Details -->
              <div v-if="item.approval_pm_detail && item.approval_pm_detail.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-semibold text-blue-800">{{ t('status.approvalPM') }}</p>
                  <span v-if="item.approval_pm_detail.length > 1" class="text-[10px] text-blue-600 font-medium">({{ getPmApprovalStatus(item).approved }}/{{ getPmApprovalStatus(item).total }})</span>
                </div>
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
                    <div class="flex items-center gap-2">
                      <span v-if="pm.status === 'disetujui'" class="text-[10px] text-green-600 font-medium">{{ t('status.approved') }}</span>
                      <span v-else-if="pm.status === 'ditolak'" class="text-[10px] text-red-600 font-medium">{{ t('status.rejected') }}</span>
                      <span v-else class="text-[10px] text-gray-400">{{ t('status.waiting') }}</span>
                      <span v-if="pm.processed_at" class="text-[10px] text-gray-400">{{ formatDateShort(pm.processed_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3">
                <button
                  @click="openRejectModal(item)"
                  :disabled="processingId === item.id_pengajuan_kerja"
                  class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {{ t('approval.reject') }}
                </button>
                <button
                  @click="openApproveModal(item)"
                  :disabled="processingId === item.id_pengajuan_kerja"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {{ processingId === item.id_pengajuan_kerja ? '...' : t('approval.approve') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Approve Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showApproveModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeApproveModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4">{{ t('approval.approveConfirm') }}</h3>
            <p class="text-sm text-gray-600 mb-4">
              {{ t('approval.approveMessage') }} <strong>{{ approveTarget?.nama }}</strong>?
            </p>
            <div class="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-600">
              <p>Keterangan: {{ approveTarget?.keterangan }}</p>
              <p>Tanggal: {{ approveTarget ? formatTanggal(approveTarget.tanggal) : '' }}</p>
            </div>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.approveQuestion') }}</p>
            <div class="flex justify-end gap-3">
              <button @click="closeApproveModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                {{ t('approval.cancel') }}
              </button>
              <button @click="handleApprove" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
                {{ t('approval.approve') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reject Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRejectModal"
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          @click.self="closeRejectModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-2">{{ t('approval.rejectTitle') }}</h3>
            <p class="text-sm text-gray-500 mb-4">
              {{ t('approval.rejectMessage') }} <strong>{{ rejectTarget?.nama }}</strong>.
            </p>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('approval.rejectReason') }} <span class="text-red-500">{{ t('approval.rejectRequired') }}</span>
              </label>
              <textarea
                v-model="rejectAlasan"
                rows="3"
                :placeholder="t('approval.rejectPlaceholder')"
                class="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button @click="closeRejectModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                {{ t('approval.cancel') }}
              </button>
              <button
                @click="handleReject"
                :disabled="!rejectAlasan.trim() || rejectLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {{ rejectLoading ? t('approval.rejecting') : t('approval.confirmReject') }}
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
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('approval.approveWorkSuccess') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.approveWorkSuccessMsg') }}</p>
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
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('approval.rejectWorkSuccess') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('approval.rejectWorkSuccessMsg') }}</p>
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
