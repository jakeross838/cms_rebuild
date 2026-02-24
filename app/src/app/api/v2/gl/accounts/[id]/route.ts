/**
 * GL Account by ID — Get & Update
 *
 * GET /api/v2/gl/accounts/:id — Get account details
 * PUT /api/v2/gl/accounts/:id — Update account
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { updateGlAccountSchema } from '@/lib/validation/schemas/accounting'

// ============================================================================
// GET /api/v2/gl/accounts/:id
// ============================================================================

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing account ID', requestId: ctx.requestId }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('gl_accounts')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Not Found', message: 'GL account not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)

// ============================================================================
// PUT /api/v2/gl/accounts/:id
// ============================================================================

export const PUT = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', message: 'Missing account ID', requestId: ctx.requestId }, { status: 400 })
    }

    const body = await req.json()
    const parseResult = updateGlAccountSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid update data', errors: parseResult.error.flatten().fieldErrors, requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const input = parseResult.data
    const supabase = await createClient()

    // Check if account is a system account — system accounts have restricted updates
    const { data: existing } = await (supabase as any)
      .from('gl_accounts')
      .select('is_system')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'GL account not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    // System accounts: only name, description, and is_active can be changed
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.name !== undefined) updates.name = input.name
    if (input.description !== undefined) updates.description = input.description
    if (input.is_active !== undefined) updates.is_active = input.is_active

    if (!existing.is_system) {
      if (input.account_number !== undefined) updates.account_number = input.account_number
      if (input.account_type !== undefined) updates.account_type = input.account_type
      if (input.sub_type !== undefined) updates.sub_type = input.sub_type
      if (input.parent_account_id !== undefined) updates.parent_account_id = input.parent_account_id
      if (input.normal_balance !== undefined) updates.normal_balance = input.normal_balance
    }

    const { data, error } = await (supabase as any)
      .from('gl_accounts')
      .update(updates)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'An account with this number already exists', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api' }
)
