# Ross Built CMS - Complete System Design

## Overview

This document defines the complete system architecture for the Ross Built Construction Management Software rebuild. Every entity, page, data flow, and API endpoint is documented here to ensure all features are properly connected from the start.

---

## 1. Entity Relationship Model

### 1.1 Core Entities

| Entity | Description | Owner |
|--------|-------------|-------|
| **Company** | Builder organization (multi-tenant) | - |
| **User** | Employee with system access | Company |
| **Cost Code** | CSI division for cost organization | Company |
| **Vendor** | Subcontractor or material supplier | Company |
| **Client** | Homeowner/customer | Company |
| **Job** | Construction project | Company, Client |

### 1.2 Pre-Construction Entities

| Entity | Description | Owner | Connects To |
|--------|-------------|-------|-------------|
| **Lead** | Potential project/client | Company | → Client, → Job |
| **Estimate** | Cost breakdown for proposed work | Job | → Cost Codes, → Budget |
| **Estimate Line** | Individual cost item | Estimate | → Cost Code |
| **Proposal** | Client-facing quote document | Job | → Estimate, → Contract |
| **Contract** | Signed agreement | Job | → Proposal |
| **Selection** | Client choice (allowance item) | Job | → Cost Code, → Vendor |

### 1.3 Construction Entities

| Entity | Description | Owner | Connects To |
|--------|-------------|-------|-------------|
| **Budget** | Approved costs for job | Job | ← Estimate (copies data) |
| **Budget Line** | Individual budget item | Budget | → Cost Code |
| **Schedule** | Project timeline | Job | → Tasks |
| **Task** | Scheduled work item | Schedule | → Budget Line, → Vendor |
| **Daily Log** | Field documentation | Job | → Tasks, → Photos |
| **Photo** | Progress image | Job | → Daily Log (optional) |
| **Change Order** | Scope/budget modification | Job | → Budget Lines, → Tasks |
| **Purchase Order** | Commitment to vendor | Job | → Vendor, → Budget Lines |
| **PO Line Item** | Individual PO item | Purchase Order | → Cost Code |
| **Invoice** | Vendor bill | Job | → Vendor, → PO (optional) |
| **Invoice Allocation** | Cost code breakdown | Invoice | → Cost Code, → Budget Line |
| **Draw** | Client billing (AIA format) | Job | → Invoices |
| **Draw Line** | Individual draw item | Draw | → Budget Line |

### 1.4 Closeout Entities

| Entity | Description | Owner | Connects To |
|--------|-------------|-------|-------------|
| **Punch List** | Items to complete | Job | → Tasks |
| **Punch Item** | Individual punch item | Punch List | → Vendor, → Photo |
| **Final Doc** | Closeout document | Job | - |
| **Warranty** | Post-construction item | Job | → Vendor |

### 1.5 System Entities

| Entity | Description | Owner | Connects To |
|--------|-------------|-------|-------------|
| **Activity Log** | Audit trail | Company | → User, → Any Entity |
| **Notification** | System alert | User | → Any Entity |
| **File** | Uploaded document | Job | → Any Entity |
| **Report** | Generated report | Company | → Job(s) |

---

## 2. Entity Relationship Diagram

```
                              ┌─────────────┐
                              │   COMPANY   │
                              └──────┬──────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
    ┌───────────┐            ┌─────────────┐            ┌─────────────┐
    │   USERS   │            │ COST_CODES  │            │   VENDORS   │
    └───────────┘            └─────────────┘            └─────────────┘
                                     │                          │
                                     │                          │
          ┌──────────────────────────┼──────────────────────────┤
          │                          │                          │
          ▼                          ▼                          ▼
    ┌───────────┐            ┌─────────────┐            ┌─────────────┐
    │  CLIENTS  │◄───────────│    JOBS     │───────────►│   (ties)    │
    └───────────┘            └──────┬──────┘            └─────────────┘
          │                         │
          │                         │
          ▼               ┌─────────┴─────────┐
    ┌───────────┐         │                   │
    │   LEADS   │         ▼                   ▼
    └─────┬─────┘   ┌───────────┐      ┌───────────┐
          │         │  BUDGET   │      │ SCHEDULE  │
          ▼         └─────┬─────┘      └─────┬─────┘
    ┌───────────┐         │                  │
    │ ESTIMATES │─────────┤                  ▼
    └─────┬─────┘         │            ┌───────────┐
          │               ▼            │   TASKS   │
          │         ┌───────────┐      └─────┬─────┘
          │         │BUDGET LINE│            │
          │         └───────────┘            ▼
          │               │            ┌───────────┐
          ▼               │            │DAILY LOGS │◄──► PHOTOS
    ┌───────────┐         │            └───────────┘
    │ PROPOSALS │         │
    └─────┬─────┘         │
          │               ▼
          ▼         ┌─────────────────────────────┐
    ┌───────────┐   │                             │
    │ CONTRACTS │   │     FINANCIAL FLOW          │
    └───────────┘   │                             │
                    │  PO ──► INVOICE ──► DRAW    │
    ┌───────────┐   │   │         │         │     │
    │SELECTIONS │   │   └────┬────┘         │     │
    └───────────┘   │        ▼              ▼     │
                    │  CHANGE ORDERS    PAYMENTS  │
                    └─────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   QUICKBOOKS    │
                    └─────────────────┘

    CLOSEOUT:
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │PUNCH LISTS│   │ FINAL DOCS│   │WARRANTIES │
    └───────────┘   └───────────┘   └───────────┘
```

