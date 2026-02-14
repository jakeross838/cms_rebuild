/**
 * User Management API — List & Invite
 *
 * GET  /api/v1/users — List users for company (paginated, filterable)
 * POST /api/v1/users — Invite a new user to the company
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
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

    // Status filter
    if (filters.status === 'active') {
      query = query.eq('is_active', true).is('deleted_at', null) as typeof query
    } else if (filters.status === 'inactive') {
      query = query.or('is_active.eq.false,deleted_at.not.is.null') as typeof query
    }
    // 'all' = no status filter

    // Role filter
    if (filters.role) {
      query = query.eq('role', filters.role) as typeof query
    }

    // Search filter (name or email ILIKE)
    if (filters.search) {
      const searchTerm = `%${filters.search}%`
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`) as typeof query
    }

    // Pagination and ordering
    query = query.order('name', { ascending: true }) as typeof query

    const { data: users, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list users', { error: error.message })
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to fetch users', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(
      paginatedResponse(users ?? [], count ?? 0, page, limit)
    )
  },
  {
    requireAuth: true,
    permission: 'users:read:all',
  }
)

// ============================================================================
// POST /api/v1/users — Invite a new user
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

    // Step 1: Create auth user via admin client (bypasses RLS)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: crypto.randomUUID(),
      email_confirm: true,
    })

    if (authError) {
      // Supabase returns specific error if the email is already in auth.users
      // (could be in a different company)
      logger.error('Failed to create auth user', { error: authError.message, email: body.email })
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'An account with this email already exists',
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    const authUser = authData.user

    // Step 2: Insert user profile into public.users
    const { data: newUser, error: profileError } = await (supabase
      .from('users')
      .insert({
        id: authUser.id,
        company_id: ctx.companyId!,
        email: body.email,
        name: body.name,
        role: body.role,
        phone: body.phone ?? null,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: User | null; error: { message: string } | null }>)

    if (profileError || !newUser) {
      // Rollback: delete the auth user we just created
      logger.error('Failed to create user profile, rolling back auth user', {
        error: profileError?.message ?? 'Unknown error',
        authUserId: authUser.id,
      })

      await adminClient.auth.admin.deleteUser(authUser.id)

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to create user profile',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }

    // Log to auth_audit_log via admin client (untyped, bypasses RLS)
    await adminClient
      .from('auth_audit_log')
      .insert({
        company_id: ctx.companyId!,
        user_id: ctx.user!.id,
        event_type: 'user_invited',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        metadata: {
          invited_user_id: newUser.id,
          invited_email: body.email,
          invited_role: body.role,
        },
      } as never)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) logger.warn('Failed to write auth audit log', { error: error.message })
      })

    logger.info('User invited successfully', {
      invitedUserId: newUser.id,
      invitedEmail: body.email,
      companyId: ctx.companyId!,
    })

    return NextResponse.json({ data: newUser }, { status: 201 })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    schema: inviteUserSchema,
    permission: 'users:create:all',
    auditAction: 'user.invite',
  }
)
