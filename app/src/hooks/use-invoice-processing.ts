'use client'

/**
 * Module 13: AI Invoice Processing React Query Hooks
 *
 * Covers: invoice extractions, review, bill creation, extraction rules, field mappings.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  InvoiceExtraction,
  ExtractionFieldMapping,
  ExtractionRule,
  InvoiceLineExtraction,
  ReviewDecision,
} from '@/types/invoice-processing'

// ── Invoice Extractions ─────────────────────────────────────────────────────

type ExtractionListParams = {
  page?: number
  limit?: number
  status?: string
  vendor_match_id?: string
  job_match_id?: string
  q?: string
}

type ExtractionCreateInput = {
  document_id: string
  extracted_data?: Record<string, unknown>
  vendor_match_id?: string | null
  job_match_id?: string | null
}

const extractionHooks = createApiHooks<ExtractionListParams, ExtractionCreateInput>(
  'invoice-extractions',
  '/api/v2/invoice-extractions'
)

export const useInvoiceExtractions = extractionHooks.useList
export const useInvoiceExtraction = extractionHooks.useDetail
export const useCreateInvoiceExtraction = extractionHooks.useCreate
export const useUpdateInvoiceExtraction = extractionHooks.useUpdate
export const useDeleteInvoiceExtraction = extractionHooks.useDelete

// ── Review an Extraction ────────────────────────────────────────────────────

/** Submit a review decision (approve/reject) for an extraction */
export function useReviewExtraction(extractionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { decision: ReviewDecision; notes?: string }) =>
      fetchJson(`/api/v2/invoice-extractions/${extractionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-extractions'] })
      qc.invalidateQueries({ queryKey: ['invoice-extractions', extractionId] })
    },
  })
}

// ── Create Bill from Extraction ─────────────────────────────────────────────

/** Create an AP bill from a reviewed extraction */
export function useCreateBillFromExtraction(extractionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) =>
      fetchJson(`/api/v2/invoice-extractions/${extractionId}/create-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data ?? {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice-extractions'] })
      qc.invalidateQueries({ queryKey: ['invoice-extractions', extractionId] })
      qc.invalidateQueries({ queryKey: ['ap-bills'] })
    },
  })
}

// ── Extraction Rules ────────────────────────────────────────────────────────

type RuleListParams = {
  page?: number
  limit?: number
  rule_type?: string
  vendor_id?: string
  is_active?: boolean
  q?: string
}

type RuleCreateInput = {
  vendor_id?: string | null
  rule_type: string
  conditions: Record<string, unknown>
  actions: Record<string, unknown>
  is_active?: boolean
  priority?: number
}

const ruleHooks = createApiHooks<RuleListParams, RuleCreateInput>(
  'extraction-rules',
  '/api/v2/extraction-rules'
)

export const useExtractionRules = ruleHooks.useList
export const useExtractionRule = ruleHooks.useDetail
export const useCreateExtractionRule = ruleHooks.useCreate
export const useUpdateExtractionRule = ruleHooks.useUpdate
export const useDeleteExtractionRule = ruleHooks.useDelete

// ── Re-export types ─────────────────────────────────────────────────────────

export type {
  InvoiceExtraction,
  ExtractionFieldMapping,
  ExtractionRule,
  InvoiceLineExtraction,
  ReviewDecision,
}
