import { test, expect } from '../fixtures/auth'

test.describe('HR Management Flow', () => {
  test('should display HR dashboard with stats', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await expect(page.getByRole('heading', { name: 'Dashboard HR' })).toBeVisible()
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('25')
  })

  test('should show approval summary', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/persetujuan')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Persetujuan Cuti' })).toBeVisible()
  })

  test('should show approval history', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/persetujuan')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
  })

  test('should navigate to log rekap cuti', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/log-rekap-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Log & Rekapitulasi Cuti' })).toBeVisible()
  })

  test('should show log cuti data', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/log-rekap-cuti')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
  })

  test('should navigate to data karyawan', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Data Karyawan' })).toBeVisible()
  })

  test('should show employee table', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
    expect(content).toContain('Rina Karyawan')
  })

  test('should navigate to jatah cuti', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/jatah-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Manajemen Jatah Cuti' })).toBeVisible()
  })

  test('should show leave quota data', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/jatah-cuti')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
    expect(content).toContain('8')
  })

  test('should navigate to kalender libur', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/kalender-libur')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Kalender Operasional' })).toBeVisible()
  })

  test('should show department data', async ({ page, loginAs }) => {
    await loginAs('hr_user')

    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Engineering')
    expect(content).toContain('HR')
  })
})
