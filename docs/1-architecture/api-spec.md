# API Specification

## Proven Patterns from v1

### Middleware Stack (Proven)
Applied in order:
1. Security headers (CSP, HSTS, X-Frame-Options)
2. Input sanitization (deep recursive HTML tag removal)
3. SQL injection detection (blocks with 400)
4. Body size limits (10MB JSON, 1MB text)
5. Rate limiting per route type: apiLimiter (100/min), authLimiter (10/min), uploadLimiter (20/min), aiLimiter (10/min)
6. Auth middleware (requireAuth / optionalAuth)
7. Zod validation via validate(schemas) middleware
8. asyncHandler wrapper on all async routes

### Error Response Format (Proven)
AppError class with: code, message, details, status, retry, retryAfter, timestamp
~25 error types: UNAUTHORIZED, VALIDATION_FAILED, ENTITY_LOCKED, DUPLICATE_DETECTED, etc.
Helper creators: validationError(), transitionError(), duplicateError(), lockedError(), notFoundError()
Production: sanitizes 500-level errors (hides internal details)

### Entity Locking (Proven)
- acquireLock(entityType, entityId, lockedBy) - 5 min default
- Owner can refresh their own lock
- Realtime broadcast on lock changes
- forceReleaseLock() for admin override

### Undo/Redo (Proven)
- createUndoSnapshot() before changes - 30 sec window
- One active undo per entity
- Approval undo reverses budget updates + clears PDF stamp
- Side effects: restoreInvoice(), restoreAllocations(), reverseBudgetUpdates()

### Realtime (Proven)
- SSE with MAX_SSE_CLIENTS=4 (Chrome connection limit)
- Heartbeat prevents browser timeout
- Supabase Realtime subscriptions on key tables
- broadcastExcept() excludes sender to avoid echo

---

## Overview

RossOS exposes a RESTful JSON API for all client-server communication. Every request (except authentication routes) must include a valid Supabase JWT in the `Authorization` header as a Bearer token.

- **Protocol**: HTTPS
- **Content-Type**: `application/json` for request and response bodies
- **Authentication**: Supabase JWT passed via `Authorization: Bearer <token>`
- **Authorization**: Row Level Security (RLS) enforced at the database layer; all data is scoped to the authenticated user's `company_id`

---

## Standard Response Format

All successful responses follow this structure:

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 142
  }
}
```

Single-resource responses omit the `meta` field:

```json
{
  "data": { ... }
}
```

---

## Standard Error Codes

| HTTP Status | Meaning | When Used |
|-------------|---------|-----------|
| `400` | Bad Request | Validation error, malformed input |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Valid JWT but insufficient permissions |
| `404` | Not Found | Resource does not exist or is not accessible |
| `409` | Conflict | Duplicate resource or constraint violation |
| `422` | Unprocessable Entity | Semantically invalid input |
| `500` | Internal Server Error | Unexpected server failure |

Error response body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": {}
  }
}
```

---

## Pagination

List endpoints support cursor/offset pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-based) |
| `pageSize` | integer | `25` | Items per page (max 100) |
| `sort` | string | varies | Sort field name |
| `order` | string | `asc` | Sort direction: `asc` or `desc` |

List endpoints also support filtering and searching via additional query parameters specific to each resource.

---

## Endpoints by Module

### 1. Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/signup` | POST | Register new user |
| `/auth/login` | POST | Login with email/password |
| `/auth/logout` | POST | Logout current session |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password` | POST | Reset password with token |
| `/auth/me` | GET | Get current user |

---

### 2. Jobs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs` | GET | List jobs (with filters) |
| `/jobs` | POST | Create job |
| `/jobs/:id` | GET | Get job details |
| `/jobs/:id` | PATCH | Update job |
| `/jobs/:id` | DELETE | Archive job |
| `/jobs/:id/budget` | GET | Get job budget |
| `/jobs/:id/financial-summary` | GET | Get financial overview |

---

### 3. Vendors

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/vendors` | GET | List vendors |
| `/vendors` | POST | Create vendor |
| `/vendors/:id` | GET | Get vendor |
| `/vendors/:id` | PATCH | Update vendor |
| `/vendors/:id/invoices` | GET | Vendor's invoices |

---

### 4. Clients

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/clients` | GET | List clients |
| `/clients` | POST | Create client |
| `/clients/:id` | GET | Get client |
| `/clients/:id` | PATCH | Update client |
| `/clients/:id/jobs` | GET | Client's jobs |

---

### 5. Cost Codes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cost-codes` | GET | List cost codes |
| `/cost-codes` | POST | Create cost code |
| `/cost-codes/:id` | PATCH | Update cost code |
| `/cost-codes/import` | POST | Import from template |

---

### 6. Invoices

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/invoices` | GET | List invoices |
| `/invoices` | POST | Create invoice |
| `/invoices/:id` | GET | Get invoice |
| `/invoices/:id` | PATCH | Update invoice |
| `/invoices/:id/allocations` | GET | Get allocations |
| `/invoices/:id/allocations` | PUT | Set allocations |
| `/invoices/:id/approve` | POST | Approve invoice |
| `/invoices/:id/pay` | POST | Mark as paid |
| `/invoices/upload` | POST | Upload PDF for AI processing |

---

### 7. Purchase Orders

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/purchase-orders` | GET | List POs |
| `/purchase-orders` | POST | Create PO |
| `/purchase-orders/:id` | GET | Get PO |
| `/purchase-orders/:id` | PATCH | Update PO |
| `/purchase-orders/:id/send` | POST | Send to vendor |

