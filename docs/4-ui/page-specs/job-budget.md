# View Plan: Budget

## Overview
- **URL**: `/jobs/:id/budget` (from job nav, Financial dropdown)
- **Purpose**: View budget lines and track actual vs planned
- **Source**: Created from signed estimate, modified only via Change Orders

---

## Budget View

```
┌─────────────────────────────────────────────────────────────────────┐
│ Budget - Smith Residence                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │          BUDGET SUMMARY CHART                                   │ │
│ │   ████████████████████████░░░░░░░░░░  72% Spent                 │ │
│ │   Budget: $450,000  |  Spent: $324,000  |  Remaining: $126,000  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Cost Code  │ Description    │ Original │ COs    │ Revised     │ │
│ │            │                │ Budget   │        │ Budget      │ │
│ ├────────────┼────────────────┼──────────┼────────┼─────────────┤ │
│ │ 01-General │ General Cond.  │ $40,000  │   $0   │ $40,000     │ │
│ │ 03-Concrete│ Foundation     │ $35,000  │   $0   │ $35,000     │ │
│ │ 06-Carpentry│ Framing       │ $80,000  │+$5,000 │ $85,000     │ │
│ │ ...        │ ...            │ ...      │ ...    │ ...         │ │
│ ├────────────┴────────────────┴──────────┴────────┴─────────────┤ │
│ │ TOTALS                      │$420,000  │+$30,000│ $450,000    │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │            │ Committed│ Invoiced │ Paid     │ Variance         │ │
│ │            │ (POs)    │          │          │                  │ │
│ ├────────────┼──────────┼──────────┼──────────┼──────────────────┤ │
│ │ 01-General │ $38,000  │ $35,000  │ $35,000  │ -$2,000 ✓        │ │
│ │ 03-Concrete│ $35,000  │ $35,000  │ $35,000  │ $0               │ │
│ │ 06-Carpentry│$90,000  │ $72,000  │ $68,000  │ +$5,000 ⚠️       │ │
│ │ ...        │ ...      │ ...      │ ...      │ ...              │ │
│ ├────────────┴──────────┴──────────┴──────────┴──────────────────┤ │
│ │ TOTALS     │$310,000  │$292,500  │$275,000  │ -$5,200 (over)   │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Note: Budget modified only through Change Orders                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

### Summary Chart
- Progress bar showing % of budget spent
- Key totals: Budget, Spent, Remaining
- Color coding: Green (on track), Yellow (approaching), Red (over)

### Budget Lines Table
| Column | Description |
|--------|-------------|
| Cost Code | CSI code and name |
| Original Budget | From estimate |
| Change Orders | Sum of approved COs for this line |
| Revised Budget | Original + COs |
| Committed | PO amounts |
| Invoiced | Invoice amounts |
| Paid | Paid amount |
| Variance | Revised - Invoiced (+ = under, - = over) |

### Expandable Rows
Click a cost code row to see:
- Individual POs for this code
- Individual invoices for this code
- Change orders affecting this line

### Actions
- Export to Excel
- Print/PDF
- View full reports (link to Reports page)

---

## Read-Only Rules

Budget lines cannot be directly edited. Changes come from:
1. **Change Orders** - Add/modify budget amounts
2. **Invoices** - Update actual costs
3. **POs** - Update committed amounts

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/budget` | Get budget with lines |
| GET | `/api/jobs/:id/budget/summary` | Aggregated totals |

---

## Affected By Changes To
- Jobs (job must exist)
- Estimates (imported to create budget)
- Cost Codes (budget line categories)
- Change Orders (updates committed amounts)
- Invoices (updates actual costs when approved)

## Affects
- Job profitability calculations
- Variance reports
- Invoice allocation options
- Change Order cost code selection
- Draw cost breakdowns

---

## Mobile Considerations

- Simplified table with horizontal scroll for all columns
- Card view option: one budget line per card with key metrics
- Tap to expand line details (committed, invoiced, remaining)
- Color-coded variance indicators (green = under, red = over)
- Pull-to-refresh for latest data
- Offline: Cache budget data, show "last updated" timestamp
- Quick filter chips: All, Over Budget, Under Budget

