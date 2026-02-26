/**
 * Close Financial Period — Transition open -> closed/locked
 *
 * POST /api/v2/financial-periods/:id/close
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { closeFinancialPeriodSchema } from '@/lib/validation/schemas/financial-reporting'

// ============================================================================
// POST /api/v2/financial-periods/:id/close
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /financial-periods/:id/close
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing financial period ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = closeFinancialPeriodSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid close data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the period exists and is in an open state
    const { data: existing, error: existError } = await (supabase as any)
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
        { error: 'Forbidden', message: 'Period is already locked', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    if (existing.status === 'closed') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Period is already closed', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await (supabase as any)
      .from('financial_periods')
      .update({
        status: 'closed',
        closed_by: ctx.user!.id,
        closed_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'financial', auditAction: 'financial_period.close' }
)
