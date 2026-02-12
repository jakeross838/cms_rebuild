# Module 7: Scheduling & Calendar

**Phase:** 2 - Construction Core
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

Project scheduling with Gantt charts, calendar views, task dependencies, and resource assignment. Enables builders to plan construction phases, track progress against baselines, identify delays, coordinate trades, and manage weather impacts. Supports builders with 1 active job or 20+, with configurable scheduling methods (Gantt, calendar, Kanban, list) and template-driven reuse. Multi-job resource leveling ensures shared vendors are not double-booked.

---

## Gap Items Addressed

| GAP # | Description | Priority |
|-------|-------------|----------|
| GAP-291 | Multiple scheduling views: Gantt, calendar, Kanban, list | High |
| GAP-292 | Schedule templates builders create and reuse per job | High |
| GAP-293 | Scheduling by phase vs. by trade vs. by day (configurable) | High |
| GAP-294 | Interface scales from 1 active job to 20+ active jobs | High |
| GAP-295 | Configurable standard work week (M-F, M-Sa, varies by trade) | Medium |
| GAP-296 | Resource leveling across multiple jobs with shared vendors | High |
| GAP-297 | Schedule publishing with configurable notifications | Medium |
| GAP-298 | Schedule baselines: original plan vs. current plan drift tracking | High |
| GAP-299 | Scheduling contingency/buffer (float management) | Medium |
| GAP-300 | Phased project scheduling (house Phase 1, pool Phase 2, etc.) | Medium |
| GAP-301 | Schedule integration with vendor availability calendars | Medium |
| GAP-302 | Schedule "what-if" scenarios (delay impact, scope additions) | Low |
| GAP-303 | Client-facing schedule reports (simplified milestone view) | High |
| GAP-304 | Schedule recovery after delay (compression, fast-tracking, re-sequencing) | Medium |
| GAP-305 | Two-week look-ahead scheduling (detailed near-term plan) | High |
| GAP-306 | Weather API integration (service, accuracy, forecast range, regional) | High |
| GAP-307 | Weather impact varies by trade (concrete vs. interior electrician) | Medium |
| GAP-308 | Seasonal scheduling intelligence (regional climate awareness) | Medium |
| GAP-309 | Weather delay documentation for contract time extensions | High |
| GAP-310 | Hurricane/severe weather preparation checklists | Low |
| GAP-311 | Tidal data for coastal builders (optional feature) | Low |
| GAP-312 | Extreme heat scheduling (OSHA guidelines, afternoon restrictions) | Low |
| GAP-313 | Snow/ice day handling for northern builders | Low |
| GAP-314 | Wind restrictions for crane operations (configurable threshold) | Low |
| GAP-042 | Weather patterns vary by region; scheduling must account for regional climate | Medium |
| GAP-045 | Regional holidays affect scheduling | Medium |
| GAP-046 | Work hour restrictions vary by municipality | Low |

---

## Detailed Requirements

### 7.1 Schedule Views (GAP-291, GAP-293, GAP-294)

Multiple visualization modes, configurable per builder preference:

- **Gantt Chart**: Horizontal bar chart with task dependencies, critical path highlight, drag-and-drop editing for dates and durations. Zoom levels: day, week, month, quarter.
- **Calendar View**: Month/week/day calendar showing tasks, milestones, inspections, and deliveries. Color-coded by trade or phase.
- **Kanban Board**: Columns for status (Not Started, In Progress, Complete, Blocked). Cards show task name, assignee, dates.
- **List View**: Sortable/filterable table of all tasks with inline editing.
- **Multi-Project View**: Aggregate view across all active projects for portfolio-level scheduling (GAP-294). Supports filtering by PM, status, region.

Builder configures their default view. Each user can override with their own preference.

### 7.2 Task Management & Dependencies

- Task fields: name, description, phase, trade, assignee(s), planned start/end, actual start/end, duration, predecessors, successors, percent complete, notes.
- Dependency types: Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), Start-to-Finish (SF) with configurable lag/lead.
- Critical path calculation: auto-computed, visually highlighted on Gantt.
- Milestone tracking: zero-duration tasks marking key events (permit received, drywall complete, CO issued).
- Task grouping by phase or trade (GAP-293). Builder configures hierarchy preference.

