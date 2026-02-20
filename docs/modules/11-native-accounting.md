# Module 11: Native Accounting (GL/AP/AR)

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-20

---

## Overview

Full native accounting engine for construction companies, providing General Ledger, Accounts Payable, and Accounts Receivable capabilities purpose-built for the construction industry. This module replaces the need for external accounting software while still supporting optional bi-directional sync with QuickBooks, Xero, and Sage via Module 16.

**Accounts Payable (AP):** Core invoice management for receiving, coding, approving, and tracking vendor/subcontractor invoices. Handles the full invoice lifecycle from receipt through payment scheduling. All workflows are configurable per builder to support different organizational structures, approval hierarchies, and contract types. Module 13 (Invoice AI) extends this with OCR extraction and intelligent coding.

**General Ledger (GL):** Double-entry bookkeeping engine with a construction-specific chart of accounts, configurable fiscal periods, journal entries, trial balance, and financial statement generation. Supports both accrual and cash-basis accounting with real-time financial visibility.

**Accounts Receivable (AR):** Client billing, draw request tracking, payment receipt processing, retainage receivable management, and collection workflows. Generates AIA G702/G703 billing documents and custom invoice formats for client billing.

**Bank Reconciliation:** Match bank transactions against GL entries to reconcile accounts. Supports bank feed imports (OFX/QFX/CSV) and rule-based auto-matching.

Builders can use RossOS as their sole accounting system OR use it alongside QuickBooks/Xero/Sage with Module 16 handling the sync. The native accounting engine ensures all financial data is available in real-time without waiting for external system sync cycles.

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

### Edge Cases & What-If Scenarios

1. **PDF stamping robustness across formats.** The PDF stamping system must handle non-standard PDFs gracefully. Required behavior:
   - **Encrypted/password-protected PDFs:** If the original PDF is encrypted and cannot be modified, the system must detect this before attempting to stamp. Alert the user that the PDF cannot be stamped and offer to create a wrapper page with the stamp information followed by the original PDF pages.
   - **Corrupted or malformed PDFs:** If pdf-lib fails to parse the original PDF, catch the error and fall back to generating a standalone stamp-only page that references the invoice. The original PDF is preserved as-is and linked alongside the stamp page.
   - **Very large PDFs (50+ pages):** Stamping must not timeout. Since only the first page is stamped, the system should read and modify only the first page without loading the entire PDF into memory if possible.
   - **Scanned images saved as PDF:** These often have non-standard page dimensions or embedded images that conflict with stamp placement. The rotation-aware positioning system must handle atypical page sizes (e.g., 8.5x14, A3, or non-standard scanner output) by calculating stamp position relative to the actual page dimensions.
   - **PDFs with form fields or annotations:** Stamping must not destroy existing form fields or annotations in the original PDF.

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

### PART A: ACCOUNTS PAYABLE (AP)

### 1. Invoice Receipt and Data Entry

- Manual invoice entry form with fields: vendor, invoice number, invoice date, due date, amount, description, project, contract type, line items
- Attachment upload for invoice document (PDF, image)
- Invoice line items with: description, quantity, unit price, cost code, phase, amount
- Auto-population of vendor details from contact/vendor management (Module 10)
- Duplicate detection on vendor + invoice number combination (warn, not block)
- Support for credit memos (negative invoices) linked to original invoice
- Builder-configurable required fields (some require PO number, some do not)

#### Edge Cases & What-If Scenarios

1. **Duplicate invoice submission.** A vendor submits the same invoice twice (same vendor, same invoice number, same or similar amount). The existing duplicate detection (vendor + invoice number + amount hash) warns on submission. Required additional behavior:
   - Near-duplicate detection: flag invoices where vendor and amount match but invoice number differs by only a trailing character (e.g., "INV-1001" vs. "INV-1001a") -- these may be re-submissions with a modified number.
   - Time-window check: if the same vendor submits an invoice with the same amount within 30 days of a prior invoice, flag for review even if the invoice number differs.
   - The duplicate warning must be non-blocking (configurable to blocking per builder) and must clearly show the potential duplicate invoice side-by-side for comparison.
   - If a true duplicate is confirmed, the system marks it as "duplicate -- rejected" with a link to the original invoice.

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

### 4a. Progress Billing vs. Final Billing Workflows (Gap 346)

The system must differentiate between progress invoices and final invoices with distinct validation and approval criteria:

