# View Plan: Estimates, Proposals, Contracts, Selections

## Views Covered
- Estimates (List, Builder, Preview)
- Proposals (List, Editor, Send)
- Contracts (from signed proposal)
- Selections (Allowances)

---

## Pre-Construction Flow

```
JOB (Pre-Construction Phase)
          │
          ▼
   ┌─────────────┐      Can have multiple
   │  ESTIMATE   │◄─────revisions/options
   │  (v1, v2)   │
   └──────┬──────┘
          │ Generate from
          ▼
   ┌─────────────┐      Can send multiple
   │  PROPOSAL   │◄─────to client for review
   └──────┬──────┘
          │ Client signs
          ▼
   ┌─────────────┐
   │  CONTRACT   │      Locked, becomes official
   └──────┬──────┘
          │ Copy to
          ▼
   ┌─────────────┐      Locked estimate →
   │   BUDGET    │      Becomes budget lines
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐      Client selects via portal
   │ SELECTIONS  │      Variance → Change Order
   └─────────────┘
```

---

# ESTIMATES

## Estimate Workflow

```
DRAFT ──► IN PROGRESS ──► COMPLETE ──► SENT (as proposal) ──► ACCEPTED (locked)
```

## Estimate List View

### URL
`/jobs/:id/estimates` (from job nav, Pre-Con dropdown)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Estimates - Smith Residence                          [+ New Estimate]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Estimate       │ Version │ Amount    │ Status    │ Actions     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Main Estimate  │ v3      │ $450,000  │ ● Accepted│ [View] 🔒   │ │
│ │ Option A       │ v1      │ $485,000  │ ● Complete│ [View][Edit]│ │
│ │ Budget Option  │ v1      │ $395,000  │ ● Draft   │ [View][Edit]│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🔒 = Locked (signed proposal)                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Estimate Builder View

### URL
`/jobs/:id/estimates/:estimateId`

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Estimates    Main Estimate v3                   [Save] [Preview]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Job: Smith Residence                               Status: Complete │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ ESTIMATE LINES                                                      │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 01 - GENERAL CONDITIONS                              Subtotal   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │   Project Management                        $25,000             │ │
│ │   Permits & Fees                            $8,500              │ │
│ │   Insurance                                 $6,500              │ │
│ │   [+ Add Line]                              ────────            │ │
│ │                                             $40,000             │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 03 - CONCRETE                                                   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │   Foundation (1,800 sf)                                         │ │
│ │     - Labor (ABC Concrete)                  $18,000             │ │
│ │     - Materials                             $12,000             │ │
│ │   Flatwork                                                      │ │
│ │     - Driveway (600 sf)                     $4,800              │ │
│ │   [+ Add Line]                              ────────            │ │
│ │                                             $34,800             │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 09 - FINISHES                                                   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │   ⭐ Flooring Allowance                     $15,000  [ALLOWANCE]│ │
│ │   ⭐ Kitchen Fixtures                       $12,000  [ALLOWANCE]│ │
│ │   Paint & Wall Finishes                                         │ │
│ │     - Labor                                 $8,000              │ │
│ │     - Materials                             $3,500              │ │
│ │   [+ Add Line]                              ────────            │ │
│ │                                             $38,500             │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ... more cost codes ...                                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ SUMMARY                                                             │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│   Subtotal:                                        $385,000         │
│   Markup (15%):                                     $57,750         │
│   Allowances Total:                                 $27,000         │
│   ─────────────────────────────────────────────────────────         │
│   Total Estimate:                                  $442,750         │
│                                                                     │
│                              [Create Proposal] [Duplicate] [Delete] │
└─────────────────────────────────────────────────────────────────────┘
```

## Estimate Line Types

| Type | Icon | Description |
|------|------|-------------|
| Standard | - | Normal cost item |
| Allowance | ⭐ | Client selection needed, track variance |
| Excluded | ✗ | Not included (for reference) |

## Estimate Line Fields

| Field | Type | Notes |
|-------|------|-------|
| cost_code_id | select | CSI cost code |
| category | select | Labor, Material, Subcontractor, Equipment |
| description | text | Line description |
| quantity | number | Amount |
| unit | select | EA, SF, LF, LS, HR, etc. |
| unit_cost | currency | Per-unit cost |
| total | currency | Calculated |
| is_allowance | boolean | Marks as allowance |
| notes | text | Internal notes |
| vendor_id | select | Optional vendor reference |

---

# PROPOSALS

## Proposal Workflow

```
DRAFT ──► READY ──► SENT ──► VIEWED ──► SIGNED (→ Contract)
                              │
                              └──► DECLINED
