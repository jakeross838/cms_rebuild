'use client'

import { useState } from 'react'

import { Command } from 'cmdk'
import { Search, Clock, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { useSearch } from '@/hooks/use-search'
import { filterQuickActions } from '@/lib/search/quick-actions'

import { QuickActionItem } from './quick-actions'
import { SearchResultItem } from './search-result-item'

export function CommandPalette() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { open, setOpen, recentSearches, addRecent, clearRecent } = useCommandPalette()
  const { results, isLoading, debouncedQuery } = useSearch({ query, enabled: open })

  const hasQuery = query.trim().length >= 2
  const filteredActions = filterQuickActions(query)

  function handleSelect(url: string) {
    if (hasQuery) {
      addRecent(query)
    }
    setOpen(false)
    setQuery('')
    router.push(url)
  }

  function handleRecentSelect(term: string) {
    setQuery(term)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[20%] translate-y-0 p-0 sm:max-w-xl gap-0"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command shouldFilter={false} loop>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search or jump to..."
              value={query}
              onValueChange={setQuery}
              className="flex-1 h-11 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
            ) : null}
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found
            </Command.Empty>

            {/* Recent searches — shown when no query */}
            {!hasQuery && recentSearches.length > 0 ? (
              <Command.Group
                heading={
                  <div className="flex items-center justify-between">
                    <span>Recent Searches</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearRecent()
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                }
              >
                {recentSearches.map((term) => (
                  <Command.Item
                    key={term}
                    value={`recent-${term}`}
                    onSelect={() => handleRecentSelect(term)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer data-[selected=true]:bg-accent"
                  >
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm">{term}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {/* Search results — shown when query has results */}
            {hasQuery && results ? (
              <>
                {results.groups.map((group) =>
                  group.results.length > 0 ? (
                    <Command.Group key={group.entity_type} heading={group.label}>
                      {group.results.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={handleSelect}
                        />
                      ))}
                    </Command.Group>
                  ) : null
                )}
              </>
            ) : null}

            {/* Quick actions — always shown, filtered by query */}
            {filteredActions.length > 0 ? (
              <Command.Group heading={hasQuery ? 'Pages' : 'Quick Actions'}>
                {filteredActions.slice(0, hasQuery ? 5 : 10).map((action) => (
                  <QuickActionItem
                    key={action.id}
                    action={action}
                    onSelect={handleSelect}
                  />
                ))}
              </Command.Group>
            ) : null}
          </Command.List>

          <div className="border-t px-3 py-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium border">↑↓</kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium border">↵</kbd>{' '}
              select
            </span>
            <span>
              <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium border">esc</kbd>{' '}
              close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
