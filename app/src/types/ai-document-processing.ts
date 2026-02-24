/**
 * Module 24: AI Document Processing Types
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'lien_waiver'
  | 'change_order'
  | 'purchase_order'
  | 'contract'
  | 'permit'
  | 'inspection_report'
  | 'plan_sheet'
  | 'specification'
  | 'submittal'
  | 'rfi'
  | 'other'

export type ExtractionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'review_needed'

export type QueueStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type QueuePriority = 1 | 2 | 3 | 4 | 5

export type FeedbackType =
  | 'correction'
  | 'confirmation'
  | 'rejection'

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface DocumentClassification {
  id: string
  company_id: string
  document_id: string
  classified_type: DocumentType
  confidence_score: number
  model_version: string | null
  metadata: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ExtractionTemplate {
  id: string
  company_id: string
  name: string
  document_type: DocumentType
  field_definitions: Record<string, unknown>[]
  is_active: boolean
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DocumentExtraction {
  id: string
  company_id: string
  document_id: string
  classification_id: string | null
  extraction_template_id: string | null
  extracted_data: Record<string, unknown>
  status: ExtractionStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DocumentProcessingQueue {
  id: string
  company_id: string
  document_id: string
  status: QueueStatus
  priority: QueuePriority
  attempts: number
  max_attempts: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AiFeedback {
  id: string
  company_id: string
  extraction_id: string | null
  field_name: string
  original_value: string | null
  corrected_value: string | null
  feedback_type: FeedbackType
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'contract', label: 'Contract' },
  { value: 'permit', label: 'Permit' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'plan_sheet', label: 'Plan Sheet' },
  { value: 'specification', label: 'Specification' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'rfi', label: 'RFI' },
  { value: 'other', label: 'Other' },
]

export const EXTRACTION_STATUSES: { value: ExtractionStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'review_needed', label: 'Review Needed' },
]

export const QUEUE_STATUSES: { value: QueueStatus; label: string }[] = [
  { value: 'queued', label: 'Queued' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const QUEUE_PRIORITIES: { value: QueuePriority; label: string }[] = [
  { value: 1, label: 'Critical' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'Low' },
  { value: 5, label: 'Lowest' },
]

export const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'correction', label: 'Correction' },
  { value: 'confirmation', label: 'Confirmation' },
  { value: 'rejection', label: 'Rejection' },
]
