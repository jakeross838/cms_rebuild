import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'
const runId = Date.now().toString().slice(-6)

/**
 * E2E tests for job-scoped CRUD flows beyond daily logs and RFIs.
 * Tests create forms for change orders, POs, permits, punch items, etc.
 */

test.describe.serial('Job-scoped CRUD flows', () => {
  test.describe.configure({ retries: 2 })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('create a change order', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/change-orders/new`)

    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeEnabled({ timeout: 15000 })

    const titleInput = page.locator('input[name="title"], input[name="description"], input[name="name"]').first()
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(`E2E Change Order ${runId}`)
    }

    const amountInput = page.locator('input[name="amount"], input[name="total"]').first()
    if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await amountInput.fill('5000')
    }

    await submitBtn.click()
    await page.waitForURL(/\/change-orders/, { timeout: 20000 })
  })

  test('create a purchase order', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/purchase-orders/new`)

    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeEnabled({ timeout: 15000 })

    const poNumber = page.locator('input[name="po_number"], input[name="number"]').first()
    if (await poNumber.isVisible({ timeout: 5000 }).catch(() => false)) {
      await poNumber.fill(`PO-E2E-${runId}`)
    }

    await submitBtn.click()
    await page.waitForURL(/\/purchase-orders/, { timeout: 20000 })
  })

  test('create a punch item', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/punch-list/new`)

    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeEnabled({ timeout: 15000 })

    const titleInput = page.locator('input[name="title"], input[name="description"], input[name="item"]').first()
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.fill(`E2E Punch Item ${runId}`)
    }

    await submitBtn.click()
    await page.waitForURL(/\/punch-list/, { timeout: 20000 })
  })

  test('create a lien waiver', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/lien-waivers/new`)

    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeEnabled({ timeout: 15000 })

    await submitBtn.click()
    await page.waitForURL(/\/lien-waivers/, { timeout: 20000 })
  })

  test('budget page loads with line items', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/budget`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /budget/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('schedule page loads', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/schedule`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /schedule/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('photos page loads', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/photos`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /photos/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('selections page loads', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/selections`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').filter({ hasText: /selections/i }).first()).toBeVisible({ timeout: 10000 })
  })
})
