/**
 * Vendor Prices for Item — List & Create
 *
 * GET  /api/v2/price-intelligence/items/:id/prices — List vendor prices for an item
 * POST /api/v2/price-intelligence/items/:id/prices — Add vendor price for an item
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
import {
  listVendorItemPricesSchema,
  createVendorItemPriceSchema,
} from '@/lib/validation/schemas/price-intelligence'

// ============================================================================
// GET /api/v2/price-intelligence/items/:id/prices
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/price-intelligence/items/:id/prices
    const itemId = segments[segments.length - 2]
    if (!itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listVendorItemPricesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      sort_by: url.searchParams.get('sort_by') ?? undefined,
      sort_order: url.searchParams.get('sort_order') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify item exists and belongs to company
    const { data: item, error: itemError } = await supabase
      .from('master_items')
      .select('id')
      .eq('id', itemId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Master item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('vendor_item_prices')
      .select('*', { count: 'exact' })
      .eq('master_item_id', itemId)
      .eq('company_id', ctx.companyId!)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }

    query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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
// POST /api/v2/price-intelligence/items/:id/prices — Add vendor price
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const itemId = segments[segments.length - 2]
    if (!itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createVendorItemPriceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid vendor price data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from('master_items')
      .select('id')
      .eq('id', itemId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Master item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('vendor_item_prices')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        master_item_id: itemId,
        unit_price: input.unit_price,
        lead_time_days: input.lead_time_days ?? null,
        min_order_qty: input.min_order_qty ?? null,
        effective_date: input.effective_date ?? new Date().toISOString().split('T')[0],
        notes: input.notes ?? null,
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