---

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements (Budget Page, items 658-672)
- GAP-658: Expandable/collapsible hierarchy — Division to Cost Code to Line Item
- GAP-659: Multiple budget views — Original budget, current budget (with COs), committed, actual, projected final
- GAP-660: Variance column with color coding (under = green, over = red)
- GAP-661: Percentage indicators — % budget consumed, % work complete
- GAP-662: Cost-to-complete column — auto-calculated or manually overridable
- GAP-663: Budget line item notes — explain variances
- GAP-664: Attached documents per line — linked invoices, POs, bids
- GAP-665: Filter by trade, phase, cost code, status (over/under budget)
- GAP-666: Budget history — see budget at any point in time (snapshots)
- GAP-667: Import/export to Excel
- GAP-668: Compare to similar projects — benchmark this line against averages
- GAP-669: Forecast scenarios — "what if concrete costs go up 10%?"
- GAP-670: Change order impact — visual indicator of original vs. CO-adjusted budget
- GAP-671: Locked/frozen lines — some budget lines are finalized, others are still estimating
- GAP-672: Audit trail per line — who changed what, when

### Cross-Section Gap Items
- GAP-17: Custom cost code hierarchies per builder (CSI, custom, hybrid)
- GAP-257: Different cost code systems — CSI MasterFormat, custom codes, hybrid systems
- GAP-258: Configurable estimate hierarchy — Division to Code to Item vs. Phase to Trade to Item
- GAP-272: Budget changes when contract type changes mid-project (cost-plus to GMP)
- GAP-273: Tracking committed costs vs. budgeted costs vs. actual costs
- GAP-274: Cost-to-complete projections based on current spend rate
- GAP-275: Earned value management — cost performance vs. schedule performance
- GAP-276: Configurable budget alerts per builder (alerts at 80%, 95%, etc.)
- GAP-278: Support builders who track actuals only without full budgeting
- GAP-279: Budget contingency management — drawdown tracking with documentation
- GAP-280: Budgets in different formats for different audiences (owner, PM, bank/AIA)
- GAP-431: Chart of accounts mapping configurable per builder for QuickBooks sync
- GAP-434: WIP schedule calculation methods — percentage of completion, cost-to-cost
- GAP-455: Comparative reports across projects for benchmarking
- GAP-540: Data audit trails — who changed what, when, previous values
- GAP-818: Shared costs between projects — configurable allocation methods
- GAP-819: Year-end financial close — preventing changes to closed periods
- GAP-823: Budget contingency reallocation — moving contingency funds with documentation
- GAP-824: Profit margin analysis accounting for COs, warranty costs, and GC overrun
- GAP-861: Full chain traceability — estimate line to budget line to PO to invoice to payment

## Additional Requirements from Gap Analysis
- Cost-to-complete column (auto-calculated or manually overridable) is not in the current spec (GAP-662)
- Budget line item notes to explain variances are not specified (GAP-663)
- Attached documents per budget line (linked invoices, POs, bids) are not detailed (GAP-664)
- Filter by trade, phase, cost code, or budget status (over/under) is not specified (GAP-665)
- Budget history / snapshots to see budget at any point in time is missing (GAP-666)
- Benchmark comparison against similar projects is not covered (GAP-668)
- Forecast / what-if scenarios ("what if costs go up 10%?") are not specified (GAP-669)
- Locked/frozen budget lines for finalized vs. estimating lines are missing (GAP-671)
- Audit trail per line showing who changed what and when is not detailed (GAP-672)
- Configurable budget alerts at threshold percentages per builder (GAP-276)
- Contingency management with drawdown tracking and documentation (GAP-279, GAP-823)
- Multiple audience views — owner sees 10 categories, PM sees 200 lines, bank sees AIA format (GAP-280)
- Earned value management indicators (CPI, SPI) are not shown (GAP-275)
- Year-end financial close preventing changes to prior periods (GAP-819)
- Shared cost allocation across projects is not addressed (GAP-818)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
