/**
 * Webhook by ID — Get, Update, Delete (Soft)
 *
 * GET    /api/v2/webhooks/:id — Get webhook subscription
 * PUT    /api/v2/webhooks/:id — Update webhook
 * DELETE /api/v2/webhooks/:id — Soft delete webhook
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateWebhookSchema } from '@/lib/validation/schemas/api-marketplace'

// ============================================================================
// GET /api/v2/webhooks/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing webhook ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .select('id, company_id, url, events, status, description, retry_count, max_retries, failure_count, last_triggered_at, last_success_at, last_failure_at, created_by, created_at, updated_at, deleted_at')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Webhook not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/webhooks/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing webhook ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateWebhookSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.url !== undefined) updates.url = input.url
    if (input.events !== undefined) updates.events = input.events
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.max_retries !== undefined) updates.max_retries = input.max_retries

    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, company_id, url, events, status, description, retry_count, max_retries, failure_count, last_triggered_at, last_success_at, last_failure_at, created_by, created_at, updated_at, deleted_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'webhook.update' }
)

// ============================================================================
// DELETE /api/v2/webhooks/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing webhook ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existingError } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      const mapped = mapDbError(existingError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Webhook not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('webhook_subscriptions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'webhook.archive' }
)
