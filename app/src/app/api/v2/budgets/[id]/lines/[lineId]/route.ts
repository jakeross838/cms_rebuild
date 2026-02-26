/**
 * Budget Line by ID — Update & Delete
 *
 * PUT    /api/v2/budgets/:id/lines/:lineId — Update a budget line
 * DELETE /api/v2/budgets/:id/lines/:lineId — Delete a budget line
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBudgetLineSchema } from '@/lib/validation/schemas/budget'

/**
 * Extract budget ID and line ID from a path like /api/v2/budgets/:id/lines/:lineId
 */
function extractIds(pathname: string): { budgetId: string | null; lineId: string | null } {
  const segments = pathname.split('/')
  const budgetsIdx = segments.indexOf('budgets')
  const linesIdx = segments.indexOf('lines')
  return {
    budgetId: budgetsIdx !== -1 && budgetsIdx + 1 < segments.length ? segments[budgetsIdx + 1] : null,
    lineId: linesIdx !== -1 && linesIdx + 1 < segments.length ? segments[linesIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/budgets/:id/lines/:lineId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { budgetId, lineId } = extractIds(req.nextUrl.pathname)
    if (!budgetId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID or line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateBudgetLineSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include fields that were provided)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.cost_code_id !== undefined) updates.cost_code_id = input.cost_code_id
    if (input.phase !== undefined) updates.phase = input.phase
    if (input.description !== undefined) updates.description = input.description
    if (input.estimated_amount !== undefined) updates.estimated_amount = input.estimated_amount
    if (input.committed_amount !== undefined) updates.committed_amount = input.committed_amount
    if (input.actual_amount !== undefined) updates.actual_amount = input.actual_amount
    if (input.projected_amount !== undefined) updates.projected_amount = input.projected_amount
    if (input.variance_amount !== undefined) updates.variance_amount = input.variance_amount
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('budget_lines')
      .update(updates)
      .eq('id', lineId)
      .eq('budget_id', budgetId)
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

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial', auditAction: 'budget_line.update' }
)

// ============================================================================
// DELETE /api/v2/budgets/:id/lines/:lineId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { budgetId, lineId } = extractIds(req.nextUrl.pathname)
    if (!budgetId || !lineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget ID or line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('budget_lines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', lineId)
      .eq('budget_id', budgetId)
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'budget_line.archive' }
)
