# Module 18: Purchase Order Management

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

End-to-end purchase order lifecycle from creation through delivery, invoicing, and closeout. POs can be created manually, generated from bid awards, or triggered by approved change orders. The module supports material ordering workflows with delivery tracking, three-way matching (PO to receipt to invoice), backorder management, and blanket POs for recurring material needs. Approval thresholds, templates, and workflows are fully configurable per builder. Committed costs from open POs feed directly into budget forecasting and cash flow projections.

## Proven Patterns from v1

### PO-Invoice Integration (Proven)
- PO line items track `invoiced_amount` — sum of approved/in_draw/paid invoice allocations
- Direct `po_line_item_id` link takes priority over cost code matching
- Proportional distribution for duplicate cost codes on same PO
- Overage detection: soft-block requiring `overridePoOverage` flag
- 39 endpoints in v1 covering full PO lifecycle

### PO Matching from Invoices (Proven)
Multi-signal strategy:
1. PO number found in invoice text
2. Vendor + Job combination match
3. Trade type mapping

Creates draft PO if no match found

---

## Gap Items Addressed

| Gap # | Description | Coverage |
|-------|-------------|----------|
| 395 | PO approval thresholds configurable per builder | Multi-tier approval workflow engine |
| 396 | PO templates - builder-specific formatting, terms, conditions | Branded template system |
| 397 | Emergency procurement - skip PO, log after the fact with override reason | Emergency PO bypass workflow |
| 398 | Procurement aggregation across projects | Cross-project order consolidation |
| 399 | Material receiving workflows - who confirms, how, field or office | Configurable receiving process |
| 400 | PO change orders - revising after issuance, version tracking | PO revision/amendment system |
| 401 | Procurement lead time management - order windows tied to schedule | Schedule-driven procurement alerts |
| 402 | Procurement status dashboards | Real-time PO and delivery monitoring |

---

## Detailed Requirements

### 1. PO Creation

