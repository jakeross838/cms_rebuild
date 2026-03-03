import { test, expect } from '@playwright/test'

/**
 * E2E tests for notifications, settings, and configuration pages.
 * Tests notifications page, company settings, user profile,
 * integrations, and billing/subscription pages.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('notifications page loads', async ({ page }) => {
  await page.goto('/notifications')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /notification/i }).first()).toBeVisible({ timeout: 10000 })
})

test('company settings page loads', async ({ page }) => {
  await page.goto('/company/settings')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /company|settings/i }).first()).toBeVisible({ timeout: 10000 })
})

test('user profile page loads and shows profile content', async ({ page }) => {
  await page.goto('/account/profile')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /profile|account/i }).first()).toBeVisible({ timeout: 10000 })
})

test('integrations page loads', async ({ page }) => {
  await page.goto('/integrations')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /integration/i }).first()).toBeVisible({ timeout: 10000 })
})

test('billing subscription page loads', async ({ page }) => {
  await page.goto('/billing')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /billing|subscription|plan/i }).first()).toBeVisible({ timeout: 10000 })
})

test('settings general page loads', async ({ page }) => {
  await page.goto('/settings/general')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /settings|general/i }).first()).toBeVisible({ timeout: 10000 })
})

test('settings roles page loads', async ({ page }) => {
  await page.goto('/settings/roles')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /role|permission/i }).first()).toBeVisible({ timeout: 10000 })
})
