# CLAUDE.md — Build Rules for RossOS Construction Intelligence Platform

## Project Overview

- **Product:** RossOS — Multi-tenant construction management SaaS (10,000+ companies, 1,000,000+ users)
- **Stack:** Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + TypeScript
- **App directory:** `app/` (all code, configs, and tests live here)
- **Source:** `app/src/` with `@/` path alias
- **Docs:** `docs/` — 50 module specs across 6 phases, 11 architecture docs, gap tracker
- **Skeleton:** `app/src/app/(skeleton)/skeleton/` — 93 page UI prototypes with mock data
- **Supabase:** Project ID `yprbbomuhugtgyqmrnhr`, name `RossOS`

---

## Build Phases (50 modules, 6 phases)

**Build in order. Each phase depends on the previous.**

### Phase 1 — Foundation (Modules 01-06)
| # | Module | What it builds |
|---|--------|---------------|
| 01 | Auth & Access Control | Login, signup, RBAC, 7 roles, permissions, multi-tenancy |
| 02 | Configuration Engine | Settings, feature flags, company config |
| 03 | Core Data Model | Companies, users, jobs, clients — the backbone |
| 04 | Navigation, Search & Dashboard | Unified nav, global search (Cmd+K), dashboard |
| 05 | Notification Engine | Real-time notifications, email, in-app alerts |
| 06 | Document Storage | File upload, folders, S3/Supabase storage |

### Phase 2 — Construction Core (Modules 07-12)
| # | Module | What it builds |
|---|--------|---------------|
| 07 | Scheduling & Calendar | Gantt chart, calendar, dependencies, weather |
| 08 | Daily Logs | Voice-to-text field updates, crew tracking |
| 09 | Budget & Cost Tracking | Budget lines, cost codes, variance analysis |
| 10 | Vendor Management | Vendor directory, insurance, contacts |
| 11 | Basic Invoicing | Invoice processing, approval workflow |
| 12 | Basic Client Portal | Client login, project visibility, photo sharing |

### Phase 3 — Financial Power (Modules 13-19)
| # | Module | What it builds |
|---|--------|---------------|
| 13 | AI Invoice Processing | OCR extraction, line-item matching, auto-coding |
| 14 | Lien Waivers | Conditional/unconditional, tracking, compliance |
| 15 | Draw Requests | AIA-format draws, lender submission |
| 16 | QuickBooks Integration | Two-way sync, entity mapping |
| 17 | Change Orders | Scope changes, approval chains, budget impact |
| 18 | Purchase Orders | PO creation, receiving, budget gate |
| 19 | Financial Reporting | P&L, cash flow, WIP, profitability |

### Phase 4 — Intelligence (Modules 20-28)
| # | Module | What it builds |
|---|--------|---------------|
| 20 | Estimating Engine | Cost database, assemblies, selection-based pricing |
| 21 | Selection Management | Product selections, spec books, room-by-room |
| 22 | Vendor Performance | Scorecards, ratings, callback tracking |
| 23 | Price Intelligence | Material/labor comparison, savings tracking, anomaly detection |
| 24 | AI Document Processing | Auto-classify, extract, route any document |
| 25 | Schedule Intelligence | Critical path optimization, weather/tide impact |
| 26 | Bid Management | Bid packages, invitations, comparison, award |
| 27 | RFI Management | Request tracking, response workflow |
| 28 | Punch List & Quality | Punch items, photo markup, completion tracking |

### Phase 5 — Full Platform (Modules 29-40)
| # | Module | What it builds |
|---|--------|---------------|
| 29 | Full Client Portal | Enhanced portal with approvals, selections, payments |
| 30 | Vendor Portal | Sub self-service, schedule, documents, invoicing |
| 31 | Warranty & Home Care | Warranty tracking, claims, maintenance schedules |
| 32 | Permitting & Inspections | Permit tracking, inspection scheduling |
| 33 | Safety & Compliance | OSHA, incidents, toolbox talks |
| 34 | HR & Workforce | Employee management, certifications, time tracking |
| 35 | Equipment & Assets | Equipment tracking, maintenance, daily rates |
| 36 | Lead Pipeline & CRM | Lead scoring, pipeline stages, follow-up |
| 37 | Marketing & Portfolio | Project portfolio, reviews, client outreach |
| 38 | Contracts & E-Signature | Document generation, signing workflow |
| 39 | Advanced Reporting | Custom report builder, executive dashboards |
| 40 | Mobile App | React Native, offline-first, field-optimized |

