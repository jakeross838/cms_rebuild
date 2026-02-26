/**
 * GL Accounts — List & Create
 *
 * GET  /api/v2/gl/accounts — List chart of accounts
 * POST /api/v2/gl/accounts — Create GL account
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
import { listGlAccountsSchema, createGlAccountSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/gl/accounts
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
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
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('gl_accounts')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.account_type) {
      query = query.eq('account_type', filters.account_type)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.parent_account_id) {
      query = query.eq('parent_account_id', filters.parent_account_id)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,account_number.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('account_number', { ascending: true })

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
// POST /api/v2/gl/accounts
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createGlAccountSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid account data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('gl_accounts')
      .insert({
        company_id: ctx.companyId!,
        account_number: input.account_number,
        name: input.name,
        account_type: input.account_type,
        sub_type: input.sub_type ?? null,
        parent_account_id: input.parent_account_id ?? null,
        is_active: input.is_active,
        is_system: input.is_system,
        description: input.description ?? null,
        normal_balance: input.normal_balance,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'An account with this number already exists', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'gl_account.create' }
)
