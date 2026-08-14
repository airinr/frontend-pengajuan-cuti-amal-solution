import axios from 'axios'

export interface Holiday {
  date: string
  name: string
  is_civic: boolean
  is_religious: boolean
  is_cuti_bersama: boolean
}

export interface HolidayResponse {
  metadata: {
    version: string
    year: number
    last_updated: string
    timezone: string
    calendar_system: string
  }
  data: Holiday[]
}

export const holidayApi = {
  getByYear: (year: number) =>
    axios.get<HolidayResponse>(`https://api.kemendesa.link/libur-nasional/api/holidays/${year}.json`),
}
