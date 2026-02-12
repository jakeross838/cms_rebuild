# Module 11: Basic Invoicing

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Core invoice management for receiving, coding, approving, and tracking vendor/subcontractor invoices. This module handles the full invoice lifecycle from receipt through payment scheduling. All workflows are configurable per builder to support different organizational structures, approval hierarchies, and contract types. Module 13 (Invoice AI) extends this with OCR extraction and intelligent coding; this module provides the manual-entry foundation and approval engine that AI builds upon.

---

## Proven Patterns from v1

The following patterns have been validated in the production v1 CMS application and should be carried forward into the rebuild.

### Invoice State Machine (Proven)
```
needs_review → ready_for_approval → approved → in_draw → billed
     ↓              ↓                    ↓
   denied         denied             (can revert)
     ↓
   split (children processed independently)
```

Pre-transition requirements:
- `ready_for_approval`: Must have job_id + vendor_id
- `approved`: Must have job_id + vendor_id + balanced allocations (±$0.01 tolerance)
- `in_draw`: Must specify draw_id
- `billed`: Must be in a funded draw

Locked statuses (require unlock to edit): ready_for_approval, approved, in_draw, billed, split

### Allocation System (Proven)
- Idempotent: POST /allocate replaces all allocations (not upsert)
- Balance validation: allocations sum must equal invoice amount (±$0.01)
- Credit memos: allocations must be negative
- PO sync: on approval, recalculate PO line item invoiced_amount
- CO auto-inheritance: if PO linked to CO, auto-set change_order_id on allocations

### PDF Stamping (Proven)
- Always stamps from ORIGINAL pdf_url (never accumulates stamps)
- Fixed output path: {job_id}/{invoice_id}_stamped.pdf
- Lock mechanism prevents concurrent stamps
- Stamp format varies by status (Needs Review → Coded → Approved → In Draw → Paid)

### Duplicate Detection (Proven)
- Hash: vendor_id|invoice_number|amount (normalized)
- Stored in v2_invoice_hashes
- 409 Conflict on high-confidence match (>=0.95)

### Multi-Invoice PDF Handling (Proven)
- Analyze phase: OCR scans for page breaks, vendor headers, separate invoice sections
- Split phase: PDF split by boundaries, each processed independently
- Single invoice splitting: parent → children with split_index, parent status = "split"

### Vendor Payment Tracking (Proven)
- Separate from invoice status: paid_to_vendor, paid_to_vendor_date, paid_to_vendor_amount, paid_to_vendor_ref
- Supports partial payments
- Methods: check, ach, wire, credit_card, cash, other

---

## PDF Stamping System (Proven v1 — Key Differentiator)

The PDF stamping system is a major differentiator of the platform. Every invoice PDF receives a dynamically generated visual stamp that reflects its current status, cost coding, PO billing progress, and approval metadata. The stamp is regenerated from the original PDF on every status change, ensuring accuracy and preventing stamp-on-stamp accumulation.

### Stamp Architecture
- **3 design versions exist:** v1 (legacy), v2 (professional with progress bars), v3 (active — clean, minimal Gemini-designed)
- Uses **pdf-lib** with `StandardFonts` (Helvetica / Helvetica Bold)
- Always stamps from **ORIGINAL** `pdf_url` (never accumulates stamps on stamps)
- Fixed output path: `{job_id}/{invoice_id}_stamped.pdf`
- Only stamps **first page** of multi-page PDFs
- In-memory lock prevents concurrent stamping (60-sec auto-expiry, try-finally release)

### V3 Design Specs (Active)

Stamp dimensions: **220 x 115pt** with 12pt padding and 6pt left accent strip.

**Color Palette:**

| Name | Hex | Usage |
|------|-----|-------|
| Green | `#338855` | Approved |
| Slate | `#4A6672` | Brand / secondary text |
| Amber | `#B38C20` | Partial allocation |
| Orange | `#D98C20` | Needs Review |
| Blue | `#598BC0` | Pending / Ready for Approval |
| Purple | `#664D99` | Split |

**Layout (top to bottom):**

1. **Left accent strip** — 6pt wide, color determined by status
2. **Status + Amount** — Helvetica Bold 12pt (status left-aligned, amount right-aligned)
3. **Job name** — Helvetica Bold 9pt, slate color, truncated to 28 chars
4. **Horizontal divider** — 0.5pt light gray line
5. **Cost codes** — max 3 shown, `+N more...` if overflow, 8pt font, code + name (15 chars) + amount right-aligned
6. **PO reference** — `PO-XXXX`, progress: `85% billed ($12K of $14K)`, compact money format
7. **CO reference** — `CO #123: Title` in slate (displayed if PO is linked to a CO)
8. **Footer** — `Jan 15, 2025 • Jane Smith`, 7pt gray, centered

