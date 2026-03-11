/**
 * Approval Chain Template by ID — Get, Update, Delete
 *
 * GET    /api/v2/approval-chains/:id — Get chain with steps
 * PATCH  /api/v2/approval-chains/:id — Update chain and/or replace steps
 * DELETE /api/v2/approval-chains/:id — Soft delete chain
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'

export const GET = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing chain ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('approval_chain_templates')
      .select('*, approval_chain_steps(*)')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Approval chain not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)

export const PATCH = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing chain ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { steps, ...chainData } = body

    const supabase = await createClient()

    // Update chain fields
    if (Object.keys(chainData).length > 0) {
      const { error } = await (supabase as any)
        .from('approval_chain_templates')
        .update({ ...chainData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('company_id', ctx.companyId!)

      if (error) {
        return NextResponse.json(
          { error: 'Database Error', message: error.message, requestId: ctx.requestId },
          { status: 500 }
        )
      }
    }

    // Replace steps if provided
    if (steps) {
      const { error: deleteError } = await (supabase as any)
        .from('approval_chain_steps')
        .delete()
        .eq('chain_id', id)

      if (deleteError) {
        return NextResponse.json(
          { error: 'Database Error', message: deleteError.message, requestId: ctx.requestId },
          { status: 500 }
        )
      }

      if (steps.length > 0) {
        const stepRows = steps.map((s: Record<string, unknown>, i: number) => ({
          chain_id: id,
          step_name: s.step_name || `Step ${i + 1}`,
          step_order: s.step_order || i + 1,
          required_role: s.required_role || 'pm',
          threshold_min: s.threshold_min ?? null,
          threshold_max: s.threshold_max ?? null,
          auto_escalate_hours: s.auto_escalate_hours ?? 48,
        }))

        const { error: insertError } = await (supabase as any)
          .from('approval_chain_steps')
          .insert(stepRows)

        if (insertError) {
          return NextResponse.json(
            { error: 'Database Error', message: insertError.message, requestId: ctx.requestId },
            { status: 500 }
          )
        }
      }
    }

    const { data } = await (supabase as any)
      .from('approval_chain_templates')
      .select('*, approval_chain_steps(*)')
      .eq('id', id)
      .single()

    return NextResponse.json({ data, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'approval_chain.update' }
)

export const DELETE = createApiHandler(
  async (req: NextRequest, ctx: ApiContext) => {
    const segments = req.nextUrl.pathname.split('/')
    const id = segments[segments.length - 1]
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing chain ID', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('approval_chain_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message, requestId: ctx.requestId },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin'], auditAction: 'approval_chain.delete' }
)
