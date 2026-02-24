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

## Module 11 — Native Accounting (GL/AP/AR) V1 Foundation (2026-02-24)

- **Why** — Module 11 spec requires a full native accounting engine for construction companies: General Ledger (chart of accounts, double-entry journal entries), Accounts Payable (vendor bills, payments, bill-payment application), and Accounts Receivable (client invoices, receipts, receipt-invoice application). This replaces external accounting software dependency. V1 foundation builds the core data layer and CRUD APIs; advanced features like bank reconciliation, approval chains, financial statements, AIA G702/G703 generation, and fiscal period management are deferred to V2.
- **What** — 1 migration (11 tables: gl_accounts, gl_journal_entries, gl_journal_lines, ap_bills, ap_bill_lines, ap_payments, ap_payment_applications, ar_invoices, ar_invoice_lines, ar_receipts, ar_receipt_applications), 1 types file (8 type unions, 12 interfaces, 8 constant arrays), 1 Zod schemas file (8 enums, 17 CRUD schemas), 12 API route files (25 endpoint handlers), 57 acceptance tests. Spec maps `builder_id` to `company_id` for multi-tenant consistency.
- **How** — Migration follows existing pattern (CREATE TABLE IF NOT EXISTS, RLS on all tenant-level tables, indexes on company_id + FKs). Journal entry creation enforces double-entry balance (debits = credits within $0.01 tolerance) at both create and post time. AP payments auto-update bill balance_due and status. AR receipts auto-update invoice balance_due and status. Soft delete on ap_bills and ar_invoices (deleted_at column, queries filter .is('deleted_at', null)). Child tables (lines, applications) use ON DELETE CASCADE but no independent RLS (access controlled via parent). GL journal lines have no RLS since they are only accessed through journal entries.
- **Rules** — (1) All monetary values decimal(15,2). (2) Journal entries must balance before posting (min 2 lines). (3) Only draft journal entries editable. (4) System GL accounts restrict account_number/type/normal_balance changes. (5) AP bills: soft delete, draft-only delete. (6) AR invoices: soft delete, draft-only delete. (7) Paid/voided bills and invoices cannot be updated. (8) Payment/receipt applications total must equal payment/receipt amount. (9) Unique constraint on (company_id, account_number) for GL accounts.
- **Connected to** — Module 01 (auth required on all endpoints), Module 03 (jobs, cost_codes, vendors, clients table FKs), Module 09 (budget & cost tracking — future GL posting), Module 10 (vendor management — vendor FKs on AP), Module 13 (Invoice AI extends AP), Module 15 (Draw requests — future AR integration), Module 16 (QuickBooks sync — optional)

---

## Module 12 — Basic Client Portal V1 Foundation (2026-02-24)

