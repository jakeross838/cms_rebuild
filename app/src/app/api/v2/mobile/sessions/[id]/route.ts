/**
 * Mobile Session by ID — Get, Update, Delete
 *
 * GET    /api/v2/mobile/sessions/:id — Get session details
 * PUT    /api/v2/mobile/sessions/:id — Update session
 * DELETE /api/v2/mobile/sessions/:id — End session
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMobileSessionSchema } from '@/lib/validation/schemas/mobile-app'

// ============================================================================
// GET /api/v2/mobile/sessions/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing session ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('mobile_sessions')
      .select('id, company_id, user_id, device_id, status, ip_address, user_agent, started_at, last_activity_at, expires_at, ended_at, created_at, updated_at')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Session not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/mobile/sessions/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing session ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMobileSessionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.status !== undefined) updates.status = input.status
    if (input.last_activity_at !== undefined) updates.last_activity_at = input.last_activity_at
    if (input.ended_at !== undefined) updates.ended_at = input.ended_at

    const { data, error } = await supabase
      .from('mobile_sessions')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('id, company_id, user_id, device_id, status, ip_address, user_agent, started_at, last_activity_at, expires_at, ended_at, created_at, updated_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'mobile_session.update' }
)

// ============================================================================
// DELETE /api/v2/mobile/sessions/:id — End session
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing session ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await supabase
      .from('mobile_sessions')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Session not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'active') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Session is already ended', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('mobile_sessions')
      .update({
        status: 'expired',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'mobile_session.archive' }
)
