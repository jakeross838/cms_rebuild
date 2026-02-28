'use client'

/**
 * Module 03: Vendors React Query Hooks
 */

import { createApiHooks } from '@/hooks/use-api'

type VendorListParams = {
  page?: number
  limit?: number
  status?: string
  trade?: string
  q?: string
}

type VendorCreateInput = {
  name: string
  trade?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  tax_id?: string | null
  notes?: string | null
}

const vendorHooks = createApiHooks<VendorListParams, VendorCreateInput>(
  'vendors',
  '/api/v1/vendors'
)

export const useVendors = vendorHooks.useList
export const useVendor = vendorHooks.useDetail
export const useCreateVendor = vendorHooks.useCreate
export const useUpdateVendor = vendorHooks.useUpdate
export const useDeleteVendor = vendorHooks.useDelete
