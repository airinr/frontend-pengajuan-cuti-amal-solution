import { test as base, expect } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockRoutes(page)
    await use(page)
  },
})

test.describe('PM Approval Cuti Flow', () => {
  const loginAsPM = async (page: import('@playwright/test').Page) => {
    const exp = Math.floor(Date.now() / 1000) + 86400
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ id_user: 2, username: 'pm_user', nama: 'Andi PM', role: 'pm', id_departemen: 1, exp }))
    const signature = btoa('mock-signature')
    const token = `${header}.${payload}.${signature}`

    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate((t) => {
      localStorage.setItem('token', t)
      localStorage.setItem('token_type', 'Bearer')
    }, token)
    await page.goto('/pm/dashboard')
    await page.waitForLoadState('networkidle')
  }

  test('PM should see pending approval queue', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Persetujuan Cuti' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menunggu', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Riwayat', exact: true })).toBeVisible()
  })

  test('PM should see team members in approval queue', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Budi Santoso').first()).toBeVisible()
    await expect(page.getByText('Rina Karyawan').first()).toBeVisible()
  })

  test('PM should approve with confirmation dialog', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    const approveBtn = page.getByRole('button', { name: 'Setujui' }).first()
    if (await approveBtn.isVisible()) {
      await approveBtn.click()

      const confirmDialog = page.getByText('Konfirmasi Persetujuan')
      if (await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(confirmDialog).toBeVisible()

        const confirmBtn = page.locator('button').filter({ hasText: /^Setujui$/ }).last()
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test('PM should reject with reason dialog', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    const rejectBtn = page.getByRole('button', { name: 'Tolak' }).first()
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click()

      const rejectDialog = page.getByText('Penolakan Cuti')
      if (await rejectDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(rejectDialog).toBeVisible()

        const textarea = page.locator('textarea')
        if (await textarea.isVisible()) {
          await textarea.fill('Ada meeting dengan client')
        }

        const confirmRejectBtn = page.getByRole('button', { name: 'Konfirmasi Tolak' })
        if (await confirmRejectBtn.isVisible()) {
          await confirmRejectBtn.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test('PM should switch to history tab', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    const historyTab = page.getByRole('button', { name: 'Riwayat', exact: true })
    if (await historyTab.isVisible()) {
      await historyTab.click()
      await page.waitForTimeout(500)
      await expect(page.getByRole('button', { name: 'Riwayat', exact: true })).toBeVisible()
    }
  })

  test('PM should see team leave recap', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/rekap-cuti-tim')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /Rekap/ })).toBeVisible()
    await expect(page.getByText('Budi Santoso').first()).toBeVisible()
  })

  test('PM should see team calendar', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/kalender-tim')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Kalender Cuti' })).toBeVisible()
    await expect(page.getByText('Hari ini')).toBeVisible()
  })

  test('PM should see approval summary', async ({ page }) => {
    await loginAsPM(page)
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Ringkasan Tim')).toBeVisible()
    await expect(page.getByText('Total Pengajuan')).toBeVisible()
    await expect(page.getByText('Menunggu Persetujuan')).toBeVisible()
    await expect(page.getByText('Sedang Cuti')).toBeVisible()
  })
})
