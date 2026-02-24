/**
 * Ticket Message by ID — Get, Update, Delete
 *
 * GET    /api/v2/support/tickets/:id/messages/:messageId — Get message
 * PUT    /api/v2/support/tickets/:id/messages/:messageId — Update message
 * DELETE /api/v2/support/tickets/:id/messages/:messageId — Delete message
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTicketMessageSchema } from '@/lib/validation/schemas/customer-support'

// ============================================================================
// GET /api/v2/support/tickets/:id/messages/:messageId
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const messageId = segments[segments.length - 1]
    if (!messageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing message ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('ticket_messages') as any)
      .select('*')
      .eq('id', messageId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Message not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/support/tickets/:id/messages/:messageId
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const messageId = segments[segments.length - 1]
    if (!messageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing message ID', requestId: ctx.requestId },
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

    const { data, error } = await (supabase
      .from('ticket_messages') as any)
      .update(updates)
      .eq('id', messageId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Message not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// DELETE /api/v2/support/tickets/:id/messages/:messageId
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const messageId = segments[segments.length - 1]
    if (!messageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing message ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing } = await (supabase
      .from('ticket_messages') as any)
      .select('id')
      .eq('id', messageId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Message not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await (supabase
      .from('ticket_messages') as any)
      .delete()
      .eq('id', messageId)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
