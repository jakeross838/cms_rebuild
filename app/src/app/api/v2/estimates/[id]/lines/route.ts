/**
 * Estimate Line Items API — List & Create
 *
 * GET  /api/v2/estimates/:id/lines — List line items for an estimate
 * POST /api/v2/estimates/:id/lines — Add a line item to an estimate
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
import { listEstimateLineItemsSchema, createEstimateLineItemSchema } from '@/lib/validation/schemas/estimating'

/**
 * Extract estimate ID from a path like /api/v2/estimates/:id/lines
 */
function extractEstimateId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('estimates')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/estimates/:id/lines
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const estimateId = extractEstimateId(req.nextUrl.pathname)
    if (!estimateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listEstimateLineItemsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      section_id: url.searchParams.get('section_id') ?? undefined,
      item_type: url.searchParams.get('item_type') ?? undefined,
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

    // Verify the estimate belongs to this company
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('id')
      .eq('id', estimateId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (estError || !estimate) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('estimate_line_items')
      .select('*', { count: 'exact' })
      .eq('estimate_id', estimateId)

    if (filters.section_id) {
      query = query.eq('section_id', filters.section_id)
    }
    if (filters.item_type) {
      query = query.eq('item_type', filters.item_type)
    }

    query = query.order('sort_order', { ascending: true })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/estimates/:id/lines — Add line item
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const estimateId = extractEstimateId(req.nextUrl.pathname)
    if (!estimateId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createEstimateLineItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid line item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify estimate exists, belongs to company, and is editable
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('id, status')
      .eq('id', estimateId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (estError || !estimate) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Estimate not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (estimate.status !== 'draft' && estimate.status !== 'revised') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Line items can only be added to draft or revised estimates', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('estimate_line_items')
      .insert({
        estimate_id: estimateId,
        company_id: ctx.companyId!,
        section_id: input.section_id ?? null,
        cost_code_id: input.cost_code_id ?? null,
        assembly_id: input.assembly_id ?? null,
        description: input.description,
        item_type: input.item_type,
        quantity: input.quantity,
        unit: input.unit,
        unit_cost: input.unit_cost,
        markup_pct: input.markup_pct,
        total: input.total,
        alt_group: input.alt_group ?? null,
        notes: input.notes ?? null,
        sort_order: input.sort_order,
        ai_suggested: input.ai_suggested,
        ai_confidence: input.ai_confidence ?? null,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)
