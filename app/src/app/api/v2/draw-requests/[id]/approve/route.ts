/**
 * Approve Draw Request — Pending Review → Approved
 *
 * POST /api/v2/draw-requests/:id/approve — Approve a pending draw request
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { logger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { approveDrawRequestSchema } from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// POST /api/v2/draw-requests/:id/approve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /draw-requests/:id/approve
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = approveDrawRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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
        { error: 'Conflict', message: `Cannot approve a draw request with status "${existing.status}". Only pending_review draws can be approved.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Update status to approved
    const now = new Date().toISOString()
    const { data: draw, error } = await supabase
      .from('draw_requests')
      .update({
        status: 'approved',
        approved_by: ctx.user!.id,
        approved_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
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
        action: 'approved',
        details: { notes: input.notes ?? null },
        performed_by: ctx.user!.id,
      })
    if (historyErr) logger.error('Failed to record draw request history', { error: historyErr.message })

    return NextResponse.json({ data: draw, requestId: ctx.requestId })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'draw_request.approve' }
)
