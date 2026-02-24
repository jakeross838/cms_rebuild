/**
 * Inspection by ID — Get, Update
 *
 * GET /api/v2/permits/:id/inspections/:inspectionId — Get inspection details
 * PUT /api/v2/permits/:id/inspections/:inspectionId — Update inspection
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateInspectionSchema } from '@/lib/validation/schemas/permitting'

// ============================================================================
// GET /api/v2/permits/:id/inspections/:inspectionId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const inspectionId = segments[segments.length - 1]

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('permit_inspections')
      .select('*')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch results
    const { data: results } = await (supabase as any)
      .from('inspection_results')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('recorded_at', { ascending: false })

    return NextResponse.json({
      data: {
        ...data,
        results: results ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/permits/:id/inspections/:inspectionId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const inspectionId = segments[segments.length - 1]

    const body = await req.json()
    const parseResult = updateInspectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify inspection exists
    const { data: existing, error: existError } = await (supabase as any)
      .from('permit_inspections')
      .select('id')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.inspection_type !== undefined) updates.inspection_type = input.inspection_type
    if (input.status !== undefined) updates.status = input.status
    if (input.scheduled_date !== undefined) updates.scheduled_date = input.scheduled_date
    if (input.scheduled_time !== undefined) updates.scheduled_time = input.scheduled_time
    if (input.inspector_name !== undefined) updates.inspector_name = input.inspector_name
    if (input.inspector_phone !== undefined) updates.inspector_phone = input.inspector_phone
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.completed_at !== undefined) updates.completed_at = input.completed_at

    const { data, error } = await (supabase as any)
      .from('permit_inspections')
      .update(updates)
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
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
