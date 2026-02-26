/**
 * Safety Inspection Item by ID — Update & Delete
 *
 * PUT    /api/v2/safety/inspections/:id/items/:itemId — Update an inspection item
 * DELETE /api/v2/safety/inspections/:id/items/:itemId — Delete an inspection item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateInspectionItemSchema } from '@/lib/validation/schemas/safety'

/**
 * Extract inspection ID and item ID from path like
 * /api/v2/safety/inspections/:id/items/:itemId
 */
function extractIds(pathname: string): { inspectionId: string | null; itemId: string | null } {
  const segments = pathname.split('/')
  const inspIdx = segments.indexOf('inspections')
  const itemsIdx = segments.indexOf('items')
  return {
    inspectionId: inspIdx !== -1 && inspIdx + 1 < segments.length ? segments[inspIdx + 1] : null,
    itemId: itemsIdx !== -1 && itemsIdx + 1 < segments.length ? segments[itemsIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/safety/inspections/:id/items/:itemId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { inspectionId, itemId } = extractIds(req.nextUrl.pathname)
    if (!inspectionId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateInspectionItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify inspection belongs to company
    const { data: inspection, error: inspError } = await supabase
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

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.description !== undefined) updates.description = input.description
    if (input.category !== undefined) updates.category = input.category
    if (input.result !== undefined) updates.result = input.result
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.photo_url !== undefined) updates.photo_url = input.photo_url
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order

    const { data, error } = await supabase
      .from('safety_inspection_items')
      .update(updates)
      .eq('id', itemId)
      .eq('inspection_id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/safety/inspections/:id/items/:itemId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { inspectionId, itemId } = extractIds(req.nextUrl.pathname)
    if (!inspectionId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify inspection belongs to company
    const { data: inspection, error: inspError } = await supabase
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

    const { error } = await supabase
      .from('safety_inspection_items')
      .delete()
      .eq('id', itemId)
      .eq('inspection_id', inspectionId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
