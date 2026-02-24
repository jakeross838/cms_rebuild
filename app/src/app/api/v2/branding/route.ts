/**
 * Builder Branding API — Get & Upsert
 *
 * GET /api/v2/branding — Get branding for company (returns defaults if none)
 * PUT /api/v2/branding — Upsert branding settings
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateBrandingSchema } from '@/lib/validation/schemas/white-label'

// ============================================================================
// GET /api/v2/branding
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('builder_branding') as any)
      .select('*')
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      // Return defaults when no branding record exists
      return NextResponse.json({
        data: {
          id: null,
          company_id: ctx.companyId,
          logo_url: null,
          logo_dark_url: null,
          favicon_url: null,
          primary_color: '#2563eb',
          secondary_color: '#1e40af',
          accent_color: '#f59e0b',
          font_family: 'Inter',
          header_style: 'light',
          login_background_url: null,
          login_message: null,
          powered_by_visible: true,
          custom_css: null,
          metadata: {},
        },
        requestId: ctx.requestId,
      })
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/branding — Upsert branding
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updateBrandingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid branding data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for existing branding record
    const { data: existing } = await (supabase
      .from('builder_branding') as any)
      .select('id')
      .eq('company_id', ctx.companyId!)
      .single()

    if (existing) {
      // Update existing
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.logo_url !== undefined) updates.logo_url = input.logo_url
      if (input.logo_dark_url !== undefined) updates.logo_dark_url = input.logo_dark_url
      if (input.favicon_url !== undefined) updates.favicon_url = input.favicon_url
      if (input.primary_color !== undefined) updates.primary_color = input.primary_color
      if (input.secondary_color !== undefined) updates.secondary_color = input.secondary_color
      if (input.accent_color !== undefined) updates.accent_color = input.accent_color
      if (input.font_family !== undefined) updates.font_family = input.font_family
      if (input.header_style !== undefined) updates.header_style = input.header_style
      if (input.login_background_url !== undefined) updates.login_background_url = input.login_background_url
      if (input.login_message !== undefined) updates.login_message = input.login_message
      if (input.powered_by_visible !== undefined) updates.powered_by_visible = input.powered_by_visible
      if (input.custom_css !== undefined) updates.custom_css = input.custom_css
      if (input.metadata !== undefined) updates.metadata = input.metadata

      const { data, error } = await (supabase
        .from('builder_branding') as any)
        .update(updates)
        .eq('company_id', ctx.companyId!)
        .select('*')
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Database Error', message: error?.message ?? 'Failed to update branding', requestId: ctx.requestId },
          { status: 500 }
        )
      }

      return NextResponse.json({ data, requestId: ctx.requestId })
    } else {
      // Create new
      const { data, error } = await (supabase
        .from('builder_branding') as any)
        .insert({
          company_id: ctx.companyId!,
          logo_url: input.logo_url ?? null,
          logo_dark_url: input.logo_dark_url ?? null,
          favicon_url: input.favicon_url ?? null,
          primary_color: input.primary_color ?? '#2563eb',
          secondary_color: input.secondary_color ?? '#1e40af',
          accent_color: input.accent_color ?? '#f59e0b',
          font_family: input.font_family ?? 'Inter',
          header_style: input.header_style ?? 'light',
          login_background_url: input.login_background_url ?? null,
          login_message: input.login_message ?? null,
          powered_by_visible: input.powered_by_visible ?? true,
          custom_css: input.custom_css ?? null,
          metadata: input.metadata ?? {},
        })
        .select('*')
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Database Error', message: error.message, requestId: ctx.requestId },
          { status: 500 }
        )
      }

      return NextResponse.json({ data, requestId: ctx.requestId }, { status: 201 })
    }
  },
  { requireAuth: true, rateLimit: 'api' }
)
