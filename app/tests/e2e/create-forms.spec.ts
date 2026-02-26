import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

// Top-level create forms
const topLevelForms = [
  { name: 'New Job', path: '/jobs/new' },
  { name: 'New Client', path: '/clients/new' },
  { name: 'New Vendor', path: '/vendors/new' },
  { name: 'New Contact', path: '/contacts/new' },
  { name: 'New Cost Code', path: '/cost-codes/new' },
  { name: 'New Lead', path: '/leads/new' },
  { name: 'New Estimate', path: '/estimates/new' },
  { name: 'New Invoice', path: '/invoices/new' },
  { name: 'New Contract', path: '/contracts/new' },
  { name: 'New Equipment', path: '/equipment/new' },
  { name: 'New Employee', path: '/hr/new' },
  { name: 'New Inventory Item', path: '/inventory/new' },
  { name: 'New Warranty', path: '/warranties/new' },
]

for (const form of topLevelForms) {
  test(`${form.name} form loads at ${form.path}`, async ({ page }) => {
    await page.goto(form.path)
    // Wait for client-side hydration — form inputs may not render until React mounts
    await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
    // Page should not be a 404
    await expect(page.locator('body')).not.toContainText('404')
  })
}

// Job-level create forms
const jobForms = [
  { name: 'New Budget Line', path: `/jobs/${JOB_ID}/budget/new` },
  { name: 'New Schedule Task', path: `/jobs/${JOB_ID}/schedule/new` },
  { name: 'New Daily Log', path: `/jobs/${JOB_ID}/daily-logs/new` },
  { name: 'New RFI', path: `/jobs/${JOB_ID}/rfis/new` },
  { name: 'New Change Order', path: `/jobs/${JOB_ID}/change-orders/new` },
  { name: 'New Draw Request', path: `/jobs/${JOB_ID}/draws/new` },
  { name: 'New Communication', path: `/jobs/${JOB_ID}/communications/new` },
  { name: 'New Photo', path: `/jobs/${JOB_ID}/photos/new` },
  { name: 'New PO', path: `/jobs/${JOB_ID}/purchase-orders/new` },
  { name: 'New Lien Waiver', path: `/jobs/${JOB_ID}/lien-waivers/new` },
  { name: 'New Permit', path: `/jobs/${JOB_ID}/permits/new` },
  { name: 'New Inspection', path: `/jobs/${JOB_ID}/inspections/new` },
  { name: 'New Selection', path: `/jobs/${JOB_ID}/selections/new` },
  { name: 'New Warranty (Job)', path: `/jobs/${JOB_ID}/warranties/new` },
  { name: 'New Submittal', path: `/jobs/${JOB_ID}/submittals/new` },
  { name: 'New Punch Item', path: `/jobs/${JOB_ID}/punch-list/new` },
  { name: 'New File Upload', path: `/jobs/${JOB_ID}/files/new` },
  { name: 'New Inventory', path: `/jobs/${JOB_ID}/inventory/new` },
]

for (const form of jobForms) {
  test(`${form.name} form loads at ${form.path}`, async ({ page }) => {
    await page.goto(form.path)
    // Wait for client-side hydration — form inputs may not render until React mounts
    await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
    // Page should not be a 404
    await expect(page.locator('body')).not.toContainText('404')
  })
}
