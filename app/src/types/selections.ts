/**
 * Module 21: Selection Management Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type SelectionStatus =
  | 'pending'
  | 'presented'
  | 'selected'
  | 'approved'
  | 'ordered'
  | 'received'
  | 'installed'
  | 'on_hold'
  | 'cancelled'

export type PricingModel =
  | 'allowance'
  | 'fixed'
  | 'cost_plus'

export type OptionSource =
  | 'builder'
  | 'designer'
  | 'client'
  | 'catalog'

export type SelectionHistoryAction =
  | 'viewed'
  | 'considered'
  | 'selected'
  | 'deselected'
  | 'changed'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface SelectionCategory {
  id: string
  company_id: string
  job_id: string
  name: string
  room: string | null
  sort_order: number
  pricing_model: PricingModel
  allowance_amount: number
  deadline: string | null
  lead_time_buffer_days: number
  assigned_to: string | null
  status: SelectionStatus
  designer_access: boolean
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SelectionOption {
  id: string
  company_id: string
  category_id: string
  name: string
  description: string | null
  vendor_id: string | null
  sku: string | null
  model_number: string | null
  unit_price: number
  quantity: number
  total_price: number
  lead_time_days: number
  availability_status: string | null
  source: OptionSource
  is_recommended: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Selection {
  id: string
  company_id: string
  category_id: string
  option_id: string
  job_id: string
  room: string | null
  selected_by: string | null
  selected_at: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  status: SelectionStatus
  change_reason: string | null
  superseded_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SelectionHistory {
  id: string
  company_id: string
  category_id: string
  option_id: string | null
  action: SelectionHistoryAction
  actor_id: string | null
  actor_role: string | null
  notes: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const SELECTION_STATUSES: { value: SelectionStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'presented', label: 'Presented' },
  { value: 'selected', label: 'Selected' },
  { value: 'approved', label: 'Approved' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'received', label: 'Received' },
  { value: 'installed', label: 'Installed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const PRICING_MODELS: { value: PricingModel; label: string }[] = [
  { value: 'allowance', label: 'Allowance' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'cost_plus', label: 'Cost Plus' },
]

export const OPTION_SOURCES: { value: OptionSource; label: string }[] = [
  { value: 'builder', label: 'Builder' },
  { value: 'designer', label: 'Designer' },
  { value: 'client', label: 'Client' },
  { value: 'catalog', label: 'Catalog' },
]

export const SELECTION_HISTORY_ACTIONS: { value: SelectionHistoryAction; label: string }[] = [
  { value: 'viewed', label: 'Viewed' },
  { value: 'considered', label: 'Considered' },
  { value: 'selected', label: 'Selected' },
  { value: 'deselected', label: 'Deselected' },
  { value: 'changed', label: 'Changed' },
]
