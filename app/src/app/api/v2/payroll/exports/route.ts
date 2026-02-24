/**
 * Payroll Exports API — List & Create
 *
 * GET  /api/v2/payroll/exports — List payroll exports
 * POST /api/v2/payroll/exports — Create a payroll export
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPayrollExportsSchema, createPayrollExportSchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// GET /api/v2/payroll/exports
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listPayrollExportsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      payroll_period_id: url.searchParams.get('payroll_period_id') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = (supabase as any)
      .from('payroll_exports')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.payroll_period_id) {
      query = query.eq('payroll_period_id', filters.payroll_period_id)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/payroll/exports — Create payroll export
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createPayrollExportSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid export data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify payroll period exists and belongs to this company
    const { data: period, error: periodError } = await (supabase as any)
      .from('payroll_periods')
      .select('id, period_start, period_end, status')
      .eq('id', input.payroll_period_id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (periodError || !period) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Payroll period not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Gather approved time entries for this period
    const { data: entries, error: entriesError } = await (supabase as any)
      .from('time_entries')
      .select('regular_hours, overtime_hours, double_time_hours, user_id')
      .eq('company_id', ctx.companyId!)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .gte('entry_date', period.period_start)
      .lte('entry_date', period.period_end)

    if (entriesError) {
      return NextResponse.json(
        { error: 'Database Error', message: entriesError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    const entryList = entries ?? []
    const totalHours = entryList.reduce(
      (sum: number, e: { regular_hours: number; overtime_hours: number; double_time_hours: number }) =>
        sum + (e.regular_hours || 0) + (e.overtime_hours || 0) + (e.double_time_hours || 0),
      0
    )
    const uniqueEmployees = new Set(entryList.map((e: { user_id: string }) => e.user_id))

    const { data, error } = await (supabase as any)
      .from('payroll_exports')
      .insert({
        company_id: ctx.companyId!,
        payroll_period_id: input.payroll_period_id,
        export_format: input.export_format,
        total_hours: parseFloat(totalHours.toFixed(2)),
        total_amount: 0, // V1: amount calculation deferred until labor rates integration
        employee_count: uniqueEmployees.size,
        exported_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Mark the entries as exported
    await (supabase as any)
      .from('time_entries')
      .update({ status: 'exported', updated_at: new Date().toISOString() })
      .eq('company_id', ctx.companyId!)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .gte('entry_date', period.period_start)
      .lte('entry_date', period.period_end)

    // Mark the payroll period as exported
    await (supabase as any)
      .from('payroll_periods')
      .update({
        status: 'exported',
        exported_at: new Date().toISOString(),
        exported_by: ctx.user!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.payroll_period_id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
