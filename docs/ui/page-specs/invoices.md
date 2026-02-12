# View Plan: Invoices

## Views Covered
1. Invoice List (job-scoped and company-wide)
2. Invoice Detail
3. Invoice Upload (AI processing)
4. Invoice Allocation

---

## Invoice Workflow

```
                           ┌─────────────────────┐
    PDF UPLOAD ──────────► │ AI PROCESSING       │
                           │ (match job/vendor)  │
                           └─────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
          ┌─────────────────┐              ┌─────────────────┐
          │ NEEDS MATCHING  │              │     DRAFT       │
          │ (unmatched)     │              │ (matched)       │
          └────────┬────────┘              └────────┬────────┘
                   │ (manual match)                 │
                   └──────────────┬─────────────────┘
                                  ▼
                        ┌─────────────────┐
                        │  PM APPROVAL    │
                        │  (job-based)    │
                        └────────┬────────┘
                                 ▼
                        ┌─────────────────┐
                        │  ACCOUNTANT     │
                        │  APPROVAL       │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ (if over threshold)      │
                    ▼                          ▼
          ┌─────────────────┐        ┌─────────────────┐
          │ OWNER APPROVAL  │        │    APPROVED     │
          │ (amount-based)  │        │                 │
          └────────┬────────┘        └────────┬────────┘
                   │                          │
                   └──────────────┬───────────┘
                                  ▼
                        ┌─────────────────┐
                        │   IN DRAW       │
                        │ (added to draw) │
                        └────────┬────────┘
                                 ▼
                        ┌─────────────────┐
                        │      PAID       │
                        └─────────────────┘
```

---

## Invoice Statuses

| Status | Color | Who Sees | Description |
|--------|-------|----------|-------------|
| Needs Matching | Orange | All | AI couldn't match job/vendor |
| Draft | Gray | PM (their jobs) | Matched, ready for PM review |
| PM Pending | Blue | PM | Awaiting PM approval |
| Accountant Pending | Purple | Accountant | Awaiting accountant approval |
| Owner Pending | Red | Owner | Over threshold, needs owner approval |
| Approved | Green | All | Ready to add to draw |
| In Draw | Teal | All | Included in a draw |
| Paid | Dark Gray | All | Payment complete |

---

## 1. Invoice List View

