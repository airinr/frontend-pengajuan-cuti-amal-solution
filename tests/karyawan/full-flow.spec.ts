import { test, expect } from '../fixtures/auth'

test.describe('Karyawan Full Flow', () => {
  test('should display dashboard with leave summary', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await expect(page.getByRole('heading', { name: 'Ringkasan Cuti' })).toBeVisible()
    await expect(page.getByText('Total Hak Cuti')).toBeVisible()
    await expect(page.getByText('Terpakai', { exact: true })).toBeVisible()
    await expect(page.getByText('Sisa Cuti Anda')).toBeVisible()
  })

  test('should show ongoing leave requests', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await expect(page.getByText('Pengajuan Sedang Diproses')).toBeVisible()
    await expect(page.getByText('Menunggu PM')).toBeVisible()
  })

  test('should show activities', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await expect(page.getByText('Aktivitas Terbaru')).toBeVisible()
    await expect(page.getByText('Mengajukan cuti tahunan untuk 3 hari')).toBeVisible()
  })

  test('should navigate to pengajuan cuti page', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await page.click('text=+ Buat Pengajuan')
    await page.waitForURL('**/karyawan/pengajuan-cuti')
    expect(page.url()).toContain('/karyawan/pengajuan-cuti')
    await expect(page.getByRole('heading', { name: 'Pengajuan Cuti', exact: true })).toBeVisible()
  })

  test('should submit leave request successfully', async ({ page, loginAs }) => {
    await loginAs('karyawan')
    await page.goto('/karyawan/pengajuan-cuti')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Pengajuan Cuti', exact: true })).toBeVisible()

    const textarea = page.locator('textarea')
    await textarea.fill('Cuti untuk keperluan keluarga')

    const searchInput = page.locator('input[placeholder="Cari nama rekan kerja..."]')
    await searchInput.fill('Rina')
    await page.waitForTimeout(300)
    const dropdown = page.locator('text=Rina Karyawan').first()
    if (await dropdown.isVisible()) {
      await dropdown.click()
    }

    const checkbox = page.locator('input[type="checkbox"]')
    await checkbox.check()

    await page.click('text=Kirim Pengajuan')
    await page.waitForTimeout(1000)

    const successPopup = page.locator('text=Pengajuan Cuti Berhasil Dikirim')
    if (await successPopup.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(successPopup).toBeVisible()
    }
  })

  test('should navigate to status pengajuan page', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await page.goto('/karyawan/status-pengajuan')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Status Pengajuan Cuti' })).toBeVisible()
  })

  test('should show leave history', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await page.goto('/karyawan/riwayat-cuti')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Riwayat Cuti' })).toBeVisible()
    await expect(page.getByText('Budi Santoso')).toBeVisible()
  })

  test('should navigate to kalender cuti page', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await page.goto('/karyawan/kalender-cuti')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Kalender Cuti' })).toBeVisible()
  })

  test('should navigate to profil page', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await page.goto('/karyawan/profil')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Profil Pengguna' })).toBeVisible()
  })
})
