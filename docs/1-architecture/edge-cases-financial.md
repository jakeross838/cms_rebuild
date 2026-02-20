# RossOS - Financial Edge Cases

This document specifies system behavior for 20 financial edge cases that arise in residential and commercial construction. Each item defines the scenario, the data model impact, the user-facing behavior, and the validation rules. All financial operations respect multi-tenant isolation via `company_id`.

---

## GAP-806: Client Overpayment — Refund Processing and Tracking

### Scenario
A client pays more than the current draw amount due (e.g., rounding, duplicate payment, or intentional overpayment on a progress draw).

### System Behavior

**Detection:**
- When recording a payment against a draw, the system compares `payment_amount` to `current_payment_due`.
- If `payment_amount > current_payment_due`, the system flags the transaction as an overpayment and displays a confirmation dialog: "This payment exceeds the amount due by $X. Record as overpayment?"

**Data Model:**
```sql
-- New table for tracking overpayments and refunds
client_credits (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  client_id uuid REFERENCES clients NOT NULL,
  draw_id uuid REFERENCES draws,

  credit_type text NOT NULL,           -- 'overpayment', 'refund_due', 'prepayment'
  amount decimal(12,2) NOT NULL,
  applied_amount decimal(12,2) DEFAULT 0,
  remaining_amount decimal(12,2) GENERATED ALWAYS AS (amount - applied_amount) STORED,

  status text DEFAULT 'open',          -- 'open', 'partially_applied', 'fully_applied', 'refunded'
  refund_method text,                  -- 'check', 'ach', 'credit_next_draw'
  refund_reference text,               -- check number or transaction ID
  refund_date date,

  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)
```

**Application Rules:**
- On subsequent draw creation, the system prompts: "Client has $X in unapplied credits. Apply to this draw?"
- User can apply full or partial credit to the new draw.
- Refunds require manager or admin approval (role >= `pm`).
- QuickBooks sync creates a credit memo for the overpayment amount and a refund check if issued.

**Validation:**
- `applied_amount` cannot exceed `amount`.
- Credits cannot be applied across different jobs unless explicitly transferred.
- Activity log records every credit application and refund with user, timestamp, and amounts.

---

## GAP-807: Vendor Underpays a Credit — Collection and Dispute Tracking

### Scenario
A vendor issues a credit memo (for returned materials, defective work, etc.) but the credit is less than expected, or the vendor fails to honor the credit at all.

### System Behavior

**Data Model:**
```sql
vendor_credits (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs,
  vendor_id uuid REFERENCES vendors NOT NULL,
  invoice_id uuid REFERENCES invoices,         -- original invoice being credited

  expected_amount decimal(12,2) NOT NULL,
  received_amount decimal(12,2) DEFAULT 0,
  dispute_amount decimal(12,2) GENERATED ALWAYS AS (expected_amount - received_amount) STORED,

  status text DEFAULT 'pending',               -- 'pending', 'partial', 'received', 'disputed', 'written_off'
  dispute_reason text,
  dispute_opened_at timestamptz,
  dispute_resolved_at timestamptz,
  resolution_notes text,

  due_date date,
  received_date date,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)
```

**Workflow:**
1. User creates a vendor credit record, specifying the expected amount and linking to the original invoice.
2. When payment/credit is received, user records `received_amount`.
3. If `received_amount < expected_amount`, system transitions status to `disputed` and prompts for a `dispute_reason`.
4. Disputed credits appear on a dashboard widget: "Open Vendor Disputes" with aging (30/60/90 days).
5. Resolution options: vendor pays difference, builder writes off the shortfall, or builder deducts from next vendor payment.

**Integration:**
- Disputed amounts display on vendor detail page under "Open Credits/Disputes."
- Vendor performance scoring (Module 22) factors in dispute frequency and resolution time.
- QuickBooks sync creates vendor credit memos; disputed amounts remain as open items.

**Validation:**
- `received_amount` cannot exceed `expected_amount` (that would be a separate overpayment).
- Write-offs require admin approval and generate an activity log entry with the write-off justification.

---

## GAP-808: Construction Loan with Unusual Draw Structures — Configurable Draw Schedules

### Scenario
Construction loans often have non-standard draw structures: milestone-based draws, percentage-of-completion draws, fixed-amount draws, or hybrid structures. Some lenders require specific documentation formats.

### System Behavior

**Data Model:**
```sql
-- Draw schedule templates per job
draw_schedule_configs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  schedule_type text NOT NULL,           -- 'percentage', 'milestone', 'fixed_amount', 'hybrid', 'custom'

  -- Percentage-based config
  retainage_percent decimal(5,2) DEFAULT 10,
  retainage_release_percent decimal(5,2) DEFAULT 50, -- % complete when retainage drops
  retainage_reduced_percent decimal(5,2) DEFAULT 5,  -- reduced retainage rate

  -- Lender config
  lender_name text,
  lender_contact text,
  lender_format text,                    -- 'aia_g702', 'custom_form', 'lender_specific'
  lender_requirements jsonb DEFAULT '{}', -- e.g., {"requires_photos": true, "requires_lien_waivers": true}

  -- Billing rules
  max_draws_per_month integer,
  minimum_draw_amount decimal(12,2),
  billing_day_of_month integer,          -- 0 = any day

  created_at timestamptz DEFAULT now()
)

-- Milestone-based draw triggers
draw_milestones (
  id uuid PRIMARY KEY,
  draw_schedule_config_id uuid REFERENCES draw_schedule_configs NOT NULL,

  milestone_name text NOT NULL,          -- e.g., "Foundation Complete"
  milestone_order integer NOT NULL,
  draw_amount decimal(12,2),             -- fixed amount for this milestone
  draw_percent decimal(5,2),             -- or percentage of contract
  task_id uuid REFERENCES tasks,         -- optional link to schedule task

  is_triggered boolean DEFAULT false,
  triggered_at timestamptz,
  triggered_by uuid REFERENCES users
)
```

