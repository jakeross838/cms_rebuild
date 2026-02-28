'use client'

/**
 * Module 03: Cost Codes React Query Hooks
 */

import { createApiHooks } from '@/hooks/use-api'

type CostCodeListParams = {
  page?: number
  limit?: number
  division?: string
  q?: string
}

type CostCodeCreateInput = {
  code: string
  name: string
  division?: string | null
  subdivision?: string | null
  category?: string | null
  trade?: string | null
  description?: string | null
  unit_of_measure?: string | null
  default_rate?: number | null
}

const costCodeHooks = createApiHooks<CostCodeListParams, CostCodeCreateInput>(
  'cost-codes',
  '/api/v1/cost-codes'
)

export const useCostCodes = costCodeHooks.useList
export const useCostCode = costCodeHooks.useDetail
export const useCreateCostCode = costCodeHooks.useCreate
export const useUpdateCostCode = costCodeHooks.useUpdate
export const useDeleteCostCode = costCodeHooks.useDelete
