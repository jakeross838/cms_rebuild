# RossOS - Complete System Design

## Proven Patterns from v1

### v1 Reference
The existing CMS at C:\Users\jaker\Construction-Management-Software has 105 route files (~1,581 endpoints), 199 database migrations, 59 client pages, 235 components, and 158 passing tests. Key services include: invoice-helpers.js (27KB), variance-detector.js (40KB), document-intelligence.js (24KB), proposal-generator.js (14KB), schedule-pdf-generator.js (15KB), contract-pdf-generator.js (14KB), notifications.js (17KB), reconciliation.js (17KB), weather.js (12KB), slack.js (17KB).

---

## Overview

This document defines the complete system architecture for the RossOS Construction Management Platform rebuild. Every entity, page, data flow, and API endpoint is documented here to ensure all features are properly connected from the start.

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
| **RFI** | Request for Information | Job | → Change Order |
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
   PO     INVOICE      RFI
    │         │         │
    │    ┌────┘         ▼
    │    │         CHANGE ORDER
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

## 11. Technology Edge Cases

This section specifies system behavior for 20 technology edge cases that affect construction teams in the field and office. Each item defines the problem, the system response, and the implementation approach.

### GAP-826: System Access During Multi-Day Power Outage — Mobile Offline

**Problem:** A hurricane, ice storm, or infrastructure failure knocks out power for 2-5 days. Office servers and wifi are down. Field teams still need to log work, take photos, and check schedules.

**System Behavior:**

- The Progressive Web App (PWA) caches the following data locally on the device using IndexedDB:
  - Active job list with current status, address, and key contacts
  - Schedule/tasks for the next 14 days
  - Budget summary (not line-level detail) for active jobs
  - Last 30 daily log templates
  - Vendor contact directory
  - Cost code list

- **Offline write capabilities:**
  - Create daily logs (text, weather, crew count)
  - Capture photos (stored in device storage, queued for upload)
  - Update task status (not_started → in_progress → completed)
  - Create punch list items with photos
  - Record time entries

- **Sync on reconnection:**
  - When connectivity returns, the app detects network availability and begins background sync.
  - Queued items are synced in chronological order.
  - Conflicts (e.g., another user updated the same task while offline) are resolved with "last write wins" for status fields and "merge" for text fields (both versions preserved with timestamps).
  - A sync summary notification shows: "Synced X daily logs, Y photos, Z task updates. 2 conflicts resolved (tap to review)."

- **Storage limits:**
  - Photos are compressed to max 2MB each before local storage.
  - Maximum local cache: 500MB. When approaching limit, oldest cached data (read-only reference data) is evicted first. User-created offline data is never evicted.

**Implementation:** Service worker with Workbox for caching strategy. IndexedDB via Dexie.js for structured offline data. Background Sync API for queued writes.

---

### GAP-827: Photo Metadata Discrepancies — Camera Time vs. Phone Time vs. Server Time

**Problem:** A photo taken with a standalone camera has EXIF timestamp in the wrong timezone. A phone photo has the correct local time but no timezone info. The server records UTC. Three different "times" for the same photo create confusion in daily logs and disputes.

**System Behavior:**

- **Three timestamps stored per photo:**
  ```sql
  photos (
    ...
    exif_timestamp timestamptz,        -- raw EXIF data, may be null or wrong
    device_timestamp timestamptz,      -- phone/browser local time at capture
    server_timestamp timestamptz,      -- server receipt time (always UTC)
    canonical_timestamp timestamptz,   -- the "official" time used for sorting and display
    timestamp_source text,             -- 'exif', 'device', 'server', 'manual'
  )
  ```

- **Resolution logic (executed at upload):**
  1. Extract EXIF timestamp if present.
  2. Compare EXIF to device time. If within 5 minutes, use EXIF (more precise for camera models).
  3. If EXIF differs by > 5 minutes, use device time and flag: "Photo EXIF time differs from upload time by [X hours]. Using device time."
  4. If no EXIF data, use device time.
  5. If device time is clearly wrong (e.g., year 1970, or > 24 hours from server time), use server time and flag for manual review.

- **Manual override:** User can edit `canonical_timestamp` on any photo. The change is logged in the activity trail.

- **Display:** All photo timestamps display in the job's timezone (derived from job address). Hover shows all three timestamps for transparency.

---

### GAP-828: Large Plan Set Rendering on Mobile — Progressive Loading

**Problem:** A 200-page architectural plan set (PDF, 500MB+) cannot be loaded into memory on a mobile device. Even individual sheets at high resolution (36"x24" at 300 DPI) are 30-50MB each.

**System Behavior:**

- **Upload processing pipeline:**
  1. On upload, the server extracts each page as a separate entity.
  2. Each page is rendered at three resolutions:
     - Thumbnail: 200px wide (for page list/grid view)
     - Screen: 1500px wide (for on-screen viewing and markup)
     - Full: original resolution (for printing and detail zoom)
  3. Tiled rendering: the full-resolution image is split into 512x512px tiles (like map tiles) for progressive zoom.

- **Mobile viewing behavior:**
  - Plan list shows thumbnails only. Tapping a page loads the screen-resolution version.
  - Pinch-to-zoom loads tiles at higher resolution on demand (only the visible area).
  - Maximum memory budget: 150MB per viewing session. Pages viewed previously are released from memory.

- **DWG/CAD file handling:**
  - DWG files are converted server-side to PDF + SVG on upload using a headless CAD renderer.
  - SVG version enables text search within plans.
  - Original DWG preserved for download by users who need it.

- **Offline plans:** Users can "download for offline" specific plan sheets (screen resolution). Downloaded sheets are stored in the app cache and available without connectivity.

**Implementation:** PDF.js for browser rendering. Sharp (Node.js) for server-side image processing. Tile generation with custom slicing pipeline. Lazy loading with Intersection Observer.

---

### GAP-829: Field Connectivity — Dead Zones and Offline Mode

**Problem:** Construction sites frequently have poor cellular coverage: basements, rural areas, concrete structures blocking signal. Users need to continue working seamlessly.

**System Behavior:**

