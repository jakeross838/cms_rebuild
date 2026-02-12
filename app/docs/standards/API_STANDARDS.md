# API Design Standards

> APIs are contracts. Design them carefully, version them properly, document them thoroughly.

## Table of Contents
- [Route Structure](#route-structure)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Authentication & Authorization](#authentication--authorization)
- [Pagination & Filtering](#pagination--filtering)
- [Rate Limiting](#rate-limiting)
- [Validation](#validation)
- [API Route Implementation](#api-route-implementation)

---

## Route Structure

### URL Conventions
```
/api/[resource]              # Collection
/api/[resource]/[id]         # Single item
/api/[resource]/[id]/[sub]   # Nested resource

# Examples
GET    /api/jobs             # List jobs
POST   /api/jobs             # Create job
GET    /api/jobs/123         # Get job
PATCH  /api/jobs/123         # Update job
DELETE /api/jobs/123         # Delete job
GET    /api/jobs/123/items   # List job line items
```

### Naming Rules
```
✅ CORRECT
/api/jobs
/api/line-items
/api/purchase-orders

❌ WRONG
/api/Jobs           # No PascalCase
/api/getJobs        # No verbs in URL
/api/job            # Use plural
/api/lineItems      # Use kebab-case
```

### File Structure
```
src/app/api/
├── jobs/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts          # GET, PATCH, DELETE
│       └── items/
│           └── route.ts      # GET, POST for job items
├── invoices/
│   └── route.ts
├── health/
│   └── route.ts
└── cron/
    ├── process-jobs/
    │   └── route.ts
    └── cleanup/
        └── route.ts
```

---

## Request/Response Format

### Success Response
```typescript
// Single resource
{
  "data": {
    "id": "uuid",
    "name": "Job Name",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

// Collection with pagination
{
  "data": [
    { "id": "uuid1", "name": "Job 1" },
    { "id": "uuid2", "name": "Job 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}

// Action response
{
  "success": true,
  "message": "Job created successfully",
  "data": { "id": "uuid" }
}
```

### Error Response
```typescript
// Standard error format
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "code": "VALIDATION_FAILED",
  "requestId": "req_abc123",
  "details": {
    "fields": {
      "email": "Invalid email format",
      "amount": "Must be greater than 0"
    }
  }
}

// Simple error
{
  "error": "NotFound",
  "message": "Job not found",
  "code": "RESOURCE_NOT_FOUND",
  "requestId": "req_abc123"
}
```

### HTTP Status Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business logic error |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Unexpected errors |

### Data Formatting
```typescript
// Dates: Always ISO 8601 in UTC
"createdAt": "2024-01-15T10:30:00Z"

// Money: Numbers (not strings), in base currency unit
"amount": 1234.56

// IDs: UUIDs
"id": "550e8400-e29b-41d4-a716-446655440000"

// Enums: Lowercase with underscores
"status": "in_progress"

// Booleans: true/false (not strings)
"isActive": true
```

---

## Error Handling

### Error Types
```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class ValidationError extends ApiError {
  constructor(fields: Record<string, string>) {
    super('Validation failed', 'VALIDATION_FAILED', 400, { fields });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Permission denied') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMITED', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}
```

### Error Handler Middleware
```typescript
// src/lib/api/error-handler.ts
import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/errors';
import { logger } from '@/lib/monitoring';

export function handleApiError(error: unknown, requestId: string): NextResponse {
  // Known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { ...error.toJSON(), requestId },
      { status: error.statusCode }
    );
  }

  // Zod validation errors
  if (error instanceof z.ZodError) {
    const fields = error.errors.reduce((acc, err) => {
      acc[err.path.join('.')] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(
      {
        error: 'ValidationError',
        message: 'Invalid request data',
        code: 'VALIDATION_FAILED',
        details: { fields },
        requestId,
      },
      { status: 400 }
    );
  }

  // Unknown errors - log and return generic message
  logger.error('Unexpected API error', {
    error: error instanceof Error ? error.message : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    requestId,
  });

  return NextResponse.json(
    {
      error: 'InternalError',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      requestId,
    },
    { status: 500 }
  );
}
```

---

## Authentication & Authorization

### Auth Flow
```typescript
// Every protected endpoint must:
// 1. Verify authentication
// 2. Extract user context
// 3. Verify authorization

import { createApiHandler } from '@/lib/api/middleware';

export const GET = createApiHandler(
  async (req, ctx) => {
    // ctx.user is guaranteed to exist (auth required by default)
    const { user, companyId } = ctx;

    const jobs = await getJobs(companyId);
    return NextResponse.json({ data: jobs });
  },
  {
    requireAuth: true,  // Default
    requiredRoles: ['admin', 'manager'],  // Optional
    auditAction: 'jobs.list',  // Optional
  }
);
```

### Role-Based Access Control
```typescript
// Define roles and permissions
const PERMISSIONS = {
  jobs: {
    read: ['admin', 'manager', 'member', 'viewer'],
    write: ['admin', 'manager'],
    delete: ['admin'],
  },
  invoices: {
    read: ['admin', 'manager', 'accountant'],
    write: ['admin', 'manager', 'accountant'],
    delete: ['admin'],
  },
  settings: {
    read: ['admin', 'manager'],
    write: ['admin'],
  },
} as const;

// Check permissions in handlers
function checkPermission(role: string, resource: string, action: string): boolean {
  const allowed = PERMISSIONS[resource]?.[action] || [];
  return allowed.includes(role);
}
```

### Public Endpoints
```typescript
// For endpoints that don't require auth
export const GET = createApiHandler(
  async (req, ctx) => {
    // ctx.user will be null
    return NextResponse.json({ status: 'healthy' });
  },
  { requireAuth: false }
);
```

---

## Pagination & Filtering

### Pagination Parameters
```
GET /api/jobs?page=1&limit=20

Query params:
- page: Page number (1-based, default: 1)
- limit: Items per page (default: 20, max: 100)
```

### Pagination Response
```typescript
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

### Pagination Helper
```typescript
// src/lib/api/middleware.ts
export function getPaginationParams(req: NextRequest) {
  const url = req.nextUrl;
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}
```

### Filtering & Sorting
```
GET /api/jobs?status=active&sort=-createdAt&search=kitchen

Query params:
- status: Filter by status
- sort: Sort field (prefix with - for descending)
- search: Full-text search
- startDate, endDate: Date range filters
```

```typescript
// Extract filter params
export function getFilterParams(req: NextRequest) {
  const url = req.nextUrl;

  return {
    status: url.searchParams.get('status'),
    search: url.searchParams.get('search'),
    sortField: url.searchParams.get('sort')?.replace('-', '') || 'createdAt',
    sortOrder: url.searchParams.get('sort')?.startsWith('-') ? 'desc' : 'asc',
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
  };
}
```

---

## Rate Limiting

### Rate Limit Tiers
```typescript
// src/lib/rate-limit/index.ts
export const RATE_LIMITS = {
  // Authentication endpoints - strict
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 10,
  },
  // Standard API endpoints
  api: {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 100,
  },
  // Heavy operations (exports, reports)
  heavy: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  // Search endpoints
  search: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
  // Company-wide aggregate limit
  companyAggregate: {
    windowMs: 60 * 1000,
    maxRequests: 1000,
  },
};
```

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Using Rate Limits
```typescript
export const POST = createApiHandler(
  async (req, ctx) => { ... },
  { rateLimit: 'heavy' }  // Apply heavy rate limit
);
```

---

## Validation

### Request Validation with Zod
```typescript
import { z } from 'zod';

// Define schema
const createJobSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  clientId: z.string().uuid('Invalid client ID'),
  address: z.string().min(1, 'Address is required'),
  startDate: z.string().datetime().optional(),
  contractAmount: z.number().positive().optional(),
  status: z.enum(['draft', 'active', 'on_hold', 'complete']).default('draft'),
});

type CreateJobInput = z.infer<typeof createJobSchema>;

// Validate in handler
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validatedData = createJobSchema.parse(body);  // Throws ZodError if invalid

  // Use validatedData...
}
```

### Common Validation Patterns
```typescript
// UUID
z.string().uuid()

// Email
z.string().email()

// URL
z.string().url()

// Date string
z.string().datetime()  // ISO 8601

// Enum
z.enum(['draft', 'active', 'complete'])

// Optional with default
z.string().optional().default('default value')

// Number ranges
z.number().min(0).max(100)
z.number().positive()

// Array with limits
z.array(z.string()).min(1).max(10)

// Nested object
z.object({
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}$/),
  }),
})
```

### Validation Middleware
```typescript
// Reusable validation wrapper
export function withValidation<T>(schema: z.Schema<T>) {
  return async (req: NextRequest): Promise<T> => {
    const body = await req.json();
    return schema.parse(body);
  };
}

