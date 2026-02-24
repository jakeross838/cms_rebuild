/**
 * Module 08: Daily Logs & Field Operations Types
 */

export type DailyLogStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export type DailyLogEntryType =
  | 'note'
  | 'work_performed'
  | 'material_delivery'
  | 'visitor'
  | 'delay'
  | 'safety_incident'
  | 'inspection'

export interface DailyLog {
  id: string
  company_id: string
  job_id: string
  log_date: string
  status: DailyLogStatus
  weather_summary: string | null
  high_temp: number | null
  low_temp: number | null
  conditions: string | null
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DailyLogEntry {
  id: string
  daily_log_id: string
  entry_type: DailyLogEntryType
  description: string
  time_logged: string | null
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface DailyLogLabor {
  id: string
  daily_log_id: string
  company_id: string
  worker_name: string
  trade: string | null
  hours_worked: number
  overtime_hours: number
  headcount: number
  created_at: string
}

export interface DailyLogPhoto {
  id: string
  daily_log_id: string
  storage_path: string
  caption: string | null
  taken_at: string | null
  location_description: string | null
  created_by: string
  created_at: string
}

/** All possible daily log statuses */
export const LOG_STATUSES: { value: DailyLogStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

/** All possible daily log entry types */
export const ENTRY_TYPES: { value: DailyLogEntryType; label: string }[] = [
  { value: 'note', label: 'Note' },
  { value: 'work_performed', label: 'Work Performed' },
  { value: 'material_delivery', label: 'Material Delivery' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'delay', label: 'Delay' },
  { value: 'safety_incident', label: 'Safety Incident' },
  { value: 'inspection', label: 'Inspection' },
]
