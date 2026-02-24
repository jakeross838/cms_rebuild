/**
 * Schedule Predictions API — List & Create
 *
 * GET  /api/v2/schedule-intelligence/predictions — List predictions
 * POST /api/v2/schedule-intelligence/predictions — Create a new prediction
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPredictionsSchema, createPredictionSchema } from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// GET /api/v2/schedule-intelligence/predictions
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listPredictionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      task_id: url.searchParams.get('task_id') ?? undefined,
      prediction_type: url.searchParams.get('prediction_type') ?? undefined,
      is_accepted: url.searchParams.get('is_accepted') ?? undefined,
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
      .from('schedule_predictions') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id)
    }
    if (filters.prediction_type) {
      query = query.eq('prediction_type', filters.prediction_type)
    }
    if (filters.is_accepted !== undefined) {
      query = query.eq('is_accepted', filters.is_accepted)
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
// POST /api/v2/schedule-intelligence/predictions
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createPredictionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid prediction data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('schedule_predictions') as any)
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        task_id: input.task_id ?? null,
        prediction_type: input.prediction_type,
        predicted_value: input.predicted_value,
        confidence_score: input.confidence_score,
        model_version: input.model_version ?? null,
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
