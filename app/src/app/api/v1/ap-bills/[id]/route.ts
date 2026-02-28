/**
 * AP Bills API — Get, Update & Delete Single Bill
 *
 * GET    /api/v1/ap-bills/[id] — Get a single AP bill with lines
 * PATCH  /api/v1/ap-bills/[id] — Update an AP bill
 * DELETE /api/v1/ap-bills/[id] — Soft-delete an AP bill
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateBillSchema } from '@/lib/validation/schemas/accounting'
import type { ApBill, ApBillLine } from '@/types/accounting'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/ap-bills/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ap-bills')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AP bill ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: bill, error } = await supabase
      .from('ap_bills')
      .select('*, vendors!left(id, name), ap_bill_lines(*)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: (ApBill & { ap_bill_lines: ApBillLine[] }) | null; error: { message: string } | null }

    if (error || !bill) {
      logger.warn('AP bill not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'AP bill not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: bill, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// PATCH /api/v1/ap-bills/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ap-bills')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AP bill ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const { lines, ...billData } = body as { lines?: Record<string, unknown>[]; [key: string]: unknown }

    const supabase = await createClient()

    // Verify exists and not soft-deleted
    const { data: existing, error: fetchError } = await supabase
      .from('ap_bills')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'AP bill not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: updated, error: updateError } = await (supabase
      .from('ap_bills')
      .update({
        ...billData,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: ApBill | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update AP bill', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Replace lines if provided
    let updatedLines: ApBillLine[] | null = null
    if (lines && lines.length > 0) {
      await supabase.from('ap_bill_lines').delete().eq('bill_id', targetId)

      const lineInserts = lines.map((line) => ({ ...line, bill_id: targetId }))

      const { data: newLines, error: linesError } = await (supabase
        .from('ap_bill_lines')
        .insert(lineInserts as never)
        .select() as unknown as Promise<{ data: ApBillLine[] | null; error: { message: string } | null }>)

      if (linesError) {
        logger.error('Failed to replace AP bill lines', { error: linesError.message, targetId })
        const mapped = mapDbError(linesError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
      updatedLines = newLines
    }

    logger.info('AP bill updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({
      data: updatedLines ? { ...updated, lines: updatedLines } : updated,
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: updateBillSchema,
    permission: 'jobs:update:all',
    auditAction: 'ap_bill.update',
  }
)

// ============================================================================
// DELETE /api/v1/ap-bills/[id] — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ap-bills')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AP bill ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('ap_bills')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('AP bill not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'AP bill not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('AP bill soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin'],
    permission: 'jobs:delete:all',
    auditAction: 'ap_bill.delete',
  }
)
