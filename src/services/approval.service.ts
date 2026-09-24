import api from "../lib/api";

export interface ApprovalQueueItem {
  id_log_cuti: number;
  nama: string;
  nama_departemen: string;
  jenis_cuti: string;
  tanggal: string[];
  durasi: number;
  pengganti: string;
  sisa_cuti: number;
  alasan: string;
  approval_pm_detail: PmApprovalDetail[];
}

export interface PmApprovalDetail {
  nama_pm: string
  status: string
  processed_at: string | null
}

export interface PenambahanKerjaQueueItem {
  id_pengajuan_kerja: number
  nama: string
  nama_departemen: string
  tanggal: string[]
  keterangan: string
  tanggal_pengajuan: string
  status: string
  approval_pm_detail: PmApprovalDetail[]
}

export const approvalApi = {
  getApprovalQueue: () =>
    api.get<ApprovalQueueItem[]>("/approval/approval-queue"),

  approve: (id: number) =>
    api.post(`/approval/approval${id}`, { action: "acc", alasan: "" }),

  reject: (id: number, alasan: string) =>
    api.post(`/approval/approval${id}`, { action: "decline", alasan }),

  getPenambahanKerjaQueue: () =>
    api.get<PenambahanKerjaQueueItem[]>("/approval/penambahan-kerja-queue"),

  approvePenambahanKerja: (id: number) =>
    api.post(`/approval/penambahan-kerja/${id}`, { action: "acc", alasan: "" }),

  rejectPenambahanKerja: (id: number, alasan: string) =>
    api.post(`/approval/penambahan-kerja/${id}`, { action: "decline", alasan }),
};
