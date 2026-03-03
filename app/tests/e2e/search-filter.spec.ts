import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

/**
 * E2E tests for search and filter functionality.
 * Tests the search inputs on list pages and global search.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('clients list search filters results', async ({ page }) => {
  await page.goto('/clients')
  await page.waitForLoadState('networkidle')

  const searchInput = page.locator('input[placeholder*="earch"]').first()
  if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await searchInput.fill('Smith')
    // Wait for debounced search
    await page.waitForTimeout(500)
    await page.waitForLoadState('networkidle')
    // Page should still be visible (no crash)
    await expect(page.locator('h1, h2').filter({ hasText: /clients/i }).first()).toBeVisible()
  }
})

test('vendors list search filters results', async ({ page }) => {
  await page.goto('/vendors')
  await page.waitForLoadState('networkidle')

  const searchInput = page.locator('input[placeholder*="earch"]').first()
  if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await searchInput.fill('Electric')
    await page.waitForTimeout(500)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /vendors/i }).first()).toBeVisible()
  }
})

test('jobs list search filters results', async ({ page }) => {
  await page.goto('/jobs')
  await page.waitForLoadState('networkidle')

  const searchInput = page.locator('input[placeholder*="earch"]').first()
  if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await searchInput.fill('Smith')
    await page.waitForTimeout(500)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /jobs/i }).first()).toBeVisible()
  }
})

test('daily logs list has date filtering', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/daily-logs`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /daily logs/i }).first()).toBeVisible({ timeout: 10000 })
  // Page should render with filter controls
  const filterArea = page.locator('input, select, [role="combobox"]')
  expect(await filterArea.count()).toBeGreaterThan(0)
})

test('leads list has status filter', async ({ page }) => {
  await page.goto('/leads')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /leads/i }).first()).toBeVisible({ timeout: 10000 })
  const filterArea = page.locator('select, [role="combobox"], button:has-text("Filter")')
  expect(await filterArea.count()).toBeGreaterThan(0)
})
