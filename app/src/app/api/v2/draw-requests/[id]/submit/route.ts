/**
 * Submit Draw Request — Draft → Pending Review
 *
 * POST /api/v2/draw-requests/:id/submit — Submit a draft draw request for review
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { submitDrawRequestSchema } from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// POST /api/v2/draw-requests/:id/submit
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /draw-requests/:id/submit
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = submitDrawRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid submit data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify draw exists and is in draft status
    const { data: existing } = await supabase
      .from('draw_requests')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Draw request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot submit a draw request with status "${existing.status}". Only draft draws can be submitted.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Verify the draw has at least one line item
    const { data: lines } = await supabase
      .from('draw_request_lines')
      .select('id')
      .eq('draw_request_id', id)

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Draw request must have at least one line item before submission', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Update status to pending_review
    const now = new Date().toISOString()
    const { data: draw, error } = await supabase
      .from('draw_requests')
      .update({
        status: 'pending_review',
        submitted_by: ctx.user!.id,
        submitted_at: now,
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

    // Record in history
    await supabase
      .from('draw_request_history')
      .insert({
        draw_request_id: id,
        action: 'submitted',
        details: { notes: input.notes ?? null },
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data: draw, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'draw_request.submit' }
)
