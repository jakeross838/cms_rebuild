# Testing Standards

> Untested code is broken code. Every feature needs tests before it ships.

## Table of Contents
- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Test File Organization](#test-file-organization)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Test Patterns](#test-patterns)
- [Mocking Guidelines](#mocking-guidelines)
- [Coverage Requirements](#coverage-requirements)

---

## Testing Philosophy

### The Testing Pyramid
```
        ╱╲
       ╱  ╲         E2E Tests (Few)
      ╱────╲        - Critical user flows
     ╱      ╲       - Happy paths only
    ╱────────╲
   ╱          ╲     Integration Tests (Some)
  ╱────────────╲    - API endpoints
 ╱              ╲   - Database operations
╱────────────────╲  - Component integration
╱                  ╲
╱────────────────────╲  Unit Tests (Many)
                        - Pure functions
                        - Components
                        - Hooks
```

### Core Principles
1. **Test behavior, not implementation** - Tests should not break when refactoring
2. **Fast feedback** - Unit tests should run in milliseconds
3. **Isolated** - Tests should not depend on each other
4. **Deterministic** - Same input = same output, every time
5. **Readable** - Tests are documentation

---

## Test Types

| Type | Purpose | Speed | Tools |
|------|---------|-------|-------|
| Unit | Test isolated functions/components | Fast (ms) | Vitest, React Testing Library |
| Integration | Test combined modules | Medium (s) | Vitest, MSW, Test Containers |
| E2E | Test full user flows | Slow (min) | Playwright |

### When to Use Each

**Unit Tests:**
- Pure utility functions
- Individual React components
- Custom hooks
- Validation schemas
- State reducers

**Integration Tests:**
- API route handlers
- Database queries
- Component trees with data fetching
- Form submissions

**E2E Tests:**
- Critical user journeys (login, checkout, etc.)
- Multi-page flows
- Features requiring real browser behavior

---

## Test File Organization

### File Naming
```
src/
├── lib/
│   ├── utils/
│   │   ├── format-currency.ts
│   │   └── format-currency.test.ts     # Co-located unit test
│   └── api/
│       └── middleware.ts
│
├── components/
│   └── jobs/
│       ├── JobCard.tsx
│       └── JobCard.test.tsx            # Co-located component test
│
tests/
├── integration/
│   ├── api/
│   │   ├── jobs.test.ts               # API route tests
│   │   └── invoices.test.ts
│   └── db/
│       └── jobs.test.ts               # Database tests
│
├── e2e/
│   ├── auth.spec.ts                   # E2E specs
│   ├── jobs.spec.ts
│   └── invoices.spec.ts
│
└── fixtures/                          # Shared test data
    ├── jobs.ts
    ├── users.ts
    └── companies.ts
```

### Test File Structure
```typescript
// Standard test file structure

// 1. Imports
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobCard } from './JobCard';
import { createMockJob } from '@/tests/fixtures/jobs';

// 2. Mocks (if needed)
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// 3. Test suites
describe('JobCard', () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Group related tests
  describe('rendering', () => {
    it('displays job name and status', () => { });
    it('shows client name when available', () => { });
  });

  describe('interactions', () => {
    it('calls onClick when clicked', () => { });
    it('shows actions menu on hover', () => { });
  });

  describe('edge cases', () => {
    it('handles missing client gracefully', () => { });
  });
});
```

---

## Unit Tests

### Testing Utility Functions
```typescript
// lib/utils/format-currency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats positive amounts correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('formats negative amounts with parentheses', () => {
    expect(formatCurrency(-1234.56)).toBe('($1,234.56)');
  });

  it('handles different currencies', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(1234.567)).toBe('$1,234.57');
    expect(formatCurrency(1234.564)).toBe('$1,234.56');
  });
});
```

### Testing React Components
```typescript
// components/jobs/JobCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobCard } from './JobCard';
import { createMockJob } from '@/tests/fixtures/jobs';

describe('JobCard', () => {
  const mockJob = createMockJob({
    name: 'Kitchen Remodel',
    status: 'active',
    contractAmount: 50000,
  });

  it('renders job information', () => {
    render(<JobCard job={mockJob} />);

    expect(screen.getByText('Kitchen Remodel')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<JobCard job={mockJob} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));

    expect(handleClick).toHaveBeenCalledWith(mockJob);
  });

  it('applies compact variant styles', () => {
    render(<JobCard job={mockJob} variant="compact" />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass('p-2');
  });

  it('handles missing optional fields', () => {
    const jobWithoutClient = createMockJob({ client: null });
    render(<JobCard job={jobWithoutClient} />);

    expect(screen.queryByTestId('client-name')).not.toBeInTheDocument();
  });
});
```

### Testing Custom Hooks
```typescript
// hooks/use-debounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels pending update on new value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => vi.advanceTimersByTime(250));

    rerender({ value: 'third' });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe('third');
  });
});
```

---

## Integration Tests

### Testing API Routes
```typescript
// tests/integration/api/jobs.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/jobs/route';
import { createTestUser, createTestCompany, cleanupTestData } from '@/tests/helpers';

describe('GET /api/jobs', () => {
  let testCompany: Company;
  let testUser: User;

  beforeEach(async () => {
    testCompany = await createTestCompany();
    testUser = await createTestUser({ companyId: testCompany.id });
  });

  afterEach(async () => {
    await cleanupTestData([testCompany.id]);
  });

  it('returns paginated jobs for company', async () => {
    // Create test jobs
    await createTestJobs(testCompany.id, 5);

    const { req } = createMocks({
      method: 'GET',
      url: '/api/jobs?page=1&limit=2',
    });

    // Mock auth context
    vi.mocked(getAuthContext).mockResolvedValue({
      user: testUser,
      companyId: testCompany.id,
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 2,
      total: 5,
      totalPages: 3,
      hasMore: true,
    });
  });

  it('filters by status', async () => {
    await createTestJob(testCompany.id, { status: 'active' });
    await createTestJob(testCompany.id, { status: 'draft' });

    const { req } = createMocks({
      method: 'GET',
      url: '/api/jobs?status=active',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].status).toBe('active');
  });

  it('returns 401 without authentication', async () => {
    vi.mocked(getAuthContext).mockResolvedValue(null);

    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);

    expect(response.status).toBe(401);
  });
});

describe('POST /api/jobs', () => {
  it('creates a job with valid data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        name: 'New Kitchen',
        clientId: testClient.id,
        address: '123 Main St',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.name).toBe('New Kitchen');
    expect(data.data.company_id).toBe(testCompany.id);
  });

  it('returns 400 with invalid data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { name: '' }, // Missing required fields
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_FAILED');
  });
});
```

### Testing Database Operations
```typescript
// tests/integration/db/jobs.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestClient } from '@/tests/helpers/db';
import { createJob, getJobsByCompany, updateJob } from '@/lib/db/jobs';

describe('Job Database Operations', () => {
  const testClient = createTestClient();

  beforeAll(async () => {
    await testClient.connect();
    await testClient.seed();
  });

  afterAll(async () => {
    await testClient.cleanup();
    await testClient.disconnect();
  });

  describe('createJob', () => {
    it('creates job with all fields', async () => {
      const job = await createJob({
        companyId: testClient.companyId,
        name: 'Test Job',
        clientId: testClient.clientId,
        address: '123 Test St',
      });

      expect(job.id).toBeDefined();
      expect(job.name).toBe('Test Job');
      expect(job.company_id).toBe(testClient.companyId);
      expect(job.created_at).toBeDefined();
    });

    it('enforces foreign key constraints', async () => {
      await expect(
        createJob({
          companyId: testClient.companyId,
          name: 'Test',
          clientId: 'invalid-uuid',
          address: '123 St',
        })
      ).rejects.toThrow();
    });
  });

  describe('RLS policies', () => {
    it('only returns jobs for the authenticated company', async () => {
      // Create job for different company
      const otherCompanyJob = await createJobAsAdmin({
        companyId: 'other-company-id',
        name: 'Other Company Job',
      });

      // Query as test company user
      const jobs = await getJobsByCompany(testClient.companyId);

      expect(jobs.find((j) => j.id === otherCompanyJob.id)).toBeUndefined();
    });
  });
});
```

---

## E2E Tests

### Playwright Test Structure
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can log in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for redirect
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid credentials'
    );
    await expect(page).toHaveURL('/login');
  });
});

