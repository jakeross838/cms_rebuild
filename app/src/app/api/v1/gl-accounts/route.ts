/**
 * GL Accounts API — List & Create
 *
 * GET  /api/v1/gl-accounts — List GL accounts for company (paginated, filterable)
 * POST /api/v1/gl-accounts — Create a new GL account
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
import {
  listGlAccountsSchema,
  createGlAccountSchema,
} from '@/lib/validation/schemas/accounting'
import type { GlAccount } from '@/types/accounting'

// ============================================================================
// GET /api/v1/gl-accounts — List GL accounts for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const url = req.nextUrl
    const parseResult = listGlAccountsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      account_type: url.searchParams.get('account_type') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
      parent_account_id: url.searchParams.get('parent_account_id') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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
      .from('gl_accounts')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: GlAccount[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.account_type) {
      query = query.eq('account_type', filters.account_type) as typeof query
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active) as typeof query
    }
    if (filters.parent_account_id) {
      query = query.eq('parent_account_id', filters.parent_account_id) as typeof query
    }
    if (filters.q) {
      query = query.or(`name.ilike.${safeOrIlike(filters.q)},account_number.ilike.${safeOrIlike(filters.q)}`) as typeof query
    }

    query = query.order('account_number', { ascending: true }) as typeof query

    const { data: accounts, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list GL accounts', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(accounts ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/gl-accounts — Create a new GL account
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    const supabase = await createClient()

    const { data: account, error } = await (supabase
      .from('gl_accounts')
      .insert({
        ...body,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: GlAccount | null; error: { message: string } | null }>)

    if (error || !account) {
      logger.error('Failed to create GL account', { error: error?.message })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('GL account created', { accountId: account.id, companyId: ctx.companyId! })

    return NextResponse.json({ data: account, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createGlAccountSchema,
    permission: 'jobs:update:all',
    auditAction: 'gl_account.create',
  }
)
