'use client'

/**
 * Module 11: Native Accounting (GL/AP/AR) React Query Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  GlAccount,
  GlJournalEntry,
  GlJournalLine,
  ApBill,
  ApBillLine,
  ApPayment,
  ApPaymentApplication,
  ArInvoice,
  ArInvoiceLine,
  ArReceipt,
  ArReceiptApplication,
} from '@/types/accounting'

// ── GL Accounts ─────────────────────────────────────────────────────────────

type GlAccountListParams = {
  page?: number
  limit?: number
  account_type?: string
  is_active?: boolean
  parent_account_id?: string
  q?: string
}

type GlAccountCreateInput = {
  account_number: string
  name: string
  account_type: string
  sub_type?: string | null
  parent_account_id?: string | null
  is_active?: boolean
  is_system?: boolean
  description?: string | null
  normal_balance: string
}

const glAccountHooks = createApiHooks<GlAccountListParams, GlAccountCreateInput>(
  'gl-accounts',
  '/api/v1/gl-accounts'
)

export const useGlAccounts = glAccountHooks.useList
export const useGlAccount = glAccountHooks.useDetail
export const useCreateGlAccount = glAccountHooks.useCreate
export const useUpdateGlAccount = glAccountHooks.useUpdate

// ── GL Journal Entries ───────────────────────────────────────────────────────

type JournalEntryListParams = {
  page?: number
  limit?: number
  status?: string
  source_type?: string
  start_date?: string
  end_date?: string
  q?: string
}

type JournalEntryCreateInput = {
  entry_date: string
  reference_number?: string | null
  memo?: string | null
  source_type?: string
  source_id?: string | null
  lines: {
    account_id: string
    debit_amount?: number
    credit_amount?: number
    memo?: string | null
    job_id?: string | null
    cost_code_id?: string | null
    vendor_id?: string | null
    client_id?: string | null
  }[]
}

const journalEntryHooks = createApiHooks<JournalEntryListParams, JournalEntryCreateInput>(
  'journal-entries',
  '/api/v1/journal-entries'
)

export const useJournalEntries = journalEntryHooks.useList
export const useJournalEntry = journalEntryHooks.useDetail
export const useCreateJournalEntry = journalEntryHooks.useCreate
export const useUpdateJournalEntry = journalEntryHooks.useUpdate

// ── AP Bills ─────────────────────────────────────────────────────────────────

type ApBillListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  job_id?: string
  status?: string
  start_date?: string
  end_date?: string
  q?: string
}

type ApBillCreateInput = {
  vendor_id: string
  bill_number: string
  bill_date: string
  due_date: string
  amount: number
  balance_due?: number | null
  status?: string
  description?: string | null
  job_id?: string | null
  received_date?: string | null
  terms?: string | null
  lines?: {
    gl_account_id: string
    amount: number
    description?: string | null
    job_id?: string | null
    cost_code_id?: string | null
  }[]
}

const apBillHooks = createApiHooks<ApBillListParams, ApBillCreateInput>(
  'ap-bills',
  '/api/v1/ap-bills'
)

export const useApBills = apBillHooks.useList
export const useApBill = apBillHooks.useDetail
export const useCreateApBill = apBillHooks.useCreate
export const useUpdateApBill = apBillHooks.useUpdate
export const useDeleteApBill = apBillHooks.useDelete

// ── AP Payments ──────────────────────────────────────────────────────────────

type ApPaymentListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  status?: string
  start_date?: string
  end_date?: string
}

type ApPaymentCreateInput = {
  vendor_id: string
  payment_date: string
  amount: number
  payment_method: string
  reference_number?: string | null
  memo?: string | null
  applications: { bill_id: string; amount: number }[]
}

const apPaymentHooks = createApiHooks<ApPaymentListParams, ApPaymentCreateInput>(
  'ap-payments',
  '/api/v1/ap-payments'
)

export const useApPayments = apPaymentHooks.useList
export const useCreateApPayment = apPaymentHooks.useCreate

// ── AR Invoices ──────────────────────────────────────────────────────────────

type ArInvoiceListParams = {
  page?: number
  limit?: number
  client_id?: string
  job_id?: string
  status?: string
  start_date?: string
  end_date?: string
  q?: string
}

type ArInvoiceCreateInput = {
  client_id: string
  job_id?: string | null
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: number
  balance_due?: number | null
  status?: string
  terms?: string | null
  notes?: string | null
  lines?: {
    description: string
    quantity?: number
    unit_price: number
    amount: number
    gl_account_id?: string | null
    job_id?: string | null
    cost_code_id?: string | null
  }[]
}

const arInvoiceHooks = createApiHooks<ArInvoiceListParams, ArInvoiceCreateInput>(
  'ar-invoices',
  '/api/v1/ar-invoices'
)

export const useArInvoices = arInvoiceHooks.useList
export const useArInvoice = arInvoiceHooks.useDetail
export const useCreateArInvoice = arInvoiceHooks.useCreate
export const useUpdateArInvoice = arInvoiceHooks.useUpdate
export const useDeleteArInvoice = arInvoiceHooks.useDelete

// ── AR Receipts ──────────────────────────────────────────────────────────────

type ArReceiptListParams = {
  page?: number
  limit?: number
  client_id?: string
  status?: string
  start_date?: string
  end_date?: string
}

type ArReceiptCreateInput = {
  client_id: string
  receipt_date: string
  amount: number
  payment_method: string
  reference_number?: string | null
  memo?: string | null
  applications: { invoice_id: string; amount: number }[]
}

const arReceiptHooks = createApiHooks<ArReceiptListParams, ArReceiptCreateInput>(
  'ar-receipts',
  '/api/v1/ar-receipts'
)

export const useArReceipts = arReceiptHooks.useList
export const useCreateArReceipt = arReceiptHooks.useCreate

// ── Custom nested hooks ──────────────────────────────────────────────────────

/** Fetch GL journal lines for a specific journal entry */
export function useJournalLines(entryId: string | null) {
  return useQuery<GlJournalLine[]>({
    queryKey: ['journal-lines', entryId],
    queryFn: async () => {
      const res = (await fetchJson(`/api/v1/journal-entries/${entryId}`)) as {
        data: GlJournalEntry & { gl_journal_lines: GlJournalLine[] }
      }
      return res?.data?.gl_journal_lines ?? []
    },
    enabled: !!entryId,
  })
}

