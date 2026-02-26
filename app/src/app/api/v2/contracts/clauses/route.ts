/**
 * Contract Clauses API — List & Create
 *
 * GET  /api/v2/contracts/clauses — List contract clauses
 * POST /api/v2/contracts/clauses — Create a new contract clause
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
import { listContractClausesSchema, createContractClauseSchema } from '@/lib/validation/schemas/contracts'

// ============================================================================
// GET /api/v2/contracts/clauses
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listContractClausesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      is_required: url.searchParams.get('is_required') ?? undefined,
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
      .from('contract_clauses')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('is_active', true)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.is_required !== undefined) {
      query = query.eq('is_required', filters.is_required)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('sort_order', { ascending: true })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/contracts/clauses — Create clause
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createContractClauseSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid clause data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contract_clauses')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        description: input.description ?? null,
        category: input.category ?? null,
        content: input.content,
        is_required: input.is_required,
        is_active: input.is_active,
        sort_order: input.sort_order,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'contracts_claus.create' }
)
