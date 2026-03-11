/**
 * Quality Checklist Template by ID — Get, Update, Delete
 *
 * GET    /api/v2/quality-checklists/templates/:id — Get template details
 * PUT    /api/v2/quality-checklists/templates/:id — Update template
 * DELETE /api/v2/quality-checklists/templates/:id — Delete template (set inactive)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTemplateSchema } from '@/lib/validation/schemas/punch-list'

// ============================================================================
// GET /api/v2/quality-checklists/templates/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('quality_checklist_templates')
      .select('id, company_id, name, description, category, trade, is_active, is_system, created_at, updated_at')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch template items
    const { data: items } = await supabase
      .from('quality_checklist_template_items')
      .select('id, company_id, template_id, description, category, sort_order, is_required, created_at, updated_at')
      .eq('template_id', id)
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      data: {
        ...data,
        items: items ?? [],
        items_count: (items ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/quality-checklists/templates/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateTemplateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.category !== undefined) updates.category = input.category
    if (input.trade !== undefined) updates.trade = input.trade
    if (input.is_active !== undefined) updates.is_active = input.is_active
    if (input.is_system !== undefined) updates.is_system = input.is_system

    const { data, error } = await supabase
      .from('quality_checklist_templates')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, company_id, name, description, category, trade, is_active, is_system, created_at, updated_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'quality_checklists_template.update' }
)

// ============================================================================
// DELETE /api/v2/quality-checklists/templates/:id — Soft delete via is_active
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing template ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify template exists before deactivating
    const { data: existing, error: existError } = await supabase
      .from('quality_checklist_templates')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError && existError.code !== 'PGRST116') {
      const mapped = mapDbError(existError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Template not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('quality_checklist_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'quality_checklists_template.archive' }
)
