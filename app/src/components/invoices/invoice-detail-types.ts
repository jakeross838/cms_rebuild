import type { InvoiceStatus } from '@/types/invoice-full'

export interface ListItem {
  id: string
  name: string
  [key: string]: unknown
}

export interface CostCodeItem {
  id: string
  code: string
  name: string
  [key: string]: unknown
}

export interface PoItem {
  id: string
  po_number: string
  title?: string
  [key: string]: unknown
}

export type TabId = 'overview' | 'line-items' | 'allocations' | 'approvals' | 'disputes' | 'prerequisites'

export interface InvoiceFormData {
  invoice_number: string
  amount: string
  tax_amount: string
  retainage_percent: string
  status: string
  invoice_type: string
  contract_type: string
  invoice_date: string
  due_date: string
  job_id: string
  vendor_id: string
  po_id: string
  cost_code_id: string
  payment_terms: string
  lien_waiver_status: string
  description: string
  notes: string
  billing_period_start: string
  billing_period_end: string
  percent_complete: string
}

export const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'line-items', label: 'Line Items' },
  { id: 'allocations', label: 'Allocations' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'prerequisites', label: 'Prerequisites' },
]

export const STATUS_PIPELINE: InvoiceStatus[] = [
  'draft',
  'pm_pending',
  'approved',
  'in_draw',
  'paid',
]

export const PIPELINE_LABELS: Record<string, string> = {
  draft: 'Draft',
  pm_pending: 'PM Review',
  approved: 'Approved',
  in_draw: 'In Draw',
  paid: 'Paid',
}

export const PREREQ_TYPES = [
  { value: 'coi', label: 'Certificate of Insurance' },
  { value: 'lien_waiver', label: 'Lien Waiver' },
  { value: 'w9', label: 'W-9' },
  { value: 'contract', label: 'Contract' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'custom', label: 'Custom' },
] as const

export function getDaysUntilDue(dueDate: string | null): { days: number; label: string; className: string } | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  if (isNaN(due.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { days: diff, label: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, className: 'text-destructive' }
  if (diff === 0) return { days: 0, label: 'Due today', className: 'text-warning-dark' }
  if (diff <= 7) return { days: diff, label: `${diff} day${diff !== 1 ? 's' : ''} left`, className: 'text-warning-dark' }
  return { days: diff, label: `${diff} days left`, className: 'text-muted-foreground' }
}
