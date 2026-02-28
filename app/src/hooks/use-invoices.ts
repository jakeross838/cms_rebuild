'use client'

/**
 * Invoices (AP) React Query Hooks
 *
 * Covers: invoices CRUD.
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Invoices ────────────────────────────────────────────────────────────────

type InvoiceListParams = {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  status?: string
  q?: string
}

type InvoiceCreateInput = {
  amount: number
  invoice_number?: string | null
  invoice_date?: string | null
  due_date?: string | null
  job_id?: string | null
  vendor_id?: string | null
  status?: string | null
  notes?: string | null
}

const invoiceHooks = createApiHooks<InvoiceListParams, InvoiceCreateInput>(
  'invoices',
  '/api/v2/invoices'
)

export const useInvoices = invoiceHooks.useList
export const useInvoice = invoiceHooks.useDetail
export const useCreateInvoice = invoiceHooks.useCreate
export const useUpdateInvoice = invoiceHooks.useUpdate
export const useDeleteInvoice = invoiceHooks.useDelete
