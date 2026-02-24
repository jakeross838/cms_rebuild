/**
 * Sync Conflicts API — List
 *
 * GET /api/v2/integrations/conflicts — List sync conflicts
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listConflictsSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// GET /api/v2/integrations/conflicts
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listConflictsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      connection_id: url.searchParams.get('connection_id') ?? undefined,
      entity_type: url.searchParams.get('entity_type') ?? undefined,
      resolution: url.searchParams.get('resolution') ?? undefined,
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

    let query = (supabase as any)
      .from('sync_conflicts')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.connection_id) {
      query = query.eq('connection_id', filters.connection_id)
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type)
    }
    if (filters.resolution) {
      query = query.eq('resolution', filters.resolution)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)
