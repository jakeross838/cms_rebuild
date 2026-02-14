'use client'

import { useCallback } from 'react'

import { useAuth } from '@/lib/auth/auth-context'
import type { PermissionAction, PermissionResource, PermissionScope } from '@/types/auth'

/**
 * Convenience hook wrapping useAuth with a cleaner `can()` API.
 */
export function usePermissions() {
  const { can, hasRole, role, profile } = useAuth()

  const canDo = useCallback(
    (resource: PermissionResource, action: PermissionAction, scope?: PermissionScope) => {
      return can(resource, action, scope)
    },
    [can]
  )

  return {
    can: canDo,
    hasRole,
    role,
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    companyId: profile?.company_id ?? null,
  }
}