- **Connection state detection:**
  - The app monitors connection quality continuously (not just online/offline, but also "slow" defined as RTT > 3 seconds).
  - Status indicator in the app header: green dot (online), amber dot (slow), red dot (offline).

- **Graceful degradation by connection state:**

  | Feature | Online | Slow | Offline |
  |---------|--------|------|---------|
  | View cached data | Full | Full | Full |
  | Create daily log | Save to server | Queue, confirm later | Queue locally |
  | Upload photos | Immediate | Queue, upload when fast | Queue locally |
  | View plan sets | Full resolution | Screen resolution only | Cached sheets only |
  | Real-time notifications | Live | Polling every 60s | None (sync on reconnect) |
  | Search | Server search | Local cache search | Local cache search |
  | Financial data entry | Full | Full (queued) | Read-only |

- **Financial data is read-only offline** because concurrent edits to invoices, budgets, or draws create unresolvable conflicts. Users see: "Financial editing requires an internet connection. Your current budget data was last synced [timestamp]."

- **Automatic retry:** Queued operations retry with exponential backoff (5s, 15s, 45s, 2min, 5min). After 5 failures, the operation is marked "pending manual sync" and the user is notified.

---

### GAP-830: Device Diversity — Old iPads, Cheap Androids, Graceful Degradation

**Problem:** Field workers use whatever device they have: iPad Air 2 (2014), $150 Android phones, older iPhones with cracked screens. The app must work on all of them.

**System Behavior:**

- **Minimum supported devices:**
  - iOS: iPhone 8 / iPad Air 2 and newer (iOS 15+)
  - Android: devices with 2GB+ RAM, Android 10+
  - Chrome 90+, Safari 15+, Firefox 100+, Edge 90+

- **Performance budgets:**
  - Initial page load: < 3 seconds on Fast 3G
  - Time to interactive: < 5 seconds on Fast 3G
  - JavaScript bundle: < 300KB gzipped (initial load)
  - Memory usage: < 200MB active

- **Degradation strategy by device capability:**

  | Capability | High-end | Mid-range | Low-end |
  |-----------|----------|-----------|---------|
  | Animations | Full (transitions, skeleton loaders) | Reduced (fade only) | None |
  | Image quality | Full resolution thumbnails | Compressed thumbnails | Text-only lists |
  | Charts/graphs | Interactive (Chart.js) | Static images | Data tables |
  | Plan viewer | Tiled zoom | Single-resolution | Download PDF link |
  | List rendering | Virtual scroll (all items) | Virtual scroll (all items) | Paginated (50 items/page) |

- **Device capability detection:** On first load, the app runs a 100ms benchmark (render 1000 DOM nodes, measure time). Results are cached and used to select the appropriate rendering tier.

- **Touch targets:** All interactive elements are minimum 44x44px (iOS HIG) regardless of device tier. This accommodates work gloves and cracked screens.

---

### GAP-831: Browser Compatibility — Chrome, Safari, Firefox, Edge

**Problem:** Different browsers render CSS differently, handle PWA features differently, and have different JavaScript engine behaviors.

**System Behavior:**

- **Primary browser (90% of testing):** Chrome (desktop + mobile)
- **Full support:** Safari (macOS + iOS), Firefox (desktop), Edge (desktop)
- **Graceful degradation:** Samsung Internet, UC Browser (basic functionality, no PWA features)

- **Known browser-specific handling:**

  | Feature | Chrome | Safari | Firefox | Edge |
  |---------|--------|--------|---------|------|
  | PWA install | Full | Home screen shortcut (limited) | Not supported | Full |
  | Push notifications | Full | iOS 16.4+ only | Full | Full |
  | Background sync | Full | Not supported; use periodic sync | Not supported; use visibility event | Full |
  | File System Access API | Full | Not supported; use input[type=file] | Not supported; use input[type=file] | Full |
  | PDF rendering | PDF.js | Native PDF viewer fallback | PDF.js | PDF.js |

- **CSS strategy:** Tailwind CSS handles cross-browser prefixing. All custom CSS uses `@supports` queries for progressive enhancement. No reliance on features without fallbacks.

- **Testing:** Playwright E2E tests run against Chrome, Firefox, and WebKit (Safari equivalent). Browser-specific bugs are tagged in the issue tracker with `browser:safari`, `browser:firefox`, etc.

---

### GAP-832: Print Formatting — Reports and Schedules Must Print Cleanly

**Problem:** Builders print invoices, draw requests (G702/G703), schedules, and reports to hand to clients, lenders, and inspectors. Print output must be professional.

**System Behavior:**

- **Print-specific CSS:**
  - All printable pages include `@media print` styles.
  - Navigation, sidebar, and interactive controls are hidden.
  - Page breaks are controlled: tables do not split rows across pages; section headers stay with their content.
  - Headers repeat on each page (company name, report title, page number).

- **Dedicated print layouts for key documents:**

  | Document | Format | Page Size | Notes |
  |----------|--------|-----------|-------|
  | G702 Application for Payment | AIA standard | Letter (8.5"x11") | Exact AIA format with boxes and signatures |
  | G703 Continuation Sheet | AIA standard | Letter landscape | Column widths match AIA specification |
  | Invoice summary | Custom | Letter | Company logo, vendor info, line items, totals |
  | Schedule (Gantt) | Custom | Tabloid (11"x17") or letter landscape | Auto-scales to fit page width |
  | Budget report | Custom | Letter landscape | Cost code divisions with subtotals |
  | Daily log | Custom | Letter | Date, weather, crew, work performed, photos (4-up grid) |

- **PDF generation:** Server-side PDF generation using Puppeteer (headless Chrome) for pixel-perfect output. PDFs are generated on demand and cached for 1 hour.

- **Print preview:** A "Print Preview" button opens a modal showing the exact print output. User can select page size and orientation before printing.

---

### GAP-833: Email Deliverability — Notifications Not Going to Spam

**Problem:** System-generated emails (draw notifications, invoice approvals, client portal invitations) land in spam folders, especially for Gmail and Outlook.

**System Behavior:**

- **Email infrastructure:**
  - Transactional email via a dedicated service (Postmark or AWS SES) — not the application server.
  - Dedicated sending domain: `notifications.rossos.com` with proper DNS records.