### Phase 6 — Scale & Sell (Modules 41-50)
| # | Module | What it builds |
|---|--------|---------------|
| 41 | Onboarding Wizard | Setup assistant, data import, guided config |
| 42 | Data Migration | Import from Buildertrend, CoConstruct, QuickBooks, Excel |
| 43 | Subscription Billing | Stripe, plans, usage metering |
| 44 | White-Label & Branding | Custom domains, logos, themes |
| 45 | API & Marketplace | Public API, third-party integrations |
| 46 | Customer Support | Ticket system, knowledge base |
| 47 | Training Platform | Courses, certification, progress tracking |
| 48 | Template Marketplace | Shared estimate/proposal templates |
| 49 | Platform Analytics | Usage analytics, admin dashboard |
| 50 | Marketing Website | Public site, sales pipeline |

---

## Current Project State (Updated 2026-02-13)

### What's Built & Working
| Layer | Status | Details |
|-------|--------|---------|
| **Skeleton UI** | 67+ pages | Complete prototypes with mock data, FilterBar, AIFeaturesPanel |
| **Supabase Auth** | Wired | SSR client (`lib/supabase/client.ts`), server (`server.ts`), middleware (`middleware.ts`) |
| **API Middleware** | Ready | `createApiHandler` with rate limiting, auth, RBAC, audit logging (`lib/api/middleware.ts`) |
| **Infrastructure** | Scaffolded | Cache (`lib/cache/`), monitoring (`lib/monitoring/`), queue (`lib/queue/`), rate-limit (`lib/rate-limit/`) |
| **QueryClientProvider** | Wired | TanStack React Query provider in root layout (`app/providers.tsx`) |
| **Error Boundaries** | Added | `error.tsx`, `global-error.tsx`, `not-found.tsx` at app level |
| **DB Schema** | Core tables | companies, users, cost_codes, vendors, clients, jobs, job_assignments, audit tables |
| **next.config.ts** | Configured | Supabase image domains, server actions, strict mode |
| **TypeScript** | Zero errors | `tsc --noEmit` passes clean |

### What's NOT Built (Needs Implementation)
- **CRUD API routes** — No endpoints for jobs, invoices, vendors, etc. (only health/cron/docs exist)
- **Real data flow** — All pages use mock data; no React Query hooks connecting to Supabase
- **Module 01 (Auth)** — Login/signup UI works via Supabase but no RBAC, roles, or permissions enforcement
- **Module 02 (Config)** — No settings, feature flags, or company configuration
- **Module 04 (Search)** — No Cmd+K global search implementation
- **Module 05 (Notifications)** — No notification system
- **Module 06 (Documents)** — No file upload/storage connected

### Implementation Readiness
Phase 1 foundation infrastructure is in place. Start building Module 01 (Auth & Access Control) following the spec-driven workflow below.

---

## Spec-Driven Development Workflow

**Every feature follows this loop. No exceptions.**

### 1. READ the spec first
- Check `docs/modules/XX-*.md` for the module spec
- Check `docs/architecture/` for system-level requirements
- Check `docs/checklists/gap-tracker.json` for tracked gap items
- Understand what "done" looks like BEFORE writing code

### 2. WRITE acceptance tests
- Create or update a test file in `tests/acceptance/` that encodes the spec requirements
- Each test should map to a specific plan requirement
- Tests should FAIL before implementation (red-green workflow)
- Include comments linking back to the source spec

### 3. BUILD the feature
- Write the minimum code to pass the acceptance tests
- Follow existing patterns in the codebase
- Keep changes focused — one feature per cycle

