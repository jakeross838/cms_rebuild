/**
 * Draw Requests — List & Create
 *
 * GET  /api/v2/draw-requests — List draw requests (filterable by job, status, date)
 * POST /api/v2/draw-requests — Create new draw request (draft)
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listDrawRequestsSchema, createDrawRequestSchema } from '@/lib/validation/schemas/draw-requests'

// ============================================================================
// GET /api/v2/draw-requests
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listDrawRequestsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
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
      .from('draw_requests')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.start_date) {
      query = query.gte('application_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('application_date', filters.end_date)
    }
    if (filters.q) {
      query = query.or(`lender_reference.ilike.%${escapeLike(filters.q)}%,notes.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('application_date', { ascending: false })

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
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// POST /api/v2/draw-requests — Create new draw request (draft)
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createDrawRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid draw request data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Create the draw request
    const { data: draw, error: drawError } = await supabase
      .from('draw_requests')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        draw_number: input.draw_number,
        application_date: input.application_date,
        period_to: input.period_to,
        status: 'draft',
        contract_amount: input.contract_amount,
        retainage_pct: input.retainage_pct,
        balance_to_finish: input.contract_amount, // Initially, full contract is balance
        lender_reference: input.lender_reference ?? null,
        notes: input.notes ?? null,
      })
      .select('*')
      .single()

    if (drawError) {
      return NextResponse.json(
        { error: 'Database Error', message: drawError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Record creation in history
    await supabase
      .from('draw_request_history')
      .insert({
        draw_request_id: draw.id,
        action: 'created',
        details: { draw_number: input.draw_number, contract_amount: input.contract_amount },
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data: draw, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'draw_request.create' }
)