**UI Behavior:**
- Job setup includes a "Draw Schedule" configuration step.
- For milestone-based draws, completing the linked task auto-prompts: "Milestone 'Foundation Complete' is triggered. Create draw for $X?"
- For percentage-based, the draw creation screen pre-fills based on current completion percentages.
- For hybrid schedules, each budget line can be individually configured as percentage or milestone.

**Validation:**
- Total milestone draw amounts cannot exceed contract amount (warn at 95%, block at 100%).
- Minimum draw amount enforced at draw creation if configured.
- Monthly draw limit enforced with override requiring admin approval.

---

## GAP-809: Multiple Funding Sources — Client, Lender, and Investor

### Scenario
A project may have multiple funding sources: the homeowner pays some costs directly, a construction lender funds draws, and an investor or partner covers specific line items.

### System Behavior

**Data Model:**
```sql
funding_sources (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  source_name text NOT NULL,             -- "Client", "First National Bank", "Smith Family Trust"
  source_type text NOT NULL,             -- 'client', 'lender', 'investor', 'grant', 'insurance', 'other'
  contact_name text,
  contact_email text,
  contact_phone text,

  committed_amount decimal(12,2) NOT NULL,
  drawn_amount decimal(12,2) DEFAULT 0,
  remaining_amount decimal(12,2) GENERATED ALWAYS AS (committed_amount - drawn_amount) STORED,

  -- Allocation rules
  allocation_method text DEFAULT 'proportional', -- 'proportional', 'specific_codes', 'sequential', 'manual'
  allocated_cost_codes jsonb,            -- for specific_codes method: [{"cost_code_id": "...", "max_amount": 50000}]

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
)

-- Track which funding source pays for each draw line
draw_line_funding (
  id uuid PRIMARY KEY,
  draw_line_id uuid REFERENCES draw_lines NOT NULL,
  funding_source_id uuid REFERENCES funding_sources NOT NULL,
  amount decimal(12,2) NOT NULL,

  UNIQUE(draw_line_id, funding_source_id)
)
```

**Workflow:**
1. During job setup, user defines funding sources with committed amounts.
2. When creating a draw, the system splits each line across funding sources based on the configured allocation method.
3. Proportional: each source pays its percentage of every line. Sequential: first source pays until exhausted, then next. Specific codes: each source only pays for its assigned cost codes. Manual: user assigns per line.
4. Separate draw documents can be generated per funding source.
5. Dashboard shows remaining funds per source with a consolidated funding status bar.

**Validation:**
- Total committed across all sources must equal or exceed contract amount. Warn if shortfall.
- Draw amounts per source cannot exceed `remaining_amount` for that source.
- Changing allocation method on an active project warns: "This will recalculate all future draw allocations."

---

## GAP-810: Barter Arrangements — Vendor Trades Work for Other Consideration

### Scenario
A vendor agrees to perform work in exchange for non-monetary consideration: trade of services, materials from another job, future work promise, or reduced payment in exchange for referrals.

### System Behavior

**Data Model:**
```sql
barter_arrangements (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  vendor_id uuid REFERENCES vendors NOT NULL,

  description text NOT NULL,             -- "Electrician trades rough-in labor for plumbing work on vendor's own project"
  fair_market_value decimal(12,2) NOT NULL, -- IRS requires FMV tracking
  cash_component decimal(12,2) DEFAULT 0,   -- any cash portion
  barter_component decimal(12,2) GENERATED ALWAYS AS (fair_market_value - cash_component) STORED,

  barter_type text NOT NULL,             -- 'service_trade', 'material_trade', 'deferred_payment', 'other'
  terms text,                            -- description of what builder provides in return
  status text DEFAULT 'active',          -- 'active', 'fulfilled', 'disputed', 'cancelled'

  -- Tax tracking
  reported_on_1099 boolean DEFAULT false,
  tax_year integer,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)
```

**Financial Treatment:**
- The barter arrangement generates a budget line entry at `fair_market_value` so the true cost of work is reflected.
- An offsetting "barter credit" entry reduces the cash cost.
- The job P&L shows both the FMV cost and the barter offset, so profitability is calculated on true cost.
- At year-end, barter arrangements of $600+ are flagged for 1099 reporting.

**UI Behavior:**
- Vendor invoice screen allows selecting "Barter/Trade" as payment method.
- Invoice marked as "Paid via Barter" with a link to the barter arrangement.
- Reports include a "Barter Summary" section showing total FMV of bartered work per job.

