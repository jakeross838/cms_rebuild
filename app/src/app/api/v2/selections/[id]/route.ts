/**
 * Selection by ID — Get, Update, Delete
 *
 * GET    /api/v2/selections/:id — Get selection details
 * PUT    /api/v2/selections/:id — Update selection
 * DELETE /api/v2/selections/:id — Soft delete selection
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateSelectionSchema } from '@/lib/validation/schemas/selections'

// ============================================================================
// GET /api/v2/selections/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing selection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('selections')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch history for this selection's category
    const { data: history } = await supabase
      .from('selection_history')
      .select('*')
      .eq('category_id', data.category_id)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        history: history ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/selections/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing selection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateSelectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify selection exists
    const { data: existing, error: existError } = await supabase
      .from('selections')
      .select('id, status, category_id, option_id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {}
    if (input.option_id !== undefined) updates.option_id = input.option_id
    if (input.status !== undefined) updates.status = input.status
    if (input.room !== undefined) updates.room = input.room
    if (input.change_reason !== undefined) updates.change_reason = input.change_reason
    if (input.confirmed_by !== undefined) updates.confirmed_by = input.confirmed_by
    if (input.confirmed_at !== undefined) updates.confirmed_at = input.confirmed_at
    if (input.superseded_by !== undefined) updates.superseded_by = input.superseded_by

    const { data, error } = await supabase
      .from('selections')
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

    // Record history if status or option changed (non-blocking)
    if (input.status !== undefined || input.option_id !== undefined) {
      const action = input.option_id !== undefined ? 'changed' : 'selected'
      const { error: historyErr } = await supabase
        .from('selection_history')
        .insert({
          company_id: ctx.companyId!,
          category_id: existing.category_id,
          option_id: input.option_id ?? existing.option_id,
          action,
          actor_id: ctx.user!.id,
          actor_role: ctx.user!.role,
          notes: input.change_reason ?? null,
        })
      if (historyErr) console.error('Failed to record selection history:', historyErr.message)
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'selection.update' }
)

// ============================================================================
// DELETE /api/v2/selections/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing selection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify selection exists
    const { data: existing, error: existError } = await supabase
      .from('selections')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('selections')
      .update({ deleted_at: new Date().toISOString() })
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'selection.archive' }
)
