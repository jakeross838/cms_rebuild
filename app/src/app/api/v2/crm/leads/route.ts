/**
 * CRM Leads API — List & Create
 *
 * GET  /api/v2/crm/leads — List leads (filtered by company)
 * POST /api/v2/crm/leads — Create a new lead
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listLeadsSchema, createLeadSchema } from '@/lib/validation/schemas/crm'

// ============================================================================
// GET /api/v2/crm/leads
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listLeadsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      priority: url.searchParams.get('priority') ?? undefined,
      source: url.searchParams.get('source') ?? undefined,
      assigned_to: url.searchParams.get('assigned_to') ?? undefined,
      pipeline_id: url.searchParams.get('pipeline_id') ?? undefined,
      stage_id: url.searchParams.get('stage_id') ?? undefined,
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
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.source) {
      query = query.eq('source', filters.source)
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters.pipeline_id) {
      query = query.eq('pipeline_id', filters.pipeline_id)
    }
    if (filters.stage_id) {
      query = query.eq('stage_id', filters.stage_id)
    }
    if (filters.q) {
      query = query.or(`first_name.ilike.%${escapeLike(filters.q)}%,last_name.ilike.%${escapeLike(filters.q)}%,email.ilike.%${escapeLike(filters.q)}%`)
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
// POST /api/v2/crm/leads — Create lead
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createLeadSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid lead data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .insert({
        company_id: ctx.companyId!,
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
        lot_address: input.lot_address ?? null,
        source: input.source,
        source_detail: input.source_detail ?? null,
        utm_source: input.utm_source ?? null,
        utm_medium: input.utm_medium ?? null,
        utm_campaign: input.utm_campaign ?? null,
        project_type: input.project_type ?? null,
        budget_range_low: input.budget_range_low ?? null,
        budget_range_high: input.budget_range_high ?? null,
        timeline: input.timeline ?? null,
        lot_status: input.lot_status ?? null,
        financing_status: input.financing_status ?? null,
        preconstruction_type: input.preconstruction_type ?? null,
        status: input.status,
        priority: input.priority,
        pipeline_id: input.pipeline_id ?? null,
        stage_id: input.stage_id ?? null,
        score: input.score,
        assigned_to: input.assigned_to ?? null,
        expected_contract_value: input.expected_contract_value,
        probability_pct: input.probability_pct,
        created_by: ctx.user!.id,
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
