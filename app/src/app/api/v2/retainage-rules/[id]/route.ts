/**
 * Retainage Rule by ID — Get, Update, Delete
 *
 * GET    /api/v2/retainage-rules/:id — Get retainage rule details
 * PATCH  /api/v2/retainage-rules/:id — Update retainage rule
 * DELETE /api/v2/retainage-rules/:id — Soft delete (set is_active=false)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedUpdate removed — new tables not yet in generated Supabase types
import { updateRetainageRuleSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/retainage-rules/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing retainage rule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any).from('retainage_rules')
      .select('id, company_id, name, scope, job_id, vendor_id, retainage_percent, release_at_percent_complete, auto_release, is_active, created_at, updated_at')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Retainage rule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// PATCH /api/v2/retainage-rules/:id
// ============================================================================

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing retainage rule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateRetainageRuleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const [key, val] of Object.entries(input)) {
      if (val !== undefined) updates[key] = val
    }

    const { data, error } = await (supabase as any).from('retainage_rules')
      .update(updates as any)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, company_id, name, scope, job_id, vendor_id, retainage_percent, release_at_percent_complete, auto_release, is_active, created_at, updated_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'retainage_rule.update' }
)

// ============================================================================
// DELETE /api/v2/retainage-rules/:id — Soft delete (set is_active=false)
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing retainage rule ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase as any).from('retainage_rules')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError && existError.code !== 'PGRST116') {
      const mapped = mapDbError(existError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Retainage rule not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any).from('retainage_rules')
      .update({ is_active: false, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'retainage_rule.archive' }
)
