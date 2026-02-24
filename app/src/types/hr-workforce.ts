/**
 * Module 34: HR & Workforce Management Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type EmploymentStatus =
  | 'active'
  | 'inactive'
  | 'terminated'
  | 'on_leave'
  | 'probation'

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'seasonal'
  | 'temp'

export type PayType = 'hourly' | 'salary'

export type CertificationStatus =
  | 'active'
  | 'expired'
  | 'pending_renewal'
  | 'revoked'

export type DocumentType =
  | 'resume'
  | 'contract'
  | 'tax_form'
  | 'identification'
  | 'certification'
  | 'performance_review'
  | 'disciplinary'
  | 'other'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Employee {
  id: string
  company_id: string
  user_id: string | null
  employee_number: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  hire_date: string
  termination_date: string | null
  department_id: string | null
  position_id: string | null
  employment_status: EmploymentStatus
  employment_type: EmploymentType
  base_wage: number
  pay_type: PayType
  workers_comp_class: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  address: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EmployeeCertification {
  id: string
  company_id: string
  employee_id: string
  certification_name: string
  certification_type: string | null
  certification_number: string | null
  issuing_authority: string | null
  issued_date: string | null
  expiration_date: string | null
  status: CertificationStatus
  document_url: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeDocument {
  id: string
  company_id: string
  employee_id: string
  document_type: DocumentType
  title: string
  description: string | null
  file_url: string | null
  file_name: string | null
  file_size_bytes: number | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  company_id: string
  name: string
  description: string | null
  parent_id: string | null
  head_user_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  company_id: string
  title: string
  description: string | null
  department_id: string | null
  pay_grade: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'probation', label: 'Probation' },
]

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'temp', label: 'Temporary' },
]

export const PAY_TYPES: { value: PayType; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'salary', label: 'Salary' },
]

export const CERTIFICATION_STATUSES: { value: CertificationStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_renewal', label: 'Pending Renewal' },
  { value: 'revoked', label: 'Revoked' },
]

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'resume', label: 'Resume' },
  { value: 'contract', label: 'Contract' },
  { value: 'tax_form', label: 'Tax Form' },
  { value: 'identification', label: 'Identification' },
  { value: 'certification', label: 'Certification' },
  { value: 'performance_review', label: 'Performance Review' },
  { value: 'disciplinary', label: 'Disciplinary' },
  { value: 'other', label: 'Other' },
]
