# Project Context - RossOS

> **IMPORTANT**: Read this file at the START of every session to restore context.
> Update this file at the END of every session or after completing a phase.

## Project Overview

**Name**: RossOS - Construction Management SaaS
**Goal**: Multi-tenant platform for 10,000+ companies, 1,000,000+ users
**Stack**: Next.js 16, React 19, Supabase, TypeScript, Tailwind CSS

## Current State

### Active Milestone
```
Version: v1.0 MVP
Status: In Development
```

### Last Completed Work
```
Date: 2024-02-12
Phase: Infrastructure Setup
Summary:
- Created 78 skeleton pages with UI Preview tabs
- Set up scalability infrastructure (RLS, caching, rate limiting, job queue)
- Created comprehensive development standards documentation
- Applied database migrations to Supabase
```

### Next Up
```
Priority: Build out core features
Next Phase: TBD - Need to define MVP feature roadmap
Blockers: None
```

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Supabase (Postgres) | RLS for multi-tenancy, real-time, auth built-in |
| Caching | Vercel KV + in-memory fallback | Edge-compatible, tenant isolation |
| Auth | Supabase Auth | Integrated with RLS policies |
| Styling | Tailwind + shadcn/ui | Consistent, fast development |
| State | React Query | Server state caching, optimistic updates |

## Multi-Tenancy Pattern

Every tenant table has:
- `company_id UUID NOT NULL REFERENCES companies(id)`
- RLS policy: `USING (company_id = get_current_company_id())`
- Index on `company_id`

## File Locations

| Purpose | Location |
|---------|----------|
| Pages | `src/app/(dashboard)/` |
| Skeleton Pages | `src/app/(skeleton)/skeleton/` |
| API Routes | `src/app/api/` |
| Components | `src/components/` |
| Hooks | `src/hooks/` |
| Utilities | `src/lib/` |
| Types | `src/types/` |
| Migrations | `supabase/migrations/` |
| Docs | `docs/` |

## Database Tables (Current)

```
companies     - Tenant/organization accounts
users         - User accounts (linked to company)
clients       - Customer records per company
jobs          - Construction projects
vendors       - Supplier/subcontractor records
invoices      - Financial invoices
draws         - Payment draw requests
job_queue     - Background job processing
audit_log     - Audit trail for sensitive actions
api_metrics   - API performance tracking
```

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
KV_REST_API_URL (optional)
KV_REST_API_TOKEN (optional)
CRON_SECRET
```

## Quick Commands

```bash
npm run dev          # Start development
npm run build        # Production build
npm run lint         # Check code quality
npm run validate     # Full validation
npm run db:generate  # Regenerate Supabase types
```

---

## Session Log

### 2024-02-12 Session
- Added UI Preview tabs to 78 skeleton pages
- Fixed job navigation dropdown issue
- Created scalability infrastructure
- Created development standards documentation
- Set up ESLint/Prettier configurations

---

*Last Updated: 2024-02-12*
