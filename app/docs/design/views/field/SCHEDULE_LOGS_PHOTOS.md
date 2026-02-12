# View Plan: Schedule, Daily Logs, Photos

## Views Covered
- Schedule (Gantt + List views)
- Daily Logs (List + Entry)
- Photos (Gallery + Upload)

---

# SCHEDULE

## Schedule View

### URL
`/jobs/:id/schedule` (from job nav, Field dropdown)

### Layout: Toggle Between Views
```
┌─────────────────────────────────────────────────────────────────────┐
│ Schedule - Smith Residence                      [Gantt | List]      │
│                                           [+ Add Task] [Filter]     │
├─────────────────────────────────────────────────────────────────────┤
```

### Gantt View
```
│ Task              │ Nov          │ Dec          │ Jan          │
├───────────────────┼──────────────┼──────────────┼──────────────┤
│ Foundation        │ ████████     │              │              │
│   - Excavation    │ ███          │              │              │
│   - Pour footings │    ███       │              │              │
│   - Pour slab     │      ███     │              │              │
│ Framing           │         ███████████         │              │
│   - Walls         │         ██████              │              │
│   - Roof          │              ██████         │              │
│ Rough-ins         │                   ███████████████          │
│   - Electrical    │                   ██████                   │
│   - Plumbing      │                   ██████                   │
│   - HVAC          │                        ████████            │
```

### List View
| Column | Sortable | Notes |
|--------|----------|-------|
| Task | No | Indented for subtasks |
| Vendor | Yes | Assigned vendor |
| Start | Yes | Start date |
| End | Yes | End date |
| Duration | Yes | Days |
| Status | Yes | Not Started, In Progress, Complete |
| % Complete | Yes | Progress |
| Budget Line | No | Linked cost code |

### Task Fields
| Field | Type | Notes |
|-------|------|-------|
| name | text | Task name |
| parent_task_id | uuid | For subtasks |
| vendor_id | uuid | Assigned vendor |
| budget_line_id | uuid | Links to budget for cost tracking |
| start_date | date | |
| end_date | date | |
| duration_days | int | Calculated or manual |
| status | string | not_started, in_progress, complete |
| percent_complete | decimal | 0-100 |
| notes | text | |
| dependencies | array | Other task IDs |

### Task Actions
- Add subtask
- Mark complete
- Update progress
- Add to daily log
- View linked invoices/costs

---

# DAILY LOGS

## Daily Log List View

### URL
`/jobs/:id/daily-logs` (from job nav, Field dropdown)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Daily Logs - Smith Residence                        [+ New Log]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Filter: [All Dates ▼] [Search...]                                   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Dec 5, 2024                         ☀️ 65°F                     │ │
│ │ Work: Framing - Roof trusses installed                          │ │
│ │ Crew: 4 vendors, 12 workers, 96 hrs                             │ │
│ │ Photos: 5                                          [View]       │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Dec 4, 2024                         🌧️ 52°F                     │ │
│ │ Work: Weather delay - rain                                      │ │
│ │ Crew: 0 vendors, 0 workers, 0 hrs                               │ │
│ │ Photos: 0                                          [View]       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Daily Log Entry View

### URL
`/jobs/:id/daily-logs/:date` or `/daily-logs/:id`

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Daily Log - December 5, 2024                          [Save] [📷]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ WEATHER                                                             │
│ ─────────                                                           │
│ Conditions: [☀️ Sunny     ▼]    High: [65°]    Low: [45°]          │
│ Weather Notes: [Clear skies, good working conditions_______]        │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ WORK PERFORMED                                                      │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ [Roof trusses delivered and installed. Completed all 24 trusses.  ]│
│ [Sheathing to begin tomorrow.                                     ]│
│                                                                     │
│ Tasks Worked On: [Framing - Roof ▼] [+ Add Task]                   │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ CREW ON SITE                                                        │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ ┌───────────────────┬──────────┬───────┬────────────────────────┐  │
│ │ Vendor/Trade      │ Workers  │ Hours │ Notes                  │  │
│ ├───────────────────┼──────────┼───────┼────────────────────────┤  │
│ │ ABC Framing       │ 6        │ 48    │ Full crew             │  │
│ │ XYZ Crane Service │ 2        │ 8     │ Crane for trusses     │  │
│ │ [+ Add Crew]      │          │       │                        │  │
│ └───────────────────┴──────────┴───────┴────────────────────────┘  │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ MATERIALS DELIVERED                                                 │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ Description                    │ Vendor          │ PO/Invoice │  │
│ ├────────────────────────────────┼─────────────────┼────────────┤  │
│ │ Roof trusses (24)              │ Truss Co        │ PO-089     │  │
│ │ [+ Add Delivery]               │                 │            │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ ISSUES / DELAYS                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ [Minor delay waiting for crane. Arrived 30 min late.            ]  │
│ Impact: ○ None  ● Minor  ○ Significant                             │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ PHOTOS (5)                                                          │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ [img1] [img2] [img3] [img4] [img5]    [+ Upload Photos]            │
│                                                                     │
│ ═══════════════════════════════════════════════════════════════    │
│ SAFETY                                                              │
│ ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│ ☑ Site secured at end of day                                       │
│ ☑ No injuries or incidents                                         │
│ ☐ Safety meeting held                                               │
│ Notes: [_________________________________________________]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Daily Log Data (for reporting)
| Field | Type | Notes |
|-------|------|-------|
| date | date | Log date |
| weather_condition | string | Sunny, Cloudy, Rain, Snow |
| temp_high | int | |
| temp_low | int | |
| weather_notes | text | |
| work_performed | text | Description |
| tasks | array | Linked schedule tasks |
| crew | array | Vendor, workers, hours |
| materials | array | Deliveries |
| issues | text | Problems/delays |
| issue_impact | string | None, Minor, Significant |
| safety_site_secured | boolean | |
| safety_no_incidents | boolean | |
| safety_meeting | boolean | |
| safety_notes | text | |
| photos | array | Linked photos |

