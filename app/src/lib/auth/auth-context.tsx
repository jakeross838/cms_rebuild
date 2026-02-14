'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


import { hasPermission, isRoleAtLeast, resolvePermissions } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/client'
import type {
  AuthContext,
  Permission,
  PermissionAction,
  PermissionResource,
  PermissionScope,
  PermissionsMode,
  UserProfile,
} from '@/types/auth'
import type { UserRole } from '@/types/database'

import type { User as SupabaseUser } from '@supabase/supabase-js'

const AuthCtx = createContext<AuthContext | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: SupabaseUser | null
  initialProfile: UserProfile | null
  permissionsMode?: PermissionsMode
}

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
  permissionsMode = 'open',
}: AuthProviderProps) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(
    initialUser ? { id: initialUser.id, email: initialUser.email ?? '' } : null
  )
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [loading, setLoading] = useState(false)

  const role = profile?.role ?? null

  // Resolved permissions for the current role
  const permissions = useMemo<Permission[]>(() => {
    if (!role) return []
    return resolvePermissions(role)
  }, [role])

  // Subscribe to auth state changes
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const can = useCallback(
    (resource: PermissionResource, action: PermissionAction, scope?: PermissionScope) => {
      if (!role) return false
      return hasPermission(role, permissions, resource, action, scope ?? 'all', permissionsMode)
    },
    [role, permissions, permissionsMode]
  )

  const hasRole = useCallback(
    (requiredRole: UserRole) => {
      if (!role) return false
      return isRoleAtLeast(role, requiredRole)
    },
    [role]
  )

  const value = useMemo<AuthContext>(
    () => ({ user, profile, role, loading, signOut, can, hasRole }),
    [user, profile, role, loading, signOut, can, hasRole]
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(): AuthContext {
  const ctx = useContext(AuthCtx)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
