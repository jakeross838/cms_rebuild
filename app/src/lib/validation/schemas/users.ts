import { z } from 'zod'

import { emailSchema, nameSchema, phoneSchema } from './common'

// ============================================================================
// Enums
// ============================================================================

const userRoleEnum = z.enum([
  'owner',
  'admin',
  'pm',
  'superintendent',
  'office',
  'field',
  'read_only',
])

// ============================================================================
// Invite User
// ============================================================================

export const inviteUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  role: userRoleEnum.default('field'),
  phone: phoneSchema.optional(),
})

// ============================================================================
// Update User
// ============================================================================

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  role: userRoleEnum.optional(),
  avatar_url: z.string().url().optional().nullable(),
})

// ============================================================================
// List Users (query params)
// ============================================================================

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: userRoleEnum.optional(),
  status: z.enum(['active', 'inactive', 'all']).default('active'),
  search: z.string().optional(),
})

// ============================================================================
// Inferred Types
// ============================================================================

export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersInput = z.infer<typeof listUsersSchema>
