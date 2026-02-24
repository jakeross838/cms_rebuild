/**
 * Module 19: Financial Reporting Types
 */

// ── Type Unions ──────────────────────────────────────────────────────────

export type ReportType =
  | 'profit_loss'
  | 'balance_sheet'
  | 'cash_flow'
  | 'wip'
  | 'job_cost'
  | 'ar_aging'
  | 'ap_aging'
  | 'budget_vs_actual'
  | 'retainage'
  | 'custom'

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export type PeriodStatus = 'open' | 'closed' | 'locked'

// ── Interfaces ───────────────────────────────────────────────────────────

export interface ReportDefinition {
  id: string
  company_id: string
  name: string
  report_type: ReportType
  description: string | null
  config: Record<string, unknown>
  is_system: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ReportSnapshot {
  id: string
  company_id: string
  report_definition_id: string
  period_start: string
  period_end: string
  snapshot_data: Record<string, unknown>
  generated_by: string | null
  generated_at: string
  created_at: string
}

export interface ReportSchedule {
  id: string
  company_id: string
  report_definition_id: string
  frequency: ScheduleFrequency
  day_of_week: number | null
  day_of_month: number | null
  recipients: ReportRecipient[]
  is_active: boolean
  last_run_at: string | null
  next_run_at: string | null
  created_at: string
  updated_at: string
}

export interface ReportRecipient {
  email: string
  name: string
}

export interface FinancialPeriod {
  id: string
  company_id: string
  period_name: string
  period_start: string
  period_end: string
  status: PeriodStatus
  fiscal_year: number
  fiscal_quarter: number | null
  closed_by: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

// ── Constants ────────────────────────────────────────────────────────────

/** All supported report types with display labels */
export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'profit_loss', label: 'Profit & Loss' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'cash_flow', label: 'Cash Flow' },
  { value: 'wip', label: 'Work in Progress' },
  { value: 'job_cost', label: 'Job Cost' },
  { value: 'ar_aging', label: 'AR Aging' },
  { value: 'ap_aging', label: 'AP Aging' },
  { value: 'budget_vs_actual', label: 'Budget vs Actual' },
  { value: 'retainage', label: 'Retainage' },
  { value: 'custom', label: 'Custom' },
]

/** Schedule frequency options with display labels */
export const SCHEDULE_FREQUENCIES: { value: ScheduleFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

/** Financial period status options with display labels */
export const PERIOD_STATUSES: { value: PeriodStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'locked', label: 'Locked' },
]
