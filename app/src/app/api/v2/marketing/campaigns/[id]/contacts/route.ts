/**
 * Campaign Contacts API — List & Create
 *
 * GET  /api/v2/marketing/campaigns/:id/contacts — List contacts for a campaign
 * POST /api/v2/marketing/campaigns/:id/contacts — Add contact to campaign
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listCampaignContactsSchema, createCampaignContactSchema } from '@/lib/validation/schemas/marketing'

function extractCampaignId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const campaignsIdx = segments.indexOf('campaigns')
  return campaignsIdx >= 0 && segments.length > campaignsIdx + 1 ? segments[campaignsIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing/campaigns/:id/contacts
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const campaignId = extractCampaignId(req)
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listCampaignContactsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
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

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await (supabase
      .from('marketing_campaigns') as any)
      .select('id')
      .eq('id', campaignId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Campaign not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase
      .from('campaign_contacts') as any)
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.q) {
      query = query.or(`contact_name.ilike.%${filters.q}%,contact_email.ilike.%${filters.q}%`)
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
// POST /api/v2/marketing/campaigns/:id/contacts
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const campaignId = extractCampaignId(req)
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createCampaignContactSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid contact data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await (supabase
      .from('marketing_campaigns') as any)
      .select('id')
      .eq('id', campaignId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Campaign not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase
      .from('campaign_contacts') as any)
      .insert({
        campaign_id: campaignId,
        company_id: ctx.companyId!,
        contact_name: input.contact_name,
        contact_email: input.contact_email ?? null,
        contact_phone: input.contact_phone ?? null,
        status: input.status,
        lead_id: input.lead_id ?? null,
        notes: input.notes ?? null,
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
