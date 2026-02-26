import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'

import Providers from '@/app/providers'
import { Sidebar } from '@/components/layout/sidebar'
import { TopNav } from '@/components/layout/top-nav'
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

  // Transform for Sidebar/TopNav props (companies: null → undefined)
  const sidebarUser = profile
    ? {
        name: profile.name,
        role: profile.role ?? 'field',
        companies: profile.companies ? { name: profile.companies.name } : undefined,
      }
    : null

  // SSR prefetch user profile for client-side React Query cache (0C-4)
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['user-profile', user.id],
    queryFn: () => userProfile,
  })

  return (
    <Providers
      initialUser={user}
      initialProfile={userProfile}
      permissionsMode={permissionsMode}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex h-screen bg-muted">
          {/* Sidebar */}
          <Sidebar user={sidebarUser} />

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top navigation */}
            <TopNav user={sidebarUser} />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </HydrationBoundary>
    </Providers>
  )
}
