/**
 * Webhook Deliveries — List deliveries for a subscription
 *
 * GET /api/v2/webhooks/:id/deliveries — List delivery history
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listWebhookDeliveriesSchema } from '@/lib/validation/schemas/api-marketplace'

// ============================================================================
// GET /api/v2/webhooks/:id/deliveries
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // Pattern: /api/v2/webhooks/[id]/deliveries
    const webhookIdx = segments.indexOf('webhooks')
    const subscriptionId = segments[webhookIdx + 1]
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing webhook ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listWebhookDeliveriesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      event_type: url.searchParams.get('event_type') ?? undefined,
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

    // Verify webhook belongs to company
    const { data: webhook } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', subscriptionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!webhook) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Webhook not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('webhook_deliveries')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .eq('subscription_id', subscriptionId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type)
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
