/**
 * Schedule Scenarios API — List & Create
 *
 * GET  /api/v2/schedule-intelligence/scenarios — List scenarios
 * POST /api/v2/schedule-intelligence/scenarios — Create a new scenario
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listScenariosSchema, createScenarioSchema } from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// GET /api/v2/schedule-intelligence/scenarios
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listScenariosSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      scenario_type: url.searchParams.get('scenario_type') ?? undefined,
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

    let query = (supabase
      .from('schedule_scenarios') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.scenario_type) {
      query = query.eq('scenario_type', filters.scenario_type)
    }

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/schedule-intelligence/scenarios
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createScenarioSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid scenario data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('schedule_scenarios') as any)
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        name: input.name,
        description: input.description ?? null,
        scenario_type: input.scenario_type,
        parameters: input.parameters,
        results: input.results,
        projected_completion: input.projected_completion ?? null,
        projected_cost_impact: input.projected_cost_impact ?? null,
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
