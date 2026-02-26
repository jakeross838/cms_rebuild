/**
 * PO Receipts API — List & Create
 *
 * GET  /api/v2/purchase-orders/:id/receipts — List receipts for a PO
 * POST /api/v2/purchase-orders/:id/receipts — Record a new receipt
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPoReceiptsSchema, createPoReceiptSchema } from '@/lib/validation/schemas/purchase-orders'

/**
 * Extract PO ID from a path like /api/v2/purchase-orders/:id/receipts
 */
function extractPoId(pathname: string): string | null {
  const segments = pathname.split('/')
  const poIdx = segments.indexOf('purchase-orders')
  if (poIdx === -1 || poIdx + 1 >= segments.length) return null
  return segments[poIdx + 1]
}

// ============================================================================
// GET /api/v2/purchase-orders/:id/receipts
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const poId = extractPoId(req.nextUrl.pathname)
    if (!poId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listPoReceiptsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
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

    const { data, count, error } = await supabase
      .from('po_receipts')
      .select('*', { count: 'exact' })
      .eq('po_id', poId)
      .eq('company_id', ctx.companyId!)
      .order('received_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // For each receipt, fetch receipt lines
    const receiptsWithLines = await Promise.all(
      (data ?? []).map(async (receipt: Record<string, unknown>) => {
        const { data: lines } = await supabase
          .from('po_receipt_lines')
          .select('*')
          .eq('receipt_id', receipt.id as string)

        return { ...receipt, lines: lines ?? [] }
      })
    )

    return NextResponse.json(paginatedResponse(receiptsWithLines, count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/purchase-orders/:id/receipts — Record receipt
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const poId = extractPoId(req.nextUrl.pathname)
    if (!poId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing purchase order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createPoReceiptSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid receipt data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify PO exists, belongs to company, and is in a receivable status
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('id, status')
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

    const receivableStatuses = ['sent', 'partially_received', 'approved']
    if (!receivableStatuses.includes(po.status)) {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot record receipt for a purchase order with status "${po.status}"`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Create receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('po_receipts')
      .insert({
        po_id: poId,
        company_id: ctx.companyId!,
        received_date: input.received_date ?? new Date().toISOString().split('T')[0],
        received_by: ctx.user!.id,
        notes: input.notes ?? null,
        document_id: input.document_id ?? null,
      })
      .select('*')
      .single()

    if (receiptError) {
      const mapped = mapDbError(receiptError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Create receipt line items
    const receiptLines = input.lines.map((line) => ({
      receipt_id: receipt.id,
      po_line_id: line.po_line_id,
      quantity_received: line.quantity_received,
      notes: line.notes ?? null,
    }))

    const { data: lines, error: linesError } = await supabase
      .from('po_receipt_lines')
      .insert(receiptLines)
      .select('*')

    if (linesError) {
      const mapped = mapDbError(linesError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Atomically increment received_quantity on each PO line (prevents race conditions)
    for (const line of input.lines) {
      const { error: rpcError } = await (supabase as any).rpc('increment_po_line_received', {
        p_line_id: line.po_line_id,
        p_quantity: line.quantity_received,
      })
      if (rpcError) {
        const mapped = mapDbError(rpcError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
    }

    // Check if all PO lines are fully received, update PO status accordingly
    const { data: allLines } = await supabase
      .from('purchase_order_lines')
      .select('quantity, received_quantity')
      .eq('po_id', poId)

    let allReceived = true
    let anyReceived = false
    for (const l of (allLines ?? [])) {
      if (Number(l.received_quantity) > 0) anyReceived = true
      if (Number(l.received_quantity) < Number(l.quantity)) allReceived = false
    }

    let newStatus = po.status
    if (allReceived && (allLines ?? []).length > 0) {
      newStatus = 'received'
    } else if (anyReceived) {
      newStatus = 'partially_received'
    }

    if (newStatus !== po.status) {
      const { error: statusErr } = await supabase
        .from('purchase_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', poId)
        .eq('company_id', ctx.companyId!)

      if (statusErr) {
        const mapped = mapDbError(statusErr)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
    }

    return NextResponse.json({
      data: { ...receipt, lines: lines ?? [] },
      requestId: ctx.requestId,
    }, { status: 201 })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'po_receipt.create' }
)