---

## 3. Complete Page/Screen Map

### 3.1 Global Pages

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Login | `/login` | Authentication | Email/password login, forgot password |
| Dashboard | `/` | Overview | Job summary, pending items, recent activity |
| Settings | `/settings` | Configuration | Company, user profile, integrations |

### 3.2 Jobs

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Job List | `/jobs` | View all jobs | Filter by status/phase, search, create new |
| Job Detail | `/jobs/:id` | Single job hub | Tabs for all job-related data |
| Job Create | `/jobs/new` | New job wizard | From scratch or from contract |

**Job Detail Tabs:**
- Overview (status, key metrics, activity)
- Budget (budget lines, variance, forecasting)
- Schedule (timeline, tasks, milestones)
- Financial (invoices, POs, draws, change orders)
- Documents (files, photos, plans)
- Daily Logs (field notes)
- Selections (allowances, client choices)
- Closeout (punch list, final docs)

### 3.3 Financial

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Invoices | `/invoices` | All invoices | List, filter, status workflow |
| Invoice Detail | `/invoices/:id` | Single invoice | View, allocate, approve, pay |
| Invoice Upload | `/invoices/upload` | AI processing | PDF upload, AI extraction, review |
| Purchase Orders | `/purchase-orders` | All POs | List, filter, create |
| PO Detail | `/purchase-orders/:id` | Single PO | View, edit, link invoices |
| PO Create | `/purchase-orders/new` | Create PO | Vendor, job, line items |
| Draws | `/draws` | All draws | List by job, filter by status |
| Draw Detail | `/draws/:id` | Single draw | Line items, G702/G703 format |
| Draw Create | `/draws/new` | Create draw | Select job, pull budget/invoice data |
| Change Orders | `/change-orders` | All COs | List, filter by job |
| CO Detail | `/change-orders/:id` | Single CO | Scope, cost, approval |
| CO Create | `/change-orders/new` | Create CO | Line items, impact on budget |

### 3.4 Pre-Construction

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Leads | `/leads` | Pipeline | List, stages, convert to job |
| Lead Detail | `/leads/:id` | Single lead | Contact info, notes, convert |
| Estimates | `/estimates` | All estimates | List, duplicate, export |
| Estimate Detail | `/estimates/:id` | Single estimate | Line items, cost codes, totals |
| Estimate Builder | `/estimates/:id/edit` | Build estimate | Add/edit lines, assemblies |
| Proposals | `/proposals` | All proposals | Generate from estimates |
| Proposal Detail | `/proposals/:id` | Single proposal | Preview, send, track |
| Contracts | `/contracts` | All contracts | List, filter by status |
| Contract Detail | `/contracts/:id` | Single contract | View, sign, lock budget |
| Selections | `/jobs/:id/selections` | Job selections | Allowances, client choices |

### 3.5 Schedule & Field

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Schedule | `/jobs/:id/schedule` | Job timeline | Gantt/list view, tasks |
| Task Detail | `/tasks/:id` | Single task | Assign, status, notes |
| Daily Logs | `/jobs/:id/daily-logs` | Job logs | List by date |
| Daily Log Entry | `/daily-logs/:id` | Single log | Notes, weather, photos, labor |
| Photos | `/jobs/:id/photos` | Job photos | Gallery, upload, organize |

### 3.6 Directory

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Vendors | `/vendors` | Vendor list | Search, filter by trade |
| Vendor Detail | `/vendors/:id` | Single vendor | Contact, history, invoices |
| Vendor Create | `/vendors/new` | Add vendor | Contact info, W9 upload |
| Clients | `/clients` | Client list | All homeowners |
| Client Detail | `/clients/:id` | Single client | Contact, jobs, portal access |
| Client Create | `/clients/new` | Add client | Contact info |

### 3.7 Closeout

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Punch Lists | `/jobs/:id/punch-list` | Punch items | List, assign, complete |
| Punch Item | `/punch-items/:id` | Single item | Photos, vendor, status |
| Final Docs | `/jobs/:id/final-docs` | Closeout docs | Upload, organize, share |
| Warranties | `/jobs/:id/warranties` | Warranty items | Track, expiration |

### 3.8 Reports & Analytics

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Reports | `/reports` | Report hub | Available reports |
| Job Profitability | `/reports/profitability` | Profit analysis | By job, by cost code |
| Budget vs Actual | `/reports/budget-variance` | Variance report | Over/under budget |
| Cash Flow | `/reports/cash-flow` | Cash projections | Upcoming in/out |
| P&L Dashboard | `/reports/pnl` | Company P&L | Revenue, costs, margin |

### 3.9 Client Portal (External)

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Portal Dashboard | `/portal` | Client overview | Job status, documents |
| Portal Photos | `/portal/photos` | Progress photos | View-only gallery |
| Portal Selections | `/portal/selections` | Make selections | Choose finishes, approve |
| Portal Draws | `/portal/draws` | Payment requests | View, approve draws |

### 3.10 Admin

