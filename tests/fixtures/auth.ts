import { test as base, type Page } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

type UserRole = 'karyawan' | 'karyawan_dept3' | 'pm_user' | 'hr_user' | 'direktur_user'

interface MockUserRole {
  page: Page
  loginAs: (role: UserRole) => Promise<void>
}

export const test = base.extend<MockUserRole>({
  page: async ({ page }, use) => {
    await setupMockRoutes(page)
    await use(page)
  },
  loginAs: async ({ page }, use) => {
    const login = async (role: UserRole) => {
      const tokenMap: Record<UserRole, { id_user: number; username: string; nama: string; role: string; id_departemen: number }> = {
        karyawan: { id_user: 1, username: 'karyawan', nama: 'Budi Santoso', role: 'karyawan', id_departemen: 1 },
        karyawan_dept3: { id_user: 7, username: 'rissa', nama: 'Rissa Ristiana', role: 'karyawan', id_departemen: 3 },
        pm_user: { id_user: 2, username: 'pm_user', nama: 'Andi PM', role: 'pm', id_departemen: 1 },
        hr_user: { id_user: 3, username: 'hr_user', nama: 'Sari HR', role: 'hr', id_departemen: 2 },
        direktur_user: { id_user: 4, username: 'direktur_user', nama: 'Dewi Direktur', role: 'direktur', id_departemen: 3 },
      }
      const userData = tokenMap[role]
      const exp = Math.floor(Date.now() / 1000) + 86400
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify({ ...userData, exp }))
      const signature = btoa('mock-signature')
      const token = `${header}.${payload}.${signature}`

      const routeMap: Record<UserRole, string> = {
        karyawan: '/karyawan/dashboard',
        karyawan_dept3: '/karyawan/dashboard',
        pm_user: '/pm/dashboard',
        hr_user: '/hr/dashboard',
        direktur_user: '/direktur/dashboard',
      }

      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')

      await page.evaluate((t) => {
        localStorage.setItem('token', t)
        localStorage.setItem('token_type', 'Bearer')
      }, token)

      await page.goto(routeMap[role])
      await page.waitForLoadState('networkidle')
    }
    await use(login)
  },
})

export { expect } from '@playwright/test'
