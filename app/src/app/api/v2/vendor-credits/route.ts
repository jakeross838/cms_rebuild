/**
 * Vendor Credits API — List & Create
 *
 * GET  /api/v2/vendor-credits — List vendor credits (filtered by company)
 * POST /api/v2/vendor-credits — Create a new vendor credit
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
// typedInsert removed — new tables not yet in generated Supabase types
import { listVendorCreditsSchema, createVendorCreditSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/vendor-credits
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listVendorCreditsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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

    let query = (supabase as any).from('vendor_credits')
      .select('id, company_id, vendor_id, credit_number, original_invoice_id, original_po_id, amount, applied_amount, balance, reason, status, created_at, updated_at, vendors(name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.or(`credit_number.ilike.%${filters.q}%,reason.ilike.%${filters.q}%`)
    }

    query = query.order('created_at', { ascending: false })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'] }
)

// ============================================================================
// POST /api/v2/vendor-credits — Create vendor credit
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createVendorCreditSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid vendor credit data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any).from('vendor_credits')
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        credit_number: input.credit_number ?? null,
        original_invoice_id: input.original_invoice_id ?? null,
        original_po_id: input.original_po_id ?? null,
        amount: input.amount,
        reason: input.reason,
        status: 'active',
      } as any)
      .select('id, company_id, vendor_id, credit_number, original_invoice_id, original_po_id, amount, applied_amount, balance, reason, status, created_at, updated_at')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'vendor_credit.create' }
)
