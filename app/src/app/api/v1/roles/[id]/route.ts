/**
 * GET    /api/v1/roles/[id] — Get a single role by ID
 * PATCH  /api/v1/roles/[id] — Update a custom role
 * DELETE /api/v1/roles/[id] — Soft-delete a custom role
 */

import { NextResponse, type NextRequest } from 'next/server'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { updateRoleSchema, type UpdateRoleInput } from '@/lib/validation/schemas/roles'
import type { RoleRow } from '@/types/database'

function extractRoleId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname.split('/')
  const rolesIdx = segments.indexOf('roles')
  return rolesIdx >= 0 && segments[rolesIdx + 1] ? segments[rolesIdx + 1] : null
}

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = extractRoleId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Role ID is required', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .or(`company_id.is.null,company_id.eq.${ctx.companyId}`)
      .is('deleted_at', null)
      .single() as unknown as { data: RoleRow | null; error: { message: string } | null }

    if (error || !role) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Role not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: role, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    permission: 'roles:read:all',
  }
)

export const PATCH = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = extractRoleId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Role ID is required', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const body = ctx.validatedBody as UpdateRoleInput
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as unknown as { data: RoleRow | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Role not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.is_system) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'System roles cannot be modified', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.permissions !== undefined) updateData.permissions = body.permissions
    if (body.field_overrides !== undefined) updateData.field_overrides = body.field_overrides

    const { data: updated, error: updateError } = await supabase
      .from('roles')
      .update(updateData as never)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .select()
      .single() as unknown as { data: RoleRow | null; error: { message: string; code?: string } | null }

    if (updateError) {
      const mapped = mapDbError(updateError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    const admin = createAdminClient()
    await admin.from('auth_audit_log').insert({
      company_id: ctx.companyId!,
      user_id: ctx.user!.id,
      event_type: 'role.update',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
      metadata: { role_id: id, changes: body },
    } as never)

    return NextResponse.json({ data: updated, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    schema: updateRoleSchema,
    permission: 'roles:update:all',
    auditAction: 'role.update',
  }
)

export const DELETE = createApiHandler(
  async (req, ctx: ApiContext) => {
    const id = extractRoleId(req)
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Role ID is required', requestId: ctx.requestId },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('roles')
      .select('id, is_system, company_id, name')
      .eq('id', id)
      .eq('company_id', ctx.companyId!)
      .is('deleted_at', null)
      .single() as unknown as { data: RoleRow | null; error: { message: string } | null }

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Role not found', requestId: ctx.requestId },
        { status: 404 }
      )
    }

    if (existing.is_system) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'System roles cannot be deleted', requestId: ctx.requestId },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('roles')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id)
      .eq('company_id', ctx.companyId!)

    if (deleteError) {
      const mapped = mapDbError(deleteError)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }

    const admin = createAdminClient()
    await admin.from('auth_audit_log').insert({
      company_id: ctx.companyId!,
      user_id: ctx.user!.id,
      event_type: 'role.delete',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
      metadata: { role_id: id, role_name: existing.name },
    } as never)

    return NextResponse.json({ data: { success: true }, requestId: ctx.requestId })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    permission: 'roles:delete:all',
    auditAction: 'role.delete',
  }
)
