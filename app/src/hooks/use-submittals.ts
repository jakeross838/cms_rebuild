'use client'

/**
 * Module 27: Submittal Management React Query Hooks
 *
 * Covers: submittals CRUD.
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Submittals ──────────────────────────────────────────────────────────────

type SubmittalListParams = {
  page?: number
  limit?: number
  job_id?: string
  status?: string
  submittal_type?: string
  q?: string
}

type SubmittalCreateInput = {
  job_id: string
  submittal_number?: string | null
  title: string
  spec_section?: string | null
  status?: string
  description?: string | null
  required_date?: string | null
  submission_date?: string | null
  submitted_to?: string | null
  priority?: string
  notes?: string | null
}

const submittalHooks = createApiHooks<SubmittalListParams, SubmittalCreateInput>(
  'submittals',
  '/api/v2/submittals'
)

export const useSubmittals = submittalHooks.useList
export const useSubmittal = submittalHooks.useDetail
export const useCreateSubmittal = submittalHooks.useCreate
export const useUpdateSubmittal = submittalHooks.useUpdate
export const useDeleteSubmittal = submittalHooks.useDelete
