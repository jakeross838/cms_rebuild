/**
 * Draw Request Lines — List & Create
 *
 * GET  /api/v2/draw-requests/:id/lines — List line items for a draw request
 * POST /api/v2/draw-requests/:id/lines — Add line items to a draw request
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { batchCreateDrawLinesSchema } from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// GET /api/v2/draw-requests/:id/lines
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /draw-requests/:id/lines
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify draw exists and belongs to this company
    const { data: draw } = await supabase
      .from('draw_requests')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!draw) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Draw request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch line items sorted by sort_order
    const { data: lines, error } = await supabase
      .from('draw_request_lines')
      .select('*')
      .eq('draw_request_id', id)
      .order('sort_order', { ascending: true })

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: lines ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/draw-requests/:id/lines — Add line items
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /draw-requests/:id/lines
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing draw request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = batchCreateDrawLinesSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid line data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify draw exists, belongs to company, and is editable
    const { data: draw } = await supabase
      .from('draw_requests')
      .select('id, status, retainage_pct')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!draw) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Draw request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (draw.status !== 'draft' && draw.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot add lines to a draw request with status "${draw.status}". Only draft or rejected draws can be modified.`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Compute calculated fields for each line
    const lineRecords = input.lines.map((line) => {
      const totalCompleted = (line.previous_applications ?? 0) + (line.current_work ?? 0) + (line.materials_stored ?? 0)
      const pctComplete = line.scheduled_value > 0
        ? Math.min(100, Math.round((totalCompleted / line.scheduled_value) * 10000) / 100)
        : 0
      const balanceToFinish = Math.max(0, line.scheduled_value - totalCompleted)

      return {
        draw_request_id: id,
        cost_code_id: line.cost_code_id ?? null,
        description: line.description,
        scheduled_value: line.scheduled_value,
        previous_applications: line.previous_applications ?? 0,
        current_work: line.current_work ?? 0,
        materials_stored: line.materials_stored ?? 0,
        total_completed: totalCompleted,
        pct_complete: pctComplete,
        balance_to_finish: balanceToFinish,
        retainage: 0, // Will be calculated when draw totals are recalculated
        sort_order: line.sort_order ?? 0,
      }
    })

    const { data: lines, error: linesError } = await supabase
      .from('draw_request_lines')
      .insert(lineRecords)
      .select('*')

    if (linesError) {
      const mapped = mapDbError(linesError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Recalculate draw totals based on all lines
    const { data: allLines } = await supabase
      .from('draw_request_lines')
      .select('scheduled_value, previous_applications, current_work, materials_stored, total_completed, balance_to_finish')
      .eq('draw_request_id', id)

    if (allLines && allLines.length > 0) {
      const totalScheduled = allLines.reduce((sum: number, l: { scheduled_value: number }) => sum + Number(l.scheduled_value), 0)
      const totalCompleted = allLines.reduce((sum: number, l: { total_completed: number }) => sum + Number(l.total_completed), 0)
      const totalPrevious = allLines.reduce((sum: number, l: { previous_applications: number }) => sum + Number(l.previous_applications), 0)
      const totalBalance = allLines.reduce((sum: number, l: { balance_to_finish: number }) => sum + Number(l.balance_to_finish), 0)
      const currentWork = allLines.reduce((sum: number, l: { current_work: number; materials_stored: number }) => sum + Number(l.current_work) + Number(l.materials_stored), 0)

      // Use retainage_pct from the already-fetched draw (no extra query needed)
      const retainagePct = draw.retainage_pct ?? 10
      const retainageAmount = totalCompleted * (retainagePct / 100)
      const totalEarned = totalCompleted - retainageAmount
      const currentDue = totalEarned - totalPrevious

      const { error: totalsErr } = await supabase
        .from('draw_requests')
        .update({
          contract_amount: totalScheduled,
          total_completed: totalCompleted,
          retainage_amount: retainageAmount,
          total_earned: totalEarned,
          less_previous: totalPrevious,
          current_due: currentDue,
          balance_to_finish: totalBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (totalsErr) {
        const mapped = mapDbError(totalsErr)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
    }

    return NextResponse.json({ data: lines ?? [], requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'draw_request_lines.update' }
)
