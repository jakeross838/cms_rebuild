/**
 * Financial Period by ID — Update
 *
 * PUT /api/v2/financial-periods/:id — Update a financial period
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateFinancialPeriodSchema } from '@/lib/validation/schemas/financial-reporting'

// ============================================================================
// GET /api/v2/financial-periods/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing financial period ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('financial_periods')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Financial period not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'financial' }
)

// ============================================================================
// PUT /api/v2/financial-periods/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing financial period ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateFinancialPeriodSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check the period is not locked
    const { data: existing, error: existError } = await supabase
      .from('financial_periods')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Financial period not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'locked') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cannot update a locked financial period', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.period_name !== undefined) updates.period_name = input.period_name
    if (input.period_start !== undefined) updates.period_start = input.period_start
    if (input.period_end !== undefined) updates.period_end = input.period_end
    if (input.fiscal_year !== undefined) updates.fiscal_year = input.fiscal_year
    if (input.fiscal_quarter !== undefined) updates.fiscal_quarter = input.fiscal_quarter

    const { data, error } = await supabase
      .from('financial_periods')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'financial_period.update' }
)
