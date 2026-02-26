/**
 * Selection History API — List history for a selection
 *
 * GET /api/v2/selections/:id/history — Get selection history
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listSelectionHistorySchema } from '@/lib/validation/schemas/selections'

/**
 * Extract selection ID from a path like /api/v2/selections/:id/history
 */
function extractSelectionId(pathname: string): string | null {
  const segments = pathname.split('/')
  const selIdx = segments.indexOf('selections')
  if (selIdx === -1 || selIdx + 1 >= segments.length) return null
  return segments[selIdx + 1]
}

// ============================================================================
// GET /api/v2/selections/:id/history
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const selectionId = extractSelectionId(req.nextUrl.pathname)
    if (!selectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing selection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listSelectionHistorySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify the selection exists and belongs to company
    const { data: selection, error: selError } = await (supabase as any)
      .from('selections')
      .select('id, category_id')
      .eq('id', selectionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (selError || !selection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch history for the selection's category
    const { data, count, error } = await (supabase as any)
      .from('selection_history')
      .select('*', { count: 'exact' })
      .eq('category_id', selection.category_id)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)
