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

## Gap Items Addressed

### Section 45: Per-Page Feature Requirements — Schedule Page (items 673-691)
- GAP-673: Gantt chart with drag-and-drop task editing
- GAP-674: Calendar view toggle
- GAP-675: List view toggle
- GAP-676: Kanban board toggle (tasks by status: Not Started, In Progress, Complete)
- GAP-677: Two-week look-ahead view
- GAP-678: Filter by trade, phase, critical path, status
- GAP-679: Dependency arrows showing predecessor/successor relationships
- GAP-680: Resource assignment and resource leveling view
- GAP-681: Baseline comparison overlay (planned vs. actual)
- GAP-682: Weather overlay — forecast on the calendar
- GAP-683: Milestone markers with labels
- GAP-684: Progress indicators per task — 0%, 25%, 50%, 75%, 100%
- GAP-685: Task detail panel — click a task to see notes, photos, vendor, duration, predecessors, actual dates
- GAP-686: Print/export schedule in multiple formats (Gantt, list, calendar)
- GAP-687: Schedule health indicators — critical path highlighted, at-risk tasks flagged
- GAP-688: Vendor schedule view — "show me only what ABC Electric needs to do"
- GAP-689: Client-friendly schedule view — simplified milestones, not 500 tasks
- GAP-690: Schedule conflict detection — "Task X and Task Y need the same space simultaneously"
- GAP-691: Bulk schedule operations — shift all tasks by N days, reassign trade

### Section 45: Per-Page Feature Requirements — Daily Log Page (items 736-753)
- GAP-736: Date selector with calendar navigation
- GAP-737: Auto-populated weather data
- GAP-738: Workforce tracker — which vendors on site, how many workers each
- GAP-739: Work performed narrative — free text with AI-assist
- GAP-740: Material delivery log
- GAP-741: Equipment on site
- GAP-742: Visitor log
- GAP-743: Safety observations
- GAP-744: Photo upload with drag-and-drop, bulk upload
- GAP-745: Carry forward from yesterday — pre-populate with yesterday's vendors/equipment
- GAP-746: Linked schedule tasks — "work performed today relates to task X"
- GAP-747: Issue/delay reporting with cause categorization
- GAP-748: Voice-to-text entry option
- GAP-749: Preview mode — see what the log looks like before submitting
- GAP-750: Edit history with audit trail after submission
- GAP-751: Daily log gallery — all photos from this day in a grid
- GAP-752: Export daily log as PDF
- GAP-753: Notification confirmation — "daily log submitted, PM notified"

### Cross-Section Gap Items — Schedule
- GAP-291: Support for different scheduling methods — Gantt, calendar, Kanban, list
- GAP-292: Schedule templates builders create and reuse per project type
- GAP-293: Schedule by phase vs. by trade vs. by day — configurable per builder
- GAP-295: Configurable standard work week (M-F, M-Sa, varies by trade)
- GAP-296: Scheduling across multiple jobs when vendors are shared — resource leveling
- GAP-297: Schedule publishing — who gets notified when schedule is updated
- GAP-298: Schedule baselines — original plan vs. current plan, tracking drift
- GAP-299: Scheduling contingency/buffer (float)
- GAP-300: Scheduling for phased projects (main house, pool, guest house)
- GAP-301: Schedule integration with vendor calendars — "available starting March 15"
- GAP-302: Schedule "what-if" scenarios — "what if we start two weeks late?"
- GAP-303: Client-friendly schedule reporting — simplified milestone view
- GAP-304: Schedule recovery after delay — compression, fast-tracking, re-sequencing
- GAP-305: Two-week look-ahead scheduling
- GAP-306: Weather API integration — service, accuracy, forecast range
- GAP-307: Weather impact varies by trade — concrete can't pour in rain, electrician works inside
- GAP-308: Seasonal scheduling intelligence per region
- GAP-309: Weather delay documentation for contract time extensions
- GAP-500: AI schedule generation from estimate and historical durations
- GAP-863: Daily log delay reported triggers schedule impact calculation and revised completion date

