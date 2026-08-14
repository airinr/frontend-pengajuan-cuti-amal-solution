import api from '../lib/api'
import type { LeaveRequest, CreateLeaveRequest, CreateKaryawanLeaveRequest, KaryawanLeaveResponse, ApiResponse, PaginatedResponse } from '../types'

export interface RiwayatCuti {
  jenis_cuti: string
  tanggal_mulai: string
  tanggal_selesai: string
  keterangan: string
  nama_pengganti: string
  durasi: number
  status: string
}

export interface OngoingCuti {
  jenis_cuti: string
  durasi: number
  keterangan: string
  tanggal_mulai: string
  tanggal_selesai: string
  status_sekarang: string
  disetujui_pm: number | null
  disetujui_hr: number | null
  disetujui_direktur: number | null
  approved_at_pm: string | null
  approved_at_hr: string | null
  approved_at_direktur: string | null
  alasan_penolakan: string | null
}

export const leaveApi = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<LeaveRequest>>('/leaves', { params: { page, limit } }),

  getById: (id: string) =>
    api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`),

  getMyLeaves: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<LeaveRequest>>('/leaves/my', { params: { page, limit } }),

  getRiwayatCuti: () =>
    api.get<RiwayatCuti[]>('/karyawan/cuti'),

  getOngoingCuti: () =>
    api.get<OngoingCuti[]>('/karyawan/cuti/ongoing'),

  create: (data: CreateLeaveRequest) =>
    api.post<ApiResponse<LeaveRequest>>('/leaves', data),

  createKaryawan: (data: CreateKaryawanLeaveRequest) =>
    api.post<KaryawanLeaveResponse>('/karyawan/cuti', data),

  approve: (id: string) =>
    api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`),

  reject: (id: string, reason?: string) =>
    api.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, { reason }),

  cancel: (id: string) =>
    api.delete<ApiResponse<LeaveRequest>>(`/leaves/${id}`),
}
