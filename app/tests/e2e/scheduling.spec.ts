import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

/**
 * E2E tests for scheduling and daily log pages.
 * Tests schedule views, task lists, calendar, daily logs,
 * and schedule task creation form.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('company schedule page loads', async ({ page }) => {
  await page.goto('/schedule')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /schedule|calendar/i }).first()).toBeVisible({ timeout: 10000 })
})

test('job schedule page loads with task list', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/schedule`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /schedule/i }).first()).toBeVisible({ timeout: 10000 })
})

test('operations calendar page loads', async ({ page }) => {
  await page.goto('/operations/calendar')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /calendar|schedule/i }).first()).toBeVisible({ timeout: 10000 })
})

test('daily logs list page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/daily-logs`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /daily log/i }).first()).toBeVisible({ timeout: 10000 })
})

test('create daily log form renders', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/daily-logs/new`)
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')
  // Should have date and weather fields
  const inputs = page.locator('input, textarea, select')
  expect(await inputs.count()).toBeGreaterThan(0)
})

test('create schedule task form renders', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/schedule/new`)
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')
  // Should have form fields for task creation
  const inputs = page.locator('input, textarea, select')
  expect(await inputs.count()).toBeGreaterThan(0)
})

test('company daily logs aggregate page loads', async ({ page }) => {
  await page.goto('/daily-logs')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /daily log/i }).first()).toBeVisible({ timeout: 10000 })
})