### 7.3 Schedule Templates (GAP-292, GAP-277)

- Builders create reusable templates from existing schedules or from scratch.
- Templates capture: task names, durations, dependencies, trade assignments, phase structure.
- Apply template to new project, then adjust dates and assignments.
- Platform provides starter templates (e.g., "Standard 2,500 SF New Construction") that builders can clone and customize.
- Template versioning: track changes over time.

### 7.4 Work Calendar Configuration (GAP-295, GAP-045, GAP-046)

- Configurable work week per builder (M-F, M-Sa, custom).
- Per-trade work schedules (e.g., concrete crew works M-Sa, trim carpenter M-F).
- Holiday calendar: builder-configurable with regional defaults.
- Work hour restrictions per municipality (GAP-046): no work before 7am, no work on Sundays, etc.
- Non-work days excluded from duration calculations.

### 7.5 Resource Leveling & Multi-Job Coordination (GAP-296, GAP-301)

- Assign vendors/crews to tasks across multiple projects.
- Resource leveling view: see all commitments for a vendor across all jobs, highlight conflicts.
- Vendor availability integration (GAP-301): vendors indicate availability windows; system warns on conflicts.
- Drag-and-drop rescheduling with automatic conflict detection.
- "Resource calendar" showing each vendor's workload across all builder's projects.

### 7.6 Baseline & Variance Tracking (GAP-298, GAP-299)

- Save schedule baselines at any point (baseline 1, baseline 2, etc.).
- Visual comparison: baseline bars vs. current bars on Gantt.
- Variance metrics: planned vs. actual start/end, duration variance, total float consumed.
- Float/buffer management (GAP-299): display total float per task, highlight tasks with zero float.
- Schedule drift alerts: configurable thresholds (e.g., "alert if task starts 3+ days late").

### 7.7 Phased Projects & What-If Scenarios (GAP-300, GAP-302)

- Support multi-phase projects with separate schedules per phase that link together.
- Phase-level milestones that gate subsequent phases.
- What-if analysis (GAP-302): clone current schedule, apply changes (delay start, add scope), compare impact. Save scenarios for discussion.

### 7.8 Schedule Recovery & Look-Ahead (GAP-304, GAP-305)

- Two-week look-ahead report (GAP-305): auto-generated detailed plan for the next 14 days. Printable, shareable with trades.
- Recovery options after delay (GAP-304): system suggests compression opportunities, parallel task options, overtime scenarios.
- Look-ahead includes: tasks starting/continuing, required deliveries, scheduled inspections, pending decisions.

### 7.9 Schedule Publishing & Client View (GAP-297, GAP-303)

- Publish schedule snapshots to stakeholders with configurable recipients.
- Notification on schedule changes: configurable per role (PM, super, client, vendor).
- Client-facing view (GAP-303): simplified milestone timeline showing major phases and key dates. No internal task detail.
- Exportable as PDF or shareable link.

### 7.10 Weather Integration (GAP-306 through GAP-314, GAP-042)

- **Weather API**: Integration with weather service (e.g., OpenWeatherMap, Weather.com API) for 7-14 day forecasts at project location.
- **Trade-specific impact rules** (GAP-307): configurable per builder. Example rules:
  - Rain > 0.25": no concrete pour, no roofing, no exterior paint.
  - Temp < 32F: no concrete, no exterior masonry.
  - Wind > 25mph: no crane operations (GAP-314), no roofing.
  - Heat index > 105F: modified work schedule (GAP-312).
- **Seasonal intelligence** (GAP-308): historical weather data for region informs scheduling recommendations. "Avoid scheduling exterior paint in Houston July-August."
- **Weather delay documentation** (GAP-309): log weather delays with date, conditions, impacted tasks, photos. Generates time extension documentation for contracts.
- **Severe weather alerts** (GAP-310): push notifications for hurricane/tornado/severe storm warnings. Optional preparation checklists.
- **Regional features** (GAP-311, GAP-313): tidal data, snow/ice day tracking -- enabled per builder based on region. Not shown for irrelevant regions.
- Weather data displayed on daily schedule view and two-week look-ahead.

