/**
 * Invoice Extractions — List
 *
 * GET /api/v2/invoices/extractions — List invoice extraction records
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const url = req.nextUrl
    const status = url.searchParams.get('status')
    const { page, limit, offset } = getPaginationParams(req)

    const supabase = await createClient()

    let query = (supabase as any)
      .from('invoice_extractions')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)
