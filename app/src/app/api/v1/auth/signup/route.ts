/**
 * POST /api/v1/auth/signup
 *
 * Creates a new user account and company (tenant).
 * The user becomes the owner of the new company.
 *
 * Flow:
 * 1. Create Supabase auth user (sends verification email automatically)
 * 2. Create company record
 * 3. Create user profile with owner role
 * 4. Seed default roles for the company
 * 5. Send welcome email via Resend
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { sendWelcomeEmail } from '@/lib/email/resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { signupSchema, type SignupInput } from '@/lib/validation/schemas/auth'

// Default system roles to seed for every new company
const SYSTEM_ROLES = [
  { name: 'Owner', base_role: 'owner', is_system: true, description: 'Full access including billing and subscription management' },
  { name: 'Admin', base_role: 'admin', is_system: true, description: 'Full feature access, no billing' },
  { name: 'Project Manager', base_role: 'pm', is_system: true, description: 'Manage projects, schedules, and budgets' },
  { name: 'Superintendent', base_role: 'superintendent', is_system: true, description: 'Field leadership, daily logs, crew management' },
  { name: 'Office', base_role: 'office', is_system: true, description: 'Accounting, selections, scheduling' },
  { name: 'Field', base_role: 'field', is_system: true, description: 'Daily logs, photos, time entries' },
  { name: 'Read Only', base_role: 'read_only', is_system: true, description: 'View only access' },
]

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const { email, password, name, companyName } = ctx.validatedBody as SignupInput
    const admin = createAdminClient()

    // Use company name or derive from user name
    const finalCompanyName = companyName || `${name}'s Company`

    // Step 1: Check if email already exists
    const { data: existingUsers } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'An account with this email already exists',
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    // Step 2: Create Supabase auth user
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User must verify email
      user_metadata: { name },
    })

    if (authError || !authData.user) {
      console.error('[Signup] Failed to create auth user:', authError)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to create account. Please try again.',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }

    const authUserId = authData.user.id

    try {
      // Step 3: Create company
      const { data: company, error: companyError } = await admin
        .from('companies')
        .insert({
          name: finalCompanyName,
          settings: { permissions_mode: 'open' },
          permissions_mode: 'open',
          subscription_tier: 'trial',
          subscription_status: 'active',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        } as never)
        .select()
        .single()

      if (companyError || !company) {
        console.error('[Signup] Failed to create company:', companyError)
        // Rollback: delete auth user
        await admin.auth.admin.deleteUser(authUserId)
        return NextResponse.json(
          {
            error: 'Internal Server Error',
            message: 'Failed to create company. Please try again.',
            requestId: ctx.requestId,
          },
          { status: 500 }
        )
      }

      const companyId = (company as { id: string }).id

      // Step 4: Create user profile
      const { error: userError } = await admin.from('users').insert({
        id: authUserId,
        company_id: companyId,
        email,
        name,
        role: 'owner',
        is_active: true,
      } as never)

      if (userError) {
        console.error('[Signup] Failed to create user profile:', userError)
        // Rollback: delete company and auth user
        await admin.from('companies').delete().eq('id', companyId)
        await admin.auth.admin.deleteUser(authUserId)
        return NextResponse.json(
          {
            error: 'Internal Server Error',
            message: 'Failed to create user profile. Please try again.',
            requestId: ctx.requestId,
          },
          { status: 500 }
        )
      }

      // Step 5: Create membership linking user to company
      await admin.from('user_company_memberships').insert({
        auth_user_id: authUserId,
        company_id: companyId,
        role: 'owner',
        status: 'active',
      } as never)

      // Step 6: Seed default roles for the company
      const rolesToInsert = SYSTEM_ROLES.map((role) => ({
        company_id: companyId,
        name: role.name,
        base_role: role.base_role,
        is_system: role.is_system,
        description: role.description,
        permissions: [],
      }))
      await admin.from('roles').insert(rolesToInsert as never)

      // Step 7: Log the signup event
      await admin.from('auth_audit_log').insert({
        company_id: companyId,
        user_id: authUserId,
        event_type: 'signup',
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        user_agent: req.headers.get('user-agent') ?? null,
        metadata: { email, company_name: finalCompanyName },
      } as never)
      // Step 8: Send verification email via Supabase (it handles this automatically on createUser with email_confirm: false)
      // Also send welcome email via Resend
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      await sendWelcomeEmail({
        to: email,
        userName: name,
        loginUrl: `${appUrl}/login`,
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Account created! Please check your email to verify your account.',
          user: {
            id: authUserId,
            email,
            name,
          },
          company: {
            id: companyId,
            name: finalCompanyName,
          },
          requestId: ctx.requestId,
        },
        { status: 201 }
      )
    } catch (err) {
      console.error('[Signup] Unexpected error:', err)
      // Attempt cleanup
      await admin.auth.admin.deleteUser(authUserId).catch(() => {})
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'An unexpected error occurred. Please try again.',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }
  },
  {
    requireAuth: false,
    rateLimit: 'auth',
    schema: signupSchema,
  }
)
