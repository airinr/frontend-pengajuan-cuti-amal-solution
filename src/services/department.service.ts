import api from '../lib/api'
import type { Department } from '../types'

export const departmentApi = {
  getAll: () =>
    api.get<Department[]>('/departemen'),

  create: (data: { nama_departemen: string }) =>
    api.post<Department>('/departemen', data),

  update: (id: number, data: { nama_departemen: string }) =>
    api.put<Department>(`/departemen/${id}`, data),
}
