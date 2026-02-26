/**
 * Draw Request by ID — Get, Update, Delete
 *
 * GET    /api/v2/draw-requests/:id — Get draw request with lines and history
 * PUT    /api/v2/draw-requests/:id — Update draw request (draft or rejected only)
 * DELETE /api/v2/draw-requests/:id — Soft delete draw request (draft only)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateDrawRequestSchema } from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// GET /api/v2/draw-requests/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: draw, error } = await (supabase as any)
      .from('draw_requests')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Draw request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch line items
    const { data: lines } = await (supabase as any)
      .from('draw_request_lines')
      .select('*')
      .eq('draw_request_id', id)
      .order('sort_order', { ascending: true })

    // Fetch history
    const { data: history } = await (supabase as any)
      .from('draw_request_history')
      .select('*')
      .eq('draw_request_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      data: { ...draw, lines: lines ?? [], history: history ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// PUT /api/v2/draw-requests/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateDrawRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify draw exists and is editable (draft or rejected)
    const { data: existing } = await (supabase as any)
      .from('draw_requests')
      .select('status')
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

    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot update a draw request with status "${existing.status}". Only draft or rejected draws can be updated.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.draw_number !== undefined) updates.draw_number = input.draw_number
    if (input.application_date !== undefined) updates.application_date = input.application_date
    if (input.period_to !== undefined) updates.period_to = input.period_to
    if (input.contract_amount !== undefined) updates.contract_amount = input.contract_amount
    if (input.retainage_pct !== undefined) updates.retainage_pct = input.retainage_pct
    if (input.lender_reference !== undefined) updates.lender_reference = input.lender_reference
    if (input.notes !== undefined) updates.notes = input.notes

    const { data: draw, error: drawError } = await (supabase as any)
      .from('draw_requests')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (drawError) {
      return NextResponse.json(
        { error: 'Database Error', message: drawError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: draw, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'draw_request.update' }
)

// ============================================================================
// DELETE /api/v2/draw-requests/:id — Soft delete (draft only)
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify draw exists and is deletable (only draft)
    const { data: existing } = await (supabase as any)
      .from('draw_requests')
      .select('status')
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
        { error: 'Conflict', message: 'Only draft draw requests can be deleted', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await (supabase as any)
      .from('draw_requests')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'draw_request.archive' }
)
