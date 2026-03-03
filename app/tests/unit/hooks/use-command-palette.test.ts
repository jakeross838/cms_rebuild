import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock the search module dependencies
vi.mock('@/lib/search/recent-searches', () => ({
  getRecentSearches: vi.fn(() => []),
  addRecentSearch: vi.fn(),
  clearRecentSearches: vi.fn(),
}))

vi.mock('@/lib/search/quick-actions', () => ({
  getQuickActions: vi.fn(() => [
    {
      id: 'create-job',
      label: 'Create New Job',
      description: 'Start a new construction job',
      icon: 'Briefcase',
      href: '/jobs/new',
      category: 'create',
      keywords: ['create', 'new', 'job'],
    },
  ]),
}))

import { useCommandPalette } from '@/hooks/use-command-palette'
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from '@/lib/search/recent-searches'

const mockedGetRecentSearches = vi.mocked(getRecentSearches)
const mockedAddRecentSearch = vi.mocked(addRecentSearch)
const mockedClearRecentSearches = vi.mocked(clearRecentSearches)

describe('useCommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetRecentSearches.mockReturnValue([])
  })

  it('initializes with open = false', () => {
    const { result } = renderHook(() => useCommandPalette())

    expect(result.current.open).toBe(false)
  })

  it('setOpen toggles the open state', () => {
    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      result.current.setOpen(true)
    })
    expect(result.current.open).toBe(true)

    act(() => {
      result.current.setOpen(false)
    })
    expect(result.current.open).toBe(false)
  })

  it('loads quick actions on mount', () => {
    const { result } = renderHook(() => useCommandPalette())

    expect(result.current.quickActions).toHaveLength(1)
    expect(result.current.quickActions[0].id).toBe('create-job')
  })

  it('loads recent searches when opened', () => {
    mockedGetRecentSearches.mockReturnValue(['kitchen remodel', 'plumbing'])

    const { result } = renderHook(() => useCommandPalette())

    expect(result.current.recentSearches).toEqual([])

    act(() => {
      result.current.setOpen(true)
    })

    expect(mockedGetRecentSearches).toHaveBeenCalled()
    expect(result.current.recentSearches).toEqual(['kitchen remodel', 'plumbing'])
  })

  it('toggles open state on Ctrl+K keydown', () => {
    const { result } = renderHook(() => useCommandPalette())

    expect(result.current.open).toBe(false)

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }),
      )
    })

    expect(result.current.open).toBe(true)

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }),
      )
    })

    expect(result.current.open).toBe(false)
  })

  it('toggles open state on Meta+K keydown', () => {
    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true }),
      )
    })

    expect(result.current.open).toBe(true)
  })

  it('opens on custom open-command-palette event', () => {
    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      window.dispatchEvent(new Event('open-command-palette'))
    })

    expect(result.current.open).toBe(true)
  })

  it('does not toggle on plain K key without modifier', () => {
    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k' }),
      )
    })

    expect(result.current.open).toBe(false)
  })

  it('addRecent delegates to addRecentSearch and refreshes the list', () => {
    mockedGetRecentSearches.mockReturnValue(['new search'])

    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      result.current.addRecent('new search')
    })

    expect(mockedAddRecentSearch).toHaveBeenCalledWith('new search')
    expect(result.current.recentSearches).toEqual(['new search'])
  })

  it('clearRecent delegates to clearRecentSearches and empties the list', () => {
    mockedGetRecentSearches.mockReturnValue(['old'])

    const { result } = renderHook(() => useCommandPalette())

    // Populate recent searches first
    act(() => {
      result.current.setOpen(true)
    })
    expect(result.current.recentSearches).toEqual(['old'])

    act(() => {
      result.current.clearRecent()
    })

    expect(mockedClearRecentSearches).toHaveBeenCalled()
    expect(result.current.recentSearches).toEqual([])
  })

  it('cleans up keyboard event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useCommandPalette())
    unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })
})