- **Why** — Module 12 spec requires a client-facing portal that gives homeowners controlled visibility into their construction project. Builders need per-job configuration for what clients can see (budget, schedule, documents, photos, daily logs). The portal supports messaging between builder and client, curated update posts, shared documents from the main document storage, and a curated photo gallery. Client engagement is tracked via an activity log for builder analytics.
- **What** — 6 DB tables (portal_settings, portal_messages, portal_update_posts, portal_shared_documents, portal_shared_photos, portal_activity_log), TypeScript types file with 3 type unions + 6 interfaces + 3 constant arrays + 6 max constants, Zod validation schemas file (3 enums + 14 CRUD schemas), 8 API route files (settings GET/PUT, messages list/create/get/mark-read, updates list/create/get/update/delete/publish, documents list/share, photos list/share), 49 acceptance tests. V1 foundation scope -- defers branding engine, custom domains, notification rules, selection approvals, change order review, e-signature, analytics dashboard, communication logging, budget visibility levels, guest invites, and stage-aware content to future phases (Module 29).
- **How** — Spec uses `builder_id` mapped to `company_id` for multi-tenant consistency. Portal settings use upsert with unique constraint on (company_id, job_id) to support per-job configuration. Settings GET returns sensible defaults when no record exists. Update posts support draft/publish workflow via separate publish endpoint. Shared documents enforce unique constraint to prevent double-sharing (409 on conflict). Photos support album-based organization with sort_order. All tables have RLS enabled with tenant isolation. Soft delete on update posts via deleted_at. Activity log is append-only for analytics.
- **Rules** — (1) Multi-tenant: all 6 tables have company_id with RLS. (2) Portal disabled by default (is_enabled=false). (3) Budget visibility off by default, schedule/documents/photos on by default. (4) Messages support threading via parent_message_id. (5) Update posts must be published before clients see them. (6) Already-published posts return 409 on re-publish. (7) Shared documents unique per (company_id, job_id, document_id). (8) Photos sorted by sort_order ascending then created_at descending. (9) Branding color must be valid hex (#RRGGBB). (10) Soft delete only on update posts.
- **Connected to** — Module 01 (auth required on all endpoints), Module 03 (jobs table FK), Module 06 (documents table FK for shared documents), Module 05 (future: notification rules for portal events), Module 29 (Full Client Portal extends this V1 foundation)

---

## Module 07 — Scheduling & Calendar V1 Foundation (2026-02-24)

- **Why** — Module 07 spec requires project scheduling with Gantt charts, calendar views, task dependencies, resource assignment, baseline tracking, and weather impact logging. Construction companies need to plan phases, track progress vs. baselines, identify delays, coordinate trades, and document weather impacts. This is a Phase 2 Construction Core module that depends on Module 03 (jobs table) and will feed into Modules 08 (daily logs), 25 (schedule intelligence), and 32 (inspections).
- **What** — 4 DB tables (schedule_tasks, schedule_dependencies, schedule_baselines, weather_records), TypeScript types file (4 status/enum type unions + 4 interfaces + 4 constant arrays), Zod validation schemas file (3 enums + 12 CRUD schemas), 6 API route files (15 endpoint handlers: tasks list/create/get/update/delete, dependencies list/create, baselines list/create, weather list/create/get/update/delete), 58 acceptance tests. V1 foundation scope only -- defers Gantt UI, calendar views, Kanban board, templates, work calendars, resource leveling, weather API integration, critical path computation, look-ahead reports, what-if scenarios to future phases.
- **How** — schedule_tasks supports hierarchy via self-referencing parent_task_id. Dependencies link tasks via predecessor/successor with 4 standard types (FS/SS/FF/SF) and configurable lag/lead. Baselines auto-snapshot all current tasks for a job when baseline_data is empty. Weather records are unique per (company, job, date) to prevent duplicates. All tables have company_id for multi-tenant isolation with RLS. Soft delete via deleted_at on tasks and weather records. API routes use createApiHandler with auth+rate-limiting. GIN trigram index on task name for text search.
- **Rules** — (1) Multi-tenant: all tables have company_id, all queries filter by it. (2) RLS enabled on all 4 tables. (3) Task statuses: not_started, in_progress, completed, delayed, on_hold. (4) Dependency types: FS, SS, FF, SF (case-sensitive). (5) progress_pct 0-100 enforced at DB level (CHECK) and schema level. (6) Dependencies cascade-delete when parent tasks are removed. (7) Self-dependency prevented at API level. (8) Weather records unique per date+job. (9) Soft delete only -- never hard delete.
- **Connected to** — Module 03 (jobs table FK), Module 01 (auth required on all endpoints), Module 08 (future: daily log weather feeds here), Module 05 (future: schedule change notifications), Module 10 (future: assigned_vendor_id links), Module 25 (future: critical path computation)

---

## Module 09 — Budget & Cost Tracking V1 Foundation (2026-02-23)

- **Why** — Module 09 spec requires project budget creation and real-time cost tracking against budget lines. Construction projects need to track committed costs (signed subcontracts/POs), actual costs (paid invoices), and projected final costs with variance analysis. This is the financial backbone connecting estimates, invoices, change orders, draw requests, and accounting. V1 builds the core CRUD infrastructure for budgets, budget lines, cost transactions, and change audit logging.
- **What** — 4 DB tables (budgets, budget_lines, cost_transactions, budget_change_logs) in a migration file, types file (4 interfaces + 2 type unions + 2 constant arrays), Zod schemas file (10 schemas including list/create/update for budgets, lines, and transactions), 7 API route files (11 endpoint handlers: budgets CRUD, budget lines CRUD, cost transactions list+create), 39 acceptance tests. V1 scope covers core data model and CRUD only. Defers to later phases: variance detection engine, earned value metrics, contingency management, draw requests, WIP reporting, AIA G702/G703 format, multi-audience views, accounting integration, period locking, alerts, assemblies, templates, markup config.
- **How** — User creates a budget for a job (draft status). Adds budget lines with three-column tracking: estimated_amount, committed_amount, actual_amount, plus projected_amount and variance_amount. Records cost transactions (commitment/actual/adjustment/transfer) against budget lines and cost codes. All monetary values use decimal(15,2). Budget change logs provide audit trail. Soft delete on budgets (deleted_at), hard delete on lines.
- **Rules** — (1) Multi-tenant: company_id on all tables, RLS policies, all queries filter by company_id. (2) Spec's builder_id mapped to company_id. (3) Budget statuses: draft, active, locked, archived. (4) Transaction types: commitment, actual, adjustment, transfer. (5) Soft delete on budgets only. (6) Budget lines CASCADE delete when parent budget is deleted. (7) Change logs use subquery-based RLS via parent budget's company_id. (8) decimal(15,2) for all monetary values. (9) Budget lines inherit job_id from parent budget on creation.
- **Connected to** — Module 01 (auth required), Module 03 (job_id references jobs, cost_code_id references cost_codes, vendor_id references vendors), Module 05 (future: budget alerts/notifications), Module 11 (future: actual costs from invoices), Module 17 (future: CO impact on budget lines), Module 20 (future: committed costs from POs)

---

## Module 10 — Vendor Management V1 Foundation (2026-02-23)

- **Why** — Module 10 spec requires centralized vendor/subcontractor management with contacts, trade assignments, insurance compliance tracking, and performance scoring. Construction companies need to track vendor insurance expirations, compliance status, and rate vendors per project. This is a Phase 2 Construction Core module that builds on the existing vendors table from Module 03.
- **What** — 5 DB tables (vendor_contacts, vendor_trades, vendor_insurance, vendor_compliance, vendor_ratings), TypeScript types file with 5 type unions + 5 interfaces + 5 constant arrays, Zod validation schemas file (5 enums + 12 CRUD schemas), 7 API route files (contacts CRUD, insurance CRUD, compliance list+create, ratings list+create), 41 acceptance tests. V1 foundation scope only -- defers bidding, rate sheets, prequalification, communication history, benchmarking to future phases.
- **How** — Extends existing vendors table without modification. New tables link via vendor_id FK. All tables have company_id for multi-tenant isolation with RLS enabled. API routes use createApiHandler with auth+rate-limiting. Vendor ID extracted from URL pathname segments. Insurance ordered by expiration_date (soonest first) for compliance monitoring. Ratings include check constraint 1-5. rated_by auto-populated from authenticated user.
- **Rules** — (1) Multi-tenant: all tables have company_id, all queries filter by it. (2) RLS enabled on all 5 tables. (3) Insurance types: general_liability, workers_comp, auto, umbrella, professional. (4) Rating 1-5 enforced at DB level (CHECK) and schema level (z.number().int().min(1).max(5)). (5) Insurance status tracks active/expiring_soon/expired/not_on_file. (6) Compliance default status is 'pending'. (7) Insurance default status is 'active'. (8) Does NOT recreate or alter the existing vendors table from Module 03.
- **Connected to** — Module 03 (vendors table, FK reference), Module 06 (certificate_document_id, document_id references for future linking), Module 01 (auth required on all endpoints), Module 05 (future: expiration alerts), Module 09 (future: rate sheets feed PO pricing)

---

## Module 08 — Daily Logs V1 Foundation (2026-02-23)

- **Why** — Module 08 spec requires digital daily log entries capturing weather, crew hours, work performed, materials, site conditions, and field issues. This is a Phase 2 Construction Core module. The V1 foundation builds the core CRUD infrastructure (logs, entries, labor, photos) with status workflow (draft -> submitted -> approved/rejected) to enable all future daily log features (voice-to-text, templates, review workflows, immutability, amendments, PDF export).
- **What** — 4 DB tables (migration ready for Supabase), types file (4 interfaces + 2 type unions + 2 constant arrays), Zod schemas file (10 schemas), 7 API route files (13 endpoint handlers: list, create, get, update, soft-delete, submit, approve, entries CRUD, labor CRUD, photos CRUD), 40 acceptance tests. V1 scope — defers templates, amendments, immutability triggers, vendor check-in, voice-to-text, weather API, PDF export, custom fields, review workflows to later phases.
- **How** — PM/superintendent creates daily log for a job+date (unique constraint prevents duplicates). Adds entries (7 types), labor records, and photos while log is in draft status. Submits log (draft->submitted, records submitter). Approver approves (submitted->approved, records approver). All child records (entries, labor, photos) gated by draft status check. GET by ID returns log with all children embedded. Soft delete only.
- **Rules** — (1) Multi-tenant: company_id on all tables, RLS policies, all queries filter by company_id. (2) One log per job per date (UNIQUE constraint, 409 on duplicate). (3) Only draft logs can be edited/have children added (403 otherwise). (4) Status transitions: draft->submitted (submit), submitted->approved (approve). (5) Soft delete only (deleted_at timestamp). (6) Spec's builder_id mapped to company_id for consistency. (7) Entry types: note, work_performed, material_delivery, visitor, delay, safety_incident, inspection. (8) Log statuses: draft, submitted, approved, rejected.
- **Connected to** — Module 01 (auth required for all endpoints), Module 03 (job_id references jobs table), Module 06 (photos reference storage paths), Module 05 (future: submission reminders, approval notifications)

---

## Module 06 — Document Storage (2026-02-23)

- **Why** — Module 06 spec requires shared infrastructure for all file/document operations. Construction projects generate enormous volumes of documents — plans, specs, contracts, invoices, COIs, permits, photos. The system needs upload, organized storage, versioning, tagging, access control, and expiration tracking. This is a Phase 1 Foundation module that nearly every downstream module depends on.
- **What** — 9 DB tables (migration applied to Supabase), document types + constants file, Zod validation schemas (10 schemas), storage utility lib (validate, path build, MIME categorize, format), 8 API routes (document CRUD + download + versions + folder CRUD), 40 acceptance tests. V1 foundation scope — defers AI classification, OCR, e-signatures, redaction, email ingestion to later phases.
- **How** — Files uploaded via client → POST metadata to `/api/v2/documents` → record created with storage path `{company}/{job}/{uuid}_{filename}` → initial version created → tags attached. Download via signed URL (1hr expiry) from Supabase Storage. Folders use materialized path pattern for hierarchy. Versions auto-increment. Soft delete only (status='archived'). Blocked extensions prevent malicious uploads.
- **Rules** — (1) Multi-tenant: all queries filter by company_id, RLS on all tables. (2) Soft delete only. (3) Blocked extensions: exe, bat, sh, cmd, ps1, msi, dll, etc. (4) Max file size 500MB. (5) Max 20 simultaneous uploads. (6) Folder deletion blocked if has children or active documents. (7) Document types: 14 categories from invoice through other. (8) Signed URLs expire in 1 hour. (9) Quarantined/deleted documents blocked from download.
- **Connected to** — Module 01 (auth required for all endpoints), Module 03 (job_id references), Module 05 (expiration alerts via notification engine), Module 04 (document search integration future), all future modules (document attachment)

---

## Module 05 — Notification Engine (2026-02-23)

- **Why** — Module 05 spec requires a real-time notification system for construction operations. Users need to be notified about financial events, schedule changes, document uploads, field operations, approvals, and system events. The TopNav had a static bell icon placeholder with no functionality.
- **What** — 6 DB tables (migration applied to Supabase), 16 seed event types, notification types in database.ts, Zod validation schemas, notification service lib, 8 API routes (list, emit, unread-count, read-all, mark-read, archive, settings, preferences), NotificationBell dropdown component, useNotifications React Query hook, 27 acceptance tests. Wired bell into TopNav.
- **How** — Other modules call `emitNotification()` with recipients → creates notification rows + in-app delivery records → bell polls `/api/v2/notifications/unread-count` every 30s → badge shows count → click opens dropdown → fetches paginated list → click notification marks read + navigates. Quiet hours, digest mode, and per-category/channel preferences configurable via settings/preferences APIs.
- **Rules** — (1) Multi-tenant: all queries filter by company_id + user_id. (2) Soft delete only: archive flag, never hard delete. (3) Idempotency key prevents duplicate notifications within same minute window. (4) 6 categories × 4 channels = 24 possible preference combos per user. (5) Critical notifications can bypass quiet hours. (6) Bell badge caps at "99+". (7) Urgency levels: low/normal/high/critical with color-coded dots.
- **Connected to** — Module 01 (auth required), Module 03 (entity references via entity_type/entity_id), TopNav (bell mounted in header), all future modules (emit notifications for their events)

---

## Module 04 — Cmd+K Global Search / Command Palette (2026-02-23)

- **Why** — Module 04 spec requires a keyboard-activated search overlay for fast navigation. Navigation config and dashboard were already done, but the Cmd+K command palette (the main UX differentiator for power users) was missing. The TopNav had a non-functional placeholder `<Input>` for search.
- **What** — 11 new files + 2 modified files. Types, Zod schema, search API endpoint, recent-searches localStorage utility, quick-actions nav-derived utility, 2 React hooks (useSearch, useCommandPalette), 3 command palette components (search-result-item, quick-actions, command-palette), TopNav modification, 21 acceptance tests. Added `cmdk` package (~4KB).
- **How** — Cmd+K or search button click opens Radix Dialog wrapping `cmdk`'s `<Command>` component. Query debounced 250ms, hits `/api/v2/search` which queries jobs/clients/vendors/invoices in parallel with `.ilike()` + `.or()` (same pattern as existing CRUD APIs). Results grouped by entity type. Quick actions derived from all 4 nav config exports. Recent searches stored in localStorage (max 10, deduped). On select: `router.push()` + close + save to recents.
- **Rules** — (1) `shouldFilter={false}` on Command: server-side filtering for entity results, client-side keyword matching for quick actions. (2) Query must be 2-200 chars. (3) Default limit 5 results per entity, max 20. (4) All queries filter by `company_id` (multi-tenant). (5) CommandPalette renders inside TopNav (client component) — no server component boundary issues.
- **Connected to** — Module 01 (auth required for search API), Module 03 (searches across jobs, clients, vendors tables), Nav config (quick actions derived from all nav sections)

---

## Module 02 — Settings UI Pages (2026-02-23)

- **Why** — Module 02 backend (5 API routes, config engine lib, DB tables) was complete but had NO settings UI. Users need to configure company settings, toggle features, customize terminology, set numbering patterns, and manage project phases from the UI.
- **What** — 8 files: SettingsSidebar + layout wrapper + 5 settings pages (general, features, terminology, numbering, phases) + 30 acceptance tests. No new API routes needed.
- **How** — Settings layout wraps all `/settings/*` pages with a sidebar. Each page fetches from existing API routes, provides per-section forms with dirty tracking, and PATCHes changes. Phases page has full CRUD with modal. Feature flags have plan gating and batch save.
- **Rules** — (1) Feature flags: toggle disabled if company plan < required plan. (2) Terminology: override-only — leave empty to use default. (3) Numbering: one entity editable at a time, pattern validated server-side. (4) Phases: system phases locked (no rename/delete), soft delete only.
- **Connected to** — Module 01 (auth/RBAC gates settings access), Module 03+ (all downstream modules consume config values from these settings)

---

## Entries

### 2026-02-23 — Module 03: Core Data Model CRUD APIs
- **Why** — Every Phase 2+ module depends on CRUD endpoints for jobs, clients, vendors, and cost codes. Without them, all pages are stuck on mock data. TypeScript types were out of sync with DB migration columns, causing type errors when connecting real data.
- **What** — Built 8 API route files (4 entity pairs of list+create and get+patch+delete), 4 Zod validation schema files, fixed database.ts types to match actual migration columns, updated test factory for Job type.
- **How** — Followed exact pattern from users CRUD routes. Each endpoint uses `createApiHandler` with auth, rate limiting, Zod validation, and audit logging. Queries scoped to `company_id` via `ctx.companyId`. Soft delete via `deleted_at` timestamp (RLS policies already filter `deleted_at IS NULL`).
- **Rules** — Jobs POST requires owner/admin/pm; PATCH adds superintendent. Clients/vendors POST/PATCH open to any auth user; DELETE restricted. Cost codes locked to owner/admin only. All deletes are soft deletes. No hard deletes.
- **Connected to** — Module 01 (auth/RBAC), Module 02 (config), all Phase 2 modules (scheduling, budgets, vendor management)

### 2026-02-23 — Blueprint (3) Expansion: 8 New Skeleton Pages + 120 Features

**Why:** The user provided `rossos-production-blueprint (3).md` — a 2,302-line document with 600+ features across 12 parts covering AI Accuracy Engine, gap analysis modules, deep self-learning metrics, and more. Many features overlapped with existing pages (Trade Intuition, Plan Analysis, Bidding, Selections, etc.), but 8 major new areas needed dedicated skeleton pages.

**What we built:**
- 8 new skeleton pages with Preview/Spec tabs
- 8 new preview components with full mock data visualizations
- 120 new features in `features.ts` (IDs 348-467, total now 467 across 33 categories)
- Navigation updated with 7 new nav items across 6 sections
- New pages: AI Accuracy Engine, Pre-Construction, Contract & Legal, Business Management, HR & Workforce, Post-Build Lifecycle, Lien Law Compliance, Job Close Accounting

**How it works:**
1. AI Accuracy Engine (`/intelligence/accuracy-engine`) — 6 validation systems, live demo of $37K fireplace error catch, confidence flags, feedback loop
2. Pre-Construction (`/pre-construction`) — Lot feasibility, permits, design review, engineering tracking, pre-con checklist
3. Contract & Legal (`/contracts/legal`) — Template library, AI builder, redline comparison, subcontract generator, lien law dashboard
4. Business Management (`/financial/business-management`) — Company P&L, overhead calculator, break-even, capacity planner, cash flow forecast
5. HR & Workforce (`/directory/hr`) — Org chart, hiring pipeline, certification tracker, performance reviews, workload balancer
6. Post-Build (`/post-build`) — Walkthroughs, seasonal maintenance, referral program, lifetime value, knowledge base
7. Lien Law (`/compliance/lien-law`) — State-specific calendars, NTO generator, waiver automation, retainage tracking, risk dashboard
8. Job Close (`/financial/job-close`) — Close checklist, cost reconciliation, POC accounting, warranty reserve, CPA export

**Business rules discussed:**
- AI Accuracy Engine has 6 validation layers that run on every data entry
- 5 confidence flag levels (Safety Block → Informational) with override learning
- Pre-construction covers everything from contract signing to ground breaking
- Lien law rules are state-specific (FL 45-day NTO, 90-day claim, 10%→5% retainage)
- Job close requires all 8 financial items complete before archiving
- Post-build lifecycle tracks client relationships for years after completion

**Connected to:**
- Feature Registry — all 120 new features visible at Settings > Features
- Navigation — 7 new links across Sales, Pre-Con, Financial, Closeout, Intelligence, Directory, Settings
- All existing intelligence pages — Accuracy Engine validates data flowing to all modules
- Blueprint documents (3) — source specification for all features

---

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

---

### 2026-02-23 — Feature Registry Skeleton Page

**Why:** The user has a comprehensive list of 205 features across 10 categories that RossOS will offer. They wanted to see WHERE these features would live in the actual software — a visual registry page showing every capability, what it does, and toggles for enabling/disabling. The user explicitly said: "I don't want to actually build anything out yet, I just wanna see where the features would go within the website but have it into the website saying what it does but don't build code behind it yet, I'm gonna execute on all of it later." This is a common pattern in the project — build the skeleton UI first, wire it up later.

**What we built:**
- Feature config file (`src/config/features.ts`) with all 205 features, types, status/effort configs, and onboarding steps
- Feature Registry preview component (`src/components/skeleton/previews/feature-registry-preview.tsx`) with search, filters, category toggles, onboarding walkthrough, stats, and AI panels
- Skeleton page at `/skeleton/company/features` following standard Preview/Spec tab pattern
- Navigation link under Settings > Features in `companyRightNav`

**How it works:**
1. User navigates to Settings > Features in the nav bar
2. Sees 205 features organized into 10 categories with toggle switches
3. Can search by name, description, or category
4. Can filter by status (Ready/Planned/Future) or self-learning AI only
5. Each category has Enable All / Disable All buttons
6. Smart Onboarding walkthrough section shows the 6-step AI-powered setup flow
7. Stats cards show total features, enabled count, self-learning count, ready/planned/future counts
8. AI insights bar and AI Features Panel at bottom

**Connected to:**
- Module 02 (Configuration Engine) — feature flags are part of company configuration
- Module 43 (Subscription Billing) — feature tiers will be tied to subscription plans
- Module 01 (Auth & Access Control) — feature access will be gated by role
- All 52 modules — each module's features appear in this registry

**Business rules discussed:**
- All 205 features should be visible even if not yet built — status badges show readiness
- Self-learning AI features are tagged with a purple badge
- Features default to enabled for "ready" status features
- Categories are collapsible for easy browsing
- This is skeleton only — no real database writes, no API, no feature flag enforcement

---

### 2026-02-23 — Construction Intelligence Skeleton Pages (8 pages)

**Why:** The user provided 3 blueprint files (rossos-production-blueprint.md) containing 480+ production and construction intelligence features organized into: Trade Intuition AI (80 knowledge domains + 7-Layer Thinking Engine), Plan Analysis & Takeoffs, Bidding & Estimating, Selections Experience, Production & Quality, Procurement & Supply Chain, Smart Reports, and Cross-Cutting AI. The user said: "start work on these features and make these features have their own spot in the ui too" — meaning each major section should have its own dedicated skeleton page in the UI, following the same visual prototype pattern as all other 67+ skeleton pages.

**What we built:**
- 8 new skeleton pages under `/skeleton/intelligence/*` with Preview/Spec tabs
- 8 new preview components in `src/components/skeleton/previews/`
- New `companyIntelligenceNav` navigation section with Brain icon and 8 sub-links
- Expanded features.ts from 205 to 347 features with 8 new categories from the blueprint
- Trade Intuition preview includes full 7-Layer Thinking Engine live demo, 80 knowledge domains across 8 categories, confidence/override system, and cross-module intelligence examples
- AI Hub preview includes morning briefings, project health scores, "What If" scenario engine, risk register

**How it works:**
1. User clicks Intelligence in the nav bar dropdown
2. Sees 8 sub-pages: Trade Intuition AI, Plan Analysis, Bidding, Selections, Production, Procurement, Smart Reports, AI Hub
3. Each page has Preview tab (visual mock) and Specification tab (PageSpec with workflow, features, connections, AI features)
4. Trade Intuition is the foundational engine — it powers all other intelligence pages
5. All 142 new features also appear in the Feature Registry at Settings > Features

**Connected to:**
- Feature Registry (`/skeleton/company/features`) — all 142 new features visible there
- All existing skeleton pages — Trade Intuition AI is described as enhancing every module
- Navigation system — new `companyIntelligenceNav` array exported alongside existing nav arrays
- Module specs in docs/modules/ and docs/architecture/ai-engine-design.md

**Business rules discussed:**
- Trade Intuition AI has 80 knowledge domains across 8 categories (10 domains each)
- 7-Layer Thinking Engine validates every AI decision: Prerequisites → Material Validation → Trade Conflict Scan → Downstream Impact → Cost & Budget → Quality & Warranty → Client Communication
- 5 confidence flag levels: Safety Block (red, cannot override), Strong Recommendation (orange, requires documented reason), Suggestion (yellow, one-click dismiss), Learning Nudge (blue, based on history), Informational (white, hover context)
- The system learns from overrides — when you dismiss a suggestion, it records the context and adjusts
- All skeleton only — no real backend, mock data throughout

---

### 2026-02-23 — Feature Flag Wiring Requirements (Future: Module 02)

**Why:** The user asked whether enabling features in the Feature Registry would make them show/hide in the frontend UI. Answer: not yet — toggles are mock only. When Module 02 (Configuration Engine) is built, the Feature Registry must be wired up so toggles actually control what appears in the UI.

**What needs to be built (Module 02 scope):**

1. **Persistent Feature Flag Store**
   - Save enabled/disabled state per company (start with localStorage, migrate to Supabase `company_feature_flags` table)
   - Schema: `company_id, feature_id, enabled (boolean), enabled_at, enabled_by`
   - Default state: all "ready" features enabled, "planned"/"future" disabled
   - Must survive page refresh and work across tabs

2. **`useFeatureFlag()` Hook**
   - `useFeatureFlag('ai-morning-briefing')` → returns `{ enabled: boolean, toggle: () => void }`
   - Reads from the persistent store
   - Used by any component that needs to check if a feature is on/off
   - Memoized, doesn't re-render unless the specific flag changes

3. **`<FeatureGate>` Wrapper Component**
   - `<FeatureGate flag="ai-morning-briefing" fallback={<UpgradeBanner />}>` wraps any feature UI
   - Renders children only if the feature is enabled
   - Optional fallback for disabled state (e.g., "Enable this in Settings > Features")
   - Used on dashboard widgets, page sections, nav items, etc.

4. **Navigation Filtering**
   - `companyIntelligenceNav` items should only appear if their corresponding feature group is enabled
   - Settings > Features link always visible (can't hide the control panel)
   - Job-level nav items filtered by job-relevant feature flags
   - Nav config in `navigation.ts` needs a `featureFlag?: string` field on each NavItem/NavSubItem

5. **Module-Level Page Gating**
   - Each skeleton page wraps content in `<FeatureGate>`
   - Disabled pages show a "This feature is not enabled" state with a link to Settings > Features
   - Prevents direct URL access to disabled features

6. **Feature Registry Integration**
   - Toggle switches in Feature Registry write to the persistent store (not just React state)
   - "Enable All" / "Disable All" per category updates all flags in that category
   - Changes take effect immediately across the entire UI (no page refresh needed)
   - Stats cards reflect real enabled/disabled counts from the store

7. **Feature-to-Route Mapping**
   - Each feature in `features.ts` needs a `routes?: string[]` field mapping to affected pages
   - Each feature needs a `navItems?: string[]` field mapping to nav items it controls
   - This creates the link between "toggle feature X" and "hide/show these UI elements"

**What the user said:**
"just note what needs to be done, so when we do execute on it, it remembers to do all this to make sure the buttons work. I wanna keep it as a skeleton, no actual working buttons."

**Connected to:**
- Module 02 (Configuration Engine) — this IS the feature flag system
- Feature Registry page (`/skeleton/company/features`) — the control panel
- Navigation system (`src/config/navigation.ts`) — filtered by flags
- All 75+ skeleton pages — each gated by their feature flag
- Module 43 (Subscription Billing) — feature tiers will restrict which features can be enabled based on plan

**Testing requirements when built:**
- Toggle feature off → disappears from nav and page renders "not enabled" state
- Toggle feature on → reappears in nav and page renders normally
- Refresh page → toggle state persists
- "Enable All" on a category → all features in that category appear in UI
- Direct URL to disabled feature → shows disabled state, not a 404
- Stats in Feature Registry → accurate count from persistent store

---

### 2026-02-23 — Communication Hub & Learning Metrics Skeleton Pages

**Why:** The user wanted visual skeleton prototypes for both the Universal Communication Hub and the Expanded Self-Learning Engine before the execution phase. "I want this setup properly for the execution phase making all features work together." The user specifically wanted to SEE all 67 tracked metrics in the UI so they could verify coverage.

**What we built:**
- 2 new skeleton pages under `/skeleton/intelligence/*` with Preview/Spec tabs
- 2 new preview components in `src/components/skeleton/previews/`
- 2 new nav items in `companyIntelligenceNav` (total now 10 sub-links)
- Communication Hub preview: 6 connected channels, universal inbox with 6 mock messages from different platforms, AI extraction pipeline demo, two-way sync visualization, on-site recording flow, and channel setup guide
- Learning Metrics preview: All 67 metrics displayed (45 trade in 5 collapsible categories + 12 material + 10 job aggregate), AI maturity progression, 4 training sources, cross-module learning flow, and live learning example

**Connected to:**
- Architecture doc: `docs/architecture/universal-comms-and-learning.md`
- Navigation: `companyIntelligenceNav` in `src/config/navigation.ts`
- All other intelligence pages — Communication Hub feeds data to all AI modules
- Feature Registry — features appear in Settings > Features

---

### 2026-02-23 — Universal Communication Hub & Expanded Self-Learning Engine

**Why:** The user asked how the AI knows when something goes wrong (estimate error, field issue) and how it self-learns. They also asked: can we merge ALL communication platforms (iPhone messages, Gmail, Outlook, on-site conversations) into a single universal system where AI reads everything and updates jobs automatically? Two-way sync so replies go back through the original channel.

**What was designed:**
Full architecture doc created at `docs/architecture/universal-comms-and-learning.md` covering:

1. **Universal Communication Hub** — Every message from any platform (email, SMS, calls, on-site recordings, WhatsApp, Slack, portal) flows into one inbox. AI processes each message: identifies job, classifies type, extracts decisions/action items/dates/money, proposes downstream updates. User confirms. Replies route back through original channel (Gmail reply stays in Gmail thread, SMS reply goes back as SMS).

2. **Expanded Self-Learning Engine** — 45+ metrics per trade instance (up from ~15). 10 financial, 8 schedule, 8 quality, 7 communication, 5 safety, 7 contextual tags. Plus 12 metrics per material. Plus 10 per-job aggregate metrics. All feed back into estimating, scheduling, bidding, and Trade Intuition AI.

3. **On-Site Conversation Recording** — Mobile app has "Record Conversation" button. Audio → Whisper transcription → AI extraction → downstream updates with one-tap confirmation. Game-changer for capturing field decisions.

4. **Two-Way Sync Architecture** — Gmail API, Microsoft Graph (Outlook), Twilio (SMS/Voice), WhatsApp Business API. Each channel has inbound capture + outbound routing. Recipients never know messages came from/through RossOS.

5. **Database Schema** — `universal_messages`, `message_downstream_updates`, `channel_connections`, `trade_performance_metrics` (45 columns), `material_performance` (20+ columns).

6. **Implementation Roadmap** — 5 phases: Foundation → Email → SMS/Voice → Full Hub → Community Learning.

**Key design principle from user:** "You don't force anyone onto a new platform. RossOS wraps AROUND their existing tools."

**Connected to:**
- Module 05 (Notification Engine) — foundation for communication
- Module 12/29 (Client Portal) — portal messaging channel
- Module 30 (Vendor Portal) — vendor messaging channel
- Module 22 (Vendor Performance) — expanded metrics feed scoring
- Module 20 (Estimating) — actual vs estimated learning
- Module 23 (Price Intelligence) — material metrics
- Module 25 (Schedule Intelligence) — duration learning
- Trade Intuition AI — master engine consuming all data
- All intelligence pages — benefit from richer data
