/**
 * AP Bills — List & Create
 *
 * GET  /api/v2/ap/bills — List AP bills
 * POST /api/v2/ap/bills — Create AP bill
 */

import { NextResponse } from 'next/server'
import { safeOrIlike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listBillsSchema, createBillSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/ap/bills
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listBillsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      start_date: url.searchParams.get('start_date') ?? undefined,
      end_date: url.searchParams.get('end_date') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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

    let query = supabase
      .from('ap_bills')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.start_date) {
      query = query.gte('bill_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('bill_date', filters.end_date)
    }
    if (filters.q) {
      query = query.or(`bill_number.ilike.${safeOrIlike(filters.q)},description.ilike.${safeOrIlike(filters.q)}`)
    }

    query = query.order('bill_date', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'financial', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/ap/bills
// ============================================================================


export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createBillSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid bill data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Validate line totals match header amount
    if (input.lines && input.lines.length > 0) {
      const lineTotal = input.lines.reduce((sum, line) => sum + line.amount, 0)
      if (Math.abs(lineTotal - input.amount) > 0.01) {
        return NextResponse.json(
          { error: 'Validation Error', message: `Line items total (${lineTotal.toFixed(2)}) must equal bill amount (${input.amount.toFixed(2)})`, requestId: ctx.requestId },
          { status: 400 }
        )
      }
    }

    const supabase = await createClient()

    // Create the bill
    const { data: bill, error: billError } = await supabase
      .from('ap_bills')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        bill_number: input.bill_number,
        bill_date: input.bill_date,
        due_date: input.due_date,
        amount: input.amount,
        balance_due: input.amount, // Initially, full amount is due
        status: 'draft',
        job_id: input.job_id ?? null,
        description: input.description ?? null,
        received_date: input.received_date ?? null,
        terms: input.terms ?? null,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (billError) {
      const mapped = mapDbError(billError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Create bill lines if provided
    if (input.lines && input.lines.length > 0) {
      const lineRecords = input.lines.map((line) => ({
        bill_id: bill.id,
        gl_account_id: line.gl_account_id,
        amount: line.amount,
        description: line.description ?? null,
        job_id: line.job_id ?? null,
        cost_code_id: line.cost_code_id ?? null,
      }))

      const { data: lines, error: linesError } = await supabase
        .from('ap_bill_lines')
        .insert(lineRecords)
        .select('*')

      if (linesError) {
        const mapped2 = mapDbError(linesError)
        return NextResponse.json(
          { error: mapped2.error, message: mapped2.message, requestId: ctx.requestId },
          { status: mapped2.status }
        )
      }

      return NextResponse.json({ data: { ...bill, lines: lines ?? [] }, requestId: ctx.requestId }, { status: 201 })
    }

    return NextResponse.json({ data: bill, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, requiredRoles: ['owner', 'admin', 'pm', 'office'], rateLimit: 'financial', auditAction: 'bill.create' }
)
