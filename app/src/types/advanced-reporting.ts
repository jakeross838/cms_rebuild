/**
 * Module 39: Advanced Reporting & Custom Report Builder Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type WidgetType =
  | 'table'
  | 'bar_chart'
  | 'line_chart'
  | 'pie_chart'
  | 'kpi_card'
  | 'gauge'
  | 'map'
  | 'timeline'
  | 'heatmap'

export type DataSourceType =
  | 'jobs'
  | 'budgets'
  | 'invoices'
  | 'change_orders'
  | 'purchase_orders'
  | 'schedules'
  | 'daily_logs'
  | 'punch_items'
  | 'rfis'
  | 'custom_query'

export type ReportStatus = 'draft' | 'published' | 'archived'

export type CustomReportType = 'standard' | 'custom'

export type DashboardLayout = 'single_column' | 'two_column' | 'three_column' | 'grid'

export type RefreshFrequency = 'manual' | 'hourly' | 'daily' | 'weekly'

export type ReportAudience = 'internal' | 'client' | 'bank' | 'investor'

export type FilterContext =
  | 'reports'
  | 'dashboards'
  | 'jobs'
  | 'budgets'
  | 'invoices'
  | 'change_orders'
  | 'purchase_orders'
  | 'schedules'
  | 'daily_logs'
  | 'punch_items'
  | 'rfis'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface CustomReport {
  id: string
  company_id: string
  name: string
  description: string | null
  report_type: CustomReportType
  data_sources: unknown[]
  fields: unknown[]
  filters: Record<string, unknown>
  grouping: unknown[]
  sorting: unknown[]
  calculated_fields: unknown[]
  visualization_type: WidgetType
  audience: ReportAudience
  status: ReportStatus
  refresh_frequency: RefreshFrequency
  is_template: boolean
  shared_with: unknown[]
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CustomReportWidget {
  id: string
  report_id: string
  company_id: string
  title: string | null
  widget_type: WidgetType
  data_source: DataSourceType
  configuration: Record<string, unknown>
  filters: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ReportDashboard {
  id: string
  company_id: string
  name: string
  description: string | null
  layout: DashboardLayout
  is_default: boolean
  is_admin_pushed: boolean
  target_roles: unknown[]
  global_filters: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DashboardWidget {
  id: string
  dashboard_id: string
  company_id: string
  title: string | null
  widget_type: WidgetType
  data_source: DataSourceType
  report_id: string | null
  position_x: number
  position_y: number
  width: number
  height: number
  configuration: Record<string, unknown>
  refresh_interval_seconds: number
  created_at: string
  updated_at: string
}

export interface SavedFilter {
  id: string
  company_id: string
  name: string
  description: string | null
  context: FilterContext
  filter_config: Record<string, unknown>
  is_global: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const WIDGET_TYPES: { value: WidgetType; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'bar_chart', label: 'Bar Chart' },
  { value: 'line_chart', label: 'Line Chart' },
  { value: 'pie_chart', label: 'Pie Chart' },
  { value: 'kpi_card', label: 'KPI Card' },
  { value: 'gauge', label: 'Gauge' },
  { value: 'map', label: 'Map' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'heatmap', label: 'Heatmap' },
]

export const DATA_SOURCE_TYPES: { value: DataSourceType; label: string }[] = [
  { value: 'jobs', label: 'Jobs' },
  { value: 'budgets', label: 'Budgets' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'change_orders', label: 'Change Orders' },
  { value: 'purchase_orders', label: 'Purchase Orders' },
  { value: 'schedules', label: 'Schedules' },
  { value: 'daily_logs', label: 'Daily Logs' },
  { value: 'punch_items', label: 'Punch Items' },
  { value: 'rfis', label: 'RFIs' },
  { value: 'custom_query', label: 'Custom Query' },
]

export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export const CUSTOM_REPORT_TYPES: { value: CustomReportType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
]

export const DASHBOARD_LAYOUTS: { value: DashboardLayout; label: string }[] = [
  { value: 'single_column', label: 'Single Column' },
  { value: 'two_column', label: 'Two Column' },
  { value: 'three_column', label: 'Three Column' },
  { value: 'grid', label: 'Grid' },
]

export const REFRESH_FREQUENCIES: { value: RefreshFrequency; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

export const REPORT_AUDIENCES: { value: ReportAudience; label: string }[] = [
  { value: 'internal', label: 'Internal' },
  { value: 'client', label: 'Client' },
  { value: 'bank', label: 'Bank' },
  { value: 'investor', label: 'Investor' },
]

export const FILTER_CONTEXTS: { value: FilterContext; label: string }[] = [
  { value: 'reports', label: 'Reports' },
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'budgets', label: 'Budgets' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'change_orders', label: 'Change Orders' },
  { value: 'purchase_orders', label: 'Purchase Orders' },
  { value: 'schedules', label: 'Schedules' },
  { value: 'daily_logs', label: 'Daily Logs' },
  { value: 'punch_items', label: 'Punch Items' },
  { value: 'rfis', label: 'RFIs' },
]
