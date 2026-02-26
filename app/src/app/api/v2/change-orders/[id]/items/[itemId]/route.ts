/**
 * Change Order Item by ID — Update & Delete
 *
 * PUT    /api/v2/change-orders/:id/items/:itemId — Update a change order item
 * DELETE /api/v2/change-orders/:id/items/:itemId — Delete a change order item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateChangeOrderItemSchema } from '@/lib/validation/schemas/change-orders'

/**
 * Extract change order ID and item ID from path like
 * /api/v2/change-orders/:id/items/:itemId
 */
function extractIds(pathname: string): { changeOrderId: string | null; itemId: string | null } {
  const segments = pathname.split('/')
  const coIdx = segments.indexOf('change-orders')
  const itemsIdx = segments.indexOf('items')
  return {
    changeOrderId: coIdx !== -1 && coIdx + 1 < segments.length ? segments[coIdx + 1] : null,
    itemId: itemsIdx !== -1 && itemsIdx + 1 < segments.length ? segments[itemsIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/change-orders/:id/items/:itemId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { changeOrderId, itemId } = extractIds(req.nextUrl.pathname)
    if (!changeOrderId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateChangeOrderItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify CO exists, belongs to company, and is editable
    const { data: co, error: coError } = await supabase
      .from('change_orders')
      .select('id, status')
      .eq('id', changeOrderId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (coError || !co) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Change order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (co.status !== 'draft' && co.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Items can only be updated on draft or pending change orders', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.description !== undefined) updates.description = input.description
    if (input.cost_code_id !== undefined) updates.cost_code_id = input.cost_code_id
    if (input.quantity !== undefined) updates.quantity = input.quantity
    if (input.unit_price !== undefined) updates.unit_price = input.unit_price
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.markup_pct !== undefined) updates.markup_pct = input.markup_pct
    if (input.markup_amount !== undefined) updates.markup_amount = input.markup_amount
    if (input.total !== undefined) updates.total = input.total
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order

    const { data, error } = await supabase
      .from('change_order_items')
      .update(updates)
      .eq('id', itemId)
      .eq('change_order_id', changeOrderId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// DELETE /api/v2/change-orders/:id/items/:itemId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { changeOrderId, itemId } = extractIds(req.nextUrl.pathname)
    if (!changeOrderId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify CO exists, belongs to company, and is editable
    const { data: co, error: coError } = await supabase
      .from('change_orders')
      .select('id, status')
      .eq('id', changeOrderId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (coError || !co) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Change order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (co.status !== 'draft' && co.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Items can only be deleted from draft or pending change orders', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('change_order_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('change_order_id', changeOrderId)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial' }
)
