/**
 * Estimate Line Item by ID — Update & Delete
 *
 * PUT    /api/v2/estimates/:id/lines/:lineId — Update a line item
 * DELETE /api/v2/estimates/:id/lines/:lineId — Delete a line item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateEstimateLineItemSchema } from '@/lib/validation/schemas/estimating'

/**
 * Extract estimate ID and line ID from path like
 * /api/v2/estimates/:id/lines/:lineId
 */
function extractIds(pathname: string): { estimateId: string | null; lineId: string | null } {
  const segments = pathname.split('/')
  const estIdx = segments.indexOf('estimates')
  const linesIdx = segments.indexOf('lines')
  return {
    estimateId: estIdx !== -1 && estIdx + 1 < segments.length ? segments[estIdx + 1] : null,
    lineId: linesIdx !== -1 && linesIdx + 1 < segments.length ? segments[linesIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/estimates/:id/lines/:lineId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { estimateId, lineId } = extractIds(req.nextUrl.pathname)
    if (!estimateId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID or line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateEstimateLineItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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
        { error: 'Forbidden', message: 'Line items can only be updated on draft or revised estimates', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.section_id !== undefined) updates.section_id = input.section_id
    if (input.cost_code_id !== undefined) updates.cost_code_id = input.cost_code_id
    if (input.assembly_id !== undefined) updates.assembly_id = input.assembly_id
    if (input.description !== undefined) updates.description = input.description
    if (input.item_type !== undefined) updates.item_type = input.item_type
    if (input.quantity !== undefined) updates.quantity = input.quantity
    if (input.unit !== undefined) updates.unit = input.unit
    if (input.unit_cost !== undefined) updates.unit_cost = input.unit_cost
    if (input.markup_pct !== undefined) updates.markup_pct = input.markup_pct
    if (input.total !== undefined) updates.total = input.total
    if (input.alt_group !== undefined) updates.alt_group = input.alt_group
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.ai_suggested !== undefined) updates.ai_suggested = input.ai_suggested
    if (input.ai_confidence !== undefined) updates.ai_confidence = input.ai_confidence

    const { data, error } = await supabase
      .from('estimate_line_items')
      .update(updates)
      .eq('id', lineId)
      .eq('estimate_id', estimateId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Line item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/estimates/:id/lines/:lineId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { estimateId, lineId } = extractIds(req.nextUrl.pathname)
    if (!estimateId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing estimate ID or line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

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
        { error: 'Forbidden', message: 'Line items can only be deleted from draft or revised estimates', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('estimate_line_items')
      .delete()
      .eq('id', lineId)
      .eq('estimate_id', estimateId)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Line item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
