import { test, expect } from '@playwright/test'

/**
 * E2E tests for financial workflow pages.
 * Tests AP bills, AR invoices, chart of accounts, journal entries,
 * and financial reporting pages load correctly with expected forms.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('AP bills list page loads', async ({ page }) => {
  await page.goto('/financial/payables')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /payable|bills/i }).first()).toBeVisible({ timeout: 10000 })
})

test('AR invoices list page loads', async ({ page }) => {
  await page.goto('/financial/receivables')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /receivable|invoices/i }).first()).toBeVisible({ timeout: 10000 })
})

test('create new AP bill form renders with required fields', async ({ page }) => {
  await page.goto('/financial/payables/new')
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')
  // Should have a form with input fields for bill creation
  const inputs = page.locator('input, textarea, select')
  expect(await inputs.count()).toBeGreaterThan(0)
})

test('create new AR invoice form renders with required fields', async ({ page }) => {
  await page.goto('/financial/receivables/new')
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')
  // Should have a form with input fields for invoice creation
  const inputs = page.locator('input, textarea, select')
  expect(await inputs.count()).toBeGreaterThan(0)
})

test('GL chart of accounts page loads', async ({ page }) => {
  await page.goto('/financial/chart-of-accounts')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /chart of accounts|general ledger/i }).first()).toBeVisible({ timeout: 10000 })
})

test('journal entry creation form renders', async ({ page }) => {
  await page.goto('/financial/journal-entries/new')
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')
  // Should have input fields for journal entry
  const inputs = page.locator('input, textarea, select')
  expect(await inputs.count()).toBeGreaterThan(0)
})

test('financial reports page loads', async ({ page }) => {
  await page.goto('/financial/reports')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /report/i }).first()).toBeVisible({ timeout: 10000 })
})

test('financial dashboard page loads', async ({ page }) => {
  await page.goto('/financial/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /financial|dashboard/i }).first()).toBeVisible({ timeout: 10000 })
})