| Page | URL | Purpose | Key Functions |
|------|-----|---------|---------------|
| Cost Codes | `/settings/cost-codes` | Manage codes | CSI divisions, custom codes |
| Users | `/settings/users` | Team management | Add, roles, permissions |
| Company | `/settings/company` | Company settings | Name, logo, defaults |
| Integrations | `/settings/integrations` | QuickBooks | Connect, sync settings |

---

## 4. Data Flow Diagrams

### 4.1 Lead to Job Flow

```
LEAD ──► JOB ──► ESTIMATE ──► PROPOSAL ──► CONTRACT
  │        │         │
  │        │         └──► BUDGET (copy estimate lines)
  │        │
  └──► CLIENT (created with job if new)
```

**Process:**
1. Lead captured (name, contact, project description)
2. Lead qualified → Job created (job is container for project work)
3. Client created or linked to existing
4. Estimate created within job with cost code line items
5. Proposal generated from estimate (client-facing)
6. Contract signed (locks proposal as agreement)
7. Budget auto-populated from signed estimate line items

### 4.2 Budget to Payment Flow

```
           BUDGET
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
   PO     INVOICE   CHANGE ORDER
    │         │         │
    │    ┌────┘         │
    │    │              │
    │    ▼              │
    │ ALLOCATION        │
    │    │              │
    └────┼──────────────┘
         │
         ▼
    BUDGET LINE
    (actual vs planned)
         │
         ▼
       DRAW
         │
         ▼
    QUICKBOOKS
```

**Process:**
1. Budget lines define planned costs per cost code
2. Purchase Orders commit to spending before invoice
3. Invoices received from vendors
4. Invoice allocations assign costs to budget lines
5. Change Orders modify budget (add/remove lines)
6. All flow updates budget variance (actual vs planned)
7. Draws pull completed work for client billing
8. QuickBooks sync pushes financial data to accounting

### 4.3 Invoice Processing Flow

```
    PDF UPLOAD
        │
        ▼
   AI EXTRACTION
   (Claude Vision)
        │
        ▼
   REVIEW/EDIT
   (user confirms)
        │
        ▼
   SAVE INVOICE
        │
        ├──► Match to PO (optional)
        │
        ▼
   ALLOCATE TO COST CODES
        │
        ▼
   APPROVAL WORKFLOW
   (if required)
        │
        ▼
   MARK PAID
        │
        ▼
   SYNC TO QUICKBOOKS
```

### 4.4 Draw Flow

```
   SELECT JOB
       │
       ▼
   BUDGET LINES
   (with completion %)
       │
       ▼
   CALCULATE AMOUNTS
   - Previous billed
   - Current period
   - Retainage
       │
       ▼
   CREATE DRAW
       │
       ├──► Include invoices (optional)
       │
       ▼
   GENERATE G702/G703
       │
       ▼
   SEND TO CLIENT
   (via portal or export)
       │
       ▼
   CLIENT APPROVAL
       │
       ▼
   RECORD PAYMENT
```

### 4.5 Schedule to Daily Log Flow

```
   SCHEDULE
       │
       ▼
   TASKS (timeline)
       │
       ├──► Assigned to Vendor
       │
       ▼
   DAILY LOG
       │
       ├──► Weather
       ├──► Crew/Labor hours
       ├──► Work performed
       ├──► Photos
       └──► Issues/Notes
```

---

## 5. Database Schema

### 5.1 Core Tables

```sql
-- Company (multi-tenant root)
companies (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
)

-- Users
users (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'user', -- admin, manager, user, field
  avatar_url text,
  created_at timestamptz DEFAULT now()
)

-- Cost Codes (CSI format)
cost_codes (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  code text NOT NULL,           -- e.g., "03-00-00"
  name text NOT NULL,           -- e.g., "Concrete"
  division text,                -- e.g., "03"
  category text,                -- labor, material, subcontractor, equipment
  is_active boolean DEFAULT true,
  UNIQUE(company_id, code)
)

-- Vendors
vendors (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  name text NOT NULL,
  trade text,                   -- e.g., "Electrician"
  email text,
  phone text,
  address text,
  tax_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)

-- Clients
clients (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  portal_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)
```

### 5.2 Jobs

```sql
-- Jobs (central entity)
jobs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  client_id uuid REFERENCES clients,

  -- Basic info
  name text NOT NULL,           -- e.g., "Smith Residence"
  job_number text,              -- e.g., "2024-015"
  address text,
  city text,
  state text,
  zip text,

  -- Status tracking
  status text DEFAULT 'pre_construction', -- pre_construction, active, on_hold, completed, warranty, cancelled
  phase text DEFAULT 'pre_construction', -- pre_construction, construction, closeout

  -- Contract details
  contract_amount decimal(12,2),
  start_date date,
  target_completion date,
  actual_completion date,

  -- Calculated fields (updated by triggers)
  budget_total decimal(12,2) DEFAULT 0,
  invoiced_total decimal(12,2) DEFAULT 0,
  paid_total decimal(12,2) DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Job Assignments (team members assigned to jobs)
job_assignments (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  user_id uuid REFERENCES users NOT NULL,
  role text,                    -- PM, Superintendent, Estimator, Accountant
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES users,

  UNIQUE(job_id, user_id)
)
```

### 5.3 Pre-Construction

