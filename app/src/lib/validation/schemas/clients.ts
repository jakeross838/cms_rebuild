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
// Create Client
// ============================================================================

export const createClientSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  ...addressSchema.shape,
  notes: z.string().trim().max(5000).optional().nullable(),
})

// ============================================================================
// Update Client
// ============================================================================

export const updateClientSchema = createClientSchema.partial()

// ============================================================================
// List Clients (query params)
// ============================================================================

const clientSortSchema = createSortSchema([
  'name',
  'created_at',
  'updated_at',
] as const)

export const listClientsSchema = paginationSchema
  .merge(clientSortSchema)
  .extend({
    search: z.string().optional(),
  })

// ============================================================================
// Inferred Types
// ============================================================================

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ListClientsInput = z.infer<typeof listClientsSchema>
