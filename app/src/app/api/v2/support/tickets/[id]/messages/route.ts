/**
 * Ticket Messages API — List & Create
 *
 * GET  /api/v2/support/tickets/:id/messages — List messages for a ticket
 * POST /api/v2/support/tickets/:id/messages — Add message to a ticket
 */

import { type NextRequest, NextResponse } from 'next/server'

import {
  createApiHandler,
  getPaginationParams,
  paginatedResponse,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { listTicketMessagesSchema, createTicketMessageSchema } from '@/lib/validation/schemas/customer-support'

// ============================================================================
// GET /api/v2/support/tickets/:id/messages
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const ticketId = segments[segments.indexOf('tickets') + 1]
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const url = req.nextUrl
    const parseResult = listTicketMessagesSchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      sender_type: url.searchParams.get('sender_type') ?? undefined,
      is_internal: url.searchParams.get('is_internal') ?? undefined,
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

    // Verify ticket ownership
    const { data: ticket } = await (supabase as any)
      .from('support_tickets')
      .select('id')
      .eq('id', ticketId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!ticket) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Ticket not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    let query = (supabase as any)
      .from('ticket_messages')
      .select('*', { count: 'exact' })
      .eq('ticket_id', ticketId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (filters.sender_type) {
      query = query.eq('sender_type', filters.sender_type)
    }
    if (filters.is_internal !== undefined) {
      query = query.eq('is_internal', filters.is_internal)
    }

    query = query.order('created_at', { ascending: true })

    const { data, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json(paginatedResponse(data ?? [], count ?? 0, page, limit, ctx.requestId))
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// POST /api/v2/support/tickets/:id/messages — Add message
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const ticketId = segments[segments.indexOf('tickets') + 1]
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = createTicketMessageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid message data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify ticket ownership
    const { data: ticket } = await (supabase as any)
      .from('support_tickets')
      .select('id, first_response_at')
      .eq('id', ticketId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!ticket) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Ticket not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('ticket_messages')
      .insert({
        company_id: ctx.companyId!,
        ticket_id: ticketId,
        sender_type: input.sender_type,
        sender_id: ctx.user!.id,
        message_text: input.message_text,
        attachments: input.attachments,
        is_internal: input.is_internal,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Set first_response_at on ticket if this is the first agent response
    if (input.sender_type === 'agent' && !ticket.first_response_at) {
      await (supabase as any)
        .from('support_tickets')
        .update({ first_response_at: new Date().toISOString() })
        .eq('id', ticketId)
        .eq('company_id', ctx.companyId!)
    }

    return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api' }
)
