/**
 * Training Path Items API — List & Create
 *
 * GET  /api/v2/training/paths/:id/items — List items in a path
 * POST /api/v2/training/paths/:id/items — Add item to path
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPathItemsSchema, createPathItemSchema } from '@/lib/validation/schemas/training'

/**
 * Extract path ID from /api/v2/training/paths/:id/items
 */
function extractPathId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('paths')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/training/paths/:id/items
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const pathId = extractPathId(req.nextUrl.pathname)
    if (!pathId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listPathItemsSchema.safeParse({
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

    // Verify path exists and is accessible
    const { data: path, error: pError } = await (supabase as any)
      .from('training_paths')
      .select('id, company_id')
      .eq('id', pathId)
      .single()

    if (pError || !path) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Training path not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (path.company_id !== null && path.company_id !== ctx.companyId) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Training path not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase as any)
      .from('training_path_items')
      .select('*', { count: 'exact' })
      .eq('path_id', pathId)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

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

// ============================================================================
// POST /api/v2/training/paths/:id/items — Add item to path
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const pathId = extractPathId(req.nextUrl.pathname)
    if (!pathId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createPathItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify path belongs to company
    const { data: path, error: pError } = await (supabase as any)
      .from('training_paths')
      .select('id')
      .eq('id', pathId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (pError || !path) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Training path not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('training_path_items')
      .insert({
        company_id: ctx.companyId!,
        path_id: pathId,
        item_type: input.item_type,
        item_id: input.item_id,
        sort_order: input.sort_order,
        is_required: input.is_required,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
