# View Plan: Purchase Orders, Draws, Change Orders

## Views Covered
- Purchase Orders (List, Create, Detail)
- Draws (List, Create, Detail, PDF Export)
- Change Orders (List, Create, Detail)

---

# PURCHASE ORDERS

## PO Workflow

```
CREATE ──► DRAFT ──► PM APPROVAL ──► ACCOUNTANT ──► (OWNER) ──► APPROVED ──► SENT ──► COMPLETED
                                                                    │
                                                        (receive invoices)
```

Same approval chain as invoices, with amount thresholds.

## PO Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Draft | Gray | Being created |
| PM Pending | Blue | Awaiting PM approval |
| Accountant Pending | Purple | Awaiting accountant |
| Owner Pending | Red | Over threshold |
| Approved | Green | Approved, ready to send |
| Sent | Teal | Sent to vendor |
| Partially Received | Orange | Some invoices received |
| Completed | Dark Gray | Fully invoiced |
| Cancelled | Red | Cancelled |

## PO List View

### URL
- Job-scoped: `/jobs/:id/purchase-orders`
- Company-wide: Via main menu

### Columns
| Column | Sortable | Notes |
|--------|----------|-------|
| PO # | Yes | Auto-generated number |
| Vendor | Yes | Vendor name |
| Job | Yes | Job name |
| Description | No | Brief description |
| Amount | Yes | Total PO amount |
| Status | Yes | Color badge |
| Issue Date | Yes | When sent/approved |
| Invoiced | Yes | Amount invoiced against PO |
| Remaining | Yes | Amount - Invoiced |
| Actions | No | View, Edit, Link Invoice |

## PO Create/Edit View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Create Purchase Order                               [Cancel] [Save] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Job: [Smith Residence       ▼]     (or auto-set from job context)  │
│  Vendor: [Search vendor...   ▼]                                     │
│  Description: [Electrical rough-in work_____________________]       │
│                                                                     │
│  LINE ITEMS                                                         │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Cost Code    │ Description            │ Qty │ Unit │ Price    │ │
│  ├──────────────┼────────────────────────┼─────┼──────┼──────────┤ │
│  │ [03-Elec ▼]  │ [Labor____________]    │ [1] │ [LS] │ [$8,000] │ │
│  │ [03-Elec ▼]  │ [Materials________]    │ [1] │ [LS] │ [$4,500] │ │
│  │ [+ Add Line]                                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Subtotal: $12,500                                                  │
│  Tax (if applicable): $0                                            │
│  Total: $12,500                                                     │
│                                                                     │
│  Expected Delivery: [____________]                                  │
│  Notes: [_______________________________________________________]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## AI-Assisted PO Creation (From Vendor Quote)

### Purpose
Extract line items from vendor quotes, estimates, or proposals to quickly create purchase orders without manual data entry.

### Upload Flow

```
UPLOAD QUOTE ──► AI EXTRACTION ──► REVIEW/EDIT ──► CREATE PO
     │                │                │
     │           (Claude AI)           │
     └─────────────────────────────────┘
              confidence scores
```

### Upload Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Create PO from Vendor Quote                                   [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Job: [Smith Residence              ▼]                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │       ┌─────────────────────────────────────────────┐           ││
│  │       │                                             │           ││
│  │       │     📄 Drop vendor quote/estimate here     │           ││
│  │       │                                             │           ││
│  │       │     PDF, image, or document file           │           ││
│  │       │                                             │           ││
│  │       └─────────────────────────────────────────────┘           ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Or paste quote text:                                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│                                           [Cancel]  [Process Quote] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### AI Extraction Results

