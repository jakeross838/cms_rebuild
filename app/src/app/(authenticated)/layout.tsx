import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'

import Providers from '@/app/providers'
import { UnifiedNavAuth } from '@/components/layout/unified-nav-auth'
import getQueryClient from '@/lib/query/get-query-client'
import { createClient } from '@/lib/supabase/server'
import type { PermissionsMode, UserProfile } from '@/types/auth'
import type { User, Company } from '@/types/database'

type ProfileWithCompany = User & { companies: Company | null }

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile from our users table
  const { data: rawProfile } = await supabase
    .from('users')
    .select('*, companies(*)')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as unknown as ProfileWithCompany | null

  // Extract permissions_mode from company settings
  const companySettings = profile?.companies?.settings as Record<string, unknown> | null
  const permissionsMode = (companySettings?.permissions_mode as PermissionsMode) || 'open'

  // Map profile to UserProfile shape for AuthProvider
  const userProfile: UserProfile | null = profile
    ? {
        id: profile.id,
        company_id: profile.company_id,
        email: profile.email,
        name: profile.name,
        role: profile.role ?? 'field',
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active ?? true,
        last_login_at: profile.last_login_at ?? null,
        preferences: profile.preferences as Record<string, unknown> | null,
        deleted_at: profile.deleted_at ?? null,
        created_at: profile.created_at ?? new Date().toISOString(),
        updated_at: profile.updated_at ?? new Date().toISOString(),
      }
    : null

  // Transform for nav props
  const navUser = profile
    ? {
        name: profile.name,
        email: profile.email,
        role: profile.role ?? 'field',
      }
    : null

  // SSR prefetch for client-side React Query cache
  const queryClient = getQueryClient()

  // Prefetch user profile, notification count, and company settings in parallel
  const companyId = profile?.company_id
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['user-profile', user.id],
      queryFn: () => userProfile,
    }),
    companyId
      ? queryClient.prefetchQuery({
          queryKey: ['notifications-unread-count', companyId, user.id],
          queryFn: async () => {
            const { count } = await supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', companyId)
              .eq('user_id', user.id)
              .eq('read', false)
              .is('deleted_at', null)
            return count ?? 0
          },
        })
      : Promise.resolve(),
    companyId
      ? queryClient.prefetchQuery({
          queryKey: ['company-settings', companyId],
          queryFn: async () => {
            const { data } = await supabase
              .from('companies')
              .select('id, name, settings, features')
              .eq('id', companyId)
              .single()
            return data
          },
        })
      : Promise.resolve(),
  ])

  return (
    <Providers
      initialUser={user}
      initialProfile={userProfile}
      permissionsMode={permissionsMode}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col h-screen bg-muted">
          {/* Top navigation */}
          <UnifiedNavAuth user={navUser} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </HydrationBoundary>
    </Providers>
  )
}
