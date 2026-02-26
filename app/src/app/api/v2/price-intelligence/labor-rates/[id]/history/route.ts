/**
 * Labor Rate History
 *
 * GET /api/v2/price-intelligence/labor-rates/:id/history — Get rate change history
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
import { listLaborRateHistorySchema } from '@/lib/validation/schemas/price-intelligence'

// ============================================================================
// GET /api/v2/price-intelligence/labor-rates/:id/history
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/price-intelligence/labor-rates/:id/history
    const rateId = segments[segments.length - 2]
    if (!rateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing labor rate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listLaborRateHistorySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
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

    // Verify labor rate exists and belongs to company
    const { data: rate, error: rateError } = await (supabase as any)
      .from('labor_rates')
      .select('id')
      .eq('id', rateId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (rateError || !rate) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Labor rate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase as any)
      .from('labor_rate_history')
      .select('*', { count: 'exact' })
      .eq('labor_rate_id', rateId)
      .eq('company_id', ctx.companyId!)

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
