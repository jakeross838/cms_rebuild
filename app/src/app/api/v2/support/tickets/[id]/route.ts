/**
 * Support Ticket by ID — Get, Update, Delete
 *
 * GET    /api/v2/support/tickets/:id — Get ticket
 * PUT    /api/v2/support/tickets/:id — Update ticket
 * DELETE /api/v2/support/tickets/:id — Soft delete ticket
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateTicketSchema } from '@/lib/validation/schemas/customer-support'

// ============================================================================
// GET /api/v2/support/tickets/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Ticket not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Get messages count
    const { count: messages_count } = await supabase
      .from('ticket_messages')
      .select('id', { count: 'exact', head: true })
      .eq('ticket_id', id)
      .eq('company_id', ctx.companyId!)

    return NextResponse.json({
      data: { ...data, messages_count: messages_count ?? 0 },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// PUT /api/v2/support/tickets/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = updateTicketSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Verify existence
    const { data: existing, error: existError } = await supabase
      .from('support_tickets')
      .select('id, status')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (existError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Ticket not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // Closed tickets cannot be updated
    if (existing.status === 'closed') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Closed tickets cannot be updated', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.subject !== undefined) updates.subject = input.subject
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) {
      updates.status = input.status
      if (input.status === 'resolved') updates.resolved_at = new Date().toISOString()
      if (input.status === 'closed') updates.closed_at = new Date().toISOString()
    }
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.category !== undefined) updates.category = input.category
    if (input.channel !== undefined) updates.channel = input.channel
    if (input.assigned_agent_id !== undefined) updates.assigned_agent_id = input.assigned_agent_id
    if (input.tags !== undefined) updates.tags = input.tags
    if (input.satisfaction_rating !== undefined) updates.satisfaction_rating = input.satisfaction_rating

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      const mapped = mapDbError(error ?? { code: 'PGRST116' })
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)

// ============================================================================
// DELETE /api/v2/support/tickets/:id — Soft delete
// ============================================================================

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing ticket ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Ticket not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('support_tickets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm', 'superintendent', 'office', 'field'] }
)
