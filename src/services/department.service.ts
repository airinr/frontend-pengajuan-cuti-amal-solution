import api from '../lib/api'
import type { Department } from '../types'

export const departmentApi = {
  getAll: () =>
    api.get<Department[]>('/departemen'),
}
