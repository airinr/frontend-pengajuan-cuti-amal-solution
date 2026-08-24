import api from "../lib/api";

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
  total_menunggu: number;
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

export interface CutiMendatangItem {
  nama: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
}

export interface RingkasanKaryawan {
  total_karyawan: number;
  total_departemen: number;
  total_project_manager: number;
}

export interface KaryawanItem {
  nama: string;
  departemen: string;
  jabatan: string;
  email: string;
  status: string;
}

export interface DepartemenItem {
  nama_departemen: string;
  jumlah_karyawan: number;
}

export interface ManajemenJatahCuti {
  total_karyawan_aktif: number;
  total_karyawan_cuti: number;
}

export interface DaftarCutiKaryawan {
  nama: string;
  nama_departemen: string;
  total_cuti: number;
  cuti_terpakai: number;
  sisa_cuti: number;
}

export const hrApi = {
  getDashboardStats: () => api.get<DashboardStats>("/hr/dashboard"),

  getCutiMendatang: () => api.get<CutiMendatangItem[]>("/hr/list-cuti-mendatang"),

  getRecentActivity: () => api.get<ActivityItem[]>("/hr/activity"),

  getApprovalHistory: () =>
    api.get<PersetujuanItem[]>("/hr/approvals/history"),

  getRingkasan: () => api.get<RingkasanPersetujuan>("/hr/persetujuan"),

  getRekap: (params: { search?: string; tahun?: number; status?: string }) =>
    api.get<RekapItem[]>("/hr/log-rekap/rekap", { params }),

  getLogCuti: (params: { search?: string; tahun?: number; status?: string }) =>
    api.get<LogCutiItem[]>("/hr/log-rekap/log", { params }),

  getDataKaryawanSummary: () =>
    api.get<RingkasanKaryawan>("/hr/ringkasan-karyawan"),

  getDataKaryawan: () =>
    api.get<KaryawanItem[]>("/hr/tabel-karyawan"),

  getDataDepartemen: () =>
    api.get<DepartemenItem[]>("/hr/tabel-departemen"),

  getManajemenJatahCuti: () =>
    api.get<ManajemenJatahCuti>("/hr/manajemen-jatah-cuti"),

  getDaftarCutiKaryawan: () =>
    api.get<DaftarCutiKaryawan[]>("/hr/daftar-cuti-karyawan"),
};
