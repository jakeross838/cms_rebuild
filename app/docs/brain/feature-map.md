# Ross Built CMS — Living Feature Map
<!-- This file is the COMPREHENSIVE behavioral specification for every UI element in the CMS. -->
<!-- Auto-maintained by the brain-tracker agent. You can also edit manually. -->
<!-- Last updated: 2026-02-23 -->
<!-- Scan count: 2 -->
<!-- Total pages: 67+ skeleton pages, 2 authenticated pages -->
<!-- Total elements: 3,233+ across 227 files -->
<!-- Comprehensive rebuild: Full behavioral contracts for every button, form, and interactive element -->

## How to Read This

Each section is a **page or area** of the CMS. Under each, you will find:
- What the page is for (plain English, construction manager perspective)
- Every interactive element with its COMPLETE behavioral contract
- Database effects (most are mock data right now)
- Cross-module ripple effects (what changes elsewhere when something happens here)
- Status: ✅ Working | 🚧 Mock Data | 📝 Not Yet Implemented

**Key fact:** Almost everything below is **skeleton UI with mock/hardcoded data**. Supabase auth is wired (login/logout works), but RBAC is not enforced. No real CRUD API endpoints exist for jobs, invoices, vendors, etc. The 67+ skeleton pages are visual prototypes showing what each screen will look like when data is connected.

## Change Log
<!-- Newest changes at top -->
- **2026-02-23** — Complete rebuild with full behavioral contracts: Part 1 (Login, Dashboard, Jobs), Part 2A (Financial & Procurement), Part 2B (Directory, Sales, Remaining + System-Wide sections)

---

## Table of Contents

### Part 1 — Core Pages
1. Login Page
2. Company Dashboard (Home)
3. System Overview
4. Jobs List
5. Job Overview (Dashboard)
6. Job Budget
7. Job Schedule (Gantt Chart)
8. Job Daily Logs
9. Job Sub-Pages Summary
10. Create New Job (Authenticated)

### Part 2A — Financial & Procurement
11. Invoices
12. Draw Requests
13. Purchase Orders
14. Change Orders
15. Lien Waivers

### Part 2B — Directory, Sales & Remaining
16. Vendor Directory
17. Client Directory
18. Estimating Engine
19. Proposal Pipeline
20. Contracts & Agreements
21. Lead Pipeline & CRM
22. Client Selections
23. Punch List & Quality

### System-Wide Sections
- Two-Way Syncs (QuickBooks, Client Portal, AI Engine, Email, Weather, Bank)
- Multi-Layered Logic (Decision Trees)
- Database Schema Map

---

---

## Platform Infrastructure

### Authentication & Login
*Files: `src/app/api/v1/auth/login`, `logout`, `me`; `src/app/login/page.tsx`*
- Supabase Auth is wired (SSR client, server client, middleware)
- Login and logout work through Supabase
- `/api/v1/auth/me` returns current user info
- `/api/v1/auth/login` and `/api/v1/auth/logout` handle sessions
- Status: ✅ Working (basic auth) | 📝 RBAC not enforced

### API Endpoints (What Exists)
*Files: `src/app/api/*`*
- `/api/health` — health check endpoint ✅ Working
- `/api/v1/auth/login` — user login ✅ Working
- `/api/v1/auth/logout` — user logout ✅ Working
- `/api/v1/auth/me` — current user info ✅ Working
- `/api/v1/users` — list/create users ✅ Working
- `/api/v1/users/[id]` — get/update user ✅ Working
- `/api/v1/users/[id]/deactivate` — deactivate user ✅ Working
- `/api/v1/users/[id]/reactivate` — reactivate user ✅ Working
- `/api/v1/roles` — list/create roles ✅ Working
- `/api/v1/roles/[id]` — get/update/delete role ✅ Working
- `/api/v1/audit-log` — view audit log entries ✅ Working
- `/api/cron/cleanup` — scheduled cleanup job ✅ Working
- `/api/cron/process-jobs` — scheduled job processing ✅ Working
- `/api/docs` — API documentation ✅ Working
- `/api/docs/gaps` — gap tracker data ✅ Working
- **No CRUD endpoints exist for:** jobs, invoices, vendors, clients, budgets, draws, POs, estimates, change orders, daily logs, selections, RFIs, submittals, punch lists, contracts, proposals, leads, time entries

### Database Tables (Existing in Supabase)
| Table | Purpose | Status |
|-------|---------|--------|
| companies | Multi-tenant company records | ✅ Schema exists |
| users | User accounts linked to companies | ✅ Schema exists |
| roles | RBAC role definitions | ✅ Schema exists |
| jobs | Construction projects | ✅ Schema exists |
| invoices | Vendor invoices | ✅ Schema exists |
| draws | Draw requests | ✅ Schema exists |
| audit_log | General audit trail | ✅ Schema exists |
| auth_audit_log | Authentication events | ✅ Schema exists |
| api_metrics | API usage tracking | ✅ Schema exists |

### Navigation
*File: `src/components/skeleton/unified-nav.tsx`*
- Unified top navigation bar shared across all skeleton pages
- Detects context (company-level vs job-level) and adjusts menu items
- Links to all major sections
- Status: 🚧 Mock Data (navigation works, routes to skeleton pages)

### Shared UI Components
- **FilterBar** — Reusable search, tab filters, dropdown filters, sort, view mode toggle (grid/list). Used on nearly every list page.
- **AIFeaturesPanel** — Expandable panel showing planned AI features for each page. Appears across all skeleton previews.
- **AIAssistantPanel** — Chat-style AI assistant sidebar for asking questions about a job or the system.
- Status: 🚧 Mock Data (UI renders, no real data or AI connected)

---

## Pages & Features

---

### /login — Login Page
*File: `src/app/login/page.tsx`*
*Purpose: The entry point for all users. Authenticate with email and password to access the system.*

#### Elements

**Login form (email + password)**
- **What it does:** Authenticates a user against Supabase Auth and creates a session
- **UI effect:** On submit, button changes to "Signing in..." with a spinning loader icon. On success, redirects to `/dashboard` and refreshes the router. On failure, a red error banner appears below the form title showing the error message (e.g., "Invalid login credentials")
- **Backend effect:** Calls `supabase.auth.signInWithPassword({ email, password })`. Supabase creates a JWT session stored in cookies via the SSR middleware. INSERT into `auth_audit_log` (event_type: 'login', ip_address, timestamp) happens automatically via auth hooks
- **Other pages affected:** All authenticated pages become accessible. Dashboard loads with user-specific data
- **Notifications:** None currently. SHOULD send email notification on login from new device/IP when security module is built
- **Syncs:** None
- **Reverse action:** Click "Sign out" from the navigation bar on any authenticated page
- **Who can use it:** Any user with valid credentials (all roles)
- **Only shows when:** User is NOT authenticated. Middleware redirects authenticated users away from /login
- **Validation:** Email field requires valid email format (HTML5 type="email"). Password field required. Both fields disabled during loading state
- **Error states:** "Invalid login credentials" — wrong email or password. "An unexpected error occurred" — network failure or Supabase outage. Error banner persists until next submission attempt clears it
- **Connected to:** After successful login, the dashboard page loads with the user's company context
- **Status:** ✅ Working

**"Email" input field**
- **What it does:** Captures the user's email address for authentication
- **UI effect:** Standard text input with placeholder "you@example.com". Disabled with reduced opacity while login is in progress
- **Backend effect:** Passed to `supabase.auth.signInWithPassword()` as the `email` parameter
- **Validation:** Required field. Must be valid email format (browser-native validation via type="email")
- **Error states:** Browser shows native validation tooltip if format is invalid on submit
- **Status:** ✅ Working

**"Password" input field**
- **What it does:** Captures the user's password for authentication
- **UI effect:** Masked input (type="password") with placeholder dots. Disabled while login is in progress
- **Backend effect:** Passed to `supabase.auth.signInWithPassword()` as the `password` parameter
- **Validation:** Required field. No minimum length enforced on the login form (Supabase enforces during signup)
- **Error states:** No specific password error — shows combined auth error from Supabase
- **Status:** ✅ Working

**"Sign in" button**
- **What it does:** Submits the login form to authenticate the user
- **UI effect:** Full-width primary button. On click, changes text to "Signing in..." with a spinning Loader2 icon. Button becomes disabled during the request. On success, page redirects to `/dashboard`. On failure, returns to normal state and error banner appears
- **Backend effect:** Triggers `supabase.auth.signInWithPassword()`. On success, sets auth cookies and creates session
- **Validation:** Form validates both email and password are present before submitting
- **Error states:** Disabled state prevents double-submission. Network errors caught by try/catch and displayed
- **Status:** ✅ Working

---

### /skeleton — Company Dashboard (Home)
*File: `src/app/(skeleton)/skeleton/page.tsx`*
*Purpose: The first thing you see when you log in. Shows your cash position, active jobs, today's schedule, alerts, and AI insights at a glance. This is the daily command center for a construction company owner or PM.*

#### Elements

**"Cash Position" metric card** (clickable — links to `/skeleton/financial/dashboard`)
- **What it does:** Shows the company's current bank cash position and recent change, then navigates to the full financial dashboard when clicked
- **UI effect:** Card with large dollar amount ($847,500), green upward trend indicator showing +$125,000 change. On hover, border highlights to primary color with shadow elevation. Entire card is a `<Link>` — clicking anywhere navigates to `/skeleton/financial/dashboard`
- **Backend effect:** SHOULD query a `bank_accounts` or `cash_position` table/view. Currently hardcoded to `$847,500` with `+$125,000` change. When wired: SELECT SUM(balance) FROM bank_accounts WHERE company_id = :company_id. Cash change calculated from prior period
- **Other pages affected:** None (read-only display)
- **Notifications:** None. SHOULD trigger alert if cash drops below company-configured threshold
- **Syncs:** SHOULD pull from bank feed integration or QuickBooks sync
- **Who can use it:** owner, admin, PM, office (financial data). SHOULD be hidden from field, read_only roles based on permission settings
- **Only shows when:** Always visible on dashboard
- **Status:** 🚧 Mock Data ($847,500 hardcoded)

**"Accounts Receivable" metric card** (clickable — links to `/skeleton/financial/receivables`)
- **What it does:** Shows total money owed to the company and number of overdue items, then navigates to receivables detail
- **UI effect:** Card shows $485,000 total AR, amber warning indicator with "3 overdue" text. Hover adds border highlight and shadow. Click navigates to `/skeleton/financial/receivables`
- **Backend effect:** SHOULD query: SELECT SUM(amount_due) FROM draws WHERE company_id = :company_id AND status IN ('submitted', 'approved') AND payment_received = false. Overdue count: WHERE due_date < NOW()
- **Other pages affected:** None (read-only)
- **Who can use it:** owner, admin, PM, office
- **Status:** 🚧 Mock Data ($485,000 / 3 overdue hardcoded)

**"Accounts Payable" metric card** (clickable — links to `/skeleton/financial/payables`)
- **What it does:** Shows total money the company owes vendors and count of bills due this week
- **UI effect:** Card shows $312,000 total AP, muted text "5 due this week". Hover adds border highlight. Click navigates to `/skeleton/financial/payables`
- **Backend effect:** SHOULD query: SELECT SUM(net_amount) FROM invoices WHERE company_id = :company_id AND status = 'approved' AND paid = false. Due this week: WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
- **Who can use it:** owner, admin, PM, office
- **Status:** 🚧 Mock Data ($312,000 / 5 due hardcoded)

**"Gross Margin" metric card** (clickable — links to `/skeleton/financial/profitability`)
- **What it does:** Shows company-wide gross margin percentage and monthly trend
- **UI effect:** Card shows 17.5% gross margin, red downward trend showing -0.5% this month (red because margin is declining). Click navigates to `/skeleton/financial/profitability`
- **Backend effect:** SHOULD calculate: (SUM(contract_value) - SUM(projected_cost)) / SUM(contract_value) * 100 across all active jobs WHERE company_id = :company_id. Monthly change from prior month calculation
- **Who can use it:** owner, admin, PM
- **Status:** 🚧 Mock Data (17.5% / -0.5% hardcoded)

**"Active Jobs" list** (4 job rows, each clickable)
- **What it does:** Shows the most important active jobs with real-time status. Each row links to that job's dashboard
- **UI effect:** Card header shows "Active Jobs" with count badge (4) and "View all" link. Each job row shows: name, client name (separated by a dot), status badge ("On Track" green or "Attention" amber with icon), progress bar with percentage, next milestone name and date. Hover highlights the row background. Click navigates to `/skeleton/jobs/[id]`
- **Backend effect:** SHOULD query: SELECT j.*, c.name as client_name, (SELECT name FROM milestones WHERE job_id = j.id AND status = 'upcoming' ORDER BY date LIMIT 1) as next_milestone FROM jobs j JOIN clients c ON j.client_id = c.id WHERE j.company_id = :company_id AND j.status = 'active' ORDER BY ai_risk_score DESC LIMIT 4
- **Other pages affected:** None (read-only display linking to job pages)
- **Who can use it:** All roles (content may vary by permission level)
- **Status:** 🚧 Mock Data (4 hardcoded jobs: Smith Residence 65%, Johnson Beach House 32%, Williams Remodel 88%, Davis Custom Home 12%)

**"View all" link** (in Active Jobs header)
- **What it does:** Navigates to the full jobs list page
- **UI effect:** Small primary-colored text link with right arrow icon. Click navigates to `/skeleton/jobs`
- **Backend effect:** None (navigation only)
- **Status:** 🚧 Mock Data (link works, jobs list is mock data)

**"Today's Schedule" section** (3 event rows)
- **What it does:** Shows today's calendar events — inspections, meetings, deliveries — across all jobs
- **UI effect:** Card header shows "Today" with calendar icon and "Calendar" link. Each event row shows time (e.g., "9:00 AM"), a colored dot (brown for inspection, orange for meeting, green for delivery), and event description. Rows have hover highlight and cursor pointer. Clicking an event SHOULD navigate to the relevant job or calendar entry
- **Backend effect:** SHOULD query: SELECT * FROM calendar_events WHERE company_id = :company_id AND date = CURRENT_DATE ORDER BY start_time. Currently shows 3 hardcoded events
- **Other pages affected:** None currently. SHOULD link to specific job pages or calendar detail
- **Who can use it:** All roles
- **Status:** 🚧 Mock Data (3 events hardcoded, click does nothing)

