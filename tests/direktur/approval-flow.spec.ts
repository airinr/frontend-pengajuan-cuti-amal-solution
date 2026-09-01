import { test, expect } from '../fixtures/auth'

test.describe('Direktur Approval Flow', () => {
  test('should display direktur dashboard with stats', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await expect(page.getByRole('heading', { name: 'Dashboard Direktur' })).toBeVisible()
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('25')
  })

  test('should show approval page with history', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Persetujuan Cuti' })).toBeVisible()
    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
  })

  test('should navigate to log rekap cuti', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/log-rekap-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Log & Rekapitulasi Cuti' })).toBeVisible()
  })

  test('should navigate to data karyawan', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/data-karyawan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Data Karyawan' })).toBeVisible()
  })

  test('should show employee data', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/data-karyawan')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
    expect(content).toContain('Rina Karyawan')
  })

  test('should navigate to jatah cuti', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/jatah-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Manajemen Jatah Cuti' })).toBeVisible()
  })

  test('should show leave quota management', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/jatah-cuti')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
    expect(content).toContain('8')
  })

  test('should navigate to kalender libur', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/kalender-libur')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Kalender Operasional' })).toBeVisible()
  })

  test('should navigate to profil page', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/profil')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Informasi Akun')).toBeVisible()
  })

  test('should show department management', async ({ page, loginAs }) => {
    await loginAs('direktur_user')

    await page.goto('/direktur/data-karyawan')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Engineering')
  })
})
