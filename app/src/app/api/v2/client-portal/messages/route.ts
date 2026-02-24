/**
 * Client Messages API — List & Create
 *
 * GET  /api/v2/client-portal/messages — List messages
 * POST /api/v2/client-portal/messages — Create message
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  listClientMessagesSchema,
  createClientMessageSchema,
} from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/client-portal/messages
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = listClientMessagesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      job_id: url.searchParams.get('job_id') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      sender_type: url.searchParams.get('sender_type') ?? undefined,
      q: url.searchParams.get('q') ?? undefined,
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

    let query = (supabase as any)
      .from('client_messages')
      .select('*', { count: 'exact' })
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.job_id) {
      query = query.eq('job_id', filters.job_id)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.sender_type) {
      query = query.eq('sender_type', filters.sender_type)
    }
    if (filters.q) {
      query = query.or(`subject.ilike.%${filters.q}%,message_text.ilike.%${filters.q}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/client-portal/messages
// ============================================================================

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = createClientMessageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid message data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('client_messages')
      .insert({
        company_id: ctx.companyId!,
        job_id: input.job_id,
        sender_user_id: ctx.user!.id,
        sender_type: input.sender_type,
        subject: input.subject ?? null,
        message_text: input.message_text,
        thread_id: input.thread_id ?? null,
        topic: input.topic ?? null,
        category: input.category,
        attachments: input.attachments,
        is_external_log: input.is_external_log,
        external_channel: input.external_channel ?? null,
        status: 'sent',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
