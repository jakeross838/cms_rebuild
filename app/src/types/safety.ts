/**
 * Module 33: Safety & Compliance Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type IncidentSeverity =
  | 'near_miss'
  | 'minor'
  | 'moderate'
  | 'serious'
  | 'fatal'

export type IncidentStatus =
  | 'reported'
  | 'investigating'
  | 'resolved'
  | 'closed'

export type IncidentType =
  | 'fall'
  | 'struck_by'
  | 'caught_in'
  | 'electrical'
  | 'chemical'
  | 'heat'
  | 'vehicle'
  | 'other'

export type InspectionStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'failed'

export type InspectionResult =
  | 'pass'
  | 'fail'
  | 'conditional'

export type InspectionItemResult =
  | 'pass'
  | 'fail'
  | 'na'
  | 'not_inspected'

export type TalkStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface SafetyIncident {
  id: string
  company_id: string
  job_id: string
  incident_number: string
  title: string
  description: string | null
  incident_date: string
  incident_time: string | null
  location: string | null
  severity: IncidentSeverity
  status: IncidentStatus
  incident_type: IncidentType
  reported_by: string | null
  assigned_to: string | null
  injured_party: string | null
  injury_description: string | null
  witnesses: unknown[]
  root_cause: string | null
  corrective_actions: string | null
  preventive_actions: string | null
  osha_recordable: boolean
  osha_report_number: string | null
  lost_work_days: number
  restricted_days: number
  medical_treatment: boolean
  photos: unknown[]
  documents: unknown[]
  resolved_at: string | null
  resolved_by: string | null
  closed_at: string | null
  closed_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SafetyInspection {
  id: string
  company_id: string
  job_id: string
  inspection_number: string
  title: string
  description: string | null
  inspection_date: string
  inspection_type: string
  status: InspectionStatus
  result: InspectionResult | null
  inspector_id: string | null
  location: string | null
  total_items: number
  passed_items: number
  failed_items: number
  na_items: number
  score: number | null
  notes: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  follow_up_notes: string | null
  completed_at: string | null
  completed_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SafetyInspectionItem {
  id: string
  inspection_id: string
  company_id: string
  description: string
  category: string | null
  result: InspectionItemResult
  notes: string | null
  photo_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ToolboxTalk {
  id: string
  company_id: string
  job_id: string
  title: string
  topic: string | null
  description: string | null
  talk_date: string
  talk_time: string | null
  duration_minutes: number | null
  status: TalkStatus
  presenter_id: string | null
  location: string | null
  materials: unknown[]
  notes: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ToolboxTalkAttendee {
  id: string
  talk_id: string
  company_id: string
  attendee_name: string
  attendee_id: string | null
  trade: string | null
  company_name: string | null
  signed: boolean
  signed_at: string | null
  notes: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const INCIDENT_SEVERITIES: { value: IncidentSeverity; label: string }[] = [
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'serious', label: 'Serious' },
  { value: 'fatal', label: 'Fatal' },
]

export const INCIDENT_STATUSES: { value: IncidentStatus; label: string }[] = [
  { value: 'reported', label: 'Reported' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const INCIDENT_TYPES: { value: IncidentType; label: string }[] = [
  { value: 'fall', label: 'Fall' },
  { value: 'struck_by', label: 'Struck By' },
  { value: 'caught_in', label: 'Caught In/Between' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'heat', label: 'Heat/Cold' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
]

export const INSPECTION_STATUSES: { value: InspectionStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
]

export const INSPECTION_RESULTS: { value: InspectionResult; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'conditional', label: 'Conditional' },
]

export const INSPECTION_ITEM_RESULTS: { value: InspectionItemResult; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'na', label: 'N/A' },
  { value: 'not_inspected', label: 'Not Inspected' },
]

export const TALK_STATUSES: { value: TalkStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]
