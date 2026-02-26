/**
 * Vendor Job Performance Ratings API — List & Create
 *
 * GET  /api/v2/vendor-performance/job-ratings — List job performance ratings
 * POST /api/v2/vendor-performance/job-ratings — Create a job performance rating
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
import { escapeLike } from '@/lib/utils'
import { listJobRatingsSchema, createJobRatingSchema } from '@/lib/validation/schemas/vendor-performance'

// ============================================================================
// GET /api/v2/vendor-performance/job-ratings
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listJobRatingsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      trade: url.searchParams.get('trade') ?? undefined,
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

    let query = supabase
      .from('vendor_job_performance')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.trade) {
      query = query.ilike('trade', `%${escapeLike(filters.trade)}%`)
    }

    const sortCol = filters.sort_by || 'created_at'
    query = query.order(sortCol, { ascending: filters.sort_order === 'asc' })

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
// POST /api/v2/vendor-performance/job-ratings — Create rating
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createJobRatingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid job rating data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vendor_job_performance')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        job_id: input.job_id,
        trade: input.trade ?? null,
        quality_rating: input.quality_rating ?? null,
        timeliness_rating: input.timeliness_rating ?? null,
        communication_rating: input.communication_rating ?? null,
        budget_adherence_rating: input.budget_adherence_rating ?? null,
        safety_rating: input.safety_rating ?? null,
        overall_rating: input.overall_rating ?? null,
        tasks_on_time: input.tasks_on_time,
        tasks_total: input.tasks_total,
        punch_items_count: input.punch_items_count,
        punch_resolution_avg_days: input.punch_resolution_avg_days ?? null,
        inspection_pass_rate: input.inspection_pass_rate ?? null,
        bid_amount: input.bid_amount ?? null,
        final_amount: input.final_amount ?? null,
        change_order_count: input.change_order_count,
        rating_notes: input.rating_notes ?? null,
        rated_by: ctx.user!.id,
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
