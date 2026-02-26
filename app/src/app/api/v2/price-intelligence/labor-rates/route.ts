/**
 * Labor Rates API — List & Create
 *
 * GET  /api/v2/price-intelligence/labor-rates — List labor rates
 * POST /api/v2/price-intelligence/labor-rates — Create a new labor rate
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listLaborRatesSchema,
  createLaborRateSchema,
} from '@/lib/validation/schemas/price-intelligence'

// ============================================================================
// GET /api/v2/price-intelligence/labor-rates
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listLaborRatesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      trade: url.searchParams.get('trade') ?? undefined,
      skill_level: url.searchParams.get('skill_level') ?? undefined,
      region: url.searchParams.get('region') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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

    let query = (supabase as any)
      .from('labor_rates')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.trade) {
      query = query.eq('trade', filters.trade)
    }
    if (filters.skill_level) {
      query = query.eq('skill_level', filters.skill_level)
    }
    if (filters.region) {
      query = query.eq('region', filters.region)
    }
    if (filters.q) {
      query = query.or(`trade.ilike.%${escapeLike(filters.q)}%,region.ilike.%${escapeLike(filters.q)}%,notes.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' })

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
// POST /api/v2/price-intelligence/labor-rates — Create labor rate
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
        trade: input.trade,
        skill_level: input.skill_level,
        hourly_rate: input.hourly_rate,
        overtime_rate: input.overtime_rate ?? null,
        region: input.region ?? null,
        notes: input.notes ?? null,
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
