# Project Context - RossOS

> **IMPORTANT**: Read this file at the START of every session to restore context.
> Update this file at the END of every session or after completing a phase.

## Project Overview

**Name**: RossOS - Construction Management SaaS
**Goal**: Multi-tenant platform for 10,000+ companies, 1,000,000+ users
**Stack**: Next.js 14, React 19, Supabase, TypeScript, Tailwind CSS

## Current State

### Active Milestone
```
Version: MVP v1.0
Status: Phase 1 - Foundation & Core Data
Roadmap: docs/MVP_ROADMAP.md
```

### Last Completed Work
```
Date: 2024-02-12
Summary:
- Created 78 skeleton pages with UI Preview tabs
- Set up scalability infrastructure (RLS, caching, rate limiting, job queue)
- Created comprehensive development standards documentation
- Applied database migrations to Supabase (RossOS project)
- Set up autonomous development safeguards (.claude/ context system)
- Imported 1,320 pain points and 1,050+ connection mappings
- Created MVP roadmap with 8 phases
```

### Current Phase
```
Phase: 1 - Foundation & Core Data
Status: Ready to Begin
Goal: Auth, Companies, Users, Clients, Jobs - basic CRUD
See: .claude/CURRENT_PHASE.md for detailed tasks
```

### Next Up
```
After Phase 1: Phase 2 - Financial Management
- Budgets, Invoices, Change Orders, Draws, AIA Pay Apps
```

## MVP Roadmap Summary

| Phase | Name | Key Features | Priority |
|-------|------|--------------|----------|
| 1 | Foundation & Core Data | Auth, Users, Clients, Jobs | P0 |
| 2 | Financial Management | Budget, Invoices, COs, Draws, AIA | P0 |
| 3 | Field & Schedule | Schedule, Daily Logs, Photos, Punch | P0 |
| 4 | Selections & Design | Selections, Allowances, Designer Portal | P1 |
| 5 | Vendors & Subs | Vendor DB, Bids, Contracts, Insurance | P1 |
| 6 | Client Portal | Dashboard, Progress, Approvals | P0 |
| 7 | Reports & Analytics | Financial, Portfolio, WIP Reports | P1 |
| 8 | Documents & Communication | Docs, RFIs, Submittals, Messaging | P1 |

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Supabase (Postgres) | RLS for multi-tenancy, real-time, auth built-in |
| Caching | Vercel KV + in-memory fallback | Edge-compatible, tenant isolation |
| Auth | Supabase Auth | Integrated with RLS policies |
| Styling | Tailwind + shadcn/ui | Consistent, fast development |
| State | React Query | Server state caching, optimistic updates |
| Background Jobs | DB queue + Vercel Cron | No external dependencies |

## Multi-Tenancy Pattern

Every tenant table has:
- `company_id UUID NOT NULL REFERENCES companies(id)`
- RLS policy: `USING (company_id = get_current_company_id())`
- Index on `company_id`

## Key File Locations

| Purpose | Location |
|---------|----------|
| Main App Pages | `src/app/(dashboard)/` |
| Skeleton/Preview Pages | `src/app/(skeleton)/skeleton/` |
| API Routes | `src/app/api/` |
| Components | `src/components/` |
| Hooks | `src/hooks/` |
| Utilities | `src/lib/` |
| Types | `src/types/` |
| Migrations | `supabase/migrations/` |
| Documentation | `docs/` |
| Standards | `docs/standards/` |
| Requirements | `docs/requirements/` |
| MVP Roadmap | `docs/MVP_ROADMAP.md` |
| Context Files | `.claude/` |

## Database Tables (Current)

### Existing (from infrastructure setup)
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

### Needed for Phase 1
```
job_phases    - Project phases/milestones
contacts      - Contact information
addresses     - Address records
notes         - Notes on any entity
tags          - Tagging system
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

## Supabase Project

```
Project ID:  yprbbomuhugtgyqmrnhr
Name:        RossOS
Region:      us-east-1
```

## Quick Commands

```bash
npm run dev          # Start development
npm run build        # Production build
npm run lint         # Check code quality
npm run validate     # Full validation (lint + typecheck + test)
npm run db:generate  # Regenerate Supabase types
```

## Reference Documents

- `docs/MVP_ROADMAP.md` - Full MVP roadmap with all phases
- `docs/requirements/PAIN_POINTS.md` - 1,320 pain points to solve
- `docs/requirements/CONNECTION_MAP.md` - 1,050+ data connections
- `docs/standards/` - All coding standards
- `.claude/RULES.md` - Autonomous operation rules

---

## Session Log

### 2024-02-12 Session 2
- Imported pain points (1,320 items) and connection map (1,050+ connections)
- Created MVP roadmap with 8 phases
- Set up Phase 1 task tracking
- Ready to begin Phase 1 implementation

### 2024-02-12 Session 1
- Added UI Preview tabs to 78 skeleton pages
- Fixed job navigation dropdown issue
- Created scalability infrastructure
- Created development standards documentation
- Set up autonomous safeguards (.claude/ system)

---

*Last Updated: 2024-02-12*
