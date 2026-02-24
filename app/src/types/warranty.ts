/**
 * Module 31: Warranty & Home Care Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type WarrantyStatus = 'active' | 'expired' | 'voided' | 'transferred'

export type WarrantyType =
  | 'structural'
  | 'mechanical'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'roofing'
  | 'appliance'
  | 'general'
  | 'workmanship'

export type ClaimStatus =
  | 'submitted'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'denied'
  | 'escalated'

export type ClaimPriority = 'low' | 'normal' | 'high' | 'urgent'

export type ClaimHistoryAction =
  | 'created'
  | 'acknowledged'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'denied'
  | 'escalated'
  | 'reopened'
  | 'note_added'

export type MaintenanceFrequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'

export type TaskStatus = 'pending' | 'scheduled' | 'completed' | 'overdue' | 'skipped'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Warranty {
  id: string
  company_id: string
  job_id: string
  title: string
  description: string | null
  warranty_type: WarrantyType
  status: WarrantyStatus
  vendor_id: string | null
  start_date: string
  end_date: string
  coverage_details: string | null
  exclusions: string | null
  document_id: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  transferred_to: string | null
  transferred_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WarrantyClaim {
  id: string
  company_id: string
  warranty_id: string
  claim_number: string
  title: string
  description: string | null
  status: ClaimStatus
  priority: ClaimPriority
  reported_by: string | null
  reported_date: string
  assigned_to: string | null
  assigned_vendor_id: string | null
  resolution_notes: string | null
  resolution_cost: number
  resolved_at: string | null
  resolved_by: string | null
  due_date: string | null
  photos: unknown[]
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WarrantyClaimHistory {
  id: string
  claim_id: string
  company_id: string
  action: ClaimHistoryAction
  previous_status: string | null
  new_status: string | null
  details: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

export interface MaintenanceSchedule {
  id: string
  company_id: string
  job_id: string
  title: string
  description: string | null
  frequency: MaintenanceFrequency
  category: string | null
  assigned_to: string | null
  assigned_vendor_id: string | null
  start_date: string
  end_date: string | null
  next_due_date: string | null
  estimated_cost: number
  is_active: boolean
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MaintenanceTask {
  id: string
  company_id: string
  schedule_id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string
  completed_at: string | null
  completed_by: string | null
  actual_cost: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const WARRANTY_STATUSES: { value: WarrantyStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'voided', label: 'Voided' },
  { value: 'transferred', label: 'Transferred' },
]

export const WARRANTY_TYPES: { value: WarrantyType; label: string }[] = [
  { value: 'structural', label: 'Structural' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'general', label: 'General' },
  { value: 'workmanship', label: 'Workmanship' },
]

export const CLAIM_STATUSES: { value: ClaimStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'denied', label: 'Denied' },
  { value: 'escalated', label: 'Escalated' },
]

export const CLAIM_PRIORITIES: { value: ClaimPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const CLAIM_HISTORY_ACTIONS: { value: ClaimHistoryAction; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'denied', label: 'Denied' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'reopened', label: 'Reopened' },
  { value: 'note_added', label: 'Note Added' },
]

export const MAINTENANCE_FREQUENCIES: { value: MaintenanceFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
]

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'skipped', label: 'Skipped' },
]
