import { z } from 'zod'

import {
  nameSchema,
  descriptionSchema,
  moneySchema,
  uuidSchema,
  addressSchema,
  paginationSchema,
  createSortSchema,
} from './common'

// ============================================================================
// Enums
// ============================================================================

export const jobStatusEnum = z.enum([
  'lead',
  'pre_construction',
  'active',
  'on_hold',
  'completed',
  'warranty',
  'closed',
  'cancelled',
])

export const contractTypeEnum = z.enum([
  'fixed_price',
  'cost_plus',
  'time_materials',
])

export const projectTypeEnum = z.enum([
  'new_construction',
  'renovation',
  'addition',
  'remodel',
  'commercial',
  'other',
])

// ============================================================================
// Create Job
// ============================================================================

export const createJobSchema = z.object({
  name: nameSchema,
  client_id: uuidSchema.optional().nullable(),
  job_number: z.string().trim().max(50).optional().nullable(),
  description: descriptionSchema.nullable(),
  ...addressSchema.shape,
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  project_type: projectTypeEnum.default('new_construction'),
  status: jobStatusEnum.default('pre_construction'),
  contract_type: contractTypeEnum.default('fixed_price'),
  contract_amount: moneySchema.optional().nullable(),
  cost_plus_markup: z.coerce.number().min(0).max(100).optional().nullable(),
  start_date: z.string().optional().nullable(),
  target_completion: z.string().optional().nullable(),
  actual_completion: z.string().optional().nullable(),
  sqft_conditioned: z.coerce.number().int().nonnegative().optional().nullable(),
  sqft_total: z.coerce.number().int().nonnegative().optional().nullable(),
  sqft_garage: z.coerce.number().int().nonnegative().optional().nullable(),
  bedrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  bathrooms: z.coerce.number().nonnegative().optional().nullable(),
  stories: z.coerce.number().nonnegative().optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
})

// ============================================================================
// Update Job
// ============================================================================

export const updateJobSchema = createJobSchema.partial()

// ============================================================================
// List Jobs (query params)
// ============================================================================

const jobSortSchema = createSortSchema([
  'updated_at',
  'name',
  'created_at',
  'status',
  'start_date',
  'job_number',
] as const)

export const listJobsSchema = paginationSchema
  .merge(jobSortSchema)
  .extend({
    status: jobStatusEnum.optional(),
    contract_type: contractTypeEnum.optional(),
    project_type: projectTypeEnum.optional(),
    client_id: uuidSchema.optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })

// ============================================================================
// Inferred Types
// ============================================================================

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type ListJobsInput = z.infer<typeof listJobsSchema>
