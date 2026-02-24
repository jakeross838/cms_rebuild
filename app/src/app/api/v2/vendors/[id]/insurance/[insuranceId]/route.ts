/**
 * Vendor Insurance by ID — Update & Delete
 *
 * PUT    /api/v2/vendors/:id/insurance/:insuranceId — Update an insurance record
 * DELETE /api/v2/vendors/:id/insurance/:insuranceId — Delete an insurance record
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateVendorInsuranceSchema } from '@/lib/validation/schemas/vendor-management'

/**
 * Extract vendor ID and insurance ID from pathname
 * /api/v2/vendors/:id/insurance/:insuranceId
 */
function getIds(pathname: string): { vendorId: string | null; insuranceId: string | null } {
  const segments = pathname.split('/')
  const vendorsIdx = segments.indexOf('vendors')
  const insuranceIdx = segments.indexOf('insurance')
  return {
    vendorId: vendorsIdx !== -1 && vendorsIdx + 1 < segments.length ? segments[vendorsIdx + 1] : null,
    insuranceId: insuranceIdx !== -1 && insuranceIdx + 1 < segments.length ? segments[insuranceIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/vendors/:id/insurance/:insuranceId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { vendorId, insuranceId } = getIds(req.nextUrl.pathname)
    if (!vendorId || !insuranceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID or insurance ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateVendorInsuranceSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.insurance_type !== undefined) updates.insurance_type = input.insurance_type
    if (input.carrier_name !== undefined) updates.carrier_name = input.carrier_name
    if (input.policy_number !== undefined) updates.policy_number = input.policy_number
    if (input.coverage_amount !== undefined) updates.coverage_amount = input.coverage_amount
    if (input.expiration_date !== undefined) updates.expiration_date = input.expiration_date
    if (input.certificate_document_id !== undefined) updates.certificate_document_id = input.certificate_document_id
    if (input.status !== undefined) updates.status = input.status
    if (input.verified_at !== undefined) updates.verified_at = input.verified_at
    if (input.verified_by !== undefined) updates.verified_by = input.verified_by

    const { data, error } = await (supabase as any)
      .from('vendor_insurance')
      .update(updates)
      .eq('id', insuranceId)
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Insurance record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/vendors/:id/insurance/:insuranceId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { vendorId, insuranceId } = getIds(req.nextUrl.pathname)
    if (!vendorId || !insuranceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID or insurance ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('vendor_insurance')
      .delete()
      .eq('id', insuranceId)
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Insurance record not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
