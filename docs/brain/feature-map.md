# Feature Map — RossOS Construction Intelligence Platform

## Session 10 — V1 Error Handling, Import Cleanup, DB Indexes (2026-02-26)

### V1 Route Error Handling Fix (9 files)
- 8 files switched from generic `{ error: 'Database Error', status: 500 }` to `mapDbError()` for proper Postgres error code mapping
- Files: custom-fields (route + [id]), audit-log, settings/company, settings/phases (route + [id]), workflows (route + [entityType])
- `mapDbError` import added to all 8 files (cost-codes/[id] already had it)

### Missing Soft-Delete Filters (2 fixes)
- `cost-codes/[id]` GET: Added `.is('deleted_at', null)` — was returning archived cost codes
- `workflows/[entityType]` PUT: Added `.is('deleted_at', null)` on is_default update — could accidentally unset default on archived workflows

### Duplicate Import Consolidation (204 files)
- All v2 API routes had `import { mapDbError } from '@/lib/api/middleware'` on a separate line
- Merged into the existing destructured import block — pure cleanup, no behavior change

### Database Performance Indexes (72 indexes applied to live DB)
- 70 partial indexes: `CREATE INDEX idx_*_active ON table (company_id) WHERE deleted_at IS NULL` for tables missing this pattern
- 2 FK indexes on `lien_waiver_tracking`: `job_id` and `vendor_id`
- Migration files: `20260226000001_add_active_record_indexes.sql`, `20260226000002_add_lien_waiver_tracking_fk_indexes.sql`

## Session 9 — Rate Limits, Audit Actions, Pagination, Cross-Tenant (2026-02-26)

### Financial Rate Limit Tier Hardening (35 files total)
- **17 files (first pass):** budgets (2), change-orders (4), cost-transactions (1), invoice-extractions (4), lien-waivers (2), purchase-orders (1), payroll (3) — all changed `rateLimit: 'api'` → `rateLimit: 'financial'`
- **18 files (second pass):** PO sub-routes (approve/send/receipts/lines/[lineId]), budget lines, lien-waiver-templates, lien-waiver-tracking — same rate limit fix plus audit actions

### Audit Action Coverage (18 files, 20+ actions)
- **Security-critical:** `api_key.create`, `api_key.update`, `api_key.revoke` — all API key operations now audit-logged
- **Financial:** `cost_transaction.create`, `extraction.create`, `extraction.update`, `extraction.review`, `extraction.create_bill`, `po.approve`, `po.send`, `po_receipt.create`, `po_line.create`, `po_line.update`, `po_line.archive`, `budget_line.update`, `budget_line.archive`, `lien_waiver_template.create`, `lien_waiver_template.update`, `lien_waiver_template.archive`, `lien_waiver_tracking.create`

### Cross-Tenant Security (3 files — from Session 8 continuation)
- documents/[id]/versions PUT: Added `.eq('company_id', ctx.companyId!)` to documents UPDATE
- ai-documents/extractions/[id] GET: Added `.eq('company_id', ctx.companyId!)` to ai_feedback SELECT
- advanced-reports/dashboards/[id] GET: Added `.eq('company_id', ctx.companyId!)` to dashboard_widgets SELECT

### Pagination Added to Sub-Resource Endpoints (5 files)
- `/api/v2/documents/:id/versions` GET — now uses `getPaginationParams` + `paginatedResponse`
- `/api/v2/daily-logs/:id/entries` GET — now paginated
- `/api/v2/daily-logs/:id/photos` GET — now paginated
- `/api/v2/daily-logs/:id/labor` GET — now paginated
- `/api/v2/punch-list/:id/photos` GET — now paginated

### Scans Completed (All Clean)
- **Input validation:** All 396+ POST/PUT handlers use Zod safeParse — zero gaps
- **Error response consistency:** All 430 route files use `{ error, message, requestId }` pattern — zero gaps
- **Soft-delete on list endpoints:** All GET list routes have `.is('deleted_at', null)` where applicable — zero gaps
- **HTTP method consistency:** All 430 route files use correct export patterns (GET+POST parent, GET+PUT+DELETE child) — zero deviations

## Session 8 — V2 Soft-Delete, Sensitive Data, Unhandled Operations (2026-02-26)

### V2 Soft-Delete Filter Fixes (6 files, 12 queries)
- builder_terminology [id] GET/PUT/DELETE: Added `.is('deleted_at', null)` — prevents accessing archived terminology
- document_folders [id] PUT fetch + DELETE children check: Added `.is('deleted_at', null)` — prevents editing/counting archived folders
- sync_mappings [id] PUT existence + update + DELETE existence: Added `.is('deleted_at', null)` — prevents modifying archived mappings
- labor_rates [id] PUT + DELETE: Added `.is('deleted_at', null)` — prevents editing archived rates; DELETE now properly soft-deletes with `deleted_at`
- labor_rates GET list: Added `.is('deleted_at', null)` — list was missing soft-delete filter
- lien_waiver_templates [id] PUT + DELETE: Added `.is('deleted_at', null)` — prevents modifying archived templates

### Sync Logs Error Details Exclusion (3 files)
- sync_logs GET list: `select('*')` → explicit columns excluding `error_details` (may contain stack traces, API errors)
- sync_logs in connections/[id] GET: `select('*')` → explicit columns excluding `error_details`
- sync_logs in connections/[id]/sync POST: `select('*')` → explicit columns excluding `error_details`

### Unhandled DB Operations Fixed (22 files, ~30 operations)
**Critical cascading — now return errors to client:**
- GL journal entry [id] PUT: line delete + line insert now checked (prevents data loss if insert fails after delete)
- Contract signer sign: contract status update to `fully_signed`/`partially_signed` now checked
- PO receipt POST: PO status update to `received`/`partially_received` now checked (added `company_id` filter too)
- Draw request lines POST: draw totals recalculation now checked
- Document version POST: document metadata update now checked
- Bid package award POST: bid package status update to `awarded` now checked
- Invoice extraction create-bill: extraction-to-bill linkage now checked
- RFI response POST (official): RFI status update to `answered` now checked
- Payroll export POST: time entry status + payroll period status now checked

**Non-critical — now log errors via console.error:**
- Draw request history (create/approve/submit) — 3 files
- Selection history (create/update) — 2 files
- Warranty claim history (create/update/resolve) — 3 files
- Extraction audit log (create/review/match) — 3 files
- Bid invitation status update
- Template version update
- Support ticket first_response_at update

## Session 7 — API Consistency, Soft-Delete Fixes, mapDbError Standardization (2026-02-26)

### Webhook Secret Exposure Fix (3 files, 5 queries)
- webhook_subscriptions GET list: `select('*')` → explicit columns excluding `secret`
- webhook_subscriptions GET by ID: `select('*')` → explicit columns excluding `secret`
- webhook_subscriptions PUT: `select('*')` → explicit columns excluding `secret`
- webhook_subscriptions POST: includes `secret` in select (returned ONCE on creation only)
- webhook_deliveries GET list: `select('*')` → explicit columns (no sensitive fields but explicit for consistency)

### V1 API Response Consistency (16 files, 19 endpoints)
- Added missing `requestId` to POST 201 responses: clients, vendors, cost-codes, jobs, users/invite
- Added missing `requestId` to user action endpoints: deactivate, reactivate
- Added missing `requestId` to all settings routes: feature-flags GET/PATCH, terminology GET/PATCH/POST, numbering GET/PATCH/POST, company GET/PATCH, phases GET/POST
- Fixed error.message leak in phases [id] route PATCH handler

### Soft-Delete Filter Fixes (4 files, 8 queries)
- clients/[id] GET + PATCH: Added `.is('deleted_at', null)` — prevents returning/editing archived clients
- vendors/[id] GET + PATCH: Added `.is('deleted_at', null)` — prevents returning/editing archived vendors
- jobs/[id] GET + PATCH: Added `.is('deleted_at', null)` — prevents returning/editing archived jobs
- users/[id] GET + PATCH: Added `.eq('is_active', true).is('deleted_at', null)` — prevents returning/editing deactivated users

### mapDbError Standardization (14 files, 20 error handlers)
- All v1 CRUD routes now use `mapDbError()` instead of generic 500 responses
- clients, vendors, cost-codes, jobs: GET list + POST create + PATCH update
- users: GET list + PATCH update + deactivate + reactivate
- roles: GET list + POST create + PATCH update + DELETE (replaced manual error.code checks)
- Returns proper HTTP status codes: 409 for unique conflicts, 400 for FK/not-null violations, 403 for RLS

## Session 6 — Sensitive Data Exposure, Error Info Leakage, Auth Hardening (2026-02-26)

### Sensitive Data Exposure Fixes (6 files, 12 queries)
- api_keys GET/POST list + GET/PUT by ID: `select('*')` → explicit columns excluding `key_hash`
- accounting_connections GET/POST list + GET/PUT by ID: `select('*')` → explicit columns excluding `access_token_encrypted`, `refresh_token_encrypted`, `token_expires_at`
- push_notification_tokens GET list + POST + GET/PUT by ID: `select('*')` → explicit columns excluding `token`

### Cross-Tenant Data Exposure Fixes (3 files)
- estimates/[id]/lines/[lineId] PUT: Added `.eq('company_id', ctx.companyId!)` to UPDATE query
- advanced-reports/[id] GET: Added `company_id` filter to widgets sub-query
- training/paths/[id] GET: Added `company_id` filter to items sub-query

### Consistent Error Handling (15 child-resource route files)
- 15 route files switched from hardcoded 404 to `mapDbError()` for mutation errors
- Tables: budget lines, change order items, CRM pipeline stages, PO lines, vendor contacts, vendor insurance, RFI responses, RFI routing, safety inspection items, toolbox talk attendees, bid invitations, bid responses, AI document classifications, report snapshots, estimate line items

### Unchecked DB Operations Fixed (5 files, 8 operations)
- AP bills PUT: Added error checks to line delete + line insert
- AR invoices PUT: Added error checks to line delete + line insert
- Material requests PUT: Added error checks to item delete + item insert
- Feature request votes POST: Added error check to vote_count increment
- Feature request votes DELETE: Added error check to vote_count decrement

### Error Info Leakage Prevention (11 files)
- `mapDbError()` fallback: No longer returns raw `error.message` or `error.details` — always generic messages
- 8 v1 routes: Replaced `error.message` with generic 'An unexpected database error occurred'
- 2 cron routes: Replaced `error.message` in response with generic messages

### Auth Hardening (2 files)
- /api/docs: Wrapped in `createApiHandler` with `requireAuth: true, requiredRoles: ['owner', 'admin']`
- /api/docs/gaps: Same — was previously publicly accessible with no auth

### Input Validation Fix (2 files)
- folders/route.ts POST: Changed `body.job_id` → `input.job_id` (use validated data)
- documents.ts schema: Added `job_id` to `createFolderSchema`

---

## Session 5 — Tenant Isolation, Audit Logging, Rate Limiting (2026-02-26)

### Tenant Isolation — company_id on Line-Item DELETEs (5 routes)
- estimates/[id]/lines/[lineId] DELETE: `.eq('company_id', ctx.companyId!)`
- safety/inspections/[id]/items/[itemId] DELETE: `.eq('company_id', ctx.companyId!)`
- punch-list/[id]/photos/[photoId] DELETE: `.eq('company_id', ctx.companyId!)`
- quality-checklists/templates/[id]/items/[itemId] DELETE: `.eq('company_id', ctx.companyId!)`
- safety/toolbox-talks/[id]/attendees/[attendeeId] DELETE: `.eq('company_id', ctx.companyId!)`

### Deleted_at Consistency (11 queries across 6 files)
- GL journal entries GET: `.is('deleted_at', null)`
- push-tokens PUT + DELETE-verify: `.is('deleted_at', null)`
- sync-queue PUT + DELETE-verify: `.is('deleted_at', null)`
- hr/documents PUT: `.is('deleted_at', null)`
- report-schedules PUT: `.is('deleted_at', null)`
- marketplace reviews PUT-verify + update + DELETE-verify: `.is('deleted_at', null)`

### Audit Logging Coverage (28 handlers across 17+ files)
- Budgets: budget.create, budget.update, budget.archive, budget_line.create
- Change Orders: change_order.create, change_order.update, change_order.archive, change_order.approve
- Contracts: contract.create, contract.update, contract.archive
- Purchase Orders: po.create, po.update, po.archive
- GL Accounts: gl_account.create, gl_account.update
- Financial Periods: financial_period.create, financial_period.update
- Draw Request Lines: draw_request_lines.update
- Lien Waivers: lien_waiver.create, lien_waiver.update, lien_waiver.archive, lien_waiver.approve
- Billing Plans: billing_plan.create, billing_plan.update, billing_plan.deactivate
- Billing Usage: usage_record.create, usage_record.update
- Report Generation: report.generate

### Financial Rate Limiting (14 mutation routes)
- Budgets (create/update/archive + budget line create): 'api' → 'financial'
- Change Orders (create/update/archive/approve): 'api' → 'financial'
- Contracts (create/update/archive): 'api' → 'financial'
- Purchase Orders (create/update/archive): 'api' → 'financial'
- Lien Waivers (create/update/archive/approve): 'api' → 'financial'
- Report Generation: 'api' → 'financial'

---

## Session 4 — Race Conditions, Error Sanitization, Soft Delete (2026-02-26)

### Atomic Financial Balance Updates (3 PostgreSQL RPC functions)
- `apply_payment_to_bill(p_bill_id, p_company_id, p_amount)` — single-statement UPDATE on ap_bills
- `apply_receipt_to_invoice(p_invoice_id, p_company_id, p_amount)` — single-statement UPDATE on ar_invoices
- `increment_po_line_received(p_line_id, p_quantity)` — atomic increment on purchase_order_lines
- AP payments POST, AR receipts POST, PO receipts POST all use RPC instead of read-then-write

### Status Transition WHERE Guards (7 routes)
- GL journal entries PUT: `.eq('status', 'draft')` on UPDATE query
- Change orders PUT: `.in('status', ['draft', 'pending_approval'])` on UPDATE query
- Bid packages PUT: `.eq('status', existing.status)` on UPDATE query
- Contracts PUT: `.eq('status', existing.status)` on UPDATE query
- Budgets PUT: locked/archived check + `.eq('status', existing.status)` on UPDATE query
- AP bills PUT: `.eq('status', existing.status)` on UPDATE query
- AR invoices PUT: `.eq('status', existing.status)` on UPDATE query

### Error Message Sanitization (31 total across 24 files)
- All `{ error: 'Database Error', message: xxxError.message }` replaced with `mapDbError()`
- Zero raw error.message strings remain in v2 API routes

### Line Total Validation (4 routes)
- AP bills POST/PUT: validates sum(line.amount) == header amount
- AR invoices POST/PUT: validates sum(line.amount) == header amount

### Soft Delete Expansion (5 more tables)
- employee_documents, marketplace_reviews, push_notification_tokens, offline_sync_queue, report_schedules
- DB migration: deleted_at column + partial index on each
- 12 queries updated with .is('deleted_at', null) filter

### Malformed JSON Body Guard (middleware)
- createApiHandler catch block detects SyntaxError from req.json() and returns 400 instead of 500
- Covers all 397+ POST/PUT/PATCH routes automatically

---

## Session 3 — Performance, Console Cleanup, Injection Fixes (2026-02-26)

### DB Performance — 103 FK Indexes Added
- All foreign key columns now indexed for fast JOINs and DELETE cascades
- user_company_memberships: merged 2 permissive SELECT policies into 1 combined policy
- Performance advisors: 0 WARN remaining

### Console Cleanup — 37 Calls Replaced/Removed
- cache/index.ts, queue/index.ts, rate-limit/index.ts, email/resend.ts: console.error → logger.error with structured context
- 9 skeleton preview files: removed 27 placeholder console.log/warn calls
- Remaining console calls are all expected: logger implementation (5), error.tsx boundaries (79), client components (10)

