import api from '../lib/api'

export interface PenambahanKerjaItem {
  id_pengajuan_kerja: number
  id_user: number
  tanggal_mulai: string
  tanggal_selesai: string
  keterangan_pengajuan: string
  status: string
  diproses_pm: number
  processed_at_pm: string | null
}

export interface PenambahanKerjaRequest {
  tanggal_mulai: string
  tanggal_selesai: string
  keterangan: string
}

export const penambahanKerjaApi = {
  submit: (data: PenambahanKerjaRequest) =>
    api.post('/karyawan/penambahan-kerja', data),

  getMyPenambahanKerja: () =>
    api.get<PenambahanKerjaItem[]>('/karyawan/penambahan-kerja'),
}
