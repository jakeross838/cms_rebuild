/**
 * Vendor Compliance — List & Create
 *
 * GET  /api/v2/vendors/:id/compliance — List compliance records for a vendor
 * POST /api/v2/vendors/:id/compliance — Create a new compliance record
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listVendorComplianceSchema,
  createVendorComplianceSchema,
} from '@/lib/validation/schemas/vendor-management'

/**
 * Extract vendor ID from pathname like /api/v2/vendors/:id/compliance
 */
function getVendorId(pathname: string): string | null {
  const segments = pathname.split('/')
  const vendorsIdx = segments.indexOf('vendors')
  if (vendorsIdx === -1 || vendorsIdx + 1 >= segments.length) return null
  return segments[vendorsIdx + 1]
}

// ============================================================================
// GET /api/v2/vendors/:id/compliance
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
    const parseResult = listVendorComplianceSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      requirement_type: url.searchParams.get('requirement_type') ?? undefined,
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
      .from('vendor_compliance')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.requirement_type) {
      query = query.eq('requirement_type', filters.requirement_type)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/vendors/:id/compliance
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
    const parseResult = createVendorComplianceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid compliance data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('vendor_compliance')
      .insert({
        vendor_id: vendorId,
        company_id: ctx.companyId!,
        requirement_type: input.requirement_type,
        requirement_name: input.requirement_name,
        status: input.status,
        expiration_date: input.expiration_date ?? null,
        document_id: input.document_id ?? null,
        notes: input.notes ?? null,
      })
      .select('*')
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
  { requireAuth: true, rateLimit: 'api' }
)
