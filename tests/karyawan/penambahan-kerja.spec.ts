import { test, expect } from '../fixtures/auth'

test.describe('Pengajuan Tetap Bekerja (Dept 3)', () => {
  test('should show menu items for dept 3 karyawan', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await expect(page.getByRole('button', { name: 'Pengajuan Bekerja', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Status Pengajuan Bekerja' })).toBeVisible()
  })

  test('should not show menu items for non-dept 3 karyawan', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await expect(page.getByRole('button', { name: 'Pengajuan Bekerja', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Status Pengajuan Bekerja' })).not.toBeVisible()
  })

  test('should navigate to pengajuan bekerja page', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.click('text=Pengajuan Bekerja')
    await page.waitForURL('**/karyawan/pengajuan-bekerja')
    expect(page.url()).toContain('/karyawan/pengajuan-bekerja')
    await expect(page.getByRole('heading', { name: 'Pengajuan Tetap Bekerja' })).toBeVisible()
  })

  test('should display form with cuti bersama dropdown', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.goto('/karyawan/pengajuan-bekerja')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Pengajuan Tetap Bekerja' })).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('text=Kebijakan Pengajuan')).toBeVisible()
  })

  test('should show validation error when submitting empty form', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.goto('/karyawan/pengajuan-bekerja')
    await page.waitForLoadState('networkidle')

    const submitBtn = page.getByRole('button', { name: 'Ajukan Tetap Bekerja Ini' })
    await expect(submitBtn).toBeDisabled()
  })

  test('should show validation error when reason is empty', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.goto('/karyawan/pengajuan-bekerja')
    await page.waitForLoadState('networkidle')

    await page.selectOption('select', { index: 1 })

    const submitBtn = page.getByRole('button', { name: 'Ajukan Tetap Bekerja Ini' })
    await expect(submitBtn).toBeDisabled()
  })

  test('should submit successfully', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.goto('/karyawan/pengajuan-bekerja')
    await page.waitForLoadState('networkidle')

    await page.selectOption('select', { index: 1 })
    await page.fill('textarea', 'Alasan tetap bekerja')

    await page.getByRole('button', { name: 'Ajukan Tetap Bekerja Ini' }).click()

    const successPopup = page.locator('text=Pengajuan Berhasil Dikirim')
    await expect(successPopup).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Status Pengajuan Kerja', () => {
  test('should navigate to status page', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.getByRole('button', { name: 'Status Pengajuan Bekerja' }).click()
    await page.waitForURL('**/karyawan/status-pengajuan-kerja')
    expect(page.url()).toContain('/karyawan/status-pengajuan-kerja')
    await expect(page.getByRole('heading', { name: 'Status Pengajuan Kerja' })).toBeVisible()
  })

  test('should display status list with submissions', async ({ page, loginAs }) => {
    await loginAs('karyawan_dept3')

    await page.goto('/karyawan/status-pengajuan-kerja')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Status Pengajuan Kerja' })).toBeVisible()
    const content = await page.textContent('body')
    expect(content).toContain('ada job di rumah temen')
    expect(content).toContain('Urusan operasional')
    expect(content).toContain('pengen kerja aja')
    expect(content).toContain('Menunggu PM')
    expect(content).toContain('Disetujui PM')
    expect(content).toContain('Ditolak PM')
  })

  test('should show empty state when no submissions', async ({ page, loginAs }) => {
    await loginAs('karyawan')

    await page.goto('/karyawan/status-pengajuan-kerja')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Status Pengajuan Kerja' })).toBeVisible()
  })
})
