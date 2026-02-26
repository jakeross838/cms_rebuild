/**
 * CRM Lead Sources API — List & Create
 *
 * GET  /api/v2/crm/sources — List lead sources
 * POST /api/v2/crm/sources — Create a new lead source
 */

import { type NextRequest, NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listLeadSourcesSchema, createLeadSourceSchema } from '@/lib/validation/schemas/crm'

// ============================================================================
// GET /api/v2/crm/sources
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listLeadSourcesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      source_type: url.searchParams.get('source_type') ?? undefined,
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
      .from('lead_sources')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.source_type) {
      query = query.eq('source_type', filters.source_type)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('name', { ascending: true })

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
// POST /api/v2/crm/sources — Create lead source
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createLeadSourceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid lead source data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lead_sources')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        description: input.description ?? null,
        source_type: input.source_type,
        is_active: input.is_active,
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
