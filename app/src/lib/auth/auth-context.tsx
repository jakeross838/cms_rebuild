'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


import { hasPermission, isRoleAtLeast, resolvePermissions } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/client'
import type {
  AuthContext,
  CompanyInfo,
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
  initialCompany?: CompanyInfo | null
  initialCompanies?: CompanyInfo[]
  permissionsMode?: PermissionsMode
}

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
  initialCompany = null,
  initialCompanies = [],
  permissionsMode = 'open',
}: AuthProviderProps) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(
    initialUser ? { id: initialUser.id, email: initialUser.email ?? '' } : null
  )
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo | null>(initialCompany)
  const [companies, setCompanies] = useState<CompanyInfo[]>(initialCompanies)

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
          setCurrentCompany(null)
          setCompanies([])
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user's companies when logged in
  useEffect(() => {
    if (!user) {
      setCompanies([])
      setCurrentCompany(null)
      return
    }

    // Only fetch if we don't have initial data
    if (initialCompanies.length > 0) return

    async function fetchCompanies() {
      try {
        const response = await fetch('/api/v1/auth/companies')
        if (!response.ok) return

        const data = await response.json()
        const fetchedCompanies: CompanyInfo[] = (data.companies || []).map(
          (c: { id: string; name: string; role: string; isCurrent: boolean }) => ({
            id: c.id,
            name: c.name,
            role: c.role as UserRole,
          })
        )
        setCompanies(fetchedCompanies)

        const current = data.companies?.find(
          (c: { isCurrent: boolean }) => c.isCurrent
        )
        if (current) {
          setCurrentCompany({
            id: current.id,
            name: current.name,
            role: current.role as UserRole,
          })
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to fetch companies:', error)
      }
    }

    fetchCompanies()
  }, [user, initialCompanies.length])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setCurrentCompany(null)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [])

  const switchCompany = useCallback(async (companyId: string): Promise<boolean> => {
    if (!user || currentCompany?.id === companyId) return false

    setLoading(true)
    try {
      const response = await fetch('/api/v1/auth/switch-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })

      if (!response.ok) {
        console.error('[AuthProvider] Failed to switch company')
        return false
      }

      const data = await response.json()

      // Update current company
      const newCompany = companies.find((c) => c.id === companyId)
      if (newCompany) {
        setCurrentCompany(newCompany)
      } else if (data.company) {
        setCurrentCompany({
          id: data.company.id,
          name: data.company.name,
          role: data.role as UserRole,
        })
      }

      return true
    } catch (error) {
      console.error('[AuthProvider] Error switching company:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, currentCompany?.id, companies])

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
    () => ({
      user,
      profile,
      role,
      loading,
      signOut,
      can,
      hasRole,
      currentCompany,
      companies,
      switchCompany,
    }),
    [user, profile, role, loading, signOut, can, hasRole, currentCompany, companies, switchCompany]
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
