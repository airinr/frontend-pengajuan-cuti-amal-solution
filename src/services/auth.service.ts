import api from '../lib/api'
import type { AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, RegisterResponse } from '../types'

export interface UserList {
  id_user: number
  nama: string
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

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/auth/change-password', data),

  getAllUsers: () =>
    api.get<UserList[]>('/auth/users'),
}
