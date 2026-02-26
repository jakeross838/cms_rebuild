/**
 * Quality Checklist Items — List & Create
 *
 * GET  /api/v2/quality-checklists/:id/items — List checklist items
 * POST /api/v2/quality-checklists/:id/items — Add a checklist item
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listChecklistItemsSchema, createChecklistItemSchema } from '@/lib/validation/schemas/punch-list'

/**
 * Extract checklist ID from path like /api/v2/quality-checklists/:id/items
 */
function extractChecklistId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('quality-checklists')
  return idx !== -1 && idx + 1 < segments.length ? segments[idx + 1] : null
}

// ============================================================================
// GET /api/v2/quality-checklists/:id/items
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const checklistId = extractChecklistId(req.nextUrl.pathname)
    if (!checklistId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const parseResult = listChecklistItemsSchema.safeParse({
      page: req.nextUrl.searchParams.get('page') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify checklist belongs to company
    const { data: checklist, error: clError } = await supabase
      .from('quality_checklists')
      .select('id')
      .eq('id', checklistId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (clError || !checklist) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('quality_checklist_items')
      .select('*', { count: 'exact' })
      .eq('checklist_id', checklistId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

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

// ============================================================================
// POST /api/v2/quality-checklists/:id/items — Add checklist item
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const checklistId = extractChecklistId(req.nextUrl.pathname)
    if (!checklistId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createChecklistItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid checklist item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify checklist belongs to company
    const { data: checklist, error: clError } = await supabase
      .from('quality_checklists')
      .select('id')
      .eq('id', checklistId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (clError || !checklist) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('quality_checklist_items')
      .insert({
        company_id: ctx.companyId!,
        checklist_id: checklistId,
        description: input.description,
        result: input.result,
        notes: input.notes ?? null,
        photo_url: input.photo_url ?? null,
        sort_order: input.sort_order,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
