/**
 * API Keys — List & Create
 *
 * GET  /api/v2/api-keys — List API keys for company
 * POST /api/v2/api-keys — Create a new API key
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { listApiKeysSchema, createApiKeySchema } from '@/lib/validation/schemas/api-marketplace'

// ============================================================================
// GET /api/v2/api-keys
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listApiKeysSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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
      .from('api_keys')
      .select('id, company_id, name, key_prefix, permissions, status, rate_limit_per_minute, last_used_at, expires_at, revoked_at, revoked_by, created_by, created_at, updated_at', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.ilike('name', `%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

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
// POST /api/v2/api-keys
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createApiKeySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid API key data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Generate a key prefix and hash (V1: placeholder hash; real hashing in V2)
    const keyPrefix = `sk_${Math.random().toString(36).substring(2, 8)}`
    const keyHash = `hash_${crypto.randomUUID()}`

    const insertData: Record<string, unknown> = {
      company_id: ctx.companyId!,
      name: input.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      permissions: input.permissions,
      rate_limit_per_minute: input.rate_limit_per_minute,
      status: 'active',
      created_by: ctx.user!.id,
    }

    if (input.expires_at) {
      insertData.expires_at = input.expires_at
    }

    const { data, error } = await supabase
      .from('api_keys')
      .insert(insertData as never)
      .select('id, company_id, name, key_prefix, permissions, status, rate_limit_per_minute, last_used_at, expires_at, revoked_at, revoked_by, created_by, created_at, updated_at')
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
