/**
 * Clock In API
 *
 * POST /api/v2/time-entries/clock-in — Start a timer (clock in)
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { clockInSchema } from '@/lib/validation/schemas/time-tracking'

// ============================================================================
// POST /api/v2/time-entries/clock-in
// ============================================================================

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = clockInSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid clock-in data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()
    const userId = ctx.user!.id
    const now = new Date()

    // Check for existing open time entry (no clock_out)
    const { data: openEntry } = await supabase
      .from('time_entries')
      .select('id, job_id, clock_in')
      .eq('company_id', ctx.companyId!)
      .eq('user_id', userId)
      .is('clock_out', null)
      .is('deleted_at', null)
      .neq('status', 'rejected')
      .limit(1)
      .single()

    if (openEntry) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `You are already clocked in since ${openEntry.clock_in}. Clock out first.`,
          data: { open_entry_id: openEntry.id },
          requestId: ctx.requestId,
        },
        { status: 409 }
      )
    }

    // Create new clock-in entry
    const entryDate = now.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        company_id: ctx.companyId!,
        user_id: userId,
        job_id: input.job_id,
        cost_code_id: input.cost_code_id ?? null,
        entry_date: entryDate,
        clock_in: now.toISOString(),
        clock_out: null,
        regular_hours: 0,
        overtime_hours: 0,
        double_time_hours: 0,
        break_minutes: 0,
        notes: input.notes ?? null,
        gps_clock_in: input.gps ?? null,
        entry_method: 'mobile',
        status: 'pending',
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
  { requireAuth: true, rateLimit: 'api' }
)
