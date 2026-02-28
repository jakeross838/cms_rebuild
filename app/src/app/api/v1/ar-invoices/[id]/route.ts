/**
 * AR Invoices API — Get, Update & Delete Single Invoice
 *
 * GET    /api/v1/ar-invoices/[id] — Get a single AR invoice with lines
 * PATCH  /api/v1/ar-invoices/[id] — Update an AR invoice
 * DELETE /api/v1/ar-invoices/[id] — Soft-delete an AR invoice
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import { updateArInvoiceSchema } from '@/lib/validation/schemas/accounting'
import type { ArInvoice, ArInvoiceLine } from '@/types/accounting'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/ar-invoices/[id]
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ar-invoices')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AR invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('ar_invoices')
      .select('*, clients!left(id, name), ar_invoice_lines(*)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: (ArInvoice & { ar_invoice_lines: ArInvoiceLine[] }) | null; error: { message: string } | null }

    if (error || !invoice) {
      logger.warn('AR invoice not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'AR invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: invoice, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// PATCH /api/v1/ar-invoices/[id]
// ============================================================================

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ar-invoices')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AR invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as Record<string, unknown>
    const { lines, ...invoiceData } = body as { lines?: Record<string, unknown>[]; [key: string]: unknown }

    const supabase = await createClient()

    // Verify exists and not soft-deleted
    const { data: existing, error: fetchError } = await supabase
      .from('ar_invoices')
      .select('id')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'AR invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: updated, error: updateError } = await (supabase
      .from('ar_invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: ArInvoice | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to update AR invoice', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Replace lines if provided
    let updatedLines: ArInvoiceLine[] | null = null
    if (lines && lines.length > 0) {
      await supabase.from('ar_invoice_lines').delete().eq('invoice_id', targetId)

      const lineInserts = lines.map((line) => ({ ...line, invoice_id: targetId }))

      const { data: newLines, error: linesError } = await (supabase
        .from('ar_invoice_lines')
        .insert(lineInserts as never)
        .select() as unknown as Promise<{ data: ArInvoiceLine[] | null; error: { message: string } | null }>)

      if (linesError) {
        logger.error('Failed to replace AR invoice lines', { error: linesError.message, targetId })
        const mapped = mapDbError(linesError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
      updatedLines = newLines
    }

    logger.info('AR invoice updated', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({
      data: updatedLines ? { ...updated, lines: updatedLines } : updated,
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: updateArInvoiceSchema,
    permission: 'jobs:update:all',
    auditAction: 'ar_invoice.update',
  }
)

// ============================================================================
// DELETE /api/v1/ar-invoices/[id] — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ar-invoices')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AR invoice ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: deleted, error } = await (supabase
      .from('ar_invoices')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, deleted_at')
      .single() as unknown as Promise<{ data: { id: string; deleted_at: string } | null; error: { message: string } | null }>)

    if (error || !deleted) {
      logger.warn('AR invoice not found for soft delete', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'AR invoice not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    logger.info('AR invoice soft-deleted', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: deleted, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin'],
    permission: 'jobs:delete:all',
    auditAction: 'ar_invoice.delete',
  }
)
