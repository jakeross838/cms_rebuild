/**
 * Module 20: Estimating Engine Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type EstimateStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'revised'
  | 'archived'

export type EstimateType =
  | 'lump_sum'
  | 'cost_plus'
  | 'time_and_materials'
  | 'unit_price'
  | 'gmp'
  | 'design_build'

export type ContractType = 'nte' | 'gmp' | 'cost_plus' | 'fixed'

export type MarkupType = 'flat' | 'tiered' | 'per_line' | 'built_in'

export type LineItemType = 'line' | 'allowance' | 'exclusion' | 'alternate'

export type AiConfidence = 'high' | 'medium' | 'low'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Estimate {
  id: string
  company_id: string
  job_id: string | null
  name: string
  description: string | null
  status: EstimateStatus
  estimate_type: EstimateType
  contract_type: ContractType | null
  version: number
  parent_version_id: string | null
  markup_type: MarkupType | null
  markup_pct: number
  overhead_pct: number
  profit_pct: number
  subtotal: number
  total: number
  valid_until: string | null
  notes: string | null
  created_by: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EstimateSection {
  id: string
  estimate_id: string
  company_id: string
  parent_id: string | null
  name: string
  sort_order: number
  subtotal: number
  created_at: string
  updated_at: string
}

export interface EstimateLineItem {
  id: string
  estimate_id: string
  company_id: string
  section_id: string | null
  cost_code_id: string | null
  assembly_id: string | null
  description: string
  item_type: LineItemType
  quantity: number
  unit: string
  unit_cost: number
  markup_pct: number
  total: number
  alt_group: string | null
  notes: string | null
  sort_order: number
  ai_suggested: boolean
  ai_confidence: AiConfidence | null
  created_at: string
  updated_at: string
}

export interface Assembly {
  id: string
  company_id: string
  name: string
  description: string | null
  category: string | null
  parameter_unit: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AssemblyItem {
  id: string
  assembly_id: string
  company_id: string
  cost_code_id: string | null
  description: string
  qty_per_unit: number
  unit: string
  unit_cost: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface EstimateVersion {
  id: string
  estimate_id: string
  company_id: string
  version_number: number
  snapshot_json: Record<string, unknown>
  change_summary: string | null
  created_by: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const ESTIMATE_STATUSES: { value: EstimateStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revised', label: 'Revised' },
  { value: 'archived', label: 'Archived' },
]

export const ESTIMATE_TYPES: { value: EstimateType; label: string }[] = [
  { value: 'lump_sum', label: 'Lump Sum' },
  { value: 'cost_plus', label: 'Cost Plus' },
  { value: 'time_and_materials', label: 'Time & Materials' },
  { value: 'unit_price', label: 'Unit Price' },
  { value: 'gmp', label: 'Guaranteed Maximum Price' },
  { value: 'design_build', label: 'Design-Build' },
]

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'nte', label: 'Not-to-Exceed' },
  { value: 'gmp', label: 'Guaranteed Maximum Price' },
  { value: 'cost_plus', label: 'Cost Plus' },
  { value: 'fixed', label: 'Fixed Price' },
]

export const MARKUP_TYPES: { value: MarkupType; label: string }[] = [
  { value: 'flat', label: 'Flat Percentage' },
  { value: 'tiered', label: 'Tiered by Category' },
  { value: 'per_line', label: 'Per Line Item' },
  { value: 'built_in', label: 'Built Into Prices' },
]

export const LINE_ITEM_TYPES: { value: LineItemType; label: string }[] = [
  { value: 'line', label: 'Line Item' },
  { value: 'allowance', label: 'Allowance' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'alternate', label: 'Alternate' },
]

export const AI_CONFIDENCE_LEVELS: { value: AiConfidence; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]
