/**
 * Marketing Referral by ID — Get, Update
 *
 * GET /api/v2/marketing-site/referrals/:id — Get referral details
 * PUT /api/v2/marketing-site/referrals/:id — Update referral
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMarketingReferralSchema } from '@/lib/validation/schemas/marketing-website'

function extractId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const referralsIdx = segments.indexOf('referrals')
  return referralsIdx >= 0 && segments.length > referralsIdx + 1 ? segments[referralsIdx + 1] : null
}

// ============================================================================
// GET /api/v2/marketing-site/referrals/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing referral ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('marketing_referrals')
      .select('*')
      .eq('id', id)
      .eq('referrer_company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Referral not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/marketing-site/referrals/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing referral ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateMarketingReferralSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        updates[key] = value
      }
    }

    // Auto-set timestamps on status transitions
    if (input.status === 'clicked' && !updates.clicked_at) {
      updates.clicked_at = new Date().toISOString()
    }
    if (input.status === 'signed_up' && !updates.signed_up_at) {
      updates.signed_up_at = new Date().toISOString()
    }
    if (input.status === 'converted' && !updates.converted_at) {
      updates.converted_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('marketing_referrals')
      .update(updates)
      .eq('id', id)
      .eq('referrer_company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
