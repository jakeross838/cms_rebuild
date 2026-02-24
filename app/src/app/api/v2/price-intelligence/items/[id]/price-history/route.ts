/**
 * Price History for Item
 *
 * GET /api/v2/price-intelligence/items/:id/price-history — Get price history for an item
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPriceHistorySchema } from '@/lib/validation/schemas/price-intelligence'

// ============================================================================
// GET /api/v2/price-intelligence/items/:id/price-history
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/price-intelligence/items/:id/price-history
    const itemId = segments[segments.length - 2]
    if (!itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listPriceHistorySchema.safeParse({
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
    const { data: item, error: itemError } = await (supabase as any)
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

    let query = (supabase as any)
      .from('price_history')
      .select('*', { count: 'exact' })
      .eq('master_item_id', itemId)
      .eq('company_id', ctx.companyId!)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }

    query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

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