**"Calendar" link** (in Today's Schedule header)
- **What it does:** Navigates to the full company-wide calendar
- **UI effect:** Small primary-colored text link. Click navigates to `/skeleton/operations/calendar`
- **Backend effect:** None (navigation only)
- **Status:** 🚧 Mock Data (link works)

**"New Lead" quick action button**
- **What it does:** SHOULD open a new lead creation form or navigate to leads page with create modal open
- **UI effect:** Small card-style button with target icon (brown) and "New Lead" text. Hover lightens background. Click navigates to `/skeleton/leads`
- **Backend effect:** Currently just navigates. SHOULD eventually open a create form that INSERTs into a `leads` table: INSERT INTO leads (company_id, name, source, status, created_by) VALUES (:company_id, :name, :source, 'new_inquiry', :user_id)
- **Other pages affected:** /skeleton/leads — new lead would appear in the pipeline
- **Who can use it:** owner, admin, PM, office
- **Status:** 🚧 Mock Data (navigates to leads page, no create form)

**"New Estimate" quick action button**
- **What it does:** SHOULD open a new estimate creation form or navigate to estimates page
- **UI effect:** Small card-style button with document icon (green) and "New Estimate" text. Click navigates to `/skeleton/estimates`
- **Backend effect:** Currently just navigates. SHOULD create: INSERT INTO estimates (company_id, status, created_by) VALUES (:company_id, 'draft', :user_id)
- **Other pages affected:** /skeleton/estimates — new estimate would appear in the list
- **Who can use it:** owner, admin, PM, estimator
- **Status:** 🚧 Mock Data (navigates to estimates page, no create form)

**"Enter Invoice" quick action button**
- **What it does:** SHOULD open an invoice entry form (manual or upload) or navigate to invoices page
- **UI effect:** Small card-style button with dollar icon (amber) and "Enter Invoice" text. Click navigates to `/skeleton/invoices`
- **Backend effect:** Currently just navigates. SHOULD either: (a) open AI invoice upload modal for PDF OCR extraction, or (b) open manual entry form. INSERT INTO invoices (company_id, vendor_id, job_id, amount, status) VALUES (...)
- **Other pages affected:** /skeleton/invoices, /skeleton/jobs/[id]/invoices, /skeleton/jobs/[id]/budget (committed costs update)
- **Who can use it:** owner, admin, PM, office
- **Status:** 🚧 Mock Data (navigates to invoices page, no create form)

**"Add Vendor" quick action button**
- **What it does:** SHOULD open a new vendor creation form or navigate to vendor directory
- **UI effect:** Small card-style button with users icon (gray) and "Add Vendor" text. Click navigates to `/skeleton/directory/vendors`
- **Backend effect:** Currently just navigates. SHOULD create: INSERT INTO vendors (company_id, name, trade, status) VALUES (:company_id, :name, :trade, 'active')
- **Other pages affected:** /skeleton/vendors — new vendor appears. Vendor available in dropdowns across all job pages
- **Who can use it:** owner, admin, PM, office
- **Status:** 🚧 Mock Data (navigates to vendor directory, no create form)

**Alerts panel** (5 alert rows)
- **What it does:** Shows the most urgent items requiring attention, prioritized by severity. Each alert links to the relevant page for resolution
- **UI effect:** Card header shows "Alerts" with warning icon and red badge showing count of urgent alerts ("2 urgent"). Scrollable list (max height 288px). Each alert row has: severity dot (red for high, amber for medium, gray-brown for info), message text, and right chevron. Hover highlights row and changes text color to primary. Click navigates to the alert's action URL
- **Backend effect:** SHOULD be generated from multiple sources: overdue draws (receivables), expiring insurance (compliance), overdue selections (jobs), upcoming deliveries (operations), upcoming inspections (jobs). Currently 5 hardcoded alerts
- **Other pages affected:** Each alert links to a different page:
  - "Draw #4 overdue" links to `/skeleton/financial/receivables`
  - "ABC Electric COI expires" links to `/skeleton/compliance/insurance`
  - "Kitchen cabinets selection overdue" links to `/skeleton/jobs/1/selections`
  - "Window delivery tomorrow" links to `/skeleton/operations/deliveries`
  - "Framing inspection scheduled" links to `/skeleton/jobs/1/inspections`
- **Notifications:** SHOULD generate push/email notifications based on severity and user preferences
- **Who can use it:** All roles (filtered by relevance to role)
- **Status:** 🚧 Mock Data (5 hardcoded alerts with working links)

**AI Insights panel** (3 insight cards)
- **What it does:** Shows AI-generated business intelligence and recommendations. Each insight identifies an opportunity or risk and suggests an action
- **UI effect:** Gradient background card (indigo to stone). Header shows sparkle icon and "AI Insights" title. Each insight row shows: category icon (DollarSign, Calendar, TrendingUp), bold title, and descriptive message. Rows have hover highlight. Currently not clickable
- **Backend effect:** SHOULD be generated by AI analysis of: cash flow projections, schedule risk factors, vendor pricing opportunities, and cross-job pattern analysis. Currently 3 hardcoded insights:
  1. "Cash Flow Alert" — suggests accelerating Draw #5
  2. "Schedule Risk" — Johnson Beach House permit dependency
  3. "Margin Opportunity" — ABC Lumber early payment discount
- **Other pages affected:** None currently. SHOULD link to relevant pages (cash flow forecast, job schedule, vendor payments)
- **Who can use it:** owner, admin, PM
- **Status:** 🚧 Mock Data (hardcoded text, no real AI engine)

**Footer stats bar**
- **What it does:** Shows high-level company metrics and provides a link to the full system overview
- **UI effect:** Bottom bar showing: briefcase icon with "8 Active Jobs" text, dollar icon with "$8.4M Under Contract" text, and "System Overview" link with right arrow on the right side. The "System Overview" link hover adds a subtle background
- **Backend effect:** SHOULD query: SELECT COUNT(*) as active_count, SUM(contract_amount) as total_contract FROM jobs WHERE company_id = :company_id AND status = 'active'
- **Who can use it:** All roles
- **Status:** 🚧 Mock Data (8 jobs / $8.4M hardcoded)

**"System Overview" link** (in footer bar)
- **What it does:** Navigates to the full company overview page with detailed metrics
- **UI effect:** Primary text with right arrow icon. Hover adds subtle background. Click navigates to `/skeleton/overview`
- **Backend effect:** None (navigation only)
- **Status:** 🚧 Mock Data (link works)

---

### /skeleton/overview — System Overview
*File: `src/app/(skeleton)/skeleton/overview/page.tsx` + `src/components/skeleton/previews/overview-preview.tsx`*
*Purpose: Big-picture view of the entire company -- all key metrics, trends, AI briefing, team activity, sales pipeline, and meeting prep in one place. This is the "executive dashboard" for weekly review meetings.*

#### Elements

**"Today" button** (header)
- **What it does:** SHOULD reset all date-filtered metrics to today's view
- **UI effect:** Outlined button with clock icon and "Today" text in the header bar. Hover adds background tint. Currently does nothing on click
- **Backend effect:** SHOULD re-fetch all dashboard metrics with date = CURRENT_DATE
- **Status:** 🚧 Mock Data (button renders, no click handler)

**"Full Report" button** (header)
- **What it does:** SHOULD navigate to or generate a comprehensive company report
- **UI effect:** Solid dark button with trending-up icon and "Full Report" text. Hover darkens. Currently does nothing on click
- **Backend effect:** SHOULD navigate to `/skeleton/reports` or generate a PDF company summary report
- **Status:** 🚧 Mock Data (button renders, no click handler)

**Metric cards row** (4 cards: Active Jobs, Revenue MTD, Accounts Receivable, Accounts Payable)
- **What it does:** Shows key company-wide financial and operational metrics with sparkline trend charts. Each card has a "Click to drill down" indicator
- **UI effect:** 4 colored cards in a row. Each shows: icon badge, metric value, label, percentage change with trend arrow, mini sparkline chart, and "Click to drill down" text. Cards have hover shadow effect. Clicking SHOULD navigate to the drill-down page:
  - Active Jobs (18, +3 vs last month) — drills to `/jobs`
  - Revenue MTD ($2.4M, +12.5% vs target) — drills to `/financial/dashboard`
  - Accounts Receivable ($1.8M, -8.3% down) — drills to `/financial/receivables`
  - Accounts Payable ($945K, +5.2% up) — drills to `/financial/payables`
- **Backend effect:** SHOULD query respective aggregate views. Currently all hardcoded
- **Who can use it:** owner, admin, PM, office
- **Status:** 🚧 Mock Data (all values hardcoded, drill-down links not wired)

**AI Insights & Alerts panel** (5 insights)
- **What it does:** Shows AI-generated alerts ranked by severity with category tags, actionability indicators, and related job references
- **UI effect:** Card with sparkle header. Counts badges show "3 high" (red) and "5 total" (amber). Each insight row shows: severity icon (red triangle for high, amber zap for medium), title, "Actionable" badge (green), category badge, job reference badge, and description text. High-severity items have light red background. Rows have hover effect
- **Backend effect:** SHOULD be generated by the AI engine analyzing all company data. Currently 5 hardcoded insights:
  1. Material Cost Alert — lumber prices up 7% (high, actionable)
  2. Cash Flow Opportunity — Miller Addition early invoice (high, actionable)
  3. Crew Efficiency Gain — Johnson project (medium, informational)
  4. Overdue Invoice Follow-up — 3 invoices over 45 days (high, actionable)
  5. Selection Delay Risk — Smith Residence tile (medium, actionable)
- **Who can use it:** owner, admin, PM
- **Status:** 🚧 Mock Data (no AI engine)

**"View all insights" button** (footer of AI panel)
- **What it does:** SHOULD navigate to a full AI insights page or expand to show all insights
- **UI effect:** Text button with right chevron in panel footer. Hover changes text color
- **Backend effect:** None currently. SHOULD navigate to `/skeleton/ai-assistant` or an insights list
- **Status:** 🚧 Mock Data (button renders, no click handler)

**Needs Attention panel** (4 items)
- **What it does:** Shows prioritized action items requiring human intervention, sorted by urgency and age
- **UI effect:** Card with bell icon header, red badge "4 items", and subtitle "Prioritized by urgency and age - dismiss or snooze". Each item shows: urgency-colored icon, title, urgency badge (critical/high/medium), job reference badge, description, module source, and age. Items have hover effect
- **Backend effect:** SHOULD aggregate: overdue draws, expired vendor insurance, stalled RFIs, budget threshold breaches. Currently 4 hardcoded items:
  1. Overdue draw approval — 5 days (critical)
  2. Expired vendor insurance — 5 days (high)
  3. Stalled RFI — 8 days (high)
  4. Budget threshold reached — today (medium)
- **Status:** 🚧 Mock Data (no dismiss/snooze functionality)

**Sales Pipeline summary** (4 stages)
- **What it does:** Shows the sales funnel from leads through contracts with counts, values, and conversion rates
- **UI effect:** Card with target icon. Header shows total opportunity count (28) and total value ($3.25M). Each pipeline stage shows: name, opportunity count, value, conversion rate percentage, and a horizontal progress bar. Stages: Leads (12, $580K, 42%), Estimates (8, $820K, 63%), Proposals (5, $1.2M, 60%), Contracts (3, $650K, 100%)
- **Backend effect:** SHOULD query: SELECT stage, COUNT(*) as count, SUM(estimated_value) as value FROM leads WHERE company_id = :company_id GROUP BY stage
- **Who can use it:** owner, admin, PM
- **Status:** 🚧 Mock Data

**"View pipeline" button** (footer of Pipeline panel)
- **What it does:** SHOULD navigate to the full leads/pipeline page
- **UI effect:** Text button with right chevron. Click SHOULD navigate to `/skeleton/leads`
- **Backend effect:** None (navigation)
- **Status:** 🚧 Mock Data (button renders, no click handler)

**AI Assistant panel** (chat interface)
- **What it does:** Provides a chat-style AI assistant for asking questions about all projects
- **UI effect:** Chat panel with message input. Shows "All Projects" context. Can ask questions like "What's the status of the Smith Residence?" and get AI-generated responses
- **Backend effect:** SHOULD send user messages to an AI endpoint that has context of all company data. Currently shows mock conversation
- **Who can use it:** All roles
- **Status:** 🚧 Mock Data (UI renders, no AI backend)

**Quick Actions panel** (6 actions)
- **What it does:** Provides one-click access to the most common daily tasks
- **UI effect:** Card with zap icon and "3-click rule" subtitle. Each action shows: colored icon, title, description, keyboard shortcut (if any), and right arrow. Actions have hover effect. 6 actions listed:
  1. Start New Job (Ctrl+N shortcut)
  2. Create Daily Log
  3. Send Invoice
  4. View Reports
  5. Team Schedule
  6. Approve Invoices ("3 invoices pending your approval")
- **Backend effect:** None currently. Each SHOULD either navigate to the appropriate page or open a creation modal
- **Who can use it:** All roles (filtered by permissions)
- **Status:** 🚧 Mock Data (buttons render, no click handlers)

**Team Activity panel** (4 team members)
- **What it does:** Shows real-time status of team members -- who is online, who is in the field, and what they are working on
- **UI effect:** Card with users icon. Each member row shows: avatar circle with initials and gradient background, online status dot (green = online, brown = in field, gray = offline), name, role, current activity text, and active job count badge. Rows have hover effect
- **Backend effect:** SHOULD query: SELECT u.*, (SELECT COUNT(*) FROM job_assignments WHERE user_id = u.id AND status = 'active') as active_jobs FROM users WHERE company_id = :company_id AND status = 'active'. Real-time presence via Supabase Realtime
- **Who can use it:** owner, admin, PM, superintendent
- **Status:** 🚧 Mock Data (4 hardcoded team members)

**"View team directory" button** (footer of Team panel)
- **What it does:** SHOULD navigate to the full team directory page
- **UI effect:** Text button with right chevron. Click SHOULD navigate to `/skeleton/directory/team`
- **Backend effect:** None (navigation)
- **Status:** 🚧 Mock Data (button renders, no click handler)

**Weekly Meeting Prep panel** (4 agenda items)
- **What it does:** AI-generated agenda items for the weekly team meeting, pulled from project data across all jobs
- **UI effect:** Card with calendar icon header. "Generate Agenda" button in header. Each agenda item shows: status badge (alert/update/decision in red/blue/amber), topic text, source module, and job reference badge. Rows have hover effect
- **Backend effect:** SHOULD be AI-generated from: schedule delays, budget alerts, upcoming inspections, new contracts. Currently 4 hardcoded items
- **Who can use it:** owner, admin, PM
- **Status:** 🚧 Mock Data

**"Generate Agenda" button** (Meeting Prep header)
- **What it does:** SHOULD trigger AI to generate a fresh meeting agenda based on current project data
- **UI effect:** Small outlined button with text "Generate Agenda". Hover changes background. Currently does nothing
- **Backend effect:** SHOULD call AI endpoint: POST /api/v1/ai/meeting-agenda with company_id. AI analyzes all active jobs and returns prioritized agenda items
- **Status:** 🚧 Mock Data (button renders, no click handler)

**AI-Powered Features panel** (5 feature cards)
- **What it does:** Documents the planned AI capabilities for the overview page with confidence scores and trigger types
- **UI effect:** Expandable panel with amber gradient bar. Shows 5 AI feature cards: Health Scoring (92% confidence), Risk Detection (87%), Progress Tracking (95%), Action Priorities (88%), Trend Analysis (91%). Each card shows feature name, trigger type, insight description, and confidence percentage
- **Backend effect:** None — this is a documentation/spec panel
- **Status:** 🚧 Mock Data (descriptive only)

**Company Health Summary bar** (bottom)
- **What it does:** Shows an AI-generated one-paragraph summary of overall company health
- **UI effect:** Amber gradient bar at the bottom with sparkle icon, "Company Health:" label, and paragraph of AI-generated summary text. "AI-generated" badge at the end
- **Backend effect:** SHOULD be generated daily by AI analyzing all company metrics
- **Status:** 🚧 Mock Data (hardcoded text)

---

### /skeleton/jobs — Jobs List
*File: `src/app/(skeleton)/skeleton/jobs/page.tsx` + `src/components/skeleton/previews/jobs-list-preview.tsx`*
*Purpose: See all your construction projects in one place. Filter by status, search by name, click into any job for details. This is the primary navigation hub for project managers.*

#### Elements

**"UI Preview" tab button**
- **What it does:** Switches the page content to show the visual prototype of the jobs list
- **UI effect:** Tab button at top. When active: primary background with white text. When inactive: muted text with hover accent. Click switches content below to the `<JobsListPreview />` component
- **Backend effect:** None (local state toggle)
- **Connected to:** "Specification" tab — they are mutually exclusive
- **Status:** ✅ Working (tab switching works)

**"Specification" tab button**
- **What it does:** Switches the page content to show the detailed technical specification for the jobs list feature
- **UI effect:** Tab button at top. Shows `<PageSpec />` component with data fields, AI features, connections, and ASCII mockup
- **Backend effect:** None (local state toggle)
- **Connected to:** "UI Preview" tab
- **Status:** ✅ Working (tab switching works)

**"Enter Job View" button**
- **What it does:** Navigates directly to a sample job dashboard to preview the job detail experience
- **UI effect:** Dark solid button with "Enter Job View" text and right arrow icon, positioned right-aligned in the tab bar. Click navigates to `/skeleton/jobs/1`
- **Backend effect:** None (navigation to hardcoded job ID 1)
- **Status:** 🚧 Mock Data (navigates to mock job)

**Search box** (in FilterBar)
- **What it does:** Filters the jobs list in real-time as the user types, matching against job name, client name, address, and PM name
- **UI effect:** Text input with placeholder "Search jobs...". As the user types, the job cards below filter instantly (client-side filtering on mock data). Result count updates in the FilterBar (e.g., "4 of 6")
- **Backend effect:** Currently filters mock data array using `matchesSearch()` utility checking fields: name, client, address, pmAssigned. SHOULD query: SELECT * FROM jobs WHERE company_id = :company_id AND (name ILIKE :search OR client_name ILIKE :search OR address ILIKE :search)
- **Connected to:** Job cards grid, result count display
- **Status:** 🚧 Mock Data (filtering works on local mock data only)

**Status filter tabs** (All Jobs, Pre-Con, Active, Closeout, Complete)
- **What it does:** Filters jobs by their current lifecycle status
- **UI effect:** Horizontal tab bar with count badges. "All Jobs (6)", "Pre-Con (1)", "Active (3)", "Closeout (1)", "Complete (1)". Active tab has primary styling. Click switches filter and updates the displayed job cards
- **Backend effect:** Filters mock data by `job.status`. SHOULD add WHERE status = :status to the query
- **Connected to:** Job cards grid, result count display
- **Status:** 🚧 Mock Data (filtering works on local mock data)

**Sort dropdown** (Name, Contract Value, Progress, Start Date)
- **What it does:** Changes the sort order of the jobs list
- **UI effect:** Dropdown selector with options: Name, Contract Value, Progress, Start Date. Adjacent sort direction button toggles ascending/descending (arrow icon flips)
- **Backend effect:** Sorts mock data array using `sortItems()` utility. SHOULD add ORDER BY :sort_field :direction to query
- **Connected to:** Job cards grid
- **Status:** 🚧 Mock Data (sorting works on local mock data)

**Sort direction toggle button**
- **What it does:** Toggles between ascending and descending sort order
- **UI effect:** Small button with up/down arrow icon. Click toggles sort direction state. Icon changes to indicate current direction
- **Backend effect:** Reverses sort direction in `sortItems()` call
- **Connected to:** Sort dropdown, job cards grid
- **Status:** 🚧 Mock Data (works on local mock data)

**Grid/List view toggle**
- **What it does:** Switches between card grid view and table list view for the jobs
- **UI effect:** Toggle buttons with grid/list icons. Active view has highlighted styling. Currently only grid view is implemented in the preview
- **Backend effect:** Toggles `viewMode` state between 'grid' and 'list'. Local state only
- **Connected to:** Job cards grid
- **Status:** 🚧 Mock Data (toggle works, but list view layout may not be fully styled)

**"+ New Job" button** (in FilterBar actions)
- **What it does:** SHOULD open a create-job form or navigate to the job creation page
- **UI effect:** Primary-styled button with plus icon and "New Job" text in the FilterBar actions area. Hover darkens. Currently the onClick handler is an empty function `() => {}`
- **Backend effect:** SHOULD either: (a) navigate to `/jobs/new` (the authenticated create form exists at `src/app/(authenticated)/jobs/new/page.tsx`), or (b) open a modal with create form. The real create form INSERTs into `jobs` table: INSERT INTO jobs (company_id, name, job_number, address, city, state, zip, contract_amount, contract_type, start_date, target_completion, notes, status) VALUES (...). Status defaults to 'pre_construction'
- **Other pages affected:** /skeleton/jobs — new job appears in list. /skeleton — dashboard active jobs count updates. All financial reports reflect new contract value
- **Notifications:** SHOULD notify team members assigned to the job. SHOULD notify admin/owner of new job creation
- **Reverse action:** Archive (soft delete) the job. Jobs are never hard deleted
- **Who can use it:** owner, admin, PM
- **Validation:** Job Name is required. All other fields optional. Contract amount must be a valid number if provided
- **Error states:** "Not authenticated" if session expired. "No company found" if user profile missing company_id. Supabase insert error displayed in red banner
- **Status:** 📝 Not Yet Implemented (button renders with empty onClick, no modal or navigation)

**Quick Stats row** (5 stat cards)
- **What it does:** Shows aggregate job portfolio statistics at a glance
- **UI effect:** 5 stat cards in a row: Total Jobs (6), Total Contract Value ($4.26M), Pre-Construction (1 jobs), Active (3 in progress), Closeout/Complete (1 / 1). Each card has a colored icon and value
- **Backend effect:** SHOULD query: SELECT status, COUNT(*), SUM(contract_amount) FROM jobs WHERE company_id = :company_id GROUP BY status
- **Status:** 🚧 Mock Data (calculated from hardcoded mock array)

**Job cards** (grid of 6 clickable cards)
- **What it does:** Each card displays a job summary and links to the job dashboard when clicked
- **UI effect:** 3-column grid of cards. Each card shows:
  - Status-colored building icon and job name/client name
  - "..." menu button (top right, does nothing on click)
  - Address with map pin icon
  - Contract value with dollar icon
  - Progress bar with percentage (color matches status)
  - PM avatar (initial circle) and name, status badge
  - Alert banner (amber) if job has an alert message
  - Entire card is a `<Link>` to `/skeleton/jobs/[id]`
  - Hover adds shadow elevation
- **Backend effect:** SHOULD query jobs table with joins. Currently renders from `mockJobs` array (6 jobs)
- **Connected to:** Search, status tabs, sort — all filter/sort these cards
- **Status:** 🚧 Mock Data (6 hardcoded jobs with working links)

**"..." menu button** (on each job card)
- **What it does:** SHOULD open a context menu with quick actions for the job (edit, archive, change status, assign PM, etc.)
- **UI effect:** Small icon button in top-right of each job card with horizontal dots icon. Hover adds background tint. Currently does nothing on click
- **Backend effect:** SHOULD present options: Edit Job, Change Status, Assign PM, Archive Job. Each would trigger the corresponding API call
- **Reverse action:** Varies by action chosen from menu
- **Who can use it:** owner, admin, PM
- **Status:** 📝 Not Yet Implemented (button renders, no dropdown menu)

**AI Insights bar** (bottom)
- **What it does:** Shows AI-generated insights about the job portfolio
- **UI effect:** Amber gradient bar at the bottom with sparkle icon, "AI Insights:" label, and two insights separated by a pipe character. Currently shows: "Johnson Beach House permit likely approved by Thursday based on county patterns" and "Miller Addition on track for early completion"
- **Backend effect:** SHOULD be generated by AI analyzing job data patterns
- **Status:** 🚧 Mock Data (hardcoded text)

**AI Features Panel** (5 feature descriptions)
- **What it does:** Documents planned AI capabilities for the jobs list (Portfolio Health, Resource Allocation, Timeline Risks, Profitability Ranking, Capacity Planning)
- **UI effect:** Expandable panel with feature descriptions
- **Status:** 🚧 Mock Data (descriptive only)

---

### /skeleton/jobs/[id] — Job Overview (Job Dashboard)
*File: `src/app/(skeleton)/skeleton/jobs/[id]/page.tsx` + `src/components/skeleton/previews/job-overview-preview.tsx`*
*Purpose: Everything about a single job at a glance -- budget health, schedule status, team, recent activity, weather, client info. This is the daily command center for a PM or superintendent managing a specific project.*

#### Elements

**"UI Preview" / "Specification" tabs**
- **What it does:** Toggle between the visual preview and the detailed technical specification
- **UI effect:** Same tab mechanism as the jobs list page. "UI Preview" shows `<JobOverviewPreview />`, "Specification" shows `<PageSpec />` with full data fields, connections, and AI features
- **Status:** ✅ Working (tab switching)

**Job header** (SummaryHeader component)
- **What it does:** Displays the complete identity and status of the job with drill-down links
- **UI effect:** Full-width header bar showing:
  - Large status-colored building icon
  - Job name in bold ("Smith Residence")
  - Status badge ("Active" green)
  - Job number in monospace ("J-2026-001")
  - Project type badge ("Custom Home")
  - AI Health Score badge (color-coded: green >= 80, amber >= 60, red < 60) — currently "Health: 72/100" in amber
  - Warranty status badge ("In Construction")
  - Client name with email/phone icon links
  - Address with map pin icon
  - Start date, expected completion, AI predicted completion (amber badge if different)
  - Square footage ("4,200 SF")
  - Subdivision/lot info ("Ocean Ridge - Lot 15")
  - Day count ("Day 28 of ~228 | ~200 days remaining")
  - PM and Superintendent names (right side)
  - "Client Portal" link with external link icon
- **Backend effect:** SHOULD query: SELECT j.*, c.name as client_name, c.email, c.phone FROM jobs j JOIN clients c ON j.client_id = c.id WHERE j.id = :id AND j.company_id = :company_id
- **Status:** 🚧 Mock Data (all values hardcoded for "Smith Residence")

**Client email link** (mail icon in header)
- **What it does:** Opens the user's email client with the client's email pre-filled
- **UI effect:** Small mail icon next to client name. Click opens `mailto:jsmith@email.com`
- **Backend effect:** None (mailto link)
- **Status:** 🚧 Mock Data (email is hardcoded)

**Client phone link** (phone icon in header)
- **What it does:** Opens the phone dialer with the client's number
- **UI effect:** Small phone icon next to client name. Click opens `tel:(910) 555-1234`
- **Backend effect:** None (tel link)
- **Status:** 🚧 Mock Data (phone is hardcoded)

**"Client Portal" link** (in header, right side)
- **What it does:** SHOULD navigate to the client-facing portal view for this job
- **UI effect:** Small text link with external link icon. Currently does nothing — SHOULD navigate to `/skeleton/portal?job=1` or similar
- **Backend effect:** None (navigation)
- **Status:** 🚧 Mock Data (button renders, no navigation)

**Job navigation tabs** (Overview, Budget, Schedule, Invoices, Photos, Files, Daily Logs)
- **What it does:** Navigate between job sub-pages. Currently only "Overview" tab is highlighted as active
- **UI effect:** Horizontal tab bar with 7 tabs. Active tab has stone-colored bottom border. Inactive tabs have transparent border with hover effect. Click SHOULD navigate to the corresponding sub-page
- **Backend effect:** SHOULD navigate to `/skeleton/jobs/[id]/budget`, etc. Currently tabs are visual only — the actual job sub-pages are accessed via the skeleton sidebar navigation
- **Status:** 🚧 Mock Data (tabs render but do not navigate — sub-pages are separate routes)

**Metric cards row** (4 cards: Contract Value, Budget Status, Schedule Status, Change Orders)
- **What it does:** Shows the 4 most critical job metrics with trend indicators and drill-down links
- **UI effect:** 4 colored cards:
  1. Contract Value: $2.45M, "Original: $2.25M (+$200K COs)", neutral gray
  2. Budget Status: 11.2% projected margin, "-3.8% from 15% target" warning trend, amber
  3. Schedule Status: "+5 days vs. baseline", "Weather delays (AI predicted)" warning, amber
  4. Change Orders: $200K, "4 approved, 2 pending", "+$45K this month" good trend, green
  Each has "View details" link text. SHOULD navigate to corresponding sub-page (/budget, /schedule, /change-orders)
- **Backend effect:** SHOULD query aggregated budget, schedule, and change order data for the job
- **Status:** 🚧 Mock Data (all values hardcoded, no drill-down navigation)

**Project Progress visualization** (phase breakdown)
- **What it does:** Shows overall completion percentage and progress by construction phase
- **UI effect:** Card with "Project Progress" header and large 65% number. Wide progress bar (green fill). Below: 8 phase rows with mini progress bars and percentages: Site Work (100%), Foundation (100%), Framing (85%), Roofing (60%), MEP Rough-In (20%), Insulation & Drywall (0%), Finishes (0%), Final (0%). Completed phases green, in-progress blue, not-started gray
- **Backend effect:** SHOULD be calculated from schedule task completion or budget cost code completion
- **Status:** 🚧 Mock Data

**Weather widget** (3-day forecast)
- **What it does:** Shows current weather and 3-day forecast for the job site location, flagging days with outdoor work risk
- **UI effect:** Card with "Site Weather" header and "Wilmington, NC" location. Current weather: sun icon, 72F, "Sunny". Forecast rows: Wed (74/58 Sunny), Thu (65/52 Rain - "Outdoor risk" red badge), Fri (62/50 Rain - "Outdoor risk" red badge). Rain days have red background tint
- **Backend effect:** SHOULD fetch from NOAA weather API using job's lat/lng coordinates. Currently hardcoded
- **Notifications:** SHOULD notify superintendent when rain is forecast for next day (outdoor work impact)
- **Status:** 🚧 Mock Data (no weather API integration)

**Key Milestones tracker** (8 milestones)
- **What it does:** Shows the project milestone timeline with AI-predicted completion dates
- **UI effect:** Card with "Key Milestones" header. Vertical timeline with color-coded milestone icons: green checkmarks for completed, blue flag for current, gray diamonds for upcoming. Each milestone shows: name, target date, and (if different) AI-predicted date in amber. Completed milestones show actual completion date in green. 8 milestones from "Permit Issued" through "Substantial Completion"
- **Backend effect:** SHOULD query: SELECT * FROM milestones WHERE job_id = :id ORDER BY sort_order
- **Status:** 🚧 Mock Data

**Project Team roster** (5 team members)
- **What it does:** Shows all team members and vendor/trade assignments for the job with contact info
- **UI effect:** Card with "Project Team" header and member count. Each row shows: name, role badge, trade badge (for vendors), company name, status badge (active green, scheduled blue, completed gray), and phone icon link. 5 members: PM, Superintendent, and 3 vendor assignments
- **Backend effect:** SHOULD query: SELECT u.*, ja.role, ja.status FROM job_assignments ja JOIN users u ON ja.user_id = u.id WHERE ja.job_id = :id UNION SELECT v.*, 'vendor' as role, vja.status FROM vendor_job_assignments vja JOIN vendors v ON vja.vendor_id = v.id WHERE vja.job_id = :id
- **Status:** 🚧 Mock Data

**Phone link** (on each team member)
- **What it does:** Opens phone dialer for the team member
- **UI effect:** Small phone icon on right side of each team row. Click opens `tel:` link
- **Status:** 🚧 Mock Data (phone numbers hardcoded)

**Risk Register** (3 risk items)
- **What it does:** Shows identified risks for the job with likelihood/impact assessment and AI vs manual source
- **UI effect:** Card with "Risk Register" header and "2 open" amber badge. Each risk row shows: description text, likelihood badge (L: high/medium/low), impact badge (I: high/medium/low), "AI-detected" badge for AI-sourced risks, status badge (open red, mitigated green, occurred amber). 3 risks: weather delays (occurred), selection delays (open), material cost escalation (open)
- **Backend effect:** SHOULD query: SELECT * FROM risk_items WHERE job_id = :id AND status != 'closed' ORDER BY likelihood DESC, impact DESC
- **Status:** 🚧 Mock Data

**Next Steps card** (5 AI-recommended actions)
- **What it does:** Shows an AI-prioritized list of the next actions the PM and superintendent should take on this job
- **UI effect:** Gradient card (stone to indigo) with numbered steps. Each step shows: number circle, action text, priority badge (urgent red, high amber, medium blue), and assignee name. "AI Recommended" badge in header. 5 steps: Schedule inspection, Follow up on submittal, Review draw request, Confirm delivery, Send weekly update
- **Backend effect:** SHOULD be AI-generated from: schedule dependencies, overdue items, upcoming milestones, client communication history
- **Who can use it:** owner, admin, PM, superintendent
- **Status:** 🚧 Mock Data (no AI engine)

**Quick Links grid** (12 navigation shortcuts)
- **What it does:** Provides one-click access to all job sub-pages with badge counts and alert indicators
- **UI effect:** 12 square button tiles in a grid. Each shows: colored icon, label, and optional count badge or alert indicator. Links: Budget (alert), Schedule (alert), Daily Logs (47), Photos (234), Documents (56), Change Orders (6), Invoices (4), Selections (28), RFIs (12), Team, Punch List (0), Permits (3). SHOULD navigate to the corresponding `/skeleton/jobs/[id]/...` sub-page
- **Backend effect:** Badge counts SHOULD be live queries. Currently hardcoded
- **Status:** 🚧 Mock Data (buttons render, navigation may not be wired)

**Key Documents shortcuts** (5 document links)
- **What it does:** Quick access to the most important documents for the job
- **UI effect:** 5 small document button tiles: Contract, Plans, Specifications, Permits, Insurance. Each shows: icon, name, and last-updated date. Hover adds background tint
- **Backend effect:** SHOULD link to the actual documents in Supabase Storage
- **Status:** 🚧 Mock Data (buttons render, no file links)

**Recent Activity timeline** (7 activity items)
- **What it does:** Shows a chronological feed of everything that happened on this job across all modules
- **UI effect:** Card with "Recent Activity" header and "View All" button. Each activity row shows: type-colored icon (daily-log, photo, change-order, invoice, rfi, selection, inspection), title, description, user name, timestamp, and reference ID badge (CO-005, DRW-004, RFI-012, BLD-2026-0045, SEL-MB-001). 7 activity items
- **Backend effect:** SHOULD query a materialized view or UNION query across: daily_logs, photos, change_orders, invoices, rfis, selections, inspections WHERE job_id = :id ORDER BY created_at DESC LIMIT 10
- **Status:** 🚧 Mock Data

**"View All" button** (in Activity header)
- **What it does:** SHOULD navigate to a full activity feed for the job
- **UI effect:** Text button with "View All" text and right chevron. Hover darkens
- **Backend effect:** SHOULD navigate to `/skeleton/jobs/[id]/activity` or expand the activity list
- **Status:** 🚧 Mock Data (button renders, no click handler)

**AI Assistant panel** (chat interface)
- **What it does:** Job-scoped AI assistant for asking questions about this specific project
- **UI effect:** Chat panel with message input, showing context "Smith Residence". Can ask questions about budget status, schedule, team assignments, etc.
- **Backend effect:** SHOULD send messages to AI endpoint with job_id context
- **Status:** 🚧 Mock Data (UI renders, no AI backend)

**AI-Powered Features panel** (5 feature cards)
- **What it does:** Documents AI capabilities for the job dashboard: Health Score, Next Steps, Risk Detection, Predicted Completion, Milestone Alert
- **UI effect:** Expandable panel with feature cards showing confidence scores
- **Status:** 🚧 Mock Data (descriptive only)

**AI Job Health Summary bar** (bottom)
- **What it does:** Shows an AI-generated one-sentence summary of the job's overall health status
- **UI effect:** Amber gradient bar with sparkle icon at the bottom
- **Backend effect:** SHOULD be generated by AI analyzing all job metrics
- **Status:** 🚧 Mock Data (hardcoded summary text)

---

### /skeleton/jobs/[id]/budget — Job Budget
*File: `src/components/skeleton/previews/budget-preview.tsx`*
*Purpose: Track every dollar on a job. See original budget, approved changes, committed costs, actual costs, and projected final cost by cost code. This is the financial nerve center of a job.*

#### Elements

**Multi-Audience View Toggle** (PM Detail / Owner / Lender)
- **What it does:** Switches the budget view between three audiences with different levels of detail and formatting
- **UI effect:** 3-segment toggle button in the header. "PM Detail" shows full cost code breakdown with all columns. "Owner" SHOULD show a simplified view suitable for client-facing reports. "Lender" SHOULD show AIA G702/G703 formatted schedule of values. Currently only changes the `audienceView` state variable and the label at the bottom of the page ("Viewing: PM Detail View" / "Owner Summary" / "AIA G702/G703")
- **Backend effect:** None currently. SHOULD change the columns displayed and possibly the cost code grouping. All three views read from the same budget data
- **Who can use it:** PM Detail: PM and above. Owner: available for client reports. Lender: for draw submissions
- **Status:** 🚧 Mock Data (toggle works, but all three views show the same PM Detail layout)

**"Export" button**
- **What it does:** SHOULD export the budget to PDF or Excel based on the current audience view
- **UI effect:** Outlined button with download icon and "Export" text. Hover lightens background. Currently does nothing on click
- **Backend effect:** SHOULD generate: PDF for Owner/Lender view (AIA G702/G703 format), Excel for PM Detail view. File saved via browser download
- **Who can use it:** owner, admin, PM, office
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Lock Budget" button**
- **What it does:** SHOULD lock the budget to prevent further changes (typically done at project start or before a draw submission)
- **UI effect:** Outlined button with lock icon and "Lock Budget" text. SHOULD change to "Unlock Budget" with an open lock icon when budget is locked. Currently does nothing on click
- **Backend effect:** SHOULD: UPDATE jobs SET budget_locked = true, budget_locked_at = NOW(), budget_locked_by = :user_id WHERE id = :job_id AND company_id = :company_id. INSERT audit_log (action: 'budget_locked'). When locked, all budget line edits should be disabled
- **Reverse action:** "Unlock Budget" button (owner/admin only). Requires audit log entry
- **Who can use it:** owner, admin, PM
- **Only shows when:** Budget exists with at least one line item
- **Notifications:** SHOULD notify PM, owner, and office when budget is locked/unlocked
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**Search box** (in FilterBar)
- **What it does:** Filters budget lines by cost code number or name as the user types
- **UI effect:** Text input with placeholder "Search cost codes...". Filters the budget table rows in real-time. Result count updates
- **Backend effect:** Filters mock data using `matchesSearch()` on fields: name, code. SHOULD query with WHERE (code ILIKE :search OR name ILIKE :search)
- **Connected to:** Budget table rows, result count
- **Status:** 🚧 Mock Data (filtering works on local mock data)

**Budget filter tabs** (All Lines, At Risk, Allowances/Contingency)
- **What it does:** Filters budget lines by their alert status or line type
- **UI effect:** Tab bar with counts: "All Lines (10)", "At Risk (4)" — shows only lines with warning/critical/over alert levels, "Allowances / Contingency (2)" — shows only allowance and contingency line types
- **Backend effect:** Filters mock data array. SHOULD add WHERE clause based on alert_level or line_type
- **Connected to:** Budget table rows
- **Status:** 🚧 Mock Data (filtering works on local mock data)

**Sort options** (Cost Code, Name, Revised Budget, Projected, Completion, Cost to Complete)
- **What it does:** Changes the sort order of budget lines in the table
- **UI effect:** Dropdown with 6 sort options plus direction toggle
- **Backend effect:** Sorts filtered mock data. SHOULD add ORDER BY clause
- **Status:** 🚧 Mock Data (sorting works on local mock data)

**Summary cards row** (6 metric cards)
- **What it does:** Shows the financial summary of the entire budget at a glance
- **UI effect:** 6 cards in a row:
  1. Contract: $2.45M (gray)
  2. Projected Cost: $924K with "CTC: $338K" subtitle (gray)
  3. Variance: color-coded positive (green) or negative (red) with trend icon
  4. Margin: percentage, color-coded (green >= 15%, amber >= 10%, red < 10%)
  5. Contingency: remaining amount with usage progress bar and "24% used of $75K" text (orange)
  6. Earned Value: CPI and SPI indicators — CPI 1.00 (green if >= 1, red if < 1), SPI 0.94 (amber if < 1)
- **Backend effect:** Calculated from budget line totals. SHOULD be computed server-side
- **Status:** 🚧 Mock Data

**Budget alerts banner**
- **What it does:** Shows a warning when cost codes are approaching or exceeding budget thresholds
- **UI effect:** Amber background banner with warning triangle icon. Text: "4 cost codes approaching or exceeding budget thresholds". Right side shows threshold definitions: "Warning 80% / Critical 95%". Only appears when `alertCount > 0`
- **Only shows when:** At least one budget line has alert_level != 'none'
- **Status:** 🚧 Mock Data

**Budget line rows** (10 expandable rows in table)
- **What it does:** Each row shows a single cost code's budget breakdown. Clicking expands to show details
- **UI effect:** Table with columns: Cost Code, Original, Changes, Revised, Committed, Actual, Projected, Variance, Progress. Each row shows:
  - Cost code number (monospace), name, line type badge (Allowance amber, Contingency orange), alert badge (80%+ amber, 95%+ red, Over dark red), AI sparkle icon if AI note exists
  - Expandable on click — expanded row shows:
    - Linked PO count, Invoice count, CO count (with colored badges)
    - Vendor name
    - Cost to Complete amount
    - AI confidence percentage
    - AI note text (amber sparkle + description)
  - Rows with 'over' alert level have red background tint
  - Variance column color-coded: green with up arrow (under budget), amber with down arrow (slightly over), red with warning triangle (significantly over), green checkmark ($0 variance)
  - Progress bar: green at 100%, red if over budget, blue otherwise
  - Two rows pre-expanded by default (IDs '6' Carpentry and '10' Contingency) — these are the lines with the most notable AI insights
- **Backend effect:** SHOULD query: SELECT * FROM budget_lines WHERE job_id = :id AND company_id = :company_id ORDER BY code. Currently 10 mock budget lines with realistic construction cost codes (01-09 + CTG)
- **Connected to:** Expanding a row updates the visual display. Clicking linked PO/Invoice/CO badges SHOULD navigate to those entities
- **Status:** 🚧 Mock Data (expansion works, but clicking linked entities does nothing)

**Totals row** (table footer)
- **What it does:** Shows column totals for the entire budget
- **UI effect:** Bold row at bottom of table with heavier top border. Shows sum of: Original Budget, Approved Changes, Revised Budget, Committed, Actual, Projected, and overall Variance indicator
- **Backend effect:** Calculated from all budget lines (not filtered — always shows total regardless of active filter)
- **Status:** 🚧 Mock Data

**Budget Composition bar** (below table)
- **What it does:** Shows the mathematical relationship between original budget, approved changes, and current budget
- **UI effect:** Small text bar: "Original Budget: $883K + Approved COs: $44K = Current Budget: $927K". Also shows "Viewing: PM Detail View" based on audience toggle
- **Status:** 🚧 Mock Data

**AI Budget Intelligence bar** (bottom)
- **What it does:** Shows AI-generated budget analysis and recommendations
- **UI effect:** Amber gradient bar with sparkle icon and "AI Budget Intelligence:" label. Paragraph of analysis text about carpentry trending over, CPI indicator, historical comparison to similar jobs, and recommendation for change order
- **Backend effect:** SHOULD be generated by AI analyzing budget data, vendor pricing, and comparable job history
- **Status:** 🚧 Mock Data (hardcoded text)

**AI Features Panel** (5 features: Budget Forecasting, Cost Code Analysis, Change Order Impact, Contingency Tracking, Vendor Cost Trends)
- **What it does:** Documents planned AI capabilities for the budget page
- **UI effect:** Expandable panel with feature descriptions
- **Status:** 🚧 Mock Data (descriptive only)

---

### /skeleton/jobs/[id]/schedule — Job Schedule (Gantt Chart)
*File: `src/components/skeleton/previews/schedule-preview.tsx`*
*Purpose: See the full construction schedule as a Gantt chart. Track task progress, dependencies, vendor assignments, weather holds, critical path, and AI-predicted completion dates.*

#### Elements

**Schedule health indicator** (stats bar)
- **What it does:** Shows overall schedule health at a glance with key metrics
- **UI effect:** Horizontal bar with: health badge ("At Risk" amber or "On Track" green or "Behind" red), overall completion percentage (e.g., "65% complete | 25/35 tasks"), days remaining, tasks behind baseline count (red), zero-float task count (orange), unconfirmed subs count (amber), pending inspections count (blue), and checklist completion ratio
- **Backend effect:** Calculated from all schedule tasks. SHOULD be computed from task status and baseline comparisons
- **Status:** 🚧 Mock Data

**Zoom level buttons** (Day, Week, Month)
- **What it does:** Changes the timeline resolution of the Gantt chart
- **UI effect:** SHOULD provide three zoom levels via buttons in the header area. "Day" shows individual day columns (36px per day), "Week" shows week columns (12px per day), "Month" shows month columns (4px per day). The timeline header and weather strip adjust accordingly
- **Backend effect:** Changes `zoomLevel` state which recalculates timeline column rendering
- **Status:** 🚧 Mock Data (zoom functionality exists in code but may require header buttons)

**Collapse All / Expand All toggle**
- **What it does:** SHOULD collapse or expand all phases and groups in the Gantt chart
- **UI effect:** SHOULD be a toggle button in the header area. When collapsed, only phase-level summary bars are visible. When expanded, all groups and tasks are visible
- **Backend effect:** Toggles expansion state for all phases and groups
- **Status:** 🚧 Mock Data (per-phase and per-group expansion works, but global toggle may need a dedicated button)

**Search box** (in FilterBar)
- **What it does:** Filters schedule tasks by name
- **UI effect:** Text input with search placeholder. Filters visible tasks in the Gantt chart
- **Backend effect:** Filters mock data using `matchesSearch()`. SHOULD query with WHERE name ILIKE :search
- **Status:** 🚧 Mock Data (filtering works on local mock data)

**Phase rows** (5 phases: Site Prep, Foundation, Framing, Exterior, MEP Rough-In)
- **What it does:** Collapsible phase headers that group related construction activities
- **UI effect:** Gray-brown background row with: expand/collapse chevron, phase name in bold, task and checklist counts (e.g., "(8t, 3c)"), phase completion percentage badge, and aggregate progress bar spanning the timeline. Click anywhere on the row toggles expansion to show/hide the groups within
- **Backend effect:** Aggregates progress from all child tasks using duration-weighted average
- **Connected to:** Expanding shows child group rows and task rows
- **Status:** 🚧 Mock Data

**Group rows** (sub-phases within each phase)
- **What it does:** Collapsible sub-groups that organize tasks by trade or scope area
- **UI effect:** Lighter background row, indented from phase. Shows: expand/collapse chevron, group name, task count, and aggregate progress bar. Click toggles expansion to show/hide individual tasks
- **Connected to:** Expanding shows individual task rows
- **Status:** 🚧 Mock Data

**Task rows** (~35 tasks with Gantt bars)
- **What it does:** Shows individual schedule tasks with all tracking information
- **UI effect:** Each task row has two parts:
  - **Left panel (264px fixed):** Task name (truncated), type badges, critical path "CP" badge (red), zero-float "0F" badge (orange), baseline variance indicator (+Nd red or -Nd green), trade name, vendor name with user icon, sub confirmation badge (Confirmed green / Pending amber / Not Sent gray), linked inspection/PO/daily-log references as clickable badges, AI predicted date with confidence percentage and "Why?" tooltip
  - **Right panel (scrollable timeline):** Gantt bar showing:
    - Background bar (color by task type: blue=construction, purple=inspection, amber=delivery, red=deadline, emerald=milestone)
    - Critical path bars are red instead of type color
    - Progress fill within the bar
    - Percentage label inside bar (if > 3% width)
    - Baseline bar overlay (ghost/transparent) showing original schedule if baseline tracking enabled
    - Actual dates overlay (thin emerald bar above main bar)
    - AI predicted end date marker (dashed orange vertical line with confidence badge)
    - Sub confirmation checkmark (green) or pending circle (amber) at bar end
    - Weather sensitivity cloud icon above the bar
    - Milestone markers as rotated diamond shapes (emerald or red for critical)
    - Deadline markers as red diamonds
- **Backend effect:** SHOULD query: SELECT * FROM schedule_items WHERE job_id = :id ORDER BY sort_order
- **Status:** 🚧 Mock Data (~35 tasks with realistic construction schedule)

**AI "Why?" tooltip** (on tasks with AI predictions)
- **What it does:** Explains the reasoning behind the AI's predicted completion date
- **UI effect:** Small question mark icon next to AI prediction text. Hover or click opens a floating tooltip showing "AI Prediction Factors" with a bulleted list of reasons (e.g., "Weather forecast (+1 day)", "Crew availability normal", "Similar task history (+0.5 days)"). Tooltip has white background, shadow, and arrow pointing down
- **Backend effect:** SHOULD be generated by AI analysis. Currently shows hardcoded reasoning arrays in mock data
- **Status:** 🚧 Mock Data (tooltip UI works, reasoning is hardcoded)

**Checklist rows** (9 checklists interspersed with tasks)
- **What it does:** Shows quality verification items that must be checked off at specific points in the schedule
- **UI effect:** Row with checkbox icon (green filled when checked, gray outline when unchecked) and item text. Checked items show strikethrough text. Examples: "Confirm elevation survey matches plans", "Verify rebar placement per structural drawings"
- **Backend effect:** SHOULD toggle: UPDATE schedule_items SET is_checked = :checked WHERE id = :id. Currently checkboxes are read-only display
- **Status:** 🚧 Mock Data (checkboxes display state but are not interactive)

**Dependency arrows** (21 dependencies)
- **What it does:** Shows the relationships between tasks with SVG arrows connecting them
- **UI effect:** SVG overlay on the Gantt chart timeline. Arrows connect predecessor task end to successor task start (or start-to-start, finish-to-finish, start-to-finish). Arrow colors by type:
  - FS (Finish-to-Start): blue arrows
  - SS (Start-to-Start): green arrows
  - FF (Finish-to-Finish): orange arrows
  - SF (Start-to-Finish): purple arrows
  - Critical path dependencies: red arrows (thicker stroke)
  - Small pill badge at midpoint shows dependency type (FS, SS, FF, SF)
- **Backend effect:** SHOULD query: SELECT * FROM schedule_dependencies WHERE job_id = :id
- **Status:** 🚧 Mock Data (arrows render from mock dependency data)

**Weather strip** (14-day weather overlay)
- **What it does:** Shows weather conditions along the timeline so you can see which tasks overlap with bad weather
- **UI effect:** Thin row at the top of the timeline showing weather icons (sun, cloud, rain) and temperature for each day. Rain/storm days have amber background tint to visually flag outdoor work risk
- **Backend effect:** SHOULD fetch from NOAA weather API. Currently 14 hardcoded weather days
- **Status:** 🚧 Mock Data (no weather API)

**Today line** (vertical indicator)
- **What it does:** Shows where "today" falls on the timeline
- **UI effect:** Red dashed vertical line spanning the full height of the Gantt chart with "Today" label at the top
- **Status:** 🚧 Mock Data (shows based on hardcoded TODAY constant '2026-01-22')

**Weekend shading** (on day zoom level)
- **What it does:** Visually distinguishes weekdays from weekends on the timeline
- **UI effect:** Subtle gray shading on Saturday and Sunday columns (only visible in "day" zoom level)
- **Status:** 🚧 Mock Data

**AI Insights bar and AI Features Panel**
- **What it does:** Shows AI schedule intelligence and documents planned AI features
- **UI effect:** Same pattern as other pages — amber bar with insights text and expandable feature panel
- **Status:** 🚧 Mock Data

---

### /skeleton/jobs/[id]/daily-logs — Daily Logs
*File: `src/components/skeleton/previews/daily-logs-preview.tsx`*
*Purpose: Record what happened on the job site each day -- weather, crews on site, work performed, deliveries received, problems encountered, and visitors. This is the legal record of construction activity.*

#### Elements

**Voice-to-text mic button** (round button in quick entry form)
- **What it does:** SHOULD activate voice dictation to capture daily log entries hands-free from the job site
- **UI effect:** Large round button (48px). Default state: gray background with mic icon. Recording state: red pulsing background with white mic icon, plus animated audio waveform bars below and "Recording voice input..." text. Click toggles between recording and not-recording states
- **Backend effect:** SHOULD: (1) activate browser MediaRecorder API, (2) stream audio to speech-to-text service (Whisper or similar), (3) return transcription in the text input field, (4) AI parses the transcription to extract structured data (work items, crew counts, issues). Currently toggles a boolean state variable `isRecording` — no actual audio capture
- **Who can use it:** All field roles — primarily superintendent
- **Status:** 🚧 Mock Data (toggle animation works, no actual voice capture or transcription)

**Quick entry text input**
- **What it does:** SHOULD capture a quick text description of today's work that AI will parse into structured daily log sections
- **UI effect:** Full-width text input. Default placeholder: "Quick entry: Describe today's work or click mic to dictate...". When recording: placeholder changes to "Listening... Describe today's work", border turns red with red background tint. Currently the input does not submit — no form handler
- **Backend effect:** SHOULD send text to AI for structured extraction: POST /api/v1/ai/parse-daily-log with the free-text input. AI returns structured JSON with: work_items[], manpower[], deliveries[], issues[], visitors[]
- **Status:** 🚧 Mock Data (input renders, no submission)

**Weather auto-display** (in quick entry area)
- **What it does:** Shows auto-populated weather for the current day from weather API
- **UI effect:** Small amber badge showing: thermometer icon, "72F", sun icon, "auto" label. The "auto" label indicates this was fetched from the weather API rather than manually entered
- **Backend effect:** SHOULD fetch from NOAA weather API for the job site coordinates. Currently hardcoded
- **Status:** 🚧 Mock Data

**"Quick Photo" button**
- **What it does:** SHOULD open the camera or file picker to quickly add a photo to today's log
- **UI effect:** Small outlined button with camera icon and "Quick Photo" text. Hover lightens background. Currently does nothing on click
- **Backend effect:** SHOULD: (1) open camera/file picker, (2) upload to Supabase Storage, (3) create photo record linked to today's daily log, (4) AI analyzes photo for progress detection
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Report Issue" button**
- **What it does:** SHOULD open a quick issue entry form to log a problem encountered today
- **UI effect:** Small outlined button with warning triangle icon and "Report Issue" text. Currently does nothing
- **Backend effect:** SHOULD open modal with: description, category dropdown (weather_delay, material_delay, rework, safety, design_conflict, inspection_fail, other), severity (low/medium/high/critical), schedule impact days. INSERT INTO daily_log_issues (...)
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Log Delivery" button**
- **What it does:** SHOULD open a delivery logging form to record materials received on site
- **UI effect:** Small outlined button with truck icon and "Log Delivery" text. Currently does nothing
- **Backend effect:** SHOULD open modal with: description, vendor, PO number match, received by, discrepancy flag. INSERT INTO daily_log_deliveries (...)
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Inspection" button**
- **What it does:** SHOULD open an inspection result form or link to the inspections page
- **UI effect:** Small outlined button with clipboard-check icon and "Inspection" text. Currently does nothing
- **Backend effect:** SHOULD open modal or navigate to inspection scheduling
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Safety Obs." button**
- **What it does:** SHOULD open a safety observation form for OSHA compliance documentation
- **UI effect:** Small outlined button with shield icon and "Safety Obs." text. Currently does nothing
- **Backend effect:** SHOULD open safety observation form. INSERT INTO safety_observations (...)
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Visitor" button**
- **What it does:** SHOULD open a visitor log form to record who visited the job site today
- **UI effect:** Small outlined button with hard-hat icon and "Visitor" text. Currently does nothing
- **Backend effect:** SHOULD open modal with: name, company, purpose, time in/out. INSERT INTO daily_log_visitors (...)
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**Period filter tabs** (This Week, This Month, All Logs)
- **What it does:** Filters daily logs by date range
- **UI effect:** Tab bar with: "This Week (6)", "This Month", "All Logs". Active tab highlighted
- **Backend effect:** Filters mock data by date range. SHOULD query with WHERE date BETWEEN :start AND :end
- **Status:** 🚧 Mock Data (filtering works on local data)

**Status dropdown filter** (All Statuses, Draft, Submitted, Approved, Returned, Has Issues)
- **What it does:** Filters daily logs by their review/approval status
- **UI effect:** Dropdown selector. Selected value filters the log list
- **Backend effect:** Filters mock data by status field. SHOULD add WHERE status = :status
- **Status:** 🚧 Mock Data

**Weather dropdown filter** (All Weather, Clear Days, Rain Days, Wind Days)
- **What it does:** Filters daily logs by weather condition to analyze weather impact on productivity
- **UI effect:** Dropdown selector. Selected value filters the log list
- **Backend effect:** Filters mock data by weather.condition. SHOULD add WHERE weather_condition = :condition
- **Status:** 🚧 Mock Data

**Sort options** (Date, Status, Photos)
- **What it does:** Changes the sort order of the daily log list
- **UI effect:** Sort dropdown with 3 options plus direction toggle
- **Status:** 🚧 Mock Data

**"Calendar View" action button** (in FilterBar)
- **What it does:** SHOULD switch from list view to calendar view of daily logs
- **UI effect:** Button with calendar icon. Currently does nothing on click
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"Export PDF" action button** (in FilterBar)
- **What it does:** SHOULD export the visible daily logs to a PDF report
- **UI effect:** Button with document icon. Currently does nothing on click
- **Backend effect:** SHOULD generate a PDF with all visible daily logs, weather data, crew hours, and photos
- **Who can use it:** owner, admin, PM, superintendent
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**"New Entry" action button** (in FilterBar, primary style)
- **What it does:** SHOULD create a new daily log entry for today
- **UI effect:** Primary-styled button with plus icon and "New Entry" text. Currently does nothing on click
- **Backend effect:** SHOULD create: INSERT INTO daily_logs (job_id, company_id, date, status, weather_source, created_by) VALUES (:job_id, :company_id, CURRENT_DATE, 'draft', 'api', :user_id). Auto-populate weather from API
- **Other pages affected:** /skeleton/jobs/[id] — activity feed updates with new log. /skeleton/jobs/[id]/schedule — schedule task progress may auto-update based on work performed
- **Notifications:** SHOULD notify PM when a new log is submitted for review
- **Reverse action:** Delete draft log (if still in draft status). Approved logs become immutable
- **Who can use it:** superintendent, PM, field
- **Status:** 📝 Not Yet Implemented (button renders, empty onClick)

**Summary stats row** (6 stat cards)
- **What it does:** Shows aggregate daily log metrics for the current period
- **UI effect:** 6 small stat cards: Logs (6), Hours (252, blue), Approved (3, green), Avg Crew (5, blue), Issues (3, amber if > 0), Photos (52, blue)
- **Backend effect:** Calculated from mock data array. SHOULD be aggregated server-side
- **Status:** 🚧 Mock Data

**Daily log cards** (6 log entries, scrollable)
- **What it does:** Each card shows a complete daily log with all sections. Click SHOULD open the full log detail view
- **UI effect:** Scrollable list (max height 500px) of log cards. Each card shows:
  - **Date column:** Large day number, month abbreviation, day of week
  - **Weather widget:** Weather icon, high/low temp, precipitation if any, "auto" label for API-sourced
  - **Status badges:** Status (Draft/Submitted/In Review/Approved/Returned with colored icon), Immutable lock badge (for approved/submitted logs), Amended badge (amber), Voice badge (if voice transcription used), Schedule updates count
  - **Work performed:** Up to 2 work items with completion percentage badges, "+N more" if additional
  - **Issues:** Severity badge, category, description, schedule impact days (red), triggered entity badge
  - **Deliveries:** Truck icon, description, PO match badge, discrepancy flag (red)
  - **Visitors:** Hard-hat icon, name, company, purpose
  - **Review note:** If returned, shows reviewer's comment in orange background with message icon
  - **AI summary:** Sparkle icon with AI-generated summary text (blue)
  - **Stats row:** Total crew count with vendor names, total hours, photo count with minimum warning (amber if below required minimum of 4), submitted by/reviewed by info
  - Right chevron indicating clickable
  - Returned logs have orange border
  - Hover adds shadow elevation
- **Backend effect:** SHOULD query: SELECT dl.*, (SELECT json_agg(w.*) FROM daily_log_work_items w WHERE w.log_id = dl.id) as work_items, ... FROM daily_logs dl WHERE dl.job_id = :id AND dl.company_id = :company_id ORDER BY dl.date DESC
- **Status:** 🚧 Mock Data (6 logs with full detail, cards are not actually clickable for detail view)

**AI Insights bar** (bottom)
- **What it does:** Shows AI-generated insights from daily log data analysis
- **UI effect:** Amber gradient bar with sparkle/brain icons. Shows 4 insights separated by pipes: crew productivity on clear vs rain days, weather delay total, vendor hour benchmarks, auto-updated schedule tasks count
- **Status:** 🚧 Mock Data

**AI Features Panel** (4 features)
- **What it does:** Documents AI capabilities: Voice-to-Text AI (94% confidence), Progress Auto-Detection (87%), Issue Categorization (91%), Weather Impact (88%). Each feature has "Start Dictation" / "Review Estimates" / "View Suggestions" / "View Weather Analysis" action buttons
- **UI effect:** 2-column expandable panel with feature cards. Action buttons exist but have empty onClick handlers
- **Status:** 🚧 Mock Data (feature descriptions only, action buttons non-functional)

---

### Job Sub-Pages Summary

All job sub-pages live at `/skeleton/jobs/[id]/...` and share the same job-level layout with sidebar navigation. Each sub-page is a skeleton preview with mock data.

| Sub-Page | Route | Preview Component | Key Interactive Elements | Status |
|----------|-------|-------------------|------------------------|--------|
| **Budget** | `/budget` | `budget-preview.tsx` | Audience toggle, Export, Lock Budget, FilterBar, expandable budget rows, AI insights | 🚧 Mock Data |
| **Schedule** | `/schedule` | `schedule-preview.tsx` | Gantt chart with zoom, expandable phases/groups, dependency arrows, AI predictions, weather overlay, baseline tracking | 🚧 Mock Data |
| **Daily Logs** | `/daily-logs` | `daily-logs-preview.tsx` | Voice mic, quick entry, photo/issue/delivery/inspection/safety/visitor buttons, FilterBar, log cards | 🚧 Mock Data |
| **Invoices** | `/invoices` | `invoices-preview.tsx` | Upload Invoice, Manual entry, Approve button, FilterBar, invoice table | 🚧 Mock Data |
| **Draws** | `/draws` | `draws-preview.tsx` | New Draw, Export, G702/G703 generation, SOV management, draw list | 🚧 Mock Data |
| **Purchase Orders** | `/purchase-orders` | `purchase-orders-preview.tsx` | New PO, three-way match, approval workflow, receiving tracking | 🚧 Mock Data |
| **Change Orders** | `/change-orders` | `change-orders-preview.tsx` | New CO, approval chain, cost breakdown, client presentation | 🚧 Mock Data |
| **Selections** | `/selections` | `selections-preview.tsx` | Product selection by room/category, tier comparison, client approval | 🚧 Mock Data |
| **RFIs** | `/rfis` | `rfi-management-preview.tsx` | New RFI, response workflow, schedule/cost impact tracking | 🚧 Mock Data |
| **Submittals** | `/submittals` | `submittals-preview.tsx` | Submittal log, review workflow, revision tracking | 🚧 Mock Data |
| **Punch List** | `/punch-list` | `punch-list-preview.tsx` | Add item, photo markup, vendor assignment, completion tracking | 🚧 Mock Data |
| **Lien Waivers** | `/lien-waivers` | `lien-waivers-preview.tsx` | Waiver tracking per vendor, conditional/unconditional types | 🚧 Mock Data |
| **Photos** | `/photos` | `photos-preview.tsx` | Photo gallery, upload, phase/date filtering | 🚧 Mock Data |
| **Files** | `/files` | `files-preview.tsx` | Document storage, folder structure, upload | 🚧 Mock Data |
| **Permits** | `/permits` | `permits-preview.tsx` | Permit tracking, inspection scheduling | 🚧 Mock Data |
| **Inspections** | `/inspections` | `inspections-preview.tsx` | Inspection scheduling, pass/fail results | 🚧 Mock Data |
| **Communications** | `/communications` | `communications-preview.tsx` | Message threads, email history | 🚧 Mock Data |
| **Team** | `/team` | `team-preview.tsx` | Team assignments, role management | 🚧 Mock Data |
| **Property** | `/property` | `property-preview.tsx` | Property details, lot info, flood zone | 🚧 Mock Data |
| **Warranties** | `/warranties` | `warranties-preview.tsx` | Warranty items for completed work | 🚧 Mock Data |
| **Reports** | `/reports` | `reports-preview.tsx` | Job-level report generation | 🚧 Mock Data |

---

### /jobs/new — Create New Job (Authenticated)
*File: `src/app/(authenticated)/jobs/new/page.tsx`*
*Purpose: The real (non-skeleton) form for creating a new construction project. This is the only job creation form that actually writes to Supabase.*

#### Elements

**"Back to Jobs" link**
- **What it does:** Navigates back to the jobs list
- **UI effect:** Small text link with left arrow icon at the top. Click navigates to `/jobs`
- **Backend effect:** None (navigation)
- **Status:** ✅ Working

**"Job Name" input** (required)
- **What it does:** Captures the project name (e.g., "Smith Residence")
- **UI effect:** Standard text input with placeholder "e.g., Smith Residence" and red asterisk indicating required. Part of a 2-column grid with Job Number
- **Validation:** Required field (HTML5 `required` attribute). Cannot submit form without a value
- **Backend effect:** Stored as `name` column in `jobs` table
- **Status:** ✅ Working

**"Job Number" input** (optional)
- **What it does:** Captures an optional reference number for the project
- **UI effect:** Text input with placeholder "e.g., 2024-001". Optional field
- **Backend effect:** Stored as `job_number` column. Inserted as NULL if empty
- **Status:** ✅ Working

**"Street Address" input**
- **What it does:** Captures the job site street address
- **UI effect:** Full-width text input with placeholder "123 Main St"
- **Backend effect:** Stored as `address` column. NULL if empty
- **Status:** ✅ Working

**"City" input**
- **What it does:** Captures the city of the job site
- **UI effect:** Text input with placeholder "Austin" in a 4-column grid (city spans 2)
- **Backend effect:** Stored as `city` column. NULL if empty
- **Status:** ✅ Working

**"State" dropdown**
- **What it does:** Selects the US state for the job site
- **UI effect:** Dropdown select with all 50 US state abbreviations. Defaults to "TX"
- **Backend effect:** Stored as `state` column
- **Status:** ✅ Working

**"ZIP" input**
- **What it does:** Captures the ZIP code for the job site
- **UI effect:** Text input with placeholder "78701"
- **Backend effect:** Stored as `zip` column. NULL if empty
- **Status:** ✅ Working

**"Contract Amount" input**
- **What it does:** Captures the total contract value in dollars
- **UI effect:** Number input with "$" prefix and placeholder "0.00". Allows decimal values (step="0.01")
- **Validation:** Must be a valid number if provided. Parsed with `parseFloat()` before insertion
- **Backend effect:** Stored as `contract_amount` column (decimal). NULL if empty
- **Status:** ✅ Working

**"Contract Type" dropdown**
- **What it does:** Selects the type of construction contract
- **UI effect:** Dropdown with 3 options: Fixed Price, Cost Plus, Time & Materials. Defaults to "Fixed Price"
- **Backend effect:** Stored as `contract_type` column ('fixed_price', 'cost_plus', 'time_materials')
- **Status:** ✅ Working

**"Start Date" input**
- **What it does:** Captures the project start date
- **UI effect:** Date picker input (native HTML date type)
- **Backend effect:** Stored as `start_date` column (date). NULL if empty
- **Status:** ✅ Working

**"Target Completion" input**
- **What it does:** Captures the expected project completion date
- **UI effect:** Date picker input (native HTML date type)
- **Backend effect:** Stored as `target_completion` column (date). NULL if empty
- **Status:** ✅ Working

**"Notes" textarea**
- **What it does:** Captures any additional information about the job
- **UI effect:** Multi-line textarea (4 rows) with placeholder "Enter any notes about this job..."
- **Backend effect:** Stored as `notes` column. NULL if empty
- **Status:** ✅ Working

**"Cancel" button**
- **What it does:** Abandons the form and navigates back to the jobs list without saving
- **UI effect:** Outlined secondary button with "Cancel" text. Click navigates to `/jobs`
- **Backend effect:** None — no data saved, no confirmation prompt
- **Reverse action:** N/A — nothing was saved
- **Status:** ✅ Working

**"Create Job" button**
- **What it does:** Validates the form, creates a new job in Supabase, and navigates to the new job's detail page
- **UI effect:** Primary button with "Create Job" text. On submit: changes to "Creating..." with spinning loader icon, button becomes disabled. On success: redirects to `/jobs/[new-job-id]`. On failure: returns to normal state and red error banner appears above the form
- **Backend effect:** Full Supabase workflow:
  1. `supabase.auth.getUser()` — gets current authenticated user
  2. `supabase.from('users').select('company_id').eq('id', user.id).single()` — gets user's company_id
  3. `supabase.from('jobs').insert({...}).select().single()` — creates the job record with:
     - `company_id`: from user's profile
     - `status`: 'pre_construction' (hardcoded default)
     - All form fields mapped to columns
  4. On success: `router.push('/jobs/[new-id]')` + `router.refresh()`
- **Other pages affected:** /jobs — new job appears in list. Dashboard — active job count may change. Financial reports — contract value added to company totals
- **Notifications:** None currently. SHOULD notify admin/owner of new job creation
- **Syncs:** None currently. SHOULD sync to QuickBooks if connected (create project/class)
- **Reverse action:** Archive the job from the job detail page
- **Who can use it:** Any authenticated user (RBAC not enforced yet — SHOULD be restricted to owner, admin, PM)
- **Only shows when:** User is authenticated (page is under `(authenticated)` route group)
- **Validation:** Job Name required (form won't submit without it). Contract amount must be valid number. Dates must be valid date format
- **Error states:** "Not authenticated" — session expired, redirect to login. "No company found" — user profile missing company_id. Supabase insert error — displayed as-is in red banner. "Failed to create job" — generic catch-all
- **Connected to:** After successful creation, redirects to the job detail page where all sub-pages become available
- **Status:** ✅ Working (form submits to Supabase and creates real records)
## Page Index (Part 2A)

1. [Invoices](#invoices)
2. [Draw Requests](#draw-requests)
3. [Purchase Orders](#purchase-orders)
4. [Change Orders](#change-orders)
5. [Lien Waivers](#lien-waivers)

---

## Invoices

### /skeleton/invoices — Company-Wide Invoice List
### /skeleton/jobs/[id]/invoices — Job-Scoped Invoice List

*Preview file: `src/components/skeleton/previews/invoices-preview.tsx`*
*Page files: `src/app/(skeleton)/skeleton/invoices/page.tsx`, `src/app/(skeleton)/skeleton/jobs/[id]/invoices/page.tsx`*
*Purpose: Central command for all vendor invoices. Review AI-extracted data, approve through multi-step workflows, track payment status, match to POs, manage retainage, and enforce lien waiver requirements before payment.*

Both the company-wide and job-scoped pages render the same `InvoicesPreview` component. When fully implemented, the job-scoped version SHOULD filter to only that job's invoices.

#### Data Model (Invoice)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| invoiceNumber | string | Vendor's invoice number (e.g., INV-2025-0847) |
| vendorName | string | FK to vendors (displayed as name) |
| jobName | string | FK to jobs (displayed as name) |
| amount | number | Gross invoice amount (negative for credit memos) |
| taxAmount | number | Sales tax amount |
| retainageAmount | number | Retainage withheld |
| netAmount | number | Amount payable after retainage |
| dueDate | string | ISO date payment is due |
| status | InvoiceStatus | Pipeline state (see status machine below) |
| submittedDate | string | ISO date invoice was received/submitted |
| invoiceType | InvoiceType | standard, progress, final, credit_memo, retainage_release |
| contractType | ContractType | lump_sum, time_materials, unit_price, cost_plus |
| description | string | Line-item description or summary |
| costCode | string | Assigned cost code (e.g., 03-Framing-Materials) |
| poNumber | string | Linked purchase order number |
| poVariance | number | Dollar amount over/under PO |
| drawNumber | number | Which draw this invoice is included in |
| lienWaiverStatus | string | not_required, required, received, pending |
| paymentTerms | string | e.g., Net 30, 2/10 Net 30 |
| paymentMethod | string | check, ach, wire, credit_card |
| paidDate | string | ISO date payment was issued |
| approvalStep | string | Current approval step description |
| aiConfidence | number | 0-1 AI extraction/coding confidence |
| aiNote | string | AI-generated insight or warning |
| isDuplicate | boolean | Flagged as potential duplicate |
| isAutoCoded | boolean | Cost code was AI-assigned |

#### Status Machine (InvoiceStatus)
```
needs_review -> ready_for_approval -> approved -> in_draw -> paid
                                   -> disputed -> needs_review (re-review)
                                   -> denied
needs_review -> voided
needs_review -> split (into multiple invoices)
```
Statuses: `needs_review`, `ready_for_approval`, `approved`, `in_draw`, `paid`, `disputed`, `denied`, `split`, `voided`

---

#### Elements

---

**Header: "Invoices" title with total count and amount**
- **What it does:** Displays page title, total invoice count, and sum of all invoice amounts
- **UI effect:** Static text: "Invoices" | "10 invoices | $169.1K total"
- **Backend effect:** None (display only). SHOULD query `SELECT COUNT(*), SUM(amount) FROM invoices WHERE company_id = ? [AND job_id = ?]`
- **Other pages affected:** None
- **Status:** 🚧 Mock Data

---

**Quick Stats Row (5 cards)**

**Card 1: "Pending Review (N)"**
- **What it does:** Shows count and dollar total of invoices in `needs_review` or `ready_for_approval` status
- **UI effect:** Sand-colored card with Eye icon. Shows count in label, dollar amount as main figure
- **Backend effect:** None. SHOULD query `SELECT COUNT(*), SUM(amount) FROM invoices WHERE status IN ('needs_review', 'ready_for_approval') AND company_id = ?`
- **Other pages affected:** Dashboard financial summary should show same pending review count
- **Status:** 🚧 Mock Data

**Card 2: "Approved / Payable"**
- **What it does:** Shows total net amount of invoices approved but not yet paid
- **UI effect:** Green card with CheckCircle icon
- **Backend effect:** SHOULD query `SELECT SUM(net_amount) FROM invoices WHERE status = 'approved' AND company_id = ?`
- **Other pages affected:** Accounts Payable page, Cash Flow projections, Financial Dashboard
- **Status:** 🚧 Mock Data

**Card 3: "Due This Week"**
- **What it does:** Shows dollar total of unpaid invoices due within 7 days
- **UI effect:** Stone-colored card with Calendar icon
- **Backend effect:** SHOULD query unpaid invoices where `due_date BETWEEN NOW() AND NOW() + interval '7 days'`
- **Other pages affected:** Dashboard alerts, Payment scheduling
- **Status:** 🚧 Mock Data

**Card 4: "Overdue"**
- **What it does:** Shows dollar total of unpaid invoices past due date
- **UI effect:** Red card when overdue amount > 0, green card when $0 overdue. AlertTriangle icon when overdue, CheckCircle when clear
- **Backend effect:** SHOULD query unpaid invoices where `due_date < NOW()`
- **Other pages affected:** Dashboard alerts, Vendor relationship health, Financial Dashboard
- **Notifications:** SHOULD trigger daily overdue alerts to PM and office manager
- **Status:** 🚧 Mock Data

**Card 5: "Retainage Held"**
- **What it does:** Shows total retainage being withheld across all active invoices
- **UI effect:** Warm-colored card with Scale icon
- **Backend effect:** SHOULD query `SELECT SUM(retainage_amount) FROM invoices WHERE status NOT IN ('voided', 'denied') AND company_id = ?`
- **Other pages affected:** Budget page retainage line, Draw requests (retainage tracking), Financial reporting (balance sheet)
- **Status:** 🚧 Mock Data

---

**Search bar**
- **What it does:** Free-text search across invoice number, vendor name, job name, description, cost code, and PO number
- **UI effect:** Filters the invoice list in real-time as user types. Shows "X of Y" result count
- **Backend effect:** None (client-side filter on mock data). SHOULD use database full-text search or ILIKE queries with index
- **Other pages affected:** None
- **Validation:** Case-insensitive matching on fields: invoiceNumber, vendorName, jobName, description, costCode, poNumber
- **Status:** 🚧 Mock Data (client-side filtering works)

---

**Status tabs: All | Needs Review | Ready for Approval | Approved | In Draw | Paid | Disputed | Denied**
- **What it does:** Filters invoice list by status. Each tab shows count of invoices in that status
- **UI effect:** Active tab is highlighted. List re-filters instantly. Count badges update. "All" shows every invoice
- **Backend effect:** None (client-side filter). SHOULD be a query parameter: `?status=needs_review`
- **Other pages affected:** None
- **Status:** 🚧 Mock Data (filtering works on mock array)

---

**Dropdown filter: "All Vendors"**
- **What it does:** Filters invoices by vendor. Options populated from unique vendor names in the invoice list
- **UI effect:** Dropdown with vendor names. Selecting one filters list to only that vendor's invoices
- **Backend effect:** None. SHOULD query `SELECT DISTINCT vendor_name FROM invoices WHERE company_id = ?`
- **Status:** 🚧 Mock Data

**Dropdown filter: "All Jobs"**
- **What it does:** Filters invoices by job. Options populated from unique job names
- **UI effect:** Same as vendor filter but for jobs
- **Backend effect:** None. SHOULD query `SELECT DISTINCT job_name FROM invoices WHERE company_id = ?`
- **Status:** 🚧 Mock Data

**Dropdown filter: "All Types"**
- **What it does:** Filters by invoice type: Standard, Progress, Final, Credit Memo, Retainage Release
- **UI effect:** Dropdown with 5 type options
- **Backend effect:** None. SHOULD be query parameter: `?type=credit_memo`
- **Status:** 🚧 Mock Data

---

**Sort options: Amount | Due Date | Submitted | Vendor | Job | Type**
- **What it does:** Sorts the invoice list by selected field
- **UI effect:** Sort dropdown + ascending/descending toggle button. List reorders immediately
- **Backend effect:** None (client-side sort). SHOULD be `ORDER BY` parameter on query
- **Status:** 🚧 Mock Data (sorting works on mock array)

---

**Action button: "Export" (Download icon)**
- **What it does:** SHOULD export filtered invoice list to CSV/Excel
- **UI effect:** Button with Download icon. Currently no-op (empty onClick)
- **Backend effect:** SHOULD generate CSV with columns: Invoice#, Vendor, Job, Amount, Tax, Retainage, Net, Due Date, Status, Cost Code, PO#, Payment Terms
- **Syncs:** SHOULD support export for QuickBooks import format
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**Action button: "Upload PDF" (Upload icon)**
- **What it does:** SHOULD open file picker for PDF invoice upload, triggering AI OCR extraction
- **UI effect:** Button with Upload icon. Currently no-op. SHOULD open file dialog or drag-and-drop zone
- **Backend effect:** SHOULD upload PDF to Supabase Storage, trigger AI extraction pipeline (vendor, amount, invoice#, line items, date), create invoice record in `needs_review` status
- **Other pages affected:** After extraction: vendor matching updates vendor database, cost code suggestions appear, PO matching flags variances
- **Notifications:** SHOULD notify assigned PM that new invoice needs review
- **Syncs:** AI extraction feeds Cost Intelligence pricing database
- **Who can use it:** owner, admin, pm, office, field (mobile capture)
- **Status:** 📝 Not Yet Implemented

**Action button: "Add Invoice" (Plus icon, primary variant)**
- **What it does:** SHOULD open a manual invoice entry form
- **UI effect:** Primary-styled button. Currently no-op. SHOULD open modal or navigate to invoice creation form
- **Backend effect:** SHOULD INSERT into invoices table with all required fields. Auto-generate invoice_number if not provided. Run duplicate detection hash (vendor_id|invoice_number|amount)
- **Other pages affected:** Budget actuals (on approval), Vendor payment history, AP aging
- **Notifications:** SHOULD trigger approval workflow notification based on amount thresholds
- **Validation:** Required: vendor, job, invoice_number, amount, invoice_date. Amount must be nonzero. Duplicate hash check before save (409 on >=95% match)
- **Error states:** Duplicate detected (show warning with link to existing invoice), Missing required fields, Budget line does not exist for cost code
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

---

**Invoice row card (rendered for each invoice)**

Each invoice card displays:

**Invoice number (monospace font)**
- **What it does:** Displays vendor's invoice number as primary identifier
- **UI effect:** Monospace text for readability
- **Status:** 🚧 Mock Data

**Status badge**
- **What it does:** Shows current status with colored background and icon
- **UI effect:** Colored pill badge. Colors: needs_review (sand), ready_for_approval (stone), approved (green), in_draw (stone), paid (warm), disputed (red), denied (red), split (warm), voided (warm muted)
- **Status:** 🚧 Mock Data

**Invoice type badge (non-standard only)**
- **What it does:** Shows invoice type when not "standard": Progress, Final, Credit Memo, Retainage Release
- **UI effect:** Colored badge. Credit Memo in amber, Final in green, Progress in stone, Retainage Release in warm
- **Status:** 🚧 Mock Data

**Contract type badge (non-lump-sum only)**
- **What it does:** Shows "T&M", "Unit Price", or "Cost Plus" when contract type is not lump sum
- **UI effect:** Small warm-colored badge
- **Status:** 🚧 Mock Data

**"AI Coded" badge**
- **What it does:** Indicates the cost code was automatically assigned by AI
- **UI effect:** Stone-colored badge with Sparkles icon and text "AI Coded"
- **Backend effect:** None (display only). Set when `isAutoCoded = true`
- **Status:** 🚧 Mock Data

**AI confidence badge (low confidence only)**
- **What it does:** Shows AI confidence percentage when below 90%
- **UI effect:** Amber badge showing "XX% conf". Only appears when `aiConfidence < 0.9`
- **Backend effect:** None. Low confidence invoices SHOULD be prioritized for manual review
- **Status:** 🚧 Mock Data

**Vendor name + Job name (grid layout)**
- **What it does:** Shows which vendor sent the invoice and which job it is assigned to
- **UI effect:** Two-column grid with Building2 icon (vendor) and Briefcase icon (job)
- **Backend effect:** None. SHOULD be clickable links to vendor detail and job detail pages
- **Status:** 🚧 Mock Data

**Description text**
- **What it does:** Shows invoice line-item description or summary
- **UI effect:** Muted text below vendor/job row
- **Status:** 🚧 Mock Data

**PO link badge**
- **What it does:** Shows linked purchase order number with variance indicator
- **UI effect:** Green badge if no variance, amber badge if variance exists. Shows PO number and +/- dollar amount
- **Backend effect:** None. SHOULD be a clickable link navigating to the PO detail page
- **Other pages affected:** Clicking SHOULD navigate to Purchase Orders page filtered to that PO
- **Status:** 🚧 Mock Data

**Cost code badge**
- **What it does:** Shows assigned cost code in monospace font
- **UI effect:** Warm-colored badge with monospace text (e.g., "03-Framing-Materials")
- **Backend effect:** None. SHOULD link to budget page filtered by that cost code
- **Status:** 🚧 Mock Data

**Draw number badge**
- **What it does:** Shows which draw this invoice is included in
- **UI effect:** Stone-colored badge "Draw #N". Only appears when drawNumber is set
- **Backend effect:** None. SHOULD link to the draws page filtered to that draw
- **Status:** 🚧 Mock Data

**Lien waiver status badge**
- **What it does:** Shows whether a lien waiver has been received for this vendor/draw period
- **UI effect:** Green "LW: Received", amber "LW: Pending", red "LW: Required", muted "LW: N/A"
- **Backend effect:** None. SHOULD query lien_waivers table for matching vendor + draw period
- **Other pages affected:** Lien Waivers page. If "Required" and enforcement is strict, payment SHOULD be blocked
- **Status:** 🚧 Mock Data

**Retainage badge**
- **What it does:** Shows retainage amount being withheld from this invoice
- **UI effect:** Warm badge "Ret: $X.XK". Only appears when retainageAmount > 0
- **Backend effect:** None. Retainage SHOULD accumulate and be tracked in a separate retainage ledger
- **Other pages affected:** Budget page retainage line, Draw requests, Financial reports (retainage payable)
- **Status:** 🚧 Mock Data

**Approval step badge**
- **What it does:** Shows current approval step for invoices still in workflow
- **UI effect:** Stone badge showing step name (e.g., "PM Review", "Owner Review (>$25K)")
- **Backend effect:** None. SHOULD reflect position in approval chain: PM -> Accountant -> Owner (threshold-based)
- **Status:** 🚧 Mock Data

**Payment terms text**
- **What it does:** Shows agreed payment terms
- **UI effect:** Small muted text (e.g., "Net 30", "2/10 Net 30")
- **Status:** 🚧 Mock Data

**AI Note panel**
- **What it does:** Shows AI-generated insight or warning about this invoice
- **UI effect:** Amber background if warning (disputed, over PO, denied), stone background if informational. Sparkles icon. Full-width panel below the badges
- **Backend effect:** None. AI notes SHOULD be generated by the AI processing pipeline on invoice intake
- **Content examples:**
  - "Amount 8% higher than PO-089 ($11,530) - review recommended"
  - "Pay by Dec 8, 2025 for 2% early payment discount ($175 savings)"
  - "Disputed: Missing equipment serial numbers. Amount $2,100 over PO."
  - "Denied: No approved change order for additional scope. Vendor notified."
  - "Credit memo linked to original INV-2025-0812. PO-089 balance adjusted."
- **Status:** 🚧 Mock Data

**Amount display (right side)**
- **What it does:** Shows gross invoice amount, net amount (if retainage), due date with urgency indicator, paid date/method
- **UI effect:**
  - Credit memos display in green with parentheses: "($2.4K)"
  - Regular invoices in warm-900
  - Net amount shown below when retainage > 0
  - Due date with Calendar icon
  - Urgency badge: red "Xd overdue", amber "Xd" (<=7 days), warm "Xd" (>7 days)
  - Paid date badge: green "Paid [date]"
  - Payment method shown as uppercase text (ACH, CHECK, etc.) when paid
- **Status:** 🚧 Mock Data

**Three-dot menu button (MoreHorizontal)**
- **What it does:** SHOULD open a dropdown menu with actions for this invoice
- **UI effect:** Hover shows warm-100 background. Currently no dropdown opens
- **Backend effect:** None
- **Expected dropdown actions (when implemented):**
  - View Details / Edit
  - Approve (if needs_review or ready_for_approval)
  - Dispute (with reason form)
  - Deny (with reason form)
  - Add to Draw (if approved)
  - Mark as Paid (with payment method)
  - Split Invoice (into multiple cost codes)
  - Void Invoice
  - View PDF
  - Send to QuickBooks
  - View Audit History
- **Who can use it:** Varies by action (see individual action specs below)
- **Status:** 📝 Not Yet Implemented (button renders, no dropdown)

---

**AI Insights Bar (bottom of page)**
- **What it does:** Shows aggregated AI-powered financial insights across all invoices
- **UI effect:** Amber-themed bar with Sparkles icon. Contains actionable recommendations in paragraph form
- **Backend effect:** None. SHOULD be generated by AI engine analyzing the full invoice dataset
- **Content includes:**
  - Early payment discount opportunities: "Pay Jones Plumbing by Dec 8 to capture $175 early payment discount"
  - PO variance warnings: "ABC Lumber INV-0847 is $920 over PO-089 -- verify change order or update PO before approval"
  - Draw consolidation suggestions: "Consolidating 3 Smith Residence invoices into Draw #4 would align with lender submission deadline"
  - Escalation alerts: "Cool Air HVAC dispute pending 17 days -- escalation recommended"
  - Credit memo impact: "Credit memo from ABC Lumber reduces PO-089 net exposure by $2,400"
- **Other pages affected:** These insights feed into Financial Dashboard, Budget variance analysis
- **Status:** 🚧 Mock Data

---

**AI Features Panel (expandable)**
Contains 5 AI feature cards:

**1. Auto-Coding**
- **Trigger:** On submission
- **What it does:** AI matches invoices to cost codes and POs based on vendor history, descriptions, and job context
- **Backend effect:** SHOULD run cost code matching engine (exact cache -> fuzzy match -> AI classify), auto-populate costCode field
- **Confidence:** 94%
- **Status:** 🚧 Mock Data

**2. Duplicate Detection**
- **Trigger:** Real-time
- **What it does:** Flags potential duplicate invoices by analyzing invoice numbers, amounts, dates, vendor patterns
- **Backend effect:** SHOULD compute hash (vendor_id|invoice_number|amount) and check for collisions within 30-day window
- **Action button:** "Review Flagged" - SHOULD navigate to filtered list of flagged duplicates
- **Status:** 🚧 Mock Data

**3. PO Variance Alert**
- **Trigger:** On submission
- **What it does:** Highlights invoices exceeding PO amounts with specific dollar variances
- **Backend effect:** SHOULD compare invoice.amount against po.total_amount and flag when exceeding tolerance threshold
- **Action button:** "View Variances" - SHOULD navigate to filtered list showing only variance invoices
- **Other pages affected:** PO page variance tracking, Budget variance analysis
- **Status:** 🚧 Mock Data

**4. Approval Routing**
- **Trigger:** On creation
- **What it does:** Suggests approval path based on invoice amount and type. Configurable thresholds (e.g., >$25K routes to Owner)
- **Backend effect:** SHOULD set approval_chain on invoice based on company configuration: amount thresholds, role hierarchy, cost code rules
- **Other pages affected:** Dashboard task queue for approvers
- **Status:** 🚧 Mock Data

**5. Payment Optimization**
- **Trigger:** Daily
- **What it does:** Suggests batch payments for early payment discounts
- **Backend effect:** SHOULD analyze payment_terms across all approved invoices, calculate savings from early payment, group by vendor for batch processing
- **Action button:** "View Recommendations" - SHOULD navigate to payment scheduling page
- **Other pages affected:** Cash flow projections, Accounts Payable batch processing
- **Status:** 🚧 Mock Data

---

#### Full System Ripple: Approving an Invoice

When an invoice transitions from `ready_for_approval` to `approved`:

| Affected System | What Changes |
|----------------|-------------|
| **Budget page** | Actuals for the cost code increase by the invoice amount. Variance (budget vs actual) recalculates. Budget health indicator may change color |
| **Job dashboard** | Financial summary updates: total spent, remaining budget, cost-to-complete |
| **Accounts Payable** | Invoice enters the AP aging queue. Shows in "Current" bucket based on due date |
| **Draw Requests** | Invoice becomes eligible for inclusion in next draw. Draw amount calculation updates |
| **Lien Waivers** | If enforcement is "strict", system checks if lien waiver is received before allowing payment |
| **Financial Dashboard** | Profit margin recalculates. Cash flow projection updates with expected payment date |
| **Vendor page** | Vendor's payment history and outstanding balance update |
| **QuickBooks sync** | SHOULD create/update Bill in QuickBooks with cost code mapping |
| **Audit log** | INSERT audit entry: who approved, when, approval step, amount |
| **Notifications** | Notify office/accounting that invoice is ready for payment. If early payment discount available, flag urgency |
| **Cost Intelligence** | Line items from approved invoice feed into pricing database for future estimates |
| **Client Portal** | If invoice is for a cost-plus or T&M contract, client may see the charge in their billing summary |

#### Full System Ripple: Paying an Invoice

When an invoice transitions from `approved` (or `in_draw`) to `paid`:

| Affected System | What Changes |
|----------------|-------------|
| **Accounts Payable** | Invoice removed from AP aging. Total payables decrease |
| **Cash flow** | Actual cash outflow recorded. Bank balance projection updates |
| **Vendor page** | Payment recorded in vendor history. Outstanding balance decreases |
| **Lien Waivers** | If conditional waiver, transition to require unconditional waiver for next period |
| **QuickBooks sync** | SHOULD record bill payment in QuickBooks |
| **Bank reconciliation** | Payment appears as pending transaction for reconciliation |
| **1099 tracking** | Payment amount added to vendor's annual 1099 total |
| **Audit log** | INSERT: payment method, check number/ACH ref, date, amount, who processed |

---

## Draw Requests

### /skeleton/draws — Company-Wide Draw List
### /skeleton/jobs/[id]/draws — Job-Scoped Draw List

*Preview file: `src/components/skeleton/previews/draws-preview.tsx`*
*Page files: `src/app/(skeleton)/skeleton/draws/page.tsx`, `src/app/(skeleton)/skeleton/jobs/[id]/draws/page.tsx`*
*Purpose: Manage construction loan draw requests (applications for payment). Track the flow from draft through internal approval, lender submission, bank inspection, and disbursement. This is how the builder gets paid by the bank/lender.*

#### Data Model (Draw)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| drawNumber | number | Sequential draw number per project |
| projectName | string | FK to jobs |
| milestone | string | Construction milestone this draw covers |
| amount | number | Gross draw amount |
| retainageAmount | number | Retainage withheld by lender |
| netAmount | number | Amount to be disbursed (amount - retainage) |
| previousBilled | number | Cumulative billed before this draw |
| totalCompleted | number | Cumulative completed including this draw |
| percentComplete | number | Overall project completion percentage |
| status | DrawStatus | Pipeline state |
| applicationDate | string | ISO date of draw application |
| periodFrom | string | ISO date - billing period start |
| periodTo | string | ISO date - billing period end |
| description | string | Milestone/work description |
| aiNote | string | AI-generated insight |
| formatType | string | aia_g702, custom, lender_specific |
| lenderName | string | Bank/lender name |
| submittedMethod | string | portal, email, physical |
| approvedAmount | number | Lender-approved amount (may differ from requested) |
| disbursedAmount | number | Actual disbursement received |
| variance | number | Difference between requested and approved |
| sovLineCount | number | Number of Schedule of Values lines |
| changeOrdersIncluded | number | Count of COs included in this draw |
| supportingDocs | object | Lien waivers, photos, inspections, invoice backup counts |
| revisionNumber | number | Revision iteration (0 = original) |
| autoGenerated | boolean | Was this draw auto-generated by the system |
| storedMaterials | number | Value of stored materials claimed |
| contractAmount | number | Current contract amount (including approved COs) |

#### Status Machine (DrawStatus)
```
draft -> internal_review -> approved_internal -> submitted -> lender_review -> approved -> disbursed -> paid
                                                           -> revision_requested -> draft (revised)
```
Statuses: `draft`, `internal_review`, `approved_internal`, `submitted`, `lender_review`, `revision_requested`, `approved`, `disbursed`, `paid`

---

#### Elements

---

**Header: "Draw Requests" with count, project count, and revision alert**
- **What it does:** Displays page title, total draw count, number of projects with draws, and revision needed count
- **UI effect:** Title with metadata. Red badge appears when any draws have `revision_requested` status: "1 revision needed"
- **Backend effect:** None. SHOULD query draws table grouped by project
- **Status:** 🚧 Mock Data

---

**Header buttons: "Export" and "New Draw"**

**"Export" button (Download icon)**
- **What it does:** SHOULD export draw schedule to PDF/Excel, optionally in AIA G702/G703 format
- **UI effect:** Warm-styled border button. Currently no-op
- **Backend effect:** SHOULD generate AIA G702 Application for Payment and G703 Continuation Sheet in PDF format
- **Syncs:** SHOULD support lender portal upload format
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"New Draw" button (Plus icon, primary)**
- **What it does:** SHOULD create a new draw request, auto-populating from approved invoices and budget completion percentages
- **UI effect:** Stone primary button. Currently no-op. SHOULD open draw creation wizard
- **Backend effect:** SHOULD:
  1. Create draw record with next sequential drawNumber for the project
  2. Auto-populate SOV lines from budget/cost codes
  3. Calculate completed amounts from approved invoices since last draw
  4. Flag any lien waiver gaps for the period
  5. Attach approved invoices as backup documentation
  6. Calculate retainage based on project/lender configuration
- **Other pages affected:**
  - Invoices: matching invoices transition to `in_draw` status
  - Lien Waivers: system checks all required waivers are collected
  - Budget: draw amounts reconcile against budget completion percentages
- **Validation:** Cannot create draw if required lien waivers are missing (in strict enforcement mode). Previous draw must be in approved/disbursed/paid status
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

---

**Summary Cards (5 cards)**

**Card 1: "Total Billed"**
- **What it does:** Shows cumulative amount billed across all draws
- **UI effect:** Stone card with TrendingUp icon
- **Backend effect:** SHOULD query `SELECT SUM(amount) FROM draws WHERE company_id = ?`
- **Other pages affected:** Financial Dashboard, Job P&L
- **Status:** 🚧 Mock Data

**Card 2: "Total Retainage"**
- **What it does:** Shows cumulative retainage held by lenders across all draws
- **UI effect:** Warm card with DollarSign icon
- **Backend effect:** SHOULD query `SELECT SUM(retainage_amount) FROM draws WHERE company_id = ?`
- **Other pages affected:** Balance sheet (retainage receivable), Cash flow projections, Financial reporting
- **Status:** 🚧 Mock Data

**Card 3: "Disbursed"**
- **What it does:** Shows total amount actually received from lenders
- **UI effect:** Green card with DollarSign icon
- **Backend effect:** SHOULD query `SELECT SUM(disbursed_amount) FROM draws WHERE disbursed_amount IS NOT NULL`
- **Other pages affected:** Cash flow actuals, Bank reconciliation
- **Status:** 🚧 Mock Data

**Card 4: "Pending Approval"**
- **What it does:** Shows count of draws in submitted, lender_review, or internal_review status
- **UI effect:** Amber card when pending > 0, warm when 0. Clock icon
- **Backend effect:** SHOULD query draws in pending statuses
- **Status:** 🚧 Mock Data

**Card 5: "Waiver Issues"**
- **What it does:** Shows count of draws with incomplete lien waiver packages
- **UI effect:** Red card when issues > 0, warm when 0. FileCheck icon
- **Backend effect:** SHOULD cross-reference draws.supportingDocs.lienWaivers.received < required
- **Other pages affected:** Lien Waivers page (these are the same gaps)
- **Status:** 🚧 Mock Data

---

**FilterBar: Search, Tabs, Project Dropdown, Sort**

**Search**
- **What it does:** Searches across milestone, description, projectName, lenderName
- **Status:** 🚧 Mock Data (client-side)

**Status tabs: All | Draft | Submitted | Revision | Approved | Paid**
- **What it does:** Filters draws by status group. "Submitted" includes both `submitted` and `lender_review`. "Paid" includes both `paid` and `disbursed`
- **Status:** 🚧 Mock Data

**Project dropdown: "All Projects"**
- **What it does:** Filters draws to a single project. When a project is selected, the Progress Bar visualization appears
- **UI effect:** Dropdown with project names. Selecting a project enables the visual progress bar section
- **Status:** 🚧 Mock Data

**Sort options: Draw # | Amount | Project | Date | Status | % Complete**
- **Status:** 🚧 Mock Data

---

**Progress Bar (visible when single project selected)**
- **What it does:** Visual representation of draw progress across the project lifecycle
- **UI effect:** Horizontal segmented bar. Each segment represents a draw. Width proportional to draw amount relative to total. Colors by status:
  - Green: paid
  - Emerald: disbursed
  - Amber: approved / lender_review
  - Stone: submitted / approved_internal / internal_review
  - Warm: draft
  - Red: revision_requested
- **Legend:** Color-coded legend below the bar
- **Backend effect:** None. SHOULD visualize actual draw timeline against contract amount
- **Status:** 🚧 Mock Data

---

**Draw Table (7 columns)**

**Table headers: Draw / Milestone | Project | Amount | Retainage | % Complete | Status | Period**
- **What it does:** Tabular display of all draws with expandable detail rows
- **UI effect:** Table with alternating row hover. Click any row to expand/collapse detail panel
- **Status:** 🚧 Mock Data

---

**Draw Row (clickable to expand)**

**Row click / chevron toggle**
- **What it does:** Expands or collapses the draw detail panel inline
- **UI effect:** ChevronRight rotates to ChevronDown. Background changes to stone-50. Detail row appears below
- **Backend effect:** None (local state toggle via useState Set)
- **Status:** 🚧 Mock Data

**Draw number display: "#N" or "#N Rev A"**
- **What it does:** Shows draw number. If this is a revision, shows revision letter (A, B, C...)
- **UI effect:** Monospace text with warm-500 color
- **Status:** 🚧 Mock Data

**"Auto" badge**
- **What it does:** Indicates this draw was auto-generated by the system (from approved invoices and schedule milestones)
- **UI effect:** Small warm badge "Auto"
- **Status:** 🚧 Mock Data

**Sparkles icon (AI note indicator)**
- **What it does:** Shows amber sparkle when the draw has an AI-generated note
- **UI effect:** Small amber Sparkles icon next to milestone name
- **Status:** 🚧 Mock Data

---

**Expanded Draw Detail Panel**

**Description text**
- **What it does:** Shows detailed description of work covered by this draw
- **Status:** 🚧 Mock Data

**Detail grid (4 columns):**
- Period: date range of billing period
- Net Amount: amount after retainage
- Format: AIA G702/G703, Custom, or Lender Specific
- Lender: bank/lender name
- **Status:** 🚧 Mock Data

**Second detail grid:**
- SOV Lines: count of Schedule of Values line items
- COs included: count of change orders reflected (with badge)
- Stored Materials: dollar value of materials stored on-site
- Variance: difference between requested and approved (red if negative)
- **Status:** 🚧 Mock Data

**Supporting Documents Checklist (DocsChecklist component)**
- **What it does:** Shows completeness of required supporting documentation
- **UI effect:** Inline row of 4 document status indicators:
  - Waivers: "X/Y" - green when complete, amber when incomplete
  - Photos: count of attached progress photos
  - Inspection: "Passed" (green) or "Pending" (amber) - only when required
  - Invoices: count of backup invoices attached
- **Backend effect:** None. SHOULD cross-reference lien_waivers, photos, inspections, and invoices tables
- **Other pages affected:** Lien Waivers page (waiver gaps), Photos (progress photos), Inspections
- **Status:** 🚧 Mock Data

**AI Note (within expanded row)**
- **What it does:** Shows AI insight about this specific draw
- **UI effect:** Amber text with Sparkles icon
- **Content examples:**
  - "Approved 2 days faster than average. Lender inspection passed with no adjustments."
  - "Pending bank inspection - typically 3-5 days. Inspector assigned: Tom Williams."
  - "Lender disputed 2 line items. Framing claimed 80% but inspector found 65%. Revision needed."
- **Status:** 🚧 Mock Data

---

**Context-sensitive action buttons (within expanded row, vary by status)**

**"Submit for Review" button (draft status only)**
- **What it does:** SHOULD transition draw from `draft` to `internal_review`
- **UI effect:** Stone-styled border button with Eye icon. Currently no-op
- **Backend effect:** SHOULD UPDATE draws SET status = 'internal_review'. INSERT audit log entry. Validate supporting docs completeness
- **Other pages affected:** Dashboard task queue for PM/owner review
- **Notifications:** SHOULD notify PM and owner that draw is ready for internal review
- **Validation:** All required lien waivers should be collected. Invoice backup should be attached. SOV lines should be complete
- **Reverse action:** Reviewer can send back to draft
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"Preview G702" button (draft status only)**
- **What it does:** SHOULD generate a preview of the AIA G702 Application for Payment form
- **UI effect:** Warm-styled border button with FileText icon. Currently no-op. SHOULD open PDF preview in modal or new tab
- **Backend effect:** SHOULD render G702/G703 forms from draw data, SOV lines, and change orders
- **Status:** 📝 Not Yet Implemented

**"Submit to Lender" button (approved_internal or internal_review status)**
- **What it does:** SHOULD transition draw from `approved_internal` to `submitted`, sending the draw package to the lender
- **UI effect:** Stone primary button with Send icon. Currently no-op
- **Backend effect:** SHOULD UPDATE draws SET status = 'submitted', submitted_method = [portal|email|physical]. Generate complete draw package (G702, G703, lien waivers, photos, inspection reports). If lender portal integration exists, auto-upload
- **Other pages affected:** None immediately. Lender review is an external process
- **Notifications:** SHOULD notify PM that draw was submitted. Log submission method and timestamp
- **Syncs:** SHOULD integrate with lender portals for automated submission where available
- **Validation:** All supporting documents must be complete. Internal approval must be obtained
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"Record Disbursement" button (approved status)**
- **What it does:** SHOULD record the actual disbursement received from the lender
- **UI effect:** Green primary button with DollarSign icon. Currently no-op. SHOULD open disbursement recording form
- **Backend effect:** SHOULD UPDATE draws SET status = 'disbursed', disbursed_amount = [amount]. May differ from requested amount if lender adjusted. Calculate variance
- **Other pages affected:**
  - Cash flow: actual cash receipt recorded
  - Bank reconciliation: incoming transaction for matching
  - Financial Dashboard: receivables decrease, cash increases
  - Job dashboard: funding received updates
  - Accounts Receivable: draw receivable cleared
- **Notifications:** SHOULD notify PM and accounting of disbursement receipt
- **Validation:** Disbursed amount must be > 0. Should record whether disbursement matches approved amount
- **Who can use it:** owner, admin, office
- **Status:** 📝 Not Yet Implemented

**"Create Revision" button (revision_requested status)**
- **What it does:** SHOULD create a revised version of the draw, pre-populated with adjustments based on lender feedback
- **UI effect:** Amber primary button with RotateCcw icon. Currently no-op
- **Backend effect:** SHOULD create new draw record with same drawNumber, incremented revisionNumber (or letter: A, B, C). Copy SOV lines from previous version. Apply lender-requested adjustments
- **Other pages affected:** Original draw version archived (not deleted - soft delete). Budget completion percentages may need adjustment
- **Notifications:** SHOULD notify PM about revision creation and what changed
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

---

**AI Insights Bar**
- **What it does:** Shows aggregated draw intelligence across all projects
- **UI effect:** Amber-themed bar with Sparkles icon
- **Content includes:**
  - "Draw #4 (Smith) pending bank inspection - typically 3-5 business days"
  - "Miller Addition Draw #1 Rev A needed - lender adjusted framing from 80% to 65%"
  - "2 draws have incomplete lien waiver packages"
  - "Based on 23 similar projects, submit Draw #5 documentation 5 days before milestone for 40% faster approval"
- **Status:** 🚧 Mock Data

---

**AI Features Panel (5 features)**

**1. Completion Verification**
- **Trigger:** On submission
- **What it does:** Validates work completion before draw submission by cross-referencing progress photos, inspection reports, and subcontractor sign-offs
- **Other pages affected:** Daily Logs (crew completion data), Photos, Inspections
- **Status:** 🚧 Mock Data

**2. Overbilling Detection**
- **Trigger:** Real-time
- **What it does:** Flags potential overbilling by comparing claimed percentages against historical patterns and industry benchmarks
- **Other pages affected:** Budget page (completion tracking), Financial reporting
- **Status:** 🚧 Mock Data

**3. Draw Timing Optimization**
- **Trigger:** Daily
- **What it does:** Suggests optimal draw submission timing based on lender processing patterns, cash flow needs, and project milestones
- **Other pages affected:** Cash flow projections, Schedule
- **Status:** 🚧 Mock Data

**4. Lender Pattern Analysis**
- **Trigger:** On change
- **What it does:** Tracks lender approval patterns including average review times, common revision requests, and inspector preferences
- **Status:** 🚧 Mock Data

**5. Cash Flow Projection**
- **Trigger:** Real-time
- **What it does:** Projects cash flow impact of pending draws, accounting for retainage schedules and typical disbursement timelines
- **Other pages affected:** Financial Dashboard cash flow chart, Budget forecasting
- **Status:** 🚧 Mock Data

---

#### Full System Ripple: Draw Approved by Lender

When a draw transitions from `lender_review` to `approved`:

| Affected System | What Changes |
|----------------|-------------|
| **Financial Dashboard** | Accounts receivable increases by draw net amount. Expected cash inflow updated |
| **Cash flow projections** | Disbursement expected within 3-5 business days (configurable) |
| **Budget page** | Billed-to-date amounts update for each SOV line item |
| **Job dashboard** | Draw status indicator updates. Funding progress bar advances |
| **Invoices** | Included invoices remain in `in_draw` status until disbursement |
| **Client Portal** | Client sees updated billing progress (if enabled) |
| **Audit log** | INSERT: lender approval date, approved amount, any adjustments |
| **Notifications** | Notify PM, owner, and accounting that draw was approved. Flag if amount differs from requested |

#### Full System Ripple: Draw Revision Requested

When a draw transitions from `lender_review` to `revision_requested`:

| Affected System | What Changes |
|----------------|-------------|
| **Dashboard** | Alert: "Draw #X revision requested" appears in action items |
| **Budget page** | Completion percentages may need downward adjustment |
| **Invoices** | Included invoices may need to be re-evaluated |
| **Notifications** | Urgent notification to PM: lender requires revision with specific feedback |
| **Audit log** | INSERT: revision reason, lender feedback, inspector notes |

---

## Purchase Orders

### /skeleton/purchase-orders — Company-Wide PO List
### /skeleton/jobs/[id]/purchase-orders — Job-Scoped PO List

*Preview file: `src/components/skeleton/previews/purchase-orders-preview.tsx`*
*Page files: `src/app/(skeleton)/skeleton/purchase-orders/page.tsx`, `src/app/(skeleton)/skeleton/jobs/[id]/purchase-orders/page.tsx`*
*Purpose: Create, approve, send, track, and close purchase orders. Manage the full procurement lifecycle from ordering materials/services through receiving and three-way matching against invoices. Enforces budget gates to prevent overspending.*

#### Data Model (PurchaseOrder)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| poNumber | string | System-generated PO number |
| vendorName | string | FK to vendors |
| jobName | string | FK to jobs |
| subtotal | number | Pre-tax, pre-shipping total |
| taxAmount | number | Sales tax |
| shippingAmount | number | Shipping/freight cost |
| totalAmount | number | Grand total |
| invoicedAmount | number | Total invoiced against this PO |
| remainingAmount | number | totalAmount - invoicedAmount |
| poType | string | standard, blanket, emergency |
| costCode | string | Budget cost code |
| paymentTerms | string | Payment terms |
| itemsCount | number | Number of line items |
| issueDate | string | ISO date PO was created |
| requiredByDate | string | ISO date materials needed by |
| expectedDelivery | string | ISO date vendor estimates delivery |
| status | PO Status | Pipeline state |
| approvalProgress | object | { completed, total, currentApprover } |
| versionNumber | number | PO revision version |
| receivedPct | number | Percentage of items received |
| backorderedItems | number | Count of backordered items |
| trackingNumber | string | Carrier tracking number |
| carrier | string | ups, fedex, usps, freight |
| threeWayMatchStatus | string | full_match, partial_match, variance, pending |
| varianceAmount | number | Dollar variance between PO and invoice |
| variancePct | number | Percentage variance |
| isEmergency | boolean | Emergency PO flag |
| emergencyReason | string | Why emergency approval was needed |
| blanketLimit | number | Spending limit for blanket POs |
| blanketUsed | number | Amount consumed against blanket |
| changeOrderId | string | FK to change order that triggered this PO |
| changeOrderNumber | string | Display reference |
| bidId | string | FK to bid that was awarded |
| bidReference | string | Display reference |
| selectionId | string | FK to client selection |
| selectionName | string | Display reference |
| aiNote | string | AI-generated insight |
| aiPriceAssessment | string | Price intelligence assessment |

#### Status Machine (PO Status)
```
draft -> pending_approval -> approved -> sent -> acknowledged -> partial_delivery -> fully_received -> invoiced -> closed
                                       -> cancelled
```
Statuses: `draft`, `pending_approval`, `approved`, `sent`, `acknowledged`, `partial_delivery`, `fully_received`, `invoiced`, `closed`, `cancelled`

---

#### Elements

---

**Header: "Purchase Orders" with count, emergency badge, and commitment summary**
- **What it does:** Shows PO count, flags emergency POs, and displays committed amount vs project budget
- **UI effect:** Title row with metadata. Red badge "1 emergency" when emergency POs exist. Secondary line: "Committed: $XXX of $X.XXM budget (XX.X%)"
- **Backend effect:** SHOULD query active POs and sum committed amounts against project budget
- **Other pages affected:** Budget page shows same commitment totals
- **Status:** 🚧 Mock Data

---

**Quick Stats Row (5 cards)**

**Card 1: "Total Committed"**
- **What it does:** Sum of total amounts for all active POs (excludes draft, cancelled, closed)
- **UI effect:** Stone card with DollarSign icon. Shows count of active POs below
- **Backend effect:** SHOULD query `SELECT SUM(total_amount) FROM purchase_orders WHERE status NOT IN ('draft', 'cancelled', 'closed')`
- **Other pages affected:** Budget page committed column, Financial Dashboard
- **Status:** 🚧 Mock Data

**Card 2: "Pending Delivery"**
- **What it does:** Dollar total and count of POs in sent, acknowledged, or approved status (waiting for delivery)
- **UI effect:** Amber card with Truck icon
- **Backend effect:** SHOULD track ETAs and flag late deliveries
- **Other pages affected:** Schedule page (delivery milestones), Job dashboard
- **Status:** 🚧 Mock Data

**Card 3: "Total Invoiced"**
- **What it does:** Total invoiced against all POs, with match/variance counts
- **UI effect:** Stone card with Receipt icon. Shows "X matched, Y variance" below
- **Backend effect:** SHOULD query `SELECT SUM(invoiced_amount) FROM purchase_orders`
- **Other pages affected:** Invoice page three-way match status
- **Status:** 🚧 Mock Data

**Card 4: "Backordered"**
- **What it does:** Total backordered item count across all POs
- **UI effect:** Sand card when backorders exist, warm when none. AlertCircle icon
- **Backend effect:** SHOULD track by PO line item with expected restock dates
- **Other pages affected:** Schedule page (task delays from backorders)
- **Status:** 🚧 Mock Data

**Card 5: "3-Way Match"**
- **What it does:** Shows ratio of fully matched POs (PO + receipt + invoice all agree)
- **UI effect:** Green card with ShieldCheck icon. Shows "X/Y fully matched"
- **Backend effect:** SHOULD compare purchase_order.total_amount vs receiving_record vs invoice.amount
- **Other pages affected:** Invoice approval workflow (auto-approve when matched)
- **Status:** 🚧 Mock Data

---

**FilterBar: Search, Status Tabs, Vendor/Job/Type Dropdowns, Sort, Actions**

**Search**
- **What it does:** Searches across poNumber, vendorName, jobName, costCode
- **Status:** 🚧 Mock Data

**Status tabs: All | Draft | Pending | Sent | Ack'd | Partial | Received | Invoiced | Closed**
- **Status:** 🚧 Mock Data

**Vendor dropdown, Job dropdown, Type dropdown (Standard | Blanket | Emergency)**
- **Status:** 🚧 Mock Data

**Sort: Amount | Issue Date | Delivery Date | Vendor | Job | Cost Code | Status**
- **Status:** 🚧 Mock Data

**"Export" button**
- **What it does:** SHOULD export PO list to CSV/PDF
- **Status:** 📝 Not Yet Implemented

**"New PO" button (primary)**
- **What it does:** SHOULD open PO creation form with vendor selection, line items, budget validation
- **Backend effect:** SHOULD:
  1. INSERT purchase_order record
  2. Validate budget availability: check remaining budget for cost code
  3. Run price intelligence: compare against historical pricing for same materials
  4. Check vendor insurance and W-9 status
  5. Calculate tax based on jurisdiction rules
  6. Set approval chain based on amount thresholds
- **Other pages affected:**
  - Budget page: committed amount increases
  - Vendor page: PO appears in vendor's order history
  - Schedule: if linked to a task, delivery date feeds schedule
  - Inventory: expected inbound materials recorded
- **Validation:** Required: vendor, job, at least one line item, cost code. Budget gate: warn if PO will exceed cost code budget (block in strict mode)
- **Who can use it:** owner, admin, pm, superintendent (emergency only for field)
- **Status:** 📝 Not Yet Implemented

---

**PO Card (rendered for each purchase order in 2-column grid)**

**PO number and status badge**
- **What it does:** Shows PO number and current status
- **UI effect:** Bold PO number with colored status pill. Status icons match their state
- **Status:** 🚧 Mock Data

**PO type badge (non-standard only)**
- **What it does:** Shows "Blanket" or "Emergency" badge for special PO types
- **UI effect:** Emergency: red with ShieldAlert icon. Blanket: stone-colored
- **Status:** 🚧 Mock Data

**Version badge (v2+)**
- **What it does:** Shows PO revision version when > 1
- **UI effect:** Warm badge with GitBranch icon "vN"
- **Status:** 🚧 Mock Data

**Three-dot menu button**
- **What it does:** SHOULD open action menu for this PO
- **UI effect:** Hover background change. Currently no dropdown
- **Expected actions:**
  - View/Edit PO
  - Submit for Approval (draft)
  - Approve (pending_approval, if authorized)
  - Send to Vendor (approved)
  - Record Receipt (sent/acknowledged)
  - Cancel PO (with reason)
  - Create Change Order (for scope changes)
  - View Receiving History
  - Print PO
  - Duplicate PO
- **Status:** 📝 Not Yet Implemented

**Vendor name and Job name**
- **Status:** 🚧 Mock Data

**Issue date, Items count, Payment terms**
- **Status:** 🚧 Mock Data

**Expected delivery with required-by date**
- **What it does:** Shows vendor's estimated delivery date and the date materials are needed
- **UI effect:** Truck icon with dates. Only shows when delivery is pending (not for fully_received, invoiced, closed)
- **Other pages affected:** Schedule page delivery milestones
- **Status:** 🚧 Mock Data

**Tracking number with carrier link**
- **What it does:** Shows carrier tracking number with clickable external link to carrier's tracking page
- **UI effect:** Truck icon, carrier name (UPS/FedEx/USPS/Freight), monospace tracking number, "Track Shipment" link
- **Backend effect:** None (external link). Links: UPS (`ups.com/track`), FedEx (`fedex.com/fedextrack`), USPS (`tools.usps.com`), Freight (no link)
- **Status:** 🚧 Mock Data

**Approval Progress bar (pending_approval status only)**
- **What it does:** Shows multi-step approval progress with current approver name
- **UI effect:** Amber background panel. Progress bar showing X/Y approvals. Current approver name with User icon
- **Backend effect:** SHOULD track approval chain: PM -> Director -> Owner (threshold-based)
- **Other pages affected:** Dashboard task queue for current approver
- **Notifications:** SHOULD notify next approver in chain
- **Status:** 🚧 Mock Data

**Receiving Progress bar (partial_delivery or fully_received)**
- **What it does:** Shows what percentage of ordered items have been received, with backorder count
- **UI effect:** Progress bar: amber when partial, green when 100%. Backorder alert with AlertCircle icon
- **Backend effect:** SHOULD track receiving records per PO line item
- **Other pages affected:** Schedule (delivery impacts), Inventory (received items added to stock)
- **Status:** 🚧 Mock Data

**Blanket PO Gauge (blanket type only)**
- **What it does:** Shows spending against blanket PO limit
- **UI effect:** Stone-colored panel with Gauge icon. Progress bar: stone when < 60%, amber when 60-80%, red when > 80%. Shows remaining dollar amount
- **Backend effect:** SHOULD track sum of releases against blanket limit. SHOULD alert when approaching limit
- **Other pages affected:** Budget committed amounts
- **Notifications:** SHOULD alert PM when blanket PO reaches 75% utilization
- **Status:** 🚧 Mock Data

**Emergency reason panel (emergency POs only)**
- **What it does:** Shows why this PO bypassed normal approval
- **UI effect:** Red background panel with ShieldAlert icon and reason text. Left border is red
- **Backend effect:** Emergency POs bypass normal approval chain but SHOULD require after-the-fact owner review within 48 hours
- **Notifications:** SHOULD immediately notify owner of emergency PO creation
- **Status:** 🚧 Mock Data

**Amount section with invoiced/remaining breakdown**
- **What it does:** Shows total PO amount, how much has been invoiced, and remaining balance
- **UI effect:** DollarSign icon with large amount. Below: "Invoiced: $XXK | Remaining: $XXK" (when invoiced > 0)
- **Status:** 🚧 Mock Data

**Three-way match status badge**
- **What it does:** Shows whether PO, receiving record, and invoice all agree
- **UI effect:** Colored CircleDot badge: green "Matched", amber "Partial", red "Variance (+X.X%)", warm "Pending"
- **Backend effect:** SHOULD compare: PO total vs sum of receiving records vs sum of invoices
- **Other pages affected:** Invoice approval workflow (variances require review before approval)
- **Status:** 🚧 Mock Data

**"Submit" button (draft status only)**
- **What it does:** SHOULD transition PO from draft to pending_approval
- **UI effect:** Small stone text-button with Send icon
- **Backend effect:** SHOULD UPDATE status = 'pending_approval'. Initiate approval chain based on amount thresholds
- **Validation:** All required fields must be complete. Budget availability confirmed
- **Status:** 📝 Not Yet Implemented

**"Send to Vendor" button (approved status, non-emergency)**
- **What it does:** SHOULD send the PO to the vendor via email or vendor portal
- **UI effect:** Small stone text-button with Send icon
- **Backend effect:** SHOULD UPDATE status = 'sent'. Generate PO PDF. Send via configured method (email, vendor portal). Record sent timestamp
- **Notifications:** SHOULD email PO to vendor contact. If vendor has portal access, notification appears there
- **Other pages affected:** Vendor Portal (PO appears in vendor's queue)
- **Status:** 📝 Not Yet Implemented

**Cross-module badges: Cost Code, Change Order, Bid Reference, Selection Name, AI Price Assessment**
- **What it does:** Shows linked entities from other modules
- **UI effect:** Row of small badges:
  - Cost code: warm badge
  - Change Order: stone badge with Link2 icon (e.g., "CO-002")
  - Bid Reference: stone badge with FileText icon
  - Selection Name: stone badge with Layers icon (e.g., "Impact Windows")
  - AI Price Assessment: green if favorable, amber if above average (e.g., "Within market range (+2.1%)", "8% above your avg. for framing lumber")
- **Backend effect:** SHOULD be clickable links to respective detail pages
- **Status:** 🚧 Mock Data

**AI Note panel**
- **What it does:** Shows AI-generated procurement insight
- **UI effect:** Amber panel with Sparkles icon
- **Content examples:**
  - "Lead time 6+ weeks. Order for Johnson job by Jan 20 or framing schedule slips."
  - "No vendor acknowledgment in 3 days. Follow up recommended. This vendor avg 1.2 day response."
  - "Consolidation opportunity: Combine with PO-0142 (ABC Lumber, same materials). Est. savings: $850 (volume discount)."
  - "Invoice $300 over PO (2.3%). Within auto-approve tolerance (2%). Auto-approved with audit log."
  - "Emergency PO bypassed normal approval. After-the-fact review required by owner within 48 hours."
  - "Blanket PO 57% utilized. 3 releases issued. At current rate, limit reached by mid-March."
  - "Approving this PO will consume 85% of 04-Framing budget. $2,340 remaining."
- **Status:** 🚧 Mock Data

---

**AI Features Panel (4 features)**

**1. Budget Impact Analysis**
- **Trigger:** On submission
- **What it does:** Warns when a PO will consume a significant portion of a budget line
- **Action button:** "View Budget" - SHOULD navigate to budget page filtered to the relevant cost code
- **Other pages affected:** Budget page, Financial Dashboard
- **Status:** 🚧 Mock Data

**2. Vendor Recommendation**
- **Trigger:** On creation
- **What it does:** Shows competing vendor quotes and vendor performance ratings
- **Other pages affected:** Vendor Performance scorecards, Bid Management
- **Status:** 🚧 Mock Data

**3. Price Intelligence Check**
- **Trigger:** Real-time
- **What it does:** Compares material prices against 6-month rolling average and market trends
- **Action button:** "View Trends" - SHOULD navigate to Price Intelligence page
- **Other pages affected:** Estimating Engine (price database), Price Intelligence module
- **Status:** 🚧 Mock Data

**4. Material Substitution**
- **Trigger:** On change
- **What it does:** Suggests alternative products when items are unavailable or overpriced
- **Action button:** "Compare Options" - SHOULD open comparison modal
- **Other pages affected:** Selections (client-approved alternatives), Inventory
- **Status:** 🚧 Mock Data

---

#### Full System Ripple: Approving a Purchase Order

When a PO transitions from `pending_approval` to `approved`:

| Affected System | What Changes |
|----------------|-------------|
| **Budget page** | Committed amount for the cost code increases by PO total. Budget "remaining" decreases. Budget health bar updates |
| **Job dashboard** | Procurement status summary updates. Committed vs actual spending recalculates |
| **Financial Dashboard** | Total commitments across company update. Cash flow projection adds expected outflow |
| **Vendor page** | PO appears in vendor's active orders |
| **Schedule** | If PO has expectedDelivery linked to a task, delivery milestone appears on schedule |
| **Inventory** | Expected inbound inventory recorded for tracking |
| **Audit log** | INSERT: approval chain record with each approver, timestamps, any notes |
| **Notifications** | Notify PM that PO is approved. If auto-send is enabled, send to vendor immediately |

#### Full System Ripple: Recording PO Receipt

When items are received against a PO (partial_delivery or fully_received):

| Affected System | What Changes |
|----------------|-------------|
| **Invoice matching** | Three-way match can now be completed: PO + Receipt + Invoice |
| **Inventory** | Received items added to job-site or warehouse inventory |
| **Schedule** | Material delivery milestone marked complete. Dependent tasks can start |
| **Budget** | No change (committed amount was already recorded at PO approval) |
| **Audit log** | INSERT: who received, what items, quantities, any discrepancies |
| **Notifications** | If fully received, notify PM. If backorders, notify PM of expected dates |

---

## Change Orders

### /skeleton/jobs/[id]/change-orders — Job-Scoped Change Order List

*Preview file: `src/components/skeleton/previews/change-orders-preview.tsx`*
*Page file: `src/app/(skeleton)/skeleton/jobs/[id]/change-orders/page.tsx`*
*Purpose: Track all scope changes on a construction project. Each change order records the cost impact, schedule impact, source/cause, approval chain, and client negotiations. Change orders modify the original contract amount and cascade to budget, draws, and client billing.*

#### Data Model (ChangeOrder)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| coNumber | string | Sequential CO number (e.g., CO-001) |
| title | string | Short title of the change |
| description | string | Detailed scope description |
| materialsCost | number | Materials cost component |
| laborCost | number | Labor cost component |
| equipmentCost | number | Equipment cost component |
| subcontractorCost | number | Subcontractor cost component |
| subtotal | number | Sum of cost components |
| markupType | string | single_pct, split_oh_profit, tiered, fixed_fee |
| markupPct | number | Markup percentage |
| markupAmount | number | Calculated markup dollar amount |
| totalAmount | number | Final amount (positive = add, negative = credit) |
| isCredit | boolean | Whether this is a credit (contract reduction) |
| sourceType | string | field, client_request, design_change, allowance_overage, code_change, builder_initiated |
| causeCategory | string | User-defined cause label |
| initiatedBy | string | Who requested/discovered the change |
| createdDate | string | ISO date |
| scheduleImpact | number | Days added (positive) or saved (negative) |
| affectedTasks | string[] | List of schedule tasks impacted |
| status | CO Status | Pipeline state |
| negotiationStatus | string | proposed, client_counter, builder_counter, revised, final |
| versionNumber | number | Revision iteration |
| approvalProgress | object | { completed, total } internal approval steps |
| internalApprovedAt | string | ISO date of internal approval |
| clientApprovedAt | string | ISO date of client approval |
| clientSignature | boolean | Whether client has e-signed |
| rfiId | string | FK to originating RFI |
| rfiNumber | string | Display reference |
| selectionId | string | FK to client selection |
| selectionName | string | Display reference |
| linkedPoIds | string[] | FKs to purchase orders created from this CO |
| costCode | string | Primary cost code |
| contractId | string | FK to contract being modified |
| aiNote | string | AI-generated insight |
| aiConfidence | number | 0-1 confidence score |
| hasPhotos | boolean | Documentation completeness |
| hasScopeDescription | boolean | Documentation completeness |
| hasCostBreakdown | boolean | Documentation completeness |
| hasClientApproval | boolean | Documentation completeness |

#### Status Machine (CO Status)
```
draft -> internal_review -> client_presented -> negotiation -> approved
                                             -> approved (direct)
                         -> rejected
draft -> withdrawn
approved -> voided (rare, reversal)
```
Statuses: `draft`, `internal_review`, `client_presented`, `negotiation`, `approved`, `rejected`, `withdrawn`, `voided`

---

#### Elements

---

**Header: "Change Orders - [Job Name]" with count, contract amounts**
- **What it does:** Shows page title scoped to specific job, total CO count, original contract amount, and revised contract amount
- **UI effect:** Title with badge showing total count. Second line: "Original Contract: $X.XXM | Revised: $X.XXM"
- **Backend effect:** SHOULD calculate `revised_contract = original_contract + SUM(approved_co_amounts)`
- **Other pages affected:** Contract page, Client Portal billing, Financial Dashboard
- **Status:** 🚧 Mock Data

---

**Quick Stats Row (5 cards)**

**Card 1: "Total COs"**
- **What it does:** Total count of change orders with approved count below
- **UI effect:** Warm card with ClipboardList icon
- **Status:** 🚧 Mock Data

**Card 2: "Net Approved"**
- **What it does:** Sum of all approved CO amounts (including credits)
- **UI effect:** Red card if net positive (costs added), green if net negative (savings). TrendingUp/Down icon. Shows percentage of original contract below
- **Backend effect:** SHOULD query `SELECT SUM(total_amount) FROM change_orders WHERE status = 'approved' AND job_id = ?`
- **Other pages affected:** Budget page (total budget adjusts), Contract page (revised contract amount), Draw requests (SOV updates), Client Portal (revised contract displayed)
- **Status:** 🚧 Mock Data

**Card 3: "Pending"**
- **What it does:** Count and dollar amount of COs in draft, internal_review, client_presented, or negotiation status
- **UI effect:** Amber card with Clock icon
- **Backend effect:** Pending COs represent potential budget exposure
- **Other pages affected:** Financial Dashboard (contingency planning)
- **Status:** 🚧 Mock Data

**Card 4: "Schedule Impact"**
- **What it does:** Net schedule days added by approved COs
- **UI effect:** Amber if positive (delays), green if negative (savings). Calendar icon. Shows count of COs with schedule impact
- **Backend effect:** SHOULD query `SELECT SUM(schedule_impact) FROM change_orders WHERE status = 'approved'`
- **Other pages affected:** Schedule page (project end date adjusts), Client Portal (revised completion date)
- **Status:** 🚧 Mock Data

**Card 5: "Top Cause" (AI-enhanced)**
- **What it does:** Shows the most common cause category with comparison to portfolio average
- **UI effect:** Red card when design errors exceed 2x portfolio average. BarChart3 icon. Shows cause name, count, and dollar total. AI comparison badge when pattern is anomalous
- **Backend effect:** SHOULD aggregate cause categories across all COs for pattern detection
- **Other pages affected:** AI recommendations for process improvement
- **Status:** 🚧 Mock Data

---

**AI Cause Pattern Detection banner (conditional)**
- **What it does:** When design error rate exceeds portfolio average, shows expanded analysis with recommendations
- **UI effect:** Full-width AIFeatureCard between stats and filters. Collapsible (defaultCollapsed). Shows percentage comparison, dollar impact, and actionable recommendations
- **Content example:** "22% of COs on this job from design errors (portfolio avg: 15%). Recommendations: 1) Implement design coordination meetings before each phase. 2) Require architect sign-off on structural details..."
- **Backend effect:** SHOULD aggregate cause data across the company's project portfolio for benchmarking
- **Status:** 🚧 Mock Data

---

**FilterBar: Search, Status Tabs, Source/Cause Dropdowns, Sort, Actions**

**Search**
- **What it does:** Searches across coNumber, title, description, initiatedBy, costCode, causeCategory
- **Status:** 🚧 Mock Data

**Status tabs: All | Draft | In Review | Client | Negotiation | Approved | Rejected | Withdrawn**
- **Status:** 🚧 Mock Data

**Source dropdown: All Sources | Client Request | Field Condition | Design Change | Code Change | Allowance Overage | Builder Initiated**
- **What it does:** Filters COs by how the change originated
- **Status:** 🚧 Mock Data

**Cause dropdown: All Causes | [dynamically populated from data]**
- **What it does:** Filters by user-defined cause category (e.g., "Client Request", "Unforeseen Condition", "Design Error")
- **Status:** 🚧 Mock Data

**Sort: Amount | Date | Schedule Impact | CO Number | Cause | Status**
- **Status:** 🚧 Mock Data

**"Export" button**
- **What it does:** SHOULD export CO log to CSV/PDF with full cost breakdown and status history
- **Status:** 📝 Not Yet Implemented

**"New CO" button (primary)**
- **What it does:** SHOULD open change order creation form
- **Backend effect:** SHOULD:
  1. INSERT change_order record with next sequential coNumber
  2. Calculate markup based on company configuration (single %, OH+P split, tiered, fixed fee)
  3. Link to originating RFI/selection if applicable
  4. Run AI cost estimation against similar COs
  5. Calculate schedule impact based on affected tasks
  6. Initiate internal approval workflow
- **Other pages affected:**
  - Budget page: pending CO amount shows as potential exposure
  - Schedule: if schedule impact, tasks adjust
  - Client Portal: client sees pending CO (when presented)
  - Contract: pending contract modification
- **Validation:** Required: title, at least one cost component, cost code, source type. Cost breakdown must equal subtotal. Markup must follow company configuration
- **Who can use it:** owner, admin, pm, superintendent
- **Status:** 📝 Not Yet Implemented

---

**Change Order Card (rendered in 2-column grid)**

**CO number, status badge, version badge**
- **What it does:** Shows CO identifier, current status with icon, and version if > 1
- **UI effect:** Monospace CO number. Colored status badge (green=approved, red=rejected, stone=review, warm=negotiation, sand=withdrawn). Version badge with GitBranch icon
- **Status:** 🚧 Mock Data

**Three-dot menu button**
- **What it does:** SHOULD open action menu
- **Expected actions:**
  - Edit CO (draft/review only)
  - Submit for Internal Review (draft)
  - Present to Client (internally approved)
  - Record Client Response (client_presented)
  - Approve / Reject (authorized users)
  - Withdraw (draft/presented)
  - Create PO from CO (approved)
  - View Audit History
  - Print CO
  - Send to Client Portal
- **Status:** 📝 Not Yet Implemented

**Title and description**
- **What it does:** Shows change scope. Description is truncated to 2 lines
- **Status:** 🚧 Mock Data

**Amount display with source badge and CREDIT badge**
- **What it does:** Shows total CO amount with +/- prefix. Credits shown in green, additions in red. Source type badge. "CREDIT" badge for negative amounts
- **UI effect:** Large bold amount. Source badge color-coded by type (client=stone, field=sand, design=warm, code=red, allowance=stone, builder=emerald)
- **Status:** 🚧 Mock Data

**AI Cost Estimation card (non-terminal statuses only)**
- **What it does:** Compares this CO's cost against similar COs from other projects
- **UI effect:** AIFeatureCard with "Cost Estimation" title. Shows comparable project, cost difference, and percentage
- **Action button:** "Apply Estimate" - SHOULD auto-fill cost fields from AI estimate
- **Backend effect:** SHOULD query historical COs with similar titles/descriptions/cost codes
- **Status:** 🚧 Mock Data

**Cost breakdown panel**
- **What it does:** Shows itemized cost breakdown: Materials, Labor, Equipment, Subcontractor, Subtotal, Markup
- **UI effect:** Warm background panel with two rows. Top: subtotal and individual component amounts. Bottom: markup percentage and dollar amount. Components only shown when nonzero
- **Status:** 🚧 Mock Data

**Metadata row: Initiated By | Date | Schedule Impact**
- **What it does:** Shows who requested the change, when, and days impact
- **UI effect:** 3-column grid. User icon + name, Calendar icon + date, Clock icon + "+X days" (amber), "-X days" (green), or "No impact" (warm)
- **Status:** 🚧 Mock Data

**AI Schedule Impact Analysis (when schedule impact nonzero)**
- **What it does:** Shows cascading effects on project schedule
- **UI effect:** AIFeatureCard warning when positive impact, success when negative. Shows critical path effects and cascading task delays
- **Content example:** "This CO adds 5 days to Foundation. Critical path impact: Slab Pour start pushed from Mar 15 to Mar 20."
- **Backend effect:** SHOULD integrate with schedule engine to calculate actual critical path impact
- **Other pages affected:** Schedule page Gantt chart, Job dashboard timeline
- **Status:** 🚧 Mock Data

**Approval Progress bar (internal_review or client_presented status)**
- **What it does:** Shows multi-step approval progress
- **UI effect:** Progress bar with ShieldCheck icon. X/Y format
- **Backend effect:** SHOULD track: PM approval -> Director approval -> Owner approval (configurable chain)
- **Status:** 🚧 Mock Data

**Negotiation status panel (negotiation status)**
- **What it does:** Shows current negotiation phase between builder and client
- **UI effect:** Warm background panel with MessageSquare icon. Shows: "Proposed", "Client Counter", "Builder Counter", "Revised", or "Final"
- **Backend effect:** SHOULD track negotiation history with each party's proposed amounts and notes
- **Other pages affected:** Client Portal (client sees negotiation thread)
- **Status:** 🚧 Mock Data

**Documentation Completeness card (AI-powered, draft/review/presented statuses)**
- **What it does:** Checks if all required documentation is present before CO can advance
- **UI effect:** AIFeatureCard showing percentage readiness. Lists missing items: Photos, Scope description, Cost breakdown, Client approval. Severity: warning (75%+), critical (<75%)
- **Action button:** "Add Missing Items" - SHOULD navigate to document upload
- **Backend effect:** SHOULD check file attachments, field completeness, and signature status
- **Status:** 🚧 Mock Data

**Budget Cascade Preview card (AI-powered, non-terminal statuses)**
- **What it does:** Shows projected impact on budget and draws if CO is approved
- **UI effect:** AIFeatureCard showing: cost code budget adjustment, contingency impact (current -> new), draw schedule adjustment
- **Content example:** "Update 09 - Finishes budget +$5.1K, reduce contingency from $18.2K to $13.1K, adjust Draw #4 by +$5.1K"
- **Action button:** "Preview Full Impact" - SHOULD open budget impact detail view
- **Other pages affected:** Budget page, Draw requests, Financial Dashboard contingency tracking
- **Status:** 🚧 Mock Data

**Cross-module badges: Cost Code, RFI, Selection, Linked POs, e-Signed**
- **What it does:** Shows connections to other modules
- **UI effect:** Row of small badges:
  - Cost code: warm badge
  - RFI: stone badge with Link2 icon (e.g., "RFI-012")
  - Selection: stone badge with Layers icon (e.g., "Master Bath Tile")
  - Linked PO: stone badge with FileText icon (e.g., "PO-2026-0098")
  - e-Signed: green badge with PenLine icon (when client has electronically signed)
- **Backend effect:** SHOULD be clickable links to respective detail pages
- **Status:** 🚧 Mock Data

**AI Note panel**
- **What it does:** Shows AI insight about this change order
- **UI effect:** Amber panel with Sparkles icon. Confidence score shown when < 95%
- **Content examples:**
  - "Similar soil issues on 3 nearby coastal projects. Recommend budgeting +10% contingency for coastal sites."
  - "Client counter-proposed $12,500. Original: $14,720. Pending 8 days -- follow up recommended."
  - "Auto-generated from selection overage. Allowance: $8,000, Selected: $23,200."
  - "Rejected: Design team responsible per contract terms. No owner cost impact."
  - "Domestic stone lead time 2 weeks vs. imported 8 weeks. Schedule improvement of 3 days on critical path."
  - "Withdrawn by client Jan 15 after cost presentation. Within 48-hour withdrawal window."
- **Status:** 🚧 Mock Data

---

**AI Insights Panel (5 feature cards)**

**1. Escalation Alert**
- **Trigger:** Real-time
- **What it does:** Warns when CO negotiations or approvals are stalled beyond thresholds
- **Action button:** "View CO-003" - navigates to stalled CO
- **Status:** 🚧 Mock Data

**2. Cause Pattern Detection**
- **Trigger:** Daily
- **What it does:** Analyzes cause distribution vs portfolio averages. Flags anomalies
- **Action button:** "View Recommendations" - shows process improvement suggestions
- **Other pages affected:** Project analytics, Vendor Performance (if vendor-related causes)
- **Status:** 🚧 Mock Data

**3. Field Conditions Analysis**
- **Trigger:** Weekly
- **What it does:** Benchmarks field condition COs against portfolio average
- **Status:** 🚧 Mock Data

**4. CO Rate Benchmark**
- **Trigger:** Weekly
- **What it does:** Compares CO frequency per million dollars against portfolio average
- **Status:** 🚧 Mock Data

**5. Value Engineering**
- **Trigger:** On change
- **What it does:** Highlights COs that save money or schedule time through alternative approaches
- **Action button:** "View Details" - shows full VE analysis
- **Other pages affected:** Estimating Engine (VE alternatives database)
- **Status:** 🚧 Mock Data

---

#### Full System Ripple: Approving a Change Order

When a CO transitions to `approved` (both internal and client approval):

| Affected System | What Changes |
|----------------|-------------|
| **Contract** | Original contract amount increases (or decreases for credit). Revised contract amount = original + SUM(approved COs) |
| **Budget page** | Cost code budget line adjusts by CO amount. Contingency decreases (or increases for credits). Total project budget recalculates |
| **Draw Requests** | SOV (Schedule of Values) updates with new/modified line items. Next draw amount calculation changes. If CO includes stored materials, those are tracked |
| **Schedule** | If scheduleImpact != 0, project tasks adjust. Critical path recalculates. Completion date may change |
| **Client Portal** | Client sees approved CO in their project summary. Contract value updates. If CO has schedule impact, timeline adjusts |
| **Financial Dashboard** | Profit margin recalculates. If CO increases scope, expected revenue increases. Budget variance recalculates |
| **Purchase Orders** | POs may be auto-created for approved CO material/equipment needs |
| **Invoices** | Future invoices can be coded against the CO-modified budget line |
| **Vendor page** | If CO involves a specific vendor, appears in vendor's project history |
| **Estimating Engine** | CO cost data feeds future estimates for similar scope items |
| **Audit log** | INSERT: full approval chain record, client signature timestamp, all version history |
| **Notifications** | Notify PM, superintendent, and accounting. If large CO, notify owner. Client receives confirmation email |
| **QuickBooks sync** | SHOULD update project/class budget in QuickBooks |

---

## Lien Waivers

### /skeleton/jobs/[id]/lien-waivers — Job-Scoped Lien Waiver Tracker

*Preview file: `src/components/skeleton/previews/lien-waivers-preview.tsx`*
*Page file: `src/app/(skeleton)/skeleton/jobs/[id]/lien-waivers/page.tsx`*
*Purpose: Track and enforce lien waiver collection from all vendors and subcontractors. Lien waivers are legal documents protecting the property owner (and builder) from mechanics liens. In strict enforcement mode, payments are blocked until waivers are received. This page tracks the full chain: request -> submission -> approval, with state-specific statutory form requirements.*

#### Data Model (LienWaiver)
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| vendorName | string | FK to vendors |
| waiverType | WaiverType | conditional_progress, unconditional_progress, conditional_final, unconditional_final |
| amount | number | Dollar amount covered by this waiver |
| drawNumber | number | Which draw this waiver covers |
| throughDate | string | ISO date - waiver covers through this date |
| dateRequested | string | ISO date waiver was requested |
| dateReceived | string | ISO date waiver was received |
| status | WaiverStatus | Pipeline state |
| jobName | string | FK to jobs |
| aiNote | string | AI-generated insight |
| invoiceNumber | string | FK to associated invoice |
| paymentId | string | FK to payment record |
| signatureType | SignatureType | electronic, wet, notarized, pending |
| tier | WaiverTier | prime (direct vendor) or sub_tier (sub's sub) |
| parentVendor | string | For sub-tier: which prime vendor this flows through |
| stateCode | string | State jurisdiction (e.g., FL, CA) |
| isStatutoryForm | boolean | Whether state-mandated form is required |
| remindersSent | number | Count of automated reminders sent |
| nextReminderDate | string | ISO date of next scheduled reminder |
| submissionMethod | SubmissionMethod | portal, email, manual, pending |
| complianceRisk | string | low, medium, high |
| paymentHold | boolean | Whether payment is held pending this waiver |
| aiConfidence | number | 0-1 AI validation confidence |
| preliminaryNoticeStatus | string | sent, confirmed, expired, not_required |
| lienDeadlineDays | number | Days until lien filing deadline |

#### Status Machine (WaiverStatus)
```
draft -> requested -> submitted -> approved
                   -> missing (overdue, no response)
submitted -> rejected (invalid form or data)
approved -> void (reversal)
```
Statuses: `draft`, `requested`, `submitted`, `approved`, `rejected`, `void`, `missing`

#### Waiver Types (Critical Legal Distinctions)
| Type | When Used | Legal Effect |
|------|-----------|-------------|
| **Conditional Progress** | Before/at time of progress payment | Waives lien rights for the amount stated, ONLY if payment is actually received |
| **Unconditional Progress** | After progress payment is received | Irrevocably waives lien rights for the amount stated, regardless of payment |
| **Conditional Final** | Before/at time of final payment | Same as conditional progress, but covers ALL remaining amounts |
| **Unconditional Final** | After final payment is received | Irrevocably waives ALL lien rights on the project. Required for project closeout |

---

#### Elements

---

**Header: "Lien Waivers" with total count, amount, risk badge, sub-tier badge**
- **What it does:** Displays page title, total waiver count, total dollar coverage, high-risk count, and sub-tier vendor count
- **UI effect:** Title with metadata. Red "X high risk" badge when high-risk waivers exist. Warm "X sub-tier" badge when sub-tier waivers exist
- **Backend effect:** SHOULD query lien_waivers with aggregations
- **Status:** 🚧 Mock Data

---

**Header buttons: "Export", "Bulk Request", "Request Waiver"**

**"Export" button (Download icon)**
- **What it does:** SHOULD export waiver tracker to PDF/Excel showing all vendors, statuses, and compliance gaps
- **Backend effect:** SHOULD generate compliance report suitable for lender submission
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"Bulk Request" button (Users icon)**
- **What it does:** SHOULD send waiver requests to all vendors with outstanding waivers for a given draw period
- **UI effect:** Warm-styled border button. Currently no-op. SHOULD open a confirmation dialog showing which vendors will receive requests
- **Backend effect:** SHOULD:
  1. Identify all vendors paid during the draw period who haven't submitted waivers
  2. Generate state-specific statutory waiver forms pre-filled with amounts
  3. Send via each vendor's preferred method (portal, email)
  4. Create waiver records in `requested` status
  5. Set reminder schedule
- **Other pages affected:** Vendor Portal (waiver requests appear in vendor's queue), Notifications
- **Notifications:** SHOULD send email/portal notification to each vendor
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"Request Waiver" button (Plus icon, primary)**
- **What it does:** SHOULD create a single waiver request for a specific vendor
- **UI effect:** Stone primary button. Currently no-op. SHOULD open waiver request form
- **Backend effect:** SHOULD:
  1. INSERT lien_waiver record
  2. Select correct form type based on state code and waiver type
  3. Pre-fill vendor name, amount, through-date from invoice/payment data
  4. Send request via configured method
  5. Set paymentHold = true if enforcement is strict
- **Validation:** Required: vendor, waiver type, amount, draw number, through date. Form must match state requirements
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

---

**Quick Stats Row (4 cards)**

**Card 1: "Approved (N)"**
- **What it does:** Count and dollar amount of approved waivers
- **UI effect:** Green card with CheckCircle icon
- **Status:** 🚧 Mock Data

**Card 2: "Pending (N)"**
- **What it does:** Count and dollar amount of draft, requested, or submitted waivers
- **UI effect:** Stone card with Clock icon
- **Status:** 🚧 Mock Data

**Card 3: "Missing (N)"**
- **What it does:** Count and dollar amount of overdue/missing waivers. This is the critical compliance gap
- **UI effect:** Red card when missing > 0. AlertTriangle icon
- **Backend effect:** Missing waivers SHOULD block draw releases and payments (in strict mode)
- **Other pages affected:** Draw Requests (waiver issues stat), Invoice payments (payment holds), Dashboard alerts
- **Status:** 🚧 Mock Data

**Card 4: "Payment Holds"**
- **What it does:** Count of invoices with payment holds due to missing waivers
- **UI effect:** Amber card when holds > 0. Ban icon
- **Backend effect:** SHOULD cross-reference with invoices where lien_waiver_status = 'required' and waiver not received
- **Other pages affected:** Invoice page (payment blocked indicator), AP aging (hold notation), Cash flow (delayed payments)
- **Status:** 🚧 Mock Data

---

**Enforcement Level Banner**
- **What it does:** Shows the current lien waiver enforcement policy and jurisdiction requirements
- **UI effect:** Horizontal banner between stats and filters. Left side: "Enforcement: Strict - Payments blocked without waiver" (red badge). Right side: "State: FL (Statutory forms required)"
- **Backend effect:** SHOULD be configurable per company/project: strict (block payments), warn (allow with warning), none (no enforcement)
- **Other pages affected:** Invoice payment workflow behavior, AP batch processing
- **Status:** 🚧 Mock Data

---

**FilterBar: Search, Status Tabs, Draw/Job/Type Dropdowns, Sort**

**Search**
- **What it does:** Searches across vendorName, jobName, invoiceNumber
- **Status:** 🚧 Mock Data

**Status tabs: All | Draft | Requested | Submitted | Approved | Missing**
- **Status:** 🚧 Mock Data

**Draw dropdown: All Draws | Draw #1 | Draw #2 | ...**
- **What it does:** Filters waivers by draw period
- **Status:** 🚧 Mock Data

**Job dropdown: All Jobs**
- **Status:** 🚧 Mock Data

**Type dropdown: All Types | Conditional Progress | Unconditional Progress | Conditional Final | Unconditional Final**
- **Status:** 🚧 Mock Data

**Sort: Vendor | Amount | Date Requested | Draw # | Risk Level | Status**
- **Status:** 🚧 Mock Data

---

**Waiver Row Card (rendered for each waiver)**

**Visual urgency indicators (left border)**
- **What it does:** Red left border for high compliance risk. Amber left border for payment holds (non-high-risk)
- **UI effect:** 4px colored left border on card
- **Status:** 🚧 Mock Data

**Vendor name with sub-tier indicator**
- **What it does:** Shows vendor name. For sub-tier vendors, shows "Sub-tier of [Parent Vendor]" badge
- **UI effect:** Bold vendor name. Warm badge with Layers icon for sub-tier
- **Backend effect:** Sub-tier waivers SHOULD be auto-requested when prime vendor waiver is processed
- **Status:** 🚧 Mock Data

**Status badge**
- **What it does:** Shows waiver status with icon
- **UI effect:** Colored badge: draft (warm), requested (stone), submitted (stone), approved (green), rejected (red), void (warm muted), missing (red with AlertTriangle)
- **Status:** 🚧 Mock Data

**Waiver type badge**
- **What it does:** Shows waiver type: Cond. Progress, Uncond. Progress, Cond. Final, Uncond. Final
- **UI effect:** Color-coded badges per type
- **Status:** 🚧 Mock Data

**Compliance Risk badge**
- **What it does:** Shows risk assessment: Low Risk (green), Med Risk (amber), High Risk (red)
- **UI effect:** Colored badge with Shield icon
- **Backend effect:** Risk SHOULD be calculated from: days overdue, lien deadline proximity, amount, vendor history
- **Status:** 🚧 Mock Data

**Payment Hold badge**
- **What it does:** Shows when payment is being held pending this waiver
- **UI effect:** Red badge with Ban icon: "Payment Hold"
- **Backend effect:** SHOULD block invoice payment for this vendor until waiver is received
- **Other pages affected:** Invoice page (payment blocked), AP aging (hold notation), Cash flow projections
- **Status:** 🚧 Mock Data

**Detail grid: Amount | Draw # | Job Name | State (with statutory indicator)**
- **What it does:** Shows key waiver details in 4-column layout
- **UI effect:** DollarSign, ClipboardList, Building2, MapPin icons with labels. State code with "(Statutory)" indicator when statutory form required
- **Status:** 🚧 Mock Data

**Through date, Invoice number, Signature type, Reminders count, Lien deadline, Preliminary notice status**
- **What it does:** Shows additional waiver metadata
- **UI effect:** Row of small text items and badges:
  - Through date: Calendar icon + date
  - Invoice: stone badge with invoice number
  - Signature: badge showing "E-Signed", "Wet Signature", or "Notarized" (hidden when pending)
  - Reminders: Bell icon + "X reminders sent" (when > 0)
  - Lien deadline: colored badge showing days remaining (red <=30, amber <=60, warm >60)
  - Preliminary notice: colored badge (green=confirmed, stone=sent, red=expired)
- **Status:** 🚧 Mock Data

**AI Note panel (risk-colored)**
- **What it does:** Shows AI-generated compliance insight
- **UI effect:** Red background for high-risk waivers, amber for others. Sparkles icon
- **Content examples:**
  - "Vendor typically responds in 3-5 days. Follow-up in 2 days."
  - "Waiver overdue by 15 days. Blocking Draw #3 release. Contact vendor immediately."
  - "Critical: Final waiver blocking project closeout. Escalate to project manager."
- **Status:** 🚧 Mock Data

**Requested date + age tracking (right side)**
- **What it does:** Shows when the waiver was requested and how many days ago
- **UI effect:** Calendar icon + date. For requested/missing: days-since counter colored by urgency (red > 14 days, amber > 7, warm otherwise). For approved: "Received [date]" in green. For requested/submitted with reminders: "Next reminder: [date]"
- **Status:** 🚧 Mock Data

**Three-dot menu button**
- **What it does:** SHOULD open action menu
- **Expected actions:**
  - View/Download Waiver
  - Approve Waiver (submitted)
  - Reject Waiver (with reason)
  - Void Waiver
  - Re-request (missing/rejected)
  - Release Payment Hold
  - View Vendor History
  - Upload Scanned Copy
- **Status:** 📝 Not Yet Implemented

---

**Context-sensitive action buttons (bottom of waiver card, for draft/requested/missing)**

**"Send Reminder" button (requested or missing status)**
- **What it does:** SHOULD send a reminder to the vendor requesting the waiver
- **UI effect:** Amber-styled border button with Bell icon. Currently no-op
- **Backend effect:** SHOULD:
  1. Send email/portal notification to vendor
  2. INCREMENT remindersSent
  3. UPDATE nextReminderDate based on escalation schedule
  4. If remindersSent > threshold, escalate compliance risk level
- **Notifications:** Email to vendor contact. If > 3 reminders, CC the PM
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"Send Request" button (draft status)**
- **What it does:** SHOULD send the initial waiver request to the vendor
- **UI effect:** Stone-styled border button with Send icon. Currently no-op
- **Backend effect:** SHOULD UPDATE status = 'requested'. Generate state-specific form. Send to vendor. Set reminder schedule
- **Notifications:** Email/portal notification to vendor
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

**"Mark Received" button (draft, requested, or missing status)**
- **What it does:** SHOULD mark the waiver as received, transitioning to `submitted` status for review
- **UI effect:** Warm-styled border button with FileCheck icon. Currently no-op. SHOULD open upload form for the received document
- **Backend effect:** SHOULD UPDATE status = 'submitted', dateReceived = NOW(). Upload document to storage. Run AI compliance validation
- **Other pages affected:**
  - If this was the last missing waiver for a draw: Draw waiver issues count decreases
  - Invoice page: if paymentHold was active, review for release
  - AP: held payment may become eligible for processing
- **Validation:** SHOULD validate: correct form type for state, proper signatures, amounts match, through-date covers the period
- **Who can use it:** owner, admin, pm, office
- **Status:** 📝 Not Yet Implemented

---

**AI Collection Progress Bar (bottom of page)**
- **What it does:** Shows overall waiver collection progress as a percentage with contextual message
- **UI effect:** Amber-themed bar with horizontal progress bar (green fill). Percentage display. Contextual message varies:
  - When missing waivers: AlertTriangle + "X missing waivers blocking draw releases. Y at high compliance risk -- escalate immediately. Lien filing deadlines approaching for Z vendors."
  - When pending but none missing: "All waivers on track. X pending -- expected within 5 business days."
  - When all collected: "All lien waivers collected! Ready for draw processing."
- **Backend effect:** SHOULD calculate `approved_count / total_count * 100`
- **Other pages affected:** Draw Requests (waiver readiness), Dashboard (compliance status)
- **Status:** 🚧 Mock Data

---

**AI Features Panel (5 features)**

**1. Auto-Request**
- **Trigger:** On change (payment scheduled or invoice approved)
- **What it does:** Automatically generates and sends waiver requests when payments are scheduled
- **Backend effect:** SHOULD monitor invoice approvals and payment scheduling, auto-create waiver requests for affected vendors
- **Other pages affected:** Invoice approval workflow, AP batch processing
- **Status:** 🚧 Mock Data

**2. Compliance Check**
- **Trigger:** On submission
- **What it does:** Validates submitted waivers for required fields, proper signatures, correct amounts, matching payment records
- **Backend effect:** SHOULD run AI document analysis on uploaded waiver PDFs: verify signatures, amounts, dates, form type
- **Status:** 🚧 Mock Data

**3. Deadline Tracking**
- **Trigger:** Real-time
- **What it does:** Monitors lien filing deadlines by state and sends proactive alerts before critical dates
- **Backend effect:** SHOULD maintain state-specific deadline database (e.g., FL: 45 days from last work/materials for subs, 90 days for primes)
- **Notifications:** SHOULD send escalating alerts: 30 days, 14 days, 7 days before deadline
- **Status:** 🚧 Mock Data

**4. Chain Verification**
- **Trigger:** On change
- **What it does:** Ensures full lien waiver chain from prime vendor down through all sub-tier vendors
- **Backend effect:** SHOULD track vendor/sub-vendor relationships and verify waiver coverage at each tier
- **Other pages affected:** Vendor page (sub-tier relationships), Draw requests (full chain verification)
- **Status:** 🚧 Mock Data

**5. Form Matching**
- **Trigger:** On submission
- **What it does:** Verifies that the waiver form used matches state statutory requirements
- **Backend effect:** SHOULD maintain library of state-specific statutory forms and validate uploaded documents against requirements
- **Status:** 🚧 Mock Data

---

#### Full System Ripple: Approving a Lien Waiver

When a waiver transitions from `submitted` to `approved`:

| Affected System | What Changes |
|----------------|-------------|
| **Invoice page** | If paymentHold was active for this vendor, payment hold may be released. Invoice lien_waiver_status updates to "received" |
| **Draw Requests** | Waiver issues count decreases. If all waivers now collected, draw can proceed to submission |
| **AP / Payments** | Held payment for this vendor becomes eligible for processing |
| **Cash flow** | Blocked payment amount moves from "held" to "payable" in projections |
| **Vendor page** | Vendor compliance status updates. Response time tracked for performance scoring |
| **Audit log** | INSERT: waiver approval, who reviewed, validation results |
| **Dashboard** | Compliance alert clears for this vendor/draw combination |

#### Full System Ripple: Waiver Goes Missing (Overdue)

When a waiver transitions to `missing` status:

| Affected System | What Changes |
|----------------|-------------|
| **Invoice page** | Payment for this vendor is blocked (strict enforcement). Payment hold badge appears |
| **Draw Requests** | Waiver issues count increases. Draw cannot be submitted to lender with missing waivers |
| **Dashboard** | Alert: "Missing lien waiver from [Vendor] -- blocking Draw #X" |
| **Financial Dashboard** | Compliance risk indicator increases |
| **Notifications** | Escalating alerts to PM, then office manager, then owner based on reminder count |
| **Vendor page** | Vendor compliance score decreases. Noted in vendor performance tracking |

---

## Cross-Module Dependency Map

The five financial/procurement modules documented in this file form a tightly integrated system. Here is how they connect:

```
                    ┌─────────────────┐
                    │  CHANGE ORDERS  │
                    │  (scope changes)│
                    └───────┬─────────┘
                            │ modifies contract & budget
                            v
┌───────────┐     ┌─────────────────┐     ┌──────────────┐
│ PURCHASE  │────>│     BUDGET      │<────│   INVOICES   │
│  ORDERS   │     │  (cost codes)   │     │ (vendor bills)│
│(materials)│     └────────┬────────┘     └──────┬───────┘
└─────┬─────┘              │                     │
      │                    │                     │
      │ 3-way match        │ draws from          │ included in
      │<───────────────────┼─────────────────────┘
      │                    │
      v                    v
┌─────────────┐   ┌──────────────────┐
│ LIEN WAIVERS│──>│  DRAW REQUESTS   │
│ (compliance)│   │(lender payments) │
└─────────────┘   └──────────────────┘
      │                    │
      │ blocks/releases    │ funds from lender
      v                    v
┌─────────────────────────────────────┐
│          PAYMENTS / CASH FLOW       │
│   (AP, bank reconciliation, GL)     │
└─────────────────────────────────────┘
```

**Key dependency chains:**
1. **CO -> Budget -> Draw -> Payment:** A change order modifies the budget, which changes draw amounts, which changes what the lender pays
2. **Invoice -> PO (3-way match) -> Budget:** Invoices match against POs, and both feed budget actuals
3. **Lien Waiver -> Invoice -> Payment:** Missing waivers block invoice payment in strict mode
4. **Lien Waiver -> Draw -> Lender:** Missing waivers block draw submission to lender
5. **CO -> PO:** Approved change orders may auto-generate purchase orders for new materials
6. **Selection -> CO -> PO:** Client selection changes generate allowance overage COs which generate POs

---

## API Endpoints Needed (Not Yet Built)

None of the CRUD endpoints for these modules exist. Here is what needs to be built:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/v1/invoices` | GET, POST | List/create invoices |
| `/api/v1/invoices/[id]` | GET, PUT, DELETE | Get/update/archive invoice |
| `/api/v1/invoices/[id]/approve` | POST | Approve invoice (with approval chain) |
| `/api/v1/invoices/[id]/dispute` | POST | Dispute invoice |
| `/api/v1/invoices/[id]/pay` | POST | Record payment |
| `/api/v1/invoices/upload` | POST | Upload PDF for AI extraction |
| `/api/v1/draws` | GET, POST | List/create draws |
| `/api/v1/draws/[id]` | GET, PUT, DELETE | Get/update/archive draw |
| `/api/v1/draws/[id]/submit` | POST | Submit for review/to lender |
| `/api/v1/draws/[id]/disburse` | POST | Record disbursement |
| `/api/v1/draws/[id]/revise` | POST | Create revision |
| `/api/v1/purchase-orders` | GET, POST | List/create POs |
| `/api/v1/purchase-orders/[id]` | GET, PUT, DELETE | Get/update/archive PO |
| `/api/v1/purchase-orders/[id]/approve` | POST | Approve PO |
| `/api/v1/purchase-orders/[id]/send` | POST | Send to vendor |
| `/api/v1/purchase-orders/[id]/receive` | POST | Record receipt |
| `/api/v1/change-orders` | GET, POST | List/create COs |
| `/api/v1/change-orders/[id]` | GET, PUT, DELETE | Get/update/archive CO |
| `/api/v1/change-orders/[id]/approve` | POST | Internal/client approve |
| `/api/v1/change-orders/[id]/present` | POST | Present to client |
| `/api/v1/change-orders/[id]/negotiate` | POST | Record negotiation step |
| `/api/v1/lien-waivers` | GET, POST | List/create waivers |
| `/api/v1/lien-waivers/[id]` | GET, PUT, DELETE | Get/update/archive waiver |
| `/api/v1/lien-waivers/[id]/approve` | POST | Approve waiver |
| `/api/v1/lien-waivers/[id]/remind` | POST | Send reminder |
| `/api/v1/lien-waivers/bulk-request` | POST | Bulk request waivers for a draw |
## DIRECTORY PAGES

---

### /skeleton/vendors — Vendor Directory
*File: `src/components/skeleton/previews/vendors-preview.tsx`*
*Purpose: The master directory of every subcontractor, supplier, and service provider the company works with. Shows compliance status (insurance, licenses, W-9), performance scores, spending history, and AI-powered risk assessments. This is where you decide who to hire, who to watch, and who to cut.*

#### Elements

**"Vendor Directory" page header**
- **What it does:** Displays the page title and subtitle indicating the directory covers subcontractors, suppliers, and service providers
- **UI effect:** White header bar with "Vendor Directory" in bold and "Subcontractors, Suppliers & Service Providers" in muted text below
- **Backend effect:** None (static display)
- **Status:** Mock Data

**Quick Stats bar (7 metric cards)**
- **What it does:** Shows an at-a-glance summary of the vendor portfolio: total vendors, subcontractors count, suppliers count, preferred count, average composite score, insurance alerts, and total spend
- **UI effect:** Seven compact stat cards in a horizontal row. Each has a colored icon badge (left) and a large number with label (right). Insurance Alerts card turns red background/text when alerts > 0. Total Spend shows abbreviated currency (e.g., "$13.0M")
- **Backend effect:** SHOULD query: SELECT COUNT(*) FROM vendors WHERE company_id = :company_id (total), grouped by type (sub/supplier), grouped by status (preferred), AVG(composite_score) WHERE composite_score > 0, COUNT(*) WHERE insurance_status != 'valid', SUM(total_spend). Currently computed from 9 hardcoded mock vendors
- **Other pages affected:** None (read-only summary)
- **Who can use it:** owner, admin, PM, office
- **Status:** Mock Data (9 vendors, computed stats)

**Search bar** (in FilterBar)
- **What it does:** Filters the vendor list by name, trade, or email address in real-time as the user types
- **UI effect:** Text input with magnifying glass icon and placeholder "Search vendors...". As user types, vendor grid updates instantly to show only matching vendors. Result count updates (e.g., "3 of 9")
- **Backend effect:** Currently client-side filter using `matchesSearch()` against `name`, `trade`, `email` fields. SHOULD become: SELECT * FROM vendors WHERE company_id = :company_id AND (name ILIKE '%:q%' OR trade ILIKE '%:q%' OR email ILIKE '%:q%')
- **Validation:** No minimum character requirement. Empty search shows all
- **Status:** Mock Data (client-side filtering works)

**Trade filter tabs** (All Trades, Framing, Electrical, Plumbing, HVAC, Painting)
- **What it does:** Filters vendor grid by trade specialty. Each tab shows the count of vendors in that trade
- **UI effect:** Horizontal tab bar with trade names and counts in parentheses. Active tab gets highlighted background. Clicking a tab immediately filters the grid. "All Trades" resets to show everything
- **Backend effect:** Client-side filter on `vendor.trade`. SHOULD query with WHERE trade = :selected_trade
- **Reverse action:** Click "All Trades" tab to reset
- **Status:** Mock Data (6 trade tabs, only 6 trades represented in mock data)

**Status dropdown filter**
- **What it does:** Filters vendors by approval status: All, Preferred, Approved, Conditional, Pending
- **UI effect:** Select dropdown labeled "Status:". Selecting a value immediately re-filters the vendor grid. Default is "All"
- **Backend effect:** Client-side filter on `vendor.status`. SHOULD add WHERE status = :selected_status to query
- **Reverse action:** Select "All" to reset
- **Status:** Mock Data

**Min Rating filter buttons** (Any, 3+, 4+, 4.5+)
- **What it does:** Filters vendors by minimum quality rating score
- **UI effect:** Four small buttons in a row. Active button gets amber highlight. Clicking sets the minimum rating threshold. Vendors with 0 scores (new vendors) are excluded if any rating is set
- **Backend effect:** Client-side filter: `vendor.scores.quality >= ratingFilter`. SHOULD add WHERE quality_score >= :min_rating to query
- **Reverse action:** Click "Any" to remove rating filter
- **Status:** Mock Data

**Sort dropdown** (Name, Reliability, Total Spend, Projects, Active Jobs)
- **What it does:** Changes the sort order of the vendor grid
- **UI effect:** Dropdown with sort field options. Adjacent arrow button toggles ascending/descending. Grid re-sorts immediately on change
- **Backend effect:** Client-side sort via `sortItems()`. SHOULD become ORDER BY clause in query
- **Status:** Mock Data

**View mode toggle** (grid/list)
- **What it does:** Toggles between grid card view and list view
- **UI effect:** Two icon buttons (grid icon, list icon). Active view mode gets highlighted. Currently renders a 2-column grid; list mode SHOULD render a table view
- **Backend effect:** None (display preference only). SHOULD persist in user preferences
- **Status:** Mock Data (grid view only, list view not differentiated)

**"Add Vendor" button** (primary action)
- **What it does:** SHOULD open a vendor creation form/modal to add a new subcontractor, supplier, or service provider to the directory
- **UI effect:** Blue/primary button with Plus icon and "Add Vendor" text in the FilterBar actions area. Currently has `onClick: () => {}` (no-op)
- **Backend effect:** SHOULD open modal/drawer with form fields: name, trade, type (sub/supplier/service), phone, email, payment terms, insurance info, license info, W-9 status. On submit: INSERT INTO vendors (company_id, name, trade, type, status, phone, email, payment_terms, insurance_status, insurance_expiry, license_status, w9_on_file, created_by) VALUES (...)
- **Other pages affected:** New vendor appears in directory, becomes available for PO creation, bid invitations, job assignment
- **Notifications:** None initially. SHOULD notify office manager of new vendor needing compliance review
- **Syncs:** SHOULD sync to QuickBooks as new vendor record. SHOULD check insurance certificate database if integrated
- **Reverse action:** Archive vendor (soft delete)
- **Who can use it:** owner, admin, PM, office
- **Validation:** Name required, trade required, valid email format, valid phone format. Duplicate detection: warn if vendor with same name or phone already exists
- **Error states:** Duplicate vendor warning, missing required fields, invalid email/phone format
- **Status:** Not Yet Implemented (button renders, no handler)

**Vendor card** (one per vendor in grid)
- **What it does:** Displays comprehensive vendor information including name, trade, type, status, scores, contact info, cross-module stats, insurance/compliance status, and AI notes
- **UI effect:** White card with hover shadow transition. Card border changes based on status: red border for blacklisted vendors, red border for expired insurance, amber border for expiring insurance. Card is clickable (cursor-pointer) and SHOULD navigate to vendor detail page. Contains:
  - Header: vendor name, type badge (Sub/Supplier/Service), trade name
  - Status + Score row: status badge (Preferred/Approved/Conditional/Blacklisted/Pending with color-coded icons), composite score badge (color-coded: green 90+, blue 80+, amber 70+, red below 70), payment terms
  - Star rating display (1-5 stars with half-star support) and reliability percentage badge
  - Contact info: phone number, email address (both with icons)
  - Cross-module stats row: total spend (dollar icon), active POs (cart icon), active jobs (briefcase icon), open punch items (warning icon, only if > 0), warranty callbacks (file icon, only if > 0)
  - Insurance/compliance footer: insurance status badge (Valid/Expiring/Expired with shield icons and expiry date), W-9 status badge, license status badge
  - AI note (when present): colored panel with sparkle icon showing AI-generated insight about the vendor
- **Backend effect:** SHOULD query vendor details with JOIN to POs, jobs, punch items, warranty claims for cross-module counts. Currently all hardcoded in mockVendors array
- **Other pages affected:** Clicking SHOULD navigate to `/skeleton/vendors/[id]` vendor detail page
- **Who can use it:** All roles can view. Edit/delete restricted to owner, admin, PM, office
- **Status:** Mock Data (9 vendor cards)

**Vendor card "..." menu button** (per card)
- **What it does:** SHOULD open a context menu with vendor actions
- **UI effect:** Three-dot horizontal icon in top-right of each card. Hover shows warm background
- **Backend effect:** Currently no-op. SHOULD show menu with: Edit Vendor, View Detail, Create PO, Invite to Bid, Send Message, Request Insurance Update, Add to Job, Change Status, Archive Vendor
- **Status:** Not Yet Implemented (renders, no handler)

**Vendor Status Badge** (per vendor)
- **What it does:** Displays the vendor's approval status with color-coded icon
- **UI effect:** Small rounded badge with icon and text. Colors: Preferred = green with Award icon, Approved = blue with CheckCircle, Conditional = amber with AlertTriangle, Blacklisted = red with Ban, Pending = gray with Clock
- **Backend effect:** Read from `vendor.status` field. SHOULD be editable via vendor detail or context menu
- **Status:** Mock Data

**Composite Score Badge** (per vendor)
- **What it does:** Shows the vendor's weighted performance score (0-100 scale)
- **UI effect:** Pill badge with Target icon. Color-coded: green for 90+, blue for 80-89, amber for 70-79, red for below 70. Shows "No data" in gray for new vendors with 0 score
- **Backend effect:** SHOULD be calculated: weighted average of quality (25%), timeliness (25%), communication (15%), budget (20%), safety (15%) scores. Currently hardcoded in mock data
- **Status:** Mock Data

**Insurance Status indicator** (per vendor)
- **What it does:** Shows the vendor's insurance compliance status and expiration date
- **UI effect:** Colored badge with shield icon: Valid = green shield-check, Expiring = amber shield-alert, Expired = red shield-x. Expiry date shown in parentheses
- **Backend effect:** SHOULD query: SELECT insurance_status, insurance_expiry FROM vendors WHERE id = :vendor_id. SHOULD have a cron job that updates status to 'expiring' when within 30 days of expiry, 'expired' when past expiry date
- **Notifications:** SHOULD send email to office manager 30 days before expiry, 7 days before, and on expiry date. SHOULD block PO creation for expired vendors
- **Status:** Mock Data

**AI Vendor Intelligence bar** (footer section)
- **What it does:** Shows AI-generated insights about the vendor portfolio
- **UI effect:** Amber-gradient bar at bottom with Sparkles icon and "AI Vendor Intelligence:" label. Shows 4 insights separated by pipe characters: top performer identification, declining quality trends, insurance renewal warnings, capacity planning recommendations
- **Backend effect:** Currently hardcoded text. SHOULD be generated by AI engine analyzing vendor performance data, insurance dates, project pipeline, and historical patterns
- **Status:** Mock Data (static text)

**AI Features Panel** (expandable)
- **What it does:** Lists the planned AI features for the vendor management module
- **UI effect:** Expandable accordion panel listing 5 AI features: Performance Scoring, Price Trend Analysis, Capacity Planning, Risk Assessment, Recommendation Engine. Each shows feature name and one-line description
- **Backend effect:** None (informational display of planned features)
- **Status:** Mock Data

---

### /skeleton/clients — Client Directory
*File: `src/components/skeleton/previews/clients-preview.tsx`*
*Purpose: The master directory of every client (homeowner, developer, property owner) the company works with. Shows project history, lifetime value, communication preferences, portal access status, referral tracking, and AI-powered relationship insights. This is how you manage client relationships and identify your most valuable accounts.*

#### Elements

**"Clients" page header with summary**
- **What it does:** Shows the page title with inline counts of total clients and active projects
- **UI effect:** "Clients" in bold with "7 clients | 7 active projects" muted text to the right
- **Backend effect:** SHOULD query COUNT(*) FROM clients WHERE company_id = :company_id, and SUM of active_projects
- **Status:** Mock Data

**FilterBar** (search + status tabs + tier dropdown + source dropdown + sort + view toggle + actions)
- **What it does:** Comprehensive filtering interface for the client list
- **UI effect:** Full FilterBar component with:
  - Search input: "Search clients, projects, companies..." placeholder, filters by name, email, company, current project name
  - Status tabs: All, Active, Pending, Completed, On Hold, Warranty (with counts)
  - Tier dropdown: All Tiers, Standard, Premium, Luxury
  - Source dropdown: All Sources, Referral, Website, Realtor, Repeat Client, Social Media, Other
  - Sort options: Name, Lifetime Value, Projects, Client Since, Last Contact, Referrals
  - Sort direction toggle (asc/desc)
  - View mode toggle (grid/list)
- **Backend effect:** All client-side filtering currently. SHOULD become parameterized query with WHERE clauses for each filter
- **Status:** Mock Data (all filters work client-side)

**"Import" button**
- **What it does:** SHOULD open import wizard for bulk client data upload
- **UI effect:** Button with Upload icon and "Import" text. Currently onClick no-op
- **Backend effect:** SHOULD accept CSV/Excel upload, parse columns, map to client fields, preview rows, then INSERT INTO clients in batch. SHOULD handle duplicate detection by name/email/phone
- **Other pages affected:** New clients appear in directory
- **Who can use it:** owner, admin, office
- **Status:** Not Yet Implemented

**"Export" button**
- **What it does:** SHOULD export the current filtered client list to CSV or Excel
- **UI effect:** Button with Download icon and "Export" text. Currently onClick no-op
- **Backend effect:** SHOULD generate CSV/Excel with all visible columns. Respect current filters (export what user sees). SHOULD include: name, email, phone, company, status, tier, total projects, lifetime value, referrals, last contact, source
- **Who can use it:** owner, admin, PM, office
- **Status:** Not Yet Implemented

**"Add Client" button** (primary action)
- **What it does:** SHOULD open a client creation form/modal
- **UI effect:** Primary-colored button with Plus icon and "Add Client" text. Currently onClick no-op
- **Backend effect:** SHOULD open modal/drawer with form fields: name, email, phone, mobile, address, company, communication preference, source, referred by, tier, tags, portal enabled. On submit: INSERT INTO clients (company_id, name, email, phone, mobile, address, company, communication_preference, source, referred_by, tier, portal_enabled, created_by) VALUES (...)
- **Other pages affected:** New client appears in directory, becomes available for job creation, proposal addressing, contract creation
- **Notifications:** If portal_enabled = true, SHOULD send portal invitation email to client
- **Syncs:** SHOULD sync to QuickBooks as new customer record
- **Reverse action:** Archive client (soft delete)
- **Who can use it:** owner, admin, PM, office
- **Validation:** Name required, email required and must be valid format, phone required. Duplicate detection on email and phone
- **Error states:** Duplicate client warning, missing required fields, invalid email format
- **Status:** Not Yet Implemented

**Quick Stats bar (6 metric cards)**
- **What it does:** Summary metrics for the client portfolio: total clients, active projects, lifetime value, referrals given, portal active, pending actions
- **UI effect:** Six stat cards in a row. Each shows an icon, label, and large number. Pending Actions card turns red background when > 0 with red text
- **Backend effect:** SHOULD aggregate from clients and jobs tables. Currently computed from 7 mock clients
- **Who can use it:** owner, admin, PM, office
- **Status:** Mock Data

**Client card** (one per client)
- **What it does:** Displays comprehensive client information including name, company, contact info, project history, financial summary, status badges, AI personality profile, and AI insights
- **UI effect:** White card with rounded border, hover shadow transition, clickable cursor. Contains:
  - Avatar circle with User icon, client name (with gold star for VIP tag), company name (if present), current project name
  - Contact info: email, phone, last contact date + client since date
  - 2-column stats: total projects (with active count in green), lifetime value (formatted currency)
  - Badge row: status badge (Active/Pending/Completed/On Hold/Warranty with color-coded icons), tier badge (Standard/Premium/Luxury), portal badge (green "Portal" or gray "No Portal"), referral count (if > 0), pending selections count (red, if > 0), source badge
  - AI Profile row (when data exists): decision speed badge (fast/moderate/deliberate), budget sensitivity badge, style preference badges (shows first 2 + count of remaining)
  - Footer: communication preference icon + label, satisfaction score percentage badge (green 90+, blue 75-89, amber below 75)
  - AI insight panel (when present): stone-colored panel with sparkle icon and AI-generated text
- **Backend effect:** SHOULD query client details with JOIN to jobs, selections, portal_sessions for counts. Currently all hardcoded in mockClients array
- **Other pages affected:** Clicking SHOULD navigate to client detail page
- **Who can use it:** All roles can view basic info. Financial data (lifetime value) restricted to owner, admin, PM, office
- **Status:** Mock Data (7 client cards)

**Client card "..." menu button** (per card)
- **What it does:** SHOULD open a context menu with client actions
- **UI effect:** Three-dot icon button in top-right corner. Hover shows warm background
- **Backend effect:** SHOULD show menu: View Detail, Edit Client, Create Job, Send Proposal, Enable/Disable Portal, Send Message, Log Activity, Request Referral, Archive
- **Status:** Not Yet Implemented

**AI Client Intelligence panel** (expandable)
- **What it does:** Lists 5 AI features for client relationship management with confidence scores
- **UI effect:** Two-column panel listing AI features: Referral Potential (87% confidence), Communication Analysis (92%), Satisfaction Scoring (85%), Repeat Business (78%), Testimonial Candidates (83%). Each shows feature name, trigger type, description, severity color, and confidence percentage
- **Backend effect:** None currently. SHOULD be powered by AI engine analyzing client interaction patterns, portal usage, project outcomes
- **Status:** Mock Data

**AI Insights Bar** (footer)
- **What it does:** Shows AI-generated insights about client relationships
- **UI effect:** Amber bar with sparkle icon. Shows paragraphs of insight text about top clients, follow-up recommendations, portal engagement alerts, warranty predictions, and check-in schedules
- **Backend effect:** Currently hardcoded. SHOULD be AI-generated from client data
- **Status:** Mock Data

---

## SALES PAGES

---

### /skeleton/estimates — Estimating Engine (Single Estimate Detail View)
*File: `src/components/skeleton/previews/estimates-preview.tsx`*
*Purpose: The detailed estimate builder for a specific project. Shows every line item with cost codes, material/labor split, waste factors, selection tiers, and AI-powered pricing confidence. This is where you build the project budget from the ground up, line by line, before converting it into a proposal for the client.*

#### Elements

**Estimate header bar**
- **What it does:** Shows the estimate name, status, version, contract type, project details, and validity period
- **UI effect:** White header with: estimate name in bold ("Smith Residence Estimate"), status badge (color-coded: Draft/Pending Approval/Approved/Sent to Client/Expired/Converted), version badge with GitBranch icon ("v2"), contract type badge ("Guaranteed Max Price"), project details line (3,500 SF | Coastal Elevated | Default: Premium), validity countdown with clock icon ("Valid until Mar 15, 2026 (31d)")
- **Backend effect:** SHOULD query: SELECT * FROM estimates WHERE id = :estimate_id AND company_id = :company_id. Currently uses mockHeader object
- **Who can use it:** owner, admin, PM
- **Status:** Mock Data

**"Compare Versions" button**
- **What it does:** SHOULD open a side-by-side comparison view showing differences between estimate versions
- **UI effect:** Outline button with GitBranch icon and "Compare Versions" text. Currently no-op
- **Backend effect:** SHOULD query: SELECT * FROM estimate_versions WHERE estimate_id = :estimate_id ORDER BY version DESC, then compute diffs between line items, quantities, prices, and totals
- **Other pages affected:** None (modal or new view)
- **Who can use it:** owner, admin, PM
- **Status:** Not Yet Implemented

**"Clone" button**
- **What it does:** SHOULD create a duplicate of the current estimate as a new draft
- **UI effect:** Outline button with Copy icon. Currently no-op
- **Backend effect:** SHOULD INSERT INTO estimates (copy all fields with new ID, status = 'draft', version = 1). Copy all line items. INSERT INTO audit_log
- **Other pages affected:** New estimate appears in estimates list
- **Notifications:** None
- **Who can use it:** owner, admin, PM
- **Status:** Not Yet Implemented

**"Submit for Approval" button**
- **What it does:** SHOULD change estimate status from draft/pending to pending_approval and notify approver
- **UI effect:** Amber-themed button with Send icon and "Submit for Approval" text. Currently no-op
- **Backend effect:** SHOULD UPDATE estimates SET status = 'pending_approval', submitted_at = NOW(), submitted_by = :user_id WHERE id = :id. INSERT INTO audit_log
- **Other pages affected:** Estimate appears in approver's pending queue
- **Notifications:** SHOULD send notification to designated approver (company owner or configured approval chain)
- **Reverse action:** Approver can reject back to draft
- **Who can use it:** PM (creator submits to owner/admin for approval)
- **Validation:** All line items must have cost codes assigned, no $0 prices on non-exclusion items, at least one line item exists
- **Error states:** Missing cost codes, incomplete line items, expired validity date
- **Status:** Not Yet Implemented

**"Convert to Proposal" button** (primary action)
- **What it does:** SHOULD create a new proposal document from the approved estimate, ready to send to the client
- **UI effect:** Dark primary button with FileText icon and "Convert to Proposal" text. Currently no-op
- **Backend effect:** SHOULD INSERT INTO proposals (company_id, estimate_id, client_id, amount, allowances_total, contract_type, status = 'draft', version = 1, ...). Copy relevant estimate data. INSERT INTO audit_log
- **Other pages affected:** New proposal appears in proposals list. Estimate status changes to 'converted'
- **Notifications:** None initially (proposal is created as draft)
- **Reverse action:** Archive the proposal
- **Who can use it:** owner, admin, PM
- **Validation:** Estimate must be in 'approved' status to convert
- **Error states:** Cannot convert non-approved estimate
- **Status:** Not Yet Implemented

**Stats bar (7 metrics)**
- **What it does:** Shows summary statistics for the estimate: line items count, allowances count, exclusions count, alternates count, AI-suggested count, average confidence percentage, lead time flags count
- **UI effect:** Seven stat cards. Allowances card in amber. Exclusions in red. Alternates show count/2 (since alternates come in pairs). AI-Suggested in purple. Avg Confidence in green. Lead Time Flags amber when > 0
- **Backend effect:** Computed from mockLineItems. SHOULD be computed from estimate_line_items table
- **Status:** Mock Data

**FilterBar** (search + category tabs + type dropdown + sort + actions)
- **What it does:** Filters the line item list by search text, category, item type, and sort order
- **UI effect:** Search input "Search line items, cost codes...", category tabs (All, Exterior, Interior with counts), type dropdown (All Types, Lines, Allowances, Exclusions, Alternates), sort options (Name, Category, Quantity, Cost Code, AI Confidence), sort direction toggle
- **Backend effect:** Client-side filtering. SHOULD become server-side with parameterized queries
- **Status:** Mock Data

**"Add Line Item" button**
- **What it does:** SHOULD open a form to add a new line item to the estimate
- **UI effect:** Button with Plus icon. Currently no-op
- **Backend effect:** SHOULD open modal with fields: category, cost code, name, item type (line/allowance/exclusion/alternate), selection (from catalog), quantity, unit, waste factor. On submit: INSERT INTO estimate_line_items (estimate_id, category, cost_code, name, item_type, selection_id, quantity, unit, waste_factor, created_by)
- **Other pages affected:** Estimate totals recalculate, budget tracking updates
- **Who can use it:** owner, admin, PM
- **Status:** Not Yet Implemented

**"Insert Assembly" button**
- **What it does:** SHOULD insert a pre-configured group of line items (an "assembly") in one action
- **UI effect:** Button with Package icon. Currently no-op
- **Backend effect:** SHOULD open assembly browser showing saved assemblies (e.g., "Standard Kitchen Package", "Master Bath Package"). On select: INSERT multiple estimate_line_items from assembly template. Quantities adjusted for project SF
- **Who can use it:** owner, admin, PM
- **Status:** Not Yet Implemented

**"AI Suggest Pricing" button** (primary action)
- **What it does:** SHOULD trigger AI analysis to fill in or validate pricing for line items based on historical data and market rates
- **UI effect:** Primary button with Calculator icon. Currently no-op
- **Backend effect:** SHOULD call AI pricing engine that: (1) looks up historical costs from past estimates for same cost codes, (2) checks current vendor pricing, (3) applies market rate adjustments, (4) fills in suggested prices with confidence scores. Updates line items with aiSuggested = true and aiConfidence values
- **Other pages affected:** None (updates current estimate)
- **Notifications:** None
- **Who can use it:** owner, admin, PM
- **Status:** Not Yet Implemented

**Line item card** (one per line item, expandable accordion)
- **What it does:** Displays a single estimate line item with all pricing details, expandable for editing
- **UI effect:** Bordered card, color varies by type (amber border for allowances, red border/background for exclusions, default for lines/alternates). Collapsed view shows:
  - Chevron toggle (expand/collapse)
  - Item type badge (LINE/ALLOWANCE/EXCLUDED/ALTERNATE with color coding)
  - Item name, sparkle icon if AI-suggested
  - Alternate group label (if applicable, e.g., "flooring-a")
  - Cost code (monospace), selection name
  - AI confidence badge (green 90%+, amber 70-89%, red below 70%)
  - Selection tier badge (Builder/Standard/Premium/Luxury)
  - Quantity x unit price calculation with waste factor note
  - Line total (right-aligned, struck through for exclusions)
- **Backend effect:** SHOULD read from estimate_line_items table. Clicking expand loads full detail
- **Status:** Mock Data (8 line items)

**Line item expanded detail** (visible when card is expanded)
- **What it does:** Shows editable selection dropdown, material/labor cost split, waste factor, lead time, vendor, cost code, and AI notes
- **UI effect:** Expands below the collapsed row with:
  - Selection dropdown (shows current selection + alternatives from catalog)
  - Edit button (pencil icon) next to selection
  - Material cost per unit display
  - Labor cost per unit display
  - Waste percentage display
  - Lead time with Clock icon
  - Vendor name with Package icon
  - Cost code with Layers icon
  - AI note panel (when present): amber background for warnings/concerns, blue for recommendations
- **Backend effect:** Selection dropdown SHOULD query: SELECT * FROM selections_catalog WHERE cost_code = :cost_code AND company_id = :company_id. Edit button SHOULD open inline editing for quantity, waste factor, manual price override
- **Who can use it:** owner, admin, PM
- **Status:** Mock Data (dropdowns render but don't save)

**Selection dropdown** (in expanded line item)
- **What it does:** SHOULD change the selected product for a line item, updating material/labor costs accordingly
- **UI effect:** Select element with current selection plus 3 alternatives. Currently shows hardcoded options that don't update prices
- **Backend effect:** SHOULD UPDATE estimate_line_items SET selection_id = :new_selection_id WHERE id = :line_item_id. Recalculate material_cost, labor_cost from selection catalog. Recalculate line total, subtotal, grand total
- **Other pages affected:** Budget totals recalculate throughout the estimate
- **Syncs:** SHOULD update linked proposal if estimate has been converted
- **Status:** Not Yet Implemented (dropdown renders, does not save)

**Summary section** (6 columns)
- **What it does:** Shows the financial summary: subtotal, overhead amount (with percentage), profit amount (with percentage), contingency amount (with percentage), cost per SF, and grand total
- **UI effect:** Six-column grid at bottom. Subtotal, Overhead (10%), Profit (8%), Contingency (5%), $/SF, Grand Total. Grand total is emphasized in larger bold text with accent color. Excludes exclusions and only includes first alternate of each pair
- **Backend effect:** Computed from line items: subtotal = SUM(material + labor) * quantity * (1 + waste/100). Overhead = subtotal * overhead_pct. Profit = subtotal * profit_pct. Contingency = subtotal * contingency_pct. Grand total = subtotal + overhead + profit + contingency. $/SF = grand_total / project_sf
- **Status:** Mock Data (computed from 8 line items)

**Cross-Module Connection Badges** (footer bar)
- **What it does:** Shows which other modules this estimate connects to
- **UI effect:** Horizontal row of small badges: "Public Estimator" (with Feed label), "Selections Catalog", "Budget Tracking", "Proposals", "Price Intelligence", "Bid Management", "Schedule"
- **Backend effect:** None (informational display). Indicates data flows to/from these modules
- **Status:** Mock Data

**AI Insights Bar**
- **What it does:** Shows real-time AI analysis of the estimate
- **UI effect:** Amber bar with lead time concerns count, allowance upgrade predictions, average pricing confidence, and escalation forecast ("Escalation: +2.1% if delayed 3 months")
- **Backend effect:** Currently hardcoded. SHOULD be computed by AI engine analyzing estimate data against historical projects, market data, and client profile
- **Status:** Mock Data

**AI Features Panel** (8 features, 2 columns)
- **What it does:** Lists detailed AI capabilities for the estimating module with confidence scores and detailed descriptions
- **UI effect:** Two-column expandable panel with 8 features: Historical Pricing (87%), Public Estimator Calibration (94%), Market Rate Check (91%), Estimator Lead Comparison (96%), Scope Completeness (78%), Risk Assessment (82%), Win Probability (73%), Estimate Accuracy Tracking (92%). Each shows feature name, trigger condition, insight summary, detailed explanation, confidence percentage, and severity coloring
- **Backend effect:** None currently. Each describes a planned AI capability
- **Status:** Mock Data

---

### /skeleton/proposals — Proposal Pipeline
*File: `src/components/skeleton/previews/proposals-preview.tsx`*
*Purpose: The pipeline view of all client proposals. Shows proposals in a Kanban board organized by status (Draft, Sent, Viewed, Accepted, Declined, Expired). Tracks client engagement (view count, time spent, last viewed) and shows AI-powered follow-up recommendations. This is how you manage the sales pipeline and know when to follow up.*

#### Elements

**"Proposals" page header with pipeline summary**
- **What it does:** Shows total proposals, pipeline value, and expired count alert
- **UI effect:** "Proposals" in bold, "7 proposals | $1.3M pipeline" in muted text, plus amber "1 expired" badge when expired proposals exist
- **Backend effect:** SHOULD query: SELECT COUNT(*), SUM(amount) FILTER (WHERE status NOT IN ('declined','accepted','expired')) FROM proposals WHERE company_id = :company_id
- **Status:** Mock Data

**FilterBar** (search + status tabs + sort + actions)
- **What it does:** Filters the proposal pipeline by search text, status, and sort order
- **UI effect:** Search "Search proposals, clients, addresses...", status tabs (All, Draft, Sent, Viewed, Accepted, Declined, Expired with counts), sort options (Client, Amount, Date Sent, Views, Time Spent), sort direction toggle
- **Backend effect:** Client-side filtering. SHOULD become server-side query
- **Status:** Mock Data

**"Create New" button** (primary action in FilterBar)
- **What it does:** SHOULD open proposal creation workflow
- **UI effect:** Primary button with Plus icon and "Create New" text. Currently no-op
- **Backend effect:** SHOULD navigate to proposal creation page or open modal. Requires selecting an approved estimate to convert, or building from scratch. INSERT INTO proposals (company_id, client_id, project_name, amount, status = 'draft', version = 1, template_name, contract_type). Copy estimate line items as proposal line items. Set default expiry date (+30 days)
- **Other pages affected:** New proposal appears in pipeline board
- **Who can use it:** owner, admin, PM
- **Validation:** Must link to a client record. Must link to an approved estimate (recommended but not required)
- **Status:** Not Yet Implemented

**Quick Stats bar (6 metrics)**
- **What it does:** Shows proposal performance metrics: sent this month, win rate, average response time, pipeline value, won value, engagement (views + time)
- **UI effect:** Six stat cards. Win Rate is color-coded: green 60%+, amber 40-59%, red below 40%. Pipeline value in accent color. Won Value in green. Engagement shows total views with total minutes below
- **Backend effect:** SHOULD be computed from proposals table with date filters. Currently computed from 7 mock proposals
- **Status:** Mock Data

**Pipeline Kanban board** (6 columns)
- **What it does:** Visual pipeline showing proposals organized by status stage, with column totals
- **UI effect:** Horizontally scrollable board with 6 columns: Draft (gray dot), Sent (blue dot), Viewed (warm dot), Accepted (green dot), Declined (red dot), Expired (sand dot). Each column has a header with stage name, count badge, and total value. Proposal cards stack vertically within each column. Empty columns show dashed border placeholder "No proposals"
- **Backend effect:** SHOULD query all proposals grouped by status. Currently groups mockProposals by status
- **Who can use it:** owner, admin, PM
- **Status:** Mock Data

**Proposal card** (one per proposal in pipeline)
- **What it does:** Displays proposal summary with client info, financial details, engagement tracking, and e-signature status
- **UI effect:** White card with hover shadow. Green border for accepted, sand border for expired. Contains:
  - Project name (bold), client name with User icon, address in muted text
  - Amount in bold with DollarSign icon
  - Contract type badge (NTE/GMP/Cost+/Fixed), version badge
  - Estimate reference with link icon, default tier with palette icon
  - Allowances total line
  - Date sent with calendar icon
  - View count with eye icon, time spent with timer icon, last viewed date (all conditional on > 0)
  - Expiry date with clock icon, color-coded: red/bold if expired, amber if within 7 days, muted otherwise. Shows "(expired)" or days remaining
  - Footer: status badge, e-signature icon (colored by e-sign status), missing photos warning (triangle icon if no photos)
  - Action buttons: Send (draft only), Resend/Copy (expired only), Preview (always), Download PDF (always)
  - AI note panel (when present): sand background for expired, blue for others
- **Backend effect:** SHOULD query proposal details with engagement tracking data. Currently all hardcoded
- **Status:** Mock Data (7 proposals)

**Proposal card "..." menu button**
- **What it does:** SHOULD open context menu with proposal actions
- **UI effect:** Three-dot icon, top-right of card. Currently no-op
- **Backend effect:** SHOULD show: Edit, Preview, Duplicate, Send/Resend, Track Engagement, Download PDF, Convert to Contract, Archive
- **Status:** Not Yet Implemented

**Send button** (on draft proposal cards)
- **What it does:** SHOULD send the proposal to the client via email and/or client portal
- **UI effect:** Small Send icon button, visible only on draft proposals. Currently no-op
- **Backend effect:** SHOULD: UPDATE proposals SET status = 'sent', date_sent = NOW(), expires_at = NOW() + 30 days. Generate PDF. Send email to client with link to view online. If portal enabled, push to client portal. Create tracking pixel/link for view tracking. INSERT INTO audit_log
- **Other pages affected:** Proposal moves to "Sent" column in pipeline. Client portal shows new proposal
- **Notifications:** Email sent to client with proposal link. Internal notification to PM
- **Syncs:** Client Portal sync (proposal visible to client)
- **Reverse action:** Cannot unsend, but can resend updated version
- **Who can use it:** owner, admin, PM
- **Validation:** Proposal must have all required fields filled. Client must have valid email
- **Status:** Not Yet Implemented

**Resend/Copy button** (on expired proposal cards)
- **What it does:** SHOULD create a new version of the expired proposal with updated pricing and fresh expiry
- **UI effect:** Small Copy icon button, visible only on expired proposals. Currently no-op
- **Backend effect:** SHOULD: INSERT INTO proposals (copy all fields, version = version + 1, status = 'draft', expires_at = null). May trigger price re-validation through AI
- **Who can use it:** owner, admin, PM
- **Status:** Not Yet Implemented

**Preview button** (on all proposal cards)
- **What it does:** SHOULD open a read-only preview of the proposal as the client will see it
- **UI effect:** Eye icon button on every card. Currently no-op
- **Backend effect:** SHOULD render proposal using the template with client-facing formatting, including photos, descriptions, tier comparisons, and terms
- **Who can use it:** owner, admin, PM, office
- **Status:** Not Yet Implemented

**Download PDF button** (on all proposal cards)
- **What it does:** SHOULD generate and download a PDF version of the proposal
- **UI effect:** Download icon button on every card. Currently no-op
- **Backend effect:** SHOULD generate PDF from proposal template, including all line items, photos, terms, and e-signature blocks
- **Who can use it:** All roles with proposal access
- **Status:** Not Yet Implemented

**Cross-Module Connection Badges**
- **What it does:** Shows connected modules: Estimates, Selections Catalog, Contracts, Client Portal, Leads/CRM, E-Signature
- **UI effect:** Horizontal badge row with module names and icons
- **Status:** Mock Data

**Quick Actions bar**
- **What it does:** Provides bulk actions and summary counts
- **UI effect:** Bar with "Create New" button, "Bulk Send" button, "Export PDF" button on left. Won/Declined/Expired counts with icons on right
- **Backend effect:** Currently no-op buttons. SHOULD: Create New = same as primary Create New. Bulk Send = send all draft proposals at once. Export PDF = generate PDF package of selected proposals
- **Status:** Not Yet Implemented

**AI Insight bar**
- **What it does:** Shows AI-generated recommendation about the proposal pipeline
- **UI effect:** Amber bar noting that proposals with photos have 40% higher acceptance, identifying high-engagement prospects for follow-up, and recommending actions for expired proposals
- **Status:** Mock Data

**AI Features Panel** (5 features)
- **What it does:** Lists planned AI features: Win Rate Analysis, Competitive Pricing, Content Optimization, Follow-up Timing, Scope Clarity
- **Status:** Mock Data

---

### /skeleton/contracts — Contracts & Agreements
*File: `src/components/skeleton/previews/contracts-preview.tsx`*
*Purpose: Manages all contracts the company is party to -- owner contracts (with homeowners), subcontracts (with subs), vendor agreements, and pre-construction agreements. Tracks signature status, e-signature integration, state compliance, retainage, amendments, closeout progress, and verbal change directives that need formalization.*

#### Elements

**"Contracts & Agreements" header with summary**
- **What it does:** Shows total contracts and total owner contract value
- **UI effect:** "Contracts & Agreements" in bold, "7 contracts | $5.17M owner value" in muted text
- **Backend effect:** SHOULD query: SELECT COUNT(*) FROM contracts WHERE company_id = :company_id; SUM(contract_value) WHERE party_type = 'owner'
- **Status:** Mock Data

**Quick Stats bar (5 metrics)**
- **What it does:** Shows key contract metrics: pending signature count, active contracts, owner value total, sub value total, verbal directives count
- **UI effect:** Five stat cards. Pending Signature in amber, Active in green, Owner Value in accent, Sub Value in warm, Verbal Directives in sand/warning color
- **Backend effect:** SHOULD aggregate from contracts table. Currently computed from 7 mock contracts
- **Status:** Mock Data

**E-Signature & Compliance bar**
- **What it does:** Shows integration status for e-signature provider and state compliance checks
- **UI effect:** Horizontal bar with: DocuSign Connected badge (green), SC Clauses Active badge (blue), and signature status summary (X executed, Y client signed, Z pending with colored dots)
- **Backend effect:** Currently hardcoded badges. SHOULD reflect actual DocuSign integration status and state-specific clause library
- **Status:** Mock Data (static badges)

**Cross-Module Connections bar**
- **What it does:** Shows connected modules: Budget (Module 9), Change Orders (Module 17), Warranty (Module 31), Draws (Module 15), Vendors (Module 10)
- **UI effect:** Horizontal badge row with module references
- **Status:** Mock Data

**FilterBar** (search + status tabs + sort + actions)
- **What it does:** Filters contracts by search, status, and sort
- **UI effect:** Search "Search contracts, clients, templates...", status tabs (All, Draft, Review, Sent, Signed, Active, Complete with counts), sort options (Value, Date, Client, Project, Contract Type, Party Type), sort direction toggle
- **Backend effect:** Client-side filtering. SHOULD become server-side
- **Status:** Mock Data

**"New Contract" button** (primary action)
- **What it does:** SHOULD open contract creation workflow
- **UI effect:** Primary button with Plus icon and "New Contract" text. Currently no-op
- **Backend effect:** SHOULD open wizard/form: select contract type (Fixed Price/Cost Plus/GMP/T&M/Hybrid), select party type (Owner/Subcontractor/Vendor/Pre-Con), select template, fill in values (contract value, retainage %, deposit amount, warranty terms, draw schedule type), select client/vendor, assign to project. On submit: INSERT INTO contracts (company_id, contract_number, client_name, project_name, contract_value, retainage_pct, date, status = 'draft', type, party_type, template_name, state, created_by)
- **Other pages affected:** Contract appears in list. If linked to job, appears in job's contracts tab. Draws/budget modules reference contract value
- **Notifications:** None initially (created as draft)
- **Who can use it:** owner, admin, PM
- **Validation:** Contract value required > 0. Client/vendor required. Template required. State required for compliance clauses
- **Status:** Not Yet Implemented

**Contract card** (one per contract)
- **What it does:** Displays contract details including status, type, value, retainage, template info, lender info, warranty terms, amendments, change directives, closeout progress, and e-signature status
- **UI effect:** White card with hover shadow, clickable. Contains:
  - Project name (bold), contract number (monospace small), client name with User icon
  - Badge row: status badge with icon (Draft/Review/Sent/Signed/Active/Closeout/Amended), contract type badge (Fixed Price/Cost Plus/GMP/T&M/Hybrid), party type badge (Owner/Subcontract/Vendor/Pre-Con), COI badge (if insurance verified)
  - Contract value with dollar icon
  - Date
  - Retainage percentage (if > 0)
  - Template name with clause count
  - Lender name with draw schedule type (if present)
  - Warranty terms (if present, truncated with tooltip)
  - Amendments count and verbal directives count (amber warning)
  - Closeout progress bar (if applicable, shows percentage with green fill)
  - Footer: e-signature status with icon (Awaiting Signature/Client Signed/Fully Executed/Not Sent), state abbreviation badge, days since sent (for sent contracts)
  - AI note panel (amber background when present)
- **Backend effect:** SHOULD query contract details with joins. Currently hardcoded
- **Status:** Mock Data (7 contracts)

**Contract card "..." menu button**
- **What it does:** SHOULD open context menu with contract actions
- **UI effect:** Three-dot icon, top-right. Currently no-op
- **Backend effect:** SHOULD show: View Detail, Edit Draft, Send for Signature, Track Signature, Add Amendment, Log Verbal Directive, Begin Closeout, Download PDF, Archive
- **Status:** Not Yet Implemented

**AI Insights bar**
- **What it does:** Multi-paragraph AI analysis of contract portfolio
- **UI effect:** Amber bar with 4 insight paragraphs covering: pending signature follow-ups, GMP savings calculations, verbal directive formalization deadlines, closeout outstanding items
- **Status:** Mock Data

**AI Features Panel** (5 features, 2 columns)
- **What it does:** Lists planned AI features: Clause Analysis (92% confidence), Scope Comparison (88%), Change Order Forecast (85%), Payment Terms Analysis (94%), Compliance Check (97%). Each has detailed descriptions
- **Status:** Mock Data

---

### /skeleton/leads — Lead Pipeline & CRM
*File: `src/components/skeleton/previews/leads-preview.tsx`*
*Purpose: The sales pipeline for tracking every prospective project from first inquiry through to contract signing. Shows leads in a Kanban board (New, Qualified, Consultation, Proposal, Negotiation, Won, Lost) with AI lead scoring, budget realism analysis, competitive intelligence, lot evaluation checklists, feasibility calculators, and stage gate validation. This is how you manage the sales funnel and convert prospects to paying jobs.*

#### Elements

**"Leads Pipeline" header with summary**
- **What it does:** Shows count of active leads and total pipeline value
- **UI effect:** "Leads Pipeline" in bold, "6 active | $4.3M pipeline" in muted text
- **Backend effect:** SHOULD query: SELECT COUNT(*) FROM leads WHERE company_id = :company_id AND status = 'active'; SUM(estimated_value) WHERE status = 'active'
- **Status:** Mock Data

**FilterBar** (search + stage tabs + view toggle + sort + actions)
- **What it does:** Primary filter bar for the lead pipeline
- **UI effect:** Search "Search leads, contacts, sources...", stage tabs (All, New, Qualified, Consultation, Proposal, Negotiation, Won, Lost with counts), grid/list view toggle, sort options (AI Score, Value, Win %, Days in Stage, Name), sort direction toggle
- **Backend effect:** Client-side filtering. SHOULD become server-side
- **Status:** Mock Data

**"Add Lead" button** (primary action)
- **What it does:** SHOULD open lead creation form
- **UI effect:** Primary button with Plus icon. Currently no-op
- **Backend effect:** SHOULD open form with fields: first name, last name, email, phone, preferred contact method, project type (New Construction/Renovation/Addition/Remodel), precon type (design-build/plan-bid-build), estimated SF, estimated value, source, source detail, lot status, financing status, timeline, assigned to. On submit: INSERT INTO leads (company_id, first_name, last_name, name, contact, email, phone, preferred_contact_method, project_type, precon_type, estimated_sf, estimated_value, stage = 'new', source, lot_status, financing_status, timeline, assigned_to, ai_score = null, status = 'active', created_by). Trigger AI scoring on creation
- **Other pages affected:** New lead appears in pipeline. If from website estimator, links to estimator data
- **Notifications:** Assign notification sent to assigned_to user. If source is referral, log referral credit
- **Syncs:** CRM sync if integrated. Email marketing list addition
- **Reverse action:** Archive lead (soft delete)
- **Who can use it:** owner, admin, PM, office
- **Validation:** Name required, contact info required (at least email or phone), project type required, estimated value required
- **Error states:** Duplicate detection (by name + phone), missing required fields
- **Status:** Not Yet Implemented

**Extended Filter Bar** (project type, lot status, financing, source, AI score range)
- **What it does:** Advanced filtering for the lead pipeline beyond the primary FilterBar
- **UI effect:** Second row of filters below the main FilterBar with: PriorityFilter component for project type, StatusFilter for lot status (Lot Owned/Under Contract/Lot Shopping/Unknown), financing dropdown (Pre-Approved/Cash/Needs Approval/Unknown), source dropdown (Referral/Website/Houzz/Parade of Homes/Angi), AI score range with two number inputs (min-max)
- **Backend effect:** Client-side filtering with multiple criteria. SHOULD become WHERE clauses in query
- **Status:** Mock Data (all filters work client-side)

**Stats bar (5 metrics)**
- **What it does:** Pipeline Value (total), Weighted Value (probability-adjusted), Hot Leads (AI score 85+), Stale leads (7+ days in stage), Win Rate
- **UI effect:** Five stat cards with color coding. Pipeline Value in accent. Weighted Value in green. Hot Leads in amber. Stale in red. Win Rate in warm
- **Backend effect:** SHOULD aggregate from leads table. Weighted value = SUM(estimated_value * win_probability / 100). Currently computed from 8 mock leads
- **Status:** Mock Data

**Cross-Module Connections bar**
- **What it does:** Shows connected modules: Estimating, Contracts, Jobs, Nurturing, Scheduling
- **UI effect:** Horizontal badge row
- **Status:** Mock Data

**Kanban board** (7 columns)
- **What it does:** Visual pipeline showing leads organized by stage with column headers, counts, and value totals
- **UI effect:** Horizontally scrollable board with columns: New, Qualified, Consultation, Proposal, Negotiation, Won, Lost. Each column header shows colored dot, stage name, count badge, and column value total. Empty columns show dashed placeholder. When a stage tab is active in the FilterBar, only that stage's column renders
- **Backend effect:** SHOULD query all leads grouped by stage. Currently groups mockLeads by stage
- **Status:** Mock Data

**Lead card** (one per lead in pipeline)
- **What it does:** Comprehensive lead card showing contact info, project details, qualification status, competitive intelligence, stage gate progress, and AI insights
- **UI effect:** White card with hover shadow. Contains:
  - Lead name (bold), project type, "..." menu button
  - Duplicate detection warning (sand background if potential duplicate found, with Merge/Keep Separate buttons)
  - Contact fields: first + last name, email (clickable mailto link), phone (clickable tel link), preferred contact method
  - Estimator data panel (if from website estimator): estimate range, sqft/beds/baths/style, expandable cost breakdown, "View Full Estimate" and "Start Proposal" buttons
  - Financial info: estimated value, SF, lot status (color-coded: green Owned, blue Under Contract, amber Shopping), precon type, financing status, source + source detail
  - Competitor info (if exists): competitor name, competitive position badge (green strong/amber neutral/red weak)
  - Stage activity: days in stage, last activity type + date
  - Design milestone badge, scope iteration badge
  - Footer: assigned to avatar + name, AI score badge (amber), Budget Realism score badge (green/amber/red), Win probability percentage badge (green/amber/red)
  - Lost reason panel (red, only for lost leads)
  - Alert panel (amber, for active leads with warnings)
  - Lot Evaluation Checklist (if lot owned/under contract)
  - Quick Feasibility Calculator (expandable)
  - AI Insights toggle (expandable, active leads only)
  - Advance Stage button (expandable, with stage gate validation)
  - Convert to Job button (won leads only)
- **Backend effect:** SHOULD query lead details with joins to estimator data, activities, documents. Currently all in mockLeads
- **Status:** Mock Data (8 leads)

**Lead card "..." menu button**
- **What it does:** SHOULD open context menu with lead actions
- **UI effect:** Three-dot icon. Currently no-op
- **Backend effect:** SHOULD show: View Detail, Edit, Log Activity, Schedule Follow-up, Assign To, Create Proposal, Send Email, Mark as Won, Mark as Lost, Archive
- **Status:** Not Yet Implemented

**Duplicate Detection Warning** (conditional per card)
- **What it does:** Alerts when AI detects a potential duplicate lead record
- **UI effect:** Sand-colored panel with Copy icon showing the potential duplicate's name and phone. Two buttons: "Merge" (consolidates records) and "Keep Separate" (dismisses warning)
- **Backend effect:** "Merge" SHOULD: combine lead records, preserve the more complete data, archive the duplicate, UPDATE referencing records. "Keep Separate" SHOULD: INSERT INTO duplicate_dismissals to suppress future warnings for this pair
- **Who can use it:** owner, admin, PM, office
- **Status:** Mock Data (one lead has duplicate warning, buttons are no-op)

**Estimator Data Display** (conditional, for website estimator leads)
- **What it does:** Shows the data submitted through the website's public estimator tool, including estimate range, home specifications, and cost breakdown
- **UI effect:** Warm-background panel with Calculator icon, "Website Estimate" label, finish level badge (Builder/Standard/Premium/Luxury), estimate range in bold, 4-column quick stats (SF, Beds, Baths, Style), expandable cost breakdown by category, two action buttons: "View Full Estimate" and "Start Proposal"
- **Backend effect:** Reads from `lead.estimatorData` object. "View Full Estimate" SHOULD navigate to the full estimate detail. "Start Proposal" SHOULD create a proposal pre-populated with estimator data
- **Status:** Mock Data (one lead has estimator data, buttons are no-op)

**Lot Evaluation Checklist** (conditional per card)
- **What it does:** Tracks pre-construction lot due diligence items for leads where the lot is owned or under contract
- **UI effect:** Stone-background panel with 5 checklist items in a 2-column grid: Survey received, Soil test, Flood zone verified, Utilities confirmed, Setbacks checked. Each shows check circle (green) or empty circle. Completion percentage badge at top
- **Backend effect:** SHOULD update individual checklist items: UPDATE leads SET survey_received = true WHERE id = :id. Currently read-only display of mock data
- **Who can use it:** owner, admin, PM
- **Status:** Mock Data (checkboxes not interactive)

**Quick Feasibility Calculator** (expandable per card)
- **What it does:** Calculates cost-per-SF and compares it to typical ranges for the project type to assess budget feasibility
- **UI effect:** Expandable panel triggered by "Quick Feasibility" button. Shows: budget, square footage, calculated cost per SF, typical range for project type (New Construction: $175-$275/SF, Renovation: $125-$200/SF, Addition: $200-$300/SF, Remodel: $150-$250/SF), and color-coded feasibility assessment (green = feasible, amber = tight, red = premium/over)
- **Backend effect:** Pure calculation from lead data (estimated_value / estimated_sf). Typical ranges are currently hardcoded. SHOULD be dynamic based on company's historical data: SELECT AVG(contract_value/square_footage) FROM jobs WHERE company_id = :company_id AND project_type = :type
- **Status:** Mock Data (calculator works, ranges are hardcoded)

**Stage Gate Validation** (expandable per card, active leads only)
- **What it does:** Shows the requirements checklist that must be completed before advancing the lead to the next pipeline stage
- **UI effect:** Expandable panel triggered by "Advance Stage" button. Shows: target stage name, completion count (e.g., "4/6 Complete"), checklist items with green check or red X for each requirement. Requirements vary by target stage:
  - Qualified: budget confirmed, timeline discussed
  - Consultation: + decision maker identified
  - Proposal: + requirements documented, site visit completed
  - Negotiation: + proposal reviewed with client
  - Won: all of the above
  - If not all complete: red warning box "Complete all requirements before advancing"
  - StatusTransition button (disabled when requirements not met)
- **Backend effect:** "StatusTransition" button SHOULD: UPDATE leads SET stage = :next_stage, stage_changed_at = NOW() WHERE id = :id AND all gate requirements are met. INSERT INTO audit_log. Currently the button exists but onClick is no-op
- **Validation:** All stage gate requirements must be checked before transition is allowed
- **Who can use it:** owner, admin, PM
- **Status:** Mock Data (requirements display, transition button is no-op)

**Convert to Job button** (won leads only)
- **What it does:** Converts a won lead into an active job record, transferring all lead data
- **UI effect:** Full-width green button with Building2 icon, "Convert to Job" text, and right arrow. Clicking toggles an expanded panel showing what will be created: job record (name), initial budget (value), project type, square footage, client contact linked, all lead documents transferred. Two buttons: "Confirm Conversion" (green) and "Cancel"
- **Backend effect:** "Confirm Conversion" SHOULD: INSERT INTO jobs (company_id, name, client_id, contract_value, project_type, square_footage, status = 'pre_construction', created_from_lead_id). Link client record. Transfer documents. Transfer lot evaluation data. UPDATE leads SET status = 'converted', converted_job_id = :new_job_id. INSERT INTO audit_log
- **Other pages affected:** New job appears in jobs list. Job dashboard created. Budget module initialized. Schedule module initialized
- **Notifications:** Notify assigned PM. Notify client (if portal enabled) that project is active
- **Syncs:** QuickBooks: create new project. Client Portal: enable project view
- **Reverse action:** Archive the job (extremely rare, would revert lead status)
- **Who can use it:** owner, admin, PM
- **Validation:** Lead must be in 'won' stage. All stage gate requirements met
- **Status:** Mock Data (button renders, conversion is no-op)

**Lead Source Performance bar** (footer)
- **What it does:** Shows ROI comparison of lead sources with leads count, wins, and total value per source
- **UI effect:** Horizontal row of colored badges per source (Referral, Website, Houzz, Parade, Angi) showing leads/wins/value. Color-coded from green (best) to red (worst)
- **Backend effect:** SHOULD aggregate: SELECT source, COUNT(*) as leads, COUNT(*) FILTER (WHERE status = 'won') as wins, SUM(estimated_value) FROM leads GROUP BY source. Currently hardcoded
- **Status:** Mock Data

**AI Insights bar**
- **What it does:** Multi-paragraph AI analysis with specific lead recommendations
- **UI effect:** Warm-background bar with follow-up urgency warnings, budget realism concerns, and competitive positioning advice for specific leads
- **Status:** Mock Data

---

## REMAINING PAGES

---

### /skeleton/jobs/[id]/selections — Client Selections
*File: `src/components/skeleton/previews/selections-preview.tsx`*
*Purpose: Tracks every product selection that the client needs to make for their project -- flooring, fixtures, appliances, countertops, lighting, cabinetry -- organized by room and category. Shows selection status workflow (Not Started through Installed), budget variance (allowance vs actual), deadlines tied to the construction schedule, and AI alerts for urgent decisions that could cause delays.*

#### Elements

**"Client Selections" header with project reference**
- **What it does:** Shows the selections page title, project name badge, change request count, overall progress stats
- **UI effect:** "Client Selections" in bold, "Smith Residence" badge, "1 change requests" sand badge (if any), sub-line "9 of 13 selections made | 4 pending (2 urgent)"
- **Backend effect:** SHOULD query: SELECT COUNT(*) FROM selections WHERE job_id = :job_id, grouped by status buckets
- **Status:** Mock Data

**Progress bar**
- **What it does:** Visual indicator of overall selection completion
- **UI effect:** Full-width gradient bar (stone to green) showing percentage complete. Below: percentage label on left, remaining count on right
- **Backend effect:** Computed: selections in completed statuses / total selections * 100
- **Status:** Mock Data

**FilterBar** (search + status tabs + room dropdown + category dropdown + sort + view toggle + actions)
- **What it does:** Comprehensive filtering for selections
- **UI effect:** Search "Search selections...", status tabs (All, Not Started, Options, Reviewing, Selected, Confirmed, Ordered, Received, Installed, Changes with counts), room dropdown (All Rooms, Kitchen, Master Bath, etc.), category dropdown (All, Flooring, Fixtures, etc.), sort options (Item Name, Room, Price, Allowance, Deadline, Status), view mode toggle (grid/list)
- **Backend effect:** Client-side filtering. SHOULD become server-side
- **Status:** Mock Data

**"Add Selection" button** (primary action)
- **What it does:** SHOULD open form to create a new selection item for the project
- **UI effect:** Primary button with Plus icon. Currently no-op
- **Backend effect:** SHOULD open modal with: category, room, item name, allowance amount, pricing model (allowance/fixed/cost-plus), markup percentage, deadline date, schedule dependency, designer recommendation flag. On submit: INSERT INTO selections (job_id, company_id, category, room, item_name, allowance, pricing_model, markup_pct, deadline, schedule_dependency, status = 'not_started')
- **Other pages affected:** Selection appears in list and client portal. Budget adjusts allowance total
- **Notifications:** If client portal enabled, notify client of new selection to make
- **Who can use it:** owner, admin, PM, office
- **Status:** Not Yet Implemented

**"Send Reminder" button**
- **What it does:** SHOULD send email/portal notification to client about pending selections
- **UI effect:** Button with Send icon. Currently no-op
- **Backend effect:** SHOULD generate reminder with list of pending selections, deadlines, and urgency flags. Send via email and push to client portal. INSERT INTO notifications (client_id, type = 'selection_reminder')
- **Notifications:** Email to client, portal notification
- **Who can use it:** owner, admin, PM, office
- **Status:** Not Yet Implemented

**Stats cards (6 metrics)**
- **What it does:** Summary metrics: selections made (of total), pending (with urgent count), total allowance, variance from budget, designer picks count, total comments
- **UI effect:** Six cards. Pending card turns amber when urgent > 0. Variance card is red when over budget, green when under. Designer Picks in gold
- **Backend effect:** SHOULD aggregate from selections table for the job. Currently computed from 13 mock selections
- **Status:** Mock Data

**Selection card** (grid view, one per selection)
- **What it does:** Displays a single selection item with full status, pricing, deadline, and metadata
- **UI effect:** White card with conditional border: amber for urgent items (pending + deadline <= 3 days), sand for change requests. Contains:
  - Header: category label (uppercase), room name, urgency icon (if urgent), designer recommended icon (palette)
  - Item name (bold)
  - Selected product name (or "No selection made" in italic)
  - Vendor name, PO number link (if exists)
  - Pricing: actual price (red if over allowance) / allowance amount and pricing model. Variance badge (red +X or green -X)
  - Meta indicators: options count (eye icon), comment count (message icon), inspiration images count (image icon), e-signature status (if signed), lead time days (truck icon)
  - Footer: status badge with icon, deadline with calendar icon (amber if urgent)
  - Schedule dependency line (if exists)
  - AI note panel (sand for change requests, amber for urgent, blue otherwise)
- **Backend effect:** SHOULD query selection details with joins to POs, comments, inspiration images
- **Status:** Mock Data (13 selections)

**Selection table row** (list view, one per selection)
- **What it does:** Same data as card but in table row format
- **UI effect:** Table columns: Category (with urgency/designer icons), Room, Item (with vendor), Selected Product, Price (with allowance), Variance, Status badge, Deadline. Rows highlight amber for urgent items, sand for change requests
- **Backend effect:** Same query as card view
- **Status:** Mock Data

**Selection card "..." menu button**
- **What it does:** SHOULD open context menu with selection actions
- **UI effect:** Three-dot icon. Currently no-op
- **Backend effect:** SHOULD show: Present Options, Edit, Change Status, Send to Client Portal, Create PO, Add Comment, Upload Inspiration, Request Change, Archive
- **Status:** Not Yet Implemented

**Cross-Module Connection Badges**
- **What it does:** Shows: Selections Catalog, Budget, Purchase Orders, Schedule, Change Orders, Client Portal
- **Status:** Mock Data

**AI Alert bar**
- **What it does:** Urgent AI alerts about selection deadlines and schedule impacts
- **UI effect:** Amber bar with urgent selection count, critical item (Range/Oven), and change request cost impact
- **Status:** Mock Data

**AI Features Panel** (5 features, 2 columns)
- **What it does:** Detailed AI features: Budget Impact (92% confidence), Lead Time Alerts (95%), Deadline Tracking (100% with "Send Reminders" action button), Popular Choices (87%), Design Compatibility (89% with "View Suggestions" action button)
- **Status:** Mock Data

---

### /skeleton/jobs/[id]/punch-list — Punch List & Quality
*File: `src/components/skeleton/previews/punch-list-preview.tsx`*
*Purpose: Tracks every deficiency, incomplete item, and quality issue found during walkthroughs and inspections. Organized by room, floor, and trade with photo documentation at every stage (issue, repair, verification, rejection). Tracks vendor First-Time Quality (FTQ) scores, cost responsibility (vendor backcharge, builder warranty, shared), and provides a walkthrough mode optimized for field use on a tablet.*

#### Elements

**"Punch List - Smith Residence" header**
- **What it does:** Shows project name, completion percentage badge, rejected items alert
- **UI effect:** "Punch List - Smith Residence" in bold, completion percentage badge (color-coded: green 90%+, amber 50-89%, red below 50%), rejected count badge in red (if any). Sub-line: "11 total | 3 open | 1 in progress | 3 verified/closed"
- **Backend effect:** SHOULD query: SELECT COUNT(*) FROM punch_items WHERE job_id = :job_id, grouped by status. Completion = verified+closed / total * 100
- **Status:** Mock Data

**"Walkthrough Mode" toggle button**
- **What it does:** Switches between normal detail view and a simplified walkthrough-optimized view for field use
- **UI effect:** Button with Footprints icon. When active, gets stone background and colored text. In walkthrough mode: cards are simplified (larger text, larger touch targets, focus on description/room/status/photos), stats bar is hidden, a full-width "Add New Item" button appears at the bottom
- **Backend effect:** UI-only toggle currently. SHOULD persist as user preference and potentially trigger photo-capture-ready mode on mobile
- **Who can use it:** All roles
- **Status:** Mock Data (toggle works, UI changes)

**Quick Stats bar (7 metrics)** (hidden in walkthrough mode)
- **What it does:** Summary metrics: total items, complete percentage (with count), open count, critical count, rejected count, estimated cost (with backcharge count), rooms count (with trades count)
- **UI effect:** Seven stat cards. Open/Critical/Rejected all in red. Cost in amber. Rooms in blue
- **Backend effect:** SHOULD aggregate from punch_items table. Currently computed from 11 mock items
- **Status:** Mock Data

**FilterBar** (search + status tabs + room/trade/vendor dropdowns + sort + actions)
- **What it does:** Multi-dimensional filtering for punch items
- **UI effect:** Search "Search items...", status tabs (All, Open, Assigned, In Progress, Complete, Rejected, Verified with counts), room dropdown, trade dropdown, vendor dropdown, sort options (Item #, Description, Room, Priority, Trade, Vendor, Due Date), sort direction toggle
- **Backend effect:** Client-side filtering. SHOULD become server-side
- **Status:** Mock Data

**Priority Filter** (additional filter row)
- **What it does:** Multi-select filter for priority levels
- **UI effect:** PriorityFilter component showing priority buttons (Critical, High, Medium, Low, Cosmetic) with counts. Multiple can be active simultaneously
- **Backend effect:** Client-side filter on priority field
- **Status:** Mock Data

**Group By toggle** (additional filter row)
- **What it does:** Changes how punch items are grouped: None, Room, Floor, Trade
- **UI effect:** GroupByToggle component with four options. Default is "Room". Changing regroups the items with collapsible sections showing group name, item count, critical count, and completion progress bar
- **Backend effect:** Client-side grouping. SHOULD be a display preference
- **Status:** Mock Data (grouping works)

**"Add Item" button** (primary action)
- **What it does:** SHOULD open punch item creation form
- **UI effect:** Primary button with Plus icon. In walkthrough mode, appears as full-width dark button at bottom with "Add New Item" text. Currently no-op
- **Backend effect:** SHOULD open form/modal: description, room, floor level, trade, assigned vendor, priority (critical/high/medium/low/cosmetic), cost responsibility (vendor backcharge/builder warranty/shared/none), estimated cost, due date, photo upload (with annotation capability), plan pin location, source (walkthrough/checklist/client portal/daily log), checklist reference, notes. On submit: INSERT INTO punch_items (job_id, company_id, item_number = auto-generated, description, room, floor_level, trade, assigned_vendor_id, priority, status = 'open', cost_responsibility, estimated_cost, due_date, source, created_by). If photo uploaded, store in documents with punch_item_id reference
- **Other pages affected:** Vendor's punch item count updates. Job's punch list count updates. If warranty conversion flagged, creates warranty claim draft
- **Notifications:** Notify assigned vendor of new punch item. Notify superintendent. If critical priority, notify PM
- **Who can use it:** All roles (field crews can report, PM/super can create)
- **Validation:** Description required, room required, trade required, vendor required, priority required
- **Status:** Not Yet Implemented

**"Export" button**
- **What it does:** SHOULD export punch list to PDF with photos
- **UI effect:** Button with Download icon. Currently no-op
- **Backend effect:** SHOULD generate PDF with all punch items organized by group (room/trade/floor), including photos, status, and completion counts. Useful for owner walkthroughs and closeout documentation
- **Who can use it:** All roles
- **Status:** Not Yet Implemented

**"Walkthrough" button** (shortcut to walkthrough checklist)
- **What it does:** SHOULD open or link to a structured walkthrough checklist
- **UI effect:** Button with ClipboardCheck icon. Currently no-op
- **Backend effect:** SHOULD open a room-by-room walkthrough template where each room has a predefined checklist of items to inspect. Items found deficient auto-create punch items
- **Status:** Not Yet Implemented

**Group header** (one per group when Group By is active)
- **What it does:** Collapsible section header for each group of punch items
- **UI effect:** Warm background bar with: expand/collapse chevron, group icon (MapPin for room, Layers for floor, ClipboardCheck for trade), group name, item count badge, critical count badge (red, if any), completion count (e.g., "2/4 complete"), progress bar
- **Backend effect:** None (client-side grouping)
- **Status:** Mock Data (expand/collapse works)

**Punch item card** (one per item)
- **What it does:** Displays comprehensive punch item information including description, location, vendor with FTQ score, photos, status, priority, cost responsibility, and rejection history
- **UI effect:** White card with conditional styling: red border if overdue, red left border for rejected items. Contains:
  - Item number (monospace), plan pin icon (if has pin), photo stage indicators (colored dots: red=issue, blue=repair, green=verify, amber=reject with count), warranty badge (if warranty conversion)
  - Description (2-line clamp), location (room | floor), trade badge, source badge (tiny: Walkthrough/Checklist/Client Portal/Daily Log)
  - Vendor assignment: avatar circle, vendor name, FTQ Score badge (color-coded: green Excellent, blue Good, amber Fair, red Poor with trend arrow up/down), due date with overdue warning
  - Assigned person: avatar, "Assigned to:" label, name
  - Rejection notice (red background, if rejected): rejection count, last rejection reason
  - Checklist reference (if from a checklist)
  - Expandable notes section
  - Footer: priority badge (Critical/High/Medium/Low/Cosmetic), status badge with icon (Open/Assigned/In Progress/Complete/Rejected/Verified/Closed), estimated cost (if > 0), cost responsibility label
- **Backend effect:** SHOULD query punch item details with vendor FTQ data, photos, rejection history. Currently all in mockPunchItems + vendorFTQData
- **Status:** Mock Data (11 items)

**Punch item card "..." menu button**
- **What it does:** SHOULD open context menu
- **UI effect:** Three-dot icon. Currently no-op
- **Backend effect:** SHOULD show: Edit, Add Photo, Annotate Photo, Change Status, Reassign Vendor, Change Priority, Add Note, Complete, Verify, Reject, Convert to Warranty Claim, Archive
- **Status:** Not Yet Implemented

**Vendor FTQ Score badge** (per punch item card)
- **What it does:** Shows the assigned vendor's First-Time Quality score with trend indicator
- **UI effect:** Small bordered badge showing "FTQ XX%" with Target icon and trend arrow (up green, down red). Background colored by threshold: Excellent (green, 95+), Good (blue, 85-94), Fair (amber, 70-84), Poor (red, below 70). Tooltip shows total inspections count
- **Backend effect:** SHOULD query: SELECT ftq_score, ftq_trend FROM vendor_quality_scores WHERE vendor_id = :vendor_id. Currently hardcoded in vendorFTQData lookup table
- **Other pages affected:** FTQ data feeds back to vendor directory composite score
- **Status:** Mock Data

**Photo stage indicators** (per punch item card)
- **What it does:** Shows which documentation photos exist for the punch item across its lifecycle
- **UI effect:** Camera icon followed by colored dots: red for issue photo, blue for repair photo, green for verification photo, amber for rejection photo. Photo count number. If no photos, shows amber warning "No photo"
- **Backend effect:** SHOULD query photos from document storage linked to punch item. Currently from mockPunchItems photos array
- **Status:** Mock Data

**AI Features Panel** (6 features, 2 columns)
- **What it does:** Detailed AI insights: FTQ Score Analysis (94% critical), Completion Rate Prediction (85%), First-Time Quality Trends (91% success), Vendor FTQ Prediction (82% warning), Back-Charge Calculation (92%), Warranty Risk Assessment (75% warning)
- **Status:** Mock Data

---

## SYSTEM-WIDE SECTIONS

---

## Two-Way Syncs

This section documents every planned synchronization between RossOS and external systems. None of these syncs are currently implemented -- they are architectural plans.

### QuickBooks Sync (Module 16)

**Vendor creation** (Vendor Directory -> QuickBooks)
- Trigger: New vendor created in RossOS
- Action: Create vendor record in QuickBooks with name, contact info, payment terms
- Reverse sync: Vendor updates in QuickBooks sync back to RossOS overnight

**Client creation** (Clients Directory -> QuickBooks)
- Trigger: New client created in RossOS
- Action: Create customer record in QuickBooks
- Reverse sync: Customer updates in QuickBooks sync back to RossOS overnight

**Invoice approval** (Invoices -> QuickBooks AP)
- Trigger: Invoice status changes to 'approved' in RossOS
- Action: Create AP bill in QuickBooks with line items coded to job cost codes
- Journal entry: Debit cost-of-goods / Credit accounts-payable
- Reverse sync: Bill payment in QuickBooks marks invoice as paid in RossOS

**Invoice payment** (QuickBooks AP -> Invoices)
- Trigger: Bill payment recorded in QuickBooks
- Action: UPDATE invoices SET paid = true, paid_date, payment_method, check_number
- Journal entry: Debit accounts-payable / Credit bank account

**Draw request submission** (Draws -> QuickBooks AR)
- Trigger: Draw request status changes to 'submitted'
- Action: Create AR invoice in QuickBooks for draw amount
- Journal entry: Debit accounts-receivable / Credit revenue (by cost code)

**Draw payment received** (QuickBooks AR -> Draws)
- Trigger: Payment received in QuickBooks against AR invoice
- Action: UPDATE draws SET payment_received = true, payment_date
- Journal entry: Debit bank account / Credit accounts-receivable

**Change order approval** (Change Orders -> QuickBooks)
- Trigger: Change order approved by client
- Action: Adjust job budget in QuickBooks, create revised AR amount if applicable
- Journal entry: Adjust WIP and contract revenue entries

**Purchase order creation** (Purchase Orders -> QuickBooks)
- Trigger: PO approved and sent to vendor
- Action: Create PO in QuickBooks linked to job
- Journal entry: None (PO is commitment, not transaction). Encumbrance tracking optional

**Retainage release** (Contracts -> QuickBooks)
- Trigger: Retainage released at project closeout
- Action: Create AP bill for retainage amounts per vendor, AR invoice for owner retainage
- Journal entry: Release retainage liability accounts

**Payroll export** (Time Tracking Module 51 -> QuickBooks)
- Trigger: Payroll period closed
- Action: Export time entries with job codes, overtime calculations, per-diem amounts
- Journal entry: Debit labor cost codes per job / Credit payroll liability

### Email Notifications

**Invoice submitted for approval**
- Recipients: Designated approver (PM or owner based on amount threshold)
- Content: Invoice summary, vendor name, amount, job name, approval link

**Invoice approved**
- Recipients: Office manager (for payment processing)
- Content: Invoice details, payment terms, due date

**Draw request submitted**
- Recipients: Company owner, client (if portal enabled), lender (if applicable)
- Content: Draw amount, job progress percentage, attached documentation

**Change order created**
- Recipients: Client, PM, superintendent
- Content: Scope description, cost impact, schedule impact, approval link

**Proposal sent to client**
- Recipients: Client (primary email)
- Content: Proposal summary, view link with tracking pixel, expiry date

**Proposal viewed by client**
- Recipients: PM who sent the proposal
- Content: Client name, view count, time spent, pages viewed

**Contract sent for signature**
- Recipients: Client (via e-signature provider email)
- Content: DocuSign/signature link with contract summary

**Contract fully executed**
- Recipients: PM, owner, office manager
- Content: Contract summary, all parties signed, next steps

**Selection deadline approaching**
- Recipients: Client (3 days before, 1 day before, day of)
- Content: Selection item name, deadline, schedule impact if missed, portal link

**Punch item assigned**
- Recipients: Assigned vendor (email), assigned person (in-app)
- Content: Item description, photos, location, priority, due date

**Punch item rejected**
- Recipients: Assigned vendor, superintendent
- Content: Rejection reason, original photos, rejection photos

**Insurance expiring**
- Recipients: Vendor (30 days, 7 days, day of), office manager
- Content: Insurance type, expiry date, upload link for new certificate

**Lead assigned**
- Recipients: Assigned salesperson
- Content: Lead name, contact info, AI score, budget, project type

**Lead stage change**
- Recipients: Sales manager
- Content: Lead name, from stage, to stage, days in previous stage

### Client Portal Sync

**Proposal published**
- Trigger: Proposal status changes to 'sent'
- Portal effect: Proposal appears in client's portal with interactive viewer
- Client can: View proposal, explore tier comparisons, ask questions, sign/decline

**Selection options presented**
- Trigger: Selection status changes to 'options_presented'
- Portal effect: Options appear with photos, descriptions, prices, designer recommendations
- Client can: Browse options, add to favorites, add comments, submit selection, upload inspiration photos

**Selection confirmed by builder**
- Trigger: Selection status changes to 'confirmed'
- Portal effect: Confirmation notification, selection locked in portal, PO link visible

**Change order approval request**
- Trigger: Change order created requiring client approval
- Portal effect: Change order details with cost/schedule impact shown in portal
- Client can: Approve, request modifications, decline, add comments

**Draw request published**
- Trigger: Draw request status changes to 'submitted'
- Portal effect: Draw request with progress photos, line items, and approval button
- Client can: View progress, approve draw, add comments, request revisions

**Punch list items (client-reported)**
- Trigger: Client submits issue through portal
- Portal effect: Item appears in builder's punch list with source = 'client_portal'
- Client can: Report issues with photos, track resolution status, verify completion

**Daily log summary**
- Trigger: Daily log completed and published
- Portal effect: Summary of day's activities, weather, photos visible in portal
- Client can: View logs, comment, see progress photos

**Schedule updates**
- Trigger: Schedule milestone dates change
- Portal effect: Updated timeline visible in client's project timeline view

### Webhooks

**job.created** — Fires when a new job is created (including from lead conversion)
**job.status_changed** — Fires when job status changes (active, on_hold, complete)
**invoice.approved** — Fires when an invoice is approved
**invoice.paid** — Fires when an invoice payment is recorded
**draw.submitted** — Fires when a draw request is submitted
**draw.approved** — Fires when a draw is approved by client/lender
**change_order.approved** — Fires when a change order is approved
**contract.signed** — Fires when a contract is fully executed
**proposal.viewed** — Fires when a client views a proposal
**proposal.accepted** — Fires when a client accepts a proposal
**selection.confirmed** — Fires when a client selection is confirmed
**punch_item.created** — Fires when a new punch item is created
**punch_item.completed** — Fires when a punch item is completed
**lead.created** — Fires when a new lead enters the system
**lead.stage_changed** — Fires when a lead changes pipeline stage
**lead.converted** — Fires when a lead is converted to a job
**vendor.insurance_expiring** — Fires 30 days before vendor insurance expiry
**vendor.insurance_expired** — Fires when vendor insurance has expired

---

## Multi-Layered Logic

### Invoice Approval Decision Tree

```
INVOICE RECEIVED (AI-processed, coded to cost codes)
  |
  +--> Amount <= $500 AND vendor is 'preferred' status?
  |      YES --> Auto-approve (PM notified)
  |      NO  --> Continue
  |
  +--> Amount <= $5,000?
  |      YES --> PM approval required
  |      |       PM approves? --> Check lien waiver status
  |      |       PM rejects?  --> Return to vendor with notes
  |      NO  --> Continue
  |
  +--> Amount <= $25,000?
  |      YES --> PM approval THEN owner approval required
  |      |       Both approve? --> Check lien waiver status
  |      NO  --> Continue
  |
  +--> Amount > $25,000
  |      --> PM approval THEN owner approval THEN company principal approval
  |
  +--> LIEN WAIVER CHECK (after amount approval)
  |      |
  |      +--> Previous payment to this vendor on this job?
  |      |      YES --> Conditional lien waiver for CURRENT payment required
  |      |              AND unconditional lien waiver for PREVIOUS payment required
  |      |              Both on file? --> APPROVED for payment
  |      |              Missing?     --> HOLD - notify office manager, send request to vendor
  |      |      NO  --> No lien waiver required for first payment
  |      |              --> APPROVED for payment
  |
  +--> BUDGET CHECK (after lien waiver check)
         |
         +--> Invoice amount within remaining budget for cost code?
         |      YES --> Process payment
         |      NO  --> Flag as over-budget
         |              |
         |              +--> Variance <= 10%?
         |              |      --> Approve with budget warning notification
         |              +--> Variance > 10%?
         |                     --> Require change order before payment
```

### Change Order Approval Decision Tree

```
CHANGE ORDER INITIATED
  |
  +--> Source?
  |      +--> Client requested scope change
  |      +--> Field condition (unforeseen)
  |      +--> Design error/omission
  |      +--> Code requirement change
  |      +--> Verbal directive (needs formalization)
  |
  +--> COST IMPACT CALCULATED
  |      Material cost + Labor cost + Overhead markup + Profit markup
  |      + Schedule impact cost (if delays other work)
  |
  +--> Amount <= $1,000?
  |      YES --> PM can approve internally (client notified after)
  |      NO  --> Continue
  |
  +--> Amount <= $5,000?
  |      YES --> PM approves, then client approval required
  |      |       Client approves via portal or email? --> APPROVED
  |      |       Client requests revision? --> Revise and resubmit
  |      |       Client declines? --> Cancel or negotiate
  |      NO  --> Continue
  |
  +--> Amount <= $25,000?
  |      YES --> PM + Owner internal approval, then client approval
  |      NO  --> Continue
  |
  +--> Amount > $25,000
  |      --> PM + Owner + Principal approval, then client approval
  |          May require lender approval if construction loan involved
  |
  +--> BUDGET IMPACT ASSESSMENT
  |      |
  |      +--> Within contingency?
  |      |      YES --> Draw from contingency, no contract amendment needed
  |      |      NO  --> Continue
  |      |
  |      +--> Requires contract amendment?
  |      |      YES --> Generate amendment document, require e-signature
  |      |      NO  --> Proceed with budget adjustment
  |      |
  |      +--> GMP contract and over GMP?
  |             YES --> Savings split clause recalculation triggered
  |             NO  --> Standard budget adjustment
  |
  +--> SCHEDULE IMPACT ASSESSMENT
         |
         +--> Adds days to schedule?
         |      YES --> Update schedule, notify all affected vendors
         |             If critical path affected, AI recalculates completion date
         |      NO  --> No schedule change
         |
         +--> Requires additional permits?
                YES --> Update permit tracking, hold work until approved
                NO  --> Proceed
```

### Draw Request Workflow Decision Tree

```
DRAW REQUEST LIFECYCLE

1. DRAFT
   |  Builder creates draw based on % complete or milestone achieved
   |  Line items reference cost codes, show completed quantities
   |  Supporting docs: progress photos, lien waivers, inspection reports
   |
   +--> Builder reviews line items, attaches documentation
   +--> AI validates: % complete matches schedule progress?
   |      YES --> Proceed
   |      NO  --> Warning flag, PM must acknowledge variance
   |
   +--> Submit for internal review

2. INTERNAL REVIEW
   |  PM reviews line items, verifies progress
   |  Checks all required documentation attached
   |
   +--> Lien waivers complete for all vendors paid in prior draw?
   |      YES --> Continue
   |      NO  --> HOLD until lien waivers received
   |
   +--> Retainage calculated correctly?
   |      YES --> Continue
   |      NO  --> Adjust retainage amounts
   |
   +--> Change orders included in draw?
   |      YES (if approved COs exist) --> Include CO amounts
   |      NO  --> Verify no approved COs are missing
   |
   +--> PM approves? --> Submit to client/lender
   +--> PM rejects? --> Return to draft with notes

3. SUBMITTED
   |  Draw sent to client (and lender if construction loan)
   |
   +--> Client reviews in portal
   |      Client approves? --> Continue to lender (if applicable)
   |      Client requests changes? --> Return to draft
   |      Client rejects? --> Return to draft with dispute notes
   |
   +--> Lender review (if construction loan)
   |      Lender orders inspection? --> Schedule lender inspection
   |      Inspection passes? --> Lender approves
   |      Inspection fails? --> Return with deficiency notes

4. APPROVED
   |  All parties have approved
   |
   +--> Sync to QuickBooks AR
   +--> Generate AIA G702/G703 documents
   +--> Track expected payment date

5. DISBURSED
   |  Payment received from client/lender
   |
   +--> Record payment in RossOS
   +--> Sync payment to QuickBooks
   +--> Update job cash flow
   +--> Release vendor payments (if draw-based payment schedule)
   +--> Update retainage balance
```

### Selection Workflow Decision Tree

```
SELECTION LIFECYCLE

1. NOT STARTED (present)
   |  Builder creates selection item with allowance amount, deadline, options
   |
   +--> Present options to client
   |      Upload product options with photos, specs, prices
   |      Mark designer-recommended options
   |      Set deadline (tied to construction schedule)
   |
   +--> Status -> OPTIONS_PRESENTED

2. OPTIONS_PRESENTED -> CLIENT_REVIEWING (review)
   |  Client views options in portal
   |
   +--> Client can:
   |      Browse options, view photos/specs
   |      Add inspiration images
   |      Add comments/questions
   |      Shortlist favorites
   |
   +--> Status -> CLIENT_REVIEWING (when client first views)

3. CLIENT_REVIEWING -> SELECTED (select)
   |  Client makes their choice
   |
   +--> Client selects option in portal
   |      Selection price calculated
   |      Allowance variance shown (over/under)
   |
   +--> If over allowance:
   |      Show delta amount clearly
   |      Require explicit acknowledgment of overage
   |      AI suggests alternatives within allowance
   |
   +--> Status -> SELECTED

4. SELECTED -> CONFIRMED (confirm)
   |  Builder reviews and confirms selection
   |
   +--> Builder verifies availability with vendor
   |      Lead time confirmed
   |      Price confirmed (may differ from catalog)
   |
   +--> If price changed:
   |      Notify client of price change
   |      Re-approval required
   |
   +--> E-signature captured for selection confirmation
   |      Records: item selected, price, variance, client signature, date
   |
   +--> Budget updated with actual vs allowance
   |      If over allowance -> change order may be required
   |
   +--> Status -> CONFIRMED

5. CONFIRMED -> ORDERED (order)
   |  Purchase order created
   |
   +--> Auto-generate PO from confirmed selection
   |      PO linked to selection record
   |      Vendor notified
   |      Expected delivery date set
   |
   +--> Schedule dependency verified
   |      If lead time exceeds schedule buffer -> AI warning
   |
   +--> Status -> ORDERED

6. ORDERED -> RECEIVED (receive)
   |  Material arrives on site or at warehouse
   |
   +--> Record receipt with:
   |      Delivery date
   |      Condition inspection (photo)
   |      Quantity verification
   |
   +--> If damaged or wrong item:
   |      Flag for return/replacement
   |      Notify vendor
   |      Status stays ORDERED until replacement received
   |
   +--> Status -> RECEIVED

7. RECEIVED -> INSTALLED (install)
   |  Item installed in the project
   |
   +--> Installer confirms completion
   |      Photo documentation
   |      Client walkthrough/approval (optional)
   |
   +--> Status -> INSTALLED
   |      Selection complete

CHANGE REQUEST (can happen at CONFIRMED or ORDERED stage)
   |
   +--> Client requests different selection
   |
   +--> If ORDERED:
   |      Check cancellation policy with vendor
   |      Calculate cancellation fee
   |      Show cost impact to client
   |      Client confirms change -> Cancel PO, restart from SELECTED
   |
   +--> If CONFIRMED (not yet ordered):
   |      Revert to SELECTED with new choice
   |      Re-capture e-signature
   |
   +--> Status -> CHANGE_REQUESTED (temporary)
   +--> After resolution -> back to appropriate stage
```

---

## Database Schema Map

This documents which pages and actions read from and write to each of the 9 existing database tables.

### companies

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Every authenticated page | `company_id` used as tenant filter in every query via RLS |
| READ | Dashboard | Company name, settings displayed in header |
| READ | Navigation | Company context determines nav items |
| WRITE | Onboarding (Module 41) | INSERT when new company signs up |
| WRITE | Settings (Module 02) | UPDATE company configuration, feature flags, branding |

### users

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Login | Authentication lookup via Supabase Auth |
| READ | Every page | Current user context for permissions, audit logging |
| READ | Dashboard | User preferences for dashboard layout |
| READ | Leads Pipeline | `assigned_to` field references user |
| READ | Punch List | `assigned_to` person references user |
| READ | Daily Logs | Crew members reference users |
| WRITE | Login | Last login timestamp updated |
| WRITE | `/api/v1/users` | CREATE new user, UPDATE user details |
| WRITE | `/api/v1/users/[id]/deactivate` | Soft-deactivate user |
| WRITE | `/api/v1/users/[id]/reactivate` | Reactivate user |
| WRITE | User profile | UPDATE preferences, contact info, notification settings |

### roles

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Every authenticated page | Role checked for permission enforcement (planned) |
| READ | `/api/v1/roles` | List all roles for company |
| READ | User management | Role assignment dropdown |
| WRITE | `/api/v1/roles` | CREATE custom role |
| WRITE | `/api/v1/roles/[id]` | UPDATE role permissions, DELETE role |

### jobs

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Dashboard | Active jobs list, job counts |
| READ | Jobs list page | Full job listing with filters |
| READ | Job dashboard | All sub-pages reference job record |
| READ | Estimates | Project SF, project type from job |
| READ | Proposals | Project name, address from job |
| READ | Contracts | Project name, linked job data |
| READ | Selections | All selections scoped to a job |
| READ | Punch List | All items scoped to a job |
| READ | Budget | Job contract value, cost codes |
| READ | Schedule | Job timeline, milestones |
| READ | Daily Logs | Job context for log entries |
| READ | Draws | Job progress for draw calculation |
| READ | Invoices | Job cost codes for invoice coding |
| READ | Client directory | Client's active/completed jobs |
| READ | Vendor directory | Vendor's active jobs count |
| WRITE | Lead conversion ("Convert to Job") | INSERT new job from won lead data |
| WRITE | Job creation form | INSERT new job manually |
| WRITE | Job settings | UPDATE job details, status, team |
| WRITE | Job archival | UPDATE status = 'archived' (soft delete) |

### invoices

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Dashboard | AP amount, overdue count |
| READ | Job invoices page | Invoice list for specific job |
| READ | Financial payables | All invoices across jobs |
| READ | Vendor directory | Vendor's total spend computed from invoices |
| READ | Budget tracking | Committed costs from approved invoices |
| READ | Draw requests | Invoiced amounts for draw line items |
| WRITE | AI Invoice Processing (Module 13) | INSERT after OCR extraction and AI coding |
| WRITE | Invoice approval workflow | UPDATE status (pending -> approved -> paid) |
| WRITE | Invoice payment recording | UPDATE paid = true, payment details |
| WRITE | Invoice rejection | UPDATE status = 'rejected', rejection notes |
| WRITE | Manual invoice entry | INSERT from manual data entry form |

### draws

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Dashboard | AR amount from outstanding draws |
| READ | Job draws page | Draw list for specific job |
| READ | Financial receivables | All draws across jobs |
| READ | Client portal | Client views draw for approval |
| READ | Contracts | Draw schedule references |
| WRITE | Draw creation | INSERT draw request with line items |
| WRITE | Draw submission | UPDATE status = 'submitted', sent_at |
| WRITE | Draw approval (PM) | UPDATE internal_approved = true |
| WRITE | Draw approval (client) | UPDATE client_approved = true |
| WRITE | Draw approval (lender) | UPDATE lender_approved = true |
| WRITE | Draw payment received | UPDATE payment_received = true, payment_date |
| WRITE | Draw rejection | UPDATE status = 'rejected', notes |

### audit_log

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | `/api/v1/audit-log` | View audit trail (admin only) |
| READ | Admin dashboard | Recent activity feed |
| READ | Job activity feed | Job-specific audit entries |
| WRITE | Every create/update/delete action | INSERT audit entry with: user_id, action, entity_type, entity_id, old_values, new_values, ip_address, timestamp |
| WRITE | Invoice approval | Logs who approved and when |
| WRITE | Draw submission | Logs draw lifecycle events |
| WRITE | Contract signature | Logs signature events |
| WRITE | Lead stage change | Logs pipeline progression |
| WRITE | Vendor status change | Logs approval/conditional/blacklist changes |
| WRITE | Selection confirmation | Logs client selection choices |
| WRITE | Punch item status change | Logs completion, rejection, verification |

### auth_audit_log

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Security dashboard (planned) | Login history, suspicious activity |
| READ | Admin audit page | Authentication events |
| WRITE | Login page | INSERT on successful login (event_type: 'login', ip_address, user_agent) |
| WRITE | Logout | INSERT on logout (event_type: 'logout') |
| WRITE | Password change | INSERT (event_type: 'password_change') |
| WRITE | Failed login attempt | INSERT (event_type: 'login_failed') |
| WRITE | Session refresh | INSERT (event_type: 'token_refresh') |
| WRITE | API key usage | INSERT (event_type: 'api_key_auth') |

### api_metrics

| Operation | Source Page/Action | Details |
|-----------|-------------------|---------|
| READ | Platform analytics (Module 49) | API usage dashboards |
| READ | Admin dashboard | Rate limit monitoring, performance metrics |
| READ | API documentation page | Endpoint health status |
| WRITE | `createApiHandler` middleware | INSERT on every API request: endpoint, method, status_code, response_time_ms, user_id, company_id, timestamp |
| WRITE | Rate limit events | INSERT when rate limit hit: endpoint, user_id, limit_type |
| WRITE | `/api/cron/cleanup` | DELETE old metrics entries beyond retention period |

---

## Settings > Features (Feature Registry)

**Page:** `/skeleton/company/features` (`src/app/(skeleton)/skeleton/company/features/page.tsx`)
**Preview:** `src/components/skeleton/previews/feature-registry-preview.tsx`
**Config:** `src/config/features.ts`
**Status:** 🚧 Skeleton with Mock Data
**Nav:** Settings > Features in `companyRightNav`

Central registry of all 205 RossOS capabilities organized into 10 categories. Allows companies to toggle features on/off, search/filter, and see which features use self-learning AI.

### Stats Cards (6 cards, grid-cols-6)

| Card | Value Source | Icon |
|------|-------------|------|
| Total Features | `FEATURES.length` (205) | Zap |
| Enabled | `enabledFeatures.size` (toggleable state) | ToggleRight |
| Self-Learning | Features with `selfLearn: true` | Brain |
| Ready to Build | Features with `status: 'ready'` | CheckCircle |
| Planned | Features with `status: 'planned'` | Clock |
| Future | Features with `status: 'future'` | Star |

### Smart Onboarding Walkthrough Section

**Collapsible section** — shows 6-step AI-powered onboarding flow:
1. Upload License & Insurance (30 sec) — AI extracts company info
2. Connect QuickBooks (60 sec) — one-click import
3. Import Contacts via Magic Link (2 min) — vendor self-service
4. Upload a Contract (45 sec) — AI extracts job details
5. Invite Your Team (30 sec) — role-based invites
6. You're Live! — readiness checklist

- **Expand/Collapse toggle** — chevron button on header
- **UI effect:** Toggles visibility of the 3-column onboarding grid
- **Status:** 🚧 Mock Data

### Search & Filters Bar

**Search input**
- **What it does:** Filters all 205 features by name, description, or category
- **UI effect:** Real-time filtering as user types. Shows X of 205 count.
- **Status:** 🚧 Mock Data (client-side filter, no API)

**Status filter dropdown**
- **Options:** All Statuses, Ready to Build, Planned, Future
- **UI effect:** Filters feature list by build status
- **Status:** 🚧 Mock Data

**"Self-Learning Only" toggle button**
- **What it does:** Filters to show only features with `selfLearn: true`
- **UI effect:** Button changes to purple when active. Filters list.
- **Status:** 🚧 Mock Data

### Category Sections (10 categories)

Each category is a collapsible card with:

**Category header** (click to collapse/expand)
- Shows: icon, category name, feature count, enabled count, AI-powered count
- **UI effect:** Toggles visibility of feature cards within the category

**"Enable All" button** (per category)
- **What it does:** Enables all features in this category
- **UI effect:** All toggles in category switch to amber (on). Stats update.
- **Backend effect:** (Not wired) Would INSERT/UPDATE `company_features` rows
- **Status:** 🚧 Mock Data

**"Disable All" button** (per category)
- **What it does:** Disables all features in this category
- **UI effect:** All toggles in category switch to gray (off). Stats update.
- **Backend effect:** (Not wired) Would UPDATE `company_features` rows
- **Status:** 🚧 Mock Data

### Feature Cards (205 features)

Each feature row has:

**Toggle switch**
- **What it does:** Enables/disables individual feature for this company
- **UI effect:** Switch animates amber (on) / gray (off). Feature text dims when disabled. Stats cards update count.
- **Backend effect:** (Not wired) Would INSERT/UPDATE `company_features(company_id, feature_id, enabled)`
- **Reverse action:** Toggle again to re-enable/disable
- **Who can use it:** owner, admin (when wired)
- **Status:** 🚧 Mock Data

**Self-Learning badge** (purple, shows on AI features)
- Brain icon + "Self-Learning" text
- **Only shows when:** `feature.selfLearn === true`

**Status badge** (colored)
- Ready to Build: green
- Planned: amber
- Future: indigo

**Effort badge** (colored text)
- S: green, M: yellow, L: orange, XL: red

**Phase indicator**
- "Phase 1", "Phase 2", or "Phase 3"

### AI Insights Bar

Amber-tinted bar with Sparkles icon showing summary:
- Count of self-learning features
- Count of ready features
- Recommendation to enable Phase 1 features

### AI Features Panel (3 features)

| Feature | Insight |
|---------|---------|
| Smart Feature Recommendations | AI suggests which features to enable based on company profile |
| Usage-Based Suggestions | After 30 days, AI identifies which disabled features would save the most time |
| Self-Learning Dashboard | Track AI accuracy improvements across all self-learning features |

### 10 Feature Categories

| Category | Count | Example Features |
|----------|-------|-----------------|
| Onboarding & Setup | 18 | Smart Company Setup Wizard, Business Card Scanner, QuickBooks Import |
| Photo & Media | 17 | AI Room Auto-Tagging, Before/After Slider, Bulk Photo Upload |
| Activity & Analytics | 17 | Real-Time Activity Feed, Audit Trail, Feature Usage Heatmap |
| Self-Learning AI | 20 | Feedback Loop, Invoice Auto-Coding, Estimate vs Actual Learning |
| Self-Debugging | 16 | Global Error Boundary, API Retry, Dead Button Detection |
| Daily Operations | 20 | Daily Log with Voice-to-Text, Punch List, Change Order Workflow |
| Financial | 20 | WIP Report, Draw Request Builder, Budget Alerts |
| Client Experience | 17 | Homeowner Portal, Selection Tracking, Digital Signatures |
| Mobile & Field | 15 | PWA, Offline Mode, Push Notifications, QR Code Scanning |
| Reports & Docs | 15 | Report Builder, WIP Report, Job Cost Detail |
| Integrations | 15 | QuickBooks Online, Email Integration, Zapier/Webhooks |
| Security & Admin | 15 | RBAC, 2FA, SSO, Data Export, Feature Flag System |

---

## Construction Intelligence Pages (8 pages)
<!-- Added: 2026-02-23 — Intelligence skeleton pages from Production Blueprint -->
**Route:** `/skeleton/intelligence/*`
**Nav Location:** Intelligence dropdown in companyIntelligenceNav (Brain icon)

### Trade Intuition AI (`/skeleton/intelligence/trade-intuition`)
**What it is:** The construction superintendent's brain — 30 years of trade knowledge embedded in every AI decision. 80 knowledge domains across 8 categories + 7-Layer Thinking Engine.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `trade-intuition-preview.tsx`

| Element | Type | Behavior |
|---------|------|----------|
| Header with stats | Display | Shows 80 domains, 8 categories, 7 layers |
| 8 Category cards | Cards | Material Science, Installation Sequences, Real-World Physics, Problem-Solving, Trade Knowledge, Coordination, Cost Intelligence, Safety & Compliance — each shows 10 domains |
| 7-Layer Thinking Engine | Interactive demo | Live example showing framing start decision evaluated through: Prerequisites, Material Validation, Trade Conflict Scan, Downstream Impact, Cost & Budget, Quality & Warranty, Client Communication |
| Knowledge Domains accordion | Expandable | Click category to see 4 example domains with descriptions |
| Confidence & Override System | Display | 5 flag levels: Safety Block (red), Strong Recommendation (orange), Suggestion (yellow), Learning Nudge (blue), Informational (white) |
| Cross-module examples | Cards | 6 examples: Scheduling, Invoices, Daily Logs, Change Orders, Vendor Management, Selections |
| AI Insights panel | Display | 3 insights: Self-Learning, Cross-Module Intelligence, Confidence Calibration |

### Plan Analysis (`/skeleton/intelligence/plan-analysis`)
**What it is:** AI plan reading and quantity takeoffs — upload blueprints, get automated material quantities, detect scope gaps, and generate material lists.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `plan-analysis-preview.tsx`

### Bidding & Estimating (`/skeleton/intelligence/bidding`)
**What it is:** Bid analysis and estimating — assembly-based pricing, bid comparison, margin optimization, and competitive intelligence.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `bidding-estimating-preview.tsx`

### Selections Experience (`/skeleton/intelligence/selections`)
**What it is:** Vibe boards and visual product selections — mood boards, side-by-side comparisons, AR room visualization, and selection gamification.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `selections-experience-preview.tsx`

### Production & Quality (`/skeleton/intelligence/production`)
**What it is:** Gantt charts with dependencies, quality checklists with photo verification, crew management, and AI-powered production intelligence.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `production-quality-preview.tsx`

### Procurement & Supply Chain (`/skeleton/intelligence/procurement`)
**What it is:** PO workflows from takeoff to delivery to invoice match. Delivery tracking, vendor compliance, order consolidation, and AI supply chain optimization.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `procurement-preview.tsx`

### Smart Reports (`/skeleton/intelligence/reports`)
**What it is:** AI-generated narrative reports, portfolio health dashboards, cash flow forecasting, and automated report scheduling.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `smart-reports-preview.tsx`

### AI Hub / Command Center (`/skeleton/intelligence/ai-hub`)
**What it is:** Cross-cutting AI features — morning briefings, project health scores (0-100), "What If" scenario engine, risk register, and vendor intelligence.
**Status:** 🚧 Skeleton (mock data)
**Preview:** `ai-hub-preview.tsx`

| Element | Type | Behavior |
|---------|------|----------|
| Stats cards | Display | AI Accuracy (94.2%), Predictions Today (12), Active Alerts (5), Learning Events (847) |
| Morning Briefing | Display | AI-generated daily summary with weather, financial updates, inspections, crew status |
| Project Health Scores | Interactive cards | 4 projects with health scores (54-91), budget/schedule status, trend arrows, risk flags |
| "What If" Scenario Engine | Interactive | Models budget/schedule/margin impact of decisions — shows Viking appliance upgrade example |
| AI Risk Register | Table | 3 active risks with probability/impact levels and AI-suggested actions |
| AI Intelligence bar | Display | Amber bar summarizing model accuracy improvements and learned patterns |
| AI Features Panel | Display | 6 features: Morning Briefings, Health Score Engine, Scenario Modeling, Risk Prediction, Cross-Project Learning, Vendor Intelligence |

### Feature Count Expansion
The features.ts config was expanded from 205 to 347 features with these new categories:
| Category | Count | IDs |
|----------|-------|-----|
| Trade Intuition AI | 20 | 206-225 |
| Plan Analysis | 15 | 226-240 |
| Bidding & Estimating | 18 | 241-258 |
| Selections Experience | 20 | 259-278 |
| Production & Quality | 20 | 279-298 |
| Procurement | 17 | 299-315 |
| Smart Reports | 15 | 316-330 |
| Cross-Cutting AI | 17 | 331-347 |
