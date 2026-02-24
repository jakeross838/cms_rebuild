/**
 * Module 51: Time Tracking & Labor Management Types
 */

// ── Status & Enum Unions ────────────────────────────────────────────────────

export type TimeEntryStatus = 'pending' | 'approved' | 'rejected' | 'exported'

export type RateType = 'regular' | 'overtime' | 'double_time'

export type PayrollPeriodStatus = 'open' | 'closed' | 'exported'

export type ExportFormat = 'csv' | 'quickbooks' | 'adp' | 'custom'

export type EntryMethod = 'mobile' | 'kiosk' | 'manual' | 'superintendent'

// ── GPS Data ────────────────────────────────────────────────────────────────

export interface GpsData {
  lat: number
  lng: number
  accuracy: number
}

// ── Time Entry ──────────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string
  company_id: string
  user_id: string
  job_id: string
  cost_code_id: string | null
  entry_date: string
  clock_in: string | null
  clock_out: string | null
  regular_hours: number
  overtime_hours: number
  double_time_hours: number
  break_minutes: number
  status: TimeEntryStatus
  notes: string | null
  gps_clock_in: GpsData | null
  gps_clock_out: GpsData | null
  entry_method: EntryMethod
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ── Time Entry Allocation ───────────────────────────────────────────────────

export interface TimeEntryAllocation {
  id: string
  time_entry_id: string
  company_id: string
  job_id: string
  cost_code_id: string | null
  hours: number
  notes: string | null
  created_at: string
}

// ── Labor Rate ──────────────────────────────────────────────────────────────

export interface LaborRate {
  id: string
  company_id: string
  user_id: string | null
  trade: string | null
  rate_type: RateType
  hourly_rate: number
  effective_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

// ── Payroll Period ──────────────────────────────────────────────────────────

export interface PayrollPeriod {
  id: string
  company_id: string
  period_start: string
  period_end: string
  status: PayrollPeriodStatus
  exported_at: string | null
  exported_by: string | null
  created_at: string
  updated_at: string
}

// ── Payroll Export ──────────────────────────────────────────────────────────

export interface PayrollExport {
  id: string
  company_id: string
  payroll_period_id: string | null
  export_format: ExportFormat
  file_path: string | null
  total_hours: number
  total_amount: number
  employee_count: number
  exported_by: string | null
  created_at: string
}

// ── Constants ───────────────────────────────────────────────────────────────

export const TIME_ENTRY_STATUSES: { value: TimeEntryStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'exported', label: 'Exported' },
]

export const RATE_TYPES: { value: RateType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'double_time', label: 'Double Time' },
]

export const PAYROLL_STATUSES: { value: PayrollPeriodStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'exported', label: 'Exported' },
]

export const EXPORT_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'adp', label: 'ADP' },
  { value: 'custom', label: 'Custom' },
]

export const ENTRY_METHODS: { value: EntryMethod; label: string }[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'kiosk', label: 'Kiosk' },
  { value: 'manual', label: 'Manual' },
  { value: 'superintendent', label: 'Superintendent' },
]

/** Maximum regular hours per day before OT kicks in (default) */
export const DEFAULT_DAILY_OT_THRESHOLD = 8

/** Maximum weekly hours before OT kicks in (default) */
export const DEFAULT_WEEKLY_OT_THRESHOLD = 40

/** Maximum daily hours before double-time kicks in (default) */
export const DEFAULT_DAILY_DT_THRESHOLD = 12
