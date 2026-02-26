/**
 * Training Path Item by ID — Update, Delete
 *
 * PUT    /api/v2/training/paths/:id/items/:itemId — Update item
 * DELETE /api/v2/training/paths/:id/items/:itemId — Delete item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePathItemSchema } from '@/lib/validation/schemas/training'

/**
 * Extract path ID and item ID
 */
function extractIds(pathname: string): { pathId: string | null; itemId: string | null } {
  const segments = pathname.split('/')
  const pIdx = segments.indexOf('paths')
  const iIdx = segments.indexOf('items')
  return {
    pathId: pIdx !== -1 && pIdx + 1 < segments.length ? segments[pIdx + 1] : null,
    itemId: iIdx !== -1 && iIdx + 1 < segments.length ? segments[iIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/training/paths/:id/items/:itemId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { pathId, itemId } = extractIds(req.nextUrl.pathname)
    if (!pathId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePathItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.item_type !== undefined) updates.item_type = input.item_type
    if (input.item_id !== undefined) updates.item_id = input.item_id
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.is_required !== undefined) updates.is_required = input.is_required

    const { data, error } = await supabase
      .from('training_path_items')
      .update(updates)
      .eq('id', itemId)
      .eq('path_id', pathId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Path item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'training_paths_item.update' }
)

// ============================================================================
// DELETE /api/v2/training/paths/:id/items/:itemId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { pathId, itemId } = extractIds(req.nextUrl.pathname)
    if (!pathId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing path or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await supabase
      .from('training_path_items')
      .select('id')
      .eq('id', itemId)
      .eq('path_id', pathId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Path item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('training_path_items')
      .delete()
      .eq('id', itemId)
      .eq('path_id', pathId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'training_paths_item.archive' }
)