**Validation:**
- `fair_market_value` must be greater than zero.
- `cash_component` cannot exceed `fair_market_value`.
- Tax year required for arrangements over $600.

---

## GAP-811: Escrow Requirements for Deposits — Jurisdiction-Specific Rules

### Scenario
Many jurisdictions require builders to hold client deposits in escrow accounts. Rules vary by state: some require separate accounts per client, others allow commingled escrow with accounting separation, and some have no requirement at all.

### System Behavior

**Data Model:**
```sql
escrow_configs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,

  state_code text NOT NULL,              -- 'CA', 'NY', 'FL', etc.
  escrow_required boolean DEFAULT false,
  max_deposit_percent decimal(5,2),      -- e.g., 10% of contract in CA
  max_deposit_amount decimal(12,2),      -- absolute cap if any
  commingling_allowed boolean DEFAULT true,
  separate_account_required boolean DEFAULT false,
  interest_to_client boolean DEFAULT false,
  escrow_release_trigger text,           -- 'work_started', 'material_delivered', 'permit_issued'

  notes text,                            -- free-text jurisdiction notes
  last_updated date,

  UNIQUE(company_id, state_code)
)

escrow_deposits (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  client_id uuid REFERENCES clients NOT NULL,

  deposit_amount decimal(12,2) NOT NULL,
  deposit_date date NOT NULL,
  deposit_method text,                   -- 'check', 'ach', 'wire', 'credit_card'
  reference_number text,

  escrow_account text,                   -- bank account identifier
  status text DEFAULT 'held',            -- 'held', 'partially_released', 'released', 'refunded'
  released_amount decimal(12,2) DEFAULT 0,
  released_date date,
  release_reason text,

  -- Interest tracking (where required)
  interest_accrued decimal(10,2) DEFAULT 0,
  interest_paid_to_client boolean DEFAULT false,

  created_at timestamptz DEFAULT now()
)
```

**Workflow:**
1. Company settings include jurisdiction configuration. System ships with default rules for all 50 US states.
2. When a job is created in a state with escrow requirements, the system warns: "This jurisdiction requires deposits to be held in escrow."
3. Collecting a deposit triggers escrow tracking: amount, date, account.
4. Attempting to collect a deposit exceeding the state maximum shows: "Warning: [State] limits deposits to [X]% of contract value ($Y). Current deposit exceeds this limit."
5. Escrow release is tied to the configured trigger (work start, material delivery, etc.).
6. Year-end escrow report shows all held deposits with compliance status.

**Validation:**
- Deposit amount validated against state limits at collection time.
- Released amount cannot exceed held amount.
- Escrow release before trigger condition met requires admin override with documented reason.

---

## GAP-812: Insurance Proceeds After Damage — Tracking and Applying to Reconstruction

### Scenario
Existing structure is damaged (fire, storm, vandalism) during construction. Insurance proceeds arrive and must be tracked separately, applied to reconstruction costs, and reconciled against the original budget.

### System Behavior

**Data Model:**
```sql
insurance_claims (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  claim_number text NOT NULL,
  insurance_company text NOT NULL,
  adjuster_name text,
  adjuster_phone text,
  adjuster_email text,

  incident_date date NOT NULL,
  incident_description text NOT NULL,

  -- Financial tracking
  claimed_amount decimal(12,2),
  approved_amount decimal(12,2),
  received_amount decimal(12,2) DEFAULT 0,
  deductible_amount decimal(12,2) DEFAULT 0,

  status text DEFAULT 'filed',           -- 'filed', 'under_review', 'approved', 'partial_payment', 'paid', 'denied', 'appealed'

  -- Reconstruction tracking
  reconstruction_budget decimal(12,2),
  reconstruction_spent decimal(12,2) DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)

-- Link insurance payments to specific budget lines
insurance_claim_allocations (
  id uuid PRIMARY KEY,
  claim_id uuid REFERENCES insurance_claims NOT NULL,
  budget_line_id uuid REFERENCES budget_lines NOT NULL,
  amount decimal(12,2) NOT NULL,

  UNIQUE(claim_id, budget_line_id)
)
```

**Workflow:**
1. User creates an insurance claim on the job, documenting the incident.
2. System creates a "Reconstruction" change order grouping to track additional costs.
3. As insurance payments arrive, they are recorded against the claim and allocated to budget lines.
4. Budget variance report shows a separate "Insurance-Funded" column so original budget accuracy is preserved.
5. Job profitability report treats insurance proceeds as revenue offset, not cost reduction.

**Reports:**
- Insurance Claims Summary: all claims across jobs with status and amounts.
- Per-job insurance reconciliation: claimed vs. received vs. spent on reconstruction.
- Unrecovered costs: reconstruction spending that exceeds insurance proceeds.

**Validation:**
- `received_amount` cannot exceed `approved_amount` without override.
- Claim allocations total cannot exceed `received_amount`.
- Denied claims prompt: "Mark claim as denied? Reconstruction costs of $X will remain on the original budget."

---

## GAP-813: Cost-Plus Audit by Client — Transparent Cost Documentation and Export

