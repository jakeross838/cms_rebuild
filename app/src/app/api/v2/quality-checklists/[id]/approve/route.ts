/**
 * Approve Quality Checklist — completed -> approved
 *
 * POST /api/v2/quality-checklists/:id/approve
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { approveChecklistSchema } from '@/lib/validation/schemas/punch-list'

// ============================================================================
// POST /api/v2/quality-checklists/:id/approve
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 2] // /quality-checklists/:id/approve
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing checklist ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = approveChecklistSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid approval data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify checklist exists and is completed
    const { data: existing, error: existError } = await supabase
      .from('quality_checklists')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Checklist not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.status !== 'completed') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only completed checklists can be approved', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('quality_checklists')
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
