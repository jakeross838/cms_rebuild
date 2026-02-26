/**
 * CRM Lead Activities — List & Create
 *
 * GET  /api/v2/crm/leads/:id/activities — List activities for a lead
 * POST /api/v2/crm/leads/:id/activities — Log a new activity
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listLeadActivitiesSchema, createLeadActivitySchema } from '@/lib/validation/schemas/crm'

// ============================================================================
// GET /api/v2/crm/leads/:id/activities
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const leadIdx = segments.indexOf('leads')
    const leadId = segments[leadIdx + 1]

    if (!leadId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listLeadActivitiesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      activity_type: url.searchParams.get('activity_type') ?? undefined,
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

    // Verify lead exists
    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lead not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase as any)
      .from('lead_activities')
      .select('*', { count: 'exact' })
      .eq('lead_id', leadId)
      .eq('company_id', ctx.companyId!)

    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type)
    }

    query = query.order('activity_date', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/crm/leads/:id/activities — Log activity
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const leadIdx = segments.indexOf('leads')
    const leadId = segments[leadIdx + 1]

    if (!leadId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing lead ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createLeadActivitySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid activity data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify lead exists
    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Lead not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('lead_activities')
      .insert({
        company_id: ctx.companyId!,
        lead_id: leadId,
        activity_type: input.activity_type,
        subject: input.subject ?? null,
        description: input.description ?? null,
        performed_by: ctx.user!.id,
        activity_date: input.activity_date ?? new Date().toISOString(),
        duration_minutes: input.duration_minutes ?? null,
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
