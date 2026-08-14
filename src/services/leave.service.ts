import api from '../lib/api'
import type { LeaveRequest, CreateLeaveRequest, CreateKaryawanLeaveRequest, KaryawanLeaveResponse, ApiResponse, PaginatedResponse } from '../types'

export const leaveApi = {
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<LeaveRequest>>('/leaves', { params: { page, limit } }),

  getById: (id: string) =>
    api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`),

  getMyLeaves: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<LeaveRequest>>('/leaves/my', { params: { page, limit } }),

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
