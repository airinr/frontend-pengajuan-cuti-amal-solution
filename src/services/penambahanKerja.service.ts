import api from '../lib/api'

export interface PmApprovalDetail {
  nama_pm: string
  status: string
  processed_at: string | null
}

export interface PenambahanKerjaItem {
  id_pengajuan_kerja: number
  id_user: number
  tanggal: string[]
  tanggal_pengajuan: string
  keterangan_pengajuan: string
  status: string
  approval_pm_detail: PmApprovalDetail[]
  approved_by_hr: string | null
  approved_at_hr: string | null
  approved_by_direktur: string | null
  approved_at_direktur: string | null
}

export interface PenambahanKerjaRequest {
  tanggal: string[]
  keterangan: string
}

export const penambahanKerjaApi = {
  submit: (data: PenambahanKerjaRequest) =>
    api.post('/karyawan/penambahan-kerja', data),

  getMyPenambahanKerja: () =>
    api.get<PenambahanKerjaItem[]>('/karyawan/penambahan-kerja'),
}
