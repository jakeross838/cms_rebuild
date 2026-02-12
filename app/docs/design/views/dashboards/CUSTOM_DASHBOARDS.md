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
