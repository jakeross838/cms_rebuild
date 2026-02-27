/**
 * Cost Codes API — List & Create
 *
 * GET  /api/v1/cost-codes — List cost codes for company (paginated, filterable)
 * POST /api/v1/cost-codes — Create a new cost code
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  mapDbError,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { safeOrIlike } from '@/lib/utils'
import { createCostCodeSchema, listCostCodesSchema, type CreateCostCodeInput } from '@/lib/validation/schemas/cost-codes'
import type { CostCode } from '@/types/database'

// ============================================================================
// GET /api/v1/cost-codes — List cost codes for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listCostCodesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      sortOrder: url.searchParams.get('sortOrder') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      division: url.searchParams.get('division') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
      parent_id: url.searchParams.get('parent_id') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)

    const supabase = await createClient()

    let query = supabase
      .from('cost_codes')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: CostCode[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.division) {
      query = query.eq('division', filters.division) as typeof query
    }
    if (filters.category) {
      query = query.eq('category', filters.category) as typeof query
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active) as typeof query
    }
    if (filters.parent_id) {
      query = query.eq('parent_id', filters.parent_id) as typeof query
    }
    if (filters.search) {
      query = query.or(`code.ilike.${safeOrIlike(filters.search)},name.ilike.${safeOrIlike(filters.search)}`) as typeof query
    }

    // Sort and paginate
    const ascending = (filters.sortOrder ?? 'asc') === 'asc'
    query = query.order(filters.sortBy ?? 'code', { ascending }) as typeof query

    const { data: costCodes, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list cost codes', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(costCodes ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api',
    permission: 'cost_codes:read:all',
  }
)

// ============================================================================
// POST /api/v1/cost-codes — Create a new cost code
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as CreateCostCodeInput

    const supabase = await createClient()

    const { data: costCode, error } = await (supabase
      .from('cost_codes')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: CostCode | null; error: { message: string } | null }>)

    if (error || !costCode) {
      logger.error('Failed to create cost code', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Cost code created', { costCodeId: costCode.id, companyId: ctx.companyId! })

    return NextResponse.json({ data: costCode, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api',
    requiredRoles: ['owner', 'admin'],
    schema: createCostCodeSchema,
    permission: 'cost_codes:create:all',
    auditAction: 'cost_code.create',
  }
)
