/**
 * Purchase Order by ID — Get, Update, Delete
 *
 * GET    /api/v2/purchase-orders/:id — Get PO details
 * PUT    /api/v2/purchase-orders/:id — Update PO
 * DELETE /api/v2/purchase-orders/:id — Soft delete (archive) PO
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
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

    const { data, error } = await supabase
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
    const { data: lines } = await supabase
      .from('purchase_order_lines')
      .select('*')
      .eq('po_id', id)
      .order('sort_order', { ascending: true })

    // Fetch receipts
    const { data: receipts } = await supabase
      .from('po_receipts')
      .select('*')
      .eq('po_id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
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

    // Validate status transition — only draft or pending POs can be updated
    if (input.status !== undefined) {
      const { data: existing, error: existingError } = await supabase
        .from('purchase_orders')
        .select('status')
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
          { error: 'Not Found', message: 'Purchase order not found', requestId: ctx.requestId },
          { status: 404 }
        )
      }

      const editableStatuses = ['draft', 'pending', 'rejected']
      if (!editableStatuses.includes(existing.status)) {
        return NextResponse.json(
          { error: 'Conflict', message: `Cannot update a purchase order with status "${existing.status}". Only draft, pending, or rejected POs can be updated.`, requestId: ctx.requestId },
          { status: 409 }
        )
      }
    }

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

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'po.update' }
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

    const { error } = await supabase
      .from('purchase_orders')
      .update({ deleted_at: new Date().toISOString(), status: 'voided' })
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
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'po.archive' }
)