### 4. VALIDATE before moving on
```bash
cd app
npx tsc --noEmit                    # Type check
npx vitest run tests/acceptance/    # Plan adherence
npx vitest run tests/unit/          # Unit tests
npx vitest run tests/integration/   # Integration tests
```
**Do NOT move to the next task until all checks pass.**

### 5. E2E verify (when UI is involved)
```bash
npx playwright test tests/e2e/     # Browser tests
```

---

## Per-Module Build Process

For each module (e.g., Module 09 — Budget & Cost Tracking):

1. **Read spec** — `docs/modules/09-budget-cost-tracking.md`
2. **Write acceptance tests** — encode spec requirements as failing tests
3. **Database migration** — SQL for tables, RLS policies, indexes
4. **API endpoints** — CRUD with Zod validation, rate limiting
5. **Server logic** — Supabase queries, business rules
6. **Connect UI** — replace mock data in skeleton pages with real data
7. **Unit tests** — business logic, utilities
8. **Validate** — `tsc`, `vitest`, `playwright`
9. **Commit** — one commit per logical unit of work

---

## Multi-Tenant Rules (CRITICAL)

- Every tenant table has `company_id UUID NOT NULL REFERENCES companies(id)`
- Every query filters by `company_id`
- RLS enabled on all tenant tables: `USING (company_id = get_current_company_id())`
- Cache keys include `company_id`
- Indexes on `company_id` for every tenant table

---

## Code Conventions

**Full standards in `docs/standards.md` — read it before writing any code.**

- **Path alias:** Always use `@/` imports, never relative `../`
- **Components:** `app/src/components/` — organized by feature (skeleton/, ui/, layout/)
- **Config:** `app/src/config/` — data structures like navigation, feature flags
- **Types:** `app/src/types/` — shared TypeScript types
- **Lib:** `app/src/lib/` — utilities, Supabase clients
- **Styling:** Tailwind CSS utility classes, use `cn()` from `@/lib/utils` for conditional classes
- **TypeScript:** No `any` types, explicit return types, use `type` imports
- **API routes:** Use `createApiHandler` wrapper, include rate limiting, validate with Zod
- **UI patterns:** Status badges use `rounded` (not `rounded-full`), warnings use `amber-` (not `yellow-`), AI bars use amber gradient, stats cards use `p-3`
- **Mock data:** ISO dates (`'2026-01-15'`), 2025-2026 range, all statuses represented

---

## Test Commands

```bash
npm test                    # All Vitest tests (unit + integration + acceptance)
npm run test:acceptance     # Plan adherence only
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E browser tests (Playwright)
npm run test:types          # Type checking only
npm run validate            # Full validation (types + all vitest + e2e)
```

## Test File Conventions

| Directory | Purpose | Runner |
|-----------|---------|--------|
| `tests/acceptance/` | Plan adherence — does it match the spec? | Vitest |
| `tests/unit/` | Individual functions, hooks, utils | Vitest |
| `tests/integration/` | Components with mocked data | Vitest |
| `tests/e2e/` | Browser flows against running app | Playwright |

---

## Key Architecture Decisions

- **Single unified nav bar** — `UnifiedNav` detects context (company vs job) and transforms. Config in `src/config/navigation.ts`.
- **Skeleton mode** — visual prototype with mock data only. Layouts nest: `(skeleton)/layout.tsx` → `skeleton/layout.tsx` → `jobs/[id]/layout.tsx`
- **Unified AI Processing Layer** — ALL data entering the system (PDF, email, photo, manual entry, API) passes through AI extraction/normalization before storage. See `docs/architecture/ai-engine-design.md` Section 0.
- **7 canonical roles** — `owner > admin > pm > superintendent > office > field > read_only`. Custom roles inherit from these. See `docs/modules/01-auth-and-access.md`.
- **Permissions mode** — `open` (v1 default) → `standard` → `strict`. Infrastructure built from day 1.
- **Full CRUD everywhere** — Every list view supports create, read, update, delete, sort, search, and bulk actions. No read-only lists except audit logs. See `docs/architecture/normalization-and-crud.md`.
- **Data normalization** — All external inputs go through three-tier matching (exact cache → fuzzy match → AI classify) and resolve to user-controlled canonical names. Alias registry grows with every confirmed match.
- **User-controlled taxonomy** — Categories, labels, and sort order are always user-defined. Never hardcode categories. They grow organically from real data.
- **Soft delete only** — Nothing is permanently deleted. All deletes are archive operations with restore capability.