### Scenario
Cost-plus contracts give the client the right to audit all project costs. The system must produce a complete, verifiable cost trail with supporting documentation.

### System Behavior

**Audit Export Package:**
The system generates a structured export (ZIP file) containing:

1. **Summary Report (PDF):**
   - Contract terms (markup percentage, fee structure)
   - Total costs by cost code division
   - Total markup/fee charged
   - Grand total billed to client

2. **Detailed Cost Report (PDF + Excel):**
   - Every cost item with: date, vendor, description, cost code, amount
   - Subtotals by cost code division
   - Markup calculated and shown per line or per division (per contract terms)

3. **Supporting Documents Folder:**
   - All vendor invoices (PDF)
   - All purchase orders (PDF)
   - All change orders with approval signatures
   - All lien waivers received
   - Receipts for direct purchases

4. **Reconciliation Report:**
   - Budget vs. actual by line
   - PO vs. invoice variance by vendor
   - Draw history with dates and amounts

**API Endpoint:**
```
GET /jobs/:id/audit-export?format=zip&include=invoices,pos,cos,receipts,lien_waivers
```

**Access Control:**
- Export generation requires role >= `pm`.
- Client portal users can request an audit package, which triggers a notification to the PM for approval before generation.
- Activity log records every audit export with the requesting user and date.

**Data Integrity:**
- Export includes a SHA-256 hash manifest of all included documents.
- Invoice PDFs are the original uploaded files, not regenerated.
- Cost data is pulled as of the export date; a timestamp watermark appears on every generated report page.

---

## GAP-814: Progress Billing When Work Is Complete but Not Inspected

### Scenario
Work is physically complete, but the municipality inspection has not occurred. Some contracts allow billing at completion; others require inspection sign-off before billing.

### System Behavior

**Configuration (per job):**
```sql
-- Add to draw_schedule_configs
billing_trigger text DEFAULT 'completion',  -- 'completion', 'inspection_passed', 'both'
inspection_grace_days integer DEFAULT 0,     -- days after completion before billing without inspection
```

**Workflow by Configuration:**

1. **`completion` mode (default):** Work marked complete on a task triggers eligibility for billing. No inspection gate.

2. **`inspection_passed` mode:** Task completion sets the task to `completed_pending_inspection`. The budget line `percent_complete` does NOT advance until an inspection record is logged with a passing result. Draw creation excludes lines in `completed_pending_inspection` status.

3. **`both` mode:** Uses `completion` as the default, but specific cost codes can be flagged as requiring inspection. The cost code configuration includes a `requires_inspection` boolean.

**UI Behavior:**
- Tasks in `completed_pending_inspection` display with an amber badge: "Awaiting Inspection."
- Draw creation screen shows these lines grayed out with a tooltip: "Cannot bill — inspection required."
- If `inspection_grace_days > 0`, after N days the line becomes billable with a note: "Billed without inspection (grace period exceeded)."

**Validation:**
- Changing billing trigger on an active job warns: "Changing billing rules will affect X pending draw lines."
- Activity log records any grace-period overrides.

---

## GAP-815: Force Majeure Financial Impact — Cost Escalation, Extended General Conditions, Remobilization

### Scenario
A force majeure event (pandemic, natural disaster, government order) halts work. When work resumes, costs have increased, general conditions extend, and remobilization costs are incurred.

### System Behavior

**Data Model:**
```sql
force_majeure_events (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,

  event_name text NOT NULL,              -- "COVID-19 Shutdown", "Hurricane Ian"
  event_type text NOT NULL,              -- 'pandemic', 'natural_disaster', 'government_order', 'civil_unrest', 'other'
  start_date date NOT NULL,
  end_date date,                         -- null = ongoing
  description text,

  created_at timestamptz DEFAULT now()
)

-- Link events to affected jobs
job_force_majeure (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  event_id uuid REFERENCES force_majeure_events NOT NULL,

  suspension_date date NOT NULL,
  resumption_date date,

  -- Financial impact
  cost_escalation_percent decimal(5,2) DEFAULT 0,
  extended_gc_daily_rate decimal(10,2) DEFAULT 0,
  extended_gc_days integer DEFAULT 0,
  remobilization_cost decimal(12,2) DEFAULT 0,

  -- Generated change order
  change_order_id uuid REFERENCES change_orders,

  notes text,

  UNIQUE(job_id, event_id)
)
```

**Workflow:**
1. Admin creates a force majeure event (company-wide; may affect multiple jobs).
2. PMs link affected jobs to the event, recording suspension dates.
3. System calculates schedule impact: pauses task timelines between suspension and resumption dates.
4. Upon resumption, system generates a draft change order with:
   - Extended general conditions: `extended_gc_daily_rate * extended_gc_days`
   - Cost escalation: applies `cost_escalation_percent` to remaining uncommitted budget lines
   - Remobilization: one-time cost line item
5. PM reviews, adjusts, and submits the change order through normal approval flow.

**Schedule Impact:**
- All tasks with dates during the suspension period are automatically shifted by the suspension duration.
- Critical path is recalculated after shift.
- Original dates preserved in task history for contract documentation.

**Validation:**
- Suspension date must be before resumption date.
- Cost escalation cannot be negative (use a change order deduction instead).
- Force majeure change orders are tagged in reports to distinguish from scope changes.