- **Authentication records:**
  - SPF: `v=spf1 include:_spf.postmarkapp.com ~all`
  - DKIM: 2048-bit key, rotated annually
  - DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@rossos.com`
  - Return-Path aligned with From domain

- **Content rules:**
  - Plain text version included with every HTML email.
  - No image-only emails. All critical content is in text.
  - Unsubscribe link in footer (required by CAN-SPAM and helps reputation).
  - From address is consistent: `notifications@rossos.com` (never `noreply@`).
  - Subject lines are descriptive: "Draw #3 approved for Smith Residence — $45,200 payment due" (not "Notification from RossOS").

- **Monitoring:**
  - Track delivery rate, open rate, bounce rate, and spam complaint rate per email type.
  - Alert if spam complaint rate exceeds 0.1% for any email type.
  - Bounce handling: hard bounces immediately mark the email as invalid; soft bounces retry 3 times over 72 hours.

- **Fallback:** If email delivery fails after 3 retries, the notification appears as an in-app alert with the message: "We could not deliver an email to [address]. Please check the email address in your profile."

---

### GAP-834: Data Export Volume — 5 Years of Data Performance

**Problem:** A builder with 5 years of data may have 50,000+ invoices, 500+ jobs, 200,000+ photos, and millions of activity log entries. Exports and reports must remain performant.

**System Behavior:**

- **Export strategy by volume:**

  | Data Size | Strategy | Format |
  |-----------|----------|--------|
  | < 10,000 rows | Synchronous export | CSV or Excel, immediate download |
  | 10,000 - 100,000 rows | Background job | CSV or Excel, emailed when ready |
  | > 100,000 rows | Streamed export | CSV only, chunked download |

- **Background export flow:**
  1. User clicks "Export" and selects date range + filters.
  2. System estimates row count. If > 10,000, displays: "This export contains approximately [X] records. We will email you a download link when it is ready (usually 2-5 minutes)."
  3. Export job runs server-side, streaming results to a temporary file in Supabase Storage.
  4. Download link is emailed and also appears in the notification bell. Link expires after 24 hours.

- **Query performance:**
  - All list queries use cursor-based pagination (not OFFSET).
  - Indexes on: `company_id`, `job_id`, `vendor_id`, `status`, `created_at`, `invoice_date`, `log_date`.
  - Composite indexes for common filter combinations: `(company_id, status, created_at)`.
  - Reports with date ranges use `BETWEEN` on indexed date columns.
  - Aggregation queries (sums, counts for dashboards) use materialized views refreshed every 5 minutes.

- **Photo export:** Photos are not included in CSV/Excel exports. A separate "Export Photos" function generates a ZIP file with folder structure: `Job Name/YYYY-MM/filename.jpg`. ZIP generation is always a background job.

---

### GAP-835: API Rate Limiting for Integrations

**Problem:** Third-party integrations and misbehaving clients can overwhelm the API. QuickBooks sync, bulk imports, and API marketplace consumers need rate limiting.

**System Behavior:**

- **Rate limit tiers:**

  | Consumer | Limit | Window | Burst |
  |----------|-------|--------|-------|
  | Authenticated user (UI) | 200 requests | per minute | 20 requests/second |
  | API key (integration) | 1,000 requests | per minute | 50 requests/second |
  | QuickBooks sync | 500 requests | per minute | 30 requests/second |
  | Unauthenticated | 20 requests | per minute | 5 requests/second |
  | AI processing endpoints | 60 requests | per hour per company | 5 requests/minute |

- **Implementation:**
  - Token bucket algorithm using Redis.
  - Rate limit headers on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
  - When limit exceeded: HTTP 429 with `Retry-After` header and JSON body: `{"error": "rate_limit_exceeded", "retry_after_seconds": 30}`.

- **Per-company limits:** Each company has an aggregate limit across all users. This prevents a single company with 50 users from consuming disproportionate resources. Company limit = per-user limit * 10 (not * number of users).

- **AI endpoint special handling:** AI invoice processing is expensive. Limits are per company per hour. Exceeding the limit returns: "AI processing limit reached. You can process [X] more documents after [time]. Upgrade to Enterprise for higher limits."

---

### GAP-836: File Format Handling — PDFs, DWGs, Excel, Images, Videos

**Problem:** Construction generates diverse file types. The system must handle them all gracefully, even formats it cannot render directly.

**System Behavior:**

- **Supported formats and handling:**

  | Format | Preview | Thumbnail | Text Search | Convert |
  |--------|---------|-----------|-------------|---------|
  | PDF | In-browser (PDF.js) | Auto-generated | Extracted via OCR | — |
  | JPG/PNG/WebP | In-browser | Auto-generated | — | — |
  | HEIC (iPhone) | Convert to JPG | Auto-generated | — | Server-side to JPG |
  | DWG/DXF | Convert to PDF/SVG | Auto-generated from conversion | Text layers extracted | Server-side to PDF+SVG |
  | Excel (xlsx/xls) | Convert to HTML table | First sheet preview | Cell contents indexed | Server-side to HTML |
  | Word (docx) | Convert to HTML | First page preview | Full text indexed | Server-side to HTML |
  | MP4/MOV video | HTML5 player | Frame at 1 second | — | Transcode to MP4 H.264 if needed |
  | ZIP | File listing | Folder icon | Filenames indexed | — |
  | Unknown | Download only | Generic icon by extension | — | — |

- **Upload validation:**
  - Maximum file size: 500MB (videos), 100MB (all other files).
  - MIME type verification (check magic bytes, not just extension).
  - Virus scan via ClamAV before storage.
  - Rejected files: `.exe`, `.bat`, `.cmd`, `.scr`, `.js` (executable formats).

- **Processing pipeline:** All file processing (thumbnail generation, conversion, OCR) happens asynchronously. The file is immediately available for download. Preview/thumbnail appears within 30-60 seconds of upload.

---

### GAP-837: Character Set Handling — Accented Characters

**Problem:** Vendor names (Jose, Munoz), material descriptions (papier-mache), client names, and addresses contain accented characters, em dashes, curly quotes, and other non-ASCII text.

**System Behavior:**

- **Database:** All text columns use UTF-8 encoding (Supabase/PostgreSQL default). No `latin1` or `ascii` restrictions anywhere.

- **Search:** Full-text search uses `unaccent` extension in PostgreSQL. Searching for "Jose" matches "Jose" and vice versa. Searching for "Munoz" matches "Munoz."

- **PDF generation:** PDF rendering engine (Puppeteer) uses system fonts with broad Unicode coverage. Fallback font stack: Inter, Noto Sans, Arial Unicode MS.

- **CSV export:** CSV files use UTF-8 with BOM (byte order mark) so that Excel on Windows opens them correctly with accented characters intact.

- **Email:** All emails are sent with `Content-Type: text/html; charset=UTF-8`.

- **API:** All API responses use `Content-Type: application/json; charset=utf-8`. Request bodies are validated as valid UTF-8; malformed byte sequences are rejected with HTTP 400.

- **Input sanitization:** HTML entities are escaped on output (XSS prevention) but stored as plain Unicode in the database. Curly quotes and em dashes are preserved as-is (no "smart quote" conversion).

---

### GAP-838: Session Management Across Devices

**Problem:** A user logs in from their office desktop, then opens the app on their phone at a job site, then checks something on their tablet at home. Sessions must be managed sensibly.

**System Behavior:**

- **Concurrent sessions:** Users can be logged in on up to 5 devices simultaneously. The 6th login terminates the oldest session.

- **Session storage:**
  ```sql
  user_sessions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users NOT NULL,
    device_type text,              -- 'desktop', 'mobile', 'tablet'
    device_name text,              -- 'Chrome on Windows', 'Safari on iPhone'
    ip_address inet,
    last_active_at timestamptz,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz         -- 30 days from creation or last activity
  )
  ```

- **Token refresh:** Access tokens expire after 1 hour. Refresh tokens expire after 30 days of inactivity. Any API call resets the inactivity timer.

- **Session visibility:** Users can view active sessions in Settings > Security: device name, location (from IP), last active time. Users can terminate any session remotely ("Sign out of this device").

- **Admin controls:** Admins can view all active sessions for their company and terminate any user's sessions (e.g., when an employee leaves).

- **Sensitive operations:** Changing password, changing email, or exporting all company data requires re-authentication (enter password) regardless of session age.

---

### GAP-839: Deep Linking — Email Links Go to Specific Items

**Problem:** A notification email says "Invoice #4521 has been approved." Clicking the link should go directly to that invoice, not to the login page or the dashboard.

**System Behavior:**

- **URL structure:** Every entity has a canonical URL that resolves to the correct page:
  - Invoice: `/invoices/[uuid]`
  - Draw: `/draws/[uuid]`
  - Job: `/jobs/[uuid]`
  - Task: `/tasks/[uuid]`
  - Daily Log: `/daily-logs/[uuid]`
  - Change Order: `/change-orders/[uuid]`
  - Punch Item: `/punch-items/[uuid]`

- **Authentication flow for deep links:**
  1. User clicks email link: `https://app.rossos.com/invoices/abc-123`
  2. If user has an active session: render the invoice page directly.
  3. If no active session: redirect to `/login?redirect=/invoices/abc-123`. After successful login, redirect to the original URL.
  4. If user does not have permission to view the resource: show "You do not have access to this item. Contact your administrator."

