import { test as base, expect } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockRoutes(page)
    await use(page)
  },
})

test.describe('HR Approval Action', () => {
  const loginAsHR = async (page: import('@playwright/test').Page) => {
    const exp = Math.floor(Date.now() / 1000) + 86400
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ id_user: 3, username: 'hr_user', nama: 'Sari HR', role: 'hr', id_departemen: 2, exp }))
    const signature = btoa('mock-signature')
    const token = `${header}.${payload}.${signature}`

    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate((t) => {
      localStorage.setItem('token', t)
      localStorage.setItem('token_type', 'Bearer')
    }, token)
    await page.goto('/hr/dashboard')
    await page.waitForLoadState('networkidle')
  }

  test('HR should navigate to approval page', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Persetujuan Cuti' })).toBeVisible()
    await expect(page.getByText('Ringkasan Tim')).toBeVisible()
  })

  test('HR should see log and recap page', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/log-rekap-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /Log.*Rekapitulasi/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rekapitulasi' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log Cuti' })).toBeVisible()
  })

  test('HR should see employee data page', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Data Karyawan' })).toBeVisible()
    await expect(page.getByText('Total Karyawan')).toBeVisible()
    await expect(page.getByText('Budi Santoso').first()).toBeVisible()
  })

  test('HR should see leave quota page', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/jatah-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Manajemen Jatah Cuti' })).toBeVisible()
    await expect(page.getByText('Sesuaikan Kuota')).toBeVisible()
  })

  test('HR should open add employee modal', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    const addBtn = page.getByRole('button', { name: 'Tambah Karyawan' })
    if (await addBtn.isVisible()) {
      await addBtn.click()
      await expect(page.getByText('Username').first()).toBeVisible()
      await expect(page.getByText('Nama Lengkap').first()).toBeVisible()
      await expect(page.getByText('Password').first()).toBeVisible()
    }
  })

  test('HR should open add department modal', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    const deptTab = page.getByRole('button', { name: 'Departemen', exact: true })
    if (await deptTab.isVisible()) {
      await deptTab.click()
      await page.waitForTimeout(500)
    }

    const addDeptBtn = page.getByText('Tambah Departemen')
    if (await addDeptBtn.isVisible()) {
      await addDeptBtn.click()
      await expect(page.getByText('Nama Departemen').first()).toBeVisible()
    }
  })

  test('HR should open leave quota adjustment modal', async ({ page }) => {
    await loginAsHR(page)
    await page.goto('/hr/jatah-cuti')
    await page.waitForLoadState('networkidle')

    await page.getByText('Sesuaikan Kuota').click()
    await expect(page.getByText('Tahun Jatah')).toBeVisible()
    await expect(page.getByText('Jatah Cuti Tahunan')).toBeVisible()
    await expect(page.getByText('Keterangan').first()).toBeVisible()
  })
})
