/**
 * Inspection Result by ID — Get, Update
 *
 * GET /api/v2/permits/:id/inspections/:inspectionId/results/:resultId
 * PUT /api/v2/permits/:id/inspections/:inspectionId/results/:resultId
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateInspectionResultSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/inspections/:inspectionId/results/:resultId
// ============================================================================

function extractIds(pathname: string) {
  const segments = pathname.split('/')
  const inspectionsIdx = segments.indexOf('inspections')
  const resultsIdx = segments.indexOf('results')
  return {
    inspectionId: inspectionsIdx >= 0 && segments.length > inspectionsIdx + 1 ? segments[inspectionsIdx + 1] : null,
    resultId: resultsIdx >= 0 && segments.length > resultsIdx + 1 ? segments[resultsIdx + 1] : null,
  }
}

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { inspectionId, resultId } = extractIds(req.nextUrl.pathname)

    if (!inspectionId || !resultId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection or result ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('inspection_results')
      .select('*')
      .eq('id', resultId)
      .eq('inspection_id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection result not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/permits/:id/inspections/:inspectionId/results/:resultId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { inspectionId, resultId } = extractIds(req.nextUrl.pathname)

    if (!inspectionId || !resultId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection or result ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateInspectionResultSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify result exists and belongs to specified inspection
    const { data: existing, error: existError } = await supabase
      .from('inspection_results')
      .select('id')
      .eq('id', resultId)
      .eq('inspection_id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection result not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.result !== undefined) updates.result = input.result
    if (input.result_notes !== undefined) updates.result_notes = input.result_notes
    if (input.deficiencies !== undefined) updates.deficiencies = input.deficiencies
    if (input.conditions_to_satisfy !== undefined) updates.conditions_to_satisfy = input.conditions_to_satisfy
    if (input.inspector_comments !== undefined) updates.inspector_comments = input.inspector_comments
    if (input.photos !== undefined) updates.photos = input.photos
    if (input.is_first_time_pass !== undefined) updates.is_first_time_pass = input.is_first_time_pass
    if (input.responsible_vendor_id !== undefined) updates.responsible_vendor_id = input.responsible_vendor_id

    const { data, error } = await supabase
      .from('inspection_results')
      .update(updates)
      .eq('id', resultId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'permits_inspections_result.update' }
)
