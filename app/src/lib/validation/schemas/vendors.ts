import { z } from 'zod'

import {
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  paginationSchema,
  createSortSchema,
} from './common'

// ============================================================================
// Create Vendor
// ============================================================================

export const createVendorSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  ...addressSchema.shape,
  trade: z.string().trim().max(100).optional().nullable(),
  tax_id: z.string().trim().max(20).optional().nullable(),
  is_active: z.boolean().default(true),
  notes: z.string().trim().max(5000).optional().nullable(),
})

// ============================================================================
// Update Vendor
// ============================================================================

export const updateVendorSchema = createVendorSchema.partial()

// ============================================================================
// List Vendors (query params)
// ============================================================================

const vendorSortSchema = createSortSchema([
  'name',
  'created_at',
  'updated_at',
] as const)

export const listVendorsSchema = paginationSchema
  .merge(vendorSortSchema)
  .extend({
    search: z.string().optional(),
    trade: z.string().optional(),
  })

// ============================================================================
// Inferred Types
// ============================================================================

export type CreateVendorInput = z.infer<typeof createVendorSchema>
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>
export type ListVendorsInput = z.infer<typeof listVendorsSchema>
