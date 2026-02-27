/**
 * Material Request by ID — Get, Update, Delete
 *
 * GET    /api/v2/material-requests/:id — Get request with items
 * PUT    /api/v2/material-requests/:id — Update request
 * DELETE /api/v2/material-requests/:id — Soft delete request
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMaterialRequestSchema } from '@/lib/validation/schemas/inventory'

// ============================================================================
// GET /api/v2/material-requests/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('material_requests')
      .select('*, material_request_items(*)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('created_at', { referencedTable: 'material_request_items', ascending: true })
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Material request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { material_request_items, ...request } = data

    return NextResponse.json({
      data: { ...request, items: material_request_items ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// PUT /api/v2/material-requests/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateMaterialRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify request exists and is editable (draft or submitted only)
    const { data: existing, error: existError } = await supabase
      .from('material_requests')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Material request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (!['draft', 'submitted'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft or submitted requests can be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.job_id !== undefined) updates.job_id = input.job_id
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.needed_by !== undefined) updates.needed_by = input.needed_by
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.status !== undefined) updates.status = input.status

    const { data, error } = await supabase
      .from('material_requests')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Update items if provided (replace all)
    if (input.items !== undefined) {
      // Delete existing items
      const { error: deleteItemError } = await supabase
        .from('material_request_items')
        .delete()
        .eq('request_id', id)

      if (deleteItemError) {
        const mapped = mapDbError(deleteItemError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }

      // Insert new items
      const lineItems = input.items.map((item) => ({
        request_id: id,
        item_id: item.item_id ?? null,
        description: item.description ?? null,
        quantity_requested: item.quantity_requested,
        unit: item.unit ?? null,
        notes: item.notes ?? null,
      }))

      const { error: insertItemError } = await supabase
        .from('material_request_items')
        .insert(lineItems)

      if (insertItemError) {
        const mapped = mapDbError(insertItemError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
    }

    // Fetch updated items
    const { data: items } = await supabase
      .from('material_request_items')
      .select('*')
      .eq('request_id', id)

    return NextResponse.json({
      data: { ...data, items: items ?? [] },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'material_request.update' }
)

// ============================================================================
// DELETE /api/v2/material-requests/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing request ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify it's in draft status for deletion
    const { data: existing, error: existError } = await supabase
      .from('material_requests')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Material request not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only draft requests can be deleted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('material_requests')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'material_request.archive' }
)
