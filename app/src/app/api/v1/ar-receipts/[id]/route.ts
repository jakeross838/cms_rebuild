/**
 * AR Receipts API — Get & Void
 *
 * GET   /api/v1/ar-receipts/[id] — Get a single AR receipt with applications
 * PATCH /api/v1/ar-receipts/[id] — Void an AR receipt (status → voided)
 *
 * Note: AR receipts are voided, not soft-deleted.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import type { ArReceipt, ArReceiptApplication } from '@/types/accounting'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/ar-receipts/[id] ─────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ar-receipts')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AR receipt ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: receipt, error } = await supabase
      .from('ar_receipts')
      .select('*, clients!left(id, name), ar_receipt_applications(*)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: (ArReceipt & { ar_receipt_applications: ArReceiptApplication[] }) | null; error: { message: string } | null }

    if (error || !receipt) {
      logger.warn('AR receipt not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'AR receipt not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: receipt, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── PATCH /api/v1/ar-receipts/[id] — Void receipt ───────────────────────

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ar-receipts')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AR receipt ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('ar_receipts')
      .select('id, status')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string; status: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'AR receipt not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'voided') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Receipt is already voided', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await (supabase
      .from('ar_receipts')
      .update({
        status: 'voided',
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: ArReceipt | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to void AR receipt', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('AR receipt voided', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin'],
    permission: 'jobs:update:all',
    auditAction: 'ar_receipt.void',
  }
)
