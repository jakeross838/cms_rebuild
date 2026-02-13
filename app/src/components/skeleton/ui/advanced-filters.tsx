'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronDown,
  Filter,
  Grid,
  List,
  LayoutGrid,
  X,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

// ── View Mode Toggle ────────────────────────────────────────────

export type ViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'calendar'

export interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  options?: ViewMode[]
  className?: string
}

const viewModeIcons: Record<ViewMode, typeof Grid> = {
  grid: LayoutGrid,
  list: List,
  table: Grid,
  kanban: SlidersHorizontal,
  calendar: Grid, // Would use CalendarDays in real app
}

const viewModeLabels: Record<ViewMode, string> = {
  grid: 'Grid',
  list: 'List',
  table: 'Table',
  kanban: 'Kanban',
  calendar: 'Calendar',
}

export function ViewModeToggle({
  value,
  onChange,
  options = ['grid', 'list', 'table'],
  className,
}: ViewModeToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border p-1', className)}>
      {options.map((mode) => {
        const Icon = viewModeIcons[mode]
        const isActive = value === mode

        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            title={viewModeLabels[mode]}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}

// ── Group By Toggle ─────────────────────────────────────────────

export interface GroupByOption {
  id: string
  label: string
}

export interface GroupByToggleProps {
  value: string
  onChange: (groupBy: string) => void
  options: GroupByOption[]
  className?: string
}

export function GroupByToggle({
  value,
  onChange,
  options,
  className,
}: GroupByToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((o) => o.id === value)

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <span className="text-muted-foreground">Group by:</span>
        <span className="font-medium">{selectedOption?.label || 'None'}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors',
                  value === option.id && 'bg-muted'
                )}
              >
                {option.label}
                {value === option.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Priority Filter ─────────────────────────────────────────────

export interface PriorityFilterProps {
  value: string[]
  onChange: (priorities: string[]) => void
  counts?: Record<string, number>
  className?: string
}

const priorities = [
  { id: 'critical', label: 'Critical', color: 'bg-red-500' },
  { id: 'high', label: 'High', color: 'bg-orange-500' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { id: 'low', label: 'Low', color: 'bg-blue-500' },
  { id: 'none', label: 'None', color: 'bg-gray-400' },
]

export function PriorityFilter({
  value,
  onChange,
  counts = {},
  className,
}: PriorityFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const togglePriority = (priorityId: string) => {
    if (value.includes(priorityId)) {
      onChange(value.filter((p) => p !== priorityId))
    } else {
      onChange([...value, priorityId])
    }
  }

  const clearAll = () => onChange([])

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors',
          value.length > 0
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border hover:bg-muted'
        )}
      >
        <Filter className="h-4 w-4" />
        <span>Priority</span>
        {value.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {value.length}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase">Priority</span>
              {value.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Options */}
            {priorities.map((priority) => (
              <button
                key={priority.id}
                onClick={() => togglePriority(priority.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', priority.color)} />
                  <span>{priority.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {counts[priority.id] !== undefined && (
                    <span className="text-xs text-muted-foreground">{counts[priority.id]}</span>
                  )}
                  {value.includes(priority.id) && <Check className="h-4 w-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Status Filter ───────────────────────────────────────────────

export interface StatusOption {
  id: string
  label: string
  color: string
  count?: number
}

export interface StatusFilterProps {
  value: string[]
  onChange: (statuses: string[]) => void
  options: StatusOption[]
  label?: string
  className?: string
}

export function StatusFilter({
  value,
  onChange,
  options,
  label = 'Status',
  className,
}: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleStatus = (statusId: string) => {
    if (value.includes(statusId)) {
      onChange(value.filter((s) => s !== statusId))
    } else {
      onChange([...value, statusId])
    }
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors',
          value.length > 0
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border hover:bg-muted'
        )}
      >
        <Filter className="h-4 w-4" />
        <span>{label}</span>
        {value.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {value.length}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleStatus(option.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', option.color)} />
                  <span>{option.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground">{option.count}</span>
                  )}
                  {value.includes(option.id) && <Check className="h-4 w-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Bulk Select Bar ─────────────────────────────────────────────

export interface BulkSelectBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  children?: React.ReactNode // Action buttons
  className?: string
}

export function BulkSelectBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  children,
  className,
}: BulkSelectBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedCount} of {totalCount} selected
        </span>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onSelectAll}
            className="text-primary hover:underline"
          >
            Select all
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={onClearSelection}
            className="text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Search with Filters ─────────────────────────────────────────

export interface SearchWithFiltersProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filterCount?: number
  onFilterClick?: () => void
  className?: string
}

export function SearchWithFilters({
  value,
  onChange,
  placeholder = 'Search...',
  filterCount = 0,
  onFilterClick,
  className,
}: SearchWithFiltersProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors',
            filterCount > 0
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border hover:bg-muted'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}

// ── Active Filters Display ──────────────────────────────────────

export interface ActiveFilter {
  id: string
  label: string
  value: string
}

export interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onRemove: (filterId: string) => void
  onClearAll: () => void
  className?: string
}

export function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
  className,
}: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span className="font-medium">{filter.value}</span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-0.5 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}
