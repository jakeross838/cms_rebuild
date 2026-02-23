import { z } from 'zod'

import {
  nameSchema,
  descriptionSchema,
  uuidSchema,
  paginationSchema,
  createSortSchema,
} from './common'

// ============================================================================
// Enums
// ============================================================================

export const costCodeCategoryEnum = z.enum([
  'labor',
  'material',
  'subcontractor',
  'equipment',
  'other',
])

// ============================================================================
// Create Cost Code
// ============================================================================

export const createCostCodeSchema = z.object({
  code: z.string().trim().min(1, 'Code is required').max(20),
  division: z.string().trim().min(1, 'Division is required').max(100),
  subdivision: z.string().trim().max(100).optional().nullable(),
  name: nameSchema,
  description: descriptionSchema.nullable(),
  category: costCodeCategoryEnum.default('subcontractor'),
  trade: z.string().trim().max(100).optional().nullable(),
  parent_id: uuidSchema.optional().nullable(),
  sort_order: z.coerce.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
})

// ============================================================================
// Update Cost Code
// ============================================================================

export const updateCostCodeSchema = createCostCodeSchema.partial()

// ============================================================================
// List Cost Codes (query params)
// ============================================================================

const costCodeSortSchema = createSortSchema([
  'code',
  'name',
  'sort_order',
  'created_at',
] as const)

export const listCostCodesSchema = paginationSchema
  .merge(costCodeSortSchema)
  .extend({
    search: z.string().optional(),
    division: z.string().optional(),
    category: costCodeCategoryEnum.optional(),
    is_active: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    parent_id: uuidSchema.optional(),
  })

// ============================================================================
// Inferred Types
// ============================================================================

export type CreateCostCodeInput = z.infer<typeof createCostCodeSchema>
export type UpdateCostCodeInput = z.infer<typeof updateCostCodeSchema>
export type ListCostCodesInput = z.infer<typeof listCostCodesSchema>
