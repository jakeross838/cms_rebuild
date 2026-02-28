'use client'

/**
 * Module 06: Document Storage React Query Hooks
 *
 * Covers: documents (files) CRUD.
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Documents ───────────────────────────────────────────────────────────────

type DocumentListParams = {
  page?: number
  limit?: number
  job_id?: string
  folder?: string
  file_type?: string
  q?: string
}

type DocumentCreateInput = {
  job_id?: string | null
  file_name: string
  file_type?: string | null
  file_size?: number | null
  storage_path?: string | null
  folder?: string | null
  description?: string | null
  uploaded_by?: string | null
  tags?: string | null
}

const documentHooks = createApiHooks<DocumentListParams, DocumentCreateInput>(
  'documents',
  '/api/v2/documents'
)

export const useDocuments = documentHooks.useList
export const useDocument = documentHooks.useDetail
export const useCreateDocument = documentHooks.useCreate
export const useUpdateDocument = documentHooks.useUpdate
export const useDeleteDocument = documentHooks.useDelete
