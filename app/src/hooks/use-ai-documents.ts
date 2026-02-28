'use client'

/**
 * Module 24: AI Document Processing React Query Hooks
 *
 * Covers: document classifications, extraction templates,
 * document extractions, processing queue, AI feedback.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  DocumentClassification,
  ExtractionTemplate,
  DocumentExtraction,
  DocumentProcessingQueue,
  AiFeedback,
} from '@/types/ai-document-processing'

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Document Classifications ────────────────────────────────────────────────

type ClassificationListParams = {
  page?: number
  limit?: number
  classified_type?: string
  document_id?: string
  q?: string
}

type ClassificationCreateInput = {
  document_id: string
  classified_type: string
  confidence_score?: number
  model_version?: string | null
  metadata?: Record<string, unknown>
}

const classificationHooks = createApiHooks<ClassificationListParams, ClassificationCreateInput>(
  'ai-classifications',
  '/api/v2/ai-documents/classifications'
)

export const useDocumentClassifications = classificationHooks.useList
export const useDocumentClassification = classificationHooks.useDetail
export const useCreateDocumentClassification = classificationHooks.useCreate
export const useUpdateDocumentClassification = classificationHooks.useUpdate
export const useDeleteDocumentClassification = classificationHooks.useDelete

// ── Extraction Templates ────────────────────────────────────────────────────

type TemplateListParams = {
  page?: number
  limit?: number
  document_type?: string
  is_active?: boolean
  q?: string
}

type TemplateCreateInput = {
  name: string
  document_type: string
  field_definitions: Record<string, unknown>[]
  is_active?: boolean
}

const templateHooks = createApiHooks<TemplateListParams, TemplateCreateInput>(
  'ai-templates',
  '/api/v2/ai-documents/templates'
)

export const useExtractionTemplates = templateHooks.useList
export const useExtractionTemplate = templateHooks.useDetail
export const useCreateExtractionTemplate = templateHooks.useCreate
export const useUpdateExtractionTemplate = templateHooks.useUpdate
export const useDeleteExtractionTemplate = templateHooks.useDelete

// ── Document Extractions ────────────────────────────────────────────────────

type ExtractionListParams = {
  page?: number
  limit?: number
  status?: string
  document_id?: string
  classification_id?: string
}

type ExtractionCreateInput = {
  document_id: string
  classification_id?: string | null
  extraction_template_id?: string | null
  extracted_data?: Record<string, unknown>
  status?: string
}

const extractionHooks = createApiHooks<ExtractionListParams, ExtractionCreateInput>(
  'ai-extractions',
  '/api/v2/ai-documents/extractions'
)

export const useDocumentExtractions = extractionHooks.useList
export const useDocumentExtraction = extractionHooks.useDetail
export const useCreateDocumentExtraction = extractionHooks.useCreate
export const useUpdateDocumentExtraction = extractionHooks.useUpdate
export const useDeleteDocumentExtraction = extractionHooks.useDelete

// ── Extraction Feedback ─────────────────────────────────────────────────────

export function useExtractionFeedback(extractionId: string | null, params?: { page?: number; limit?: number }) {
  return useQuery<{ data: AiFeedback[]; total: number }>({
    queryKey: ['ai-feedback', extractionId, params],
    queryFn: () =>
      fetchJson(`/api/v2/ai-documents/extractions/${extractionId}/feedback${buildQs(params)}`),
    enabled: !!extractionId,
  })
}

export function useCreateExtractionFeedback(extractionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/ai-documents/extractions/${extractionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-feedback', extractionId] })
      qc.invalidateQueries({ queryKey: ['ai-extractions'] })
    },
  })
}

// ── Processing Queue ────────────────────────────────────────────────────────

type QueueListParams = {
  page?: number
  limit?: number
  status?: string
  priority?: number
}

type QueueCreateInput = {
  document_id: string
  priority?: number
  max_attempts?: number
}

const queueHooks = createApiHooks<QueueListParams, QueueCreateInput>(
  'ai-queue',
  '/api/v2/ai-documents/queue'
)

export const useProcessingQueue = queueHooks.useList
export const useProcessingQueueItem = queueHooks.useDetail
export const useCreateProcessingQueueItem = queueHooks.useCreate
export const useUpdateProcessingQueueItem = queueHooks.useUpdate

export function useCancelProcessingQueueItem(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/v2/ai-documents/queue/${id}/cancel`, {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-queue'] })
    },
  })
}

// ── Extraction Rules (shared with Module 24) ────────────────────────────────

type RuleListParams = {
  page?: number
  limit?: number
  document_type?: string
  is_active?: boolean
}

type RuleCreateInput = {
  name: string
  document_type: string
  field_mappings: Record<string, unknown>
  is_active?: boolean
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
  DocumentClassification,
  ExtractionTemplate,
  DocumentExtraction,
  DocumentProcessingQueue,
  AiFeedback,
}
