/**
 * Purchase Order Lines API — List & Create
 *
 * GET  /api/v2/purchase-orders/:id/lines — List lines for a PO
 * POST /api/v2/purchase-orders/:id/lines — Add a line to a PO
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPurchaseOrderLinesSchema, createPurchaseOrderLineSchema } from '@/lib/validation/schemas/purchase-orders'

/**
 * Extract PO ID from a path like /api/v2/purchase-orders/:id/lines
 */
function extractPoId(pathname: string): string | null {
  const segments = pathname.split('/')
  const poIdx = segments.indexOf('purchase-orders')
  if (poIdx === -1 || poIdx + 1 >= segments.length) return null
  return segments[poIdx + 1]
}

// ============================================================================
// GET /api/v2/purchase-orders/:id/lines
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
    const parseResult = listPurchaseOrderLinesSchema.safeParse({
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
    const { data: po, error: poError } = await (supabase as any)
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

    const { data, count, error } = await (supabase as any)
      .from('purchase_order_lines')
      .select('*', { count: 'exact' })
      .eq('po_id', poId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/purchase-orders/:id/lines — Add PO line
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
    const parseResult = createPurchaseOrderLineSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid line item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify PO exists and belongs to company
    const { data: po, error: poError } = await (supabase as any)
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

    const { data, error } = await (supabase as any)
      .from('purchase_order_lines')
      .insert({
        po_id: poId,
        description: input.description,
        quantity: input.quantity,
        unit: input.unit,
        unit_price: input.unit_price,
        amount: input.amount,
        cost_code_id: input.cost_code_id ?? null,
        sort_order: input.sort_order,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