---

## GAP-816: Bonus/Penalty Clauses — Milestone Tracking with Automatic Financial Calculation

### Scenario
The contract includes financial incentives (bonus for early completion) or penalties (liquidated damages for late completion) tied to specific milestones.

### System Behavior

**Data Model:**
```sql
bonus_penalty_clauses (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,

  clause_type text NOT NULL,             -- 'bonus', 'penalty', 'both'
  milestone_name text NOT NULL,          -- "Substantial Completion", "Drywall Complete"
  task_id uuid REFERENCES tasks,         -- linked schedule task

  target_date date NOT NULL,

  -- Bonus terms
  bonus_amount decimal(12,2),            -- flat bonus
  bonus_per_day decimal(12,2),           -- per day early
  bonus_max decimal(12,2),              -- cap

  -- Penalty terms
  penalty_amount decimal(12,2),          -- flat penalty
  penalty_per_day decimal(12,2),         -- per day late (see also GAP-817 for LD)
  penalty_max decimal(12,2),            -- cap

  -- Calculated
  actual_date date,
  days_variance integer,                 -- negative = early, positive = late
  calculated_amount decimal(12,2),       -- positive = bonus, negative = penalty

  status text DEFAULT 'active',          -- 'active', 'triggered', 'waived', 'disputed'
  waiver_reason text,

  created_at timestamptz DEFAULT now()
)
```

**Automatic Calculation:**
- When the linked task is marked complete, `actual_date` is set and `days_variance` is computed.
- System calculates the financial impact:
  - Early: `MIN(bonus_per_day * ABS(days_variance), bonus_max)` or flat `bonus_amount`
  - Late: `MIN(penalty_per_day * days_variance, penalty_max)` or flat `penalty_amount`
- A notification is sent to the PM: "Milestone '[name]' completed [X days early/late]. Calculated [bonus/penalty]: $Y."

**Integration with Financials:**
- Triggered bonuses create a positive change order line item.
- Triggered penalties create a negative change order line item.
- Both appear in the job profitability report as "Incentive Adjustments."

**Validation:**
- Target date modification after contract signing requires a change order.
- Waived clauses require documented reason and admin approval.
- Force majeure events (GAP-815) automatically extend target dates by the suspension duration.

---

## GAP-817: Liquidated Damages — Daily Rate Calculation When Project Exceeds Completion Date

### Scenario
The contract specifies a daily liquidated damages (LD) rate for each calendar day the project extends beyond the contractual completion date.

### System Behavior

**Data Model:**
```sql
-- Add to jobs table or contracts table
liquidated_damages_rate decimal(10,2),    -- daily rate, e.g., $500/day
liquidated_damages_cap decimal(12,2),     -- maximum LD, e.g., $50,000
liquidated_damages_start_date date,       -- contractual completion date (may differ from target_completion if COs granted time)
```

**Automatic Tracking:**
- System calculates LD daily starting the day after `liquidated_damages_start_date` if the job status is not `completed`.
- Dashboard widget on the job overview: "Liquidated Damages: $X accrued (Y days past completion)."
- The LD counter is a computed value, not stored — it recalculates each time the page loads based on current date vs. start date.

**Approved Time Extensions:**
- Change orders with `days_impact > 0` and status `approved` automatically extend `liquidated_damages_start_date`.
- Force majeure suspensions (GAP-815) also extend the start date.
- Each extension is logged: "CO #3 granted 14 days. New LD start date: [date]."

**Financial Impact:**
- LD accrual does NOT automatically deduct from draws. It is tracked as a liability.
- When the project completes, the final LD amount is calculated and the PM decides: create a deduction change order, negotiate a waiver, or dispute.
- The job profitability report includes LD as a potential liability line item.

**Notifications:**
- 7 days before LD start date: "Warning: Job [name] is 7 days from contractual completion. LD of $X/day begins [date]."
- On LD start date: "Liquidated damages have begun accruing on Job [name] at $X/day."
- Every 7 days thereafter: "LD update: $X accrued to date (Y days)."

**Validation:**
- LD rate and cap are set at contract creation and cannot be modified without a change order.
- Accrued LD cannot exceed the cap.

---

## GAP-818: Shared Costs Between Projects — Configurable Allocation Methods

### Scenario
Some costs span multiple jobs: equipment rental used on three sites, a dumpster serving two adjacent projects, bulk material purchases, or shared labor (e.g., a superintendent overseeing multiple jobs).

### System Behavior

**Data Model:**
```sql
shared_costs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,

  description text NOT NULL,
  vendor_id uuid REFERENCES vendors,
  invoice_id uuid REFERENCES invoices,
  cost_code_id uuid REFERENCES cost_codes,

  total_amount decimal(12,2) NOT NULL,
  allocation_method text NOT NULL,       -- 'equal', 'percentage', 'square_footage', 'contract_value', 'manual'
  status text DEFAULT 'draft',           -- 'draft', 'allocated', 'adjusted'

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users
)

shared_cost_allocations (
  id uuid PRIMARY KEY,
  shared_cost_id uuid REFERENCES shared_costs NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  budget_line_id uuid REFERENCES budget_lines,

  allocation_percent decimal(7,4) NOT NULL,
  allocated_amount decimal(12,2) NOT NULL,

  UNIQUE(shared_cost_id, job_id)
)
```

