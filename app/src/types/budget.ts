/**
 * Module 09: Budget & Cost Tracking Types
 */

// ── Status & Type Unions ────────────────────────────────────────────────────

export type BudgetStatus = 'draft' | 'active' | 'locked' | 'archived'

export type TransactionType = 'commitment' | 'actual' | 'adjustment' | 'transfer'

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface Budget {
  id: string
  company_id: string
  job_id: string
  name: string
  status: BudgetStatus
  total_amount: number
  approved_by: string | null
  approved_at: string | null
  version: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BudgetLine {
  id: string
  budget_id: string
  company_id: string
  job_id: string
  cost_code_id: string | null
  phase: string | null
  description: string
  estimated_amount: number
  committed_amount: number
  actual_amount: number
  projected_amount: number
  variance_amount: number
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CostTransaction {
  id: string
  company_id: string
  job_id: string
  budget_line_id: string | null
  cost_code_id: string | null
  transaction_type: TransactionType
  amount: number
  description: string | null
  reference_type: string | null
  reference_id: string | null
  transaction_date: string
  vendor_id: string | null
  created_by: string | null
  created_at: string
}

export interface BudgetChangeLog {
  id: string
  budget_id: string
  field_changed: string
  old_value: string | null
  new_value: string | null
  changed_by: string | null
  created_at: string
}

// ── Constants ───────────────────────────────────────────────────────────────

/** All valid budget statuses with display labels */
export const BUDGET_STATUSES: { value: BudgetStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'locked', label: 'Locked' },
  { value: 'archived', label: 'Archived' },
]

/** All valid cost transaction types with display labels */
export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'commitment', label: 'Commitment' },
  { value: 'actual', label: 'Actual' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'transfer', label: 'Transfer' },
]
