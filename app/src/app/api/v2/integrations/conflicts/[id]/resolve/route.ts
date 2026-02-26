/**
 * Resolve Sync Conflict
 *
 * POST /api/v2/integrations/conflicts/:id/resolve — Resolve a conflict
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { resolveConflictSchema } from '@/lib/validation/schemas/integrations'

// ============================================================================
// POST /api/v2/integrations/conflicts/:id/resolve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    // Extract conflict ID from path: /api/v2/integrations/conflicts/:id/resolve
    const segments = req.nextUrl.pathname.split('/')
    const resolveIdx = segments.indexOf('resolve')
    const id = resolveIdx > 0 ? segments[resolveIdx - 1] : null

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing conflict ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = resolveConflictSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid resolution data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify conflict exists and is still pending
    const { data: existing } = await supabase
      .from('sync_conflicts')
      .select('id, resolution')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Conflict not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.resolution !== 'pending') {
      return NextResponse.json(
        { error: 'Conflict', message: `This conflict has already been resolved as "${existing.resolution}"`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data: conflict, error: conflictError } = await supabase
      .from('sync_conflicts')
      .update({
        resolution: input.resolution,
        resolved_by: ctx.user!.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (conflictError) {
      const mapped = mapDbError(conflictError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: conflict, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
