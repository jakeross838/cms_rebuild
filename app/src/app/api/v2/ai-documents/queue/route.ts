/**
 * Document Processing Queue API — List & Enqueue
 *
 * GET  /api/v2/ai-documents/queue — List queue items
 * POST /api/v2/ai-documents/queue — Enqueue a document for processing
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listQueueSchema, createQueueItemSchema } from '@/lib/validation/schemas/ai-document-processing'

// ============================================================================
// GET /api/v2/ai-documents/queue
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listQueueSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      priority: url.searchParams.get('priority') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const filters = parseResult.data
    const { page, limit, offset } = getPaginationParams(req)
    const supabase = await createClient()

    let query = supabase
      .from('document_processing_queue')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority !== undefined) {
      query = query.eq('priority', filters.priority)
    }

    query = query.order('priority', { ascending: true }).order('created_at', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

// ============================================================================
// POST /api/v2/ai-documents/queue — Enqueue a document
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createQueueItemSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid queue item data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('document_processing_queue')
      .insert({
        company_id: ctx.companyId!,
        document_id: input.document_id,
        status: 'queued',
        priority: input.priority,
        max_attempts: input.max_attempts,
        created_by: ctx.user!.id,
      })
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'heavy', requiredRoles: ['owner', 'admin', 'pm'], auditAction: 'ai_queue.create' }
)
