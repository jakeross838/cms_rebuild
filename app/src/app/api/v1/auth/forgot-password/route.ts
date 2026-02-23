/**
 * POST /api/v1/auth/forgot-password
 *
 * Initiates a password reset flow.
 * Sends a password reset email via Resend (not Supabase's built-in).
 *
 * Security:
 * - Always returns success to prevent email enumeration
 * - Rate limited to prevent abuse
 * - Logs the request regardless of whether email exists
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { sendPasswordResetEmail } from '@/lib/email/resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation/schemas/auth'

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const { email } = ctx.validatedBody as ForgotPasswordInput
    const admin = createAdminClient()

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    // Look up the user by email
    const { data: userData } = await admin
      .from('users')
      .select('id, name, company_id')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()

    // Type the user data
    const user = userData as { id: string; name: string | null; company_id: string } | null

    // Log the password reset request (regardless of whether user exists)
    await admin.from('auth_audit_log').insert({
      company_id: user?.company_id ?? '00000000-0000-0000-0000-000000000000',
      user_id: user?.id ?? null,
      event_type: 'password_reset_requested',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { email, user_exists: !!user },
    } as never)

    // If user exists, generate reset link and send email
    if (user) {
      // Use Supabase's built-in password reset which generates a secure token
      const { error: resetError } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: email.toLowerCase(),
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
        },
      })

      if (!resetError) {
        // Note: Supabase will send its own email if configured, but we want to use Resend
        // Generate a reset URL manually using the action link from Supabase
        const { data: linkData } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email: email.toLowerCase(),
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
          },
        })

        if (linkData?.properties?.action_link) {
          await sendPasswordResetEmail({
            to: email,
            resetUrl: linkData.properties.action_link,
            userName: user.name ?? undefined,
          })
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, you will receive a password reset link.',
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: false,
    rateLimit: 'auth',
    schema: forgotPasswordSchema,
  }
)
