/**
 * Approve Time Entry
 *
 * POST /api/v2/time-entries/:id/approve — Approve a pending time entry
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { approveTimeEntrySchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// POST /api/v2/time-entries/:id/approve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /time-entries/:id/approve
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing time entry ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = approveTimeEntrySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify entry exists and is in pending status
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('time_entries')
      .select('status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Time entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Conflict', message: `Cannot approve a time entry with status "${existing.status}"`, requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    const { data, error } = await (supabase as any)
      .from('time_entries')
      .update({
        status: 'approved',
        approved_by: ctx.user!.id,
        approved_at: now,
        updated_at: now,
      })
      .eq('id', id)
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
  { requireAuth: true, rateLimit: 'api' }
)
