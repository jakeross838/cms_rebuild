'use client'

import { useState, useEffect, useCallback } from 'react'

import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from '@/lib/search/recent-searches'
import { getQuickActions } from '@/lib/search/quick-actions'
import type { QuickAction } from '@/types/search'

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [quickActions] = useState<QuickAction[]>(() => getQuickActions())

  // Load recent searches when opening
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches())
    }
  }, [open])

  // Cmd+K / Ctrl+K keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    function handleCustomEvent() {
      setOpen(true)
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-command-palette', handleCustomEvent)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-command-palette', handleCustomEvent)
    }
  }, [])

  const addRecent = useCallback((term: string) => {
    addRecentSearch(term)
    setRecentSearches(getRecentSearches())
  }, [])

  const clearRecent = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  return {
    open,
    setOpen,
    recentSearches,
    quickActions,
    addRecent,
    clearRecent,
  }
}
