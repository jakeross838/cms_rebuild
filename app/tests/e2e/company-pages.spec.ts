import { test, expect } from '@playwright/test'

/**
 * E2E tests for company-level pages that weren't previously covered.
 * Tests that key pages load and render expected content.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('dashboard loads with stats cards', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i }).first()).toBeVisible({ timeout: 10000 })
})

test('clients list page loads', async ({ page }) => {
  await page.goto('/clients')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /clients/i }).first()).toBeVisible({ timeout: 10000 })
})

test('vendors list page loads', async ({ page }) => {
  await page.goto('/vendors')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /vendors/i }).first()).toBeVisible({ timeout: 10000 })
})

test('estimates list page loads', async ({ page }) => {
  await page.goto('/estimates')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /estimates/i }).first()).toBeVisible({ timeout: 10000 })
})

test('contracts list page loads', async ({ page }) => {
  await page.goto('/contracts')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /contracts/i }).first()).toBeVisible({ timeout: 10000 })
})

test('invoices list page loads', async ({ page }) => {
  await page.goto('/invoices')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /invoices/i }).first()).toBeVisible({ timeout: 10000 })
})

test('bids list page loads', async ({ page }) => {
  await page.goto('/bids')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /bids/i }).first()).toBeVisible({ timeout: 10000 })
})

test('leads list page loads', async ({ page }) => {
  await page.goto('/leads')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /leads/i }).first()).toBeVisible({ timeout: 10000 })
})

test('equipment list page loads', async ({ page }) => {
  await page.goto('/equipment')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /equipment/i }).first()).toBeVisible({ timeout: 10000 })
})

test('inventory list page loads', async ({ page }) => {
  await page.goto('/inventory')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /inventory/i }).first()).toBeVisible({ timeout: 10000 })
})

test('cost codes list page loads', async ({ page }) => {
  await page.goto('/cost-codes')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /cost codes/i }).first()).toBeVisible({ timeout: 10000 })
})

test('employees/HR page loads', async ({ page }) => {
  await page.goto('/employees')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /employee|hr|workforce/i }).first()).toBeVisible({ timeout: 10000 })
})
