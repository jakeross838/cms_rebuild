/**
 * POST /api/v1/auth/switch-company
 *
 * Switches the user's current company context.
 * Validates the user has an active membership in the target company.
 * Sets a cookie to persist the selection.
 */

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const switchCompanySchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
})

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = ctx.validatedBody as { companyId: string }
    const targetCompanyId = body.companyId

    const supabase = await createClient()
    const admin = createAdminClient()

    // Verify the user has an active membership in the target company
    const { data: membership, error: membershipError } = await supabase
      .from('user_company_memberships')
      .select('id, role, status')
      .eq('auth_user_id', ctx.user!.id)
      .eq('company_id', targetCompanyId)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have access to this company',
          requestId: ctx.requestId,
        },
        { status: 403 }
      )
    }

    // Get the company details (exclude soft-deleted)
    const { data: company, error: companyError } = await admin
      .from('companies')
      .select('id, name')
      .eq('id', targetCompanyId)
      .is('deleted_at', null)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Company not found',
          requestId: ctx.requestId,
        },
        { status: 404 }
      )
    }

    // Get the user's profile in the target company (exclude soft-deleted)
    const { data: userProfile } = await admin
      .from('users')
      .select('id, name, email, role')
      .eq('id', ctx.user!.id)
      .eq('company_id', targetCompanyId)
      .is('deleted_at', null)
      .single()

    // Log the company switch
    await admin.from('auth_audit_log').insert({
      company_id: targetCompanyId,
      user_id: ctx.user!.id,
      event_type: 'company_switched',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
      metadata: {
        from_company_id: ctx.companyId,
        to_company_id: targetCompanyId,
      },
    } as never)

    // Create response with cookie to persist the selection
    const response = NextResponse.json({
      success: true,
      company: {
        id: (company as { id: string; name: string }).id,
        name: (company as { id: string; name: string }).name,
      },
      role: (membership as { role: string }).role,
      user: userProfile ? {
        id: (userProfile as { id: string }).id,
        name: (userProfile as { name: string }).name,
        email: (userProfile as { email: string }).email,
        role: (userProfile as { role: string }).role,
      } : null,
      requestId: ctx.requestId,
    })

    // Set cookie to persist company selection
    // This cookie will be read by the middleware/auth context
    response.cookies.set('rossos_company_id', targetCompanyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return response
  },
  {
    requireAuth: true,
    schema: switchCompanySchema,
    auditAction: 'auth.switch_company',
  }
)
