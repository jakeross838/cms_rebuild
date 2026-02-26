/**
 * Push Notification Tokens API — List & Create
 *
 * GET  /api/v2/mobile/push-tokens — List push tokens
 * POST /api/v2/mobile/push-tokens — Register a new push token
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPushTokensSchema, createPushTokenSchema } from '@/lib/validation/schemas/mobile-app'

// ============================================================================
// GET /api/v2/mobile/push-tokens
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listPushTokensSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      device_id: url.searchParams.get('device_id') ?? undefined,
      provider: url.searchParams.get('provider') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
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
      .from('push_notification_tokens')
      .select('id, company_id, user_id, device_id, provider, is_active, last_used_at, created_at, updated_at, deleted_at', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.device_id) {
      query = query.eq('device_id', filters.device_id)
    }
    if (filters.provider) {
      query = query.eq('provider', filters.provider)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// POST /api/v2/mobile/push-tokens — Register push token
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createPushTokenSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid push token data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('push_notification_tokens')
      .insert({
        company_id: ctx.companyId!,
        user_id: ctx.user!.id,
        device_id: input.device_id,
        token: input.token,
        provider: input.provider,
        is_active: input.is_active,
      })
      .select('id, company_id, user_id, device_id, provider, is_active, last_used_at, created_at, updated_at, deleted_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'mobile_push_token.create' }
)
