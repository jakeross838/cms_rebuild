/**
 * CRM Lead Activity by ID — Get, Update, Delete
 *
 * GET    /api/v2/crm/leads/:id/activities/:activityId — Get activity
 * PUT    /api/v2/crm/leads/:id/activities/:activityId — Update activity
 * DELETE /api/v2/crm/leads/:id/activities/:activityId — Delete activity
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateLeadActivitySchema } from '@/lib/validation/schemas/crm'

function extractIds(pathname: string) {
  const segments = pathname.split('/')
  const leadsIdx = segments.indexOf('leads')
  const activitiesIdx = segments.indexOf('activities')
  return {
    leadId: leadsIdx >= 0 && segments.length > leadsIdx + 1 ? segments[leadsIdx + 1] : null,
    activityId: activitiesIdx >= 0 && segments.length > activitiesIdx + 1 ? segments[activitiesIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/crm/leads/:id/activities/:activityId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { leadId, activityId } = extractIds(req.nextUrl.pathname)

    if (!leadId || !activityId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead or activity ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('id', activityId)
      .eq('lead_id', leadId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Activity not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/crm/leads/:id/activities/:activityId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { leadId, activityId } = extractIds(req.nextUrl.pathname)

    if (!leadId || !activityId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead or activity ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateLeadActivitySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    if (input.activity_type !== undefined) updates.activity_type = input.activity_type
    if (input.subject !== undefined) updates.subject = input.subject
    if (input.description !== undefined) updates.description = input.description
    if (input.activity_date !== undefined) updates.activity_date = input.activity_date
    if (input.duration_minutes !== undefined) updates.duration_minutes = input.duration_minutes

    const { data, error } = await supabase
      .from('lead_activities')
      .update(updates)
      .eq('id', activityId)
      .eq('lead_id', leadId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'crm_leads_activity.update' }
)

// ============================================================================
// DELETE /api/v2/crm/leads/:id/activities/:activityId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { leadId, activityId } = extractIds(req.nextUrl.pathname)

    if (!leadId || !activityId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead or activity ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('lead_activities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', activityId)
      .eq('lead_id', leadId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'crm_leads_activity.archive' }
)
