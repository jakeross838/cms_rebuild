# Module 39: Advanced Reporting & Custom Report Builder

**Phase:** 5 - Full Platform
**Status:** TODO
**Optional Module:** No -- core module (standard reports for all, advanced builder for pro/enterprise)

---

## Overview

Comprehensive reporting engine with two tiers: standard pre-built reports available to all
builders, and a custom report builder for pro/enterprise subscribers who need ad-hoc
reporting. Covers custom report creation with a drag-and-drop builder, scheduled delivery
via email, configurable dashboards, export to PDF/Excel/CSV, AI-generated narrative
summaries, cross-project benchmarking, and client-facing report variants.

The reporting engine is the intelligence layer that transforms raw project data into
actionable insights. Every module in the platform feeds data into the reporting engine,
and the reporting engine delivers it in the format each stakeholder needs: the builder
owner wants financial summaries, the PM wants schedule and budget variance, the client
wants progress photos and budget status, and the bank wants AIA G702/G703 format.

---

## Gap Items Addressed

| Gap # | Description | Resolution |
|-------|-------------|------------|
| 449 | Report templates customizable per builder | Builder-managed report template library with custom layouts and branding |
| 450 | Report builder for non-technical users (drag-and-drop) | Visual report builder: select data sources, filters, grouping, and visualization -- no code required |
| 451 | Report branding (builder's logo, colors, layout) | Per-builder branding configuration applied to all generated reports |
| 452 | Report scheduling and auto-distribution | Cron-based scheduler: send reports on configurable schedules to configurable recipients |
| 453 | Report access control (owner-only, team, client) | Role-based report visibility with per-report permission overrides |
| 454 | Report export formats (PDF, Excel, CSV, Word) | Multi-format export engine: PDF (branded), Excel (data), CSV (raw), and Word (narrative) |
| 455 | Comparative reports across projects (benchmarking) | Cross-project analytics with category-based comparison and trend analysis |
| 456 | AI-generated narrative reports | LLM integration for narrative generation from structured data (summary, variance explanation, recommendations) |
| 457 | Client-facing vs. internal reports (same data, different presentation) | Report audience selector: internal (full detail) vs. client (curated detail) vs. bank (AIA format) |
| 458 | Report data from multiple modules (budget + schedule + photos = comprehensive report) | Cross-module data joins: any report can pull from any module's data |

---

## Detailed Requirements

### Standard Report Library
Pre-built reports available to all builders (not customizable beyond filters):
- **Financial:** Budget vs. Actual, Cost-to-Complete Projection, Profit Margin by Project, Cash Flow Forecast, Vendor Payment Summary, Retainage Report
- **Schedule:** Schedule Variance, Milestone Status, Task Completion Rate, Weather Day Impact, Critical Path Analysis
- **Operations:** Daily Log Summary, RFI Status, Change Order Log, Punch List Progress, Selection Status
- **Client-Facing:** Owner Budget Report, Progress Photo Report, Monthly Project Update, Draw Request (AIA G702/G703)
- **Company-Wide:** Project Pipeline Summary, Resource Utilization, Vendor Scorecard, Safety Dashboard, Revenue Forecast
- Each standard report has configurable filters (date range, project, phase, vendor, etc.)

### Custom Report Builder
- Visual interface: select data sources from available modules
- Available data entities: projects, budgets, invoices, change orders, schedules, daily logs, vendors, employees, leads, safety records
- Drag-and-drop field selection: choose columns/measures to include
- Grouping and subtotaling: group by project, vendor, phase, cost code, time period
- Filtering: include/exclude by any field value, date range, status
- Calculated fields: user-defined formulas (e.g., margin = revenue - cost, variance = budget - actual)
- Sorting: multi-level sort on any field
- Visualization options: table, bar chart, line chart, pie chart, area chart, KPI card
- Saved report templates: save configuration for reuse
- Report sharing: share with team members by role or by name

### Configurable Dashboards
- Dashboard builder: arrange report widgets on a grid layout
- Widget types: chart, KPI number, table, activity feed, photo carousel, calendar
- Per-user dashboards: each user customizes their own default dashboard
- Builder-admin dashboards: admin creates dashboards pushed to roles
- Dashboard filters: global filter (select project) applies to all widgets
- Auto-refresh: configurable refresh interval per widget
- Drill-down: click any number to see underlying data
- Mobile-responsive dashboard layout

### Scheduled Report Delivery
- Schedule configuration: daily, weekly, biweekly, monthly, quarterly
- Delivery day and time selection (e.g., every Monday at 7:00 AM)
- Recipient list per schedule: internal users, client emails, external stakeholders
- Format selection per schedule: PDF, Excel, or both
- Conditional delivery: only send if data meets criteria (e.g., "send budget alert only if variance > 5%")
- Delivery log: track what was sent, when, to whom, and whether it was opened
- Pause/resume schedules

### Export Engine
- **PDF:** Branded with builder logo, colors, and layout. Page-oriented with headers/footers, page numbers, date stamp.
- **Excel:** Formatted workbook with data in tables, formulas intact for calculated fields, multiple sheets for grouped data.
- **CSV:** Raw data export for external analysis or import into other tools.
- **Word/DOCX:** Narrative report format for client-facing documents.
- Batch export: export multiple reports as a ZIP file
- Export history: log of all exports for audit purposes

### AI-Generated Narratives
- LLM-powered narrative generation from structured report data
- Use cases:
  - Monthly project summary: "Project is 45% complete and tracking 3% over budget. Framing is ahead of schedule by 2 weeks. Primary budget concern is electrical, currently at 110% of budget due to panel upgrade change order."
  - Company executive summary: "3 of 5 active projects are on track. Horizon project is behind schedule due to weather delays. Revenue YTD is $2.1M against $2.3M target."
  - Client update: "Your home is progressing well. This month the framing was completed and the roof is underway. Next month we expect to begin rough-in for plumbing, electrical, and HVAC."
- Builder-configurable tone: professional, friendly, technical
- Human review step: AI generates draft, builder reviews and edits before sending
- AI confidence indicator: flags areas where data is incomplete or contradictory

### Client-Facing Reports
- Audience selector on every report: Internal / Client / Bank / Investor
- Client reports show curated information: no internal costs, no margin data, no internal notes
- Client report branding: builder's logo and professional formatting
- Client portal integration: reports available in client's portal automatically
- Bank/lender reports: AIA G702/G703 format, draw request documentation
- Investor reports: project performance with financial returns (for builder-developers)

### Cross-Project Benchmarking
- Compare metrics across projects: cost per SF, duration per SF, change order frequency, margin %
- Benchmarking by project type, size range, and time period
- Trend analysis: are costs going up? Is efficiency improving?
- Platform-wide anonymous benchmarking (with opt-in): compare your metrics to industry averages
- Outlier detection: flag projects that deviate significantly from builder's historical averages

---

## Database Tables

```
report_templates
  id, builder_id, name, description, report_type (standard|custom),
  data_sources, fields, filters, grouping, sorting, calculated_fields,
  visualization_type, audience (internal|client|bank|investor),
  is_platform_provided, is_active, created_by, created_at, updated_at

report_branding
  id, builder_id, logo_url, primary_color, secondary_color,
  font_family, header_text, footer_text, page_layout

report_schedules
  id, report_template_id, builder_id, frequency,
  day_of_week, day_of_month, time_of_day, timezone,
  recipients, format, conditional_rules,
  is_active, last_run_at, next_run_at, created_at

report_deliveries
  id, schedule_id, report_template_id, delivered_at,
  recipients, format, file_url, status, error_message

report_exports
  id, builder_id, report_template_id, exported_by,
  format, file_url, filters_applied, exported_at

dashboards
  id, builder_id, user_id, name, is_default,
  layout, is_admin_pushed, target_roles, created_at, updated_at

dashboard_widgets
  id, dashboard_id, widget_type, report_template_id,
  position_x, position_y, width, height,
  configuration, refresh_interval_seconds

ai_narrative_requests
  id, builder_id, report_template_id, context_data,
  generated_text, tone, confidence_score,
  reviewed_by, approved, created_at

benchmark_data
  id, builder_id, project_id, metric_type, metric_value,
  project_type, project_size_sf, region, period, created_at
```

---

## API Endpoints

```
GET    /api/v2/reports/templates                   # List report templates (standard + custom)
POST   /api/v2/reports/templates                   # Create custom report template
GET    /api/v2/reports/templates/:id               # Template configuration
PATCH  /api/v2/reports/templates/:id               # Update template
DELETE /api/v2/reports/templates/:id               # Delete custom template

POST   /api/v2/reports/generate                    # Generate report from template with filters
GET    /api/v2/reports/generate/:id/status         # Check async generation status
GET    /api/v2/reports/generate/:id/download       # Download generated report

POST   /api/v2/reports/export                      # Export report in specified format
GET    /api/v2/reports/export/history              # Export history

GET    /api/v2/reports/schedules                   # List schedules
POST   /api/v2/reports/schedules                   # Create schedule
PATCH  /api/v2/reports/schedules/:id               # Update schedule
DELETE /api/v2/reports/schedules/:id               # Delete schedule
GET    /api/v2/reports/schedules/:id/deliveries    # Delivery log for schedule

GET    /api/v2/dashboards                         # List user's dashboards
POST   /api/v2/dashboards                         # Create dashboard
PATCH  /api/v2/dashboards/:id                     # Update dashboard layout
GET    /api/v2/dashboards/:id/widgets             # Widget data for dashboard
POST   /api/v2/dashboards/:id/widgets             # Add widget
PATCH  /api/v2/dashboards/:id/widgets/:wid        # Update widget config
DELETE /api/v2/dashboards/:id/widgets/:wid        # Remove widget

POST   /api/v2/reports/ai-narrative                # Generate AI narrative for report data
GET    /api/v2/reports/benchmark                   # Cross-project benchmark data
GET    /api/v2/reports/benchmark/industry          # Platform-wide anonymous benchmarks (opt-in)
```

---

## Dependencies

| Module | Relationship |
|--------|-------------|
| Module 3: Core Data Model | All project data feeds reports |
| Module 19: Financial Reporting | Financial data as primary report data source |
| Module 7: Scheduling | Schedule data for timeline and milestone reports |
| Module 8: Daily Logs | Daily log data for operations reports |
| Module 1: Auth & Access | Report permissions and audience filtering |
| Module 5: Notification Engine | Scheduled report delivery via email |
| Module 29: Full Client Portal | Client-facing reports published to portal |
| External: LLM API | AI narrative generation (OpenAI, Anthropic, etc.) |

---

## Open Questions

1. Should the custom report builder be a separate UI or integrated into the existing reports page?
2. How complex can calculated fields be? Simple arithmetic only, or full formula language?
3. Should AI narratives use the platform's own LLM integration, or delegate to a third-party AI writing service?
4. How do we handle report data freshness? Real-time queries, or periodic data warehouse refresh?
5. Should platform-wide benchmarking be opt-in per builder, or opt-in per metric?
6. What is the maximum report size before we need async generation with download link?
7. Should dashboards support embedding third-party widgets (Looker, Metabase)?
