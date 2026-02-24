/**
 * Module 22: Vendor Performance Scoring Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type ScoreDimension =
  | 'quality'
  | 'timeliness'
  | 'communication'
  | 'budget_adherence'
  | 'safety'

export type CallbackStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'disputed'

export type CallbackSeverity =
  | 'minor'
  | 'moderate'
  | 'major'
  | 'critical'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface VendorScore {
  id: string
  company_id: string
  vendor_id: string
  quality_score: number
  timeliness_score: number
  communication_score: number
  budget_adherence_score: number
  safety_score: number
  overall_score: number
  data_point_count: number
  calculation_window_months: number
  manual_adjustment: number
  manual_adjustment_reason: string | null
  calculated_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorScoreHistory {
  id: string
  company_id: string
  vendor_score_id: string
  vendor_id: string
  quality_score: number
  timeliness_score: number
  communication_score: number
  budget_adherence_score: number
  safety_score: number
  overall_score: number
  snapshot_date: string
  notes: string | null
  created_at: string
}

export interface VendorJobPerformance {
  id: string
  company_id: string
  vendor_id: string
  job_id: string
  trade: string | null
  quality_rating: number | null
  timeliness_rating: number | null
  communication_rating: number | null
  budget_adherence_rating: number | null
  safety_rating: number | null
  overall_rating: number | null
  tasks_on_time: number
  tasks_total: number
  punch_items_count: number
  punch_resolution_avg_days: number | null
  inspection_pass_rate: number | null
  bid_amount: number | null
  final_amount: number | null
  change_order_count: number
  rating_notes: string | null
  rated_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorWarrantyCallback {
  id: string
  company_id: string
  vendor_id: string
  job_id: string
  title: string
  description: string | null
  severity: CallbackSeverity
  status: CallbackStatus
  reported_date: string
  resolved_date: string | null
  resolution_notes: string | null
  resolution_cost: number | null
  resolution_days: number | null
  reported_by: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorNote {
  id: string
  company_id: string
  vendor_id: string
  author_id: string | null
  title: string | null
  body: string
  tags: string[]
  is_internal: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ── Constants ──────────────────────────────────────────────────────────────

export const SCORE_DIMENSIONS: { value: ScoreDimension; label: string }[] = [
  { value: 'quality', label: 'Quality' },
  { value: 'timeliness', label: 'Timeliness' },
  { value: 'communication', label: 'Communication' },
  { value: 'budget_adherence', label: 'Budget Adherence' },
  { value: 'safety', label: 'Safety' },
]

export const CALLBACK_STATUSES: { value: CallbackStatus; label: string }[] = [
  { value: 'reported', label: 'Reported' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'disputed', label: 'Disputed' },
]

export const CALLBACK_SEVERITIES: { value: CallbackSeverity; label: string }[] = [
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' },
]

/**
 * Default score weights (must sum to 100).
 * Quality 30%, Timeliness 25%, Communication 15%, Budget Adherence 20%, Safety 10%
 */
export const SCORE_WEIGHTS: Record<ScoreDimension, number> = {
  quality: 30,
  timeliness: 25,
  communication: 15,
  budget_adherence: 20,
  safety: 10,
}

/**
 * Score weight presets for different builder priorities.
 */
export const SCORE_WEIGHT_PRESETS: { name: string; weights: Record<ScoreDimension, number> }[] = [
  { name: 'Balanced', weights: { quality: 25, timeliness: 25, communication: 15, budget_adherence: 20, safety: 15 } },
  { name: 'Quality-Focused', weights: { quality: 35, timeliness: 20, communication: 15, budget_adherence: 15, safety: 15 } },
  { name: 'Budget-Focused', weights: { quality: 15, timeliness: 25, communication: 10, budget_adherence: 35, safety: 15 } },
  { name: 'Safety-First', weights: { quality: 15, timeliness: 20, communication: 10, budget_adherence: 15, safety: 40 } },
]
