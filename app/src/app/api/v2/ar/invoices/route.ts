/**
 * AR Invoices — List & Create
 *
 * GET  /api/v2/ar/invoices — List AR invoices
 * POST /api/v2/ar/invoices — Create AR invoice
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listArInvoicesSchema, createArInvoiceSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/ar/invoices
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listArInvoicesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      client_id: url.searchParams.get('client_id') ?? undefined,
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

    let query = (supabase as any)
      .from('ar_invoices')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.start_date) {
      query = query.gte('invoice_date', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('invoice_date', filters.end_date)
    }
    if (filters.q) {
      query = query.or(`invoice_number.ilike.%${escapeLike(filters.q)}%,notes.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('invoice_date', { ascending: false })

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
// POST /api/v2/ar/invoices
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createArInvoiceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid invoice data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Create the invoice
    const { data: invoice, error: invoiceError } = await (supabase as any)
      .from('ar_invoices')
      .insert({
        company_id: ctx.companyId!,
        client_id: input.client_id,
        job_id: input.job_id ?? null,
        invoice_number: input.invoice_number,
        invoice_date: input.invoice_date,
        due_date: input.due_date,
        amount: input.amount,
        balance_due: input.amount, // Initially, full amount is due
        status: 'draft',
        terms: input.terms ?? null,
        notes: input.notes ?? null,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (invoiceError) {
      return NextResponse.json(
        { error: 'Database Error', message: invoiceError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Create invoice lines if provided
    if (input.lines && input.lines.length > 0) {
      const lineRecords = input.lines.map((line) => ({
        invoice_id: invoice.id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        amount: line.amount,
        gl_account_id: line.gl_account_id ?? null,
        job_id: line.job_id ?? null,
        cost_code_id: line.cost_code_id ?? null,
      }))

      const { data: lines, error: linesError } = await (supabase as any)
        .from('ar_invoice_lines')
        .insert(lineRecords)
        .select('*')

      if (linesError) {
        return NextResponse.json(
          { error: 'Database Error', message: linesError.message, requestId: ctx.requestId },
          { status: 500 }
        )
      }

      return NextResponse.json({ data: { ...invoice, lines: lines ?? [] }, requestId: ctx.requestId }, { status: 201 })
    }

    return NextResponse.json({ data: invoice, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
