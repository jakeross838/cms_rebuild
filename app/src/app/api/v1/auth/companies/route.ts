/**
 * GET /api/v1/auth/companies
 *
 * Returns all companies the current user belongs to.
 * Used by the tenant switcher to show available companies.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

interface CompanyMembership {
  id: string
  company_id: string
  role: string
  status: string
  companies: {
    id: string
    name: string
  }
}

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()

    // Get all active memberships for the current user
    const { data: memberships, error } = await supabase
      .from('user_company_memberships')
      .select(`
        id,
        company_id,
        role,
        status,
        companies!inner(id, name)
      `)
      .eq('auth_user_id', ctx.user!.id)
      .eq('status', 'active')
      .order('companies(name)', { ascending: true })

    if (error) {
      console.error('[GetCompanies] Failed to fetch memberships:', error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to fetch companies',
          requestId: ctx.requestId,
        },
        { status: 500 }
      )
    }

    // Transform the response
    const companies = (memberships as unknown as CompanyMembership[])?.map((m) => ({
      id: m.companies.id,
      name: m.companies.name,
      role: m.role,
      isCurrent: m.company_id === ctx.companyId,
    })) ?? []

    return NextResponse.json({
      companies,
      currentCompanyId: ctx.companyId,
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
  }
)
