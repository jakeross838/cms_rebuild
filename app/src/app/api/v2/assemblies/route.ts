/**
 * Assemblies API — List & Create
 *
 * GET  /api/v2/assemblies — List assemblies (filtered by company)
 * POST /api/v2/assemblies — Create a new assembly
 */

import { NextResponse } from 'next/server'
import { safeOrIlike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listAssembliesSchema, createAssemblySchema } from '@/lib/validation/schemas/estimating'

// ============================================================================
// GET /api/v2/assemblies
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listAssembliesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
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
      .from('assemblies')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.q) {
      query = query.or(`name.ilike.${safeOrIlike(filters.q)},description.ilike.${safeOrIlike(filters.q)}`)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/assemblies — Create assembly
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createAssemblySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid assembly data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('assemblies')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        description: input.description ?? null,
        category: input.category ?? null,
        parameter_unit: input.parameter_unit ?? null,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'assembly.create' }
)
