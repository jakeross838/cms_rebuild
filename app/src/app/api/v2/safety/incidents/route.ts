/**
 * Safety Incidents API — List & Create
 *
 * GET  /api/v2/safety/incidents — List incidents (filtered by company)
 * POST /api/v2/safety/incidents — Create a new incident report
 */

import { NextResponse } from 'next/server'
import { escapeLike } from '@/lib/utils'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listIncidentsSchema, createIncidentSchema } from '@/lib/validation/schemas/safety'

// ============================================================================
// GET /api/v2/safety/incidents
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listIncidentsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
      incident_type: url.searchParams.get('incident_type') ?? undefined,
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

    let query = supabase
      .from('safety_incidents')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters.incident_type) {
      query = query.eq('incident_type', filters.incident_type)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${escapeLike(filters.q)}%,incident_number.ilike.%${escapeLike(filters.q)}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/safety/incidents — Create incident
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createIncidentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid incident data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('safety_incidents')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        incident_number: input.incident_number,
        title: input.title,
        description: input.description ?? null,
        incident_date: input.incident_date,
        incident_time: input.incident_time ?? null,
        location: input.location ?? null,
        severity: input.severity,
        status: input.status,
        incident_type: input.incident_type,
        reported_by: input.reported_by ?? null,
        assigned_to: input.assigned_to ?? null,
        injured_party: input.injured_party ?? null,
        injury_description: input.injury_description ?? null,
        witnesses: input.witnesses,
        root_cause: input.root_cause ?? null,
        corrective_actions: input.corrective_actions ?? null,
        preventive_actions: input.preventive_actions ?? null,
        osha_recordable: input.osha_recordable,
        osha_report_number: input.osha_report_number ?? null,
        lost_work_days: input.lost_work_days,
        restricted_days: input.restricted_days,
        medical_treatment: input.medical_treatment,
        photos: input.photos,
        documents: input.documents,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
