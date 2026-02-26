/**
 * Plan Add-ons API — List & Create
 *
 * GET  /api/v2/billing/addons — List add-ons
 * POST /api/v2/billing/addons — Create a new add-on
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listAddonsSchema, createAddonSchema } from '@/lib/validation/schemas/subscription-billing'

// ============================================================================
// GET /api/v2/billing/addons
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listAddonsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      addon_type: url.searchParams.get('addon_type') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
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
      .from('plan_addons')
      .select('*', { count: 'exact' })

    if (filters.addon_type) {
      query = query.eq('addon_type', filters.addon_type)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

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
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/billing/addons — Create add-on
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createAddonSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid add-on data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('plan_addons')
      .select('id')
      .eq('slug', input.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: 'An add-on with this slug already exists', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('plan_addons')
      .insert({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        addon_type: input.addon_type,
        price_monthly: input.price_monthly,
        price_annual: input.price_annual,
        is_metered: input.is_metered,
        meter_unit: input.meter_unit ?? null,
        meter_price_per_unit: input.meter_price_per_unit,
        is_active: input.is_active,
        sort_order: input.sort_order,
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
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner'], auditAction: 'addon.create' }
)
