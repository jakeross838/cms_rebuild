/**
 * POST /api/v1/auth/accept-invite
 *
 * Accepts a user invitation and creates the user account.
 *
 * Flow:
 * 1. Validate the invite token
 * 2. Check if token is expired or already accepted
 * 3. If user doesn't exist in Supabase auth, create them
 * 4. Create the user profile in the users table
 * 5. Mark the invitation as accepted
 * 6. Return success with login instructions
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { hashToken } from '@/lib/auth/tokens'
import { logger } from '@/lib/monitoring'
import { createAdminClient } from '@/lib/supabase/admin'
import { acceptInviteSchema, type AcceptInviteInput } from '@/lib/validation/schemas/auth'

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const { token, password, name: providedName } = ctx.validatedBody as AcceptInviteInput
    const admin = createAdminClient()

    // Hash the token to look it up
    const tokenHash = hashToken(token)

    // Look up the invitation by token hash
    const { data: invitationData, error: lookupError } = await admin
      .from('user_invitations')
      .select(`
        id,
        company_id,
        email,
        name,
        role,
        expires_at,
        accepted_at,
        revoked_at,
        companies!inner(name)
      `)
      .eq('token_hash', tokenHash)
      .single()

    if (lookupError || !invitationData) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Invalid or expired invitation link.',
          requestId: ctx.requestId,
        },
        { status: 404 }
      )
    }

    // Type the invitation data
    const invitation = invitationData as unknown as {
      id: string
      company_id: string
      email: string
      name: string | null
      role: string
      expires_at: string
      accepted_at: string | null
      revoked_at: string | null
      companies: { name: string }
    }
    const companyName = invitation.companies?.name ?? 'Unknown Company'

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'This invitation has already been accepted. Please log in.',
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    // Check if revoked
    if (invitation.revoked_at) {
      return NextResponse.json(
        {
          error: 'Gone',
          message: 'This invitation has been revoked.',
          requestId: ctx.requestId,
        },
        { status: 410 }
      )
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        {
          error: 'Gone',
          message: 'This invitation has expired. Please request a new one.',
          requestId: ctx.requestId,
        },
        { status: 410 }
      )
    }

    const finalName = providedName || invitation.name || invitation.email.split('@')[0]

    // Check if user already exists in Supabase auth (by email)
    const { data: existingUsers } = await admin.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === invitation.email.toLowerCase()
    )

    let authUserId: string

    if (existingAuthUser) {
      // User exists in auth - check if they already have a profile for this company
      const { data: existingProfile } = await admin
        .from('users')
        .select('id')
        .eq('id', existingAuthUser.id)
        .eq('company_id', invitation.company_id)
        .single()

      if (existingProfile) {
        // Already a member of this company
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'You are already a member of this company. Please log in.',
            requestId: ctx.requestId,
          },
          { status: 409 }
        )
      }

      authUserId = existingAuthUser.id
    } else {
      // Create new auth user
      if (!password) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Password is required for new users.',
            requestId: ctx.requestId,
          },
          { status: 400 }
        )
      }

      const { data: newAuthUser, error: authError } = await admin.auth.admin.createUser({
        email: invitation.email,
        password,
        email_confirm: true, // Auto-confirm since they clicked the invite link
        user_metadata: { name: finalName },
      })

      if (authError || !newAuthUser.user) {
        logger.error('[AcceptInvite] Failed to create auth user', { error: authError?.message })
        return NextResponse.json(
          {
            error: 'Internal Server Error',
            message: 'Failed to create account. Please try again.',
            requestId: ctx.requestId,
          },
          { status: 500 }
        )
      }

      authUserId = newAuthUser.user.id
    }

    // Create user profile
    const { error: profileError } = await admin.from('users').insert({
      id: authUserId,
      company_id: invitation.company_id,
      email: invitation.email,
      name: finalName,
      role: invitation.role,
      is_active: true,
    } as never)

    if (profileError) {
      // Check if it's a duplicate (user already exists in this company)
      if (profileError.code === '23505') {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'You are already a member of this company. Please log in.',
            requestId: ctx.requestId,
          },
          { status: 409 }
        )
      }

      logger.error('[AcceptInvite] Failed to create user profile', { error: profileError?.message })
      // If we created a new auth user, we should clean up
      if (!existingAuthUser) {
        await admin.auth.admin.deleteUser(authUserId).catch(() => {})
      }
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to create user profile. Please try again.',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }

    // Mark invitation as accepted
    await admin
      .from('user_invitations')
      .update({ accepted_at: new Date().toISOString() } as never)
      .eq('id', invitation.id)

    // Log the event
    await admin.from('auth_audit_log').insert({
      company_id: invitation.company_id,
      user_id: authUserId,
      event_type: 'invite_accepted',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
      metadata: {
        email: invitation.email,
        role: invitation.role,
        invitation_id: invitation.id,
      },
    } as never)

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted! You can now log in.',
      user: {
        id: authUserId,
        email: invitation.email,
        name: finalName,
        role: invitation.role,
      },
      company: {
        id: invitation.company_id,
        name: companyName,
      },
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: false, // User isn't logged in yet
    rateLimit: 'auth',
    schema: acceptInviteSchema,
  }
)
