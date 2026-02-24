/**
 * Resolve Warranty Callback
 *
 * POST /api/v2/vendor-performance/callbacks/:id/resolve — Resolve a callback
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { resolveCallbackSchema } from '@/lib/validation/schemas/vendor-performance'

/**
 * Extract callback ID from /api/v2/vendor-performance/callbacks/:id/resolve
 */
function extractCallbackId(pathname: string): string | null {
  const segments = pathname.split('/')
  const callbacksIdx = segments.indexOf('callbacks')
  if (callbacksIdx === -1 || callbacksIdx + 1 >= segments.length) return null
  return segments[callbacksIdx + 1]
}

// ============================================================================
// POST /api/v2/vendor-performance/callbacks/:id/resolve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = extractCallbackId(req.nextUrl.pathname)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing callback ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const parseResult = resolveCallbackSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid resolve data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify callback exists and is not already resolved
    const { data: existing, error: existError } = await (supabase
      .from('vendor_warranty_callbacks') as any)
      .select('id, status, reported_date')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Warranty callback not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status === 'resolved') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Callback is already resolved', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const resolvedDate = input.resolved_date ?? new Date().toISOString().split('T')[0]

    // Calculate resolution days from reported_date to resolved_date
    let resolutionDays: number | null = null
    if (existing.reported_date) {
      const reported = new Date(existing.reported_date)
      const resolved = new Date(resolvedDate)
      resolutionDays = Math.max(0, Math.round((resolved.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24)))
    }

    const { data, error } = await (supabase
      .from('vendor_warranty_callbacks') as any)
      .update({
        status: 'resolved',
        resolved_date: resolvedDate,
        resolution_notes: input.resolution_notes ?? null,
        resolution_cost: input.resolution_cost ?? null,
        resolution_days: resolutionDays,
        resolved_by: ctx.user!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
