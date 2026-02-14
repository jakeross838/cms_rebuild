/**
 * POST /api/v1/auth/login
 *
 * Authenticates a user with email + password via Supabase Auth.
 * On success: updates last_login_at, logs to auth_audit_log, returns profile + session.
 * On failure: logs failed attempt, returns 401.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, type LoginInput } from '@/lib/validation/schemas/auth'
import type { AuthAuditLogInsert } from '@/types/auth'
import type { User } from '@/types/database'

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const { email, password } = ctx.validatedBody as LoginInput
    const supabase = await createClient()

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    // Attempt sign-in via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user || !authData.session) {
      // Log the failed login attempt via admin client (bypasses RLS)
      const admin = createAdminClient()
      const failedEntry: AuthAuditLogInsert = {
        // We don't know the company_id for a failed login; use a sentinel
        company_id: '00000000-0000-0000-0000-000000000000',
        user_id: null,
        event_type: 'login_failed',
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { email, reason: authError?.message ?? 'Unknown error' },
      }
      await admin.from('auth_audit_log').insert(failedEntry as never)

      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid email or password',
          requestId: ctx.requestId,
        },
        { status: 401 }
      )
    }

    // Fetch the full user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single() as { data: User | null; error: unknown }

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'User profile not found. Contact your administrator.',
          requestId: ctx.requestId,
        },
        { status: 403 }
      )
    }

    // Check if user is active
    if (!profile.is_active || profile.deleted_at) {
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Account is deactivated. Contact your administrator.',
          requestId: ctx.requestId,
        },
        { status: 403 }
      )
    }

    // Update last_login_at and log the successful login via admin client
    const admin = createAdminClient()
    const auditEntry: AuthAuditLogInsert = {
      company_id: profile.company_id,
      user_id: authData.user.id,
      event_type: 'login',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { email },
    }

    await Promise.all([
      // Update last_login_at on the users table
      admin
        .from('users')
        .update({ last_login_at: new Date().toISOString() } as never)
        .eq('id', authData.user.id),

      // Insert audit log entry
      admin.from('auth_audit_log').insert(auditEntry as never),
    ])

    return NextResponse.json({
      user: {
        id: profile.id,
        company_id: profile.company_id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active,
        last_login_at: new Date().toISOString(),
        preferences: profile.preferences,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: false,
    rateLimit: 'auth',
    schema: loginSchema,
  }
)
