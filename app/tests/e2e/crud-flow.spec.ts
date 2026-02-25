import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

// Generate unique values per test run to avoid UNIQUE constraint conflicts
const runId = Date.now().toString().slice(-6)
// Unique date: use random year between 2020-2024 to avoid collisions with real data and past runs
const randomYear = 2020 + Math.floor(Math.random() * 5)
const randomMonth = Math.floor(Math.random() * 12) + 1
const randomDay = Math.floor(Math.random() * 28) + 1
const testDate = `${randomYear}-${String(randomMonth).padStart(2, '0')}-${String(randomDay).padStart(2, '0')}`

test.describe.serial('CRUD flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('create and view a daily log', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/daily-logs/new`)
    await page.waitForLoadState('networkidle')

    // Use unique date to avoid UNIQUE constraint on (job_id, log_date)
    await page.fill('input[name="log_date"]', testDate)
    await page.fill('input[name="weather_summary"]', 'Clear skies, mild wind')
    await page.fill('input[name="high_temp"]', '72')
    await page.fill('input[name="low_temp"]', '55')
    await page.fill('textarea[name="notes"]', `E2E test daily log ${runId} - foundation pour completed`)

    await page.click('button:has-text("Create")')

    // Should redirect to list page
    await page.waitForURL(/\/daily-logs$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Daily Logs' })).toBeVisible()
  })

  test('create and view an RFI', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/rfis/new`)
    await page.waitForLoadState('networkidle')

    // Fill ALL required fields — rfi_number is required (NOT NULL, no default)
    await page.fill('input[name="rfi_number"]', `RFI-E2E-${runId}`)
    await page.fill('input[name="subject"]', 'E2E Test RFI - wall finish spec')
    await page.fill('textarea[name="question"]', 'What finish is specified for the east wall?')

    await page.click('button:has-text("Create")')
    await page.waitForURL(/\/rfis$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'RFIs' })).toBeVisible()
  })

  test('edit a daily log from detail page', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/daily-logs`)
    await page.waitForLoadState('networkidle')

    // Use selector that excludes nav links and "new" link — only match UUID-based detail links
    const logItem = page.locator('a[href*="/daily-logs/"]:not([href$="/new"])').first()
    if (!(await logItem.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await logItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Daily Logs')).toBeVisible({ timeout: 10000 })

    // Click Edit button
    await page.click('button:has-text("Edit")')

    // Should show edit form with input fields
    await expect(page.locator('input[name="weather_summary"]')).toBeVisible({ timeout: 5000 })

    // Modify weather summary
    await page.fill('input[name="weather_summary"]', 'Updated weather - partly cloudy')

    // Save changes
    await page.click('button:has-text("Save")')

    // Should show success message
    await expect(page.locator('text=updated successfully')).toBeVisible({ timeout: 10000 })
  })

  test('edit job details', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/edit`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1:has-text("Edit Job")')).toBeVisible({ timeout: 10000 })

    // The form should be pre-filled
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toHaveValue('Smith Residence', { timeout: 5000 })

    // Modify notes
    await page.fill('textarea[name="notes"]', `E2E test ${runId} - updated notes`)

    // Save
    await page.click('button:has-text("Save")')

    // Should show success and redirect
    await expect(page.locator('text=Job updated successfully')).toBeVisible({ timeout: 10000 })
  })
})
