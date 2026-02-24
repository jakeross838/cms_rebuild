/**
 * Module 11: Native Accounting — GL / AP / AR Types
 */

// ── GL Enums ────────────────────────────────────────────────────────────────

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cogs'

export type NormalBalance = 'debit' | 'credit'

export type JournalEntryStatus = 'draft' | 'posted' | 'voided'

export type JournalEntrySourceType = 'manual' | 'ap_payment' | 'ar_receipt' | 'payroll'

// ── AP Enums ────────────────────────────────────────────────────────────────

export type BillStatus = 'draft' | 'pending_approval' | 'approved' | 'partially_paid' | 'paid' | 'voided'

export type PaymentMethod = 'check' | 'ach' | 'wire' | 'credit_card' | 'cash'

export type PaymentStatus = 'pending' | 'cleared' | 'voided'

// ── AR Enums ────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'voided'

// ── GL Interfaces ───────────────────────────────────────────────────────────

export interface GlAccount {
  id: string
  company_id: string
  account_number: string
  name: string
  account_type: AccountType
  sub_type: string | null
  parent_account_id: string | null
  is_active: boolean
  is_system: boolean
  description: string | null
  normal_balance: NormalBalance
  created_at: string
  updated_at: string
}

export interface GlJournalEntry {
  id: string
  company_id: string
  entry_date: string
  reference_number: string | null
  memo: string | null
  status: JournalEntryStatus
  source_type: JournalEntrySourceType
  source_id: string | null
  posted_by: string | null
  posted_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface GlJournalLine {
  id: string
  journal_entry_id: string
  account_id: string
  debit_amount: number
  credit_amount: number
  memo: string | null
  job_id: string | null
  cost_code_id: string | null
  vendor_id: string | null
  client_id: string | null
  created_at: string
}

// ── AP Interfaces ───────────────────────────────────────────────────────────

export interface ApBill {
  id: string
  company_id: string
  vendor_id: string
  bill_number: string
  bill_date: string
  due_date: string
  amount: number
  balance_due: number
  status: BillStatus
  job_id: string | null
  description: string | null
  received_date: string | null
  terms: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ApBillLine {
  id: string
  bill_id: string
  gl_account_id: string
  amount: number
  description: string | null
  job_id: string | null
  cost_code_id: string | null
  created_at: string
}

export interface ApPayment {
  id: string
  company_id: string
  vendor_id: string
  payment_date: string
  amount: number
  payment_method: PaymentMethod
  reference_number: string | null
  memo: string | null
  status: PaymentStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ApPaymentApplication {
  id: string
  payment_id: string
  bill_id: string
  amount: number
  created_at: string
}

// ── AR Interfaces ───────────────────────────────────────────────────────────

export interface ArInvoice {
  id: string
  company_id: string
  client_id: string
  job_id: string | null
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: number
  balance_due: number
  status: InvoiceStatus
  terms: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ArInvoiceLine {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  gl_account_id: string | null
  job_id: string | null
  cost_code_id: string | null
  created_at: string
}

export interface ArReceipt {
  id: string
  company_id: string
  client_id: string
  receipt_date: string
  amount: number
  payment_method: PaymentMethod
  reference_number: string | null
  memo: string | null
  status: PaymentStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ArReceiptApplication {
  id: string
  receipt_id: string
  invoice_id: string
  amount: number
  created_at: string
}

// ── Constants ───────────────────────────────────────────────────────────────

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
  { value: 'cogs', label: 'Cost of Goods Sold' },
]

export const BILL_STATUSES: { value: BillStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'voided', label: 'Voided' },
]

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'voided', label: 'Voided' },
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'check', label: 'Check' },
  { value: 'ach', label: 'ACH' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
]

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'voided', label: 'Voided' },
]

export const JOURNAL_ENTRY_STATUSES: { value: JournalEntryStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'voided', label: 'Voided' },
]

export const JOURNAL_ENTRY_SOURCE_TYPES: { value: JournalEntrySourceType; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'ap_payment', label: 'AP Payment' },
  { value: 'ar_receipt', label: 'AR Receipt' },
  { value: 'payroll', label: 'Payroll' },
]

export const NORMAL_BALANCES: { value: NormalBalance; label: string }[] = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
]
