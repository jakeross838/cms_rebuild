/**
 * Cancel Queue Item
 *
 * POST /api/v2/ai-documents/queue/:id/cancel — Cancel a queued item
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// POST /api/v2/ai-documents/queue/:id/cancel
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/ai-documents/queue/[id]/cancel
    const id = segments[segments.length - 2]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing queue item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify queue item exists and is cancellable
    const { data: existing, error: existError } = await (supabase as any)
      .from('document_processing_queue')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Queue item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Only queued or processing items can be cancelled
    if (existing.status !== 'queued' && existing.status !== 'processing') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Only queued or processing items can be cancelled', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('document_processing_queue')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
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
