/**
 * Budgets API — Get, Update & Delete
 *
 * GET    /api/v1/budgets/[id] — Get a single budget with summary
 * PATCH  /api/v1/budgets/[id] — Update a budget
 * DELETE /api/v1/budgets/[id] — Soft-delete a budget
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateBudgetSchema } from '@/lib/validation/schemas/budget'
import type { Budget } from '@/types/budget'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/budgets/[id] ────────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'budgets')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: budget, error } = await supabase
      .from('budgets')
      .select('*, jobs!left(id, name)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: Budget | null; error: { message: string } | null }

    if (error || !budget) {
      logger.warn('Budget not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: budget, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── PATCH /api/v1/budgets/[id] ──────────────────────────────────────────

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'budgets')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('budgets')
      .select('id, status')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string; status: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'locked') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Locked budgets cannot be edited', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('budgets')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: Budget | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update budget', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Budget updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: updateBudgetSchema,
    permission: 'jobs:update:all',
    auditAction: 'budget.update',
  }
)

// ── DELETE /api/v1/budgets/[id] ─────────────────────────────────────────

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'budgets')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('budgets')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('Budget not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('Budget soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin'],
    permission: 'jobs:delete:all',
    auditAction: 'budget.delete',
  }
)
