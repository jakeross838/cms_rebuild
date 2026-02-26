/**
 * Vendor Insurance — List & Create
 *
 * GET  /api/v2/vendors/:id/insurance — List insurance records for a vendor
 * POST /api/v2/vendors/:id/insurance — Create a new insurance record
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listVendorInsuranceSchema,
  createVendorInsuranceSchema,
} from '@/lib/validation/schemas/vendor-management'

/**
 * Extract vendor ID from pathname like /api/v2/vendors/:id/insurance
 */
function getVendorId(pathname: string): string | null {
  const segments = pathname.split('/')
  const vendorsIdx = segments.indexOf('vendors')
  if (vendorsIdx === -1 || vendorsIdx + 1 >= segments.length) return null
  return segments[vendorsIdx + 1]
}

// ============================================================================
// GET /api/v2/vendors/:id/insurance
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const vendorId = getVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listVendorInsuranceSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      insurance_type: url.searchParams.get('insurance_type') ?? undefined,
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
      .from('vendor_insurance')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.insurance_type) {
      query = query.eq('insurance_type', filters.insurance_type)
    }

    query = query
      .order('expiration_date', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/vendors/:id/insurance
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const vendorId = getVendorId(req.nextUrl.pathname)
    if (!vendorId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createVendorInsuranceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid insurance data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('vendor_insurance')
      .insert({
        vendor_id: vendorId,
        company_id: ctx.companyId!,
        insurance_type: input.insurance_type,
        carrier_name: input.carrier_name,
        policy_number: input.policy_number,
        coverage_amount: input.coverage_amount ?? null,
        expiration_date: input.expiration_date,
        certificate_document_id: input.certificate_document_id ?? null,
        status: input.status,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