---

## Database Tables

### schedule_tasks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders, multi-tenant |
| project_id | UUID | FK -> projects |
| template_id | UUID | FK -> schedule_templates, nullable |
| parent_task_id | UUID | Self-referencing FK for subtasks |
| name | VARCHAR(255) | |
| description | TEXT | |
| phase | VARCHAR(100) | Configurable phase name |
| trade | VARCHAR(100) | Trade category |
| task_type | ENUM | 'task', 'milestone', 'summary' |
| planned_start | DATE | |
| planned_end | DATE | |
| actual_start | DATE | |
| actual_end | DATE | |
| duration_days | INTEGER | Working days |
| percent_complete | DECIMAL(5,2) | 0.00-100.00 |
| status | ENUM | 'not_started', 'in_progress', 'complete', 'blocked' |
| assigned_vendor_id | UUID | FK -> vendors |
| assigned_user_id | UUID | FK -> users |
| sort_order | INTEGER | Display ordering |
| is_critical_path | BOOLEAN | Computed |
| total_float | INTEGER | Computed, in days |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### schedule_dependencies
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| predecessor_id | UUID | FK -> schedule_tasks |
| successor_id | UUID | FK -> schedule_tasks |
| dependency_type | ENUM | 'FS', 'SS', 'FF', 'SF' |
| lag_days | INTEGER | Positive = lag, negative = lead |

### schedule_baselines
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| project_id | UUID | FK -> projects |
| name | VARCHAR(100) | e.g., "Original Plan", "Post-Delay Recovery" |
| snapshot_data | JSONB | Full task snapshot at baseline time |
| created_at | TIMESTAMPTZ | |
| created_by | UUID | FK -> users |

### schedule_templates
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| name | VARCHAR(255) | |
| description | TEXT | |
| project_type | VARCHAR(100) | e.g., "New Construction", "Renovation" |
| template_data | JSONB | Tasks, durations, dependencies |
| is_platform_default | BOOLEAN | Platform-provided starter template |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### weather_records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| project_id | UUID | FK -> projects |
| record_date | DATE | |
| source | ENUM | 'api', 'manual' |
| temp_high_f | DECIMAL(5,1) | |
| temp_low_f | DECIMAL(5,1) | |
| precipitation_in | DECIMAL(5,2) | |
| wind_speed_mph | DECIMAL(5,1) | |
| conditions | VARCHAR(100) | e.g., "Sunny", "Rain", "Snow" |
| is_delay_day | BOOLEAN | Builder-marked |
| delay_notes | TEXT | Documentation for time extensions |
| raw_api_data | JSONB | Full API response for audit |

### weather_trade_rules
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| trade | VARCHAR(100) | |
| condition_type | ENUM | 'rain', 'temp_low', 'temp_high', 'wind', 'snow' |
| threshold_value | DECIMAL(8,2) | |
| operator | ENUM | 'gt', 'lt', 'gte', 'lte' |
| action | ENUM | 'block', 'warn' |

