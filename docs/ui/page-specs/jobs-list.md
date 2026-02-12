# View Plan: Jobs List

## Overview
- **URL**: `/jobs`
- **Purpose**: View and manage all construction projects
- **View Type**: Card grid + Table list (toggle between views)

---

## Layout

### Header
- Title: "Jobs"
- View toggle: Cards | List
- Filters button (opens filter panel)
- "+ New Job" button

### Card Grid View
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Filters]                               Cards | List    [+ New Job] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │               │
│  │ │  Photo   │ │  │ │  Photo   │ │  │ │  Photo   │ │               │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │               │
│  │ Smith Home   │  │ Johnson Res  │  │ Miller Add   │               │
│  │ 123 Oak St   │  │ 456 Pine Ave │  │ 789 Elm Rd   │               │
│  │ ● Active     │  │ ● Pre-Con    │  │ ● Active     │               │
│  │              │  │              │  │              │               │
│  │ $450,000     │  │ $620,000     │  │ $180,000     │               │
│  │ 65% complete │  │ 0% complete  │  │ 40% complete │               │
│  │ Dec 2024     │  │ Feb 2025     │  │ Jan 2025     │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Job Card Content
```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │      Photo/Placeholder  │ │  ← Optional: job photo or colored placeholder
│ └─────────────────────────┘ │
│ Smith Residence             │  ← Job name
│ 123 Oak Street              │  ← Address
│ ● Active                    │  ← Status badge (colored)
│                             │
│ Budget: $450,000            │  ← Contract/budget amount
│ Progress: 65%               │  ← Percent complete
│ Target: Dec 15, 2024        │  ← Target completion date
│                             │
│ ○ Jake R.  ○ Mike S.        │  ← Assigned users (avatars)
└─────────────────────────────┘
```

### Table List View
| Column | Sortable | Notes |
|--------|----------|-------|
| Photo | No | Small thumbnail |
| Job Name | Yes | Link to detail |
| Address | Yes | City, State |
| Client | Yes | Client name |
| Status | Yes | Colored badge |
| Budget | Yes | Currency |
| % Complete | Yes | Progress bar |
| Start Date | Yes | |
| Target Date | Yes | |
| Assigned | No | User avatars |
| Actions | No | View, Edit, Archive |

---

## Job Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Pre-construction | Blue | Estimating, proposals, not yet started |
| Active | Green | Construction in progress |
| On Hold | Yellow | Paused for some reason |
| Completed | Gray | Construction finished |
| Warranty | Purple | In warranty period |
| Cancelled | Red | Job was cancelled |

---

## Filters Panel

| Filter | Type | Options |
|--------|------|---------|
| Status | Multi-select | All statuses above |
| Search | Text | Searches name, address, job number |
| Client | Select | List of clients |
| Assigned User | Multi-select | List of team members |
| Budget Range | Range | Min / Max |
| Start Date | Date range | From / To |
| Target Date | Date range | From / To |

### Quick Filters (tabs/buttons)
- All Jobs
- Active
- Pre-construction
- Completed
- My Jobs (assigned to current user)

---

## Sorting Options

- Name (A-Z, Z-A)
- Status
- Budget (High-Low, Low-High)
- % Complete
- Start Date
- Target Date
- Last Updated

---

## Interactions

### Card/Row Click
- Navigate to Job Detail page

### New Job Button
- Navigate to Job Create page

### Status Quick-Change
- Right-click or dropdown to change status without opening detail

### Bulk Actions (Table View)
- Select multiple → Change status, Assign user, Export

---

## Data Requirements

### Job Entity Fields (for list view)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| name | string | Job/project name |
| job_number | string | Optional reference number |
| address | string | |
| city | string | |
| state | string | |
| client_id | uuid | FK to clients |
| client.name | string | Joined |
| status | string | Pre-construction, Active, etc. |
| contract_amount | decimal | Total contract value |
| percent_complete | decimal | Calculated from budget/draws |
| start_date | date | |
| target_completion | date | |
| photo_url | string | Featured job photo |
| created_at | timestamp | |
| updated_at | timestamp | |

### Job Assignments (separate table)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| job_id | uuid | FK |
| user_id | uuid | FK |
| role | string | PM, Superintendent, Estimator, etc. |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs` | List jobs with filters |
| GET | `/api/jobs/:id` | Get job detail |
| PATCH | `/api/jobs/:id/status` | Quick status change |

### Query Parameters for GET /api/jobs
- `status` - Filter by status(es)
- `search` - Text search
- `client_id` - Filter by client
- `assigned_user_id` - Filter by assigned user
- `budget_min` / `budget_max` - Budget range
- `start_date_from` / `start_date_to` - Date range
- `sort` - Sort field
- `order` - asc/desc
- `page` / `limit` - Pagination

---

## Component Structure

```
pages/jobs/
├── page.tsx              (Jobs List page)
├── new/
│   └── page.tsx          (Job Create page)
└── [id]/
    └── page.tsx          (Job Detail page)

components/jobs/
├── JobsList.tsx          (Main container with view toggle)
├── JobsGrid.tsx          (Card grid view)
├── JobsTable.tsx         (Table view)
├── JobCard.tsx           (Individual job card)
├── JobFilters.tsx        (Filter panel)
├── JobStatusBadge.tsx    (Status indicator)
└── JobAssignees.tsx      (User avatars)
```

---

## Mobile Considerations
- Cards stack in single column
- Table becomes card-based on mobile
- Filters in bottom sheet

---

## Affected By Changes To
- Clients (client name display)
- Users (assignment display)
- Photos (featured photo)

## Affects
- Dashboard (job counts, metrics)
- Reports (job data)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