### Reporting Value
This data enables:
- Labor hours by vendor/trade
- Weather delay tracking
- Schedule progress documentation
- Material delivery log
- Safety compliance tracking
- Cost analysis (hours × rate)

---

# PHOTOS

## Photo Gallery View

### URL
`/jobs/:id/photos` (from job nav, Documents dropdown)

### Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ Photos - Smith Residence                              [+ Upload]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Filter: [All Dates ▼] [All Categories ▼] [Search...]               │
│ View: [Grid | List]                                                 │
│                                                                     │
│ ═══ December 5, 2024 ═══════════════════════════════════════════   │
│                                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │         │ │         │ │         │ │         │ │         │        │
│ │  Photo  │ │  Photo  │ │  Photo  │ │  Photo  │ │  Photo  │        │
│ │         │ │         │ │         │ │         │ │         │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│ Roof truss  Truss det.  Crane lift  Progress   Crew               │
│                                                                     │
│ ═══ December 4, 2024 ═══════════════════════════════════════════   │
│ (No photos - weather day)                                           │
│                                                                     │
│ ═══ December 3, 2024 ═══════════════════════════════════════════   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                                │
│ │         │ │         │ │         │                                │
│ │  Photo  │ │  Photo  │ │  Photo  │                                │
│ │         │ │         │ │         │                                │
│ └─────────┘ └─────────┘ └─────────┘                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Photo Upload
- Drag & drop multiple photos
- Bulk upload from mobile
- Auto-capture date/location
- Add captions
- Link to daily log (optional)
- Categorize: Progress, Issue, Safety, Delivery

### Photo Fields
| Field | Type | Notes |
|-------|------|-------|
| url | string | Storage URL |
| thumbnail_url | string | Smaller version |
| caption | text | Description |
| category | string | Progress, Issue, Safety, etc. |
| location | string | Where on site |
| taken_at | timestamp | EXIF or manual |
| daily_log_id | uuid | Optional link |
| uploaded_by | uuid | |

### Photo Viewer
Click photo to open:
- Full-size view
- Caption editing
- Date/location info
- Download
- Delete
- Navigate prev/next

---

## API Endpoints

### Schedule
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/tasks` | Get all tasks |
| POST | `/api/jobs/:id/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Daily Logs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/daily-logs` | List logs |
| POST | `/api/jobs/:id/daily-logs` | Create log |
| GET | `/api/daily-logs/:id` | Get log |
| PATCH | `/api/daily-logs/:id` | Update log |

### Photos
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:id/photos` | List photos |
| POST | `/api/jobs/:id/photos` | Upload photo(s) |
| PATCH | `/api/photos/:id` | Update caption/category |
| DELETE | `/api/photos/:id` | Delete photo |

---

## Component Structure

```
components/schedule/
├── ScheduleView.tsx
├── ScheduleGantt.tsx
├── ScheduleList.tsx
├── TaskRow.tsx
├── TaskForm.tsx
└── TaskStatusBadge.tsx

components/daily-logs/
├── DailyLogList.tsx
├── DailyLogEntry.tsx
├── DailyLogWeather.tsx
├── DailyLogCrew.tsx
├── DailyLogMaterials.tsx
├── DailyLogIssues.tsx
└── DailyLogSafety.tsx

components/photos/
├── PhotoGallery.tsx
├── PhotoGrid.tsx
├── PhotoUpload.tsx
├── PhotoViewer.tsx
└── PhotoCard.tsx
```

---

## Affected By Changes To
- Jobs (all items are job-scoped)
- Users (assigned tasks, log authors)
- Vendors (crew entries, task assignments)
- Weather API (auto-fetch for logs)

## Affects
- Reports (labor hours, schedule performance)
- Files (photos stored as job files)
- Daily summaries (aggregated log data)
- Client Portal (selected photos shared)
- Punch List (issues from logs may become punch items)
- Activity logs (task completions, log entries)

---

## Mobile Considerations

- **Schedule**: Simplified list view with today's tasks highlighted
- Task completion toggle with swipe action
- Quick task status updates (in progress, complete, delayed)
- **Daily Logs**: Primary mobile use case - field entry
- Voice-to-text for notes and descriptions
- Weather auto-fetch from device location
- Crew and equipment selection from quick-pick lists
- Photo capture with automatic GPS tagging
- One-tap log submission with required field prompts
- **Photos**: Camera capture with annotation/markup tools
- Multi-photo upload with progress indicator
- Photo tagging by room/area/trade
- Before/after comparison view
- Offline: Queue logs and photos for sync when connected
- Background upload for large photo batches
- Pull-to-refresh for schedule updates

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning |
