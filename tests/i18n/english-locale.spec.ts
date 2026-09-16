import { test as base, expect } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

const test = base.extend({
  page: async ({ page }, use) => {
    await setupMockRoutes(page)
    await use(page)
  },
})

test.describe('English Locale (i18n)', () => {
  const loginAsEn = async (page: import('@playwright/test').Page, role: string) => {
    const tokenMap: Record<string, { id_user: number; username: string; nama: string; role: string; id_departemen: number }> = {
      karyawan: { id_user: 1, username: 'karyawan', nama: 'Budi Santoso', role: 'karyawan', id_departemen: 1 },
      hr_user: { id_user: 3, username: 'hr_user', nama: 'Sari HR', role: 'hr', id_departemen: 2 },
      pm_user: { id_user: 2, username: 'pm_user', nama: 'Andi PM', role: 'pm', id_departemen: 1 },
      direktur_user: { id_user: 4, username: 'direktur_user', nama: 'Dewi Direktur', role: 'direktur', id_departemen: 3 },
    }
    const userData = tokenMap[role]
    const exp = Math.floor(Date.now() / 1000) + 86400
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ ...userData, exp }))
    const signature = btoa('mock-signature')
    const token = `${header}.${payload}.${signature}`

    const routeMap: Record<string, string> = {
      karyawan: '/karyawan/dashboard',
      hr_user: '/hr/dashboard',
      pm_user: '/pm/dashboard',
      direktur_user: '/direktur/dashboard',
    }

    // Navigate to login first to set localStorage
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Set all localStorage items
    await page.evaluate((data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('token_type', 'Bearer')
      localStorage.setItem('locale', data.lang)
    }, { token, lang: 'en' })

    // Full reload to pick up new locale
    await page.goto(routeMap[role])
    await page.waitForLoadState('networkidle')

    // Force locale change via i18n instance if still not English
    await page.evaluate(() => {
      const i18n = (window as any).__VUE_I18N__ || (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (i18n && i18n.locale !== undefined) {
        i18n.locale = 'en'
      }
    })
    await page.waitForTimeout(300)
  }

  test('Karyawan dashboard should show English text', async ({ page }) => {
    await loginAsEn(page, 'karyawan')

    await expect(page.getByText('Leave Summary')).toBeVisible()
    await expect(page.getByText('Remaining Leave')).toBeVisible()
    await expect(page.getByText('Pending Requests')).toBeVisible()
    await expect(page.getByText('Latest Activities')).toBeVisible()
  })

  test('Karyawan leave request page should show English text', async ({ page }) => {
    await loginAsEn(page, 'karyawan')
    await page.goto('/karyawan/pengajuan-cuti')
    await page.waitForLoadState('networkidle')

    // Force locale after navigation
    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: 'Leave Request', exact: true })).toBeVisible()
    await expect(page.getByText('Leave Type')).toBeVisible()
    await expect(page.getByText('Annual Leave')).toBeVisible()
    await expect(page.getByText('Backup Person')).toBeVisible()
    await expect(page.getByText('Leave Reason')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible()
  })

  test('Karyawan leave history page should show English text', async ({ page }) => {
    await loginAsEn(page, 'karyawan')
    await page.goto('/karyawan/riwayat-cuti')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: 'Leave History' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Leave Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Duration' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Leave Type' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('Karyawan calendar page should show English text', async ({ page }) => {
    await loginAsEn(page, 'karyawan')
    await page.goto('/karyawan/kalender-cuti')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: 'Leave Calendar' })).toBeVisible()
    await expect(page.getByText('Monitor your leave schedule')).toBeVisible()
    await expect(page.getByText('Today')).toBeVisible()
  })

  test('Karyawan profile page should show English text', async ({ page }) => {
    await loginAsEn(page, 'karyawan')
    await page.goto('/karyawan/profil')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible()
    await expect(page.getByText('Account Information')).toBeVisible()
    await expect(page.getByText('Change Password')).toBeVisible()
  })

  test('HR employee data page should show English text', async ({ page }) => {
    await loginAsEn(page, 'hr_user')
    await page.goto('/hr/data-karyawan')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: 'Employee Data' })).toBeVisible()
    await expect(page.getByText('Add Employee')).toBeVisible()
    await expect(page.getByText('Total Employees')).toBeVisible()
  })

  test('HR leave quota page should show English text', async ({ page }) => {
    await loginAsEn(page, 'hr_user')
    await page.goto('/hr/jatah-cuti')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByText('Leave Quota Management')).toBeVisible()
    await expect(page.getByText('Active Employees')).toBeVisible()
    await expect(page.getByText('Adjust Quota')).toBeVisible()
  })

  test('PM approval page should show English text', async ({ page }) => {
    await loginAsEn(page, 'pm_user')
    await page.goto('/pm/persetujuan')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: 'Leave Approval' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Waiting' })).toBeVisible()
  })

  test('Direktur holiday calendar should show English text', async ({ page }) => {
    await loginAsEn(page, 'direktur_user')
    await page.goto('/direktur/kalender-libur')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const app = (document.querySelector('#app') as any)?.__vue_app__?.config?.globalProperties?.$i18n
      if (app) app.locale = 'en'
    })
    await page.waitForTimeout(300)

    await expect(page.getByText('Operational Calendar')).toBeVisible()
    await expect(page.getByText('Add Holiday')).toBeVisible()
    await expect(page.getByText('Holidays & Leave List')).toBeVisible()
  })
})