```sql
-- Leads
leads (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  client_id uuid REFERENCES clients,

  source text,                  -- referral, website, etc.
  status text DEFAULT 'new',    -- new, contacted, qualified, converted, lost
  project_type text,            -- new_construction, renovation, addition
  description text,
  estimated_value decimal(12,2),

  created_at timestamptz DEFAULT now()
)

-- Estimates (created within jobs, not leads)
estimates (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,  -- estimates belong to jobs

  name text NOT NULL,
  status text DEFAULT 'draft',  -- draft, sent, accepted, rejected
  version integer DEFAULT 1,

  subtotal decimal(12,2) DEFAULT 0,
  markup_percent decimal(5,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,

  created_at timestamptz DEFAULT now()
)

-- Estimate Lines
estimate_lines (
  id uuid PRIMARY KEY,
  estimate_id uuid REFERENCES estimates NOT NULL,
  cost_code_id uuid REFERENCES cost_codes,

  description text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  unit text,                    -- ea, sf, lf, hr, etc.
  unit_cost decimal(10,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,
  category text,                -- labor, material, subcontractor

  sort_order integer DEFAULT 0
)

-- Proposals (client-facing)
proposals (
  id uuid PRIMARY KEY,
  estimate_id uuid REFERENCES estimates NOT NULL,

  status text DEFAULT 'draft',  -- draft, sent, viewed, signed
  sent_at timestamptz,
  signed_at timestamptz,

  -- Custom content
  introduction text,
  scope text,
  terms text,

  created_at timestamptz DEFAULT now()
)

-- Contracts
contracts (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  proposal_id uuid REFERENCES proposals,

  contract_type text,           -- fixed_price, cost_plus, time_materials
  amount decimal(12,2),
  signed_date date,
  start_date date,

  document_url text,            -- signed PDF

  created_at timestamptz DEFAULT now()
)

-- Selections (allowances)
selections (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  cost_code_id uuid REFERENCES cost_codes,
  vendor_id uuid REFERENCES vendors,

  category text,                -- flooring, fixtures, appliances, etc.
  name text NOT NULL,
  description text,

  allowance_amount decimal(10,2),    -- budgeted
  selected_amount decimal(10,2),     -- actual selection
  variance decimal(10,2),            -- difference

  status text DEFAULT 'pending',     -- pending, selected, approved, ordered
  selected_at timestamptz,

  created_at timestamptz DEFAULT now()
)
```

### 5.4 Budget

```sql
-- Budget (job financial plan)
budgets (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL UNIQUE,

  -- Totals (calculated from lines)
  original_amount decimal(12,2) DEFAULT 0,
  revised_amount decimal(12,2) DEFAULT 0,  -- after change orders
  committed_amount decimal(12,2) DEFAULT 0, -- POs
  invoiced_amount decimal(12,2) DEFAULT 0,
  paid_amount decimal(12,2) DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Budget Lines
budget_lines (
  id uuid PRIMARY KEY,
  budget_id uuid REFERENCES budgets NOT NULL,
  cost_code_id uuid REFERENCES cost_codes NOT NULL,

  description text,

  -- Amounts
  original_amount decimal(12,2) DEFAULT 0,  -- from estimate
  change_order_amount decimal(12,2) DEFAULT 0,
  revised_amount decimal(12,2) DEFAULT 0,   -- original + COs
  committed_amount decimal(12,2) DEFAULT 0, -- POs
  invoiced_amount decimal(12,2) DEFAULT 0,
  paid_amount decimal(12,2) DEFAULT 0,

  -- Draw tracking
  percent_complete decimal(5,2) DEFAULT 0,
  previous_billed decimal(12,2) DEFAULT 0,
  current_billed decimal(12,2) DEFAULT 0,
  retainage_held decimal(12,2) DEFAULT 0,

  UNIQUE(budget_id, cost_code_id)
)
```

### 5.5 Financial - Purchase Orders

```sql
-- Purchase Orders
purchase_orders (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  vendor_id uuid REFERENCES vendors NOT NULL,

  po_number text,
  description text,

  status text DEFAULT 'draft',  -- draft, sent, acknowledged, completed, cancelled

  subtotal decimal(12,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,

  issue_date date,
  expected_date date,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)

-- PO Line Items
po_line_items (
  id uuid PRIMARY KEY,
  purchase_order_id uuid REFERENCES purchase_orders NOT NULL,
  cost_code_id uuid REFERENCES cost_codes,
  budget_line_id uuid REFERENCES budget_lines,

  description text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  unit text,
  unit_cost decimal(10,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,

  sort_order integer DEFAULT 0
)
```

### 5.6 Financial - Invoices

```sql
-- Invoices
invoices (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs,
  vendor_id uuid REFERENCES vendors,
  purchase_order_id uuid REFERENCES purchase_orders,

  invoice_number text,
  invoice_date date,
  due_date date,
  received_date date DEFAULT CURRENT_DATE,

  status text DEFAULT 'received', -- received, needs_review, approved, rejected, in_draw, paid

  subtotal decimal(12,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(12,2) DEFAULT 0,
  amount_paid decimal(12,2) DEFAULT 0,

  -- AI processing
  pdf_url text,
  ai_extracted boolean DEFAULT false,
  ai_confidence decimal(3,2),

  notes text,

  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES users,
  rejected_at timestamptz,
  rejected_by uuid REFERENCES users,
  rejection_reason text,
  paid_at timestamptz
)

-- Invoice Allocations (cost code breakdown)
invoice_allocations (
  id uuid PRIMARY KEY,
  invoice_id uuid REFERENCES invoices NOT NULL,
  cost_code_id uuid REFERENCES cost_codes NOT NULL,
  budget_line_id uuid REFERENCES budget_lines,

  description text,
  amount decimal(12,2) NOT NULL,

  UNIQUE(invoice_id, cost_code_id)
)
```

