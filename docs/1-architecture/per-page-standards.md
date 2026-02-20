# RossOS Per-Page Feature Standards

**Purpose:** Standard features available across all list views, detail views, and administrative pages. These features are implemented as reusable platform components and applied consistently.

**Status:** Architectural Standard
**Applies to:** Every page that displays, collects, or manages entity data
**Related:** `normalization-and-crud.md` (CRUD patterns), `system-architecture.md` (platform structure)

---

## How to Read This Document

Each feature specification includes:
- **GAP ID** -- tracker reference from `gap-tracker.json`
- **What it does** -- one to two sentence description of the capability
- **Where it appears** -- which pages and modules include this feature
- **Implementation notes** -- key technical details for building the feature

Features are grouped by the page context where they primarily appear. Many features are reusable components that span multiple contexts.

---

## 1. Dashboard Features

The dashboard is the landing page after login. It aggregates data from all modules into a single executive view. These features control how the dashboard refreshes and exports its content.

### GAP-627: Refresh Button / Auto-Refresh Interval

**What it does:** Provides a manual refresh button in the dashboard toolbar and a configurable auto-refresh interval (e.g., every 30s, 1m, 5m, off). The refresh button triggers a full re-fetch of all dashboard widgets without a page reload. Auto-refresh is user-configurable and persisted per user in their preferences.

**Where it appears:**
- Module 04 -- Main Dashboard (`/dashboard`)
- Module 04 -- Job-level Dashboard (`/jobs/[id]/dashboard`)
- Module 49 -- Platform Analytics Dashboard (admin)
- Module 19 -- Financial Reporting Dashboard

**Implementation notes:**
- Use a `RefreshControl` component in the dashboard toolbar with a spinner icon and a dropdown for interval selection.
- Auto-refresh intervals: Off, 30 seconds, 1 minute, 5 minutes, 15 minutes. Default: Off.
- Store preference in `user_preferences` table under key `dashboard_refresh_interval`.
- Each widget fetches independently via its own SWR/React Query key; refresh invalidates all dashboard query keys.
- When auto-refresh is active, display a subtle countdown indicator next to the refresh button.
- Pause auto-refresh when the browser tab is not visible (`document.visibilityState`).

### GAP-628: Export Dashboard as PDF

**What it does:** Generates a PDF snapshot of the current dashboard state, including all visible widgets, charts, and summary cards. The PDF is formatted for letter-size printing with the company logo, date, and user name in the header.

**Where it appears:**
- Module 04 -- Main Dashboard (`/dashboard`)
- Module 04 -- Job-level Dashboard (`/jobs/[id]/dashboard`)
- Module 19 -- Financial Reporting Dashboard
- Module 39 -- Advanced Reporting Dashboard

**Implementation notes:**
- Use server-side PDF generation (e.g., Puppeteer or a headless rendering service) to capture the dashboard as rendered HTML and convert to PDF.
- Include company branding: logo, company name, report date, generated-by user name.
- Charts must render as static images (PNG/SVG) embedded in the PDF; interactive chart libraries need a static export mode.
- Offer orientation options: portrait (default) or landscape.
- Button placement: top-right toolbar, next to the refresh button. Icon: download/export icon.
- File naming convention: `{company_name}_Dashboard_{YYYY-MM-DD}.pdf`.

---

## 2. List View Features

List views are the primary data navigation pattern in RossOS. Every entity type has a list view that already supports CRUD, sort, search, and basic bulk actions (per `normalization-and-crud.md`). The features below extend list views with advanced capabilities.

### GAP-635: Saveable Filter Presets

**What it does:** Allows users to save a combination of active filters, sort order, and search terms as a named preset that they can recall with one click. Examples: "My Active Projects," "Over Budget Projects," "Unpaid Invoices > 30 Days."

**Where it appears:**
- All list views across all modules, including:
  - Module 03 -- Projects list (`/projects`)
  - Module 09 -- Budget line items list (`/jobs/[id]/budget`)
  - Module 10 -- Vendors list (`/vendors`)
  - Module 11 -- Invoices list (`/invoices`)
  - Module 07 -- Tasks list (`/jobs/[id]/schedule`)
  - Module 08 -- Daily Logs list (`/jobs/[id]/daily-logs`)
  - Module 14 -- Lien Waivers list (`/jobs/[id]/lien-waivers`)
  - Module 18 -- Purchase Orders list (`/jobs/[id]/purchase-orders`)
  - Module 21 -- Selections list (`/jobs/[id]/selections`)
  - Module 26 -- Bids list (`/jobs/[id]/bids`)
  - Module 27 -- RFIs list (`/jobs/[id]/rfis`)
  - Module 28 -- Punch list (`/jobs/[id]/punch-list`)
  - Module 36 -- Leads list (`/leads`)

**Implementation notes:**
- Store presets in a `filter_presets` table: `id`, `user_id`, `company_id`, `entity_type`, `name`, `filters_json`, `is_shared`, `sort_order`, `created_at`.
- `filters_json` stores the complete filter state as a JSON blob: column filters, sort column, sort direction, search text, page size.
- Presets appear as pill tabs above the list view, before the filter bar.
- Include system-provided default presets per entity type (e.g., "Active," "Archived," "All") that cannot be deleted but can be hidden.
- Maximum 20 personal presets per entity type per user.
- Active preset is highlighted; modifying any filter shows a "Save" / "Save As" option.

### GAP-636: Shareable Filter Presets

**What it does:** Extends GAP-635 by allowing users with PM role or above to share a filter preset with the entire team. Shared presets appear for all users in the company and are marked with a team icon.

**Where it appears:**
- Same as GAP-635 -- all list views across all modules.

**Implementation notes:**
- Reuses the `filter_presets` table with `is_shared BOOLEAN DEFAULT false`.
- Only users with role `pm`, `admin`, or `owner` can create shared presets.
- Shared presets are shown after personal presets in the pill tab bar, separated by a divider.
- Shared presets display the creator's name on hover.
- Any user can hide a shared preset from their view (stored in `user_preferences`), but cannot delete it.
- Maximum 10 shared presets per entity type per company.

### GAP-637: Bulk Actions

**What it does:** Extends the existing multi-select checkbox pattern with entity-specific bulk actions beyond archive and export. Users select multiple rows and apply an action to all selected items at once.

**Where it appears:**
- Module 03 -- Projects list: Archive multiple, reassign PM, update status, update phase.
- Module 07 -- Tasks list: Reassign trade, shift dates, update status, move to phase.
- Module 10 -- Vendors list: Update trade classification, archive, tag.
- Module 11 -- Invoices list: Approve, reject, reassign reviewer, export.
- Module 18 -- Purchase Orders list: Approve, close, archive.
- Module 27 -- RFIs list: Assign, update priority, close.
- Module 28 -- Punch list: Assign, update status, set priority.
- Module 21 -- Selections list: Approve, update status, assign to room.

**Implementation notes:**
- Bulk action bar appears at the bottom of the list when 2+ items are selected, replacing pagination controls.
- Pattern: `[N items selected] [Action 1] [Action 2] [More Actions v] [Clear Selection]`.
- Each action opens a confirmation dialog showing the count and a preview of affected items.
- Actions are processed server-side as a batch operation with a single audit trail entry.
- If any item in the batch fails (e.g., permission denied), the operation completes for valid items and returns a summary: "8 of 10 updated. 2 failed: [reason]."
- Long-running bulk operations (50+ items) show a progress indicator and run asynchronously.

### GAP-638: Customizable Columns

**What it does:** Allows users to choose which columns are visible in a list view. A "Columns" button in the toolbar opens a checklist of all available columns. Users toggle columns on/off and the selection is persisted.

**Where it appears:**
- All list views across all modules (same list as GAP-635).

**Implementation notes:**
- Store column visibility preferences in `user_preferences` under key `columns_{entity_type}`.
- Each entity type defines a full set of available columns in its config. Columns have a `default_visible` flag.
- The "Columns" button appears in the toolbar next to the filter/sort controls.
- Column selection panel: checklist with drag-to-reorder capability.
- Minimum 2 columns must remain visible (name + one other). The name/title column cannot be hidden.
- Reset to defaults option available.
- Column preferences are independent of filter presets (presets do not save column visibility).

### GAP-639: Column Resize and Reorder

**What it does:** Users can drag column borders to resize column widths and drag column headers to reorder columns. Column layout is persisted per user per entity type.

**Where it appears:**
- All list views that use the standard table component.

**Implementation notes:**
- Column resize: drag handle on right edge of each column header. Minimum width: 80px. Double-click to auto-fit.
- Column reorder: drag column header to new position. Drop indicator shows insertion point.
- Store column widths and order in `user_preferences` under key `column_layout_{entity_type}`.
- First column (row selector checkbox) and last column (actions) are not movable.
- On window resize, columns scale proportionally. If total width exceeds viewport, horizontal scroll activates.
- Reset layout option in the Columns menu (GAP-638).

### GAP-641: Map View

**What it does:** Toggles the list view into a map visualization showing all items with geographic data plotted on an interactive map. Clicking a pin opens the item's summary card.

**Where it appears:**
- Module 03 -- Projects list (`/projects`) -- project addresses plotted on map.
- Module 10 -- Vendors list (`/vendors`) -- vendor office locations.
- Module 36 -- Leads list (`/leads`) -- lead addresses/locations.
- Module 35 -- Equipment list (`/equipment`) -- current equipment locations.

