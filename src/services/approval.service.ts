import api from "../lib/api";

export interface ApprovalQueueItem {
  id_log_cuti: number;
  nama: string;
  nama_departemen: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number;
  pengganti: string;
  sisa_cuti: number;
  alasan: string;
}

export const approvalApi = {
  getApprovalQueue: () =>
    api.get<ApprovalQueueItem[]>("/approval/approval-queue"),

  approve: (id: number) =>
    api.post(`/approval/approval${id}`, { action: "acc", alasan: "" }),

  reject: (id: number, alasan: string) =>
    api.post(`/approval/approval${id}`, { action: "decline", alasan }),
};
