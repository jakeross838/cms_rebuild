/**
 * Purchase Order Line by ID — Update & Delete
 *
 * PUT    /api/v2/purchase-orders/:id/lines/:lineId — Update a PO line
 * DELETE /api/v2/purchase-orders/:id/lines/:lineId — Delete a PO line
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePurchaseOrderLineSchema } from '@/lib/validation/schemas/purchase-orders'

/**
 * Extract PO ID and line ID from a path like /api/v2/purchase-orders/:id/lines/:lineId
 */
function extractIds(pathname: string): { poId: string | null; lineId: string | null } {
  const segments = pathname.split('/')
  const poIdx = segments.indexOf('purchase-orders')
  const linesIdx = segments.indexOf('lines')
  return {
    poId: poIdx !== -1 && poIdx + 1 < segments.length ? segments[poIdx + 1] : null,
    lineId: linesIdx !== -1 && linesIdx + 1 < segments.length ? segments[linesIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/purchase-orders/:id/lines/:lineId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { poId, lineId } = extractIds(req.nextUrl.pathname)
    if (!poId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID or line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePurchaseOrderLineSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify PO exists and belongs to company
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('id', poId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.description !== undefined) updates.description = input.description
    if (input.quantity !== undefined) updates.quantity = input.quantity
    if (input.unit !== undefined) updates.unit = input.unit
    if (input.unit_price !== undefined) updates.unit_price = input.unit_price
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.cost_code_id !== undefined) updates.cost_code_id = input.cost_code_id
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order

    const { data, error } = await supabase
      .from('purchase_order_lines')
      .update(updates)
      .eq('id', lineId)
      .eq('po_id', poId)
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'po_line.update' }
)

// ============================================================================
// DELETE /api/v2/purchase-orders/:id/lines/:lineId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { poId, lineId } = extractIds(req.nextUrl.pathname)
    if (!poId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID or line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify PO exists and belongs to company
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('id', poId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('purchase_order_lines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', lineId)
      .eq('po_id', poId)
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'po_line.archive' }
)
