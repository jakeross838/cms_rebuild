/**
 * Module 13: AI Invoice Processing Types
 */

// ── Status & Enum Unions ────────────────────────────────────────────────────

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review'

export type FieldDataType = 'string' | 'number' | 'date' | 'currency'

export type ExtractionRuleType = 'field_mapping' | 'auto_code' | 'auto_approve' | 'skip_review'

export type ExtractionAuditAction =
  | 'created'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'matched'

export type ReviewDecision = 'approved' | 'rejected'

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface InvoiceExtraction {
  id: string
  company_id: string
  document_id: string
  status: ExtractionStatus
  extracted_data: Record<string, unknown>
  confidence_score: number | null
  vendor_match_id: string | null
  job_match_id: string | null
  matched_bill_id: string | null
  extraction_model: string | null
  processing_time_ms: number | null
  error_message: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface ExtractionFieldMapping {
  id: string
  company_id: string
  field_name: string
  extraction_path: string
  data_type: FieldDataType
  is_required: boolean
  default_value: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceLineExtraction {
  id: string
  extraction_id: string
  line_number: number
  description: string | null
  quantity: number | null
  unit_price: number | null
  amount: number | null
  cost_code_match_id: string | null
  confidence_score: number | null
  created_at: string
}

export interface ExtractionRule {
  id: string
  company_id: string
  vendor_id: string | null
  rule_type: ExtractionRuleType
  conditions: Record<string, unknown>
  actions: Record<string, unknown>
  is_active: boolean
  priority: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ExtractionAuditLog {
  id: string
  extraction_id: string
  action: ExtractionAuditAction
  details: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

// ── Constants ───────────────────────────────────────────────────────────────

export const EXTRACTION_STATUSES: { value: ExtractionStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'needs_review', label: 'Needs Review' },
]

export const FIELD_DATA_TYPES: { value: FieldDataType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'currency', label: 'Currency' },
]

export const RULE_TYPES: { value: ExtractionRuleType; label: string }[] = [
  { value: 'field_mapping', label: 'Field Mapping' },
  { value: 'auto_code', label: 'Auto Code' },
  { value: 'auto_approve', label: 'Auto Approve' },
  { value: 'skip_review', label: 'Skip Review' },
]

export const AUDIT_ACTIONS: { value: ExtractionAuditAction; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'matched', label: 'Matched' },
]

export const REVIEW_DECISIONS: { value: ReviewDecision; label: string }[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

/** Confidence thresholds (spec defaults) */
export const CONFIDENCE_THRESHOLDS = {
  AUTO_APPROVE: 95,
  HUMAN_REVIEW: 80,
  NEEDS_ATTENTION: 70,
  REJECT: 50,
} as const
