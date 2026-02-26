/**
 * CRM Pipeline Stages — List & Create
 *
 * GET  /api/v2/crm/pipelines/:id/stages — List stages for a pipeline
 * POST /api/v2/crm/pipelines/:id/stages — Create a new stage
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listPipelineStagesSchema, createPipelineStageSchema } from '@/lib/validation/schemas/crm'

// ============================================================================
// GET /api/v2/crm/pipelines/:id/stages
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const pipelinesIdx = segments.indexOf('pipelines')
    const pipelineId = segments[pipelinesIdx + 1]

    if (!pipelineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing pipeline ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listPipelineStagesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      stage_type: url.searchParams.get('stage_type') ?? undefined,
      is_active: url.searchParams.get('is_active') ?? undefined,
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

    // Verify pipeline exists
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .select('id')
      .eq('id', pipelineId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (pipelineError || !pipeline) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Pipeline not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = supabase
      .from('pipeline_stages')
      .select('*', { count: 'exact' })
      .eq('pipeline_id', pipelineId)
      .eq('company_id', ctx.companyId!)

    if (filters.stage_type) {
      query = query.eq('stage_type', filters.stage_type)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    query = query.order('sequence_order', { ascending: true })

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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/crm/pipelines/:id/stages — Create stage
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const pipelinesIdx = segments.indexOf('pipelines')
    const pipelineId = segments[pipelinesIdx + 1]

    if (!pipelineId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing pipeline ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createPipelineStageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid stage data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify pipeline exists
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .select('id')
      .eq('id', pipelineId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (pipelineError || !pipeline) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Pipeline not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert({
        company_id: ctx.companyId!,
        pipeline_id: pipelineId,
        name: input.name,
        stage_type: input.stage_type,
        sequence_order: input.sequence_order,
        probability_default: input.probability_default,
        color: input.color ?? null,
        is_active: input.is_active,
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'crm_pipelines_stage.create' }
)
