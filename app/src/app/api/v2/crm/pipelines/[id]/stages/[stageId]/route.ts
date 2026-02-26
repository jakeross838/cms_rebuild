/**
 * CRM Pipeline Stage by ID — Get, Update, Delete
 *
 * GET    /api/v2/crm/pipelines/:id/stages/:stageId — Get stage
 * PUT    /api/v2/crm/pipelines/:id/stages/:stageId — Update stage
 * DELETE /api/v2/crm/pipelines/:id/stages/:stageId — Deactivate stage
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePipelineStageSchema } from '@/lib/validation/schemas/crm'

// ============================================================================
// GET /api/v2/crm/pipelines/:id/stages/:stageId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const stageId = segments[segments.length - 1]

    if (!stageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing stage ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('id', stageId)
      .eq('company_id', ctx.companyId!)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/crm/pipelines/:id/stages/:stageId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const stageId = segments[segments.length - 1]

    if (!stageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing stage ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updatePipelineStageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.stage_type !== undefined) updates.stage_type = input.stage_type
    if (input.sequence_order !== undefined) updates.sequence_order = input.sequence_order
    if (input.probability_default !== undefined) updates.probability_default = input.probability_default
    if (input.color !== undefined) updates.color = input.color
    if (input.is_active !== undefined) updates.is_active = input.is_active

    const { data, error } = await supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', stageId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'crm_pipelines_stage.update' }
)

// ============================================================================
// DELETE /api/v2/crm/pipelines/:id/stages/:stageId — Deactivate
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const stageId = segments[segments.length - 1]

    if (!stageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing stage ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pipeline_stages')
      .update({ is_active: false })
      .eq('id', stageId)
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

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'crm_pipelines_stage.archive' }
)
