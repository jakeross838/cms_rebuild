# Test Matrix — Auto-Generated from Feature Map
<!-- This is automatically rebuilt every time the feature map updates -->
<!-- The CMS tester reads this to know exactly what to test -->
<!-- Last updated: 2026-02-23 -->
<!-- Source: last-scan.json — 320 files, 227 with elements, 3233 total elements -->
<!-- DB tables: jobs, invoices, draws, users, auth_audit_log, companies, roles, api_metrics, audit_log -->
<!-- TODOs in codebase: 193 -->

## Module 06 — Document Storage Tests (2026-02-23)

### Acceptance Tests (`tests/acceptance/06-document-storage.acceptance.test.ts`) — 40 tests
- [x] DocumentStatus has 5 values
- [x] DocumentType has 14 document types
- [x] ExtractionStatus has 4 values
- [x] Document interface has all required fields
- [x] DocumentFolder interface has all required fields
- [x] DocumentVersion interface has all required fields
- [x] CompanyDocumentSettings has folder_templates and retention_policy
- [x] CompanyStorageUsage tracks bytes and quota
- [x] BLOCKED_EXTENSIONS includes dangerous file types
- [x] MAX_FILE_SIZE_BYTES is 500 MB
- [x] MAX_SIMULTANEOUS_UPLOADS is 20
- [x] DOCUMENT_TYPES has 14 entries with value and label
- [x] DEFAULT_FOLDER_TEMPLATE has 14 folders
- [x] STORAGE_BUCKET is defined
- [x] SIGNED_URL_EXPIRY_SECONDS is 1 hour
- [x] documentStatusEnum accepts all 5 statuses
- [x] documentTypeEnum accepts all 14 types
- [x] documentTypeEnum rejects invalid type
- [x] listDocumentsSchema accepts valid params
- [x] listDocumentsSchema rejects limit > 100
- [x] uploadDocumentSchema accepts valid upload
- [x] uploadDocumentSchema requires filename, mime_type, file_size
- [x] uploadDocumentSchema rejects file_size > 500MB
- [x] updateDocumentSchema accepts partial updates
- [x] createFolderSchema requires name
- [x] createVersionSchema accepts valid version
- [x] setExpirationSchema requires valid date format
- [x] addTagSchema requires non-empty tag
- [x] updateDocumentSettingsSchema accepts folder templates
- [x] updateDocumentSettingsSchema accepts retention policy
- [x] validateFile rejects blocked extensions
- [x] validateFile accepts valid files
- [x] validateFile rejects oversized files
- [x] validateFile rejects zero-size files
- [x] getFileExtension extracts correctly
- [x] buildStoragePath creates correct structure
- [x] buildStoragePath uses _company when no job
- [x] buildStoragePath sanitizes filenames
- [x] getMimeCategory categorizes correctly
- [x] formatFileSize formats correctly

---

## Module 05 — Notification Engine Tests (2026-02-23)

### Acceptance Tests (`tests/acceptance/05-notification-engine.acceptance.test.ts`) — 27 tests
- [x] NotificationUrgency has 4 levels: low, normal, high, critical
- [x] NotificationCategory has 6 values
- [x] NotificationChannel has 4 values: in_app, email, sms, push
- [x] DeliveryStatus has 3 values: pending, delivered, failed
- [x] DigestFrequency has 3 values: hourly, twice_daily, daily
- [x] Database types exist for all 6 notification tables
- [x] Notification Row has all required fields
- [x] NotificationEventType Row has all required fields
- [x] listNotificationsSchema accepts valid params
- [x] listNotificationsSchema rejects invalid category
- [x] listNotificationsSchema coerces page/limit to numbers
- [x] emitNotificationSchema accepts valid notification
- [x] emitNotificationSchema requires title, event_type, category, recipient_user_ids
- [x] emitNotificationSchema rejects empty recipient list
- [x] updatePreferencesSchema accepts valid preferences array
- [x] updatePreferencesSchema rejects invalid category
- [x] updateSettingsSchema accepts valid quiet hours settings
- [x] updateSettingsSchema accepts partial settings updates
- [x] updateSettingsSchema rejects invalid digest frequency
- [x] updateSettingsSchema validates quiet time format
- [x] NOTIFICATION_CATEGORIES has 6 categories
- [x] Each category has value, label, and defaultChannels
- [x] All categories include in_app as default channel
- [x] NOTIFICATION_CHANNELS has 4 channels
- [x] emitNotification function exists and is async
- [x] EmitOptions interface requires companyId, eventType, category, title, recipientUserIds
- [x] categoryIcons maps all 6 categories to Lucide icons

---

## Module 04 — Global Search Tests (2026-02-23)

### Acceptance Tests (`tests/acceptance/04-search.acceptance.test.ts`) — 21 tests
- [x] Accepts valid query with 2+ chars
- [x] Rejects query < 2 chars
- [x] Rejects query > 200 chars
- [x] Parses types CSV into array
- [x] Rejects invalid entity types
- [x] Default limit = 5
- [x] Rejects limit > 20
- [x] SearchEntityType covers jobs, clients, vendors, invoices
- [x] SearchResult has required fields
- [x] SearchResponse groups results by entity
- [x] Includes create actions for jobs, clients, vendors
- [x] Includes navigation actions derived from nav config
- [x] Each action has id, label, href, category, keywords
- [x] No duplicate action IDs
- [x] Create actions have category = create
- [x] Filters actions by query keyword
- [x] Stores up to 10 items (recent searches)
- [x] Deduplicates entries with most recent first
- [x] Trims whitespace
- [x] Rejects terms under 2 chars
- [x] clearRecentSearches empties the store

---

## Module 02 — Config Engine Tests (2026-02-23)

### Acceptance Tests (`tests/acceptance/02-config-engine.acceptance.test.ts`) — 30 tests
- [x] 18+ feature flag definitions exist
- [x] Every flag has key, name, description, category
- [x] All flag keys are unique
- [x] Flags span 5 categories: ai, integrations, portals, features, advanced
- [x] getFeatureFlagDefinitions groups flags by category
- [x] Known flags exist: ai_invoice_processing, client_portal, quickbooks_sync
- [x] Plan hierarchy: all flags have valid plan requirements
- [x] 35+ default terminology terms
- [x] Every term has singular and plural
- [x] Known terms exist: job, client, vendor, invoice, estimate
- [x] Job term defaults to "Job" / "Jobs"
- [x] Change order term defaults to "Change Order" / "Change Orders"
- [x] 8 entity type numbering defaults exist
- [x] Each default has pattern, scope, and padding
- [x] validatePattern accepts valid patterns
- [x] validatePattern rejects patterns without sequence token
- [x] validatePattern rejects patterns with invalid tokens
- [x] validatePattern rejects empty patterns
- [x] Platform defaults for all 7 config sections
- [x] Financial defaults include all 6 required fields
- [x] Regional defaults: timezone, date_format, currency, measurement_system
- [x] AI defaults include auto_match_confidence = 85
- [x] Notification defaults include digest_frequency = daily
- [x] getPlatformDefault returns individual values
- [x] getPlatformDefault returns undefined for unknown keys
- [x] Config barrel exports company route functions
- [x] Config barrel exports feature-flags route functions
- [x] Config barrel exports terminology route functions
- [x] Config barrel exports numbering route functions
- [x] validatePattern works through barrel re-export

---

## Module 03 — Core Data Model Tests (2026-02-23)

### Acceptance Tests (`tests/acceptance/03-core-data-model.acceptance.test.ts`) — 43 tests
- [ ] All 4 entity types have `deleted_at` field (soft delete)
- [ ] JobStatus enum includes all 8 states (lead, pre_construction, active, on_hold, completed, warranty, closed, cancelled)
- [ ] ProjectType enum includes all 6 types
- [ ] CostCodeCategory enum includes all 5 categories
- [ ] createJobSchema: accepts valid minimal/full, rejects missing name, invalid status/contract_type/project_type/client_id, negative amounts
- [ ] updateJobSchema: accepts empty (all optional), partial updates
- [ ] listJobsSchema: defaults page=1/limit=20/sortBy=updated_at, validates status filter
- [ ] createClientSchema: accepts valid minimal/full, rejects missing name, invalid email
- [ ] createVendorSchema: accepts valid minimal/full, rejects missing name, invalid website/amounts
- [ ] createCostCodeSchema: accepts valid minimal/full, rejects missing code/division/name, invalid category
- [ ] All update schemas accept empty objects (partial)
- [ ] Job type has 35+ columns matching migration (description, latitude, longitude, project_type, budget_total, etc.)
- [ ] Client type has 20+ columns matching migration (company_name, mobile_phone, spouse fields, portal_enabled, etc.)
- [ ] Vendor type has 28+ columns matching migration (dba_name, trades[], license/insurance fields, is_1099, etc.)
- [ ] CostCode type has 16+ columns matching migration (division, subdivision, trade, parent_id, is_default, etc.)

