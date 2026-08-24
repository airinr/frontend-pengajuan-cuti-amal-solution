import api from "../lib/api";
import type {
  CreateKaryawanLeaveRequest,
  KaryawanLeaveResponse,
} from "../types";

export interface RiwayatCuti {
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string;
  nama_pengganti: string;
  durasi: number;
  status: string;
}

export interface OngoingCuti {
  jenis_cuti: string;
  durasi: number;
  keterangan_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_sekarang: string;
  diproses_pm: number;
  diproses_hr: number;
  diproses_direktur: number;
  processed_at_pm: string | null;
  processed_at_hr: string | null;
  processed_at_direktur: string | null;
  alasan_penolakan: string | null;
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

export const karyawanApi = {
  getRiwayatCuti: () => api.get<RiwayatCuti[]>("/karyawan/cuti"),

  getOngoingCuti: () => api.get<OngoingCuti[]>("/karyawan/cuti/ongoing"),

  createCuti: (data: CreateKaryawanLeaveRequest) =>
    api.post<KaryawanLeaveResponse>("/karyawan/cuti", data),

  getMyCalendar: () => api.get<KalenderItem[]>("/karyawan/kalender-cuti-saya"),

  getTeamCalendar: () =>
    api.get<KalenderItem[]>("/karyawan/kalender-cuti-tim"),

  getHolidaysNext: () => api.get<HolidaysNext>("/holidays/next"),

  getActivities: () => api.get<ActivityItem[]>("/karyawan/activities"),
};
