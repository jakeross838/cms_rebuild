/**
 * Ticket Message by ID — Get, Update, Delete
 *
 * GET    /api/v2/support/tickets/:id/messages/:messageId — Get message
 * PUT    /api/v2/support/tickets/:id/messages/:messageId — Update message
 * DELETE /api/v2/support/tickets/:id/messages/:messageId — Delete message
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTicketMessageSchema } from '@/lib/validation/schemas/customer-support'

function extractIds(pathname: string) {
  const segments = pathname.split('/')
  const ticketsIdx = segments.indexOf('tickets')
  const messagesIdx = segments.indexOf('messages')
  return {
    ticketId: ticketsIdx >= 0 && segments.length > ticketsIdx + 1 ? segments[ticketsIdx + 1] : null,
    messageId: messagesIdx >= 0 && segments.length > messagesIdx + 1 ? segments[messagesIdx + 1] : null,
  }
}

// ============================================================================
// GET /api/v2/support/tickets/:id/messages/:messageId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { ticketId, messageId } = extractIds(req.nextUrl.pathname)
    if (!ticketId || !messageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket or message ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('id', messageId)
      .eq('ticket_id', ticketId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Message not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/support/tickets/:id/messages/:messageId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { ticketId, messageId } = extractIds(req.nextUrl.pathname)
    if (!ticketId || !messageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket or message ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateTicketMessageSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.message_text !== undefined) updates.message_text = input.message_text
    if (input.attachments !== undefined) updates.attachments = input.attachments
    if (input.is_internal !== undefined) updates.is_internal = input.is_internal

    const { data, error } = await supabase
      .from('ticket_messages')
      .update(updates)
      .eq('id', messageId)
      .eq('ticket_id', ticketId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }
    if (!data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Message not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'support_tickets_message.update' }
)

// ============================================================================
// DELETE /api/v2/support/tickets/:id/messages/:messageId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const { ticketId, messageId } = extractIds(req.nextUrl.pathname)
    if (!ticketId || !messageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket or message ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('ticket_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('ticket_id', ticketId)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'], auditAction: 'support_tickets_message.archive' }
)
