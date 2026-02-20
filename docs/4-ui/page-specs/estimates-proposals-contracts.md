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

## Gap Items Addressed

### Section 45 — Per-Page Feature Requirements (Selections Page)
- **#724** Visual room-by-room layout — "Kitchen Selections," "Master Bath Selections"
- **#725** Selection cards with photos, descriptions, pricing, lead times
- **#726** Comparison mode — side-by-side options within a category
- **#727** Budget impact real-time calculator — "choosing this option puts you $2,400 over allowance"
- **#728** Approval button with e-signature
- **#729** Status indicators — Not Started, Options Presented, Client Reviewing, Selected, Ordered, Received, Installed
- **#730** Deadline countdown — "Selection needed by [date] to stay on schedule"
- **#731** Inspiration board — client uploads photos of what they like
- **#732** Comment/question thread per selection category
- **#733** History — track all considered options, not just final selection
- **#734** Print/export selection summary
- **#735** Designer view — interior designer can add/recommend options

### Section 11 — Estimating & Budgeting
- **#257** Support for CSI MasterFormat, custom codes, and hybrid cost code systems
- **#258** Configurable estimate hierarchy (Division > Code > Line Item vs Phase > Trade > Item)
- **#259** Estimate templates by project type per builder
- **#260** Estimating by assembly vs line-by-line
- **#261** Unit pricing support ($/SF for everything)
- **#262** Configurable markup structures (flat %, tiered, per-line, built-in)
- **#263** Estimate formats configurable per audience (client sees summary, builder sees detail)
- **#264** Configurable estimate approval workflows
- **#265** Estimate versioning with comparison showing changes between versions
- **#266** Presentation at different levels of detail per audience
- **#267** Support for NTE, GMP, and cost-plus-with-estimate types
- **#268** Placeholder/allowance amounts for work without bids yet
- **#269** Scope exclusion tracking within estimates
- **#270** Alternate/option pricing within estimates
- **#271** Estimate expiration handling (valid for N days)

### Section 12 — Contracts & Legal
- **#281** Builder-uploadable contract templates
- **#282** Support for AIA, custom, and state-specific contracts
- **#283** Contract clause library (mix-and-match standard clauses)
- **#284** Contract compliance tracking by contract type
- **#285** Configurable retainage by builder, trade, and contract
- **#286** Subcontract status tracking (Sent, Received, Reviewed, Countersigned, Executed, Insurance Verified)
- **#287** Verbal change directive formalization workflow
- **#288** Warranty obligation tracking per contract
- **#289** Configurable contract closeout checklist
- **#290** Client deposit tracking with jurisdiction-aware rules

### Section 18 — Selections & Allowances
- **#369** Support for allowance-based, fixed-price, and cost-plus selection workflows
- **#370** Configurable selection categories per builder
- **#371** Selection presentation modes (meeting-based vs online browsing)
- **#372** Vendor catalog integration (future feature consideration)
- **#373** Complex configuration selections (e.g. cabinetry with 50+ decision points)
- **#374** Selection deadlines tied to construction schedule with lead time buffers
- **#375** Selection change requests after ordering (cancellation/restocking fees, delay impact)
- **#376** Selection rooms/boards — visual grouping by room
- **#377** Selections for spec homes (builder makes selections, no client)
- **#378** Model home selections with upgrade options for buyers
- **#379** Multi-home selections (standard vs per-buyer)
- **#380** Selection history for repeat clients (preferences carry forward)

---

## Additional Requirements from Gap Analysis

### Estimate Builder Enhancements Needed
1. **Assembly-based estimating** (#260): Add ability to define assemblies (groups of line items) that can be inserted as a unit (e.g., "Standard Kitchen" assembly includes cabinets, countertops, plumbing fixtures as a bundle)
2. **Multi-format presentation** (#263, #266): Add a "Client View" toggle on estimate preview that collapses detail into summary categories; configurable per builder which lines are visible to clients
3. **Version comparison** (#265): Side-by-side or diff view showing what changed between estimate versions (added lines, removed lines, price changes)
4. **Scope exclusions** (#269): Add an "Exclusions" section to the estimate builder listing what is NOT included; these should print on proposals
5. **Alternate pricing** (#270): Support "Option A / Option B" line items within an estimate that client can choose between before signing
6. **Expiration tracking** (#271): Add `valid_until` date field to estimates and proposals with automatic status change when expired
7. **Template library** (#259): Estimate templates per project type that pre-populate cost code groups and placeholder amounts

### Contract View Enhancements Needed
1. **Contract template upload** (#281): Settings page for uploading builder-specific contract templates (AIA, custom) that can be attached to proposals
2. **Clause library** (#283): Reusable clause blocks (payment terms, CO policy, warranty terms) that can be mixed into proposals
3. **Subcontract tracking** (#286): Status pipeline for subcontracts beyond just signed/unsigned
4. **Deposit tracking** (#290): Track client deposits, how they are applied, jurisdiction rules for holding deposits
5. **Retainage configuration** (#285): Per-vendor, per-contract retainage percentage (not just global default)

### Selection Enhancements Needed
1. **Room-based organization** (#724, #376): Group selections by room (Kitchen, Master Bath, etc.) instead of flat list
2. **Comparison mode** (#726): Allow side-by-side comparison of 2-3 options within a category
3. **Lead time display** (#725): Show lead time per selection option to help clients understand schedule impact
4. **Status expansion** (#729): Expand status from current 4 states to 7: Not Started, Options Presented, Client Reviewing, Selected, Ordered, Received, Installed
5. **Inspiration board** (#731): Allow clients to upload inspiration photos per selection category
6. **Comment threads** (#732): Per-selection-category conversation thread between client and builder
7. **Selection history** (#733): Track all options that were considered, not just the final pick
8. **Designer role** (#735): Allow interior designers to log in and add/recommend options
9. **Print/export** (#734): Export full selection summary as PDF with photos and pricing

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 11, 12, 18, and 45 |
| Initial | Created from batch planning session |