### 5.7 Financial - Draws

```sql
-- Draws (pay applications)
draws (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,

  draw_number integer NOT NULL,
  period_to date,

  status text DEFAULT 'draft', -- draft, submitted, approved, rejected, paid

  -- Amounts
  scheduled_value decimal(12,2) DEFAULT 0,
  previous_completed decimal(12,2) DEFAULT 0,
  current_completed decimal(12,2) DEFAULT 0,
  total_completed decimal(12,2) DEFAULT 0,
  retainage_percent decimal(5,2) DEFAULT 10,
  retainage_amount decimal(12,2) DEFAULT 0,
  current_payment_due decimal(12,2) DEFAULT 0,

  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES users,
  rejected_at timestamptz,
  rejected_by uuid REFERENCES users,
  rejection_reason text,
  paid_at timestamptz,

  created_at timestamptz DEFAULT now(),

  UNIQUE(job_id, draw_number)
)

-- Draw Lines
draw_lines (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws NOT NULL,
  budget_line_id uuid REFERENCES budget_lines NOT NULL,

  scheduled_value decimal(12,2) DEFAULT 0,
  previous_completed decimal(12,2) DEFAULT 0,
  current_completed decimal(12,2) DEFAULT 0,
  percent_complete decimal(5,2) DEFAULT 0,
  retainage decimal(12,2) DEFAULT 0,

  UNIQUE(draw_id, budget_line_id)
)

-- Draw-Invoice Links
draw_invoices (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws NOT NULL,
  invoice_id uuid REFERENCES invoices NOT NULL,

  UNIQUE(draw_id, invoice_id)
)
```

### 5.8 Financial - Change Orders

```sql
-- Change Orders
change_orders (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,

  co_number integer NOT NULL,
  title text NOT NULL,
  description text,

  status text DEFAULT 'draft', -- draft, pending, approved, rejected

  amount decimal(12,2) DEFAULT 0,
  days_impact integer DEFAULT 0, -- schedule impact

  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES users,

  created_at timestamptz DEFAULT now(),

  UNIQUE(job_id, co_number)
)

-- Change Order Lines
change_order_lines (
  id uuid PRIMARY KEY,
  change_order_id uuid REFERENCES change_orders NOT NULL,
  cost_code_id uuid REFERENCES cost_codes NOT NULL,
  budget_line_id uuid REFERENCES budget_lines,

  description text NOT NULL,
  amount decimal(12,2) NOT NULL, -- positive = add, negative = deduct

  sort_order integer DEFAULT 0
)
```

### 5.9 Schedule

```sql
-- Tasks (schedule items)
tasks (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  budget_line_id uuid REFERENCES budget_lines,
  vendor_id uuid REFERENCES vendors,
  parent_task_id uuid REFERENCES tasks, -- for subtasks

  name text NOT NULL,
  description text,

  status text DEFAULT 'not_started', -- not_started, in_progress, completed, blocked
  priority text DEFAULT 'normal',    -- low, normal, high, critical

  start_date date,
  end_date date,
  duration_days integer,

  percent_complete decimal(5,2) DEFAULT 0,

  sort_order integer DEFAULT 0,

  created_at timestamptz DEFAULT now()
)

-- Task Dependencies
task_dependencies (
  id uuid PRIMARY KEY,
  task_id uuid REFERENCES tasks NOT NULL,
  depends_on_task_id uuid REFERENCES tasks NOT NULL,
  dependency_type text DEFAULT 'finish_to_start', -- FS, SS, FF, SF

  UNIQUE(task_id, depends_on_task_id)
)
```

### 5.10 Field Operations

```sql
-- Daily Logs
daily_logs (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,

  log_date date NOT NULL,

  -- Weather
  weather_condition text,       -- sunny, cloudy, rain, etc.
  temperature_high integer,
  temperature_low integer,

  -- Summary
  work_performed text,
  notes text,
  issues text,

  created_by uuid REFERENCES users,
  created_at timestamptz DEFAULT now(),

  UNIQUE(job_id, log_date)
)

-- Daily Log Labor
daily_log_labor (
  id uuid PRIMARY KEY,
  daily_log_id uuid REFERENCES daily_logs NOT NULL,
  vendor_id uuid REFERENCES vendors,

  trade text,
  workers integer DEFAULT 1,
  hours decimal(4,1),
  description text
)

-- Photos
photos (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  daily_log_id uuid REFERENCES daily_logs,

  url text NOT NULL,
  thumbnail_url text,
  caption text,
  location text,               -- where in the project

  taken_at timestamptz,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users
)
```

### 5.11 Closeout