**Implementation notes:**
- Use Mapbox GL JS or Google Maps JavaScript API. Prefer Mapbox for cost control at scale.
- Toggle button in toolbar: `[List] [Map]` (and `[Kanban]` where applicable per GAP-676).
- Map pins are color-coded by status (active = green, at risk = amber, on hold = gray, closed = blue).
- Cluster pins when zoomed out; expand on zoom-in.
- Summary card on pin click shows: name, status, key metric (budget, phase, etc.), and a "View Details" link.
- Map respects all active filters -- filtered-out items do not appear on the map.
- Geocoding: addresses are geocoded on creation/update and stored as `latitude`/`longitude` on the entity record.
- Fallback: items without valid coordinates show in a "No Location" sidebar list.

### GAP-642: Quick Inline Editing

**What it does:** Allows users to change specific high-frequency fields (status, assignee, priority, dates) directly in the list view without opening the detail page. A single click on the field opens an inline editor.

**Where it appears:**
- Module 03 -- Projects list: status, phase, PM assignment.
- Module 07 -- Tasks list: status, assignee, start date, end date.
- Module 11 -- Invoices list: approval status, reviewer.
- Module 27 -- RFIs list: status, assigned to, priority.
- Module 28 -- Punch list: status, assigned to, priority.
- Module 21 -- Selections list: status, selected option.

**Implementation notes:**
- Extends the existing inline edit pattern from `normalization-and-crud.md` (click cell to edit).
- Inline-editable fields are visually distinguished: subtle underline or hover highlight.
- Enum/status fields render as a dropdown on click. Date fields render as a date picker.
- Assignee fields render as a searchable user/vendor picker.
- Optimistic update: UI updates immediately, reverts on server error.
- Audit trail entry created for each inline edit.
- Permission check: users can only inline-edit fields they have write access to. Read-only fields show a tooltip explaining why.

### GAP-644: Favorite/Pin Projects

**What it does:** Users can mark any project (or other entity) as a favorite. Favorited items appear at the top of list views and in a "Favorites" section of the sidebar navigation for instant access.

**Where it appears:**
- Module 03 -- Projects list and project detail.
- Module 10 -- Vendors list and vendor detail.
- Module 36 -- Leads list and lead detail.
- Module 04 -- Navigation sidebar (favorites section).
- Module 04 -- Dashboard (favorites widget).

**Implementation notes:**
- Store in `user_favorites` table: `user_id`, `entity_type`, `entity_id`, `sort_order`, `created_at`.
- Star/pin icon on each row in the list view and in the detail page header.
- Favorited items float to the top of list views (above non-favorites) with a subtle separator.
- Favorites section in the left sidebar shows up to 5 favorited items with one-click navigation.
- Maximum 25 favorites per entity type per user.
- Favorites are personal (not shared).

### GAP-676: Kanban Board Toggle

**What it does:** Toggles the list view into a Kanban board layout where items are displayed as cards organized into columns by status (or another enum field). Users can drag cards between columns to update their status.

**Where it appears:**
- Module 03 -- Projects list: columns by project status (Pre-Construction, In Progress, Punch, Closeout, Complete).
- Module 07 -- Tasks list: columns by task status (Not Started, In Progress, Complete, Blocked).
- Module 27 -- RFIs list: columns by RFI status (Draft, Open, Responded, Closed).
- Module 28 -- Punch list: columns by punch status (Open, In Progress, Complete, Verified).
- Module 36 -- Leads list: columns by pipeline stage (New, Contacted, Proposal, Negotiation, Won, Lost).
- Module 11 -- Invoices list: columns by approval status (Draft, Submitted, Under Review, Approved, Paid).

**Implementation notes:**
- Toggle button in toolbar: `[List] [Kanban]` alongside Map toggle where applicable.
- Kanban columns are derived from the entity's status enum. Column order matches the enum's defined order.
- Card content: entity name, key subtitle (e.g., client name, amount), status badge, assignee avatar, due date if applicable.
- Drag-and-drop between columns triggers a status update with optimistic UI.
- Cards within a column can be reordered (manual sort order) or sorted by a selected field.
- Column header shows count and optional aggregate (e.g., total budget for projects column).
- Filters apply to the Kanban view -- filtered-out items are hidden from all columns.
- WIP limits: optionally configurable per column (e.g., max 5 items in "Under Review"). Visual warning when exceeded.
- Swimlanes: optional horizontal grouping by a second field (e.g., by PM, by trade).

### GAP-691: Bulk Schedule Operations

**What it does:** Provides batch operations specific to schedule/task management: shift all selected tasks by N days, reassign a trade/vendor to multiple tasks, and bulk-update task status. These operations respect dependency chains and flag conflicts.

**Where it appears:**
- Module 07 -- Schedule / Tasks list (`/jobs/[id]/schedule`).
- Module 25 -- Schedule Intelligence views.

