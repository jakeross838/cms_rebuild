/**
 * GET  /api/v1/roles — List roles for the authenticated user's company
 * POST /api/v1/roles — Create a new custom role
 */

import { NextResponse } from 'next/server'

import { createApiHandler, getPaginationParams, paginatedResponse, type ApiContext } from '@/lib/api/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createRoleSchema, type CreateRoleInput } from '@/lib/validation/schemas/roles'
import type { RoleRow } from '@/types/database'

export const GET = createApiHandler(
  async (req, ctx: ApiContext) => {
    const supabase = await createClient()
    const { page, limit, offset } = getPaginationParams(req)

    const roleHierarchy = ['owner', 'admin', 'pm', 'superintendent', 'office', 'field', 'read_only']

    const { data, error, count } = await supabase
      .from('roles')
      .select('*', { count: 'exact' })
      .or(`company_id.is.null,company_id.eq.${ctx.companyId}`)
      .is('deleted_at', null)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1) as unknown as { data: RoleRow[] | null; error: { message: string; code?: string } | null; count: number | null }

    if (error) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to fetch roles', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    const sorted = (data ?? []).sort((a, b) => {
      const aIdx = roleHierarchy.indexOf(a.base_role)
      const bIdx = roleHierarchy.indexOf(b.base_role)
      if (aIdx !== bIdx) return aIdx - bIdx
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(paginatedResponse(sorted, count ?? 0, page, limit))
  },
  {
    requireAuth: true,
    permission: 'roles:read:all',
  }
)

export const POST = createApiHandler(
  async (req, ctx: ApiContext) => {
    const body = ctx.validatedBody as CreateRoleInput
    const supabase = await createClient()

    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name: body.name,
        description: body.description ?? null,
        base_role: body.base_role,
        permissions: body.permissions,
        field_overrides: body.field_overrides,
        is_system: false,
        company_id: ctx.companyId!,
      } as never)
      .select()
      .single() as unknown as { data: RoleRow | null; error: { message: string; code?: string } | null }

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conflict', message: 'A role with this name already exists', requestId: ctx.requestId },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create role', requestId: ctx.requestId },
        { status: 500 }
      )
    }

    const admin = createAdminClient()
    await admin.from('auth_audit_log').insert({
      company_id: ctx.companyId!,
      user_id: ctx.user!.id,
      event_type: 'role.create',
      ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
      metadata: { role_id: role?.id, role_name: role?.name, base_role: role?.base_role },
    } as never)

    return NextResponse.json({ data: role, requestId: ctx.requestId }, { status: 201 })
  },
  {
    requireAuth: true,
    requiredRoles: ['owner', 'admin'],
    schema: createRoleSchema,
    permission: 'roles:create:all',
    auditAction: 'role.create',
  }
)
