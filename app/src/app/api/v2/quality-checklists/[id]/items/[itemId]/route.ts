/**
 * Quality Checklist Item by ID — Update & Delete
 *
 * PUT    /api/v2/quality-checklists/:id/items/:itemId — Update a checklist item
 * DELETE /api/v2/quality-checklists/:id/items/:itemId — Delete a checklist item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateChecklistItemSchema } from '@/lib/validation/schemas/punch-list'

/**
 * Extract checklist ID and item ID from path like
 * /api/v2/quality-checklists/:id/items/:itemId
 */
function extractIds(pathname: string): { checklistId: string | null; itemId: string | null } {
  const segments = pathname.split('/')
  const clIdx = segments.indexOf('quality-checklists')
  const itemsIdx = segments.indexOf('items')
  return {
    checklistId: clIdx !== -1 && clIdx + 1 < segments.length ? segments[clIdx + 1] : null,
    itemId: itemsIdx !== -1 && itemsIdx + 1 < segments.length ? segments[itemsIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/quality-checklists/:id/items/:itemId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { checklistId, itemId } = extractIds(req.nextUrl.pathname)
    if (!checklistId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateChecklistItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
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

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.description !== undefined) updates.description = input.description
    if (input.result !== undefined) updates.result = input.result
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.photo_url !== undefined) updates.photo_url = input.photo_url
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order

    const { data, error } = await supabase
      .from('quality_checklist_items')
      .update(updates)
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// DELETE /api/v2/quality-checklists/:id/items/:itemId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { checklistId, itemId } = extractIds(req.nextUrl.pathname)
    if (!checklistId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

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

    const { error } = await supabase
      .from('quality_checklist_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
