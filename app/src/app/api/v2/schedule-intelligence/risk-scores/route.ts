/**
 * Schedule Risk Scores API — List & Create
 *
 * GET  /api/v2/schedule-intelligence/risk-scores — List risk scores
 * POST /api/v2/schedule-intelligence/risk-scores — Create a new risk score
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listRiskScoresSchema, createRiskScoreSchema } from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// GET /api/v2/schedule-intelligence/risk-scores
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listRiskScoresSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      task_id: url.searchParams.get('task_id') ?? undefined,
      risk_level: url.searchParams.get('risk_level') ?? undefined,
      min_score: url.searchParams.get('min_score') ?? undefined,
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
      .from('schedule_risk_scores')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id)
    }
    if (filters.risk_level) {
      query = query.eq('risk_level', filters.risk_level)
    }
    if (filters.min_score !== undefined) {
      query = query.gte('risk_score', filters.min_score)
    }

    query = query.order('risk_score', { ascending: false })

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

// ============================================================================
// POST /api/v2/schedule-intelligence/risk-scores
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createRiskScoreSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid risk score data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('schedule_risk_scores')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        task_id: input.task_id ?? null,
        risk_level: input.risk_level,
        risk_score: input.risk_score,
        risk_factors: input.risk_factors,
        mitigation_suggestions: input.mitigation_suggestions,
        weather_component: input.weather_component,
        resource_component: input.resource_component,
        dependency_component: input.dependency_component,
        history_component: input.history_component,
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