---

## How This Works

Every element in the feature map gets test cases auto-generated:
- **Button** -> Click it, verify the expected result happened
- **Form** -> Fill with valid data (submit), fill with invalid data (verify error)
- **Toggle** -> Flip on, verify state, flip off, verify reverted
- **Link** -> Click, verify navigation
- **Modal** -> Open, test contents, close via X / outside click / Escape
- **Table** -> Sort each column, paginate, search, click rows
- **DB write** -> Verify row exists in Supabase with correct values
- **Sync** -> Verify both sides match after action

### Priority Legend
- **P-CRIT** = Critical path, blocks everything else
- **P-MED** = Important but not blocking
- **P-LOW** = Nice to have, test when time allows

### Testability Legend
- **TESTABLE** = Can test right now with current codebase
- **NEEDS-BE** = Needs backend/API routes built first
- **FUTURE** = Not built yet, planned for future phase

---

## 1. Authentication & Session (REAL — Wired to Supabase)

> These are the ONLY pages with real database operations today.
> Login page: `src/app/login/page.tsx`
> Auth APIs: `src/app/api/v1/auth/login/`, `logout/`, `me/`

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| A-01 | Login page renders | Navigate to `/login` | Card with email/password fields, "Sign in" button, "Ross Built CMS" title | — | P-CRIT | TESTABLE |
| A-02 | Login with valid credentials | Enter valid email + password, click "Sign in" | Redirect to `/dashboard`, session cookie set | `auth_audit_log` has login event | P-CRIT | TESTABLE |
| A-03 | Login with invalid password | Enter valid email + wrong password, click "Sign in" | Error message displayed: Supabase auth error text | No session created | P-CRIT | TESTABLE |
| A-04 | Login with empty fields | Click "Sign in" with empty fields | HTML5 required validation fires (fields have `required`) | No request sent | P-CRIT | TESTABLE |
| A-05 | Login with invalid email format | Enter "notanemail" + password, submit | HTML5 email validation fires | No request sent | P-MED | TESTABLE |
| A-06 | Login loading state | Click "Sign in" with valid creds | Button shows spinner + "Signing in...", inputs become disabled | — | P-MED | TESTABLE |
| A-07 | Login double-click prevention | Double-click "Sign in" rapidly | Only one auth request sent (button disabled during loading) | Only one audit log entry | P-MED | TESTABLE |
| A-08 | Session persistence | Login, close tab, reopen `/dashboard` | Still authenticated, not redirected to login | — | P-CRIT | TESTABLE |
| A-09 | Session expiry | Wait for session timeout (or manually clear cookie) | Redirected to `/login` on next navigation | — | P-MED | TESTABLE |
| A-10 | Logout | Call `/api/v1/auth/logout` | Session cleared, redirected to `/login` | — | P-CRIT | TESTABLE |
| A-11 | Auth middleware protection | Visit `/dashboard` without session | Redirected to `/login` | — | P-CRIT | TESTABLE |
| A-12 | Skeleton pages bypass auth | Visit `/skeleton/jobs` without session | Page loads (no auth required for skeleton) | — | P-MED | TESTABLE |
| A-13 | `/api/v1/auth/me` returns user | GET `/api/v1/auth/me` with valid session | Returns user object with id, email, role | — | P-CRIT | TESTABLE |
| A-14 | Login SQL injection attempt | Enter `' OR 1=1 --` as email | Supabase rejects, error shown, no bypass | No unauthorized access | P-CRIT | TESTABLE |
| A-15 | Login XSS attempt | Enter `<script>alert(1)</script>` as email | Input sanitized/escaped, no script execution | — | P-MED | TESTABLE |

---

## 2. Authenticated Dashboard (REAL — Reads from Supabase)

> Route: `src/app/(authenticated)/dashboard/page.tsx`
> DB reads: jobs, invoices, draws (counts + recent list)

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| D-01 | Dashboard loads with data | Navigate to `/dashboard` (logged in) | Stats grid (Active Jobs, Pending Invoices, Pending Draws, Revenue), Recent Jobs list | — | P-CRIT | TESTABLE |
| D-02 | Dashboard empty state | Login with user who has no jobs | "No jobs yet" message with "Create your first job" link | — | P-MED | TESTABLE |
| D-03 | Stats card: Active Jobs | Click "Active Jobs" card | Navigates to `/jobs?status=active` | — | P-MED | TESTABLE |
| D-04 | Stats card: Pending Invoices | Click "Pending Invoices" card | Navigates to `/invoices?status=pending` | — | P-MED | TESTABLE |
| D-05 | Stats card: Pending Draws | Click "Pending Draws" card | Navigates to `/draws?status=pending` | — | P-MED | TESTABLE |
| D-06 | Stats card: Revenue | Click "Revenue" card | Navigates to `/reports/cash-flow` | — | P-LOW | TESTABLE |
| D-07 | Recent Jobs list | View recent jobs section | Shows up to 5 most recently updated jobs with client name, status badge | `jobs` query orders by `updated_at desc limit 5` | P-MED | TESTABLE |
| D-08 | Recent Jobs: click job | Click a job in recent list | Navigates to `/jobs/{job.id}` | — | P-MED | TESTABLE |
| D-09 | "View all" jobs link | Click "View all" in Recent Jobs header | Navigates to `/jobs` | — | P-LOW | TESTABLE |
| D-10 | Pending invoices action | Click pending invoices action card (if count > 0) | Navigates to `/invoices?status=pending` | — | P-MED | TESTABLE |
| D-11 | Revenue displays $0 | Check "This Month Revenue" stat | Shows `$0.00` (TODO: not yet calculated) | — | P-LOW | TESTABLE |

---

## 3. Authenticated Jobs List (REAL — Reads from Supabase)

> Route: `src/app/(authenticated)/jobs/page.tsx`
> DB reads: jobs with clients join, supports status filter + search

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| J-01 | Jobs list loads | Navigate to `/jobs` | Page with header "Jobs", "New Job" button, status filter tabs, search input | — | P-CRIT | TESTABLE |
| J-02 | Jobs list shows data | Load with jobs in DB | Job cards/rows with name, client, status badge, contract amount, dates | `jobs` table has rows | P-CRIT | TESTABLE |
| J-03 | Jobs list empty state | Load with no jobs | Empty state message | `jobs` table empty for company | P-MED | TESTABLE |
| J-04 | Status filter: All | Click "All Jobs" tab | Shows all jobs regardless of status | — | P-MED | TESTABLE |
| J-05 | Status filter: Active | Click "Active" tab | URL updates to `?status=active`, only active jobs shown | — | P-MED | TESTABLE |
| J-06 | Status filter: Pre-Construction | Click "Pre-Construction" tab | URL updates to `?status=pre_construction` | — | P-MED | TESTABLE |
| J-07 | Status filter: Completed | Click "Completed" tab | Only completed jobs shown | — | P-MED | TESTABLE |
| J-08 | Search jobs | Type "Smith" in search field, submit | Only jobs matching name or job_number shown | — | P-MED | TESTABLE |
| J-09 | Search no results | Search for "zzzznonexistent" | Empty results, appropriate message | — | P-LOW | TESTABLE |
| J-10 | "New Job" button | Click "New Job" | Navigates to `/jobs/new` | — | P-CRIT | TESTABLE |

---

## 4. Create New Job (REAL — Writes to Supabase)

