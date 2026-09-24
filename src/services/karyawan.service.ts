import api from "../lib/api";
import type {
  CreateKaryawanLeaveRequest,
  KaryawanLeaveResponse,
} from "../types";

export interface RiwayatCuti {
  jenis_cuti: string;
  tanggal: string[];
  tanggal_pengajuan: string;
  keterangan: string;
  nama_pengganti: string;
  durasi: number;
  status: string;
}

export interface PmApprovalDetail {
  nama_pm: string;
  status: string;
  processed_at: string | null;
}

export interface OngoingCuti {
  jenis_cuti: string;
  durasi: number;
  keterangan_cuti: string;
  tanggal: string[];
  tanggal_pengajuan: string;
  status_sekarang: string;
  id_pengganti: number | null;
  diproses_hr: number | null;
  diproses_direktur: number | null;
  processed_at_hr: string | null;
  processed_at_direktur: string | null;
  alasan_penolakan: string | null;
  approval_pm_detail: PmApprovalDetail[];
}

export interface KalenderItem {
  tanggal: string;
  nama: string;
  keterangan: string;
  jenis_cuti: string;
  status: string;
}

export interface HolidaysNext {
  nama_libur: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
}

export interface ActivityItem {
  jenis_aktivitas: string;
  keterangan: string;
  tanggal: string;
}

export interface RingkasanCuti {
  periode_tahun: number;
  total_cuti: number;
  cuti_terpakai: number;
  sisa_cuti: number;
}

export const karyawanApi = {
  getRiwayatCuti: () => api.get<RiwayatCuti[]>("/karyawan/cuti"),

  getOngoingCuti: () => api.get<OngoingCuti[]>("/karyawan/cuti/ongoing"),

  createCuti: (data: CreateKaryawanLeaveRequest) =>
    api.post<KaryawanLeaveResponse>("/karyawan/cuti", data),

  updateCuti: (id: number, data: CreateKaryawanLeaveRequest) =>
    api.put<KaryawanLeaveResponse>(`/karyawan/cuti/${id}`, data),

  getMyCalendar: () => api.get<KalenderItem[]>("/karyawan/kalender-cuti-saya"),

  getTeamCalendar: () =>
    api.get<KalenderItem[]>("/karyawan/kalender-cuti-tim"),

  getHolidaysNext: () => api.get<HolidaysNext>("/holidays/next"),

  getActivities: () => api.get<ActivityItem[]>("/karyawan/activities"),

  getRingkasanCuti: () => api.get<RingkasanCuti>("/karyawan/cuti/ringkasan"),
};
