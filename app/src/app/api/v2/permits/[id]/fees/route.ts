/**
 * Permit Fees API — List & Create
 *
 * GET  /api/v2/permits/:id/fees — List fees for a permit
 * POST /api/v2/permits/:id/fees — Add a fee to a permit
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPermitFeesSchema, createPermitFeeSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/fees
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const permitId = segments[segments.indexOf('permits') + 1]

    const url = req.nextUrl
    const parseResult = listPermitFeesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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

    // Verify permit ownership
    const { error: permitError } = await supabase
      .from('permits')
      .select('id')
      .eq('id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (permitError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('permit_fees')
      .select('*', { count: 'exact' })
      .eq('permit_id', permitId)
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
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
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/permits/:id/fees — Add fee
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const permitId = segments[segments.indexOf('permits') + 1]

    const body = await req.json()
    const parseResult = createPermitFeeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid fee data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify permit ownership
    const { error: permitError } = await supabase
      .from('permits')
      .select('id')
      .eq('id', permitId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (permitError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Permit not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('permit_fees')
      .insert({
        company_id: ctx.companyId!,
        permit_id: permitId,
        description: input.description,
        amount: input.amount,
        status: input.status,
        due_date: input.due_date ?? null,
        paid_date: input.paid_date ?? null,
        receipt_url: input.receipt_url ?? null,
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
