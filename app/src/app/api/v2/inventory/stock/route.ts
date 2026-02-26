/**
 * Inventory Stock API — List stock levels
 *
 * GET /api/v2/inventory/stock — List stock with item/location filters
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listInventoryStockSchema } from '@/lib/validation/schemas/inventory'

// ============================================================================
// GET /api/v2/inventory/stock
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listInventoryStockSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      item_id: url.searchParams.get('item_id') ?? undefined,
      location_id: url.searchParams.get('location_id') ?? undefined,
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

    let query = (supabase as any)
      .from('inventory_stock')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.item_id) {
      query = query.eq('item_id', filters.item_id)
    }
    if (filters.location_id) {
      query = query.eq('location_id', filters.location_id)
    }

    query = query.order('updated_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)
