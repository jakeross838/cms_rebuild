# Architecture Decisions Log

> Record of significant technical decisions made during development.
> Each entry explains the context, options, and rationale.

---

## 2024-02-12 - Multi-Tenant Data Isolation Strategy

**Context**: Need to support 10,000+ companies with complete data isolation.

**Options Considered**:
1. Separate databases per tenant - Maximum isolation but expensive/complex
2. Separate schemas per tenant - Good isolation, moderate complexity
3. Shared tables with `company_id` + RLS - Simpler, relies on Postgres security

**Decision**: Shared tables with `company_id` column and Row Level Security (RLS)

**Rationale**:
- Supabase RLS is battle-tested and enforced at database level
- Simpler deployment and maintenance
- Easier cross-tenant queries for admin/analytics if needed
- Lower infrastructure cost
- Can always migrate to schemas later if needed

**Consequences**:
- Every tenant table MUST have `company_id`
- RLS policies required on all tenant tables
- All queries should include `company_id` filter even with RLS (defense in depth)
- Need `get_current_company_id()` helper function

---

## 2024-02-12 - Caching Strategy

**Context**: Need fast, scalable caching for multi-tenant environment.

**Options Considered**:
1. Redis (self-hosted) - Full control, more ops overhead
2. Vercel KV (managed Redis) - Zero ops, integrates with Vercel
3. In-memory only - Simple but lost on restart, no sharing between instances

**Decision**: Vercel KV as primary with in-memory fallback

**Rationale**:
- Vercel KV is managed, scales automatically
- In-memory fallback allows development without KV setup
- Graceful degradation if KV has issues
- Tenant-isolated cache keys prevent data leakage

**Consequences**:
- Cache keys must include `company_id`
- Need `KV_REST_API_URL` and `KV_REST_API_TOKEN` for production
- Development works without KV (uses in-memory)

---

## 2024-02-12 - API Middleware Architecture

**Context**: Need consistent auth, rate limiting, and monitoring across all API endpoints.

**Options Considered**:
1. Next.js middleware.ts - Runs on edge, limited capabilities
2. Per-route middleware - Flexible but repetitive
3. Wrapper function (createApiHandler) - Consistent, composable

**Decision**: `createApiHandler` wrapper function

**Rationale**:
- Single point for auth, rate limiting, metrics, audit
- Strongly typed context passed to handlers
- Easy to add new middleware features
- Clear options per endpoint (roles, rate limit tier, etc.)

**Consequences**:
- All API routes should use `createApiHandler`
- Context object provides `user`, `companyId`, `requestId`
- Options configure behavior per endpoint

---

## 2024-02-12 - Background Job Processing

**Context**: Need async job processing for emails, heavy computations, etc.

**Options Considered**:
1. External queue (SQS, RabbitMQ) - Powerful but external dependency
2. Vercel Cron + database queue - Simple, self-contained
3. Trigger.dev - Managed, but another service

**Decision**: Database-backed queue with Vercel Cron processing

**Rationale**:
- No external dependencies beyond Supabase
- Vercel Cron triggers processing every minute
- Full audit trail in database
- Retry logic and dead letter queue built-in
- Can migrate to external queue later if needed

**Consequences**:
- `job_queue` table stores pending jobs
- Cron endpoint processes jobs every minute
- Jobs have priority, retry count, backoff
- Need `CRON_SECRET` for production security

---

## 2024-02-12 - Development Standards Documentation

**Context**: Project needs to scale to multiple developers with consistent patterns.

**Options Considered**:
1. Wiki/Notion - External, can drift from code
2. In-repo markdown - Lives with code, versioned
3. Comments only - Not comprehensive enough

**Decision**: Comprehensive markdown docs in `docs/` directory

**Rationale**:
- Documentation lives with code, stays in sync
- Versioned with git
- Easy to reference and update
- Enforced by ESLint/Prettier where possible

**Consequences**:
- `docs/standards/` contains all coding standards
- `docs/guides/` contains how-to guides
- Developers expected to read before contributing

---

*Add new decisions above this line*
