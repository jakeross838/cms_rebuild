/**
 * Complete Safety Inspection
 *
 * POST /api/v2/safety/inspections/:id/complete — Mark inspection as completed
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { completeInspectionSchema } from '@/lib/validation/schemas/safety'

/**
 * Extract inspection ID from path like /api/v2/safety/inspections/:id/complete
 */
function extractInspectionId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('inspections')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// POST /api/v2/safety/inspections/:id/complete
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const inspectionId = extractInspectionId(req.nextUrl.pathname)
    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing inspection ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = completeInspectionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid completion data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify inspection exists and is in_progress or scheduled
    const { data: existing, error: existError } = await (supabase as any)
      .from('safety_inspections')
      .select('id, status')
      .eq('id', inspectionId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Inspection not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'scheduled' && existing.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only scheduled or in-progress inspections can be completed', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const updates: Record<string, unknown> = {
      status: input.result === 'fail' ? 'failed' : 'completed',
      result: input.result,
      completed_at: new Date().toISOString(),
      completed_by: ctx.user!.id,
      updated_at: new Date().toISOString(),
    }
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.score !== undefined) updates.score = input.score

    const { data, error } = await (supabase as any)
      .from('safety_inspections')
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
