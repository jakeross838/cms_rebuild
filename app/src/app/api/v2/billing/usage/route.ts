/**
 * Usage Meters API — List & Create
 *
 * GET  /api/v2/billing/usage — List usage meters
 * POST /api/v2/billing/usage — Create a new usage meter
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listUsageMetersSchema, createUsageMeterSchema } from '@/lib/validation/schemas/subscription-billing'

// ============================================================================
// GET /api/v2/billing/usage
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listUsageMetersSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      meter_type: url.searchParams.get('meter_type') ?? undefined,
      addon_id: url.searchParams.get('addon_id') ?? undefined,
      period_start: url.searchParams.get('period_start') ?? undefined,
      period_end: url.searchParams.get('period_end') ?? undefined,
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
      .from('usage_meters')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.meter_type) {
      query = query.eq('meter_type', filters.meter_type)
    }
    if (filters.addon_id) {
      query = query.eq('addon_id', filters.addon_id)
    }
    if (filters.period_start) {
      query = query.gte('period_start', filters.period_start)
    }
    if (filters.period_end) {
      query = query.lte('period_end', filters.period_end)
    }

    query = query.order('period_start', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/billing/usage — Create usage meter
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createUsageMeterSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid usage meter data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('usage_meters')
      .insert({
        company_id: ctx.companyId!,
        addon_id: input.addon_id ?? null,
        meter_type: input.meter_type,
        period_start: input.period_start,
        period_end: input.period_end,
        quantity: input.quantity,
        unit: input.unit ?? null,
        overage_quantity: input.overage_quantity,
        overage_cost: input.overage_cost,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner'] }
)
