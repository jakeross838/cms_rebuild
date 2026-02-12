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

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements (Project List Page, items 633-646)
- GAP-633: Sortable by any column — name, status, PM, start date, budget, % complete
- GAP-634: Filterable by multiple criteria simultaneously — status, PM, location, date range, project type
- GAP-635: Saveable filter presets — "My Active Projects," "Over Budget Projects," "Saved Filter"
- GAP-636: Shareable filter presets — create a view that the whole team can use
- GAP-637: Bulk actions — archive multiple projects, reassign PM, update status
- GAP-638: Customizable columns — choose which columns to display
- GAP-639: Column resize and reorder
- GAP-640: Compact vs. card view toggle
- GAP-641: Map view — see all projects on a map (especially useful for geographic builders)
- GAP-642: Quick inline editing — change status without opening the project
- GAP-643: Color coding / tags — visual indicators configurable per builder
- GAP-644: Favorite/pin projects for quick access
- GAP-645: Project health indicators — red/yellow/green for budget, schedule, risk
- GAP-646: Search within the project list

### Cross-Section Gap Items
- GAP-16: Configurable workflow engine — approval chains, thresholds, routing rules affect job status transitions
- GAP-18: Configurable job phases and naming conventions per builder
- GAP-19: Customizable terminology per tenant (e.g., "project" vs. "job")
- GAP-23: Custom fields on projects — tenants can add custom data to jobs
- GAP-24: Custom dropdown values per tenant (project types, status categories)
- GAP-29: Configurable required fields per builder
- GAP-212: Permissions that differ by project — user access varies per job
- GAP-294: Interface must scale from 1 active job to 20+ active jobs
- GAP-521: UI scales from 1-person builder to 50-person builder
- GAP-525: Multi-project context switching — quick-switch without losing context
- GAP-526: Global search that works across all projects and all data types
- GAP-534: Data density preferences — compact view for power users, comfortable for occasional users
- GAP-535: WCAG 2.1 AA accessibility compliance
- GAP-545: Performance at scale — builder with 500 completed projects, list still loads fast

## Additional Requirements from Gap Analysis
- Saveable and shareable filter presets are not currently specified (GAP-635, GAP-636)
- Customizable columns — ability to choose, resize, and reorder columns is missing (GAP-638, GAP-639)
- Map view for projects by geographic location is not specified (GAP-641)
- Color coding and configurable tags per builder are not covered (GAP-643)
- Favorite/pin projects for quick access is not specified (GAP-644)
- Project health indicators (red/yellow/green for budget, schedule, risk) are not in current spec (GAP-645)
- Custom fields on job entities need to be supported per-tenant (GAP-23)
- Terminology customization per tenant (e.g., "Jobs" could be "Projects") is not addressed (GAP-19)
- Pagination performance at scale needs specification for large job counts (GAP-545)
- Multi-entity support — builders with multiple LLCs may need cross-entity job views (GAP-574)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from planning session |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
