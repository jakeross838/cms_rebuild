/**
 * Marketing Referrals API — List & Create
 *
 * GET  /api/v2/marketing-site/referrals — List referrals for company
 * POST /api/v2/marketing-site/referrals — Create a new referral
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listMarketingReferralsSchema, createMarketingReferralSchema } from '@/lib/validation/schemas/marketing-website'

// ============================================================================
// GET /api/v2/marketing-site/referrals
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listMarketingReferralsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      credit_applied: url.searchParams.get('credit_applied') ?? undefined,
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

    let query = (supabase as any)
      .from('marketing_referrals')
      .select('*', { count: 'exact' })
      .eq('referrer_company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.credit_applied !== undefined) {
      query = query.eq('credit_applied', filters.credit_applied)
    }
    if (filters.q) {
      query = query.or(`referred_email.ilike.%${filters.q}%,referred_company_name.ilike.%${filters.q}%,referral_code.ilike.%${filters.q}%`)
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
// POST /api/v2/marketing-site/referrals
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createMarketingReferralSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid referral data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for duplicate referral_code
    const { data: existing } = await (supabase as any)
      .from('marketing_referrals')
      .select('id')
      .eq('referral_code', input.referral_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Referral code already exists', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('marketing_referrals')
      .insert({
        referrer_company_id: ctx.companyId!,
        referral_code: input.referral_code,
        referred_email: input.referred_email,
        referred_company_name: input.referred_company_name ?? null,
        status: input.status,
        referrer_credit: input.referrer_credit,
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
