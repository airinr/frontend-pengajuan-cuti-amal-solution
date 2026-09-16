import { test, expect } from '../fixtures/auth'

test.describe('Role Guard - Route Protection', () => {
  test('unauthenticated user cannot access karyawan routes', async ({ page }) => {
    await page.goto('/karyawan/dashboard')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('unauthenticated user cannot access PM dashboard', async ({ page }) => {
    await page.goto('/pm/dashboard')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('unauthenticated user cannot access HR dashboard', async ({ page }) => {
    await page.goto('/hr/dashboard')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('unauthenticated user cannot access Direktur dashboard', async ({ page }) => {
    await page.goto('/direktur/dashboard')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('each role can access their own dashboard', async ({ page, loginAs }) => {
    await loginAs('karyawan')
    expect(page.url()).toContain('/karyawan/dashboard')
  })

  test('PM can access their dashboard', async ({ page, loginAs }) => {
    await loginAs('pm_user')
    expect(page.url()).toContain('/pm/dashboard')
  })

  test('HR can access their dashboard', async ({ page, loginAs }) => {
    await loginAs('hr_user')
    expect(page.url()).toContain('/hr/dashboard')
  })

  test('Direktur can access their dashboard', async ({ page, loginAs }) => {
    await loginAs('direktur_user')
    expect(page.url()).toContain('/direktur/dashboard')
  })

  test('authenticated user is redirected from login page', async ({ page, loginAs }) => {
    await loginAs('karyawan')
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    expect(page.url()).not.toContain('/login')
  })

  test('guest cannot access protected pages', async ({ page }) => {
    await page.goto('/karyawan/pengajuan-cuti')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })
})
