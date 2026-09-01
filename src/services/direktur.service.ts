import api from "../lib/api";

export interface DashboardStats {
  total_karyawan: number;
  menunggu: number;
  total_cuti_bulan_ini: number;
  total_cuti_bulan_depan: number;
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
  nama: string;
  nama_departemen: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_cuti: number;
  sisa_cuti: number;
}

export interface LogCutiItem {
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number;
  jenis_cuti: string;
  keterangan: string;
  pengganti: string;
  status: string;
  hr_approved_by: string;
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
  id_user?: number;
  id_karyawan?: string;
  nama: string;
  departemen: string;
  jabatan: string;
  email: string;
  status: string;
  nama_pm?: string;
}

export interface DepartemenItem {
  id_departemen: number;
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

export interface CreateKaryawanPayload {
  id_karyawan?: string;
  nama: string;
  email: string;
  id_departemen?: number;
  departemen?: string;
  jabatan: string;
}

export interface UpdateKaryawanPayload {
  nama: string;
  email: string;
  id_departemen?: number;
  departemen?: string;
  jabatan: string;
  status: string;
}

export const direkturApi = {
  getDashboardStats: () => api.get<DashboardStats>("/hr/dashboard"),

  getCutiMendatang: () => api.get<CutiMendatangItem[]>("/hr/list-cuti-mendatang"),

  getRecentActivity: () => api.get<ActivityItem[]>("/hr/activity"),

  getApprovalHistory: () =>
    api.get<PersetujuanItem[]>("/hr/approvals/history"),

  getRingkasan: () => api.get<RingkasanPersetujuan>("/hr/persetujuan"),

  getRekap: () =>
    api.get<RekapItem[]>("/hr/rekapitulasi"),

  getLogCuti: () =>
    api.get<LogCutiItem[]>("/hr/log-cuti"),

  exportCuti: (year?: number) =>
    api.get("/hr/export-cuti", { params: { year }, responseType: "blob" }),

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

  createKaryawan: (data: CreateKaryawanPayload) =>
    api.post("/hr/data-karyawan", data),

  updateKaryawan: (id: number, data: UpdateKaryawanPayload) =>
    api.put(`/hr/data-karyawan/${id}`, data),

  createDepartemen: (data: { nama_departemen: string }) =>
    api.post("/hr/data-departemen", data),

  updateDepartemen: (id: number, data: { nama_departemen: string }) =>
    api.put(`/hr/data-departemen/${id}`, data),

  tambahCuti: (data: { id_user: number; jumlah_hari: number; keterangan: string }) =>
    api.post("/hr/tambah-cuti", data),
};
