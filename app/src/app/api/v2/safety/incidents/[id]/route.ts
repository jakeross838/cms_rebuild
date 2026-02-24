/**
 * Safety Incident by ID — Get, Update, Delete
 *
 * GET    /api/v2/safety/incidents/:id — Get incident details
 * PUT    /api/v2/safety/incidents/:id — Update incident
 * DELETE /api/v2/safety/incidents/:id — Soft delete incident
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateIncidentSchema } from '@/lib/validation/schemas/safety'

// ============================================================================
// GET /api/v2/safety/incidents/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing incident ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('safety_incidents')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Incident not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/safety/incidents/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing incident ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateIncidentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify incident exists and is not closed
    const { data: existing, error: existError } = await (supabase as any)
      .from('safety_incidents')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Incident not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'closed') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Closed incidents cannot be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.incident_number !== undefined) updates.incident_number = input.incident_number
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.incident_date !== undefined) updates.incident_date = input.incident_date
    if (input.incident_time !== undefined) updates.incident_time = input.incident_time
    if (input.location !== undefined) updates.location = input.location
    if (input.severity !== undefined) updates.severity = input.severity
    if (input.status !== undefined) updates.status = input.status
    if (input.incident_type !== undefined) updates.incident_type = input.incident_type
    if (input.reported_by !== undefined) updates.reported_by = input.reported_by
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.injured_party !== undefined) updates.injured_party = input.injured_party
    if (input.injury_description !== undefined) updates.injury_description = input.injury_description
    if (input.witnesses !== undefined) updates.witnesses = input.witnesses
    if (input.root_cause !== undefined) updates.root_cause = input.root_cause
    if (input.corrective_actions !== undefined) updates.corrective_actions = input.corrective_actions
    if (input.preventive_actions !== undefined) updates.preventive_actions = input.preventive_actions
    if (input.osha_recordable !== undefined) updates.osha_recordable = input.osha_recordable
    if (input.osha_report_number !== undefined) updates.osha_report_number = input.osha_report_number
    if (input.lost_work_days !== undefined) updates.lost_work_days = input.lost_work_days
    if (input.restricted_days !== undefined) updates.restricted_days = input.restricted_days
    if (input.medical_treatment !== undefined) updates.medical_treatment = input.medical_treatment
    if (input.photos !== undefined) updates.photos = input.photos
    if (input.documents !== undefined) updates.documents = input.documents

    // Auto-set resolved/closed timestamps
    if (input.status === 'resolved' && existing.status !== 'resolved') {
      updates.resolved_at = new Date().toISOString()
      updates.resolved_by = ctx.user!.id
    }
    if (input.status === 'closed' && existing.status !== 'closed') {
      updates.closed_at = new Date().toISOString()
      updates.closed_by = ctx.user!.id
    }

    const { data, error } = await (supabase as any)
      .from('safety_incidents')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/safety/incidents/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing incident ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: existError } = await (supabase as any)
      .from('safety_incidents')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Incident not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any)
      .from('safety_incidents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
