/**
 * Builder Email Config API — Get & Upsert
 *
 * GET /api/v2/branding/email — Get email config for company
 * PUT /api/v2/branding/email — Upsert email config
 */

import { NextResponse } from 'next/server'

import {
  createApiHandler,
  type ApiContext,
} from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateEmailConfigSchema } from '@/lib/validation/schemas/white-label'

// ============================================================================
// GET /api/v2/branding/email
// ============================================================================

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()

    const { data, error } = await (supabase
      .from('builder_email_config') as any)
      .select('*')
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { data: null, requestId: ctx.requestId }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/branding/email — Upsert email config
// ============================================================================

export const PUT = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = await req.json()
    const parseResult = updateEmailConfigSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid email config data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check for existing email config
    const { data: existing } = await (supabase
      .from('builder_email_config') as any)
      .select('id')
      .eq('company_id', ctx.companyId!)
      .single()

    if (existing) {
      // Update existing
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (input.from_name !== undefined) updates.from_name = input.from_name
      if (input.from_email !== undefined) updates.from_email = input.from_email
      if (input.reply_to_email !== undefined) updates.reply_to_email = input.reply_to_email
      if (input.email_header_html !== undefined) updates.email_header_html = input.email_header_html
      if (input.email_footer_html !== undefined) updates.email_footer_html = input.email_footer_html
      if (input.email_signature !== undefined) updates.email_signature = input.email_signature
      if (input.use_custom_smtp !== undefined) updates.use_custom_smtp = input.use_custom_smtp
      if (input.smtp_host !== undefined) updates.smtp_host = input.smtp_host
      if (input.smtp_port !== undefined) updates.smtp_port = input.smtp_port
      if (input.smtp_username !== undefined) updates.smtp_username = input.smtp_username
      if (input.smtp_encrypted_password !== undefined) updates.smtp_encrypted_password = input.smtp_encrypted_password

      const { data, error } = await (supabase
        .from('builder_email_config') as any)
        .update(updates)
        .eq('company_id', ctx.companyId!)
        .select('*')
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Database Error', message: error?.message ?? 'Failed to update email config', requestId: ctx.requestId },
          { status: 500 }
        )
      }

      return NextResponse.json({ data, requestId: ctx.requestId })
    } else {
      // Create new
      const { data, error } = await (supabase
        .from('builder_email_config') as any)
        .insert({
          company_id: ctx.companyId!,
          from_name: input.from_name ?? null,
          from_email: input.from_email ?? null,
          reply_to_email: input.reply_to_email ?? null,
          email_header_html: input.email_header_html ?? null,
          email_footer_html: input.email_footer_html ?? null,
          email_signature: input.email_signature ?? null,
          use_custom_smtp: input.use_custom_smtp ?? false,
          smtp_host: input.smtp_host ?? null,
          smtp_port: input.smtp_port ?? null,
          smtp_username: input.smtp_username ?? null,
          smtp_encrypted_password: input.smtp_encrypted_password ?? null,
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