### Rotation-Aware Positioning

The stamp adapts its placement and text rotation to handle PDFs that have been scanned or saved in non-standard orientations:

| Page Rotation | Stamp Position | Text Rotation |
|---------------|---------------|---------------|
| 0° (standard) | Top-right corner | None |
| 90° | Left edge | Text rotated 90° |
| 180° | Bottom-left corner | Text rotated 180° |
| 270° | Right edge | Text rotated 270° |

### Status-Specific Stamps

| Status | Display Text | Accent Color | Content |
|--------|-------------|-------------|---------|
| needs_review | "NEEDS REVIEW" | Orange | Amount, Vendor, Invoice#, Review flags (max 2) |
| ready_for_approval | "READY FOR APPROVAL" | Blue | Amount, Job, Cost codes (max 3), Coder name |
| approved | "APPROVED" | Green | Amount, Job, Cost codes, PO info, CO info |
| in_draw | "APPROVED" + "DRAW #X" badge | Green | Same as approved + IN DRAW badge (bottom-right, white on slate) |
| paid | "APPROVED" + "PAID" watermark | Green | Same as approved + diagonal 72pt "PAID" at 15% opacity, -30° rotation |
| split | "SPLIT" | Purple | Shows "SPLIT 2/5" indicator |
| partial allocation | "PARTIAL" | Amber | Shows `$X remaining` |

### PO Billing Calculation on Stamp

The stamp includes a real-time PO billing progress indicator. The calculation logic:

1. Get PO `total_amount`
2. Sum **THIS** invoice's non-CO allocations (exclude cost codes ending in `'C'`)
3. Sum **PRIOR** approved/in_draw/paid invoice allocations (non-CO only)
4. `billedWithThis = prior + this`
5. `percentage = (billedWithThis / poTotal) * 100`
6. `remaining = poTotal - billedWithThis`

> **Important:** CO work is explicitly excluded from PO capacity calculations. Cost codes ending in `'C'` are filtered out at both the current-invoice and prior-invoice summation steps.

### Stamp Trigger Points

The stamp is regenerated (not appended) at the following points in the invoice lifecycle:

1. **After approval** → `restampInvoice()`
2. **After allocation update** → `restampInvoice()`
3. **During batch approval** → `stampInvoice()` per invoice
4. **During draw assignment** → `restampInvoice()`
5. **During split operation** → `restampInvoice()` for each child invoice

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 341 | Configurable approval workflows (1/2/3-step, threshold-based routing) | Multi-level approval chain engine with configurable thresholds per builder |
| 342 | Invoice processing for different contract types (lump sum, T&M, unit price) | Contract-type-aware validation rules and required fields |
| 343 | Invoice coding with different cost code structures per builder | Dynamic cost code picker driven by builder's configured hierarchy |
| 344 | Per-tenant invoice pattern learning | Foundation data model; AI learning handled in Module 13 |
| 345 | PO matching optional per builder | Configurable setting: require PO match, suggest PO match, or skip |
| 346 | Progress billing vs. final billing workflows | Invoice type field with different approval criteria per type |
| 347 | Retainage calculation varying by contract/vendor/project | Configurable retainage rules engine (percentage, flat, or none) |
| 348 | Conditional payment rules (insurance, lien waiver required) | Payment prerequisite checklist configurable per builder |
| 349 | Invoice disputes (tracking, communication, resolution) | Dispute status workflow with communication log |
| 350 | Batch payment recommendations | Payment batch generation from approved invoices by due date |
| 285 | Retainage varying by builder, trade, contract (Section 12) | Retainage rules configurable at contract, vendor, and project levels |

---

## Detailed Requirements

### 1. Invoice Receipt and Data Entry

- Manual invoice entry form with fields: vendor, invoice number, invoice date, due date, amount, description, project, contract type, line items
- Attachment upload for invoice document (PDF, image)
- Invoice line items with: description, quantity, unit price, cost code, phase, amount
- Auto-population of vendor details from contact/vendor management (Module 10)
- Duplicate detection on vendor + invoice number combination (warn, not block)
- Support for credit memos (negative invoices) linked to original invoice
- Builder-configurable required fields (some require PO number, some do not)

### 2. Invoice Coding

