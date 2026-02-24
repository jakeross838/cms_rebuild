/**
 * Module 23: Price Intelligence Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type SkillLevel = 'apprentice' | 'journeyman' | 'master' | 'foreman'

export type UnitOfMeasure =
  | 'each'
  | 'linear_ft'
  | 'sq_ft'
  | 'cu_yd'
  | 'ton'
  | 'gallon'
  | 'bundle'
  | 'box'
  | 'sheet'
  | 'roll'
  | 'bag'
  | 'pair'

export type ItemCategory =
  | 'lumber'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'roofing'
  | 'flooring'
  | 'paint'
  | 'hardware'
  | 'concrete'
  | 'insulation'
  | 'drywall'
  | 'fixtures'
  | 'appliances'
  | 'other'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface MasterItem {
  id: string
  company_id: string
  name: string
  description: string | null
  category: ItemCategory
  unit_of_measure: UnitOfMeasure
  default_unit_price: number
  sku: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VendorItemPrice {
  id: string
  company_id: string
  vendor_id: string
  master_item_id: string
  unit_price: number
  lead_time_days: number | null
  min_order_qty: number | null
  effective_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PriceHistory {
  id: string
  company_id: string
  master_item_id: string
  vendor_id: string | null
  old_price: number | null
  new_price: number
  change_pct: number | null
  recorded_at: string
  created_at: string
}

export interface LaborRate {
  id: string
  company_id: string
  trade: string
  skill_level: SkillLevel
  hourly_rate: number
  overtime_rate: number | null
  region: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface LaborRateHistory {
  id: string
  company_id: string
  labor_rate_id: string
  old_rate: number | null
  new_rate: number
  change_pct: number | null
  effective_date: string
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'apprentice', label: 'Apprentice' },
  { value: 'journeyman', label: 'Journeyman' },
  { value: 'master', label: 'Master' },
  { value: 'foreman', label: 'Foreman' },
]

export const UNITS_OF_MEASURE: { value: UnitOfMeasure; label: string }[] = [
  { value: 'each', label: 'Each' },
  { value: 'linear_ft', label: 'Linear Foot' },
  { value: 'sq_ft', label: 'Square Foot' },
  { value: 'cu_yd', label: 'Cubic Yard' },
  { value: 'ton', label: 'Ton' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'box', label: 'Box' },
  { value: 'sheet', label: 'Sheet' },
  { value: 'roll', label: 'Roll' },
  { value: 'bag', label: 'Bag' },
  { value: 'pair', label: 'Pair' },
]

export const ITEM_CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'lumber', label: 'Lumber' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'paint', label: 'Paint' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'other', label: 'Other' },
]
