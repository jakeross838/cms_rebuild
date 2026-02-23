import { z } from 'zod'

import {
  nameSchema,
  emailSchema,
  phoneSchema,
  moneySchema,
  uuidSchema,
  addressSchema,
  paginationSchema,
  createSortSchema,
} from './common'

// ============================================================================
// Create Vendor
// ============================================================================

export const createVendorSchema = z.object({
  name: nameSchema,
  dba_name: z.string().trim().max(255).optional().nullable(),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  website: z.string().trim().url().max(500).optional().nullable(),
  ...addressSchema.shape,
  trade: z.string().trim().max(100).optional().nullable(),
  trades: z.array(z.string().trim().max(100)).optional().nullable(),
  tax_id: z.string().trim().max(20).optional().nullable(),
  license_number: z.string().trim().max(100).optional().nullable(),
  license_expiration: z.string().optional().nullable(),
  insurance_expiration: z.string().optional().nullable(),
  gl_coverage_amount: moneySchema.optional().nullable(),
  workers_comp_expiration: z.string().optional().nullable(),
  payment_terms: z.string().trim().max(50).default('Net 30'),
  default_cost_code_id: uuidSchema.optional().nullable(),
  is_active: z.boolean().default(true),
  is_1099: z.boolean().default(false),
  w9_on_file: z.boolean().default(false),
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
