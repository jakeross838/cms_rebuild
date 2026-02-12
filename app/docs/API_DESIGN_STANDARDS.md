# RossOS API Design Standards

> Comprehensive guide for designing consistent, secure, and developer-friendly APIs.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Versioning Strategy](#versioning-strategy)
3. [Authentication & Authorization](#authentication--authorization)
4. [Request Standards](#request-standards)
5. [Response Standards](#response-standards)
6. [Pagination](#pagination)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [OpenAPI Specification](#openapi-specification)
10. [API Route Examples](#api-route-examples)

---

## API Architecture

### Route Structure

```
/api/v1/                    # Versioned public API
  ├── auth/                 # Authentication endpoints
  ├── companies/            # Company management
  ├── users/                # User management
  ├── jobs/                 # Jobs (projects)
  ├── clients/              # Client management
  ├── vendors/              # Vendor management
  ├── invoices/             # Invoice management
  ├── documents/            # Document management
  └── webhooks/             # Webhook management

/api/internal/              # Internal (non-versioned) endpoints
  ├── health/               # Health checks
  ├── cron/                 # Cron job triggers
  └── admin/                # Admin-only operations
```

### HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resource(s) | Yes |
| POST | Create resource | No |
| PUT | Replace entire resource | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

### Base Types

```typescript
// src/types/api.ts

export interface APIResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    [key: string]: any;
  };
}

export interface APIListResponse<T> {
  data: T[];
  meta: {
    timestamp: string;
    requestId: string;
    pagination: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId: string;
    timestamp: string;
  };
}

export type APIResult<T> = APIResponse<T> | APIError;
```

---

## Versioning Strategy

### URL-Based Versioning

```
https://api.rossos.com/v1/jobs
https://api.rossos.com/v2/jobs  (future)
```

### Version Header (Alternative)

```
GET /api/jobs
Accept: application/vnd.rossos.v1+json
```

### Versioning Implementation

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Extract version from URL
  const versionMatch = pathname.match(/^\/api\/v(\d+)\//);

  if (versionMatch) {
    const version = parseInt(versionMatch[1]);

    // Check supported versions
    const supportedVersions = [1]; // Add more as needed

    if (!supportedVersions.includes(version)) {
      return NextResponse.json(
        {
          error: {
            code: 'UNSUPPORTED_VERSION',
            message: `API version ${version} is not supported. Supported versions: ${supportedVersions.join(', ')}`,
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Add version to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-api-version', String(version));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Deprecation Policy

```typescript
// src/lib/api/deprecation.ts
import { NextResponse } from 'next/server';

interface DeprecationInfo {
  deprecatedAt: string;
  sunsetAt: string;
  replacement?: string;
}

const deprecatedEndpoints: Record<string, DeprecationInfo> = {
  '/api/v1/jobs/list': {
    deprecatedAt: '2024-06-01',
    sunsetAt: '2024-12-01',
    replacement: '/api/v1/jobs',
  },
};

export function addDeprecationHeaders(
  response: NextResponse,
  pathname: string
): NextResponse {
  const deprecation = deprecatedEndpoints[pathname];

  if (deprecation) {
    response.headers.set('Deprecation', deprecation.deprecatedAt);
    response.headers.set('Sunset', deprecation.sunsetAt);

    if (deprecation.replacement) {
      response.headers.set(
        'Link',
        `<${deprecation.replacement}>; rel="successor-version"`
      );
    }
  }

  return response;
}
```

---

## Authentication & Authorization

### Authentication Methods

#### 1. Session-Based (Web App)

```typescript
// src/lib/api/auth.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile with company
  const { data: profile } = await supabase
    .from('users')
    .select('*, company:companies(*)')
    .eq('auth_id', user.id)
    .single();

  return profile;
}
```

#### 2. API Key (External Integrations)

```typescript
// src/lib/api/api-keys.ts
import { createServiceClient } from '@/lib/supabase/service';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

interface APIKeyValidation {
  valid: boolean;
  companyId?: string;
  permissions?: string[];
  rateLimit?: number;
}

export async function validateAPIKey(request: NextRequest): Promise<APIKeyValidation> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer sk_')) {
    return { valid: false };
  }

  const apiKey = authHeader.replace('Bearer ', '');

  // Hash the key for lookup (keys stored as hashes)
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const supabase = createServiceClient();
  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('active', true)
    .single();

  if (!keyRecord) {
    return { valid: false };
  }

  // Check expiration
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return { valid: false };
  }

  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyRecord.id);

  return {
    valid: true,
    companyId: keyRecord.company_id,
    permissions: keyRecord.permissions,
    rateLimit: keyRecord.rate_limit,
  };
}
```

#### 3. JWT for Mobile/SPA

```typescript
// src/lib/api/jwt.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string; // user id
  company_id: string;
  role: string;
  permissions: string[];
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m',
    issuer: 'rossos',
    audience: 'rossos-api',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: 'rossos',
      audience: 'rossos-api',
    }) as TokenPayload;
  } catch {
    return null;
  }
}
```

### Authorization Middleware

```typescript
// src/lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from './auth';
import { validateAPIKey } from './api-keys';
import { verifyAccessToken } from './jwt';

export type Permission =
  | 'jobs:read'
  | 'jobs:write'
  | 'jobs:delete'
  | 'invoices:read'
  | 'invoices:write'
  | 'invoices:delete'
  | 'users:read'
  | 'users:write'
  | 'settings:manage';

interface AuthContext {
  userId: string;
  companyId: string;
  permissions: Permission[];
}

export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  requiredPermissions: Permission[] = []
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();

    // Try multiple auth methods
    let authContext: AuthContext | null = null;

    // 1. Session auth (web app)
    const user = await getAuthenticatedUser(request);
    if (user) {
      authContext = {
        userId: user.id,
        companyId: user.company_id,
        permissions: user.permissions || [],
      };
    }

    // 2. API Key auth
    if (!authContext) {
      const apiKeyResult = await validateAPIKey(request);
      if (apiKeyResult.valid) {
        authContext = {
          userId: 'api-key',
          companyId: apiKeyResult.companyId!,
          permissions: apiKeyResult.permissions as Permission[] || [],
        };
      }
    }

    // 3. JWT auth
    if (!authContext) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ey')) {
        const token = authHeader.replace('Bearer ', '');
        const payload = verifyAccessToken(token);
        if (payload) {
          authContext = {
            userId: payload.sub,
            companyId: payload.company_id,
            permissions: payload.permissions as Permission[],
          };
        }
      }
    }

    // No valid auth found
    if (!authContext) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            requestId,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(
        (p) => authContext!.permissions.includes(p)
      );

      if (!hasAllPermissions) {
        return NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: 'Insufficient permissions',
              requestId,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 403 }
        );
      }
    }

    // Call handler with auth context
    try {
      const response = await handler(request, authContext);
      response.headers.set('X-Request-ID', requestId);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            requestId,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  };
}
```

---

## Request Standards

### Query Parameters

```typescript
// Standard query parameters for list endpoints
interface ListQueryParams {
  // Pagination
  page?: number;           // Page number (1-indexed)
  pageSize?: number;       // Items per page (default: 20, max: 100)

  // Sorting
  sortBy?: string;         // Field to sort by
  sortOrder?: 'asc' | 'desc';

  // Filtering
  search?: string;         // Full-text search
  status?: string;         // Filter by status
  createdAfter?: string;   // ISO date
  createdBefore?: string;  // ISO date

  // Field selection
  fields?: string;         // Comma-separated list of fields to include
  expand?: string;         // Comma-separated relations to expand
}
```

### Query Parameter Parser

```typescript
// src/lib/api/query-parser.ts
import { NextRequest } from 'next/server';

export interface ParsedQuery {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  filters: Record<string, any>;
  fields?: string[];
  expand?: string[];
}

export function parseListQuery(request: NextRequest, defaults: {
  sortBy?: string;
  pageSize?: number;
} = {}): ParsedQuery {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('pageSize') || String(defaults.pageSize || 20)))
  );

  const sortBy = searchParams.get('sortBy') || defaults.sortBy || 'created_at';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  const search = searchParams.get('search') || undefined;

  const fields = searchParams.get('fields')?.split(',').map(f => f.trim());
  const expand = searchParams.get('expand')?.split(',').map(e => e.trim());

  // Collect all other params as filters
  const filters: Record<string, any> = {};
  const reservedParams = ['page', 'pageSize', 'sortBy', 'sortOrder', 'search', 'fields', 'expand'];

  searchParams.forEach((value, key) => {
    if (!reservedParams.includes(key)) {
      // Handle array values (e.g., status[]=draft&status[]=pending)
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        filters[baseKey] = filters[baseKey] || [];
        filters[baseKey].push(value);
      } else {
        filters[key] = value;
      }
    }
  });

  return { page, pageSize, sortBy, sortOrder, search, filters, fields, expand };
}
```

### Request Body Validation

```typescript
// src/lib/api/validation.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: NextRequest): Promise<{
    success: true;
    data: z.infer<T>;
  } | {
    success: false;
    response: NextResponse;
  }> => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        const errors: Record<string, string[]> = {};

        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = errors[path] || [];
          errors[path].push(issue.message);
        });

        return {
          success: false,
          response: NextResponse.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: errors,
                requestId: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
              },
            },
            { status: 400 }
          ),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: {
              code: 'INVALID_JSON',
              message: 'Request body must be valid JSON',
              requestId: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        ),
      };
    }
  };
}

// Example schemas
export const CreateJobSchema = z.object({
  name: z.string().min(1).max(255),
  client_id: z.string().uuid(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  }),
  start_date: z.string().datetime().optional(),
  estimated_end_date: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  job_type: z.enum(['new_construction', 'renovation', 'addition', 'remodel']).optional(),
});

export const UpdateJobSchema = CreateJobSchema.partial();
```

---

## Response Standards

### Success Responses

```typescript
// src/lib/api/responses.ts
import { NextResponse } from 'next/server';

export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    },
    { status }
  );
}

export function created<T>(data: T, location?: string): NextResponse {
  const response = success(data, 201);

  if (location) {
    response.headers.set('Location', location);
  }

  return response;
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function list<T>(
  items: T[],
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  }
): NextResponse {
  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  return NextResponse.json({
    data: items,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalCount: pagination.totalCount,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
      },
    },
  });
}
```

### Response Field Selection

```typescript
// src/lib/api/field-selection.ts

export function selectFields<T extends Record<string, any>>(
  data: T,
  fields?: string[]
): Partial<T> {
  if (!fields || fields.length === 0) {
    return data;
  }

  const result: Partial<T> = {};

  for (const field of fields) {
    if (field.includes('.')) {
      // Handle nested fields (e.g., 'client.name')
      const [parent, ...rest] = field.split('.');
      if (data[parent] && typeof data[parent] === 'object') {
        result[parent as keyof T] = result[parent as keyof T] || ({} as any);
        const nested = selectFields(data[parent], [rest.join('.')]);
        Object.assign(result[parent as keyof T] as object, nested);
      }
    } else if (field in data) {
      result[field as keyof T] = data[field];
    }
  }

  return result;
}

export function selectFieldsArray<T extends Record<string, any>>(
  data: T[],
  fields?: string[]
): Partial<T>[] {
  return data.map((item) => selectFields(item, fields));
}
```

### HATEOAS Links (Optional)

```typescript
// src/lib/api/links.ts

interface Link {
  href: string;
  rel: string;
  method?: string;
}

export function addLinks<T extends { id: string }>(
  data: T,
  baseUrl: string,
  resourceType: string
): T & { _links: Link[] } {
  return {
    ...data,
    _links: [
      { href: `${baseUrl}/${resourceType}/${data.id}`, rel: 'self', method: 'GET' },
      { href: `${baseUrl}/${resourceType}/${data.id}`, rel: 'update', method: 'PATCH' },
      { href: `${baseUrl}/${resourceType}/${data.id}`, rel: 'delete', method: 'DELETE' },
    ],
  };
}
```

---

## Pagination

### Offset Pagination (Default)

```typescript
// src/lib/api/pagination.ts
import { SupabaseClient } from '@supabase/supabase-js';

interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export async function paginatedQuery<T>(
  query: any, // Supabase query builder
  options: PaginationOptions
): Promise<{
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
}> {
  const { page, pageSize, sortBy, sortOrder } = options;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countQuery = query;
  const { count } = await countQuery.select('*', { count: 'exact', head: true });

  // Get paginated data
  const { data, error } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
    },
  };
}
```

### Cursor Pagination (For Large Datasets)

```typescript
// src/lib/api/cursor-pagination.ts

interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function cursorPaginatedQuery<T extends { id: string }>(
  query: any,
  options: CursorPaginationOptions
): Promise<CursorPaginatedResult<T>> {
  const { cursor, limit, sortBy, sortOrder } = options;

  // Decode cursor
  let cursorValue: any = null;
  let cursorId: string | null = null;

  if (cursor) {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
    cursorValue = decoded.value;
    cursorId = decoded.id;
  }

  // Build query with cursor
  let paginatedQuery = query;

  if (cursorValue !== null) {
    const operator = sortOrder === 'asc' ? 'gt' : 'lt';
    paginatedQuery = paginatedQuery.or(
      `${sortBy}.${operator}.${cursorValue},and(${sortBy}.eq.${cursorValue},id.${operator}.${cursorId})`
    );
  }

  const { data, error } = await paginatedQuery
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .order('id', { ascending: sortOrder === 'asc' })
    .limit(limit + 1); // Fetch one extra to check if there's more

  if (error) throw error;

  const hasMore = (data?.length || 0) > limit;
  const items = hasMore ? data!.slice(0, limit) : (data || []);

  // Generate next cursor
  let nextCursor: string | undefined;
  if (hasMore && items.length > 0) {
    const lastItem = items[items.length - 1];
    nextCursor = Buffer.from(
      JSON.stringify({ value: lastItem[sortBy], id: lastItem.id })
    ).toString('base64');
  }

  return {
    data: items,
    nextCursor,
    hasMore,
  };
}
```

---

## Error Handling

### Error Codes

```typescript
// src/lib/api/errors.ts

export const ErrorCodes = {
  // Authentication (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Not Found (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Validation (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_JSON: 'INVALID_JSON',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  MISSING_PARAMETER: 'MISSING_PARAMETER',

  // Conflict (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // Rate Limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',

  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Unavailable (503)
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

### Error Response Factory

```typescript
// src/lib/api/error-responses.ts
import { NextResponse } from 'next/server';
import { ErrorCode, ErrorCodes } from './errors';

interface ErrorOptions {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

export function errorResponse(options: ErrorOptions): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: options.code,
        message: options.message,
        details: options.details,
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    },
    { status: options.status }
  );
}

// Pre-built error responses
export const errors = {
  unauthorized: (message = 'Authentication required') =>
    errorResponse({
      code: ErrorCodes.UNAUTHORIZED,
      message,
      status: 401,
    }),

  forbidden: (message = 'Access denied') =>
    errorResponse({
      code: ErrorCodes.FORBIDDEN,
      message,
      status: 403,
    }),

  notFound: (resource = 'Resource') =>
    errorResponse({
      code: ErrorCodes.NOT_FOUND,
      message: `${resource} not found`,
      status: 404,
    }),

  validation: (details: Record<string, string[]>) =>
    errorResponse({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Validation failed',
      status: 400,
      details,
    }),

  conflict: (message: string) =>
    errorResponse({
      code: ErrorCodes.CONFLICT,
      message,
      status: 409,
    }),

  rateLimited: (retryAfter: number) => {
    const response = errorResponse({
      code: ErrorCodes.RATE_LIMITED,
      message: 'Too many requests. Please try again later.',
      status: 429,
    });
    response.headers.set('Retry-After', String(retryAfter));
    return response;
  },

  internal: (message = 'An unexpected error occurred') =>
    errorResponse({
      code: ErrorCodes.INTERNAL_ERROR,
      message,
      status: 500,
    }),
};
```

### Error Boundary for Routes

```typescript
// src/lib/api/error-boundary.ts
import { NextRequest, NextResponse } from 'next/server';
import { errors } from './error-responses';

export function withErrorHandling(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error:', error);

      // Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message: string };

        if (supabaseError.code === 'PGRST116') {
          return errors.notFound();
        }

        if (supabaseError.code === '23505') {
          return errors.conflict('Resource already exists');
        }

        if (supabaseError.code === '42501') {
          return errors.forbidden('Access denied by row level security');
        }
      }

      // Known error types
      if (error instanceof ValidationError) {
        return errors.validation(error.details);
      }

      if (error instanceof NotFoundError) {
        return errors.notFound(error.resource);
      }

      // Generic error
      return errors.internal();
    }
  };
}

// Custom error classes
export class ValidationError extends Error {
  constructor(public details: Record<string, string[]>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(public resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
```

---

## Rate Limiting

### Rate Limiter Implementation

```typescript
// src/lib/api/rate-limiter.ts
import { kv } from '@vercel/kv';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for storage key
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export async function checkRateLimit(
  identifier: string, // IP, user ID, or API key
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix || 'rate'}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Use Redis sorted set for sliding window
    // Remove old entries
    await kv.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const currentCount = await kv.zcard(key);

    if (currentCount >= config.maxRequests) {
      // Get oldest entry to calculate retry-after
      const oldest = await kv.zrange(key, 0, 0, { withScores: true });
      const resetAt = oldest.length > 0
        ? new Date((oldest[0].score as number) + config.windowMs)
        : new Date(now + config.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: Math.ceil((resetAt.getTime() - now) / 1000),
      };
    }

    // Add current request
    await kv.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    await kv.expire(key, Math.ceil(config.windowMs / 1000));

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetAt: new Date(now + config.windowMs),
    };
  } catch (error) {
    // Fail open if rate limiter is unavailable
    console.error('Rate limiter error:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(now + config.windowMs),
    };
  }
}

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimitMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.keyPrefix || 'rate'}:${identifier}`;
  const now = Date.now();

  let entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    memoryStore.set(key, entry);
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}
```

### Rate Limiting Middleware

```typescript
// src/lib/api/rate-limit-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limiter';
import { errors } from './error-responses';

// Different limits for different endpoint types
const rateLimits = {
  default: { windowMs: 60000, maxRequests: 100 },     // 100/min
  auth: { windowMs: 60000, maxRequests: 10 },         // 10/min for auth
  heavy: { windowMs: 60000, maxRequests: 20 },        // 20/min for heavy operations
  webhook: { windowMs: 60000, maxRequests: 1000 },    // 1000/min for webhooks
};

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: keyof typeof rateLimits = 'default'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Get identifier (prefer user ID, fall back to IP)
    const userId = request.headers.get('x-user-id');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const identifier = userId || ip;

    const result = await checkRateLimit(identifier, {
      ...rateLimits[type],
      keyPrefix: type,
    });

    if (!result.allowed) {
      return errors.rateLimited(result.retryAfter!);
    }

    const response = await handler(request);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(rateLimits[type].maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

    return response;
  };
}
```

---

## OpenAPI Specification

### OpenAPI Generator

```typescript
// scripts/generate-openapi.ts
import { writeFileSync } from 'fs';

const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'RossOS API',
    version: '1.0.0',
    description: 'Construction Management Platform API',
    contact: {
      name: 'RossOS Support',
      email: 'support@rossos.com',
    },
  },
  servers: [
    {
      url: 'https://api.rossos.com/v1',
      description: 'Production',
    },
    {
      url: 'https://staging-api.rossos.com/v1',
      description: 'Staging',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'API key prefixed with "Bearer sk_"',
      },
    },
    schemas: {
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          client_id: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
          },
          address: { $ref: '#/components/schemas/Address' },
          start_date: { type: 'string', format: 'date' },
          estimated_end_date: { type: 'string', format: 'date' },
          budget: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'client_id', 'status'],
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string', minLength: 2, maxLength: 2 },
          zip: { type: 'string', pattern: '^\\d{5}(-\\d{4})?$' },
        },
        required: ['street', 'city', 'state', 'zip'],
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              requestId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
            required: ['code', 'message', 'requestId', 'timestamp'],
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalCount: { type: 'integer' },
          totalPages: { type: 'integer' },
          hasNextPage: { type: 'boolean' },
          hasPreviousPage: { type: 'boolean' },
        },
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Page number',
      },
      PageSizeParam: {
        name: 'pageSize',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        description: 'Items per page',
      },
      SortByParam: {
        name: 'sortBy',
        in: 'query',
        schema: { type: 'string' },
        description: 'Field to sort by',
      },
      SortOrderParam: {
        name: 'sortOrder',
        in: 'query',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        description: 'Sort direction',
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  paths: {
    '/jobs': {
      get: {
        summary: 'List jobs',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/PageSizeParam' },
          { $ref: '#/components/parameters/SortByParam' },
          { $ref: '#/components/parameters/SortOrderParam' },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
            },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name or address',
          },
        ],
        responses: {
          '200': {
            description: 'List of jobs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Job' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        timestamp: { type: 'string', format: 'date-time' },
                        requestId: { type: 'string' },
                        pagination: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        summary: 'Create job',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  client_id: { type: 'string', format: 'uuid' },
                  address: { $ref: '#/components/schemas/Address' },
                  start_date: { type: 'string', format: 'date' },
                  estimated_end_date: { type: 'string', format: 'date' },
                  budget: { type: 'number' },
                },
                required: ['name', 'client_id'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Job created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Job' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/jobs/{id}': {
      get: {
        summary: 'Get job by ID',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'expand',
            in: 'query',
            schema: { type: 'string' },
            description: 'Relations to expand (e.g., "client,phases")',
          },
        ],
        responses: {
          '200': {
            description: 'Job details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Job' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        summary: 'Update job',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  status: {
                    type: 'string',
                    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
                  },
                  start_date: { type: 'string', format: 'date' },
                  estimated_end_date: { type: 'string', format: 'date' },
                  budget: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated job',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Job' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        summary: 'Delete job',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Job deleted' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
  tags: [
    { name: 'Jobs', description: 'Construction job management' },
    { name: 'Clients', description: 'Client management' },
    { name: 'Invoices', description: 'Invoice management' },
    { name: 'Documents', description: 'Document management' },
  ],
};

writeFileSync('public/openapi.json', JSON.stringify(openApiSpec, null, 2));
console.log('OpenAPI spec generated at public/openapi.json');
```

---

## API Route Examples

### Complete Job Route Example

```typescript
// src/app/api/v1/jobs/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth, Permission } from '@/lib/api/middleware';
import { withRateLimit } from '@/lib/api/rate-limit-middleware';
import { withErrorHandling } from '@/lib/api/error-boundary';
import { parseListQuery } from '@/lib/api/query-parser';
import { validateBody, CreateJobSchema } from '@/lib/api/validation';
import { success, created, list } from '@/lib/api/responses';
import { errors } from '@/lib/api/error-responses';
import { paginatedQuery } from '@/lib/api/pagination';

// GET /api/v1/jobs
export const GET = withErrorHandling(
  withRateLimit(
    withAuth(async (request, { companyId }) => {
      const query = parseListQuery(request, { sortBy: 'created_at', pageSize: 20 });

      const supabase = await createClient();

      let dbQuery = supabase
        .from('jobs')
        .select('*, client:clients(id, company_name, first_name, last_name)')
        .eq('company_id', companyId);

      // Apply filters
      if (query.filters.status) {
        dbQuery = dbQuery.eq('status', query.filters.status);
      }

      if (query.search) {
        dbQuery = dbQuery.or(`name.ilike.%${query.search}%,address->street.ilike.%${query.search}%`);
      }

      if (query.filters.client_id) {
        dbQuery = dbQuery.eq('client_id', query.filters.client_id);
      }

      const { data, pagination } = await paginatedQuery(dbQuery, {
        page: query.page,
        pageSize: query.pageSize,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      return list(data, pagination);
    }, ['jobs:read'])
  )
);

// POST /api/v1/jobs
export const POST = withErrorHandling(
  withRateLimit(
    withAuth(async (request, { companyId, userId }) => {
      const validation = await validateBody(CreateJobSchema)(request);

      if (!validation.success) {
        return validation.response;
      }

      const supabase = await createClient();

      // Verify client belongs to company
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('id', validation.data.client_id)
        .eq('company_id', companyId)
        .single();

      if (!client) {
        return errors.notFound('Client');
      }

      // Create job
      const { data: job, error } = await supabase
        .from('jobs')
        .insert({
          ...validation.data,
          company_id: companyId,
          created_by: userId,
          status: 'planning',
        })
        .select()
        .single();

      if (error) throw error;

      return created(job, `/api/v1/jobs/${job.id}`);
    }, ['jobs:write'])
  )
);
```

### Job Detail Route

```typescript
// src/app/api/v1/jobs/[id]/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api/middleware';
import { withErrorHandling, NotFoundError } from '@/lib/api/error-boundary';
import { validateBody, UpdateJobSchema } from '@/lib/api/validation';
import { success, noContent } from '@/lib/api/responses';
import { selectFields } from '@/lib/api/field-selection';

interface RouteParams {
  params: { id: string };
}

// GET /api/v1/jobs/:id
export const GET = withErrorHandling(
  withAuth(async (request: NextRequest, { companyId }, { params }: RouteParams) => {
    const { searchParams } = new URL(request.url);
    const expand = searchParams.get('expand')?.split(',') || [];
    const fields = searchParams.get('fields')?.split(',');

    const supabase = await createClient();

    // Build select query based on expand
    let select = '*';
    if (expand.includes('client')) {
      select += ', client:clients(*)';
    }
    if (expand.includes('phases')) {
      select += ', phases:job_phases(*)';
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select(select)
      .eq('id', params.id)
      .eq('company_id', companyId)
      .single();

    if (error || !job) {
      throw new NotFoundError('Job');
    }

    const result = fields ? selectFields(job, fields) : job;
    return success(result);
  }, ['jobs:read'])
);

// PATCH /api/v1/jobs/:id
export const PATCH = withErrorHandling(
  withAuth(async (request: NextRequest, { companyId }, { params }: RouteParams) => {
    const validation = await validateBody(UpdateJobSchema)(request);

    if (!validation.success) {
      return validation.response;
    }

    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error || !job) {
      throw new NotFoundError('Job');
    }

    return success(job);
  }, ['jobs:write'])
);

// DELETE /api/v1/jobs/:id
export const DELETE = withErrorHandling(
  withAuth(async (request: NextRequest, { companyId }, { params }: RouteParams) => {
    const supabase = await createClient();

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', params.id)
      .eq('company_id', companyId);

    if (error) {
      throw new NotFoundError('Job');
    }

    return noContent();
  }, ['jobs:delete'])
);
```

---

## Summary

| Standard | Implementation |
|----------|---------------|
| Versioning | URL-based (`/api/v1/`) |
| Authentication | Session, API Key, JWT |
| Authorization | Permission-based middleware |
| Pagination | Offset (default), Cursor (large datasets) |
| Rate Limiting | Sliding window with Redis |
| Error Format | Consistent JSON with codes |
| Validation | Zod schemas |
| Documentation | OpenAPI 3.1 spec |

All API routes follow these standards for consistency, security, and developer experience.