```

## Proposal List View

### URL
`/jobs/:id/proposals` (from job nav)

### Columns
| Column | Notes |
|--------|-------|
| Name | Proposal name |
| Estimate | Linked estimate |
| Amount | Total amount |
| Status | Draft, Sent, Viewed, Signed, Declined |
| Sent Date | When sent to client |
| Actions | View, Edit, Send, Duplicate |

## Proposal Editor View

### URL
`/jobs/:id/proposals/:proposalId`

### Sections

1. **Cover Info**
   - Proposal title
   - Client name
   - Date
   - Valid until

2. **Scope of Work** (rich text)
   - Introduction
   - Detailed scope description
   - What's included/excluded

3. **Pricing** (from estimate)
   - Can show detailed or summary
   - Toggle line item visibility
   - Show/hide individual costs

4. **Terms & Conditions** (rich text)
   - Payment terms
   - Change order policy
   - Timeline
   - Warranty

5. **Signature Area**
   - Client signature field
   - Date

### Proposal Settings
- Show line items: Yes/No
- Show unit prices: Yes/No
- Include allowance details: Yes/No
- Custom cover page: Yes/No

## Proposal Send Flow

1. Mark proposal as Ready
2. Click "Send to Client"
3. Enter client email
4. Email sent with link to portal
5. Client views in portal
6. Client signs electronically
7. Status → Signed
8. Estimate → Locked
9. Estimate → Copied to Budget
10. Signed PDF stored

---

# CONTRACTS

## Contract = Signed Proposal

When a proposal is signed:
- Proposal status = "Signed"
- Creates contract record
- Links to proposal, estimate
- Stores signed PDF
- Locks the estimate
- Creates budget from estimate

### Contract View

`/jobs/:id/contract`

Shows:
- Signed proposal PDF
- Signature details (who, when)
- Contract amount
- Key dates
- Link to original estimate
- "View Budget" link

---

# SELECTIONS

## Selection Workflow

```
ALLOWANCE (in estimate)
          │
          ▼
   PENDING SELECTION (client needs to choose)
          │
          ▼ (client selects via portal)
   SELECTED (vendor/item chosen)
          │
   ┌──────┴──────┐
   │             │
   ▼             ▼
AT/UNDER      OVER ALLOWANCE
(no action)   (creates change order)
```

## Selections List View

### URL
`/jobs/:id/selections` (from job nav, Pre-Con dropdown)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Selections - Smith Residence                              [+ Add]   │
├─────────────────────────────────────────────────────────────────────┤
│ Status Tabs: All | Pending | Selected | Ordered                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Category    │ Item        │ Allowance │ Selected │ Variance    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Flooring    │ Pending     │ $15,000   │ ---      │ ---         │ │
│ │ Kitchen Fix │ Kohler K-123│ $12,000   │ $14,500  │ +$2,500 ⚠️  │ │
│ │ Lighting    │ Selected    │ $8,000    │ $7,200   │ -$800 ✓     │ │
│ │ Appliances  │ Pending     │ $10,000   │ ---      │ ---         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Total Allowances: $45,000   Total Selected: $21,700                 │
│ Net Variance: +$1,700 (Change Order pending)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Selection Detail/Edit

```
┌─────────────────────────────────────────────────────────────────────┐
│ Selection: Kitchen Fixtures                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Category: Kitchen                                                   │
│ Description: Kitchen sink, faucet, disposal                         │
│                                                                     │
│ ALLOWANCE                                                           │
│ ──────────                                                          │
│ Budgeted Amount: $12,000                                            │
│ (from Estimate line 09-Kitchen Fixtures)                            │
│                                                                     │
│ CLIENT SELECTION                                                    │
│ ────────────────                                                    │
│ Vendor: [Ferguson Plumbing    ▼]                                    │
│ Item: [Kohler K-596-VS Simplice___]                                 │
│ Description: [Faucet with pull-down sprayer]                        │
│                                                                     │
│ Selected Amount: [$14,500]                                          │
│                                                                     │
│ VARIANCE                                                            │
│ ────────                                                            │
│ Over Allowance: +$2,500                                             │
│ ⚠️ This will generate a Change Order                                │
│                                                                     │
│ Status: ○ Pending  ● Selected  ○ Approved  ○ Ordered                │
│                                                                     │
│                                                [Cancel] [Save]      │
└─────────────────────────────────────────────────────────────────────┘
```

## Selection Flow

1. **Allowances created** from estimate lines marked as allowances
2. **Client notified** via portal to make selections
3. **Client browses** options (optionally with vendor links)
4. **Client selects** item and submits
5. **PM reviews** and approves
6. **If over allowance**: System suggests Change Order
7. **Client approves** Change Order (if needed)
8. **Selection finalized** and marked as ordered

## Client Portal Selection View

Client sees:
- Category and description
- Allowance amount
- Current selection (if any)
- Options to choose from (if provided)
- Upload capability (for their own selections)
- Submit button
- Variance warning if over

---

## API Endpoints

### Estimates
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/estimates` | List estimates |
| POST | `/api/jobs/:id/estimates` | Create estimate |
| GET | `/api/estimates/:id` | Get detail |
| PATCH | `/api/estimates/:id` | Update |
| POST | `/api/estimates/:id/lines` | Add line |
| POST | `/api/estimates/:id/duplicate` | Duplicate |
| POST | `/api/estimates/:id/to-budget` | Convert to budget |

