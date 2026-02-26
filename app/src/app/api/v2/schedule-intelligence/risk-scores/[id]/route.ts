/**
 * Schedule Risk Score by ID — Get, Update
 *
 * GET /api/v2/schedule-intelligence/risk-scores/:id — Get risk score details
 * PUT /api/v2/schedule-intelligence/risk-scores/:id — Update risk score
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateRiskScoreSchema } from '@/lib/validation/schemas/schedule-intelligence'

// ============================================================================
// GET /api/v2/schedule-intelligence/risk-scores/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing risk score ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('schedule_risk_scores')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Risk score not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/schedule-intelligence/risk-scores/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing risk score ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateRiskScoreSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.risk_level !== undefined) updates.risk_level = input.risk_level
    if (input.risk_score !== undefined) updates.risk_score = input.risk_score
    if (input.risk_factors !== undefined) updates.risk_factors = input.risk_factors
    if (input.mitigation_suggestions !== undefined) updates.mitigation_suggestions = input.mitigation_suggestions
    if (input.weather_component !== undefined) updates.weather_component = input.weather_component
    if (input.resource_component !== undefined) updates.resource_component = input.resource_component
    if (input.dependency_component !== undefined) updates.dependency_component = input.dependency_component
    if (input.history_component !== undefined) updates.history_component = input.history_component
    // Update assessed_at when risk data changes
    updates.assessed_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('schedule_risk_scores')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'schedule_intelligence_risk_score.update' }
)