**Allocation Methods:**
- **Equal:** Divide total evenly across all linked jobs.
- **Percentage:** User specifies percentage per job (must total 100%).
- **Square Footage:** System pulls job square footage and calculates proportional split.
- **Contract Value:** Proportional based on each job's contract amount.
- **Manual:** User enters specific dollar amounts per job (must total the shared cost amount).

**Workflow:**
1. User identifies an invoice or cost as shared.
2. Selects participating jobs and allocation method.
3. System calculates per-job amounts and displays for review.
4. On confirmation, individual invoice allocations are created on each job's budget.
5. Each job's budget variance reflects its portion of the shared cost.

**Validation:**
- Allocation percentages must sum to 100% (tolerance: +/- 0.01% for rounding).
- Allocated amounts must sum to `total_amount` (tolerance: +/- $0.01).
- Modifying a shared cost after allocation warns: "This will update budget entries on X jobs."

---

## GAP-819: Year-End Financial Close Processes — Preventing Changes to Closed Periods

### Scenario
At fiscal year-end (or month-end), the company closes the books. No financial transactions should be backdated into closed periods.

### System Behavior

**Data Model:**
```sql
fiscal_periods (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,

  period_type text NOT NULL,             -- 'month', 'quarter', 'year'
  period_start date NOT NULL,
  period_end date NOT NULL,
  fiscal_year integer NOT NULL,

  status text DEFAULT 'open',            -- 'open', 'soft_closed', 'hard_closed'
  closed_at timestamptz,
  closed_by uuid REFERENCES users,
  reopened_at timestamptz,
  reopened_by uuid REFERENCES users,
  reopen_reason text,

  UNIQUE(company_id, period_type, period_start)
)
```

**Enforcement Rules:**

1. **Open period:** All transactions allowed normally.

2. **Soft-closed period:** Transactions are blocked by default, but users with role >= `admin` can override with a documented reason. Override creates an activity log entry: "Transaction backdated into soft-closed period [period]. Reason: [text]."

3. **Hard-closed period:** No transactions allowed. Period must be reopened first (requires `owner` role). Reopening triggers a notification to all admin users and creates an audit trail entry.

**Affected Operations:**
- Invoice date, PO date, payment date, draw period date, change order date.
- The system checks the relevant date field against fiscal periods on every create and update.
- Error message: "Cannot record transaction dated [date]. Fiscal period [month/year] is [soft/hard]-closed."

**Close Process:**
1. Admin initiates period close from Settings > Financial > Fiscal Periods.
2. System runs a pre-close check: "X invoices are unallocated, Y POs are in draft status, Z draws are pending."
3. Admin resolves or acknowledges open items.
4. Period transitions to `soft_closed` (allows admin overrides for 30 days) then `hard_closed`.

**QuickBooks Integration:**
- Period close status syncs to QuickBooks: hard-closed periods lock the corresponding QB period.

---

## GAP-820: Multi-Year Project Financial Reporting — Costs Spanning Fiscal Years

### Scenario
A large project spans multiple fiscal years. Financial reports must present costs and revenue accurately within each fiscal year, including work-in-progress (WIP) calculations.

### System Behavior

**Fiscal Year Assignment:**
- Every financial transaction (invoice, payment, draw) is tagged with `fiscal_year` based on its date.
- Budget lines track cumulative and per-year amounts.

**WIP Schedule Report:**
```
GET /reports/wip?fiscal_year=2026
```

**WIP Calculation Per Job:**
```
Estimated Total Revenue     = Contract Amount + Approved COs
Estimated Total Cost        = Current Revised Budget
Percent Complete (cost)     = Total Costs to Date / Estimated Total Cost
Earned Revenue              = Percent Complete * Estimated Total Revenue
Billed to Date              = Sum of all draws
Over/Under Billing          = Billed to Date - Earned Revenue
```

**Report Output:**
| Column | Source |
|--------|--------|
| Contract Amount | `jobs.contract_amount` + approved CO totals |
| Estimated Cost | `budgets.revised_amount` |
| Costs to Date | Sum of paid invoices + allocated costs |
| % Complete | Costs to Date / Estimated Cost |
| Earned Revenue | % Complete * Contract Amount |
| Billings to Date | Sum of draws |
| Over/(Under) Billed | Billings - Earned |
| Gross Profit | Earned Revenue - Costs to Date |

**Year-Over-Year View:**
- The report supports viewing any single fiscal year or a cumulative project-to-date view.
- Year-specific view shows only costs and revenue recognized in that year.
- The system calculates "Prior Year Carryforward" automatically.

**Validation:**
- WIP report totals must reconcile with the general ledger (QuickBooks) totals. A reconciliation check runs at report generation and flags discrepancies > $1.00.

---

## GAP-821: Currency Conversion for Imported Materials — Exchange Rate Tracking

### Scenario
Builder imports materials (stone, tile, fixtures, lumber) from international suppliers. Invoices arrive in foreign currencies and must be converted to USD for budgeting and payment.

### System Behavior

