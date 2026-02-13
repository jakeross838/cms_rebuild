'use client'

import { type ReactNode } from 'react'
import { Search, Grid3X3, List, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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
      {hasTabs && (
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange?.(tab.key)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors',
                activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Row 2 — Search + Dropdowns + Sort + Children + View Toggle + Actions */}
      {hasControls && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder ?? 'Search...'}
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Dropdown filters */}
          {dropdowns?.map((dropdown, i) => (
            <select
              key={i}
              value={dropdown.value}
              onChange={(e) => dropdown.onChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
          {sortOptions && sortOptions.length > 0 && (
            <div className="flex items-center gap-0.5">
              <select
                value={activeSort ?? ''}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Sort by…</option>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {activeSort && onSortDirectionChange && (
                <button
                  onClick={onSortDirectionChange}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Extra content slot */}
          {children}

          {/* Spacer */}
          <div className="flex-1 min-w-0" />

          {/* Result count */}
          {resultCount !== undefined &&
            totalCount !== undefined &&
            resultCount !== totalCount && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {resultCount} of {totalCount}
              </span>
            )}

          {/* View toggle */}
          {onViewModeChange && (
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:bg-gray-50',
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
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:bg-gray-50',
                )}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Actions */}
          {actions?.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
                action.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50',
              )}
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
