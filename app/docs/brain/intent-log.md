# Intent Log — Why We Built Each Feature
<!-- This tracks the REASONING behind every feature, pulled from conversations -->
<!-- The brain-tracker reads this to understand multi-layered logic and business rules -->
<!-- Newest entries at top -->

## How to Read This

Each entry captures:
- **Why** — The business problem this solves
- **What** — What we built to solve it
- **How** — The technical flow from user action to result
- **Rules** — Business rules and edge cases discussed
- **Connected to** — Other features this depends on or enhances

---

## Entries

### 2026-02-23 — Initial Brain Scan / Project Genesis

**Why we built this:**
Ross Built Custom Homes (Anna Maria Island, FL) needed to replace Buildertrend and consolidate all construction management into a single platform. Existing tools were fragmented, lacked the depth needed for luxury coastal construction ($1.5M-$5M+ projects), and could not be customized to match the company's workflows. The decision was made to build RossOS as a multi-tenant SaaS platform capable of serving 10,000+ companies and 1,000,000+ users, turning an internal tool into a product.

**What the user said:**
"This CMS (called RossOS) replaces Buildertrend and consolidates all construction management." The platform must handle the full lifecycle of luxury coastal construction projects — from lead capture and estimating through scheduling, budgeting, daily logs, client communication, vendor management, accounting, warranty, and beyond.

**What we built:**
A comprehensive skeleton UI with 67+ page prototypes covering the planned 52 modules across 6 build phases. The technical foundation includes:
- Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + TypeScript
- Supabase auth wired with SSR client, server client, and middleware
- API middleware framework with rate limiting, auth, RBAC, and audit logging
- Infrastructure scaffolding for cache, monitoring, queue, and rate limiting
- TanStack React Query provider for data fetching
- Error boundaries at the app level
- Core database tables: companies, users, cost_codes, vendors, clients, jobs, job_assignments, audit

**How it works:**
1. Skeleton pages render with mock data to validate UI/UX decisions before real implementation
2. Supabase handles authentication (login/signup flows are functional)
3. Multi-tenant architecture is designed into every layer — all tenant tables require company_id with RLS policies
4. The build follows a strict 6-phase plan, each phase depending on the previous
5. Every feature follows a spec-driven workflow: read spec, write acceptance tests, build, validate

**Business rules discussed:**
- Multi-tenancy is mandatory — every table has company_id, every query filters by company_id, RLS on all tenant tables
- 7 canonical roles: owner > admin > pm > superintendent > office > field > read_only
- Permissions modes: open (v1 default) -> standard -> strict
- Soft delete only — nothing is permanently deleted, all deletes are archive operations with restore capability
- All external data passes through a unified AI processing layer for extraction and normalization
- User-controlled taxonomy — categories, labels, and sort order are always user-defined, never hardcoded
- Full CRUD on every list view (create, read, update, delete, sort, search, bulk actions)
- Data normalization through three-tier matching: exact cache -> fuzzy match -> AI classify

**Edge cases mentioned:**
- Platform must handle 10,000+ companies simultaneously with proper data isolation
- Coastal construction has weather/tide dependencies affecting scheduling
- Projects at this price point ($1.5M-$5M+) require detailed change order and draw request workflows
- Client portal must expose enough information for transparency without overwhelming non-technical homeowners

**Connected to:**
- All 52 modules are interconnected; Phase 1 Foundation (Auth, Config, Core Data, Nav/Search, Notifications, Documents) must be built first
- Supabase is the backbone for auth, database, storage, and real-time features
- The skeleton UI prototypes serve as the design spec for real implementation
- docs/modules/ contains detailed specs for each of the 52 modules
- docs/architecture/ contains 16 system-level architecture documents

**Testing notes:**
- TypeScript compiles clean (tsc --noEmit passes with zero errors)
- No real CRUD endpoints exist yet — all pages use mock data
- Phase 1 implementation is next: start with Module 01 (Auth & Access Control)
- Validation cycle required before every commit: types, acceptance tests, unit tests, integration tests
