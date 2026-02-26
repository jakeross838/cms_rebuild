/**
 * Mobile App Settings API — Get & Update
 *
 * GET /api/v2/mobile/settings — Get current user's mobile settings
 * PUT /api/v2/mobile/settings — Update current user's mobile settings (upsert)
 */

import { NextResponse } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateMobileSettingsSchema } from '@/lib/validation/schemas/mobile-app'

// ============================================================================
// GET /api/v2/mobile/settings
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('mobile_app_settings')
      .select('*')
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .single()

    if (error) {
      // No settings yet — return defaults
      return NextResponse.json({
        data: {
          user_id: ctx.user!.id,
          company_id: ctx.companyId!,
          data_saver_mode: false,
          auto_sync: true,
          sync_on_wifi_only: false,
          photo_quality: 'high',
          location_tracking: false,
          gps_accuracy: 'balanced',
          biometric_enabled: false,
          quiet_hours_start: null,
          quiet_hours_end: null,
          push_notifications: true,
          offline_storage_limit_mb: 500,
          theme: 'system',
          preferences: {},
        },
        requestId: ctx.requestId,
      })
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/mobile/settings — Upsert settings
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updateMobileSettingsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid settings data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check if settings exist
    const { data: existing } = await supabase
      .from('mobile_app_settings')
      .select('id')
      .eq('company_id', ctx.companyId!)
      .eq('user_id', ctx.user!.id)
      .single()

    if (existing) {
      // Update existing
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.data_saver_mode !== undefined) updates.data_saver_mode = input.data_saver_mode
      if (input.auto_sync !== undefined) updates.auto_sync = input.auto_sync
      if (input.sync_on_wifi_only !== undefined) updates.sync_on_wifi_only = input.sync_on_wifi_only
      if (input.photo_quality !== undefined) updates.photo_quality = input.photo_quality
      if (input.location_tracking !== undefined) updates.location_tracking = input.location_tracking
      if (input.gps_accuracy !== undefined) updates.gps_accuracy = input.gps_accuracy
      if (input.biometric_enabled !== undefined) updates.biometric_enabled = input.biometric_enabled
      if (input.quiet_hours_start !== undefined) updates.quiet_hours_start = input.quiet_hours_start
      if (input.quiet_hours_end !== undefined) updates.quiet_hours_end = input.quiet_hours_end
      if (input.push_notifications !== undefined) updates.push_notifications = input.push_notifications
      if (input.offline_storage_limit_mb !== undefined) updates.offline_storage_limit_mb = input.offline_storage_limit_mb
      if (input.theme !== undefined) updates.theme = input.theme
      if (input.preferences !== undefined) updates.preferences = input.preferences

      const { data, error } = await supabase
        .from('mobile_app_settings')
        .update(updates)
        .eq('company_id', ctx.companyId!)
        .eq('user_id', ctx.user!.id)
        .select('*')
        .single()

      if (error) {
        const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
      }

      return NextResponse.json({ data, requestId: ctx.requestId })
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('mobile_app_settings')
        .insert({
          company_id: ctx.companyId!,
          user_id: ctx.user!.id,
          data_saver_mode: input.data_saver_mode ?? false,
          auto_sync: input.auto_sync ?? true,
          sync_on_wifi_only: input.sync_on_wifi_only ?? false,
          photo_quality: input.photo_quality ?? 'high',
          location_tracking: input.location_tracking ?? false,
          gps_accuracy: input.gps_accuracy ?? 'balanced',
          biometric_enabled: input.biometric_enabled ?? false,
          quiet_hours_start: input.quiet_hours_start ?? null,
          quiet_hours_end: input.quiet_hours_end ?? null,
          push_notifications: input.push_notifications ?? true,
          offline_storage_limit_mb: input.offline_storage_limit_mb ?? 500,
          theme: input.theme ?? 'system',
          preferences: input.preferences ?? {},
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

      return NextResponse.json({ data, requestId: ctx.requestId })
    }
  },
  { requireAuth: true, rateLimit: 'api' }
)
