# RossOS — Full 50-Module Build Plan
**Generated:** 2026-02-14 | **Updated:** 2026-02-14
**Starting State:** Phase 0B + Module 01 complete, committed, pushed
**Next Step:** Phase 0C (Foundation Hardening) — fix architectural gaps before Module 02

---

## Current Inventory

### What Exists in the Database
| Table | Migration | Status |
|-------|-----------|--------|
| companies | core_data_model | Deployed |
| users | core_data_model | Deployed |
| cost_codes | core_data_model | Deployed |
| vendors | core_data_model | Deployed |
| clients | core_data_model | Deployed |
| jobs | core_data_model | Deployed |
| job_assignments | core_data_model | Deployed |
| entity_change_log | core_data_model | Deployed |
| entity_snapshots | core_data_model | Deployed |
| roles | auth_module | Deployed |
| auth_audit_log | auth_module | Deployed |
| project_user_roles | auth_module | Deployed |
| gl_accounts | financial_foundation | Deployed |
| gl_journal_entries | financial_foundation | Deployed |
| gl_journal_lines | financial_foundation | Deployed |
| fiscal_periods | financial_foundation | Deployed |
| valid_status_transitions | financial_foundation | Deployed |

### What Exists in Code
- Auth system: login/logout/me endpoints, RBAC, permissions engine, AuthProvider
- API middleware: createApiHandler with auth, Zod validation, rate limiting, audit
- Validation: Zod schemas for auth, roles, users, common types
- Hooks: useAuth, usePermissions, useUsers, useRoles, useAuthAuditLog
- Tests: 113 passing (permissions, middleware, acceptance)
- CI/CD: GitHub Actions pipeline
- 67+ skeleton UI pages with mock data

---

## Phase 0C — Foundation Hardening (Pre-Module Build)
**Purpose:** Fix architectural gaps found during Context7 audit against latest docs for Next.js 16, Supabase SSR, Tailwind CSS v4, and TanStack React Query v5.
**Depends on:** Phase 0B + Module 01 (complete)
**Must complete before:** Any Module 02+ work begins

### 0C-1: Enforce Soft-Delete Architecture (HIGH)
**Problem:** Core tables (`companies`, `clients`, `jobs`, `vendors`, `invoices`, `draws`, `cost_codes`) lack `deleted_at` columns. Only `users` and `roles` have them. Architecture rule says "Soft delete only — nothing is permanently deleted" but the schema doesn't enforce it.

- **Migration:** Add `deleted_at TIMESTAMPTZ DEFAULT NULL` to `companies`, `clients`, `jobs`, `vendors`, `invoices`, `draws`, `cost_codes`
- **Index:** Add partial index `WHERE deleted_at IS NULL` on `company_id` for each table (replaces full-table scans with active-only scans)
- **Trigger:** Add `updated_at` trigger to all tables that don't have one

### 0C-2: Fix RLS Policies for Soft-Delete + Remove DELETE Policies (HIGH)
**Problem:** Existing RLS SELECT policies return soft-deleted rows. DELETE policies exist on tables where hard delete should never happen.

- **Drop** all `FOR DELETE` policies on: `clients`, `jobs`, `vendors`, `invoices`, `draws`
- **Replace** all `FOR SELECT` policies with versions that include `AND deleted_at IS NULL`
- **Add** a new `FOR UPDATE` pattern on each table that restricts setting `deleted_at` to authorized roles only (owner/admin)
- **Keep** `users_delete_by_owner` only if needed for Supabase auth cascade — otherwise replace with soft-delete
- **Verify** `FORCE ROW LEVEL SECURITY` remains on all tables

### 0C-3: Add Environment Variable Validation (MEDIUM)
**Problem:** All env var references use `process.env.VAR!` with non-null assertions. Missing vars produce cryptic runtime errors instead of clear startup failures.

- Create `src/lib/env.ts` with Zod schema validating all required env vars
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Export typed `env` object used everywhere instead of raw `process.env`
- Fail-fast at import time with descriptive error messages
- Update `server.ts`, `client.ts`, `middleware.ts`, and `createApiHandler` to use `env`

### 0C-4: Add HydrationBoundary SSR Prefetch Pattern (MEDIUM)
**Problem:** TanStack React Query v5 docs show App Router pages should use `HydrationBoundary` + `dehydrate` to pass prefetched data from Server Components to Client Components. Without this, every authenticated page fires client-side queries and shows loading spinners.

- Create `src/lib/query/get-query-client.ts` — server-side `getQueryClient()` factory (per TanStack docs)
- Update `(authenticated)/layout.tsx` to prefetch user profile data server-side with `queryClient.prefetchQuery()` and wrap children in `<HydrationBoundary state={dehydrate(queryClient)}>`
- Document the pattern in `docs/standards.md` so all future pages use it
- Example pattern for any page:
  ```tsx
  // Server Component
  const queryClient = getQueryClient()
  queryClient.prefetchQuery({ queryKey: ['resource'], queryFn: fetchResource })
  return <HydrationBoundary state={dehydrate(queryClient)}><ClientPage /></HydrationBoundary>
  ```

### 0C-5: Fix Duplicate Supabase Client in createApiHandler (MEDIUM)
**Problem:** `createApiHandler` in `src/lib/api/middleware.ts` creates a Supabase client at line 103 for auth, then creates a second one at line 201 for permission checks. Wasteful — should reuse.

- Hoist the Supabase client creation to the top of the `try` block
- Pass the same client instance to both auth check and permissions check
- Consider exposing the client on `ApiContext` so handlers can reuse it too:
  ```ts
  interface ApiContext {
    supabase: SupabaseClient<Database>  // add this
    user: { ... } | null
    companyId: string | null
    // ...
  }
  ```

### 0C-6: Plan JWT-Based company_id for RLS Performance (MEDIUM)
**Problem:** `get_current_company_id()` does a `SELECT company_id FROM users WHERE id = auth.uid()` on every RLS policy evaluation. At target scale (10K+ companies, 1M+ users), this adds a table lookup per row checked.

- **Phase 0C (plan only):** Document the migration path from table-lookup to JWT-based `company_id`
- **Future migration:** Store `company_id` in Supabase `app_metadata` on signup/company-switch
- **Future RLS function:** `auth.jwt() -> 'app_metadata' ->> 'company_id'` — zero table lookups
- **Blockers:** Requires Supabase Auth hook or trigger to set `app_metadata` on user creation
- **Risk mitigation:** Keep the table-lookup function as a fallback; swap atomically when ready
- **Action now:** Add a comment in the RLS migration documenting this planned optimization

