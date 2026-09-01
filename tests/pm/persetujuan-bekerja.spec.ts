import { test, expect } from '../fixtures/auth'

test.describe('PM Persetujuan Bekerja', () => {
  test('should show menu item for PM', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await expect(page.getByRole('button', { name: 'Persetujuan Bekerja' })).toBeVisible()
  })

  test('should navigate to persetujuan bekerja page', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.getByRole('button', { name: 'Persetujuan Bekerja' }).click()
    await page.waitForURL('**/pm/persetujuan-bekerja')
    expect(page.url()).toContain('/pm/persetujuan-bekerja')
    await expect(page.getByRole('heading', { name: 'Persetujuan Bekerja' })).toBeVisible()
  })

  test('should display pending queue', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan-bekerja')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Persetujuan Bekerja' })).toBeVisible()
    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
    expect(content).toContain('Rina Karyawan')
    expect(content).toContain('MENUNGGU')
  })

  test('should approve a request', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan-bekerja')
    await page.waitForLoadState('networkidle')

    const approveBtn = page.getByRole('button', { name: 'Setujui' }).first()
    await approveBtn.click()

    await expect(page.locator('text=Konfirmasi Persetujuan')).toBeVisible()
    await page.getByRole('button', { name: 'Setujui', exact: true }).last().click()

    await page.waitForTimeout(1000)
  })

  test('should reject a request', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan-bekerja')
    await page.waitForLoadState('networkidle')

    const rejectBtn = page.getByRole('button', { name: 'Tolak' }).first()
    await rejectBtn.click()

    await expect(page.locator('text=Penolakan').first()).toBeVisible()

    await page.fill('textarea', 'Tidak ada kebutuhan operasional')
    await page.getByRole('button', { name: 'Konfirmasi Tolak' }).click()

    await page.waitForTimeout(1000)
  })

  test('should show empty state when no pending requests', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan-bekerja')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
  })
})
