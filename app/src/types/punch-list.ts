/**
 * Module 28: Punch List & Quality Checklists Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type PunchItemStatus =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'disputed'

export type PunchItemPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'critical'

export type PunchItemCategory =
  | 'structural'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'finish'
  | 'paint'
  | 'flooring'
  | 'cabinets'
  | 'countertops'
  | 'fixtures'
  | 'appliances'
  | 'exterior'
  | 'landscaping'
  | 'other'

export type PhotoType =
  | 'before'
  | 'after'
  | 'issue'

export type ChecklistStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'approved'

export type ChecklistItemResult =
  | 'pass'
  | 'fail'
  | 'na'
  | 'not_inspected'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface PunchItem {
  id: string
  company_id: string
  job_id: string
  title: string
  description: string | null
  location: string | null
  room: string | null
  status: PunchItemStatus
  priority: PunchItemPriority
  category: PunchItemCategory | null
  assigned_to: string | null
  assigned_vendor_id: string | null
  due_date: string | null
  completed_at: string | null
  verified_by: string | null
  verified_at: string | null
  cost_estimate: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PunchItemPhoto {
  id: string
  company_id: string
  punch_item_id: string
  photo_url: string
  caption: string | null
  photo_type: PhotoType
  uploaded_by: string | null
  uploaded_at: string
  created_at: string
}

export interface QualityChecklist {
  id: string
  company_id: string
  job_id: string
  template_id: string | null
  name: string
  description: string | null
  status: ChecklistStatus
  inspector_id: string | null
  inspection_date: string | null
  location: string | null
  total_items: number
  passed_items: number
  failed_items: number
  na_items: number
  completed_at: string | null
  approved_by: string | null
  approved_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface QualityChecklistItem {
  id: string
  company_id: string
  checklist_id: string
  description: string
  result: ChecklistItemResult
  notes: string | null
  photo_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface QualityChecklistTemplate {
  id: string
  company_id: string
  name: string
  description: string | null
  category: string | null
  trade: string | null
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface QualityChecklistTemplateItem {
  id: string
  company_id: string
  template_id: string
  description: string
  category: string | null
  sort_order: number
  is_required: boolean
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const PUNCH_ITEM_STATUSES: { value: PunchItemStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'verified', label: 'Verified' },
  { value: 'disputed', label: 'Disputed' },
]

export const PUNCH_ITEM_PRIORITIES: { value: PunchItemPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const PUNCH_ITEM_CATEGORIES: { value: PunchItemCategory; label: string }[] = [
  { value: 'structural', label: 'Structural' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'finish', label: 'Finish' },
  { value: 'paint', label: 'Paint' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'cabinets', label: 'Cabinets' },
  { value: 'countertops', label: 'Countertops' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'other', label: 'Other' },
]

export const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'issue', label: 'Issue' },
]

export const CHECKLIST_STATUSES: { value: ChecklistStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'approved', label: 'Approved' },
]

export const CHECKLIST_ITEM_RESULTS: { value: ChecklistItemResult; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'na', label: 'N/A' },
  { value: 'not_inspected', label: 'Not Inspected' },
]
