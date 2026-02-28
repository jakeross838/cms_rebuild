/**
 * Vendor Contacts API — List & Create
 *
 * GET  /api/v1/vendors/[id]/contacts — List contacts for a vendor
 * POST /api/v1/vendors/[id]/contacts — Create a new vendor contact
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
import { uuidSchema } from '@/lib/validation/schemas/common'
import { z } from 'zod'

import {
  createVendorContactSchema,
  listVendorContactsSchema,
} from '@/lib/validation/schemas/vendor-management'

type CreateVendorContactInput = z.infer<typeof createVendorContactSchema>
import type { VendorContact } from '@/types/vendor-management'

function extractEntityId(req: Request, segment: string): string | null {
  const segments = new URL(req.url).pathname.split('/')
  const idx = segments.indexOf(segment)
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v1/vendors/[id]/contacts — List contacts for a vendor
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const vendorId = extractEntityId(req, 'vendors')
    if (!vendorId || !uuidSchema.safeParse(vendorId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = new URL(req.url)
    const parseResult = listVendorContactsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
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

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify vendor belongs to this company
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: contacts, count, error } = await supabase
      .from('vendor_contacts')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('company_id', ctx.companyId!)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1) as unknown as {
        data: VendorContact[] | null
        count: number | null
        error: { message: string } | null
      }

    if (error) {
      logger.error('Failed to list vendor contacts', { error: error.message, vendorId })
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(
      { ...paginatedResponse(contacts ?? [], count ?? 0, page, limit), requestId: ctx.requestId }
    )
  },
  { requireAuth: true, rateLimit: 'api', permission: 'jobs:read:all' }
)

// ============================================================================
// POST /api/v1/vendors/[id]/contacts — Create a new vendor contact
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const logger = createLogger({ requestId: ctx.requestId, userId: ctx.user!.id })

    const vendorId = extractEntityId(req, 'vendors')
    if (!vendorId || !uuidSchema.safeParse(vendorId).success) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid vendor ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as CreateVendorContactInput

    const supabase = await createClient()

    // Verify vendor belongs to this company
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as { data: { id: string } | null; error: { message: string } | null }

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Vendor not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data: contact, error } = await (supabase
      .from('vendor_contacts')
      .insert({
        ...body,
        vendor_id: vendorId,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as Promise<{ data: VendorContact | null; error: { message: string } | null }>)

    if (error || !contact) {
      logger.error('Failed to create vendor contact', { error: error?.message, vendorId })
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    logger.info('Vendor contact created', { contactId: contact.id, vendorId, companyId: ctx.companyId! })

    return NextResponse.json({ data: contact, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    rateLimit: 'api',
    requiredRoles: ['owner', 'admin', 'pm'],
    schema: createVendorContactSchema,
    permission: 'jobs:update:all',
    auditAction: 'vendor_contact.create',
  }
)
