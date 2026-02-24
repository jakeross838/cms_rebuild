/**
 * Server-side QueryClient factory (0C-4)
 *
 * Creates a new QueryClient for server components.
 * Used with HydrationBoundary + dehydrate to pass prefetched
 * data from Server Components to Client Components, avoiding
 * client-side loading spinners.
 *
 * Usage in a Server Component:
 *   const queryClient = getQueryClient()
 *   await queryClient.prefetchQuery({ queryKey: ['resource'], queryFn: fetchResource })
 *   return <HydrationBoundary state={dehydrate(queryClient)}><ClientPage /></HydrationBoundary>
 */

import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
)

export default getQueryClient
