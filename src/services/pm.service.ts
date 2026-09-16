import api from "../lib/api";

export interface DashboardStats {
  sisa_cuti: number;
  jatah_cuti: number;
  cuti_terpakai: number;
  tim_menunggu_appoval: number;
  total_pengajuan_tim: number;
  total_pengajuan_acc_tim: number;
  total_pengajuan_decline_tim: number;
}

export interface DashboardTimItem {
  nama: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
}

export interface TeamMember {
  id_user: number;
  nama: string;
  departemen: string;
  sisa_cuti: number;
}

export interface ActivityItem {
  id: number;
  deskripsi: string;
  waktu: string;
  tipe: "approve" | "reject" | "submit" | "system";
}

export interface RingkasanTim {
  total_pengajuan: number;
  menunggu_persetujuan: number;
  sedang_cuti: number;
}

export interface RekapSaldoItem {
  nama: string;
  nama_departemen: string;
  penggunaan_cuti: number;
  sisa_cuti: number;
  status: string;
}

export interface RekapTimSummary {
  total_anggota_aktif: number;
  total_cuti_all: number;
}

export interface HistoryCutiItem {
  tanggal_mulai: string;
  tanggal_selesai: string;
  nama: string;
  jenis_cuti: string;
  keterangan: string;
  durasi: number;
  pengganti: string;
  status: string;
}

export interface RekapPengajuanKerjaItem {
  nama: string;
  nama_departemen: string;
  total_pengajuan: number;
  disetujui: number;
  ditolak: number;
  status: string;
  tanggal_kerja: { tanggal_mulai: string; tanggal_selesai: string }[];
}

export const pmApi = {
  getDashboardStats: () => api.get<DashboardStats>("/pm/dashboard"),

  getDashboardTim: () => api.get<DashboardTimItem[]>("/pm/dashboard-tim"),

  getTeamMembers: () => api.get<TeamMember[]>("/pm/team/members"),

  getRecentActivity: () => api.get<ActivityItem[]>("/pm/team/activity"),

  getHistoryCutiTim: () => api.get<HistoryCutiItem[]>("/pm/history-cuti-tim"),

  getApprovalHistory: (page = 1, limit = 10, search = "") =>
    api.get<{ data: HistoryCutiItem[]; total: number }>(
      "/pm/approvals/history",
      {
        params: { page, limit, search },
      },
    ),

  getRingkasanTim: () => api.get<RingkasanTim>("/pm/ringkasan-tim"),

  getRekapSummary: () => api.get<RekapTimSummary>("/pm/rekap-cuti-ringkasan"),

  getRekapSaldo: () => api.get<RekapSaldoItem[]>("/pm/rekap-cuti-detail"),

  exportRekapCsv: () => api.get("/pm/rekap/export", { responseType: "blob" }),

  getRekapPengajuanKerja: () =>
    api.get<RekapPengajuanKerjaItem[]>("/pm/rekap-pengajuan-kerja-detail"),
};
