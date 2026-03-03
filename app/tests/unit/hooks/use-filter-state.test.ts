import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useFilterState, sortItems, matchesSearch } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// useFilterState
// ---------------------------------------------------------------------------

describe('useFilterState', () => {
  it('initializes with default values when no options provided', () => {
    const { result } = renderHook(() => useFilterState())

    expect(result.current.search).toBe('')
    expect(result.current.activeTab).toBe('all')
    expect(result.current.activeSort).toBe('')
    expect(result.current.sortDirection).toBe('asc')
    expect(result.current.viewMode).toBe('list')
  })

  it('initializes with custom defaults', () => {
    const { result } = renderHook(() =>
      useFilterState({
        defaultTab: 'active',
        defaultSort: 'name',
        defaultSortDirection: 'desc',
        defaultView: 'grid',
      }),
    )

    expect(result.current.activeTab).toBe('active')
    expect(result.current.activeSort).toBe('name')
    expect(result.current.sortDirection).toBe('desc')
    expect(result.current.viewMode).toBe('grid')
  })

  it('setSearch updates search value', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setSearch('plumbing')
    })

    expect(result.current.search).toBe('plumbing')
  })

  it('setActiveTab updates the active tab', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setActiveTab('completed')
    })

    expect(result.current.activeTab).toBe('completed')
  })

  it('setActiveSort updates the active sort field', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setActiveSort('created_at')
    })

    expect(result.current.activeSort).toBe('created_at')
  })

  it('toggleSortDirection flips asc to desc and back', () => {
    const { result } = renderHook(() => useFilterState())

    expect(result.current.sortDirection).toBe('asc')

    act(() => {
      result.current.toggleSortDirection()
    })
    expect(result.current.sortDirection).toBe('desc')

    act(() => {
      result.current.toggleSortDirection()
    })
    expect(result.current.sortDirection).toBe('asc')
  })

  it('setSortDirection sets an explicit direction', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setSortDirection('desc')
    })
    expect(result.current.sortDirection).toBe('desc')

    act(() => {
      result.current.setSortDirection('asc')
    })
    expect(result.current.sortDirection).toBe('asc')
  })

  it('setViewMode switches between grid and list', () => {
    const { result } = renderHook(() => useFilterState())

    expect(result.current.viewMode).toBe('list')

    act(() => {
      result.current.setViewMode('grid')
    })
    expect(result.current.viewMode).toBe('grid')

    act(() => {
      result.current.setViewMode('list')
    })
    expect(result.current.viewMode).toBe('list')
  })
})

// ---------------------------------------------------------------------------
// sortItems
// ---------------------------------------------------------------------------

describe('sortItems', () => {
  const items = [
    { name: 'Charlie', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 },
  ]

  it('returns items unchanged when sortKey is empty', () => {
    expect(sortItems(items, '')).toEqual(items)
  })

  it('sorts by string key ascending', () => {
    const sorted = sortItems(items, 'name', 'asc')
    expect(sorted.map((i) => i.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts by string key descending', () => {
    const sorted = sortItems(items, 'name', 'desc')
    expect(sorted.map((i) => i.name)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('sorts by number key ascending', () => {
    const sorted = sortItems(items, 'age', 'asc')
    expect(sorted.map((i) => i.age)).toEqual([25, 30, 35])
  })

  it('sorts by number key descending', () => {
    const sorted = sortItems(items, 'age', 'desc')
    expect(sorted.map((i) => i.age)).toEqual([35, 30, 25])
  })

  it('sorts using a function key', () => {
    const sorted = sortItems(items, (i) => i.name.length, 'asc')
    // 'Bob'(3), 'Alice'(5), 'Charlie'(7)
    expect(sorted.map((i) => i.name)).toEqual(['Bob', 'Alice', 'Charlie'])
  })

  it('pushes null values to the end', () => {
    const withNull = [
      { name: null as string | null, age: 20 },
      { name: 'Alice', age: 25 },
    ]
    const sorted = sortItems(withNull, 'name', 'asc')
    expect(sorted[0].name).toBe('Alice')
    expect(sorted[1].name).toBeNull()
  })

  it('does not mutate the original array', () => {
    const original = [...items]
    sortItems(items, 'name', 'asc')
    expect(items).toEqual(original)
  })
})

// ---------------------------------------------------------------------------
// matchesSearch
// ---------------------------------------------------------------------------

describe('matchesSearch', () => {
  const item = { name: 'Plumbing Repair', category: 'Maintenance', code: 'PLB-001' }

  it('returns true when search is empty', () => {
    expect(matchesSearch(item, '', ['name', 'category'])).toBe(true)
  })

  it('matches on the first field', () => {
    expect(matchesSearch(item, 'plumbing', ['name', 'category'])).toBe(true)
  })

  it('matches on a subsequent field', () => {
    expect(matchesSearch(item, 'maintenance', ['name', 'category'])).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(matchesSearch(item, 'PLUMBING', ['name'])).toBe(true)
  })

  it('returns false when no field matches', () => {
    expect(matchesSearch(item, 'electrical', ['name', 'category'])).toBe(false)
  })

  it('handles null field values', () => {
    const withNull = { name: null as string | null, category: 'Test' }
    expect(matchesSearch(withNull, 'test', ['name', 'category'])).toBe(true)
    expect(matchesSearch(withNull, 'nope', ['name', 'category'])).toBe(false)
  })
})
