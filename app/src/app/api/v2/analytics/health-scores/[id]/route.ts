/**
 * Tenant Health Score by ID — Get, Update
 *
 * GET /api/v2/analytics/health-scores/:id — Get health score
 * PUT /api/v2/analytics/health-scores/:id — Update health score
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateHealthScoreSchema } from '@/lib/validation/schemas/platform-analytics'

// ============================================================================
// GET /api/v2/analytics/health-scores/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing health score ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tenant_health_scores')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Health score not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/analytics/health-scores/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing health score ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateHealthScoreSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.score_date !== undefined) updates.score_date = input.score_date
    if (input.overall_score !== undefined) updates.overall_score = input.overall_score
    if (input.adoption_score !== undefined) updates.adoption_score = input.adoption_score
    if (input.engagement_score !== undefined) updates.engagement_score = input.engagement_score
    if (input.satisfaction_score !== undefined) updates.satisfaction_score = input.satisfaction_score
    if (input.growth_score !== undefined) updates.growth_score = input.growth_score
    if (input.risk_level !== undefined) updates.risk_level = input.risk_level
    if (input.churn_probability !== undefined) updates.churn_probability = input.churn_probability
    if (input.last_login_at !== undefined) updates.last_login_at = input.last_login_at
    if (input.active_users_count !== undefined) updates.active_users_count = input.active_users_count
    if (input.feature_utilization !== undefined) updates.feature_utilization = input.feature_utilization
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('tenant_health_scores')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