**Progress Billing:**
- Invoice type = `progress`. Represents partial work completed during a billing period.
- Required fields: billing period (start/end dates), percent complete for this period, cumulative percent complete.
- Validation: cumulative billings must not exceed contract value (or GMP/NTE cap). System warns when cumulative progress billings approach contract limit.
- Retainage: standard retainage percentage applied per the contract terms.
- Approval criteria: standard approval chain applies.

**Final Billing:**
- Invoice type = `final`. Represents the last invoice on a contract -- all remaining work is complete.
- Required fields: confirmation that all work is complete, final retainage release request (if applicable).
- Validation: system checks that all prior progress invoices are in `approved` or `paid` status. Final invoice amount should reconcile with contract value minus prior billings. Variance must be explained.
- Retainage: final invoice may include a retainage release request. The retainage release follows a separate approval path (often requires higher-level approval than progress invoices).
- Approval criteria: final invoices require additional approval steps configurable per builder (e.g., superintendent confirms work is complete, PM confirms punch list is cleared, director approves final payment).
- Compliance gate: final lien waiver must be received before final payment is released (configurable enforcement level -- strict blocks payment, warn allows with flag).
- Closeout linkage: marking a final invoice as `paid` can trigger the contract closeout checklist in Module 38.

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

#### Edge Cases & What-If Scenarios

1. **Fraudulent invoice discovered post-payment.** An invoice is approved and paid, but later found to be fraudulent or erroneous. Required behavior:
   - The system must support voiding a paid invoice with a documented reason.
   - Voiding a paid invoice creates a reversal entry: the budget line's actual cost is reduced, the vendor's payment record is flagged as "voided -- recovery pending," and the AP aging report reflects the outstanding recovery.
   - If the invoice was included in a draw request, the draw reconciliation report must surface the voided amount as a line item requiring lender notification.
   - A "recovery tracking" workflow must be available: mark the voided amount as recovered (with reference number), partially recovered, or written off.
   - Audit trail captures: who voided, when, reason, and all downstream financial adjustments.

### 8. Vendor Credit Tracking

- **Credit/Refund Tracking:** Track vendor credits and refunds when materials are returned or pricing adjustments are made.
- **Credit Memo Linkage:** Credit memos link back to the original PO and invoice for full audit trail.
- **Credit Application:** Apply credits against future invoices or as a budget adjustment on the originating cost code.
- **v1 Compatibility:** v1 already supports `credit_memo` as an invoice type; carry forward and extend with explicit PO/invoice linkage.

### 9. Invoice Disputes

- Dispute initiation from invoice detail (partial or full amount)
- Dispute reason categories (configurable): incorrect amount, wrong scope, quality issue, duplicate, missing documentation
- Communication log on disputed invoices (internal notes + vendor communication)
- Dispute resolution: adjust amount, void invoice, request credit memo, resolve as-is
- Dispute aging tracking

---

### PART B: GENERAL LEDGER (GL)

### 10. Chart of Accounts

- **Construction-specific default chart of accounts** provided at tenant setup:
  - Assets: Cash, AR, Retainage Receivable, Inventory, Work in Progress, Equipment, Accumulated Depreciation
  - Liabilities: AP, Retainage Payable, Accrued Expenses, Notes Payable, Client Deposits
  - Equity: Owner's Equity, Owner's Draws, Retained Earnings
  - Revenue: Contract Revenue, Change Order Revenue, Service Revenue, Other Income
  - COGS/Expenses: Direct Labor, Materials, Subcontractor Costs, Equipment Costs, Overhead
- Builder can customize: add accounts, rename accounts, deactivate accounts, reorganize hierarchy
- Account numbering: configurable (4-digit, 5-digit, or custom format)
- Account types: Asset, Liability, Equity, Revenue, Expense (system-enforced, drives debit/credit rules)
- Sub-account support: parent-child hierarchy (e.g., 1100 Cash > 1110 Operating Account > 1120 Trust Account)
- Account groupings for financial statement presentation (configurable sections and ordering)
- Locked accounts: system accounts required for platform operation cannot be deleted (can be renamed)
- Cost code to GL account mapping: each cost code maps to one or more GL accounts for automatic posting

#### Edge Cases & What-If Scenarios

1. **Builder migrating from QuickBooks with an existing chart of accounts.** The system must support importing a chart of accounts from QBO/Xero via Module 16, mapping imported accounts to the platform's account structure. If the builder's COA doesn't match the construction-specific default, the system suggests mappings but allows full customization. Historical transactions imported from QBO are posted to the mapped accounts. The import must handle account number conflicts (builder uses 4000 for revenue, platform default uses 4000 for a different account) by offering rename, remap, or skip options.

### 11. Journal Entries