```
┌─────────────────────────────────────────────────────────────────────┐
│  Review Extracted Data                             Confidence: 94%  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📄 Quote Preview                           │  EXTRACTED DATA   ││
│  │  ┌─────────────────────────┐                │                   ││
│  │  │                         │                │  Vendor:          ││
│  │  │   ABC Electric LLC      │                │  [ABC Electric ▼] ││
│  │  │   Quote #Q-2024-156     │                │  ✓ Match found    ││
│  │  │                         │                │                   ││
│  │  │   Labor: $8,000         │                │  Quote #:         ││
│  │  │   Materials: $4,500     │                │  [Q-2024-156    ] ││
│  │  │   Total: $12,500        │                │                   ││
│  │  │                         │                │  Quote Date:      ││
│  │  │                         │                │  [Dec 10, 2024  ] ││
│  │  │                         │                │                   ││
│  │  └─────────────────────────┘                │  Valid Until:     ││
│  │                                             │  [Jan 10, 2025  ] ││
│  │  [◀] Page 1 of 2 [▶]                        │                   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  EXTRACTED LINE ITEMS                               [+ Add Line]    │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ☑ │ Description          │ Cost Code    │ Qty │ Unit │ Amount  ││
│  ├───┼──────────────────────┼──────────────┼─────┼──────┼─────────┤│
│  │ ☑ │ Electrical labor     │ [26-Elec ▼]  │  1  │ LS   │ $8,000  ││
│  │   │ (rough-in)           │ ✓ 92%        │     │      │         ││
│  │ ☑ │ Electrical materials │ [26-Elec ▼]  │  1  │ LS   │ $4,500  ││
│  │   │ (wire, boxes, panel) │ ✓ 92%        │     │      │         ││
│  │ ☐ │ Permit fees          │ [01-Gen  ▼]  │  1  │ LS   │   $350  ││
│  │   │                      │ ⚠ 68%        │     │      │         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Subtotal (selected):  $12,500                                      │
│  Tax:                  $0                                           │
│  Total:                $12,500                                      │
│                                                                     │
│  ⚠ 1 item has low confidence - please verify cost code             │
│                                                                     │
│  ☐ Attach original quote to PO                                     │
│  ☐ Send PO to vendor when approved                                 │
│                                                                     │
│                                    [Back]  [Edit Details]  [Create PO]│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### AI Extraction Fields

| Field | Extraction Method | Confidence |
|-------|-------------------|------------|
| Vendor Name | Text matching + fuzzy search existing vendors | High |
| Quote Number | Pattern matching (Q-, Quote #, Estimate #) | High |
| Quote Date | Date parsing | High |
| Valid Until / Expiration | Date parsing | Medium |
| Line Items | Table extraction + NLP | Medium-High |
| Quantities | Number + unit parsing | Medium |
| Amounts | Currency parsing | High |
| Cost Code | Description → trade mapping | Medium |
| Total | Sum validation | High |

### Cost Code Mapping

AI suggests cost codes based on:
1. **Description keywords**: "electrical" → 26-Electrical
2. **Vendor trade**: If vendor is tagged as "Electrician" → prefer electrical codes
3. **Historical patterns**: Previous POs from same vendor
4. **Learned mappings**: User corrections improve future suggestions

### Confidence Thresholds

| Level | Score | Action |
|-------|-------|--------|
| High | ≥90% | Auto-accept, minimal review |
| Medium | 70-89% | Highlight for review |
| Low | <70% | Flag with warning, require confirmation |

### Quote Text Paste

For simple quotes without PDF:
- Paste email or text content
- AI parses line items from text
- Creates structured PO data

Example input:
```
From: joe@abcelectric.com
Subject: Quote for Smith Residence

Hi Jake,

Here's our quote for the electrical rough-in:

Labor (40 hrs @ $75): $3,000
Materials: $2,500
Panel upgrade: $1,800
Permit: $350

Total: $7,650

