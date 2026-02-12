# Code Standards

> Consistent code is maintainable code. Follow these standards without exception.

## Table of Contents
- [TypeScript Rules](#typescript-rules)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Import Order](#import-order)
- [Function Guidelines](#function-guidelines)
- [Error Handling](#error-handling)
- [Comments and Documentation](#comments-and-documentation)

---

## TypeScript Rules

### Strict Mode Required
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### No `any` Type
```typescript
// ❌ BAD
function processData(data: any) {
  return data.value;
}

// ✅ GOOD
function processData(data: unknown): string {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}

// ✅ GOOD - Use generics when type varies
function processData<T extends { value: string }>(data: T): string {
  return data.value;
}
```

### Explicit Return Types
```typescript
// ❌ BAD - Return type inferred
function getUser(id: string) {
  return db.users.find(id);
}

// ✅ GOOD - Return type explicit
function getUser(id: string): Promise<User | null> {
  return db.users.find(id);
}
```

### Type Definitions Location
```typescript
// Types used in one file: Define at top of file
type LocalState = {
  isOpen: boolean;
  selected: string[];
};

// Types used across files: Define in src/types/
// src/types/user.ts
export interface User {
  id: string;
  email: string;
  companyId: string;
  role: UserRole;
  createdAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
```

### Prefer `interface` for Objects, `type` for Unions
```typescript
// ✅ Interface for object shapes
interface User {
  id: string;
  name: string;
}

// ✅ Type for unions, intersections, primitives
type Status = 'pending' | 'active' | 'closed';
type UserWithProfile = User & Profile;
type ID = string | number;
```

---

## Naming Conventions

### Files and Directories

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase.tsx | `UserProfile.tsx` |
| React Pages | kebab-case/page.tsx | `user-settings/page.tsx` |
| Utilities | kebab-case.ts | `format-currency.ts` |
| Hooks | use-kebab-case.ts | `use-auth.ts` |
| Types | kebab-case.ts | `user-types.ts` |
| Constants | kebab-case.ts | `route-constants.ts` |
| Tests | *.test.ts(x) | `UserProfile.test.tsx` |

### Variables and Functions

```typescript
// Variables: camelCase
const userName = 'John';
const isLoading = true;
const maxRetryCount = 3;

// Functions: camelCase, verb prefix
function getUserById(id: string): User { }
function validateEmail(email: string): boolean { }
function formatCurrency(amount: number): string { }
async function fetchCompanyData(): Promise<Company> { }

// Boolean variables: is/has/can/should prefix
const isActive = true;
const hasPermission = false;
const canEdit = user.role === 'admin';
const shouldRefetch = staleTime > 0;

// Event handlers: handle prefix
const handleClick = () => { };
const handleSubmit = (data: FormData) => { };
const handleUserSelect = (user: User) => { };
```

### Constants

```typescript
// ✅ SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api/v1';
const DEFAULT_PAGE_SIZE = 20;

// ✅ Grouped constants as frozen objects
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

// ✅ Use enums sparingly, prefer const objects
const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
} as const;

type UserRole = typeof UserRole[keyof typeof UserRole];
```

### React Components

```typescript
// ✅ PascalCase for components
function UserProfile({ user }: UserProfileProps) { }
function DataTable<T>({ data, columns }: DataTableProps<T>) { }

// ✅ Props interface: ComponentNameProps
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
}

// ✅ Component files export component as default
// UserProfile.tsx
export default function UserProfile({ user }: UserProfileProps) { }

// ✅ Index files for component folders
// components/UserProfile/index.ts
export { default } from './UserProfile';
export * from './UserProfile';
```

### Database Names (see DATABASE_STANDARDS.md)

```sql
-- Tables: snake_case, plural
CREATE TABLE users ( );
CREATE TABLE job_line_items ( );

-- Columns: snake_case
company_id, created_at, is_active

-- Foreign keys: referenced_table_singular_id
user_id, company_id, job_id

-- Indexes: idx_table_columns
idx_users_company_id
idx_jobs_company_status
```

---

## File Organization

### Component File Structure
```typescript
// 1. Imports (see Import Order below)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

// 2. Types (if not imported)
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

// 3. Constants (if needed)
const ANIMATION_DURATION = 200;

// 4. Helper functions (if small, otherwise separate file)
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// 5. Component
export default function UserCard({ user, onSelect }: UserCardProps) {
  // 5a. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 5b. Derived state
  const displayName = formatUserName(user);

  // 5c. Event handlers
  const handleClick = () => {
    onSelect(user);
  };

  // 5d. Render
  return (
    <div onClick={handleClick}>
      {displayName}
    </div>
  );
}
```

### Utility File Structure
```typescript
// 1. Imports
import { format, parseISO } from 'date-fns';

// 2. Types
interface FormatOptions {
  includeTime?: boolean;
  timezone?: string;
}

// 3. Constants
const DEFAULT_DATE_FORMAT = 'MMM d, yyyy';
const DEFAULT_DATETIME_FORMAT = 'MMM d, yyyy h:mm a';

// 4. Functions (export individually, no default export)
export function formatDate(date: Date | string, options?: FormatOptions): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const formatStr = options?.includeTime ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT;
  return format(d, formatStr);
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
```

---

## Import Order

Imports must be in this order, with blank lines between groups:

```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { format } from 'date-fns';
import { z } from 'zod';

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';

// 4. Relative imports
import { UserAvatar } from './UserAvatar';
import { validateForm } from './utils';

// 5. Types (always last, with 'type' keyword)
import type { User, Company } from '@/types';
import type { FormState } from './types';
```

---

## Function Guidelines

### Single Responsibility
```typescript
// ❌ BAD - Does too much
async function processUser(userId: string) {
  const user = await fetchUser(userId);
  const validated = validateUser(user);
  await saveUser(validated);
  await sendEmail(validated.email);
  await logActivity(userId, 'processed');
}

// ✅ GOOD - Single purpose functions
async function processUser(userId: string) {
  const user = await fetchUser(userId);
  const validated = validateUser(user);
  await saveUser(validated);
  await queueWelcomeEmail(validated);
  await logUserActivity(userId, 'processed');
}
```

### Keep Functions Small
- Max 30-40 lines per function
- If longer, extract helper functions
- If many parameters, use an options object

```typescript
// ❌ BAD - Too many parameters
function createJob(
  name: string,
  companyId: string,
  clientId: string,
  address: string,
  startDate: Date,
  endDate: Date,
  budget: number,
  status: string
) { }

// ✅ GOOD - Options object
interface CreateJobOptions {
  name: string;
  companyId: string;
  clientId: string;
  address: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  status?: JobStatus;
}

function createJob(options: CreateJobOptions): Promise<Job> { }
```

### Pure Functions When Possible
```typescript
// ✅ Pure function - same input = same output
function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

// ✅ Pure function with no side effects
function formatAddress(address: Address): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}
```

---

## Error Handling

### Use Custom Error Classes
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}
```

### Error Handling Patterns
```typescript
// ✅ API Routes - Catch and format errors
export async function GET(req: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    // Unknown error - log and return generic message
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ Components - Error boundaries
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useUser(userId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NotFound resource="User" />;

  return <ProfileCard user={data} />;
}
```

### Never Swallow Errors
```typescript
// ❌ BAD - Error swallowed
try {
  await saveData();
} catch (e) {
  // Nothing happens
}

// ❌ BAD - Generic catch
try {
  await saveData();
} catch (e) {
  console.log('error');
}

// ✅ GOOD - Handle or rethrow
try {
  await saveData();
} catch (error) {
  logger.error('Failed to save data', { error });
  throw new AppError('Failed to save data', 'SAVE_FAILED');
}
```

---

## Comments and Documentation

### When to Comment
```typescript
// ✅ Explain WHY, not WHAT
// Using setTimeout to debounce rapid updates that cause render thrashing
const debouncedUpdate = useMemo(() => debounce(update, 300), []);

// ✅ Document complex business logic
// Draws can only be submitted if:
// 1. All line items have been approved
// 2. Total doesn't exceed contract remaining balance
// 3. Previous draw (if any) has been paid
function canSubmitDraw(draw: Draw, contract: Contract): boolean { }

// ✅ Mark TODOs with ticket numbers
// TODO(ROSS-123): Implement batch processing for large imports

// ❌ BAD - Obvious comments
// Increment counter
counter++;

// Loop through users
users.forEach(user => { });
```

### JSDoc for Public APIs
```typescript
/**
 * Formats a currency amount for display.
 *
 * @param amount - The amount in cents
 * @param currency - ISO 4217 currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(123456) // "$1,234.56"
 * formatCurrency(123456, 'EUR') // "€1,234.56"
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}
```

### File Headers for Complex Files
```typescript
/**
 * Job Queue Processor
 *
 * Handles background job processing with:
 * - Priority-based execution
 * - Retry logic with exponential backoff
 * - Dead letter queue for failed jobs
 *
 * @see docs/guides/BACKGROUND_JOBS.md
 */
```

---

## ESLint Rules Enforcement

All rules are enforced via ESLint. See `.eslintrc.js` for full configuration.

Key rules:
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/explicit-function-return-type`: error (for exported functions)
- `import/order`: error (enforces import order)
- `no-console`: warn (use logger instead)
- `prefer-const`: error
- `no-unused-vars`: error
