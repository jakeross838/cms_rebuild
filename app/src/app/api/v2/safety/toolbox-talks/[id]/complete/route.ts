/**
 * Complete Toolbox Talk
 *
 * POST /api/v2/safety/toolbox-talks/:id/complete — Mark talk as completed
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { completeToolboxTalkSchema } from '@/lib/validation/schemas/safety'

/**
 * Extract talk ID from path like /api/v2/safety/toolbox-talks/:id/complete
 */
function extractTalkId(pathname: string): string | null {
  const segments = pathname.split('/')
  const idx = segments.indexOf('toolbox-talks')
  if (idx === -1 || idx + 1 >= segments.length) return null
  return segments[idx + 1]
}

// ============================================================================
// POST /api/v2/safety/toolbox-talks/:id/complete
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const talkId = extractTalkId(req.nextUrl.pathname)
    if (!talkId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing toolbox talk ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = completeToolboxTalkSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid completion data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify talk exists and is scheduled
    const { data: existing, error: existError } = await supabase
      .from('toolbox_talks')
      .select('id, status')
      .eq('id', talkId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Toolbox talk not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only scheduled talks can be completed', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const updates: Record<string, unknown> = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.duration_minutes !== undefined) updates.duration_minutes = input.duration_minutes

    const { data, error } = await supabase
      .from('toolbox_talks')
      .update(updates)
      .eq('id', talkId)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'], auditAction: 'safety_toolbox_talk.complete' }
)