**Data Model:**
```sql
-- Add to invoices table
currency_code text DEFAULT 'USD',        -- ISO 4217: 'USD', 'CAD', 'EUR', 'MXN', 'GBP'
exchange_rate decimal(10,6),             -- rate at time of invoice
original_amount decimal(12,2),           -- amount in original currency
converted_amount decimal(12,2),          -- amount in USD (this populates the standard total field)

-- Exchange rate history
exchange_rates (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  from_currency text NOT NULL,
  to_currency text DEFAULT 'USD',
  rate decimal(10,6) NOT NULL,
  rate_date date NOT NULL,
  source text,                           -- 'manual', 'api_xe', 'api_openexchange'

  UNIQUE(company_id, from_currency, to_currency, rate_date)
)
```

**Workflow:**
1. When creating an invoice with a non-USD currency, the system looks up the exchange rate for the invoice date.
2. If no rate exists for that date, system uses the most recent available rate and flags: "Using exchange rate from [date]. Update to actual rate?"
3. User can manually override the exchange rate.
4. `converted_amount` = `original_amount * exchange_rate` and is used for all budget and reporting calculations.

**Payment Handling:**
- If payment is made in the original currency, the actual exchange rate at payment date may differ.
- System records both the invoiced rate and the payment rate.
- The difference is tracked as "Foreign Exchange Gain/Loss" and appears on the job P&L.

**Reports:**
- Foreign currency summary per job: total invoiced in each currency, conversion gains/losses.
- QuickBooks sync uses `converted_amount` (USD) for all transactions.

**Validation:**
- Exchange rate must be > 0.
- Rate changes after invoice approval require admin override.
- Gains/losses exceeding 5% of invoice value trigger a notification.

---

## GAP-822: Contingency Drawdown Authorization — Configurable Approval Requirements

### Scenario
Project budgets include contingency amounts (typically 5-15% of hard costs). Spending contingency funds should require explicit authorization, potentially at higher approval thresholds than routine spending.

### System Behavior

**Data Model:**
```sql
-- Add to budget_lines or use cost_code flag
is_contingency boolean DEFAULT false,    -- marks this budget line as contingency

contingency_configs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs,           -- null = company-wide default

  -- Approval thresholds
  auto_approve_up_to decimal(12,2) DEFAULT 0,     -- PM can approve up to this amount
  pm_approve_up_to decimal(12,2) DEFAULT 5000,     -- PM approval ceiling
  admin_approve_up_to decimal(12,2) DEFAULT 25000,  -- admin approval ceiling
  owner_required_above decimal(12,2) DEFAULT 25000, -- owner must approve above this

  -- Notification rules
  notify_on_any_drawdown boolean DEFAULT true,
  notify_when_percent_remaining decimal(5,2) DEFAULT 25, -- alert when 25% remains

  created_at timestamptz DEFAULT now()
)

contingency_drawdowns (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  budget_line_id uuid REFERENCES budget_lines NOT NULL,  -- the contingency line

  amount decimal(12,2) NOT NULL,
  reason text NOT NULL,
  target_cost_code_id uuid REFERENCES cost_codes,  -- where the money goes

  status text DEFAULT 'pending',         -- 'pending', 'approved', 'rejected'
  approved_by uuid REFERENCES users,
  approved_at timestamptz,
  rejected_by uuid REFERENCES users,
  rejected_reason text,

  -- Creates a budget transfer
  change_order_id uuid REFERENCES change_orders, -- optional CO link

  created_at timestamptz DEFAULT now(),
  requested_by uuid REFERENCES users
)
```

**Workflow:**
1. User requests contingency drawdown: specifies amount, reason, and target cost code.
2. System determines required approver based on amount thresholds.
3. Approver receives notification with the request details.
4. On approval, system transfers funds: decreases contingency budget line, increases target cost code budget line.
5. This transfer is optionally documented as an internal change order (no client impact).

**Dashboard Visibility:**
- Job budget page shows contingency line with: original amount, drawn to date, remaining, percentage remaining.
- Color coding: green (>50% remaining), amber (25-50%), red (<25%).
- When remaining falls below notification threshold, PM and admin are alerted.

**Validation:**
- Drawdown amount cannot exceed remaining contingency.
- Reason field is required and must be at least 20 characters.
- Rejected drawdowns require a rejection reason.

---

## GAP-823: Budget Contingency Reallocation — Moving Contingency Funds with Documentation

### Scenario
Distinct from drawdown (GAP-822), reallocation moves contingency funds permanently into the base budget, typically when a specific risk has materialized and the cost is known.

### System Behavior

**Reallocation vs. Drawdown:**
- **Drawdown** (GAP-822): Temporary use of contingency for an unexpected cost. Contingency line remains with reduced balance.
- **Reallocation**: Permanent transfer that increases a budget line's `original_amount` and decreases contingency's `original_amount`. Used when the cost is now a known line item, not an unexpected expense.

**Workflow:**
1. PM initiates reallocation from the contingency budget line.
2. Specifies: target cost code, amount, justification, and whether this is a risk that has materialized or a scope clarification.
3. System generates a change order (type: `contingency_reallocation`) that:
   - Deducts from contingency line
   - Adds to target budget line
   - Net change order amount is $0 (budget-neutral)
