import api from '../lib/api'

export interface KalenderItem {
  tanggal: string
  nama: string
  keterangan: string
  jenis_cuti: string
  status: string
}

export const calendarApi = {
  getMyCalendar: () =>
    api.get<KalenderItem[]>('/karyawan/kalender-cuti-saya'),

  getTeamCalendar: () =>
    api.get<KalenderItem[]>('/karyawan/kalender-cuti-tim'),
}