```sql
-- Punch Lists
punch_lists (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,

  name text DEFAULT 'Main Punch List',
  created_at timestamptz DEFAULT now()
)

-- Punch Items
punch_items (
  id uuid PRIMARY KEY,
  punch_list_id uuid REFERENCES punch_lists NOT NULL,
  vendor_id uuid REFERENCES vendors,

  description text NOT NULL,
  location text,
  priority text DEFAULT 'normal', -- low, normal, high
  status text DEFAULT 'open',     -- open, in_progress, completed

  due_date date,
  completed_at timestamptz,
  completed_by uuid REFERENCES users,

  created_at timestamptz DEFAULT now()
)

-- Punch Item Photos
punch_item_photos (
  id uuid PRIMARY KEY,
  punch_item_id uuid REFERENCES punch_items NOT NULL,
  photo_id uuid REFERENCES photos NOT NULL,
  photo_type text DEFAULT 'issue', -- issue, completed

  UNIQUE(punch_item_id, photo_id)
)

-- Final Documents
final_docs (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,

  name text NOT NULL,
  category text,               -- warranty, manual, certificate, as_built
  url text NOT NULL,

  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users
)

-- Warranties
warranties (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  vendor_id uuid REFERENCES vendors,

  item text NOT NULL,          -- what's covered
  description text,

  start_date date,
  end_date date,
  duration_years integer,

  document_url text,

  created_at timestamptz DEFAULT now()
)
```

### 5.12 System Tables

```sql
-- Activity Log (audit trail)
activity_logs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  user_id uuid REFERENCES users,

  entity_type text NOT NULL,   -- job, invoice, po, etc.
  entity_id uuid NOT NULL,
  action text NOT NULL,        -- create, update, delete, status_change

  changes jsonb,               -- what changed

  created_at timestamptz DEFAULT now()
)

-- Portal Users (client portal authentication, separate from admin users)
portal_users (
  id uuid PRIMARY KEY,
  client_id uuid REFERENCES clients NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text,
  name text,
  phone text,

  last_login timestamptz,
  is_active boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  invited_at timestamptz,
  invited_by uuid REFERENCES users
)

-- Folders (for file organization)
folders (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  parent_folder_id uuid REFERENCES folders,  -- for nested folders

  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,           -- system folders can't be deleted
  system_type text,                          -- contracts, permits, plans, etc.
  portal_visible boolean DEFAULT false,      -- show in client portal

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users,

  UNIQUE(job_id, parent_folder_id, name)
)

-- Files (general uploads)
files (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs,
  folder_id uuid REFERENCES folders,

  name text NOT NULL,
  description text,

  -- Storage
  storage_path text NOT NULL,                -- Supabase storage path
  url text,                                  -- Cached signed URL
  thumbnail_url text,                        -- For images/PDFs

  -- Metadata
  size_bytes bigint,
  mime_type text,
  file_extension text,

  -- Versioning
  version integer DEFAULT 1,
  previous_version_id uuid REFERENCES files,
  is_current boolean DEFAULT true,

  -- Sharing
  portal_visible boolean DEFAULT false,

  -- Entity linking (optional)
  entity_type text,                          -- contract, submittal, rfi, vendor, etc.
  entity_id uuid,

  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users
)

-- File Share Links
file_shares (
  id uuid PRIMARY KEY,
  file_id uuid REFERENCES files NOT NULL,

  share_token text UNIQUE NOT NULL,
  expires_at timestamptz,
  password_hash text,                        -- optional password protection

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users,

  access_count integer DEFAULT 0,
  last_accessed_at timestamptz
)

-- Notifications
notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users NOT NULL,

  type text NOT NULL,          -- invoice_pending, draw_approved, etc.
  title text NOT NULL,
  message text,

  entity_type text,
  entity_id uuid,

  read boolean DEFAULT false,
  read_at timestamptz,

  created_at timestamptz DEFAULT now()
)
```

### 5.13 Integration Tables

```sql
-- QuickBooks Connection
qb_connection (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL UNIQUE,
  qb_realm_id text NOT NULL,        -- QuickBooks company ID
  access_token text NOT NULL,       -- Encrypted
  refresh_token text NOT NULL,      -- Encrypted
  token_expires_at timestamptz,

  connected_at timestamptz DEFAULT now(),
  connected_by uuid REFERENCES users
)

-- QuickBooks Sync Log
qb_sync_log (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,

  sync_type text NOT NULL,          -- scheduled, manual
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'running',    -- running, success, warning, error

  entities_synced integer DEFAULT 0,
  errors jsonb                      -- Error details
)

-- QuickBooks Entity Map (CMS ↔ QB ID mapping)
qb_entity_map (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,

  entity_type text NOT NULL,        -- vendor, client, job, invoice, draw
  cms_id uuid NOT NULL,             -- Our entity ID
  qb_id text NOT NULL,              -- QuickBooks entity ID

  last_synced_at timestamptz,
  sync_direction text,              -- push, pull, both

  UNIQUE(company_id, entity_type, cms_id)
)
```

---

## 6. API Structure

### 6.1 API Design Principles

- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Pagination for list endpoints
- Filtering and sorting support
- Supabase RLS for authorization

### 6.2 Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/signup` | POST | Register new user |
| `/auth/login` | POST | Login with email/password |
| `/auth/logout` | POST | Logout current session |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password` | POST | Reset password with token |
| `/auth/me` | GET | Get current user |

### 6.3 Core Resources

**Jobs**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs` | GET | List jobs (with filters) |
| `/jobs` | POST | Create job |
| `/jobs/:id` | GET | Get job details |
| `/jobs/:id` | PATCH | Update job |
| `/jobs/:id` | DELETE | Archive job |
| `/jobs/:id/budget` | GET | Get job budget |
| `/jobs/:id/financial-summary` | GET | Get financial overview |

