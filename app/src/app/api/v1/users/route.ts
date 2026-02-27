/**
 * User Management API — List & Invite
 *
 * GET  /api/v1/users — List users for company (paginated, filterable)
 * POST /api/v1/users — Invite a new user to the company (sends email)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  mapDbError,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { env } from '@/lib/env'
import { generateInviteToken } from '@/lib/auth/tokens'
import { sendInviteEmail } from '@/lib/email/resend'
import { createLogger } from '@/lib/monitoring'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { escapeLike } from '@/lib/utils'
import { inviteUserSchema, listUsersSchema, type InviteUserInput } from '@/lib/validation/schemas/users'
import type { User } from '@/types/database'

// ============================================================================
// GET /api/v1/users — List users for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    // Parse and validate query params
    const url = req.nextUrl
    const parseResult = listUsersSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      role: url.searchParams.get('role') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)

    const supabase = await createClient()

    // Build query — always scoped to company
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: User[] | null; count: number | null; error: { message: string } | null }>
      }

    // Status filter — default excludes soft-deleted users
    if (filters.status === 'active') {
      query = query.eq('is_active', true).is('deleted_at', null) as typeof query
    } else if (filters.status === 'inactive') {
      query = query.or('is_active.eq.false,deleted_at.not.is.null') as typeof query
    } else if (filters.status === 'all') {
      // 'all' = no status filter (includes soft-deleted)
    } else {
      // Default: exclude soft-deleted users
      query = query.is('deleted_at', null) as typeof query
    }

    // Role filter
    if (filters.role) {
      query = query.eq('role', filters.role) as typeof query
    }

    // Search filter (name or email ILIKE)
    if (filters.search) {
      const searchTerm = `%${escapeLike(filters.search)}%`
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`) as typeof query
    }

    // Pagination and ordering
    query = query.order('name', { ascending: true }) as typeof query

    const { data: users, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list users', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(users ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  {
    requireAuth: true,
    permission: 'users:read:all',
  }
)

// ============================================================================
// POST /api/v1/users — Invite a new user (creates invitation, sends email)
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as InviteUserInput

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Check if user with this email already exists in the company
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, is_active, deleted_at')
      .eq('company_id', ctx.companyId!)
      .eq('email', body.email)
      .maybeSingle() as { data: Pick<User, 'id' | 'email' | 'is_active' | 'deleted_at'> | null; error: unknown }

    if (existingUser) {
      // If soft-deleted or inactive, tell the admin to reactivate instead
      if (existingUser.deleted_at || !existingUser.is_active) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'A deactivated user with this email already exists. Reactivate them instead.',
            existingUserId: existingUser.id,
            requestId: ctx.requestId,
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A user with this email already exists in your company',
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    // Check if there's already a pending invitation for this email
    const { data: existingInvite } = await adminClient
      .from('user_invitations')
      .select('id, expires_at')
      .eq('company_id', ctx.companyId!)
      .eq('email', body.email)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (existingInvite) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A pending invitation already exists for this email. Revoke it first or wait for it to expire.',
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    // Get company name for the email
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', ctx.companyId!)
      .single() as { data: { name: string } | null; error: unknown }

    const companyName = company?.name || 'your company'

    // Get inviter name
    const { data: inviter } = await supabase
      .from('users')
      .select('name')
      .eq('id', ctx.user!.id)
      .single() as { data: { name: string } | null; error: unknown }

    const inviterName = inviter?.name || 'A team member'

    // Generate invite token
    const { token, hash: tokenHash } = generateInviteToken()

    // Create invitation record
    const { data: invitation, error: inviteError } = await adminClient
      .from('user_invitations')
      .insert({
        company_id: ctx.companyId!,
        email: body.email,
        name: body.name,
        role: body.role,
        token_hash: tokenHash,
        invited_by: ctx.user!.id,
        invited_at: new Date().toISOString(),
      } as never)
      .select()
      .single()

    if (inviteError || !invitation) {
      logger.error('Failed to create invitation', { error: inviteError?.message })
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to create invitation',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }

    // Build invite URL
    const appUrl = env.NEXT_PUBLIC_APP_URL
    const inviteUrl = `${appUrl}/accept-invite?token=${token}`

    // Send invitation email
    const emailResult = await sendInviteEmail({
      to: body.email,
      inviterName,
      companyName,
      role: body.role,
      inviteUrl,
    })

    if (!emailResult.success) {
      logger.warn('Failed to send invitation email', { error: emailResult.error, email: body.email })
      // Don't fail the request - invitation is created, email just failed to send
      // In production, you might want to queue a retry
    }

    // Log to auth_audit_log via admin client
    await adminClient
      .from('auth_audit_log')
      .insert({
        company_id: ctx.companyId!,
        user_id: ctx.user!.id,
        event_type: 'user_invited',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        metadata: {
          invitation_id: (invitation as { id: string }).id,
          invited_email: body.email,
          invited_role: body.role,
          email_sent: emailResult.success,
        },
      } as never)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) logger.warn('Failed to write auth audit log', { error: error.message })
      })

    logger.info('User invitation created', {
      invitationId: (invitation as { id: string }).id,
      invitedEmail: body.email,
      companyId: ctx.companyId!,
      emailSent: emailResult.success,
    })

    return NextResponse.json(
      {
        data: {
          invitation: {
            id: (invitation as { id: string }).id,
            email: body.email,
            name: body.name,
            role: body.role,
            expires_at: (invitation as { expires_at: string }).expires_at,
          },
          emailSent: emailResult.success,
        },
        message: emailResult.success
          ? `Invitation sent to ${body.email}`
          : `Invitation created but email failed to send. The user can still use the invite link.`,
        requestId: ctx.requestId,
      },
      { status: 201 }
    )
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: inviteUserSchema,
    permission: 'users:create:all',
    auditAction: 'user.invite',
  }
)
