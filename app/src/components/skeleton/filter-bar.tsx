'use client'

import { type ReactNode } from 'react'

import { Search, Grid3X3, List, ArrowUp, ArrowDown } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { LucideIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterTab {
  key: string
  label: string
  count?: number
}

export interface FilterDropdown {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export interface FilterAction {
  icon?: LucideIcon
  label: string
  onClick: () => void
  variant?: 'primary' | 'default'
}

export interface SortOption {
  value: string
  label: string
}

export interface FilterBarProps {
  // Search
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Status / category tabs
  tabs?: FilterTab[]
  activeTab?: string
  onTabChange?: (tab: string) => void

  // Dropdown filters
  dropdowns?: FilterDropdown[]

  // Sort
  sortOptions?: SortOption[]
  activeSort?: string
  onSortChange?: (sort: string) => void
  sortDirection?: 'asc' | 'desc'
  onSortDirectionChange?: () => void

  // View mode toggle
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void

  // Action buttons (right side)
  actions?: FilterAction[]

  // Result count
  resultCount?: number
  totalCount?: number

  // Optional extra content rendered between controls and actions
  children?: ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  tabs,
  activeTab,
  onTabChange,
  dropdowns,
  sortOptions,
  activeSort,
  onSortChange,
  sortDirection = 'asc',
  onSortDirectionChange,
  viewMode,
  onViewModeChange,
  actions,
  resultCount,
  totalCount,
  children,
}: FilterBarProps) {
  const hasTabs = tabs && tabs.length > 0
  const hasControls =
    onSearchChange ||
    (dropdowns && dropdowns.length > 0) ||
    (sortOptions && sortOptions.length > 0) ||
    onViewModeChange ||
    (actions && actions.length > 0) ||
    children

  return (
    <div className="space-y-3">
      {/* Row 1 — Tabs (only if present) */}
      {hasTabs ? <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange?.(tab.key)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all border',
                activeTab === tab.key
                  ? 'bg-stone-50 text-stone-700 border-stone-200'
                  : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50 border-transparent',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-[9px] text-warm-400">{tab.count}</span>
              )}
            </button>
          ))}
        </div> : null}

      {/* Row 2 — Search + Dropdowns + Sort + Children + View Toggle + Actions */}
      {hasControls ? <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          {onSearchChange ? <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-warm-400" />
              <input
                type="text"
                placeholder={searchPlaceholder ?? 'Search...'}
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-warm-200 rounded-md w-48 bg-white focus:outline-none focus:border-stone-400 focus:shadow-[var(--shadow-focus)]"
              />
            </div> : null}

          {/* Dropdown filters */}
          {dropdowns?.map((dropdown, i) => (
            <select
              key={i}
              value={dropdown.value}
              onChange={(e) => dropdown.onChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-warm-200 rounded-md bg-white text-warm-600 focus:outline-none focus:border-stone-400 cursor-pointer"
            >
              <option value="all">{dropdown.label}</option>
              {dropdown.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Sort */}
          {sortOptions && sortOptions.length > 0 ? <div className="flex items-center gap-0.5">
              <select
                value={activeSort ?? ''}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs border border-warm-200 rounded-md bg-white text-warm-600 focus:outline-none focus:border-stone-400 cursor-pointer"
              >
                <option value="">Sort by…</option>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {activeSort && onSortDirectionChange ? <button
                  onClick={onSortDirectionChange}
                  className="p-1.5 text-warm-500 hover:bg-warm-100 rounded-lg transition-colors"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </button> : null}
            </div> : null}

          {/* Extra content slot */}
          {children}

          {/* Spacer */}
          <div className="flex-1 min-w-0" />

          {/* Result count */}
          {resultCount !== undefined &&
            totalCount !== undefined &&
            resultCount !== totalCount && (
              <span className="text-xs text-warm-500 whitespace-nowrap">
                {resultCount} of {totalCount}
              </span>
            )}

          {/* View toggle */}
          {onViewModeChange ? <div className="flex border border-warm-200 rounded-lg overflow-hidden">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-stone-50 text-stone-600'
                    : 'text-warm-400 hover:bg-warm-50',
                )}
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list'
                    ? 'bg-stone-50 text-stone-600'
                    : 'text-warm-400 hover:bg-warm-50',
                )}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div> : null}

          {/* Actions */}
          {actions?.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap active:scale-[.97]',
                action.variant === 'primary'
                  ? 'bg-stone-700 text-white hover:bg-stone-600'
                  : 'bg-white border border-warm-200 text-warm-700 hover:bg-warm-50',
              )}
            >
              {action.icon ? <action.icon className="h-3.5 w-3.5" /> : null}
              {action.label}
            </button>
          ))}
        </div> : null}
    </div>
  )
}