### schedule_work_calendars
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| builder_id | UUID | FK -> builders |
| name | VARCHAR(100) | e.g., "Standard M-F", "Concrete Crew" |
| work_days | JSONB | { mon: true, tue: true, ..., sat: false, sun: false } |
| work_hours_start | TIME | |
| work_hours_end | TIME | |
| holidays | JSONB | Array of date strings |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/projects/:projectId/schedule | Get all tasks for a project |
| POST | /api/projects/:projectId/schedule/tasks | Create task |
| PUT | /api/schedule/tasks/:taskId | Update task |
| DELETE | /api/schedule/tasks/:taskId | Delete task |
| POST | /api/schedule/tasks/:taskId/dependencies | Add dependency |
| DELETE | /api/schedule/dependencies/:depId | Remove dependency |
| POST | /api/projects/:projectId/schedule/baselines | Save baseline |
| GET | /api/projects/:projectId/schedule/baselines | List baselines |
| GET | /api/projects/:projectId/schedule/critical-path | Compute critical path |
| GET | /api/projects/:projectId/schedule/look-ahead | Two-week look-ahead report |
| GET | /api/schedule/resource-calendar/:vendorId | Vendor workload across projects |
| GET | /api/schedule/multi-project | Portfolio schedule view |
| GET | /api/schedule/templates | List schedule templates |
| POST | /api/schedule/templates | Create template |
| POST | /api/schedule/templates/:templateId/apply | Apply template to project |
| GET | /api/projects/:projectId/weather | Get weather records |
| POST | /api/projects/:projectId/weather/fetch | Fetch weather from API |
| GET | /api/weather/forecast/:projectId | Get forecast for project location |
| GET | /api/weather/trade-rules | Get weather trade rules |
| PUT | /api/weather/trade-rules | Update weather trade rules |
| GET | /api/schedule/work-calendars | List work calendars |
| POST | /api/schedule/work-calendars | Create work calendar |
| POST | /api/projects/:projectId/schedule/publish | Publish schedule to stakeholders |
| POST | /api/projects/:projectId/schedule/what-if | Create what-if scenario |

---

## UI Components

| Component | Description |
|-----------|-------------|
| GanttChart | Interactive Gantt with drag-and-drop, zoom, critical path highlight |
| CalendarView | Month/week/day calendar with task cards |
| KanbanBoard | Drag-and-drop status columns |
| TaskListView | Sortable/filterable table with inline editing |
| TaskDetailDrawer | Side panel for editing task details, dependencies, notes |
| BaselineComparisonOverlay | Overlay on Gantt showing baseline vs. current |
| ResourceLevelingPanel | Multi-project vendor workload visualization |
| LookAheadReport | Printable two-week detailed schedule |
| WeatherWidget | 7-day forecast display on schedule views |
| WeatherDelayLogger | Form for documenting weather delays |
| ScheduleTemplateManager | CRUD for schedule templates |
| ClientMilestoneTimeline | Simplified milestone view for client portal (GAP-303) |
| MultiProjectDashboard | Portfolio-level Gantt or timeline (GAP-294) |
| WhatsIfScenarioPanel | Clone and compare schedule scenarios (GAP-302) |

---

## Dependencies

- **Module 3: Core Data Model** -- projects, phases
- **Module 5: Notification Engine** -- schedule change notifications, weather alerts
- **Module 10: Vendor Management** -- resource assignment, vendor availability
- **Module 8: Daily Logs** -- actual progress updates feed schedule
- **Module 14: Permitting & Inspections** -- inspection dates on schedule
- **External: Weather API** -- OpenWeatherMap or equivalent

---

## Job Site Utility Coordination

Track temporary utilities and site services throughout the project lifecycle.

- **Temporary Utility Tracking:** Manage setup and teardown of temporary utilities: temporary power, water service, portable toilets, dumpsters, fencing, and temporary lighting.
- **Delivery Scheduling:** Schedule utility setup delivery dates on the project calendar with vendor assignments and lead time alerts.
- **Cost Tracking:** Track temporary utility costs as overhead or direct job cost (configurable per builder). Link utility invoices to a dedicated cost code.
- **Teardown Reminders:** Auto-reminder for utility teardown at project closeout or phase completion. Prevent forgotten rentals from accruing unnecessary charges.

---

## Open Questions

1. Which weather API service provides the best balance of accuracy, cost, and construction-relevant data (precipitation probability, wind speed, heat index)?
2. Should critical path calculation happen server-side (on save) or client-side (real-time as user edits)?
3. What is the maximum practical task count per project before performance degrades? (Target: 500+ tasks per project.)
4. Should the what-if scenario feature (GAP-302) be deferred to Phase 3 or 4 as a "Schedule Intelligence" enhancement?
5. How should vendor calendar sync work -- pull from Google Calendar, manual entry, or both?
6. Should tidal data (GAP-311) be a separate microservice or bundled with weather integration?