- **Automatic journal entries** generated by platform events:
  - Invoice approved → Debit Expense (by cost code GL mapping), Credit AP
  - Payment to vendor → Debit AP, Credit Cash
  - Draw request submitted → Debit AR, Credit Revenue (or Deferred Revenue, per method)
  - Client payment received → Debit Cash, Credit AR
  - Retainage withheld → Debit Retainage Receivable, Credit Revenue (or AR)
  - Retainage released → Debit Cash, Credit Retainage Receivable
  - Material consumed from inventory → Debit COGS/Material Expense, Credit Inventory
  - Payroll posting → Debit Direct Labor (by cost code), Credit Cash/Payroll Liability
  - Depreciation → Debit Depreciation Expense, Credit Accumulated Depreciation
- **Manual journal entries** for adjustments, corrections, accruals, reclassifications:
  - Must balance (total debits = total credits)
  - Required fields: date, description, at least two line items
  - Optional: job/project reference, cost code reference, recurring flag
  - Approval workflow: configurable (none, single approver, owner-only)
- **Recurring journal entries:** scheduled entries that auto-post on a configurable interval (monthly overhead allocation, depreciation, loan payments)
- **Reversing entries:** option to auto-reverse an accrual entry on the first day of the next period
- **Journal entry templates:** save common entries as templates for quick reuse
- Each journal entry gets a sequential reference number per builder (JE-0001, JE-0002, etc.)
- Full audit trail: who created, approved, and any modifications

### 12. Trial Balance

- **Real-time trial balance** showing all GL accounts with debit/credit balances
- Filterable by date range (shows activity for the period)
- Drill-down from any account to the underlying journal entries
- Adjusted vs. unadjusted trial balance (pre and post adjusting entries)
- Export to Excel/PDF for accountant review
- Period comparison: side-by-side trial balance for two periods

### 13. Financial Statements

**Balance Sheet:**
- Assets, Liabilities, Equity presentation
- Current vs. non-current classification
- Comparative periods (this month vs. last month, this year vs. last year)
- Construction-specific line items: Retainage Receivable, WIP, Client Deposits Held
- Configurable account grouping and presentation order

**Profit & Loss (Income Statement):**
- Revenue - COGS = Gross Profit - Operating Expenses = Net Income
- By job/project (job-level P&L)
- By period (monthly, quarterly, annual)
- Comparative: actual vs. budget, current period vs. prior period, YTD vs. prior YTD
- Construction-specific: Revenue recognized, Direct costs (labor, materials, subs, equipment), Gross margin by project

**Cash Flow Statement:**
- Operating, Investing, Financing activities
- Indirect method (start from net income, adjust for non-cash items)
- Construction-specific: draw receipts, vendor payments, retainage flows
- 30/60/90-day cash flow projections based on scheduled draws and committed AP

**Statement of Owner's Equity:**
- Beginning equity, net income, owner draws/distributions, ending equity
- Per owner for multi-owner builders

All financial statements:
- Brandable with builder logo and company info
- Exportable as PDF, Excel
- Share-ready for accountant, lender, or bonding company
- Configurable presentation (which accounts appear, grouping, subtotals)

### 14. Period Close / Month-End

- **Soft close:** period is locked for standard users; owner/admin can override with audit trail
- **Hard close:** irreversible lock (rarely used; available for accountant sign-off)
- **Pre-close checklist:** system-generated list of items to review before closing:
  - Unposted invoices dated within the period
  - Pending journal entries
  - Unreconciled bank transactions
  - WIP adjustments needed
  - Retainage entries for the period
- **Grace period:** configurable window (default 3 business days) after period-end where transactions dated in the closed period can still be posted
- **Period unlock:** requires owner approval with mandatory reason; creates audit entry
- **Year-end close:** special process that closes all temporary accounts (Revenue, Expense) to Retained Earnings
- **Fiscal year configuration:** start month configurable per builder (January, April, July, October, or custom)

#### Edge Cases & What-If Scenarios

1. **Period already closed but accountant finds an error.** The system must support posting adjusting entries to a closed period via the unlock workflow. When a period is unlocked, all financial statements for that period and subsequent periods are flagged as "may need regeneration." The system tracks which statements were generated before vs. after the adjustment. Once the adjustment is posted, the period can be re-closed and statements regenerated.

---

### PART C: ACCOUNTS RECEIVABLE (AR)

### 15. Client Invoicing / Progress Billing

- **Invoice types:**
  - Progress billing (percentage of completion)
  - Time & materials billing (actual costs + markup)
  - Fixed-price milestone billing
  - Retainage release invoices
  - Service/warranty invoices
- **AIA G702/G703 generation:**
  - Application and Certificate for Payment (G702) auto-populated from budget data
  - Continuation Sheet (G703) with line-by-line scheduled values, previous work, current work, stored materials
  - Retainage calculation: configurable percentage, reduced retainage at substantial completion
  - Digital PDF generation matching AIA format requirements
- **Custom invoice formats:** builder-designed templates for non-AIA billing
- **Billing schedules:** recurring billing dates per project with auto-generated draft invoices
- **Client-specific billing rules:** different billing formats, payment terms, and retainage rates per client
- **Multi-entity billing:** builder with multiple LLCs can bill from the correct entity per project
- **Invoice numbering:** configurable sequential numbering per builder or per entity

### 16. Payment Receipt Processing

- **Record client payments:** date, amount, method (check, ACH, wire, credit card), reference number
- **Payment application:** apply payment to specific invoices (oldest first, or manual selection)
- **Partial payments:** track partial payments against invoices, show remaining balance
- **Overpayment handling:** create credit balance on client account, apply to future invoices or refund
- **Underpayment handling:** flag short-pay amount, request explanation or create dispute
- **Retainage payment:** separate workflow for retainage release payments
- **Payment auto-posting:** Debit Cash, Credit AR on payment recording
- **Deposit tracking:** client deposits/retainers held before work begins, applied against future invoices
- **Trust account compliance:** deposits held in trust accounts where jurisdictionally required (integrates with Module 38 state requirements)

### 17. AR Aging & Collections

- **Aging buckets:** Current, 1-30, 31-60, 61-90, 90+ days
- **Per-client and per-project aging breakdown**
- **Retainage receivable aging:** separate aging for retainage amounts
- **Collection activity log:** notes, calls, emails tracked per outstanding invoice
- **Collection escalation:** configurable auto-reminders at 30, 60, 90 days past due
- **Statements:** generate and send client statements (all open invoices for a client)
- **Bad debt write-off:** workflow to write off uncollectable amounts with GL entry (Debit Bad Debt Expense, Credit AR)
- **Interest/late fees:** configurable late payment charges (percentage or flat fee), auto-calculated

#### Edge Cases & What-If Scenarios

1. **Client disputes an invoice amount after partial payment.** The client pays $50K of a $75K draw, disputing $25K of work scope. The system must: (a) record the $50K partial payment applied to the invoice, (b) flag the $25K disputed portion with a separate status, (c) support a dispute resolution workflow (negotiate, credit, rebill, or collect), (d) keep the disputed amount visible in AR aging with a "disputed" flag so it doesn't inflate collection metrics, and (e) track the dispute to resolution with full communication log.

---

### PART D: BANK RECONCILIATION

### 18. Bank Account Management

- **Multiple bank accounts per builder:** operating, payroll, trust/escrow, savings
- **Account configuration:** bank name, account number (masked), account type, GL account mapping
- **Opening balance entry for initial setup**

### 19. Bank Transaction Import

- **File import:** OFX, QFX, QBO, CSV file formats from bank downloads
- **Bank feed integration:** future support for direct bank feeds via Plaid or similar
- **Transaction parsing:** extract date, description, amount, check number, reference
- **Duplicate detection:** prevent re-importing transactions already in the system

### 20. Reconciliation Workflow

- **Statement reconciliation:**
  - Enter bank statement ending date and balance
  - System shows all unreconciled GL transactions for the account
  - Match bank transactions to GL entries (auto-match by amount/date/check number, manual match for remainder)
  - Mark transactions as reconciled
  - Difference calculation: GL balance vs. bank statement balance
  - Must reach $0.00 difference to complete reconciliation
- **Auto-matching rules:** configurable rules that auto-match transactions (e.g., "ACH from CLIENT NAME" matches to AR receipt)
- **Unmatched items:** bank charges, interest, fees — create journal entries from the reconciliation screen
- **Reconciliation report:** list of reconciled items, outstanding checks, deposits in transit
- **Reconciliation history:** view past reconciliations and their details

#### Edge Cases & What-If Scenarios

1. **Check written but never cashed (stale check).** A check issued to a vendor 90+ days ago has not cleared the bank. The system must: (a) flag stale checks on the reconciliation screen, (b) provide a "void stale check" action that reverses the original payment entry (Debit Cash, Credit AP), (c) notify the vendor that the check was voided and a replacement will be issued if appropriate, and (d) track voided checks in a separate report for the builder's records.

---

## Database Tables

```
-- PART A: ACCOUNTS PAYABLE TABLES --

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

-- PART B: GENERAL LEDGER TABLES --

v2_gl_accounts
  id, builder_id, account_number VARCHAR(20), name VARCHAR(255),
  account_type ENUM('asset','liability','equity','revenue','expense'),
  sub_type VARCHAR(50),  -- e.g., 'current_asset', 'fixed_asset', 'long_term_liability'
  parent_account_id UUID,  -- self-ref for sub-accounts
  normal_balance ENUM('debit','credit'),
  is_system_account BOOLEAN DEFAULT false,  -- platform-required, cannot delete
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  financial_statement_section VARCHAR(100),  -- grouping for statement presentation
  sort_order INTEGER,
  opening_balance DECIMAL(14,2) DEFAULT 0,
  current_balance DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

v2_journal_entries
  id, builder_id, entry_number VARCHAR(20),  -- sequential JE-0001, JE-0002
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  entry_type ENUM('auto','manual','adjusting','closing','reversing','recurring'),
  source_module VARCHAR(50),  -- 'invoicing', 'payroll', 'inventory', 'manual'
  source_entity_type VARCHAR(50),  -- 'invoice', 'payment', 'time_entry', etc.
  source_entity_id UUID,
  job_id UUID,  -- optional project reference
  status ENUM('draft','posted','reversed','voided'),
  is_recurring BOOLEAN DEFAULT false,
  recurring_schedule JSONB,  -- { frequency: 'monthly', next_date: '...' }
  reverse_on_date DATE,  -- for auto-reversing entries
  approved_by UUID, approved_at TIMESTAMPTZ,
  posted_by UUID, posted_at TIMESTAMPTZ,
  created_by UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

v2_journal_entry_lines
  id, builder_id, journal_entry_id UUID NOT NULL,
  gl_account_id UUID NOT NULL,
  debit_amount DECIMAL(14,2) DEFAULT 0,
  credit_amount DECIMAL(14,2) DEFAULT 0,
  description TEXT,
  job_id UUID,  -- optional, for job-level reporting
  cost_code_id UUID,  -- optional, for cost code level detail
  vendor_id UUID,  -- optional, for AP detail
  client_id UUID,  -- optional, for AR detail
  sort_order INTEGER,
  created_at TIMESTAMPTZ

v2_fiscal_periods
  id, builder_id, period_year INTEGER, period_month INTEGER,
  period_start DATE, period_end DATE,
  status ENUM('open','soft_locked','hard_locked'),
  locked_by UUID, locked_at TIMESTAMPTZ,
  unlocked_by UUID, unlocked_at TIMESTAMPTZ,
  unlock_reason TEXT,
  grace_period_end DATE,
  created_at TIMESTAMPTZ,
  UNIQUE(builder_id, period_year, period_month)

v2_accounting_config
  id, builder_id UUID UNIQUE,
  fiscal_year_start_month INTEGER DEFAULT 1,
  account_number_format VARCHAR(20) DEFAULT '####',
  default_accounting_basis ENUM('accrual','cash') DEFAULT 'accrual',
  auto_post_invoices BOOLEAN DEFAULT true,
  auto_post_payments BOOLEAN DEFAULT true,
  require_je_approval BOOLEAN DEFAULT false,
  grace_period_days INTEGER DEFAULT 3,
  next_je_number INTEGER DEFAULT 1,
  next_ar_invoice_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

-- PART C: ACCOUNTS RECEIVABLE TABLES --

v2_ar_invoices
  id, builder_id, client_id UUID NOT NULL, job_id UUID NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_type ENUM('progress','time_materials','milestone','retainage_release','service','custom'),
  format ENUM('aia_g702','custom'),
  invoice_date DATE, due_date DATE,
  billing_period_start DATE, billing_period_end DATE,
  subtotal DECIMAL(14,2), tax DECIMAL(14,2) DEFAULT 0,
  retainage_pct DECIMAL(5,2), retainage_amount DECIMAL(14,2) DEFAULT 0,
  total_amount DECIMAL(14,2), amount_paid DECIMAL(14,2) DEFAULT 0,
  balance_due DECIMAL(14,2),
  status ENUM('draft','sent','viewed','partial','paid','overdue','disputed','void'),
  payment_terms VARCHAR(50) DEFAULT 'Net 30',
  entity_id UUID,  -- for multi-entity builders
  notes TEXT, internal_notes TEXT,
  sent_at TIMESTAMPTZ, viewed_at TIMESTAMPTZ,
  draw_request_id UUID,  -- link to draw request if applicable
  gl_posted BOOLEAN DEFAULT false,
  created_by UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

v2_ar_invoice_lines
  id, builder_id, ar_invoice_id UUID NOT NULL,
  description TEXT, item_number VARCHAR(50),
  scheduled_value DECIMAL(14,2),
  previous_completed DECIMAL(14,2) DEFAULT 0,
  current_completed DECIMAL(14,2) DEFAULT 0,
  stored_materials DECIMAL(14,2) DEFAULT 0,
  total_completed DECIMAL(14,2),
  pct_complete DECIMAL(5,2),
  balance_to_finish DECIMAL(14,2),
  retainage DECIMAL(14,2) DEFAULT 0,
  cost_code_id UUID, gl_account_id UUID,
  sort_order INTEGER, created_at TIMESTAMPTZ

v2_ar_payments
  id, builder_id, client_id UUID NOT NULL,
  payment_date DATE, amount DECIMAL(14,2),
  payment_method ENUM('check','ach','wire','credit_card','cash','other'),
  reference_number VARCHAR(100),
  deposit_to_account_id UUID,  -- GL bank account
  notes TEXT,
  gl_posted BOOLEAN DEFAULT false,
  created_by UUID, created_at TIMESTAMPTZ

v2_ar_payment_applications
  id, builder_id, ar_payment_id UUID NOT NULL,
  ar_invoice_id UUID NOT NULL,
  amount_applied DECIMAL(14,2),
  created_at TIMESTAMPTZ

v2_ar_aging_snapshots
  id, builder_id, snapshot_date DATE,
  client_id UUID, job_id UUID,
  current_amount DECIMAL(14,2),
  days_30 DECIMAL(14,2), days_60 DECIMAL(14,2),
  days_90 DECIMAL(14,2), days_90_plus DECIMAL(14,2),
  retainage_receivable DECIMAL(14,2),
  total_outstanding DECIMAL(14,2),
  created_at TIMESTAMPTZ

v2_collection_activities
  id, builder_id, client_id UUID, ar_invoice_id UUID,
  activity_type ENUM('call','email','letter','meeting','note','reminder_sent'),
  description TEXT, contacted_by UUID, contacted_at TIMESTAMPTZ,
  follow_up_date DATE, created_at TIMESTAMPTZ

-- PART D: BANK RECONCILIATION TABLES --

v2_bank_accounts
  id, builder_id, name VARCHAR(255), bank_name VARCHAR(255),
  account_number_masked VARCHAR(20),  -- last 4 digits only
  account_type ENUM('operating','payroll','trust','escrow','savings','other'),
  gl_account_id UUID NOT NULL,  -- mapped GL account
  opening_balance DECIMAL(14,2), opening_balance_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

v2_bank_transactions
  id, builder_id, bank_account_id UUID NOT NULL,
  transaction_date DATE, post_date DATE,
  description TEXT, reference VARCHAR(100),
  amount DECIMAL(14,2),  -- positive = deposit, negative = withdrawal
  check_number VARCHAR(20),
  is_reconciled BOOLEAN DEFAULT false,
  reconciliation_id UUID,
  matched_journal_entry_id UUID,
  import_source VARCHAR(50),  -- 'ofx', 'csv', 'manual', 'bank_feed'
  import_batch_id UUID,
  created_at TIMESTAMPTZ

v2_bank_reconciliations
  id, builder_id, bank_account_id UUID NOT NULL,
  statement_date DATE, statement_balance DECIMAL(14,2),
  gl_balance DECIMAL(14,2),
  reconciled_balance DECIMAL(14,2),
  difference DECIMAL(14,2),
  status ENUM('in_progress','completed'),
  completed_by UUID, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ

v2_bank_matching_rules
  id, builder_id, bank_account_id UUID,
  rule_name VARCHAR(255),
  match_field ENUM('description','reference','amount'),
  match_pattern VARCHAR(255),
  match_type ENUM('contains','starts_with','exact','regex'),
  auto_categorize_account_id UUID,  -- GL account to auto-assign
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
```

---

## API Endpoints

```
# ============================================
# PART A: ACCOUNTS PAYABLE ENDPOINTS
# ============================================

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

# ============================================
# PART B: GENERAL LEDGER ENDPOINTS
# ============================================

# Chart of Accounts
GET    /api/v2/gl/accounts                 # List all GL accounts (tree or flat)
POST   /api/v2/gl/accounts                 # Create GL account
PUT    /api/v2/gl/accounts/:id             # Update GL account
DELETE /api/v2/gl/accounts/:id             # Deactivate GL account (soft delete)
POST   /api/v2/gl/accounts/import          # Import chart of accounts (CSV or from QBO)
GET    /api/v2/gl/accounts/:id/ledger      # Account ledger (all entries for an account)

# Journal Entries
GET    /api/v2/gl/journal-entries          # List journal entries (filterable by date, type, status)
POST   /api/v2/gl/journal-entries          # Create journal entry (manual)
GET    /api/v2/gl/journal-entries/:id      # Get journal entry with lines
PUT    /api/v2/gl/journal-entries/:id      # Update draft journal entry
POST   /api/v2/gl/journal-entries/:id/post # Post journal entry
POST   /api/v2/gl/journal-entries/:id/void # Void a posted journal entry
POST   /api/v2/gl/journal-entries/:id/reverse # Create reversing entry

# Financial Reports
GET    /api/v2/gl/trial-balance            # Trial balance for date range
GET    /api/v2/gl/balance-sheet            # Balance sheet as of date
GET    /api/v2/gl/income-statement         # P&L for date range
GET    /api/v2/gl/cash-flow-statement      # Cash flow statement
GET    /api/v2/gl/owner-equity             # Statement of owner's equity

# Period Management
GET    /api/v2/gl/periods                  # List fiscal periods with status
POST   /api/v2/gl/periods/:year/:month/lock   # Lock period (soft)
POST   /api/v2/gl/periods/:year/:month/unlock # Unlock period (requires reason)
POST   /api/v2/gl/year-end-close           # Year-end close process

# Accounting Config
GET    /api/v2/accounting/config           # Get accounting configuration
PUT    /api/v2/accounting/config           # Update accounting configuration

# ============================================
# PART C: ACCOUNTS RECEIVABLE ENDPOINTS
# ============================================

# Client Invoices / Billing
GET    /api/v2/ar/invoices                 # List AR invoices (filterable)
POST   /api/v2/ar/invoices                 # Create client invoice
GET    /api/v2/ar/invoices/:id             # Get invoice with lines
PUT    /api/v2/ar/invoices/:id             # Update draft invoice
POST   /api/v2/ar/invoices/:id/send        # Send invoice to client
POST   /api/v2/ar/invoices/:id/void        # Void invoice
GET    /api/v2/ar/invoices/:id/pdf         # Generate invoice PDF (AIA or custom)

# Payments
POST   /api/v2/ar/payments                 # Record client payment
GET    /api/v2/ar/payments                 # List payments
POST   /api/v2/ar/payments/:id/apply       # Apply payment to invoices

# Aging & Collections
GET    /api/v2/ar/aging                    # AR aging report
GET    /api/v2/ar/aging/:clientId          # AR aging for specific client
POST   /api/v2/ar/collections/activity     # Log collection activity
GET    /api/v2/ar/collections/:clientId    # Collection history for client
POST   /api/v2/ar/statements/:clientId/send # Send statement to client

# ============================================
# PART D: BANK RECONCILIATION ENDPOINTS
# ============================================

# Bank Accounts
GET    /api/v2/bank/accounts               # List bank accounts
POST   /api/v2/bank/accounts               # Add bank account
PUT    /api/v2/bank/accounts/:id           # Update bank account

# Bank Transactions
POST   /api/v2/bank/accounts/:id/import    # Import bank transactions (OFX/CSV)
GET    /api/v2/bank/accounts/:id/transactions # List bank transactions
POST   /api/v2/bank/accounts/:id/transactions # Manual bank transaction entry

# Reconciliation
POST   /api/v2/bank/reconciliations        # Start reconciliation session
GET    /api/v2/bank/reconciliations/:id    # Get reconciliation in progress
POST   /api/v2/bank/reconciliations/:id/match # Match bank txn to GL entry
POST   /api/v2/bank/reconciliations/:id/complete # Complete reconciliation
GET    /api/v2/bank/reconciliations/history # Past reconciliations

# Matching Rules
GET    /api/v2/bank/matching-rules         # List auto-matching rules
POST   /api/v2/bank/matching-rules         # Create matching rule
PUT    /api/v2/bank/matching-rules/:id     # Update matching rule
```

