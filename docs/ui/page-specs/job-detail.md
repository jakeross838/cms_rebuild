# View Plan: Job Overview

## Overview
- **URL**: `/jobs/:id` (default route when job selected)
- **Purpose**: Dashboard overview of a single job/project
- **Layout**: Single scrolling page with summary sections
- **Context**: Job is selected from persistent left sidebar. See NAVIGATION.md for full app navigation structure.
- **Note**: This is the "Overview" section. Other sections (Budget, Invoices, etc.) are accessed via top nav dropdowns.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Jobs                                               [Actions ▼]    │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  [Photo]    Smith Residence                    ● Active         │ │
│ │             123 Oak Street, Austin, TX                          │ │
│ │             Client: John Smith | PM: Jake Ross                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Overview | Budget | Schedule | Invoices | Draws | Photos | Logs ││
│ │          | Files | Change Orders | Selections | Punch List      ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  OVERVIEW SECTION                                                   │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  ┌──────────────────────┬──────────────────────┬──────────────────┐ │
│  │ CONTRACT             │ SPENT                │ REMAINING        │ │
│  │ $450,000             │ $292,500             │ $157,500         │ │
│  │                      │ 65% of budget        │ 35%              │ │
│  └──────────────────────┴──────────────────────┴──────────────────┘ │
│                                                                     │
│  ┌──────────────────────┬──────────────────────┬──────────────────┐ │
│  │ START DATE           │ TARGET               │ DAYS REMAINING   │ │
│  │ Jun 1, 2024          │ Dec 15, 2024         │ 45 days          │ │
│  └──────────────────────┴──────────────────────┴──────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PROGRESS CHART                             │   │
│  │    ████████████████████████████░░░░░░░░░░░░░░░░  65%          │   │
│  │                                                               │   │
│  │    Budget: ████████████████████████░░░░░░░░  72%              │   │
│  │    Schedule: ██████████████████░░░░░░░░░░░░  58%              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────┬─────────────────────────────────┐ │
│  │   QUICK ACTIONS              │    RECENT ACTIVITY              │ │
│  │   ─────────────              │    ───────────────              │ │
│  │   [+ Invoice]                │    • Invoice #1234 approved     │ │
│  │   [+ Purchase Order]         │      2 hours ago                │ │
│  │   [+ Daily Log]              │    • Photo added                │ │
│  │   [+ Change Order]           │      Yesterday                  │ │
│  │                              │    • Draw #3 submitted          │ │
│  │                              │      2 days ago                 │ │
│  └──────────────────────────────┴─────────────────────────────────┘ │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  BUDGET SUMMARY                                    [View Full →]    │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Original Budget    Change Orders    Revised Budget          │   │
│  │  $420,000           +$30,000         $450,000                │   │
│  │                                                               │   │
│  │  Committed (POs)    Invoiced         Paid                    │   │
│  │  $310,000           $292,500         $275,000                │   │
│  │                                                               │   │
│  │  Remaining to Bill  Variance                                  │   │
│  │  $157,500           -$5,200 (over)                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  SCHEDULE PREVIEW                                  [View Full →]    │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Current Phase: Framing (Week 12 of 24)                       │   │
│  │                                                               │   │
│  │  Upcoming Tasks:                                              │   │
│  │  • Roof trusses delivery - Tomorrow                          │   │
│  │  • Roofing inspection - Dec 5                                 │   │
│  │  • Siding start - Dec 8                                       │   │
│  │                                                               │   │
│  │  Overdue:                                                     │   │
│  │  • HVAC rough-in (2 days late)                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  FINANCIAL                                         [View All →]     │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  ┌────────────────────────────────┬─────────────────────────────┐   │
│  │  RECENT INVOICES               │  DRAWS                       │   │
│  │  ────────────────              │  ─────                       │   │
│  │  ABC Electric - $12,450        │  Draw #3 - $45,000          │   │
│  │  ● Pending Approval            │  ● Submitted                 │   │
│  │                                │                              │   │
│  │  XYZ Plumbing - $8,200         │  Draw #2 - $65,000          │   │
│  │  ● Approved                    │  ● Paid                      │   │
│  │                                │                              │   │
│  │  Lumber Co - $15,800           │  Draw #1 - $55,000          │   │
│  │  ● Paid                        │  ● Paid                      │   │
│  │                                │                              │   │
│  │  [+ Add Invoice]               │  [+ Create Draw]             │   │
│  └────────────────────────────────┴─────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Page Header

### Job Info
- Featured photo (or placeholder)
- Job name
- Full address
- Status badge (colored)
- Client name (link to client)
- Assigned team members (avatars with names)

### Actions Dropdown
- Edit Job
- Change Status
- Archive Job
- Delete Job (admin only)

---

## Sub-Page Navigation

Links to separate pages:
| Link | URL | Purpose |
|------|-----|---------|
| Overview | `/jobs/:id` | Current page |
| Budget | `/jobs/:id/budget` | Full budget management |
| Schedule | `/jobs/:id/schedule` | Task/timeline management |
| Invoices | `/jobs/:id/invoices` | Job invoices |
| Draws | `/jobs/:id/draws` | Pay applications |
| Photos | `/jobs/:id/photos` | Photo gallery |
| Daily Logs | `/jobs/:id/daily-logs` | Field documentation |
| Files | `/jobs/:id/files` | Document storage |
| Change Orders | `/jobs/:id/change-orders` | Scope changes |
| Selections | `/jobs/:id/selections` | Allowances |
| Punch List | `/jobs/:id/punch-list` | Closeout items |

---

## Overview Section