> Route: `src/app/(authenticated)/jobs/new/page.tsx`
> DB writes: jobs table (insert)
> DB reads: users table (company_id lookup)

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| NJ-01 | New Job page loads | Navigate to `/jobs/new` | Form with Job Name, Job Number, Address, City, State, ZIP, Contract Amount, Contract Type, Start Date, Target Completion, Notes | — | P-CRIT | TESTABLE |
| NJ-02 | Create job: valid data | Fill all fields, click "Create Job" | Redirects to `/jobs/{new-id}`, success | `jobs` has new row with correct `company_id`, `name`, `status=pre_construction` | P-CRIT | TESTABLE |
| NJ-03 | Create job: only required fields | Fill only Job Name (required), submit | Job created with other fields null | `jobs` row has `name` set, others null | P-CRIT | TESTABLE |
| NJ-04 | Create job: empty name | Leave Job Name blank, submit | Validation error (required field) | No row created | P-CRIT | TESTABLE |
| NJ-05 | Create job: invalid contract amount | Enter "abc" as contract amount | Either validation error or `parseFloat` returns NaN | No corrupt data saved | P-MED | TESTABLE |
| NJ-06 | Create job: negative contract amount | Enter "-50000" | Should either reject or save (document expected behavior) | Check stored value | P-LOW | TESTABLE |
| NJ-07 | Create job: loading state | Click "Create Job" | Button shows spinner, becomes disabled | — | P-MED | TESTABLE |
| NJ-08 | Create job: double submit | Double-click "Create Job" | Only one job created | Only one new row in `jobs` | P-MED | TESTABLE |
| NJ-09 | Create job: not authenticated | Visit `/jobs/new` without session | Auth redirect or error "Not authenticated" | No row created | P-CRIT | TESTABLE |
| NJ-10 | Create job: no company | User exists but has no company_id | Error "No company found" displayed | No row created | P-MED | TESTABLE |
| NJ-11 | "Back to Jobs" link | Click "Back to Jobs" arrow link | Navigates to `/jobs` | — | P-LOW | TESTABLE |
| NJ-12 | State dropdown | Change state from default TX | All 50 US states available in dropdown | — | P-LOW | TESTABLE |
| NJ-13 | Contract type options | Check contract type dropdown | Fixed Price, Cost Plus, Time & Materials available | — | P-LOW | TESTABLE |
| NJ-14 | Create job: XSS in name | Enter `<script>alert('xss')</script>` as job name | Saved as text, not executed on display | Raw text stored, not HTML | P-MED | TESTABLE |
| NJ-15 | Create job: SQL injection in name | Enter `'; DROP TABLE jobs; --` as name | Parameterized query prevents injection | Text saved literally | P-CRIT | TESTABLE |
| NJ-16 | Create job: company_id isolation | Create job as Company A user | Job's company_id = Company A, not visible to Company B | `jobs.company_id` matches user's company | P-CRIT | TESTABLE |

---

## 5. API Endpoints (REAL — Built and Available)

> Routes: `src/app/api/v1/` (auth, users, roles, audit-log)
> Routes: `src/app/api/` (health, cron, docs)

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| API-01 | Health check | GET `/api/health` | 200 OK with status info | — | P-CRIT | TESTABLE |
| API-02 | List users | GET `/api/v1/users` (authenticated) | Returns paginated users for company | `users` table | P-CRIT | TESTABLE |
| API-03 | Get single user | GET `/api/v1/users/{id}` | Returns user details | — | P-MED | TESTABLE |
| API-04 | Deactivate user | POST `/api/v1/users/{id}/deactivate` | User deactivated | `users` status changed | P-MED | TESTABLE |
| API-05 | Reactivate user | POST `/api/v1/users/{id}/reactivate` | User reactivated | `users` status changed | P-MED | TESTABLE |
| API-06 | List roles | GET `/api/v1/roles` | Returns available roles | `roles` table | P-MED | TESTABLE |
| API-07 | Get role | GET `/api/v1/roles/{id}` | Returns role details | — | P-LOW | TESTABLE |
| API-08 | Audit log | GET `/api/v1/audit-log` | Returns recent audit entries | `audit_log` table | P-MED | TESTABLE |
| API-09 | API without auth | GET `/api/v1/users` without session | 401 Unauthorized | — | P-CRIT | TESTABLE |
| API-10 | API rate limiting | Send 100+ requests in 1 second | Rate limit response (429) | `api_metrics` logged | P-MED | TESTABLE |
| API-11 | Docs endpoint | GET `/api/docs` | Returns API documentation | — | P-LOW | TESTABLE |
| API-12 | Gaps endpoint | GET `/api/docs/gaps` | Returns gap tracker data | — | P-LOW | TESTABLE |

---

## 6. Skeleton: Jobs Hub (MOCK DATA — UI Only)

> Route: `src/app/(skeleton)/skeleton/jobs/page.tsx`
> Preview: `src/components/skeleton/previews/jobs-list-preview.tsx`
> NO database operations — all mock data

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| SJ-01 | Jobs skeleton loads | Navigate to `/skeleton/jobs` | Tab bar (UI Preview / Specification), "Enter Job View" link | — | P-MED | TESTABLE |
| SJ-02 | Preview tab active by default | Load page | "UI Preview" tab is active, JobsListPreview renders | — | P-MED | TESTABLE |
| SJ-03 | Switch to Specification tab | Click "Specification" | PageSpec component renders with features, data fields, connections | — | P-LOW | TESTABLE |
| SJ-04 | "Enter Job View" link | Click "Enter Job View" | Navigates to `/skeleton/jobs/1` | — | P-MED | TESTABLE |
| SJ-05 | FilterBar renders | Check preview | Search bar, status tabs, view mode toggle, sort dropdown | — | P-MED | TESTABLE |
| SJ-06 | FilterBar search | Type in search field | Job cards filter by name/client/address (client-side) | — | P-MED | TESTABLE |
| SJ-07 | FilterBar status tabs | Click "Active" tab | Only active mock jobs shown | — | P-MED | TESTABLE |
| SJ-08 | FilterBar view toggle | Click grid/list toggle | View switches between card grid and list mode | — | P-LOW | TESTABLE |
| SJ-09 | FilterBar sort | Change sort dropdown | Jobs reorder by selected field | — | P-LOW | TESTABLE |
| SJ-10 | Job card content | View a job card | Shows: name, client, address, status badge, progress bar, contract value, PM, alert (if any) | — | P-MED | TESTABLE |
| SJ-11 | Mock data integrity | Check all 8+ mock jobs | All have required fields, statuses cover pre-con/active/closeout/complete | — | P-LOW | TESTABLE |
| SJ-12 | AI Features Panel | Check for AI indicators | AI risk badges, predictions, or sparkle icons present | — | P-LOW | TESTABLE |

---

## 7. Skeleton: Job Detail Pages (MOCK DATA — 23 Sub-Pages)

> Route: `src/app/(skeleton)/skeleton/jobs/[id]/`
> Sub-pages: budget, change-orders, communications, daily-logs, draws, files, inspections,
>   invoices, lien-waivers, permits, photos, property, punch-list, purchase-orders,
>   reports, rfis, schedule, selections, submittals, team, warranties

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| JD-01 | Job detail dashboard | Navigate to `/skeleton/jobs/1` | Job overview page with summary stats, recent activity | — | P-MED | TESTABLE |
| JD-02 | Job budget page | Navigate to `/skeleton/jobs/1/budget` | Budget lines table with cost codes, amounts, variance indicators | — | P-MED | TESTABLE |
| JD-03 | Job change orders page | Navigate to `/skeleton/jobs/1/change-orders` | Change order list with statuses, amounts, approval chain | — | P-MED | TESTABLE |
| JD-04 | Job daily logs page | Navigate to `/skeleton/jobs/1/daily-logs` | Daily log entries with weather, crew, notes | — | P-MED | TESTABLE |
| JD-05 | Job draws page | Navigate to `/skeleton/jobs/1/draws` | Draw requests with G702/G703 format data | — | P-MED | TESTABLE |
| JD-06 | Job files page | Navigate to `/skeleton/jobs/1/files` | Document/file listing | — | P-LOW | TESTABLE |
| JD-07 | Job inspections page | Navigate to `/skeleton/jobs/1/inspections` | Inspection schedule and results | — | P-LOW | TESTABLE |
| JD-08 | Job invoices page | Navigate to `/skeleton/jobs/1/invoices` | Invoice list for this job | — | P-MED | TESTABLE |
| JD-09 | Job lien waivers page | Navigate to `/skeleton/jobs/1/lien-waivers` | Lien waiver tracking | — | P-MED | TESTABLE |
| JD-10 | Job permits page | Navigate to `/skeleton/jobs/1/permits` | Permit tracking and scheduling | — | P-LOW | TESTABLE |
| JD-11 | Job photos page | Navigate to `/skeleton/jobs/1/photos` | Photo gallery | — | P-LOW | TESTABLE |
| JD-12 | Job property page | Navigate to `/skeleton/jobs/1/property` | Property details | — | P-LOW | TESTABLE |
| JD-13 | Job punch list page | Navigate to `/skeleton/jobs/1/punch-list` | Punch list items with status | — | P-MED | TESTABLE |
| JD-14 | Job purchase orders page | Navigate to `/skeleton/jobs/1/purchase-orders` | PO list with vendor, amount, status | — | P-MED | TESTABLE |
| JD-15 | Job reports page | Navigate to `/skeleton/jobs/1/reports` | Job-level reports | — | P-LOW | TESTABLE |
| JD-16 | Job RFIs page | Navigate to `/skeleton/jobs/1/rfis` | RFI list with response tracking | — | P-MED | TESTABLE |
| JD-17 | Job schedule page | Navigate to `/skeleton/jobs/1/schedule` | Gantt chart or schedule view | — | P-MED | TESTABLE |
| JD-18 | Job selections page | Navigate to `/skeleton/jobs/1/selections` | Product selections by room | — | P-LOW | TESTABLE |
| JD-19 | Job submittals page | Navigate to `/skeleton/jobs/1/submittals` | Submittal tracking | — | P-LOW | TESTABLE |
| JD-20 | Job team page | Navigate to `/skeleton/jobs/1/team` | Team members assigned to job | — | P-LOW | TESTABLE |
| JD-21 | Job warranties page | Navigate to `/skeleton/jobs/1/warranties` | Warranty items and claims | — | P-LOW | TESTABLE |
| JD-22 | Job layout navigation | Navigate between sub-pages | Sidebar/tab navigation works, active page highlighted | — | P-MED | TESTABLE |
| JD-23 | Job context bar | View job detail pages | Job name/number shown in context bar across all sub-pages | — | P-MED | TESTABLE |

---

## 8. Skeleton: Financial Pages (MOCK DATA — 9 Pages)

> Routes: `/skeleton/financial/*`
> Pages: dashboard, chart-of-accounts, journal-entries, receivables, payables,
>   bank-reconciliation, cash-flow, profitability, reports

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| FN-01 | Financial dashboard | Navigate to `/skeleton/financial/dashboard` | Financial overview with key metrics | — | P-MED | TESTABLE |
| FN-02 | Chart of Accounts | Navigate to `/skeleton/financial/chart-of-accounts` | Account hierarchy with codes, types, balances | — | P-MED | TESTABLE |
| FN-03 | Journal entries | Navigate to `/skeleton/financial/journal-entries` | Journal entry list with debit/credit | — | P-LOW | TESTABLE |
| FN-04 | Receivables | Navigate to `/skeleton/financial/receivables` | Client balances, aging | — | P-MED | TESTABLE |
| FN-05 | Payables | Navigate to `/skeleton/financial/payables` | Vendor balances, aging | — | P-MED | TESTABLE |
| FN-06 | Bank reconciliation | Navigate to `/skeleton/financial/bank-reconciliation` | Bank matching interface | — | P-LOW | TESTABLE |
| FN-07 | Cash flow | Navigate to `/skeleton/financial/cash-flow` | Cash flow forecast | — | P-MED | TESTABLE |
| FN-08 | Profitability | Navigate to `/skeleton/financial/profitability` | Margin analysis | — | P-MED | TESTABLE |
| FN-09 | Financial reports | Navigate to `/skeleton/financial/reports` | Report list/generation | — | P-LOW | TESTABLE |
| FN-10 | FilterBar on financial pages | Check filter bars | Search, status filters, date range work on each page | — | P-MED | TESTABLE |

---

## 9. Skeleton: Operations Pages (MOCK DATA — 6 Pages)

> Routes: `/skeleton/operations/*`
> Pages: calendar, crew-schedule, time-clock, equipment, inventory, deliveries

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| OP-01 | Calendar | Navigate to `/skeleton/operations/calendar` | Calendar view with events | — | P-MED | TESTABLE |
| OP-02 | Crew schedule | Navigate to `/skeleton/operations/crew-schedule` | Resource allocation grid | — | P-MED | TESTABLE |
| OP-03 | Time clock | Navigate to `/skeleton/operations/time-clock` | Clock in/out interface | — | P-MED | TESTABLE |
| OP-04 | Equipment | Navigate to `/skeleton/operations/equipment` | Equipment list with status | — | P-LOW | TESTABLE |
| OP-05 | Inventory | Navigate to `/skeleton/operations/inventory` | Inventory tracking | — | P-LOW | TESTABLE |
| OP-06 | Deliveries | Navigate to `/skeleton/operations/deliveries` | Delivery schedule | — | P-LOW | TESTABLE |
| OP-07 | FilterBar on ops pages | Check filter bars | Search and status filtering works | — | P-MED | TESTABLE |

---

## 10. Skeleton: Directory Pages (MOCK DATA — 4 Pages)

> Routes: `/skeleton/directory/*`
> Pages: clients, contacts, team, vendors

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| DR-01 | Clients directory | Navigate to `/skeleton/directory/clients` | Client list with contact info | — | P-MED | TESTABLE |
| DR-02 | Contacts directory | Navigate to `/skeleton/directory/contacts` | Contact list | — | P-LOW | TESTABLE |
| DR-03 | Team directory | Navigate to `/skeleton/directory/team` | Team member list with roles | — | P-MED | TESTABLE |
| DR-04 | Vendors directory | Navigate to `/skeleton/directory/vendors` | Vendor list with trades, insurance | — | P-MED | TESTABLE |
| DR-05 | FilterBar on directory pages | Check filter bars | Search by name, filter by category/trade | — | P-MED | TESTABLE |

---

## 11. Skeleton: Compliance Pages (MOCK DATA — 4 Pages)

> Routes: `/skeleton/compliance/*`
> Pages: insurance, licenses, safety, sustainability

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| CP-01 | Insurance tracking | Navigate to `/skeleton/compliance/insurance` | Insurance certificate list with expiration | — | P-MED | TESTABLE |
| CP-02 | Licenses | Navigate to `/skeleton/compliance/licenses` | License tracking | — | P-LOW | TESTABLE |
| CP-03 | Safety | Navigate to `/skeleton/compliance/safety` | Safety compliance interface | — | P-LOW | TESTABLE |
| CP-04 | Sustainability | Navigate to `/skeleton/compliance/sustainability` | ESG tracking | — | P-LOW | TESTABLE |

---

## 12. Skeleton: Company Settings Pages (MOCK DATA — 4 Pages)

> Routes: `/skeleton/company/*`
> Pages: dashboards, email-marketing, integrations, settings

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| CS-01 | Company dashboards | Navigate to `/skeleton/company/dashboards` | Dashboard configuration | — | P-LOW | TESTABLE |
| CS-02 | Company email marketing | Navigate to `/skeleton/company/email-marketing` | Email campaign interface | — | P-LOW | TESTABLE |
| CS-03 | Company integrations | Navigate to `/skeleton/company/integrations` | Integration management | — | P-MED | TESTABLE |
| CS-04 | Company settings | Navigate to `/skeleton/company/settings` | Company configuration page | — | P-MED | TESTABLE |

---

## 13. Skeleton: Top-Level List Pages (MOCK DATA — 25+ Pages)

> Each follows the same pattern: Tab bar (Preview/Spec) + FilterBar + mock data list
> All use skeleton preview components from `src/components/skeleton/previews/`

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| TL-01 | Invoices list | Navigate to `/skeleton/invoices` | Invoice list with status pipeline, amounts, vendor names | — | P-MED | TESTABLE |
| TL-02 | Draws list | Navigate to `/skeleton/draws` | Draw list with G702 data, approval status | — | P-MED | TESTABLE |
| TL-03 | Vendors list | Navigate to `/skeleton/vendors` | Vendor list with trades, insurance, performance | — | P-MED | TESTABLE |
| TL-04 | Clients list | Navigate to `/skeleton/clients` | Client list with contact info, job count | — | P-MED | TESTABLE |
| TL-05 | Estimates list | Navigate to `/skeleton/estimates` | Estimate list with amounts, status | — | P-MED | TESTABLE |
| TL-06 | Proposals list | Navigate to `/skeleton/proposals` | Proposal list with sent/viewed/accepted status | — | P-LOW | TESTABLE |
| TL-07 | Contracts list | Navigate to `/skeleton/contracts` | Contract list with e-sign status | — | P-LOW | TESTABLE |
| TL-08 | Leads list | Navigate to `/skeleton/leads` | Lead pipeline with scoring | — | P-MED | TESTABLE |
| TL-09 | Bids list | Navigate to `/skeleton/bids` | Bid packages, comparison | — | P-LOW | TESTABLE |
| TL-10 | Purchase orders list | Navigate to `/skeleton/purchase-orders` | PO list with vendor, amounts | — | P-MED | TESTABLE |
| TL-11 | RFIs list | Navigate to `/skeleton/rfis` | RFI list with response tracking | — | P-LOW | TESTABLE |
| TL-12 | Punch lists | Navigate to `/skeleton/punch-lists` | Punch items with completion | — | P-LOW | TESTABLE |
| TL-13 | Submittals list | Navigate to `/skeleton/submittals` | Submittal tracking | — | P-LOW | TESTABLE |
| TL-14 | Cost codes list | Navigate to `/skeleton/cost-codes` | Cost code hierarchy | — | P-MED | TESTABLE |
| TL-15 | Reports | Navigate to `/skeleton/reports` | Report list/generation | — | P-LOW | TESTABLE |
| TL-16 | Selections catalog | Navigate to `/skeleton/selections-catalog` | Product selections with search | — | P-LOW | TESTABLE |
| TL-17 | Dashboards | Navigate to `/skeleton/dashboards` | Dashboard configuration | — | P-LOW | TESTABLE |
| TL-18 | Payments | Navigate to `/skeleton/payments` | Payment tracking | — | P-LOW | TESTABLE |
| TL-19 | Time clock | Navigate to `/skeleton/time-clock` | Clock in/out | — | P-LOW | TESTABLE |
| TL-20 | Notifications | Navigate to `/skeleton/notifications` | Notification center | — | P-LOW | TESTABLE |
| TL-21 | Warranties | Navigate to `/skeleton/warranties` | Warranty tracking | — | P-LOW | TESTABLE |
| TL-22 | Warranty claims | Navigate to `/skeleton/warranty-claims` | Claims management | — | P-LOW | TESTABLE |