---

## UI Components

### Accounts Payable Components
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
| APAgingReportView | Current/30/60/90/120+ AP aging buckets with drill-down |
| DisputePanel | Side panel for managing invoice disputes and communication |
| RetainageTracker | Dashboard showing retainage withheld/released by project and vendor |

### General Ledger Components
| Component | Description |
|-----------|-------------|
| ChartOfAccountsManager | Tree view of GL accounts with CRUD, drag-and-drop reorder, import |
| JournalEntryForm | Create/edit journal entries with balanced debit/credit lines |
| JournalEntryList | Filterable list of journal entries with status badges and drill-down |
| AccountLedgerView | Ledger view for a single GL account showing all entries |
| TrialBalanceReport | Interactive trial balance with drill-down to underlying entries |
| BalanceSheetReport | Balance sheet with comparative periods and drill-down |
| IncomeStatementReport | P&L report with budget comparison and job-level breakdown |
| CashFlowStatementReport | Cash flow statement with 30/60/90 day projections |
| PeriodCloseManager | Calendar grid with period lock/unlock controls and pre-close checklist |
| AccountingConfigPanel | Builder admin for fiscal year, accounting basis, auto-posting rules |
| RecurringEntryManager | List and configuration of recurring journal entries |

### Accounts Receivable Components
| Component | Description |
|-----------|-------------|
| ARInvoiceListPage | Client invoices with status pipeline, aging indicators |
| ARInvoiceForm | Create client invoice (AIA G702/G703 or custom format) |
| ARInvoicePreview | PDF preview of client invoice before sending |
| PaymentReceiptForm | Record client payment with invoice application |
| ARAgingReport | AR aging by client and project with collection activity log |
| CollectionDashboard | Outstanding receivables with activity tracking and escalation |
| ClientStatementGenerator | Generate and send client account statements |