**Implementation notes:**
- Extends GAP-637 (bulk actions) with schedule-specific operations.
- "Shift by N days" operation: user enters a positive or negative day count. All selected tasks shift their start and end dates. If a shifted task violates a dependency (predecessor hasn't finished), a warning dialog lists the conflicts and asks the user to confirm or cancel.
- "Reassign trade" operation: user selects a new vendor/trade from a picker. All selected tasks update their vendor assignment.
- "Bulk status update": user selects a new status. Tasks update with an audit log entry.
- Operations are atomic per task but the batch continues if individual tasks fail (same pattern as GAP-637).
- After a bulk shift, automatically run schedule conflict detection (GAP-690) and surface any new conflicts.

---

## 3. Detail View Features

Detail views are the full-page views for a single entity (a project, a vendor, a budget, a schedule). These features add depth and context to individual records.

### GAP-651: Project Notes / Journal

**What it does:** Provides a running, timestamped notes feed on a project's detail page. Team members can add freeform notes, tag other users, attach files, and categorize entries. The journal serves as a persistent memory of project decisions, conversations, and observations.

**Where it appears:**
- Module 03 -- Project detail page (`/jobs/[id]`) -- "Notes" tab or sidebar panel.
- Module 36 -- Lead detail page (`/leads/[id]`) -- notes about client interactions.
- Module 10 -- Vendor detail page (`/vendors/[id]`) -- notes about vendor relationship.

**Implementation notes:**
- Store in `entity_notes` table: `id`, `company_id`, `entity_type`, `entity_id`, `user_id`, `content` (rich text), `category`, `attachments` (JSONB array), `is_pinned`, `created_at`, `updated_at`.
- Rich text editor with markdown support: bold, italic, lists, links, @-mentions.
- @-mention triggers a notification to the mentioned user (Module 05 integration).
- Categories: General, Decision, Issue, Meeting Notes, Client Communication (user-configurable per GAP-789 custom fields).
- Pinned notes float to the top of the feed.
- Filter by category, author, date range.
- Notes feed displays newest first with "Load More" pagination.
- File attachments link to Document Storage (Module 06).

### GAP-653: Key Milestone Tracker

**What it does:** Displays a visual timeline of key construction milestones on a project with target dates, actual dates, and current status. Standard milestones include: Permit Issued, Breaking Ground, Foundation, Framing, Dry-In, Rough Complete, Finish Start, Certificate of Occupancy. Users can add custom milestones.

**Where it appears:**
- Module 03 -- Project detail page (`/jobs/[id]`) -- "Milestones" section on overview tab.
- Module 12/29 -- Client Portal project view (simplified version).
- Module 04 -- Dashboard -- milestone widget showing upcoming milestones across all projects.

**Implementation notes:**
- Store in `project_milestones` table: `id`, `company_id`, `job_id`, `name`, `target_date`, `actual_date`, `status` (upcoming, on_track, at_risk, delayed, complete), `sort_order`, `notes`, `created_at`.
- Visual: horizontal timeline with milestone dots. Color-coded by status: green (complete), blue (on track), amber (at risk), red (delayed), gray (upcoming).
- Default milestones are seeded from a company-configurable template (Module 02 Configuration Engine).
- Users can add, edit, reorder, and remove milestones per project.
- "At risk" is auto-calculated: target date is within 7 days and status is not complete.
- "Delayed" is auto-calculated: target date has passed and status is not complete.
- Milestones can optionally link to schedule tasks (Module 07) for automatic date updates.
- Client portal view (GAP-689) shows only milestones marked as `client_visible`.

### GAP-654: Project Risk Register

**What it does:** A structured log of identified project risks, each with a description, probability, impact, mitigation plan, owner, and status. Risks are scored and ranked to help PMs focus on the highest-priority threats.

**Where it appears:**
- Module 03 -- Project detail page (`/jobs/[id]`) -- "Risks" tab.
- Module 04 -- Dashboard -- risk summary widget showing high/critical risks across all projects.
- Module 39 -- Advanced Reporting -- risk reports.

**Implementation notes:**
- Store in `project_risks` table: `id`, `company_id`, `job_id`, `title`, `description`, `probability` (1-5), `impact` (1-5), `risk_score` (computed: probability x impact), `mitigation_plan`, `owner_id` (user), `status` (identified, monitoring, mitigating, resolved, accepted), `category` (financial, schedule, weather, supply_chain, regulatory, safety, design), `created_at`, `updated_at`.
- Risk matrix visualization: 5x5 grid with probability on Y-axis and impact on X-axis. Dots represent individual risks.
- List view with sort by risk score (highest first by default).
- Status workflow: Identified -> Monitoring -> Mitigating -> Resolved/Accepted.
- Owner receives notification when a risk is assigned or escalated.
- Risk categories are user-configurable (per GAP-789).
- Link risks to budget line items or schedule tasks for context.

### GAP-663: Budget Line Item Notes

**What it does:** Allows users to attach explanatory notes to individual budget line items to document variances, assumptions, and decisions. Notes appear inline in the budget view and in variance reports.

**Where it appears:**
- Module 09 -- Budget detail (`/jobs/[id]/budget`) -- per line item.
- Module 17 -- Change Orders -- notes on cost impact lines.
- Module 19 -- Financial Reporting -- variance explanations.

**Implementation notes:**
- Store in `budget_line_notes` table: `id`, `company_id`, `budget_line_id`, `user_id`, `content`, `note_type` (variance_explanation, assumption, approval_note, general), `created_at`.
- Inline display: a small note icon on budget rows that have notes. Hover or click to expand.
- In variance reports, notes appear automatically next to lines with significant variance (configurable threshold, default: 5%).
- Multiple notes per line item allowed, displayed chronologically.
- Notes are included when exporting budget to Excel (GAP-667) as a "Notes" column.

### GAP-666: Budget History / Point-in-Time View

**What it does:** Tracks every change to the budget over time and allows users to view the budget as it existed at any historical point. Provides a timeline slider or date picker to navigate through budget versions.

**Where it appears:**
- Module 09 -- Budget detail (`/jobs/[id]/budget`) -- "History" tab or timeline control.
- Module 19 -- Financial Reporting -- historical budget comparisons.
- Module 39 -- Advanced Reporting -- budget trend analysis.

**Implementation notes:**
- Implement as event sourcing on budget changes: `budget_history` table with `id`, `company_id`, `job_id`, `budget_line_id`, `field_changed`, `old_value`, `new_value`, `changed_by`, `changed_at`, `change_reason` (optional).
- Point-in-time reconstruction: replay events up to the selected date to reconstruct the budget state.
- UI: date picker or timeline slider at the top of the budget view. When a historical date is selected, the budget renders in read-only mode with a "Viewing as of [date]" banner.
- Diff view: show current budget vs. a selected historical date side-by-side, with changed cells highlighted.
- Performance: for budgets with 500+ lines and 10,000+ history events, use materialized snapshots at monthly intervals to avoid replaying all events.

### GAP-667: Import/Export to Excel

**What it does:** Allows users to export any list or detail view data to an Excel (.xlsx) file and import data from Excel files into the system. Export preserves column formatting, filters, and sort order. Import includes a mapping step and validation preview.

**Where it appears:**
- Module 09 -- Budget (`/jobs/[id]/budget`) -- export budget, import budget lines.
- Module 07 -- Schedule -- export/import tasks.
- Module 10 -- Vendors -- export vendor list, import vendors.
- Module 03 -- Projects -- export project list.
- Module 20 -- Estimating -- export/import estimates.
- All list views -- export button in toolbar.

**Implementation notes:**
- Use a server-side library (e.g., ExcelJS) for generation and parsing.
- **Export:** Button in toolbar ("Export" icon). Exports currently visible data respecting active filters, sort, and column selection. Include a header row with column names. Format numbers as currency/percentage where applicable. File name: `{entity_type}_{job_name}_{date}.xlsx`.
- **Import:** "Import" button opens a modal with: (1) file upload dropzone, (2) column mapping step where user maps spreadsheet columns to system fields, (3) validation preview showing rows that will be created/updated and any errors, (4) confirmation and execution.
- Import uses the normalization engine (Tier 1/2/3 matching) for fields like vendor names, cost codes, and materials.
- Import supports "create new" and "update existing" modes. Matching for updates uses a user-selected key column.
- Rate limit: maximum 5,000 rows per import.

### GAP-668: Compare to Similar Projects

**What it does:** Benchmarks the current project's budget, schedule, or performance metrics against averages from similar completed projects. Similarity is determined by project type, size (square footage), location, and construction type.

**Where it appears:**
- Module 09 -- Budget detail (`/jobs/[id]/budget`) -- "Benchmarks" panel.
- Module 07 -- Schedule detail -- "Benchmarks" panel.
- Module 04 -- Dashboard -- benchmark widget.
- Module 39 -- Advanced Reporting -- comparative analysis.

**Implementation notes:**
- Similarity algorithm considers: project type (custom home, remodel, commercial), square footage (+/- 20%), geographic region, construction type (wood frame, concrete, steel).
- Requires a minimum of 3 comparable completed projects to show benchmarks. If fewer, display "Insufficient data for benchmarks."
- Metrics compared: cost per square foot (by division), total budget vs. actual, schedule duration by phase, change order percentage, vendor cost distribution.
- Display as bar chart overlays: current project metric vs. portfolio average, with min/max range bands.
- Data is anonymized across the company's own projects only (multi-tenant isolation). No cross-company data sharing.
- Refresh benchmark data nightly via a background job.

### GAP-669: Forecast Scenarios

**What it does:** Provides a "what-if" analysis tool on the budget where users can model scenarios like material cost increases, schedule delays, or scope changes and see the projected impact on total budget and cash flow.

**Where it appears:**
- Module 09 -- Budget detail (`/jobs/[id]/budget`) -- "Scenarios" tab.
- Module 19 -- Financial Reporting -- scenario comparisons.
- Module 39 -- Advanced Reporting -- multi-scenario analysis.

**Implementation notes:**
- Scenarios are stored as overlays on the budget, not modifications to actual data: `budget_scenarios` table with `id`, `company_id`, `job_id`, `name`, `description`, `adjustments` (JSONB array of `{line_id, field, adjustment_type: 'percent' | 'fixed', adjustment_value}`), `created_at`, `created_by`.
- Users create a scenario, then add adjustments: "Increase all Concrete lines by 10%," "Add $5,000 to Electrical," "Delay framing by 2 weeks."
- The system computes the adjusted budget total, variance from current budget, and impact on cash flow timeline.
- Compare up to 3 scenarios side-by-side in a table view with delta columns.
- Scenarios do not affect actual budget data until explicitly "applied" (which creates change order entries).
- Include a "Worst Case / Best Case / Most Likely" template that pre-creates three scenarios with configurable adjustment ranges.

### GAP-672: Audit Trail Per Line Item

**What it does:** Shows a complete, searchable history of who changed what and when on any individual record or line item. Every field change, status update, and user action is logged and viewable.

**Where it appears:**
- Module 09 -- Budget line items -- "History" icon per row.
- Module 07 -- Schedule tasks -- "History" icon per row.
- Module 11 -- Invoices -- audit trail per invoice.
- Module 17 -- Change Orders -- audit trail per change order.
- Module 18 -- Purchase Orders -- audit trail per PO.
- Module 21 -- Selections -- audit trail per selection item.
- All entities with edit capability.

**Implementation notes:**
- Leverages the platform audit trail table: `audit_log` with `id`, `company_id`, `entity_type`, `entity_id`, `field_name`, `old_value`, `new_value`, `action` (create, update, delete, restore, approve, reject), `user_id`, `ip_address`, `timestamp`.
- Per-line history view: click a history icon on any row to open a panel showing all changes to that record, newest first.
- Each entry shows: timestamp, user name + avatar, field changed, old value (strikethrough) -> new value.
- Filter audit entries by date range, user, or field name.
- Audit entries are immutable -- they cannot be edited or deleted.
- Retention: audit data retained for the life of the account (no automatic purge).

### GAP-680: Resource Assignment and Resource Leveling View

**What it does:** Displays a resource-centric view of the schedule showing what each worker, crew, or vendor is assigned to and when. Resource leveling identifies over-allocations (a resource assigned to overlapping tasks) and suggests or auto-applies adjustments to resolve conflicts.

**Where it appears:**
- Module 07 -- Schedule (`/jobs/[id]/schedule`) -- "Resources" tab.
- Module 25 -- Schedule Intelligence -- resource optimization.
- Module 34 -- HR & Workforce -- workforce allocation view.

**Implementation notes:**
- Resource types: individual workers, crews, vendors/subs, equipment.
- View: horizontal timeline (Gantt-style) with resources on the Y-axis and time on the X-axis. Bars represent task assignments.
- Over-allocation indicator: resource rows that exceed 100% allocation are highlighted in red with a warning icon.
- Leveling algorithm: when triggered, shifts tasks within their float (slack time) to eliminate over-allocations. Respects dependencies and critical path. Does not move tasks on the critical path unless no alternative exists.
- Manual override: users can drag task bars on the resource view to reassign or reschedule.
- Capacity settings: each resource has a configurable capacity (e.g., 8 hours/day, 5 days/week). Overtime threshold triggers the over-allocation warning.

### GAP-681: Baseline Comparison Overlay

**What it does:** Allows users to save a "baseline" snapshot of the schedule at a point in time and overlay it on the current schedule to visualize slippage. Baseline bars appear as shadow bars behind current task bars on the Gantt chart.

**Where it appears:**
- Module 07 -- Schedule Gantt view (`/jobs/[id]/schedule`).
- Module 25 -- Schedule Intelligence -- variance analysis.
- Module 39 -- Advanced Reporting -- schedule performance reports.

**Implementation notes:**
- Store baselines in `schedule_baselines` table: `id`, `company_id`, `job_id`, `name` (e.g., "Original Plan," "Post-Change-Order #3"), `snapshot_date`, `tasks_snapshot` (JSONB array of task records with start/end dates), `created_by`, `created_at`.
- Users can save multiple baselines per project. Up to 5 baselines stored per project.
- Gantt overlay: baseline bars render as thin gray/translucent bars behind the current task bars. If the current task extends beyond the baseline end date, the delta is highlighted in red.
- Summary metrics: total baseline duration vs. current duration, number of tasks ahead/behind/on schedule.
- Toggle baseline overlay on/off from the Gantt toolbar.
- Baseline data is read-only after creation; cannot be edited.

### GAP-688: Vendor Schedule View

**What it does:** Generates a filtered schedule view showing only the tasks assigned to a specific vendor. This view can be shared with the vendor via the Vendor Portal or exported as a PDF. It shows task names, dates, dependencies (only those relevant to the vendor), and notes.

**Where it appears:**
- Module 07 -- Schedule (`/jobs/[id]/schedule`) -- "Vendor View" filter.
- Module 10 -- Vendor detail (`/vendors/[id]`) -- "Schedule" tab showing tasks across all projects.
- Module 30 -- Vendor Portal -- the vendor's default schedule view.

**Implementation notes:**
- Filter: select a vendor from a dropdown in the schedule toolbar. The schedule re-renders showing only tasks assigned to that vendor.
- Dependencies: show only dependencies between the vendor's own tasks, plus immediate predecessor/successor tasks from other vendors (grayed out) for context.
- Export options: PDF (GAP-686), Excel (GAP-667), iCal (.ics) for calendar integration.
- Vendor Portal integration: the vendor sees only their own tasks, cannot see other vendors' details, and can update task completion status.
- Cross-project view on vendor detail: aggregate all tasks for a vendor across all active projects into a single timeline.

### GAP-689: Client-Friendly Schedule View

**What it does:** A simplified schedule view designed for clients (homeowners/stakeholders) that shows only major milestones and phases, not individual trade tasks. Uses plain language and a clean visual design. Available in the Client Portal.

**Where it appears:**
- Module 12/29 -- Client Portal project view (`/portal/jobs/[id]/schedule`).
- Module 07 -- Schedule -- "Client View" toggle for preview.
- Module 03 -- Project detail -- embeddable in client-facing reports.

**Implementation notes:**
- Tasks are grouped into phases (e.g., "Foundation," "Framing," "Roofing"). Individual tasks within a phase are collapsed into a single phase bar.
- Only tasks and milestones marked as `client_visible` appear.
- Date format: "Week of January 5" rather than specific dates (configurable: exact dates vs. weekly).
- Progress shown as percentage complete per phase.
- Visual: simplified Gantt with phase bars, milestone diamonds, and a "You Are Here" indicator on the current date.
- No edit capability in client view -- read-only.
- Auto-generates a plain-language summary: "Framing is 80% complete. Roofing is scheduled to begin the week of March 3."

### GAP-690: Schedule Conflict Detection

**What it does:** Automatically detects scheduling conflicts where tasks that require the same physical space, resource, or equipment are scheduled to overlap. Flags conflicts with warnings and suggests resolutions.

**Where it appears:**
- Module 07 -- Schedule (`/jobs/[id]/schedule`) -- conflict warnings.
- Module 25 -- Schedule Intelligence -- conflict analysis.
- Module 07 -- Schedule -- triggered after bulk operations (GAP-691).

**Implementation notes:**
- Conflict types: (1) Space conflicts -- two trades working in the same area/room simultaneously (e.g., flooring and painting in the same room). (2) Resource conflicts -- same crew/vendor double-booked. (3) Equipment conflicts -- same piece of equipment assigned to two tasks. (4) Dependency violations -- task scheduled before its predecessor completes.
- Detection runs automatically when tasks are created, moved, or bulk-shifted.
- Conflicts display as warning badges on the Gantt chart and as a "Conflicts" panel listing all detected issues.
- Each conflict shows: conflicting tasks, conflict type, severity (critical/warning), and suggested resolution (shift one task, extend duration, assign different resource).
- Users can dismiss a conflict as "acceptable" (e.g., two trades can work in the same area if it's large enough), which suppresses future warnings for that specific pair.
- Space/location conflicts require tasks to have a `location` field populated.

### GAP-726: Comparison Mode (Selections)

**What it does:** Provides a side-by-side comparison view for selection options within a category. For example, comparing three countertop options with their photos, specs, pricing, and lead times displayed in adjacent columns.

**Where it appears:**
- Module 21 -- Selection Management (`/jobs/[id]/selections/[category]`) -- "Compare" button.
- Module 29 -- Client Portal selections -- client can compare options before approving.

**Implementation notes:**
- User selects 2-4 options within a selection category and clicks "Compare."
- Comparison table layout: options as columns, attributes as rows. Attributes include: photo, name, vendor, unit cost, total cost, lead time, availability, spec sheet link, notes.
- Differences between options are highlighted (e.g., the cheapest option has its price highlighted in green).
- "Best value" indicator: optional auto-highlight of the option with the best price-to-spec ratio.
- Print/export comparison as PDF (integrates with GAP-734).
- Client Portal version allows the client to mark their preferred option.

### GAP-733: Selection History

**What it does:** Tracks all options that were considered for each selection decision, not just the final chosen option. Preserves the decision-making history including rejected options and the reasons they were rejected.

**Where it appears:**
- Module 21 -- Selection Management (`/jobs/[id]/selections`) -- "History" tab per selection item.
- Module 39 -- Advanced Reporting -- selection decision audit.

**Implementation notes:**
- Store in `selection_history` table: `id`, `company_id`, `selection_id`, `option_name`, `vendor_id`, `price`, `status` (considered, shortlisted, selected, rejected), `rejection_reason`, `added_by`, `status_changed_by`, `status_changed_at`, `created_at`.
- Timeline view: shows when each option was added, shortlisted, selected, or rejected.
- Rejected options remain visible in history with their rejection reason.
- If the selected option changes (e.g., client changes their mind), the previous selection moves to "rejected" with a reason, and the new selection is logged.
- History is immutable; entries cannot be deleted.

### GAP-745: Carry Forward from Yesterday (Daily Logs)

**What it does:** When creating a new daily log entry, pre-populates fields with data from the previous day's log. Specifically carries forward: weather conditions (if similar), crew members present, equipment on site, and any open issues/notes. The user can modify any pre-filled data.

**Where it appears:**
- Module 08 -- Daily Logs (`/jobs/[id]/daily-logs`) -- "New Entry" action.

**Implementation notes:**
- On "New Daily Log" click, fetch the most recent daily log for the same job.
- Auto-populate: crew list, equipment list, open safety issues, work-in-progress descriptions. Do NOT carry forward: hours worked, photos, specific completion percentages.
- Pre-filled fields are visually marked (e.g., light blue background) so the user knows what came from yesterday vs. what they entered today.
- User can clear all pre-filled data with a "Start Fresh" button.
- Weather data is fetched fresh from the weather API (Module 07 integration), not carried forward.
- If no previous log exists (first day), start with an empty form.

---

## 4. Invoice and Payment Features

These features extend the invoicing and payment modules with batch processing, historical tracking, and financial management capabilities.

### GAP-698: Batch Approval Capability

**What it does:** Allows authorized users to approve or reject multiple invoices in a single action. Presents a review summary showing all selected invoices with key details (vendor, amount, due date, job) before the user confirms the batch action.

**Where it appears:**
- Module 11 -- Invoices list (`/invoices`) -- bulk action bar.
- Module 18 -- Purchase Orders list -- batch PO approval.
- Module 17 -- Change Orders list -- batch CO approval.
- Module 15 -- Draw Requests -- batch draw line approval.

**Implementation notes:**
- Extends GAP-637 (bulk actions) for approval-specific workflows.
- Batch approval modal shows: total count, total dollar amount, list of items with vendor name, amount, job name, and due date.
- Approval rules still apply per item: if a user lacks approval authority for an item above their threshold, that item is skipped with an explanation.
- Approval thresholds configured in Module 02 (Configuration Engine): e.g., PM can approve up to $10,000, Admin up to $50,000, Owner unlimited.
- Each approved item creates an individual audit trail entry (not a single batch entry) for compliance.
- After batch approval, trigger notifications to relevant vendors and accounting team (Module 05).
- Option to add a single note that applies to all approved items in the batch.

### GAP-699: Invoice History Per Vendor

**What it does:** Displays a complete invoice history for a specific vendor, including all invoices across all projects, with running totals, payment status, and average payment terms. Provides a vendor financial profile at a glance.

**Where it appears:**
- Module 10 -- Vendor detail (`/vendors/[id]`) -- "Invoices" tab.
- Module 11 -- Invoices list -- "View Vendor History" action per row.
- Module 22 -- Vendor Performance -- financial performance metrics.

**Implementation notes:**
- View: sortable table of all invoices from the vendor, with columns: invoice number, date, job, amount, status, payment date, days to payment.
- Summary cards at top: total invoiced, total paid, total outstanding, average days to payment, number of disputed invoices.
- Chart: monthly spend trend for the vendor over the past 12 months.
- Drill-down: click any invoice to navigate to the invoice detail.
- Filter by project, date range, status, amount range.
- Respects multi-tenant isolation -- only shows invoices within the current company.

### GAP-705: Aging Report

**What it does:** Generates a report of all outstanding invoices grouped by aging buckets: Current (0-30 days), 31-60 days, 61-90 days, and 90+ days. Shows totals per bucket, per vendor, and per project. Identifies invoices at risk of late payment.

**Where it appears:**
- Module 19 -- Financial Reporting (`/reports/aging`).
- Module 11 -- Invoices list -- "Aging" view toggle.
- Module 04 -- Dashboard -- aging summary widget.
- Module 39 -- Advanced Reporting -- aging trend analysis.

**Implementation notes:**
- Aging calculation based on invoice date (not due date). Configurable to use due date instead in company settings.
- Aging buckets: Current (0-30), 31-60, 61-90, 90+ days. Buckets are configurable in company settings.
- View: grouped table with vendor rows, expandable to show individual invoices. Summary row at top shows totals per bucket.
- Bar chart visualization: stacked bar chart showing aging distribution by vendor or by project.
- Highlight invoices in the 90+ bucket with red/critical styling.
- Auto-flag: invoices approaching the next aging bucket (within 5 days) are marked with a warning.
- Export to Excel and PDF.

### GAP-706: Payment Run Generation

**What it does:** Allows accounting staff to select a set of approved invoices and generate a "payment run" -- a batch of payments to be processed together. Produces a summary document, check stubs, or an ACH batch file for bank submission.

**Where it appears:**
- Module 11 -- Invoices list (`/invoices`) -- "Create Payment Run" action.
- Module 19 -- Financial Reporting -- payment run history.
- Module 16 -- QuickBooks Integration -- sync payment runs.

**Implementation notes:**
- Workflow: (1) Filter to approved/unpaid invoices, (2) Select invoices for the payment run (or "Select All"), (3) Review payment run summary (total, vendor breakdown, funding source), (4) Confirm and generate.
- Store in `payment_runs` table: `id`, `company_id`, `run_date`, `total_amount`, `invoice_count`, `status` (draft, confirmed, processing, complete), `payment_method` (check, ACH, wire), `created_by`, `created_at`.
- Payment run detail: `payment_run_items` linking `payment_run_id` to `invoice_id` with individual payment amounts.
- Output formats: (1) PDF summary with vendor-grouped payment details, (2) CSV/NACHA file for ACH batch submission, (3) Check print layout.
- After confirmation, invoices are marked as "payment pending" and cannot be included in another payment run.
- QuickBooks sync: payment run data pushes to QuickBooks as bill payments (Module 16 integration).

### GAP-707: Export to Accounting System

**What it does:** Provides a one-click export button that packages selected invoices, payments, or journal entries into a format compatible with the company's accounting system (QuickBooks, Xero, Sage, or generic CSV).

**Where it appears:**
- Module 11 -- Invoices list and invoice detail -- "Export to Accounting" button.
- Module 19 -- Financial Reporting -- batch export.
- Module 09 -- Budget -- export journal entries.
- Module 16 -- QuickBooks Integration -- primary integration point.

**Implementation notes:**
- If QuickBooks Integration (Module 16) is active, use the direct API sync. This button serves as a manual override or for non-QuickBooks systems.
- Export formats: QuickBooks IIF, QuickBooks Online CSV, Xero CSV, Sage CSV, Generic CSV.
- Format selection is configured once in company settings and remembered.
- Export includes: vendor mapping, account/cost code mapping, class/job mapping.
- A mapping configuration step (one-time setup): map RossOS cost codes to accounting system chart of accounts.
- Export preview shows line items as they will appear in the accounting system.
- Export history log: track what was exported and when to prevent duplicate exports.

---

## 5. Vendor Features

These features enhance vendor management with document storage, relationship tracking, and quick-access actions.

### GAP-719: Vendor Document Repository

**What it does:** A dedicated document folder structure on each vendor's profile for storing compliance and relationship documents: Certificates of Insurance (COI), W-9 forms, contracts, lien waivers, licenses, and bonds. Tracks expiration dates and sends alerts before documents expire.

**Where it appears:**
- Module 10 -- Vendor detail (`/vendors/[id]`) -- "Documents" tab.
- Module 30 -- Vendor Portal -- vendors can upload their own documents.
- Module 06 -- Document Storage -- vendor documents integrated into the document tree.

**Implementation notes:**
- Default folder structure per vendor: COI, W-9, Contracts, Lien Waivers, Licenses, Other.
- Each document has metadata: `document_type`, `expiration_date`, `uploaded_by`, `uploaded_at`, `status` (current, expiring_soon, expired).
- Expiration tracking: documents with an `expiration_date` trigger notifications at 30, 14, and 7 days before expiry.
- "Expiring Soon" widget on the vendor detail page and on the main dashboard.
- Vendor Portal (Module 30) integration: vendors can upload updated COIs and W-9s directly; uploads go to a review queue.
- Compliance gate: optionally block PO/invoice creation for vendors with expired COIs (configurable in Module 02).
- Bulk compliance check: list view showing compliance status across all vendors.

### GAP-721: Related Vendors

**What it does:** Allows users to link vendor records that represent related entities (parent companies, subsidiaries, DBAs, joint ventures). Related vendors display on each other's profiles and share aggregated financial summaries.

**Where it appears:**
- Module 10 -- Vendor detail (`/vendors/[id]`) -- "Related Vendors" section.
- Module 22 -- Vendor Performance -- aggregated performance across related vendors.
- Module 26 -- Bid Management -- show related vendors when evaluating bids.

**Implementation notes:**
- Store in `vendor_relationships` table: `id`, `company_id`, `vendor_a_id`, `vendor_b_id`, `relationship_type` (parent_subsidiary, dba, joint_venture, subcontractor_of, preferred_sub), `notes`, `created_at`.
- Display on vendor detail: "Related Vendors" card showing linked vendors with relationship type badges.
- Aggregate financial view: optionally combine invoices and payment history across related vendors for a consolidated view.
- Search integration: when searching for a vendor, related vendor names also appear as secondary matches.
- Prevent duplicate vendor creation: when adding a new vendor, check for similar names across related vendor networks.

### GAP-723: Vendor Quick Actions

**What it does:** Provides a quick-action menu on vendor list rows and vendor detail pages for the most common vendor operations: Create PO, Invite to Bid, Send Message, Schedule Meeting. These actions pre-populate the vendor context so the user does not have to re-select the vendor.

**Where it appears:**
- Module 10 -- Vendors list (`/vendors`) -- actions column per row.
- Module 10 -- Vendor detail (`/vendors/[id]`) -- action button bar in header.
- Module 04 -- Global Search results -- quick actions on vendor search results.

**Implementation notes:**
- Quick actions menu (dropdown or button bar): (1) Create PO -- opens PO creation form with vendor pre-filled, (2) Invite to Bid -- opens bid invitation form (Module 26) with vendor pre-selected, (3) Send Message -- opens in-app messaging or email compose with vendor contact info, (4) Schedule Meeting -- opens calendar event creation with vendor name in attendees.
- Each action navigates to the relevant module's creation form with context parameters in the URL or state.
- Permission-gated: only show actions the current user has permission to perform.
- Keyboard shortcut support within the vendor detail page (e.g., `P` for Create PO, `B` for Invite to Bid).

---

## 6. Selection Features

### GAP-734: Print/Export Selection Summary

**What it does:** Generates a formatted PDF or Excel document summarizing all selections for a project or a specific category, including product photos, specifications, vendor, pricing, status, and approval notes. Suitable for client review packages and subcontractor specification sheets.

**Where it appears:**
- Module 21 -- Selection Management (`/jobs/[id]/selections`) -- "Export Summary" button.
- Module 29 -- Client Portal -- "Download Selections" action.
- Module 20 -- Estimating -- export selections for estimate reference.

**Implementation notes:**
- PDF layout: cover page with project name and date, followed by one selection per page (or grouped by room/category).
- Each selection entry: product photo (if available), product name, vendor, model/SKU, unit price, quantity, total cost, lead time, status, approval notes.
- Export scopes: (1) All selections for the project, (2) By category (e.g., all Flooring selections), (3) By room, (4) By status (e.g., only approved selections).
- Include comparison data if GAP-726 comparison was performed.
- Client-friendly version omits cost markup and internal notes; includes only client-facing pricing.
- Excel export includes all data in a filterable table format.

---

## 7. Daily Log Features

### GAP-752: Export Daily Log as PDF

**What it does:** Generates a formatted PDF of a single daily log entry or a date range of daily logs. The PDF includes all log sections: weather, crew, equipment, work performed, safety notes, photos, and visitor log. Formatted for printing and filing.

**Where it appears:**
- Module 08 -- Daily Log detail (`/jobs/[id]/daily-logs/[id]`) -- "Export PDF" button.
- Module 08 -- Daily Logs list -- bulk export for a date range.
- Module 39 -- Advanced Reporting -- daily log reports.

**Implementation notes:**
- Single log PDF: one document per daily log entry with all sections rendered.
- Date range PDF: one document with each day as a section, with a table of contents.
- Include embedded photos as thumbnails with captions. Full-size photos on subsequent pages.
- Header on each page: project name, date, submitted by, weather summary.
- Signature block: space for PM signature and date (for formal record keeping).
- File naming: `DailyLog_{job_name}_{date}.pdf` or `DailyLogs_{job_name}_{start_date}_to_{end_date}.pdf`.

### GAP-753: Notification Confirmation for Daily Log Submission

**What it does:** When a daily log is submitted, the system confirms the submission with a success toast notification and sends a push/email notification to the project manager and any configured recipients. The submitter sees confirmation that the PM has been notified.

**Where it appears:**
- Module 08 -- Daily Logs (`/jobs/[id]/daily-logs`) -- submit action.
- Module 05 -- Notification Engine -- notification template for daily log submission.

**Implementation notes:**
- On submit: (1) Save the daily log with status "submitted," (2) Display success toast: "Daily log submitted. [PM Name] has been notified." (3) Send notification to PM via configured channels (in-app, email, push).
- Notification content: "Daily log submitted by [User] for [Job Name] on [Date]. [Link to view]."
- Configurable recipients per project: PM (always), superintendent (optional), owner (optional). Configured in project settings.
- If submission fails (network error), show error toast and retain the form data for retry.
- Submission timestamp is recorded and displayed on the daily log record.

---

## 8. Document Features

These features enhance the document management system (Module 06) with batch operations, annotation tools, and integration capabilities.

### GAP-756: Bulk Upload with Progress Indicator

**What it does:** Allows users to drag-and-drop or select multiple files for simultaneous upload. Displays a progress bar for each file and an overall progress indicator. Supports uploading 50+ files in a single batch.

**Where it appears:**
- Module 06 -- Document Storage (`/jobs/[id]/documents`) -- upload area.
- Module 10 -- Vendor Documents -- bulk document upload.
- Module 08 -- Daily Logs -- bulk photo upload.
- Module 28 -- Punch List -- bulk photo upload.

**Implementation notes:**
- Drag-and-drop zone accepts multiple files. Also a "Browse" button for file picker (with multi-select).
- Progress UI: list of files being uploaded, each with: file name, file size, individual progress bar, status icon (uploading, complete, failed).
- Overall progress bar at the top: "Uploading 12 of 50 files (24%)."
- Upload strategy: parallel uploads with concurrency limit of 3 files simultaneously.
- Retry logic: failed uploads show a "Retry" button. "Retry All Failed" button at the top.
- After upload, files go through AI document processing (Module 24) for auto-classification.
- Maximum file size: 100MB per file. Maximum batch size: 200 files or 2GB total.
- Supported formats: PDF, JPEG, PNG, HEIC, TIFF, XLSX, DOCX, DWG, DXF.

### GAP-761: Annotation/Markup Tools on Documents

**What it does:** Provides in-browser annotation tools for marking up PDFs, images, and plan drawings. Tools include: arrow, rectangle, circle, freehand draw, text callout, measurement, and highlight. Annotations are saved as a non-destructive overlay layer.

**Where it appears:**
- Module 06 -- Document viewer (`/jobs/[id]/documents/[id]`) -- annotation toolbar.
- Module 28 -- Punch List -- markup on photos and plans.
- Module 27 -- RFI Management -- markup on referenced drawings.
- Module 29 -- Client Portal -- client can annotate selections and plans.

**Implementation notes:**
- Render documents using a canvas-based viewer (e.g., PDF.js for PDFs, native canvas for images).
- Annotation tools: (1) Arrow -- point to specific areas, (2) Rectangle/Circle -- highlight regions, (3) Freehand draw -- sketch on the document, (4) Text callout -- add labeled notes, (5) Measurement -- measure distances on scaled drawings, (6) Highlight -- semi-transparent color overlay.
- Annotations stored separately from the source document in `document_annotations` table: `id`, `document_id`, `user_id`, `annotation_data` (JSON defining shapes, positions, text), `page_number`, `created_at`, `updated_at`.
- Non-destructive: original document is never modified. Annotations render as an overlay.
- Multiple users can annotate the same document. Each user's annotations are color-coded by user.
- Toggle annotation layers on/off per user.
- Export: "Download with annotations" flattens annotations into the document for sharing externally.

### GAP-764: Download with Watermark Option

**What it does:** When downloading a document, offers the option to apply a watermark overlay. Watermark options include: "DRAFT," "CONFIDENTIAL," "FOR REVIEW ONLY," custom text, or the company logo. Watermark is baked into the downloaded file.

**Where it appears:**
- Module 06 -- Document viewer and document list -- download action.
- Module 29 -- Client Portal -- downloads automatically watermarked with "CLIENT COPY."
- Module 30 -- Vendor Portal -- downloads automatically watermarked with "VENDOR COPY."

**Implementation notes:**
- On download, a dropdown offers: "Download" (no watermark) and "Download with Watermark."
- Watermark options: (1) Preset text: DRAFT, CONFIDENTIAL, FOR REVIEW ONLY, PRELIMINARY, NOT FOR CONSTRUCTION, (2) Custom text: user-entered, (3) Company logo: semi-transparent logo overlay.
- Watermark rendering: diagonal text across each page, 45-degree angle, 50% opacity, gray color (configurable).
- Applied server-side: the server generates a watermarked copy on-the-fly for download. Original document is not modified.
- Portal auto-watermark: documents downloaded from Client or Vendor Portals automatically include a portal-specific watermark (configurable in company settings).
- PDF-specific: watermark is added as a content layer, not a removable annotation.

### GAP-765: Batch Document Operations

**What it does:** Allows users to select multiple documents and perform batch operations: move to folder, add/remove tags, delete (archive), share with users or portals, and download as a ZIP file.

**Where it appears:**
- Module 06 -- Document Storage (`/jobs/[id]/documents`) -- multi-select mode.
- Module 10 -- Vendor Documents -- batch tag/move.
- Module 29/30 -- Portal document management.

**Implementation notes:**
- Multi-select: checkboxes on each document in list or grid view. "Select All" option.
- Batch action bar (same pattern as GAP-637): appears when 2+ documents are selected.
- Actions: (1) Move to Folder -- folder picker dialog, (2) Add Tags -- tag picker with create-new option, (3) Remove Tags -- tag picker showing only tags present on selected docs, (4) Archive -- soft delete with confirmation, (5) Share -- select users, roles, or portal visibility, (6) Download ZIP -- packages selected documents into a ZIP file for download.
- Tag management: tags are freeform text with autocomplete from existing tags. Tags are per-company.
- ZIP download: server generates the ZIP asynchronously. For large batches (50+ files or 500MB+), user receives a notification with a download link when ready.
- All batch operations create audit trail entries per document.

### GAP-766: Recent Documents and Favorites

**What it does:** Provides a "Recent Documents" section showing the user's most recently viewed or edited documents, and a "Favorites" section for documents the user has starred. Both sections appear at the top of the document browser and in the sidebar.

**Where it appears:**
- Module 06 -- Document Storage (`/jobs/[id]/documents`) -- top of document browser.
- Module 04 -- Navigation sidebar -- "Recent Docs" section.
- Module 04 -- Dashboard -- recent documents widget.

**Implementation notes:**
- Recent documents: track document access in `document_access_log` table: `user_id`, `document_id`, `accessed_at`. Show the 10 most recently accessed documents.
- Favorites: reuse `user_favorites` table (same as GAP-644) with `entity_type = 'document'`.
- Recent section: horizontal scrollable card row showing document thumbnail, name, last accessed time.
- Favorites section: same card layout with a star icon. Sort by user-defined order.
- Clear recent history option available.
- Recent and favorites respect document permissions -- if access is revoked, the document no longer appears.

### GAP-768: Integration with E-Signature Platforms

**What it does:** Connects document workflows with e-signature services (DocuSign, PandaDoc, or built-in Module 38) to send documents for electronic signature directly from the document viewer. Tracks signature status and stores the signed copy.

**Where it appears:**
- Module 06 -- Document viewer -- "Send for Signature" action.
- Module 38 -- Contracts & E-Signature -- primary integration module.
- Module 14 -- Lien Waivers -- send lien waiver for vendor signature.
- Module 17 -- Change Orders -- send CO for client/owner signature.

**Implementation notes:**
- Integration options: (1) Built-in e-signature (Module 38), (2) DocuSign API, (3) PandaDoc API. Configured in company settings.
- "Send for Signature" flow: (1) Select document, (2) Add signature fields (drag-and-drop placement on the document), (3) Add signers (name, email, signing order), (4) Send.
- Status tracking: Draft, Sent, Viewed, Partially Signed, Completed, Declined, Expired.
- Signed document: once all parties sign, the platform-certified signed copy is automatically uploaded back to the document repository and linked to the original.
- Notifications: signers receive email notifications. The sender receives notifications on status changes.
- Audit trail: full signing event log (sent, opened, signed per party, completed) stored and viewable.

---

## 9. Report Features

These features enhance the reporting system (Module 19, 39) with comparative analysis, templates, and archival capabilities.

### GAP-776: Comparative Reporting

**What it does:** Allows users to select two or more projects or time periods and generate a side-by-side comparison report. Compares key metrics: budget vs. actual, schedule performance, change order percentage, cost per square foot, and vendor spend distribution.

**Where it appears:**
- Module 19 -- Financial Reporting (`/reports`) -- "Compare" action.
- Module 39 -- Advanced Reporting -- comparative report builder.
- Module 04 -- Dashboard -- comparative widgets.

**Implementation notes:**
- Comparison modes: (1) Project vs. Project -- select 2-5 projects to compare, (2) Period vs. Period -- compare the same project across two time ranges (e.g., this month vs. last month), (3) Actual vs. Budget -- standard variance report.
- Report layout: columns represent each project or period. Rows represent metrics. Delta columns show the difference.
- Metrics compared: total budget, actual spend, variance, percentage complete, change order count and value, schedule days remaining, cost per square foot, vendor spend by trade.
- Charts: grouped bar chart, radar/spider chart for multi-dimensional comparison, line chart for period comparisons.
- Export: PDF and Excel (GAP-667).
- Saved comparisons: users can save a comparison configuration for recurring use (ties into GAP-777).

### GAP-777: Report Templates -- Saveable and Shareable

**What it does:** Allows users to save a report's configuration (selected metrics, filters, date ranges, chart types, layout) as a named template. Templates can be personal or shared with the team. Shared templates ensure consistent reporting across the organization.

**Where it appears:**
- Module 19 -- Financial Reporting -- "Save as Template" option.
- Module 39 -- Advanced Reporting -- template library.
- Module 04 -- Dashboard -- report quick-launch from templates.

**Implementation notes:**
- Store in `report_templates` table: `id`, `company_id`, `user_id`, `name`, `description`, `report_type`, `configuration` (JSONB: metrics, filters, chart types, layout, grouping), `is_shared`, `category`, `sort_order`, `created_at`, `updated_at`.
- Template library: browsable list of personal and shared templates, filterable by category (Financial, Schedule, Vendor, Project Overview).
- "Use Template" action: opens the report builder pre-configured with the template settings. User can modify before running.
- "Save as Template" action: available after configuring any report. Prompts for name, description, and shared/personal toggle.
- Shared templates require PM role or above to create.
- System-provided default templates: "Monthly Financial Summary," "Project Status Report," "Vendor Spend Analysis," "Schedule Performance Report." These cannot be deleted but can be cloned and customized.
- Template versioning: when a shared template is updated, the previous version is retained for reference.

### GAP-780: Report Archiving

**What it does:** Saves a point-in-time snapshot of a generated report (data + formatting) as an immutable archived record. Archived reports are stored permanently and can be retrieved for historical reference, compliance audits, or lender submissions.

**Where it appears:**
- Module 19 -- Financial Reporting -- "Archive Report" action.
- Module 39 -- Advanced Reporting -- "Archive" action.
- Module 15 -- Draw Requests -- auto-archive submitted draw packages.
- Module 04 -- Dashboard -- archived reports browser.

**Implementation notes:**
- Store in `archived_reports` table: `id`, `company_id`, `report_type`, `report_name`, `generated_at`, `generated_by`, `parameters` (JSONB: filters and configuration used), `snapshot_data` (JSONB: the actual data at generation time), `pdf_storage_path` (S3/Supabase path to the rendered PDF), `job_id` (optional, if project-specific), `tags`, `created_at`.
- Archive workflow: (1) User generates a report, (2) Clicks "Archive," (3) Names the archive and optionally adds tags, (4) System stores both the data snapshot and a rendered PDF.
- Archived reports are immutable -- they cannot be edited, only viewed or downloaded.
- Archive browser: searchable list with filters by report type, date range, project, tags.
- Auto-archive: configurable rules to automatically archive certain reports (e.g., monthly financial reports on the first of each month).
- Retention: archived reports are retained for the life of the account. Configurable retention policy for storage management (e.g., delete PDF after 7 years, retain data snapshot indefinitely).

---

## 10. Print and Export

### GAP-686: Print/Export Schedule in Multiple Formats

**What it does:** Exports the project schedule in multiple formats to support different audiences and use cases: PDF (formatted Gantt chart), Excel (task list with dates and dependencies), Microsoft Project (.mpp/.xml), iCal (.ics for calendar apps), and CSV (raw data).

**Where it appears:**
- Module 07 -- Schedule (`/jobs/[id]/schedule`) -- "Export" dropdown in toolbar.
- Module 25 -- Schedule Intelligence -- export optimized schedules.
- Module 30 -- Vendor Portal -- export vendor-specific schedule (GAP-688).
- Module 29 -- Client Portal -- export client-friendly schedule (GAP-689).

**Implementation notes:**
- Export dropdown with format options: PDF, Excel, MS Project XML, iCal, CSV.
- **PDF:** Rendered Gantt chart, one page per time period (week/month). Includes legend, project name, date range. Landscape orientation. Optionally includes baseline overlay (GAP-681).
- **Excel:** One row per task with columns: WBS, Task Name, Duration, Start, End, Predecessors, Resource, Status, % Complete, Notes.
- **MS Project XML:** Standard Microsoft Project XML exchange format for import into MS Project, Primavera, or other scheduling tools.
- **iCal (.ics):** Each task as a calendar event. Useful for syncing milestones to Outlook/Google Calendar.
- **CSV:** Raw tabular data for custom analysis.
- All exports respect the current view filter (e.g., if viewing a vendor-filtered schedule, export only those tasks).
- File naming: `Schedule_{job_name}_{format}_{date}.{ext}`.

---

## 11. Admin and Settings Features

These features provide system administration capabilities for configuring the platform, managing access, and maintaining operational oversight.

### GAP-783: Role/Permission Configuration

**What it does:** Allows company admins to create custom roles beyond the 7 canonical roles (owner, admin, pm, superintendent, office, field, read_only) and configure granular permissions for each. Permissions control access to modules, actions (create, read, update, delete, approve), and data scopes (own projects, all projects, company-wide).

**Where it appears:**
- Module 01 -- Auth & Access Control -- role management section (`/settings/roles`).
- Module 02 -- Configuration Engine -- permission templates.

**Implementation notes:**
- Custom roles inherit from a base canonical role and can add or remove specific permissions.
- Permission structure: `{module}.{entity}.{action}` (e.g., `invoices.invoice.approve`, `schedule.task.update`, `budget.line_item.delete`).
- Data scope levels: (1) Own -- only items the user created or is assigned to, (2) Project -- all items within assigned projects, (3) Company -- all items in the company.
- Role management UI: table of roles with expandable permission matrices. Checkboxes for each permission.
- Permission presets: "Project Manager Standard," "Accounting," "Field Supervisor," "Read-Only Executive."
- Role assignment: users are assigned a role per project or a company-wide default role.
- Permission checks enforced server-side via middleware. Client-side used for UI element visibility only.
- Maximum 20 custom roles per company.

### GAP-785: Workflow Configuration

**What it does:** Allows admins to configure approval workflows: who approves what, at what dollar thresholds, in what order. Defines routing rules for invoices, change orders, purchase orders, draw requests, and other approvable entities.

**Where it appears:**
- Module 02 -- Configuration Engine (`/settings/workflows`).
- Module 11 -- Invoices -- approval workflow execution.
- Module 17 -- Change Orders -- approval workflow execution.
- Module 18 -- Purchase Orders -- approval workflow execution.
- Module 15 -- Draw Requests -- approval workflow execution.

**Implementation notes:**
- Workflow definition: `workflow_definitions` table with `id`, `company_id`, `entity_type`, `name`, `steps` (JSONB array), `conditions` (JSONB: threshold rules), `is_active`, `created_at`.
- Workflow step: `{approver_role, approver_user_id (optional), threshold_min, threshold_max, required_action (approve/review), auto_approve_below}`.
- Example workflow: Invoice < $1,000 auto-approved. Invoice $1,000-$10,000 requires PM approval. Invoice > $10,000 requires PM then Admin approval.
- Parallel approval: optionally require approval from multiple roles at the same step (e.g., PM AND Superintendent for field change orders).
- Escalation: if an approver does not act within N days (configurable), escalate to the next level.
- Workflow UI: visual flowchart builder showing steps, thresholds, and routing. Drag-and-drop step reordering.
- Active workflow tracking: each in-flight approval shows its current step, who needs to act, and time elapsed.

### GAP-789: Custom Field Management

**What it does:** Allows admins to create custom fields on any entity type (projects, vendors, invoices, tasks, etc.). Custom fields support multiple data types and appear in list views, detail views, filters, and reports alongside system fields.

**Where it appears:**
- Module 02 -- Configuration Engine (`/settings/custom-fields`).
- All entity detail views -- custom fields section.
- All list views -- custom fields available as columns (GAP-638).
- Module 39 -- Advanced Reporting -- custom fields available as report dimensions.

**Implementation notes:**
- Store definitions in `custom_field_definitions` table: `id`, `company_id`, `entity_type`, `field_name`, `field_label`, `field_type` (text, number, currency, date, boolean, select, multi_select, url, email, phone, user_reference), `options` (JSONB: for select/multi_select types), `is_required`, `default_value`, `sort_order`, `is_active`, `created_at`.
- Store values in `custom_field_values` table: `id`, `entity_type`, `entity_id`, `field_definition_id`, `value` (JSONB to handle all types).
- Supported field types: text (single line), text area (multi-line), number, currency, date, boolean (yes/no), single select (dropdown), multi-select (tags), URL, email, phone, user reference (picker).
- Custom fields appear in a "Custom Fields" section on detail views, after system fields.
- Custom fields are available as filterable/sortable columns in list views.
- Maximum 30 custom fields per entity type per company.
- Field validation: required fields enforced on save. Type-specific validation (e.g., email format for email fields).
- Deleting a custom field archives it (soft delete). Historical data remains queryable in reports.

### GAP-791: Data Import/Export Tools

**What it does:** Provides comprehensive tools for importing data from external systems (CSV, Excel, QuickBooks, Buildertrend, CoConstruct) and exporting all company data. Includes field mapping, validation, duplicate detection, and rollback capability.

**Where it appears:**
- Module 41 -- Onboarding Wizard -- initial data import.
- Module 42 -- Data Migration -- platform migration tools.
- Module 02 -- Configuration Engine (`/settings/data`) -- ongoing import/export.

**Implementation notes:**
- Import wizard steps: (1) Select source (file upload or system connection), (2) Select entity type, (3) Map source columns to system fields (with AI-suggested mappings), (4) Validation preview showing errors and warnings, (5) Duplicate detection showing potential matches with merge/skip/create options, (6) Execute import with progress indicator, (7) Summary report with success/failure counts.
- Export: full company data export in JSON or CSV format. Available per entity type or as a complete data dump.
- Supported import sources: CSV, XLSX, QuickBooks Desktop (IIF), QuickBooks Online (API), Buildertrend (CSV export), CoConstruct (CSV export).
- Rollback: each import creates a batch record. An import can be rolled back within 24 hours, deleting all records created in that batch.
- Rate limit: one import operation at a time per company. Queue additional imports.
- Data export includes all entity data, custom field values, document metadata (not file blobs), and relationships.

### GAP-792: API Key Management

**What it does:** Allows admins to create, rotate, and revoke API keys for third-party integrations. Each API key has a name, scope (which modules/actions it can access), expiration date, and usage tracking.

**Where it appears:**
- Module 45 -- API & Marketplace (`/settings/api-keys`).
- Module 02 -- Configuration Engine -- integration settings.

**Implementation notes:**
- Store in `api_keys` table: `id`, `company_id`, `name`, `key_hash` (bcrypt hash of the key; raw key shown only at creation), `scopes` (JSONB array of permitted `{module}.{action}` pairs), `created_by`, `expires_at`, `last_used_at`, `request_count`, `rate_limit` (requests per minute), `is_active`, `created_at`.
- Key creation: generate a secure random key (256-bit). Display to the user once. Store only the hash. User must copy the key immediately.
- Scopes: fine-grained access control. Examples: `projects.read`, `invoices.create`, `vendors.read_write`.
- Usage dashboard: table of API keys showing name, last used, total requests, status. Click for detailed usage logs.
- Rate limiting: per-key rate limit (default: 60 requests/minute). Configurable per key.
- Rotation: "Rotate Key" generates a new key and deactivates the old one after a grace period (configurable: 0-72 hours).
- Revocation: immediate deactivation with confirmation dialog.
- Maximum 10 API keys per company.
- Webhook configuration: optionally configure webhook URLs per API key to receive event notifications.

### GAP-793: Audit Log Viewer

**What it does:** Provides a searchable, filterable view of all system actions across the company. Shows who did what, when, on which entity. Supports filtering by user, action type, entity type, date range, and specific entity.

**Where it appears:**
- Module 01 -- Auth & Access Control (`/settings/audit-log`).
- Module 02 -- Configuration Engine -- admin tools.
- Module 39 -- Advanced Reporting -- audit analysis reports.

**Implementation notes:**
- Reads from the platform `audit_log` table (same table used by GAP-672 per-line audit trail).
- List view columns: Timestamp, User, Action, Entity Type, Entity Name, Field Changed, Old Value, New Value, IP Address.
- Filters: user picker, action type (create, update, delete, login, logout, approve, reject, export, import), entity type, date range, text search across all fields.
- Detail view: click any row to see the full audit entry with all field changes for that action.
- Export: CSV and PDF export of filtered results.
- Retention: all audit data retained. No automatic purge. Option to archive audit data older than N years to cold storage.
- Performance: audit log can grow to millions of rows. Use date-range partitioning and indexes on `(company_id, timestamp)`, `(company_id, entity_type, entity_id)`, and `(company_id, user_id)`.
- Access control: only `owner` and `admin` roles can view the full audit log. PMs can view audit entries for their assigned projects only.

---

## Cross-Cutting Implementation Notes

### Reusable Component Library

Many features defined above share common UI components. The following components are platform-level reusable primitives:

| Component | Used By |
|-----------|---------|
| `FilterPresetBar` | GAP-635, GAP-636 |
| `BulkActionBar` | GAP-637, GAP-691, GAP-698, GAP-765 |
| `ColumnConfigurator` | GAP-638, GAP-639 |
| `ViewToggle` (List/Kanban/Map) | GAP-641, GAP-676 |
| `InlineEditor` | GAP-642 (extends existing CRUD pattern) |
| `FavoriteToggle` | GAP-644, GAP-766 |
| `AuditTrailPanel` | GAP-672, GAP-793 |
| `ExportMenu` | GAP-628, GAP-667, GAP-686, GAP-707, GAP-734, GAP-752 |
| `RichTextNotes` | GAP-651, GAP-663 |
| `TimelineVisualizer` | GAP-653, GAP-666, GAP-681, GAP-733 |
| `ComparisonTable` | GAP-668, GAP-726, GAP-776 |
| `ScenarioModeler` | GAP-669 |
| `ProgressUploader` | GAP-756 |
| `AnnotationCanvas` | GAP-761 |
| `WorkflowBuilder` | GAP-785 |
| `CustomFieldRenderer` | GAP-789 |
| `ImportWizard` | GAP-667 (import), GAP-791 |

### Permission Gates

Every feature checks permissions before rendering or executing:

- **UI level:** Components check the user's role and permissions to determine visibility. Unauthorized features are hidden, not disabled.
- **API level:** Server middleware validates permissions before processing any request. Returns 403 for unauthorized actions.
- **Data level:** RLS policies ensure multi-tenant isolation. Users only see data for their company and authorized projects.

### Multi-Tenant Isolation

All features defined in this document operate within the multi-tenant model:

- Every database table includes `company_id`.
- Every query filters by `company_id`.
- User preferences, filter presets, templates, and custom fields are scoped to the company.
- Personal items (favorites, recent docs, column layouts) are scoped to the individual user within their company.
- API keys and audit logs are scoped to the company.

### Mobile Responsiveness

All features must degrade gracefully on mobile viewports (Module 40):

- List views collapse to card view on mobile.
- Kanban boards become swipeable single-column views.
- Map view uses the full viewport on mobile.
- Bulk actions use a bottom sheet instead of an inline bar.
- Annotation tools use touch-optimized controls.
- Export/print actions use the native share sheet on mobile.

---

## Summary Table

| GAP ID | Feature | Primary Category | Primary Module(s) |
|--------|---------|-----------------|-------------------|
| GAP-627 | Refresh / Auto-Refresh | Dashboard | 04 |
| GAP-628 | Export Dashboard as PDF | Dashboard | 04, 19, 39 |
| GAP-635 | Saveable Filter Presets | List View | All list views |
| GAP-636 | Shareable Filter Presets | List View | All list views |
| GAP-637 | Bulk Actions | List View | 03, 07, 10, 11, 18, 21, 27, 28 |
| GAP-638 | Customizable Columns | List View | All list views |
| GAP-639 | Column Resize and Reorder | List View | All list views |
| GAP-641 | Map View | List View | 03, 10, 35, 36 |
| GAP-642 | Quick Inline Editing | List View | 03, 07, 11, 21, 27, 28 |
| GAP-644 | Favorite/Pin Items | List View | 03, 04, 10, 36 |
| GAP-676 | Kanban Board Toggle | List View | 03, 07, 11, 27, 28, 36 |
| GAP-691 | Bulk Schedule Operations | List View | 07, 25 |
| GAP-651 | Project Notes / Journal | Detail View | 03, 10, 36 |
| GAP-653 | Key Milestone Tracker | Detail View | 03, 04, 12, 29 |
| GAP-654 | Project Risk Register | Detail View | 03, 04, 39 |
| GAP-663 | Budget Line Item Notes | Detail View | 09, 17, 19 |
| GAP-666 | Budget History | Detail View | 09, 19, 39 |
| GAP-667 | Import/Export to Excel | Detail View | 07, 09, 10, 03, 20 |
| GAP-668 | Compare to Similar Projects | Detail View | 04, 09, 07, 39 |
| GAP-669 | Forecast Scenarios | Detail View | 09, 19, 39 |
| GAP-672 | Audit Trail Per Line | Detail View | All editable entities |
| GAP-680 | Resource Leveling | Detail View | 07, 25, 34 |
| GAP-681 | Baseline Comparison | Detail View | 07, 25, 39 |
| GAP-688 | Vendor Schedule View | Detail View | 07, 10, 30 |
| GAP-689 | Client-Friendly Schedule | Detail View | 07, 12, 29 |
| GAP-690 | Schedule Conflict Detection | Detail View | 07, 25 |
| GAP-726 | Comparison Mode (Selections) | Detail View | 21, 29 |
| GAP-733 | Selection History | Detail View | 21, 39 |
| GAP-745 | Carry Forward Daily Log | Detail View | 08 |
| GAP-698 | Batch Approval | Invoice/Payment | 11, 15, 17, 18 |
| GAP-699 | Invoice History Per Vendor | Invoice/Payment | 10, 11, 22 |
| GAP-705 | Aging Report | Invoice/Payment | 04, 11, 19, 39 |
| GAP-706 | Payment Run Generation | Invoice/Payment | 11, 16, 19 |
| GAP-707 | Export to Accounting System | Invoice/Payment | 09, 11, 16, 19 |
| GAP-719 | Vendor Document Repository | Vendor | 06, 10, 30 |
| GAP-721 | Related Vendors | Vendor | 10, 22, 26 |
| GAP-723 | Vendor Quick Actions | Vendor | 04, 10 |
| GAP-734 | Print/Export Selection Summary | Selection | 20, 21, 29 |
| GAP-752 | Export Daily Log as PDF | Daily Log | 08, 39 |
| GAP-753 | Notification Confirmation | Daily Log | 05, 08 |
| GAP-756 | Bulk Upload with Progress | Document | 06, 08, 10, 28 |
| GAP-761 | Annotation/Markup Tools | Document | 06, 27, 28, 29 |
| GAP-764 | Download with Watermark | Document | 06, 29, 30 |
| GAP-765 | Batch Document Operations | Document | 06, 10, 29, 30 |
| GAP-766 | Recent Docs and Favorites | Document | 04, 06 |
| GAP-768 | E-Signature Integration | Document | 06, 14, 17, 38 |
| GAP-776 | Comparative Reporting | Report | 04, 19, 39 |
| GAP-777 | Report Templates | Report | 04, 19, 39 |
| GAP-780 | Report Archiving | Report | 04, 15, 19, 39 |
| GAP-686 | Print/Export Schedule | Print/Export | 07, 25, 29, 30 |
| GAP-783 | Role/Permission Config | Admin | 01, 02 |
| GAP-785 | Workflow Configuration | Admin | 02, 11, 15, 17, 18 |
| GAP-789 | Custom Field Management | Admin | 02, 39, All entities |
| GAP-791 | Data Import/Export Tools | Admin | 02, 41, 42 |
| GAP-792 | API Key Management | Admin | 02, 45 |
| GAP-793 | Audit Log Viewer | Admin | 01, 02, 39 |