---

## 14. Skeleton: Platform & Admin Pages (MOCK DATA)

> Routes: Various skeleton pages for platform features

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| PA-01 | Admin panel | Navigate to `/skeleton/admin` | Admin controls, system stats | — | P-MED | TESTABLE |
| PA-02 | Settings | Navigate to `/skeleton/settings` | Settings page (2 files) | — | P-MED | TESTABLE |
| PA-03 | Account profile | Navigate to `/skeleton/account/profile` | User profile with session table | — | P-MED | TESTABLE |
| PA-04 | Subscription/billing | Navigate to `/skeleton/subscription` | Plan selection, billing info | — | P-LOW | TESTABLE |
| PA-05 | API marketplace | Navigate to `/skeleton/api-marketplace` | Integration marketplace with search | — | P-LOW | TESTABLE |
| PA-06 | Data migration | Navigate to `/skeleton/data-migration` | Import interface with mapping table | — | P-LOW | TESTABLE |
| PA-07 | Onboarding | Navigate to `/skeleton/onboarding` | Setup wizard | — | P-LOW | TESTABLE |
| PA-08 | Training | Navigate to `/skeleton/training` | Training courses | — | P-LOW | TESTABLE |
| PA-09 | Support | Navigate to `/skeleton/support` | Support tickets with form | — | P-LOW | TESTABLE |
| PA-10 | Templates | Navigate to `/skeleton/templates` | Template library | — | P-LOW | TESTABLE |
| PA-11 | Community | Navigate to `/skeleton/community` | Community forum | — | P-LOW | TESTABLE |
| PA-12 | White label | Navigate to `/skeleton/white-label` | Branding configuration | — | P-LOW | TESTABLE |
| PA-13 | Marketing | Navigate to `/skeleton/marketing` | Marketing portfolio with table | — | P-LOW | TESTABLE |
| PA-14 | Email marketing | Navigate to `/skeleton/email-marketing` | Email campaigns | — | P-LOW | TESTABLE |
| PA-15 | Portal (client) | Navigate to `/skeleton/portal` | Client portal view | — | P-LOW | TESTABLE |
| PA-16 | Vendor portal | Navigate to `/skeleton/vendor-portal` | Vendor self-service | — | P-LOW | TESTABLE |
| PA-17 | Price intelligence | Navigate to `/skeleton/price-intelligence` | Price comparison | — | P-LOW | TESTABLE |
| PA-18 | Docs hub | Navigate to `/skeleton/docs` | Documentation with navigation links | — | P-LOW | TESTABLE |
| PA-19 | Todos | Navigate to `/skeleton/todos` | Task management | — | P-LOW | TESTABLE |
| PA-20 | Overview | Navigate to `/skeleton/overview` | System overview | — | P-LOW | TESTABLE |

---

## 15. Skeleton: Navigation & Layout

> Components: `src/components/skeleton/unified-nav.tsx`, `skeleton-sidebar.tsx`,
>   `filter-bar.tsx`, `skeleton-job-filter.tsx`, `job-context-bar.tsx`
> Navigation config: `src/config/navigation.ts`

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| NV-01 | Unified nav renders | Load any skeleton page | Top nav bar with logo, menu items, user area | — | P-CRIT | TESTABLE |
| NV-02 | Company-level nav items | Check nav at `/skeleton` | Dashboard, Sales (Leads/Estimates/Proposals/Contracts), Jobs links | — | P-MED | TESTABLE |
| NV-03 | Sales dropdown | Hover/click Sales in nav | Dropdown shows Leads, Estimates, Proposals, Contracts with descriptions | — | P-MED | TESTABLE |
| NV-04 | Operations dropdown | Check Operations in nav | Calendar, Crew Schedule, Time Clock, Equipment, Inventory, Deliveries | — | P-MED | TESTABLE |
| NV-05 | Financial dropdown | Check Financial in nav | Dashboard, Chart of Accounts, Journal Entries, Receivables, Payables, Bank Recon, Cash Flow, Profitability, Reports | — | P-MED | TESTABLE |
| NV-06 | Job-level context switch | Navigate to `/skeleton/jobs/1` | Nav transforms to job context with job-specific sub-pages | — | P-CRIT | TESTABLE |
| NV-07 | Job sidebar navigation | View job detail page | Sidebar shows: Budget, Change Orders, Communications, Daily Logs, etc. | — | P-MED | TESTABLE |
| NV-08 | Skeleton sidebar | Check left sidebar | Navigation groups with icons and labels | — | P-MED | TESTABLE |
| NV-09 | Job selector sidebar | Check job selector | Search input, job list with navigation links | — | P-MED | TESTABLE |
| NV-10 | Skeleton home page | Navigate to `/skeleton` | Landing page with 13 navigation links to major areas | — | P-MED | TESTABLE |
| NV-11 | FilterBar: search | Type in any FilterBar search | Results filter client-side | — | P-MED | TESTABLE |
| NV-12 | FilterBar: status tabs | Click status tabs | Active tab highlighted, list filters | — | P-MED | TESTABLE |
| NV-13 | FilterBar: view mode | Toggle grid/list view | View changes, icon updates | — | P-MED | TESTABLE |
| NV-14 | FilterBar: sort dropdown | Change sort option | Items reorder | — | P-LOW | TESTABLE |
| NV-15 | FilterBar: sort direction | Toggle sort asc/desc | Direction changes, arrow icon flips | — | P-LOW | TESTABLE |
| NV-16 | FilterBar: action buttons | Click primary action (e.g., "New Invoice") | Action triggered or modal opens | — | P-MED | TESTABLE |

---

## 16. Skeleton: Preview Components (83 Components — Shared Patterns)

> Location: `src/components/skeleton/previews/`
> 83 preview components with 1751 buttons, 127 forms, 217 tables, 4 modals, 12 toggles
> These use mock data and client-side filtering

| # | Test Case | Action | Expected Result | DB Verify | Priority | Testability |
|---|-----------|--------|-----------------|-----------|----------|-------------|
| PR-01 | All previews render | Load each preview page | No JavaScript errors, content visible | — | P-CRIT | TESTABLE |
| PR-02 | Preview/Spec tab toggle | Toggle tabs on any page | Switches between preview and specification view | — | P-MED | TESTABLE |
| PR-03 | Mock data completeness | Check each preview | Mock data covers all statuses (active, pending, completed, etc.) | — | P-LOW | TESTABLE |
| PR-04 | Action buttons exist | Check primary actions on each preview | "New [Entity]", "Export", "Download" buttons present | — | P-MED | TESTABLE |
| PR-05 | Action buttons: non-functional | Click "New [Entity]" buttons | Currently no-op or shows mock behavior (no DB write) | — | P-MED | TESTABLE |
| PR-06 | Table columns render | Check tables in budget, data-migration, marketing previews | Columns visible with mock data | — | P-MED | TESTABLE |
| PR-07 | AI Features Panel | Check AI indicators across previews | Sparkle icons, AI notes, confidence scores where expected | — | P-LOW | TESTABLE |
| PR-08 | Status badges styling | Check status badges on cards/rows | Correct color mapping (active=green, warning=amber, etc.) | — | P-LOW | TESTABLE |
| PR-09 | Responsive layout | Resize browser on preview pages | Cards reflow, tables scroll horizontally, no overflow | — | P-MED | TESTABLE |
| PR-10 | Currency formatting | Check dollar amounts in previews | Formatted as `$XX,XXX.XX` | — | P-LOW | TESTABLE |
| PR-11 | Date formatting | Check dates in previews | Consistent ISO or relative format | — | P-LOW | TESTABLE |

---

## Multi-Step Flow Tests

### Flow 1: Login -> Dashboard -> Create Job -> View Job

**Steps:**
1. Navigate to `/login` -> Enter valid credentials -> Click "Sign in" -> Verify redirect to `/dashboard`
2. On `/dashboard` -> Verify stats load -> Click "Active Jobs" card -> Verify `/jobs?status=active`
3. On `/jobs` -> Click "New Job" -> Verify `/jobs/new`
4. On `/jobs/new` -> Fill job name "Test Project" + address -> Click "Create Job" -> Verify redirect to `/jobs/{id}`
5. Navigate to `/dashboard` -> Verify new job appears in "Recent Jobs"

**Priority:** P-CRIT
**Testability:** TESTABLE
**DB Verify:** `jobs` table has new row, dashboard counts updated

### Flow 2: Skeleton Navigation Tour

