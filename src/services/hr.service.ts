import api from "../lib/api";
import type { KalenderItem } from "./calendar.service";

export interface DashboardStats {
  total_karyawan: number;
  menunggu_hr: number;
  cuti_bulan_ini: number;
  cuti_mendatang: number;
}

export interface ActivityItem {
  id: number;
  deskripsi: string;
  waktu: string;
  tipe: "approve" | "reject" | "submit" | "system";
}

export interface PersetujuanItem {
  id_log_cuti: number;
  id_user: number;
  nama: string;
  jabatan: string;
  departemen: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number;
  delegasi_tugas: string;
  sisa_cuti: number;
  disetujui_oleh: string;
  keterangan: string;
  status: string;
}

export interface RingkasanPersetujuan {
  menunggu: number;
  disetujui_bulan_ini: number;
  ditolak_bulan_ini: number;
}

export interface RekapItem {
  id_user: number;
  nama: string;
  departemen: string;
  tanggal: string;
  total_cuti_tahun: number;
  cuti_diambil: number;
  sisa_cuti: number;
}

export interface LogCutiItem {
  id_log_cuti: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number;
  jenis_cuti: string;
  keterangan: string;
  backup: string;
  status: string;
  hr_approver: string;
}

export interface KaryawanItem {
  id_user: number;
  id_karyawan: string;
  nama: string;
  email: string;
  departemen: string;
  jabatan: string;
  status: string;
  nama_pm: string;
}

export interface DepartemenItem {
  id_departemen: number;
  nama_departemen: string;
  jumlah_karyawan: number;
}

export interface CreateKaryawanPayload {
  id_karyawan: string;
  nama: string;
  email: string;
  id_departemen: number;
  jabatan: string;
}

export interface UpdateKaryawanPayload {
  nama: string;
  email: string;
  id_departemen: number;
  jabatan: string;
  status: string;
}

export const hrApi = {
  getDashboardStats: () => api.get<DashboardStats>("/hr/dashboard"),

  getCutiMendatang: () => api.get<KalenderItem[]>("/hr/cuti-mendatang"),

  getRecentActivity: () => api.get<ActivityItem[]>("/hr/activity"),

  getPendingApprovals: () =>
    api.get<PersetujuanItem[]>("/hr/approvals/pending"),

  getApprovalHistory: () =>
    api.get<PersetujuanItem[]>("/hr/approvals/history"),

  getRingkasan: () => api.get<RingkasanPersetujuan>("/hr/approvals/ringkasan"),

  approve: (id: number) => api.post(`/hr/approvals/${id}/approve`),

  reject: (id: number, alasan: string) =>
    api.post(`/hr/approvals/${id}/reject`, { alasan }),

  getRekap: (params: { search?: string; tahun?: number; status?: string }) =>
    api.get<RekapItem[]>("/hr/log-rekap/rekap", { params }),

  getLogCuti: (params: { search?: string; tahun?: number; status?: string }) =>
    api.get<LogCutiItem[]>("/hr/log-rekap/log", { params }),

  getDataKaryawanSummary: () =>
    api.get<{ total_karyawan: number; total_departemen: number; total_pm: number }>("/hr/data-karyawan/summary"),

  getDataKaryawan: (params?: { search?: string }) =>
    api.get<KaryawanItem[]>("/hr/data-karyawan", { params }),

  createKaryawan: (data: CreateKaryawanPayload) =>
    api.post("/hr/data-karyawan", data),

  updateKaryawan: (id: number, data: UpdateKaryawanPayload) =>
    api.put(`/hr/data-karyawan/${id}`, data),

  getDataDepartemen: (params?: { search?: string }) =>
    api.get<DepartemenItem[]>("/hr/data-departemen", { params }),

  createDepartemen: (data: { nama_departemen: string }) =>
    api.post("/hr/data-departemen", data),

  updateDepartemen: (id: number, data: { nama_departemen: string }) =>
    api.put(`/hr/data-departemen/${id}`, data),
};
