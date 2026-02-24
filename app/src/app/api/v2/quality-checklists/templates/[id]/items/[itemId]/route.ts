/**
 * Quality Checklist Template Item by ID — Update & Delete
 *
 * PUT    /api/v2/quality-checklists/templates/:id/items/:itemId — Update a template item
 * DELETE /api/v2/quality-checklists/templates/:id/items/:itemId — Delete a template item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTemplateItemSchema } from '@/lib/validation/schemas/punch-list'

/**
 * Extract template ID and item ID from path like
 * /api/v2/quality-checklists/templates/:id/items/:itemId
 */
function extractIds(pathname: string): { templateId: string | null; itemId: string | null } {
  const segments = pathname.split('/')
  const templatesIdx = segments.indexOf('templates')
  const itemsIdx = segments.indexOf('items')
  return {
    templateId: templatesIdx !== -1 && templatesIdx + 1 < segments.length ? segments[templatesIdx + 1] : null,
    itemId: itemsIdx !== -1 && itemsIdx + 1 < segments.length ? segments[itemsIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/quality-checklists/templates/:id/items/:itemId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { templateId, itemId } = extractIds(req.nextUrl.pathname)
    if (!templateId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateTemplateItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify template belongs to company
    const { data: template, error: tError } = await (supabase
      .from('quality_checklist_templates') as any)
      .select('id')
      .eq('id', templateId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (tError || !template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.description !== undefined) updates.description = input.description
    if (input.category !== undefined) updates.category = input.category
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.is_required !== undefined) updates.is_required = input.is_required

    const { data, error } = await (supabase
      .from('quality_checklist_template_items') as any)
      .update(updates)
      .eq('id', itemId)
      .eq('template_id', templateId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/quality-checklists/templates/:id/items/:itemId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { templateId, itemId } = extractIds(req.nextUrl.pathname)
    if (!templateId || !itemId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID or item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify template belongs to company
    const { data: template, error: tError } = await (supabase
      .from('quality_checklist_templates') as any)
      .select('id')
      .eq('id', templateId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (tError || !template) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('quality_checklist_template_items') as any)
      .delete()
      .eq('id', itemId)
      .eq('template_id', templateId)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