Valid for 30 days.
Thanks, Joe
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/purchase-orders/upload-quote` | Upload quote for AI processing |
| POST | `/api/purchase-orders/extract` | Process uploaded quote with AI |
| POST | `/api/purchase-orders/from-quote` | Create PO from extracted data |
| GET | `/api/ai/vendor-match` | Find matching vendor |
| GET | `/api/ai/cost-code-suggest` | Suggest cost codes for description |

### Component Structure

```
components/purchase-orders/
├── ... (existing)
├── POQuoteUpload.tsx          (upload dropzone)
├── POQuotePreview.tsx         (side-by-side preview)
├── POExtractedData.tsx        (extracted fields form)
├── POExtractedLineItems.tsx   (line items with confidence)
├── POCostCodeSuggest.tsx      (AI cost code dropdown)
└── POConfidenceBadge.tsx      (confidence indicator)
```

### Mobile Considerations

- Camera capture for paper quotes
- Simplified review flow
- Swipe to accept/reject line items
- Voice notes for corrections

---

## PO Detail View

Shows:
- Header: PO #, vendor, job, status
- Line items table
- Approval chain (like invoices)
- Linked invoices list
- Actions: Approve, Send to Vendor, Mark Complete

## PO-to-Invoice Linking

When creating/editing invoice:
- Option to link to existing PO
- Auto-pulls job, vendor, amounts for validation
- Track invoiced vs remaining on PO

---

# DRAWS (Pay Applications)

## Draw Workflow

```
CREATE ──► DRAFT ──► REVIEW ──► SUBMITTED ──► CLIENT APPROVAL ──► PAID
```

## Draw Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Draft | Gray | Being prepared |
| Review | Blue | Internal review |
| Submitted | Yellow | Sent to client |
| Approved | Green | Client approved |
| Paid | Dark Gray | Payment received |
| Rejected | Red | Client rejected (needs revision) |

## Draw List View

### URL
- Job-scoped: `/jobs/:id/draws`
- Company-wide: Via main menu

### Columns
| Column | Sortable | Notes |
|--------|----------|-------|
| Draw # | Yes | Sequential per job |
| Job | Yes | Job name |
| Period | Yes | "Through Dec 31, 2024" |
| Scheduled Value | Yes | Total contract |
| Previous | Yes | Previously billed |
| Current | Yes | This period |
| Retainage | Yes | Held back |
| Net Due | Yes | Current - Retainage |
| Status | Yes | Color badge |
| Actions | No | View, Submit, Export PDF |

## Draw Create/Editor View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Draw #3 - Smith Residence                                  ● Draft  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Period Through: [Dec 31, 2024   ]    Retainage: [10    ]%          │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  SCHEDULE OF VALUES                                                 │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Item │ Description    │ Sched. │ Previous │ Current  │ % Comp. ││
│  ├──────┼────────────────┼────────┼──────────┼──────────┼─────────┤│
│  │ 1    │ General Cond   │$45,000 │  $30,000 │  $5,000  │  78%    ││
│  │ 2    │ Foundation     │$35,000 │  $35,000 │      $0  │ 100%    ││
│  │ 3    │ Framing        │$80,000 │  $60,000 │ $15,000  │  94%    ││
│  │ 4    │ Electrical     │$42,000 │  $20,000 │ $12,000  │  76%    ││
│  │ 5    │ Plumbing       │$38,000 │  $15,000 │  $8,000  │  61%    ││
│  │ ...  │ ...            │   ...  │     ...  │    ...   │  ...    ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  SUMMARY                                                            │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  Total Scheduled Value:        $450,000                             │
│  Previous Completed:           $292,500                             │
│  Current Completed:             $55,000                             │
│  Total Completed:              $347,500   (77.2%)                   │
│                                                                     │
│  Retainage (10%):              -$34,750                             │
│  Previous Retainage:           -$29,250                             │
│  Current Retainage:             -$5,500                             │
│                                                                     │
│  Less Previous Payments:       $263,250                             │
│  Current Payment Due:           $49,500                             │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  INCLUDED INVOICES (optional)                                       │
│  ═══════════════════════════════════════════════════════════════   │
│  ☑ ABC Electric #1234 - $12,450                                     │
│  ☑ XYZ Plumbing #5678 - $8,200                                      │
│  [+ Add Invoice]                                                    │
│                                                                     │
│                          [Save Draft] [Submit to Client] [Export]   │
└─────────────────────────────────────────────────────────────────────┘
```

## Draw PDF Export

### AIA G702/G703 Format
- Standard AIA Application and Certificate for Payment
- Cover sheet (G702) + Continuation (G703)
- PDF generation with proper formatting

### Custom Format
- Company-branded template
- Configurable columns
- Include/exclude invoices
- Add notes section

## Draw Features
- Auto-pull budget lines as schedule of values
- Calculate previous from prior draws
- Track retainage release
- Link invoices to draw
- Client portal viewing/approval

---

# CHANGE ORDERS

## CO Workflow

```
DRAFT ──► PM APPROVAL ──► OWNER APPROVAL ──► CLIENT APPROVAL ──► APPROVED
                                                                    │
                                                        (updates budget)
```

## CO Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Draft | Gray | Being prepared |
| Internal Review | Blue | PM/Owner reviewing |
| Sent to Client | Yellow | Awaiting client approval |
| Approved | Green | Client approved, budget updated |
| Rejected | Red | Client rejected |

## CO List View

### URL
- Job-scoped: `/jobs/:id/change-orders`
- Company-wide: Via main menu

### Columns
| Column | Sortable | Notes |
|--------|----------|-------|
| CO # | Yes | Sequential per job |
| Job | Yes | Job name |
| Title | Yes | Brief description |
| Amount | Yes | Positive = add, Negative = deduct |
| Days | Yes | Schedule impact |
| Status | Yes | Color badge |
| Date | Yes | Submitted/approved date |
| Actions | No | View, Edit, Approve |

