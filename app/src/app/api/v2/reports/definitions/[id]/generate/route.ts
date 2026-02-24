/**
 * Generate Report — Run a report definition and create a snapshot
 *
 * POST /api/v2/reports/definitions/:id/generate
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { generateReportSchema } from '@/lib/validation/schemas/financial-reporting'

// ============================================================================
// POST /api/v2/reports/definitions/:id/generate
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /definitions/:id/generate
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing report definition ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = generateReportSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid generation parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify the report definition exists and is active
    const { data: definition, error: defError } = await (supabase
      .from('report_definitions') as any)
      .select('id, report_type, config, is_active')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (defError || !definition) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Report definition not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (!definition.is_active) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Cannot generate from an inactive report definition', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    // Create a snapshot with placeholder data (V1 foundation — actual report
    // generation engine will be wired in later phases)
    const snapshotData = {
      report_type: definition.report_type,
      period_start: input.period_start,
      period_end: input.period_end,
      parameters: input.parameters ?? {},
      config: definition.config,
      generated_at: new Date().toISOString(),
      status: 'completed',
      data: {},
    }

    const { data: snapshot, error: snapError } = await (supabase
      .from('report_snapshots') as any)
      .insert({
        company_id: ctx.companyId!,
        report_definition_id: id,
        period_start: input.period_start,
        period_end: input.period_end,
        snapshot_data: snapshotData,
        generated_by: ctx.user!.id,
        generated_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (snapError) {
      return NextResponse.json(
        { error: 'Database Error', message: snapError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: snapshot, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
