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

const holidayCache = new Map<number, HolidayResponse>()

export const holidayApi = {
  getByYear: async (year: number): Promise<{ data: HolidayResponse }> => {
    if (holidayCache.has(year)) {
      return { data: holidayCache.get(year)! }
    }
    const response = await axios.get<HolidayResponse>(
      `https://api.kemendesa.link/libur-nasional/api/holidays/${year}.json`,
      { timeout: 10000 }
    )
    holidayCache.set(year, response.data)
    return response
  },
}
