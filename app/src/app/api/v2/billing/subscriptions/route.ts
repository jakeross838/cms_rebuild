/**
 * Company Subscriptions API — List & Create
 *
 * GET  /api/v2/billing/subscriptions — List subscriptions
 * POST /api/v2/billing/subscriptions — Create a new subscription
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listSubscriptionsSchema, createSubscriptionSchema } from '@/lib/validation/schemas/subscription-billing'

// ============================================================================
// GET /api/v2/billing/subscriptions
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listSubscriptionsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      billing_cycle: url.searchParams.get('billing_cycle') ?? undefined,
      plan_id: url.searchParams.get('plan_id') ?? undefined,
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

    let query = (supabase as any)
      .from('company_subscriptions')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.billing_cycle) {
      query = query.eq('billing_cycle', filters.billing_cycle)
    }
    if (filters.plan_id) {
      query = query.eq('plan_id', filters.plan_id)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/billing/subscriptions — Create subscription
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createSubscriptionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid subscription data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for existing subscription (UNIQUE constraint on company_id)
    const { data: existing } = await (supabase as any)
      .from('company_subscriptions')
      .select('id')
      .eq('company_id', ctx.companyId!)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Company already has an active subscription', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('company_subscriptions')
      .insert({
        company_id: ctx.companyId!,
        plan_id: input.plan_id,
        status: input.status,
        billing_cycle: input.billing_cycle,
        current_period_start: input.current_period_start ?? null,
        current_period_end: input.current_period_end ?? null,
        trial_start: input.trial_start ?? null,
        trial_end: input.trial_end ?? null,
        stripe_subscription_id: input.stripe_subscription_id ?? null,
        stripe_customer_id: input.stripe_customer_id ?? null,
        grandfathered_plan: input.grandfathered_plan ?? null,
        metadata: input.metadata,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
