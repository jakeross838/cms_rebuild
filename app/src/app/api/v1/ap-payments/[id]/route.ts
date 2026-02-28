/**
 * AP Payments API — Get & Void
 *
 * GET   /api/v1/ap-payments/[id] — Get a single AP payment with applications
 * PATCH /api/v1/ap-payments/[id] — Void an AP payment (status → voided)
 *
 * Note: AP payments are voided, not soft-deleted.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation/schemas/common'
import type { ApPayment, ApPaymentApplication } from '@/types/accounting'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ── GET /api/v1/ap-payments/[id] ─────────────────────────────────────────

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ap-payments')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AP payment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: payment, error } = await supabase
      .from('ap_payments')
      .select('*, vendors!left(id, name), ap_payment_applications(*)')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: (ApPayment & { ap_payment_applications: ApPaymentApplication[] }) | null; error: { message: string } | null }

    if (error || !payment) {
      logger.warn('AP payment not found', { targetId })
      return NextResponse.json(
        { error: 'Not Found', message: 'AP payment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: payment, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ── PATCH /api/v1/ap-payments/[id] — Void payment ───────────────────────

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const targetId = extractEntityId(req, 'ap-payments')
    if (!targetId || !uuidSchema.safeParse(targetId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid AP payment ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify exists and belongs to company
    const { data: existing, error: fetchError } = await supabase
      .from('ap_payments')
      .select('id, status')
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .single() as { data: { id: string; status: string } | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'AP payment not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'voided') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Payment is already voided', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await (supabase
      .from('ap_payments')
      .update({
        status: 'voided',
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', targetId)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as Promise<{ data: ApPayment | null; error: { message: string } | null }>)

    if (updateError || !updated) {
      logger.error('Failed to void AP payment', { error: updateError?.message, targetId })
      const mapped = mapDbError(updateError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('AP payment voided', { targetId, companyId: ctx.companyId! })

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin'],
    permission: 'jobs:update:all',
    auditAction: 'ap_payment.void',
  }
)
