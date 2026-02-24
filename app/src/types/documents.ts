/**
 * Module 06: Document Storage Types
 */

export type DocumentStatus = 'active' | 'archived' | 'deleted' | 'quarantined' | 'legal_hold'

export type DocumentType =
  | 'invoice'
  | 'contract'
  | 'plan'
  | 'coi'
  | 'lien_waiver'
  | 'permit'
  | 'photo'
  | 'specification'
  | 'submittal'
  | 'correspondence'
  | 'daily_log'
  | 'change_order'
  | 'purchase_order'
  | 'other'

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface DocumentFolder {
  id: string
  company_id: string
  job_id: string | null
  parent_folder_id: string | null
  name: string
  path: string
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  company_id: string
  job_id: string | null
  folder_id: string | null
  filename: string
  storage_path: string
  mime_type: string
  file_size: number
  document_type: string | null
  ai_classification: string | null
  ai_confidence: number | null
  status: DocumentStatus
  current_version_id: string | null
  thumbnail_path: string | null
  uploaded_by: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  storage_path: string
  file_size: number
  mime_type: string | null
  change_notes: string | null
  uploaded_by: string
  created_at: string
}

export interface DocumentTag {
  id: string
  document_id: string
  tag: string
  created_at: string
}

export interface CompanyTagLibrary {
  id: string
  company_id: string
  tag: string
  category: string | null
  created_at: string
}

export interface DocumentSearchContent {
  id: string
  document_id: string
  version_id: string
  extracted_text: string | null
  extraction_status: ExtractionStatus
  extraction_method: string | null
  created_at: string
  updated_at: string
}

export interface DocumentExpiration {
  id: string
  document_id: string
  company_id: string
  expiration_date: string
  entity_type: string | null
  entity_id: string | null
  alert_90_sent: boolean
  alert_60_sent: boolean
  alert_30_sent: boolean
  alert_14_sent: boolean
  alert_expired_sent: boolean
  created_at: string
  updated_at: string
}

export interface CompanyDocumentSettings {
  id: string
  company_id: string
  folder_templates: FolderTemplate[]
  retention_policy: Record<string, RetentionRule>
  max_file_size_mb: number
  blocked_extensions: string[]
  created_at: string
  updated_at: string
}

export interface FolderTemplate {
  name: string
  folders: string[]
}

export interface RetentionRule {
  years: number
  action: 'archive' | 'delete' | 'review'
}

export interface CompanyStorageUsage {
  id: string
  company_id: string
  total_bytes: number
  file_count: number
  quota_bytes: number
  last_calculated_at: string
}

/** Blocked file extensions that cannot be uploaded */
export const BLOCKED_EXTENSIONS = ['exe', 'bat', 'sh', 'cmd', 'ps1', 'msi', 'dll', 'com', 'scr', 'vbs', 'js', 'wsf']

/** Maximum file size in bytes (500 MB) */
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024

/** Maximum number of simultaneous uploads */
export const MAX_SIMULTANEOUS_UPLOADS = 20

/** Known document types for classification */
export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'contract', label: 'Contract' },
  { value: 'plan', label: 'Plan / Drawing' },
  { value: 'coi', label: 'Certificate of Insurance' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'permit', label: 'Permit' },
  { value: 'photo', label: 'Photo' },
  { value: 'specification', label: 'Specification' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'daily_log', label: 'Daily Log' },
  { value: 'change_order', label: 'Change Order' },
  { value: 'purchase_order', label: 'Purchase Order' },
  { value: 'other', label: 'Other' },
]

/** Default folder template for new construction projects */
export const DEFAULT_FOLDER_TEMPLATE: FolderTemplate = {
  name: 'Custom Home',
  folders: [
    '/Plans & Specifications',
    '/Plans & Specifications/Architectural',
    '/Plans & Specifications/Structural',
    '/Plans & Specifications/MEP',
    '/Plans & Specifications/Civil',
    '/Contracts',
    '/Insurance & Compliance',
    '/Invoices',
    '/Change Orders',
    '/Submittals',
    '/Photos',
    '/Correspondence',
    '/Permits & Inspections',
    '/Closeout',
  ],
}