- **Client portal deep links:** Portal links use a separate path: `https://portal.rossos.com/draws/abc-123`. Portal users are redirected to portal login if not authenticated.

- **Link expiration:** Notification email links do not expire. The resource URL is permanent. However, the resource may have been deleted (soft-deleted/archived). In that case, show: "This item has been archived. Contact your administrator to restore it."

- **Mobile handling:** Deep links work in both the browser and the installed PWA. The PWA registers URL handlers for `app.rossos.com/*` paths.

---

### GAP-840: Concurrent User Performance — 50 Users from One Builder

**Problem:** A large custom builder has 50 users accessing the system simultaneously: PMs on job detail pages, field workers uploading photos, the accountant processing invoices, the owner viewing reports.

**System Behavior:**

- **Performance targets under load:**

  | Operation | Target (p95) | With 50 concurrent users |
  |-----------|-------------|-------------------------|
  | Page load (cached) | < 500ms | < 750ms |
  | Page load (fresh) | < 1.5s | < 2.5s |
  | List query (100 items) | < 200ms | < 400ms |
  | Photo upload | < 3s (per photo) | < 5s (per photo) |
  | Report generation | < 5s | < 10s |
  | Real-time update delivery | < 1s | < 2s |

- **Architecture for concurrency:**
  - Database connection pooling via Supabase's PgBouncer (transaction mode). Max 50 connections per company.
  - Read replicas for report queries (separate from transactional writes).
  - CDN (Vercel Edge) serves all static assets and cached API responses.
  - SSE (Server-Sent Events) for real-time updates, with connection limit of 4 per user (per GAP from v1 experience).

- **Load testing:** Before launch, run synthetic load tests simulating 50 concurrent users across typical workflows: 20 viewing pages, 15 editing records, 10 uploading files, 5 running reports. All p95 targets must be met.

---

### GAP-841: Search Performance — Full-Text Search Across Millions of Records

**Problem:** After 5 years, a company may have millions of records. Searching for "smith" should return matching jobs, clients, vendors, invoices, daily logs, and documents in under 500ms.

**System Behavior:**

- **Search architecture:**
  - **Phase 1 (launch):** PostgreSQL full-text search with `tsvector` columns and GIN indexes. Sufficient for < 500K records.
  - **Phase 2 (scale):** If search latency exceeds 500ms, migrate to a dedicated search service (Typesense or Meilisearch, self-hosted). Index synced via database triggers.

- **Search scope and ranking:**

  | Entity | Searchable Fields | Weight |
  |--------|-------------------|--------|
  | Jobs | name, job_number, address, client name | Highest |
  | Clients | name, email, phone, address | High |
  | Vendors | name, trade, email, phone | High |
  | Invoices | invoice_number, vendor name, notes | Medium |
  | Daily Logs | work_performed, notes, issues | Medium |
  | Documents | filename, description, extracted text | Low |

