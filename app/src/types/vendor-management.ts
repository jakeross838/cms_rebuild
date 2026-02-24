/**
 * Module 10: Vendor Management Types
 *
 * Extends the core vendor model (Module 03) with contacts, trades,
 * insurance, compliance tracking, and performance ratings.
 */

// ── Type Unions ──────────────────────────────────────────────────────────

export type InsuranceType =
  | 'general_liability'
  | 'workers_comp'
  | 'auto'
  | 'umbrella'
  | 'professional'

export type InsuranceStatus = 'active' | 'expiring_soon' | 'expired' | 'not_on_file'

export type ComplianceRequirementType =
  | 'license'
  | 'bond'
  | 'w9'
  | 'insurance'
  | 'safety_cert'
  | 'prequalification'

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending' | 'waived' | 'expired'

export type RatingCategory = 'quality' | 'schedule' | 'communication' | 'safety' | 'value'

// ── Interfaces ───────────────────────────────────────────────────────────

export interface VendorContact {
  id: string
  vendor_id: string
  company_id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface VendorTrade {
  id: string
  vendor_id: string
  company_id: string
  trade_name: string
  is_primary: boolean
  created_at: string
}

export interface VendorInsurance {
  id: string
  vendor_id: string
  company_id: string
  insurance_type: InsuranceType
  carrier_name: string
  policy_number: string
  coverage_amount: number | null
  expiration_date: string
  certificate_document_id: string | null
  status: InsuranceStatus
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

export interface VendorCompliance {
  id: string
  vendor_id: string
  company_id: string
  requirement_type: ComplianceRequirementType
  requirement_name: string
  status: ComplianceStatus
  expiration_date: string | null
  document_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VendorRating {
  id: string
  vendor_id: string
  company_id: string
  job_id: string | null
  category: RatingCategory
  rating: number
  review_text: string | null
  rated_by: string | null
  created_at: string
}

// ── Constants ────────────────────────────────────────────────────────────

export const INSURANCE_TYPES: { value: InsuranceType; label: string }[] = [
  { value: 'general_liability', label: 'General Liability' },
  { value: 'workers_comp', label: "Workers' Compensation" },
  { value: 'auto', label: 'Auto Insurance' },
  { value: 'umbrella', label: 'Umbrella / Excess' },
  { value: 'professional', label: 'Professional Liability' },
]

export const INSURANCE_STATUSES: { value: InsuranceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'not_on_file', label: 'Not on File' },
]

export const COMPLIANCE_TYPES: { value: ComplianceRequirementType; label: string }[] = [
  { value: 'license', label: 'License' },
  { value: 'bond', label: 'Bond' },
  { value: 'w9', label: 'W-9' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'safety_cert', label: 'Safety Certification' },
  { value: 'prequalification', label: 'Prequalification' },
]

export const COMPLIANCE_STATUSES: { value: ComplianceStatus; label: string }[] = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
  { value: 'pending', label: 'Pending' },
  { value: 'waived', label: 'Waived' },
  { value: 'expired', label: 'Expired' },
]

export const RATING_CATEGORIES: { value: RatingCategory; label: string }[] = [
  { value: 'quality', label: 'Quality' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'communication', label: 'Communication' },
  { value: 'safety', label: 'Safety' },
  { value: 'value', label: 'Value' },
]
