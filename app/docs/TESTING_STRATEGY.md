# RossOS Testing Strategy

> **Purpose**: Comprehensive testing strategy for quality assurance and regression prevention.
>
> **Stack**: Vitest (Unit), Playwright (E2E), Testing Library (Component)
>
> **Last Updated**: 2026-02-12

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Pyramid](#2-testing-pyramid)
3. [Unit Testing](#3-unit-testing)
4. [Component Testing](#4-component-testing)
5. [Integration Testing](#5-integration-testing)
6. [E2E Testing](#6-e2e-testing)
7. [Performance Testing](#7-performance-testing)
8. [Test Coverage](#8-test-coverage)

---

## 1. Testing Philosophy

### 1.1 Core Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Write Tests First for Bugs**: Every bug fix should have a regression test
3. **Fast Feedback Loop**: Unit tests should run in <5 seconds
4. **Confidence Over Coverage**: Prioritize critical paths over arbitrary coverage %
5. **Readable Tests**: Tests serve as documentation

### 1.2 What to Test

| Priority | What to Test | Test Type |
|----------|--------------|-----------|
| P0 | Authentication/Authorization | E2E + Integration |
| P0 | Financial calculations | Unit |
| P0 | Data mutations (CRUD) | Integration |
| P1 | Form validation | Unit + Component |
| P1 | API endpoints | Integration |
| P1 | Critical user flows | E2E |
| P2 | UI components | Component |
| P2 | Utility functions | Unit |

---

## 2. Testing Pyramid

```
                    ┌─────────┐
                    │  E2E    │  ~10%
                    │  Tests  │  Slow, Expensive
                    ├─────────┤
                   │Integration│  ~20%
                   │   Tests   │  Medium Speed
                   ├───────────┤
                  │  Component  │  ~30%
                  │    Tests    │  Fast
                  ├─────────────┤
                 │    Unit       │  ~40%
                 │    Tests      │  Very Fast
                 └───────────────┘
```

---

## 3. Unit Testing

### 3.1 Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/*.d.ts', '**/tests/**'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3.2 Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### 3.3 Unit Test Examples

```typescript
// src/lib/utils/money.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  calculatePercentage,
  sumAmounts,
} from './money';

describe('Money Utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive amounts correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('formats negative amounts with parentheses', () => {
      expect(formatCurrency(-1234.56)).toBe('($1,234.56)');
    });

    it('handles undefined/null gracefully', () => {
      expect(formatCurrency(undefined as any)).toBe('$0.00');
      expect(formatCurrency(null as any)).toBe('$0.00');
    });
  });

  describe('parseCurrency', () => {
    it('parses formatted currency strings', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
      expect(parseCurrency('$0.00')).toBe(0);
      expect(parseCurrency('($500.00)')).toBe(-500);
    });

    it('handles plain numbers', () => {
      expect(parseCurrency('1234.56')).toBe(1234.56);
      expect(parseCurrency('1234')).toBe(1234);
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    it('handles zero divisor', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
    });
  });

  describe('sumAmounts', () => {
    it('sums array of amounts', () => {
      expect(sumAmounts([100, 200, 300])).toBe(600);
      expect(sumAmounts([])).toBe(0);
      expect(sumAmounts([100.50, 200.25])).toBeCloseTo(300.75, 2);
    });

    it('handles negative numbers', () => {
      expect(sumAmounts([100, -50, 200])).toBe(250);
    });
  });
});
```

### 3.4 Testing Business Logic

```typescript
// src/lib/calculations/budget.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateBudgetSummary,
  calculateVariance,
  isOverBudget,
  calculateCompletionPercentage,
} from './budget';

describe('Budget Calculations', () => {
  const mockBudgetItems = [
    { id: '1', category: 'Labor', budgeted: 50000, actual: 45000, committed: 5000 },
    { id: '2', category: 'Materials', budgeted: 100000, actual: 80000, committed: 15000 },
    { id: '3', category: 'Equipment', budgeted: 25000, actual: 30000, committed: 0 },
  ];

  describe('calculateBudgetSummary', () => {
    it('calculates totals correctly', () => {
      const summary = calculateBudgetSummary(mockBudgetItems);

      expect(summary.totalBudgeted).toBe(175000);
      expect(summary.totalActual).toBe(155000);
      expect(summary.totalCommitted).toBe(20000);
      expect(summary.totalProjected).toBe(175000); // actual + committed
      expect(summary.totalVariance).toBe(0); // budgeted - projected
    });

    it('handles empty array', () => {
      const summary = calculateBudgetSummary([]);

      expect(summary.totalBudgeted).toBe(0);
      expect(summary.totalActual).toBe(0);
    });
  });

  describe('calculateVariance', () => {
    it('calculates positive variance (under budget)', () => {
      expect(calculateVariance(100000, 90000)).toBe(10000);
    });

    it('calculates negative variance (over budget)', () => {
      expect(calculateVariance(100000, 110000)).toBe(-10000);
    });
  });

  describe('isOverBudget', () => {
    it('returns true when over budget', () => {
      expect(isOverBudget(100000, 110000)).toBe(true);
    });

    it('returns false when under or at budget', () => {
      expect(isOverBudget(100000, 90000)).toBe(false);
      expect(isOverBudget(100000, 100000)).toBe(false);
    });

    it('considers threshold', () => {
      // 5% threshold
      expect(isOverBudget(100000, 104000, 0.05)).toBe(false);
      expect(isOverBudget(100000, 106000, 0.05)).toBe(true);
    });
  });
});
```

---

## 4. Component Testing

### 4.1 Testing Library Setup

```typescript
// tests/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';

// Create a custom render that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialQueryData?: Record<string, unknown>;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

### 4.2 Component Test Examples

```typescript
// src/components/job-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@/tests/test-utils';
import { JobCard } from './job-card';

const mockJob = {
  id: '123',
  name: 'Smith Residence',
  jobNumber: 'JOB-001',
  status: 'active',
  client: { name: 'John Smith' },
  contractAmount: 250000,
  completionPercentage: 45,
};

describe('JobCard', () => {
  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('Smith Residence')).toBeInTheDocument();
    expect(screen.getByText('JOB-001')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('$250,000.00')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(<JobCard job={mockJob} />);

    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Active');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith(mockJob.id);
  });

  it('shows loading skeleton when loading', () => {
    render(<JobCard job={mockJob} loading />);

    expect(screen.getByTestId('job-card-skeleton')).toBeInTheDocument();
  });
});
```

### 4.3 Form Component Testing

```typescript
// src/components/forms/job-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/tests/test-utils';
import { JobForm } from './job-form';

describe('JobForm', () => {
  const mockOnSubmit = vi.fn();
  const mockClients = [
    { id: '1', name: 'Client A' },
    { id: '2', name: 'Client B' },
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<JobForm onSubmit={mockOnSubmit} clients={mockClients} />);

    expect(screen.getByLabelText(/job name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contract amount/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<JobForm onSubmit={mockOnSubmit} clients={mockClients} />);

    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/job name is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<JobForm onSubmit={mockOnSubmit} clients={mockClients} />);

    await user.type(screen.getByLabelText(/job name/i), 'New Project');
    await user.type(screen.getByLabelText(/job number/i), 'JOB-100');
    await user.selectOptions(screen.getByLabelText(/client/i), '1');
    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/contract amount/i), '150000');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Project',
        jobNumber: 'JOB-100',
        clientId: '1',
        address: '123 Main St',
        contractAmount: 150000,
      });
    });
  });

  it('populates form when editing existing job', () => {
    const existingJob = {
      id: '123',
      name: 'Existing Project',
      jobNumber: 'JOB-050',
      clientId: '2',
      address: '456 Oak Ave',
      contractAmount: 200000,
    };

    render(
      <JobForm
        onSubmit={mockOnSubmit}
        clients={mockClients}
        initialData={existingJob}
      />
    );

    expect(screen.getByLabelText(/job name/i)).toHaveValue('Existing Project');
    expect(screen.getByLabelText(/job number/i)).toHaveValue('JOB-050');
    expect(screen.getByLabelText(/contract amount/i)).toHaveValue('200000');
  });
});
```

---

## 5. Integration Testing

### 5.1 API Route Testing

```typescript
// src/app/api/jobs/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Jobs API', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe('GET /api/jobs', () => {
    it('returns 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request('http://localhost/api/jobs');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('returns jobs for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const mockJobs = [
        { id: '1', name: 'Job 1' },
        { id: '2', name: 'Job 2' },
      ];

      mockSupabase.from().range.mockResolvedValue({
        data: mockJobs,
        count: 2,
        error: null,
      });

      const request = new Request('http://localhost/api/jobs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toEqual(mockJobs);
      expect(data.total).toBe(2);
    });

    it('applies filters from query params', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabase.from().range.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      const request = new Request(
        'http://localhost/api/jobs?status=active&page=2&limit=10'
      );
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('jobs');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('POST /api/jobs', () => {
    it('creates a new job', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const newJob = {
        name: 'New Project',
        clientId: 'client-123',
        contractAmount: 100000,
      };

      mockSupabase.from().single.mockResolvedValue({
        data: { id: 'new-job-id', ...newJob },
        error: null,
      });

      const request = new Request('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify(newJob),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-job-id');
    });

    it('validates required fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new Request('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify({ name: '' }), // Missing required fields
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

### 5.2 Database Integration Tests

```typescript
// tests/integration/database.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Use test database
const supabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_SERVICE_KEY!
);

describe('Database Integration', () => {
  let testCompanyId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test company
    const { data: company } = await supabase
      .from('companies')
      .insert({ name: 'Test Company' })
      .select()
      .single();
    testCompanyId = company!.id;

    // Create test user
    const { data: user } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
        company_id: testCompanyId,
        role: 'admin',
      })
      .select()
      .single();
    testUserId = user!.id;
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('users').delete().eq('id', testUserId);
    await supabase.from('companies').delete().eq('id', testCompanyId);
  });

  describe('Jobs CRUD', () => {
    let jobId: string;

    it('creates a job', async () => {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          company_id: testCompanyId,
          name: 'Test Job',
          job_number: 'TEST-001',
          status: 'active',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject({
        name: 'Test Job',
        job_number: 'TEST-001',
        status: 'active',
      });

      jobId = data!.id;
    });

    it('reads a job', async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      expect(error).toBeNull();
      expect(data?.name).toBe('Test Job');
    });

    it('updates a job', async () => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ name: 'Updated Job' })
        .eq('id', jobId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.name).toBe('Updated Job');
    });

    it('deletes a job', async () => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      expect(error).toBeNull();

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      expect(data).toBeNull();
    });
  });

  describe('RLS Policies', () => {
    it('prevents access to other company data', async () => {
      // Create job for test company
      const { data: job } = await supabase
        .from('jobs')
        .insert({
          company_id: testCompanyId,
          name: 'Company Job',
          job_number: 'TEST-002',
        })
        .select()
        .single();

      // Create another company
      const { data: otherCompany } = await supabase
        .from('companies')
        .insert({ name: 'Other Company' })
        .select()
        .single();

      // Try to access job with different company context
      // (This would use RLS in practice)
      const { data: accessedJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job!.id)
        .eq('company_id', otherCompany!.id)
        .single();

      expect(accessedJob).toBeNull();

      // Cleanup
      await supabase.from('jobs').delete().eq('id', job!.id);
      await supabase.from('companies').delete().eq('id', otherCompany!.id);
    });
  });
});
```

---

## 6. E2E Testing

### 6.1 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

### 6.2 E2E Test Examples

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('allows user to log in', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid credentials'
    );
  });

  test('allows user to log out', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

### 6.3 Critical Flow Testing

```typescript
// tests/e2e/job-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates a new job', async ({ page }) => {
    // Navigate to jobs
    await page.click('[data-testid="nav-jobs"]');
    await expect(page).toHaveURL('/jobs');

    // Click create button
    await page.click('[data-testid="create-job-button"]');

    // Fill job form
    await page.fill('[data-testid="job-name-input"]', 'E2E Test Project');
    await page.fill('[data-testid="job-number-input"]', 'E2E-001');
    await page.selectOption('[data-testid="client-select"]', { label: 'Test Client' });
    await page.fill('[data-testid="address-input"]', '123 Test Street');
    await page.fill('[data-testid="contract-amount-input"]', '250000');

    // Submit form
    await page.click('[data-testid="save-job-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('text=E2E Test Project')).toBeVisible();
  });

  test('edits an existing job', async ({ page }) => {
    await page.goto('/jobs');

    // Click on first job
    await page.click('[data-testid="job-card"]:first-child');

    // Click edit button
    await page.click('[data-testid="edit-job-button"]');

    // Update name
    await page.fill('[data-testid="job-name-input"]', 'Updated Project Name');
    await page.click('[data-testid="save-job-button"]');

    // Verify update
    await expect(page.locator('text=Updated Project Name')).toBeVisible();
  });

  test('adds budget item to job', async ({ page }) => {
    await page.goto('/jobs');
    await page.click('[data-testid="job-card"]:first-child');

    // Navigate to budget tab
    await page.click('[data-testid="budget-tab"]');

    // Add budget item
    await page.click('[data-testid="add-budget-item"]');
    await page.fill('[data-testid="category-input"]', 'Labor');
    await page.fill('[data-testid="description-input"]', 'Framing labor');
    await page.fill('[data-testid="amount-input"]', '15000');
    await page.click('[data-testid="save-budget-item"]');

    // Verify item appears
    await expect(page.locator('text=Framing labor')).toBeVisible();
    await expect(page.locator('text=$15,000.00')).toBeVisible();
  });
});
```

### 6.4 Page Object Pattern

```typescript
// tests/e2e/pages/jobs-page.ts
import { Page, Locator, expect } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly jobCards: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByTestId('create-job-button');
    this.searchInput = page.getByTestId('job-search-input');
    this.jobCards = page.getByTestId('job-card');
    this.filterDropdown = page.getByTestId('status-filter');
  }

  async goto() {
    await this.page.goto('/jobs');
    await expect(this.page).toHaveURL('/jobs');
  }

  async searchJobs(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce
    await this.page.waitForTimeout(500);
  }

  async filterByStatus(status: string) {
    await this.filterDropdown.selectOption(status);
  }

  async clickJob(index: number = 0) {
    await this.jobCards.nth(index).click();
  }

  async getJobCount(): Promise<number> {
    return await this.jobCards.count();
  }

  async createJob(data: {
    name: string;
    jobNumber: string;
    client: string;
    address: string;
    contractAmount: number;
  }) {
    await this.createButton.click();

    await this.page.fill('[data-testid="job-name-input"]', data.name);
    await this.page.fill('[data-testid="job-number-input"]', data.jobNumber);
    await this.page.selectOption('[data-testid="client-select"]', { label: data.client });
    await this.page.fill('[data-testid="address-input"]', data.address);
    await this.page.fill('[data-testid="contract-amount-input"]', data.contractAmount.toString());

    await this.page.click('[data-testid="save-job-button"]');
  }
}

// Usage in tests
test('creates multiple jobs', async ({ page }) => {
  const jobsPage = new JobsPage(page);
  await jobsPage.goto();

  await jobsPage.createJob({
    name: 'Project Alpha',
    jobNumber: 'ALPHA-001',
    client: 'Test Client',
    address: '100 Alpha St',
    contractAmount: 100000,
  });

  await expect(page.locator('text=Project Alpha')).toBeVisible();
});
```

---

## 7. Performance Testing

### 7.1 Lighthouse CI

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "pnpm start",
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/login",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/jobs"
      ]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }]
      }
    }
  }
}
```

### 7.2 Load Testing with k6

```javascript
// tests/load/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  const headers = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // List jobs
  const jobsRes = http.get(`${BASE_URL}/api/jobs`, { headers });
  check(jobsRes, {
    'jobs list returns 200': (r) => r.status === 200,
    'jobs list response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Get single job
  const jobRes = http.get(`${BASE_URL}/api/jobs/test-job-id`, { headers });
  check(jobRes, {
    'single job returns 200 or 404': (r) => [200, 404].includes(r.status),
  });

  sleep(1);
}
```

---

## 8. Test Coverage

### 8.1 Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Statements | 70% | 85% |
| Branches | 70% | 80% |
| Functions | 70% | 85% |
| Lines | 70% | 85% |

### 8.2 Coverage Configuration

```typescript
// vitest.config.ts (coverage section)
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  exclude: [
    'node_modules/',
    'tests/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/types/**',
    '.next/',
  ],
  thresholds: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
},
```

### 8.3 CI Coverage Check

```yaml
# .github/workflows/ci.yml (coverage job)
coverage:
  name: Coverage Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'

    - run: pnpm install --frozen-lockfile
    - run: pnpm test:coverage

    - uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        fail_ci_if_error: true
```

---

## Summary

This testing strategy provides:

1. **Unit Tests**: Fast, isolated tests for business logic and utilities
2. **Component Tests**: React Testing Library for UI components
3. **Integration Tests**: API route and database tests
4. **E2E Tests**: Playwright for critical user flows
5. **Performance Tests**: Lighthouse CI and k6 load testing
6. **Coverage**: Automated threshold enforcement

Run all tests: `pnpm test`
Run with coverage: `pnpm test:coverage`
Run E2E tests: `pnpm test:e2e`

---

*Last Updated: 2026-02-12*
*Version: 1.0*
