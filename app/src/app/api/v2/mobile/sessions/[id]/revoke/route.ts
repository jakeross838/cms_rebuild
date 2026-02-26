/**
 * Revoke Mobile Session
 *
 * POST /api/v2/mobile/sessions/:id/revoke — Revoke a session (security action)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
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
    const { data: existing, error: existError } = await (supabase as any)
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

    const { data, error } = await (supabase as any)
      .from('mobile_sessions')
      .update({
        status: 'revoked',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
