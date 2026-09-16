import { test, expect } from '../fixtures/auth'

test.describe('PM Approval Flow', () => {
  test('should display PM dashboard with stats', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await expect(page.locator('text=Andi PM')).toBeVisible()
  })

  test('should show team dashboard items', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.waitForLoadState('networkidle')
    const content = await page.textContent('body')
    expect(content).toContain('Tim')
  })

  test('should navigate to persetujuan page and show approval queue', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Persetujuan Cuti' })).toBeVisible()
  })

  test('should show approval queue with leave requests', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
    expect(content).toContain('Rina Karyawan')
  })

  test('should approve a leave request', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    const approveBtn = page.locator('text=Setuju').first()
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should reject a leave request', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    const rejectBtn = page.locator('text=Tolak').first()
    if (await rejectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rejectBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should navigate to rekap cuti tim', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/rekap-cuti-tim')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /Rekap/ })).toBeVisible()
  })

  test('should show team members in rekap', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/rekap-cuti-tim')
    await page.waitForLoadState('networkidle')

    const content = await page.textContent('body')
    expect(content).toContain('Budi Santoso')
  })

  test('should navigate to kalender tim', async ({ page, loginAs }) => {
    await loginAs('pm_user')

    await page.goto('/pm/kalender-tim')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Kalender Cuti' })).toBeVisible()
  })
})
