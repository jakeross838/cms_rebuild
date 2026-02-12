# Module 17: Change Order Management

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Full lifecycle management of construction change orders from initiation through approval, execution, and financial cascade. Change orders can originate from field conditions, client requests, design changes, or code/regulatory requirements. Each CO calculates cost impact (materials, labor, overhead, profit markup), schedule impact, and cascades approved changes to the contract value, project budget, and draw schedule. Client-facing COs are presented through the client portal with e-signature approval. All workflows, numbering, markup rules, and approval chains are configurable per builder.

## Proven Patterns from v1

### CO-Invoice Integration (Proven)
- CO auto-inheritance: if invoice's PO is linked to a CO, allocations auto-get change_order_id
- Cost codes ending in 'C' flagged as CO-specific
- recalculateCOInvoiced() sums all allocations linked to CO (approved+ only)
- CO billing overlap detection: warns if CO has both manual draw billings AND vendor invoice allocations

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 359 | CO approval chains must be configurable (PM -> Director -> Owner at thresholds) | Configurable multi-level approval workflow |
| 360 | CO numbering formats configurable per builder | Tenant-level numbering templates |
| 361 | CO templates - client-facing vs internal tracking | Dual template system |
| 362 | CO markup/fee calculation - flat %, split overhead vs profit | Configurable markup rules |
| 363 | Allowance change orders - auto-generated when selection exceeds allowance | Auto-CO trigger from selections module |
| 364 | Tracking CO causes - configurable categories | Builder-defined cause taxonomy |
| 365 | CO impact on contract value, schedule, and budget simultaneously | Tri-impact calculation engine |
| 366 | CO negotiation tracking - proposed, countered, accepted, rejected | Negotiation state machine with comm log |
| 367 | COs requiring design changes - RFI -> design revision -> CO workflow | Cross-module workflow linking |
| 368 | CO reporting - total by cause, trade, project for pattern analysis | Aggregated CO analytics |

---

## Detailed Requirements

### 1. Change Order Initiation