- Cost code picker driven by builder's configured cost code hierarchy (CSI, custom, hybrid)
- Phase allocation within a project
- Split coding across multiple cost codes and/or projects
- Default cost code suggestions based on vendor (manual rules; AI suggestions in Module 13)
- Validation against budget remaining (warn if invoice exceeds budget line)
- Cost code search with type-ahead filtering

### 3. Multi-Level Approval Workflow

- Builder-configurable approval chains:
  - Single approver (any invoice, one person approves)
  - Threshold-based routing (under $5K: PM approves; $5K-$25K: PM + Director; over $25K: PM + Director + Owner)
  - Role-based routing (trade invoices go to field super, material invoices go to PM)
  - Project-specific overrides (high-profile projects require owner approval on everything)
- Approval chain configuration UI in builder settings
- Approval actions: Approve, Reject (with reason), Request Changes, Delegate
- Email/push notification on approval assignment
- Approval history log with timestamps and notes
- Escalation rules: auto-escalate if not acted on within configurable timeframe
- Bulk approval for multiple invoices meeting criteria

### 4. Contract Type Handling

- **Lump Sum:** Validate against contract value and prior billings; track percent complete
- **Time & Materials:** Require timesheet reference; validate hourly rates against contract rates; verify hours
- **Unit Price:** Require quantity verification; validate unit prices against contract schedule
- **Cost Plus:** Track actual costs; apply fee/markup calculation per contract terms
- Contract type drives which fields are required and which validation rules apply

### 5. PO Matching

- Configurable per builder: Required / Suggested / Disabled
- When enabled, invoice can be linked to one or more POs
- Three-way match: PO amount vs. receipt/delivery vs. invoice amount
- Tolerance thresholds configurable (e.g., allow 5% variance without flag)
- Unmatched invoice report for builders who require PO matching

### 6. Retainage Management

- Retainage rules configurable at multiple levels (builder default, project override, vendor override, contract override)
- Retainage percentage or flat amount
- Automatic retainage calculation on invoice approval
- Retainage tracking: withheld, released, remaining
- Retainage release workflow (separate approval, often at project closeout)
- Progress vs. final retainage rules (different percentage at different project stages)

### 7. Payment Scheduling and Tracking

- Payment status tracking: Unpaid, Scheduled, Paid, Partially Paid, Voided
- Payment date recording with check/ACH reference number
- Payment prerequisite checklist (configurable per builder):
  - Current certificate of insurance on file
  - Signed lien waiver received (links to Module 14)
  - W-9 on file
  - Contract fully executed
  - Custom prerequisites defined by builder
- Batch payment generation: group approved invoices by due date, generate payment recommendation
- Payment terms tracking (Net 30, Net 15, Due on Receipt, etc.)
- Early payment discount tracking (2/10 Net 30)
- Aging reports: current, 30, 60, 90, 120+ days

### 8. Invoice Disputes

- Dispute initiation from invoice detail (partial or full amount)
- Dispute reason categories (configurable): incorrect amount, wrong scope, quality issue, duplicate, missing documentation
- Communication log on disputed invoices (internal notes + vendor communication)
- Dispute resolution: adjust amount, void invoice, request credit memo, resolve as-is
- Dispute aging tracking

---

## Database Tables

```
v2_invoices
  id, builder_id, project_id, vendor_id, contract_id,
  invoice_number, invoice_date, due_date, received_date,
  subtotal, tax, retainage_amount, total_amount, amount_paid,
  invoice_type (standard|progress|final|credit_memo|retainage_release),
  contract_type (lump_sum|time_materials|unit_price|cost_plus),
  status (draft|submitted|in_review|approved|disputed|scheduled|paid|voided),
  po_id, payment_terms, notes, attachment_url,
  created_by, created_at, updated_at

v2_invoice_line_items
  id, builder_id, invoice_id, description, quantity, unit_price,
  amount, cost_code_id, phase_id, project_id,
  sort_order, created_at, updated_at

v2_invoice_approval_chains
  id, builder_id, name, is_default, is_active,
  created_at, updated_at

v2_invoice_approval_steps
  id, builder_id, chain_id, step_order, approver_role,
  approver_user_id, min_threshold, max_threshold,
  escalation_hours, created_at, updated_at

v2_invoice_approvals
  id, builder_id, invoice_id, step_id, approver_id,
  action (pending|approved|rejected|changes_requested|delegated),
  notes, acted_at, delegated_to, created_at

v2_invoice_disputes
  id, builder_id, invoice_id, disputed_amount, reason_category,
  description, status (open|in_progress|resolved|closed),
  resolution_type, resolution_notes,
  opened_by, opened_at, resolved_by, resolved_at

v2_payment_prerequisites
  id, builder_id, name, description, is_required,
  prerequisite_type (insurance|lien_waiver|w9|contract|custom),
  sort_order, created_at

v2_invoice_payments
  id, builder_id, invoice_id, payment_date, amount,
  payment_method (check|ach|wire|credit_card),
  reference_number, notes, created_by, created_at

v2_retainage_rules
  id, builder_id, scope (default|project|vendor|contract),
  scope_id, retainage_pct, retainage_flat,
  release_trigger (manual|project_complete|phase_complete),
  created_at, updated_at
```

