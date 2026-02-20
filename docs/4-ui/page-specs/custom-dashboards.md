# View Plan: Custom Dashboards

## Views Covered
1. Dashboard Builder
2. Widget Library
3. Saved Dashboards

---

## Purpose
Customizable dashboards for different roles:
- Owner: Company-wide financials
- PM: Project status overview
- Accountant: AR/AP summary
- Field: Daily assignments

---

## 1. Dashboard Builder
URL: /dashboards/builder

Features:
- Drag-drop widget placement
- Resize widgets
- Configure widget data source
- Set refresh intervals
- Save as template

Grid System:
- 12-column responsive grid
- Widgets snap to grid
- Mobile-friendly reflow

---

## 2. Widget Library

Financial Widgets:
- Revenue chart (bar/line)
- Cash flow status
- AR aging summary
- AP aging summary
- Profit margin gauge
- Budget vs actual

Project Widgets:
- Active jobs list
- Schedule timeline
- Photo carousel
- Daily log feed
- Task list
- Milestone tracker

Operations Widgets:
- Invoice queue
- Approval queue
- RFI summary
- Submittal tracker
- Weather forecast
- Team calendar

AI Widgets:
- Predictive cash flow
- Risk alerts
- Recommendations
- Anomaly highlights

---

## 3. Saved Dashboards
URL: /dashboards

Features:
- Personal dashboards
- Shared dashboards
- Role-based defaults
- Pin favorites
- Quick switch

---

## Widget Configuration

Each widget supports:
- Data filters (job, date range)
- Display options (chart type)
- Refresh interval
- Click-through actions
- Conditional formatting

---

## Database Schema

dashboards:
- id UUID
- company_id UUID
- user_id UUID (null = shared)
- name TEXT
- description TEXT
- layout JSONB
- is_default BOOLEAN
- role_default TEXT
- created_at TIMESTAMPTZ

dashboard_widgets:
- id UUID
- dashboard_id UUID
- widget_type TEXT
- position JSONB (x, y, w, h)
- config JSONB
- order_index INTEGER

---

## Real-time Updates
- Supabase subscriptions for live data
- Configurable refresh intervals
- Visual update indicators

---

## Gap Items Addressed

### Section 45 — Per-Page Feature Requirements (Dashboard Page)
- **#621** Configurable widget layout — each user arranges their own dashboard
- **#622** Widget library — choose from available widgets (budget summary, schedule status, alerts, weather, photos, etc.)
- **#623** Filtering across all widgets — select a project to filter everything, or see company-wide
- **#624** Drill-down from any number — click a dollar amount to see underlying transactions
- **#625** Date range selector — this week, this month, this quarter, custom range
- **#626** Comparison toggle — this period vs last period, this year vs last year
- **#627** Refresh button / auto-refresh interval
- **#628** Export dashboard as PDF for reporting
- **#629** "Needs attention" priority queue with dismiss/snooze
- **#630** Quick action buttons — create daily log, create RFI, approve invoice without navigating away
- **#631** Activity feed — recent actions across all projects by your team
- **#632** KPI sparklines — trending indicators for key metrics

### Section 25 — Reporting & Dashboards
- **#438** Financial dashboard KPIs configurable per builder
- **#449** Report/dashboard templates customizable per builder
- **#458** Cross-module data in dashboards (budget + schedule + photo data in one view)

### Section 34 — Search, Navigation & UX
- **#521** UI scales from 1-person builder to 50-person builder
- **#522** Progressive disclosure (simple by default, power features available)
- **#528** Personalized "My Day" views (what I need to do today across all projects)
- **#534** Data density preferences (compact view for power users, comfortable for occasional)

---

## Additional Requirements from Gap Analysis

### Widget Drill-Down (#624)
1. **Clickable metrics**: Every number/metric in a widget should be clickable, navigating to the detail view (e.g., click "$150,000 Invoices Pending" to see the invoice list filtered to pending)
2. **In-widget drill-down**: Some widgets should support expanding to show detail without navigating away
3. **Breadcrumb trail**: When drilling down, maintain context so user can navigate back easily

### Global Filtering (#623)
1. **Project filter**: Dropdown at top of dashboard that filters ALL widgets to a specific project or "All Projects"
2. **Date range filter** (#625): Global date range selector that applies to all time-based widgets
3. **Comparison mode** (#626): Toggle to show comparison data (this period vs last period) across all applicable widgets
4. **Filter persistence**: Remember user's last filter selections between sessions

### Priority Queue (#629)
1. **"Needs Attention" widget**: Consolidated queue of items requiring user action across all projects — overdue invoices, pending approvals, expiring insurance, selections due, etc.
2. **Dismiss/snooze**: User can dismiss items (hide permanently) or snooze (hide for configurable time period)
3. **Priority ranking**: Items sorted by urgency (overdue at top, upcoming next)
4. **Role-based filtering**: Queue shows only items relevant to user's role

### Quick Actions (#630)
1. **Action buttons**: Prominent buttons for most common actions without leaving dashboard — Create Daily Log, Upload Invoice, Create RFI, Approve next pending item
2. **Inline approval**: Approve invoices/draws directly from dashboard widget with one-click approval and optional comment
3. **Context-aware**: Quick actions adapt based on user role (PM sees "Create Daily Log", Accountant sees "Process Payment")

### KPI Sparklines (#632)
1. **Trending indicators**: Small inline charts (sparklines) next to key metrics showing trend over last 30/60/90 days
2. **Direction indicators**: Up/down arrows with color coding (green for improvement, red for deterioration)
3. **Configurable KPIs**: Builder chooses which KPIs appear on their dashboard (gross margin %, average days to pay, schedule adherence %, etc.)

### Dashboard Export (#628)
1. **PDF export**: Generate a PDF snapshot of current dashboard state with all visible widgets
2. **Scheduled export**: Auto-generate and email dashboard PDF on a schedule (weekly, monthly)
3. **Branded export**: Include builder's logo and branding on exported dashboard

### "My Day" View (#528)
1. **Personalized daily view**: Widget or dashboard mode showing: tasks due today, meetings/events, items needing my approval, my projects' status, recent messages to me
2. **Cross-project view**: Aggregate items across all assigned projects
3. **Today's schedule**: Calendar-like view of today's commitments

### Dashboard Sharing
1. **Shared dashboards**: Builder can create dashboards shared with entire team or specific roles
2. **Role-based defaults**: Pre-configured default dashboards per role (Owner Dashboard, PM Dashboard, Accountant Dashboard)
3. **Dashboard templates**: Save dashboard layouts as templates that new users can start from

### Progressive Disclosure (#522)
1. **Simple mode**: Default dashboard with essential widgets only (active jobs, pending items, recent activity)
2. **Advanced mode**: Full widget library with detailed financial, schedule, and operational widgets
3. **Onboarding**: First-time users see guided setup suggesting widgets relevant to their role

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 25, 34, and 45 |
| Initial | Created from batch planning |
