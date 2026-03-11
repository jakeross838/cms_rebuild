/**
 * Reject Draw Request — Pending Review → Rejected
 *
 * POST /api/v2/draw-requests/:id/reject — Reject a pending draw request
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { logger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { rejectDrawRequestSchema } from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// POST /api/v2/draw-requests/:id/reject
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /draw-requests/:id/reject
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = rejectDrawRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid rejection data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify draw exists and is in pending_review status
    const { data: existing, error: existingError } = await supabase
      .from('draw_requests')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Draw request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot reject a draw request with status "${existing.status}". Only pending_review draws can be rejected.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Update status to rejected, store reason in notes
    const now = new Date().toISOString()
    const updatePayload: Record<string, unknown> = {
      status: 'rejected',
      notes: input.reason ?? null,
      updated_at: now,
      rejected_at: now,
    }

    const { data: draw, error } = await supabase
      .from('draw_requests')
      .update(updatePayload)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('id, company_id, job_id, draw_number, application_date, period_to, status, contract_amount, total_completed, retainage_pct, retainage_amount, total_earned, less_previous, current_due, balance_to_finish, submitted_by, submitted_at, approved_by, approved_at, lender_reference, notes, created_at, updated_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Record in history (non-blocking)
    const { error: historyErr } = await supabase
      .from('draw_request_history')
      .insert({
        draw_request_id: id,
        action: 'rejected',
        details: { reason: input.reason ?? null },
        performed_by: ctx.user!.id,
      })
    if (historyErr) logger.error('Failed to record draw request history', { error: historyErr.message })

    return NextResponse.json({ data: draw, requestId: ctx.requestId })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm'], rateLimit: 'financial', auditAction: 'draw_request.reject' }
)