### Bank Reconciliation Components
| Component | Description |
|-----------|-------------|
| BankAccountManager | List and configure bank accounts with GL mapping |
| BankTransactionImport | File upload and parse for OFX/QFX/CSV bank files |
| ReconciliationWorkspace | Split view: bank transactions on left, GL entries on right, match in middle |
| ReconciliationSummary | Running totals showing reconciled vs unreconciled, difference to zero |
| MatchingRulesConfig | Auto-matching rule builder for recurring bank transactions |

---

## Dependencies

- **Module 3:** Core Data Model (projects, cost codes, phases, clients)
- **Module 5:** Notification Engine (approval notifications, payment reminders, collection escalation)
- **Module 6:** Document Storage (invoice attachment upload, PDF generation storage)
- **Module 9:** Budget & Cost Tracking (budget validation, cost allocation posting, job costing)
- **Module 10:** Contact/Vendor Management (vendor lookup, insurance/W-9 status, client records)
- **Module 12:** Basic Client Portal (client invoice visibility, online payment links)
- **Module 13:** Invoice AI (extends AP with OCR extraction and auto-coding; not required)
- **Module 14:** Lien Waivers (payment prerequisite checking)
- **Module 16:** QuickBooks Integration (OPTIONAL bi-directional sync for builders who also use external accounting)
- **Module 18:** Purchase Orders (PO matching for AP, committed costs for GL)
- **Module 51:** Time Tracking (labor cost journal entries from approved timesheets)
- **Module 52:** Inventory Management (material cost journal entries from consumption)

---

## Open Questions

### Accounts Payable
1. Should the system support recurring invoices (e.g., monthly equipment rental)? If so, auto-generate or just remind?
2. What is the maximum number of approval steps allowed in a chain? (Suggest cap at 5 to prevent workflow bloat.)
3. Should payment recording integrate with an external payment system (bill.com, Melio) or remain manual entry?
4. How should partial payments against a single invoice be handled for retainage tracking?
5. Should invoice data feed into cash flow forecasting, or is that a separate calculation?
6. What retention policy applies to voided/deleted invoices? Soft delete with audit trail forever, or archival after N years?

### General Ledger
7. Should the GL support multi-currency for builders with international projects, or USD only for V1?
8. Should journal entry approval be required by default, or optional? (Recommend: optional, configurable per builder.)
9. How granular should the default chart of accounts be? (Recommend: ~50 accounts covering common construction categories, expandable.)
10. Should the system generate financial statements in GAAP-compliant format, or is "management reporting" format sufficient?
11. For year-end close, should the system auto-generate closing entries or present them for manual review?

### Accounts Receivable
12. Should the platform support online payments from clients (Stripe/ACH link on invoice)? If so, in V1 or later?
13. Should late fee/interest charges be auto-posted or require manual trigger?
14. How should the system handle progress billing when the architect/lender reduces the % complete claimed?

### Bank Reconciliation
15. Should the platform integrate with Plaid for direct bank feeds in V1, or start with file import only?
16. How should the system handle bank transactions that don't match any GL entry (e.g., bank fees, interest)?
