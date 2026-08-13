export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'karyawan'
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