// tests/e2e/jobs.spec.ts
test.describe('Job Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsTestUser(page);
  });

  test('user can create a new job', async ({ page }) => {
    await page.goto('/jobs');
    await page.click('[data-testid="create-job-button"]');

    // Fill form
    await page.fill('[data-testid="job-name-input"]', 'Kitchen Remodel');
    await page.selectOption('[data-testid="client-select"]', { label: 'John Smith' });
    await page.fill('[data-testid="address-input"]', '123 Main St');
    await page.click('[data-testid="submit-button"]');

    // Verify creation
    await expect(page).toHaveURL(/\/jobs\/[\w-]+/);
    await expect(page.locator('h1')).toContainText('Kitchen Remodel');
  });

  test('user can edit a job', async ({ page }) => {
    await page.goto('/jobs/test-job-id');
    await page.click('[data-testid="edit-button"]');

    await page.fill('[data-testid="job-name-input"]', 'Updated Name');
    await page.click('[data-testid="save-button"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Updated Name');
  });
});
```

### Page Object Model
```typescript
// tests/e2e/pages/JobsPage.ts
import { Page, Locator } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly jobList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.locator('[data-testid="create-job-button"]');
    this.jobList = page.locator('[data-testid="job-list"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
  }

  async goto() {
    await this.page.goto('/jobs');
  }

  async createJob(data: { name: string; client: string; address: string }) {
    await this.createButton.click();
    await this.page.fill('[data-testid="job-name-input"]', data.name);
    await this.page.selectOption('[data-testid="client-select"]', { label: data.client });
    await this.page.fill('[data-testid="address-input"]', data.address);
    await this.page.click('[data-testid="submit-button"]');
  }

  async searchJobs(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForResponse((r) => r.url().includes('/api/jobs'));
  }

  async getJobCount(): Promise<number> {
    return this.jobList.locator('[data-testid="job-card"]').count();
  }
}

