/**
 * Budget by ID — Get, Update, Delete
 *
 * GET    /api/v2/budgets/:id — Get budget details
 * PUT    /api/v2/budgets/:id — Update budget
 * DELETE /api/v2/budgets/:id — Soft delete (archive) budget
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBudgetSchema } from '@/lib/validation/schemas/budget'

// ============================================================================
// GET /api/v2/budgets/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch summary counts for budget lines
    const { data: lines } = await supabase
      .from('budget_lines')
      .select('id, estimated_amount, committed_amount, actual_amount, projected_amount, variance_amount')
      .eq('budget_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: {
        ...data,
        lines_count: (lines ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/budgets/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBudgetSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify budget exists and is not locked/archived
    const { data: existing, error: existError } = await supabase
      .from('budgets')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Budget not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'locked' || existing.status === 'archived') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Locked or archived budgets cannot be updated', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.status !== undefined) updates.status = input.status
    if (input.total_amount !== undefined) updates.total_amount = input.total_amount
    if (input.approved_by !== undefined) updates.approved_by = input.approved_by
    if (input.approved_at !== undefined) updates.approved_at = input.approved_at
    if (input.version !== undefined) updates.version = input.version
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .eq('status', existing.status)
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
  { requireAuth: true, rateLimit: 'api', auditAction: 'budget.update' }
)

// ============================================================================
// DELETE /api/v2/budgets/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('budgets')
      .update({ deleted_at: new Date().toISOString(), status: 'archived' })
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
  { requireAuth: true, rateLimit: 'api', auditAction: 'budget.archive' }
)
