import { NextResponse } from 'next/server'

import { createApiHandler, getPaginationParams, mapDbError, paginatedResponse } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const GET = createApiHandler(
  async (req, ctx) => {
    const supabase = await createClient()
    const { page, limit, offset } = getPaginationParams(req)
    const url = req.nextUrl

    // Build query
    let query = supabase
      .from('auth_audit_log')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })

    // Optional filters
    const userId = url.searchParams.get('user_id')
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const eventType = url.searchParams.get('event_type')
    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    const startDate = url.searchParams.get('start_date')
    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    const endDate = url.searchParams.get('end_date')
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ ...paginatedResponse(data ?? [], count ?? 0, page, limit), requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'users:read:all',
  }
)
