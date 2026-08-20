export type UserRole = 'karyawan' | 'pm' | 'hr' | 'direktur'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
}

export interface LeaveRequest {
  id: string
  userId: string
  user?: User
  type: 'cuti_tahunan' | 'cuti_sakit' | 'cuti_lahir' | 'cuti_lainnya'
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeaveRequest {
  type: LeaveRequest['type']
  startDate: string
  endDate: string
  reason: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  nama: string
  password: string
  id_departemen: number
  id_pm?: number | null
}

export interface RegisterResponse {
  id_user: number
  username: string
  nama: string
  role: string
  id_departemen: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface Department {
  id_departemen: number
  nama_departemen: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

export interface CurrentUser {
  id_user: number
  username: string
  nama: string
  role: string
  id_departemen: number
  id_pm: number | null
  total_cuti: number
  sisa_cuti: number
  pm: {
    id_user: number
    username: string
    nama: string
  } | null
}

export interface ChangePasswordRequest {
  password_lama: string
  password_baru: string
  konfirmasi_password_baru: string
}

export interface CreateKaryawanLeaveRequest {
  tanggal_mulai: string
  tanggal_selesai: string
  keterangan: string
  pengganti: number
}

export interface KaryawanLeaveResponse {
  id_log_cuti: number
  id_user: number
  jenis_cuti: string
  tanggal_mulai: string
  tanggal_selesai: string
  keterangan_cuti: string
  status: string
  alasan_penolakan: string | null
  disetujui_pm: number | null
  disetujui_hr: number | null
  disetujui_direktur: number | null
  approved_at_pm: string | null
  approved_at_hr: string | null
  approved_at_direktur: string | null
}