**Steps:**
1. Navigate to `/skeleton` -> Verify landing page loads with navigation links
2. Click "Jobs" -> Verify `/skeleton/jobs` loads with preview
3. Click "Enter Job View" -> Verify `/skeleton/jobs/1` loads
4. Navigate through each job sub-page (budget, invoices, draws, etc.) -> Verify each loads
5. Return to company level -> Navigate to Financial -> Dashboard
6. Navigate to Directory -> Vendors -> Verify preview loads

**Priority:** P-MED
**Testability:** TESTABLE
**DB Verify:** None (all mock data)

### Flow 3: Job Creation -> Jobs List Verification

**Steps:**
1. Login -> Navigate to `/jobs/new`
2. Create job with all fields filled
3. Navigate to `/jobs` -> Verify new job appears in list
4. Click status filter "Pre-Construction" -> Verify new job is visible
5. Search for job by name -> Verify it appears
6. Navigate back to `/dashboard` -> Verify job count incremented

**Priority:** P-CRIT
**Testability:** TESTABLE
**DB Verify:** `jobs` row with correct company_id, all fields match input

### Flow 4: User Management API Flow

**Steps:**
1. GET `/api/v1/users` -> Note user list
2. POST `/api/v1/users/{id}/deactivate` -> Verify 200
3. GET `/api/v1/users/{id}` -> Verify user is deactivated
4. POST `/api/v1/users/{id}/reactivate` -> Verify 200
5. GET `/api/v1/users/{id}` -> Verify user is reactivated
6. GET `/api/v1/audit-log` -> Verify deactivate/reactivate events logged

**Priority:** P-MED
**Testability:** TESTABLE
**DB Verify:** `users` status field, `audit_log` entries

---

## Edge Case Tests

| # | Scenario | Page | Action | Expected | Priority | Testability |
|---|----------|------|--------|----------|----------|-------------|
| E-01 | Empty state: no jobs | `/dashboard` | Login with fresh account, no jobs | "No jobs yet" + "Create your first job" link | P-MED | TESTABLE |
| E-02 | Empty state: jobs list | `/jobs` | Load with 0 jobs | Empty state UI, "New Job" still available | P-MED | TESTABLE |
| E-03 | Permission: unauthenticated dashboard | `/dashboard` | Visit without session | Redirect to `/login` | P-CRIT | TESTABLE |
| E-04 | Permission: unauthenticated API | `/api/v1/users` | GET without auth | 401 response | P-CRIT | TESTABLE |
| E-05 | Long text: job name | `/jobs/new` | Enter 500+ char job name | Saves (or truncates), does not break layout | P-LOW | TESTABLE |
| E-06 | Special characters: job name | `/jobs/new` | Enter "O'Brien & Sons - $50k+" as name | Saves and displays correctly | P-MED | TESTABLE |
| E-07 | Unicode: job name | `/jobs/new` | Enter Japanese/emoji characters | Saves without corruption | P-LOW | TESTABLE |
| E-08 | SQL injection: job form | `/jobs/new` | Enter `'; DROP TABLE jobs; --` | Parameterized query prevents, text saved literally | P-CRIT | TESTABLE |
| E-09 | XSS: job form | `/jobs/new` | Enter `<img src=x onerror=alert(1)>` | Saved as text, React escapes on render | P-CRIT | TESTABLE |
| E-10 | Concurrent sessions | Multiple tabs | Login in two tabs, create job in each | Both succeed, two separate jobs created | P-MED | TESTABLE |
| E-11 | Browser back button | `/jobs/new` -> create -> `/jobs/{id}` | Press back button | Returns to form (empty or cached), no double-submit | P-LOW | TESTABLE |
| E-12 | Skeleton 404 | `/skeleton/nonexistent` | Visit invalid skeleton route | Next.js not-found page | P-LOW | TESTABLE |
| E-13 | API 404 | `/api/v1/nonexistent` | Visit invalid API route | 404 JSON response | P-LOW | TESTABLE |
| E-14 | Large page size | `/skeleton/jobs` | View with many mock items | No significant performance degradation | P-LOW | TESTABLE |
| E-15 | Multi-tenant isolation | `/jobs` | User from Company A | Cannot see Company B's jobs | P-CRIT | NEEDS-BE |
| E-16 | Broken session: API | `/api/v1/users` | Expired/corrupted session token | 401, not 500 error | P-MED | TESTABLE |
| E-17 | Network error: job create | `/jobs/new` | Disconnect network before submit | Error message shown, no data loss | P-MED | TESTABLE |
| E-18 | Rate limit: API | `/api/v1/*` | 100+ rapid requests | 429 Too Many Requests response | P-MED | TESTABLE |
| E-19 | RBAC: admin-only routes | `/api/v1/roles` | Non-admin user access | 403 Forbidden (if enforced) | P-CRIT | NEEDS-BE |
| E-20 | Soft delete verification | Any entity | Delete (when implemented) | Row archived, not removed, can be restored | P-CRIT | NEEDS-BE |

---

## Features Needing Backend Before Testing

> These skeleton pages have UI but NO database operations.
> They will become testable once API routes and Supabase queries are built.

| Feature Area | Skeleton Pages | Needs | Module | Priority | Testability |
|-------------|---------------|-------|--------|----------|-------------|
| Invoice CRUD | `/skeleton/invoices` | API routes, DB queries, form submission | Module 13 | P-CRIT | NEEDS-BE |
| Draw CRUD | `/skeleton/draws` | API routes, G702 generation, approval workflow | Module 15 | P-CRIT | NEEDS-BE |
| Vendor CRUD | `/skeleton/vendors` | API routes, insurance tracking | Module 10 | P-CRIT | NEEDS-BE |
| Client CRUD | `/skeleton/clients` | API routes, client management | Module 03 | P-CRIT | NEEDS-BE |
| Budget management | `/skeleton/jobs/[id]/budget` | Budget lines CRUD, cost code linking | Module 09 | P-CRIT | NEEDS-BE |
| Change orders | `/skeleton/jobs/[id]/change-orders` | CO creation, approval chain | Module 17 | P-MED | NEEDS-BE |
| Daily logs | `/skeleton/jobs/[id]/daily-logs` | Log creation, crew tracking | Module 08 | P-MED | NEEDS-BE |
| Purchase orders | `/skeleton/purchase-orders` | PO CRUD, receiving | Module 18 | P-MED | NEEDS-BE |
| Scheduling | `/skeleton/jobs/[id]/schedule` | Gantt chart, dependencies | Module 07 | P-MED | NEEDS-BE |
| RFIs | `/skeleton/rfis` | RFI tracking, responses | Module 27 | P-MED | NEEDS-BE |
| Punch lists | `/skeleton/punch-lists` | Punch item CRUD, photo markup | Module 28 | P-MED | NEEDS-BE |
| Lien waivers | `/skeleton/jobs/[id]/lien-waivers` | Waiver tracking, compliance | Module 14 | P-MED | NEEDS-BE |
| Selections | `/skeleton/jobs/[id]/selections` | Selection management | Module 21 | P-LOW | NEEDS-BE |
| File upload | `/skeleton/jobs/[id]/files` | Supabase Storage, S3 | Module 06 | P-MED | NEEDS-BE |
| Notifications | `/skeleton/notifications` | Real-time, email | Module 05 | P-MED | NEEDS-BE |
| RBAC enforcement | All pages | Role checks, permission gates | Module 01 | P-CRIT | NEEDS-BE |
| Global search (Cmd+K) | All pages | Search index, cross-entity | Module 04 | P-MED | NEEDS-BE |
| Cost codes CRUD | `/skeleton/cost-codes` | Cost code management | Module 03 | P-MED | NEEDS-BE |
| Estimates | `/skeleton/estimates` | Estimating engine | Module 20 | P-MED | NEEDS-BE |
| Accounting GL | `/skeleton/financial/*` | Full GL, AP/AR | Module 11 | P-CRIT | NEEDS-BE |
| Client portal | `/skeleton/portal` | Client login, visibility | Module 12 | P-LOW | FUTURE |
| Vendor portal | `/skeleton/vendor-portal` | Sub self-service | Module 30 | P-LOW | FUTURE |
| Subscription billing | `/skeleton/subscription` | Stripe integration | Module 43 | P-LOW | FUTURE |
| White label | `/skeleton/white-label` | Custom domains, themes | Module 44 | P-LOW | FUTURE |
| API marketplace | `/skeleton/api-marketplace` | Public API | Module 45 | P-LOW | FUTURE |
| Data migration | `/skeleton/data-migration` | Import tools | Module 42 | P-LOW | FUTURE |
| Training platform | `/skeleton/training` | Courses, LMS | Module 47 | P-LOW | FUTURE |

---

## Coverage Summary

