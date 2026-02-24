/**
 * Clock Out API
 *
 * POST /api/v2/time-entries/clock-out — Stop a timer (clock out)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { clockOutSchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// POST /api/v2/time-entries/clock-out
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = clockOutSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid clock-out data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()
    const now = new Date()

    // Fetch the open time entry
    const { data: entry, error: fetchError } = await (supabase as any)
      .from('time_entries')
      .select('*')
      .eq('id', input.time_entry_id)
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !entry) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Time entry not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (entry.clock_out) {
      return NextResponse.json(
        { error: 'Conflict', message: 'This time entry is already clocked out', requestId: ctx.requestId },
        { status: 409 }
      )
    }

    if (!entry.clock_in) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No clock-in time found for this entry', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    // Calculate hours
    const clockIn = new Date(entry.clock_in)
    const diffMs = now.getTime() - clockIn.getTime()
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000))
    const breakMinutes = entry.break_minutes || 0
    const netMinutes = Math.max(0, totalMinutes - breakMinutes)
    const totalHours = parseFloat((netMinutes / 60).toFixed(2))

    // V1: all hours go to regular_hours. OT calculation deferred to approval.
    const regularHours = totalHours

    // Build notes
    const notes = [entry.notes, input.notes].filter(Boolean).join(' | ') || null

    const { data, error } = await (supabase as any)
      .from('time_entries')
      .update({
        clock_out: now.toISOString(),
        regular_hours: regularHours,
        gps_clock_out: input.gps ?? null,
        notes,
        updated_at: now.toISOString(),
      })
      .eq('id', input.time_entry_id)
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
