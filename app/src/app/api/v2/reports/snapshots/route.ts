/**
 * Report Snapshots — List
 *
 * GET /api/v2/reports/snapshots — List report snapshots
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listReportSnapshotsSchema } from '@/lib/validation/schemas/financial-reporting'

// ============================================================================
// GET /api/v2/reports/snapshots
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listReportSnapshotsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      report_definition_id: url.searchParams.get('report_definition_id') ?? undefined,
      period_start: url.searchParams.get('period_start') ?? undefined,
      period_end: url.searchParams.get('period_end') ?? undefined,
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

    let query = supabase
      .from('report_snapshots')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.report_definition_id) {
      query = query.eq('report_definition_id', filters.report_definition_id)
    }
    if (filters.period_start) {
      query = query.gte('period_start', filters.period_start)
    }
    if (filters.period_end) {
      query = query.lte('period_end', filters.period_end)
    }

    query = query.order('generated_at', { ascending: false })

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
