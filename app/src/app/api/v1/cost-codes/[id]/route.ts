/**
 * Cost Codes API — Get, Update & Delete Single Cost Code
 *
 * GET    /api/v1/cost-codes/[id] — Get a single cost code by ID
 * PATCH  /api/v1/cost-codes/[id] — Update a cost code
 * DELETE /api/v1/cost-codes/[id] — Soft-delete a cost code
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateCostCodeSchema, type UpdateCostCodeInput } from '@/lib/validation/schemas/cost-codes'
import type { CostCode } from '@/types/database'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/cost-codes/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'cost-codes')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid cost code ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: costCode, error } = await supabase
      .from('cost_codes')
      .select('*')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: CostCode | null; error: { message: string } | null }

    if (error || !costCode) {
      logger.warn('Cost code not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Cost code not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: costCode, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    permission: 'cost_codes:read:all',
  }
)

// ============================================================================
// PATCH /api/v1/cost-codes/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'cost-codes')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid cost code ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as UpdateCostCodeInput
    const supabase = await createClient()

    // Verify exists
    const { data: existing, error: fetchError } = await supabase
      .from('cost_codes')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Cost code not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await (supabase
      .from('cost_codes')
      .update(updateData as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: CostCode | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update cost code', { error: updateError?.message, targetId })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update cost code', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    logger.info('Cost code updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    schema: updateCostCodeSchema,
    permission: 'cost_codes:update:all',
    auditAction: 'cost_code.update',
  }
)

// ============================================================================
// DELETE /api/v1/cost-codes/[id] — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'cost-codes')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid cost code ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('cost_codes')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('Cost code not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'Cost code not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('Cost code soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'cost_codes:delete:all',
    auditAction: 'cost_code.delete',
  }
)
