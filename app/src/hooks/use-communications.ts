'use client'

/**
 * Communications React Query Hooks
 *
 * Covers: communications CRUD.
 */

import { createApiHooks } from '@/hooks/use-api'

// ── Communications ──────────────────────────────────────────────────────────

type CommunicationListParams = {
  page?: number
  limit?: number
  job_id?: string
  communication_type?: string
  status?: string
  priority?: string
  q?: string
}

type CommunicationCreateInput = {
  job_id: string
  subject: string
  message_body: string
  communication_type?: string
  status?: string
  priority?: string
  recipient?: string | null
  notes?: string | null
}

const communicationHooks = createApiHooks<CommunicationListParams, CommunicationCreateInput>(
  'communications',
  '/api/v2/communications'
)

export const useCommunications = communicationHooks.useList
export const useCommunication = communicationHooks.useDetail
export const useCreateCommunication = communicationHooks.useCreate
export const useUpdateCommunication = communicationHooks.useUpdate
export const useDeleteCommunication = communicationHooks.useDelete