### Cross-Section Gap Items — Daily Logs
- GAP-315: Configurable required fields per builder
- GAP-316: Custom fields on daily logs per builder
- GAP-317: Daily log templates by project phase
- GAP-318: Single PM vs. multiple people logging per job
- GAP-319: Automatic fields — weather auto-populated, scheduled tasks auto-listed
- GAP-320: Daily log submission reminders — configurable time (4pm, 6pm)
- GAP-321: Daily log review workflows — PM submits, Director reviews (or no review)
- GAP-322: Voice-to-text daily log entry
- GAP-323: Photo requirements — some builders require minimum X photos per log
- GAP-324: Delay reporting triggers workflow — auto-update schedule impact analysis
- GAP-325: Daily logs as legal documents — immutable after submission, or editable with audit trail

### Cross-Section Gap Items — Photos
- GAP-476: Photo storage at scale — builder with 50 homes has millions of photos
- GAP-477: Photo AI auto-tagging — recognizes framing, plumbing, electrical
- GAP-478: Photo access control — internal, client, marketing categories
- GAP-479: Video support — walkthrough videos, drone footage
- GAP-480: Photo annotations — drawing on photos to highlight issues
- GAP-827: Photo metadata discrepancies — camera time vs. phone time vs. server time

## Additional Requirements from Gap Analysis

### Schedule
- Calendar view toggle is not in the current spec (GAP-674)
- Kanban board view for tasks by status is missing (GAP-676)
- Two-week look-ahead view is not specified (GAP-677)
- Dependency arrows for predecessor/successor relationships are not shown (GAP-679)
- Resource assignment and leveling view is missing (GAP-680)
- Baseline comparison overlay (planned vs. actual) is not specified (GAP-681)
- Weather overlay on the calendar is not covered (GAP-682)
- Milestone markers with labels are not in the Gantt view (GAP-683)
- Print/export in multiple formats is not detailed (GAP-686)
- Schedule health indicators (critical path, at-risk tasks) are missing (GAP-687)
- Vendor-specific schedule view is not specified (GAP-688)
- Client-friendly simplified schedule view is not covered (GAP-689)
- Schedule conflict detection is missing (GAP-690)
- Bulk schedule operations (shift N days, reassign trade) are not specified (GAP-691)
- Schedule templates per project type are not addressed (GAP-292)
- Cross-job resource leveling for shared vendors is missing (GAP-296)
- What-if scenario modeling is not specified (GAP-302)
- AI schedule generation from estimate data is not covered (GAP-500)

### Daily Logs
- Equipment on site tracking is not in the current spec (GAP-741)
- Visitor log is not specified (GAP-742)
- Carry forward from yesterday to pre-populate today's log is missing (GAP-745)
- Voice-to-text entry option is not specified (GAP-748)
- Preview mode before submission is not covered (GAP-749)
- Edit history with audit trail after submission is not detailed (GAP-750)
- Export daily log as PDF is not specified (GAP-752)
- Notification confirmation after submission is missing (GAP-753)
- Configurable required fields per builder for daily logs (GAP-315)
- Custom fields per builder on daily logs (GAP-316)
- Daily log templates that vary by project phase (GAP-317)
- Submission reminders at configurable times (GAP-320)
- Review workflows — PM submits, Director reviews (GAP-321)
- Minimum photo requirements per log configurable per builder (GAP-323)
- Delay reporting triggering automatic schedule impact analysis (GAP-324)
- Immutability rules — logs as legal documents with audit trail (GAP-325)

### Photos
- Video support (walkthrough videos, drone footage) is not specified (GAP-479)
- AI auto-tagging of construction photos is not covered (GAP-477)
- Photo annotation/markup tools are not in the spec (GAP-480)
- Photo access control levels (internal, client, marketing) need more detail (GAP-478)
- Photo metadata reconciliation (camera time vs. server time) is not addressed (GAP-827)
- Storage scaling strategy for large photo volumes is not specified (GAP-476)

---

## Revision History
| Date | Change |
|------|--------|
| Initial | Created from batch planning |
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis |
