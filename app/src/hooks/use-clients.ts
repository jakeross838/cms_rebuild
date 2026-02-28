'use client'

/**
 * Module 03: Clients React Query Hooks
 */

import { createApiHooks } from '@/hooks/use-api'

type ClientListParams = {
  page?: number
  limit?: number
  status?: string
  q?: string
}

type ClientCreateInput = {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  notes?: string | null
  type?: string | null
}

const clientHooks = createApiHooks<ClientListParams, ClientCreateInput>(
  'clients',
  '/api/v1/clients'
)

export const useClients = clientHooks.useList
export const useClient = clientHooks.useDetail
export const useCreateClient = clientHooks.useCreate
export const useUpdateClient = clientHooks.useUpdate
export const useDeleteClient = clientHooks.useDelete
