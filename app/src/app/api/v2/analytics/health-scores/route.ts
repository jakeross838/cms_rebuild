/**
 * Tenant Health Scores API — List & Create
 *
 * GET  /api/v2/analytics/health-scores — List health scores
 * POST /api/v2/analytics/health-scores — Create a new health score
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
import { escapeLike } from '@/lib/utils'
import { listHealthScoresSchema, createHealthScoreSchema } from '@/lib/validation/schemas/platform-analytics'

// ============================================================================
// GET /api/v2/analytics/health-scores
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listHealthScoresSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      risk_level: url.searchParams.get('risk_level') ?? undefined,
      min_score: url.searchParams.get('min_score') ?? undefined,
      max_score: url.searchParams.get('max_score') ?? undefined,
      date_from: url.searchParams.get('date_from') ?? undefined,
      date_to: url.searchParams.get('date_to') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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
      .from('tenant_health_scores')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.risk_level) {
      query = query.eq('risk_level', filters.risk_level)
    }
    if (filters.min_score !== undefined) {
      query = query.gte('overall_score', filters.min_score)
    }
    if (filters.max_score !== undefined) {
      query = query.lte('overall_score', filters.max_score)
    }
    if (filters.date_from) {
      query = query.gte('score_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('score_date', filters.date_to)
    }
    if (filters.q) {
      query = query.ilike('notes', `%${escapeLike(filters.q)}%`)
    }

    query = query.order('score_date', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/analytics/health-scores — Create health score
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createHealthScoreSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid health score data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tenant_health_scores')
      .insert({
        company_id: ctx.companyId!,
        score_date: input.score_date ?? new Date().toISOString().split('T')[0],
        overall_score: input.overall_score,
        adoption_score: input.adoption_score,
        engagement_score: input.engagement_score,
        satisfaction_score: input.satisfaction_score,
        growth_score: input.growth_score,
        risk_level: input.risk_level,
        churn_probability: input.churn_probability,
        last_login_at: input.last_login_at ?? null,
        active_users_count: input.active_users_count,
        feature_utilization: input.feature_utilization,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)
