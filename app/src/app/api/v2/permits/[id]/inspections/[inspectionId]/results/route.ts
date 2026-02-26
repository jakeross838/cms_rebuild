/**
 * Inspection Results API — List & Create
 *
 * GET  /api/v2/permits/:id/inspections/:inspectionId/results — List results
 * POST /api/v2/permits/:id/inspections/:inspectionId/results — Record result
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createLogger } from '@/lib/monitoring'
import { createClient } from '@/lib/supabase/server'
import { listInspectionResultsSchema, createInspectionResultSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/inspections/:inspectionId/results
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const inspectionId = segments[segments.indexOf('inspections') + 1]

    const url = req.nextUrl
    const parseResult = listInspectionResultsSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    // Verify inspection ownership
    const { error: inspError } = await supabase
      .from('permit_inspections')
      .select('id')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (inspError) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, count, error } = await supabase
      .from('inspection_results')
      .select('*', { count: 'exact' })
      .eq('inspection_id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1)

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
// POST /api/v2/permits/:id/inspections/:inspectionId/results
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const inspectionId = segments[segments.indexOf('inspections') + 1]

    const body = await req.json()
    const parseResult = createInspectionResultSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid result data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify inspection ownership
    const { data: inspection, error: inspError } = await supabase
      .from('permit_inspections')
      .select('id, status')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (inspError || !inspection) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('inspection_results')
      .insert({
        company_id: ctx.companyId!,
        inspection_id: inspectionId,
        result: input.result,
        result_notes: input.result_notes ?? null,
        deficiencies: input.deficiencies,
        conditions_to_satisfy: input.conditions_to_satisfy ?? null,
        inspector_comments: input.inspector_comments ?? null,
        photos: input.photos,
        is_first_time_pass: input.is_first_time_pass ?? null,
        responsible_vendor_id: input.responsible_vendor_id ?? null,
        recorded_by: ctx.user!.id,
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

    // Auto-update inspection status based on result
    const statusMap: Record<string, string> = {
      pass: 'passed',
      fail: 'failed',
      conditional: 'conditional',
    }
    const newStatus = statusMap[input.result]
    if (newStatus) {
      const logger = createLogger({ service: 'permits' })
      const { error: statusError } = await supabase
        .from('permit_inspections')
        .update({
          status: newStatus,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', inspectionId)
        .eq('company_id', ctx.companyId!)
      if (statusError) {
        logger.error('Failed to update inspection status', { inspectionId, error: statusError.message })
      }
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'permits_inspections_result.create' }
)
