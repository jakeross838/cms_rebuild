/**
 * Module 09: Budget & Cost Tracking Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const budgetStatusEnum = z.enum(['draft', 'active', 'locked', 'archived'])

export const transactionTypeEnum = z.enum(['commitment', 'actual', 'adjustment', 'transfer'])

// ── Budgets ───────────────────────────────────────────────────────────────

export const listBudgetsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  status: budgetStatusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createBudgetSchema = z.object({
  job_id: z.string().uuid(),
  name: z.string().trim().min(1).max(255),
  status: budgetStatusEnum.optional().default('draft'),
  total_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateBudgetSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  status: budgetStatusEnum.optional(),
  total_amount: z.number().min(0).max(9999999999999.99).optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.string().datetime().nullable().optional(),
  version: z.number().int().positive().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Budget Lines ──────────────────────────────────────────────────────────

export const listBudgetLinesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cost_code_id: z.string().uuid().optional(),
  phase: z.string().trim().min(1).max(100).optional(),
})

export const createBudgetLineSchema = z.object({
  cost_code_id: z.string().uuid().nullable().optional(),
  phase: z.string().trim().min(1).max(100).nullable().optional(),
  description: z.string().trim().min(1).max(500),
  estimated_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  committed_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  actual_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  projected_amount: z.number().min(0).max(9999999999999.99).optional().default(0),
  variance_amount: z.number().min(-9999999999999.99).max(9999999999999.99).optional().default(0),
  sort_order: z.number().int().min(0).optional().default(0),
  notes: z.string().trim().max(5000).nullable().optional(),
})

export const updateBudgetLineSchema = z.object({
  cost_code_id: z.string().uuid().nullable().optional(),
  phase: z.string().trim().min(1).max(100).nullable().optional(),
  description: z.string().trim().min(1).max(500).optional(),
  estimated_amount: z.number().min(0).max(9999999999999.99).optional(),
  committed_amount: z.number().min(0).max(9999999999999.99).optional(),
  actual_amount: z.number().min(0).max(9999999999999.99).optional(),
  projected_amount: z.number().min(0).max(9999999999999.99).optional(),
  variance_amount: z.number().min(-9999999999999.99).max(9999999999999.99).optional(),
  sort_order: z.number().int().min(0).optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Cost Transactions ─────────────────────────────────────────────────────

export const createCostTransactionSchema = z.object({
  job_id: z.string().uuid(),
  budget_line_id: z.string().uuid().nullable().optional(),
  cost_code_id: z.string().uuid().nullable().optional(),
  transaction_type: transactionTypeEnum,
  amount: z.number().min(-9999999999999.99).max(9999999999999.99),
  description: z.string().trim().max(2000).nullable().optional(),
  reference_type: z.string().trim().max(50).nullable().optional(),
  reference_id: z.string().uuid().nullable().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  vendor_id: z.string().uuid().nullable().optional(),
})

export const listCostTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  job_id: z.string().uuid().optional(),
  budget_line_id: z.string().uuid().optional(),
  cost_code_id: z.string().uuid().optional(),
  transaction_type: transactionTypeEnum.optional(),
  vendor_id: z.string().uuid().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
})
