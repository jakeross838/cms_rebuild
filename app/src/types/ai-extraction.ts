export type ExtractionStatus = 'pending' | 'processing' | 'extracted' | 'review' | 'confirmed' | 'failed'

export interface ExtractionResult {
  id: string
  company_id: string
  status: ExtractionStatus
  source_type: 'upload' | 'email' | 'api'
  original_filename: string
  file_url: string
  file_type: string
  // Extracted fields
  extracted_data: ExtractedInvoiceData | null
  confidence_scores: ConfidenceScores | null
  raw_text: string | null
  // Processing metadata
  processing_started_at: string | null
  processing_completed_at: string | null
  processing_duration_ms: number | null
  error_message: string | null
  // Review
  reviewed_by: string | null
  reviewed_at: string | null
  corrections: Record<string, { original: unknown; corrected: unknown }> | null
  // Link to created invoice
  invoice_id: string | null
  created_at: string
  updated_at: string
}

export interface ExtractedInvoiceData {
  vendor_name: string | null
  vendor_address: string | null
  invoice_number: string | null
  invoice_date: string | null
  due_date: string | null
  amount: number | null
  tax_amount: number | null
  subtotal: number | null
  description: string | null
  po_number: string | null
  payment_terms: string | null
  line_items: ExtractedLineItem[]
  // Construction-specific
  job_reference: string | null
  cost_code_reference: string | null
  retainage_percent: number | null
  billing_period: string | null
  percent_complete: number | null
}

export interface ExtractedLineItem {
  description: string
  quantity: number | null
  unit: string | null
  unit_price: number | null
  amount: number
}

export interface ConfidenceScores {
  overall: number
  vendor_name: number
  invoice_number: number
  amount: number
  date: number
  line_items: number
  cost_codes: number
}
