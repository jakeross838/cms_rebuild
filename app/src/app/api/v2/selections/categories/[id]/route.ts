/**
 * Selection Category by ID — Get, Update, Delete
 *
 * GET    /api/v2/selections/categories/:id — Get category details
 * PUT    /api/v2/selections/categories/:id — Update category
 * DELETE /api/v2/selections/categories/:id — Soft delete category
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateSelectionCategorySchema } from '@/lib/validation/schemas/selections'

// ============================================================================
// GET /api/v2/selections/categories/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing category ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('selection_categories') as any)
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection category not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch options count
    const { data: options } = await (supabase
      .from('selection_options') as any)
      .select('id')
      .eq('category_id', id)
      .is('deleted_at', null)

    // Fetch selections count
    const { data: selections } = await (supabase
      .from('selections') as any)
      .select('id')
      .eq('category_id', id)
      .is('deleted_at', null)

    return NextResponse.json({
      data: {
        ...data,
        options_count: (options ?? []).length,
        selections_count: (selections ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/selections/categories/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing category ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateSelectionCategorySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify category exists
    const { data: existing, error: existError } = await (supabase
      .from('selection_categories') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection category not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.room !== undefined) updates.room = input.room
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.pricing_model !== undefined) updates.pricing_model = input.pricing_model
    if (input.allowance_amount !== undefined) updates.allowance_amount = input.allowance_amount
    if (input.deadline !== undefined) updates.deadline = input.deadline
    if (input.lead_time_buffer_days !== undefined) updates.lead_time_buffer_days = input.lead_time_buffer_days
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.status !== undefined) updates.status = input.status
    if (input.designer_access !== undefined) updates.designer_access = input.designer_access
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await (supabase
      .from('selection_categories') as any)
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/selections/categories/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing category ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify category exists
    const { data: existing, error: existError } = await (supabase
      .from('selection_categories') as any)
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selection category not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('selection_categories') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

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