<!-- Auto-updated 2026-02-23 -->
- **Total pages covered:** 93 (4 authenticated + 67+ skeleton + layouts/components)
- **Total elements in codebase:** 3,233
- **Total test cases:** 228
- **P-CRIT:** 41
- **P-MED:** 108
- **P-LOW:** 79
- **TESTABLE now:** 195
- **NEEDS-BE (needs backend):** 30
- **FUTURE (not built):** 3

### What You Can Test RIGHT NOW
1. **Authentication flow** (15 tests) -- Login, logout, session, security
2. **Dashboard** (11 tests) -- Stats, navigation, empty states
3. **Jobs list** (10 tests) -- Filtering, search, navigation
4. **Create Job form** (16 tests) -- Full CRUD with DB verification
5. **API endpoints** (12 tests) -- Health, users, roles, audit
6. **All skeleton page navigation** (100+ tests) -- Every page loads, tabs work, filters work
7. **Multi-step flows** (4 flows) -- Login-to-create, nav tour, CRUD cycle, user management
8. **Edge cases** (18 tests) -- Security, empty states, special chars, concurrency

### What Needs Backend Work First
1. Invoice/Draw/Vendor/Client CRUD -- No API routes exist
2. Budget management -- No budget endpoints
3. RBAC enforcement -- Roles exist in DB but not enforced on routes
4. Multi-tenant isolation -- RLS policies need verification
5. Global search -- Not implemented
6. File upload -- Storage not connected
7. Notification system -- Not built
8. Full accounting (GL/AP/AR) -- Not built

### DB Tables Available for Verification
| Table | Can Test Now? | Used By |
|-------|---------------|---------|
| `jobs` | Yes | Dashboard, Jobs list, Create Job |
| `invoices` | Read only (count) | Dashboard stats |
| `draws` | Read only (count) | Dashboard stats |
| `users` | Yes | Auth, user management API |
| `companies` | Yes (via auth) | Multi-tenant context |
| `roles` | Yes | Roles API |
| `auth_audit_log` | Yes | Login tracking |
| `audit_log` | Yes | Audit log API |
| `api_metrics` | Indirect | Rate limiting verification |

---

## Settings > Features (Feature Registry) — Test Cases

**Page:** `/skeleton/company/features`
**Components:** `feature-registry-preview.tsx`, `features.ts`
**Status:** 🚧 Mock Data — All tests are UI-only

### Navigation

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-01 | Click Settings > Features in nav | Page loads at `/skeleton/company/features` |
| FR-02 | Click Preview tab | Feature Registry preview component renders |
| FR-03 | Click Specification tab | PageSpec component renders with feature details |

### Stats Cards

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-04 | Load page | 6 stat cards show: Total (205), Enabled (count), Self-Learning (count), Ready (count), Planned (count), Future (count) |
| FR-05 | Toggle a feature off | Enabled count decreases by 1 |
| FR-06 | Toggle a feature on | Enabled count increases by 1 |

### Smart Onboarding Section

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-07 | Click onboarding header | Section collapses, chevron changes to right |
| FR-08 | Click collapsed header | Section expands, shows 6 onboarding steps in 3-column grid |
| FR-09 | Verify step content | Each step shows number, icon, title, time estimate, description |

### Search & Filters

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-10 | Type "invoice" in search | Only features with "invoice" in name/desc/category shown |
| FR-11 | Clear search | All 205 features shown again |
| FR-12 | Select "Ready to Build" status | Only ready features shown |
| FR-13 | Select "Planned" status | Only planned features shown |
| FR-14 | Select "Future" status | Only future features shown |
| FR-15 | Select "All Statuses" | All features shown |
| FR-16 | Click Self-Learning Only | Only selfLearn=true features shown, button turns purple |
| FR-17 | Click Self-Learning Only again | All features shown, button reverts to default |
| FR-18 | Combine search + status filter | Both filters apply simultaneously |

### Category Sections

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-19 | Click category header | Category collapses, features hidden |
| FR-20 | Click collapsed category header | Category expands, features visible |
| FR-21 | Click "Enable All" on a category | All features in that category toggle on |
| FR-22 | Click "Disable All" on a category | All features in that category toggle off |
| FR-23 | Verify all 10 categories present | All categories visible with correct feature counts |

### Feature Toggle Switches

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-24 | Click toggle on enabled feature | Toggle turns gray, feature text dims, enabled stat decreases |
| FR-25 | Click toggle on disabled feature | Toggle turns amber, feature text brightens, enabled stat increases |
| FR-26 | Verify self-learning badge | Purple "Self-Learning" badge shown only on selfLearn features |
| FR-27 | Verify status badges | Green=Ready, Amber=Planned, Indigo=Future |
| FR-28 | Verify effort badges | Green=S, Yellow=M, Orange=L, Red=XL |
| FR-29 | Verify phase indicators | "Phase 1", "Phase 2", "Phase 3" shown correctly |

### AI Panels

| # | Test Action | Expected Result |
|---|------------|-----------------|
| FR-30 | Verify AI Insights bar | Amber bar with Sparkles icon, shows self-learning count and ready count |
| FR-31 | Verify AI Features Panel | 3 AI features shown: Smart Recommendations, Usage-Based, Self-Learning Dashboard |

---

## Construction Intelligence Pages (8 pages)

### Trade Intuition AI (`/skeleton/intelligence/trade-intuition`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| TI-01 | Navigate to Intelligence > Trade Intuition AI | Page loads with header showing 80 domains, 8 categories, 7 layers |
| TI-02 | View 8 category cards | All 8 shown: Material Science, Installation Sequences, Real-World Physics, Problem-Solving, Trade Knowledge, Coordination, Cost Intelligence, Safety & Compliance |
| TI-03 | View 7-Layer Thinking Engine | Live example shows framing decision evaluated through all 7 layers with check/warning items |
| TI-04 | Expand layer details | Each layer shows specific items with check/warning/info icons |
| TI-05 | View final recommendation | Shows "Proceed with 1 condition" at 94% confidence |
| TI-06 | Click Knowledge Domains accordion | Category expands to show 4 example domains with descriptions |
| TI-07 | View Confidence & Override System | 5 flag levels with colored indicators and example scenarios |
| TI-08 | View cross-module examples | 6 cards: Scheduling, Invoices, Daily Logs, Change Orders, Vendor Management, Selections |
| TI-09 | View AI Insights panel | 3 insights: Self-Learning, Cross-Module Intelligence, Confidence Calibration |
| TI-10 | Switch to Specification tab | PageSpec shows with workflow, features, connections, AI features |

### AI Hub (`/skeleton/intelligence/ai-hub`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| AH-01 | Navigate to Intelligence > AI Hub | Page loads with stats: AI Accuracy, Predictions, Alerts, Learning Events |
| AH-02 | View Morning Briefing | Shows date, weather, financial, inspection, crew updates |
| AH-03 | View Project Health Scores | 4 projects with scores (54-91), budget/schedule status, trend arrows |
| AH-04 | View "What If" Scenario Engine | Viking appliance upgrade example with budget/schedule/margin impacts |
| AH-05 | View AI Risk Register | 3 risks with probability/impact and AI-suggested mitigations |
| AH-06 | View AI Intelligence bar | Amber bar with model accuracy and learning summary |
| AH-07 | View AI Features Panel | 6 features with confidence scores and descriptions |
| AH-08 | Switch to Specification tab | PageSpec shows correctly |

### Plan Analysis (`/skeleton/intelligence/plan-analysis`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| PA-01 | Navigate to Intelligence > Plan Analysis | Page loads with preview tab active |
| PA-02 | Switch to Specification tab | Shows workflow, features, connections for AI plan reading |

### Bidding & Estimating (`/skeleton/intelligence/bidding`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| BE-01 | Navigate to Intelligence > Bidding | Page loads with preview tab active |
| BE-02 | Switch to Specification tab | Shows workflow, features, connections for bid analysis |

### Selections Experience (`/skeleton/intelligence/selections`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| SE-01 | Navigate to Intelligence > Selections | Page loads with preview tab active |
| SE-02 | Switch to Specification tab | Shows workflow, features, connections for vibe boards |

### Production & Quality (`/skeleton/intelligence/production`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| PQ-01 | Navigate to Intelligence > Production | Page loads with preview tab active |
| PQ-02 | Switch to Specification tab | Shows workflow, features, connections for Gantt/quality |

### Procurement & Supply Chain (`/skeleton/intelligence/procurement`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| PR-01 | Navigate to Intelligence > Procurement | Page loads with preview tab active |
| PR-02 | Switch to Specification tab | Shows workflow, features, connections for PO/delivery |

### Smart Reports (`/skeleton/intelligence/reports`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| SR-01 | Navigate to Intelligence > Smart Reports | Page loads with preview tab active |
| SR-02 | Switch to Specification tab | Shows workflow, features, connections for AI reports |

