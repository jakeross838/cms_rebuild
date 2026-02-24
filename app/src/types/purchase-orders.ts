/**
 * Module 18: Purchase Order Types
 */

export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'partially_received'
  | 'received'
  | 'closed'
  | 'voided'

export interface PurchaseOrder {
  id: string
  company_id: string
  job_id: string
  vendor_id: string
  po_number: string
  title: string
  status: PurchaseOrderStatus
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  budget_id: string | null
  cost_code_id: string | null
  delivery_date: string | null
  shipping_address: string | null
  terms: string | null
  notes: string | null
  approved_by: string | null
  approved_at: string | null
  sent_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PurchaseOrderLine {
  id: string
  po_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  amount: number
  received_quantity: number
  cost_code_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PoReceipt {
  id: string
  po_id: string
  company_id: string
  received_date: string
  received_by: string | null
  notes: string | null
  document_id: string | null
  created_at: string
}

export interface PoReceiptLine {
  id: string
  receipt_id: string
  po_line_id: string
  quantity_received: number
  notes: string | null
  created_at: string
}

/** PO status options for dropdowns and filters */
export const PO_STATUSES: { value: PurchaseOrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_received', label: 'Partially Received' },
  { value: 'received', label: 'Received' },
  { value: 'closed', label: 'Closed' },
  { value: 'voided', label: 'Voided' },
]
