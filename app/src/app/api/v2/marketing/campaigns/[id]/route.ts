/**
 * Marketing Campaign by ID — Get, Update
 *
 * GET /api/v2/marketing/campaigns/:id — Get campaign details
 * PUT /api/v2/marketing/campaigns/:id — Update campaign
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMarketingCampaignSchema } from '@/lib/validation/schemas/marketing'

function extractId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const campaignsIdx = segments.indexOf('campaigns')
  return campaignsIdx >= 0 && segments.length > campaignsIdx + 1 ? segments[campaignsIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing/campaigns/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('marketing_campaigns')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Campaign not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch contacts count
    const { data: contacts } = await (supabase as any)
      .from('campaign_contacts')
      .select('id')
      .eq('campaign_id', id)

    return NextResponse.json({
      data: {
        ...data,
        contacts_count: (contacts ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/marketing/campaigns/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing campaign ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMarketingCampaignSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    const { data, error } = await (supabase as any)
      .from('marketing_campaigns')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Campaign not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