**Vendors**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/vendors` | GET | List vendors |
| `/vendors` | POST | Create vendor |
| `/vendors/:id` | GET | Get vendor |
| `/vendors/:id` | PATCH | Update vendor |
| `/vendors/:id/invoices` | GET | Vendor's invoices |

**Clients**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/clients` | GET | List clients |
| `/clients` | POST | Create client |
| `/clients/:id` | GET | Get client |
| `/clients/:id` | PATCH | Update client |
| `/clients/:id/jobs` | GET | Client's jobs |

**Cost Codes**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cost-codes` | GET | List cost codes |
| `/cost-codes` | POST | Create cost code |
| `/cost-codes/:id` | PATCH | Update cost code |
| `/cost-codes/import` | POST | Import from template |

### 6.4 Financial Resources

**Invoices**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/invoices` | GET | List invoices |
| `/invoices` | POST | Create invoice |
| `/invoices/:id` | GET | Get invoice |
| `/invoices/:id` | PATCH | Update invoice |
| `/invoices/:id/allocations` | GET | Get allocations |
| `/invoices/:id/allocations` | PUT | Set allocations |
| `/invoices/:id/approve` | POST | Approve invoice |
| `/invoices/:id/pay` | POST | Mark as paid |
| `/invoices/upload` | POST | Upload PDF for AI processing |

**Purchase Orders**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/purchase-orders` | GET | List POs |
| `/purchase-orders` | POST | Create PO |
| `/purchase-orders/:id` | GET | Get PO |
| `/purchase-orders/:id` | PATCH | Update PO |
| `/purchase-orders/:id/send` | POST | Send to vendor |

**Draws**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/draws` | GET | List draws |
| `/draws` | POST | Create draw |
| `/draws/:id` | GET | Get draw |
| `/draws/:id` | PATCH | Update draw |
| `/draws/:id/submit` | POST | Submit to client |
| `/draws/:id/approve` | POST | Approve draw |
| `/draws/:id/pdf` | GET | Generate G702/G703 PDF |

**Change Orders**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/change-orders` | GET | List change orders |
| `/change-orders` | POST | Create change order |
| `/change-orders/:id` | GET | Get change order |
| `/change-orders/:id` | PATCH | Update change order |
| `/change-orders/:id/approve` | POST | Approve CO |

### 6.5 Pre-Construction Resources

**Leads**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/leads` | GET | List leads |
| `/leads` | POST | Create lead |
| `/leads/:id` | GET | Get lead |
| `/leads/:id` | PATCH | Update lead |
| `/leads/:id/convert` | POST | Convert to job |

**Estimates**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/estimates` | GET | List estimates |
| `/estimates` | POST | Create estimate |
| `/estimates/:id` | GET | Get estimate |
| `/estimates/:id` | PATCH | Update estimate |
| `/estimates/:id/lines` | GET | Get estimate lines |
| `/estimates/:id/lines` | POST | Add line |
| `/estimates/:id/lines/:lineId` | PATCH | Update line |
| `/estimates/:id/duplicate` | POST | Duplicate estimate |
| `/estimates/:id/to-budget` | POST | Create budget from estimate |

**Proposals**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/proposals` | GET | List proposals |
| `/proposals` | POST | Create proposal |
| `/proposals/:id` | GET | Get proposal |
| `/proposals/:id/send` | POST | Send to client |
| `/proposals/:id/pdf` | GET | Generate PDF |

**Contracts**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/contracts` | GET | List contracts |
| `/contracts` | POST | Create contract |
| `/contracts/:id` | GET | Get contract |
| `/contracts/:id/sign` | POST | Record signature |

**Selections**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/selections` | GET | List job selections |
| `/jobs/:id/selections` | POST | Create selection |
| `/selections/:id` | PATCH | Update selection |
| `/selections/:id/select` | POST | Record client selection |

### 6.6 Schedule Resources

**Tasks**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/tasks` | GET | List job tasks |
| `/jobs/:id/tasks` | POST | Create task |
| `/tasks/:id` | GET | Get task |
| `/tasks/:id` | PATCH | Update task |
| `/tasks/:id/complete` | POST | Mark complete |

**Daily Logs**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/daily-logs` | GET | List job logs |
| `/jobs/:id/daily-logs` | POST | Create log |
| `/daily-logs/:id` | GET | Get log |
| `/daily-logs/:id` | PATCH | Update log |
| `/daily-logs/:id/labor` | POST | Add labor entry |

**Photos**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/photos` | GET | List job photos |
| `/jobs/:id/photos` | POST | Upload photo |
| `/photos/:id` | GET | Get photo |
| `/photos/:id` | PATCH | Update caption |
| `/photos/:id` | DELETE | Delete photo |

### 6.7 Closeout Resources

**Punch Lists**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/punch-list` | GET | Get punch list |
| `/jobs/:id/punch-list/items` | GET | List punch items |
| `/jobs/:id/punch-list/items` | POST | Add punch item |
| `/punch-items/:id` | PATCH | Update item |
| `/punch-items/:id/complete` | POST | Mark complete |