/** Fetch AP bill lines for a specific bill */
export function useApBillLines(billId: string | null) {
  return useQuery<ApBillLine[]>({
    queryKey: ['ap-bill-lines', billId],
    queryFn: async () => {
      const res = (await fetchJson(`/api/v1/ap-bills/${billId}`)) as {
        data: ApBill & { ap_bill_lines: ApBillLine[] }
      }
      return res?.data?.ap_bill_lines ?? []
    },
    enabled: !!billId,
  })
}

/** Fetch AR invoice lines for a specific invoice */
export function useArInvoiceLines(invoiceId: string | null) {
  return useQuery<ArInvoiceLine[]>({
    queryKey: ['ar-invoice-lines', invoiceId],
    queryFn: async () => {
      const res = (await fetchJson(`/api/v1/ar-invoices/${invoiceId}`)) as {
        data: ArInvoice & { ar_invoice_lines: ArInvoiceLine[] }
      }
      return res?.data?.ar_invoice_lines ?? []
    },
    enabled: !!invoiceId,
  })
}

/** Post a journal entry and invalidate the journal entries list */
export function usePostJournalEntry(entryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v1/journal-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'posted' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal-entries'] })
      qc.invalidateQueries({ queryKey: ['journal-entries', entryId] })
    },
  })
}

/** Void a journal entry */
export function useVoidJournalEntry(entryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v1/journal-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'voided' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal-entries'] })
      qc.invalidateQueries({ queryKey: ['journal-entries', entryId] })
    },
  })
}

/** Void an AP payment (status change) */
export function useVoidApPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (paymentId: string) =>
      fetchJson(`/api/v1/ap-payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'voided' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ap-payments'] })
    },
  })
}

/** Void an AR receipt (status change) */
export function useVoidArReceipt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (receiptId: string) =>
      fetchJson(`/api/v1/ar-receipts/${receiptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'voided' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ar-receipts'] })
    },
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type {
  GlAccount,
  GlJournalEntry,
  GlJournalLine,
  ApBill,
  ApBillLine,
  ApPayment,
  ApPaymentApplication,
  ArInvoice,
  ArInvoiceLine,
  ArReceipt,
  ArReceiptApplication,
}
