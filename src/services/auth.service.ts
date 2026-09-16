import api from '../lib/api'
import type { AuthResponse, ChangePasswordRequest, LoginRequest, UpdateProfileRequest } from '../types'

export interface UserList {
  id_user: number
  nama: string
}

export interface RegisterAdminRequest {
  username: string
  nama: string
  password: string
  role: string
  id_departemen: number
  email: string
  no_telp: string
  tanggal_bergabung: string
  id_pm_list: number[]
}

export interface UpdateKaryawanRequest {
  nama: string
  role: string
  id_departemen: number
  email: string
  no_telp: string
  tanggal_bergabung: string
  status: string
  pm_add?: number[]
  pm_remove?: number[]
}

export const authApi = {
  login: (data: LoginRequest) => {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)
    return api.post<AuthResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },

  registerAdmin: (data: RegisterAdminRequest) =>
    api.post('/auth/register-admin', data),

  updateKaryawan: (userId: number, data: UpdateKaryawanRequest) =>
    api.put(`/hr/karyawan/${userId}`, data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/auth/change-password', data),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put('/auth/profile', data),

  getAllUsers: () =>
    api.get<UserList[]>('/auth/users'),
}
