/**
 * Change Order by ID — Get, Update, Delete
 *
 * GET    /api/v2/change-orders/:id — Get change order details
 * PUT    /api/v2/change-orders/:id — Update change order
 * DELETE /api/v2/change-orders/:id — Soft delete (archive) change order
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateChangeOrderSchema } from '@/lib/validation/schemas/change-orders'

// ============================================================================
// GET /api/v2/change-orders/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('change_orders')
      .select('*, change_order_items(id), change_order_history(*)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Change order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { change_order_items, change_order_history, ...changeOrder } = data

    return NextResponse.json({
      data: {
        ...changeOrder,
        items_count: (change_order_items ?? []).length,
        history: change_order_history ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// PUT /api/v2/change-orders/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateChangeOrderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the CO exists and is editable (draft or pending_approval)
    const { data: existing, error: existError } = await supabase
      .from('change_orders')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Change order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft' && existing.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft or pending change orders can be updated', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.co_number !== undefined) updates.co_number = input.co_number
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.change_type !== undefined) updates.change_type = input.change_type
    if (input.status !== undefined) updates.status = input.status
    if (input.requested_by_type !== undefined) updates.requested_by_type = input.requested_by_type
    if (input.requested_by_id !== undefined) updates.requested_by_id = input.requested_by_id
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.cost_impact !== undefined) updates.cost_impact = input.cost_impact
    if (input.schedule_impact_days !== undefined) updates.schedule_impact_days = input.schedule_impact_days
    if (input.approval_chain !== undefined) updates.approval_chain = input.approval_chain
    if (input.document_id !== undefined) updates.document_id = input.document_id
    if (input.budget_id !== undefined) updates.budget_id = input.budget_id

    const { data, error } = await supabase
      .from('change_orders')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .in('status', ['draft', 'pending_approval'])
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Record history
    const { error: historyError } = await supabase
      .from('change_order_history')
      .insert({
        change_order_id: id,
        action: 'revised',
        previous_status: existing.status,
        new_status: data.status,
        details: { updated_fields: Object.keys(input) },
        performed_by: ctx.user!.id,
      })
    if (historyError) {
      const mapped = mapDbError(historyError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'change_order.update' }
)

// ============================================================================
// DELETE /api/v2/change-orders/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Only draft COs can be deleted
    const { data: existing, error: existError } = await supabase
      .from('change_orders')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Change order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only draft change orders can be deleted', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('change_orders')
      .update({ deleted_at: new Date().toISOString() })
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'change_order.archive' }
)