// Usage in tests
test('search filters jobs', async ({ page }) => {
  const jobsPage = new JobsPage(page);
  await jobsPage.goto();

  await jobsPage.searchJobs('kitchen');

  expect(await jobsPage.getJobCount()).toBeGreaterThan(0);
});
```

---

## Test Patterns

### Arrange-Act-Assert (AAA)
```typescript
it('calculates total correctly', () => {
  // Arrange
  const items = [
    { amount: 100 },
    { amount: 200 },
    { amount: 300 },
  ];

  // Act
  const result = calculateTotal(items);

  // Assert
  expect(result).toBe(600);
});
```

### Test Data Builders
```typescript
// tests/fixtures/jobs.ts
export function createMockJob(overrides: Partial<Job> = {}): Job {
  return {
    id: crypto.randomUUID(),
    companyId: 'test-company-id',
    name: 'Test Job',
    status: 'active',
    address: '123 Test St',
    contractAmount: 10000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Usage
const activeJob = createMockJob({ status: 'active' });
const draftJob = createMockJob({ status: 'draft', name: 'Draft Job' });
```

### Testing Error States
```typescript
it('shows error message when API fails', async () => {
  // Mock API to fail
  server.use(
    rest.get('/api/jobs', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );

  render(<JobList />);

  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

---

## Mocking Guidelines

### When to Mock
- External APIs
- Database calls in unit tests
- Time-dependent functions
- Random values

### When NOT to Mock
- Internal business logic
- Simple utility functions
- The thing you're testing

### MSW for API Mocking
```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/jobs', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [createMockJob(), createMockJob()],
        pagination: { page: 1, total: 2 },
      })
    );
  }),

  rest.post('/api/jobs', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ data: createMockJob(body) })
    );
  }),
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Coverage Requirements

### Minimum Coverage Targets
| Type | Target |
|------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### What to Cover
- All utility functions
- All API routes
- All form validations
- Critical business logic
- Error handling paths

### What Not to Obsess Over
- Generated code
- Type definitions
- Simple getters/setters
- Third-party library wrappers

### Running Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```
