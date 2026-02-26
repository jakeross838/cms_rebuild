/**
 * Labor Rates API — List & Create
 *
 * GET  /api/v2/labor-rates — List/filter labor rates
 * POST /api/v2/labor-rates — Create a labor rate
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { listLaborRatesSchema, createLaborRateSchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// GET /api/v2/labor-rates
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listLaborRatesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      user_id: url.searchParams.get('user_id') ?? undefined,
      trade: url.searchParams.get('trade') ?? undefined,
      rate_type: url.searchParams.get('rate_type') ?? undefined,
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
      .from('labor_rates')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.trade) {
      query = query.ilike('trade', `%${escapeLike(filters.trade)}%`)
    }
    if (filters.rate_type) {
      query = query.eq('rate_type', filters.rate_type)
    }

    query = query.order('effective_date', { ascending: false })

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
// POST /api/v2/labor-rates — Create labor rate
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createLaborRateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid labor rate data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('labor_rates')
      .insert({
        company_id: ctx.companyId!,
        user_id: input.user_id ?? null,
        trade: input.trade ?? null,
        rate_type: input.rate_type,
        hourly_rate: input.hourly_rate,
        effective_date: input.effective_date,
        end_date: input.end_date ?? null,
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
