import { useState, useMemo, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseFilterStateOptions {
  defaultTab?: string
  defaultSort?: string
  defaultSortDirection?: 'asc' | 'desc'
  defaultView?: 'grid' | 'list'
}

export interface FilterState {
  search: string
  setSearch: (value: string) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  activeSort: string
  setActiveSort: (sort: string) => void
  sortDirection: 'asc' | 'desc'
  setSortDirection: (dir: 'asc' | 'desc') => void
  toggleSortDirection: () => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFilterState(options: UseFilterStateOptions = {}): FilterState {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState(options.defaultTab ?? 'all')
  const [activeSort, setActiveSort] = useState(options.defaultSort ?? '')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    options.defaultSortDirection ?? 'asc',
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(options.defaultView ?? 'list')

  const toggleSortDirection = useCallback(() => {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
  }, [])

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    activeSort,
    setActiveSort,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    viewMode,
    setViewMode,
  }
}

// ---------------------------------------------------------------------------
// Sort helper — generic comparator builder
// ---------------------------------------------------------------------------

type SortKey<T> = keyof T | ((item: T) => string | number | boolean | null | undefined)

export function sortItems<T>(
  items: T[],
  sortKey: SortKey<T> | '',
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  if (!sortKey) return items

  const getValue = typeof sortKey === 'function' ? sortKey : (item: T) => item[sortKey]

  return [...items].sort((a, b) => {
    const aVal = getValue(a)
    const bVal = getValue(b)

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    let cmp: number
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      cmp = aVal.localeCompare(bVal)
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal
    } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      cmp = Number(aVal) - Number(bVal)
    } else {
      cmp = String(aVal).localeCompare(String(bVal))
    }

    return direction === 'desc' ? -cmp : cmp
  })
}

// ---------------------------------------------------------------------------
// Search helper — match across multiple fields
// ---------------------------------------------------------------------------

export function matchesSearch<T>(
  item: T,
  search: string,
  fields: (keyof T)[],
): boolean {
  if (!search) return true
  const query = search.toLowerCase()
  return fields.some((field) => {
    const val = item[field]
    if (val == null) return false
    return String(val).toLowerCase().includes(query)
  })
}