**Warranties**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/warranties` | GET | List warranties |
| `/jobs/:id/warranties` | POST | Add warranty |
| `/warranties/:id` | PATCH | Update warranty |

### 6.8 Reports & Analytics

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/reports/profitability` | GET | Job profitability report |
| `/reports/budget-variance` | GET | Budget vs actual |
| `/reports/cash-flow` | GET | Cash flow projection |
| `/reports/pnl` | GET | Company P&L |

### 6.9 Integrations

**QuickBooks**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/integrations/quickbooks/connect` | GET | Initiate OAuth |
| `/integrations/quickbooks/callback` | GET | OAuth callback |
| `/integrations/quickbooks/disconnect` | POST | Disconnect |
| `/integrations/quickbooks/sync` | POST | Trigger sync |
| `/integrations/quickbooks/status` | GET | Sync status |

### 6.10 AI Processing

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai/process-invoice` | POST | Extract data from PDF |
| `/ai/match-vendor` | POST | Find matching vendor |
| `/ai/suggest-allocations` | POST | Suggest cost code allocations |

---

## 7. UI Component Architecture

### 7.1 Layout Components

```
AppLayout
├── Sidebar (navigation)
├── Header (breadcrumbs, user menu)
└── Main (page content)

PortalLayout (for clients)
├── Header (logo, navigation)
└── Main (page content)
```

### 7.2 Shared Components

| Component | Purpose |
|-----------|---------|
| `DataTable` | Sortable, filterable table with pagination |
| `FormModal` | Modal dialog for create/edit forms |
| `ConfirmDialog` | Confirmation for destructive actions |
| `StatusBadge` | Colored status indicator |
| `CurrencyInput` | Money input with formatting |
| `DatePicker` | Date selection |
| `FileUpload` | File/image upload with preview |
| `SearchSelect` | Searchable dropdown (vendor, job, etc.) |
| `EmptyState` | No data placeholder |
| `LoadingState` | Loading spinner/skeleton |
| `ErrorState` | Error message with retry |

### 7.3 Feature Components

Each feature area has its own component folder:
```
components/
├── jobs/
│   ├── JobCard.tsx
│   ├── JobForm.tsx
│   ├── JobList.tsx
│   └── JobStatusSelect.tsx
├── invoices/
│   ├── InvoiceCard.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceList.tsx
│   ├── InvoiceUpload.tsx
│   ├── AllocationEditor.tsx
│   └── ApprovalActions.tsx
├── budget/
│   ├── BudgetTable.tsx
│   ├── BudgetLineForm.tsx
│   └── VarianceChart.tsx
... etc
```

---

## 8. Security Model

### 8.1 Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access data from their company
- Role-based access (admin, manager, user, field)
- Client portal users can only see their jobs

### 8.2 RLS Policy Examples

```sql
-- Company data isolation
CREATE POLICY "Users can only see their company data"
ON jobs FOR ALL
USING (company_id = auth.jwt() -> 'user_metadata' ->> 'company_id');

-- Role-based write access
CREATE POLICY "Only admins can delete"
ON jobs FOR DELETE
USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);
```

### 8.3 API Security

- All API routes require valid JWT (except auth routes)
- Supabase handles JWT validation
- Additional authorization checks for sensitive operations
- Rate limiting on AI and file upload endpoints

---

## 9. Implementation Order

### Phase 1: Foundation
1. Set up Next.js project with TypeScript
2. Configure Supabase (database, auth, storage)
3. Create core database tables (companies, users, cost_codes, vendors, clients)
4. Implement authentication flow
5. Create app layout and navigation
6. Build settings pages (company, users, cost codes)

### Phase 2: Jobs + Budget
1. Jobs CRUD and list page
2. Job detail page with tabs
3. Budget table with lines
4. Budget from estimate conversion
5. Budget variance calculations

### Phase 3: Invoice Flow
1. Invoice list and filtering
2. Invoice upload with AI extraction
3. Invoice review/edit form
4. Cost code allocation
5. Approval workflow
6. Payment tracking

### Phase 4: POs + Draws
1. Purchase order CRUD
2. PO line items with budget links
3. PO to invoice matching
4. Draw creation from budget
5. Draw line editing
6. G702/G703 PDF generation

### Phase 5: Schedule + Field
1. Task CRUD on job schedule
2. Gantt/timeline visualization
3. Daily log entry
4. Photo upload and gallery
5. Change order workflow

### Phase 6: Pre-Construction
1. Lead pipeline
2. Estimate builder
3. Proposal generation
4. Contract management
5. Selections/allowances

### Phase 7: Financial + Reports
1. QuickBooks OAuth integration
2. Data sync (vendors, invoices, payments)
3. Profitability report
4. Budget variance report
5. Cash flow projection
6. P&L dashboard

### Phase 8: Client Portal
1. Portal authentication (separate from main app)
2. Job overview for clients
3. Photo viewing
4. Selection approval
5. Draw viewing

### Phase 9: Closeout
1. Punch list management
2. Final document uploads
3. Warranty tracking

---

## 10. Success Criteria

Before launching each phase, verify:

1. **Data Integrity**: All relationships work correctly
2. **User Flow**: Complete workflow functions end-to-end
3. **Security**: RLS policies tested
4. **Performance**: List pages load quickly
5. **Mobile**: Critical pages work on mobile

---

*Document created: 2024*
*This is the authoritative design document for the Ross Built CMS rebuild.*
