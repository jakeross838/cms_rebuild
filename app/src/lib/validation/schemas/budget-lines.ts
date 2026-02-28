import { z } from 'zod'

export const listBudgetLinesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  job_id: z.string().uuid().optional(),
  budget_id: z.string().uuid().optional(),
  phase: z.string().optional(),
  q: z.string().optional(),
})

export const createBudgetLineSchema = z.object({
  job_id: z.string().uuid(),
  description: z.string().min(1),
  phase: z.string().optional().nullable(),
  cost_code_id: z.string().uuid().optional().nullable(),
  estimated_amount: z.number().optional().default(0),
  notes: z.string().optional().nullable(),
})

export const updateBudgetLineSchema = z.object({
  description: z.string().min(1).optional(),
  phase: z.string().optional().nullable(),
  cost_code_id: z.string().uuid().optional().nullable(),
  estimated_amount: z.number().optional(),
  actual_amount: z.number().optional(),
  committed_amount: z.number().optional(),
  projected_amount: z.number().optional(),
  variance_amount: z.number().optional(),
  notes: z.string().optional().nullable(),
})
