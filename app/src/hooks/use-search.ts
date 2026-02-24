'use client'

import { useState, useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { SearchResponse } from '@/types/search'

interface UseSearchOptions {
  query: string
  enabled?: boolean
}

async function fetchSearch(q: string): Promise<SearchResponse> {
  const res = await fetch(`/api/v2/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) {
    throw new Error('Search request failed')
  }
  const json = await res.json()
  return json.data
}

export function useSearch({ query, enabled = true }: UseSearchOptions) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  return {
    results: data ?? null,
    isLoading: isLoading && debouncedQuery.length >= 2,
    debouncedQuery,
  }
}
