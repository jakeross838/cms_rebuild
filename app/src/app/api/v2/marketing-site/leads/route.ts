/**
 * Marketing Leads API — List & Create
 *
 * GET  /api/v2/marketing-site/leads — List marketing leads (platform-level)
 * POST /api/v2/marketing-site/leads — Create a new marketing lead
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMarketingLeadsSchema, createMarketingLeadSchema } from '@/lib/validation/schemas/marketing-website'

// ============================================================================
// GET /api/v2/marketing-site/leads
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listMarketingLeadsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      source: url.searchParams.get('source') ?? undefined,
      pipeline_stage: url.searchParams.get('pipeline_stage') ?? undefined,
      assigned_to: url.searchParams.get('assigned_to') ?? undefined,
      closed_reason: url.searchParams.get('closed_reason') ?? undefined,
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
      .from('marketing_leads')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (filters.source) {
      query = query.eq('source', filters.source)
    }
    if (filters.pipeline_stage) {
      query = query.eq('pipeline_stage', filters.pipeline_stage)
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters.closed_reason) {
      query = query.eq('closed_reason', filters.closed_reason)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,email.ilike.%${escapeLike(filters.q)}%,company_name.ilike.%${escapeLike(filters.q)}%`)
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
// POST /api/v2/marketing-site/leads
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createMarketingLeadSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid lead data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('marketing_leads')
      .insert({
        name: input.name,
        email: input.email,
        source: input.source,
        utm_source: input.utm_source ?? null,
        utm_medium: input.utm_medium ?? null,
        utm_campaign: input.utm_campaign ?? null,
        company_name: input.company_name ?? null,
        phone: input.phone ?? null,
        company_size: input.company_size ?? null,
        current_tools: input.current_tools ?? null,
        pipeline_stage: input.pipeline_stage,
        assigned_to: input.assigned_to ?? null,
        deal_value: input.deal_value,
        close_probability: input.close_probability,
        competitor_name: input.competitor_name ?? null,
        notes: input.notes ?? null,
        crm_id: input.crm_id ?? null,
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
