/**
 * CRM Lead by ID — Get, Update, Delete
 *
 * GET    /api/v2/crm/leads/:id — Get lead details
 * PUT    /api/v2/crm/leads/:id — Update lead
 * DELETE /api/v2/crm/leads/:id — Soft delete (archive) lead
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateLeadSchema } from '@/lib/validation/schemas/crm'

// ============================================================================
// GET /api/v2/crm/leads/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lead not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch activities count
    const { data: activities } = await (supabase as any)
      .from('lead_activities')
      .select('id')
      .eq('lead_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: {
        ...data,
        activities_count: (activities ?? []).length,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/crm/leads/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateLeadSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify lead exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('leads')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lead not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (input.first_name !== undefined) updates.first_name = input.first_name
    if (input.last_name !== undefined) updates.last_name = input.last_name
    if (input.email !== undefined) updates.email = input.email
    if (input.phone !== undefined) updates.phone = input.phone
    if (input.address !== undefined) updates.address = input.address
    if (input.lot_address !== undefined) updates.lot_address = input.lot_address
    if (input.source !== undefined) updates.source = input.source
    if (input.source_detail !== undefined) updates.source_detail = input.source_detail
    if (input.utm_source !== undefined) updates.utm_source = input.utm_source
    if (input.utm_medium !== undefined) updates.utm_medium = input.utm_medium
    if (input.utm_campaign !== undefined) updates.utm_campaign = input.utm_campaign
    if (input.project_type !== undefined) updates.project_type = input.project_type
    if (input.budget_range_low !== undefined) updates.budget_range_low = input.budget_range_low
    if (input.budget_range_high !== undefined) updates.budget_range_high = input.budget_range_high
    if (input.timeline !== undefined) updates.timeline = input.timeline
    if (input.lot_status !== undefined) updates.lot_status = input.lot_status
    if (input.financing_status !== undefined) updates.financing_status = input.financing_status
    if (input.preconstruction_type !== undefined) updates.preconstruction_type = input.preconstruction_type
    if (input.status !== undefined) updates.status = input.status
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.pipeline_id !== undefined) updates.pipeline_id = input.pipeline_id
    if (input.stage_id !== undefined) updates.stage_id = input.stage_id
    if (input.score !== undefined) updates.score = input.score
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to
    if (input.expected_contract_value !== undefined) updates.expected_contract_value = input.expected_contract_value
    if (input.probability_pct !== undefined) updates.probability_pct = input.probability_pct
    if (input.lost_reason !== undefined) updates.lost_reason = input.lost_reason
    if (input.lost_competitor !== undefined) updates.lost_competitor = input.lost_competitor

    const { data, error } = await (supabase as any)
      .from('leads')
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
// DELETE /api/v2/crm/leads/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify lead exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('leads')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lead not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase as any)
      .from('leads')
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
