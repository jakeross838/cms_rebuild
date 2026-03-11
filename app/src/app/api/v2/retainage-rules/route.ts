/**
 * Retainage Rules API — List & Create
 *
 * GET  /api/v2/retainage-rules — List retainage rules (filtered by company)
 * POST /api/v2/retainage-rules — Create a new retainage rule
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
import { listRetainageRulesSchema, createRetainageRuleSchema } from '@/lib/validation/schemas/invoices'

// ============================================================================
// GET /api/v2/retainage-rules
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listRetainageRulesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      scope: url.searchParams.get('scope') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      vendor_id: url.searchParams.get('vendor_id') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
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

    let query = (supabase as any).from('retainage_rules')
      .select('id, company_id, name, scope, job_id, vendor_id, retainage_percent, release_at_percent_complete, auto_release, is_active, created_at, updated_at, jobs(name), vendors(name)', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.scope) {
      query = query.eq('scope', filters.scope)
    }
    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
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
// POST /api/v2/retainage-rules — Create retainage rule
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createRetainageRuleSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid retainage rule data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any).from('retainage_rules')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        scope: input.scope,
        job_id: input.job_id ?? null,
        vendor_id: input.vendor_id ?? null,
        retainage_percent: input.retainage_percent,
        release_at_percent_complete: input.release_at_percent_complete ?? null,
        auto_release: input.auto_release ?? false,
        is_active: input.is_active ?? true,
      } as any)
      .select('id, company_id, name, scope, job_id, vendor_id, retainage_percent, release_at_percent_complete, auto_release, is_active, created_at, updated_at')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'office'], auditAction: 'retainage_rule.create' }
)
