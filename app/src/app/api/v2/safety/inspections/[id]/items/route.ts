/**
 * Safety Inspection Items API — List & Create
 *
 * GET  /api/v2/safety/inspections/:id/items — List items for an inspection
 * POST /api/v2/safety/inspections/:id/items — Add an item to an inspection
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listInspectionItemsSchema, createInspectionItemSchema } from '@/lib/validation/schemas/safety'

/**
 * Extract inspection ID from path like /api/v2/safety/inspections/:id/items
 */
function extractInspectionId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('inspections')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/safety/inspections/:id/items
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const inspectionId = extractInspectionId(req.nextUrl.pathname)
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listInspectionItemsSchema.safeParse({
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

    // Verify the inspection belongs to this company
    const { data: inspection, error: inspError } = await (supabase as any)
      .from('safety_inspections')
      .select('id')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (inspError || !inspection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await (supabase as any)
      .from('safety_inspection_items')
      .select('*', { count: 'exact' })
      .eq('inspection_id', inspectionId)
      .eq('company_id', ctx.companyId!)
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
// POST /api/v2/safety/inspections/:id/items — Add item
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const inspectionId = extractInspectionId(req.nextUrl.pathname)
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createInspectionItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify inspection exists and belongs to company
    const { data: inspection, error: inspError } = await (supabase as any)
      .from('safety_inspections')
      .select('id')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (inspError || !inspection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('safety_inspection_items')
      .insert({
        inspection_id: inspectionId,
        company_id: ctx.companyId!,
        description: input.description,
        category: input.category ?? null,
        result: input.result,
        notes: input.notes ?? null,
        photo_url: input.photo_url ?? null,
        sort_order: input.sort_order,
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
