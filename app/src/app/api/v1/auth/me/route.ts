/**
 * GET /api/v1/auth/me
 *
 * Returns the authenticated user's full profile, company settings,
 * and resolved permissions.
 */

import { NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { resolvePermissions } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import type { PermissionsMode } from '@/types/auth'
import type { User, Company , UserRole } from '@/types/database'


export const GET = createApiHandler(
  async (_req, ctx: ApiContext) => {
    if (!ctx.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
          requestId: ctx.requestId,
        },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Fetch full user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', ctx.user.id)
      .single() as { data: User | null; error: unknown }

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'User profile not found',
          requestId: ctx.requestId,
        },
        { status: 404 }
      )
    }

    // Fetch company settings for permissions_mode
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, settings')
      .eq('id', profile.company_id)
      .single() as { data: Pick<Company, 'id' | 'name' | 'settings'> | null; error: unknown }

    const settings = company?.settings as Record<string, unknown> | null
    const permissionsMode: PermissionsMode =
      (settings?.permissions_mode as PermissionsMode) ?? 'open'

    // Resolve the user's effective permissions
    const permissions = resolvePermissions(profile.role as UserRole)

    return NextResponse.json({
      user: {
        id: profile.id,
        company_id: profile.company_id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active,
        last_login_at: profile.last_login_at,
        preferences: profile.preferences,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      company: company
        ? {
            id: company.id,
            name: company.name,
          }
        : null,
      permissions,
      permissionsMode,
      requestId: ctx.requestId,
    })
  },
  {
    requireAuth: true,
  }
)