4. Change order follows standard approval flow.
5. On approval, budget lines are permanently adjusted.

**Documentation:**
- Each reallocation links to a change order with full audit trail.
- The budget revision history shows: "Contingency Reallocation: $X from Contingency to [Cost Code] — [reason]."
- Client-facing reports can be configured to show or hide contingency reallocation details.

**Validation:**
- Reallocation amount cannot exceed remaining contingency.
- A budget-neutral change order must have a net amount of $0 (+/- $0.01 rounding tolerance).
- Cannot reallocate from a non-contingency line using this workflow (use a standard change order).

---

## GAP-824: Profit Margin Analysis Accounting for COs, Warranty Costs, and GC Overrun

### Scenario
True project profitability requires accounting for not just the original budget vs. actual, but also change order margin, warranty reserve/claims, and general conditions (GC) overruns.

### System Behavior

**Profit Calculation Model:**

```
Revenue:
  Original Contract                  $500,000
  + Approved Change Orders           $ 45,000
  - Liquidated Damages Accrued       $ (2,500)
  = Total Revenue                    $542,500

Direct Costs:
  Original Budget Costs              $380,000
  + CO-Related Costs                 $ 30,000
  + Barter FMV (GAP-810)            $  5,000
  = Total Direct Costs               $415,000

General Conditions:
  Budgeted GC                        $ 40,000
  Actual GC                          $ 48,000
  GC Overrun                         $ (8,000)

Warranty Reserve:
  Reserve (2% of contract)           $ 10,000
  Claims to Date                     $ (3,500)
  Reserve Remaining                  $  6,500

Profitability:
  Gross Profit                       $127,500
  - GC Overrun                       $ (8,000)
  - Warranty Claims                  $ (3,500)
  = Adjusted Gross Profit            $116,000
  Adjusted Margin                    21.4%
```

**Report Endpoint:**
```
GET /reports/profitability/:jobId?include=cos,warranty,gc,barter,ld
```

**Data Sources:**
- Revenue: `jobs.contract_amount` + sum of approved `change_orders.amount`
- Direct costs: sum of `invoice_allocations.amount` for non-GC cost codes
- GC costs: sum of `invoice_allocations.amount` where cost code is in the GC division (configurable)
- Warranty: sum of warranty claim costs from `warranties` and linked invoices
- LD: calculated per GAP-817
- Barter: `barter_arrangements.fair_market_value` per GAP-810

**Change Order Margin Breakdown:**
- Each CO shows: revenue to builder (client-approved amount) vs. cost to builder (actual vendor/material costs).
- CO margin = (CO revenue - CO cost) / CO revenue.
- COs with negative margin are highlighted in red.

**Validation:**
- GC cost codes must be configured per company (Settings > Cost Codes > mark as "General Conditions").
- Warranty reserve percentage is configurable per company (default 2%).
- Report recalculates on every load; no cached profitability values.

---

## GAP-825: Cash-Basis vs. Accrual-Basis Reporting Toggle

### Scenario
Some builders report on a cash basis (recognize revenue when received, expenses when paid) while others use accrual basis (recognize when earned/incurred). Some need both for different purposes.

### System Behavior

**Configuration:**
```sql
-- Add to company settings or companies table
default_accounting_basis text DEFAULT 'accrual',  -- 'cash', 'accrual'
```

**Cash Basis Calculations:**
- Revenue recognized = sum of draw payments received (where `draws.paid_at IS NOT NULL`)
- Expenses recognized = sum of invoice payments made (where `invoices.paid_at IS NOT NULL`)
- Timing is based on `paid_at` date, not invoice/draw date.

**Accrual Basis Calculations:**
- Revenue recognized = sum of draws submitted/approved (based on `draws.submitted_at` or `draws.approved_at`)
- Expenses recognized = sum of invoices received/approved (based on `invoices.invoice_date` or `invoices.approved_at`)
- Timing is based on the economic event, not payment.

**Report Toggle:**
- Every financial report (P&L, Cash Flow, Job Profitability, WIP) includes a toggle: "Cash Basis | Accrual Basis."
- The toggle changes which date fields and status filters are used in the underlying query.
- Default is set per company; individual reports can be toggled without changing the default.

**API:**
```
GET /reports/pnl?basis=cash&start_date=2026-01-01&end_date=2026-12-31
GET /reports/pnl?basis=accrual&start_date=2026-01-01&end_date=2026-12-31
```

**Side-by-Side View:**
- The P&L report supports a "Compare" mode showing cash and accrual side by side.
- Differences are highlighted, with the largest variance items at the top.

**QuickBooks Sync:**
- Sync uses the company's default accounting basis.
- If QB is set to a different basis, the system warns at connection time: "Your RossOS default is [accrual]. QuickBooks is set to [cash]. Sync will use [accrual]. Change?"

**Validation:**
- Switching the company default does not retroactively change historical reports — it only affects new report generation.
- Saved/exported reports include a watermark: "Prepared on [cash/accrual] basis."

---

*Document created: 2026-02-13*
*These specifications cover financial edge cases for the RossOS platform. Each item defines concrete system behavior, data model changes, and validation rules.*
