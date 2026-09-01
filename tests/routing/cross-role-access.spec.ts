import { test as base, expect } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockRoutes(page)
    await use(page)
  },
})

test.describe('Cross-Role Access Prevention', () => {
  const loginAs = async (page: import('@playwright/test').Page, role: string) => {
    const tokenMap: Record<string, { id_user: number; username: string; nama: string; role: string; id_departemen: number }> = {
      karyawan: { id_user: 1, username: 'karyawan', nama: 'Budi Santoso', role: 'karyawan', id_departemen: 1 },
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

    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate((t) => {
      localStorage.setItem('token', t)
      localStorage.setItem('token_type', 'Bearer')
    }, token)
  }

  const protectedRoutes: Record<string, string[]> = {
    karyawan: [
      '/karyawan/dashboard',
      '/karyawan/pengajuan-cuti',
      '/karyawan/status-pengajuan',
      '/karyawan/riwayat-cuti',
      '/karyawan/kalender-cuti',
    ],
    pm: [
      '/pm/dashboard',
      '/pm/persetujuan',
      '/pm/rekap-cuti-tim',
      '/pm/kalender-tim',
    ],
    hr: [
      '/hr/dashboard',
      '/hr/persetujuan',
      '/hr/data-karyawan',
      '/hr/jatah-cuti',
      '/hr/log-rekap-cuti',
      '/hr/kalender-libur',
    ],
    direktur: [
      '/direktur/dashboard',
      '/direktur/persetujuan',
      '/direktur/data-karyawan',
      '/direktur/jatah-cuti',
      '/direktur/kalender-libur',
    ],
  }

  for (const [role, routes] of Object.entries(protectedRoutes)) {
    for (const route of routes) {
      test(`Unauthenticated user should be redirected from ${route}`, async ({ page }) => {
        await page.goto(route)
        await page.waitForLoadState('networkidle')
        expect(page.url()).toContain('/login')
      })
    }
  }

  test('Karyawan should access own dashboard', async ({ page }) => {
    await loginAs(page, 'karyawan')
    await page.goto('/karyawan/dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/karyawan/dashboard')
  })

  test('PM should access own dashboard', async ({ page }) => {
    await loginAs(page, 'pm_user')
    await page.goto('/pm/dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/pm/dashboard')
  })

  test('HR should access own dashboard', async ({ page }) => {
    await loginAs(page, 'hr_user')
    await page.goto('/hr/dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/hr/dashboard')
  })

  test('Direktur should access own dashboard', async ({ page }) => {
    await loginAs(page, 'direktur_user')
    await page.goto('/direktur/dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/direktur/dashboard')
  })
})