// Usage
export const POST = createApiHandler(async (req, ctx) => {
  const data = await withValidation(createJobSchema)(req);
  // data is typed and validated
});
```

---

## API Route Implementation

### Complete Route Example
```typescript
// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, getPaginationParams, paginatedResponse } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';
import { NotFoundError, ValidationError } from '@/lib/errors';

// Validation schemas
const createJobSchema = z.object({
  name: z.string().min(1).max(200),
  clientId: z.string().uuid(),
  address: z.string().min(1),
  startDate: z.string().datetime().optional(),
  contractAmount: z.number().positive().optional(),
});

// GET /api/jobs - List jobs
export const GET = createApiHandler(
  async (req, ctx) => {
    const { companyId } = ctx;
    const { page, limit, offset } = getPaginationParams(req);
    const status = req.nextUrl.searchParams.get('status');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('jobs')
      .select('*, client:clients(id, name)', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json(
      paginatedResponse(data || [], count || 0, page, limit)
    );
  },
  {
    rateLimit: 'api',
    requiredRoles: ['admin', 'manager', 'member', 'viewer'],
  }
);

// POST /api/jobs - Create job
export const POST = createApiHandler(
  async (req, ctx) => {
    const { user, companyId } = ctx;
    const body = await req.json();

    // Validate
    const validatedData = createJobSchema.parse(body);

    const supabase = await createClient();

    // Verify client belongs to company
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', validatedData.clientId)
      .eq('company_id', companyId)
      .single();

    if (!client) {
      throw new NotFoundError('Client');
    }

    // Create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        company_id: companyId,
        created_by: user!.id,
        ...validatedData,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { data: job, message: 'Job created successfully' },
      { status: 201 }
    );
  },
  {
    rateLimit: 'api',
    requiredRoles: ['admin', 'manager'],
    auditAction: 'jobs.create',
  }
);
```

### Single Resource Route
```typescript
// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api/middleware';
import { NotFoundError } from '@/lib/errors';