**Creation methods:**
- **Manual:** PM creates a PO from scratch, selecting vendor, adding line items with cost codes, quantities, and unit prices.
- **From bid/contract award:** When a subcontractor bid is accepted, the system auto-generates a PO from the bid line items. Builder reviews and issues.
- **From change order:** Approved CO with material/sub needs auto-generates a draft PO linked to the CO.
- **From budget:** PM clicks "Create PO" from a budget line item; cost code, amount, and project pre-populate.
- **From schedule:** Procurement lead time alert triggers a "Create PO" action with the required-by date pre-filled (Gap #401).

**PO content:**
- Header: PO number, date, vendor, project, ship-to address, required-by date, payment terms.
- Line items: description, quantity, unit, unit price, cost code, tax, extended amount.
- Terms and conditions (from builder's template).
- Attachments: specs, drawings, cut sheets.
- Internal notes (not visible to vendor) and external notes (printed on PO).

### 2. PO Numbering
- Configurable per builder via template string: `PO-{SEQ}`, `{YEAR}-{PROJECT}-PO-{SEQ}`.
- Sequential counter per project or per builder (configurable).
- Padding configurable (3 or 4 digits).

### 3. Approval Workflow (Gap #395)

**Threshold-based routing:**
- Builder defines dollar thresholds and required approvers.
- Example: under $1,000 auto-approved, $1K-$10K PM approval, $10K+ Director + Owner.
- Approval chain is sequential or parallel (configurable).
- Approver can approve, reject (with reason), or request revision.
- Auto-escalation if not acted on within configurable number of days.
- Delegation: approver designates a backup during absence.

**Emergency bypass (Gap #397):**
- Authorized users (configurable role list) can issue an "emergency PO."
- Emergency POs skip normal approval but require: reason for emergency, after-the-fact approval, and are flagged in reporting.
- Emergency PO audit trail is separate and reviewable by builder owner.

### 4. Material Ordering Workflow
- **Draft:** PO created, not yet submitted for approval.
- **Pending Approval:** In the approval chain.
- **Approved:** Ready to send to vendor.
- **Sent:** Transmitted to vendor via email, vendor portal, or printed/mailed.
- **Acknowledged:** Vendor confirms receipt and acceptance (optional step, configurable).
- **Partial Delivery:** Some line items received, others pending.
- **Fully Received:** All items received and confirmed.
- **Invoiced:** Matched to vendor invoice.
- **Closed:** Fully received, invoiced, and paid.
- **Cancelled:** Voided before fulfillment (with reason).

### 5. Vendor Delivery & Communication
- PO is sent to vendor via email (PDF attachment) or through the vendor portal.
- Vendor can acknowledge the PO and provide estimated delivery dates through the portal.
- Vendor portal shows all open POs for their company with status and delivery schedule.
- Automated reminders to vendor for upcoming delivery dates.

### 6. Delivery Tracking (Gap #399)

**Receiving workflow:**
- Configurable: field team receives (mobile app) or office receives.
- Receiver selects the PO, checks off received line items, enters received quantities.
- Partial receipts are supported: record what arrived, backorder what did not.
- Photo documentation of received materials (optional but recommended).
- Damaged item reporting: flag items, add photos, auto-notify vendor.
- Receiving creates a "receipt record" linked to the PO.

**Delivery integration (Gap #518 from Section 33):**
- Future: integrate with UPS/FedEx/freight APIs for automatic delivery status updates.
- Manual tracking number entry in V1 with link to carrier tracking page.

### 7. Three-Way Matching (PO - Receipt - Invoice)
- When vendor invoice is entered, system attempts to match it to a PO.
- Match criteria: vendor, PO number (if on invoice), line item amounts.
- **Full match:** Invoice amount matches PO amount and received quantity. Auto-approve for payment.
- **Partial match:** Invoice covers some PO lines. Applied to those lines; remainder stays open.
- **Variance:** Invoice amount differs from PO. Flagged for review with variance amount and percentage.
- Configurable tolerance: auto-approve variances under X% or $Y (e.g., 2% or $50).
- Unmatched invoices go to a review queue for manual PO association or standalone processing.

### 8. Backorder Management
- When partial receipt is recorded, unreceived line items are automatically flagged as backordered.
- Backorder dashboard shows all outstanding items across all POs.
- Builder can: contact vendor for updated ETA, cancel backordered items, or create a new PO for substitute materials.
- Schedule impact alert: if backordered items affect scheduled tasks, a warning is surfaced.

### 9. Blanket Purchase Orders
- Blanket POs are standing orders for recurring materials (e.g., monthly lumber delivery).
- Defined with: vendor, material list, unit prices, total not-to-exceed amount, and validity period.
- Individual "releases" are issued against the blanket PO for specific quantities and delivery dates.
- System tracks total releases against the blanket PO limit and warns when approaching the cap.
- Blanket POs are useful for builders with ongoing material needs across multiple projects.

### 10. PO Amendments / Change Orders (Gap #400)
- After a PO is issued, changes are tracked as amendments (versions).
- Amendment records: what changed, who authorized, original value vs. new value.
- Vendor is notified of the amendment via email/portal.
- Each amendment increments the PO version number.
- Amendments above the original approval threshold trigger re-approval.
- Full version history is preserved and auditable.

### 11. Cross-Project Procurement Aggregation (Gap #398)
- System analyzes open POs and budget needs across all active projects.
- Alerts PM/purchasing: "You need 2x4 lumber for 3 projects this month. Consolidate for volume discount?"
- Consolidated PO option: create a single PO with delivery split across project job sites.
- Cost allocation: consolidated PO costs are split back to individual project budgets by quantity or percentage.

### 12. Schedule-Driven Procurement (Gap #401)
- Each material category has a configurable lead time (e.g., windows = 8 weeks, cabinets = 12 weeks).
- System cross-references the project schedule to calculate order deadlines.
- Dashboard alert: "Order windows by March 15 or the framing schedule slips."
- "Procurement calendar" view showing all upcoming order deadlines across projects.

### 13. PO Templates (Gap #396)
- Builder-branded PO document with configurable: logo, company info, terms and conditions, footer text.
- Multiple templates per builder (e.g., standard materials PO, subcontractor PO, equipment rental PO).
- PDF generation for email delivery and print.
- Terms and conditions are editable per template and per PO (override for specific vendors).

### 14. Procurement Dashboard (Gap #402)
- **Open POs:** All POs by status with aging.
- **Expected deliveries this week:** Calendar view of upcoming deliveries.
- **Past-due deliveries:** Items that should have arrived but have not been received.
- **Budget commitment:** Total committed (open PO) amounts by project and cost code.
- **Vendor performance:** On-time delivery rate, quality issues, pricing accuracy.
- Filterable by project, vendor, status, date range, and cost code.

---

## Database Tables

```sql
-- Purchase orders
CREATE TABLE v2_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  project_id UUID NOT NULL REFERENCES v2_projects(id),
  vendor_id UUID NOT NULL REFERENCES v2_vendors(id),
  po_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent',
                      'acknowledged', 'partial_delivery', 'fully_received',
                      'invoiced', 'closed', 'cancelled')),
  po_type TEXT NOT NULL DEFAULT 'standard'
    CHECK (po_type IN ('standard', 'blanket', 'emergency')),

  -- Dates
  issue_date DATE,
  required_by_date DATE,
  expected_delivery_date DATE,
  validity_end_date DATE,             -- for blanket POs

  -- Amounts
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  blanket_limit DECIMAL(12,2),        -- max for blanket POs
  blanket_used DECIMAL(12,2) DEFAULT 0,

  -- Shipping
  ship_to_address TEXT,
  ship_to_project_site BOOLEAN DEFAULT TRUE,

  -- Terms
  payment_terms TEXT,                 -- 'Net 30', 'Net 15', '2/10 Net 30'
  template_id UUID,
  terms_and_conditions TEXT,

  -- Tracking
  tracking_number TEXT,
  carrier TEXT,

  -- Linked entities
  change_order_id UUID,               -- if generated from a CO
  bid_id UUID,                        -- if generated from a bid award
  parent_po_id UUID,                  -- for blanket PO releases

  -- Internal
  internal_notes TEXT,
  external_notes TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  emergency_reason TEXT,
  version_number INTEGER DEFAULT 1,

  -- Approval
  current_approval_step INTEGER DEFAULT 0,
  approved_at TIMESTAMPTZ,
  approved_by UUID,

  created_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO line items
CREATE TABLE v2_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES v2_purchase_orders(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'each',
  unit_price DECIMAL(10,2) NOT NULL,
  extended_amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  cost_code_id UUID,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  received_quantity DECIMAL(10,2) DEFAULT 0,
  backordered_quantity DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt records
CREATE TABLE v2_po_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES v2_purchase_orders(id),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  received_by UUID NOT NULL REFERENCES v2_users(id),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,                      -- 'job_site', 'warehouse', 'office'
  notes TEXT,
  photos TEXT[],                      -- array of file URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt line items
CREATE TABLE v2_po_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES v2_po_receipts(id) ON DELETE CASCADE,
  po_item_id UUID NOT NULL REFERENCES v2_purchase_order_items(id),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  quantity_received DECIMAL(10,2) NOT NULL,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'wrong_item')),
  damage_notes TEXT,
  damage_photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO to invoice matching
CREATE TABLE v2_po_invoice_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES v2_purchase_orders(id),
  invoice_id UUID NOT NULL,           -- references v2_invoices
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  match_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (match_status IN ('full_match', 'partial_match', 'variance', 'pending', 'manual')),
  po_amount DECIMAL(12,2),
  invoice_amount DECIMAL(12,2),
  variance_amount DECIMAL(12,2),
  variance_pct DECIMAL(5,2),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO approval steps
CREATE TABLE v2_po_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES v2_purchase_orders(id) ON DELETE CASCADE,
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  step_order INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES v2_users(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'delegated', 'escalated')),
  decision_at TIMESTAMPTZ,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO version history for amendments
CREATE TABLE v2_po_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES v2_purchase_orders(id),
  builder_id UUID NOT NULL REFERENCES v2_builders(id),
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_description TEXT,
  changed_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builder-level PO settings
CREATE TABLE v2_po_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL UNIQUE REFERENCES v2_builders(id),
  numbering_template TEXT DEFAULT 'PO-{SEQ}',
  seq_padding INTEGER DEFAULT 4,
  seq_scope TEXT DEFAULT 'builder' CHECK (seq_scope IN ('builder', 'project')),
  approval_thresholds JSONB DEFAULT '[]',
  auto_approve_variance_pct DECIMAL(5,2) DEFAULT 2.0,
  auto_approve_variance_amt DECIMAL(10,2) DEFAULT 50.0,
  emergency_po_roles TEXT[] DEFAULT ARRAY['owner', 'director'],
  receiving_mode TEXT DEFAULT 'field' CHECK (receiving_mode IN ('field', 'office', 'both')),
  require_receipt_photos BOOLEAN DEFAULT FALSE,
  escalation_days INTEGER DEFAULT 3,
  lead_times JSONB DEFAULT '{}',      -- { "windows": 56, "cabinets": 84, "lumber": 7 } in days
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/projects/:projectId/purchase-orders` | List POs for a project |
| POST | `/api/v1/projects/:projectId/purchase-orders` | Create new PO |
| GET | `/api/v1/purchase-orders/:id` | Get PO detail with line items, receipts, matches |
| PUT | `/api/v1/purchase-orders/:id` | Update PO (draft or amendment) |
| DELETE | `/api/v1/purchase-orders/:id` | Delete draft PO |
| POST | `/api/v1/purchase-orders/:id/submit` | Submit for approval |
| POST | `/api/v1/purchase-orders/:id/approve` | Approve PO |
| POST | `/api/v1/purchase-orders/:id/reject` | Reject PO with reason |
| POST | `/api/v1/purchase-orders/:id/send` | Send PO to vendor (email/portal) |
| POST | `/api/v1/purchase-orders/:id/acknowledge` | Vendor acknowledges PO |
| POST | `/api/v1/purchase-orders/:id/cancel` | Cancel PO with reason |
| POST | `/api/v1/purchase-orders/:id/amend` | Create an amendment (new version) |
| GET | `/api/v1/purchase-orders/:id/versions` | Get PO version history |
| POST | `/api/v1/purchase-orders/:id/receive` | Record a receipt |
| GET | `/api/v1/purchase-orders/:id/receipts` | Get all receipts for a PO |
| POST | `/api/v1/purchase-orders/:id/match-invoice` | Match an invoice to this PO |
| GET | `/api/v1/purchase-orders/:id/matches` | Get invoice matches for a PO |
| POST | `/api/v1/purchase-orders/:id/matches/:matchId/approve` | Approve a variance match |
| GET | `/api/v1/purchase-orders/:id/pdf` | Generate PO PDF |
| GET | `/api/v1/purchase-orders/dashboard` | Procurement dashboard data |
| GET | `/api/v1/purchase-orders/backorders` | All backordered items across POs |
| GET | `/api/v1/purchase-orders/deliveries` | Expected deliveries calendar data |
| GET | `/api/v1/purchase-orders/aggregation` | Cross-project aggregation opportunities |
| GET | `/api/v1/purchase-orders/procurement-calendar` | Schedule-driven order deadlines |
| GET | `/api/v1/purchase-orders/settings` | Get builder's PO settings |
| PUT | `/api/v1/purchase-orders/settings` | Update builder's PO settings |

---

## UI Components

1. **PurchaseOrderList** - Filterable table of POs with status badges, amounts, and vendor info.
2. **PurchaseOrderForm** - Multi-section form: header, line items (add/remove/reorder), terms, notes, attachments.
3. **POLineItemEditor** - Inline-editable row with cost code picker, quantity, unit, price, and auto-calculated extended amount.
4. **ApprovalWorkflowBar** - Horizontal step indicator showing approval progress.
5. **ReceivingForm** - Mobile-friendly checklist of PO items with quantity inputs, condition selectors, and photo capture.
6. **ThreeWayMatchPanel** - Side-by-side view of PO, receipt, and invoice with match status and variance highlighting.
7. **BackorderDashboard** - List of all backordered items with vendor, expected date, and schedule impact indicators.
8. **ProcurementCalendar** - Calendar view of order deadlines and expected deliveries across all projects.
9. **AggregationSuggestions** - Cards showing consolidation opportunities with potential savings estimate.
10. **BlanketPOManager** - Blanket PO detail with release history, usage gauge, and "create release" action.
11. **POVersionHistory** - Timeline of amendments with diff view between versions.
12. **ProcurementDashboard** - Overview cards: open POs, this week's deliveries, past-due, committed costs.
13. **POSettingsPanel** - Builder-level configuration for numbering, thresholds, lead times, and receiving rules.

---

## Dependencies

- **Module 9:** Budget & Cost Tracking (committed costs, cost code association)
- **Module 10:** Contact/Vendor Management (vendor selection, vendor portal)
- **Module 7:** Scheduling (lead time alerts, delivery impact on schedule)
- **Module 11:** Basic Invoicing (invoice matching)
- **Module 17:** Change Orders (CO-generated POs)
- **Module 16:** QuickBooks Integration (sync POs as Bills to accounting)
- **Module 5:** Notification Engine (approval alerts, delivery reminders)

---

## Material Substitution Management

Formal workflow for managing material substitutions when specified materials are unavailable.

- **Substitution Workflow:** Original spec → Proposed substitute → Approval chain (architect and/or owner) → Accepted/Rejected. Each step tracked with timestamps.
- **Comparison Documentation:** Side-by-side comparison of original material and proposed substitute including price, specifications, lead time, and warranty differences.
- **Substitution Log:** Permanent log per project recording every substitution with reason, approver, and cost impact (positive or negative).
- **Selections Integration:** Client-visible substitutions sync to the selections module (Module 25) so homeowners see the final material in their selections dashboard.

## Payment Term Optimization

Track and optimize vendor payment terms to improve cash flow.

- **Payment Term Tracking:** Record vendor payment terms per PO (Net 30, 2/10 Net 30, Due on Receipt, etc.).
- **Early-Pay Discount Dashboard:** Surface all invoices eligible for early-pay discounts with dollar savings if paid within the discount window.
- **Cash Flow Impact Analysis:** Compare cost of paying early (lost float) versus discount captured; recommend optimal pay date.
- **Per-Vendor Configuration:** Store default payment terms per vendor in vendor management; auto-populate on new POs.

---

## Open Questions

1. Should blanket POs span multiple projects or be project-specific?
2. What is the maximum number of line items per PO before performance degrades? (Target: 500+)
3. Should the platform support electronic data interchange (EDI) with large suppliers in V1?
4. How do we handle sales tax calculation - manual entry, rate lookup by address, or integration with a tax service (Avalara)?
5. Should PO receiving support barcode/QR scanning for item identification in V1?
6. How do we handle POs in foreign currencies for builders near the Canadian or Mexican border?
7. What is the archival policy for closed POs? (Accessible for 7 years per IRS requirements?)