---

### 8. Draws

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/draws` | GET | List draws |
| `/draws` | POST | Create draw |
| `/draws/:id` | GET | Get draw |
| `/draws/:id` | PATCH | Update draw |
| `/draws/:id/submit` | POST | Submit to client |
| `/draws/:id/approve` | POST | Approve draw |
| `/draws/:id/pdf` | GET | Generate G702/G703 PDF |

---

### 9. Change Orders

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/change-orders` | GET | List change orders |
| `/change-orders` | POST | Create change order |
| `/change-orders/:id` | GET | Get change order |
| `/change-orders/:id` | PATCH | Update change order |
| `/change-orders/:id/approve` | POST | Approve CO |

---

### 10. Leads

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/leads` | GET | List leads |
| `/leads` | POST | Create lead |
| `/leads/:id` | GET | Get lead |
| `/leads/:id` | PATCH | Update lead |
| `/leads/:id/convert` | POST | Convert to job |

---

### 11. Estimates

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/estimates` | GET | List estimates |
| `/estimates` | POST | Create estimate |
| `/estimates/:id` | GET | Get estimate |
| `/estimates/:id` | PATCH | Update estimate |
| `/estimates/:id/lines` | GET | Get estimate lines |
| `/estimates/:id/lines` | POST | Add line |
| `/estimates/:id/lines/:lineId` | PATCH | Update line |
| `/estimates/:id/duplicate` | POST | Duplicate estimate |
| `/estimates/:id/to-budget` | POST | Create budget from estimate |

---

### 12. Proposals

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/proposals` | GET | List proposals |
| `/proposals` | POST | Create proposal |
| `/proposals/:id` | GET | Get proposal |
| `/proposals/:id/send` | POST | Send to client |
| `/proposals/:id/pdf` | GET | Generate PDF |

---

### 13. Contracts

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/contracts` | GET | List contracts |
| `/contracts` | POST | Create contract |
| `/contracts/:id` | GET | Get contract |
| `/contracts/:id/sign` | POST | Record signature |

---

### 14. Selections

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/selections` | GET | List job selections |
| `/jobs/:id/selections` | POST | Create selection |
| `/selections/:id` | PATCH | Update selection |
| `/selections/:id/select` | POST | Record client selection |

---

### 15. Tasks (Schedule)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/tasks` | GET | List job tasks |
| `/jobs/:id/tasks` | POST | Create task |
| `/tasks/:id` | GET | Get task |
| `/tasks/:id` | PATCH | Update task |
| `/tasks/:id/complete` | POST | Mark complete |

---

### 16. Daily Logs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/daily-logs` | GET | List job logs |
| `/jobs/:id/daily-logs` | POST | Create log |
| `/daily-logs/:id` | GET | Get log |
| `/daily-logs/:id` | PATCH | Update log |
| `/daily-logs/:id/labor` | POST | Add labor entry |

---

### 17. Photos

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/photos` | GET | List job photos |
| `/jobs/:id/photos` | POST | Upload photo |
| `/photos/:id` | GET | Get photo |
| `/photos/:id` | PATCH | Update caption |
| `/photos/:id` | DELETE | Delete photo |

---

### 18. Punch Lists

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/punch-list` | GET | Get punch list |
| `/jobs/:id/punch-list/items` | GET | List punch items |
| `/jobs/:id/punch-list/items` | POST | Add punch item |
| `/punch-items/:id` | PATCH | Update item |
| `/punch-items/:id/complete` | POST | Mark complete |

---

### 19. Warranties

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/warranties` | GET | List warranties |
| `/jobs/:id/warranties` | POST | Add warranty |
| `/warranties/:id` | PATCH | Update warranty |

---

### 20. Reports & Analytics

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/reports/profitability` | GET | Job profitability report |
| `/reports/budget-variance` | GET | Budget vs actual |
| `/reports/cash-flow` | GET | Cash flow projection |
| `/reports/pnl` | GET | Company P&L |

---

### 21. QuickBooks Integration

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/integrations/quickbooks/connect` | GET | Initiate OAuth |
| `/integrations/quickbooks/callback` | GET | OAuth callback |
| `/integrations/quickbooks/disconnect` | POST | Disconnect |
| `/integrations/quickbooks/sync` | POST | Trigger sync |
| `/integrations/quickbooks/status` | GET | Sync status |

---

### 22. AI Processing

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai/process-invoice` | POST | Extract data from invoice PDF |
| `/ai/match-vendor` | POST | Find matching vendor |
| `/ai/suggest-allocations` | POST | Suggest cost code allocations |

---

## Rate Limiting

> **TODO**: Define rate limiting strategy. Considerations:
> - Per-user and per-IP limits
> - Stricter limits on AI processing and file upload endpoints
> - Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## API Versioning

> **TODO**: Define API versioning strategy. Considerations:
> - URL prefix versioning (e.g., `/api/v1/...`) vs. header-based versioning
> - Deprecation policy and sunset headers
> - Backward compatibility guarantees
