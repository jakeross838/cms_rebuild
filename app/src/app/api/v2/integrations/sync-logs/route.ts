/**
 * Sync Logs API — List
 *
 * GET /api/v2/integrations/sync-logs — List sync log entries
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listSyncLogsSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// GET /api/v2/integrations/sync-logs
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listSyncLogsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      connection_id: url.searchParams.get('connection_id') ?? undefined,
      sync_type: url.searchParams.get('sync_type') ?? undefined,
      direction: url.searchParams.get('direction') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('sync_logs')
      .select('id, company_id, connection_id, sync_type, direction, status, entities_processed, entities_created, entities_updated, entities_failed, started_at, completed_at, created_at', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.connection_id) {
      query = query.eq('connection_id', filters.connection_id)
    }
    if (filters.sync_type) {
      query = query.eq('sync_type', filters.sync_type)
    }
    if (filters.direction) {
      query = query.eq('direction', filters.direction)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('started_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)