// GET /api/jobs/[id]
export const GET = createApiHandler(
  async (req, ctx) => {
    const { companyId } = ctx;
    const id = req.nextUrl.pathname.split('/').pop();

    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, client:clients(*), items:job_line_items(*)')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (error || !job) {
      throw new NotFoundError('Job');
    }

    return NextResponse.json({ data: job });
  }
);

// PATCH /api/jobs/[id]
export const PATCH = createApiHandler(
  async (req, ctx) => {
    const { user, companyId } = ctx;
    const id = req.nextUrl.pathname.split('/').pop();
    const body = await req.json();

    const validatedData = updateJobSchema.parse(body);

    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        ...validatedData,
        updated_by: user!.id,
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error || !job) {
      throw new NotFoundError('Job');
    }

    return NextResponse.json({ data: job });
  },
  {
    requiredRoles: ['admin', 'manager'],
    auditAction: 'jobs.update',
  }
);

// DELETE /api/jobs/[id]
export const DELETE = createApiHandler(
  async (req, ctx) => {
    const { companyId } = ctx;
    const id = req.nextUrl.pathname.split('/').pop();

    const supabase = await createClient();

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  },
  {
    requiredRoles: ['admin'],
    auditAction: 'jobs.delete',
  }
);
```

---

## API Documentation

### Document Every Endpoint
```typescript
/**
 * @api {get} /api/jobs List Jobs
 * @apiName ListJobs
 * @apiGroup Jobs
 * @apiPermission admin, manager, member, viewer
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=20] Items per page (max 100)
 * @apiQuery {String} [status] Filter by status
 * @apiQuery {String} [search] Search in name/address
 *
 * @apiSuccess {Object[]} data List of jobs
 * @apiSuccess {Object} pagination Pagination info
 *
 * @apiError 401 Unauthorized
 * @apiError 429 Rate limit exceeded
 */
export const GET = createApiHandler(async (req, ctx) => { ... });
```
