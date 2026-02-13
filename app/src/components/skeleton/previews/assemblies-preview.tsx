'use client'

import {
  Plus,
  Sparkles,
  Package,
  DollarSign,
  Clock,
  MoreHorizontal,
  Copy,
  Star,
  TrendingUp,
  Layers,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Assembly {
  id: string
  name: string
  category: string
  lineItems: number
  defaultTier: 'Builder' | 'Standard' | 'Premium' | 'Luxury'
  totalCost: number
  usageCount: number
  lastUsed: string
  description: string
  isFavorite: boolean
  costChange?: number
  aiNote?: string
}

const mockAssemblies: Assembly[] = [
  {
    id: '1',
    name: 'Standard Kitchen Package',
    category: 'Kitchen',
    lineItems: 12,
    defaultTier: 'Premium',
    totalCost: 42500,
    usageCount: 34,
    lastUsed: '2 weeks ago',
    description: 'Cabinets, Counters, Sink, Faucet, Backsplash, Disposal',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Coastal Master Bathroom',
    category: 'Bathroom',
    lineItems: 18,
    defaultTier: 'Premium',
    totalCost: 28000,
    usageCount: 22,
    lastUsed: '1 week ago',
    description: 'Double vanity, walk-in shower, freestanding tub, tile',
    isFavorite: true,
    costChange: 8.5,
    aiNote: 'Tile costs increased 8.5% since last review',
  },
  {
    id: '3',
    name: 'Basic Half Bath',
    category: 'Bathroom',
    lineItems: 6,
    defaultTier: 'Standard',
    totalCost: 8500,
    usageCount: 45,
    lastUsed: '3 days ago',
    description: 'Vanity, toilet, mirror, lighting, flooring',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Exterior Paint Package',
    category: 'Exterior',
    lineItems: 8,
    defaultTier: 'Standard',
    totalCost: 12000,
    usageCount: 28,
    lastUsed: '1 month ago',
    description: 'Prep, prime, 2-coat paint, trim, doors, shutters',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'HVAC System - 3 Ton',
    category: 'MEP',
    lineItems: 15,
    defaultTier: 'Standard',
    totalCost: 18500,
    usageCount: 31,
    lastUsed: '2 weeks ago',
    description: 'Condenser, air handler, ductwork, thermostat, permits',
    isFavorite: true,
    costChange: -3.2,
  },
  {
    id: '6',
    name: 'Luxury Master Closet',
    category: 'Interior',
    lineItems: 10,
    defaultTier: 'Luxury',
    totalCost: 15000,
    usageCount: 12,
    lastUsed: '3 weeks ago',
    description: 'Custom shelving, island, lighting, flooring, mirrors',
    isFavorite: false,
  },
  {
    id: '7',
    name: 'Framing Package - Single Story',
    category: 'Structural',
    lineItems: 20,
    defaultTier: 'Standard',
    totalCost: 85000,
    usageCount: 18,
    lastUsed: '1 week ago',
    description: 'Wall framing, roof trusses, sheathing, hardware',
    isFavorite: true,
    aiNote: 'Missing hurricane clips - commonly forgotten',
  },
  {
    id: '8',
    name: 'Electrical Rough-In',
    category: 'MEP',
    lineItems: 14,
    defaultTier: 'Standard',
    totalCost: 22000,
    usageCount: 35,
    lastUsed: '5 days ago',
    description: 'Panel, circuits, outlets, switches, low voltage',
    isFavorite: false,
  },
]

const categories = ['All', 'Kitchen', 'Bathroom', 'Exterior', 'MEP', 'Interior', 'Structural']

const tierConfig = {
  Builder: { color: 'bg-gray-100 text-gray-700', label: 'Builder' },
  Standard: { color: 'bg-blue-100 text-blue-700', label: 'Standard' },
  Premium: { color: 'bg-purple-100 text-purple-700', label: 'Premium' },
  Luxury: { color: 'bg-amber-100 text-amber-700', label: 'Luxury' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function AssemblyCard({ assembly }: { assembly: Assembly }) {
  const tierCfg = tierConfig[assembly.defaultTier]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
              {assembly.category}
            </span>
            {assembly.isFavorite && (
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            )}
            {assembly.costChange && assembly.costChange > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-red-600">
                <TrendingUp className="h-3 w-3" />
                +{assembly.costChange}%
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900">{assembly.name}</h4>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{assembly.description}</p>

      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{assembly.lineItems} items</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">{formatCurrency(assembly.totalCost)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className={cn("text-xs px-2 py-1 rounded font-medium", tierCfg.color)}>
            {tierCfg.label}
          </span>
          <span className="text-xs text-gray-500">
            Used {assembly.usageCount}x
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          {assembly.lastUsed}
        </div>
      </div>

      {assembly.aiNote && (
        <div className="mt-3 p-2 rounded-md bg-amber-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="text-amber-700">{assembly.aiNote}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          <Copy className="h-3.5 w-3.5" />
          Clone
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
          <Package className="h-3.5 w-3.5" />
          Use in Estimate
        </button>
      </div>
    </div>
  )
}

function AssemblyRow({ assembly }: { assembly: Assembly }) {
  const tierCfg = tierConfig[assembly.defaultTier]

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {assembly.isFavorite && (
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          )}
          <div>
            <div className="font-medium text-gray-900">{assembly.name}</div>
            <div className="text-xs text-gray-500">{assembly.description}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
          {assembly.category}
        </span>
      </td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{assembly.lineItems}</td>
      <td className="py-3 px-4">
        <span className={cn("text-xs px-2 py-1 rounded font-medium", tierCfg.color)}>
          {tierCfg.label}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="font-medium text-gray-900">{formatCurrency(assembly.totalCost)}</span>
          {assembly.costChange && assembly.costChange > 0 && (
            <span className="text-xs text-red-600">+{assembly.costChange}%</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-center text-sm text-gray-600">{assembly.usageCount}</td>
      <td className="py-3 px-4 text-right text-sm text-gray-500">{assembly.lastUsed}</td>
      <td className="py-3 px-4">
        <button className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      </td>
    </tr>
  )
}

export function AssembliesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredAssemblies = sortItems(
    mockAssemblies.filter(assembly => {
      if (!matchesSearch(assembly, search, ['name', 'category', 'description'])) return false
      if (activeTab !== 'all' && assembly.category !== activeTab) return false
      return true
    }),
    activeSort as keyof Assembly | '',
    sortDirection,
  )

  // Calculate stats
  const totalAssemblies = mockAssemblies.length
  const totalValue = mockAssemblies.reduce((sum, a) => sum + a.totalCost, 0)
  const totalUsage = mockAssemblies.reduce((sum, a) => sum + a.usageCount, 0)
  const favorites = mockAssemblies.filter(a => a.isFavorite).length
  const withCostChanges = mockAssemblies.filter(a => a.costChange && a.costChange > 0).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Assemblies & Templates</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {totalAssemblies} assemblies
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Reusable building blocks for estimates
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search assemblies..."
          tabs={[
            { key: 'all', label: 'All', count: mockAssemblies.length },
            ...categories.filter(c => c !== 'All').map(cat => ({
              key: cat,
              label: cat,
              count: mockAssemblies.filter(a => a.category === cat).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'totalCost', label: 'Total Cost' },
            { value: 'usageCount', label: 'Usage' },
            { value: 'category', label: 'Category' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'New Assembly', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredAssemblies.length}
          totalCount={mockAssemblies.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Package className="h-4 w-4" />
              Total Assemblies
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalAssemblies}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Value
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              Total Usage
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalUsage}x</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Star className="h-4 w-4" />
              Favorites
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{favorites}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            withCostChanges > 0 ? "bg-amber-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              withCostChanges > 0 ? "text-amber-600" : "text-gray-500"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Cost Changes
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              withCostChanges > 0 ? "text-amber-700" : "text-gray-900"
            )}>
              {withCostChanges}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {filteredAssemblies.map(assembly => (
            <AssemblyCard key={assembly.id} assembly={assembly} />
          ))}
          {filteredAssemblies.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No assemblies match the current filters
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Assembly</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Default Tier</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total Cost</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Usage</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Last Used</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAssemblies.map(assembly => (
                <AssemblyRow key={assembly.id} assembly={assembly} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span>Standard Kitchen Package is most used - consider creating variants for different price points</span>
            <span>|</span>
            <span>Coastal Master Bathroom costs increased 8.5% - review tile selections</span>
            <span>|</span>
            <span>Framing Package may be missing hurricane clips</span>
          </div>
        </div>
      </div>
    </div>
  )
}
