/**
 * AR Invoices API — List & Create
 *
 * GET  /api/v1/ar-invoices — List AR invoices for company (paginated, filterable)
 * POST /api/v1/ar-invoices — Create a new AR invoice (with optional line items)
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  mapDbError,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { safeOrIlike } from '@/lib/utils'
import {
  listArInvoicesSchema,
  createArInvoiceSchema,
} from '@/lib/validation/schemas/accounting'
import type { ArInvoice, ArInvoiceLine } from '@/types/accounting'

// ============================================================================
// GET /api/v1/ar-invoices — List AR invoices for company
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

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
        {
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: parseResult.error.flatten().fieldErrors,
          requestId: ctx.requestId,
        },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)

    const supabase = await createClient()

    let query = supabase
      .from('ar_invoices')
      .select('*, clients!left(id, name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null) as unknown as {
        eq: (col: string, val: unknown) => typeof query
        is: (col: string, val: unknown) => typeof query
        gte: (col: string, val: string) => typeof query
        lte: (col: string, val: string) => typeof query
        or: (filter: string) => typeof query
        order: (col: string, opts: { ascending: boolean }) => typeof query
        range: (from: number, to: number) => Promise<{ data: ArInvoice[] | null; count: number | null; error: { message: string } | null }>
      }

    // Filters
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id) as typeof query
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id) as typeof query
    }
    if (filters.status) {
      query = query.eq('status', filters.status) as typeof query
    }
    if (filters.start_date) {
      query = query.gte('invoice_date', filters.start_date) as typeof query
    }
    if (filters.end_date) {
      query = query.lte('invoice_date', filters.end_date) as typeof query
    }
    if (filters.q) {
      query = query.or(`invoice_number.ilike.${safeOrIlike(filters.q)},notes.ilike.${safeOrIlike(filters.q)}`) as typeof query
    }

    query = query.order('invoice_date', { ascending: false }) as typeof query

    const { data: invoices, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      logger.error('Failed to list AR invoices', { error: error.message })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(invoices ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/ar-invoices — Create a new AR invoice (with optional lines)
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })
    const body = ctx.validatedBody as Record<string, unknown>

    // Extract lines array — inserted separately after the invoice header
    const { lines, ...invoiceData } = body as { lines?: Record<string, unknown>[]; [key: string]: unknown }

    const supabase = await createClient()

    // Step 1 — Insert the invoice header
    const { data: invoice, error: invoiceError } = await (supabase
      .from('ar_invoices')
      .insert({
        ...invoiceData,
        company_id: ctx.companyId!,
        created_by: ctx.user!.id,
        status: 'draft',
        balance_due: invoiceData.amount,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: ArInvoice | null; error: { message: string } | null }>)

    if (invoiceError || !invoice) {
      logger.error('Failed to create AR invoice', { error: invoiceError?.message })
      const mapped = mapDbError(invoiceError ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Step 2 — Insert invoice lines if provided
    let insertedLines: ArInvoiceLine[] | null = null
    if (lines && lines.length > 0) {
      const lineInserts = lines.map((line) => ({
        ...line,
        invoice_id: invoice.id,
      }))

      const { data: newLines, error: linesError } = await (supabase
        .from('ar_invoice_lines')
        .insert(lineInserts as never)
        .select() as unknown as Promise<{ data: ArInvoiceLine[] | null; error: { message: string } | null }>)

      if (linesError) {
        logger.error('Failed to create AR invoice lines', { error: linesError.message, invoiceId: invoice.id })
        const mapped = mapDbError(linesError)
        return NextResponse.json(
          { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
          { status: mapped.status }
        )
      }
      insertedLines = newLines
    }

    logger.info('AR invoice created', { invoiceId: invoice.id, clientId: invoice.client_id, companyId: ctx.companyId! })

    return NextResponse.json(
      { data: insertedLines ? { ...invoice, lines: insertedLines } : invoice, requestId: ctx.requestId },
      { status: 201 }
    )
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm', 'office'],
    schema: createArInvoiceSchema,
    permission: 'jobs:update:all',
    auditAction: 'ar_invoice.create',
  }
)
