/**
 * Company Subscription by ID — Get, Update
 *
 * GET /api/v2/billing/subscriptions/:id — Get subscription
 * PUT /api/v2/billing/subscriptions/:id — Update subscription (cancel via status)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateSubscriptionSchema } from '@/lib/validation/schemas/subscription-billing'

// ============================================================================
// GET /api/v2/billing/subscriptions/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing subscription ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('company_subscriptions')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Subscription not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/billing/subscriptions/:id — Update (cancel via status)
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing subscription ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateSubscriptionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.plan_id !== undefined) updates.plan_id = input.plan_id
    if (input.status !== undefined) updates.status = input.status
    if (input.billing_cycle !== undefined) updates.billing_cycle = input.billing_cycle
    if (input.current_period_start !== undefined) updates.current_period_start = input.current_period_start
    if (input.current_period_end !== undefined) updates.current_period_end = input.current_period_end
    if (input.trial_start !== undefined) updates.trial_start = input.trial_start
    if (input.trial_end !== undefined) updates.trial_end = input.trial_end
    if (input.cancelled_at !== undefined) updates.cancelled_at = input.cancelled_at
    if (input.cancel_reason !== undefined) updates.cancel_reason = input.cancel_reason
    if (input.stripe_subscription_id !== undefined) updates.stripe_subscription_id = input.stripe_subscription_id
    if (input.stripe_customer_id !== undefined) updates.stripe_customer_id = input.stripe_customer_id
    if (input.grandfathered_plan !== undefined) updates.grandfathered_plan = input.grandfathered_plan
    if (input.metadata !== undefined) updates.metadata = input.metadata

    // Auto-set cancelled_at when status changes to cancelled
    if (input.status === 'cancelled' && input.cancelled_at === undefined) {
      updates.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await (supabase as any)
      .from('company_subscriptions')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
