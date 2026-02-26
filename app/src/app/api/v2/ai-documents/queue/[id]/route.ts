/**
 * Queue Item by ID — Get & Update
 *
 * GET /api/v2/ai-documents/queue/:id — Get queue item details
 * PUT /api/v2/ai-documents/queue/:id — Update queue item (status)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateQueueItemSchema } from '@/lib/validation/schemas/ai-document-processing'

// ============================================================================
// GET /api/v2/ai-documents/queue/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    // URL: /api/v2/ai-documents/queue/[id]
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing queue item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Queue item not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// PUT /api/v2/ai-documents/queue/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing queue item ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateQueueItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify queue item exists
    const { data: existing, error: existError } = await supabase
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

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.status !== undefined) updates.status = input.status
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.error_message !== undefined) updates.error_message = input.error_message
    if (input.started_at !== undefined) updates.started_at = input.started_at
    if (input.completed_at !== undefined) updates.completed_at = input.completed_at

    const { data, error } = await supabase
      .from('document_processing_queue')
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
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'ai_documents_queue.update' }
)