### PostgREST Injection Fix — 6 Pages
- daily-logs, communications, draws, inspections, inventory, submittals pages
- Added `escapeLike()` around search input before `.or()` ILIKE patterns
- Without escaping, attackers could inject PostgREST filter conditions via `%`, `_`, or `\`

### Soft Delete Compliance — 4 More Tables
- Added deleted_at to: lien_waiver_templates, document_folders, builder_terminology, sync_mappings
- Converted 4 DELETE handlers from `.delete()` to `.update({ deleted_at })`
- Added `.is('deleted_at', null)` to list endpoints for schedule_baselines, portal_messages, hr_certifications

### Env Validation + Header Cleanup
- Cron routes use `serverEnv.CRON_SECRET` (Zod-validated) instead of raw `process.env.CRON_SECRET`
- Removed 4 duplicate security headers from vercel.json (middleware.ts is single source of truth)

---

## Type System Overhaul — database.ts Regenerated, 430 Files Type-Safe (2026-02-26)

### database.ts Regenerated from Live Supabase Schema
- Full regeneration from Supabase introspection — 17,553 lines of types covering all tables, views, functions, enums
- Json type extended: `string | number | boolean | null | Record<string, unknown> | unknown[]` — adds Zod compatibility (Zod outputs `Record<string, unknown>` not `{ [key: string]: Json }`)
- 194 convenience type aliases restored at bottom of file (Job, JobInsert, JobUpdate, User, Company, Vendor, etc.)
- All table Row/Insert/Update types now match live DB schema exactly

### Blanket `(supabase as any)` Removed (430 files, 1,382 casts)
- **Before:** 430 API route files used `(supabase as any).from('table_name')` — TypeScript could not validate table names, column names, or query results
- **After:** All 430 files use properly typed `supabase.from('table_name')` — TypeScript now validates:
  - Table name exists in the schema
  - Column names in `.select()`, `.eq()`, `.order()`, `.is()` are valid
  - Insert/update data shapes match the table's Insert/Update types
  - Query results have correct types for downstream usage
- 428 files in `app/src/app/api/` + 1 file `app/src/lib/notifications/service.ts` + 1 file already typed
- Only 2 `supabase as any` remain: RPC calls for functions not present in generated types

### Targeted `as never` Casts (8 files)
- 8 API route files needed `as never` on insert/update data where Zod-validated types don't perfectly match Supabase Insert types
- Files: api-keys, branding/pages, portal/settings, gl/journal-entries/post, invoice-extractions/create-bill, invoice-extractions/review, payroll/exports, purchase-orders/receipts
- `as never` is narrowly scoped to the data argument only — table name, column names, and select results remain fully typed
- This is a deliberate trade-off: Zod validates the runtime shape, `as never` bridges the compile-time mismatch

### notifications/service.ts
- Removed 2 `(supabase as any)` casts
- Added `as never` on insert data (notification payload shape differs slightly from strict Insert type)
- Notification queries now type-checked for table/column validity

---

## DB Error Sanitization, Cache Headers, DB Security (2026-02-26)

### Error Message Sanitization (277 files, 462 occurrences)
- All v2 API routes now use `mapDbError(error)` instead of raw `error.message`
- Previously: `{ error: 'Database Error', message: error.message }` leaked table names, constraints, RLS details
- Now: `{ error: mapped.error, message: mapped.message, status: mapped.status }` returns safe HTTP error messages
- Error code mapping: 23505→409 Conflict, 23503→404 FK Not Found, 22P02→400 Invalid ID, 42501→403 Forbidden, 42P01→500 Not Found

### Cache-Control Headers (middleware, covers all 430 routes)
- GET success: `Cache-Control: private, no-cache, max-age=0, must-revalidate` (user-specific data, always revalidate)
- Non-GET / status >= 400: `Cache-Control: no-store` (never cache mutations or errors)
- Applied in createApiHandler alongside X-Request-ID header

### PostgreSQL Function Search Path (11 functions fixed)
- All public functions now have `SET search_path = ''` with fully-qualified table references
- Prevents schema hijacking attacks on: get_current_company_id, user_has_role, get_config_value, is_feature_enabled, update_updated_at_column, update_time_tracking_updated_at, update_warranty_updated_at, update_updated_at, prevent_company_id_change, cleanup_old_metrics, get_next_sequence_number

### RLS Security Hardening
- **Always-true fix**: blog_posts, case_studies, marketing_leads — replaced `ALL USING(true)` with SELECT(public) + INSERT/UPDATE/DELETE(require auth)
- **InitPlan optimization**: All policies now use `(SELECT auth.uid())` instead of `auth.uid()` — per-query evaluation vs per-row
- **Duplicate policies removed**: marketplace_reviews (redundant SELECT), numbering_sequences (redundant SELECT)
- **cost_codes fix**: Removed overly-broad "Tenant isolation" ALL policy that bypassed deleted_at filter and role checks
- **pg_trgm moved**: From public to extensions schema, 3 GIN indexes recreated with extensions.gin_trgm_ops

---

## Status Transitions, FK Indexes (2026-02-26)

### PO Status Transition Validation
- PUT /api/v2/purchase-orders/:id now validates status — only draft/pending/rejected POs can be updated
- Previously unrestricted — any status change accepted

### Standardized 409 Conflict Codes
- Change orders and contracts status violations: 403→409 (matches bills/invoices/draw-requests)
- 409 Conflict = state machine violation; 403 Forbidden = permission denied (different semantics)

### FK Index Migration (26 indexes)
- 6 critical: company_id on custom_field_values, kb_articles, numbering_sequences, project_user_roles, time_entry_allocations, training_path_items
- 11 high: budget_change_logs(budget_id), budget_lines(job_id), company_subscriptions(plan_id), cost_transactions(vendor_id), document_expirations(document_id), gl_journal_lines(client_id/vendor_id), lien_waiver_tracking(waiver_id), notifications(job_id), project_user_roles(role_id), usage_meters(addon_id)
- 9 medium: hierarchy/relationship columns on cost_codes, document_folders, estimates, etc.

---

## List Filter Fixes, Audit Logging (2026-02-26)

### Deleted_at Filter on List Endpoints (20 routes)
- 17 child collection GET handlers + 3 top-level list handlers were returning soft-deleted records
- Added `.is('deleted_at', null)` to vendor contacts/insurance, equipment children, budget lines, change order items, contract signers, lead activities, PO lines, quality checklist items, RFI responses, report widgets, dashboard widgets, ticket messages, bid comparisons, saved filters, AP payments, AR receipts

### Audit Logging on Critical Operations (25 handlers, 16 files)
- Added `auditAction` to financial (AP bills/payments, AR invoices/receipts, GL journal entries, period close), billing (subscriptions, addons), draw requests (create/update/archive/approve/submit), and HR employees (create/update/archive)
- Middleware records: company ID, user ID, action name, IP, user agent, request body

---

## Soft Delete Enforcement, Query Optimization (2026-02-26)

### Soft Delete Migration (18 child tables)
- DB migration `add_deleted_at_to_child_tables` applied — added `deleted_at TIMESTAMPTZ` + partial indexes
- Tables: vendor_contacts, vendor_insurance, equipment_assignments/costs/inspections/maintenance, budget_lines, change_order_items, contract_signers, lead_activities, purchase_order_lines, quality_checklist_items, rfi_responses, custom_report_widgets, dashboard_widgets, saved_filters, bid_comparisons, ticket_messages
- All 18 DELETE handlers converted from `.delete()` to `.update({ deleted_at })`
- GET/PUT handlers now filter `.is('deleted_at', null)`
- Note: Line-item replace-on-update tables (ap_bill_lines, ar_invoice_lines, gl_journal_lines, etc.) intentionally kept as hard delete

### Billing Page Query Optimization
- Parallelized subscription + billing events queries with Promise.all()

---

## Rate Limit Tiering, JSON Parse Safety (2026-02-26)

### Financial Rate Limits (29 route files, 57 handlers)
- All AP, AR, GL, draw-requests, financial-periods, and billing routes: `'api'` → `'financial'` (30/min, fail-closed)
- Financial ops NEVER fail open — if rate limit check fails, request is denied

### Search + AI Rate Limits (8 route files)
- Search GET: `'api'` → `'search'` (60/min)
- AI document POST handlers: `'api'` → `'heavy'` (10/min) — extractions, classifications, queue, templates
- Document upload POST: `'api'` → `'heavy'`

### JSON Parse Safety (24 action routes)
- Removed `req.json().catch(() => ({}))` from 24 action routes (approve, submit, close, send, sign, etc.)
- Invalid JSON now throws → caught by middleware → proper error response

---

## RBAC Enforcement, Error Handling, Env Validation (2026-02-26)

### mapDbError — Invalid UUID Handling (lib/api/middleware.ts)
- Added Postgres error code 22P02 (invalid text representation) → 400 Bad Request "Invalid ID format"
- Non-UUID strings passed to UUID columns now return 400 instead of 500
- Total mapDbError codes: PGRST116→404, 23505→409, 23503/23502/23514→400, 22P02→400, 42501→403, default→500

### CRON_SECRET Env Validation (lib/env.server.ts)
- CRON_SECRET added to server env schema as optional with min 16 chars
- Prevents weak/empty secrets in production while allowing dev without cron
- Empty string → stripped to undefined (not validated); set but short → startup error

### Billing RBAC (10 route files, 20 handlers)
- All billing API routes now enforce role restrictions
- GET: owner + admin (view billing info)
- POST/PUT/DELETE: owner only (modify subscriptions, plans, addons, usage)
- Routes: plans, subscriptions, addons, events, usage (list + detail)

### HR RBAC (10 route files, 25 handlers)
- All HR API routes now enforce role restrictions
- GET: owner + admin + pm (view employees, departments, etc.)
- POST/PUT/DELETE: owner + admin only (manage personnel)
- Routes: employees, departments, positions, certifications, documents (list + detail)

---

## Security Headers, Error Mapping, RLS, Image Optimization (2026-02-26)

### Content-Security-Policy (middleware.ts)
- Added CSP header: default-src 'self', script/style self+unsafe-inline, img self+data+blob+Supabase, connect self+Supabase+Vercel, frame-ancestors 'none'
- Added X-XSS-Protection: 1; mode=block (legacy browser defense-in-depth)
- All 7 recommended security headers now configured (was 5/7)

### mapDbError Helper (lib/api/middleware.ts)
- New function maps Supabase/Postgres error codes to correct HTTP statuses
- PGRST116→404, 23505→409, 23503/23502→400, 42501→403, default→500
- Applied to PUT/DELETE handlers in 122 v2 API detail routes
- Previously all DB errors returned 404 regardless of cause

### RLS Policy Tightening (3 platform tables)
- deployment_releases: ALL→separate SELECT/INSERT/UPDATE/DELETE policies, writes restricted to deployed_by
- marketplace_templates: ALL write→per-command, restricted to created_by
- marketplace_template_versions: ALL write→per-command, restricted to parent template creator via JOIN

### Image Optimization (1 page)
- jobs/[id]/photos: Raw `<img>` replaced with `next/image` (NextImage) with fill+sizes for responsive loading

---

## API Response Consistency, Form Validation, Error Handling (2026-02-26)

### API Response Consistency (215 routes)
- v1 API: Added `requestId: ctx.requestId` to success responses in 17 route files
- v2 API: Updated `paginatedResponse()` helper to accept optional `requestId` param
- Updated all 198 v2 paginated GET callers to pass `ctx.requestId`
- Every API response (v1 + v2, paginated + single) now includes requestId for traceability

### Form Validation — min/max Constraints (7 create forms)
- budget/new: `estimated_amount` min=0
- draws/new: `contract_amount`, `total_completed` min=0
- estimates/new: `markup_pct`, `overhead_pct`, `profit_pct` min=0 max=100
- leads/new: `expected_contract_value` min=0
- hr/new: `base_wage` min=0
- equipment/new: `year` min=1900 max=2100
- journal-entries/new: debit + credit amounts min=0

### Error Handling — Async Handlers (3 pages)
- settings/phases: `handleMove()` and `handleToggleActive()` wrapped in try/catch with toast
- chart-of-accounts/[id]: `handleToggleActive()` wrapped in try/catch with toast
- legal/[id]: `handleToggleActive()` wrapped in try/catch with toast

### Zod Validation Gap (1 API route)
- PUT /api/v2/notifications/:id: Added `markNotificationReadSchema` Zod validation
- Was the only PUT handler (out of 406) without request body validation

---

## Error Handling, Pagination, Metadata, Soft-Delete Fixes (2026-02-26)

### Error Handling (27 SSR pages, 31 queries)
- Added `error` destructuring + `if (error) throw error` to all SSR pages with unchecked Supabase queries
- Errors now trigger the Next.js error boundary with retry button instead of silent blank pages

### Pagination Fixes (2 pages)
- billing: `.limit(20)` → `.range()` + ListPagination (25/page)
- post-build: `.limit(50)` on warranties/maintenance → `.range()` + count + ListPagination

### Metadata (36 SSR pages)
- Added `export const metadata` to 36 pages missing browser tab titles

### Soft-Delete Fix (1 API route)
- employee_certifications DELETE: hard `.delete()` → `.update({ status: 'revoked' })`

---

## IDOR Fixes + WCAG Accessibility Hardening (2026-02-26)

### IDOR Fixes — Detail Pages (4 pages)
- purchase-orders/[id]: Added company_id to job and vendor lookups (was fetchable by any tenant via UUID)
- jobs/[id]/purchase-orders/[poId]: Added company_id to vendor lookup
- bids/[id]: Added company_id to job lookup
- financial/receivables/[id]: Added company_id to main AR invoice query (was completely unscoped!)

### IDOR Fixes — API Routes (3 analytics routes)
- /api/v2/analytics/experiments/[id]: Added company_id to GET and PUT
- /api/v2/analytics/metrics/[id]: Added company_id to GET and PUT
- /api/v2/analytics/releases/[id]: Added company_id to GET and PUT

### WCAG Accessibility — Textarea Labels (106 pages, 146 elements)
- Added `aria-label` to every `<textarea>` across all authenticated pages
- Labels describe the purpose (e.g., "Notes", "Description", "Instructions")
- Covers create forms, edit forms, detail pages

### WCAG Accessibility — Table Header Scope (13 pages, 66+ elements)
- Added `scope="col"` to all `<th>` in column header rows
- Pages: safety-incidents, certified-payroll, daily-logs, rfis, time-entries, permit-tracking, equipment, employees, bids, change-orders, submittals
- Components: UserTable, PermissionGrid

### WCAG Accessibility — Color Input Label
- settings/general: Added `aria-label="Primary Color"` to color picker input

---

## Security Hardening: Filter Injection, Auth Guards, Pagination (2026-02-26)

### Filter Injection Fix (79 v2 API routes)
- All `.or()` ilike search filters now use `escapeLike()` to escape `%`, `_`, and `\` characters
- Prevents Supabase filter injection attacks via search parameters
- Applied to every v2 route that interpolates `filters.q` in ilike patterns

### Auth Guard + Tenant Isolation Fixes (8 more pages)
- price-intelligence: Added auth guard + company_id filter (was leaking cross-tenant data)
- data-migration: Added auth guard + company_id filter (was leaking cross-tenant data)
- financial/reports: Added auth guard + company_id filter
- integrations: Added auth guard
- notifications: Added auth guard + user_id filter
- onboarding: Added auth guard + company_id filter + error handling

### Pagination Added (8 pages)
- price-intelligence, data-migration, deliveries, calendar, financial/reports, integrations: Replaced .limit() with proper .range() + ListPagination
- Stats cards use total count from DB instead of page array length

### Component Edge Cases
- list-pagination: Added bounds clamping (Math.max/Math.min on currentPage)
- UserTable: Added double-click prevention on both deactivate and reactivate handlers
- todos: Made items clickable — link to punch list detail pages

---

## Infrastructure Hardening: Security, Date Validation, API Middleware (2026-02-26)

### Path Traversal Fix
- `/api/docs/route.ts`: Resolve slug to absolute path and verify it stays inside DOCS_ROOT before reading

### Date Utility Hardening
- `formatDate()`: Returns empty string for invalid dates (instead of "Invalid Date")
- `formatRelativeDate()`: Returns absolute date for future dates (instead of negative days)

### API Middleware Improvements
- Profile query: Returns 500 on DB failure (was returning 403 incorrectly)
- Company settings query: Logs errors instead of silently ignoring
- Content-Type validation: Rejects non-JSON bodies for POST/PATCH/PUT
- Audit logging: Reuses ctx.validatedBody when available (avoids extra body clone)

### Health Check Fix
- Cache health check was backwards — marked cache as 'down' when KV_REST_API_URL was configured

### Empty State CTAs (4 pages)
- Equipment, contracts, time-clock, warranty-claims: Added create/new button in empty states

### Error Handling
- Intelligence procurement/production: Added error handling on vendor/job name lookups
- Job selections: Added missing error handling on query

---

## Quality Hardening: Auth Guards, Tenant Isolation, Notifications Pagination (2026-02-25)

### Notifications Pagination
- Replaced .limit(100) with server-side pagination (25 per page)
- Added ListPagination component
- Filter links (Unread Only / All) now use URLSearchParams pattern
- Subtitle shows total count from DB instead of array length
- Removed unused imports (CheckCheck, Trash2, getStatusColor)

### Auth Guard + Tenant Isolation Security Fixes (11 pages)
- Added missing auth redirect guards: api-marketplace, bank-reconciliation
- Added missing company_id filters: bank-reconciliation (financial_periods), business-management (financial_periods)
- Replaced all user!.id non-null assertions with proper null checks + redirect: dashboard, hr, compliance/safety, financial/cash-flow, financial/dashboard, financial/business-management, revenue/*, revenue/attribution, revenue/employee
- Replaced all companyId! assertions with safe references after null-guard redirect

### Error Handling + deleted_at Fixes (4 pages)
- submittals: Added missing error handling on query
- payments: Added missing .is('deleted_at', null) filter
- deliveries: Added error handling + deleted_at filter
- certified-payroll: Added error handling + deleted_at filter

### Unused Import Cleanup (3 pages)
- bank-reconciliation: Removed Search, Input, formatCurrency
- certified-payroll: Removed Clock, getStatusColor
- integrations: Removed getStatusColor

---

## Quality Hardening: Sort Controls (10 more), Pagination (10), Metadata (52), Draws Redirect (2026-02-25)

### Sort Controls (10 Additional List Pages)
- Change Orders: Sort by Newest, Amount, Status, Title
- Purchase Orders: Sort by Newest, Amount, Status, Delivery Date
- RFIs: Sort by Newest, Subject, Status, Due Date
- Estimates: Sort by Newest, Name, Total, Status
- Draw Requests: Sort by Draw #, Newest, Status, Current Due
- Equipment: Sort by Name, Status, Type, Daily Rate
- Contracts: Sort by Newest, Value, Status, Title
- Lien Waivers: Sort by Newest, Amount, Status, Claimant
- HR: Sort by Name, Hire Date, Status
- Bids: Sort by Newest, Title, Status, Due Date

### Pagination Completion (10 Pages)
- Upgraded from unbounded queries or .limit(50) to proper server-side pagination
- Pages: inventory, warranties, warranty-claims, proposals, time-clock, payments, support, todos, files, photos
- Equipment page also got pagination in the sort controls commit
- All use { count: 'exact' }, .range(), and ListPagination component

### Draws/Draw-Requests Deduplication
- /draws page replaced with `redirect('/draw-requests')` — was a duplicate querying the same table
- /draw-requests is the canonical page with full CRUD, sort controls, and pagination

### Status Filter Param Preservation
- Fixed punch-lists, proposals, warranties to use URLSearchParams pattern
- Clicking status filters now preserves search/sort query params

### Page Metadata Completion (52 Pages)
- Added `export const metadata: Metadata = { title: 'XXX' }` to 52 pages missing it
- Covers: inventory, payments, photos, proposals, support, todos, warranty-claims, legal, schedule, submittals, communications, compliance/*, financial/*, operations/*, settings/*, marketing, meetings, reports, dashboards, and more
- 8 client component pages skipped (metadata requires server components)

---

## Quality Hardening: Sort Controls, Missing CTAs, Invoice Job Context (2026-02-25)

### Sort Controls (5 Major List Pages)
- Jobs: Sort by Newest (default), Name, Contract Amount, Status — `?sort=name|contract_amount|status`
- Clients: Sort by Newest, Name, City — `?sort=name|city`
- Vendors: Sort by Newest, Name, Trade — `?sort=name|trade`
- Invoices: Sort by Newest, Amount, Due Date, Status — `?sort=amount|due_date|status`
- Leads: Sort by Newest, Name, Value, Status — `?sort=name|expected_contract_value|status`
- Pattern: `sortMap` object → `.order(sort.column, { ascending })` → pill-style Link+Button UI
- Sort pills preserve all other query params (search, status, page)

### Missing CTA Buttons (5 List Pages)
- Daily Logs empty state: "Go to Jobs" outline button → `/jobs`
- Communications empty state: "New Message" button → `/communications/new`
- Crew Schedule empty state: "Add Employee" button → `/hr/new`
- Photos empty state: "Go to Jobs" outline button → `/jobs`
- Schedule empty state: "New Job" button → `/jobs/new`

### Communications Create Form
- New page: `/communications/new/page.tsx`
- Fields: subject, message, type (announcement/update/request/alert), priority, job selector dropdown
- Job dropdown auto-populated from company's jobs
- Redirects to /communications on success with toast

### Invoice Job Context
- "New Invoice" from `/jobs/[id]/invoices` now links to `/invoices/new?job_id=${jobId}`
- Invoice create form reads `?job_id=` via useSearchParams and pre-selects job

---

## Quality Hardening: Silent Failures, Date Formatting, Broken Routes (2026-02-25)

### Silent Error Toasts
- TenantSwitcher: 4 error paths now show toast.error (fetch companies fail, switch company fail)
- auth-context: 4 error paths now show toast.error (same patterns)
- UserTable: 2 alert() calls replaced with toast.error (from earlier commit)
- Zero silent console.error failures remaining in client-side components

### Date Formatting Standardization
- 32 raw `new Date().toLocaleDateString()` calls replaced with `formatDate()` from `@/lib/utils`
- Affected 18 files: detail pages, list pages, settings, profile
- All dates now display consistently via the formatDate utility

### Broken Route Fix: Punch List Detail
- Created `/jobs/[id]/punch-list/[itemId]/page.tsx` — was a 404 when clicking punch list items from job context
- Client-side detail page with edit mode, archive with ConfirmDialog, toast notifications
- Follows RFI detail page pattern for consistency

### Archive Button Consistency
- 12 raw `<button>` tags with `bg-red-600` replaced with `<Button variant="outline" className="text-destructive">`
- All archive buttons now use consistent styling across all detail pages

### Job-Scoped Security + Error Handling
- escapeLike applied to 9 job-scoped `.or()` search patterns (daily-logs, change-orders, rfis, punch-list, schedule, POs, lien-waivers, permits, photos)
- Error throwing added to 14 job-scoped subpages (silent empty state → error boundary)

---

## Quality Hardening: Validation, Accessibility, Error Handling, Pagination (2026-02-25)

### Form Validation Ordering
- 4 create forms (change-orders, purchase-orders, rfis, invoices) now validate BEFORE `setLoading(true)`
- Pattern: `setError(null)` → field checks with early return → `setLoading(true)` → network call
- Prevents showing spinner for client-side validation failures

### Accessibility Fixes
- **Aria-labels**: 4 icon-only buttons (settings phases/roles MoreHorizontal, journal entries Trash2, terminology RotateCcw)
- **Form labels**: Profile page (5 htmlFor/id pairs), FieldGroup component (systemic fix for 30+ fields), numbering (4), phases (5)
- **Heading hierarchy**: 27 empty state `<h3>` tags changed to `<p>` to fix h1→h3 skip across list pages
- **Empty state CTAs**: Added action buttons to estimates, contacts, punch-lists, files empty states

### Server-Side Error Handling
- 25 list pages now throw Supabase query errors to error boundary instead of silently showing empty state
- Pattern: `const { data, count, error } = await query; if (error) throw error;`
- Catches: DB connection failures, RLS blocks, network timeouts, table permission issues

### Pagination Completion
- 6 pages upgraded from hardcoded `.limit()` to proper pagination: activity, daily-logs, certified-payroll, communications, compliance/lien-law, compliance/safety
- Bids page also upgraded (was `.limit(50)`, now paginated)
- All use `{ count: 'exact' }`, `.range()`, and `ListPagination` component

### Additional UI Fixes
- Files page: Added search input (search param handler existed but no UI)
- Permits page: Added status filter tabs (applied, approved, issued, expired, rejected)
- escapeLike completed: 19 remaining files fixed (5 job-scoped pages + 14 v2 API routes)

---

## Security Hardening + Mobile Responsive + Search Fixes (2026-02-25)

### LIKE Injection Prevention
- New `escapeLike(input)` utility in `@/lib/utils` — escapes `%`, `_`, `\` in LIKE/ILIKE patterns
- Applied to **all server-side list pages and API routes** — zero unescaped ilike patterns remain
- Applied to **5 v1 API routes** (jobs, clients, vendors, cost-codes, users)
- Applied to **v2 search API** route + **14 v2 API routes**

### Soft-Delete Filter Fixes
- Added `.is('deleted_at', null)` to v1 `/api/v1/jobs`, `/api/v1/clients`, `/api/v1/vendors` GET endpoints
- Added `.is('deleted_at', null)` to v2 search API invoices query
- Previously missing: archived records were returned in API results

### Mobile Responsive Sidebar
- Sidebar hidden on screens < md breakpoint (`hidden md:flex`)
- Hamburger menu button in TopNav (visible < md, `md:hidden`)
- Slide-out overlay sidebar on mobile with backdrop + close button
- Closes on route change and backdrop click
- Main content padding: `p-4 md:p-6` for mobile optimization
- Event-driven: TopNav dispatches `open-mobile-sidebar`, Sidebar listens

### Search URL Fixes
- Fixed search result URLs: `/directory/clients/[id]` → `/clients/[id]`, `/directory/vendors/[id]` → `/vendors/[id]`
- Fixed invoice search URL: `/financial/payables/[id]` → `/invoices/[id]`
- Fixed quick action URLs: `/directory/clients/new` → `/clients/new`, `/directory/vendors/new` → `/vendors/new`

---

## Quality Hardening: Toast Notifications + Status Filters + Confirm Dialogs (2026-02-25)

### Toast Notifications (sonner)
- `Toaster` component in root layout: `richColors position="bottom-right"`
- **50 create form pages** — `toast.success('Item created')` before redirect + `toast.error(errorMessage)` in catch
- **46 detail/edit pages** — `toast.success('Saved')` on update, `toast.success('Archived')` on soft-delete, `toast.error()` in all catch blocks
- **22 previously wired pages** (jobs/new, clients/new, vendors/new, etc.) — already had toasts from prior session
- Total: **118 pages** with toast notification coverage

### Status Filter Tabs
- Purchase Orders: All / Draft / Pending / Approved / Sent / Received / Closed — URL param `?status=X`
- Change Orders: All / Draft / Pending / Approved / Rejected / Voided — URL param `?status=X`
- Pattern: `statusFilters` array → Link + Button with active/outline variant
- Query filter: `.eq('status', params.status)` when param present

### Styled Confirmation Dialogs
- `ConfirmDialog` component at `@/components/ui/confirm-dialog`
- Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `variant`, `onConfirm`, `loading`
- Replaces ALL 61 browser `confirm()` calls with branded Radix UI dialogs (50 initial + 11 remaining)
- Zero `window.confirm` calls remain in codebase
- Red warning icon for destructive actions, Cancel/Archive button pair

### Search Input Accessibility
- All 59 search `<Input>` elements across list pages now have `aria-label` attributes
- Pattern: `aria-label="Search jobs"`, `aria-label="Search invoices"`, etc.
- Covers 39 company-level + 20 job-scoped list pages

### Error Boundaries
- `(authenticated)/error.tsx` — route-level error boundary within sidebar layout
- `(authenticated)/not-found.tsx` — contextual 404 with Dashboard link
- Both keep users in the authenticated layout instead of falling to global

---

## Page Metadata & Title Template (2026-02-25)

### Root Layout Title Template
- `layout.tsx` uses `title: { template: '%s | RossOS', default: 'RossOS — Construction Intelligence Platform' }`
- All pages just set `title: 'Page Name'` and browser tab shows "Page Name | RossOS"

### 130+ Pages with Metadata
- 51 company-level server component pages: direct `export const metadata`
- 63 job-scoped pages under `jobs/[id]/`: 24 server + 39 layout.tsx wrappers
- 19 detail `[id]` pages: layout.tsx wrappers (all are client components)
- 15 `/new/` form pages: layout.tsx wrappers (all are client components)
- Remaining: bids, equipment, templates, training, api-marketplace, activity

### Dashboard Revenue Fix
- `/dashboard` now calculates "This Month Revenue" from approved/funded draw_requests
- Queries `draw_requests.current_due` where `status IN ('approved', 'funded')` and `approved_at >= monthStart`
- Replaced hardcoded `formatCurrency(0)` TODO

---

## Dashboards, Intelligence & Placeholder Conversion (2026-02-25)

### Three Real Dashboards
- `/dashboards/overview` — Executive KPIs: active jobs, revenue, pending invoices, clients, action items, recent activity
- `/dashboards/financial` — Financial KPIs: contract value, invoiced, AR, AP, budget variance, recent bills/draws
- `/dashboards/operations` — Ops KPIs: active jobs, employees, permits, equipment, safety, inspections, daily logs

### 8 Intelligence Hub Pages (all with real data)
- ai-hub, accuracy-engine, bidding, communication-hub, learning-metrics, plan-analysis, procurement, production
- Each queries relevant tables for counts/metrics, shows stat cards, links to feature pages

### 6 Other Converted Placeholders
- admin: hub with user/role/flag stats + nav grid
- meetings: upcoming inspections + meeting quick-links
- community (3 pages): hub, best-practices, forums with category cards
- sustainability: environmental permit metrics

### 3 Redirects (replaced coming soon with useful redirects)
- expenses → /financial/payables
- vendor-reviews → /vendors
- white-label → /settings/general

### 5 Job-Scoped Pages Got Search
- budget (description), invoices (invoice_number), selections (room), team (role_override), warranties (title)

---

## Executive Dashboard — /dashboards/overview (2026-02-25)

### Landing Page (root redirects here)
- Personalized greeting with time-of-day and user's first name
- 4 KPI cards: Active Jobs (with total), Revenue (paid+approved invoices), Pending Invoices (count+amount), Clients (with vendor count)
- 3 Action Item cards: Open Change Orders, Open RFIs, Open Punch Items
- Recent Jobs list (last 5, with status badges, links to detail)
- Recent Invoices list (last 5, with amount and status, links to detail)
- Overdue RFIs section (only shows if any exist, due_date < today)
- All cards are clickable links to their respective list pages

### Form Validation & Tenant Isolation Fixes (Round 2)
- purchase-orders/new, contracts/new, warranties/new, contacts/new: dropdown tenant leak fixes
- purchase-orders/[id], punch-lists/[id]: main query tenant leak fixes
- invoices/new, contracts/new, payables/new: min="0" on currency fields
- Job detail count queries: soft-delete filter added

---

## Server-Side Pagination (2026-02-25)

### ListPagination Component (`components/ui/list-pagination.tsx`)
- Reusable SSR pagination: Previous/Next buttons with page count display
- URL-based navigation preserving existing search params (filters, search, status)
- Auto-hides when totalPages <= 1
- Used across 40 list pages (19 company-level + 21 job-scoped)

### 19 Company-Level List Pages
- All use 25 items/page with `.select('...', { count: 'exact' })` + `.range(offset, offset + pageSize - 1)`
- Pages: clients, vendors, jobs, contacts, cost-codes, invoices, leads, estimates, contracts, hr, purchase-orders, change-orders, permits, rfis, submittals, lien-waivers, draw-requests, punch-lists, audit-log

### 21 Job-Scoped List Pages (`/jobs/[id]/*`)
- Same pagination pattern as company-level pages
- Pages: budget, change-orders, communications, daily-logs, draws, files, inspections, inventory, invoices, lien-waivers, permits, photos, punch-list, purchase-orders, rfis, schedule, selections, submittals, team, time-clock, warranties

---

## Final Security & Quality Pass (2026-02-25)

### Audit Log company_id
- `activity/page.tsx` and `activity/audit-log/page.tsx` now filter by company_id (was last unprotected page)

### Warranty Claims Create (`/warranty-claims/new`)
- Added job selector dropdown (jobs from company, non-deleted)
- Added warranty selector dropdown (warranties from company, filtered by selected job)
- Inserts now include `job_id` and `warranty_id` (both nullable)

### Journal Entries Create (`/financial/journal-entries/new`)
- Added full line items table: account selector (from gl_accounts), debit/credit columns, line memo
- Dynamic add/remove rows (minimum 2 lines)
- Balance validation: debits must equal credits before submit
- Creates header in `gl_journal_entries` then bulk inserts lines in `gl_journal_lines`
- Totals footer with real-time balance indicator

### Dropdown Tenant Isolation (6 forms)
- draw-requests/new, change-orders/new, invoices/new, lien-waivers/new, submittals/new, rfis/new
- All dropdown loaders now fetch user profile → company_id → filter dropdowns by company

### Missing created_by
- leads/new: added `created_by: user.id` to INSERT (only table with column that was missing it)

---

## Job-Scoped Page Security Hardening (2026-02-25)

### 23 SSR List Pages (`/jobs/[id]/*`)
- All now verify user auth via `supabase.auth.getUser()` + redirect to `/login`
- All resolve `company_id` from user profile
- All verify job belongs to company via `.eq('company_id', companyId)` on job query
- Pages with existing job query: budget, change-orders, daily-logs, draws, files, lien-waivers, punch-list, purchase-orders, rfis, schedule, property, reports
- Pages that needed new job ownership query: communications, inspections, inventory, invoices, permits, photos, selections, submittals, team, time-clock, warranties

### 18 Client Detail Pages (`/jobs/[id]/*/[itemId]`)
- All now have `companyId` state + auth + company_id lookup in load function
- All verify job belongs to company before loading record
- All include `.eq('job_id', jobId)` on update and archive operations
- Pages: budget/[lineId], change-orders/[coId], communications/[commId], daily-logs/[logId], draws/[drawId], files/[fileId], inspections/[inspectionId], invoices/[invoiceId], lien-waivers/[waiverId], permits/[permitId], photos/[photoId], purchase-orders/[poId], rfis/[rfiId], schedule/[taskId], selections/[selectionId], submittals/[submittalId], time-clock/[entryId], warranties/[warrantyId]

### 20 Client Create Pages (`/jobs/[id]/*/new`)
- All verify job belongs to user's company before allowing INSERT
- Pattern: `supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()`
- Pages: budget/new, change-orders/new, communications/new, daily-logs/new, draws/new, files/new, inspections/new, inventory/new, lien-waivers/new, permits/new, photos/new, purchase-orders/new, rfis/new, schedule/new, selections/new, submittals/new, team/new, time-clock/new, warranties/new, punch-list/new

### Job Edit Page (`/jobs/[id]/edit`)
- Auth + company_id + job ownership on load (`.eq('company_id', cid)` on job query)
- company_id on update (`.eq('company_id', companyId)` on save)

---

## Change Orders CRUD Pages (2026-02-25)

### Create Change Order (`/change-orders/new`)
- **Form fields**: co_number (text), title (text, required), description (textarea), change_type (select: Addition/Deduction/Credit/Allowance), amount (number), cost_impact (number), schedule_impact_days (number)
- **Job selector**: loads jobs from Supabase `jobs` table (non-deleted, ordered by name, limit 100)
- **On submit**: validates title + job required, gets user profile for company_id, inserts into `change_orders` with status='Draft', redirects to `/change-orders`
- **Error display**: inline red banner above form
- **Cancel**: links back to `/change-orders`

### Change Order Detail (`/change-orders/[id]`)
- **View mode**: title with status badge (Draft=secondary, Pending=default, Approved=outline, Rejected=destructive), co_number, change_type, amount (currency), cost_impact (currency), schedule_impact_days, description, approval info (approved_at, client_approved)
- **Edit mode**: same fields as create + status select (Draft/Pending/Approved/Rejected), save via `.update().eq('id', params.id)`
- **Archive**: soft delete via `deleted_at = now()`, confirm dialog, redirects to `/change-orders`
- **Back link**: `/change-orders`

### Change Orders List (`/change-orders`) — Updated
- Added "New Change Order" button linking to `/change-orders/new`
- List rows now link to `/change-orders/[id]` (detail page) instead of `/jobs/[id]/change-orders`
- Empty state links to `/change-orders/new`

---

## Missing Page Gap Closure (2026-02-25)

### New SSR Pages (querying real Supabase data)
- **Notifications** (`/notifications`) — SSR, queries `notifications` table, unread filter, urgency badges, click-through via url_path
- **Bids** (`/bids`) — SSR, queries `bid_packages`, status filter, search, bid due date display
- **RFIs** (`/rfis`) — SSR, company-wide queries `rfis` table, status/search filter, rfi_number display
- **Submittals** (`/submittals`) — SSR, company-wide queries `submittals`, status/search filter, spec_section display
- **Activity Feed** (`/activity`) — SSR, queries `audit_log`, action badges, table_name context, IP logging
- **Audit Log** (`/activity/audit-log`) — SSR, queries `audit_log` with table view (time, user, action, entity, IP)
- **Account Profile** (`/account/profile`) — Client-side, queries `users` for current auth user, edit name/phone, role display
- **Warranty Claims** (`/warranty-claims`) — SSR, queries `warranty_claims`, status filter, reported_date display
- **Payments** (`/payments`) — SSR, queries `client_payments`, total amount, payment method badges
- **Certified Payroll** (`/certified-payroll`) — SSR, queries `payroll_exports`, format/hours display
- **Support** (`/support`) — SSR, queries `support_tickets`, open count, priority badges
- **Training** (`/training`) — SSR, queries `training_courses` (published only), difficulty badges, duration
- **Onboarding** (`/onboarding`) — SSR, queries `onboarding_checklists`, progress bar, checklist UI
- **Billing** (`/billing`) — SSR, queries `company_subscriptions` + `billing_events`, plan display
- **Data Migration** (`/data-migration`) — SSR, queries `migration_jobs`, progress tracking, error counts
- **API Marketplace** (`/api-marketplace`) — SSR, queries `integration_listings` (published), featured badges
- **Todos** (`/todos`) — SSR, queries `punch_items` (open/in_progress), due date, priority
- **Price Intelligence** (`/price-intelligence`) — SSR, queries `price_history`, price changes, vendor tracking
- **Marketing** (`/marketing`) — SSR hub, parallel counts from campaigns/leads/reviews/referrals
- **Job Property** (`/jobs/[id]/property`) — SSR, queries `jobs` for address/contract details
- **Job Reports** (`/jobs/[id]/reports`) — SSR hub, links to budget/schedule/daily-logs/photos/change-orders/invoices

### Redirect Pages (route deduplication)
- `/directory/clients` → `/clients`
- `/directory/vendors` → `/vendors`
- `/directory/contacts` → `/contacts`
- `/directory/team` → `/settings/users`
- `/directory/hr` → `/settings/users`
- `/portal` → `/dashboards`
- `/vendor-portal` → `/vendors`
- `/overview` → `/dashboards`
- `/subscription` → `/billing`
- `/selections-catalog` → `/library/selections`
- `/activity/feed` → `/activity`

---

## UI Wiring — Core Authenticated Pages (2026-02-24)

### React Query Hooks (app/src/hooks/)
- **use-jobs.ts** — `useJobs(params)`, `useJob(id)`, `useCreateJob()`, `useUpdateJob(id)`, `useDeleteJob()` → `/api/v1/jobs`
- **use-clients.ts** — `useClients(params)`, `useClient(id)`, `useCreateClient()`, `useUpdateClient(id)`, `useDeleteClient()` → `/api/v1/clients`
- **use-vendors.ts** — `useVendors(params)`, `useVendor(id)`, `useCreateVendor()`, `useUpdateVendor(id)`, `useDeleteVendor()` → `/api/v1/vendors`
- **use-cost-codes.ts** — `useCostCodes(params)`, `useCostCode(id)`, `useCreateCostCode()`, `useUpdateCostCode(id)`, `useDeleteCostCode()` → `/api/v1/cost-codes`
- All use `fetchJson<T>` pattern with error handling, TanStack React Query, cache invalidation on mutations

### Authenticated Pages (app/src/app/(authenticated)/)
- **Dashboard** (`/dashboard`) — SSR, active job count, pending invoices/draws, recent jobs with client join
- **Jobs** (`/jobs`) — SSR, queries `jobs` table joined with `clients(name)`, status filter, search
- **Job Detail** (`/jobs/[id]`) — SSR, job + client join, parallel counts (change_orders, purchase_orders, daily_logs), stats cards, quick actions
- **Job Layout** (`/jobs/[id]/layout.tsx`) — Tab nav (Overview, Budget, Schedule, Daily Logs, Change Orders, Purchase Orders, Documents)
- **Budget** (`/jobs/[id]/budget`) — SSR, queries `budget_lines` joined with `cost_codes`, summary totals, variance coloring
- **Schedule** (`/jobs/[id]/schedule`) — SSR, queries `schedule_tasks`, progress bars, critical path badges, task summary
- **Daily Logs** (`/jobs/[id]/daily-logs`) — SSR, queries `daily_logs`, weather display, status badges
- **Change Orders** (`/jobs/[id]/change-orders`) — SSR, queries `change_orders`, approved/pending totals, schedule impact
- **Purchase Orders** (`/jobs/[id]/purchase-orders`) — SSR, queries `purchase_orders`, total value summary
- **Documents** (`/jobs/[id]/files`) — SSR, queries `documents`, file icon by mime_type, file size formatting
- **RFIs** (`/jobs/[id]/rfis`) — SSR, queries `rfis`, open/answered counts, priority badges
- **Punch List** (`/jobs/[id]/punch-list`) — SSR, queries `punch_items`, open/completed counts, location/room display
- **Draw Requests** (`/jobs/[id]/draws`) — SSR, queries `draw_requests`, earned/due totals
- **Lien Waivers** (`/jobs/[id]/lien-waivers`) — SSR, queries `lien_waivers`, received/pending counts, waiver type badges
- **Clients** (`/clients`) — SSR, queries `clients` table joined with `jobs(id)`, search by name/email, shows job count
- **Vendors** (`/vendors`) — SSR, queries `vendors` table, search by name, filter by trade, shows active/inactive badge
- **Cost Codes** (`/cost-codes`) — SSR, queries `cost_codes` table, search by code/name, filter by category, category color badges
- **Leads** (`/leads`) — SSR, queries `leads` table, status filter + search, pipeline scoring display
- **Estimates** (`/estimates`) — SSR, queries `estimates` joined with `jobs`, status filter, version display
- **Contracts** (`/contracts`) — SSR, queries `contracts` joined with `jobs`, status filter, contract value
- **Invoices** (`/invoices`) — SSR, queries `invoices` joined with `jobs`, status filter, outstanding total
- **Warranties** (`/warranties`) — SSR, queries `warranties`, status filter, date range display
- **Equipment** (`/equipment`) — SSR, queries `equipment`, status filter, daily rate + value display
- **Chart of Accounts** (`/financial/chart-of-accounts`) — SSR, queries `gl_accounts`, account table with type/balance
- **Receivables** (`/financial/receivables`) — SSR, queries `ar_invoices`, outstanding + overdue totals
- **Time Clock** (`/time-clock`) — SSR, queries `time_entries`, regular + overtime hours display
- **Payables** (`/financial/payables`) — SSR, queries `ap_bills`, outstanding + overdue totals
- **Journal Entries** (`/financial/journal-entries`) — SSR, queries `gl_journal_entries`, search by reference/memo
- **Inventory** (`/inventory`) — SSR, queries `inventory_items`, search by name/SKU, category filter
- **Punch Lists** (`/punch-lists`) — SSR, company-wide `punch_items`, status filter + search
- **Financial Dashboard** (`/financial/dashboard`) — SSR, aggregate counts from gl_accounts, ar_invoices, ap_bills, gl_journal_entries
- **Bank Reconciliation** (`/financial/bank-reconciliation`) — SSR, queries `financial_periods`, open/closed counts
- **Cash Flow** (`/financial/cash-flow`) — SSR, aggregates from `ar_invoices` + `ap_bills`, net position, overdue counts
- **Profitability** (`/financial/profitability`) — SSR, queries `jobs` with contract amounts, active/total job counts
- **Financial Reports** (`/financial/reports`) — SSR, queries `report_definitions`, search, active/system badges
- **Business Management** (`/financial/business-management`) — SSR, `financial_periods` + job/account counts
- **Job Close** (`/financial/job-close`) — SSR, jobs filtered by completed/warranty status, active jobs pending closeout
- **Company Calendar** (`/operations/calendar`) — SSR, queries `schedule_tasks` (upcoming), critical path badges
- **Crew Schedule** (`/operations/crew-schedule`) — SSR, queries `employees`, search, active/field counts, wage display
- **Deliveries** (`/operations/deliveries`) — SSR, queries `po_receipts`, today count, document tracking
- **Proposals** (`/proposals`) — SSR, queries `estimates` joined with `jobs`, status filter, total value
- **Legal & Compliance** (`/legal`) — SSR, queries `contract_templates` + `lien_waiver_tracking` count
- **Pre-Construction** (`/pre-construction`) — SSR, queries `jobs` filtered to `pre_construction` status
- **Post-Build** (`/post-build`) — SSR, queries `warranties` (active) + `maintenance_schedules` (active)
- **Contacts** (`/contacts`) — SSR, queries `vendor_contacts`, search by name/email, primary badge
- **HR & Workforce** (`/hr`) — SSR, queries `employees` + `departments` + `positions` count, search
- **Selections Catalog** (`/library/selections`) — SSR, queries `selection_categories` + `selection_options` count
- **Assemblies** (`/library/assemblies`) — SSR, queries `assemblies`, search, active/inactive, parameter units
- **Templates** (`/library/templates`) — SSR, queries `contract_templates` + rfi/lien template counts
- **Integrations** (`/integrations`) — SSR, queries `integration_listings`, grid layout, rating/install counts
- **Insurance** (`/compliance/insurance`) — SSR, queries `vendor_insurance`, expiration tracking, verified badges
- **Licenses** (`/compliance/licenses`) — SSR, queries `employee_certifications`, expiration tracking
- **Safety** (`/compliance/safety`) — SSR, queries `safety_incidents` + `safety_inspections`, tab view, OSHA badges
- **Lien Law** (`/compliance/lien-law`) — SSR, queries `lien_waiver_tracking`, compliant/non-compliant counts
- **Dashboards** (`/dashboards`) — SSR, queries `custom_reports`, visualization type badges
- **Email Marketing** (`/email-marketing`) — SSR, queries `marketing_campaigns`, spend/leads/revenue metrics, ROI

### Job Sub-Pages (2026-02-24, batch 5)
- **Job Layout** (`/jobs/[id]/layout.tsx`) — 22 tabs: Overview, Selections, Budget, Schedule, Daily Logs, Time, Photos, Permits, Inspections, Change Orders, POs, Inventory, Invoices, Draws, Liens, Docs, RFIs, Submittals, Comms, Team, Punch, Warranties
- **Selections** (`/jobs/[id]/selections`) — SSR, queries `selections` by job_id
- **Time Clock** (`/jobs/[id]/time-clock`) — SSR, queries `time_entries` by job_id
- **Photos** (`/jobs/[id]/photos`) — SSR, queries `documents` filtered by job_id + `mime_type LIKE 'image/%'`, grid layout
- **Permits** (`/jobs/[id]/permits`) — SSR, queries `permits` by job_id
- **Inspections** (`/jobs/[id]/inspections`) — SSR, queries `permit_inspections` by job_id
- **Inventory** (`/jobs/[id]/inventory`) — SSR, queries `inventory_transactions` by job_id, then `inventory_items` by collected item_ids
- **Invoices** (`/jobs/[id]/invoices`) — SSR, queries `invoices` by job_id, status filter with enum cast
- **Submittals** (`/jobs/[id]/submittals`) — SSR, queries `vendor_submissions` by job_id
- **Communications** (`/jobs/[id]/communications`) — SSR, queries `client_messages` by job_id
- **Team** (`/jobs/[id]/team`) — SSR, queries `project_user_roles` by job_id (role_id, role_override, granted_by, created_at)
- **Warranties** (`/jobs/[id]/warranties`) — SSR, queries `warranties` by job_id

### Create Form Pages (2026-02-24, batch 6)
All create forms follow the pattern: `'use client'`, useState for form/loading/error, getUser → company_id → insert → router.push + refresh.
- **New Client** (`/clients/new`) — name*, email, phone, address, city, state (US_STATES select), zip, notes
- **New Lead** (`/leads/new`) — first_name*, last_name*, email, phone, company_name, project_type, estimated_value, notes. Status defaults to 'new'
- **New Vendor** (`/vendors/new`) — name*, trade, email, phone, address, city, state (US_STATES select), zip, notes
- **New Estimate** (`/estimates/new`) — name*, estimate_type (detailed/budget/conceptual/unit_price), description, markup/overhead/profit %, valid_until, notes. Status defaults to 'draft'
- **New Invoice** (`/invoices/new`) — invoice_number, amount*, invoice_date, due_date, job selector, vendor selector, notes. Status defaults to 'draft'. Loads jobs/vendors via useEffect
- **New Contract** (`/contracts/new`) — title*, contract_number*, contract_type (fixed_price/cost_plus/time_materials/unit_price/subcontract), contract_value, description, job selector, client selector, start/end dates. Status defaults to 'draft'. Loads jobs/clients via useEffect
- **New Employee** (`/hr/new`) — first_name*, last_name*, employee_number*, hire_date*, employment_type, pay_type, base_wage, address, emergency contact, notes. Status defaults to 'active'
- **New Equipment** (`/equipment/new`) — name*, equipment_type (tool/vehicle/heavy_equipment/trailer/generator/other), ownership_type (owned/leased/rented), make, model, year, serial_number, daily_rate, purchase_price, location, notes. Status defaults to 'available'
- **New Inventory Item** (`/inventory/new`) — name*, sku, category, unit_of_measure (11 options), unit_cost, reorder_point, reorder_quantity, description. is_active defaults to true
- **New Assembly** (`/library/assemblies/new`) — name*, category, parameter_unit, description. is_active defaults to true
- **New Template** (`/library/templates/new`) — name*, contract_type (5 options), description, content (monospace textarea for template body with {{variables}}). is_active=true, is_system=false
- **New Campaign** (`/email-marketing/new`) — name*, campaign_type (email/social/direct_mail/referral/event/digital_ad), channel, budget, start/end dates, target_audience, description, notes. Status defaults to 'draft', counters default to 0
- **New Contact** (`/contacts/new`) — name*, title, email, phone, vendor selector (required), is_primary checkbox. Loads vendors via useEffect
- **New Warranty** (`/warranties/new`) — title*, warranty_type (manufacturer/workmanship/structural/extended/home_warranty), job selector (required), vendor selector, start/end dates (required), coverage_details, exclusions, contact info. Status defaults to 'active'. Loads jobs/vendors via useEffect

### Job-Level Create Form Pages (2026-02-24, batch 8)
All job-level create forms follow the pattern: `'use client'`, useParams (for job_id), useRouter, createClient (browser), useState for form/loading/error, getUser → company_id → insert with job_id + company_id → router.push back to list + refresh.
- **New Change Order** (`/jobs/[id]/change-orders/new`) — co_number*, title*, description (textarea), amount (number), change_type (select: owner_requested/field_condition/design_change/regulatory/allowance/credit), status (select: draft/pending_approval/approved/rejected). Inserts to `change_orders` table with created_by = user.id
- **New RFI** (`/jobs/[id]/rfis/new`) — rfi_number*, subject*, question (textarea, required), priority (select: low/normal/high/urgent), category (select: general/design/structural/mechanical/electrical/plumbing/site/finish), status (select: draft/open). Inserts to `rfis` table with created_by = user.id
- **New Punch Item** (`/jobs/[id]/punch-list/new`) — title*, description (textarea), location, room, priority (select: low/normal/high/critical), category (select: structural/electrical/plumbing/hvac/finish/paint/flooring/cabinets/countertops/fixtures/appliances/exterior/landscaping/other). Status defaults to 'open'. Inserts to `punch_items` table with created_by = user.id
- **New Daily Log** (`/jobs/[id]/daily-logs/new`) — log_date* (date, defaults today), weather_summary, high_temp (number), low_temp (number), conditions (select: clear/partly_cloudy/cloudy/rain/heavy_rain/snow/wind/fog), notes (textarea). Inserts to `daily_logs` table with created_by = user.id
- **New Draw Request** (`/jobs/[id]/draws/new`) — draw_number* (integer), application_date* (date, defaults today), period_to* (date, defaults today), contract_amount* (number), total_completed* (number), retainage_pct (number, default 10), notes (textarea). Status defaults to 'draft'. Auto-calculates retainage_amount, total_earned, current_due, balance_to_finish. Inserts to `draw_requests` table

### Job-Level Create Form Pages (2026-02-24, batch 9)
All job-level create forms follow the same pattern as batch 8: `'use client'`, useParams, useRouter, createClient (browser), useState for form/loading/error, getUser -> company_id -> insert with job_id + company_id -> router.push back to list + refresh.
- **New Photo** (`/jobs/[id]/photos/new`) -- title*, photo_url*, description, category (select: general/progress/safety/issue/inspection/before/after/drone), taken_date (date, defaults today), location, notes. Inserts to `job_photos` table (NEW TABLE) with taken_by + created_by = user.id
- **New Document** (`/jobs/[id]/files/new`) -- filename*, storage_path*, mime_type (select: PDF/JPEG/PNG/Word/Excel/Text/ZIP/Other), file_size* (number in bytes), document_type (select: contract/drawing/specification/permit/invoice/proposal/report/photo/correspondence/insurance/other), status (select: active/archived). Inserts to `documents` table with uploaded_by = user.id
- **New Material Request** (`/jobs/[id]/inventory/new`) -- name*, sku, description, category, quantity* (number), unit_of_measure (13 options), unit_cost (number, shows estimated total auto-calc), priority (select: low/normal/high/urgent), needed_by (date). Creates `inventory_items` entry if not exists, then creates `material_requests` + `material_request_items`. Multi-table insert workflow.
- **New Communication** (`/jobs/[id]/communications/new`) -- subject*, message_body* (textarea), communication_type (select: note/email/phone/meeting/letter/text), priority (select: low/normal/high/urgent), recipient, status (select: draft/sent/received/archived), notes (textarea). Inserts to `communications` table (NEW TABLE) with created_by = user.id
- **New Submittal** (`/jobs/[id]/submittals/new`) -- submittal_number*, title*, description (textarea), spec_section, submitted_to, submission_date (date, defaults today), required_date (date), status (select: draft/submitted/under_review), priority (select: low/normal/high/urgent), notes (textarea). Inserts to `submittals` table (NEW TABLE) with submitted_by + created_by = user.id

### DB Migrations (2026-02-24, batch 9)
Three new tables created via Supabase migrations:
- **job_photos** -- id, company_id (FK), job_id (FK), title, description, photo_url, category, taken_date, taken_by (FK users), location, notes, created_by (FK users), deleted_at, created_at, updated_at. RLS enabled with tenant isolation policy.
- **communications** -- id, company_id (FK), job_id (FK), subject, message_body, communication_type (CHECK: email/phone/meeting/note/letter/text), priority (CHECK: low/normal/high/urgent), recipient, status (CHECK: draft/sent/received/archived), notes, created_by (FK users), deleted_at, created_at, updated_at. RLS enabled with tenant isolation policy.
- **submittals** -- id, company_id (FK), job_id (FK), submittal_number, title, description, spec_section, submitted_to, submitted_by (FK users), submission_date, required_date, status (CHECK: draft/submitted/under_review/approved/approved_as_noted/rejected/resubmit/closed), priority (CHECK: low/normal/high/urgent), notes, created_by (FK users), deleted_at, created_at, updated_at. RLS enabled with tenant isolation policy.

### Detail Pages (2026-02-24, batch 7)
All detail pages follow the pattern: `'use client'`, useParams, useRouter, createClient (browser), useState for view/edit toggle, useEffect to load, handleSave/handleDelete, Cards with CardHeader/CardTitle/CardContent.
- **Client Detail** (`/clients/[id]`) — View: name, email, phone, address. Edit: name*, email, phone, address, city, state, zip, notes. Archive (soft delete). Badge for inactive.
- **Vendor Detail** (`/vendors/[id]`) — View: name, trade, email, phone, address, tax_id. Edit: all fields. Archive (soft delete). Badge for inactive.
- **Lead Detail** (`/leads/[id]`) — View: first_name + last_name (heading), email, phone, address, lot_address, source, source_detail, project_type, timeline, expected_contract_value, budget_range_low/high. Edit: all fields, source (select: other/referral/website/social_media/walk_in/phone), priority (select: low/medium/high/urgent). Status as Badge (read-only). Archive (soft delete).
- **Estimate Detail** (`/estimates/[id]`) — View: name (heading), estimate_type, contract_type, subtotal, total, markup/overhead/profit %, valid_until, description, notes, version badge. Edit: name*, estimate_type (select: 6 options), contract_type, markup/overhead/profit %, valid_until, description, notes. Status as Badge (read-only). Archive (soft delete).
- **Invoice Detail** (`/invoices/[id]`) — View: invoice_number (heading), amount ($), invoice_date, due_date, notes. Edit: invoice_number, amount, dates, notes. Status as Badge (read-only). NO archive button (no deleted_at column).
- **Contract Detail** (`/contracts/[id]`) — View: title (heading), contract_number, contract_type, contract_value ($), retention_pct, start/end dates, description, content. Edit: title, contract_number, contract_type (select: 8 options), contract_value, retention_pct, dates, description. Status as Badge (read-only). Archive (soft delete).
- **Equipment Detail** (`/equipment/[id]`) — View: name, type, ownership, make/model/year, serial, daily rate, purchase price, location, notes. Status badge. Archive (soft delete).
- **HR Detail** (`/hr/[id]`) — View: employee_number, employment_status, employment_type, department, position, wage, pay_type, emergency contact. Archive (soft delete).
- **Contact Detail** (`/contacts/[id]`) — View: name, title, email, phone, is_primary badge. NO archive (no deleted_at).
- **Warranty Detail** (`/warranties/[id]`) — View: title, warranty_type, status, dates, coverage, exclusions, contact info. Archive (soft delete).
- **Email Marketing Detail** (`/email-marketing/[id]`) — View: name, campaign_type, status, channel, budget/spend, performance metrics (leads/conversions/revenue). NO archive (no deleted_at).
- **Inventory Detail** (`/inventory/[id]`) — View: name, SKU, category, unit, cost, reorder info. Archive (soft delete).
- **Assembly Detail** (`/library/assemblies/[id]`) — View: name, category, parameter_unit, is_active, description. Archive (soft delete).
- **Template Detail** (`/library/templates/[id]`) — View: name, contract_type, is_active/is_system badges, content in `<pre>` block. NO archive.
- **Cost Code Detail** (`/cost-codes/[id]`) — View: code (mono), name, division, subdivision, category (color badge), trade, description. Edit: all fields. Archive (soft delete).

### Job-Level Detail Pages (2026-02-25, batch 10)
All job-level detail pages follow the pattern: `'use client'`, useParams (id + itemId), useRouter, createClient (browser), useState for view/edit toggle, useEffect to load from Supabase, handleSave/handleDelete, Cards with view/edit modes. Archive = soft delete (deleted_at).
- **Permit Detail** (`/jobs/[id]/permits/[permitId]`) — View: permit_number (mono), permit_type (heading), status badge, jurisdiction, applied/issued/expiration dates, conditions, notes. Edit: permit_type*, status (6 options: pending/applied/issued/active/expired/revoked), permit_number, jurisdiction, 3 date fields, conditions (textarea), notes (textarea). Archive (deleted_at).
- **Warranty Detail** (`/jobs/[id]/warranties/[warrantyId]`) — View: title (heading), status badge, warranty_type badge, start/end dates, description. Edit: title*, status (4 options: active/expired/claimed/void), warranty_type, start/end dates, description (textarea). Archive (deleted_at).
- **File Detail** (`/jobs/[id]/files/[fileId]`) — View-only (no edit mode): filename (heading), file icon by mime_type, MIME type, file size (formatted with B/KB/MB), document_type, upload date. Archive (deleted_at). Includes formatFileSize helper.
- **Selection Detail** (`/jobs/[id]/selections/[selectionId]`) — View: status badge, room badge, category_id (mono), option_id (mono), selected_at, confirmed_at, created_at. Edit: status (4 options: pending/selected/confirmed/rejected), room, category_id*, option_id*, selected_at, confirmed_at. Archive (deleted_at).

### List Pages — Job-Level Clickable Rows (2026-02-25, batch 10)
Updated list item wrappers from `<div>` to `<Link>` for navigation to detail pages:
- **Permits** (`/jobs/[id]/permits`) — rows link to `/jobs/[id]/permits/[permitId]`
- **Warranties** (`/jobs/[id]/warranties`) — rows link to `/jobs/[id]/warranties/[warrantyId]`
- **Files** (`/jobs/[id]/files`) — rows link to `/jobs/[id]/files/[fileId]`
- **Selections** (`/jobs/[id]/selections`) — rows link to `/jobs/[id]/selections/[selectionId]`

### Detail Pages (2026-02-25, batch 11)
All detail pages follow the pattern: `'use client'`, useParams, useRouter, createClient (browser), useState for view/edit toggle, useEffect to load, handleSave, Cards with CardHeader/CardTitle/CardContent.
- **Time Entry Detail** (`/jobs/[id]/time-clock/[entryId]`) -- View: entry_date, clock_in/out times, regular_hours, overtime_hours, total hours, status (badge), entry_method. Edit: entry_date (date), clock_in/out (datetime-local), regular/overtime hours (number), status (select: pending/approved/rejected), entry_method, notes. No archive -- view/edit only. Back to `/jobs/[id]/time-clock`.
- **Invoice Detail** (`/jobs/[id]/invoices/[invoiceId]`) -- View: invoice_number, amount ($), status (badge with getStatusColor), vendor_id, invoice_date, due_date, notes. Edit: invoice_number, amount (number), status (select: 8 options), invoice_date (date), due_date (date), vendor_id, notes. Archive = set status to 'denied' (no deleted_at column). Back to `/jobs/[id]/invoices`.
- **License/Certification Detail** (`/compliance/licenses/[id]`) -- View: certification_name, status (badge), certification_type, issuing_authority, certification_number, employee_id, issued_date, expiration_date. Edit: all fields, status (select: active/expired/revoked/pending). Archive = set status to 'revoked' (no deleted_at column). Back to `/compliance/licenses`. No job context.

### List Pages -- Clickable Rows (2026-02-25, batch 11)
- **Time Clock** (`/jobs/[id]/time-clock`) -- rows wrapped in `<Link>` to `/jobs/[id]/time-clock/[entryId]` with hover style. Added `Link` import.
- **Invoices** (`/jobs/[id]/invoices`) -- Card items wrapped in `<Link>` to `/jobs/[id]/invoices/[invoiceId]` with hover style on Card.
- **Licenses** (`/compliance/licenses`) -- rows wrapped in `<Link>` to `/compliance/licenses/[id]` with hover style.

### Top-Level Nav Pages (2026-02-24, batch 8)
All sidebar links now resolve — zero 404s:
- **Schedule** (`/schedule`) — SSR, queries jobs, links to `/jobs/[id]/schedule`
- **Daily Logs** (`/daily-logs`) — SSR, queries `daily_logs` joined with `jobs`
- **Photos** (`/photos`) — Static placeholder, links to jobs
- **Purchase Orders** (`/purchase-orders`) — SSR, queries `purchase_orders`, search, links to job-level POs
- **Draws** (`/draws`) — SSR, queries `draw_requests` joined with `jobs`, search
- **Change Orders** (`/change-orders`) — SSR, queries `change_orders`, search
- **Reports** (`/reports`) — Hub with 4 report type cards (Cash Flow, Profitability, Budget vs Actual, WIP)
- **Files** (`/files`) — Placeholder, links to jobs
- **Settings** (`/settings`) — Redirect to `/settings/general`
- **Accounting** (`/accounting`) — Hub with 4 cards (GL, AP, AR, Bank Reconciliation)
- **Final Docs** (`/final-docs`) — Hub with Warranties + As-Built Documents links

### Bug Fixes (2026-02-24, batch 8)
- **Dashboard** — Fixed `.from('draws')` → `.from('draw_requests')` (table didn't exist)
- **RLS policies** — Fixed 56 tables using broken `current_setting('app.current_company_id')` pattern. Created `get_user_company_id()` SECURITY DEFINER function. All tables now use `company_id = get_user_company_id()` for SELECT/INSERT/UPDATE/DELETE policies.

### List Pages — Clickable Rows (2026-02-24, batch 7)
All list rows updated from `<div>` to `<Link>` for navigation to detail pages:
- **Leads** (`/leads`) — rows link to `/leads/[id]`
- **Estimates** (`/estimates`) — rows link to `/estimates/[id]`
- **Invoices** (`/invoices`) — rows link to `/invoices/[id]`
- **Contracts** (`/contracts`) — rows link to `/contracts/[id]`
- **Clients** (`/clients`) — already had clickable rows (pre-existing)
- **Vendors** (`/vendors`) — already had clickable rows (pre-existing)

### Navigation Config Updates
| Route | Old Path | New Path |
|-------|----------|----------|
| Dashboard | /skeleton | /dashboard |
| Jobs | /skeleton/jobs | /jobs |
| Clients | /skeleton/directory/clients | /clients |
| Vendors | /skeleton/directory/vendors | /vendors |
| Cost Codes | /skeleton/library/cost-codes | /cost-codes |
| Settings | /skeleton/company/settings | /settings/general |
| Features | /skeleton/company/features | /settings/features |
| Team | /skeleton/directory/team | /settings/users |
| Job Back Link | /skeleton/jobs | /jobs |
| Leads | /skeleton/leads | /leads |
| Estimates | /skeleton/estimates | /estimates |
| Contracts | /skeleton/contracts | /contracts |
| Equipment | /skeleton/operations/equipment | /equipment |
| Warranties | /skeleton/warranties | /warranties |
| Time Clock | /skeleton/operations/time-clock | /time-clock |
| Chart of Accounts | /skeleton/financial/chart-of-accounts | /financial/chart-of-accounts |
| Receivables | /skeleton/financial/receivables | /financial/receivables |
| Payables | /skeleton/financial/payables | /financial/payables |
| Journal Entries | /skeleton/financial/journal-entries | /financial/journal-entries |
| Inventory | /skeleton/operations/inventory | /inventory |
| Punch Lists | /skeleton/punch-lists | /punch-lists |
| Financial Dashboard | /skeleton/financial/dashboard | /financial/dashboard |
| Bank Reconciliation | /skeleton/financial/bank-reconciliation | /financial/bank-reconciliation |
| Cash Flow | /skeleton/financial/cash-flow | /financial/cash-flow |
| Profitability | /skeleton/financial/profitability | /financial/profitability |
| Reports | /skeleton/financial/reports | /financial/reports |
| Business Mgmt | /skeleton/financial/business-management | /financial/business-management |
| Job Close | /skeleton/financial/job-close | /financial/job-close |
| Calendar | /skeleton/operations/calendar | /operations/calendar |
| Crew Schedule | /skeleton/operations/crew-schedule | /operations/crew-schedule |
| Deliveries | /skeleton/operations/deliveries | /operations/deliveries |
| Proposals | /skeleton/proposals | /proposals |
| Legal | /skeleton/contracts/legal | /legal |
| Feasibility | /skeleton/pre-construction | /pre-construction |
| Post-Build | /skeleton/post-build | /post-build |
| Contacts | /skeleton/directory/contacts | /contacts |
| HR & Workforce | /skeleton/directory/hr | /hr |
| Selections Catalog | /skeleton/library/selections | /library/selections |
| Assemblies | /skeleton/library/assemblies | /library/assemblies |
| Templates | /skeleton/library/templates | /library/templates |
| Integrations | /skeleton/company/integrations | /integrations |
| Insurance | /skeleton/compliance/insurance | /compliance/insurance |
| Licenses | /skeleton/compliance/licenses | /compliance/licenses |
| Safety | /skeleton/compliance/safety | /compliance/safety |
| Lien Law | /skeleton/compliance/lien-law | /compliance/lien-law |
| Dashboards | /skeleton/company/dashboards | /dashboards |
| Email Marketing | /skeleton/company/email-marketing | /email-marketing |

---

## Module 04: Navigation, Search & Dashboard (2026-02-24)

### Search API (`/api/v2/search`)
- GET with query params: q (2-200 chars), types (CSV: jobs,clients,vendors,invoices), limit (default 5, max 20)
- Parallel queries to jobs, clients, vendors, invoices tables
- Returns grouped SearchResponse: { query, groups[{ entity_type, label, results[], total }], total }
- LIKE-based search on name, job_number, email, company_name fields
- Tenant-isolated (company_id filter), soft-delete aware

### Command Palette (`components/command-palette/command-palette.tsx`)
- Dialog triggered by Cmd+K / Ctrl+K global listener
- States: empty (shows recent searches), typing (shows search results + quick actions)
- 250ms debounced API calls, min 2 chars
- Keyboard navigation: ↑↓ navigate, Enter select, Esc close
- Sub-components: QuickActionItem, SearchResultItem (with entity-type color coding)

### Quick Actions (`lib/search/quick-actions.ts`)
- `getQuickActions()` — returns create actions + nav-derived actions (cached)
- `filterQuickActions(query)` — keyword-based filtering
- Create actions: "Create New Job", "Add New Client", "Add New Vendor"
- Nav actions: flattened from companyNav, companyJobNav, companyRightNav, companyIntelligenceNav

### Recent Searches (`lib/search/recent-searches.ts`)
- localStorage-based persistence
- 10-item cap, deduplication, 2-char minimum, whitespace trimming
- `getRecentSearches()`, `addRecentSearch(term)`, `clearRecentSearches()`

### Hooks
- `useCommandPalette()` — open/close state, recent searches, quick actions, Cmd+K listener
- `useSearch(query, enabled)` — debounced React Query, 30s stale time

### Types (`types/search.ts`)
- SearchEntityType: 'jobs' | 'clients' | 'vendors' | 'invoices'
- SearchResult: { id, entity_type, title, subtitle, status, url }
- SearchResponse: { query, groups[], total }
- QuickAction: { id, label, description, icon, href, category, keywords[] }

---

## Module 05: Notification Engine (2026-02-24)

### API Routes (6 endpoints at /api/v2/notifications/)
- `GET /` — List notifications with pagination, filter by category/urgency/read status
- `POST /` — Emit notification (admin-only), creates records + in-app delivery
- `PUT /[id]` — Mark single notification read/unread
- `DELETE /[id]` — Archive notification (soft delete)
- `GET /preferences` — User's category×channel preference matrix
- `PUT /preferences` — Update preferences (upsert on user_id, company_id, category, channel)
- `GET /settings` — Quiet hours, digest mode, timezone
- `PUT /settings` — Update settings (upsert on user_id, company_id)
- `GET /unread-count` — Unread count for bell badge
- `PUT /read-all` — Bulk mark all as read

### Notification Bell (`components/notifications/notification-bell.tsx`)
- Bell icon with unread badge count
- Dropdown panel: latest 20 notifications with infinite scroll
- Category icons: DollarSign (financial), Calendar (schedule), FileText (documents), HardHat (field_ops), Shield (approvals), Settings (system)
- Urgency color coding: low=muted, normal=blue, high=amber, critical=red
- Time-ago formatter ("just now", "5m ago", "2h ago", "3d ago")
- Click notification → navigate via url_path
- Actions: mark read, mark all read, archive/dismiss

### React Query Hook (`hooks/use-notifications.ts`)
- Polling: 30s unread count, 60s notifications list
- Mutations: markAsRead, markAllAsRead, archiveNotification
- Query cache invalidation on mutation success

### Service (`lib/notifications/service.ts`)
- `emitNotification(options)` — creates notification + in-app delivery records
- Idempotency: key = `${eventType}:${entityId}:${userId}:${minuteWindow}`
- `NOTIFICATION_CATEGORIES` — 6 categories with labels and default channels
- `NOTIFICATION_CHANNELS` — 4 channels (in_app, email, sms, push)

### Zod Schemas (`lib/validation/schemas/notifications.ts`)
- `listNotificationsSchema`, `updatePreferencesSchema`, `updateSettingsSchema`, `emitNotificationSchema`
- Enum schemas: urgency (4), category (6), channel (4), digest frequency (3)

### DB Tables (migration applied)
- `notification_event_types` — 16 seeded event types
- `company_notification_config` — per-company overrides
- `user_notification_preferences` — category×channel matrix
- `user_notification_settings` — quiet hours, digest, timezone
- `notifications` — individual records with idempotency
- `notification_deliveries` — per-channel delivery tracking

---

## Phase 0D: Code Quality Hardening (2026-02-24)

### database.ts — Generated Types (Replaced Manual)
- **Before**: 31 manually-defined tables, missing `Relationships` field causing all Supabase operations to resolve to `never`
- **After**: 205+ tables generated from live Supabase DB via `generate_typescript_types`, proper `Relationships: GenericRelationship[]` on every table
- Convenience aliases appended: enum types (UserRole, JobStatus, etc.), row types (Job, User, Client, etc.)
- 9 placeholder types for tables not yet in live DB: JobAssignment, TenantConfig, FeatureFlag, ProjectPhase, TerminologyOverride, NumberingPattern, NumberingSequence, CustomFieldDefinition, CustomFieldValue
- 7 literal union types for enums not yet in live DB: ProjectType, CostCodeCategory, NotificationUrgency/Category/Channel, DeliveryStatus, DigestFrequency

### Cast Pattern Fix (435 v2 route files)
- **Before**: `(supabase.from('table') as any)` — fails because error is on `.from()` argument, not result
- **After**: `(supabase as any).from('table')` — works by bypassing argument validation on `from()`
- Applied to all v2 route files that reference tables not in the generated types

### monitoring/index.ts
- Replaced `api_metrics` DB insert (table doesn't exist) with structured logger calls
- Fixed audit_log column names: `table_name` → `entity_type`, `record_id` → `entity_id`
- Removed `as any` casts, added `error: unknown` to catch blocks

### queue/index.ts
- Removed `type UntypedQuery = any` and all `as UntypedQuery` casts (12+ instances)
- Added `import type { Json }` and `as Json` for payload fields

### Nullable Field Safety
- `users.role`, `users.is_active`, `users.created_at`, `users.updated_at` are nullable in live DB
- `jobs.status`, `jobs.contract_type` are nullable in live DB
- Added null fallbacks: `?? 'field'`, `?? true`, `?? new Date().toISOString()`, `?? 'active'`
- Affected: layout.tsx, dashboard/page.tsx, jobs/page.tsx, EditUserModal.tsx, UserTable.tsx

### Config Files (feature-flags, numbering, terminology, resolve-config)
- Added `(supabase as any)` for tables not in live DB: feature_flags, numbering_patterns, numbering_sequences, tenant_configs, terminology_overrides
- Updated placeholder types to match config code expectations (added missing fields)

## Module 02: Configuration Engine (2026-02-24)

### Database Migration (12 tables applied to live DB)
- **tenant_configs**: Company settings (section, key, value JSONB). RLS on company_id.
- **feature_flags**: Feature toggles with plan gating (flag_key, enabled, plan_required, metadata). RLS.
- **workflow_definitions**: State machine definitions (states, transitions, thresholds, notifications as JSONB). RLS.
- **project_phases**: Customizable phase definitions (name, color, sort_order, milestone_type). RLS.
- **terminology_overrides**: Custom display terms (term_key, display_value, plural_value, context). RLS.
- **numbering_patterns**: Numbering schemas (pattern, scope, padding, reset_yearly). RLS.
- **numbering_sequences**: Atomic sequence counters (entity_type, scope_key, current_value). RLS.
- **custom_field_definitions**: EAV schema (entity_type, field_key, field_type, options, validation). RLS.
- **custom_field_values**: EAV data (entity_type, entity_id, field_id, value JSONB). RLS.
- **config_versions**: Config audit trail (section, key, old_value, new_value, changed_by). RLS.
- **platform_defaults**: Seed table (21 defaults across 7 sections). RLS.
- **default_terminology**: Seed table (50 default terms). RLS.

### Config Library (app/src/lib/config/)
- **resolve-config.ts**: 4-level config resolution (Platform → Company → Project → User). Caching with 5-minute TTL.
- **feature-flags.ts**: 18 flag definitions, plan-gated (free/starter/pro/enterprise). get/set/check with cache.
- **terminology.ts**: 42+ default terms. Overrides stored in DB. getTerm/getTermPlural with fallback.
- **numbering.ts**: 8 entity types. Pattern validation ({YYYY}, {###}, {JOB}). Sequence generation with atomic increment.
- **types.ts**: Full TypeScript interfaces for all config entities.
- **index.ts**: Barrel export for all config functions.

### API Routes (v1)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v1/settings/company | Get company profile + all tenant configs |
| PATCH | /api/v1/settings/company | Update company settings (section/key/value) |
| GET | /api/v1/settings/feature-flags | Get all flags with plan gating |
| PATCH | /api/v1/settings/feature-flags | Toggle multiple flags |
| GET | /api/v1/settings/numbering | Get all numbering patterns |
| PATCH | /api/v1/settings/numbering | Update numbering pattern |
| POST | /api/v1/settings/numbering | Preview next number |
| GET | /api/v1/settings/terminology | Get all terminology (defaults + overrides) |
| PUT | /api/v1/settings/terminology | Batch update terminology overrides |
| GET/POST | /api/v1/settings/phases | List/create project phases |
| GET/PATCH/DELETE | /api/v1/settings/phases/:id | Get/update/delete project phase |
| GET/POST | /api/v1/custom-fields | List/create custom field definitions (filter by entityType) |
| GET/PATCH/DELETE | /api/v1/custom-fields/:id | Get/update/delete custom field definition |
| GET | /api/v1/workflows | List workflow definitions |
| GET/PUT | /api/v1/workflows/:entityType | Get/upsert workflow for entity type |
| GET/POST/PATCH/DELETE | /api/v1/cost-codes[/:id] | Full CRUD for cost codes |

### database.ts Regeneration
- Regenerated from live Supabase DB (217 tables, 9 enums)
- build-db-types.cjs script: auto-detects which tables exist, creates Tables<> aliases for live tables, placeholder types for future
- 69 table aliases point to real generated types, 42 placeholder types for future modules
- Removed `(supabase as any)` casts from all Module 02 config files (6 files)
- Fixed nullable DB columns in config mapping code (feature-flags.ts, numbering.ts)

## Module 47: Training & Certification Platform (V1 Foundation)

### Database Tables
- **training_courses**: Content items for training. Columns: company_id (UUID nullable for platform content), title (VARCHAR 255), description (TEXT), content_url (TEXT), thumbnail_url (TEXT), duration_minutes (INT), course_type (video/article/walkthrough/assessment), category (VARCHAR 100), module_tag (VARCHAR 50), role_tags (TEXT[]), difficulty (beginner/intermediate/advanced), language (VARCHAR 10 default 'en'), transcript (TEXT), sort_order (INT default 0), is_published (BOOLEAN default false), view_count (INT default 0), created_by (UUID). Soft delete via deleted_at. RLS with platform content support (company_id IS NULL OR matches). 8 indexes.
- **training_paths**: Structured learning paths. Columns: company_id (UUID nullable for platform paths), name (VARCHAR 200), description (TEXT), role_key (VARCHAR 50), estimated_hours (NUMERIC 6,1 default 0), sort_order (INT default 0), is_active (BOOLEAN default true), created_by (UUID). RLS with platform content support. 5 indexes.
- **training_path_items**: Items within a learning path. Columns: company_id (UUID nullable), path_id (FK training_paths CASCADE), item_type (course/assessment/checkpoint), item_id (UUID NOT NULL), sort_order (INT default 0), is_required (BOOLEAN default true). RLS with platform content support. 4 indexes.
- **user_training_progress**: Per-user progress tracking. Columns: company_id (UUID NOT NULL), user_id (UUID NOT NULL), item_type (course/assessment/checkpoint), item_id (UUID NOT NULL), status (not_started/in_progress/completed), progress_pct (INT 0-100 default 0), started_at (TIMESTAMPTZ), completed_at (TIMESTAMPTZ). UNIQUE(company_id, user_id, item_type, item_id). RLS enabled. 7 indexes.
- **user_certifications**: Certification completions/attempts. Columns: company_id (UUID NOT NULL), user_id (UUID NOT NULL), certification_name (VARCHAR 255), certification_level (INT 1-3 default 1), description (TEXT), passing_score (INT 0-100 default 80), assessment_score (INT 0-100 nullable), passed (BOOLEAN default false), attempt_count (INT >= 1 default 1), certified_at (TIMESTAMPTZ), expires_at (TIMESTAMPTZ), time_limit_minutes (INT), issued_by (UUID), notes (TEXT). RLS enabled. 8 indexes.

### API Endpoints (10 route files under /api/v2/training/)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/training/courses | List courses filtered by course_type/difficulty/category/is_published/q. Paginated. Excludes soft-deleted. Searches title and description via OR ilike. |
| POST | /api/v2/training/courses | Create course. Requires title. Defaults: course_type=video, difficulty=beginner, language=en, sort_order=0, is_published=false, role_tags=[]. Returns 201. |
| GET | /api/v2/training/courses/:id | Get single course. |
| PUT | /api/v2/training/courses/:id | Update course fields including view_count. |
| DELETE | /api/v2/training/courses/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/training/paths | List paths filtered by role_key/is_active/q. Paginated. Searches name and description. |
| POST | /api/v2/training/paths | Create path. Requires name. Defaults: estimated_hours=0, sort_order=0, is_active=true. Returns 201. |
| GET | /api/v2/training/paths/:id | Get path with items_count. |
| PUT | /api/v2/training/paths/:id | Update path fields. |
| DELETE | /api/v2/training/paths/:id | Deactivate: sets is_active=false. |
| GET | /api/v2/training/paths/:id/items | List path items. Paginated. Ordered by sort_order. |
| POST | /api/v2/training/paths/:id/items | Add item to path. Verifies path exists. Returns 201. |
| PUT | /api/v2/training/paths/:id/items/:itemId | Update path item. |
| DELETE | /api/v2/training/paths/:id/items/:itemId | Hard delete path item. |
| GET | /api/v2/training/progress | List progress records filtered by user_id/item_type/status. Paginated. |
| POST | /api/v2/training/progress | Create progress record. Requires user_id, item_id. Defaults: item_type=course, status=not_started, progress_pct=0. Returns 201. |
| GET | /api/v2/training/progress/:id | Get single progress record. |
| PUT | /api/v2/training/progress/:id | Update progress (status, progress_pct, started_at, completed_at). |
| GET | /api/v2/training/certifications | List certifications filtered by user_id/passed/certification_level/q. Paginated. Searches certification_name and description. |
| POST | /api/v2/training/certifications | Create certification. Requires user_id, certification_name. Defaults: certification_level=1, passing_score=80, passed=false, attempt_count=1. Sets issued_by from auth context. Returns 201. |
| GET | /api/v2/training/certifications/:id | Get single certification. |
| PUT | /api/v2/training/certifications/:id | Update certification fields. |

### Type System
- 5 type unions: CourseType (4 values), Difficulty (3), TrainingStatus (3), PathItemType (3), CertificationLevel (1|2|3 numeric)
- 5 interfaces: TrainingCourse, TrainingPath, TrainingPathItem, UserTrainingProgress, UserCertification
- 5 constant arrays: COURSE_TYPES, DIFFICULTIES, TRAINING_STATUSES, PATH_ITEM_TYPES, CERTIFICATION_LEVELS

### Validation Schemas (Zod)
- 5 enum schemas: courseTypeEnum, difficultyEnum, trainingStatusEnum, pathItemTypeEnum, certificationLevelEnum (uses z.union of z.literal for numeric values)
- 15 CRUD schemas covering courses (list/create/update), paths (list/create/update), path items (list/create/update), progress (list/create/update), certifications (list/create/update)

---

## Module 50: Marketing Website & Sales Pipeline (V1 Foundation)

### Database Tables
- **marketing_leads**: Platform-level sales pipeline leads (no company_id). Columns: source (website_trial/demo_request/contact_form/referral default contact_form), utm_source/utm_medium/utm_campaign (VARCHAR 255), name (VARCHAR 255 NOT NULL), email (VARCHAR 255 NOT NULL), company_name (VARCHAR 255), phone (VARCHAR 50), company_size (VARCHAR 50), current_tools (TEXT), pipeline_stage (8 stages: captured/qualified/demo_scheduled/demo_completed/proposal_sent/negotiation/closed_won/closed_lost default captured), assigned_to (UUID), deal_value (DECIMAL 10,2 default 0), close_probability (INT 0-100 default 0), closed_at (TIMESTAMPTZ), closed_reason (won/lost_price/lost_features/lost_competitor/lost_timing nullable), competitor_name (VARCHAR 255), notes (TEXT), crm_id (VARCHAR 100). Soft delete via deleted_at. RLS USING (true) for platform admin access. 8 indexes.
- **marketing_referrals**: Tenant-scoped referral tracking. Columns: referrer_company_id (FK companies NOT NULL), referral_code (VARCHAR 20 NOT NULL UNIQUE), referred_email (VARCHAR 255 NOT NULL), referred_company_name (VARCHAR 255), referred_company_id (UUID), status (link_created/clicked/signed_up/converted default link_created), referrer_credit (DECIMAL 10,2 default 0), credit_applied (BOOLEAN default false), clicked_at/signed_up_at/converted_at (TIMESTAMPTZ). No soft delete. RLS via referrer_company_id = get_current_company_id(). 6 indexes.
- **testimonials**: Tenant-scoped customer testimonials. Columns: company_id (FK companies NOT NULL), contact_name (VARCHAR 200 NOT NULL), contact_title (VARCHAR 200), company_display_name (VARCHAR 255), quote_text (TEXT NOT NULL), rating (INT 1-5), video_url (TEXT), photo_url (TEXT), is_approved (BOOLEAN default false), is_featured (BOOLEAN default false), display_on (TEXT[] default {}), collected_at (TIMESTAMPTZ default now()), approved_by (UUID), approved_at (TIMESTAMPTZ). No soft delete. RLS via company_id. 6 indexes.
- **case_studies**: Platform-level marketing case studies (no company_id). Columns: title (VARCHAR 255 NOT NULL), slug (VARCHAR 255 NOT NULL UNIQUE), company_name (VARCHAR 255), company_size (VARCHAR 50), challenge/solution/results (TEXT), metrics (JSONB default {}), quote_text (TEXT), quote_author (VARCHAR 200), photos/industry_tags/region_tags (TEXT[] default {}), is_published (BOOLEAN default false), published_at (TIMESTAMPTZ), created_by (UUID). Soft delete via deleted_at. RLS USING (true). 5 indexes.
- **blog_posts**: Platform-level content marketing (no company_id). Columns: title (VARCHAR 255 NOT NULL), slug (VARCHAR 255 NOT NULL UNIQUE), excerpt (TEXT), body_html (TEXT), author_name (VARCHAR 200), category (industry/product/how_to/customer_spotlight default industry), tags (TEXT[] default {}), featured_image (TEXT), meta_title (VARCHAR 200), meta_description (VARCHAR 500), is_published (BOOLEAN default false), published_at (TIMESTAMPTZ), view_count (INT default 0), created_by (UUID). Soft delete via deleted_at. RLS USING (true). 7 indexes.

### API Endpoints (10 routes under /api/v2/marketing-site/)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/marketing-site/leads | List leads filtered by source/pipeline_stage/assigned_to/closed_reason/q. Paginated. Excludes soft-deleted. Searches name, email, company_name via OR ilike. |
| POST | /api/v2/marketing-site/leads | Create lead. Requires name, email. Defaults: source=contact_form, pipeline_stage=captured, deal_value=0, close_probability=0. Returns 201. |
| GET | /api/v2/marketing-site/leads/:id | Get single lead. |
| PUT | /api/v2/marketing-site/leads/:id | Update lead. Auto-sets closed_at when pipeline_stage changes to closed_won/closed_lost. |
| DELETE | /api/v2/marketing-site/leads/:id | Soft delete lead. |
| GET | /api/v2/marketing-site/referrals | List referrals filtered by status/credit_applied/q. Paginated. Tenant-scoped via referrer_company_id. |
| POST | /api/v2/marketing-site/referrals | Create referral. Requires referral_code, referred_email. 409 on duplicate referral_code. Returns 201. |
| GET | /api/v2/marketing-site/referrals/:id | Get single referral. Tenant-scoped. |
| PUT | /api/v2/marketing-site/referrals/:id | Update referral. Auto-sets clicked_at/signed_up_at/converted_at on status transitions. |
| GET | /api/v2/marketing-site/testimonials | List testimonials filtered by is_approved/is_featured/rating/q. Paginated. Tenant-scoped via company_id. |
| POST | /api/v2/marketing-site/testimonials | Create testimonial. Requires contact_name, quote_text. Defaults: is_approved=false, is_featured=false, display_on=[]. Returns 201. |
| GET | /api/v2/marketing-site/testimonials/:id | Get single testimonial. Tenant-scoped. |
| PUT | /api/v2/marketing-site/testimonials/:id | Update testimonial. Auto-sets approved_by/approved_at when is_approved changes to true. |
| GET | /api/v2/marketing-site/case-studies | List case studies filtered by is_published/q. Paginated. Excludes soft-deleted. Searches title, company_name, challenge. |
| POST | /api/v2/marketing-site/case-studies | Create case study. Requires title, slug. Auto-sets published_at if is_published=true. Returns 201. |
| GET | /api/v2/marketing-site/case-studies/:id | Get single case study. |
| PUT | /api/v2/marketing-site/case-studies/:id | Update case study. Auto-sets published_at when is_published changes to true. |
| DELETE | /api/v2/marketing-site/case-studies/:id | Soft delete case study. |
| GET | /api/v2/marketing-site/blog-posts | List blog posts filtered by category/is_published/q. Paginated. Excludes soft-deleted. Searches title, excerpt, author_name. |
| POST | /api/v2/marketing-site/blog-posts | Create blog post. Requires title, slug. Defaults: category=industry, is_published=false. Auto-sets published_at if is_published=true. Returns 201. |
| GET | /api/v2/marketing-site/blog-posts/:id | Get single blog post. |
| PUT | /api/v2/marketing-site/blog-posts/:id | Update blog post. Auto-sets published_at when is_published changes to true. |
| DELETE | /api/v2/marketing-site/blog-posts/:id | Soft delete blog post. |

### Type System
- 5 type unions: LeadSource (4), PipelineStage (8), ReferralStatus (4), BlogCategory (4), ClosedReason (5)
- 5 interfaces: MarketingLead, MarketingReferral, Testimonial, CaseStudy, BlogPost
- 5 constant arrays: LEAD_SOURCES, PIPELINE_STAGES, REFERRAL_STATUSES, BLOG_CATEGORIES, CLOSED_REASONS

### Validation Schemas (Zod)
- 5 enum schemas: leadSourceEnum, pipelineStageEnum, referralStatusEnum, blogCategoryEnum, closedReasonEnum
- listMarketingLeadsSchema (page/limit/source/pipeline_stage/assigned_to/closed_reason/q)
- createMarketingLeadSchema (requires name, email; defaults: source=contact_form, pipeline_stage=captured, deal_value=0, close_probability=0)
- updateMarketingLeadSchema (all fields optional; closed_at YYYY-MM-DD, closed_reason nullable)
- listMarketingReferralsSchema (page/limit/status/credit_applied with boolean preprocess/q)
- createMarketingReferralSchema (requires referral_code max 20, referred_email; defaults: status=link_created, referrer_credit=0)
- updateMarketingReferralSchema (all fields optional; referred_company_id UUID)
- listTestimonialsSchema (page/limit/is_approved/is_featured with boolean preprocess/rating 1-5/q)
- createTestimonialSchema (requires contact_name max 200, quote_text; defaults: is_approved=false, is_featured=false, display_on=[]; rating 1-5 nullable; video_url/photo_url URL validated; collected_at YYYY-MM-DD)
- updateTestimonialSchema (all fields optional)
- listCaseStudiesSchema (page/limit/is_published with boolean preprocess/q)
- createCaseStudySchema (requires title max 255, slug with regex /^[a-z0-9]+(?:-[a-z0-9]+)*$/; defaults: is_published=false, metrics={}, photos=[], industry_tags=[], region_tags=[])
- updateCaseStudySchema (all fields optional; slug regex validated)
- listBlogPostsSchema (page/limit/category enum/is_published with boolean preprocess/q)
- createBlogPostSchema (requires title max 255, slug with regex; defaults: category=industry, is_published=false, tags=[]; featured_image URL validated; meta_title max 200; meta_description max 500)
- updateBlogPostSchema (all fields optional; slug regex validated; featured_image nullable)

---

## Module 46: Customer Support (V1 Foundation)

### Database Tables
- **support_tickets**: Core ticket records. Columns: company_id, user_id (UUID nullable), ticket_number (VARCHAR 30), subject (VARCHAR 255), description (TEXT), status (open/in_progress/waiting_on_customer/waiting_on_agent/resolved/closed), priority (low/normal/high/urgent), category (general/billing/technical/feature_request/bug_report/onboarding/integration/other), channel (web/email/chat/phone), assigned_agent_id (UUID), tags (JSONB default []), first_response_at (TIMESTAMPTZ), resolved_at (TIMESTAMPTZ), closed_at (TIMESTAMPTZ), satisfaction_rating (INT 1-5 nullable), created_by (UUID). Soft delete via deleted_at. RLS enabled. 12 indexes.
- **ticket_messages**: Messages within tickets. Columns: company_id, ticket_id (FK support_tickets CASCADE), sender_type (customer/agent/system), sender_id (UUID), message_text (TEXT), attachments (JSONB default []), is_internal (BOOLEAN default false). RLS enabled. 6 indexes.
- **kb_articles**: Knowledge base articles. Columns: company_id (nullable for platform-level articles), title (VARCHAR 255), slug (VARCHAR 300 UNIQUE), content (TEXT), category (VARCHAR 100), tags (JSONB default []), status (draft/published/archived), view_count (INT default 0), helpful_count (INT default 0), not_helpful_count (INT default 0), author_id (UUID). Soft delete via deleted_at. RLS enabled (special policy: company_id IS NULL OR company_id = current). 7 indexes.
- **feature_requests**: Feature request tracking. Columns: company_id, user_id (UUID), title (VARCHAR 255), description (TEXT), status (submitted/under_review/planned/in_progress/completed/declined), priority (low/normal/high/urgent), category (general/billing/technical/feature_request/bug_report/onboarding/integration/other), vote_count (INT default 0), created_by (UUID). Soft delete via deleted_at. RLS enabled. 9 indexes.
- **feature_request_votes**: Vote tracking per feature request. Columns: company_id, feature_request_id (FK feature_requests CASCADE), user_id (UUID NOT NULL). UNIQUE(company_id, feature_request_id, user_id). RLS enabled. 4 indexes.

### API Endpoints (9 route files, 22+ routes under /api/v2/support/)
- Support Tickets: GET list (filter by status/priority/category/channel/assigned_agent_id/q), POST create, GET/PUT/DELETE by ID. PUT auto-sets resolved_at on status=resolved, closed_at on status=closed. Closed tickets cannot be updated (403).
- Ticket Messages: GET list per ticket (ordered ascending), POST create. First agent reply auto-sets first_response_at on parent ticket. GET/PUT/DELETE individual messages (hard delete).
- KB Articles: GET list (platform + company articles), POST create with duplicate slug check (409). GET/PUT/DELETE by ID (soft delete).
- Feature Requests: GET list (ordered by vote_count DESC), POST create. GET by ID with votes_count. PUT/DELETE by ID (soft delete).
- Feature Request Votes: GET list per request, POST add vote with duplicate check (409) + vote_count increment, DELETE remove vote by user_id query param + vote_count decrement.

### Type System
- 7 type unions: TicketStatus (6), TicketPriority (4), TicketCategory (8), TicketChannel (4), SenderType (3), ArticleStatus (3), FeatureRequestStatus (6)
- 5 interfaces: SupportTicket, TicketMessage, KbArticle, FeatureRequest, FeatureRequestVote
- 7 constant arrays: TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES, TICKET_CHANNELS, SENDER_TYPES, ARTICLE_STATUSES, FEATURE_REQUEST_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas: ticketStatusEnum, ticketPriorityEnum, ticketCategoryEnum, ticketChannelEnum, senderTypeEnum, articleStatusEnum, featureRequestStatusEnum
- 15 CRUD schemas: listTicketsSchema, createTicketSchema (requires ticket_number + subject; defaults: open/normal/general/web/tags=[]), updateTicketSchema (satisfaction_rating 1-5 nullable), listTicketMessagesSchema (boolean preprocess for is_internal), createTicketMessageSchema (requires message_text; defaults: customer/attachments=[]/is_internal=false), updateTicketMessageSchema, listKbArticlesSchema, createKbArticleSchema (requires title + slug with regex validation; defaults: draft/tags=[]), updateKbArticleSchema, listFeatureRequestsSchema, createFeatureRequestSchema (requires title; defaults: submitted/normal/general), updateFeatureRequestSchema, listFeatureRequestVotesSchema, createFeatureRequestVoteSchema (requires user_id UUID)

---

## Module 36: Lead Pipeline & CRM (V1 Foundation)

### Database Tables
- **leads**: Core lead/prospect records. Columns: company_id, first_name (VARCHAR 100), last_name (VARCHAR 100), email (VARCHAR 255), phone (VARCHAR 50), address (TEXT), lot_address (TEXT), source (TEXT default 'other'), source_detail (TEXT), utm_source/utm_medium/utm_campaign (VARCHAR 255), project_type (TEXT), budget_range_low/budget_range_high (NUMERIC 15,2), timeline (TEXT), lot_status (TEXT), financing_status (TEXT), preconstruction_type (design_build/plan_bid_build), status (new/contacted/qualified/proposal_sent/negotiating/won/lost/on_hold), priority (low/normal/high/hot), pipeline_id (FK pipelines), stage_id (FK pipeline_stages), score (INT default 0), assigned_to (UUID), expected_contract_value (NUMERIC 15,2 default 0), probability_pct (NUMERIC 5,2 default 0), lost_reason (TEXT), lost_competitor (TEXT), won_project_id (UUID), created_by (UUID). Soft delete via deleted_at. RLS enabled.
- **lead_activities**: Activity log per lead. Columns: company_id, lead_id (FK leads CASCADE), activity_type (call/email/meeting/note/site_visit/proposal/follow_up), subject (VARCHAR 255), description (TEXT), performed_by (UUID), activity_date (TIMESTAMPTZ), duration_minutes (INT). RLS enabled.
- **lead_sources**: Configurable lead source registry. Columns: company_id, name (VARCHAR 200), description (TEXT), source_type (referral/website/social_media/advertising/trade_show/cold_call/partner/other), is_active (BOOLEAN default true). RLS enabled.
- **pipelines**: Customizable pipeline definitions. Columns: company_id, name (VARCHAR 200), description (TEXT), is_default (BOOLEAN default false), is_active (BOOLEAN default true), created_by (UUID). RLS enabled.
- **pipeline_stages**: Individual stages within a pipeline. Columns: company_id, pipeline_id (FK pipelines CASCADE), name (VARCHAR 200), stage_type (lead/qualified/proposal/negotiation/closed), sequence_order (INT default 0), probability_default (NUMERIC 5,2 default 0), color (VARCHAR 20), is_active (BOOLEAN default true). RLS enabled.

### API Endpoints
- 25 endpoints under /api/v2/crm/ covering leads CRUD, activities CRUD, sources CRUD, pipelines CRUD, pipeline stages CRUD

### Type System
- 6 type unions: LeadStatus (8), LeadSource (8), ActivityType (7), LeadPriority (4), StageType (5), PreconstructionType (2)
- 5 interfaces: Lead, LeadActivity, LeadSourceRecord, Pipeline, PipelineStage
- 6 constant arrays with value/label pairs
- 6 enum schemas + 15 CRUD schemas

---

## Module 39: Advanced Reporting & Custom Report Builder (V1 Foundation)

### Database Tables
- **custom_reports**: User-built report definitions. Columns: company_id, name (VARCHAR 255), description, report_type (standard/custom), data_sources/fields/filters/grouping/sorting/calculated_fields (JSONB), visualization_type (9 types), audience (4 types), status (draft/published/archived), refresh_frequency (4 types), is_template, shared_with, created_by. Soft delete. RLS. 8 indexes.
- **custom_report_widgets**: Widgets within reports. report_id FK CASCADE, widget_type (9), data_source (10), configuration/filters JSONB, sort_order. RLS. 3 indexes.
- **report_dashboards**: Dashboard layouts. layout (4 types), is_default, is_admin_pushed, target_roles, global_filters. Soft delete. RLS. 5 indexes.
- **dashboard_widgets**: Widgets on dashboards. dashboard_id FK CASCADE, position_x/y, width/height, report_id FK SET NULL, refresh_interval_seconds. RLS. 3 indexes.
- **saved_filters**: Reusable filters. context (11 values), filter_config JSONB, is_global. RLS. 4 indexes.

### API Endpoints (23 routes under /api/v2/advanced-reports/)
- Custom Reports: GET list, POST create, GET/PUT/DELETE :id
- Report Widgets: GET/POST :id/widgets, PUT/DELETE :id/widgets/:widgetId
- Dashboards: GET list, POST create, GET/PUT/DELETE :id
- Dashboard Widgets: GET/POST :id/widgets, PUT/DELETE :id/widgets/:widgetId
- Saved Filters: GET list, POST create, GET/PUT/DELETE :id

### Type System
- 8 type unions, 5 interfaces, 8 constant arrays, 8 enum schemas + 15 CRUD schemas

---

## Module 38: Contracts & E-Signature (V1 Foundation)

### Database Tables
- **contracts**: Core contract records with 9-status lifecycle, 8 contract types, soft delete, 12 indexes. RLS enabled.
- **contract_versions**: Immutable version snapshots per contract. CASCADE from contracts. RLS enabled.
- **contract_signers**: Signing parties with role/status tracking, sign order, signature metadata. CASCADE from contracts. RLS enabled.
- **contract_templates**: Reusable contract templates with clause/variable JSONB arrays. Soft delete via is_active. RLS enabled.
- **contract_clauses**: Clause library with category, required flag, sort order. Soft delete via is_active. RLS enabled.

### API Endpoints (13 route files under /api/v2/contracts/)
- Contracts: GET list, POST create, GET/PUT/DELETE by ID, POST send-for-signature
- Versions: GET/POST per contract
- Signers: GET/POST per contract, GET/PUT/DELETE by ID, POST sign, POST decline
- Templates: GET/POST list, GET/PUT/DELETE by ID
- Clauses: GET/POST list, GET/PUT/DELETE by ID

### Type System
- 4 type unions: ContractStatus (9), ContractType (8), SignerStatus (5), SignerRole (6)
- 5 interfaces: Contract, ContractVersion, ContractSigner, ContractTemplate, ContractClause
- 4 constant arrays, 4 enum schemas, 20 CRUD/workflow schemas

---

## Module 40: Mobile App (V1 Foundation)

### Database Tables
- **mobile_devices**: Registered device tracking. Columns: company_id, user_id, device_name (VARCHAR 200), platform (ios/android/web), status (active/inactive/revoked), device_model, os_version, app_version, device_token, last_active_at, last_ip_address, metadata (JSONB), created_by. Soft delete via deleted_at. RLS enabled. 8 indexes.
- **push_notification_tokens**: FCM/APNs/WebPush tokens per device. Columns: company_id, user_id, device_id (FK CASCADE), token (TEXT), provider (fcm/apns/web_push), is_active, last_used_at. RLS enabled. 6 indexes.
- **offline_sync_queue**: Pending offline changes. Columns: company_id, user_id, device_id, action (create/update/delete), entity_type, entity_id, payload (JSONB), status (pending/syncing/synced/conflict/failed), priority (1-10), retry_count, max_retries, error_message, synced_at. RLS enabled. 10 indexes.
- **mobile_app_settings**: Per-user preferences. Columns: company_id, user_id (UNIQUE pair), data_saver_mode, auto_sync, sync_on_wifi_only, photo_quality (low/medium/high), location_tracking, gps_accuracy (low/balanced/high), biometric_enabled, quiet_hours_start/end, push_notifications, offline_storage_limit_mb, theme (light/dark/system), preferences (JSONB). RLS enabled.
- **mobile_sessions**: Session tracking. Columns: company_id, user_id, device_id (FK CASCADE), session_token, status (active/expired/revoked), ip_address, user_agent, started_at, last_activity_at, expires_at, ended_at. RLS enabled. 9 indexes.

### API Endpoints (23 routes under /api/v2/mobile/)
- Devices: GET list, POST create, GET/PUT/DELETE by ID (soft delete + revoke)
- Push Tokens: GET list, POST create, GET/PUT/DELETE by ID (hard delete)
- Sync Queue: GET list, POST create, GET/PUT/DELETE by ID (hard delete)
- Settings: GET (returns defaults if none), PUT (upsert)
- Sessions: GET list, POST create, GET/PUT/DELETE by ID, POST :id/revoke

### Type System
- 9 type unions, 5 interfaces, 9 constant arrays, 9 enum schemas + 16 CRUD schemas

---

## Module 32: Permitting & Inspections (V1 Foundation)

### Database Tables
- **permits**: Core permit records per job. company_id, job_id, permit_number, permit_type (10 types), status (7 statuses), jurisdiction, dates, conditions, notes. Soft delete. RLS. updated_at trigger.
- **permit_inspections**: Inspections per permit. company_id, permit_id (CASCADE), job_id, inspection_type (9 types), status (6 statuses), scheduling info, inspector info, reinspection tracking. RLS. updated_at trigger.
- **inspection_results**: Results per inspection. company_id, inspection_id (CASCADE), result (pass/fail/conditional), deficiencies JSONB, photos JSONB, FTQ tracking, vendor attribution. RLS. updated_at trigger.
- **permit_documents**: Documents per permit. company_id, permit_id (CASCADE), document_type, file_url, file_name, description. RLS.
- **permit_fees**: Fee tracking per permit. company_id, permit_id (CASCADE), description, amount, status (4 statuses), dates, receipt_url. RLS. updated_at trigger.

### API Endpoints (22 routes under /api/v2/permits/)
- Permits: GET list, POST create, GET/PUT/DELETE :id
- Inspections: GET/POST per permit, GET/PUT :inspectionId
- Results: GET/POST per inspection, GET/PUT :resultId
- Documents: GET/POST per permit, GET/DELETE :docId
- Fees: GET/POST per permit, GET/PUT/DELETE :feeId

### Type System
- 6 type unions, 5 interfaces, 6 constant arrays, 6 enum schemas + 15 CRUD schemas

---

## Module 30: Vendor Portal (V1 Foundation)

### Database Tables
- **vendor_portal_settings**: Per-company portal config. UNIQUE(company_id). portal_enabled, allow_self_registration, require_approval, allowed_submission_types/required_compliance_docs (JSONB), auto_approve_submissions, portal_branding/notification_settings (JSONB). Soft delete. RLS.
- **vendor_portal_invitations**: Invite vendors. vendor_name, email, status (pending/accepted/expired/revoked), token, expires_at. Soft delete. RLS.
- **vendor_portal_access**: Per-vendor permissions. UNIQUE(company_id, vendor_id). access_level (full/limited/readonly), 7 boolean flags, allowed_job_ids. Soft delete. RLS.
- **vendor_submissions**: Vendor documents. submission_type (6 types), status (5 statuses), title, amount, file_urls, metadata. Soft delete. RLS.
- **vendor_messages**: Messaging with threading. direction (to_vendor/from_vendor), is_read, parent_message_id. Soft delete. RLS.

### API Endpoints (27 routes)
- Settings: GET/POST/PUT. Invitations: CRUD + revoke. Access: CRUD (409 duplicate). Submissions: CRUD + submit + review. Messages: CRUD + mark read.

### Type System
- 5 type unions, 5 interfaces, 5 constant arrays, 5 enum schemas + 19 CRUD schemas

---

## Module 37: Marketing & Portfolio (V1 Foundation)

### Database Tables
- **portfolio_projects**: Showcase projects for marketing portfolio. status (draft/published/featured/archived), soft delete, RLS.
- **portfolio_photos**: Photos for portfolio projects. photo_type (exterior/interior/before/after/progress/detail), CASCADE from portfolio_projects, RLS.
- **client_reviews**: Testimonials and reviews. source (google/houzz/facebook/yelp/bbb/angi/platform), status (pending/approved/published/rejected), rating 1-5, RLS.
- **marketing_campaigns**: Campaign tracking. campaign_type (email/social/print/referral/event/other), status (draft/active/paused/completed/cancelled), ROI metrics, RLS.
- **campaign_contacts**: Contacts in campaigns. status (pending/sent/opened/clicked/converted/unsubscribed), CASCADE from marketing_campaigns, RLS.

### API Endpoints (21 routes under /api/v2/marketing/)
- Portfolio: GET/POST list, GET/PUT/DELETE :id, GET/POST :id/photos
- Reviews: GET/POST list, GET/PUT :id
- Campaigns: GET/POST list, GET/PUT :id, GET/POST :id/contacts, GET/PUT/DELETE :id/contacts/:contactId

### Type System
- 7 type unions, 5 interfaces, 7 constant arrays, 7 enum schemas + 15 CRUD schemas

---

## Module 34: HR & Workforce Management (V1 Foundation)

### Database Tables
- **departments**: Organizational structure. Columns: company_id, name (VARCHAR 200), description (TEXT), parent_id (self-ref UUID nullable), head_user_id (UUID), is_active (BOOLEAN default true). RLS enabled. Indexes on company_id, parent_id, (company_id, is_active). updated_at trigger.
- **positions**: Job titles/roles. Columns: company_id, title (VARCHAR 200), description (TEXT), department_id (FK departments), pay_grade (VARCHAR 50), is_active (BOOLEAN default true). RLS enabled. Indexes on company_id, department_id, (company_id, is_active). updated_at trigger.
- **employees**: Employee records beyond basic users. Columns: company_id, user_id (UUID), employee_number (VARCHAR 50), first_name (VARCHAR 100), last_name (VARCHAR 100), email (VARCHAR 255), phone (VARCHAR 20), hire_date (DATE), termination_date (DATE), department_id (FK departments), position_id (FK positions), employment_status (active/inactive/terminated/on_leave/probation), employment_type (full_time/part_time/contract/seasonal/temp), base_wage (NUMERIC 12,2), pay_type (hourly/salary), workers_comp_class (VARCHAR 50), emergency_contact_name, emergency_contact_phone, address, notes, created_by. Soft delete via deleted_at. RLS enabled. 9 indexes including compound.
- **employee_certifications**: Licenses, certs, training records. Columns: company_id, employee_id (FK employees CASCADE), certification_name (VARCHAR 255), certification_type (VARCHAR 100), certification_number (VARCHAR 100), issuing_authority (VARCHAR 200), issued_date (DATE), expiration_date (DATE), status (active/expired/pending_renewal/revoked), document_url (TEXT), notes, created_by. RLS enabled. 6 indexes.
- **employee_documents**: HR documents. Columns: company_id, employee_id (FK employees CASCADE), document_type (resume/contract/tax_form/identification/certification/performance_review/disciplinary/other), title (VARCHAR 255), description (TEXT), file_url (TEXT), file_name (VARCHAR 255), file_size_bytes (BIGINT), uploaded_by. RLS enabled. 4 indexes.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/hr/employees | List employees filtered by employment_status/employment_type/department_id/position_id/q. Paginated. Excludes soft-deleted. Searches first_name, last_name, employee_number, email via OR ilike. |
| POST | /api/v2/hr/employees | Create employee. Requires employee_number, first_name, last_name, hire_date. Defaults: active, full_time, hourly, base_wage=0. Returns 201. |
| GET | /api/v2/hr/employees/:id | Get employee with certifications_count and documents_count. |
| PUT | /api/v2/hr/employees/:id | Partial update of employee fields. |
| DELETE | /api/v2/hr/employees/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/hr/certifications | List certifications filtered by employee_id/status/q. Paginated. |
| POST | /api/v2/hr/certifications | Create certification. Requires employee_id, certification_name. Verifies employee exists. Default status=active. Returns 201. |
| GET | /api/v2/hr/certifications/:id | Get single certification. |
| PUT | /api/v2/hr/certifications/:id | Partial update. |
| DELETE | /api/v2/hr/certifications/:id | Hard delete. |
| GET | /api/v2/hr/documents | List documents filtered by employee_id/document_type/q. Paginated. |
| POST | /api/v2/hr/documents | Create document. Requires employee_id, title. Verifies employee exists. Default document_type=other. Returns 201. |
| GET | /api/v2/hr/documents/:id | Get single document. |
| PUT | /api/v2/hr/documents/:id | Partial update. |
| DELETE | /api/v2/hr/documents/:id | Hard delete. |
| GET | /api/v2/hr/departments | List departments filtered by is_active/q. Paginated. Ordered by name asc. |
| POST | /api/v2/hr/departments | Create department. Requires name. Default is_active=true. Returns 201. |
| GET | /api/v2/hr/departments/:id | Get department with employees_count and positions_count. |
| PUT | /api/v2/hr/departments/:id | Partial update. |
| DELETE | /api/v2/hr/departments/:id | Deactivate: sets is_active=false. |
| GET | /api/v2/hr/positions | List positions filtered by department_id/is_active/q. Paginated. Ordered by title asc. |
| POST | /api/v2/hr/positions | Create position. Requires title. Default is_active=true. Returns 201. |
| GET | /api/v2/hr/positions/:id | Get position with employees_count. |
| PUT | /api/v2/hr/positions/:id | Partial update. |
| DELETE | /api/v2/hr/positions/:id | Deactivate: sets is_active=false. |

### Type System
- 5 type unions: EmploymentStatus (5), EmploymentType (5), PayType (2), CertificationStatus (4), DocumentType (8)
- 5 interfaces: Employee, EmployeeCertification, EmployeeDocument, Department, Position
- 5 constant arrays: EMPLOYMENT_STATUSES, EMPLOYMENT_TYPES, PAY_TYPES, CERTIFICATION_STATUSES, DOCUMENT_TYPES

### Validation Schemas (Zod)
- 5 enum schemas + 15 CRUD schemas covering employees, certifications, documents, departments, positions

---

## Module 33: Safety & Compliance (V1 Foundation)

### Database Tables
- **safety_incidents**: Incident/near-miss reports. Columns: company_id, job_id, incident_number (VARCHAR 30), title (VARCHAR 255), description (TEXT), incident_date (DATE), incident_time (TIME), location (VARCHAR 200), severity (near_miss/minor/moderate/serious/fatal), status (reported/investigating/resolved/closed), incident_type (fall/struck_by/caught_in/electrical/chemical/heat/vehicle/other), reported_by (UUID), assigned_to (UUID), injured_party (VARCHAR 255), injury_description (TEXT), witnesses (JSONB), root_cause (TEXT), corrective_actions (TEXT), preventive_actions (TEXT), osha_recordable (BOOLEAN), osha_report_number (VARCHAR 50), lost_work_days (INT), restricted_days (INT), medical_treatment (BOOLEAN), photos (JSONB), documents (JSONB), resolved_at, resolved_by, closed_at, closed_by, created_by. Soft delete via deleted_at. RLS enabled.
- **safety_inspections**: Site safety inspections. Columns: company_id, job_id, inspection_number (VARCHAR 30), title (VARCHAR 255), description (TEXT), inspection_date (DATE), inspection_type (VARCHAR 100 default 'general'), status (scheduled/in_progress/completed/failed), result (pass/fail/conditional nullable), inspector_id (UUID), location (VARCHAR 200), total_items/passed_items/failed_items/na_items (INT), score (NUMERIC 5,2), notes (TEXT), follow_up_required (BOOLEAN), follow_up_date (DATE), follow_up_notes (TEXT), completed_at, completed_by, created_by. Soft delete via deleted_at. RLS enabled.
- **safety_inspection_items**: Individual checklist items per inspection. Columns: inspection_id (FK safety_inspections CASCADE), company_id, description (TEXT), category (VARCHAR 100), result (pass/fail/na/not_inspected), notes (TEXT), photo_url (TEXT), sort_order (INT). RLS enabled.
- **toolbox_talks**: Safety meeting records. Columns: company_id, job_id, title (VARCHAR 255), topic (VARCHAR 200), description (TEXT), talk_date (DATE), talk_time (TIME), duration_minutes (INT), status (scheduled/completed/cancelled), presenter_id (UUID), location (VARCHAR 200), materials (JSONB), notes (TEXT), completed_at, created_by. RLS enabled.
- **toolbox_talk_attendees**: Attendance tracking. Columns: talk_id (FK toolbox_talks CASCADE), company_id, attendee_name (VARCHAR 200), attendee_id (UUID), trade (VARCHAR 100), company_name (VARCHAR 200), signed (BOOLEAN), signed_at, notes (TEXT). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/safety/incidents | List incidents filtered by job_id/status/severity/incident_type/q. Paginated. Excludes soft-deleted. Searches title and incident_number. |
| POST | /api/v2/safety/incidents | Create incident. Requires job_id, incident_number, title, incident_date. Defaults: severity=near_miss, status=reported, incident_type=other. Returns 201. |
| GET | /api/v2/safety/incidents/:id | Get single incident. |
| PUT | /api/v2/safety/incidents/:id | Update incident. Closed incidents cannot be updated (403). Auto-sets resolved_at/resolved_by and closed_at/closed_by on status transitions. |
| DELETE | /api/v2/safety/incidents/:id | Soft delete incident. |
| GET | /api/v2/safety/inspections | List inspections filtered by job_id/status/result/inspector_id/q. Paginated. Excludes soft-deleted. |
| POST | /api/v2/safety/inspections | Create inspection. Requires job_id, inspection_number, title, inspection_date. Defaults: status=scheduled, inspection_type=general. Returns 201. |
| GET | /api/v2/safety/inspections/:id | Get inspection with items array and items_count. |
| PUT | /api/v2/safety/inspections/:id | Update inspection fields. |
| DELETE | /api/v2/safety/inspections/:id | Soft delete inspection. |
| POST | /api/v2/safety/inspections/:id/complete | Complete inspection. Requires result (pass/fail/conditional). Only scheduled/in_progress inspections (409). Sets completed_at/completed_by. Fail result sets status=failed. |
| GET | /api/v2/safety/inspections/:id/items | List inspection items. Paginated. Ordered by sort_order. |
| POST | /api/v2/safety/inspections/:id/items | Add inspection item. Requires description. Returns 201. |
| PUT | /api/v2/safety/inspections/:id/items/:itemId | Update inspection item. |
| DELETE | /api/v2/safety/inspections/:id/items/:itemId | Delete inspection item. |
| GET | /api/v2/safety/toolbox-talks | List talks filtered by job_id/status/q. Paginated. Searches title and topic. |
| POST | /api/v2/safety/toolbox-talks | Create talk. Requires job_id, title, talk_date. Defaults: status=scheduled. Returns 201. |
| GET | /api/v2/safety/toolbox-talks/:id | Get talk with attendees array and attendees_count. |
| PUT | /api/v2/safety/toolbox-talks/:id | Update talk fields. |
| POST | /api/v2/safety/toolbox-talks/:id/complete | Complete talk. Only scheduled talks (409). Sets completed_at. |
| GET | /api/v2/safety/toolbox-talks/:id/attendees | List attendees. Paginated. |
| POST | /api/v2/safety/toolbox-talks/:id/attendees | Add attendee. Requires attendee_name. Auto-sets signed_at when signed=true. Returns 201. |
| PUT | /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId | Update attendee. |
| DELETE | /api/v2/safety/toolbox-talks/:id/attendees/:attendeeId | Delete attendee. |

### Type System
- 7 type unions: IncidentSeverity (5), IncidentStatus (4), IncidentType (8), InspectionStatus (4), InspectionResult (3), InspectionItemResult (4), TalkStatus (3)
- 5 interfaces: SafetyIncident, SafetyInspection, SafetyInspectionItem, ToolboxTalk, ToolboxTalkAttendee
- 7 constant arrays: INCIDENT_SEVERITIES, INCIDENT_STATUSES, INCIDENT_TYPES, INSPECTION_STATUSES, INSPECTION_RESULTS, INSPECTION_ITEM_RESULTS, TALK_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas + 16 CRUD/workflow schemas covering incidents (list/create/update), inspections (list/create/update/complete), inspection items (list/create/update), toolbox talks (list/create/update/complete), and attendees (list/create/update)

---

## Module 35: Equipment & Asset Management (V1 Foundation)

### Database Tables
- **equipment**: Core equipment/asset records. Columns: company_id, name (VARCHAR 255), description (TEXT), equipment_type (heavy_machinery/vehicle/power_tool/hand_tool/scaffolding/safety_equipment/measuring/other), status (available/assigned/maintenance/out_of_service/retired), ownership_type (owned/leased/rented), make (VARCHAR 100), model (VARCHAR 100), serial_number (VARCHAR 100), year (INT), purchase_date (DATE), purchase_price (NUMERIC 15,2), current_value (NUMERIC 15,2), daily_rate (NUMERIC 10,2), location (VARCHAR 200), notes (TEXT), photo_urls (JSONB), created_by (UUID). Soft delete via deleted_at. RLS enabled. 8 indexes.
- **equipment_assignments**: Job/crew assignment tracking. Columns: company_id, equipment_id (FK equipment CASCADE), job_id (UUID), assigned_to (UUID), assigned_by (UUID), start_date (DATE NOT NULL), end_date (DATE), status (active/completed/cancelled), hours_used (NUMERIC 10,2), notes (TEXT). RLS enabled. 7 indexes.
- **equipment_maintenance**: Maintenance records and schedules. Columns: company_id, equipment_id (FK equipment CASCADE), maintenance_type (preventive/corrective/inspection/calibration), status (scheduled/in_progress/completed/overdue/cancelled), title (VARCHAR 255), description (TEXT), scheduled_date (DATE), completed_date (DATE), performed_by (UUID), service_provider (VARCHAR 200), parts_cost/labor_cost/total_cost (NUMERIC 10,2), notes (TEXT), created_by (UUID). RLS enabled. 7 indexes.
- **equipment_inspections**: Pre-use and periodic inspections. Columns: company_id, equipment_id (FK equipment CASCADE), inspection_type (pre_use/post_use/periodic/safety), result (pass/fail/conditional), inspection_date (DATE default CURRENT_DATE), inspector_id (UUID), checklist (JSONB), deficiencies (TEXT), corrective_action (TEXT), notes (TEXT), created_by (UUID). RLS enabled. 6 indexes.
- **equipment_costs**: Daily rate tracking, fuel, repairs. Columns: company_id, equipment_id (FK equipment CASCADE), job_id (UUID), cost_type (daily_rate/fuel/repair/insurance/transport/other), amount (NUMERIC 12,2), cost_date (DATE default CURRENT_DATE), description (TEXT), vendor_id (UUID), receipt_url (TEXT), notes (TEXT), created_by (UUID). RLS enabled. 7 indexes.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/equipment | List equipment filtered by status/equipment_type/ownership_type/q. Paginated. Excludes soft-deleted. Searches name and serial_number. |
| POST | /api/v2/equipment | Create equipment. Requires name. Defaults: equipment_type=other, status=available, ownership_type=owned. Returns 201. |
| GET | /api/v2/equipment/:id | Get equipment with assignments_count, maintenance_count, costs_count. |
| PUT | /api/v2/equipment/:id | Partial update of equipment fields. |
| DELETE | /api/v2/equipment/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/equipment/:id/assignments | List assignments for equipment filtered by status. Paginated. |
| POST | /api/v2/equipment/:id/assignments | Create assignment. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/assignments/:assignmentId | Get single assignment. |
| PUT | /api/v2/equipment/assignments/:assignmentId | Update assignment. |
| DELETE | /api/v2/equipment/assignments/:assignmentId | Hard delete assignment. |
| GET | /api/v2/equipment/:id/maintenance | List maintenance records filtered by maintenance_type/status. Paginated. |
| POST | /api/v2/equipment/:id/maintenance | Create maintenance record. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/maintenance/:maintenanceId | Get single maintenance record. |
| PUT | /api/v2/equipment/maintenance/:maintenanceId | Update maintenance record. |
| DELETE | /api/v2/equipment/maintenance/:maintenanceId | Hard delete maintenance record. |
| GET | /api/v2/equipment/:id/inspections | List inspections filtered by inspection_type/result. Paginated. |
| POST | /api/v2/equipment/:id/inspections | Create inspection. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/inspections/:inspectionId | Get single inspection. |
| PUT | /api/v2/equipment/inspections/:inspectionId | Update inspection. |
| DELETE | /api/v2/equipment/inspections/:inspectionId | Hard delete inspection. |
| GET | /api/v2/equipment/:id/costs | List costs filtered by cost_type/job_id. Paginated. |
| POST | /api/v2/equipment/:id/costs | Create cost record. Verifies equipment exists. Returns 201. |
| GET | /api/v2/equipment/costs/:costId | Get single cost record. |
| PUT | /api/v2/equipment/costs/:costId | Update cost record. |
| DELETE | /api/v2/equipment/costs/:costId | Hard delete cost record. |

### Type System
- 9 type unions: EquipmentStatus (5), EquipmentType (8), OwnershipType (3), MaintenanceType (4), MaintenanceStatus (5), AssignmentStatus (3), InspectionType (4), InspectionResult (3), CostType (6)
- 5 interfaces: Equipment, EquipmentAssignment, EquipmentMaintenance, EquipmentInspection, EquipmentCost
- 9 constant arrays: EQUIPMENT_STATUSES, EQUIPMENT_TYPES, OWNERSHIP_TYPES, MAINTENANCE_TYPES, MAINTENANCE_STATUSES, ASSIGNMENT_STATUSES, INSPECTION_TYPES, INSPECTION_RESULTS, COST_TYPES

### Validation Schemas (Zod)
- 9 enum schemas: equipmentStatusEnum, equipmentTypeEnum, ownershipTypeEnum, maintenanceTypeEnum, maintenanceStatusEnum, assignmentStatusEnum, inspectionTypeEnum, inspectionResultEnum, costTypeEnum
- listEquipmentSchema (page/limit/status/equipment_type/ownership_type/q)
- createEquipmentSchema (requires name; defaults: equipment_type=other, status=available, ownership_type=owned, purchase_price=0, current_value=0, daily_rate=0, photo_urls=[])
- updateEquipmentSchema (all fields optional)
- listAssignmentsSchema (page/limit/equipment_id/job_id/status)
- createAssignmentSchema (requires equipment_id, start_date; defaults: status=active, hours_used=0)
- updateAssignmentSchema (all fields optional)
- listMaintenanceSchema (page/limit/equipment_id/maintenance_type/status)
- createMaintenanceSchema (requires equipment_id, title; defaults: maintenance_type=preventive, status=scheduled, costs=0)
- updateMaintenanceSchema (all fields optional)
- listInspectionsSchema (page/limit/equipment_id/inspection_type/result)
- createInspectionSchema (requires equipment_id; defaults: inspection_type=pre_use, result=pass, checklist=[])
- updateInspectionSchema (all fields optional)
- listCostsSchema (page/limit/equipment_id/job_id/cost_type)
- createCostSchema (requires equipment_id, amount; defaults: cost_type=daily_rate)
- updateCostSchema (all fields optional)

---

## Module 31: Warranty & Home Care (V1 Foundation)

### Database Tables
- **warranties**: Core warranty records per job/item. Columns: company_id, job_id, title (VARCHAR 255), description (TEXT), warranty_type (structural/mechanical/electrical/plumbing/hvac/roofing/appliance/general/workmanship), status (active/expired/voided/transferred), vendor_id (UUID), start_date (DATE), end_date (DATE), coverage_details (TEXT), exclusions (TEXT), document_id (UUID), contact_name (VARCHAR 200), contact_phone (VARCHAR 50), contact_email (VARCHAR 200), transferred_to (UUID), transferred_at (TIMESTAMPTZ), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, warranty_type, vendor_id, end_date, compound (company_id, status), (company_id, job_id), deleted_at partial.
- **warranty_claims**: Claims filed against warranties. Columns: company_id, warranty_id (FK warranties CASCADE), claim_number (VARCHAR 30), title (VARCHAR 255), description (TEXT), status (submitted/acknowledged/in_progress/resolved/denied/escalated), priority (low/normal/high/urgent), reported_by (UUID), reported_date (DATE default CURRENT_DATE), assigned_to (UUID), assigned_vendor_id (UUID), resolution_notes (TEXT), resolution_cost (NUMERIC 15,2 default 0), resolved_at (TIMESTAMPTZ), resolved_by (UUID), due_date (DATE), photos (JSONB default []), created_by. Soft delete via deleted_at. RLS enabled. Indexes on company_id, warranty_id, status, priority, assigned_to, assigned_vendor_id, (company_id, claim_number), (company_id, status), deleted_at partial.
- **warranty_claim_history**: Audit trail for claim state changes. Columns: claim_id (FK warranty_claims CASCADE), company_id, action (created/acknowledged/assigned/in_progress/resolved/denied/escalated/reopened/note_added), previous_status (TEXT), new_status (TEXT), details (JSONB default {}), performed_by (UUID). RLS enabled. Indexes on claim_id, company_id, action.
- **maintenance_schedules**: Recurring maintenance items per job. Columns: company_id, job_id, title (VARCHAR 255), description (TEXT), frequency (weekly/monthly/quarterly/semi_annual/annual), category (VARCHAR 100), assigned_to (UUID), assigned_vendor_id (UUID), start_date (DATE), end_date (DATE nullable), next_due_date (DATE nullable), estimated_cost (NUMERIC 15,2 default 0), is_active (BOOLEAN default true), notes (TEXT), created_by. Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, frequency, next_due_date, (company_id, job_id), is_active partial, deleted_at partial.
- **maintenance_tasks**: Individual task instances generated from schedules. Columns: company_id, schedule_id (FK maintenance_schedules CASCADE), title (VARCHAR 255), description (TEXT), status (pending/scheduled/completed/overdue/skipped), due_date (DATE), completed_at (TIMESTAMPTZ), completed_by (UUID), actual_cost (NUMERIC 15,2 default 0), notes (TEXT). RLS enabled. Indexes on company_id, schedule_id, status, due_date, (company_id, status).

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/warranties | List warranties filtered by job_id/status/warranty_type/vendor_id/q. Paginated. Excludes soft-deleted. Searches title and contact_name via OR ilike. |
| POST | /api/v2/warranties | Create warranty. Requires job_id, title, start_date, end_date. Defaults: warranty_type=general, status=active. Returns 201. |
| GET | /api/v2/warranties/:id | Get warranty with claims_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/warranties/:id | Partial update. Auto-sets transferred_at when status changes to transferred. |
| DELETE | /api/v2/warranties/:id | Soft delete. |
| GET | /api/v2/warranties/:id/claims | List claims for a warranty. Filtered by status/priority/assigned_to/q. Paginated. Verifies warranty ownership. |
| POST | /api/v2/warranties/:id/claims | Create claim. Requires claim_number, title. Defaults: status=submitted, priority=normal, photos=[]. Records "created" history entry. Returns 201. |
| GET | /api/v2/warranties/:id/claims/:claimId | Get claim with full history array. |
| PUT | /api/v2/warranties/:id/claims/:claimId | Update claim. Records history entry on status change. |
| DELETE | /api/v2/warranties/:id/claims/:claimId | Soft delete claim. |
| POST | /api/v2/warranties/:id/claims/:claimId/resolve | Resolve claim. Validates not already resolved/denied (409). Sets resolved_at, resolved_by. Records history. |
| GET | /api/v2/warranties/:id/claims/:claimId/history | List claim history. Paginated. |
| GET | /api/v2/maintenance-schedules | List schedules filtered by job_id/frequency/is_active/q. Paginated. Ordered by next_due_date asc. |
| POST | /api/v2/maintenance-schedules | Create schedule. Requires job_id, title, start_date. Defaults: frequency=annual, estimated_cost=0, is_active=true. Returns 201. |
| GET | /api/v2/maintenance-schedules/:id | Get schedule with tasks_count. |
| PUT | /api/v2/maintenance-schedules/:id | Partial update. |
| DELETE | /api/v2/maintenance-schedules/:id | Soft delete. |
| GET | /api/v2/maintenance-schedules/:id/tasks | List tasks for schedule. Filtered by status/q. Ordered by due_date asc. |
| POST | /api/v2/maintenance-schedules/:id/tasks | Create task. Requires title, due_date. Defaults: status=pending, actual_cost=0. Returns 201. |
| GET | /api/v2/maintenance-schedules/:id/tasks/:taskId | Get single task. |
| PUT | /api/v2/maintenance-schedules/:id/tasks/:taskId | Update task. |
| DELETE | /api/v2/maintenance-schedules/:id/tasks/:taskId | Hard delete task. |
| POST | /api/v2/maintenance-schedules/:id/tasks/:taskId/complete | Complete task. Validates not already completed/skipped (409). Sets completed_at, completed_by. |

### Type System
- 7 type unions: WarrantyStatus (4), WarrantyType (9), ClaimStatus (6), ClaimPriority (4), ClaimHistoryAction (9), MaintenanceFrequency (5), TaskStatus (5)
- 5 interfaces: Warranty, WarrantyClaim, WarrantyClaimHistory, MaintenanceSchedule, MaintenanceTask
- 7 constant arrays: WARRANTY_STATUSES, WARRANTY_TYPES, CLAIM_STATUSES, CLAIM_PRIORITIES, CLAIM_HISTORY_ACTIONS, MAINTENANCE_FREQUENCIES, TASK_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas: warrantyStatusEnum, warrantyTypeEnum, claimStatusEnum, claimPriorityEnum, claimHistoryActionEnum, maintenanceFrequencyEnum, taskStatusEnum
- listWarrantiesSchema (page/limit/job_id/status/warranty_type/vendor_id/q)
- createWarrantySchema (requires job_id, title, start_date, end_date; defaults: warranty_type=general, status=active)
- updateWarrantySchema (all fields optional, includes transferred_to)
- listWarrantyClaimsSchema (page/limit/warranty_id/status/priority/assigned_to/q)
- createWarrantyClaimSchema (requires warranty_id, claim_number, title; defaults: status=submitted, priority=normal, photos=[])
- updateWarrantyClaimSchema (all fields optional, includes resolution fields)
- resolveWarrantyClaimSchema (optional resolution_notes, resolution_cost default 0)
- listClaimHistorySchema (page/limit, limit defaults to 50)
- listMaintenanceSchedulesSchema (page/limit/job_id/frequency/is_active/q with boolean preprocess)
- createMaintenanceScheduleSchema (requires job_id, title, start_date; defaults: frequency=annual, estimated_cost=0, is_active=true)
- updateMaintenanceScheduleSchema (all fields optional)
- listMaintenanceTasksSchema (page/limit/schedule_id/status/q)
- createMaintenanceTaskSchema (requires schedule_id, title, due_date; defaults: status=pending, actual_cost=0)
- updateMaintenanceTaskSchema (all fields optional)
- completeMaintenanceTaskSchema (optional actual_cost default 0, optional notes)

---

## Module 29: Full Client Portal (V1 Foundation)

### Database Tables
- **client_portal_settings**: Per-company portal configuration. Columns: company_id (UNIQUE), branding (JSONB), custom_domain (VARCHAR 200), feature_flags (JSONB), visibility_rules (JSONB), notification_rules (JSONB), approval_config (JSONB), email_templates (JSONB), footer_text (TEXT), privacy_policy_url (TEXT), terms_of_service_url (TEXT). RLS enabled. updated_at trigger.
- **client_portal_invitations**: Invite clients to the portal. Columns: company_id, job_id, email (VARCHAR 255), client_name (VARCHAR 255), role (VARCHAR 50 default 'client'), status (pending/accepted/expired/revoked), token (VARCHAR 255), invited_by (FK users), accepted_at, accepted_by (FK users), expires_at (TIMESTAMPTZ NOT NULL), message (TEXT). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, email, status, token, deleted_at partial.
- **client_approvals**: Client approval requests for selections/COs/draws/invoices/schedules. Columns: company_id, job_id, client_user_id (FK users), approval_type (selection/change_order/draw/invoice/schedule), reference_id (UUID), title (VARCHAR 255), description (TEXT), status (pending/approved/rejected/expired), requested_at, responded_at, expires_at, signature_data (TEXT), signature_ip (VARCHAR 45), signature_hash (VARCHAR 64), comments (TEXT), requested_by (FK users). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, client, status, type, reference, compound (company+job+status), deleted_at partial.
- **client_messages**: Enhanced messaging between builder and client. Columns: company_id, job_id, sender_user_id (FK users), sender_type (client/builder_team), subject (VARCHAR 255), message_text (TEXT), thread_id (UUID), topic (VARCHAR 200), category (general/selections/change_orders/schedule/budget/warranty/other), attachments (JSONB default []), is_external_log (BOOLEAN), external_channel (phone/text/email nullable), read_at, status (sent/read/archived). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, sender, thread, category, status, created_at DESC, deleted_at partial.
- **client_payments**: Payment records (no processing). Columns: company_id, job_id, client_user_id (FK users nullable), payment_number (VARCHAR 50), amount (NUMERIC 15,2), payment_method (credit_card/ach/check/wire/other), status (pending/processing/completed/failed/refunded), reference_number (VARCHAR 100), description (TEXT), draw_request_id (UUID), invoice_id (UUID), payment_date (DATE), received_at, received_by (FK users), notes (TEXT), created_by (FK users). Soft delete via deleted_at. RLS enabled. updated_at trigger. Indexes on company, job, client, status, method, date, draw, invoice, deleted_at partial.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/client-portal/settings | Get portal settings for current company. Returns single record or null. |
| PUT | /api/v2/client-portal/settings | Upsert portal settings. Validates branding, feature_flags, visibility_rules, etc. |
| GET | /api/v2/client-portal/invitations | List invitations filtered by job_id/status/q. Paginated. Excludes soft-deleted. Searches email and client_name. |
| POST | /api/v2/client-portal/invitations | Create invitation. Requires job_id, email. Auto-generates token and expiration. Returns 201. |
| GET | /api/v2/client-portal/invitations/:id | Get single invitation. |
| PUT | /api/v2/client-portal/invitations/:id | Update invitation (status, client_name, message). Accepting sets accepted_at/accepted_by. |
| DELETE | /api/v2/client-portal/invitations/:id | Soft delete + revoke: sets deleted_at and status=revoked. |
| GET | /api/v2/client-portal/approvals | List approvals filtered by job_id/status/approval_type/client_user_id/q. Paginated. Searches title and description. |
| POST | /api/v2/client-portal/approvals | Create approval request. Requires job_id, client_user_id, approval_type, reference_id, title. Sets requested_by from auth. Returns 201. |
| GET | /api/v2/client-portal/approvals/:id | Get single approval. |
| PUT | /api/v2/client-portal/approvals/:id | Approve/reject. Only pending approvals can change status (409 otherwise). Sets responded_at on approve/reject. Accepts signature_data/ip/hash. |
| GET | /api/v2/client-portal/messages | List messages filtered by job_id/category/status/sender_type/q. Paginated. Searches subject and message_text. |
| POST | /api/v2/client-portal/messages | Create message. Requires job_id, sender_type, message_text. Supports external logging (is_external_log + external_channel). Returns 201. |
| GET | /api/v2/client-portal/messages/:id | Get single message. |
| PUT | /api/v2/client-portal/messages/:id | Update message status (mark read/archived). Sets read_at when status=read. |
| GET | /api/v2/client-portal/payments | List payments filtered by job_id/status/payment_method/q. Paginated. Searches payment_number, description, reference_number. |
| POST | /api/v2/client-portal/payments | Record payment. Requires job_id, amount (>=0). Defaults: payment_method=check, status=pending. Returns 201. |
| GET | /api/v2/client-portal/payments/:id | Get single payment. |

### Type System (extends Module 12)
- 9 type unions: ApprovalStatus (4), ApprovalType (5), MessageStatus (3), MessageSenderType (2), MessageCategory (7), ExternalChannel (3), InvitationStatus (4), PaymentStatus (5), PaymentMethod (5)
- 5 interfaces: ClientPortalSettings, ClientPortalInvitation, ClientApproval, ClientMessage, ClientPayment
- 9 constant arrays: APPROVAL_STATUSES, APPROVAL_TYPES, MESSAGE_STATUSES, MESSAGE_SENDER_TYPES, MESSAGE_CATEGORIES, EXTERNAL_CHANNELS, INVITATION_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS

### Validation Schemas (Zod, extends Module 12)
- 9 enum schemas: approvalStatusEnum, approvalTypeEnum, messageStatusEnum, messageSenderTypeEnum, messageCategoryEnum, externalChannelEnum, invitationStatusEnum, paymentStatusEnum, paymentMethodEnum
- updateClientPortalSettingsSchema (all JSONB fields optional, custom_domain max 200, URLs validated)
- listClientInvitationsSchema (page/limit/job_id/status/q)
- createClientInvitationSchema (requires job_id, email; defaults: role=client, expires_in_days=7, max 90 days)
- updateClientInvitationSchema (status/client_name/message optional)
- listClientApprovalsSchema (page/limit/job_id/status/approval_type/client_user_id/q)
- createClientApprovalSchema (requires job_id, client_user_id, approval_type, reference_id, title; expires_at YYYY-MM-DD)
- updateClientApprovalSchema (status/comments/signature_data/signature_ip/signature_hash optional)
- listClientMessagesSchema (page/limit/job_id/category/status/sender_type/q)
- createClientMessageSchema (requires job_id, sender_type, message_text; defaults: category=general, is_external_log=false, attachments=[])
- updateClientMessageSchema (status/read_at optional)
- listClientPaymentsSchema (page/limit/job_id/status/payment_method/q)
- createClientPaymentSchema (requires job_id, amount>=0; defaults: payment_method=check, status=pending; payment_date YYYY-MM-DD)

---

## Module 27: RFI Management (V1 Foundation)

### Database Tables
- **rfis**: Core RFI records. Columns: company_id, job_id, rfi_number (VARCHAR 20), subject (VARCHAR 255), question (TEXT), status (draft/open/pending_response/answered/closed/voided), priority (low/normal/high/urgent), category (design/structural/mechanical/electrical/plumbing/site/finish/general), assigned_to (UUID FK users), due_date (DATE), cost_impact (NUMERIC 15,2 default 0), schedule_impact_days (INT default 0), related_document_id (UUID), created_by (FK users), answered_at (TIMESTAMPTZ), closed_at (TIMESTAMPTZ), closed_by (FK users). Soft delete via deleted_at. RLS enabled.
- **rfi_responses**: Responses to RFIs. Columns: rfi_id (FK rfis CASCADE), company_id, response_text (TEXT), responded_by (FK users), attachments (JSONB default []), is_official (BOOLEAN default false). RLS enabled.
- **rfi_routing**: Routing/assignment chain. Columns: rfi_id (FK rfis CASCADE), company_id, routed_to (FK users), routed_by (FK users), routed_at, status (pending/viewed/responded/forwarded), notes (TEXT). RLS enabled.
- **rfi_templates**: Reusable RFI templates. Columns: company_id, name (VARCHAR 200), category, subject_template (VARCHAR 255), question_template (TEXT), default_priority, is_active (BOOLEAN default true). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/rfis | List RFIs filtered by job_id/status/priority/category/assigned_to/q. Paginated. |
| POST | /api/v2/rfis | Create RFI. Requires job_id, rfi_number, subject, question. Defaults: draft, normal, general. Returns 201. |
| GET/PUT/DELETE | /api/v2/rfis/:id | CRUD single RFI. Soft delete only draft. Rejects update on closed/voided (403). |
| POST | /api/v2/rfis/:id/open | draft -> open transition. |
| POST | /api/v2/rfis/:id/close | answered -> closed transition. Sets closed_at/closed_by. |
| GET/POST | /api/v2/rfis/:id/responses | List/create responses. Official response auto-sets RFI to answered. |
| GET/PUT/DELETE | /api/v2/rfis/:id/responses/:respId | CRUD single response. |
| GET/POST | /api/v2/rfis/:id/routing | List/create routing assignments. |
| GET/PUT | /api/v2/rfis/:id/routing/:routeId | Get/update routing. |
| GET/POST | /api/v2/rfis/templates | List/create templates. |
| GET/PUT/DELETE | /api/v2/rfis/templates/:id | CRUD template. Delete = is_active=false. |

### Type System
- 4 type unions: RfiStatus (6), RfiPriority (4), RfiCategory (8), RoutingStatus (4)
- 4 interfaces: Rfi, RfiResponse, RfiRouting, RfiTemplate
- 4 constant arrays: RFI_STATUSES, RFI_PRIORITIES, RFI_CATEGORIES, ROUTING_STATUSES

### Validation Schemas (Zod)
- 4 enum schemas + 15 CRUD/workflow schemas covering all operations

---

## Module 26: Bid Management (V1 Foundation)

### Database Tables
- **bid_packages**: Core bid package definition per job. Columns: company_id, job_id, title (VARCHAR 200), description, trade, scope_of_work, bid_due_date (DATE), status (draft/published/closed/awarded/cancelled), documents (JSONB), created_by. Soft delete via deleted_at. RLS enabled.
- **bid_invitations**: Vendor invitations to bid. Columns: company_id, bid_package_id (FK CASCADE), vendor_id, status (invited/viewed/declined/submitted), invited_at, viewed_at, responded_at, decline_reason. RLS enabled.
- **bid_responses**: Vendor bid submissions. Columns: company_id, bid_package_id (FK CASCADE), vendor_id, invitation_id (FK SET NULL), total_amount (NUMERIC 15,2), breakdown (JSONB), notes, attachments (JSONB), submitted_at, is_qualified (BOOLEAN). RLS enabled.
- **bid_comparisons**: Side-by-side comparison records. Columns: company_id, bid_package_id (FK CASCADE), name, comparison_data (JSONB), notes, created_by. RLS enabled.
- **bid_awards**: Award decisions. Columns: company_id, bid_package_id (FK CASCADE), vendor_id, bid_response_id (FK SET NULL), award_amount (NUMERIC 15,2), notes, awarded_by, awarded_at, status (pending/accepted/rejected/withdrawn). RLS enabled.

### Type System
- 3 type unions: BidPackageStatus (5), InvitationStatus (4), AwardStatus (4)
- 5 interfaces: BidPackage, BidInvitation, BidResponse, BidComparison, BidAward
- 3 constant arrays: BID_PACKAGE_STATUSES, INVITATION_STATUSES, AWARD_STATUSES
- 3 enum schemas + 17 CRUD schemas

---


## Module 28: Punch List & Quality Checklists (V1 Foundation)

### Database Tables
- **punch_items**: Core punch list item table. Columns: company_id, job_id, title (VARCHAR 255), description (TEXT), location (VARCHAR 200), room (VARCHAR 100), status (open/in_progress/completed/verified/disputed), priority (low/normal/high/critical), category (structural/electrical/plumbing/hvac/finish/paint/flooring/cabinets/countertops/fixtures/appliances/exterior/landscaping/other), assigned_to (UUID), assigned_vendor_id (UUID), due_date (DATE), completed_at, verified_by (UUID), verified_at, cost_estimate (NUMERIC 15,2), created_by (UUID). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, priority, category, assigned_to, assigned_vendor_id, due_date, compound (company_id, status), (company_id, job_id), deleted_at partial.
- **punch_item_photos**: Photos attached to punch items. Columns: company_id, punch_item_id (FK CASCADE), photo_url (TEXT), caption (VARCHAR 255), photo_type (before/after/issue), uploaded_by (UUID), uploaded_at. RLS enabled. Indexes on company_id, punch_item_id.
- **quality_checklist_templates**: Reusable checklist templates. Columns: company_id, name (VARCHAR 200), description (TEXT), category (TEXT), trade (VARCHAR 100), is_active (BOOLEAN default true), is_system (BOOLEAN default false). RLS enabled. updated_at trigger.
- **quality_checklist_template_items**: Template line items. Columns: company_id, template_id (FK CASCADE), description (TEXT), category (TEXT), sort_order (INT default 0), is_required (BOOLEAN default true). RLS enabled. updated_at trigger.
- **quality_checklists**: Checklist instances. Columns: company_id, job_id, template_id (FK nullable), name (VARCHAR 200), description (TEXT), status (not_started/in_progress/completed/approved), inspector_id (UUID), inspection_date (DATE), location (VARCHAR 200), total_items/passed_items/failed_items/na_items (INT default 0), completed_at, approved_by, approved_at, created_by. Soft delete via deleted_at. RLS enabled. updated_at trigger.
- **quality_checklist_items**: Individual checklist line items. Columns: company_id, checklist_id (FK CASCADE), description (TEXT), result (pass/fail/na/not_inspected), notes (TEXT), photo_url (TEXT), sort_order (INT default 0). RLS enabled. updated_at trigger.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/punch-list | List punch items filtered by job_id/status/priority/category/assigned_to/assigned_vendor_id/q. Paginated. Excludes soft-deleted. |
| POST | /api/v2/punch-list | Create punch item. Requires job_id, title. Defaults: status=open, priority=normal. Returns 201. |
| GET | /api/v2/punch-list/:id | Get punch item with nested photos array. |
| PUT | /api/v2/punch-list/:id | Partial update of punch item fields. |
| DELETE | /api/v2/punch-list/:id | Soft delete. |
| POST | /api/v2/punch-list/:id/complete | Mark as completed. Validates status is open/in_progress (409). |
| POST | /api/v2/punch-list/:id/verify | Verify completed item. Validates status is completed (409). |
| GET | /api/v2/punch-list/:id/photos | List photos for a punch item. |
| POST | /api/v2/punch-list/:id/photos | Add photo. Requires photo_url. Returns 201. |
| DELETE | /api/v2/punch-list/:id/photos/:photoId | Delete photo. |
| GET | /api/v2/quality-checklists | List checklists filtered by job_id/status/template_id/q. Paginated. |
| POST | /api/v2/quality-checklists | Create checklist. Requires job_id, name. Returns 201. |
| GET | /api/v2/quality-checklists/:id | Get checklist with nested items. |
| PUT | /api/v2/quality-checklists/:id | Partial update. |
| DELETE | /api/v2/quality-checklists/:id | Soft delete. |
| POST | /api/v2/quality-checklists/:id/approve | Approve completed checklist. Validates status is completed (409). |
| GET/POST | /api/v2/quality-checklists/:id/items | List/add checklist items. |
| PUT/DELETE | /api/v2/quality-checklists/:id/items/:itemId | Update/delete checklist item. |
| GET/POST | /api/v2/quality-checklists/templates | List/create templates. |
| GET/PUT/DELETE | /api/v2/quality-checklists/templates/:id | CRUD single template. |
| GET/POST | /api/v2/quality-checklists/templates/:id/items | List/add template items. |
| PUT/DELETE | /api/v2/quality-checklists/templates/:id/items/:itemId | Update/delete template item. |

### Type System
- 6 type unions: PunchItemStatus (5), PunchItemPriority (4), PunchItemCategory (14), PhotoType (3), ChecklistStatus (4), ChecklistItemResult (4)
- 6 interfaces: PunchItem, PunchItemPhoto, QualityChecklist, QualityChecklistItem, QualityChecklistTemplate, QualityChecklistTemplateItem
- 6 constant arrays: PUNCH_ITEM_STATUSES, PUNCH_ITEM_PRIORITIES, PUNCH_ITEM_CATEGORIES, PHOTO_TYPES, CHECKLIST_STATUSES, CHECKLIST_ITEM_RESULTS

### Validation Schemas (Zod)
- 6 enum schemas + 19 CRUD schemas covering punch items, photos, checklists, checklist items, templates, and template items

---

## Module 24: AI Document Processing (V1 Foundation)

### Database Tables
- **document_classifications**: AI classification results. 13 document types, confidence_score 0-1, metadata JSONB. Soft delete. RLS.
- **extraction_templates**: Configurable extraction rules per doc type. field_definitions JSONB, is_active, is_system. Soft delete. RLS.
- **document_extractions**: Extracted data from documents. Links to classification and template. Status: pending/processing/completed/failed/review_needed. Soft delete. RLS.
- **document_processing_queue**: Queue for AI processing. Priority 1-5, attempts tracking, error_message. No soft delete. RLS.
- **ai_feedback**: User corrections (correction/confirmation/rejection) linked to extractions. No soft delete. RLS.

### API Endpoints (19 routes under /api/v2/ai-documents/)
- Classifications: GET list, POST create, GET :id
- Extractions: GET list, POST create, GET/PUT :id, GET/POST :id/feedback
- Templates: GET list, POST create, GET/PUT/DELETE :id
- Queue: GET list, POST enqueue, GET/PUT :id, POST :id/cancel (409 if not queued/processing)

### Type System
- 5 type unions: DocumentType(13), ExtractionStatus(5), QueueStatus(5), QueuePriority(1-5), FeedbackType(3)
- 5 interfaces, 5 constant arrays, 5 enum schemas + 14 CRUD schemas

---

## Module 20: Estimating Engine (V1 Foundation)

### Database Tables
- **estimates**: Core estimate header table. Columns: company_id, job_id (nullable FK jobs), name (VARCHAR 255), description (TEXT), status (draft/pending_review/approved/rejected/revised/archived), estimate_type (lump_sum/cost_plus/time_and_materials/unit_price/gmp/design_build), contract_type (nte/gmp/cost_plus/fixed nullable), version (INT default 1), parent_version_id (self-ref UUID nullable), markup_type (flat/tiered/per_line/built_in nullable), markup_pct/overhead_pct/profit_pct (NUMERIC 5,2), subtotal/total (NUMERIC 15,2), valid_until (DATE), notes (TEXT), created_by/approved_by (FK users), approved_at. Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, (company_id, status), (company_id, job_id), deleted_at partial, created_at DESC.
- **estimate_sections**: Hierarchical sections within an estimate. Columns: estimate_id (FK estimates CASCADE), company_id, parent_id (self-ref nullable), name (VARCHAR 255), sort_order (INT default 0), subtotal (NUMERIC 15,2). RLS enabled. Indexes on estimate_id, company_id, parent_id.
- **estimate_line_items**: Individual line items per estimate. Columns: estimate_id (FK estimates CASCADE), company_id, section_id (FK estimate_sections nullable), cost_code_id (UUID nullable), assembly_id (UUID nullable), description (TEXT), item_type (line/allowance/exclusion/alternate), quantity (NUMERIC 12,4), unit (VARCHAR 30), unit_cost (NUMERIC 15,2), markup_pct (NUMERIC 5,2), total (NUMERIC 15,2), alt_group (VARCHAR 50), notes (TEXT), sort_order (INT), ai_suggested (BOOLEAN default false), ai_confidence (high/medium/low nullable). RLS enabled. Indexes on estimate_id, company_id, section_id, cost_code_id, assembly_id, item_type.
- **assemblies**: Reusable assembly recipes (grouped line items). Columns: company_id, name (VARCHAR 255), description (TEXT), category (VARCHAR 100), parameter_unit (VARCHAR 30), is_active (BOOLEAN default true). Soft delete via deleted_at. RLS enabled. Indexes on company_id, category, is_active, deleted_at partial.
- **assembly_items**: Component items within an assembly. Columns: assembly_id (FK assemblies CASCADE), company_id, cost_code_id (UUID nullable), description (TEXT), qty_per_unit (NUMERIC 12,4), unit (VARCHAR 30), unit_cost (NUMERIC 15,2), sort_order (INT). RLS enabled. Indexes on assembly_id, company_id, cost_code_id.
- **estimate_versions**: Immutable version snapshots of estimates. Columns: estimate_id (FK estimates CASCADE), company_id, version_number (INT), snapshot_json (JSONB), change_summary (TEXT), created_by (FK users). RLS enabled. Indexes on estimate_id, company_id, (estimate_id, version_number).

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/estimates | List estimates filtered by job_id/status/estimate_type/q. Paginated. Excludes soft-deleted. Search matches name or description via OR ilike. Ordered by created_at desc. |
| POST | /api/v2/estimates | Create new estimate. Requires name. Defaults: status=draft, estimate_type=lump_sum, markup/overhead/profit=0. Sets created_by from auth context. Returns 201. |
| GET | /api/v2/estimates/:id | Get estimate with lines_count, sections_count, and versions array. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/estimates/:id | Partial update of estimate fields. Only draft or revised estimates can be updated (403 otherwise). |
| DELETE | /api/v2/estimates/:id | Soft delete: sets deleted_at. Only draft estimates can be deleted (403 otherwise). |
| GET | /api/v2/estimates/:id/lines | List line items for an estimate. Filterable by section_id, item_type. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/estimates/:id/lines | Add line item. Only draft or revised estimates (403 otherwise). Sets company_id from context. Returns 201. |
| PUT | /api/v2/estimates/:id/lines/:lineId | Update line item. Only draft or revised estimates (403 otherwise). Partial updates. |
| DELETE | /api/v2/estimates/:id/lines/:lineId | Hard delete line item. Only draft or revised estimates (403 otherwise). |
| GET | /api/v2/estimates/:id/sections | List sections for an estimate. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/estimates/:id/sections | Add section. Only draft or revised estimates (403 otherwise). Returns 201. |
| GET | /api/v2/estimates/:id/versions | List version snapshots. Ordered by version_number desc. Paginated. |
| POST | /api/v2/estimates/:id/versions | Create version snapshot. Requires version_number. Stores snapshot_json and optional change_summary. Returns 201. |
| GET | /api/v2/assemblies | List assemblies filtered by category/is_active/q. Paginated. Excludes soft-deleted. Search matches name or description. Ordered by name asc. |
| POST | /api/v2/assemblies | Create assembly. Requires name. Defaults: is_active=true. Returns 201. |
| GET | /api/v2/assemblies/:id | Get assembly with items_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/assemblies/:id | Update assembly. Verifies ownership. Partial updates. |
| DELETE | /api/v2/assemblies/:id | Soft delete assembly. |
| GET | /api/v2/assemblies/:id/items | List items for an assembly. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/assemblies/:id/items | Add item to assembly. Verifies assembly ownership. Returns 201. |

### Type System
- 6 type unions: EstimateStatus (6 values), EstimateType (6 values), ContractType (4 values), MarkupType (4 values), LineItemType (4 values), AiConfidence (3 values)
- 6 interfaces: Estimate, EstimateSection, EstimateLineItem, Assembly, AssemblyItem, EstimateVersion
- 6 constant arrays with value/label pairs: ESTIMATE_STATUSES, ESTIMATE_TYPES, CONTRACT_TYPES, MARKUP_TYPES, LINE_ITEM_TYPES, AI_CONFIDENCE_LEVELS

### Validation Schemas (Zod)
- 6 enum schemas: estimateStatusEnum, estimateTypeEnum, contractTypeEnum, markupTypeEnum, lineItemTypeEnum, aiConfidenceEnum
- listEstimatesSchema (page/limit/job_id/status/estimate_type/q)
- createEstimateSchema (requires name; defaults: status=draft, estimate_type=lump_sum, markup_pct=0, overhead_pct=0, profit_pct=0)
- updateEstimateSchema (all fields optional including subtotal/total)
- listEstimateSectionsSchema (page/limit, limit defaults to 50)
- createEstimateSectionSchema (requires name; defaults: sort_order=0)
- updateEstimateSectionSchema (all fields optional)
- listEstimateLineItemsSchema (page/limit up to 200; optional section_id, item_type filter)
- createEstimateLineItemSchema (requires description; defaults: item_type=line, quantity=1, unit=each, unit_cost=0, markup_pct=0, total=0, sort_order=0, ai_suggested=false)
- updateEstimateLineItemSchema (all fields optional)
- listEstimateVersionsSchema (page/limit)
- createEstimateVersionSchema (requires version_number; defaults: snapshot_json={})
- listAssembliesSchema (page/limit/category/is_active/q)
- createAssemblySchema (requires name; defaults: is_active=true)
- updateAssemblySchema (all fields optional)
- listAssemblyItemsSchema (page/limit, limit defaults to 50)
- createAssemblyItemSchema (requires description; defaults: qty_per_unit=1, unit=each, unit_cost=0, sort_order=0)
- updateAssemblyItemSchema (all fields optional)

---

## Module 25: Schedule Intelligence (V1 Foundation)

### Database Tables
- **schedule_predictions**: AI-generated schedule predictions per job/task. Columns: company_id, job_id, task_id (nullable), prediction_type (duration/delay/resource/weather/completion), predicted_value (JSONB), confidence_score (NUMERIC 3,2 range 0-1), model_version (VARCHAR 50), is_accepted (BOOLEAN default false), accepted_by (FK users), accepted_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, task_id, prediction_type, (company_id, job_id), deleted_at partial.
- **schedule_weather_events**: Weather events affecting job schedules. Columns: company_id, job_id, event_date (DATE), weather_type (rain/snow/ice/wind/extreme_heat/extreme_cold/hurricane/tornado/flood), severity (minor/moderate/severe/extreme), impact_description (TEXT), affected_tasks (JSONB array), schedule_impact_days (NUMERIC 5,1), temperature_high/temperature_low (NUMERIC 5,1), precipitation_inches (NUMERIC 4,2), wind_speed_mph (NUMERIC 5,1), auto_logged (BOOLEAN), notes (TEXT), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, event_date, weather_type, severity, (company_id, job_id), deleted_at partial.
- **schedule_risk_scores**: Risk assessment per task/job. Columns: company_id, job_id, task_id (nullable), risk_level (low/medium/high/critical), risk_score (INT 0-100), risk_factors (JSONB), mitigation_suggestions (JSONB array), weather_component/resource_component/dependency_component/history_component (INT 0-100), assessed_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, task_id, risk_level, risk_score, (company_id, job_id), deleted_at partial.
- **schedule_scenarios**: What-if scenario modeling per job. Columns: company_id, job_id, name (VARCHAR 200), description (TEXT), scenario_type (optimistic/pessimistic/most_likely/custom), parameters (JSONB), results (JSONB), projected_completion (DATE), projected_cost_impact (NUMERIC 12,2), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, scenario_type, (company_id, job_id), created_by, deleted_at partial.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/schedule-intelligence/predictions | List predictions filtered by job_id/task_id/prediction_type/is_accepted. Paginated. Excludes soft-deleted. Ordered by created_at desc. |
| POST | /api/v2/schedule-intelligence/predictions | Create prediction. Requires job_id, prediction_type. Defaults: confidence_score=0, predicted_value={}. Sets created_by from auth context. Returns 201. |
| GET | /api/v2/schedule-intelligence/predictions/:id | Get single prediction by ID. Scoped to company_id, excludes soft-deleted. |
| PUT | /api/v2/schedule-intelligence/predictions/:id | Update prediction fields. When is_accepted=true, sets accepted_by/accepted_at. When is_accepted=false, clears accepted_by/accepted_at. |
| GET | /api/v2/schedule-intelligence/weather-events | List weather events filtered by job_id/weather_type/severity/date_from/date_to. Paginated. Date filters use gte/lte. Ordered by event_date desc. |
| POST | /api/v2/schedule-intelligence/weather-events | Create weather event. Requires job_id, event_date, weather_type, severity. Defaults: schedule_impact_days=0, affected_tasks=[], auto_logged=false. Returns 201. |
| GET | /api/v2/schedule-intelligence/weather-events/:id | Get single weather event by ID. |
| PUT | /api/v2/schedule-intelligence/weather-events/:id | Partial update of weather event fields. |
| DELETE | /api/v2/schedule-intelligence/weather-events/:id | Soft delete: sets deleted_at. Verifies existence first (404 if not found). |
| GET | /api/v2/schedule-intelligence/risk-scores | List risk scores filtered by job_id/task_id/risk_level/min_score. Paginated. Ordered by risk_score desc. |
| POST | /api/v2/schedule-intelligence/risk-scores | Create risk score. Requires job_id, risk_level, risk_score. Defaults: all component scores=0, risk_factors={}, mitigation_suggestions=[]. Returns 201. |
| GET | /api/v2/schedule-intelligence/risk-scores/:id | Get single risk score by ID. |
| PUT | /api/v2/schedule-intelligence/risk-scores/:id | Update risk score. Auto-updates assessed_at on every update. |
| GET | /api/v2/schedule-intelligence/scenarios | List scenarios filtered by job_id/scenario_type. Paginated. Ordered by created_at desc. |
| POST | /api/v2/schedule-intelligence/scenarios | Create scenario. Requires job_id, name. Defaults: scenario_type=custom, parameters={}, results={}. Returns 201. |
| GET | /api/v2/schedule-intelligence/scenarios/:id | Get single scenario by ID. |
| PUT | /api/v2/schedule-intelligence/scenarios/:id | Partial update of scenario fields. |
| DELETE | /api/v2/schedule-intelligence/scenarios/:id | Soft delete scenario. Verifies existence first (404 if not found). |

### Type System
- 5 type unions: PredictionType (5 values), WeatherType (9 values), WeatherSeverity (4 values), RiskLevel (4 values), ScenarioType (4 values)
- 4 interfaces: SchedulePrediction, ScheduleWeatherEvent, ScheduleRiskScore, ScheduleScenario
- 5 constant arrays with value/label pairs: PREDICTION_TYPES, WEATHER_TYPES, WEATHER_SEVERITIES, RISK_LEVELS, SCENARIO_TYPES

### Validation Schemas (Zod)
- 5 enum schemas: predictionTypeEnum, weatherTypeEnum, weatherSeverityEnum, riskLevelEnum, scenarioTypeEnum
- listPredictionsSchema (page/limit/job_id/task_id/prediction_type/is_accepted)
- createPredictionSchema (requires job_id, prediction_type; defaults confidence_score=0, predicted_value={})
- updatePredictionSchema (optional predicted_value/confidence_score/model_version/is_accepted)
- listWeatherEventsSchema (page/limit/job_id/weather_type/severity/date_from/date_to with YYYY-MM-DD validation)
- createWeatherEventSchema (requires job_id, event_date, weather_type, severity; defaults schedule_impact_days=0, affected_tasks=[], auto_logged=false)
- updateWeatherEventSchema (all fields optional)
- listRiskScoresSchema (page/limit/job_id/task_id/risk_level/min_score)
- createRiskScoreSchema (requires job_id, risk_level, risk_score; defaults all components=0, risk_factors={}, mitigation_suggestions=[])
- updateRiskScoreSchema (all fields optional)
- listScenariosSchema (page/limit/job_id/scenario_type)
- createScenarioSchema (requires job_id, name; defaults scenario_type=custom, parameters={}, results={})
- updateScenarioSchema (all fields optional, projected_completion validated as YYYY-MM-DD)

---

## Module 23: Price Intelligence (V1 Foundation)

### Database Tables
- **master_items**: Material catalog. Columns: company_id, name (VARCHAR 255), description (TEXT), category (TEXT, CHECK 14 values: lumber/electrical/plumbing/hvac/roofing/flooring/paint/hardware/concrete/insulation/drywall/fixtures/appliances/other), unit_of_measure (TEXT, CHECK 12 values: each/linear_ft/sq_ft/cu_yd/ton/gallon/bundle/box/sheet/roll/bag/pair), default_unit_price (NUMERIC 12,2 default 0), sku (VARCHAR 100), created_by UUID. Soft delete via deleted_at. RLS enabled. Indexes on company_id, category, deleted_at partial.
- **vendor_item_prices**: Vendor-specific pricing per master item. Columns: company_id, vendor_id UUID, master_item_id (FK master_items CASCADE), unit_price (NUMERIC 12,2), lead_time_days INT, min_order_qty (NUMERIC 10,3), effective_date DATE, notes TEXT. RLS enabled. Indexes on company_id, vendor_id, master_item_id, effective_date DESC.
- **price_history**: Historical price changes. Columns: company_id, master_item_id (FK master_items CASCADE), vendor_id UUID, old_price (NUMERIC 12,2), new_price (NUMERIC 12,2), change_pct (NUMERIC 8,2), recorded_at TIMESTAMPTZ. RLS enabled. Indexes on company_id, master_item_id, vendor_id, recorded_at DESC.
- **labor_rates**: Labor cost tracking by trade/skill. Columns: company_id, trade (VARCHAR 100), skill_level (TEXT, CHECK: apprentice/journeyman/master/foreman), hourly_rate (NUMERIC 10,2), overtime_rate (NUMERIC 10,2), region (VARCHAR 100), notes TEXT, created_by UUID. Soft delete via deleted_at. RLS enabled. Indexes on company_id, trade, skill_level, deleted_at partial.
- **labor_rate_history**: Labor rate changes over time. Columns: company_id, labor_rate_id (FK labor_rates CASCADE), old_rate (NUMERIC 10,2), new_rate (NUMERIC 10,2), change_pct (NUMERIC 8,2), effective_date DATE. RLS enabled. Indexes on company_id, labor_rate_id, effective_date DESC.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/price-intelligence/items | List master items filtered by category/q. Paginated. Sortable by name/category/created_at/updated_at/default_unit_price. Excludes soft-deleted. Searches name, description, sku via OR ilike. |
| POST | /api/v2/price-intelligence/items | Create master item. Requires name. Defaults category=other, unit_of_measure=each, default_unit_price=0. Sets created_by from auth. Returns 201. |
| GET | /api/v2/price-intelligence/items/:id | Get master item with vendor_prices_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/price-intelligence/items/:id | Partial update of item fields. Only includes provided fields. Verifies ownership and not soft-deleted. |
| DELETE | /api/v2/price-intelligence/items/:id | Soft delete: sets deleted_at timestamp. Verifies item exists and not already deleted. |
| GET | /api/v2/price-intelligence/items/:id/prices | List vendor prices for an item. Filterable by vendor_id. Sortable by unit_price/effective_date/created_at. Paginated. Verifies item exists. |
| POST | /api/v2/price-intelligence/items/:id/prices | Add vendor price for item. Requires vendor_id and unit_price (positive). Optional lead_time_days, min_order_qty, effective_date, notes. Verifies item exists. Returns 201. |
| GET | /api/v2/price-intelligence/items/:id/price-history | Get price history for item. Filterable by vendor_id. Sortable by recorded_at/new_price/change_pct. Paginated. Verifies item exists. |
| GET | /api/v2/price-intelligence/labor-rates | List labor rates filtered by trade/skill_level/region/q. Paginated. Sortable by trade/skill_level/hourly_rate/created_at/updated_at. Excludes soft-deleted. Searches trade, region, notes via OR ilike. |
| POST | /api/v2/price-intelligence/labor-rates | Create labor rate. Requires trade and hourly_rate (positive). Defaults skill_level=journeyman. Sets created_by from auth. Returns 201. |
| GET | /api/v2/price-intelligence/labor-rates/:id | Get labor rate with history_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/price-intelligence/labor-rates/:id | Partial update of rate fields. Verifies ownership and not soft-deleted. |
| DELETE | /api/v2/price-intelligence/labor-rates/:id | Soft delete: sets deleted_at timestamp. Verifies rate exists and not already deleted. |
| GET | /api/v2/price-intelligence/labor-rates/:id/history | Get rate change history. Sortable by effective_date/new_rate/change_pct. Paginated. Verifies rate exists. |

### Type System
- 3 type unions: SkillLevel (4 values), UnitOfMeasure (12 values), ItemCategory (14 values)
- 5 interfaces: MasterItem, VendorItemPrice, PriceHistory, LaborRate, LaborRateHistory
- 3 constant arrays with value/label pairs: SKILL_LEVELS (4), UNITS_OF_MEASURE (12), ITEM_CATEGORIES (14)

### Validation Schemas (Zod)
- 3 enum schemas: skillLevelEnum, unitOfMeasureEnum, itemCategoryEnum
- listMasterItemsSchema (page/limit/category/q/sort_by/sort_order)
- createMasterItemSchema (name required; defaults: category=other, unit_of_measure=each, default_unit_price=0)
- updateMasterItemSchema (all fields optional)
- listVendorItemPricesSchema (page/limit/vendor_id/sort_by/sort_order)
- createVendorItemPriceSchema (vendor_id + unit_price required, positive price only, YYYY-MM-DD date validation)
- updateVendorItemPriceSchema (all fields optional)
- listPriceHistorySchema (page/limit/vendor_id/sort_by/sort_order, limit defaults to 50)
- listLaborRatesSchema (page/limit/trade/skill_level/region/q/sort_by/sort_order)
- createLaborRateSchema (trade + hourly_rate required, positive price only; defaults: skill_level=journeyman)
- updateLaborRateSchema (all fields optional)
- listLaborRateHistorySchema (page/limit/sort_by/sort_order, limit defaults to 50)

---

## Module 22: Vendor Performance Scoring (V1 Foundation)

### Database Tables
- **vendor_scores**: Overall composite scores per vendor per builder. Columns: company_id, vendor_id, quality_score (NUMERIC 5,2 0-100), timeliness_score (0-100), communication_score (0-100), budget_adherence_score (0-100), safety_score (0-100), overall_score (0-100), data_point_count (INT), calculation_window_months (INT default 12), manual_adjustment (NUMERIC 5,2 -10 to +10), manual_adjustment_reason (TEXT), calculated_at (TIMESTAMPTZ), created_by (FK users). UNIQUE(company_id, vendor_id). Soft delete via deleted_at. RLS enabled.
- **vendor_score_history**: Score snapshots over time. Columns: company_id, vendor_score_id (FK vendor_scores CASCADE), vendor_id, quality_score, timeliness_score, communication_score, budget_adherence_score, safety_score, overall_score, snapshot_date (DATE), notes (TEXT). RLS enabled.
- **vendor_job_performance**: Per-job performance ratings. Columns: company_id, vendor_id, job_id, trade, quality/timeliness/communication/budget_adherence/safety ratings (0-100 nullable), overall_rating, tasks_on_time, tasks_total, punch_items_count, punch_resolution_avg_days, inspection_pass_rate, bid_amount, final_amount, change_order_count, rating_notes, rated_by. Soft delete. RLS enabled.
- **vendor_warranty_callbacks**: Warranty issue tracking. Columns: company_id, vendor_id, job_id, title, description, severity (minor/moderate/major/critical), status (reported/acknowledged/in_progress/resolved/disputed), reported_date, resolved_date, resolution_notes, resolution_cost, resolution_days, reported_by, resolved_by. Soft delete. RLS enabled.
- **vendor_notes**: Internal notes and tags. Columns: company_id, vendor_id, author_id, title, body, tags (JSONB), is_internal (BOOLEAN). Soft delete. RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/vendor-performance/scores | List scores filtered by vendor_id. Paginated. Sortable. |
| GET | /api/v2/vendor-performance/scores/:vendorId | Get single vendor score. |
| PUT | /api/v2/vendor-performance/scores/:vendorId | Update score dimensions. Partial update. |
| GET | /api/v2/vendor-performance/scores/:vendorId/history | Get score history. Paginated. |
| GET | /api/v2/vendor-performance/job-ratings | List ratings filtered by vendor_id/job_id/trade. |
| POST | /api/v2/vendor-performance/job-ratings | Create rating. Returns 201. |
| GET/PUT/DELETE | /api/v2/vendor-performance/job-ratings/:id | CRUD single rating. |
| GET | /api/v2/vendor-performance/callbacks | List callbacks filtered by vendor_id/job_id/status/severity. |
| POST | /api/v2/vendor-performance/callbacks | Create callback. Returns 201. |
| GET/PUT/DELETE | /api/v2/vendor-performance/callbacks/:id | CRUD single callback. |
| POST | /api/v2/vendor-performance/callbacks/:id/resolve | Resolve callback (409 if already resolved). |
| GET | /api/v2/vendor-performance/notes | List notes filtered by vendor_id. |
| POST | /api/v2/vendor-performance/notes | Create note. Returns 201. |
| PUT/DELETE | /api/v2/vendor-performance/notes/:id | Update/delete single note. |

### Type System
- 3 type unions: ScoreDimension (5), CallbackStatus (5), CallbackSeverity (4)
- 5 interfaces: VendorScore, VendorScoreHistory, VendorJobPerformance, VendorWarrantyCallback, VendorNote
- Constants: SCORE_DIMENSIONS, CALLBACK_STATUSES, CALLBACK_SEVERITIES, SCORE_WEIGHTS (sums to 100), SCORE_WEIGHT_PRESETS (4 presets)

### Validation Schemas (Zod)
- 3 enum schemas: scoreDimensionEnum, callbackStatusEnum, callbackSeverityEnum
- 15 CRUD schemas for scores, history, job-ratings, callbacks, resolve, notes

---

## Module 21: Selection Management (V1 Foundation)

### Database Tables
- **selection_categories**: Builder-defined selection categories per project. Columns: company_id, job_id, name (VARCHAR 255), room (VARCHAR 200), sort_order (INT default 0), pricing_model (allowance/fixed/cost_plus), allowance_amount (NUMERIC 15,2 default 0), deadline (DATE), lead_time_buffer_days (INT default 0), assigned_to (UUID), status (pending/presented/selected/approved/ordered/received/installed/on_hold/cancelled), designer_access (BOOLEAN default false), notes (TEXT), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, status, room, (company_id, job_id), deleted_at partial.
- **selection_options**: Options within categories with pricing, vendor info, and lead times. Columns: company_id, category_id (FK selection_categories CASCADE), name (VARCHAR 255), description (TEXT), vendor_id (UUID), sku (VARCHAR 100), model_number (VARCHAR 100), unit_price (NUMERIC 15,2), quantity (NUMERIC 10,3), total_price (NUMERIC 15,2), lead_time_days (INT), availability_status (VARCHAR 100), source (builder/designer/client/catalog), is_recommended (BOOLEAN default false), sort_order (INT), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, category_id, vendor_id, source, deleted_at partial.
- **selections**: Actual selection records linking an option to a job/room. Columns: company_id, category_id (FK selection_categories CASCADE), option_id (FK selection_options CASCADE), job_id, room (VARCHAR 200), selected_by (UUID), selected_at (TIMESTAMPTZ), confirmed_by (UUID), confirmed_at (TIMESTAMPTZ), status (same 9 statuses), change_reason (TEXT), superseded_by (UUID), created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, category_id, option_id, job_id, status, (company_id, job_id), deleted_at partial.
- **selection_history**: Audit trail for selection actions. Columns: company_id, category_id (FK selection_categories CASCADE), option_id (UUID nullable), action (viewed/considered/selected/deselected/changed), actor_id (UUID), actor_role (VARCHAR 50), notes (TEXT), created_at. RLS enabled. Indexes on company_id, category_id, action, created_at DESC.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/selections/categories | List categories filtered by job_id/room/status/pricing_model/q. Paginated. Excludes soft-deleted. Search matches name or room via OR ilike. Ordered by sort_order asc, created_at desc. |
| POST | /api/v2/selections/categories | Create new category. Requires job_id, name. Defaults: status=pending, pricing_model=allowance, allowance_amount=0, sort_order=0, designer_access=false. Sets created_by from auth context. Returns 201. |
| GET | /api/v2/selections/categories/:id | Get category with options_count and selections_count. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/selections/categories/:id | Partial update of category fields. Only includes provided fields. Verifies ownership via company_id. |
| DELETE | /api/v2/selections/categories/:id | Soft delete: sets deleted_at timestamp. |
| GET | /api/v2/selections/options | List options filtered by category_id/source/is_recommended/q. Paginated. Search matches name, description, sku. |
| POST | /api/v2/selections/options | Create option. Requires category_id, name. Verifies category exists and belongs to company. Defaults: source=builder, unit_price=0, quantity=1, is_recommended=false. Returns 201. |
| GET | /api/v2/selections/options/:id | Get single option by ID. Scoped to company_id. |
| PUT | /api/v2/selections/options/:id | Partial update of option fields. Verifies ownership. |
| DELETE | /api/v2/selections/options/:id | Soft delete option. |
| GET | /api/v2/selections | List selections filtered by job_id/category_id/status/room/q. Paginated. Search matches room or change_reason. |
| POST | /api/v2/selections | Create selection. Requires category_id, option_id, job_id. Verifies both category and option exist and belong to company. Sets selected_by and selected_at from auth context. Records "selected" history entry. Returns 201. |
| GET | /api/v2/selections/:id | Get selection with history array for the category. Verifies company ownership. |
| PUT | /api/v2/selections/:id | Update selection. Records history entry if status or option changed. |
| DELETE | /api/v2/selections/:id | Soft delete selection. |
| GET | /api/v2/selections/:id/history | List history for a selection's category. Verifies selection exists. Paginated, ordered by created_at desc. |

### Type System
- 4 type unions: SelectionStatus (9 values), PricingModel (3 values), OptionSource (4 values), SelectionHistoryAction (5 values)
- 4 interfaces: SelectionCategory, SelectionOption, Selection, SelectionHistory
- 4 constant arrays with value/label pairs: SELECTION_STATUSES, PRICING_MODELS, OPTION_SOURCES, SELECTION_HISTORY_ACTIONS

### Validation Schemas (Zod)
- 4 enum schemas: selectionStatusEnum, pricingModelEnum, optionSourceEnum, selectionHistoryActionEnum
- listSelectionCategoriesSchema (page/limit/job_id/room/status/pricing_model/q)
- createSelectionCategorySchema (requires job_id, name; defaults: pricing_model=allowance, status=pending, allowance_amount=0, sort_order=0, designer_access=false, lead_time_buffer_days=0)
- updateSelectionCategorySchema (all fields optional)
- listSelectionOptionsSchema (page/limit/category_id/source/is_recommended/q)
- createSelectionOptionSchema (requires category_id, name; defaults: source=builder, is_recommended=false, unit_price=0, quantity=1, total_price=0, lead_time_days=0, sort_order=0)
- updateSelectionOptionSchema (all fields optional)
- listSelectionsSchema (page/limit/job_id/category_id/status/room/q)
- createSelectionSchema (requires category_id, option_id, job_id; default status=selected)
- updateSelectionSchema (all fields optional)
- listSelectionHistorySchema (page/limit, limit defaults to 50)

---

## Module 18: Purchase Orders (V1 Foundation)

### Database Tables
- **purchase_orders**: Core PO header table. Columns: company_id, job_id, vendor_id, po_number (VARCHAR 50), title (VARCHAR 255), status (draft/pending_approval/approved/sent/partially_received/received/closed/voided), subtotal/tax_amount/shipping_amount/total_amount (NUMERIC 15,2), budget_id, cost_code_id, delivery_date, shipping_address, terms, notes, approved_by (FK users), approved_at, sent_at, created_by (FK users). Soft delete via deleted_at. RLS enabled. Indexes on company_id, job_id, vendor_id, status, po_number, compound indexes on (company_id, status) and (company_id, job_id).
- **purchase_order_lines**: Line items per PO. Columns: po_id (FK purchase_orders CASCADE), description, quantity (NUMERIC 10,3), unit (VARCHAR 20 default 'each'), unit_price (NUMERIC 15,2), amount (NUMERIC 15,2), received_quantity (NUMERIC 10,3 default 0), cost_code_id, sort_order. Indexes on po_id, cost_code_id.
- **po_receipts**: Receipt records when materials are delivered. Columns: po_id (FK purchase_orders), company_id (FK companies), received_date, received_by (FK users), notes, document_id. RLS enabled. Indexes on po_id, company_id.
- **po_receipt_lines**: Individual line items within a receipt. Columns: receipt_id (FK po_receipts CASCADE), po_line_id (FK purchase_order_lines), quantity_received (NUMERIC 10,3), notes. Indexes on receipt_id, po_line_id.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/purchase-orders | List POs filtered by job_id/vendor_id/status/q. Paginated. Excludes soft-deleted. Search matches title or po_number. |
| POST | /api/v2/purchase-orders | Create new PO. Requires job_id, vendor_id, po_number, title. Defaults to draft status. Sets created_by from auth context. |
| GET | /api/v2/purchase-orders/:id | Get PO with nested lines (sorted by sort_order) and receipts (sorted by received_date desc). Includes lines_count and receipts_count. |
| PUT | /api/v2/purchase-orders/:id | Partial update of PO fields. Only includes provided fields in update. Verifies ownership via company_id. |
| DELETE | /api/v2/purchase-orders/:id | Soft delete: sets deleted_at, changes status to voided. |
| POST | /api/v2/purchase-orders/:id/approve | Approve PO. Validates status is draft or pending_approval (409 otherwise). Sets approved_by, approved_at, status=approved. |
| POST | /api/v2/purchase-orders/:id/send | Mark PO as sent. Validates status is approved (409 otherwise). Sets sent_at, status=sent. |
| GET | /api/v2/purchase-orders/:id/lines | List PO lines paginated. Verifies PO ownership. Ordered by sort_order asc. |
| POST | /api/v2/purchase-orders/:id/lines | Add line to PO. Verifies PO ownership. Requires description. |
| PUT | /api/v2/purchase-orders/:id/lines/:lineId | Partial update of line fields. Verifies PO ownership via company_id. |
| DELETE | /api/v2/purchase-orders/:id/lines/:lineId | Hard delete line. Verifies PO ownership. |
| GET | /api/v2/purchase-orders/:id/receipts | List receipts paginated with nested receipt lines. Verifies PO ownership. Ordered by received_date desc. |
| POST | /api/v2/purchase-orders/:id/receipts | Record receipt. Validates PO status is sent/partially_received/approved (409 otherwise). Creates receipt + receipt lines. Updates received_quantity on each PO line. Auto-updates PO status to partially_received or received based on line fulfillment. |

### Type System
- 1 type union: PurchaseOrderStatus (8 values)
- 4 interfaces: PurchaseOrder, PurchaseOrderLine, PoReceipt, PoReceiptLine
- 1 constant array: PO_STATUSES with value/label pairs for UI dropdowns

### Validation Schemas (Zod)
- 1 enum schema: purchaseOrderStatusEnum
- listPurchaseOrdersSchema (page/limit/job_id/vendor_id/status/q)
- createPurchaseOrderSchema (requires job_id, vendor_id, po_number, title; defaults status=draft, amounts=0)
- updatePurchaseOrderSchema (all fields optional)
- createPurchaseOrderLineSchema (requires description; defaults quantity=1, unit=each)
- updatePurchaseOrderLineSchema (all fields optional)
- listPurchaseOrderLinesSchema (page/limit)
- createPoReceiptSchema (requires lines array min 1 with po_line_id + quantity_received)
- listPoReceiptsSchema (page/limit)
- approvePurchaseOrderSchema (optional notes)
- sendPurchaseOrderSchema (optional notes)

---

## Module 17: Change Order Management (V1 Foundation)

### Database Tables
- **change_orders**: Core change order records. Columns: id, company_id, job_id, co_number (varchar 20), title (varchar 255), description (text), change_type (owner_requested/field_condition/design_change/regulatory/allowance/credit), status (draft/pending_approval/approved/rejected/voided), requested_by_type (builder/client/vendor), requested_by_id, amount (numeric 15,2), cost_impact (numeric 15,2), schedule_impact_days (int default 0), approval_chain (jsonb), approved_by, approved_at, client_approved (boolean default false), client_approved_at, document_id, budget_id, created_by, created_at, updated_at, deleted_at (soft delete). RLS enabled. Indexes on company_id, job_id, status, (company_id, co_number), created_at DESC, deleted_at partial.
- **change_order_items**: Line items for cost breakdown on a change order. Columns: id, change_order_id (FK cascade), description (text), cost_code_id, quantity (numeric 10,3 default 1), unit_price (numeric 15,2), amount (numeric 15,2), markup_pct (numeric 5,2 default 0), markup_amount (numeric 15,2 default 0), total (numeric 15,2 default 0), vendor_id, sort_order (int default 0), created_at, updated_at. RLS enabled. Indexes on change_order_id, cost_code_id, vendor_id.
- **change_order_history**: Audit trail for change order state transitions. Columns: id, change_order_id (FK cascade), action (created/submitted/approved/rejected/voided/revised/client_approved), previous_status, new_status, details (jsonb), performed_by, created_at. RLS enabled. Indexes on change_order_id, action.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/change-orders | List change orders filtered by job_id/status/change_type/q. Paginated. Excludes soft-deleted. Searches title and co_number via OR ilike. |
| POST | /api/v2/change-orders | Create new change order in draft status. Records "created" history entry. Returns 201. |
| GET | /api/v2/change-orders/:id | Get change order with items_count and full history array. Verifies company ownership and not soft-deleted. |
| PUT | /api/v2/change-orders/:id | Update change order. Only draft or pending_approval COs can be updated (403 otherwise). Records "revised" history entry with list of updated fields. |
| DELETE | /api/v2/change-orders/:id | Soft delete. Only draft COs can be deleted (403 otherwise). Sets deleted_at timestamp. |
| POST | /api/v2/change-orders/:id/submit | Transition draft -> pending_approval. Validates current status is draft (403 otherwise). Records "submitted" history entry. Optional notes in details. |
| POST | /api/v2/change-orders/:id/approve | Transition pending_approval -> approved. Validates current status is pending_approval (403 otherwise). Sets approved_by, approved_at. Optional client_approved flag. Records "approved" history entry. |
| GET | /api/v2/change-orders/:id/items | List items for a change order. Verifies CO belongs to company. Ordered by sort_order asc. Paginated. |
| POST | /api/v2/change-orders/:id/items | Add item to change order. Only draft or pending_approval COs (403 otherwise). Returns 201. |
| PUT | /api/v2/change-orders/:id/items/:itemId | Update item. Only draft or pending_approval COs (403 otherwise). Partial update. |
| DELETE | /api/v2/change-orders/:id/items/:itemId | Hard delete item. Only draft or pending_approval COs (403 otherwise). |

### Type System
- 4 type unions: ChangeType (6 values), ChangeOrderStatus (5 values), RequesterType (3 values), ChangeOrderHistoryAction (7 values)
- 3 interfaces: ChangeOrder, ChangeOrderItem, ChangeOrderHistory
- 4 constant arrays with value/label pairs: CHANGE_TYPES, CHANGE_ORDER_STATUSES, REQUESTER_TYPES, CHANGE_ORDER_HISTORY_ACTIONS

### Validation Schemas (Zod)
- 4 enum schemas: changeTypeEnum, changeOrderStatusEnum, requesterTypeEnum, changeOrderHistoryActionEnum
- listChangeOrdersSchema (page/limit/job_id/status/change_type/q)
- createChangeOrderSchema (job_id/co_number/title required + optional description/change_type/status/amounts/etc, defaults: status=draft, change_type=owner_requested, amount=0, schedule_impact_days=0)
- updateChangeOrderSchema (all fields optional)
- submitChangeOrderSchema (optional notes)
- approveChangeOrderSchema (optional notes, optional client_approved boolean)
- listChangeOrderItemsSchema (page/limit, limit defaults to 50)
- createChangeOrderItemSchema (description required + optional quantity/unit_price/amount/markup_pct/markup_amount/total/vendor_id/sort_order/cost_code_id, defaults: quantity=1, all amounts=0)
- updateChangeOrderItemSchema (all fields optional)

## Module 16: QuickBooks & Accounting Integration (V1 Foundation)

### Database Tables
- **accounting_connections**: Stores OAuth connection state per provider per company. Columns: provider (quickbooks_online/xero/sage), status (disconnected/connected/syncing/error), encrypted tokens, external company identifiers, sync_direction (push/pull/bidirectional), settings JSONB. UNIQUE constraint on (company_id, provider). Soft delete via deleted_at.
- **sync_mappings**: Links internal entity UUIDs to external system IDs. Supports vendor/client/account/bill/invoice/payment entity types. UNIQUE constraint on (connection_id, entity_type, internal_id). Tracks sync_status (synced/pending/error/conflict) per mapping.
- **sync_logs**: Immutable audit trail of every sync operation. Tracks entities_processed/created/updated/failed counts, sync_type (full/incremental/manual), direction (push/pull), status (started/completed/partial/failed).
- **sync_conflicts**: Records where platform and external data differ. Stores both internal_data and external_data as JSONB plus field_conflicts array. Resolution options: pending/use_internal/use_external/manual/skipped. Tracks resolver and resolution timestamp.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/integrations/connections | List connections filtered by provider/status. Paginated. Excludes soft-deleted. |
| POST | /api/v2/integrations/connections | Create new connection. Checks for duplicate provider per company (409 if exists). Defaults status to disconnected. |
| GET | /api/v2/integrations/connections/:id | Get connection with mapping counts, recent sync logs (last 5), pending conflict count. |
| PUT | /api/v2/integrations/connections/:id | Update connection settings, status, sync_direction. Verifies ownership. |
| DELETE | /api/v2/integrations/connections/:id | Soft delete: clears tokens, sets status=disconnected, sets deleted_at. |
| POST | /api/v2/integrations/connections/:id/sync | Trigger manual sync. Validates connection is not disconnected or already syncing (409). Creates sync_log entry with status=started. Returns 202 with sync_log_id. |
| GET | /api/v2/integrations/mappings | List mappings filtered by connection_id/entity_type/sync_status. Paginated. |
| POST | /api/v2/integrations/mappings | Create mapping. Validates connection ownership. Checks for duplicate (409). Sets initial sync_status=pending. |
| PUT | /api/v2/integrations/mappings/:id | Update external_id, external_name, sync_status, error_message. |
| DELETE | /api/v2/integrations/mappings/:id | Hard delete mapping record. |
| GET | /api/v2/integrations/sync-logs | List sync logs filtered by connection_id/sync_type/direction/status. Ordered by started_at desc. Paginated. |
| GET | /api/v2/integrations/conflicts | List conflicts filtered by connection_id/entity_type/resolution. Paginated. |
| POST | /api/v2/integrations/conflicts/:id/resolve | Resolve conflict. Rejects if already resolved (409). Rejects "pending" as resolution value. Sets resolved_by and resolved_at. |

### Type System
- 9 type unions: AccountingProvider, ConnectionStatus, SyncDirection, SyncEntityType, SyncStatus, SyncLogStatus, SyncLogType, SyncLogDirection, ConflictResolution
- 4 interfaces: AccountingConnection, SyncMapping, SyncLog, SyncConflict
- 9 constant arrays with value/label pairs for UI dropdowns

### Validation Schemas (Zod)
- 9 enum schemas mapping to type unions
- listConnectionsSchema, createConnectionSchema, updateConnectionSchema
- listMappingsSchema, createMappingSchema, updateMappingSchema
- listSyncLogsSchema, triggerSyncSchema (defaults: manual, push)
- listConflictsSchema, resolveConflictSchema (excludes "pending" from valid resolutions)

## Module 19: Financial Reporting (V1 Foundation)

### Database Tables
- **report_definitions**: Stores saved report definitions per company. Columns: name VARCHAR(200), report_type (profit_loss/balance_sheet/cash_flow/wip/job_cost/ar_aging/ap_aging/budget_vs_actual/retainage/custom), description TEXT, config JSONB, is_system BOOLEAN (for system-provided templates), is_active BOOLEAN (soft delete mechanism). Indexes on company_id, (company_id, report_type), (company_id, is_active). RLS enabled.
- **report_snapshots**: Immutable snapshot of a generated report. Links to report_definition_id. Stores period_start/period_end DATE, snapshot_data JSONB (full report output), generated_by UUID, generated_at TIMESTAMPTZ. Indexes on company_id, (company_id, report_definition_id), (company_id, period_start, period_end). RLS enabled.
- **report_schedules**: Configures automatic report generation. Links to report_definition_id. frequency (daily/weekly/monthly/quarterly), day_of_week INT (0-6), day_of_month INT (1-31), recipients JSONB array of {email, name}, is_active BOOLEAN, last_run_at/next_run_at timestamps. Indexes on company_id, (company_id, report_definition_id), (company_id, is_active), next_run_at WHERE is_active=true. RLS enabled.
- **financial_periods**: Tracks fiscal periods with lock status. period_name VARCHAR(50), period_start/period_end DATE, status (open/closed/locked), fiscal_year INT, fiscal_quarter INT (1-4), closed_by UUID, closed_at TIMESTAMPTZ. UNIQUE on (company_id, period_name). Indexes on company_id, (company_id, period_start, period_end), (company_id, status), (company_id, fiscal_year, fiscal_quarter). RLS enabled.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/reports/definitions | List report definitions. Filterable by report_type, is_active, q (name search). Paginated. |
| POST | /api/v2/reports/definitions | Create report definition. Requires name and report_type. Sets created_by to current user. Returns 201. |
| GET | /api/v2/reports/definitions/:id | Get single report definition by ID. Scoped to company_id. |
| PUT | /api/v2/reports/definitions/:id | Update report definition fields (name, report_type, description, config, is_active). Partial updates supported. |
| DELETE | /api/v2/reports/definitions/:id | Soft delete: sets is_active=false. |
| POST | /api/v2/reports/definitions/:id/generate | Generate a report snapshot. Requires period_start/period_end. Verifies definition exists and is active (403 if inactive). Creates report_snapshots row. Returns 201. V1: stores placeholder snapshot data. |
| GET | /api/v2/reports/snapshots | List report snapshots. Filterable by report_definition_id, period_start (gte), period_end (lte). Ordered by generated_at desc. Paginated. |
| GET | /api/v2/reports/snapshots/:id | Get single snapshot by ID. Scoped to company_id. |
| GET | /api/v2/reports/schedules | List report schedules. Filterable by report_definition_id, is_active. Paginated. |
| POST | /api/v2/reports/schedules | Create schedule. Requires report_definition_id, frequency, recipients (min 1). Validates definition exists. Returns 201. |
| PUT | /api/v2/reports/schedules/:id | Update schedule (frequency, day_of_week, day_of_month, recipients, is_active). Partial updates. |
| DELETE | /api/v2/reports/schedules/:id | Hard delete schedule record. |
| GET | /api/v2/financial-periods | List financial periods. Filterable by status, fiscal_year. Ordered by period_start desc. Paginated. |
| POST | /api/v2/financial-periods | Create financial period. Requires period_name, period_start, period_end, fiscal_year. Always created with status=open. Returns 201. |
| GET | /api/v2/financial-periods/:id | Get single financial period by ID. |
| PUT | /api/v2/financial-periods/:id | Update period fields. Rejects if status=locked (403). Partial updates. |
| POST | /api/v2/financial-periods/:id/close | Close a financial period. Rejects if already closed or locked (403). Sets status=closed, closed_by, closed_at. |

### Type System
- 3 type unions: ReportType (10 values), ScheduleFrequency (4 values), PeriodStatus (3 values)
- 5 interfaces: ReportDefinition, ReportSnapshot, ReportSchedule, ReportRecipient, FinancialPeriod
- 3 constant arrays with value/label pairs: REPORT_TYPES (10), SCHEDULE_FREQUENCIES (4), PERIOD_STATUSES (3)

### Validation Schemas (Zod)
- 3 enum schemas: reportTypeEnum, scheduleFrequencyEnum, periodStatusEnum
- listReportDefinitionsSchema, createReportDefinitionSchema, updateReportDefinitionSchema
- generateReportSchema (requires YYYY-MM-DD date range, optional parameters)
- listReportSnapshotsSchema (with UUID validation on report_definition_id)
- listReportSchedulesSchema, createReportScheduleSchema (min 1 recipient, email validation, day_of_week 0-6, day_of_month 1-31), updateReportScheduleSchema
- listFinancialPeriodsSchema, createFinancialPeriodSchema (YYYY-MM-DD dates, fiscal_year 2000-2100, fiscal_quarter 1-4), updateFinancialPeriodSchema
- closeFinancialPeriodSchema (optional notes)

---

## Module 44: White-Label & Branding (V1 Foundation)

### Database Tables
- **builder_branding**: Per-company visual branding config. UNIQUE(company_id). Columns: logo_url (TEXT), logo_dark_url (TEXT), favicon_url (TEXT), primary_color (VARCHAR 7 default '#2563eb'), secondary_color (VARCHAR 7 default '#1e40af'), accent_color (VARCHAR 7 default '#f59e0b'), font_family (VARCHAR 100 default 'Inter'), header_style (light/dark/gradient/custom default 'light'), login_background_url (TEXT), login_message (TEXT), powered_by_visible (BOOLEAN default true), custom_css (TEXT), metadata (JSONB default {}). RLS enabled. No soft delete (upsert pattern). Indexes on company_id.
- **builder_custom_domains**: Custom domain registration per company. Columns: company_id, domain (VARCHAR 255 NOT NULL), subdomain (VARCHAR 100), status (pending/verifying/active/failed/expired default 'pending'), ssl_status (pending/issued/expired/failed default 'pending'), verification_token (VARCHAR 255), verified_at (TIMESTAMPTZ), ssl_issued_at (TIMESTAMPTZ), ssl_expires_at (TIMESTAMPTZ), is_primary (BOOLEAN default false). Soft delete via deleted_at. RLS enabled. UNIQUE(domain). Indexes on company_id, status, domain, (company_id, is_primary), deleted_at partial.
- **builder_email_config**: Per-company email branding. UNIQUE(company_id). Columns: from_name (VARCHAR 200), from_email (VARCHAR 255), reply_to_email (VARCHAR 255), email_header_html (TEXT), email_footer_html (TEXT), email_signature (TEXT), use_custom_smtp (BOOLEAN default false), smtp_host (VARCHAR 255), smtp_port (INT), smtp_username (VARCHAR 255), smtp_encrypted_password (TEXT), is_verified (BOOLEAN default false), verified_at (TIMESTAMPTZ). RLS enabled. No soft delete (upsert pattern).
- **builder_terminology**: Custom term overrides. Columns: company_id, default_term (VARCHAR 100), custom_term (VARCHAR 100), context (navigation/reports/forms/notifications/global default 'global'), is_active (BOOLEAN default true). UNIQUE(company_id, default_term, context). RLS enabled. No soft delete (hard delete). Indexes on company_id, context, (company_id, is_active).
- **builder_content_pages**: Custom portal content pages. Columns: company_id, page_type (welcome/terms/privacy/help/faq/about/custom default 'custom'), title (VARCHAR 255), slug (VARCHAR 200), content_html (TEXT), is_published (BOOLEAN default false), published_at (TIMESTAMPTZ), sort_order (INT default 0), created_by (FK users). Soft delete via deleted_at. RLS enabled. UNIQUE(company_id, slug). Indexes on company_id, page_type, (company_id, is_published), deleted_at partial.

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/branding | Get branding for current company. Returns defaults if none exists. |
| PUT | /api/v2/branding | Upsert branding. Validates hex colors (#RRGGBB format). |
| GET | /api/v2/branding/domains | List custom domains filtered by status/q. Paginated. Excludes soft-deleted. Searches domain. |
| POST | /api/v2/branding/domains | Create custom domain. Requires domain. Auto-generates verification_token. 409 on duplicate domain. Returns 201. |
| GET | /api/v2/branding/domains/:id | Get single domain. |
| PUT | /api/v2/branding/domains/:id | Update domain. Auto-sets verified_at when status=active. Auto-sets ssl_issued_at when ssl_status=issued. |
| DELETE | /api/v2/branding/domains/:id | Soft delete domain. |
| GET | /api/v2/branding/email | Get email config. Returns null if none exists. |
| PUT | /api/v2/branding/email | Upsert email config. Validates email format. SMTP port range 1-65535. |
| GET | /api/v2/branding/terminology | List terminology overrides filtered by context/is_active/q. Paginated. Searches default_term and custom_term. |
| POST | /api/v2/branding/terminology | Create terminology override. Requires default_term and custom_term. Defaults: context=global, is_active=true. 409 on duplicate. Returns 201. |
| GET | /api/v2/branding/terminology/:id | Get single terminology override. |
| PUT | /api/v2/branding/terminology/:id | Update terminology override. |
| DELETE | /api/v2/branding/terminology/:id | Hard delete terminology override. |
| GET | /api/v2/branding/pages | List content pages filtered by page_type/is_published/q. Paginated. Excludes soft-deleted. Searches title and slug. Ordered by sort_order asc, created_at desc. |
| POST | /api/v2/branding/pages | Create content page. Requires title and slug. Validates slug format (lowercase, hyphens only). Auto-sets published_at when is_published=true. 409 on duplicate slug. Returns 201. |
| GET | /api/v2/branding/pages/:id | Get single content page. |
| PUT | /api/v2/branding/pages/:id | Update content page. Auto-sets published_at when is_published=true. |
| DELETE | /api/v2/branding/pages/:id | Soft delete content page. |

### Type System
- 5 type unions: HeaderStyle (4: light/dark/gradient/custom), DomainStatus (5: pending/verifying/active/failed/expired), SslStatus (4: pending/issued/expired/failed), TerminologyContext (5: navigation/reports/forms/notifications/global), ContentPageType (7: welcome/terms/privacy/help/faq/about/custom)
- 5 interfaces: BuilderBranding, BuilderCustomDomain, BuilderEmailConfig, BuilderTerminology, BuilderContentPage
- 5 constant arrays: HEADER_STYLES, DOMAIN_STATUSES, SSL_STATUSES, TERMINOLOGY_CONTEXTS, CONTENT_PAGE_TYPES

### Validation Schemas (Zod)
- 5 enum schemas: headerStyleEnum, domainStatusEnum, sslStatusEnum, terminologyContextEnum, contentPageTypeEnum
- updateBrandingSchema (all fields optional, hex color regex validation #RRGGBB, null allowed for URLs)
- listDomainsSchema (page/limit/status/q)
- createDomainSchema (requires domain; defaults: is_primary=false)
- updateDomainSchema (status/ssl_status/subdomain/is_primary optional)
- updateEmailConfigSchema (all fields optional, email format validation, smtp_port 1-65535, null allowed for SMTP fields)
- listTerminologySchema (page/limit defaults to 50, context/is_active with boolean preprocess/q)
- createTerminologySchema (requires default_term and custom_term max 100; defaults: context=global, is_active=true)
- updateTerminologySchema (all fields optional)
- listContentPagesSchema (page/limit/page_type/is_published with boolean preprocess/q)
- createContentPageSchema (requires title max 255 and slug max 200 with regex validation; defaults: page_type=custom, is_published=false, sort_order=0)
- updateContentPageSchema (all fields optional, slug validated with regex, sort_order min 0)

---

## Module 42: Data Migration (V1 Foundation)

### Database Tables
- **migration_jobs**: Core migration job records. Columns: company_id, name (VARCHAR 255), description (TEXT), source_platform (9 platforms: buildertrend/coconstruct/procore/quickbooks/excel/csv/sage/xero/other), status (8 statuses: draft/mapping/validating/ready/running/completed/failed/rolled_back), source_file_url (TEXT), source_file_name (VARCHAR 255), total_records/processed_records/failed_records/skipped_records (INT default 0), error_log (JSONB default []), started_at/completed_at/rolled_back_at (TIMESTAMPTZ), rolled_back_by/created_by (UUID). Soft delete via deleted_at. RLS enabled. 7 indexes.
- **migration_field_mappings**: Field mapping definitions per job. Columns: company_id, job_id (FK migration_jobs CASCADE), source_field (VARCHAR 200), target_table (VARCHAR 100), target_field (VARCHAR 100), transform_type (9 types: direct/lookup/formula/default/concatenate/split/date_format/currency/skip), transform_config (JSONB default {}), is_required (BOOLEAN default false), default_value (TEXT), sample_source_value/sample_target_value (TEXT), sort_order (INT default 0). RLS enabled. 5 indexes.
- **migration_mapping_templates**: Reusable mapping templates. Columns: company_id, name (VARCHAR 200), description (TEXT), source_platform, mappings (JSONB default []), is_system (BOOLEAN default false), is_active (BOOLEAN default true), created_by (UUID). RLS enabled. 4 indexes.
- **migration_validation_results**: Validation results per job. Columns: company_id, job_id (FK migration_jobs CASCADE), validation_type (7 types: schema/data_type/required_field/uniqueness/referential/business_rule/format), severity (error/warning/info), field_name (VARCHAR 200), record_index (INT), source_value (TEXT), message (TEXT), is_resolved (BOOLEAN default false), resolved_at (TIMESTAMPTZ), resolved_by (UUID). RLS enabled. 6 indexes.
- **migration_reconciliation**: Reconciliation tracking per job per entity type. Columns: company_id, job_id (FK migration_jobs CASCADE), entity_type (6 types: vendor/client/job/invoice/cost_code/employee), source_count/imported_count/matched_count/unmatched_count (INT default 0), discrepancies (JSONB default []), status (4 statuses: pending/reconciling/reconciled/discrepant), reconciled_at (TIMESTAMPTZ), reconciled_by (UUID), notes (TEXT). RLS enabled. 5 indexes.

### API Endpoints (10 route files under /api/v2/data-migration/)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/data-migration/jobs | List migration jobs filtered by status/source_platform/q. Paginated. Excludes soft-deleted. Searches name via ilike. |
| POST | /api/v2/data-migration/jobs | Create migration job. Requires name. Defaults: source_platform=other, status=draft, all counts=0. Returns 201. |
| GET | /api/v2/data-migration/jobs/:id | Get job with mappings_count, validations_count, reconciliation_count. |
| PUT | /api/v2/data-migration/jobs/:id | Update job. Auto-sets started_at on running, completed_at on completed, rolled_back_at on rolled_back. |
| DELETE | /api/v2/data-migration/jobs/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/data-migration/jobs/:id/mappings | List field mappings for a job. Filtered by target_table/transform_type. Ordered by sort_order asc. Verifies job exists. |
| POST | /api/v2/data-migration/jobs/:id/mappings | Create field mapping. Verifies job exists. Returns 201. |
| GET | /api/v2/data-migration/jobs/:id/mappings/:mappingId | Get single mapping. |
| PUT | /api/v2/data-migration/jobs/:id/mappings/:mappingId | Update mapping. |
| DELETE | /api/v2/data-migration/jobs/:id/mappings/:mappingId | Hard delete mapping. |
| GET | /api/v2/data-migration/jobs/:id/validations | List validation results. Filtered by validation_type/severity/is_resolved. Verifies job exists. |
| POST | /api/v2/data-migration/jobs/:id/validations | Create validation result. Verifies job exists. Returns 201. |
| GET | /api/v2/data-migration/jobs/:id/validations/:validationId | Get single validation result. |
| PUT | /api/v2/data-migration/jobs/:id/validations/:validationId | Update validation result. Auto-sets resolved_at/resolved_by when is_resolved=true, clears when false. |
| GET | /api/v2/data-migration/jobs/:id/reconciliation | List reconciliation records. Filtered by entity_type/status. Verifies job exists. |
| POST | /api/v2/data-migration/jobs/:id/reconciliation | Create reconciliation record. Verifies job exists. Returns 201. |
| GET | /api/v2/data-migration/jobs/:id/reconciliation/:reconciliationId | Get single reconciliation record. |
| PUT | /api/v2/data-migration/jobs/:id/reconciliation/:reconciliationId | Update reconciliation. Auto-sets reconciled_at when status='reconciled'. |
| GET | /api/v2/data-migration/templates | List mapping templates. Filtered by source_platform/is_active/q. Searches name and description. |
| POST | /api/v2/data-migration/templates | Create mapping template. Requires name and source_platform. Returns 201. |
| GET | /api/v2/data-migration/templates/:id | Get single template. |
| PUT | /api/v2/data-migration/templates/:id | Update template. |
| DELETE | /api/v2/data-migration/templates/:id | Deactivate: sets is_active=false. |

### Type System
- 7 type unions: SourcePlatform (9), MigrationStatus (8), TransformType (9), ValidationType (7), ValidationSeverity (3), ReconciliationStatus (4), MigrationEntityType (6)
- 5 interfaces: MigrationJob, MigrationFieldMapping, MigrationMappingTemplate, MigrationValidationResult, MigrationReconciliation
- 7 constant arrays: SOURCE_PLATFORMS, MIGRATION_STATUSES, TRANSFORM_TYPES, VALIDATION_TYPES, VALIDATION_SEVERITIES, RECONCILIATION_STATUSES, MIGRATION_ENTITY_TYPES

### Validation Schemas (Zod)
- 7 enum schemas: sourcePlatformEnum, migrationStatusEnum, transformTypeEnum, validationTypeEnum, validationSeverityEnum, reconciliationStatusEnum, migrationEntityTypeEnum
- listMigrationJobsSchema (page/limit/status/source_platform/q)
- createMigrationJobSchema (requires name max 255; defaults: source_platform=other, status=draft, total_records=0)
- updateMigrationJobSchema (all fields optional, includes error_log array and record counts)
- listFieldMappingsSchema (page/limit defaults to 50, target_table/transform_type)
- createFieldMappingSchema (requires source_field/target_table/target_field max 200/100/100; defaults: transform_type=direct, is_required=false, sort_order=0)
- updateFieldMappingSchema (all fields optional)
- listMappingTemplatesSchema (page/limit/source_platform/is_active with boolean preprocess/q)
- createMappingTemplateSchema (requires name max 200 and source_platform; defaults: mappings=[], is_system=false, is_active=true)
- updateMappingTemplateSchema (all fields optional)
- listValidationResultsSchema (page/limit defaults to 50, validation_type/severity/is_resolved with boolean preprocess)
- createValidationResultSchema (requires message min 1 max 5000; defaults: validation_type=schema, severity=warning, record_index non-negative)
- updateValidationResultSchema (all fields optional, is_resolved boolean)
- listReconciliationSchema (page/limit/entity_type/status)
- createReconciliationSchema (requires entity_type; defaults: all counts=0, discrepancies=[], status=pending, counts non-negative)
- updateReconciliationSchema (all fields optional, notes max 10000)

---

## Module 45: API & Marketplace (V1 Foundation)

### Database Tables
- **api_keys**: Per-company API key management. Columns: company_id, name (VARCHAR 200), key_prefix (VARCHAR 20), key_hash (VARCHAR 255), permissions (JSONB default []), status (active/revoked/expired), rate_limit_per_minute (INT default 60), last_used_at, expires_at, revoked_at, revoked_by (UUID), created_by (UUID). No soft delete -- uses status=revoked with revoked_at/revoked_by. RLS enabled. Indexes on company_id, status, key_prefix, key_hash, (company_id, status), expires_at.
- **webhook_subscriptions**: Webhook endpoint registrations. Columns: company_id, url (TEXT), events (JSONB), status (active/paused/disabled/failing), secret (VARCHAR 255), description (TEXT), retry_count (INT default 0), max_retries (INT default 5), failure_count (INT default 0), last_triggered_at, last_success_at, last_failure_at, created_by (UUID). Soft delete via deleted_at. RLS enabled. Indexes on company_id, status, (company_id, status), deleted_at partial.
- **webhook_deliveries**: Delivery attempt log per webhook. Columns: company_id, subscription_id (FK webhook_subscriptions CASCADE), event_type (VARCHAR 100), payload (JSONB), status (pending/delivered/failed/retrying), response_status_code (INT), response_body (TEXT), attempt_count (INT default 1), next_retry_at, delivered_at. Append-only log -- no updated_at trigger, no soft delete. RLS enabled. Indexes on company_id, subscription_id, status, event_type, (company_id, subscription_id), created_at DESC.
- **integration_listings**: Global marketplace catalog (NO company_id, NO RLS). Columns: name (VARCHAR 255), slug (VARCHAR 100 UNIQUE), description (TEXT), long_description (TEXT), logo_url (TEXT), screenshots (JSONB default []), category (9 categories), developer_name (VARCHAR 200), developer_url/documentation_url/support_url (TEXT), pricing_type (free/paid/freemium/contact), price_monthly (NUMERIC 10,2), install_count (INT default 0), avg_rating (NUMERIC 3,2 default 0), review_count (INT default 0), status (5 statuses), is_featured (BOOLEAN default false), required_plan_tier (VARCHAR 50), created_by (UUID). Indexes on slug (unique), category, status, is_featured, (status, is_featured).
- **integration_installs**: Per-company integration installs. Columns: company_id, listing_id (FK integration_listings), status (installed/active/paused/uninstalled), configuration (JSONB default {}), installed_by (UUID), installed_at (TIMESTAMPTZ default now()), uninstalled_at, uninstalled_by (UUID). UNIQUE(company_id, listing_id). RLS enabled. Indexes on company_id, listing_id, status, (company_id, status), (company_id, listing_id).

### API Endpoints
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/api-keys | List API keys filtered by status/q. Paginated. Searches name via ilike. |
| POST | /api/v2/api-keys | Create API key. Requires name. Defaults: permissions=[], rate_limit_per_minute=60, status=active. Returns 201. |
| GET | /api/v2/api-keys/:id | Get single API key. |
| PUT | /api/v2/api-keys/:id | Update API key (name, permissions, rate_limit, status, expires_at). |
| DELETE | /api/v2/api-keys/:id | Revoke API key. Already revoked returns 409. Sets status=revoked, revoked_at, revoked_by. |
| GET | /api/v2/webhooks | List webhooks filtered by status/q. Paginated. Excludes soft-deleted. |
| POST | /api/v2/webhooks | Create webhook. Requires url and events (min 1). Defaults: status=active, max_retries=5. Returns 201. |
| GET | /api/v2/webhooks/:id | Get single webhook. |
| PUT | /api/v2/webhooks/:id | Update webhook (url, events, status, description, max_retries). |
| DELETE | /api/v2/webhooks/:id | Soft delete webhook. |
| GET | /api/v2/webhooks/:id/deliveries | List deliveries for webhook filtered by status/event_type. Paginated. |
| GET | /api/v2/integrations/listings | List marketplace listings. Global (no company filter). Filterable by category/status/is_featured/q. Search matches name and description. |
| GET | /api/v2/integrations/listings/:slug | Get listing by slug. Global (no company filter). |
| GET | /api/v2/integrations/installs | List installs for company filtered by listing_id/status. Paginated. |
| POST | /api/v2/integrations/installs | Install integration. Requires listing_id. Verifies listing exists. Checks for existing non-uninstalled install (409). Defaults: configuration={}. Returns 201. |
| GET | /api/v2/integrations/installs/:id | Get install details. |
| PUT | /api/v2/integrations/installs/:id | Update install (status, configuration). |
| DELETE | /api/v2/integrations/installs/:id | Uninstall. Already uninstalled returns 409. Sets status=uninstalled, uninstalled_at, uninstalled_by. |

### Type System
- 7 type unions: ApiKeyStatus (3), WebhookStatus (4), DeliveryStatus (4), IntegrationCategory (9), IntegrationStatus (5), PricingType (4), InstallStatus (4)
- 5 interfaces: ApiKey, WebhookSubscription, WebhookDelivery, IntegrationListing, IntegrationInstall
- 7 constant arrays: API_KEY_STATUSES, WEBHOOK_STATUSES, DELIVERY_STATUSES, INTEGRATION_CATEGORIES, INTEGRATION_STATUSES, PRICING_TYPES, INSTALL_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas: apiKeyStatusEnum, webhookStatusEnum, deliveryStatusEnum, integrationCategoryEnum, integrationStatusEnum, pricingTypeEnum, installStatusEnum
- listApiKeysSchema (page/limit/status/q)
- createApiKeySchema (requires name; defaults: permissions=[], rate_limit_per_minute=60; expires_at nullable YYYY-MM-DD)
- updateApiKeySchema (all fields optional)
- listWebhooksSchema (page/limit/status/q)
- createWebhookSchema (requires url + events min 1; defaults: status=active, max_retries=5; url validated)
- updateWebhookSchema (all fields optional, url validated)
- listWebhookDeliveriesSchema (page/limit/status/event_type)
- listIntegrationListingsSchema (page/limit/category/status/is_featured boolean preprocess/q)
- listIntegrationInstallsSchema (page/limit/listing_id UUID/status)
- createIntegrationInstallSchema (requires listing_id UUID; defaults: configuration={})
- updateIntegrationInstallSchema (status/configuration optional)

---

## Module 41: Onboarding Wizard (V1 Foundation)

### Database Tables
- **onboarding_sessions**: Core wizard session tracking per company/user. Columns: company_id, user_id (FK users), status (not_started/in_progress/completed/skipped), current_step (INT default 1), total_steps (INT default 8), company_type (custom_home/production/remodel/commercial/specialty nullable), company_size (1-5/6-20/21-50/51-100/100+ nullable), started_at, completed_at, skipped_at, metadata (JSONB), created_by. Soft delete via deleted_at. RLS enabled. 5 indexes.
- **onboarding_milestones**: Individual step completion tracking per session. Columns: company_id, session_id (FK sessions CASCADE), milestone_key (VARCHAR 100), title (VARCHAR 255), description (TEXT), status (pending/in_progress/completed/skipped), sort_order (INT default 0), started_at, completed_at, skipped_at, data (JSONB). RLS enabled. 4 indexes.
- **onboarding_reminders**: Nudge/reminder scheduling for incomplete onboarding. Columns: company_id, session_id (FK sessions CASCADE), reminder_type (email/in_app/push), subject (VARCHAR 255), message (TEXT), scheduled_at (TIMESTAMPTZ NOT NULL), sent_at, status (scheduled/sent/cancelled/failed). RLS enabled. 4 indexes.
- **sample_data_sets**: Pre-built demo data configurations. Columns: company_id, name (VARCHAR 200), description (TEXT), data_type (full_demo/minimal/custom_home/production/remodel/commercial), status (pending/generating/ready/applied/failed), content (JSONB), applied_at, applied_by, created_by. RLS enabled. 3 indexes.
- **onboarding_checklists**: Setup checklist items per session. Columns: company_id, session_id (FK sessions CASCADE), category (setup/data/team/workflow/integration), title (VARCHAR 255), description (TEXT), is_completed (BOOLEAN default false), is_required (BOOLEAN default true), completed_at, completed_by, sort_order (INT default 0). RLS enabled. 4 indexes.

### API Endpoints (10 route files under /api/v2/onboarding/)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/onboarding | List sessions filtered by status/q. Paginated. Excludes soft-deleted. |
| POST | /api/v2/onboarding | Create session. Requires user_id. Defaults: status=not_started, current_step=1, total_steps=8. Returns 201. |
| GET | /api/v2/onboarding/:id | Get session with milestones_count and checklists_count. |
| PUT | /api/v2/onboarding/:id | Update session. Auto-sets started_at on in_progress, completed_at on completed, skipped_at on skipped. |
| DELETE | /api/v2/onboarding/:id | Soft delete: sets deleted_at. |
| GET | /api/v2/onboarding/:id/milestones | List milestones for session. Filtered by status. Ordered by sort_order asc. |
| POST | /api/v2/onboarding/:id/milestones | Create milestone. Verifies session exists. Returns 201. |
| GET | /api/v2/onboarding/:id/milestones/:milestoneId | Get single milestone. |
| PUT | /api/v2/onboarding/:id/milestones/:milestoneId | Update milestone. Auto-sets started_at/completed_at/skipped_at on status transitions. |
| GET | /api/v2/onboarding/:id/reminders | List reminders for session. Filtered by status/reminder_type. |
| POST | /api/v2/onboarding/:id/reminders | Create reminder. Verifies session exists. Returns 201. |
| GET | /api/v2/onboarding/:id/reminders/:reminderId | Get single reminder. |
| PUT | /api/v2/onboarding/:id/reminders/:reminderId | Update reminder. Auto-sets sent_at when status=sent. |
| GET | /api/v2/onboarding/sample-data | List sample data sets. Filtered by data_type/status. |
| POST | /api/v2/onboarding/sample-data | Create sample data set. Requires name. Returns 201. |
| GET | /api/v2/onboarding/sample-data/:id | Get single sample data set. |
| PUT | /api/v2/onboarding/sample-data/:id | Update sample data set. Auto-sets generated_at on ready, applied_at on applied. |
| GET | /api/v2/onboarding/:id/checklists | List checklists for session. Filtered by category/is_completed. Ordered by sort_order. |
| POST | /api/v2/onboarding/:id/checklists | Create checklist item. Verifies session exists. Returns 201. |
| GET | /api/v2/onboarding/:id/checklists/:checklistId | Get single checklist item. |
| PUT | /api/v2/onboarding/:id/checklists/:checklistId | Update checklist. Auto-sets completed_at when is_completed=true (null when false). |

### Type System
- 9 type unions: OnboardingStatus (4), MilestoneStatus (4), ReminderType (3), ReminderStatus (4), SampleDataType (6), SampleDataStatus (5), CompanyType (5), CompanySize (5), ChecklistCategory (5)
- 5 interfaces: OnboardingSession, OnboardingMilestone, OnboardingReminder, SampleDataSet, OnboardingChecklist
- 9 constant arrays: ONBOARDING_STATUSES, MILESTONE_STATUSES, REMINDER_TYPES, REMINDER_STATUSES, SAMPLE_DATA_TYPES, SAMPLE_DATA_STATUSES, COMPANY_TYPES, COMPANY_SIZES, CHECKLIST_CATEGORIES

### Validation Schemas (Zod)
- 9 enum schemas: onboardingStatusEnum, milestoneStatusEnum, reminderTypeEnum, reminderStatusEnum, sampleDataTypeEnum, sampleDataStatusEnum, companyTypeEnum, companySizeEnum, checklistCategoryEnum
- listOnboardingSessionsSchema (page/limit/status/q)
- createOnboardingSessionSchema (requires user_id UUID; defaults: status=not_started, current_step=1, total_steps=8, metadata={})
- updateOnboardingSessionSchema (all fields optional; current_step/total_steps 1-50)
- listMilestonesSchema (page/limit defaults to 50, status filter)
- createMilestoneSchema (requires session_id UUID, milestone_key, title; defaults: status=pending, sort_order=0, data={})
- updateMilestoneSchema (all fields optional)
- listRemindersSchema (page/limit, status/reminder_type filters)
- createReminderSchema (requires session_id UUID, scheduled_at; defaults: reminder_type=email, status=scheduled)
- updateReminderSchema (all fields optional)
- listSampleDataSetsSchema (page/limit, data_type/status filters)
- createSampleDataSetSchema (requires name; defaults: data_type=full_demo, status=pending, content={})
- updateSampleDataSetSchema (all fields optional)
- listChecklistsSchema (page/limit, session_id/category/is_completed boolean preprocess filters)
- createChecklistSchema (requires session_id UUID, title; defaults: category=setup, is_completed=false, is_required=true, sort_order=0)
- updateChecklistSchema (all fields optional)

---

## Module 43: Subscription Billing (V1 Foundation)

### Database Tables
- **subscription_plans**: Platform-level plan definitions (NO company_id). Columns: name (VARCHAR 100), slug (VARCHAR 100 UNIQUE), description (TEXT), tier (free/starter/professional/business/enterprise), price_monthly/price_annual (NUMERIC 10,2), max_users (INT nullable), max_projects (INT nullable), features (JSONB), is_active (BOOLEAN default true), sort_order (INT default 0). RLS with `USING (true)` for read access. 4 indexes. updated_at trigger.
- **plan_addons**: Platform-level add-on products (NO company_id). Columns: name (VARCHAR 200), slug (VARCHAR 100 UNIQUE), description (TEXT), addon_type (module/storage/users/api_access/support/training/white_label), price_monthly/price_annual (NUMERIC 10,2), is_metered (BOOLEAN default false), meter_unit (VARCHAR 50), meter_price_per_unit (NUMERIC 10,4), is_active (BOOLEAN default true), sort_order (INT). RLS with `USING (true)`. 4 indexes. updated_at trigger.
- **company_subscriptions**: Per-company subscription record. Columns: company_id (UNIQUE), plan_id (FK subscription_plans), status (trialing/active/past_due/cancelled/suspended/expired), billing_cycle (monthly/annual), current_period_start/current_period_end (DATE), trial_start/trial_end (DATE), cancelled_at (TIMESTAMPTZ), cancel_reason (TEXT), stripe_subscription_id/stripe_customer_id (VARCHAR 100), grandfathered_plan (VARCHAR 100), metadata (JSONB). RLS enabled. 9 indexes. updated_at trigger.
- **usage_meters**: Usage tracking per company. Columns: company_id, addon_id (FK plan_addons nullable), meter_type (storage_gb/active_users/api_calls/ai_processing), period_start/period_end (DATE), quantity (NUMERIC 15,4 default 0), unit (VARCHAR 50), overage_quantity (NUMERIC 15,4 default 0), overage_cost (NUMERIC 15,2 default 0). RLS enabled. 7 indexes. updated_at trigger.
- **billing_events**: Append-only billing audit log. Columns: company_id, event_type (14 types: subscription_created/subscription_updated/subscription_cancelled/payment_succeeded/payment_failed/invoice_created/invoice_paid/refund/credit_applied/trial_started/trial_ended/plan_changed/addon_added/addon_removed), description (TEXT), amount (NUMERIC 15,2 default 0), currency (VARCHAR 3 default 'USD'), metadata (JSONB), stripe_event_id (VARCHAR 200). NO updated_at (immutable). RLS enabled. 7 indexes.

### API Endpoints (10 route files under /api/v2/billing/)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/billing/plans | List plans filtered by tier/is_active/q. Paginated. No company_id filter (platform-level). |
| POST | /api/v2/billing/plans | Create plan. Requires name, slug. Duplicate slug check (409). Defaults: tier=starter, prices=0, is_active=true. Returns 201. |
| GET | /api/v2/billing/plans/:id | Get single plan. No company_id filter. |
| PUT | /api/v2/billing/plans/:id | Update plan. Partial. No company_id filter. |
| DELETE | /api/v2/billing/plans/:id | Deactivate: sets is_active=false. No company_id filter. |
| GET | /api/v2/billing/addons | List addons filtered by addon_type/is_active/q. Paginated. Platform-level. |
| POST | /api/v2/billing/addons | Create addon. Requires name, slug. Duplicate slug check (409). Defaults: addon_type=module, is_metered=false. Returns 201. |
| GET | /api/v2/billing/addons/:id | Get single addon. |
| PUT | /api/v2/billing/addons/:id | Update addon. Partial. |
| DELETE | /api/v2/billing/addons/:id | Deactivate: sets is_active=false. |
| GET | /api/v2/billing/subscriptions | List subscriptions filtered by status/billing_cycle/plan_id/q. Paginated. Scoped to company_id. |
| POST | /api/v2/billing/subscriptions | Create subscription. Requires plan_id. UNIQUE(company_id) check (409). Defaults: status=trialing, billing_cycle=monthly, metadata={}. Returns 201. |
| GET | /api/v2/billing/subscriptions/:id | Get subscription. Scoped to company_id. |
| PUT | /api/v2/billing/subscriptions/:id | Update subscription. Auto-sets cancelled_at when status changes to cancelled. Scoped to company_id. |
| GET | /api/v2/billing/usage | List usage meters filtered by meter_type/addon_id/period_start/period_end. Paginated. Ordered by period_start DESC. |
| POST | /api/v2/billing/usage | Create usage meter. Requires meter_type, period_start, period_end. Defaults: quantity=0, overage_quantity=0, overage_cost=0. Returns 201. |
| GET | /api/v2/billing/usage/:id | Get usage meter. Scoped to company_id. |
| PUT | /api/v2/billing/usage/:id | Update usage meter. Partial. |
| GET | /api/v2/billing/events | List billing events (read-only). Filtered by event_type/date_from/date_to. Ordered by created_at DESC. |
| GET | /api/v2/billing/events/:id | Get single billing event (read-only). |

### Type System
- 6 type unions: PlanTier (5), AddonType (7), SubscriptionStatus (6), BillingCycle (2), BillingEventType (14), MeterType (4)
- 5 interfaces: SubscriptionPlan, PlanAddon, CompanySubscription, UsageMeter, BillingEvent
- 6 constant arrays: PLAN_TIERS, ADDON_TYPES, SUBSCRIPTION_STATUSES, BILLING_CYCLES, BILLING_EVENT_TYPES, METER_TYPES

### Validation Schemas (Zod)
- 6 enum schemas: planTierEnum, addonTypeEnum, subscriptionStatusEnum, billingCycleEnum, billingEventTypeEnum, meterTypeEnum
- listPlansSchema (page/limit/tier/is_active/q with boolean preprocess)
- createPlanSchema (requires name, slug; slug regex validated; defaults: tier=starter, prices=0, features={}, is_active=true, sort_order=0)
- updatePlanSchema (all fields optional)
- listAddonsSchema (page/limit/addon_type/is_active/q with boolean preprocess)
- createAddonSchema (requires name, slug; defaults: addon_type=module, prices=0, is_metered=false, meter_price_per_unit=0, is_active=true, sort_order=0)
- updateAddonSchema (all fields optional)
- listSubscriptionsSchema (page/limit/status/billing_cycle/plan_id UUID/q)
- createSubscriptionSchema (requires plan_id UUID; defaults: status=trialing, billing_cycle=monthly, metadata={})
- updateSubscriptionSchema (all fields optional; cancelled_at nullable string, cancel_reason max 5000)
- listUsageMetersSchema (page/limit/meter_type/addon_id UUID/period_start/period_end YYYY-MM-DD)
- createUsageMeterSchema (requires meter_type, period_start, period_end; addon_id UUID nullable; defaults: quantity=0, overage_quantity=0, overage_cost=0)
- updateUsageMeterSchema (all fields optional)
- listBillingEventsSchema (page/limit/event_type/date_from/date_to YYYY-MM-DD)

---

## Module 48: Template Marketplace (V1 Foundation)

### Database Tables
- **marketplace_publishers**: Publisher profiles for template creators. Columns: user_id (UUID UNIQUE NOT NULL), publisher_type (builder/consultant/platform), display_name (VARCHAR 200), bio (TEXT), credentials (TEXT), website_url (TEXT), profile_image (TEXT), is_verified (BOOLEAN default false), total_installs (INT default 0), avg_rating (NUMERIC 3,2 default 0 CHECK 0-5), total_templates (INT default 0), revenue_share_pct (NUMERIC 5,2 default 70 CHECK 0-100), stripe_connect_id (VARCHAR 100). Global read access (no company_id, `USING (true)` RLS). updated_at trigger.
- **marketplace_templates**: Core template listings. Columns: publisher_id (FK marketplace_publishers CASCADE), publisher_type (builder/consultant/platform), template_type (estimate/schedule/checklist/contract/report/workflow/cost_code/selection/specification), name (VARCHAR 255), slug (VARCHAR 255 UNIQUE), description (TEXT), long_description (TEXT), screenshots/tags/region_tags/construction_tags (JSONB default []), price (NUMERIC 10,2 default 0 CHECK >= 0), currency (VARCHAR 10 default 'USD'), template_data (JSONB default {}), required_modules (JSONB default []), version (VARCHAR 20 default '1.0.0'), install_count/review_count (INT default 0), avg_rating (NUMERIC 3,2 default 0 CHECK 0-5), review_status (pending/approved/rejected), is_featured (BOOLEAN default false), is_active (BOOLEAN default true), created_by (UUID). Soft delete via deleted_at. Global read RLS. 12 indexes.
- **marketplace_template_versions**: Version history per template. Columns: template_id (FK marketplace_templates CASCADE), version (VARCHAR 20), changelog (TEXT), template_data (JSONB default {}), published_at (TIMESTAMPTZ default now()). UNIQUE(template_id, version). Global read RLS.
- **marketplace_installs**: Per-company install records. Columns: company_id, template_id (FK marketplace_templates), template_version (VARCHAR 20), installed_by (UUID), installed_at (TIMESTAMPTZ default now()), uninstalled_at (TIMESTAMPTZ), payment_id (UUID), payment_amount (NUMERIC 10,2). Tenant-scoped RLS. 7 indexes.
- **marketplace_reviews**: User reviews per template. Columns: company_id, template_id (FK marketplace_templates), user_id (UUID), rating (INT CHECK 1-5), title (VARCHAR 200), review_text (TEXT), publisher_response (TEXT), publisher_responded_at (TIMESTAMPTZ), is_verified_purchase (BOOLEAN default true), is_flagged (BOOLEAN default false). UNIQUE(company_id, template_id, user_id). Global read + tenant write RLS. 7 indexes.

### API Endpoints (9 route files under /api/v2/marketplace/)
- Publishers: GET list (filtered by publisher_type/is_verified/q, ordered by total_installs DESC), POST create (409 on duplicate user_id), GET :id (with templates_count), PUT :id (partial update)
- Templates: GET list (filtered by template_type/publisher_id/review_status/is_featured/is_free/min_rating/q, ordered by install_count DESC), POST create (slug validated, 409 on duplicate slug), GET :id (with versions_count/installs_count/reviews_count), PUT :id (partial update), DELETE :id (soft delete)
- Template Versions: GET :id/versions (ordered by published_at DESC), POST :id/versions (409 on duplicate version, auto-updates template version)
- Installs: GET list (tenant-scoped, filtered by template_id/template_type), POST create (validates template is active+approved, 403 if not), GET :id (tenant-scoped)
- Reviews: GET list (filtered by template_id/rating/is_verified_purchase), POST create (409 on duplicate review per user/template), GET :id, PUT :id (publisher_response auto-sets publisher_responded_at), DELETE :id (hard delete)

### Type System
- 3 type unions: PublisherType (3), TemplateType (9), ReviewStatus (3)
- 1 type alias: TemplateCategory = TemplateType
- 5 interfaces: MarketplacePublisher, MarketplaceTemplate, MarketplaceTemplateVersion, MarketplaceInstall, MarketplaceReview
- 4 constant arrays: PUBLISHER_TYPES, TEMPLATE_TYPES, REVIEW_STATUSES, TEMPLATE_CATEGORIES (same ref as TEMPLATE_TYPES)

### Validation Schemas (Zod)
- 3 enum schemas: publisherTypeEnum, templateTypeEnum, reviewStatusEnum
- listPublishersSchema (page/limit/publisher_type/is_verified with boolean preprocess/q)
- createPublisherSchema (requires user_id UUID, display_name; defaults: publisher_type=builder)
- updatePublisherSchema (all fields optional; revenue_share_pct 0-100, is_verified boolean)
- listTemplatesSchema (page/limit/template_type/publisher_id UUID/review_status/is_featured/is_free boolean preprocess/min_rating 0-5/q)
- createTemplateSchema (requires publisher_id UUID, template_type, name, slug; slug regex /^[a-z0-9]+(?:-[a-z0-9]+)*$/; defaults: publisher_type=builder, price=0, currency=USD, version=1.0.0, review_status=pending, is_featured=false, is_active=true, arrays=[], template_data={})
- updateTemplateSchema (all fields optional; slug regex validated when present)
- listTemplateVersionsSchema (page/limit, limit defaults to 50)
- createTemplateVersionSchema (requires version max 20; changelog nullable; defaults: template_data={})
- listInstallsSchema (page/limit/template_id UUID/template_type)
- createInstallSchema (requires template_id UUID, template_version; payment_id UUID nullable, payment_amount min 0 nullable)
- listReviewsSchema (page/limit/template_id UUID/rating 1-5 int/is_verified_purchase boolean preprocess)
- createReviewSchema (requires template_id UUID, rating 1-5 int; title max 200 nullable, review_text max 5000 nullable; defaults: is_verified_purchase=true)
- updateReviewSchema (all fields optional; rating 1-5 int, is_flagged boolean, publisher_response max 5000 nullable)

---

## Module 49: Platform Analytics (V1 Foundation)

### Database Tables
- **platform_metrics_snapshots**: Point-in-time platform/tenant metrics. Columns: company_id (UUID nullable, FK companies -- null for platform-wide), snapshot_date (DATE default CURRENT_DATE), metric_type (9 values: active_users/revenue/churn/nps/feature_adoption/storage_usage/api_calls/support_tickets/onboarding_completion), metric_value (NUMERIC 15,2 default 0), breakdown (JSONB default {}), period (4 values: daily/weekly/monthly/quarterly default daily), created_by (UUID FK users). RLS: company_id IS NULL OR company_id = get_current_company_id(). 8 indexes. updated_at trigger.
- **tenant_health_scores**: Per-company health and churn risk scoring. Columns: company_id (UUID NOT NULL FK companies), score_date (DATE default CURRENT_DATE), overall_score/adoption_score/engagement_score/satisfaction_score/growth_score (INT 0-100 default 0), risk_level (4 values: healthy/at_risk/churning/critical default healthy), churn_probability (NUMERIC 5,2 0-100 default 0), last_login_at (TIMESTAMPTZ nullable), active_users_count (INT default 0), feature_utilization (JSONB default {}), notes (TEXT nullable), created_by. RLS on company_id. 8 indexes. updated_at trigger.
- **feature_usage_events**: High-volume feature usage tracking. Columns: company_id (UUID NOT NULL FK companies), user_id (UUID FK users nullable), feature_key (VARCHAR 100 NOT NULL), event_type (3 values: page_view/action/api_call default action), metadata (JSONB default {}), session_id (UUID nullable). Append-only (no updated_at). RLS on company_id. 8 indexes.
- **ab_experiments**: A/B test definitions and results. Columns: company_id (UUID nullable FK companies -- null for platform-wide), name (VARCHAR 200), description (TEXT nullable), status (4 values: draft/active/paused/completed default draft), feature_key (VARCHAR 100 nullable), variants (JSONB default []), start_date/end_date (DATE nullable), sample_percentage (INT 1-100 default 100), results (JSONB default {}), created_by. RLS: company_id IS NULL OR company_id = get_current_company_id(). 7 indexes. updated_at trigger.
- **deployment_releases**: Release/deployment tracking (platform-wide, no company_id). Columns: version (VARCHAR 50), release_type (4 values: major/minor/patch/hotfix default minor), status (4 values: planned/in_progress/deployed/rolled_back default planned), description (TEXT nullable), changelog (TEXT nullable), deployed_at (TIMESTAMPTZ nullable), deployed_by (UUID FK users nullable), rollback_reason (TEXT nullable), affected_services (JSONB default []). RLS: USING (true) for global read. 6 indexes. updated_at trigger.

### API Endpoints (9 route files under /api/v2/analytics/)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v2/analytics/metrics | List snapshots filtered by metric_type/period/date_from/date_to/company_id. Paginated. Shows platform-wide (null) + own company. |
| POST | /api/v2/analytics/metrics | Create metric snapshot. Requires metric_type. Defaults: metric_value=0, period=daily, breakdown={}. Returns 201. |
| GET | /api/v2/analytics/metrics/:id | Get single metric snapshot. |
| PUT | /api/v2/analytics/metrics/:id | Update metric snapshot. |
| GET | /api/v2/analytics/health-scores | List health scores filtered by risk_level/min_score/max_score/date_from/date_to/q. Paginated. Searches notes. |
| POST | /api/v2/analytics/health-scores | Create health score. All scores default 0, risk_level=healthy. Returns 201. |
| GET | /api/v2/analytics/health-scores/:id | Get single health score. |
| PUT | /api/v2/analytics/health-scores/:id | Update health score. |
| GET | /api/v2/analytics/events | List events filtered by feature_key/event_type/user_id/session_id/date_from/date_to. Paginated (default limit=50). |
| POST | /api/v2/analytics/events | Record event. Requires feature_key. Defaults: event_type=action, metadata={}. Returns 201. |
| GET | /api/v2/analytics/experiments | List experiments filtered by status/feature_key/q. Shows platform-wide (null) + own company. Paginated. |
| POST | /api/v2/analytics/experiments | Create experiment. Requires name. Defaults: status=draft, sample_percentage=100, variants=[], results={}. Returns 201. |
| GET | /api/v2/analytics/experiments/:id | Get single experiment. |
| PUT | /api/v2/analytics/experiments/:id | Update experiment. |
| GET | /api/v2/analytics/releases | List releases filtered by release_type/status/q. Global read (no company filter). Paginated. |
| POST | /api/v2/analytics/releases | Create release. Requires version. Defaults: release_type=minor, status=planned, affected_services=[]. Returns 201. |
| GET | /api/v2/analytics/releases/:id | Get single release. |
| PUT | /api/v2/analytics/releases/:id | Update release. |

### Type System
- 7 type unions: MetricType (9), MetricPeriod (4), RiskLevel (4), EventType (3), ExperimentStatus (4), ReleaseType (4), ReleaseStatus (4)
- 5 interfaces: PlatformMetricsSnapshot, TenantHealthScore, FeatureUsageEvent, AbExperiment, DeploymentRelease
- 7 constant arrays: METRIC_TYPES, METRIC_PERIODS, RISK_LEVELS, EVENT_TYPES, EXPERIMENT_STATUSES, RELEASE_TYPES, RELEASE_STATUSES

### Validation Schemas (Zod)
- 7 enum schemas: metricTypeEnum, metricPeriodEnum, riskLevelEnum, eventTypeEnum, experimentStatusEnum, releaseTypeEnum, releaseStatusEnum
- listMetricsSnapshotsSchema (page/limit/metric_type/period/date_from/date_to YYYY-MM-DD/company_id UUID nullable)
- createMetricsSnapshotSchema (requires metric_type; defaults: metric_value=0, period=daily, breakdown={})
- updateMetricsSnapshotSchema (all fields optional)
- listHealthScoresSchema (page/limit/risk_level/min_score/max_score 0-100/date_from/date_to YYYY-MM-DD/q)
- createHealthScoreSchema (all optional with defaults: scores=0, risk_level=healthy, churn_probability=0, active_users_count=0, feature_utilization={})
- updateHealthScoreSchema (all fields optional; notes nullable)
- listFeatureEventsSchema (page/limit default 50/feature_key/event_type/user_id UUID/session_id UUID/date_from/date_to)
- createFeatureEventSchema (requires feature_key max 100 chars; defaults: event_type=action, metadata={})
- listExperimentsSchema (page/limit/status/feature_key/q)
- createExperimentSchema (requires name max 200; defaults: status=draft, sample_percentage=100, variants=[], results={})
- updateExperimentSchema (all fields optional; sample_percentage 1-100)
- listReleasesSchema (page/limit/release_type/status/q)
- createReleaseSchema (requires version max 50; defaults: release_type=minor, status=planned, affected_services=[])
- updateReleaseSchema (all fields optional)

---

## Module 01: Auth & Access Control (Make It Real — 2026-02-24)

### Database Migration Applied
- **companies table**: Added 16 columns — legal_name, email, phone, website, address, city, state, zip, logo_url, primary_color, subscription_tier (default 'trial'), subscription_status (default 'active'), trial_ends_at, permissions_mode (default 'open'), updated_at, deleted_at
- **users table**: Added 4 columns — last_login_at, preferences (JSONB), deleted_at, updated_at
- **roles table**: Created — id, company_id (FK), name, description, base_role (user_role enum), is_system, permissions (JSONB), field_overrides (JSONB), timestamps, deleted_at. Partial unique on (company_id, name) WHERE deleted_at IS NULL. RLS: select=same company, insert/update=owner/admin only.
- **auth_audit_log table**: Created — id, company_id (FK), user_id (FK nullable), event_type, ip_address, user_agent, metadata (JSONB), created_at. RLS: select=owner/admin, inserts via service role only.
- **user_invitations table**: Created — id, company_id (FK), email, name, role (user_role enum), token_hash (unique), expires_at (default 7 days), accepted_at, revoked_at, invited_by (FK), timestamps. RLS: select=owner/admin, insert=owner/admin/pm, update=owner/admin. Token lookup function `get_invitation_by_token()`.
- **project_user_roles table**: Created — id, company_id (FK), user_id (FK), job_id (FK), role_id (FK nullable), role_override (user_role), granted_by (FK), created_at. UNIQUE(user_id, job_id). Infrastructure only, not enforced v1.
- **prevent_company_id_change()**: Trigger function created, attached to users, roles, user_invitations, project_user_roles.
- **updated_at triggers**: Attached to companies, users, roles, user_invitations.

### Signup Route Changes (`/api/v1/auth/signup`)
- Company insert now includes: permissions_mode='open', subscription_tier='trial', subscription_status='active', trial_ends_at (14 days from now)
- After creating user profile: inserts user_company_memberships row (auth_user_id, company_id, role=owner, status=active)
- Seeds 7 system roles for the company: Owner, Admin, PM, Superintendent, Office, Field, Read Only
- Logs signup event to auth_audit_log with IP + user agent

### Login Route Changes (`/api/v1/auth/login`)
- Failed login audit: now looks up user by email to get company_id (was using sentinel UUID that would fail FK). Wrapped in try/catch to avoid blocking login response.
- Successful login: updates last_login_at and inserts auth_audit_log entry (both worked already, but columns/table now exist)

### Me Route Changes (`/api/v1/auth/me`)
- Reads permissions_mode directly from companies.permissions_mode column instead of nested settings JSON

### Settings > Users Page (already wired)
- UserTable component fetches from GET /api/v1/users with search, role filter, status filter, pagination
- Fixed pagination: reads `data.pagination.total` instead of non-existent `totalCount`
- InviteUserModal POSTs to /api/v1/users
- EditUserModal GETs /api/v1/users/:id and PATCHes
- Deactivate/Reactivate via POST /api/v1/users/:id/deactivate and /reactivate

### Settings > Roles Page (already wired)
- Fetches GET /api/v1/roles — splits into system (read-only with lock icon) vs custom (editable)
- RoleModal creates/edits via POST/PATCH /api/v1/roles and /api/v1/roles/:id
- Delete via DELETE /api/v1/roles/:id (soft delete, sets deleted_at)

### API Endpoints (all existed, now functional with DB)
| Method | Path | Behavior |
|--------|------|----------|
| GET | /api/v1/users | List users for company. Filters: search (name/email ilike), role, status (active/inactive/all). Paginated. |
| POST | /api/v1/users | Invite user. Creates user_invitations row + sends email. Checks for existing user/pending invite. |
| GET | /api/v1/users/:id | Get single user by ID. Scoped to company. |
| PATCH | /api/v1/users/:id | Update user (name, phone, avatar_url, role). Self-update cannot change role. Non-admin can only update self. |
| POST | /api/v1/users/:id/deactivate | Soft-deactivate: is_active=false, deleted_at=now. Cannot deactivate self or last owner. |
| POST | /api/v1/users/:id/reactivate | Reactivate: is_active=true, deleted_at=null. |
| GET | /api/v1/roles | List roles. Returns system + custom roles sorted by hierarchy. Paginated. |
| POST | /api/v1/roles | Create custom role. Requires name, base_role. Permissions + field_overrides optional. |
| GET | /api/v1/roles/:id | Get single role. |
| PATCH | /api/v1/roles/:id | Update custom role. System roles return 403. |
| DELETE | /api/v1/roles/:id | Soft-delete custom role. System roles return 403. |

## Error Handling Fix + E2E Tests + Detail Pages (2026-02-25)

### Error Handling — 101 files fixed
- Changed `err instanceof Error ? err.message :` → `(err as Error)?.message ||` across all create/edit forms
- Supabase PostgrestError objects have `.message` but are NOT `instanceof Error`, so errors were silently swallowed
- Affects: all `new/page.tsx` create forms, all `[id]/page.tsx` detail pages, all settings pages

### Top-Level Detail Pages Added
- **Selection Category Detail** (`/library/selections/[id]`) — View/edit `selection_categories` table. Fields: name, room, sort_order, pricing_model, allowance_amount, deadline, lead_time_buffer_days, status, designer_access, notes. Archive via deleted_at.
- **Time Clock Detail** (`/time-clock/[id]`) — View/edit `time_entries` table. Fields: entry_date, clock_in/out, regular/overtime hours, status, break_minutes, notes. Delete (no soft delete).

### List Pages Wired (final 3)
- **Proposals** (`/proposals`) — Card items wrapped in `<Link href="/estimates/${est.id}">` with hover ring
- **Library Selections** (`/library/selections`) — Category divs wrapped in `<Link href="/library/selections/${cat.id}">` with hover bg
- **Time Clock** (`/time-clock`) — Entry divs wrapped in `<Link href="/time-clock/${entry.id}">` with hover bg

### E2E Tests Added (5 files, 66 tests)
- `tests/e2e/detail-pages.spec.ts` — 8 tests for new detail pages (daily-logs, rfis, change-orders, draws, permits, warranties, time-clock, job-edit)
- `tests/e2e/detail-pages-batch2.spec.ts` — 11 tests for batch 7-10 detail pages
- `tests/e2e/detail-pages-batch3.spec.ts` — 12 tests for top-level detail pages (contact, cost-code, equipment, etc.)
- `tests/e2e/create-forms.spec.ts` — 31 tests for all create forms (13 top-level + 18 job-level)
- `tests/e2e/crud-flow.spec.ts` — 4 CRUD flow tests (create daily log, create RFI, edit daily log, edit job)

---

## Broken-Link Pages + Dashboard/Training CRUD + E2E Fixes (2026-02-25)

### Dashboard Detail Page (`/dashboards/[id]`)
- **View mode**: displays description, report type, visualization type, audience, refresh frequency, created/updated dates
- **Edit mode**: inline form with all fields editable (title, description, report_type, visualization, audience, refresh_frequency)
- **Archive**: confirmation dialog, soft delete via `deleted_at = now()`, redirects to `/dashboards`
- **Back link**: `/dashboards`

### Dashboards List (`/dashboards`) -- Updated
- List items are now clickable `<Link>` elements pointing to `/dashboards/[id]`
- Hover styling on rows

### Training Create Page (`/training/new`)
- **Form fields**: title (text, required), description (textarea), content_url (text), course_type (select: video/article/interactive/quiz), difficulty (select: beginner/intermediate/advanced), duration_minutes (number), category (text), is_published (checkbox toggle)
- **On submit**: inserts into `training_courses`, redirects to `/training`
- **Cancel**: links back to `/training`

### Training List (`/training`) -- Updated
- Added "New Course" button linking to `/training/new`

### Bids CRUD Pages
- **`/bids/new`** -- Create bid package form. Inserts into `bid_packages` table.
- **`/bids/[id]`** -- Bid package detail/edit/archive page. View mode shows all fields with status badge. Edit mode has inline form. Archive via soft delete.

### Support CRUD Pages
- **`/support/new`** -- Create support ticket form. Inserts into `support_tickets` table.
- **`/support/[id]`** -- Support ticket detail/edit/archive page. View mode shows all fields with priority badge. Edit mode has inline form. Archive via soft delete.

### Warranty Claims CRUD Pages
- **`/warranty-claims/new`** -- Create warranty claim form. Inserts into `warranty_claims` table.
- **`/warranty-claims/[id]`** -- Warranty claim detail/edit/archive page. View mode shows all fields with status badge. Edit mode has inline form. Archive via soft delete.

### E2E Test Fixes
- **Daily log create test**: date generation changed from bit-shift on `Date.now()` (caused overflow producing invalid years like 47364) to `Math.random()` with year range 1900-1999. Adds hydration wait before form fill.
- **RFI create test**: `rfi_number` field now generates values that fit within `varchar(20)` column limit (was exceeding it with timestamp-based values).
- **Result**: 78/78 E2E tests now pass.

---

## Soft Delete Compliance & Archive Buttons (2026-02-25)

### Search UI Added to List Pages
- **Bids** (`/bids`) — Search input filters `bid_packages` by title (ilike)
- **RFIs** (`/rfis`) — Search input filters `rfis` by subject (ilike)

### Archive Buttons Added to 7 Detail Pages
- **Contacts Detail** (`/contacts/[id]`) — Archive button: sets `deleted_at = now()` on `contacts` table, confirm dialog, redirects to `/contacts`
- **Email Marketing Detail** (`/email-marketing/[id]`) — Archive button: sets `deleted_at = now()` on `email_campaigns` table, confirm dialog, redirects to `/email-marketing`
- **Chart of Accounts Detail** (`/financial/chart-of-accounts/[id]`) — Archive button: sets `deleted_at = now()` on `chart_of_accounts` table, confirm dialog, redirects to `/financial/chart-of-accounts`
- **Journal Entries Detail** (`/financial/journal-entries/[id]`) — Archive button: sets `deleted_at = now()` on `journal_entries` table, confirm dialog, redirects to `/financial/journal-entries`
- **Invoices Detail** (`/invoices/[id]`) — Archive button: sets `deleted_at = now()` on `invoices` table, confirm dialog, redirects to `/invoices`
- **Legal Detail** (`/legal/[id]`) — Archive button: sets `deleted_at = now()` on `legal_documents` table, confirm dialog, redirects to `/legal`
- **Library Templates Detail** (`/library/templates/[id]`) — Archive button: sets `deleted_at = now()` on `estimate_templates` table, confirm dialog, redirects to `/library/templates`

### Hard Delete → Soft Delete (3 Pages)
- **Compliance Lien Law Detail** (`/compliance/lien-law/[id]`) — Changed `.delete().eq('id')` to `.update({ deleted_at: new Date().toISOString() }).eq('id')` on `lien_waivers` table
- **Time Clock Detail** (`/time-clock/[id]`) — Changed `.delete().eq('id')` to `.update({ deleted_at: new Date().toISOString() }).eq('id')` on `time_entries` table
- **Job Budget Line Detail** (`/jobs/[id]/budget/[lineId]`) — Changed `.delete().eq('id')` to `.update({ deleted_at: new Date().toISOString() }).eq('id')` on `budget_lines` table

### Status-Only Archive → Proper deleted_at (4 Pages)
- **Compliance Insurance Detail** (`/compliance/insurance/[id]`) — Changed from setting `status = 'archived'` to setting `deleted_at = now()` on `insurance_policies` table
- **Compliance Licenses Detail** (`/compliance/licenses/[id]`) — Changed from setting `status = 'archived'` to setting `deleted_at = now()` on `licenses` table
- **Job Invoices Detail** (`/jobs/[id]/invoices/[invoiceId]`) — Changed from setting `status = 'archived'` to setting `deleted_at = now()` on `invoices` table
- **Job Inspections Detail** (`/jobs/[id]/inspections/[inspectionId]`) — Changed from setting `status = 'archived'` to setting `deleted_at = now()` on `inspections` table

### Edit + Archive Added to Training Detail
- **Training Detail** (`/training/[id]`) — Was read-only. Now has edit mode (inline form with title, description, content_url, course_type, difficulty, duration_minutes, category, is_published) and archive button (soft delete via `deleted_at`).

### Archive Job Button Added
- **Job Detail** (`/jobs/[id]`) — New `ArchiveJobButton` client component. Sets `deleted_at = now()` on `jobs` table, confirm dialog, redirects to `/jobs`.

### deleted_at Filter Added to 44 List Pages
All list pages now filter out archived records with `.is('deleted_at', null)` in their Supabase queries.

**29 Top-Level List Pages:**
`/bids`, `/change-orders`, `/clients`, `/communications`, `/compliance/insurance`, `/compliance/lien-law`, `/compliance/licenses`, `/contacts`, `/daily-logs`, `/dashboards`, `/draws`, `/email-marketing`, `/equipment`, `/estimates`, `/financial/chart-of-accounts`, `/financial/journal-entries`, `/invoices`, `/legal`, `/library/selections`, `/library/templates`, `/notifications`, `/permits`, `/proposals`, `/rfis`, `/submittals`, `/support`, `/time-clock`, `/training`, `/warranty-claims`

**15 Job-Scoped List Pages:**
`/jobs/[id]/budget`, `/jobs/[id]/change-orders`, `/jobs/[id]/clients`, `/jobs/[id]/daily-logs`, `/jobs/[id]/documents`, `/jobs/[id]/draws`, `/jobs/[id]/inspections`, `/jobs/[id]/invoices`, `/jobs/[id]/materials`, `/jobs/[id]/permits`, `/jobs/[id]/photos`, `/jobs/[id]/punch-list`, `/jobs/[id]/rfis`, `/jobs/[id]/schedule`, `/jobs/[id]/selections`

### E2E Test Fix
- **create-forms.spec.ts** — Added `waitForFunction(() => document.readyState === 'complete')` before visibility checks to prevent hydration race conditions.

---

## Multi-Tenancy Security Fixes (2026-02-25)

### 7 Detail Page Dropdown Tenant Isolation Fixes
These detail pages loaded dropdown/select data (jobs, vendors, clients, etc.) WITHOUT filtering by `company_id`, meaning users could see other tenants' data in dropdown menus:

- **`/financial/receivables/[id]`** — Dropdown queries now filter by `company_id`
- **`/financial/payables/[id]`** — Dropdown queries now filter by `company_id`
- **`/purchase-orders/[id]`** — Dropdown queries now filter by `company_id`
- **`/compliance/safety/[id]`** — Dropdown queries now filter by `company_id`
- **`/compliance/insurance/[id]`** — Dropdown queries now filter by `company_id`
- **`/punch-lists/[id]`** — Dropdown queries now filter by `company_id`
- **`/financial/journal-entries/[id]`** — Dropdown queries now filter by `company_id`

### 11 SSR Pages — Defense-in-Depth company_id Filtering
These pages relied solely on RLS for tenant isolation. Added explicit `company_id` filtering at the application layer (28 queries total):

- **`/dashboard`** — All dashboard aggregate queries now filter by `company_id`
- **`/financial/dashboard`** — Financial summary queries filter by `company_id`
- **`/cash-flow`** — Cash flow queries filter by `company_id`
- **`/business-management`** — Management queries filter by `company_id`
- **`/compliance/safety`** — Safety records filter by `company_id`
- **`/hr`** — HR/employee queries filter by `company_id`
- **`/legal`** — Legal document queries filter by `company_id`
- **`/library/templates`** — Template queries filter by `company_id`
- **`/library/selections`** — Selection queries filter by `company_id`
- **`/marketing`** — Marketing data queries filter by `company_id`
- **`/post-build`** — Post-build queries filter by `company_id`

### 5 Create Form Data Integrity Fixes
- **`/draw-requests/new`** — Job selector now filters by `company_id` (was loading all jobs)
- **`/lien-law/new`** — Form wrapper and dropdowns now filter by `company_id`
- **`/training/new`** — Added `company_id` guard (prevents insert without tenant context)
- **`/inventory/new`** — Tenant filter added to all dropdown/reference queries
- **`/schedule/new`** — `created_by` field now properly set from auth user

### 7 Empty State CTAs Added
These list pages previously showed a blank/generic empty state. Now display a call-to-action button linking to the create page:

- **`/invoices`** — Empty state CTA links to `/invoices/new`
- **`/rfis`** — Empty state CTA links to `/rfis/new`
- **`/bids`** — Empty state CTA links to `/bids/new`
- **`/submittals`** — Empty state CTA links to `/submittals/new`
- **`/financial/journal-entries`** — Empty state CTA links to `/financial/journal-entries/new`
- **`/financial/payables`** — Empty state CTA links to `/financial/payables/new`
- **`/financial/receivables`** — Empty state CTA links to `/financial/receivables/new`

---

## Defense-in-Depth: Company ID Filtering Across All Pages (2026-02-25)

### 51 SSR List Pages — company_id Defense-in-Depth Filtering
Every SSR entity list page now includes an explicit `.eq('company_id', companyId)` filter at the application layer alongside Supabase RLS. This covers all entity types: jobs, invoices, contacts, vendors, clients, daily logs, RFIs, bids, submittals, change orders, purchase orders, draw requests, lien waivers, budgets, cost codes, schedules, punch lists, safety incidents, equipment, warranties, permits, inspections, HR records, inventory, training, selections, contracts, leads, and all financial list views. The query pattern is: get authenticated user → resolve `company_id` from profile → pass `company_id` as explicit filter on every Supabase `.select()` call.

### 32 Client-Side Detail Pages — company_id Ownership Verification
All client-side detail/edit pages (`/[entity]/[id]`) now verify that the fetched record's `company_id` matches the authenticated user's `company_id` before rendering. This prevents cross-tenant access via URL manipulation (e.g., guessing another tenant's record UUID). If ownership check fails, the page shows "Not found" rather than leaking data. Affected pages include detail views for: jobs, invoices, contacts, vendors, clients, daily-logs, rfis, bids, submittals, change-orders, purchase-orders, draw-requests, lien-waivers, punch-lists, safety, insurance, equipment, warranties, permits, inspections, hr, inventory, training, selections, contracts, leads, financial/payables, financial/receivables, financial/journal-entries, and related sub-entity pages.

### NaN Guard on Financial Create Forms
- **`/financial/payables/new`** — Amount field parsing now guards against `NaN` (uses `parseFloat` with fallback to `0` or validation error)
- **`/financial/receivables/new`** — Same NaN guard applied to amount parsing

---

## Cash Flow & Revenue Pages — Placeholder-to-Real Conversion (2026-02-25)

### `/financial/cash-flow` — Cash Flow Overview (rewritten)
- SSR page with auth + company_id tenant filtering
- Queries `ar_invoices` (paid vs pending amounts) and `ap_bills` (paid vs pending balance_due) in parallel
- 4 KPI cards: Total Receivable (green), Total Payable (red), Cash Position (Receivable - Payable, color-coded), Total Collected (with paid-out subtitle)
- Overdue counts shown as amber badges on AR/AP cards when overdue items exist
- Recent Cash Movements section: last 10 paid AR invoices ordered by updated_at desc, each with invoice number, relative date, amount, and "Paid" badge
- Empty state when no paid invoices exist

### `/revenue` — Revenue Hub (rewritten from placeholder)
- SSR page with auth + company_id tenant filtering
- Queries paid `ar_invoices` for total revenue, accepted `estimates` for pipeline value, AR invoice count
- 4 KPI cards: Total Revenue (paid invoices), Pipeline Value (accepted estimates), Average Invoice (revenue / paid count), Invoice Count (all invoices)
- Navigation grid with 4 sub-page cards linking to: attribution, employee, bonuses, formulas
- Each nav card has icon, title, description, and arrow indicator

### `/revenue/attribution` — Revenue by Job (rewritten from placeholder)
- SSR page with auth + company_id tenant filtering
- Queries paid `ar_invoices` with job join, aggregates revenue by job_id client-side
- Shows top 5 jobs by revenue with rank number, job name, job number, amount, and percentage bar
- Quick links to `/invoices` and `/jobs`
- Empty state when no paid invoices exist

### `/revenue/employee` — Team Overview (rewritten from placeholder)
- SSR page with auth + company_id tenant filtering
- Queries `employees` count and `time_entries` for regular_hours/overtime_hours sums
- 4 KPI cards: Total Employees, Regular Hours, Overtime Hours, Total Hours
- Labor Breakdown section with visual progress bars showing regular vs overtime percentage
- Quick links to `/hr` and `/time-clock`
- Empty state when no time entries exist

### `/revenue/bonuses` — Redirect to `/hr`
- Replaced placeholder with `redirect('/hr')` — bonus tracking is part of HR module

### `/revenue/formulas` — Redirect to `/cost-codes`
- Replaced placeholder with `redirect('/cost-codes')` — formulas relate to cost code calculations

### `/api-marketplace` — Minor text fix
- Already had real data fetching from `integration_listings` table
- Removed "coming soon" text from empty state, replaced with neutral "Check back later" language
