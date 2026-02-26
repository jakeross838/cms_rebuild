/**
 * Platform Metrics Snapshots API — List & Create
 *
 * GET  /api/v2/analytics/metrics — List metric snapshots
 * POST /api/v2/analytics/metrics — Create a new metric snapshot
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMetricsSnapshotsSchema, createMetricsSnapshotSchema } from '@/lib/validation/schemas/platform-analytics'

// ============================================================================
// GET /api/v2/analytics/metrics
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listMetricsSnapshotsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      metric_type: url.searchParams.get('metric_type') ?? undefined,
      period: url.searchParams.get('period') ?? undefined,
      date_from: url.searchParams.get('date_from') ?? undefined,
      date_to: url.searchParams.get('date_to') ?? undefined,
      company_id: url.searchParams.get('company_id') ?? undefined,
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
      .from('platform_metrics_snapshots')
      .select('*', { count: 'exact' })

    // Filter by company — show platform-wide (null) + own company
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id)
    } else {
      query = query.or(`company_id.is.null,company_id.eq.${ctx.companyId!}`)
    }

    if (filters.metric_type) {
      query = query.eq('metric_type', filters.metric_type)
    }
    if (filters.period) {
      query = query.eq('period', filters.period)
    }
    if (filters.date_from) {
      query = query.gte('snapshot_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('snapshot_date', filters.date_to)
    }

    query = query.order('snapshot_date', { ascending: false })

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

// ============================================================================
// POST /api/v2/analytics/metrics — Create snapshot
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createMetricsSnapshotSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid snapshot data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('platform_metrics_snapshots')
      .insert({
        company_id: ctx.companyId!,
        snapshot_date: input.snapshot_date ?? new Date().toISOString().split('T')[0],
        metric_type: input.metric_type,
        metric_value: input.metric_value,
        breakdown: input.breakdown,
        period: input.period,
        created_by: ctx.user!.id,
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
