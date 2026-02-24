/**
 * Vendor Contact by ID — Update & Delete
 *
 * PUT    /api/v2/vendors/:id/contacts/:contactId — Update a contact
 * DELETE /api/v2/vendors/:id/contacts/:contactId — Soft delete a contact
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateVendorContactSchema } from '@/lib/validation/schemas/vendor-management'

/**
 * Extract vendor ID and contact ID from pathname
 * /api/v2/vendors/:id/contacts/:contactId
 */
function getIds(pathname: string): { vendorId: string | null; contactId: string | null } {
  const segments = pathname.split('/')
  const vendorsIdx = segments.indexOf('vendors')
  const contactsIdx = segments.indexOf('contacts')
  return {
    vendorId: vendorsIdx !== -1 && vendorsIdx + 1 < segments.length ? segments[vendorsIdx + 1] : null,
    contactId: contactsIdx !== -1 && contactsIdx + 1 < segments.length ? segments[contactsIdx + 1] : null,
  }
}

// ============================================================================
// PUT /api/v2/vendors/:id/contacts/:contactId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { vendorId, contactId } = getIds(req.nextUrl.pathname)
    if (!vendorId || !contactId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID or contact ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateVendorContactSchema.safeParse(body)

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
    if (input.name !== undefined) updates.name = input.name
    if (input.title !== undefined) updates.title = input.title
    if (input.email !== undefined) updates.email = input.email
    if (input.phone !== undefined) updates.phone = input.phone
    if (input.is_primary !== undefined) updates.is_primary = input.is_primary

    const { data, error } = await (supabase
      .from('vendor_contacts') as any)
      .update(updates)
      .eq('id', contactId)
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contact not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/vendors/:id/contacts/:contactId — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { vendorId, contactId } = getIds(req.nextUrl.pathname)
    if (!vendorId || !contactId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing vendor ID or contact ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Soft delete — we don't have a deleted_at on this table, so we just remove it
    // Per project convention of soft delete, but since this is a junction-like record,
    // we perform actual delete (contacts don't have a status/deleted_at field in V1)
    const { error } = await (supabase
      .from('vendor_contacts') as any)
      .delete()
      .eq('id', contactId)
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Contact not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
