import { test, expect } from '@playwright/test'
import { setupMockRoutes } from '../mocks/handlers'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockRoutes(page)
  })

  test('should login successfully as karyawan and redirect to dashboard', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()

    await page.fill('input[type="text"]', 'karyawan')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/karyawan/dashboard')
    expect(page.url()).toContain('/karyawan/dashboard')
  })

  test('should login successfully as PM and redirect to PM dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="text"]', 'pm_user')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/pm/dashboard')
    expect(page.url()).toContain('/pm/dashboard')
  })

  test('should login successfully as HR and redirect to HR dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="text"]', 'hr_user')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/hr/dashboard')
    expect(page.url()).toContain('/hr/dashboard')
  })

  test('should login successfully as Direktur and redirect to Direktur dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="text"]', 'direktur_user')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/direktur/dashboard')
    expect(page.url()).toContain('/direktur/dashboard')
  })

  test('should show error message on failed login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="text"]', 'wronguser')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    const errorMsg = page.locator('.bg-red-50')
    await expect(errorMsg).toBeVisible({ timeout: 10000 })
    await expect(errorMsg).toContainText('salah')
  })

  test('should redirect authenticated user from login to dashboard', async ({ page }) => {
    const tokenPayload = {
      id_user: 1,
      username: 'karyawan',
      nama: 'Budi Santoso',
      role: 'karyawan',
      id_departemen: 1,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }
    const token = `header.${btoa(JSON.stringify(tokenPayload))}.sig`

    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate((t) => {
      localStorage.setItem('token', t)
      localStorage.setItem('token_type', 'Bearer')
    }, token)
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.waitForURL('**/karyawan/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/karyawan/dashboard')
  })

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/karyawan/dashboard')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })
})
