/**
 * Budget Line Detail API (flat route)
 *
 * GET    /api/v2/budget-lines/:id — Get budget line by ID
 * PATCH  /api/v2/budget-lines/:id — Update budget line
 * DELETE /api/v2/budget-lines/:id — Soft delete budget line
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { typedUpdate } from '@/lib/supabase/typed-queries'
import { updateBudgetLineSchema } from '@/lib/validation/schemas/budget-lines'

// ============================================================================
// GET /api/v2/budget-lines/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('budget_lines')
      .select('id, budget_id, company_id, job_id, cost_code_id, phase, description, estimated_amount, committed_amount, actual_amount, projected_amount, variance_amount, sort_order, notes, created_at, updated_at, cost_codes(code, name)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Not Found', message: 'Budget line not found', requestId: ctx.requestId },
          { status: 404 }
        )
      }
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PATCH /api/v2/budget-lines/:id
// ============================================================================

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget line ID', requestId: ctx.requestId },
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

    const supabase = await createClient()

    const { data, error } = await typedUpdate(supabase, 'budget_lines', { ...parseResult.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('id, budget_id, company_id, job_id, cost_code_id, phase, description, estimated_amount, committed_amount, actual_amount, projected_amount, variance_amount, sort_order, notes, created_at, updated_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Not Found', message: 'Budget line not found', requestId: ctx.requestId },
          { status: 404 }
        )
      }
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'budget_line.update' }
)

// ============================================================================
// DELETE /api/v2/budget-lines/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing budget line ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await supabase
      .from('budget_lines')
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
        { error: 'Not Found', message: 'Budget line not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await typedUpdate(supabase, 'budget_lines', { deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ success: true, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'budget_line.archive' }
)
