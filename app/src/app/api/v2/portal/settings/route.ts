/**
 * Portal Settings API — Get & Update per job
 *
 * GET /api/v2/portal/settings?job_id=... — Get portal settings for a job
 * PUT /api/v2/portal/settings              — Update portal settings for a job
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { mapDbError } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import {
  getPortalSettingsSchema,
  updatePortalSettingsSchema,
} from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/portal/settings
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const url = req.nextUrl
    const parseResult = getPortalSettingsSchema.safeParse({
      job_id: url.searchParams.get('job_id') ?? undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid query parameters', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const { job_id } = parseResult.data
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('portal_settings')
      .select('*')
      .eq('company_id', ctx.companyId!)
      .eq('job_id', job_id)
      .single()

    if (error) {
      // If no settings exist yet, return defaults
      return NextResponse.json({
        data: {
          id: null,
          company_id: ctx.companyId,
          job_id,
          is_enabled: false,
          branding_logo_url: null,
          branding_primary_color: '#1a1a2e',
          welcome_message: null,
          show_budget: false,
          show_schedule: true,
          show_documents: true,
          show_photos: true,
          show_daily_logs: false,
          created_at: null,
          updated_at: null,
        },
        requestId: ctx.requestId,
      })
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/portal/settings
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updatePortalSettingsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid settings data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Build upsert payload
    const payload: Record<string, unknown> = {
      company_id: ctx.companyId!,
      job_id: input.job_id,
      updated_at: new Date().toISOString(),
    }

    if (input.is_enabled !== undefined) payload.is_enabled = input.is_enabled
    if (input.branding_logo_url !== undefined) payload.branding_logo_url = input.branding_logo_url
    if (input.branding_primary_color !== undefined) payload.branding_primary_color = input.branding_primary_color
    if (input.welcome_message !== undefined) payload.welcome_message = input.welcome_message
    if (input.show_budget !== undefined) payload.show_budget = input.show_budget
    if (input.show_schedule !== undefined) payload.show_schedule = input.show_schedule
    if (input.show_documents !== undefined) payload.show_documents = input.show_documents
    if (input.show_photos !== undefined) payload.show_photos = input.show_photos
    if (input.show_daily_logs !== undefined) payload.show_daily_logs = input.show_daily_logs

    const { data, error } = await (supabase as any)
      .from('portal_settings')
      .upsert(payload, { onConflict: 'company_id,job_id' })
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
  },
  { requireAuth: true, rateLimit: 'api' }
)
