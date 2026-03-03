import { test, expect } from '@playwright/test'

/**
 * E2E tests for financial module pages.
 * Tests that accounting, billing, and reporting pages load correctly.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('accounts payable page loads', async ({ page }) => {
  await page.goto('/financial/payables')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /payable|bills/i }).first()).toBeVisible({ timeout: 10000 })
})

test('accounts receivable page loads', async ({ page }) => {
  await page.goto('/financial/receivables')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /receivable|invoices/i }).first()).toBeVisible({ timeout: 10000 })
})

test('chart of accounts page loads', async ({ page }) => {
  await page.goto('/financial/chart-of-accounts')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /chart of accounts|general ledger/i }).first()).toBeVisible({ timeout: 10000 })
})

test('journal entries page loads', async ({ page }) => {
  await page.goto('/financial/journal-entries')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /journal/i }).first()).toBeVisible({ timeout: 10000 })
})

test('financial reports page loads', async ({ page }) => {
  await page.goto('/reports')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /reports/i }).first()).toBeVisible({ timeout: 10000 })
})

test('payments page loads', async ({ page }) => {
  await page.goto('/financial/payments')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /payment/i }).first()).toBeVisible({ timeout: 10000 })
})