---

## API Endpoints

```
# Invoice CRUD
GET    /api/v2/invoices                    # List with filters (project, vendor, status, date range)
GET    /api/v2/invoices/:id                # Invoice detail with line items and approvals
POST   /api/v2/invoices                    # Create invoice
PUT    /api/v2/invoices/:id                # Update invoice (only in draft/submitted)
DELETE /api/v2/invoices/:id                # Soft delete (draft only)

# Line Items
POST   /api/v2/invoices/:id/line-items     # Add line item
PUT    /api/v2/invoices/:id/line-items/:lid # Update line item
DELETE /api/v2/invoices/:id/line-items/:lid # Remove line item

# Approval Workflow
POST   /api/v2/invoices/:id/submit         # Submit for approval
POST   /api/v2/invoices/:id/approve        # Approve (current step)
POST   /api/v2/invoices/:id/reject         # Reject with reason
POST   /api/v2/invoices/:id/request-changes # Request changes
POST   /api/v2/invoices/bulk-approve       # Bulk approve multiple invoices

# Approval Chain Configuration
GET    /api/v2/settings/approval-chains    # List configured chains
POST   /api/v2/settings/approval-chains    # Create chain
PUT    /api/v2/settings/approval-chains/:id # Update chain
DELETE /api/v2/settings/approval-chains/:id # Delete chain

# Payments
POST   /api/v2/invoices/:id/payments       # Record payment
GET    /api/v2/invoices/:id/payments       # Payment history
POST   /api/v2/payments/batch              # Generate batch payment recommendation
GET    /api/v2/invoices/aging              # Aging report

# Disputes
POST   /api/v2/invoices/:id/disputes       # Open dispute
PUT    /api/v2/invoices/:id/disputes/:did  # Update/resolve dispute

# Retainage
GET    /api/v2/retainage                   # Retainage summary by project/vendor
POST   /api/v2/retainage/release           # Release retainage
GET    /api/v2/settings/retainage-rules    # List retainage rules
POST   /api/v2/settings/retainage-rules    # Create retainage rule
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| InvoiceListPage | Filterable/sortable table with status badges, aging indicators, bulk actions |
| InvoiceDetailPage | Full invoice view with line items, approval timeline, payment history, dispute log |
| InvoiceForm | Create/edit form with dynamic fields based on contract type |
| LineItemEditor | Inline editable line items with cost code picker and split coding |
| ApprovalChainConfig | Builder settings page for configuring approval chains and thresholds |
| ApprovalActionBar | Approve/Reject/Delegate buttons with notes modal |
| PaymentRecordModal | Record payment with method, reference number, amount |
| BatchPaymentView | List of approved invoices grouped by due date with batch action |
| AgingReportView | Current/30/60/90/120+ aging buckets with drill-down |
| DisputePanel | Side panel for managing invoice disputes and communication |
| RetainageTracker | Dashboard showing retainage withheld/released by project and vendor |

---

## Dependencies

- **Module 3:** Core Data Model (projects, cost codes, phases)
- **Module 6:** Document Storage (invoice attachment upload and retrieval)
- **Module 9:** Budget & Cost Tracking (budget validation, cost allocation posting)
- **Module 10:** Contact/Vendor Management (vendor lookup, insurance/W-9 status)
- **Module 13:** Invoice AI (extends with OCR extraction and auto-coding; not required)
- **Module 14:** Lien Waivers (payment prerequisite checking)

---

## Open Questions

1. Should the system support recurring invoices (e.g., monthly equipment rental)? If so, auto-generate or just remind?
2. What is the maximum number of approval steps allowed in a chain? (Suggest cap at 5 to prevent workflow bloat.)
3. Should payment recording integrate with an external payment system (bill.com, Melio) or remain manual entry?
4. How should partial payments against a single invoice be handled for retainage tracking?
5. Should invoice data feed into cash flow forecasting (Module 24), or is that a separate calculation?
6. What retention policy applies to voided/deleted invoices? Soft delete with audit trail forever, or archival after N years?
