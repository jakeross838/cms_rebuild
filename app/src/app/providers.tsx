'use client'

import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query'


import { AuthProvider } from '@/lib/auth/auth-context'
import type { PermissionsMode, UserProfile } from '@/types/auth'

import type { User as SupabaseUser } from '@supabase/supabase-js'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface ProvidersProps {
  children: React.ReactNode
  initialUser?: SupabaseUser | null
  initialProfile?: UserProfile | null
  permissionsMode?: PermissionsMode
}

export default function Providers({
  children,
  initialUser = null,
  initialProfile = null,
  permissionsMode = 'open',
}: ProvidersProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        initialUser={initialUser}
        initialProfile={initialProfile}
        permissionsMode={permissionsMode}
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