- **Search behavior:**
  - Global search (Cmd+K) searches across all entity types and returns grouped results: "Jobs (3)", "Vendors (2)", "Invoices (5)".
  - Entity-specific search (search bar on the Invoices page) searches only that entity type.
  - Partial matching: typing "smi" matches "Smith", "Smithson", "Blacksmith".
  - Fuzzy matching: typing "smth" matches "Smith" (edit distance 1).

- **Performance target:** < 300ms for the top 20 results across all entity types for a company with 100K total records.

---

### GAP-842: Notification Delivery Timing — Urgent Within 30 Seconds

**Problem:** Some notifications are time-sensitive: draw approved (financial), safety incident reported, inspection failed. These must reach the user within seconds, not minutes.

**System Behavior:**

- **Notification priority levels:**

  | Priority | Delivery Target | Channels | Examples |
  |----------|----------------|----------|---------|
  | Critical | < 30 seconds | Push + SMS + Email + In-app | Safety incident, system outage |
  | Urgent | < 2 minutes | Push + Email + In-app | Draw approved, invoice rejected, deadline today |
  | Normal | < 15 minutes | Email + In-app | Task assigned, document uploaded, comment added |
  | Low | < 1 hour | In-app only | Weekly summary, feature announcement |

- **Delivery pipeline:**
  1. Event occurs (e.g., draw approved).
  2. Notification service determines priority from event type configuration.
  3. For Critical/Urgent: immediately push via SSE (in-app), Web Push API (browser push), and queue email/SMS.
  4. For Normal/Low: batch into 5-minute processing windows.

- **SMS handling:**
  - SMS is only used for Critical notifications and only if the user has opted in and provided a phone number.
  - SMS delivery via Twilio. Cost: ~$0.01/message. Budgeted into Enterprise plan pricing.
  - Users configure SMS preferences in Settings > Notifications.

- **Delivery confirmation:** The system tracks delivery status per channel. If push notification fails (e.g., user revoked permission), the system falls back to email immediately rather than waiting for the normal email batch.

---

### GAP-843: Mobile App Update Management

**Problem:** The app is a PWA. Updates deploy to the server, but users may have stale cached versions. Critical fixes need to reach all users quickly.

**System Behavior:**

- **Update detection:**
  - The service worker checks for updates every time the app loads and every 30 minutes while open.
  - When a new version is detected, the service worker downloads it in the background.

- **Update notification:**
  - Non-critical update: a subtle banner at the top of the screen: "A new version of RossOS is available. [Refresh to update]." The user can dismiss and continue working. The update applies on next natural page load.
  - Critical update (security fix, data integrity fix): a modal dialog: "A critical update is available. Please save your work and refresh. [Refresh Now]." The dialog cannot be dismissed for more than 5 minutes.

- **Version tracking:**
  ```sql
  app_versions (
    version text PRIMARY KEY,       -- semver: "1.2.3"
    released_at timestamptz,
    is_critical boolean DEFAULT false,
    min_supported_version text,     -- oldest version that can still connect
    changelog text
  )
  ```

- **Force update:** If the user's version is older than `min_supported_version`, the app shows: "Your version of RossOS is no longer supported. Please refresh to continue." All API calls from unsupported versions return HTTP 426 (Upgrade Required).

- **Rollback:** If a deployment introduces a critical bug, the server can be rolled back within 60 seconds (Vercel instant rollback). The service worker detects the "newer" old version and re-caches.

---

### GAP-844: Third-Party Dependency Management

**Problem:** The app depends on external services (Supabase, Anthropic API, Stripe, QuickBooks, Twilio, Postmark). Any of these can have outages, breaking changes, or price increases.

**System Behavior:**

- **Dependency health monitoring:**
  - The app checks health of each dependency on a 5-minute interval.
  - Dashboard (admin-only): "System Status" page showing green/amber/red for each service.
  - If a dependency is down, affected features show a user-friendly message rather than a generic error.

- **Graceful degradation per dependency:**

  | Dependency | If Down | User Impact |
  |-----------|---------|-------------|
  | Supabase (DB) | App is offline. Show maintenance page. | Full outage — no workaround |
  | Supabase (Auth) | Existing sessions work. New logins fail. | Partial — logged-in users unaffected |
  | Supabase (Storage) | File uploads queue locally. Downloads use CDN cache. | Delayed uploads only |
  | Anthropic API | AI invoice processing unavailable. Manual entry works. | "AI processing temporarily unavailable. Enter invoice manually." |
  | Stripe | New subscriptions/upgrades fail. Existing access unaffected. | Billing-only impact |
  | QuickBooks API | Sync paused. Local data unaffected. | "QuickBooks sync paused. Data will sync when connection restores." |
  | Twilio (SMS) | Critical notifications fall back to email + push only. | Delayed SMS delivery |
  | Postmark (Email) | Emails queue. In-app notifications still work. | Delayed email delivery |

- **Vendor lock-in mitigation:**
  - Database queries use standard SQL (no Supabase-specific extensions in business logic).
  - File storage uses an abstraction layer: swap Supabase Storage for S3 or R2 by changing one config.
  - AI processing uses a provider abstraction: swap Anthropic for OpenAI by implementing the same interface.
  - Email sending uses a transport abstraction: swap Postmark for SES by changing one config.

---

### GAP-845: Data Anonymization for Demo and Sales

**Problem:** Sales demos need realistic data, but using real customer data violates privacy. Synthetic data looks fake. The solution is anonymized real data.

**System Behavior:**

- **Anonymization pipeline:**
  ```
  POST /admin/generate-demo-data?source_company_id=xxx
  ```
  - Requires `owner` role. Only available in the admin panel.

- **Anonymization rules:**

  | Field Type | Anonymization Method |
  |-----------|---------------------|
  | Person names | Replace with fake names from a curated list (construction-appropriate: "Mike Johnson", not "John Doe") |
  | Company names | Replace with fake company names ("Summit Builders", "Lakeview Construction") |
  | Email addresses | Replace with `demo+[hash]@rossos.com` |
  | Phone numbers | Replace with `(555) xxx-xxxx` |
  | Addresses | Replace street number and name; keep city/state/zip for realistic geography |
  | Dollar amounts | Multiply by a random factor between 0.8 and 1.2 (preserves relative proportions) |
  | Dates | Shift all dates by a random offset (preserves relative timelines) |
  | Photos | Replace with stock construction photos (pre-loaded set of 200 images) |
  | Documents (PDFs) | Replace with template documents |
  | Notes/descriptions | Keep structure, replace proper nouns |

