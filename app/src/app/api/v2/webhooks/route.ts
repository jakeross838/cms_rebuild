/**
 * Webhooks API — List & Create
 *
 * GET  /api/v2/webhooks — List webhook subscriptions
 * POST /api/v2/webhooks — Create a new webhook subscription
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
import { listWebhooksSchema, createWebhookSchema } from '@/lib/validation/schemas/api-marketplace'

// ============================================================================
// GET /api/v2/webhooks
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listWebhooksSchema.safeParse({
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
      .from('webhook_subscriptions')
      .select('id, company_id, url, events, status, description, retry_count, max_retries, failure_count, last_triggered_at, last_success_at, last_failure_at, created_by, created_at, updated_at, deleted_at', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.or(`url.ilike.${safeOrIlike(filters.q)},description.ilike.${safeOrIlike(filters.q)}`)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// POST /api/v2/webhooks
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createWebhookSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid webhook data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Generate HMAC secret
    const secret = `whsec_${crypto.randomUUID()}`

    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .insert({
        company_id: ctx.companyId!,
        url: input.url,
        events: input.events,
        status: input.status,
        secret,
        description: input.description ?? null,
        max_retries: input.max_retries,
        created_by: ctx.user!.id,
      })
      .select('id, company_id, url, events, status, secret, description, retry_count, max_retries, failure_count, last_triggered_at, last_success_at, last_failure_at, created_by, created_at, updated_at, deleted_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Return secret ONCE on creation so user can store it — never returned on GET/list
    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'webhook.create' }
)
