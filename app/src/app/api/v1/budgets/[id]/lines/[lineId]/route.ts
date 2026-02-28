/**
 * Budget Lines API — Get, Update & Delete
 *
 * GET    /api/v1/budgets/[id]/lines/[lineId] — Get a single budget line
 * PATCH  /api/v1/budgets/[id]/lines/[lineId] — Update a budget line
 * DELETE /api/v1/budgets/[id]/lines/[lineId] — Delete a budget line
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateBudgetLineSchema } from '@/lib/validation/schemas/budget'
import type { BudgetLine } from '@/types/budget'

function extractId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/budgets/[id]/lines/[lineId] ─────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const budgetId = extractId(req, 'budgets')
    const lineId = extractId(req, 'lines')

    if (!budgetId || !uuidSchema.safeParse(budgetId).success || !lineId || !uuidSchema.safeParse(lineId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: line, error } = await supabase
      .from('budget_lines')
      .select('*')
      .eq('id', lineId)
      .eq('budget_id', budgetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: BudgetLine | null; error: { message: string } | null }

    if (error || !line) {
      logger.warn('Budget line not found', { lineId, budgetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget line not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: line, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── PATCH /api/v1/budgets/[id]/lines/[lineId] ──────────────────────────

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const budgetId = extractId(req, 'budgets')
    const lineId = extractId(req, 'lines')

    if (!budgetId || !uuidSchema.safeParse(budgetId).success || !lineId || !uuidSchema.safeParse(lineId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const supabase = await createClient()

    // Verify budget is not locked
    const { data: budgetCheck } = await supabase
      .from('budgets')
      .select('id, status')
      .eq('id', budgetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; status: string } | null; error: unknown }

    if (!budgetCheck) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (budgetCheck.status === 'locked') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Cannot edit lines in a locked budget', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('budget_lines')
      .update(updateData as never)
      .eq('id', lineId)
      .eq('budget_id', budgetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: BudgetLine | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update budget line', { error: updateError?.message, lineId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Budget line updated', { lineId, budgetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: updateBudgetLineSchema,
    permission: 'jobs:update:all',
    auditAction: 'budget_line.update',
  }
)

// ── DELETE /api/v1/budgets/[id]/lines/[lineId] ──────────────────────────

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const budgetId = extractId(req, 'budgets')
    const lineId = extractId(req, 'lines')

    if (!budgetId || !uuidSchema.safeParse(budgetId).success || !lineId || !uuidSchema.safeParse(lineId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Budget lines are detail rows — hard delete is appropriate
    const { error } = await supabase
      .from('budget_lines')
      .delete()
      .eq('id', lineId)
      .eq('budget_id', budgetId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      logger.error('Failed to delete budget line', { error: error.message, lineId })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Budget line deleted', { lineId, budgetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: { id: lineId }, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    permission: 'jobs:delete:all',
    auditAction: 'budget_line.delete',
  }
)