- **Demo environment:**
  - Demo data lives in a dedicated `demo` company in the production database (separate tenant, same infrastructure).
  - Demo accounts have read-only access. No writes persist beyond the session.
  - Demo resets nightly to the baseline anonymized dataset.
  - Sales reps log in with `demo@rossos.com` and get a fresh session each time.

- **Validation:**
  - Anonymized data passes the same schema validation as real data.
  - Financial totals are internally consistent (invoice allocations sum to invoice total, budget lines sum to budget total).
  - No real PII survives anonymization. A verification script scans the demo dataset for patterns matching real data (email domains, phone formats, addresses).

---

## 12. Competitive Feature Parity

This section specifies four features commonly found in competing construction management platforms (Procore, Buildertrend, CoConstruct, PlanGrid) that RossOS must support to be considered a viable alternative.

### GAP-895: Meeting Minutes

**Purpose:** Construction projects involve regular meetings: weekly owner-architect-contractor (OAC) meetings, subcontractor coordination, safety meetings, and pre-construction meetings. Formal meeting minutes serve as a contractual record of decisions, action items, and attendance.

**Data Model:**
```sql
meetings (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  meeting_type text NOT NULL,            -- 'oac', 'subcontractor', 'safety', 'pre_construction', 'internal', 'other'
  title text NOT NULL,
  meeting_date date NOT NULL,
  start_time time,
  end_time time,
  location text,                         -- "On-site trailer", "Zoom", "Owner's office"
  meeting_number integer,                -- sequential per job per meeting type

  -- Content
  agenda text,                           -- pre-meeting agenda (markdown)
  minutes text,                          -- post-meeting minutes (markdown)

  status text DEFAULT 'scheduled',       -- 'scheduled', 'in_progress', 'draft_minutes', 'published', 'acknowledged'

  -- Distribution
  distributed_at timestamptz,
  distributed_by uuid REFERENCES users,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users,

  UNIQUE(job_id, meeting_type, meeting_number)
)

meeting_attendees (
  id uuid PRIMARY KEY,
  meeting_id uuid REFERENCES meetings NOT NULL,

  attendee_type text NOT NULL,           -- 'internal', 'vendor', 'client', 'architect', 'inspector', 'other'
  user_id uuid REFERENCES users,         -- for internal attendees
  vendor_id uuid REFERENCES vendors,     -- for vendor attendees
  client_id uuid REFERENCES clients,     -- for client attendees
  external_name text,                    -- for non-system attendees
  external_email text,
  external_company text,

  attended boolean DEFAULT true,         -- false = invited but absent
  acknowledged_at timestamptz,           -- signed off on minutes

  UNIQUE(meeting_id, COALESCE(user_id::text, vendor_id::text, client_id::text, external_email))
)

meeting_action_items (
  id uuid PRIMARY KEY,
  meeting_id uuid REFERENCES meetings NOT NULL,

  description text NOT NULL,
  assigned_to_type text,                 -- 'user', 'vendor', 'client', 'external'
  assigned_to_user_id uuid REFERENCES users,
  assigned_to_vendor_id uuid REFERENCES vendors,
  assigned_to_name text,                 -- display name regardless of type

  due_date date,
  status text DEFAULT 'open',            -- 'open', 'in_progress', 'completed', 'cancelled'
  completed_at timestamptz,

  -- Carry forward tracking
  originated_meeting_id uuid REFERENCES meetings, -- first meeting where this was raised
  carry_forward_count integer DEFAULT 0,          -- how many meetings this has been open

  sort_order integer DEFAULT 0
)
```

