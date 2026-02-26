/**
 * Marketing Campaigns API — List & Create
 *
 * GET  /api/v2/marketing/campaigns — List marketing campaigns
 * POST /api/v2/marketing/campaigns — Create a new campaign
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
import { listMarketingCampaignsSchema, createMarketingCampaignSchema } from '@/lib/validation/schemas/marketing'

// ============================================================================
// GET /api/v2/marketing/campaigns
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listMarketingCampaignsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      campaign_type: url.searchParams.get('campaign_type') ?? undefined,
      channel: url.searchParams.get('channel') ?? undefined,
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
      .from('marketing_campaigns')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.campaign_type) {
      query = query.eq('campaign_type', filters.campaign_type)
    }
    if (filters.channel) {
      query = query.eq('channel', filters.channel)
    }
    if (filters.q) {
      query = query.or(`name.ilike.%${escapeLike(filters.q)}%,description.ilike.%${escapeLike(filters.q)}%`)
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
// POST /api/v2/marketing/campaigns
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createMarketingCampaignSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid campaign data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        company_id: ctx.companyId!,
        name: input.name,
        description: input.description ?? null,
        campaign_type: input.campaign_type,
        status: input.status,
        channel: input.channel ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        budget: input.budget,
        actual_spend: input.actual_spend,
        utm_source: input.utm_source ?? null,
        utm_medium: input.utm_medium ?? null,
        utm_campaign: input.utm_campaign ?? null,
        leads_generated: input.leads_generated,
        proposals_sent: input.proposals_sent,
        contracts_won: input.contracts_won,
        contract_value_won: input.contract_value_won,
        target_audience: input.target_audience ?? null,
        notes: input.notes ?? null,
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
