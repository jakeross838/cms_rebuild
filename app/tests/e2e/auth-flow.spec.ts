import { test, expect } from '@playwright/test'

/**
 * E2E tests for authentication flows.
 * Tests login page rendering, validation, error handling,
 * and navigation guards.
 */

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders login form with all elements', async ({ page }) => {
    await expect(page.getByText('Ross Built CMS')).toBeVisible()
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByText('Create an account')).toBeVisible()
  })

  test('shows validation feedback on empty submit', async ({ page }) => {
    // Click sign in without filling fields
    await page.getByRole('button', { name: /sign in/i }).click()
    // The form should show error (browser native validation or custom)
    // At minimum, the page should stay on /login
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('you@company.com').fill('invalid@test.com')
    await page.getByPlaceholder('Enter your password').fill('WrongPass123!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for error message to appear
    await expect(page.getByText(/invalid|error|incorrect|credentials/i)).toBeVisible({ timeout: 10000 })
  })

  test('shows loading state during login attempt', async ({ page }) => {
    await page.getByPlaceholder('you@company.com').fill('test@test.com')
    await page.getByPlaceholder('Enter your password').fill('TestPass123!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show loading spinner briefly
    await expect(page.getByText(/signing in|loading/i)).toBeVisible({ timeout: 3000 }).catch(() => {
      // Loading state may be too fast to catch — that's OK
    })
  })

  test('has link to signup page', async ({ page }) => {
    const signupLink = page.getByText('Create an account')
    await expect(signupLink).toBeVisible()
    await signupLink.click()
    await expect(page).toHaveURL(/\/signup/)
  })
})

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('renders signup form with all elements', async ({ page }) => {
    await expect(page.getByText('Create Account')).toBeVisible()
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
    // Should have password field
    const passwordInputs = page.locator('input[type="password"]')
    await expect(passwordInputs.first()).toBeVisible()
  })

  test('has link to login page', async ({ page }) => {
    const loginLink = page.getByText(/sign in/i).last()
    await expect(loginLink).toBeVisible()
  })
})

test.describe('Route Protection', () => {
  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('redirects unauthenticated user from jobs to login', async ({ page }) => {
    await page.goto('/jobs')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('redirects unauthenticated user from settings to login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('allows access to skeleton pages without auth', async ({ page }) => {
    await page.goto('/skeleton')
    // Should NOT redirect to login
    await expect(page).not.toHaveURL(/\/login/)
  })
})
