'use client'

/**
 * Module 03: Jobs React Query Hooks
 */

import { createApiHooks } from '@/hooks/use-api'

type JobListParams = {
  page?: number
  limit?: number
  status?: string
  client_id?: string
  q?: string
}

type JobCreateInput = {
  name: string
  job_number?: string | null
  client_id?: string | null
  status?: string
  start_date?: string | null
  target_completion?: string | null
  contract_amount?: number | null
  description?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
}

const jobHooks = createApiHooks<JobListParams, JobCreateInput>(
  'jobs',
  '/api/v1/jobs'
)

export const useJobs = jobHooks.useList
export const useJob = jobHooks.useDetail
export const useCreateJob = jobHooks.useCreate
export const useUpdateJob = jobHooks.useUpdate
export const useDeleteJob = jobHooks.useDelete
