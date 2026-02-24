/**
 * Warranty Claims API — List & Create
 *
 * GET  /api/v2/warranties/:id/claims — List claims for a warranty
 * POST /api/v2/warranties/:id/claims — Create a new claim
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listWarrantyClaimsSchema, createWarrantyClaimSchema } from '@/lib/validation/schemas/warranty'

/**
 * Extract warranty ID from /api/v2/warranties/:id/claims
 */
function extractWarrantyId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('warranties')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// GET /api/v2/warranties/:id/claims
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const warrantyId = extractWarrantyId(req.nextUrl.pathname)
    if (!warrantyId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listWarrantyClaimsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      warranty_id: warrantyId,
      status: url.searchParams.get('status') ?? undefined,
      priority: url.searchParams.get('priority') ?? undefined,
      assigned_to: url.searchParams.get('assigned_to') ?? undefined,
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

    // Verify warranty belongs to company
    const { data: warranty, error: wError } = await (supabase
      .from('warranties') as any)
      .select('id')
      .eq('id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (wError || !warranty) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase
      .from('warranty_claims') as any)
      .select('*', { count: 'exact' })
      .eq('warranty_id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,claim_number.ilike.%${filters.q}%`)
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
// POST /api/v2/warranties/:id/claims — Create claim
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const warrantyId = extractWarrantyId(req.nextUrl.pathname)
    if (!warrantyId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing warranty ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createWarrantyClaimSchema.safeParse({
      ...body,
      warranty_id: warrantyId,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid claim data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify warranty belongs to company and is active
    const { data: warranty, error: wError } = await (supabase
      .from('warranties') as any)
      .select('id, status')
      .eq('id', warrantyId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (wError || !warranty) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('warranty_claims') as any)
      .insert({
        company_id: ctx.companyId!,
        warranty_id: warrantyId,
        claim_number: input.claim_number,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        reported_by: ctx.user!.id,
        reported_date: input.reported_date ?? new Date().toISOString().split('T')[0],
        assigned_to: input.assigned_to ?? null,
        assigned_vendor_id: input.assigned_vendor_id ?? null,
        due_date: input.due_date ?? null,
        photos: input.photos,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Record history entry
    await (supabase
      .from('warranty_claim_history') as any)
      .insert({
        claim_id: data.id,
        company_id: ctx.companyId!,
        action: 'created',
        previous_status: null,
        new_status: 'submitted',
        details: {},
        performed_by: ctx.user!.id,
      })

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