**Sources of change orders:**
- **Field-initiated:** Superintendent discovers unforeseen condition (e.g., rock during excavation). Creates CO request from mobile with photos and description.
- **Client request:** Client wants to upgrade countertops, add a window, change layout. Submitted via client portal or logged by PM.
- **Design change:** Architect revises plans. May originate from an RFI response (Gap #367). Platform links the RFI to the resulting CO.
- **Allowance overage:** Selection module detects that a chosen item exceeds the allowance budget. Auto-generates a draft CO for the difference (Gap #363). Builder configures whether this is automatic or requires manual creation.
- **Code/regulatory change:** Building inspector requires additional work not in original scope.
- **Builder-initiated:** Builder identifies a value-engineering opportunity or scope adjustment.

Each CO captures: originator, source type, description, affected scope areas, supporting documents/photos, and urgency level.

### 2. CO Numbering (Gap #360)
- Configurable per builder via template string.
- Variables: `{YEAR}`, `{PROJECT_CODE}`, `{SEQ}`, `{PREFIX}`.
- Examples: `CO-001`, `2026-AMI-CO-001`, `RB-{PROJECT_CODE}-CO-{SEQ}`.
- Sequential counter is per-project, auto-incrementing.
- Padding configurable (e.g., 3-digit: 001, 4-digit: 0001).

### 3. Cost Impact Calculation (Gap #362)

**Line item breakdown:**
- Materials: itemized list with quantities, unit costs, and subtotal.
- Labor: hours by trade/role, hourly rates, subtotal.
- Equipment: rental or usage charges if applicable.
- Subcontractor: sub quotes attached as supporting documents.
- **Subtotal** = Materials + Labor + Equipment + Subcontractor.

**Markup calculation (configurable per builder):**
- Option A: Single markup percentage on subtotal (e.g., 20% markup).
- Option B: Split markup - overhead % + profit % applied separately (e.g., 10% OH + 10% profit).
- Option C: Tiered markup - different % based on CO amount brackets.
- Option D: Fixed fee per CO (e.g., $250 administrative fee + cost).
- Markup rules are set at the builder level with optional per-project overrides.
- Negative COs (credits) use configurable credit markup (often lower than add markup).

**Total CO Amount** = Subtotal + Markup(s).

### 4. Schedule Impact Auto-Calculation (Gap #365)
- CO form includes optional schedule impact fields: additional days, affected tasks.
- If the builder uses the scheduling module, the CO can reference specific schedule tasks.
- On approval, schedule tasks are automatically extended by the specified duration.
- Critical path analysis: system warns if the CO pushes the project past the target completion date.
- Schedule impact is displayed on the client-facing CO document.

### 5. Approval Workflow (Gap #359)

**Configurable approval chain per builder:**
- Threshold-based routing: COs under $500 auto-approved, $500-$5K require PM, $5K+ require Director + Owner.
- Role-based: specific roles in the approval chain, configurable order.
- Parallel or sequential approval: some builders want all approvers to sign off independently; others want sequential escalation.
- Delegation: approver can delegate to another user if unavailable.
- Auto-escalation: if not approved within X days (configurable), escalate to next level.

**Internal approval (builder side) comes first. Then client approval.**

### 6. Client Portal Approval with E-Signature
- Approved (internally) COs are presented to the client via the client portal.
- Client-facing CO document uses the builder's template (Gap #361) - branded, clear language, no internal cost breakdowns unless builder opts to show them.
- Client can: approve (with e-signature), request modifications (with comments), or reject.
- E-signature captures: signer name, IP address, timestamp, browser fingerprint.
- E-signature is legally binding (ESIGN Act / UETA compliant).
- Client approval triggers the financial cascade.

### 7. Negotiation Tracking (Gap #366)

**CO states:** Draft -> Internal Review -> Client Presented -> Negotiation -> Approved / Rejected / Withdrawn.

- **Negotiation sub-states:** Proposed, Client Counter, Builder Counter, Revised, Final.
- Each state change is logged with timestamp, actor, and comments.
- Communication log: all messages between builder and client regarding the CO are threaded.
- Version tracking: if the CO amount changes during negotiation, each version is preserved.
- Negotiation history is visible to internal team but not to the client (client sees current version only).

### 8. Contract Value Update Chain (Gap #365)
On CO approval:
1. **Contract value** increases (or decreases) by the CO amount.
2. **Project budget** line items are adjusted - new budget lines created or existing ones modified.
3. **Draw schedule** is updated - remaining draws recalculated based on new contract value.
4. **Cost-to-complete** projections are refreshed.
5. **Accounting sync** triggered if QuickBooks/Xero integration is active (Module 16).

All cascading updates are atomic - if any step fails, the entire approval is rolled back.

### 9. Budget and Draw Schedule Cascade
- CO approval creates new budget line items tagged with the CO number.
- Budget variance report shows original budget, approved COs, and revised budget.
- Draw schedule: builder configures whether CO amounts are added to the next scheduled draw or spread across remaining draws.
- Retainage on CO amounts follows the same retainage percentage as the original contract (configurable override).

### 10. CO Templates (Gap #361)
- **Internal template:** Full detail including cost breakdowns, markup calculations, internal notes, vendor quotes.
- **Client-facing template:** Simplified presentation with scope description, total cost, schedule impact, and signature block.
- Templates are builder-branded (logo, colors, fonts) via the white-label system.
- PDF generation for both templates.
- Configurable fields: builder chooses which fields appear on the client-facing document.

### 11. CO Cause Tracking (Gap #364)
- Builder-defined cause categories. Default set provided:
  - Client Request, Design Error, Unforeseen Condition, Code Change, Value Engineering, Allowance Overage, Scope Clarification, Other.
- Each CO is tagged with one primary cause and optional secondary causes.
- Cause data feeds into CO reporting (Gap #368).

### 12. CO Reporting & Analytics (Gap #368)
- **By cause:** Total CO dollars by cause category - identifies patterns (e.g., "40% of COs are from design errors").
- **By trade:** Which trades generate the most COs.
- **By project:** CO volume and dollar amount per project.
- **Trend over time:** Are COs increasing or decreasing across the portfolio?
- **Comparison:** This project's CO rate vs. builder's average.
- Reports exportable as PDF and Excel.

### 13. Cross-Module Workflow (Gap #367)
- RFI -> Design Revision -> Change Order: linked workflow. CO references the originating RFI.
- Selection Overage -> Change Order: automatic or manual linking.
- CO -> Schedule Update: approved COs can auto-update schedule tasks.
- CO -> Purchase Order: approved CO may trigger a new PO for additional materials.

---

## Database Tables

```sql
-- Change orders
CREATE TABLE v2_change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  project_id UUID NOT NULL REFERENCES v2_projects(id),
  co_number TEXT NOT NULL,                -- formatted per builder's template
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'internal_review', 'client_presented',
                      'negotiation', 'approved', 'rejected', 'withdrawn', 'voided')),
  source_type TEXT NOT NULL
    CHECK (source_type IN ('field', 'client_request', 'design_change',
                           'allowance_overage', 'code_change', 'builder_initiated', 'other')),
  cause_category TEXT,                    -- from builder's configured categories
  cause_secondary TEXT[],
  initiated_by UUID REFERENCES v2_users(id),

  -- Cost impact
  materials_cost DECIMAL(12,2) DEFAULT 0,
  labor_cost DECIMAL(12,2) DEFAULT 0,
  equipment_cost DECIMAL(12,2) DEFAULT 0,
  subcontractor_cost DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS
    (materials_cost + labor_cost + equipment_cost + subcontractor_cost) STORED,
  markup_type TEXT DEFAULT 'single_pct',  -- 'single_pct', 'split_oh_profit', 'tiered', 'fixed_fee'
  markup_config JSONB DEFAULT '{}',       -- { "pct": 20 } or { "oh_pct": 10, "profit_pct": 10 }
  markup_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,   -- subtotal + markup
  is_credit BOOLEAN DEFAULT FALSE,

  -- Schedule impact
  schedule_days_impact INTEGER DEFAULT 0,
  schedule_impact_description TEXT,
  affected_task_ids UUID[],

  -- Linked entities
  rfi_id UUID,                            -- originating RFI if applicable
  selection_id UUID,                      -- originating selection overage if applicable
  contract_id UUID,

  -- Approval
  current_approval_step INTEGER DEFAULT 0,
  internal_approved_at TIMESTAMPTZ,
  internal_approved_by UUID,
  client_approved_at TIMESTAMPTZ,
  client_signature_data JSONB,            -- { name, ip, timestamp, fingerprint }

  -- Negotiation
  negotiation_status TEXT,
  version_number INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CO line items for detailed cost breakdown
CREATE TABLE v2_change_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES v2_change_orders(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  category TEXT NOT NULL CHECK (category IN ('materials', 'labor', 'equipment', 'subcontractor')),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit TEXT,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  cost_code_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval steps for each CO
CREATE TABLE v2_change_order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES v2_change_orders(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  step_order INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES v2_users(id),
  role TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'delegated', 'escalated')),
  decision_at TIMESTAMPTZ,
  comments TEXT,
  delegated_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CO version history for negotiation tracking
CREATE TABLE v2_change_order_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES v2_change_orders(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,                -- full CO data at this version
  change_reason TEXT,
  changed_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CO communication/negotiation log
CREATE TABLE v2_change_order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES v2_change_orders(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  sender_id UUID NOT NULL REFERENCES v2_users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('internal', 'client')),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,      -- internal notes not visible to client
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builder-level CO configuration
CREATE TABLE v2_change_order_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL UNIQUE REFERENCES v2_builders(id),
  numbering_template TEXT DEFAULT 'CO-{SEQ}',
  seq_padding INTEGER DEFAULT 3,
  default_markup_type TEXT DEFAULT 'single_pct',
  default_markup_config JSONB DEFAULT '{"pct": 15}',
  credit_markup_config JSONB DEFAULT '{"pct": 10}',
  cause_categories TEXT[] DEFAULT ARRAY['Client Request', 'Design Error',
    'Unforeseen Condition', 'Code Change', 'Value Engineering',
    'Allowance Overage', 'Scope Clarification', 'Other'],
  approval_thresholds JSONB DEFAULT '[]', -- [{ "max_amount": 500, "approvers": ["pm"] }, ...]
  auto_generate_allowance_co BOOLEAN DEFAULT FALSE,
  co_draw_distribution TEXT DEFAULT 'next_draw',  -- 'next_draw' or 'spread_remaining'
  escalation_days INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/projects/:projectId/change-orders` | List COs for a project (filterable by status, cause, date range) |
| POST | `/api/v1/projects/:projectId/change-orders` | Create new CO (draft) |
| GET | `/api/v1/change-orders/:id` | Get CO detail with line items, approvals, messages |
| PUT | `/api/v1/change-orders/:id` | Update CO (draft or negotiation states only) |
| DELETE | `/api/v1/change-orders/:id` | Delete draft CO |
| POST | `/api/v1/change-orders/:id/submit` | Submit for internal approval |
| POST | `/api/v1/change-orders/:id/approve` | Record approval (internal step) |
| POST | `/api/v1/change-orders/:id/reject` | Reject CO with reason |
| POST | `/api/v1/change-orders/:id/present-to-client` | Send to client portal |
| POST | `/api/v1/change-orders/:id/client-approve` | Client e-signature approval |
| POST | `/api/v1/change-orders/:id/client-counter` | Client submits counter-proposal |
| POST | `/api/v1/change-orders/:id/withdraw` | Withdraw a CO |
| POST | `/api/v1/change-orders/:id/void` | Void an approved CO (with reversal) |
| GET | `/api/v1/change-orders/:id/versions` | Get version history |
| GET | `/api/v1/change-orders/:id/messages` | Get communication thread |
| POST | `/api/v1/change-orders/:id/messages` | Add message to thread |
| GET | `/api/v1/change-orders/:id/pdf/:template` | Generate PDF (internal or client template) |
| GET | `/api/v1/projects/:projectId/change-orders/summary` | CO summary stats for project |
| GET | `/api/v1/change-orders/reports/by-cause` | CO analytics by cause category |
| GET | `/api/v1/change-orders/reports/by-trade` | CO analytics by trade |
| GET | `/api/v1/change-orders/settings` | Get builder's CO settings |
| PUT | `/api/v1/change-orders/settings` | Update builder's CO settings |

---

## UI Components

1. **ChangeOrderList** - Filterable, sortable table of COs for a project with status badges.
2. **ChangeOrderForm** - Multi-section form: scope, line items, markup calculation, schedule impact.
3. **CostImpactCalculator** - Live calculation panel showing subtotal, markup, and total as line items are edited.
4. **ApprovalWorkflowTimeline** - Visual step-by-step approval chain showing completed, current, and pending steps.
5. **ClientCOPresentation** - Clean, client-facing CO view with scope description, cost, schedule impact, and e-signature widget.
6. **ESignatureWidget** - Signature pad with legal consent checkbox, captures signature image and metadata.
7. **NegotiationThread** - Chat-style message thread for CO negotiation between builder and client.
8. **COVersionComparison** - Side-by-side diff of two CO versions highlighting what changed.
9. **COAnalyticsDashboard** - Charts showing COs by cause, trade, trend, and project comparison.
10. **COSettingsPanel** - Builder-level configuration for numbering, markup, causes, and approval thresholds.

---

## Dependencies

- **Module 9:** Budget & Cost Tracking (budget line adjustment on approval)
- **Module 7:** Scheduling (schedule task extension on approval)
- **Module 3:** Core Data Model (project and contract references)
- **Module 11:** Basic Invoicing (draw schedule recalculation)
- **Module 16:** QuickBooks Integration (sync approved COs to accounting)
- **Module 18:** Selections & Allowances (auto-CO on overage)
- **Module 21:** RFI Management (RFI-to-CO workflow linking)
- **Module 5:** Notification Engine (approval notifications, client alerts)

---

## Open Questions

1. Should voided COs reverse the budget and contract changes, or create an offsetting CO?
2. What is the minimum e-signature standard for legal enforceability in all 50 states?
3. Should the platform support "T&M change orders" where actual cost is tracked post-approval with a not-to-exceed?
4. How do we handle COs on cost-plus contracts where markup structure differs from fixed-price COs?
5. Should allowance overage COs be batched (monthly) or generated individually per selection?
6. What is the retention policy for CO version history and negotiation messages?
