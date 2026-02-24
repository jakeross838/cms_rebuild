/**
 * Module 52: Inventory & Materials Types
 */

// ── Type Unions ──────────────────────────────────────────────────────────────

export type LocationType = 'warehouse' | 'job_site' | 'vehicle' | 'other'

export type TransactionType = 'receive' | 'transfer' | 'consume' | 'adjust' | 'return'

export type RequestStatus = 'draft' | 'submitted' | 'approved' | 'partially_fulfilled' | 'fulfilled' | 'rejected'

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string
  company_id: string
  name: string
  sku: string | null
  description: string | null
  category: string | null
  unit_of_measure: string
  unit_cost: number
  reorder_point: number
  reorder_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface InventoryLocation {
  id: string
  company_id: string
  name: string
  location_type: LocationType
  address: string | null
  job_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryStock {
  id: string
  company_id: string
  item_id: string
  location_id: string
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  last_counted_at: string | null
  created_at: string
  updated_at: string
}

export interface InventoryTransaction {
  id: string
  company_id: string
  item_id: string
  from_location_id: string | null
  to_location_id: string | null
  transaction_type: TransactionType
  quantity: number
  unit_cost: number | null
  total_cost: number | null
  reference_type: string | null
  reference_id: string | null
  job_id: string | null
  cost_code_id: string | null
  notes: string | null
  performed_by: string | null
  created_at: string
}

export interface MaterialRequest {
  id: string
  company_id: string
  job_id: string | null
  requested_by: string | null
  status: RequestStatus
  priority: RequestPriority
  needed_by: string | null
  notes: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MaterialRequestItem {
  id: string
  request_id: string
  item_id: string | null
  description: string | null
  quantity_requested: number
  quantity_fulfilled: number
  unit: string | null
  notes: string | null
  created_at: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'job_site', label: 'Job Site' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
]

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'receive', label: 'Receive' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'consume', label: 'Consume' },
  { value: 'adjust', label: 'Adjust' },
  { value: 'return', label: 'Return' },
]

export const REQUEST_STATUSES: { value: RequestStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'partially_fulfilled', label: 'Partially Fulfilled' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'rejected', label: 'Rejected' },
]

export const REQUEST_PRIORITIES: { value: RequestPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]
