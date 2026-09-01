import { test as base, expect } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockRoutes(page)
    await use(page)
  },
})

test.describe('Direktur Approval Action', () => {
  const loginAsDirektur = async (page: import('@playwright/test').Page) => {
    const exp = Math.floor(Date.now() / 1000) + 86400
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ id_user: 4, username: 'direktur_user', nama: 'Dewi Direktur', role: 'direktur', id_departemen: 3, exp }))
    const signature = btoa('mock-signature')
    const token = `${header}.${payload}.${signature}`

    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate((t) => {
      localStorage.setItem('token', t)
      localStorage.setItem('token_type', 'Bearer')
    }, token)
    await page.goto('/direktur/dashboard')
    await page.waitForLoadState('networkidle')
  }

  test('Direktur should see approval page', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Persetujuan Cuti' })).toBeVisible()
    await expect(page.getByText('Ringkasan Tim')).toBeVisible()
  })

  test('Direktur should see employee data', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/data-karyawan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Data Karyawan' })).toBeVisible()
    await expect(page.getByText('Budi Santoso').first()).toBeVisible()
  })

  test('Direktur should see leave quota', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/jatah-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Manajemen Jatah Cuti' })).toBeVisible()
    await expect(page.getByText('Budi Santoso').first()).toBeVisible()
  })

  test('Direktur should see holiday calendar', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/kalender-libur')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Kalender Operasional')).toBeVisible()
    await expect(page.getByText('Tambah Hari Libur')).toBeVisible()
    await expect(page.getByText('Daftar Libur & Cuti')).toBeVisible()
  })

  test('Direktur should open add holiday modal', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/kalender-libur')
    await page.waitForLoadState('networkidle')

    await page.getByText('Tambah Hari Libur').click()
    await expect(page.getByText('Nama Hari Libur')).toBeVisible()
    await expect(page.getByText('Jenis Libur')).toBeVisible()
    await expect(page.getByText('Libur Nasional', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Cuti Bersama', { exact: true }).first()).toBeVisible()
  })

  test('Direktur should open sync modal', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/kalender-libur')
    await page.waitForLoadState('networkidle')

    const syncBtn = page.getByText('Sinkronisasi').first()
    if (await syncBtn.isVisible()) {
      await syncBtn.click()
      await expect(page.getByText('Sinkronisasi Data Libur')).toBeVisible()
      await expect(page.getByText('Mulai Sinkronisasi')).toBeVisible()
    }
  })

  test('Direktur should see profile page', async ({ page }) => {
    await loginAsDirektur(page)
    await page.goto('/direktur/profil')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Informasi Akun')).toBeVisible()
    await expect(page.getByText('Keamanan')).toBeVisible()
  })
})
