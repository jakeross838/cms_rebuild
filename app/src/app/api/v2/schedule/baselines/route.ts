/**
 * Schedule Baselines API — List & Create
 *
 * GET  /api/v2/schedule/baselines — List schedule baselines for a job
 * POST /api/v2/schedule/baselines — Create a new baseline snapshot
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBaselinesSchema, createBaselineSchema } from '@/lib/validation/schemas/scheduling'

// ============================================================================
// GET /api/v2/schedule/baselines
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listBaselinesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
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
      .from('schedule_baselines')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('job_id', filters.job_id)

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/schedule/baselines
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createBaselineSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid baseline data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // If no baseline_data was provided, snapshot all current tasks for the job
    let baselineData = input.baseline_data
    if (Object.keys(baselineData).length === 0) {
      const { data: tasks } = await (supabase as any)
        .from('schedule_tasks')
        .select('*')
        .eq('company_id', ctx.companyId!)
        .eq('job_id', input.job_id)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true })

      baselineData = { tasks: tasks ?? [] }
    }

    const { data, error } = await (supabase as any)
      .from('schedule_baselines')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        name: input.name,
        snapshot_date: input.snapshot_date ?? new Date().toISOString().split('T')[0],
        baseline_data: baselineData,
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
  { requireAuth: true, rateLimit: 'api' }
)
