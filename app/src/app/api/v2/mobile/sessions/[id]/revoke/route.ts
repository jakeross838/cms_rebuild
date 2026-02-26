/**
 * Revoke Mobile Session
 *
 * POST /api/v2/mobile/sessions/:id/revoke — Revoke a session (security action)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { revokeMobileSessionSchema } from '@/lib/validation/schemas/mobile-app'

// ============================================================================
// POST /api/v2/mobile/sessions/:id/revoke
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // Path: /api/v2/mobile/sessions/:id/revoke — id is at index -2
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing session ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = revokeMobileSessionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid request data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify session exists and is active
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
        { error: 'Conflict', message: 'Only active sessions can be revoked', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('mobile_sessions')
      .update({
        status: 'revoked',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'mobile_session.revoke' }
)
