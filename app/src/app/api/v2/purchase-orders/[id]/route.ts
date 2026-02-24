/**
 * Purchase Order by ID — Get, Update, Delete
 *
 * GET    /api/v2/purchase-orders/:id — Get PO details
 * PUT    /api/v2/purchase-orders/:id — Update PO
 * DELETE /api/v2/purchase-orders/:id — Soft delete (archive) PO
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePurchaseOrderSchema } from '@/lib/validation/schemas/purchase-orders'

/**
 * Extract PO ID from a path like /api/v2/purchase-orders/:id
 */
function extractPoId(pathname: string): string | null {
  const segments = pathname.split('/')
  const poIdx = segments.indexOf('purchase-orders')
  if (poIdx === -1 || poIdx + 1 >= segments.length) return null
  return segments[poIdx + 1]
}

// ============================================================================
// GET /api/v2/purchase-orders/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractPoId(req.nextUrl.pathname)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch line items
    const { data: lines } = await (supabase as any)
      .from('purchase_order_lines')
      .select('*')
      .eq('po_id', id)
      .order('sort_order', { ascending: true })

    // Fetch receipts
    const { data: receipts } = await (supabase as any)
      .from('po_receipts')
      .select('*')
      .eq('po_id', id)
      .order('received_date', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        lines: lines ?? [],
        receipts: receipts ?? [],
        lines_count: (lines ?? []).length,
        receipts_count: (receipts ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/purchase-orders/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractPoId(req.nextUrl.pathname)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePurchaseOrderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.vendor_id !== undefined) updates.vendor_id = input.vendor_id
    if (input.po_number !== undefined) updates.po_number = input.po_number
    if (input.title !== undefined) updates.title = input.title
    if (input.status !== undefined) updates.status = input.status
    if (input.subtotal !== undefined) updates.subtotal = input.subtotal
    if (input.tax_amount !== undefined) updates.tax_amount = input.tax_amount
    if (input.shipping_amount !== undefined) updates.shipping_amount = input.shipping_amount
    if (input.total_amount !== undefined) updates.total_amount = input.total_amount
    if (input.budget_id !== undefined) updates.budget_id = input.budget_id
    if (input.cost_code_id !== undefined) updates.cost_code_id = input.cost_code_id
    if (input.delivery_date !== undefined) updates.delivery_date = input.delivery_date
    if (input.shipping_address !== undefined) updates.shipping_address = input.shipping_address
    if (input.terms !== undefined) updates.terms = input.terms
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/purchase-orders/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractPoId(req.nextUrl.pathname)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('purchase_orders')
      .update({ deleted_at: new Date().toISOString(), status: 'voided' })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