### Communication Hub (`/skeleton/intelligence/communication-hub`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| CH-01 | Navigate to Intelligence > Communication Hub | Page loads with preview tab active |
| CH-02 | Switch to Specification tab | Shows workflow, features, connections for universal inbox |
| CH-03 | Preview shows 6 connected channels | Gmail, Outlook, SMS/iMessage, Phone Calls, WhatsApp, Slack with sync status |
| CH-04 | Universal inbox section | 6 mock messages from different channels with AI tags and job auto-tagging |
| CH-05 | AI Extraction Pipeline | 4-step flow visible: Receive → Identify → Extract → Propose |
| CH-06 | Two-Way Sync visualization | Shows reply routing back through original channel |
| CH-07 | On-Site Recording section | Shows mobile recording → transcription → extraction flow |
| CH-08 | Channel Setup Guide | 6-step setup process displayed |

### Learning Metrics (`/skeleton/intelligence/learning-metrics`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| LM-01 | Navigate to Intelligence > Learning Metrics | Page loads with preview tab active |
| LM-02 | Switch to Specification tab | Shows workflow, features, connections for metrics dashboard |
| LM-03 | Trade metrics section | 45 metrics across 5 collapsible categories (Financial, Schedule, Quality, Communication, Safety) |
| LM-04 | Material metrics section | 12 material tracking metrics displayed |
| LM-05 | Job aggregate metrics | 10 job-level metrics displayed |
| LM-06 | Learning Progress panel | 4 training sources with progress bars + AI maturity indicator |
| LM-07 | Cross-module learning flow | Visual flow showing data → metrics → AI modules |
| LM-08 | Live learning example | Before/after variance improvement example |

### AI Accuracy Engine (`/skeleton/intelligence/accuracy-engine`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| AE-01 | Navigate to Intelligence > Accuracy Engine | Page loads with preview tab active |
| AE-02 | Switch to Specification tab | Shows workflow, features, connections for accuracy engine |
| AE-03 | 6 Validation Systems grid | 6 system cards with tagline, description, example, catch rate |
| AE-04 | Live Demo: Fireplace Error | Multi-step flow showing 3 layers catching $37K error |
| AE-05 | Accuracy Dashboard | Error types breakdown, monthly trend, key metrics |
| AE-06 | Confidence flag types | 5 color-coded flag cards (red/orange/amber/blue/white) |
| AE-07 | Reasonableness Bounds table | 10 items with low/typical/high/extreme ranges |
| AE-08 | AI Features Panel | 6 features with confidence scores |

### Pre-Construction Management (`/skeleton/pre-construction`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| PC-01 | Navigate to Pre-Con > Feasibility | Page loads with preview tab active |
| PC-02 | Switch to Specification tab | Shows workflow, features, connections for pre-construction |
| PC-03 | Pre-Con Timeline | Horizontal timeline with 7 milestones, 3 projects |
| PC-04 | Lot Feasibility Card | Address, zoning, flood zone, buildable area |
| PC-05 | Permit Tracker | 4 permits with status badges and timeline |
| PC-06 | Design Review Workflow | 5-step flow with markup deduplication |
| PC-07 | Pre-Con Checklist | 12 items with progress bar (7/12) |
| PC-08 | Design Budget Tracker | 6 rows with Budgeted/Paid/Remaining/Status |

### Contract & Legal Management (`/skeleton/contracts/legal`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| CL-01 | Navigate to Sales > Legal & Compliance | Page loads with preview tab active |
| CL-02 | Switch to Specification tab | Shows workflow, features, connections for contracts |
| CL-03 | Contract Template Library | 6 template cards with descriptions |
| CL-04 | AI Contract Builder Demo | 5-step flow with mock contract preview |
| CL-05 | Contract Comparison Tool | Side-by-side redline with 3 flagged changes |
| CL-06 | Subcontract Generator | Bid award → auto-generated subcontract |
| CL-07 | Lien Law Dashboard | FL rules, 3 project deadlines, NTO timeline |
| CL-08 | Contract Milestone Tracker | 5 milestones with dates and status |

### Business Management (`/skeleton/financial/business-management`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| BM-01 | Navigate to Financial > Business Mgmt | Page loads with preview tab active |
| BM-02 | Switch to Specification tab | Shows workflow, features, connections for business mgmt |
| BM-03 | Company P&L Dashboard | Revenue, COGS, margins, YoY comparison |
| BM-04 | Overhead Rate Calculator | 7 categories totaling $28.5K/mo |
| BM-05 | Capacity Planner | Team capacity bars, job overlap timeline |
| BM-06 | Break-Even Analysis | Break-even line, contracted vs pipeline |
| BM-07 | Cash Flow Forecast | 8-week table with In/Out/Net |
| BM-08 | Goal & KPI Dashboard | 4 KPIs with progress bars |

### HR & Workforce (`/skeleton/directory/hr`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| HR-01 | Navigate to Directory > HR & Workforce | Page loads with preview tab active |
| HR-02 | Switch to Specification tab | Shows workflow, features, connections for HR |
| HR-03 | Org Chart | Visual tree: Owner → PMs → Supers → Field |
| HR-04 | Hiring Pipeline | Kanban stages for 2 open positions |
| HR-05 | Certification Tracker | 5 employees × 7 certs with status badges |
| HR-06 | Performance Reviews | 2 reviews with category scoring |
| HR-07 | Workload Balancer | PM comparison: jobs, hours, capacity % |
| HR-08 | Compensation Benchmarking | 3 roles vs market with risk badges |

### Post-Build Lifecycle (`/skeleton/post-build`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| PB-01 | Navigate to Closeout > Post-Build | Page loads with preview tab active |
| PB-02 | Switch to Specification tab | Shows workflow, features, connections for post-build |
| PB-03 | Walkthrough Schedule | 30-day, 11-month, 2-year walkthroughs |
| PB-04 | 30-Day Walkthrough Demo | 5 checklist items (3 resolved, 2 pending) |
| PB-05 | Seasonal Maintenance | 4 season cards with tasks |
| PB-06 | Client Lifetime Value | 3 clients with total value + referrals |
| PB-07 | Referral Program | 8 referrals with status and conversion |
| PB-08 | Knowledge Base | Personalized AI answer for installed materials |

### Lien Law Compliance (`/skeleton/compliance/lien-law`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| LL-01 | Navigate to Settings > Lien Law | Page loads with preview tab active |
| LL-02 | Switch to Specification tab | Shows workflow, features, connections for lien law |
| LL-03 | State Selector | FL/NC/SC tabs, 4 FL rules displayed |
| LL-04 | Lien Deadline Calendar | 6 deadlines across 3 projects, color-coded |
| LL-05 | NTO Tracker | 6 rows with deadline, sent, confirmed status |
| LL-06 | Waiver Status Board | Per-sub waiver matrix for Draw #3 |
| LL-07 | Retainage Tracker | 3 projects with progress bars and held amounts |
| LL-08 | Sub Lien Rights Dashboard | 3 subs with risk levels (HIGH/LOW/MODERATE) |

### Job Close Accounting (`/skeleton/financial/job-close`)

| # | Test Action | Expected Result |
|---|------------|-----------------|
| JC-01 | Navigate to Financial > Job Close | Page loads with preview tab active |
| JC-02 | Switch to Specification tab | Shows workflow, features, connections for job close |
| JC-03 | Job Close Checklist | 8 items with progress bar (7/8) |
| JC-04 | Final Cost Reconciliation | 8 cost codes: estimated vs actual with variance |
| JC-05 | Percentage of Completion | 98% with quarterly breakdown |
| JC-06 | Warranty Reserve Calculator | AI recommendation + historical table |
| JC-07 | CPA Export Package | 6 items with format selector |
| JC-08 | Post-Job Profit Analysis | Revenue vs cost, margin erosion |

### Navigation Integration

| # | Test Action | Expected Result |
|---|------------|-----------------|
| NAV-01 | Click Intelligence in nav bar | Dropdown shows 11 sub-links with Brain icon |
| NAV-02 | Intelligence dropdown items | Trade Intuition AI, Plan Analysis, Bidding, Selections, Production, Procurement, Smart Reports, AI Hub, Communication Hub, Learning Metrics, Accuracy Engine |
| NAV-03 | Each intelligence link | Navigates to correct `/skeleton/intelligence/*` route |
| NAV-04 | Features link description | Shows "Toggle 467 capabilities" under Settings |
| NAV-05 | Pre-Con section in nav | Shows Pre-Con with Compass icon, Feasibility sub-item |
| NAV-06 | Sales > Legal & Compliance | Link appears under Sales dropdown |
| NAV-07 | Financial > Business Mgmt | Link appears under Financial dropdown |
| NAV-08 | Financial > Job Close | Link appears under Financial dropdown |
| NAV-09 | Closeout > Post-Build | Link appears under Closeout dropdown |
| NAV-10 | Directory > HR & Workforce | Link appears under Directory dropdown |
| NAV-11 | Settings > Lien Law | Link appears under Settings dropdown |
