/**
 * Onboarding Reminder API — GET, PUT single
 *
 * GET /api/v2/onboarding/:id/reminders/:reminderId — Get reminder
 * PUT /api/v2/onboarding/:id/reminders/:reminderId — Update reminder
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateReminderSchema } from '@/lib/validation/schemas/onboarding'

// ============================================================================
// GET /api/v2/onboarding/:id/reminders/:reminderId
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const reminderId = urlParts[urlParts.length - 1]

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_reminders')
      .select('*')
      .eq('id', reminderId)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Reminder not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)

// ============================================================================
// PUT /api/v2/onboarding/:id/reminders/:reminderId
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const urlParts = req.nextUrl.pathname.split('/')
    const reminderId = urlParts[urlParts.length - 1]

    const body = await req.json()
    const parseResult = updateReminderSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid reminder data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    const updateFields: Record<string, unknown> = {}
    if (input.reminder_type !== undefined) updateFields.reminder_type = input.reminder_type
    if (input.subject !== undefined) updateFields.subject = input.subject
    if (input.message !== undefined) updateFields.message = input.message
    if (input.scheduled_at !== undefined) updateFields.scheduled_at = input.scheduled_at
    if (input.status !== undefined) updateFields.status = input.status

    // Auto-set sent_at when status transitions to sent
    if (input.status === 'sent') {
      updateFields.sent_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('onboarding_reminders')
      .update(updateFields)
      .eq('id', reminderId)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Reminder not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'] }
)
