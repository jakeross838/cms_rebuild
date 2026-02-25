import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('contact detail page loads', async ({ page }) => {
  await page.goto('/contacts')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/contacts/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Contacts')).toBeVisible({ timeout: 10000 })
  }
})

test('cost code detail page loads', async ({ page }) => {
  await page.goto('/cost-codes')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/cost-codes/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Cost Codes')).toBeVisible({ timeout: 10000 })
  }
})

test('equipment detail page loads', async ({ page }) => {
  await page.goto('/equipment')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/equipment/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Equipment')).toBeVisible({ timeout: 10000 })
  }
})

test('estimate detail page loads', async ({ page }) => {
  await page.goto('/estimates')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/estimates/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Estimates')).toBeVisible({ timeout: 10000 })
  }
})

test('lead detail page loads', async ({ page }) => {
  await page.goto('/leads')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/leads/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Leads')).toBeVisible({ timeout: 10000 })
  }
})

test('HR employee detail page loads', async ({ page }) => {
  await page.goto('/hr')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/hr/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to HR')).toBeVisible({ timeout: 10000 })
  }
})

test('contract detail page loads', async ({ page }) => {
  await page.goto('/contracts')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/contracts/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Contracts')).toBeVisible({ timeout: 10000 })
  }
})

test('insurance detail page loads', async ({ page }) => {
  await page.goto('/compliance/insurance')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/insurance/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Insurance')).toBeVisible({ timeout: 10000 })
  }
})

test('safety incident detail page loads', async ({ page }) => {
  await page.goto('/compliance/safety')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/safety/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Safety')).toBeVisible({ timeout: 10000 })
  }
})

test('payable detail page loads', async ({ page }) => {
  await page.goto('/financial/payables')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/payables/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Payables')).toBeVisible({ timeout: 10000 })
  }
})

test('journal entry detail page loads', async ({ page }) => {
  await page.goto('/financial/journal-entries')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/journal-entries/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Journal Entries')).toBeVisible({ timeout: 10000 })
  }
})

test('chart of accounts detail page loads', async ({ page }) => {
  await page.goto('/financial/chart-of-accounts')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/chart-of-accounts/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Chart of Accounts')).toBeVisible({ timeout: 10000 })
  }
})
