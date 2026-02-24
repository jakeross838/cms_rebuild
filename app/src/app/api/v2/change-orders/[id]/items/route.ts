/**
 * Change Order Items API — List & Create
 *
 * GET  /api/v2/change-orders/:id/items — List items for a change order
 * POST /api/v2/change-orders/:id/items — Add an item to a change order
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listChangeOrderItemsSchema, createChangeOrderItemSchema } from '@/lib/validation/schemas/change-orders'

/**
 * Extract change order ID from a path like /api/v2/change-orders/:id/items
 */
function extractChangeOrderId(pathname: string): string | null {
  const segments = pathname.split('/')
  const coIdx = segments.indexOf('change-orders')
  if (coIdx === -1 || coIdx + 1 >= segments.length) return null
  return segments[coIdx + 1]
}

// ============================================================================
// GET /api/v2/change-orders/:id/items
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const changeOrderId = extractChangeOrderId(req.nextUrl.pathname)
    if (!changeOrderId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listChangeOrderItemsSchema.safeParse({
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

    // Verify the CO belongs to this company
    const { data: co, error: coError } = await (supabase
      .from('change_orders') as any)
      .select('id')
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

    const { data, count, error } = await (supabase
      .from('change_order_items') as any)
      .select('*', { count: 'exact' })
      .eq('change_order_id', changeOrderId)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/change-orders/:id/items — Add item
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const changeOrderId = extractChangeOrderId(req.nextUrl.pathname)
    if (!changeOrderId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing change order ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createChangeOrderItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify CO exists, belongs to company, and is editable
    const { data: co, error: coError } = await (supabase
      .from('change_orders') as any)
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
        { error: 'Forbidden', message: 'Items can only be added to draft or pending change orders', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await (supabase
      .from('change_order_items') as any)
      .insert({
        change_order_id: changeOrderId,
        description: input.description,
        cost_code_id: input.cost_code_id ?? null,
        quantity: input.quantity,
        unit_price: input.unit_price,
        amount: input.amount,
        markup_pct: input.markup_pct,
        markup_amount: input.markup_amount,
        total: input.total,
        vendor_id: input.vendor_id ?? null,
        sort_order: input.sort_order,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