### URL
- Job-scoped: `/jobs/:id/invoices` (filtered to selected job)
- Company-wide: Via main menu (shows all jobs)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Invoices                          [Upload] [Filters]    [+ Manual]  │
├─────────────────────────────────────────────────────────────────────┤
│ Status Tabs: All | Needs Matching | Pending | Approved | Paid      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────┬────────────┬─────────┬────────┬────────┬──────┬──────────┐ │
│ │ □   │ Vendor     │ Invoice#│ Amount │ Job    │Status│ Due Date │ │
│ ├─────┼────────────┼─────────┼────────┼────────┼──────┼──────────┤ │
│ │ □   │ ABC Elect  │ 1234    │$12,450 │ Smith  │● PM  │ Dec 15   │ │
│ │ □   │ XYZ Plumb  │ 5678    │ $8,200 │ Smith  │● Appd│ Dec 10   │ │
│ │ □   │ ???        │ 9012    │ $5,000 │ ---    │● Need│ Dec 20   │ │
│ └─────┴────────────┴─────────┴────────┴────────┴──────┴──────────┘ │
│                                                                     │
│ Showing 1-25 of 142                           [< Prev] [Next >]     │
└─────────────────────────────────────────────────────────────────────┘
```

### Columns
| Column | Sortable | Notes |
|--------|----------|-------|
| Checkbox | No | Bulk actions |
| Vendor | Yes | Vendor name, link to vendor |
| Invoice # | Yes | Vendor's invoice number |
| Amount | Yes | Total amount |
| Job | Yes | Job name (or "---" if unmatched) |
| Status | Yes | Color-coded badge |
| Due Date | Yes | Payment due date |
| Invoice Date | Yes | Date on invoice |
| Pending With | No | Who needs to approve (name) |
| Days Pending | Yes | Days since received |
| PO | No | Linked PO if any |
| Cost Codes | No | Allocated cost codes |
| Actions | No | View, Approve, Edit |

### Filters
- Status (multi-select)
- Job (select, or filtered by sidebar)
- Vendor
- Date range
- Amount range
- Assigned approver
- Has PO / No PO

### Bulk Actions
- Approve (if user has permission)
- Add to Draw
- Assign to job
- Export

---

## 2. Invoice Detail View

### URL
`/invoices/:id` (or modal from list)

### Layout: PDF + Sidebar
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back                Invoice #1234 - ABC Electric          ● PM    │
├───────────────────────────────────┬─────────────────────────────────┤
│                                   │                                 │
│         PDF VIEWER                │       DETAILS SIDEBAR           │
│                                   │                                 │
│   ┌───────────────────────────┐   │   Vendor: ABC Electric          │
│   │                           │   │   Invoice #: 1234               │
│   │                           │   │   Invoice Date: Nov 15, 2024    │
│   │      Invoice PDF          │   │   Due Date: Dec 15, 2024        │
│   │      (zoomable)           │   │   Amount: $12,450.00            │
│   │                           │   │                                 │
│   │                           │   │   Job: Smith Residence          │
│   │                           │   │   PO: #PO-2024-089              │
│   │                           │   │                                 │
│   │                           │   │   ─────────────────────         │
│   │                           │   │   ALLOCATIONS                   │
│   │                           │   │   03-Electrical: $10,000        │
│   │                           │   │   01-General: $2,450            │
│   │                           │   │   [Edit Allocations]            │
│   │                           │   │                                 │
│   │                           │   │   ─────────────────────         │
│   │                           │   │   APPROVAL CHAIN                │
│   │                           │   │   ✓ AI Processed                │
│   │                           │   │   ✓ PM: Jake (Nov 16)           │
│   │                           │   │   ○ Accountant: Pending         │
│   │                           │   │   ○ Owner: N/A (under $25k)     │
│   │                           │   │                                 │
│   └───────────────────────────┘   │   ─────────────────────         │
│                                   │   [Approve] [Reject] [Edit]     │
│   [Download PDF] [Zoom]           │                                 │
│                                   │                                 │
└───────────────────────────────────┴─────────────────────────────────┘
```

### Sidebar Sections
1. **Basic Info**: Vendor, invoice #, dates, amount
2. **Matching**: Job, PO link
3. **Allocations**: Cost code breakdown (editable)
4. **Approval Chain**: Who approved, who's pending
5. **Actions**: Approve, Reject, Edit, Add Note
6. **Activity Log**: History of changes

### For Unmatched Invoices
Show additional matching UI:
- Job selector dropdown
- Vendor selector (or create new)
- "Confirm Match" button

---

## 3. Invoice Upload View

### URL
`/invoices/upload` or modal

### Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                        Upload Invoices                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │        Drag & drop PDF files here                           │   │
│   │        or click to browse                                   │   │
│   │                                                             │   │
│   │        Supports: PDF, JPG, PNG                              │   │
│   │        Max 10 files at once                                 │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   PROCESSING QUEUE                                                  │
│   ──────────────────                                                │
│   ┌─────────────────┬────────────────┬─────────────┬────────────┐   │
│   │ File            │ Status         │ Matched     │ Action     │   │
│   ├─────────────────┼────────────────┼─────────────┼────────────┤   │
│   │ invoice123.pdf  │ ✓ Complete     │ ABC/Smith   │ [Review]   │   │
│   │ invoice456.pdf  │ ⏳ Processing  │ ---         │            │   │
│   │ invoice789.pdf  │ ⚠ Needs Match  │ ---         │ [Match]    │   │
│   └─────────────────┴────────────────┴─────────────┴────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### AI Processing
1. Upload PDF
2. Claude extracts: vendor name, invoice #, date, amount, line items
3. System matches: vendor (by name), job (by address/PO/context)
4. If matched → Draft status
5. If unmatched → Needs Matching status
6. Show review screen for user to confirm/edit

