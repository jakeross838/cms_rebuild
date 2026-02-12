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

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning |
