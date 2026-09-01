import api from '../lib/api'
import type { AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, RegisterResponse, UpdateProfileRequest } from '../types'

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
  id_pm?: number | null
}

export interface UpdateKaryawanRequest {
  nama: string
  role: string
  id_departemen: number
  id_pm?: number | null
  email: string
  no_telp: string
  tanggal_bergabung: string
  status: string
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

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register', data),

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
