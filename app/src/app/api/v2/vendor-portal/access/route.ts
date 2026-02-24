/**
 * Vendor Portal Access API — List & Create
 *
 * GET  /api/v2/vendor-portal/access — List vendor access records
 * POST /api/v2/vendor-portal/access — Grant portal access to a vendor
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listAccessSchema, createAccessSchema } from '@/lib/validation/schemas/vendor-portal'

// ============================================================================
// GET /api/v2/vendor-portal/access
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listAccessSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      access_level: url.searchParams.get('access_level') ?? undefined,
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

    let query = (supabase
      .from('vendor_portal_access') as any)
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.access_level) {
      query = query.eq('access_level', filters.access_level)
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
// POST /api/v2/vendor-portal/access — Grant access
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createAccessSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid access data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for existing access for this vendor
    const { data: existing } = await (supabase
      .from('vendor_portal_access') as any)
      .select('id')
      .eq('company_id', ctx.companyId!)
      .eq('vendor_id', input.vendor_id)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Access already exists for this vendor', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase
      .from('vendor_portal_access') as any)
      .insert({
        company_id: ctx.companyId!,
        vendor_id: input.vendor_id,
        access_level: input.access_level,
        can_submit_invoices: input.can_submit_invoices,
        can_submit_lien_waivers: input.can_submit_lien_waivers,
        can_submit_daily_reports: input.can_submit_daily_reports,
        can_view_schedule: input.can_view_schedule,
        can_view_purchase_orders: input.can_view_purchase_orders,
        can_upload_documents: input.can_upload_documents,
        can_send_messages: input.can_send_messages,
        allowed_job_ids: input.allowed_job_ids,
        granted_by: ctx.user!.id,
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
