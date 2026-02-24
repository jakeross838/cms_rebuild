/**
 * Module 35: Equipment & Asset Management Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type EquipmentStatus =
  | 'available'
  | 'assigned'
  | 'maintenance'
  | 'out_of_service'
  | 'retired'

export type EquipmentType =
  | 'heavy_machinery'
  | 'vehicle'
  | 'power_tool'
  | 'hand_tool'
  | 'scaffolding'
  | 'safety_equipment'
  | 'measuring'
  | 'other'

export type OwnershipType = 'owned' | 'leased' | 'rented'

export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'inspection'
  | 'calibration'

export type MaintenanceStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled'

export type AssignmentStatus = 'active' | 'completed' | 'cancelled'

export type InspectionType = 'pre_use' | 'post_use' | 'periodic' | 'safety'

export type InspectionResult = 'pass' | 'fail' | 'conditional'

export type CostType =
  | 'daily_rate'
  | 'fuel'
  | 'repair'
  | 'insurance'
  | 'transport'
  | 'other'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Equipment {
  id: string
  company_id: string
  name: string
  description: string | null
  equipment_type: EquipmentType
  status: EquipmentStatus
  ownership_type: OwnershipType
  make: string | null
  model: string | null
  serial_number: string | null
  year: number | null
  purchase_date: string | null
  purchase_price: number
  current_value: number
  daily_rate: number
  location: string | null
  notes: string | null
  photo_urls: string[]
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EquipmentAssignment {
  id: string
  company_id: string
  equipment_id: string
  job_id: string | null
  assigned_to: string | null
  assigned_by: string | null
  start_date: string
  end_date: string | null
  status: AssignmentStatus
  hours_used: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EquipmentMaintenance {
  id: string
  company_id: string
  equipment_id: string
  maintenance_type: MaintenanceType
  status: MaintenanceStatus
  title: string
  description: string | null
  scheduled_date: string | null
  completed_date: string | null
  performed_by: string | null
  service_provider: string | null
  parts_cost: number
  labor_cost: number
  total_cost: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EquipmentInspection {
  id: string
  company_id: string
  equipment_id: string
  inspection_type: InspectionType
  result: InspectionResult
  inspection_date: string
  inspector_id: string | null
  checklist: unknown[]
  deficiencies: string | null
  corrective_action: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EquipmentCost {
  id: string
  company_id: string
  equipment_id: string
  job_id: string | null
  cost_type: CostType
  amount: number
  cost_date: string
  description: string | null
  vendor_id: string | null
  receipt_url: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const EQUIPMENT_STATUSES: { value: EquipmentStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'out_of_service', label: 'Out of Service' },
  { value: 'retired', label: 'Retired' },
]

export const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'heavy_machinery', label: 'Heavy Machinery' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'power_tool', label: 'Power Tool' },
  { value: 'hand_tool', label: 'Hand Tool' },
  { value: 'scaffolding', label: 'Scaffolding' },
  { value: 'safety_equipment', label: 'Safety Equipment' },
  { value: 'measuring', label: 'Measuring' },
  { value: 'other', label: 'Other' },
]

export const OWNERSHIP_TYPES: { value: OwnershipType; label: string }[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'leased', label: 'Leased' },
  { value: 'rented', label: 'Rented' },
]

export const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'calibration', label: 'Calibration' },
]

export const MAINTENANCE_STATUSES: { value: MaintenanceStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const ASSIGNMENT_STATUSES: { value: AssignmentStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const INSPECTION_TYPES: { value: InspectionType; label: string }[] = [
  { value: 'pre_use', label: 'Pre-Use' },
  { value: 'post_use', label: 'Post-Use' },
  { value: 'periodic', label: 'Periodic' },
  { value: 'safety', label: 'Safety' },
]

export const INSPECTION_RESULTS: { value: InspectionResult; label: string }[] = [
  { value: 'pass', label: 'Pass' },
  { value: 'fail', label: 'Fail' },
  { value: 'conditional', label: 'Conditional' },
]

export const COST_TYPES: { value: CostType; label: string }[] = [
  { value: 'daily_rate', label: 'Daily Rate' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'repair', label: 'Repair' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]
