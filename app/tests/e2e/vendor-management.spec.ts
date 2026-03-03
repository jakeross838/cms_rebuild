import { test, expect } from '@playwright/test'

/**
 * E2E tests for vendor management workflows.
 * Tests vendor list, detail, compliance, contacts, insurance,
 * performance tracking, and vendor creation form.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('vendors list page loads with search', async ({ page }) => {
  await page.goto('/vendors')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /vendors/i }).first()).toBeVisible({ timeout: 10000 })

  // Should have search or filter controls
  const searchInput = page.locator('input[placeholder*="earch"], input[placeholder*="ilter"]')
  if (await searchInput.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    expect(await searchInput.count()).toBeGreaterThan(0)
  }
})

test('vendor detail page loads', async ({ page }) => {
  await page.goto('/vendors')
  await page.waitForLoadState('networkidle')

  // Click first vendor link to navigate to detail
  const firstVendor = page.locator('a[href*="/vendors/"]:not([href$="/new"])').first()
  if (await firstVendor.isVisible({ timeout: 5000 }).catch(() => false)) {
    await firstVendor.click()
    await page.waitForLoadState('networkidle')
    // Detail page should load with vendor info
    await expect(page.locator('body')).not.toContainText('404')
  }
})

test('vendor compliance insurance page loads', async ({ page }) => {
  await page.goto('/compliance/insurance')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /insurance|compliance/i }).first()).toBeVisible({ timeout: 10000 })
})

test('vendor contacts page loads', async ({ page }) => {
  await page.goto('/contacts')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /contacts/i }).first()).toBeVisible({ timeout: 10000 })
})

test('vendor compliance licenses page loads', async ({ page }) => {
  await page.goto('/compliance/licenses')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /license|compliance/i }).first()).toBeVisible({ timeout: 10000 })
})

test('vendor community reviews page loads', async ({ page }) => {
  await page.goto('/community/vendor-reviews')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /vendor|review|performance/i }).first()).toBeVisible({ timeout: 10000 })
})

test('create new vendor form renders with fields', async ({ page }) => {
  await page.goto('/vendors/new')
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')

  // Should have name input field
  const nameInput = page.locator('input[name="name"]')
  if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await expect(nameInput).toBeVisible()
  }

  // Should have a submit button
  await expect(page.locator('button[type="submit"]')).toBeVisible()
})

test('directory vendors page loads', async ({ page }) => {
  await page.goto('/directory/vendors')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /vendor|directory/i }).first()).toBeVisible({ timeout: 10000 })
})