### 0C-7: Rename Supabase Env Vars to New Convention (LOW)
**Problem:** Supabase renamed `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Old name still works but may be deprecated.

- Update `.env.local`, `.env.example`, and all code references
- Update `env.ts` validation schema (from 0C-3) to accept either name with deprecation warning
- Update Vercel/deployment env var configuration

### 0C-8: Add loading.tsx and unauthorized.tsx (LOW)
**Problem:** No streaming/suspense loading states during navigation. Next.js 16 supports `unauthorized()` function with `unauthorized.tsx` for clean 401 handling.

- Create `src/app/loading.tsx` — skeleton/spinner for root layout transitions
- Create `src/app/(authenticated)/loading.tsx` — skeleton for authenticated route transitions
- Create `src/app/unauthorized.tsx` — styled 401 page for Next.js `unauthorized()` function
- Optionally add `loading.tsx` to high-traffic route groups (jobs, invoices, etc.)

### 0C Validation Checklist
- [ ] All core tables have `deleted_at` column
- [ ] No `FOR DELETE` RLS policies remain (except auth cascade if needed)
- [ ] All `FOR SELECT` policies filter `deleted_at IS NULL`
- [ ] Env vars validated at startup with Zod — app fails fast if missing
- [ ] HydrationBoundary pattern documented and wired in authenticated layout
- [ ] Single Supabase client instance in createApiHandler
- [ ] `loading.tsx` and `unauthorized.tsx` exist
- [ ] All changes pass `tsc --noEmit` + `vitest run`

---

## Phase 1 — Foundation (Modules 01-06)

### Module 01 — Auth & Access Control [DONE]
- DB migration: roles, auth_audit_log, project_user_roles
- Auth TypeScript types (17 resources, 6 actions, 4 scopes)
- Permission resolution engine (7 roles, open/standard/strict modes)
- Enhanced createApiHandler (Zod + permissions)
- Auth API endpoints (login, logout, /me)
- User management endpoints (list, invite, get, update, deactivate, reactivate)
- Role management endpoints (list, create, get, update, soft-delete)
- Audit log endpoint + React Query hooks
- 113 tests + seed data

---

### Module 02 — Configuration Engine
**Purpose:** Makes the platform configurable per tenant
**Depends on:** Module 01

#### 02-A: Configuration DB Migration
- 16 tables: tenant_configs, workflow_definitions, cost_code_mappings, phase_templates, terminology_overrides, numbering_patterns, numbering_sequences, custom_field_definitions, custom_field_values, field_requirements, feature_flags, config_versions, config_templates, jurisdiction_configs, company_jurisdiction_overrides, user_preferences
- All with RLS, indexes, audit columns

#### 02-B: Config Resolution Engine
- `resolveConfig(key, { userId, projectId, companyId })` — 4-level hierarchy
- Cache layer with 5-min TTL, invalidate on write
- `useConfig()` React hook

#### 02-C: Feature Flags API + Hook
- `GET/PATCH /api/v1/features` — list/toggle
- `useFeatureFlags()` with `isEnabled(key)`
- Plan-gated enforcement

#### 02-D: Terminology Engine
- `GET/PUT /api/v1/terminology` — CRUD overrides
- `t(key)` translation function (server + client)
- ~50 default terms seeded

#### 02-E: Numbering Engine
- `GET/PUT/POST /api/v1/numbering` — patterns + preview
- `generateNextNumber(entityType, context)` with atomic counters

#### 02-F: Custom Fields API
- `GET/POST/PATCH/DELETE /api/v1/custom-fields/:entityType`
- Custom field renderer component
- Dynamic Zod schema extension

#### 02-G: Configuration Hooks + UI Wiring
- `useTerminology()`, `useNumbering()`, `useCustomFields()`, `useWorkflows()`
- Connect skeleton settings pages to real APIs

#### 02-H: Tests (~40)
- Config resolution, numbering engine, terminology, feature flags

---

### Module 03 — Core Data Model (Enhancement)
**Purpose:** CRUD APIs for all core entities + missing DB patterns
**Depends on:** Module 01, Module 02

#### 03-A: Schema Enhancement Migration
- Add `version`, `created_by`, `updated_by`, `deleted_by` columns where missing
- `import_batches` table, `parent_project_id` on jobs
- Trigram indexes for search

#### 03-B: Jobs CRUD API (~7 endpoints)
#### 03-C: Vendors CRUD API (~5 endpoints)
#### 03-D: Clients CRUD API (~5 endpoints)
#### 03-E: Cost Codes CRUD API (~5 endpoints + CSV import)
#### 03-F: Change History API
#### 03-G: React Query Hooks (~15 hooks)
#### 03-H: Connect Skeleton Pages to Real Data
#### 03-I: Tests (~50)

---

### Module 04 — Navigation, Search & Dashboard
**Purpose:** Cmd+K search, dashboard widgets, breadcrumbs, project switcher
**Depends on:** Module 03

#### 04-A: Search Infrastructure (search_index view, triggers, GIN indexes)
#### 04-B: Command Palette (Cmd+K) component
#### 04-C: Dashboard Widget Framework (registry, grid layout, role defaults)
#### 04-D: Dashboard Widgets V1 (5 widgets: status overview, my projects, approvals, activity, financial)
#### 04-E: Breadcrumbs + Project Switcher
#### 04-F: Tests (~25)

---

### Module 05 — Notification Engine
**Purpose:** Centralized event→notification routing
**Depends on:** Module 01, Module 02

#### 05-A: Notification DB Migration (6 tables)
#### 05-B: Notification Service Core (emit, resolve, route, render)
#### 05-C: In-App Notifications (API + bell component + SSE)
#### 05-D: Email Channel (SendGrid/Resend adapter)
#### 05-E: User Notification Preferences API
#### 05-F: Storm Protection (throttling, batching, digest)
#### 05-G: Tests (~30)

---

### Module 06 — Document Storage
**Purpose:** File upload, folders, versioning, expiration tracking
**Depends on:** Module 01, Module 02, Module 05

#### 06-A: Document DB Migration (6 tables + Supabase Storage bucket)
#### 06-B: Upload + Storage API (upload, download, delete, thumbnails, quota)
#### 06-C: Folder Management API (tree, create, rename/move, templates)
#### 06-D: Version Control (version history, side-by-side comparison)
#### 06-E: Expiration Tracking (alerts at 90/60/30/14 days, dashboard widget)
#### 06-F: Document Hooks + UI (useDocuments, dropzone, browser component)
#### 06-G: Tests (~25)

---

### Phase 1 Summary

| Module | Sub-tasks | New Tables | API Routes | Hooks | Tests |
|--------|-----------|------------|------------|-------|-------|
| 01 Auth [DONE] | 9 | 3 | 11 | 5 | 113 |
| 02 Config | 8 | 16 | ~25 | 6 | ~40 |
| 03 Core Data | 9 | 1+alters | ~20 | 15 | ~50 |
| 04 Nav/Search | 6 | 1 view | ~5 | 4 | ~25 |
| 05 Notifications | 7 | 6 | ~8 | 3 | ~30 |
| 06 Documents | 7 | 6 | ~12 | 4 | ~25 |
| **Phase 1 Total** | **46** | **33** | **~81** | **37** | **~283** |

---

## Phase 2 — Construction Core (Modules 07-12)

**Prerequisite:** Phase 1 complete. Platform has auth, config, CRUD, search, notifications, documents.

### Module 07 — Scheduling & Calendar
**Purpose:** Gantt chart, task management, dependencies, weather integration, resource allocation
**Depends on:** Module 03 (jobs), Module 05 (notifications), Module 06 (documents)

#### 07-A: Schedule DB Migration
- `schedule_tasks` — task entries with start/end, duration, predecessors
- `task_dependencies` — finish-to-start, start-to-start, etc.
- `schedule_baselines` — frozen schedule snapshots for comparison
- `schedule_templates` — reusable schedule templates per project type
- `resource_assignments` — crew/equipment allocation per task
- `weather_events` — cached weather data per project location

#### 07-B: Task CRUD API (~10 endpoints)
- List, create, update, delete, reorder, bulk update
- Dependency management (add/remove/validate for cycles)
- Critical path calculation

#### 07-C: Gantt Chart Component
- Interactive Gantt with drag-to-resize, drag-to-move
- Dependency arrows, critical path highlighting
- Baseline overlay comparison
- Zoom levels: day, week, month, quarter

#### 07-D: Calendar Views
- Month/week/day calendar with tasks, inspections, milestones
- Drag-and-drop task rescheduling
- Multi-project calendar overlay

#### 07-E: Weather Integration
- Weather API adapter (OpenWeather or similar)
- 10-day forecast overlay on schedule
- Rain/extreme temp/wind alerts affecting outdoor tasks
- Historical weather data for scheduling intelligence

#### 07-F: Schedule Templates
- Create from existing project, apply to new project
- Default templates per project type (from config engine)

#### 07-G: React Query Hooks + UI Wiring
- `useTasks()`, `useTask()`, `useCreateTask()`, `useUpdateTask()`
- `useScheduleBaseline()`, `useWeather()`
- Connect skeleton schedule/calendar pages

#### 07-H: Tests (~40)

---

### Module 08 — Daily Logs
**Purpose:** Field documentation with voice-to-text, crew tracking, weather recording
**Depends on:** Module 03 (jobs), Module 05 (notifications), Module 06 (documents)

#### 08-A: Daily Log DB Migration
- `daily_logs` — one per project per day, weather snapshot, notes
- `daily_log_entries` — individual entries (work, delay, visitor, safety)
- `crew_logs` — crew member hours per trade per day
- `daily_log_photos` — photos linked to log entries

#### 08-B: Daily Log CRUD API (~8 endpoints)
- Create/update log for a project+date
- Add entries (work performed, delays, visitors, safety observations)
- Crew tracking (who worked, hours, trade)
- Photo attachment

#### 08-C: Voice-to-Text Integration
- Speech recognition adapter (Web Speech API or cloud STT)
- Transcription→structured entry parsing
- Mobile-optimized voice capture UI

#### 08-D: Daily Log PDF Generation
- Auto-generated daily report PDF
- Builder-branded template
- Distribution to configurable recipients

#### 08-E: React Query Hooks + UI Wiring
- `useDailyLog(jobId, date)`, `useCreateEntry()`, `useCrewLog()`
- Connect skeleton daily-logs pages

#### 08-F: Tests (~25)

---

### Module 09 — Budget & Cost Tracking
**Purpose:** Budget creation, cost code allocation, variance analysis, committed costs
**Depends on:** Module 02 (config/cost codes), Module 03 (jobs, vendors)

#### 09-A: Budget DB Migration
- `budgets` — one per job, linked to contract amount
- `budget_lines` — line items by cost code with original/revised/committed/actual
- `budget_adjustments` — CO impact, allowance draws, contingency use
- `budget_transfers` — move money between budget lines

#### 09-B: Budget CRUD API (~12 endpoints)
- Create budget from estimate or blank
- Add/edit/delete budget lines
- Budget vs actual variance calculation
- Transfer between lines (requires approval above threshold)
- Budget snapshots for monthly reporting

#### 09-C: Cost Tracking Engine
- Committed costs (from POs and subcontracts)
- Actual costs (from paid invoices)
- Projected cost-at-completion calculation
- Over/under budget alerts (notification engine integration)

#### 09-D: Budget Views + Components
- Budget spreadsheet view (editable grid)
- Variance analysis charts (bar chart: budget vs committed vs actual)
- Cost code summary roll-up
- Profitability dashboard per job

#### 09-E: React Query Hooks + UI Wiring
- `useBudget(jobId)`, `useBudgetLines()`, `useCreateBudgetLine()`
- `useBudgetVariance()`, `useCostProjection()`
- Connect skeleton budget pages

#### 09-F: Tests (~35)

---

### Module 10 — Vendor Management
**Purpose:** Vendor directory, insurance compliance, contacts, trade categorization
**Depends on:** Module 03 (vendors CRUD), Module 05 (notifications), Module 06 (documents)

#### 10-A: Vendor Enhancement Migration
- `vendor_contacts` — multiple contacts per vendor
- `vendor_insurance_policies` — COI tracking with expiration
- `vendor_licenses` — license tracking per jurisdiction
- `vendor_notes` — internal notes and communication log
- `vendor_trade_assignments` — vendor-to-project trade mapping

#### 10-B: Vendor Compliance API (~8 endpoints)
- Insurance status check (current/expiring/expired)
- License validation
- W-9 tracking
- Compliance dashboard data

#### 10-C: Vendor Portal Prep
- Vendor-facing document upload (COIs, W-9s)
- Self-service profile update

#### 10-D: Vendor Hooks + UI Wiring
- `useVendorCompliance()`, `useVendorInsurance()`, `useVendorContacts()`
- Connect skeleton vendor pages (list, detail, compliance)

#### 10-E: Tests (~25)

---

### Module 11 — Basic Invoicing
**Purpose:** Invoice intake, approval workflow, payment tracking
**Depends on:** Module 03 (jobs, vendors), Module 05 (notifications), Module 09 (budgets)

#### 11-A: Invoice DB Migration
- `invoices` — header with vendor, job, amount, status
- `invoice_lines` — line items mapped to budget lines / cost codes
- `invoice_approvals` — approval chain tracking
- `invoice_payments` — payment records
- `invoice_attachments` — linked documents

#### 11-B: Invoice CRUD API (~12 endpoints)
- Create (manual entry or from document upload)
- Multi-step approval workflow (PM → accountant → owner based on thresholds)
- Payment recording
- Void/reject with reason
- Batch operations (approve multiple)

#### 11-C: Approval Workflow Engine
- Configurable approval chains (from Module 02 workflow_definitions)
- Threshold-based routing
- Approval notifications
- Escalation on overdue approvals

#### 11-D: Invoice Views + Components
- Invoice list with status filters
- Invoice detail with line items and approval history
- Approval queue (pending approvals for current user)
- Payment tracking view

#### 11-E: React Query Hooks + UI Wiring
- `useInvoices()`, `useInvoice()`, `useCreateInvoice()`, `useApproveInvoice()`
- Connect skeleton invoices pages

#### 11-F: Tests (~35)

---

### Module 12 — Basic Client Portal
**Purpose:** Client login, project visibility, photo sharing, basic communication
**Depends on:** Module 01 (auth), Module 03 (jobs, clients), Module 06 (documents)

#### 12-A: Client Portal DB Migration
- `portal_users` — client portal accounts (separate from internal users)
- `portal_sessions` — session tracking
- `portal_messages` — client↔builder messaging
- `portal_activity_log` — client portal activity tracking

#### 12-B: Portal Auth System
- Client registration/login (separate auth flow)
- Magic link or password-based
- Project access scoping (clients see only their projects)

#### 12-C: Portal API (~8 endpoints)
- Project overview (status, progress, photos)
- Document access (filtered: client-visible only)
- Message thread (send/receive messages)
- Photo gallery (filtered project photos)

#### 12-D: Portal UI Shell
- Separate layout for portal (client branding)
- Project dashboard (progress, upcoming milestones)
- Photo gallery component
- Message thread component

#### 12-E: React Query Hooks + UI
- `usePortalProject()`, `usePortalPhotos()`, `usePortalMessages()`
- Build portal pages under `(portal)/` route group

#### 12-F: Tests (~25)

---

### Phase 2 Summary

| Module | Sub-tasks | New Tables | API Routes | Key Feature |
|--------|-----------|------------|------------|-------------|
| 07 Scheduling | 8 | 6 | ~10 | Gantt chart + weather |
| 08 Daily Logs | 6 | 4 | ~8 | Voice-to-text + PDF |
| 09 Budget | 6 | 4 | ~12 | Variance analysis |
| 10 Vendors | 5 | 5 | ~8 | Insurance compliance |
| 11 Invoicing | 6 | 5 | ~12 | Approval workflows |
| 12 Client Portal | 6 | 4 | ~8 | Client-facing views |
| **Phase 2 Total** | **37** | **28** | **~58** | |

---

## Phase 3 — Financial Power (Modules 13-19)

**Prerequisite:** Phase 2 complete. Platform has scheduling, daily logs, budgets, invoicing, vendor management, client portal.

### Module 13 — AI Invoice Processing
**Purpose:** OCR extraction, line-item matching, auto-coding from uploaded invoice documents
**Depends on:** Module 06 (documents), Module 09 (budgets), Module 11 (invoicing)

#### 13-A: AI Processing DB Migration
- `ai_processing_queue` — document processing job queue
- `ai_extractions` — extracted data from documents with confidence scores
- `ai_extraction_feedback` — user corrections for model improvement
- `ai_vendor_aliases` — learned vendor name variations
- `ai_cost_code_mappings` — learned cost code associations

#### 13-B: OCR/Extraction Pipeline
- PDF text extraction (pdf-parse / Tika)
- Image OCR (Tesseract / cloud OCR)
- Structured data extraction (invoice number, vendor, date, amount, line items)
- Confidence scoring per field

#### 13-C: Auto-Matching Engine
- Vendor name fuzzy matching to existing vendors
- Cost code suggestion based on line item descriptions
- Historical pattern learning (vendor X always maps to cost code Y)
- Human-in-the-loop confirmation flow

#### 13-D: Review + Correction UI
- Side-by-side: original document + extracted data
- Field-level confidence indicators
- Click-to-correct with feedback loop
- Batch processing queue view

#### 13-E: Hooks + UI Wiring
- `useProcessingQueue()`, `useExtraction()`, `useApproveExtraction()`

#### 13-F: Tests (~30)

---

### Module 14 — Lien Waivers
**Purpose:** Conditional/unconditional waiver generation, tracking, compliance
**Depends on:** Module 03 (vendors, jobs), Module 11 (invoices), Module 06 (documents)

#### 14-A: Lien Waiver DB Migration
- `lien_waivers` — waiver records with type, status, amounts
- `lien_waiver_templates` — state-specific statutory forms
- `lien_waiver_tracking` — per-vendor per-draw compliance tracking

#### 14-B: Lien Waiver API (~8 endpoints)
- Generate waiver from template (auto-fill from invoice/draw data)
- Track status: requested → sent → received → verified
- Batch request for all vendors on a draw
- State-specific form selection

#### 14-C: Compliance Dashboard
- Which vendors have outstanding waivers
- Draw-level waiver completeness
- Alerts for missing waivers blocking draw submission

#### 14-D: Hooks + UI Wiring
- `useLienWaivers()`, `useGenerateWaiver()`, `useWaiverCompliance()`

#### 14-E: Tests (~20)

---

### Module 15 — Draw Requests
**Purpose:** AIA-format payment applications, lender submission, fund tracking
**Depends on:** Module 09 (budgets), Module 11 (invoicing), Module 14 (lien waivers)

#### 15-A: Draw DB Migration
- `draws` — draw request header (already exists, enhance)
- `draw_lines` — line items by cost code with schedule of values
- `draw_approvals` — approval chain
- `draw_submissions` — lender submission tracking
- `draw_funding` — fund receipt tracking

#### 15-B: Draw API (~10 endpoints)
- Create draw from budget (auto-populate schedule of values)
- G702/G703 format generation
- Submit to lender (PDF generation + email)
- Track funding receipt
- Retainage tracking and release

#### 15-C: Draw Workflow
- Draft → internal approval → lender submission → funded
- Lien waiver gate (all waivers received before submission)
- Inspector sign-off integration

#### 15-D: AIA Format PDF Generation
- G702 Application and Certificate for Payment
- G703 Continuation Sheet (schedule of values)
- Builder-branded cover letter

#### 15-E: Hooks + UI Wiring
- `useDraws()`, `useCreateDraw()`, `useDrawLines()`, `useSubmitDraw()`

#### 15-F: Tests (~25)

---

### Module 16 — QuickBooks Integration
**Purpose:** Two-way sync with QuickBooks Online
**Depends on:** Module 09 (budgets), Module 11 (invoicing), Module 03 (vendors, clients)

#### 16-A: Integration DB Migration
- `qb_connections` — OAuth tokens, company mapping
- `qb_entity_mappings` — RossOS entity ↔ QB entity ID mapping
- `qb_sync_log` — sync history with status and errors
- `qb_sync_rules` — configurable sync direction and frequency

#### 16-B: OAuth Flow
- QuickBooks OAuth 2.0 connect/disconnect
- Token refresh management
- Multi-company QB connection support

#### 16-C: Entity Sync Engine
- Vendor sync (RossOS → QB, QB → RossOS)
- Client/customer sync
- Invoice sync (approved invoices → QB bills)
- Payment sync (QB payments → RossOS)
- Chart of accounts mapping

#### 16-D: Sync Configuration UI
- Entity mapping interface
- Sync direction toggles
- Conflict resolution settings
- Sync history/error log viewer

#### 16-E: Hooks + UI Wiring
- `useQBConnection()`, `useSyncStatus()`, `useEntityMappings()`

#### 16-F: Tests (~25)

---

### Module 17 — Change Orders
**Purpose:** Scope changes, approval chains, budget impact tracking
**Depends on:** Module 09 (budgets), Module 03 (jobs), Module 05 (notifications)

#### 17-A: Change Order DB Migration
- `change_orders` — CO header with type, status, amount
- `change_order_lines` — line items with cost code, markup
- `change_order_approvals` — internal + client approval chain
- `change_order_attachments` — supporting documents

#### 17-B: Change Order API (~10 endpoints)
- Create CO (from RFI, from field condition, from client request)
- Markup calculation (configurable per builder)
- Internal approval workflow
- Client approval/signature
- Budget impact auto-update on approval

#### 17-C: Change Order Workflow
- Draft → internal review → client presentation → approved/rejected
- Auto-update budget and contract amount on approval
- Numbering engine integration (CO-001, CO-002)

#### 17-D: Hooks + UI Wiring
- `useChangeOrders()`, `useCreateCO()`, `useApproveCO()`
- Connect skeleton change-orders pages

#### 17-E: Tests (~25)

---

### Module 18 — Purchase Orders
**Purpose:** PO creation, vendor sending, receiving, budget gate enforcement
**Depends on:** Module 09 (budgets), Module 03 (vendors), Module 05 (notifications)

#### 18-A: Purchase Order DB Migration
- `purchase_orders` — PO header with vendor, job, status
- `po_lines` — line items with cost code, quantity, unit price
- `po_receipts` — goods/services received tracking
- `po_change_orders` — PO amendments

#### 18-B: Purchase Order API (~10 endpoints)
- Create PO (from budget line, from estimate, manual)
- Budget gate check (PO cannot exceed budget line remaining)
- Send to vendor (email with PDF)
- Receive against PO (partial/full)
- Close PO

#### 18-C: PO Workflow
- Draft → approved → sent → partially received → fully received → closed
- Budget commitment tracking (committed costs update on approval)
- Over-budget alert if PO would exceed budget

#### 18-D: Hooks + UI Wiring
- `usePurchaseOrders()`, `useCreatePO()`, `useReceiveAgainstPO()`
- Connect skeleton purchase-orders pages

#### 18-E: Tests (~25)

---

### Module 19 — Financial Reporting
**Purpose:** P&L, cash flow, WIP schedule, profitability analysis
**Depends on:** Module 09 (budgets), Module 11 (invoicing), Module 15 (draws), GL tables

#### 19-A: Report DB Migration
- `saved_reports` — user-saved report configurations
- `report_schedules` — auto-generated report schedule
- `report_snapshots` — monthly report snapshots for trending

#### 19-B: Report Generation Engine
- P&L by job, by date range
- Cash flow projection (based on approved invoices, expected draws)
- Work-in-Progress (WIP) schedule
- Job profitability analysis (revenue vs cost vs committed)
- Aged payables / aged receivables

#### 19-C: Report Views
- Interactive report viewer with drill-down
- Export to PDF, Excel, CSV
- Chart visualizations (bar, line, pie)
- Comparison views (month-over-month, job-over-job)

#### 19-D: Hooks + UI Wiring
- `useReport(type, params)`, `useSavedReports()`, `useExportReport()`
- Connect skeleton financial report pages

#### 19-E: Tests (~20)

---

### Phase 3 Summary

| Module | Sub-tasks | New Tables | API Routes | Key Feature |
|--------|-----------|------------|------------|-------------|
| 13 AI Invoicing | 6 | 5 | ~8 | OCR + auto-matching |
| 14 Lien Waivers | 5 | 3 | ~8 | State-specific forms |
| 15 Draw Requests | 6 | 5 | ~10 | AIA G702/G703 |
| 16 QuickBooks | 6 | 4 | ~8 | Two-way sync |
| 17 Change Orders | 5 | 4 | ~10 | Budget impact |
| 18 Purchase Orders | 5 | 4 | ~10 | Budget gate |
| 19 Fin. Reporting | 5 | 3 | ~6 | P&L, WIP, cash flow |
| **Phase 3 Total** | **38** | **28** | **~60** | |

---

## Phase 4 — Intelligence (Modules 20-28)

**Prerequisite:** Phase 3 complete. Platform has full financial pipeline (invoicing, draws, POs, COs, QB sync, reporting).

### Module 20 — Estimating Engine
**Purpose:** Cost database, assemblies, selection-based pricing, estimate-to-budget conversion
**Depends on:** Module 03 (cost codes), Module 09 (budgets), Module 02 (config)

#### 20-A: Estimating DB Migration
- `cost_code_libraries` — reusable cost code libraries
- `estimate_templates` — template estimates per project type
- `estimates` — estimate header with client, project type
- `estimate_sections` — sections grouping line items
- `estimate_lines` — individual line items with quantity, unit cost, markup
- `assemblies` — reusable groups of line items (e.g., "Standard Bathroom")
- `assembly_items` — items within assemblies
- `estimate_versions` — version history with snapshots

#### 20-B: Estimate CRUD API (~15 endpoints)
- Create estimate from template, blank, or clone
- Add/edit lines with cost code lookup
- Apply assemblies (insert assembly as line group)
- Markup configuration (per line, per section, global)
- Version comparison

#### 20-C: Estimate-to-Budget Conversion
- Convert approved estimate into job budget
- Map estimate lines to budget lines by cost code
- Handle allowances, contingency, markup

#### 20-D: Assembly Library
- Create/edit reusable assemblies
- Share assemblies across estimates
- Regional pricing adjustment

#### 20-E: Estimate Presentation
- Client-facing proposal PDF generation
- Configurable detail level (summary, detailed, itemized)
- Cover letter + terms + scope

#### 20-F: Hooks + UI Wiring
- `useEstimates()`, `useEstimate()`, `useAssemblies()`, `useCreateEstimate()`

#### 20-G: Tests (~35)

---

### Module 21 — Selection Management
**Purpose:** Client selection portal for finishes, fixtures, appliances
**Depends on:** Module 09 (budgets), Module 12 (client portal), Module 06 (documents)

#### 21-A: Selection DB Migration
- `selection_categories` — categories (flooring, plumbing, lighting, etc.)
- `selection_options` — available options with pricing, lead times
- `selection_sheets` — per-job selection tracking
- `selections` — client choices with status
- `selection_history` — change tracking
- `selection_media` — photos/specs per option

#### 21-B: Selection API (~12 endpoints)
- Category/option management
- Client selection workflow (presented → selected → approved → ordered)
- Budget impact calculation (selection vs allowance)
- Auto-PO generation on approval
- Change request handling

#### 21-C: Selection Portal (Client-Facing)
- Room-by-room presentation view
- Side-by-side option comparison
- Budget impact indicator
- Photo gallery per option

#### 21-D: Hooks + UI Wiring
- `useSelections()`, `useSelectionOptions()`, `useApproveSelection()`

#### 21-E: Tests (~25)

---

### Module 22 — Vendor Performance
**Purpose:** Automated scoring across quality, schedule, budget, communication, safety
**Depends on:** Module 03 (vendors), Module 07 (scheduling), Module 09 (budgets), Module 28 (punch lists)

#### 22-A: Performance DB Migration
- `vendor_scores` — computed scores per vendor per dimension
- `vendor_score_history` — score snapshots over time
- `vendor_performance_config` — weight configuration per builder
- `vendor_job_performance` — per-job per-vendor performance data

#### 22-B: Score Calculation Engine
- 5 dimensions: Quality (30%), Timeliness (25%), Budget (20%), Communication (15%), Safety (10%)
- Auto-calculation from: punch list counts, schedule adherence, CO frequency, response times
- Configurable weights per builder

#### 22-C: Performance API (~8 endpoints)
- Vendor scorecard
- Rankings by trade
- Historical trends
- Benchmark comparison

#### 22-D: Hooks + UI Wiring
- `useVendorScore()`, `useVendorRankings()`, `usePerformanceTrend()`

#### 22-E: Tests (~20)

---

### Module 23 — Price Intelligence
**Purpose:** Material/labor cost tracking, anomaly detection, savings quantification
**Depends on:** Module 03 (vendors, cost codes), Module 11 (invoicing), Module 18 (POs)

#### 23-A: Price Intelligence DB Migration
- `material_prices` — price history per material per vendor
- `material_categories` — organic category taxonomy
- `price_anomalies` — flagged unusual prices
- `price_benchmarks` — regional benchmark data
- `savings_records` — quantified savings from intelligence

#### 23-B: Price Tracking Engine
- Ingest prices from POs, invoices, quotes
- Normalize units for comparison
- Anomaly detection (statistical outlier flagging)
- Vendor comparison per material

#### 23-C: Price Intelligence API (~10 endpoints)
- Material price trends
- Vendor comparison for a material
- Anomaly alerts
- Savings dashboard data
- Regional benchmark comparison

#### 23-D: Hooks + UI Wiring
- `usePriceTrends()`, `useVendorComparison()`, `useAnomalies()`, `useSavings()`

#### 23-E: Tests (~20)

---

### Module 24 — AI Document Processing
**Purpose:** Auto-classify, extract, route any incoming document
**Depends on:** Module 06 (documents), Module 13 (AI extraction pipeline)

#### 24-A: AI Processing DB Migration
- `document_classifications` — AI-assigned document types
- `extraction_templates` — per-document-type extraction rules
- `extraction_feedback` — user corrections
- `photo_tags` — AI-generated photo tags
- `photo_annotations` — markup annotations on photos

#### 24-B: Classification Pipeline
- Document type detection (invoice, contract, COI, permit, plan, etc.)
- Confidence scoring
- Auto-routing to correct module
- Learning from user corrections

#### 24-C: Photo Intelligence
- Auto-tagging by trade, phase, room
- Progress photo comparison (before/after)
- Defect detection (V2)

#### 24-D: Hooks + UI Wiring
- `useDocumentClassification()`, `usePhotoTags()`, `useProcessingQueue()`

#### 24-E: Tests (~20)

---

### Module 25 — Schedule Intelligence
**Purpose:** AI-driven schedule analysis, duration prediction, weather impact, risk scoring
**Depends on:** Module 07 (scheduling), Module 23 (price intelligence data)

#### 25-A: Intelligence DB Migration
- `schedule_intelligence_models` — trained models per project type
- `schedule_risk_scores` — per-task risk assessment
- `weather_impact_history` — historical weather delay data
- `schedule_scenarios` — what-if scenario snapshots

#### 25-B: Duration Prediction Engine
- Learn from historical project durations
- Weather-adjusted duration estimates
- Seasonal pattern recognition
- Confidence intervals on predictions

#### 25-C: Risk Analysis
- Critical path risk scoring
- Weather risk windows
- Resource conflict detection
- Schedule health dashboard

#### 25-D: Hooks + UI Wiring
- `useScheduleRisk()`, `useDurationPrediction()`, `useWeatherImpact()`

#### 25-E: Tests (~20)

---

### Module 26 — Bid Management
**Purpose:** Bid packages, vendor invitations, comparison, award
**Depends on:** Module 03 (vendors, jobs), Module 06 (documents), Module 05 (notifications)

#### 26-A: Bid DB Migration
- `bid_packages` — scope packages for bidding
- `bid_invitations` — invitations sent to vendors
- `bid_responses` — vendor bids received
- `bid_comparisons` — leveled comparison data
- `bid_awards` — award records

#### 26-B: Bid API (~10 endpoints)
- Create bid package with scope, plans, specs
- Invite vendors (email with portal link)
- Receive/track responses
- Leveling and comparison matrix
- Award and notify

#### 26-C: Bid Comparison Component
- Side-by-side matrix view
- Scope gap highlighting
- AI-assisted recommendation

#### 26-D: Hooks + UI Wiring
- `useBidPackages()`, `useBidResponses()`, `useBidComparison()`

#### 26-E: Tests (~20)

---

### Module 27 — RFI Management
**Purpose:** Request for Information lifecycle, routing, impact assessment
**Depends on:** Module 03 (jobs), Module 05 (notifications), Module 06 (documents)

#### 27-A: RFI DB Migration
- `rfis` — RFI records with status, priority, due date
- `rfi_responses` — response entries with attachments
- `rfi_routing` — routing/distribution tracking

#### 27-B: RFI API (~8 endpoints)
- Create, route to architect/engineer, track response
- Impact assessment (cost/schedule)
- Link to change order if scope change results
- RFI log export

#### 27-C: Hooks + UI Wiring
- `useRFIs()`, `useCreateRFI()`, `useRFIResponse()`
- Plan markup integration for visual RFI location

#### 27-D: Tests (~15)

---

### Module 28 — Punch List & Quality
**Purpose:** Digital punch list, quality checklists, FTQ metrics
**Depends on:** Module 03 (jobs, vendors), Module 06 (documents/photos), Module 05 (notifications)

#### 28-A: Punch List DB Migration
- `punch_items` — items with location, trade, severity, status
- `punch_item_photos` — before/after photos
- `quality_checklists` — checklist templates by trade/phase
- `quality_checklist_items` — individual checklist items
- `quality_sign_offs` — inspection sign-off records

#### 28-B: Punch List API (~10 endpoints)
- Create items (with photo, location pin on floor plan)
- Assign to vendor, track completion
- Verification workflow (builder verifies vendor fix)
- Batch operations
- Back-charge tracking

#### 28-C: Quality Checklists
- Pre-built templates per trade (framing, electrical, plumbing, etc.)
- Custom checklist builder
- Inspection sign-off with digital signature

#### 28-D: Walkthrough Mode
- Mobile-optimized walkthrough interface
- Photo capture → auto-create punch item
- Floor plan pin placement
- Voice note attachment

#### 28-E: Hooks + UI Wiring
- `usePunchItems()`, `useCreatePunchItem()`, `useQualityChecklist()`

#### 28-F: Tests (~25)

---

### Phase 4 Summary

| Module | Sub-tasks | New Tables | API Routes | Key Feature |
|--------|-----------|------------|------------|-------------|
| 20 Estimating | 7 | 8 | ~15 | Assemblies + estimate→budget |
| 21 Selections | 5 | 6 | ~12 | Client selection portal |
| 22 Vendor Perf. | 5 | 4 | ~8 | 5-dimension scoring |
| 23 Price Intel. | 5 | 5 | ~10 | Anomaly detection |
| 24 AI Docs | 5 | 5 | ~8 | Auto-classify + route |
| 25 Schedule AI | 5 | 4 | ~6 | Duration prediction |
| 26 Bid Mgmt | 5 | 5 | ~10 | Comparison matrix |
| 27 RFIs | 4 | 3 | ~8 | Impact assessment |
| 28 Punch List | 6 | 5 | ~10 | Walkthrough mode |
| **Phase 4 Total** | **47** | **45** | **~87** | |

---

## Phase 5 — Full Platform (Modules 29-40)

**Prerequisite:** Phase 4 complete. Platform has estimating, selections, vendor scoring, price intelligence, AI docs, schedule AI, bids, RFIs, punch lists.

### Module 29 — Full Client Portal
**Purpose:** Enhanced portal with approvals, selections, payments, full project visibility
**Depends on:** Module 12 (basic portal), Module 21 (selections), Module 17 (COs)

#### 29-A: Portal Enhancement Migration
- `portal_approvals` — client approval tracking (selections, COs)
- `portal_payments` — client payment records
- `portal_photo_albums` — curated photo collections

#### 29-B: Enhanced Portal Features (~10 endpoints)
- Selection approval workflow (client approves in portal)
- Change order review and approval
- Payment history and upcoming payments
- Enhanced photo gallery with albums and progress tracking
- Document access (plans, contracts, warranties)
- Schedule visibility with milestone tracking

#### 29-C: Portal UI Pages
#### 29-D: Tests (~20)

---

### Module 30 — Vendor Portal
**Purpose:** Vendor self-service for schedule, documents, invoicing
**Depends on:** Module 10 (vendors), Module 06 (documents), Module 11 (invoicing)

#### 30-A: Vendor Portal Migration
- `vendor_portal_users` — vendor portal accounts
- `vendor_portal_access` — project-level access grants

#### 30-B: Vendor Portal Features (~10 endpoints)
- View assigned schedule tasks
- Upload documents (COIs, invoices, submittals)
- Submit invoices directly
- View payment status
- Respond to bid invitations
- Update company profile

#### 30-C: Portal UI Pages
#### 30-D: Tests (~20)

---

### Module 31 — Warranty & Home Care
**Purpose:** Warranty tracking, claims management, maintenance schedules
**Depends on:** Module 03 (jobs, clients, vendors), Module 05 (notifications)

#### 31-A: Warranty DB Migration
- `warranties` — warranty records per item/system
- `warranty_claims` — claim tracking with status
- `maintenance_schedules` — recommended maintenance items
- `maintenance_reminders` — scheduled reminders to homeowners

#### 31-B: Warranty API (~8 endpoints)
- Create warranties on project closeout
- Log claims, route to vendor
- Track resolution
- Maintenance schedule generation

#### 31-C: Homeowner Portal Integration
- Client portal warranty view
- Claim submission
- Maintenance calendar

#### 31-D: Hooks + UI Wiring
#### 31-E: Tests (~15)

---

### Module 32 — Permitting & Inspections
**Purpose:** Permit tracking, inspection scheduling, compliance documentation
**Depends on:** Module 03 (jobs), Module 07 (scheduling), Module 02 (jurisdiction config)

#### 32-A: Permitting DB Migration
- `permits` — permit records per project
- `permit_documents` — required/submitted docs per permit
- `inspections` — inspection scheduling and results
- `inspection_checklists` — jurisdiction-specific checklists

#### 32-B: Permit API (~8 endpoints)
- Track permit applications and status
- Required documents checklist
- Inspection scheduling and results logging
- Auto-populate from jurisdiction config

#### 32-C: Inspection Workflow
- Schedule inspection → notify superintendent → log result → update schedule
- Pass/fail tracking with required corrections
- Re-inspection scheduling

#### 32-D: Hooks + UI Wiring
#### 32-E: Tests (~20)

---

### Module 33 — Safety & Compliance
**Purpose:** OSHA compliance, incident tracking, toolbox talks
**Depends on:** Module 03 (jobs), Module 05 (notifications), Module 06 (documents)

#### 33-A: Safety DB Migration
- `safety_incidents` — incident reports
- `toolbox_talks` — safety meeting records with attendance
- `safety_checklists` — site safety inspection checklists
- `safety_certifications` — worker certification tracking

#### 33-B: Safety API (~8 endpoints)
- Incident reporting and investigation
- Toolbox talk scheduling and attendance
- Site safety inspections
- Certification tracking and expiration alerts

#### 33-C: Hooks + UI Wiring
#### 33-D: Tests (~15)

---

### Module 34 — HR & Workforce
**Purpose:** Employee management, certifications, time tracking
**Depends on:** Module 01 (auth/users), Module 07 (scheduling)

#### 34-A: HR DB Migration
- `employees` — employee records (extends users)
- `employee_certifications` — certifications with expiration
- `time_entries` — clock in/out and manual time entry
- `time_approvals` — supervisor approval of time
- `pay_rates` — rate history per employee

#### 34-B: Time Tracking API (~10 endpoints)
- Clock in/out (mobile-optimized)
- Manual time entry
- Supervisor approval workflow
- Overtime calculation
- Timesheet export (for payroll integration)

#### 34-C: Hooks + UI Wiring
#### 34-D: Tests (~20)

---

### Module 35 — Equipment & Assets
**Purpose:** Equipment tracking, maintenance schedules, daily rates
**Depends on:** Module 03 (jobs), Module 09 (budgets)

#### 35-A: Equipment DB Migration
- `equipment` — equipment/asset registry
- `equipment_assignments` — assignment to jobs
- `equipment_maintenance` — maintenance log and schedule
- `equipment_rates` — daily/hourly rate configuration

#### 35-B: Equipment API (~8 endpoints)
- CRUD for equipment registry
- Assign to / return from job
- Log maintenance
- Cost allocation to job budget

#### 35-C: Hooks + UI Wiring
#### 35-D: Tests (~15)

---

### Module 36 — Lead Pipeline & CRM
**Purpose:** Lead scoring, pipeline stages, follow-up automation
**Depends on:** Module 03 (clients), Module 05 (notifications), Module 02 (config)

#### 36-A: CRM DB Migration
- `leads` — lead records with source, score, stage
- `lead_activities` — interaction log (calls, emails, meetings)
- `pipeline_stages` — configurable pipeline stages
- `lead_scoring_rules` — automated scoring criteria

#### 36-B: Lead API (~10 endpoints)
- Lead intake (web form, manual, referral)
- Pipeline stage progression
- Activity logging
- Score calculation
- Convert lead → client + job

#### 36-C: Pipeline View Component
- Kanban board with drag-and-drop stage changes
- Lead detail with activity timeline
- Scoring breakdown

#### 36-D: Hooks + UI Wiring
#### 36-E: Tests (~20)

---

### Module 37 — Marketing & Portfolio
**Purpose:** Project portfolio, reviews, client outreach
**Depends on:** Module 03 (jobs), Module 06 (documents/photos)

#### 37-A: Marketing DB Migration
- `portfolio_projects` — curated project showcases
- `portfolio_photos` — selected photos with captions
- `client_reviews` — review collection and display
- `marketing_campaigns` — email campaign records

#### 37-B: Portfolio API (~6 endpoints)
- Curate portfolio from completed projects
- Collect and display reviews
- Email campaign management

#### 37-C: Hooks + UI Wiring
#### 37-D: Tests (~10)

---

### Module 38 — Contracts & E-Signature
**Purpose:** Contract document generation, signing workflow
**Depends on:** Module 06 (documents), Module 03 (jobs, clients)

#### 38-A: Contracts DB Migration
- `contract_templates` — document templates with merge fields
- `contracts` — generated contract records
- `contract_signatures` — signature tracking
- `contract_versions` — version history

#### 38-B: Contract Generation Engine
- Template → merge fields → PDF generation
- Variable substitution from job, client, estimate data
- Clause library (configurable per builder)

#### 38-C: E-Signature Integration
- DocuSign API integration
- Signature request workflow
- Status tracking (sent → viewed → signed)
- Auto-file signed document

#### 38-D: Hooks + UI Wiring
#### 38-E: Tests (~20)

---

### Module 39 — Advanced Reporting
**Purpose:** Custom report builder, executive dashboards, scheduled reports
**Depends on:** Module 19 (basic reporting), all data modules

#### 39-A: Report Builder DB Migration
- `report_definitions` — custom report configurations
- `report_widgets` — dashboard widget definitions
- `report_shares` — shared report access
- `scheduled_reports` — auto-generation schedules

#### 39-B: Report Builder Engine
- Drag-and-drop report designer
- Data source selection (any entity type)
- Filter/group/aggregate configuration
- Chart type selection
- Cross-project reporting

#### 39-C: Executive Dashboard
- Company-wide KPI dashboard
- Multi-project financial overview
- Trend analysis over time
- Benchmark comparison

#### 39-D: Hooks + UI Wiring
#### 39-E: Tests (~20)

---

### Module 40 — Mobile App
**Purpose:** React Native, offline-first, field-optimized
**Depends on:** All modules (mobile-optimized views of existing features)

#### 40-A: React Native Project Setup
- Expo or bare React Native project
- Shared API client with web app
- Offline storage (SQLite or WatermelonDB)
- Push notification setup (FCM/APNs)

#### 40-B: Offline-First Architecture
- Sync engine (queue mutations when offline, sync on reconnect)
- Conflict resolution strategy
- Offline data cache

#### 40-C: Field-Optimized Features
- Daily log entry (voice, photo, quick-add)
- Punch list walkthrough mode
- Time clock (GPS-verified clock in/out)
- Photo capture with auto-upload
- Quick approval actions

#### 40-D: Tests (~30)

---

### Phase 5 Summary

| Module | Sub-tasks | New Tables | API Routes | Key Feature |
|--------|-----------|------------|------------|-------------|
| 29 Full Client Portal | 4 | 3 | ~10 | Approvals + payments |
| 30 Vendor Portal | 4 | 2 | ~10 | Self-service |
| 31 Warranty | 5 | 4 | ~8 | Claims + maintenance |
| 32 Permitting | 5 | 4 | ~8 | Jurisdiction-aware |
| 33 Safety | 4 | 4 | ~8 | OSHA compliance |
| 34 HR/Workforce | 4 | 5 | ~10 | Time tracking |
| 35 Equipment | 4 | 4 | ~8 | Asset tracking |
| 36 Lead/CRM | 5 | 4 | ~10 | Pipeline + scoring |
| 37 Marketing | 4 | 4 | ~6 | Portfolio |
| 38 Contracts | 5 | 4 | ~8 | E-signature |
| 39 Adv. Reporting | 5 | 4 | ~8 | Custom builder |
| 40 Mobile | 4 | 0 | 0 | React Native |
| **Phase 5 Total** | **53** | **42** | **~94** | |

---

## Phase 6 — Scale & Sell (Modules 41-50)

**Prerequisite:** Phase 5 complete. Platform is feature-complete for construction management.

### Module 41 — Onboarding Wizard
**Purpose:** Guided setup assistant for new tenants
**Depends on:** Module 02 (config), Module 03 (core data)

#### 41-A: Onboarding DB Migration
- `onboarding_progress` — step completion tracking per tenant
- `onboarding_templates` — wizard step definitions

#### 41-B: Onboarding Wizard (~5 steps)
- Company info + logo upload
- Import cost codes (template or CSV)
- Define project phases
- Invite first team members
- Create first project

#### 41-C: Progressive Disclosure Engine
- Track setup completeness score
- "Getting Started" dashboard widget
- Contextual hints for first-time feature use

#### 41-D: Tests (~10)

---

### Module 42 — Data Migration
**Purpose:** Import from Buildertrend, CoConstruct, QuickBooks, Excel
**Depends on:** Module 03 (core data), Module 02 (config)

#### 42-A: Migration Framework
- Universal import adapter interface
- Dry-run validation before commit
- Rollback capability (via import_batches)
- Progress tracking with error reporting

#### 42-B: Source Adapters
- CSV/Excel universal importer
- Buildertrend export parser
- CoConstruct export parser
- QuickBooks Desktop/Online data mapper

#### 42-C: Entity Mapping UI
- Field mapping interface (source column → RossOS field)
- Data preview with validation errors
- Conflict resolution for duplicates

#### 42-D: Tests (~20)

---

### Module 43 — Subscription Billing
**Purpose:** Stripe integration, plan management, usage metering
**Depends on:** Module 01 (auth), Module 02 (feature flags)

#### 43-A: Billing DB Migration
- `subscriptions` — Stripe subscription records
- `subscription_plans` — plan definitions
- `usage_records` — metered usage tracking
- `billing_history` — invoice/payment history

#### 43-B: Stripe Integration
- Checkout session creation
- Subscription lifecycle management (create, upgrade, downgrade, cancel)
- Webhook handler for payment events
- Usage-based billing metering

#### 43-C: Plan Management UI
- Current plan display
- Upgrade/downgrade flow
- Billing history
- Payment method management

#### 43-D: Feature Gating Integration
- Sync Stripe plan → feature_flags table
- Enforce feature access based on plan

#### 43-E: Tests (~20)

---

### Module 44 — White-Label & Branding
**Purpose:** Custom domains, logos, themes per tenant
**Depends on:** Module 02 (config), Module 12 (client portal)

#### 44-A: Branding DB Migration
- `tenant_branding` — colors, fonts, logos, custom CSS
- `custom_domains` — custom domain mapping

#### 44-B: Theming Engine
- CSS custom properties driven by tenant branding
- Logo injection in nav, portal, documents, emails
- Custom favicon

#### 44-C: Custom Domain Support
- Domain verification (CNAME/TXT record check)
- SSL certificate provisioning
- Routing middleware for custom domains

#### 44-D: Tests (~10)

---

### Module 45 — API & Marketplace
**Purpose:** Public REST API, third-party integrations, webhooks
**Depends on:** All modules (exposes them via API)

#### 45-A: Public API Framework
- API key management (create, rotate, revoke)
- OAuth 2.0 for third-party apps
- Rate limiting per API key
- Versioned API (v1 → v2 migration path)

#### 45-B: Webhook System
- Webhook registration per event type
- Delivery with retry and logging
- Signature verification

#### 45-C: API Documentation
- Auto-generated OpenAPI/Swagger spec
- Interactive API explorer
- Code examples (curl, JavaScript, Python)

#### 45-D: Marketplace Foundation
- Integration listing page
- Connect/disconnect flow
- Integration health monitoring

#### 45-E: Tests (~20)

---

### Module 46 — Customer Support
**Purpose:** Ticket system, knowledge base, in-app help
**Depends on:** Module 01 (auth), Module 05 (notifications)

#### 46-A: Support DB Migration
- `support_tickets` — ticket records with priority, status
- `ticket_messages` — message thread per ticket
- `knowledge_base_articles` — help articles
- `knowledge_base_categories` — article categorization

#### 46-B: Ticket System (~6 endpoints)
- Create ticket (in-app or email)
- Internal assignment and routing
- Status updates with notification
- Resolution and satisfaction tracking

#### 46-C: Knowledge Base
- Article CRUD with markdown content
- Category organization
- Search within knowledge base
- Contextual help links (in-app "?" buttons)

#### 46-D: Tests (~15)

---

### Module 47 — Training Platform
**Purpose:** Courses, certification, progress tracking
**Depends on:** Module 01 (auth), Module 46 (knowledge base)

#### 47-A: Training DB Migration
- `courses` — training course definitions
- `course_modules` — modules within courses
- `course_content` — individual content pieces (video, text, quiz)
- `user_progress` — per-user course progress
- `certifications` — earned certifications

#### 47-B: Training API (~8 endpoints)
- Course catalog
- Enroll / track progress
- Quiz submission and grading
- Certification issuance

#### 47-C: Training UI
- Course viewer with progress bar
- Video player with bookmarking
- Quiz component
- Certificate display

#### 47-D: Tests (~10)

---

### Module 48 — Template Marketplace
**Purpose:** Shared estimate/proposal/checklist templates
**Depends on:** Module 20 (estimating), Module 02 (config)

#### 48-A: Marketplace DB Migration
- `marketplace_templates` — published templates
- `template_reviews` — ratings and reviews
- `template_downloads` — download tracking

#### 48-B: Marketplace API (~6 endpoints)
- Browse and search templates
- Preview before download
- Download/install into tenant
- Submit template for publishing
- Rate and review

#### 48-C: Tests (~10)

---

### Module 49 — Platform Analytics
**Purpose:** Usage analytics, admin dashboard, health monitoring
**Depends on:** All modules

#### 49-A: Analytics DB Migration
- `usage_events` — user action tracking (anonymized)
- `platform_metrics` — aggregated platform health metrics
- `tenant_health_scores` — per-tenant engagement scoring

#### 49-B: Analytics Pipeline
- Event collection (client-side + server-side)
- Aggregation jobs (daily/weekly/monthly rollups)
- Tenant health scoring (engagement, feature adoption, growth)

#### 49-C: Platform Admin Dashboard
- Active tenants, MRR, churn
- Feature adoption rates
- System health (API latency, error rates)
- Tenant health leaderboard

#### 49-D: Tests (~15)

---

### Module 50 — Marketing Website
**Purpose:** Public-facing website, sales pipeline
**Depends on:** Module 43 (billing for signup flow)

#### 50-A: Marketing Site
- Landing page with feature highlights
- Pricing page with plan comparison
- Demo request form
- Blog/content management (or headless CMS integration)
- SEO optimization

#### 50-B: Signup Flow
- Email capture → trial creation
- Connect to onboarding wizard (Module 41)
- Stripe checkout integration

#### 50-C: Tests (~10)

---

### Phase 6 Summary

| Module | Sub-tasks | New Tables | API Routes | Key Feature |
|--------|-----------|------------|------------|-------------|
| 41 Onboarding | 4 | 2 | ~3 | 5-min setup wizard |
| 42 Data Migration | 4 | 0 | ~4 | Multi-source import |
| 43 Billing | 5 | 4 | ~8 | Stripe integration |
| 44 White-Label | 4 | 2 | ~4 | Custom branding |
| 45 API/Marketplace | 5 | 3+ | ~10 | Public API + webhooks |
| 46 Support | 4 | 4 | ~6 | Tickets + KB |
| 47 Training | 4 | 5 | ~8 | Course platform |
| 48 Templates | 3 | 3 | ~6 | Template marketplace |
| 49 Analytics | 4 | 3 | ~4 | Platform dashboard |
| 50 Marketing | 3 | 0 | ~2 | Public site + signup |
| **Phase 6 Total** | **40** | **26** | **~55** | |

---

## Full Platform Summary

| Phase | Modules | Sub-tasks | New Tables | API Routes | Key Milestone |
|-------|---------|-----------|------------|------------|---------------|
| 1 Foundation | 01-06 | 46 | 33 | ~81 | Auth, config, CRUD, search, notifications, docs |
| 2 Construction | 07-12 | 37 | 28 | ~58 | Scheduling, daily logs, budget, invoicing, portal |
| 3 Financial | 13-19 | 38 | 28 | ~60 | AI invoicing, liens, draws, QB, COs, POs, reports |
| 4 Intelligence | 20-28 | 47 | 45 | ~87 | Estimating, selections, AI docs, bids, punch lists |
| 5 Full Platform | 29-40 | 53 | 42 | ~94 | Portals, warranty, safety, HR, CRM, mobile |
| 6 Scale & Sell | 41-50 | 40 | 26 | ~55 | Onboarding, billing, API, analytics, website |
| **TOTAL** | **50** | **261** | **202** | **~435** | **Production SaaS** |

---

## Dependency Graph

```
Phase 1: 01 → 02 → 03 → 04
              ↘ 05 → 06

Phase 2: 03 → 07 → 08
         03 + 02 → 09 → 11
         03 → 10
         01 + 03 → 12

Phase 3: 06 + 09 + 11 → 13
         03 + 11 → 14
         09 + 14 → 15
         09 + 11 + 03 → 16
         09 + 03 → 17, 18
         09 + 11 + 15 → 19

Phase 4: 03 + 09 → 20
         09 + 12 → 21
         03 + 07 + 09 → 22
         03 + 11 + 18 → 23
         06 + 13 → 24
         07 + 23 → 25
         03 + 06 → 26, 27
         03 + 06 → 28

Phase 5: 12 + 21 → 29
         10 + 06 → 30
         03 → 31, 32, 33, 34, 35, 36, 37
         06 + 03 → 38
         19 → 39
         ALL → 40

Phase 6: 02 + 03 → 41, 42
         01 + 02 → 43
         02 + 12 → 44
         ALL → 45, 49
         01 → 46, 47
         20 → 48
         43 → 50
```

---

## Validation Protocol

After each module:
```bash
cd app
npx tsc --noEmit           # Zero type errors
npx vitest run             # All tests pass
npx eslint src/            # No lint errors in new code
```

After each module, commit and push to remote.
