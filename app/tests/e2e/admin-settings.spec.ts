import { test, expect } from '@playwright/test'

/**
 * E2E tests for admin and settings pages.
 * Tests that configuration, user management, and settings pages load.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('settings page loads', async ({ page }) => {
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /settings/i }).first()).toBeVisible({ timeout: 10000 })
})

test('company settings page loads', async ({ page }) => {
  await page.goto('/settings/company')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /company|settings/i }).first()).toBeVisible({ timeout: 10000 })
})

test('user management page loads', async ({ page }) => {
  await page.goto('/settings/users')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /users|team/i }).first()).toBeVisible({ timeout: 10000 })
})

test('integrations page loads', async ({ page }) => {
  await page.goto('/settings/integrations')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /integration/i }).first()).toBeVisible({ timeout: 10000 })
})

test('account profile page loads', async ({ page }) => {
  await page.goto('/account/profile')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /profile|account/i }).first()).toBeVisible({ timeout: 10000 })
})

test('notifications page loads', async ({ page }) => {
  await page.goto('/notifications')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /notification/i }).first()).toBeVisible({ timeout: 10000 })
})

test('activity log page loads', async ({ page }) => {
  await page.goto('/activity')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /activity|audit/i }).first()).toBeVisible({ timeout: 10000 })
})
