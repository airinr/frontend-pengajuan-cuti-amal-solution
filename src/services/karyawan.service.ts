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
  keterangan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_sekarang: string;
  disetujui_pm: number | null;
  disetujui_hr: number | null;
  disetujui_direktur: number | null;
  approved_at_pm: string | null;
  approved_at_hr: string | null;
  approved_at_direktur: string | null;
  alasan_penolakan: string | null;
}

export interface KalenderItem {
  tanggal: string;
  nama: string;
  keterangan: string;
  jenis_cuti: string;
  status: string;
}

export const karyawanApi = {
  getRiwayatCuti: () => api.get<RiwayatCuti[]>("/karyawan/cuti"),

  getOngoingCuti: () => api.get<OngoingCuti[]>("/karyawan/cuti/ongoing"),

  createCuti: (data: CreateKaryawanLeaveRequest) =>
    api.post<KaryawanLeaveResponse>("/karyawan/cuti", data),

  getMyCalendar: () => api.get<KalenderItem[]>("/karyawan/kalender-cuti-saya"),

  getTeamCalendar: () =>
    api.get<KalenderItem[]>("/karyawan/kalender-cuti-tim"),
};
