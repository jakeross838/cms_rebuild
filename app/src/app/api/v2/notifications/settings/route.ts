/**
 * Notification Settings API (quiet hours, digest)
 *
 * GET /api/v2/notifications/settings — Get user's notification settings
 * PUT /api/v2/notifications/settings — Update user's notification settings
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateSettingsSchema } from '@/lib/validation/schemas/notifications'

interface SettingsRow {
  id: string
  quiet_start: string | null
  quiet_end: string | null
  timezone: string
  digest_mode: boolean
  digest_frequency: string
  digest_time: string
  critical_bypass_quiet: boolean
}

export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('id, quiet_start, quiet_end, timezone, digest_mode, digest_frequency, digest_time, critical_bypass_quiet')
      .eq('user_id', ctx.user!.id)
      .eq('company_id', ctx.companyId!)
      .single() as unknown as { data: SettingsRow | null; error: { message: string; code?: string } | null }

    if (error && error.code !== 'PGRST116') {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    // Return defaults if no settings exist yet
    const settings = data ?? {
      quiet_start: null,
      quiet_end: null,
      timezone: 'America/New_York',
      digest_mode: false,
      digest_frequency: 'daily',
      digest_time: '08:00',
      critical_bypass_quiet: true,
    }

    return NextResponse.json({ data: settings, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updateSettingsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid settings', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('user_notification_settings')
      .upsert(
        {
          user_id: ctx.user!.id,
          company_id: ctx.companyId!,
          ...parseResult.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,company_id' }
      )

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
