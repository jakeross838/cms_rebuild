/**
 * POST /api/v1/auth/logout
 *
 * Signs out the authenticated user, logs the event to auth_audit_log.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { AuthAuditLogInsert } from '@/types/auth'

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    // Sign out via Supabase Auth
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to sign out',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }

    // Log the logout event via admin client
    if (ctx.user) {
      const admin = createAdminClient()
      const auditEntry: AuthAuditLogInsert = {
        company_id: ctx.user.companyId,
        user_id: ctx.user.id,
        event_type: 'logout',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { email: ctx.user.email },
      }
      await admin.from('auth_audit_log').insert(auditEntry as never)
    }

    const response = NextResponse.json({
      success: true,
      requestId: ctx.requestId,
    })

    // Clear custom company context cookie
    response.cookies.set('rossos_company_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  },
  {
    requireAuth: true,
    rateLimit: 'auth',
    auditAction: 'auth.logout',
  }
)