**Key Behaviors:**
- **Agenda creation:** PM creates an agenda before the meeting. Open action items from previous meetings are automatically included as "Carry Forward" items.
- **In-meeting mode:** A simplified editor optimized for note-taking during the meeting. Voice-to-text input supported (browser Speech Recognition API). Attendees can be checked off from a pre-populated list.
- **Action item tracking:** Each action item has an assignee and due date. Open items carry forward to the next meeting of the same type automatically, with an incrementing carry-forward counter. Items open for 3+ meetings are highlighted red.
- **Distribution:** After the PM finalizes minutes, they click "Distribute." The system emails a formatted PDF to all attendees and saves the PDF to the job's Documents folder under "Meeting Minutes/[date]-[type].pdf".
- **Acknowledgment:** External recipients (architects, owners) can acknowledge receipt via a link in the email. Acknowledgment status is tracked per attendee.
- **Template support:** Companies can create meeting templates with standard agenda items per meeting type (e.g., Safety meetings always start with "Incident review" and "Toolbox talk topic").

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/meetings` | GET | List meetings for a job |
| `/jobs/:id/meetings` | POST | Create meeting |
| `/meetings/:id` | GET | Get meeting details |
| `/meetings/:id` | PATCH | Update meeting |
| `/meetings/:id/distribute` | POST | Distribute minutes |
| `/meetings/:id/action-items` | GET | List action items |
| `/meetings/:id/action-items` | POST | Add action item |
| `/meeting-action-items/:id` | PATCH | Update action item |

**Pages:**

| Page | URL | Purpose |
|------|-----|---------|
| Meetings List | `/jobs/:id/meetings` | All meetings for a job, filterable by type |
| Meeting Detail | `/meetings/:id` | View/edit agenda, minutes, attendees, action items |
| Action Items Dashboard | `/jobs/:id/action-items` | All open action items across all meetings for a job |

---

### GAP-897: Correspondence Logs

**Purpose:** Builders need a centralized record of all project correspondence: emails, letters, phone calls, and formal notices. This log serves as evidence in disputes and helps track communication chains.

**Data Model:**
```sql
correspondence (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  correspondence_type text NOT NULL,     -- 'email', 'letter', 'phone_call', 'text_message', 'formal_notice', 'fax', 'other'
  direction text NOT NULL,               -- 'incoming', 'outgoing'

  subject text NOT NULL,
  body text,                             -- full content or summary for phone calls

  -- Parties
  from_type text,                        -- 'user', 'vendor', 'client', 'architect', 'inspector', 'other'
  from_user_id uuid REFERENCES users,
  from_vendor_id uuid REFERENCES vendors,
  from_client_id uuid REFERENCES clients,
  from_name text NOT NULL,               -- display name regardless of source
  from_email text,

  to_names text[] NOT NULL,              -- array of recipient display names
  to_emails text[],                      -- array of recipient emails
  cc_names text[],
  cc_emails text[],

  -- Metadata
  correspondence_date timestamptz NOT NULL,
  reference_number text,                 -- for formal letters/notices
  delivery_method text,                  -- 'email', 'certified_mail', 'hand_delivered', 'courier'
  tracking_number text,                  -- for certified mail/courier

  -- Linking
  related_entity_type text,              -- 'change_order', 'rfi', 'invoice', 'draw', 'punch_item'
  related_entity_id uuid,

  -- Status
  requires_response boolean DEFAULT false,
  response_due_date date,
  response_received boolean DEFAULT false,
  response_correspondence_id uuid REFERENCES correspondence, -- link to the response

  -- Attachments handled via the files table with entity_type = 'correspondence'

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)
```

**Key Behaviors:**
- **Manual logging:** User logs a phone call or letter by filling out the correspondence form. For phone calls, a simplified form captures: who called, date/time, duration, summary, and action items.
- **Email capture (future):** When email integration is built (Module 45+), inbound/outbound project emails are automatically captured with job auto-detection based on job number in subject line.
- **Formal notice tracking:** For formal notices (e.g., notice of delay, notice of claim, stop-work notice), the system tracks delivery method, tracking number, and proof of receipt.
- **Response tracking:** Correspondence marked "requires response" generates a notification if no response is logged by the due date. The dashboard shows "Awaiting Response" items with aging.
- **Search:** Full-text search across subject and body fields. Filter by type, direction, date range, and party.
- **Export:** Correspondence log exports as a chronological PDF with all entries, suitable for legal proceedings. Attachments can be included or excluded.

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/correspondence` | GET | List correspondence for a job |
| `/jobs/:id/correspondence` | POST | Log correspondence |
| `/correspondence/:id` | GET | Get correspondence details |
| `/correspondence/:id` | PATCH | Update correspondence |

**Pages:**

| Page | URL | Purpose |
|------|-----|---------|
| Correspondence Log | `/jobs/:id/correspondence` | Chronological log with filters |
| Correspondence Detail | `/correspondence/:id` | Full view with attachments and linked entities |

---

### GAP-899: Commissioning Workflows

**Purpose:** Commercial and high-end residential projects require commissioning: systematic verification that all building systems (HVAC, electrical, plumbing, fire protection, controls) perform according to design specifications. This is distinct from punch lists (cosmetic/finish issues).

**Data Model:**
```sql
commissioning_plans (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  name text NOT NULL,                    -- "HVAC Commissioning Plan"
  system_type text NOT NULL,             -- 'hvac', 'electrical', 'plumbing', 'fire_protection', 'controls', 'envelope', 'other'

  commissioning_agent text,              -- name of CxA (commissioning agent)
  commissioning_agent_company text,
  commissioning_agent_email text,

  status text DEFAULT 'draft',           -- 'draft', 'approved', 'in_progress', 'complete', 'deficient'

  -- Design references
  design_spec_reference text,            -- "Mechanical drawings M-101 through M-115"
  performance_criteria text,             -- markdown description of what "success" looks like

  start_date date,
  target_completion date,
  actual_completion date,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)

commissioning_tests (
  id uuid PRIMARY KEY,
  commissioning_plan_id uuid REFERENCES commissioning_plans NOT NULL,

  test_name text NOT NULL,               -- "AHU-1 Supply Air Temperature Verification"
  test_procedure text,                   -- step-by-step test instructions
  acceptance_criteria text NOT NULL,     -- "Supply air temp within 2°F of setpoint at all load conditions"

  system_component text,                 -- "AHU-1", "Panel LP-2A", "Pump P-1"
  vendor_id uuid REFERENCES vendors,     -- responsible installer/vendor

  status text DEFAULT 'not_started',     -- 'not_started', 'scheduled', 'in_progress', 'passed', 'failed', 'retesting', 'waived'

  -- Scheduling
  scheduled_date date,
  actual_date date,
  tested_by text,                        -- name of person who performed test

  -- Results
  result_notes text,
  measured_value text,                   -- actual measurement, e.g., "72.3°F"
  expected_value text,                   -- expected measurement, e.g., "72°F ± 2°F"
  passed boolean,

  -- Retest tracking
  retest_of uuid REFERENCES commissioning_tests, -- link to the failed test this retests
  retest_count integer DEFAULT 0,

  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
)

-- Commissioning issues (deficiencies found during testing)
commissioning_issues (
  id uuid PRIMARY KEY,
  commissioning_test_id uuid REFERENCES commissioning_tests NOT NULL,

  description text NOT NULL,
  severity text NOT NULL,                -- 'critical', 'major', 'minor'
  responsible_vendor_id uuid REFERENCES vendors,

  status text DEFAULT 'open',            -- 'open', 'in_progress', 'resolved', 'accepted_as_is'
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users,

  due_date date,

  created_at timestamptz DEFAULT now()
)
```

