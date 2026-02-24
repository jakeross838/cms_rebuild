/**
 * Module 38: Contracts & E-Signature Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type ContractStatus =
  | 'draft'
  | 'pending_review'
  | 'sent_for_signature'
  | 'partially_signed'
  | 'fully_signed'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'voided'

export type ContractType =
  | 'prime'
  | 'subcontract'
  | 'purchase_order'
  | 'service_agreement'
  | 'change_order'
  | 'amendment'
  | 'nda'
  | 'other'

export type SignerStatus =
  | 'pending'
  | 'viewed'
  | 'signed'
  | 'declined'
  | 'expired'

export type SignerRole =
  | 'owner'
  | 'client'
  | 'subcontractor'
  | 'architect'
  | 'engineer'
  | 'other'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Contract {
  id: string
  company_id: string
  job_id: string | null
  contract_number: string
  title: string
  description: string | null
  contract_type: ContractType
  status: ContractStatus
  template_id: string | null
  vendor_id: string | null
  client_id: string | null
  contract_value: number
  retention_pct: number
  start_date: string | null
  end_date: string | null
  executed_at: string | null
  expires_at: string | null
  content: string | null
  metadata: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ContractVersion {
  id: string
  contract_id: string
  company_id: string
  version_number: number
  change_summary: string | null
  content: string | null
  snapshot_json: Record<string, unknown>
  created_by: string | null
  created_at: string
}

export interface ContractSigner {
  id: string
  contract_id: string
  company_id: string
  name: string
  email: string
  role: SignerRole
  status: SignerStatus
  sign_order: number
  signed_at: string | null
  declined_at: string | null
  decline_reason: string | null
  viewed_at: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}

export interface ContractTemplate {
  id: string
  company_id: string
  name: string
  description: string | null
  contract_type: ContractType
  content: string | null
  clauses: unknown[]
  variables: unknown[]
  is_active: boolean
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ContractClause {
  id: string
  company_id: string
  name: string
  description: string | null
  category: string | null
  content: string
  is_required: boolean
  is_active: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const CONTRACT_STATUSES: { value: ContractStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'sent_for_signature', label: 'Sent for Signature' },
  { value: 'partially_signed', label: 'Partially Signed' },
  { value: 'fully_signed', label: 'Fully Signed' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'voided', label: 'Voided' },
]

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'prime', label: 'Prime Contract' },
  { value: 'subcontract', label: 'Subcontract' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'service_agreement', label: 'Service Agreement' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'nda', label: 'NDA' },
  { value: 'other', label: 'Other' },
]

export const SIGNER_STATUSES: { value: SignerStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'signed', label: 'Signed' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
]

export const SIGNER_ROLES: { value: SignerRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'client', label: 'Client' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'other', label: 'Other' },
]
