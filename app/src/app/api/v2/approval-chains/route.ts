/**
 * Approval Chain Templates — List & Create
 *
 * GET  /api/v2/approval-chains — List approval chain templates
 * POST /api/v2/approval-chains — Create a new approval chain template
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const url = req.nextUrl
    const chainType = url.searchParams.get('chain_type')
    const isActive = url.searchParams.get('is_active')

    const supabase = await createClient()

    let query = (supabase as any)
      .from('approval_chain_templates')
      .select('*, approval_chain_steps(*)')
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (chainType) query = query.eq('chain_type', chainType)
    if (isActive === 'true') query = query.eq('is_active', true)
    if (isActive === 'false') query = query.eq('is_active', false)

    const { data, error } = await query
    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data ?? [], requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

export const POST = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const body = await req.json()
    const { name, description, chain_type, is_default, steps } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'name is required', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // If marking as default, unset other defaults
    if (is_default) {
      await (supabase as any)
        .from('approval_chain_templates')
        .update({ is_default: false })
        .eq('company_id', ctx.companyId!)
        .eq('chain_type', chain_type || 'invoice')
        .eq('is_default', true)
    }

    const { data: chain, error: chainError } = await (supabase as any)
      .from('approval_chain_templates')
      .insert({
        company_id: ctx.companyId!,
        name,
        description: description || null,
        chain_type: chain_type || 'invoice',
        is_default: is_default || false,
        is_active: true,
      })
      .select()
      .single()

    if (chainError) {
      return NextResponse.json(
        { error: 'Database Error', message: chainError.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    // Insert steps if provided
    if (steps?.length) {
      const stepRows = steps.map((s: Record<string, unknown>, i: number) => ({
        chain_id: chain.id,
        step_name: s.step_name || `Step ${i + 1}`,
        step_order: s.step_order || i + 1,
        required_role: s.required_role || 'pm',
        threshold_min: s.threshold_min ?? null,
        threshold_max: s.threshold_max ?? null,
        auto_escalate_hours: s.auto_escalate_hours ?? 48,
      }))

      await (supabase as any)
        .from('approval_chain_steps')
        .insert(stepRows)
    }

    // Re-fetch with steps
    const { data: fullChain } = await (supabase as any)
      .from('approval_chain_templates')
      .select('*, approval_chain_steps(*)')
      .eq('id', chain.id)
      .single()

    return NextResponse.json({ data: fullChain, requestId: ctx.requestId }, { status: 201 })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'approval_chain.create' }
)