### Key Metrics Cards
| Metric | Value | Notes |
|--------|-------|-------|
| Contract Amount | $450,000 | Total contract value |
| Spent | $292,500 | Total invoiced |
| Remaining | $157,500 | Contract - Spent |
| Start Date | Jun 1, 2024 | |
| Target Date | Dec 15, 2024 | |
| Days Remaining | 45 | Calculated |

### Progress Chart
- Overall progress bar (% complete)
- Budget progress (% of budget used)
- Schedule progress (% of timeline elapsed)

### Quick Actions
Buttons to quickly add:
- Invoice
- Purchase Order
- Daily Log
- Change Order
- Photo

### Recent Activity Feed
Last 5-10 activities:
- Invoice added/approved/paid
- PO created
- Daily log added
- Photo uploaded
- Status changed
- Draw submitted/approved/paid

---

## Budget Summary Section

### Summary Cards
| Metric | Description |
|--------|-------------|
| Original Budget | Sum of original budget lines |
| Change Orders | Sum of approved COs |
| Revised Budget | Original + COs |
| Committed (POs) | Total PO amounts |
| Invoiced | Total invoice amounts |
| Paid | Total paid invoices |
| Remaining | Revised - Invoiced |
| Variance | Budget - Actual (positive = under, negative = over) |

### Link
"View Full Budget →" goes to `/jobs/:id/budget`

---

## Schedule Preview Section

### Current Phase
- Name of current phase/milestone
- Week X of Y progress

### Upcoming Tasks
- Next 3-5 tasks with dates

### Overdue Tasks
- List of late tasks (highlighted)

### Link
"View Full Schedule →" goes to `/jobs/:id/schedule`

---

## Financial Section

### Recent Invoices
- Last 3-5 invoices
- Vendor name, amount, status badge
- "+ Add Invoice" button

### Draws
- All draws for job
- Draw number, amount, status badge
- "+ Create Draw" button

### Link
"View All →" goes to `/jobs/:id/invoices` or `/jobs/:id/draws`

---

## Data Requirements

### Job Entity (full)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| name | string | |
| job_number | string | |
| address, city, state, zip | string | |
| status | string | |
| phase | string | Current construction phase |
| client | object | Joined client data |
| assignments | array | Team with roles |
| contract_amount | decimal | |
| start_date | date | |
| target_completion | date | |
| actual_completion | date | |
| photo_url | string | Featured photo |
| notes | text | |
| created_at, updated_at | timestamp | |

### Calculated/Aggregated
| Field | Source |
|-------|--------|
| budget_original | Sum of budget_lines.original_amount |
| budget_revised | budget_original + change_orders |
| committed | Sum of PO totals |
| invoiced | Sum of invoice totals |
| paid | Sum of paid invoices |
| percent_complete | From draws or manual |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id` | Get job with summary data |
| GET | `/api/jobs/:id/summary` | Get calculated metrics |
| GET | `/api/jobs/:id/activities` | Recent activity feed |
| PATCH | `/api/jobs/:id` | Update job |
| PATCH | `/api/jobs/:id/status` | Change status |

### GET /api/jobs/:id Response
```json
{
  "job": { ... },
  "client": { ... },
  "assignments": [...],
  "summary": {
    "budget_original": 420000,
    "budget_revised": 450000,
    "committed": 310000,
    "invoiced": 292500,
    "paid": 275000,
    "percent_complete": 65
  },
  "schedule": {
    "current_phase": "Framing",
    "upcoming_tasks": [...],
    "overdue_tasks": [...]
  },
  "recent_invoices": [...],
  "draws": [...],
  "recent_activity": [...]
}
```

---

## Component Structure

```
pages/jobs/
└── [id]/
    ├── page.tsx              (Job Detail / Overview)
    ├── budget/
    │   └── page.tsx          (Budget management)
    ├── schedule/
    │   └── page.tsx          (Schedule management)
    ├── invoices/
    │   └── page.tsx          (Job invoices)
    ├── draws/
    │   └── page.tsx          (Draws)
    ├── photos/
    │   └── page.tsx          (Photo gallery)
    ├── daily-logs/
    │   └── page.tsx          (Daily logs)
    ├── files/
    │   └── page.tsx          (File storage)
    ├── change-orders/
    │   └── page.tsx          (Change orders)
    ├── selections/
    │   └── page.tsx          (Selections)
    └── punch-list/
        └── page.tsx          (Punch list)

components/jobs/
├── JobDetail.tsx             (Main page container)
├── JobHeader.tsx             (Photo, name, status, team)
├── JobNav.tsx                (Sub-page navigation)
├── JobOverview.tsx           (Metrics, charts, activity)
├── JobMetricCards.tsx        (Key metric display)
├── JobProgressChart.tsx      (Progress visualization)
├── JobQuickActions.tsx       (Quick action buttons)
├── JobActivityFeed.tsx       (Recent activity)
├── JobBudgetSummary.tsx      (Budget summary section)
├── JobSchedulePreview.tsx    (Schedule preview)
├── JobFinancialSummary.tsx   (Invoices/draws preview)
└── JobStatusBadge.tsx        (Status indicator)
```

---

## Mobile Considerations
- Header stacks vertically
- Navigation becomes horizontal scroll or dropdown
- Sections stack in single column
- Charts simplified for mobile

---

## Affected By Changes To
- Budget lines (summary calculations)
- Invoices (financial summary)
- Draws (financial summary)
- Schedule/Tasks (schedule preview)
- Photos (featured photo)
- Activity log (activity feed)
- Clients (client display)
- Users (team display)

## Affects
- Nothing directly (read-only aggregation view)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