## CO Create/Edit View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Change Order #5 - Smith Residence                          ● Draft │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Title: [Add covered patio______________________________________]   │
│                                                                     │
│  Description:                                                       │
│  [Client requested addition of 12x16 covered patio with          ]  │
│  [outdoor electrical and ceiling fan.                            ]  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  LINE ITEMS                                                         │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Cost Code       │ Description                │ Amount          │ │
│  ├─────────────────┼────────────────────────────┼─────────────────┤ │
│  │ [06-Carpentry▼] │ [Patio framing & decking]  │ [+$8,500]       │ │
│  │ [03-Electrical▼]│ [Outdoor electrical]       │ [+$2,200]       │ │
│  │ [07-Roofing  ▼] │ [Patio roof extension]     │ [+$4,800]       │ │
│  │ [+ Add Line]                                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Subtotal:                                              +$15,500    │
│  Markup (15%):                                           +$2,325    │
│  Total Change Order Amount:                             +$17,825    │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  SCHEDULE IMPACT                                                    │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Days Added/Removed: [+5] days                                      │
│  Reason: [Patio work will occur after siding, adds 5 days]          │
│                                                                     │
│                                                                     │
│                          [Save Draft] [Submit for Approval] [Delete]│
└─────────────────────────────────────────────────────────────────────┘
```

## CO Detail View

Shows:
- Header with status
- Full description
- Line items
- Schedule impact
- Approval chain
- Before/after budget comparison
- Signature area (client approval)

## CO Approval Flow
1. PM creates and submits
2. Owner reviews (if over threshold or always)
3. Send to client
4. Client approves (signature)
5. Budget automatically updated
6. Schedule adjusted if days impact

## CO-to-Budget Link

When CO approved:
- New budget lines created (or existing modified)
- Budget revised amount updated
- Activity log records change
- Draws reflect updated schedule of values

---

## API Endpoints

### Purchase Orders
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/purchase-orders` | List POs |
| POST | `/api/purchase-orders` | Create PO |
| GET | `/api/purchase-orders/:id` | Get detail |
| PATCH | `/api/purchase-orders/:id` | Update |
| POST | `/api/purchase-orders/:id/approve` | Approve |
| POST | `/api/purchase-orders/:id/send` | Send to vendor |
| POST | `/api/purchase-orders/upload-quote` | Upload vendor quote for AI |
| POST | `/api/purchase-orders/extract` | AI extraction from quote |
| POST | `/api/purchase-orders/from-quote` | Create PO from extracted data |

### Draws
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/draws` | List draws |
| POST | `/api/draws` | Create draw |
| GET | `/api/draws/:id` | Get detail |
| PATCH | `/api/draws/:id` | Update |
| POST | `/api/draws/:id/submit` | Submit to client |
| POST | `/api/draws/:id/approve` | Record client approval |
| GET | `/api/draws/:id/pdf` | Generate PDF |

### Change Orders
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/change-orders` | List COs |
| POST | `/api/change-orders` | Create CO |
| GET | `/api/change-orders/:id` | Get detail |
| PATCH | `/api/change-orders/:id` | Update |
| POST | `/api/change-orders/:id/approve` | Internal approve |
| POST | `/api/change-orders/:id/send` | Send to client |
| POST | `/api/change-orders/:id/client-approve` | Record signature |

---

## Component Structure

```
components/purchase-orders/
├── POList.tsx
├── POForm.tsx
├── PODetail.tsx
├── POLineItems.tsx
├── POStatusBadge.tsx
└── POInvoiceLink.tsx

components/draws/
├── DrawList.tsx
├── DrawEditor.tsx
├── DrawDetail.tsx
├── DrawScheduleOfValues.tsx
├── DrawSummary.tsx
├── DrawInvoices.tsx
├── DrawPdfPreview.tsx
└── DrawStatusBadge.tsx

components/change-orders/
├── COList.tsx
├── COForm.tsx
├── CODetail.tsx
├── COLineItems.tsx
├── COBudgetImpact.tsx
├── COSignature.tsx
└── COStatusBadge.tsx
```

---

## Affected By Changes To
- Jobs (POs, draws, COs all job-scoped)
- Vendors (PO vendor selection)
- Clients (draw recipient, CO approval)
- Cost Codes (line item allocation)
- Budget (draws pull schedule of values, COs update budget)
- Invoices (linked to POs, included in draws)
- Users (approval chain)
- Company settings (approval thresholds, markup defaults)

## Affects
- Budget (COs update budget lines, POs show committed)
- Invoices (PO matching)
- Job profitability (draws = revenue, POs = committed costs)
- Client Portal (draw approval, CO viewing)
- QuickBooks (draws synced as customer invoices)
- Activity logs (approval actions)

---

## Mobile Considerations

### Purchase Orders
- Quick PO creation from vendor quote (camera capture)
- Swipe to approve POs pending your review
- Tap vendor to call/email

### Draws
- View-only draw details with PDF preview
- Track draw status and client approval
- Push notifications for client responses

### Change Orders
- View CO details and line items
- Client signature capture on mobile
- Share CO PDF via messaging apps

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning session |
| Audit Fix | Added AI-Assisted PO Creation section (from vendor quotes) |