**Key Behaviors:**
- **Plan creation:** PM or CxA creates a commissioning plan per building system. The plan references design documents and defines acceptance criteria.
- **Test scheduling:** Individual tests are scheduled and assigned to vendors. Vendors receive notification: "Commissioning test scheduled: [test name] on [date]. You are responsible for [system component]."
- **Test execution:** Tester records measured values, pass/fail, and notes. Photos can be attached (e.g., photo of the temperature reading on the BAS screen).
- **Failure workflow:** Failed tests generate a commissioning issue assigned to the responsible vendor. The vendor must correct the deficiency and the test is rescheduled. The system tracks retest count per test.
- **Completion tracking:** Dashboard shows commissioning progress: X of Y tests complete, Z issues open. The commissioning plan cannot be marked "complete" until all tests pass or are explicitly waived.
- **Waiver:** Some tests may be waived (e.g., seasonal tests that cannot be performed in current conditions). Waivers require PM approval and a documented reason. Waived tests are tracked for future follow-up.
- **Report generation:** "Commissioning Report" PDF includes: plan summary, all test results with measured values, issue log with resolutions, and waiver documentation. This report is required for building occupancy in many jurisdictions.

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/commissioning` | GET | List commissioning plans |
| `/jobs/:id/commissioning` | POST | Create commissioning plan |
| `/commissioning/:id` | GET | Get plan with tests and issues |
| `/commissioning/:id` | PATCH | Update plan |
| `/commissioning/:id/tests` | GET | List tests |
| `/commissioning/:id/tests` | POST | Add test |
| `/commissioning-tests/:id` | PATCH | Update test (record results) |
| `/commissioning-tests/:id/issues` | POST | Log issue from failed test |

**Pages:**

| Page | URL | Purpose |
|------|-----|---------|
| Commissioning Dashboard | `/jobs/:id/commissioning` | All plans with progress bars |
| Commissioning Plan | `/commissioning/:id` | Tests, results, issues |
| Commissioning Report | `/commissioning/:id/report` | Printable/PDF report |

---

### GAP-900: BIM Coordination

**Purpose:** Building Information Modeling (BIM) is increasingly required on construction projects. The platform needs to support BIM file viewing, clash detection tracking, and coordination meeting documentation without requiring the user to have BIM authoring software.

**Data Model:**
```sql
bim_models (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  name text NOT NULL,                    -- "Architectural Model", "MEP Federated Model"
  discipline text NOT NULL,              -- 'architectural', 'structural', 'mechanical', 'electrical', 'plumbing', 'fire_protection', 'civil', 'federated'

  -- File references
  source_file_id uuid REFERENCES files,  -- original .rvt, .ifc, .nwd file
  ifc_file_id uuid REFERENCES files,     -- IFC export for web viewing
  viewer_url text,                       -- URL for web-based 3D viewer (if using external viewer service)

  version text,                          -- "Rev 3", "CD Set", "Construction"
  upload_date date,
  authored_by text,                      -- "Smith Architecture, Inc."
  software text,                         -- "Revit 2025", "ArchiCAD 27"

  status text DEFAULT 'current',         -- 'current', 'superseded', 'archived'

  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users
)

bim_clashes (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  clash_detection_run_date date NOT NULL,
  clash_source text,                     -- "Navisworks", "Solibri", "BIMcollab"

  -- Clash details
  clash_id_external text,                -- ID from the clash detection software
  description text NOT NULL,
  location text,                         -- "Level 2, Grid B-3, above ceiling"
  discipline_a text NOT NULL,            -- "Mechanical"
  discipline_b text NOT NULL,            -- "Structural"
  element_a text,                        -- "16" Supply Duct"
  element_b text,                        -- "W12x26 Steel Beam"

  severity text DEFAULT 'major',         -- 'critical', 'major', 'minor', 'informational'
  status text DEFAULT 'new',             -- 'new', 'active', 'resolved', 'accepted', 'void'

  assigned_to_vendor_id uuid REFERENCES vendors,
  assigned_to_discipline text,           -- which discipline is responsible for resolving

  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users,

  -- Viewpoint (camera position for 3D viewer)
  viewpoint_data jsonb,                  -- BCF format viewpoint

  -- Link to coordination meeting where discussed
  meeting_id uuid REFERENCES meetings,

  created_at timestamptz DEFAULT now()
)
```

**Key Behaviors:**
- **Model upload and viewing:** Users upload BIM files (.ifc, .rvt, .nwd). IFC files are processed for web-based 3D viewing using an open-source IFC viewer (IFC.js/That Open Engine). Non-IFC files display metadata and a download link.
- **Clash import:** Clash detection results are imported from Navisworks, Solibri, or BIMcollab via BCF (BIM Collaboration Format) file upload. Each clash becomes a trackable item with location, severity, and discipline assignment.
- **Clash tracking workflow:**
  1. Imported clashes are reviewed in a list view with filters by severity, discipline, and status.
  2. Each clash is assigned to a vendor/discipline for resolution.
  3. Vendor receives notification with clash details and viewpoint (3D camera position showing the clash).
  4. Vendor marks as resolved with notes. PM verifies in the next clash detection run.
  5. If the clash reappears in a subsequent run, it is reopened with an incrementing recurrence count.
- **Coordination meetings:** BIM coordination meetings use the Meeting Minutes feature (GAP-895) with meeting type `bim_coordination`. Action items from clash resolution are linked to the corresponding clash records.
- **Model versioning:** When a new version of a model is uploaded, the previous version is marked `superseded`. Clash status carries forward: open clashes remain open until resolved in the new model version.
- **No BIM authoring:** RossOS is a coordination and tracking platform, not a BIM authoring tool. Users view models and track issues. Actual model changes are made in Revit/ArchiCAD by the design team and re-uploaded.

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/jobs/:id/bim-models` | GET | List BIM models |
| `/jobs/:id/bim-models` | POST | Upload BIM model |
| `/bim-models/:id` | GET | Get model details |
| `/jobs/:id/bim-clashes` | GET | List clashes |
| `/jobs/:id/bim-clashes/import` | POST | Import BCF clash file |
| `/bim-clashes/:id` | GET | Get clash details |
| `/bim-clashes/:id` | PATCH | Update clash (assign, resolve) |

**Pages:**

| Page | URL | Purpose |
|------|-----|---------|
| BIM Models | `/jobs/:id/bim` | Model list with 3D viewer |
| BIM Clashes | `/jobs/:id/bim/clashes` | Clash list with filters and status tracking |
| Clash Detail | `/bim-clashes/:id` | Full details, viewpoint, resolution history |

---

*Document created: 2024*
*Updated: 2026-02-13 — Added Technology Edge Cases (Section 11) and Competitive Feature Parity (Section 12).*
*This is the authoritative design document for the RossOS platform rebuild.*
