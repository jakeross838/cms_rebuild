/**
 * Notification Preferences API
 *
 * GET /api/v2/notifications/preferences — Get user's channel preferences
 * PUT /api/v2/notifications/preferences — Update user's channel preferences
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updatePreferencesSchema } from '@/lib/validation/schemas/notifications'

interface PreferenceRow {
  id: string
  category: string
  channel: string
  enabled: boolean
}

export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('id, category, channel, enabled')
      .eq('user_id', ctx.user!.id)
      .eq('company_id', ctx.companyId!) as unknown as { data: PreferenceRow[] | null; error: { message: string } | null }

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updatePreferencesSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid preferences', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const records = parseResult.data.preferences.map((pref) => ({
      user_id: ctx.user!.id,
      company_id: ctx.companyId!,
      category: pref.category,
      channel: pref.channel,
      enabled: pref.enabled,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await (supabase as any)
      .from('user_notification_preferences')
      .upsert(records, { onConflict: 'user_id,company_id,category,channel' })

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