### Proposals
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/proposals` | List proposals |
| POST | `/api/jobs/:id/proposals` | Create from estimate |
| GET | `/api/proposals/:id` | Get detail |
| PATCH | `/api/proposals/:id` | Update content |
| POST | `/api/proposals/:id/send` | Send to client |
| POST | `/api/proposals/:id/sign` | Record signature |

### Selections
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/selections` | List selections |
| GET | `/api/selections/:id` | Get detail |
| PATCH | `/api/selections/:id` | Update |
| POST | `/api/selections/:id/approve` | Approve selection |

---

## Component Structure

```
components/estimates/
├── EstimateList.tsx
├── EstimateBuilder.tsx
├── EstimateLine.tsx
├── EstimateLineForm.tsx
├── EstimateSummary.tsx
├── EstimateCostCodeGroup.tsx
└── AllowanceBadge.tsx

components/proposals/
├── ProposalList.tsx
├── ProposalEditor.tsx
├── ProposalPreview.tsx
├── ProposalScope.tsx
├── ProposalPricing.tsx
├── ProposalTerms.tsx
├── ProposalSignature.tsx
└── ProposalSendDialog.tsx

components/selections/
├── SelectionList.tsx
├── SelectionDetail.tsx
├── SelectionForm.tsx
├── SelectionVariance.tsx
└── SelectionPortal.tsx (for client)
```

---

## Database Notes

### Estimate Versioning
- Store version number
- Keep history of versions
- Only latest version editable (unless duplicated)

### Locking
- `locked_at` - When locked (signed)
- `locked_by_proposal_id` - Which proposal locked it
- Locked estimates cannot be edited

### Allowance to Selection Link
- Selections reference `estimate_line_id` for the allowance
- Track original amount vs selected amount
- Auto-create change order if over

---

## Affected By Changes To
- Jobs (estimates/proposals are job-scoped)
- Cost Codes (estimate line items)
- Company settings (markup defaults, proposal templates)
- Users (created by, sent by tracking)

## Affects
- Budget (estimate becomes budget when locked)
- Change Orders (selections over allowance create COs)
- Client Portal (selections visible to client)
- Proposals (estimates attached to proposals)
- Activity logs (proposal sent, viewed, signed events)

---

## Mobile Considerations

- View-only estimates with swipe to see cost breakdown
- Quick proposal status view (sent, viewed, signed)
- Client signature via mobile-friendly e-signature pad
- Push notifications when proposal is viewed or signed
- Selection cards with image zoom and pinch gestures
- Selection approval/rejection with quick-tap actions
- Photo capture for selection confirmations
- Offline: Cache proposals and selections, queue approvals
- Pull-to-refresh for proposal status updates
- Share proposal link via SMS or messaging apps

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning session |
