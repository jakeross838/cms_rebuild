'use client'

/**
 * Job Photos React Query Hooks
 *
 * Covers: job photos CRUD.
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Job Photos ──────────────────────────────────────────────────────────────

type JobPhotoListParams = {
  page?: number
  limit?: number
  job_id?: string
  category?: string
  q?: string
}

type JobPhotoCreateInput = {
  job_id: string
  title: string
  photo_url: string
  description?: string | null
  category?: string | null
  location?: string | null
  taken_by?: string | null
  taken_date?: string | null
  notes?: string | null
}

const jobPhotoHooks = createApiHooks<JobPhotoListParams, JobPhotoCreateInput>(
  'job-photos',
  '/api/v2/job-photos'
)

export const useJobPhotos = jobPhotoHooks.useList
export const useJobPhoto = jobPhotoHooks.useDetail
export const useCreateJobPhoto = jobPhotoHooks.useCreate
export const useUpdateJobPhoto = jobPhotoHooks.useUpdate
export const useDeleteJobPhoto = jobPhotoHooks.useDelete