### Review Screen
After AI processing, show:
- Extracted data (editable)
- Confidence indicators
- Match suggestions
- Save button

---

## 4. Invoice Allocation View

### Access
From Invoice Detail sidebar or dedicated modal

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Allocate Invoice - ABC Electric #1234                   [$12,450]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Cost Code            Description           Amount      % of Total  │
│  ─────────────────────────────────────────────────────────────────  │
│  [03-Electrical ▼]    [Rough-in labor___]   [$10,000]    80%        │
│  [01-General    ▼]    [Misc supplies___]    [$ 2,450]    20%        │
│  [+ Add Line]                                                       │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Total Allocated: $12,450                   Remaining: $0           │
│                                                                     │
│  ☑ Allocations must equal invoice total                             │
│                                                                     │
│                                          [Cancel]  [Save Allocation]│
└─────────────────────────────────────────────────────────────────────┘
```

### Features
- Search/select cost codes
- Auto-suggest based on vendor trade
- Must allocate 100% of invoice amount
- Links to budget lines for variance tracking

---

## Role-Based Access

| Role | Sees | Can Approve |
|------|------|-------------|
| PM | Their jobs' invoices | PM level |
| Accountant | All invoices | Accountant level |
| Owner/Admin | All invoices | All levels |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/invoices` | List with filters |
| GET | `/api/invoices/:id` | Get detail |
| POST | `/api/invoices` | Create manual invoice |
| POST | `/api/invoices/upload` | Upload PDF for processing |
| PATCH | `/api/invoices/:id` | Update invoice |
| POST | `/api/invoices/:id/approve` | Approve invoice |
| POST | `/api/invoices/:id/reject` | Reject with reason |
| PUT | `/api/invoices/:id/allocations` | Set allocations |
| GET | `/api/invoices/:id/pdf` | Get PDF file |

---

## Database Notes

### Approval Thresholds
Store in company settings:
```json
{
  "invoice_thresholds": {
    "owner_approval_above": 25000,
    "accountant_approval_above": 0
  }
}
```

### Invoice Table Additions
- `matched_at` - When auto-matched
- `match_confidence` - AI confidence score
- `current_approver_role` - Who needs to approve next
- `approved_by_pm_at`, `approved_by_pm_id`
- `approved_by_accountant_at`, `approved_by_accountant_id`
- `approved_by_owner_at`, `approved_by_owner_id`

---

## Component Structure

```
components/invoices/
├── InvoiceList.tsx
├── InvoiceFilters.tsx
├── InvoiceCard.tsx
├── InvoiceDetail.tsx
├── InvoicePdfViewer.tsx
├── InvoiceSidebar.tsx
├── InvoiceUpload.tsx
├── InvoiceUploadQueue.tsx
├── InvoiceReview.tsx
├── InvoiceAllocation.tsx
├── InvoiceApprovalChain.tsx
├── InvoiceMatchDialog.tsx
└── InvoiceStatusBadge.tsx
```

---

## Affected By Changes To
- Vendors (invoice vendor matching)
- Jobs (invoice job assignment)
- Cost Codes (allocation options)
- Users (approval chain, PM assignments)
- Company settings (approval thresholds)
- Purchase Orders (PO matching)

## Affects
- Budget (actuals updated on approval)
- Draws (invoices included in draw)
- Job profitability (costs applied)
- Vendor payment history
- QuickBooks (synced as bills)
- Activity logs (approval actions)

---

## Mobile Considerations

- Camera capture for invoice upload (primary mobile use case)
- Swipe actions on invoice list: Approve, View, Pay
- Simplified approval flow: one-tap approve with confirmation
- Quick filters: Needs Approval, My Pending, Recent
- Push notifications for new invoices requiring approval
- PDF preview with pinch-to-zoom
- Offline: Queue approvals, cache invoice list
- Pull-to-refresh for latest invoices

