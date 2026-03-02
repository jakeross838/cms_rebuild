/**
 * Quality Checklist by ID — Get, Update, Delete
 *
 * GET    /api/v2/quality-checklists/:id — Get checklist details
 * PUT    /api/v2/quality-checklists/:id — Update checklist
 * DELETE /api/v2/quality-checklists/:id — Soft delete checklist
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateChecklistSchema } from '@/lib/validation/schemas/punch-list'

// ============================================================================
// GET /api/v2/quality-checklists/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('quality_checklists')
      .select('id, company_id, job_id, template_id, name, description, status, inspector_id, inspection_date, location, total_items, passed_items, failed_items, na_items, completed_at, approved_by, approved_at, created_by, created_at, updated_at, quality_checklist_items(id, company_id, checklist_id, description, result, notes, photo_url, sort_order, created_at, updated_at)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('sort_order', { referencedTable: 'quality_checklist_items', ascending: true })
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { quality_checklist_items, ...checklist } = data

    return NextResponse.json({
      data: {
        ...checklist,
        items: quality_checklist_items ?? [],
        items_count: (quality_checklist_items ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/quality-checklists/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateChecklistSchema.safeParse(body)

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
    if (input.template_id !== undefined) updates.template_id = input.template_id
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.inspector_id !== undefined) updates.inspector_id = input.inspector_id
    if (input.inspection_date !== undefined) updates.inspection_date = input.inspection_date
    if (input.location !== undefined) updates.location = input.location
    if (input.total_items !== undefined) updates.total_items = input.total_items
    if (input.passed_items !== undefined) updates.passed_items = input.passed_items
    if (input.failed_items !== undefined) updates.failed_items = input.failed_items
    if (input.na_items !== undefined) updates.na_items = input.na_items

    const { data, error } = await supabase
      .from('quality_checklists')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('id, company_id, job_id, template_id, name, description, status, inspector_id, inspection_date, location, total_items, passed_items, failed_items, na_items, completed_at, approved_by, approved_at, created_by, created_at, updated_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'quality_checklist.update' }
)

// ============================================================================
// DELETE /api/v2/quality-checklists/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify checklist exists before archiving
    const { data: existing, error: existError } = await supabase
      .from('quality_checklists')
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
        { error: 'Not Found', message: 'Checklist not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('quality_checklists')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'quality_checklist.archive' }
)
