/**
 * Vendor Score History API
 *
 * GET /api/v2/vendor-performance/scores/:vendorId/history — Get score history
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listScoreHistorySchema } from '@/lib/validation/schemas/vendor-performance'

/**
 * Extract vendorId from /api/v2/vendor-performance/scores/:vendorId/history
 */
function extractVendorId(pathname: string): string | null {
  const segments = pathname.split('/')
  const scoresIdx = segments.indexOf('scores')
  if (scoresIdx === -1 || scoresIdx + 1 >= segments.length) return null
  return segments[scoresIdx + 1]
}

// ============================================================================
// GET /api/v2/vendor-performance/scores/:vendorId/history
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const vendorId = extractVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listScoreHistorySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
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

    const { data, count, error } = await (supabase as any)
      .from('vendor_score_history')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .order('snapshot_date', { ascending: filters.sort_order === 'asc' })
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
