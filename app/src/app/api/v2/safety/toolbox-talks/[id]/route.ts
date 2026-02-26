/**
 * Toolbox Talk by ID — Get, Update
 *
 * GET /api/v2/safety/toolbox-talks/:id — Get talk details with attendees
 * PUT /api/v2/safety/toolbox-talks/:id — Update toolbox talk
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateToolboxTalkSchema } from '@/lib/validation/schemas/safety'

// ============================================================================
// GET /api/v2/safety/toolbox-talks/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing toolbox talk ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('toolbox_talks')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Toolbox talk not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Fetch attendees
    const { data: attendees } = await supabase
      .from('toolbox_talk_attendees')
      .select('*')
      .eq('talk_id', id)
      .eq('company_id', ctx.companyId!)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      data: {
        ...data,
        attendees_count: (attendees ?? []).length,
        attendees: attendees ?? [],
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)

// ============================================================================
// PUT /api/v2/safety/toolbox-talks/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing toolbox talk ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateToolboxTalkSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify talk exists
    const { data: existing, error: existError } = await supabase
      .from('toolbox_talks')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Toolbox talk not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.title !== undefined) updates.title = input.title
    if (input.topic !== undefined) updates.topic = input.topic
    if (input.description !== undefined) updates.description = input.description
    if (input.talk_date !== undefined) updates.talk_date = input.talk_date
    if (input.talk_time !== undefined) updates.talk_time = input.talk_time
    if (input.duration_minutes !== undefined) updates.duration_minutes = input.duration_minutes
    if (input.status !== undefined) updates.status = input.status
    if (input.presenter_id !== undefined) updates.presenter_id = input.presenter_id
    if (input.location !== undefined) updates.location = input.location
    if (input.materials !== undefined) updates.materials = input.materials
    if (input.notes !== undefined) updates.notes = input.notes

    const { data, error } = await supabase
      .from('toolbox_talks')
      .update(updates)
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent'] }
)
