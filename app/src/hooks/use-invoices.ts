'use client'

/**
 * Invoices (AP) React Query Hooks
 *
 * Covers: invoices CRUD, line items, allocations, approvals,
 * disputes, dispute communications, vendor credits, retainage rules,
 * and payment prerequisites.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { createApiHooks } from '@/hooks/use-api'
import { fetchJson } from '@/lib/api/fetch'

import type {
  InvoiceStatus,
  InvoiceType,
  ContractType,
  LienWaiverStatus,
  PaymentMethod,
  DisputeType,
  DisputeReasonCategory,
  DisputeStatus,
  VendorCreditStatus,
} from '@/types/invoice-full'

const BASE = '/api/v2/invoices'

// ── Invoices ────────────────────────────────────────────────────────────────

type InvoiceListParams = {
  page?: number
  limit?: number
  job_id?: string
  vendor_id?: string
  status?: InvoiceStatus
  invoice_type?: InvoiceType
  contract_type?: ContractType
  po_id?: string
  cost_code_id?: string
  lien_waiver_status?: LienWaiverStatus
  has_disputes?: boolean
  q?: string
}

type InvoiceCreateInput = {
  amount: number
  tax_amount?: number
  retainage_percent?: number
  retainage_amount?: number
  invoice_number?: string | null
  invoice_date?: string | null
  due_date?: string | null
  job_id?: string | null
  vendor_id?: string | null
  status?: InvoiceStatus | null
  invoice_type?: InvoiceType
  contract_type?: ContractType
  description?: string | null
  notes?: string | null
  po_id?: string | null
  cost_code_id?: string | null
  change_order_id?: string | null
  payment_terms?: string | null
  payment_method?: PaymentMethod | null
  lien_waiver_status?: LienWaiverStatus
  billing_period_start?: string | null
  billing_period_end?: string | null
  percent_complete?: number | null
}

const invoiceHooks = createApiHooks<InvoiceListParams, InvoiceCreateInput>(
  'invoices',
  BASE
)

export const useInvoices = invoiceHooks.useList
export const useInvoice = invoiceHooks.useDetail
export const useCreateInvoice = invoiceHooks.useCreate
export const useUpdateInvoice = invoiceHooks.useUpdate
export const useDeleteInvoice = invoiceHooks.useDelete

// ── Line Items ──────────────────────────────────────────────────────────────

type LineItemCreateInput = {
  description: string
  quantity?: number
  unit?: string
  unit_price: number
  amount: number
  cost_code_id?: string | null
  cost_code_label?: string | null
  phase?: string | null
  job_id?: string | null
  po_line_id?: string | null
  sort_order?: number
}

type LineItemUpdateInput = Partial<LineItemCreateInput>

export function useInvoiceLineItems(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice-line-items', invoiceId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/line-items`),
    enabled: !!invoiceId,
  })
}

export function useCreateLineItem(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LineItemCreateInput) =>
      fetchJson(`${BASE}/${invoiceId}/line-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-line-items', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export function useUpdateLineItem(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LineItemUpdateInput }) =>
      fetchJson(`${BASE}/${invoiceId}/line-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-line-items', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export function useDeleteLineItem(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lineItemId: string) =>
      fetchJson(`${BASE}/${invoiceId}/line-items/${lineItemId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-line-items', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

// ── Allocations ─────────────────────────────────────────────────────────────

type AllocationItem = {
  id?: string
  job_id?: string | null
  cost_code_id?: string | null
  phase?: string | null
  amount: number
  percent?: number | null
  po_id?: string | null
  change_order_id?: string | null
  description?: string | null
  sort_order?: number
}

export function useInvoiceAllocations(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice-allocations', invoiceId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/allocations`),
    enabled: !!invoiceId,
  })
}

export function useSaveAllocations(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (allocations: AllocationItem[]) =>
      fetchJson(`${BASE}/${invoiceId}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-allocations', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

// ── Approvals ───────────────────────────────────────────────────────────────

type ApprovalAction = {
  action: 'approved' | 'rejected' | 'delegated' | 'escalated'
  notes?: string | null
  delegated_to?: string
  escalation_reason?: string
}

export function useInvoiceApprovals(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice-approvals', invoiceId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/approvals`),
    enabled: !!invoiceId,
  })
}

export function useApprovalAction(invoiceId: string, approvalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ApprovalAction) =>
      fetchJson(`${BASE}/${invoiceId}/approvals/${approvalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-approvals', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

// ── Disputes ────────────────────────────────────────────────────────────────

type DisputeCreateInput = {
  dispute_type: DisputeType
  disputed_amount: number
  reason_category: DisputeReasonCategory
  reason_description: string
}

type DisputeResolveInput = {
  status: 'resolved_adjusted' | 'resolved_voided' | 'resolved_credit_memo' | 'resolved_as_is' | 'closed'
  resolution_notes: string
  adjusted_amount?: number | null
  credit_memo_id?: string | null
}

export function useInvoiceDisputes(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice-disputes', invoiceId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/disputes`),
    enabled: !!invoiceId,
  })
}

export function useCreateDispute(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DisputeCreateInput) =>
      fetchJson(`${BASE}/${invoiceId}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-disputes', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export function useResolveDispute(invoiceId: string, disputeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DisputeResolveInput) =>
      fetchJson(`${BASE}/${invoiceId}/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-disputes', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

// ── Dispute Communications ──────────────────────────────────────────────────

type DisputeCommInput = {
  message: string
  is_internal?: boolean
  sender_type?: 'user' | 'vendor' | 'system'
  attachments?: unknown[]
}

export function useDisputeComms(invoiceId: string | null, disputeId: string | null) {
  return useQuery({
    queryKey: ['dispute-comms', disputeId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/disputes/${disputeId}/communications`),
    enabled: !!invoiceId && !!disputeId,
  })
}

export function useAddDisputeComm(invoiceId: string, disputeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DisputeCommInput) =>
      fetchJson(`${BASE}/${invoiceId}/disputes/${disputeId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispute-comms', disputeId] })
    },
  })
}

// ── Vendor Credits ──────────────────────────────────────────────────────────

type VendorCreditListParams = {
  page?: number
  limit?: number
  vendor_id?: string
  status?: VendorCreditStatus
  q?: string
}

type VendorCreditCreateInput = {
  vendor_id: string
  credit_number?: string | null
  original_invoice_id?: string | null
  original_po_id?: string | null
  amount: number
  reason: string
}

const VENDOR_CREDITS_BASE = '/api/v2/vendor-credits'

export function useVendorCredits(params: VendorCreditListParams = {}) {
  const searchParams = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val))
    }
  }
  const qs = searchParams.toString()
  const url = `${VENDOR_CREDITS_BASE}${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['vendor-credits', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateVendorCredit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VendorCreditCreateInput) =>
      fetchJson(VENDOR_CREDITS_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-credits'] })
    },
  })
}

// ── Retainage Rules ─────────────────────────────────────────────────────────

type RetainageRuleListParams = {
  page?: number
  limit?: number
  scope?: string
  job_id?: string
  vendor_id?: string
  is_active?: boolean
}

const RETAINAGE_RULES_BASE = '/api/v2/retainage-rules'

export function useRetainageRules(params: RetainageRuleListParams = {}) {
  const searchParams = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val))
    }
  }
  const qs = searchParams.toString()
  const url = `${RETAINAGE_RULES_BASE}${qs ? `?${qs}` : ''}`

  return useQuery({
    queryKey: ['retainage-rules', params],
    queryFn: () => fetchJson(url),
  })
}

export function useCreateRetainageRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(RETAINAGE_RULES_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retainage-rules'] })
    },
  })
}

export function useUpdateRetainageRule(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`${RETAINAGE_RULES_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['retainage-rules'] })
    },
  })
}

// ── Payment Prerequisites ───────────────────────────────────────────────────

export function usePaymentPrereqs(invoiceId: string | null) {
  return useQuery({
    queryKey: ['payment-prereqs', invoiceId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/prerequisites`),
    enabled: !!invoiceId,
  })
}

export function useCreatePaymentPrereq(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { prerequisite_type: string; label: string; notes?: string | null }) =>
      fetchJson(`${BASE}/${invoiceId}/prerequisites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, invoice_id: invoiceId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-prereqs', invoiceId] })
    },
  })
}

export function useTogglePrereq(invoiceId: string, prereqId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (isMet: boolean) =>
      fetchJson(`${BASE}/${invoiceId}/prerequisites/${prereqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_met: isMet }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-prereqs', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

// ── Duplicate Detection ────────────────────────────────────────────────────

export function useCheckDuplicate(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`${BASE}/${invoiceId}/check-duplicate`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export function useRegisterHash(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`${BASE}/${invoiceId}/register-hash`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

// ── PDF Stamping ───────────────────────────────────────────────────────────
export function useStampInvoice(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`${BASE}/${invoiceId}/stamp`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

// ── Batch Approval ─────────────────────────────────────────────────────────

export function useBatchApprove() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { invoice_ids: string[]; action: 'approved' | 'denied'; notes?: string }) =>
      fetchJson(`${BASE}/batch-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

// ── Approval Chains ────────────────────────────────────────────────────────

const CHAINS_BASE = '/api/v2/approval-chains'

export function useApprovalChains(params: { chain_type?: string; is_active?: boolean } = {}) {
  const searchParams = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val))
    }
  }
  const qs = searchParams.toString()
  return useQuery({
    queryKey: ['approval-chains', params],
    queryFn: () => fetchJson(`${CHAINS_BASE}${qs ? `?${qs}` : ''}`),
  })
}

export function useApprovalChain(id: string | null) {
  return useQuery({
    queryKey: ['approval-chains', id],
    queryFn: () => fetchJson(`${CHAINS_BASE}/${id}`),
    enabled: !!id,
  })
}

export function useCreateApprovalChain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(CHAINS_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approval-chains'] })
    },
  })
}

export function useUpdateApprovalChain(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`${CHAINS_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approval-chains'] })
    },
  })
}

export function useDeleteApprovalChain(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`${CHAINS_BASE}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approval-chains'] })
    },
  })
}

// ── AI Extractions ─────────────────────────────────────────────────────────

export function useExtractions(params: { status?: string; page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val))
    }
  }
  const qs = searchParams.toString()
  return useQuery({
    queryKey: ['extractions', params],
    queryFn: () => fetchJson(`${BASE}/extractions${qs ? `?${qs}` : ''}`),
  })
}

export function useExtraction(id: string | null) {
  return useQuery({
    queryKey: ['extractions', id],
    queryFn: () => fetchJson(`${BASE}/extractions/${id}`),
    enabled: !!id,
  })
}

export function useUploadInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return fetchJson(`${BASE}/extract`, {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] })
    },
  })
}

export interface BatchUploadResultItem {
  filename: string
  extraction_id: string | null
  status: 'processing' | 'error'
  file_url: string | null
  error?: string
}

export interface BatchUploadResponse {
  data: {
    total: number
    successful: number
    failed: number
    items: BatchUploadResultItem[]
  }
  requestId: string
}

export function useUploadInvoiceBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }
      return fetchJson<BatchUploadResponse>(`${BASE}/extract/batch`, {
        method: 'POST',
        body: formData,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] })
    },
  })
}

export interface DuplicateWarning {
  has_duplicate: boolean
  match_type: string | null
  confidence: number | null
  duplicate_invoice_id: string | null
  duplicate_invoice_number: string | null
  duplicate_amount: number | null
  reason: string | null
}

export class DuplicateError extends Error {
  duplicate: DuplicateWarning
  hint: string
  constructor(message: string, duplicate: DuplicateWarning, hint: string) {
    super(message)
    this.name = 'DuplicateError'
    this.duplicate = duplicate
    this.hint = hint
  }
}

export function useConfirmExtraction(extractionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { corrections?: Record<string, unknown>; vendor_id?: string; job_id?: string; cost_code_id?: string; force?: boolean }) => {
      const res = await fetch(`${BASE}/extractions/${extractionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (res.status === 409 && body.duplicate) {
        throw new DuplicateError(body.message, body.duplicate, body.hint)
      }
      if (!res.ok) {
        throw new Error(body.message || `Request failed: ${res.status}`)
      }
      return body
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useRejectExtraction(extractionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { reason?: string }) => {
      const res = await fetch(`${BASE}/extractions/${extractionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body.message || `Request failed: ${res.status}`)
      }
      return body
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] })
    },
  })
}

export function useExtractionMetrics() {
  return useQuery({
    queryKey: ['extraction-metrics'],
    queryFn: () => fetchJson(`${BASE}/extractions/metrics`),
    staleTime: 60_000, // Cache for 1 minute
  })
}

// ---------------------------------------------------------------------------
// Invoice Activity
// ---------------------------------------------------------------------------

export function useInvoiceActivity(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice-activity', invoiceId],
    queryFn: () => fetchJson(`${BASE}/${invoiceId}/activity`),
    enabled: !!invoiceId,
    staleTime: 30_000,
  })
}

export function useRecordActivity(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { action: string; details?: Record<string, unknown> }) => {
      const res = await fetch(`/api/v2/invoices/${invoiceId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to record activity')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-activity', invoiceId] })
    },
  })
}

// ---------------------------------------------------------------------------
// Invoice Status Change (with stamping)
// ---------------------------------------------------------------------------

export function useChangeInvoiceStatus(invoiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { status: string; approved_by?: string }) => {
      const res = await fetch(`/api/v2/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoice-activity', invoiceId] })
    },
  })
}

// ── Batch Extraction Review ─────────────────────────────────────────────────

export function useBatchConfirmExtractions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { extraction_ids: string[]; force?: boolean }) =>
      fetchJson('/api/v2/invoices/extractions/batch/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useBatchRejectExtractions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { extraction_ids: string[]; reason?: string }) =>
      fetchJson('/api/v2/invoices/extractions/batch/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extractions'] })
    },
  })
}

