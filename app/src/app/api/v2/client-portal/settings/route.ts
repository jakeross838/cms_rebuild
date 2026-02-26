/**
 * Client Portal Settings API — GET & PUT
 *
 * GET  /api/v2/client-portal/settings — Get portal settings for current company
 * PUT  /api/v2/client-portal/settings — Update portal settings
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  mapDbError,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateClientPortalSettingsSchema } from '@/lib/validation/schemas/client-portal'

// ============================================================================
// GET /api/v2/client-portal/settings
// ============================================================================

export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('client_portal_settings')
      .select('*')
      .eq('company_id', ctx.companyId!)
      .maybeSingle()

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    return NextResponse.json({ data: data ?? null, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/client-portal/settings
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updateClientPortalSettingsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid settings data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Upsert: create if not exists, update if exists
    const { data, error } = await supabase
      .from('client_portal_settings')
      .upsert({
        company_id: ctx.companyId!,
        ...input,
      }, { onConflict: 'company_id' })
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