---

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements (Invoice / Billing Page, items 692-707)
- GAP-692: Invoice queue — incoming invoices sorted by status (New, Pending Review, Approved, Paid, Disputed)
- GAP-693: AI-extracted data display with confidence indicators — "85% confident this is $4,250"
- GAP-694: Side-by-side view — invoice image on left, extracted data on right
- GAP-695: One-click approval / rejection with required comment on rejection
- GAP-696: Cost code assignment with smart suggestions
- GAP-697: Budget impact preview — "approving this invoice will bring Electrical to 87% of budget"
- GAP-698: Batch approval capability
- GAP-699: Invoice history per vendor
- GAP-700: Duplicate detection alerts — "this appears similar to Invoice #X from this vendor"
- GAP-701: Payment status tracking — approved to scheduled to paid to cleared
- GAP-702: Lien waiver status indicator per invoice
- GAP-703: Retainage auto-calculation
- GAP-704: Link to PO and contract for comparison
- GAP-705: Aging report — invoices by days outstanding
- GAP-706: Payment run generation — select approved invoices for batch payment
- GAP-707: Export to accounting system button

### Cross-Section Gap Items
- GAP-341: Fully configurable invoice approval workflows (1-step, 2-step, 3-step, threshold-based)
- GAP-342: Invoice processing for different contract types (lump sum, T&M, unit price)
- GAP-343: Invoice coding with different cost code structures per builder
- GAP-344: AI that learns per-tenant patterns for invoice coding
- GAP-345: Builders who match every invoice to PO vs. builders who do not use POs
- GAP-346: Progress billing vs. final billing workflows with different approval criteria
- GAP-347: Retainage calculation that varies by contract, vendor, project
- GAP-348: Conditional payment rules — no payment without current insurance + signed lien waiver
- GAP-349: Invoice dispute tracking — communication, resolution workflow
- GAP-350: Batch payment recommendations for approved invoices due this week
- GAP-351: State-specific lien waiver forms
- GAP-353: Conditional vs. unconditional waiver tracking by state
- GAP-355: Notice to Owner / Preliminary Notice requirements by state
- GAP-356: Mechanic's lien filing deadline alerts by state
- GAP-431: Chart of accounts mapping per builder for accounting sync
- GAP-491: AI learning per-tenant vs. anonymized cross-tenant patterns
- GAP-498: AI-powered data entry from uploaded documents
- GAP-502: AI anomaly detection — invoice amount 3x higher than previous from same vendor
- GAP-504: AI document classification — auto-sort incoming documents
- GAP-807: Vendor underpays a credit — collection and dispute tracking
- GAP-861: Full chain traceability from estimate to budget to PO to invoice to payment to lien waiver to draw

## Additional Requirements from Gap Analysis
- Budget impact preview before approval is not in the current spec (GAP-697)
- Duplicate detection alerts for similar invoices are not specified (GAP-700)
- Lien waiver status indicator per invoice is missing (GAP-702)
- Retainage auto-calculation per invoice is not detailed (GAP-703)
- Aging report view for invoices by days outstanding is not specified (GAP-705)
- Payment run generation for batch payment of approved invoices is not covered (GAP-706)
- Export to accounting system button is not specified (GAP-707)
- Invoice processing rules per contract type (lump sum vs. T&M vs. unit price) are not differentiated (GAP-342)
- Conditional payment rules (require insurance + lien waiver before payment) are not addressed (GAP-348)
- Invoice dispute workflow with tracking and resolution is not specified (GAP-349)
- State-specific lien waiver form management is not covered (GAP-351, GAP-353)
- Mechanic's lien deadline alerts by state are missing (GAP-356)
- AI anomaly detection for unusual invoice amounts is not specified (GAP-502)
- Invoice history per vendor as a dedicated view is not explicitly called out (GAP-699)
- Payment status tracking beyond "Paid" (scheduled, cleared) needs more detail (GAP-701)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning session |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
