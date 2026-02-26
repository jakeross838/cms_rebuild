/**
 * Payroll Period by ID — Get & Update
 *
 * GET /api/v2/payroll/periods/:id — Get payroll period details
 * PUT /api/v2/payroll/periods/:id — Update payroll period
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePayrollPeriodSchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// GET /api/v2/payroll/periods/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing payroll period ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Payroll period not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch associated exports
    const { data: exports } = await supabase
      .from('payroll_exports')
      .select('*')
      .eq('payroll_period_id', id)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        exports: exports ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/payroll/periods/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing payroll period ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updatePayrollPeriodSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify period exists
    const { data: existing, error: fetchError } = await supabase
      .from('payroll_periods')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Payroll period not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Cannot modify exported periods
    if (existing.status === 'exported' && input.status !== 'exported') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cannot modify an exported payroll period', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.status !== undefined) updates.status = input.status
    if (input.period_start !== undefined) updates.period_start = input.period_start
    if (input.period_end !== undefined) updates.period_end = input.period_end

    // Set exported metadata when closing/exporting
    if (input.status === 'exported') {
      updates.exported_at = new Date().toISOString()
      updates.exported_by = ctx.user!.id
    }

    const { data, error } = await supabase
      .from('payroll_periods')
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
  { requireAuth: true, rateLimit: 'api' }
)
