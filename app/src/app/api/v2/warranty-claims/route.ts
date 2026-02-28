/**
 * Warranty Claims API (flat route) — List & Create
 *
 * GET  /api/v2/warranty-claims — List warranty claims (filtered by company)
 * POST /api/v2/warranty-claims — Create a new warranty claim (warranty_id in body)
 */

import { NextResponse } from 'next/server'
import { safeOrIlike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listWarrantyClaimsSchema, createWarrantyClaimSchema } from '@/lib/validation/schemas/warranty-claims'

// ============================================================================
// GET /api/v2/warranty-claims
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listWarrantyClaimsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      warranty_id: url.searchParams.get('warranty_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      priority: url.searchParams.get('priority') ?? undefined,
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

    let query = supabase
      .from('warranty_claims')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.warranty_id) {
      query = query.eq('warranty_id', filters.warranty_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.q) {
      query = query.or(`title.ilike.${safeOrIlike(filters.q)},claim_number.ilike.${safeOrIlike(filters.q)}`)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/warranty-claims — Create warranty claim
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createWarrantyClaimSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid warranty claim data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('warranty_claims')
      .insert({
        company_id: ctx.companyId!,
        warranty_id: input.warranty_id,
        title: input.title,
        claim_number: input.claim_number,
        status: input.status,
        priority: input.priority,
        description: input.description ?? null,
        reported_date: input.reported_date,
        reported_by: input.reported_by ?? null,
        due_date: input.due_date ?? null,
        assigned_to: input.assigned_to ?? null,
        assigned_vendor_id: input.assigned_vendor_id ?? null,
        resolution_notes: input.resolution_notes ?? null,
        resolution_cost: input.resolution_cost ?? null,
        created_by: ctx.user!.id,
      } as never)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'warranty_claim.create' }
)