---

## Key File Locations

| Purpose | Location |
|---------|----------|
| **UI & Code Standards** | **`docs/standards.md`** |
| Module specs (50) | `docs/modules/01-*.md` through `50-*.md` |
| Architecture docs (16) | `docs/architecture/*.md` |
| Gap tracker (1125 items) | `docs/checklists/gap-tracker.json` |
| Skeleton pages (67+) | `app/src/app/(skeleton)/skeleton/` |
| Preview components (68) | `app/src/components/skeleton/previews/` |
| Authenticated pages | `app/src/app/(authenticated)/` |
| Navigation config | `app/src/config/navigation.ts` |
| Database types | `app/src/types/database.ts` |
| Utilities | `app/src/lib/utils.ts` |
| API handler + pagination | `app/src/lib/api/middleware.ts` |
| API routes | `app/src/app/api/` |
| Supabase browser client | `app/src/lib/supabase/client.ts` |
| Supabase server client | `app/src/lib/supabase/server.ts` |
| Supabase middleware | `app/src/lib/supabase/middleware.ts` |
| QueryClient provider | `app/src/app/providers.tsx` |
| Error boundary | `app/src/app/error.tsx` |
| Supabase migrations | `app/supabase/migrations/` |
| Cache layer | `app/src/lib/cache/index.ts` |
| Rate limiting | `app/src/lib/rate-limit/index.ts` |
| Monitoring/logging | `app/src/lib/monitoring/index.ts` |
| Job queue | `app/src/lib/queue/index.ts` |

---

## Session Management

### Starting a session
1. Read this file
2. Check `git status` for uncommitted work
3. Identify which module/phase to work on next

### During work
- Commit after each logical unit (migration, endpoint, component, bug fix)
- Run validation before every commit: `npm run validate`

### Ending a session
- Commit all work
- Push to remote
- Note in commit message what's done and what's next

---

## AI Collaboration Protocol (Gemini Planner & Claude Executor)

When operating as the "Executor" AI (Claude Code) following a plan created by the "Planner" AI (Gemini):
1. **Read the Plan**: Always start by reading `docs/current_plan.md` to understand the exact step-by-step tasks.
2. **Execute Strictly**: Follow the architectural decisions, file structures, and code chunks specified in the plan. Do not deviate from the core design unless you hit a blocker.
3. **Track Progress**: As you complete tasks, update `docs/current_plan.md` to mark them as `[x]` so the Planner AI (Gemini) knows what is done if a handoff occurs.
4. **Validation**: Run the necessary linters and tests specified in the plan before marking a task complete.
5. **Blockers & Handoff**: If you face a roadblock, stop execution and prompt the user to ask the Planner AI for a revised plan.

---

## Do NOT

- Skip the validation step — ever
- Write more than one feature before validating
- Change nav config without updating acceptance tests
- Add dependencies without checking if an existing one covers the need
- Create new files when editing an existing one would work
- Add error handling for impossible scenarios
- Over-abstract — three similar lines > a premature utility function
- Build features that consume raw/unprocessed input directly — always go through the AI processing layer first
- Add a new document type without defining its output schema and extraction rules first
- Hardcode categories, labels, or taxonomy — users control their own naming
- Build a list view without CRUD (add/edit/delete/sort/search) — see `docs/architecture/normalization-and-crud.md`
- Accept external input without normalization — vendor names, material descriptions, cost codes all go through the matching engine
- Hard delete anything — always soft delete (archive) with restore capability
- Use `any` types in TypeScript
- Commit broken code — fix before committing
