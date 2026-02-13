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
  TrendingDown,
  Layers,
  ChevronRight,
  AlertTriangle,
  FileText,
  Edit2,
  Ruler,
  BarChart3,
  RefreshCw,
  Upload,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface AssemblyItem {
  costCode: string
  description: string
  qtyPerUnit: number
  unit: string
  unitCost: number
}

interface Assembly {
  id: string
  name: string
  category: string
  lineItems: number
  defaultTier: 'Builder' | 'Standard' | 'Premium' | 'Luxury'
  totalCost: number
  parameterUnit: string
  costPerUnit: number
  usageCount: number
  lastUsed: string
  createdAt: string
  description: string
  isFavorite: boolean
  isActive: boolean
  hasNestedAssemblies: boolean
  wasteFactorApplied: boolean
  costChange?: number
  costChangeDirection?: 'up' | 'down'
  aiNote?: string
  sampleItems?: AssemblyItem[]
}

const mockAssemblies: Assembly[] = [
  {
    id: '1',
    name: 'Standard Kitchen Package',
    category: 'Kitchen',
    lineItems: 12,
    defaultTier: 'Premium',
    totalCost: 42500,
    parameterUnit: 'EA',
    costPerUnit: 42500,
    usageCount: 34,
    lastUsed: '2 weeks ago',
    createdAt: 'Jan 15, 2025',
    description: 'Cabinets, Counters, Sink, Faucet, Backsplash, Disposal',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    sampleItems: [
      { costCode: '06-400', description: 'Maple Shaker Cabinets', qtyPerUnit: 28, unit: 'LF', unitCost: 450 },
      { costCode: '12-350', description: 'Quartz Countertops', qtyPerUnit: 45, unit: 'SF', unitCost: 85 },
      { costCode: '22-400', description: 'Farmhouse Sink + Faucet', qtyPerUnit: 1, unit: 'EA', unitCost: 1200 },
    ],
  },
  {
    id: '2',
    name: 'Coastal Master Bathroom',
    category: 'Bathroom',
    lineItems: 18,
    defaultTier: 'Premium',
    totalCost: 28000,
    parameterUnit: 'EA',
    costPerUnit: 28000,
    usageCount: 22,
    lastUsed: '1 week ago',
    createdAt: 'Dec 10, 2024',
    description: 'Double vanity, walk-in shower, freestanding tub, tile, lighting',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: true,
    wasteFactorApplied: true,
    costChange: 8.5,
    costChangeDirection: 'up',
    aiNote: 'Tile costs increased 8.5% since last review - review selections',
  },
  {
    id: '3',
    name: 'Basic Half Bath',
    category: 'Bathroom',
    lineItems: 6,
    defaultTier: 'Standard',
    totalCost: 8500,
    parameterUnit: 'EA',
    costPerUnit: 8500,
    usageCount: 45,
    lastUsed: '3 days ago',
    createdAt: 'Aug 22, 2024',
    description: 'Vanity, toilet, mirror, lighting, flooring',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
  },
  {
    id: '4',
    name: 'Exterior Paint Package',
    category: 'Exterior',
    lineItems: 8,
    defaultTier: 'Standard',
    totalCost: 12000,
    parameterUnit: 'SF',
    costPerUnit: 3.43,
    usageCount: 28,
    lastUsed: '1 month ago',
    createdAt: 'Sep 5, 2024',
    description: 'Prep, prime, 2-coat paint, trim, doors, shutters, cleanup',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
  },
  {
    id: '5',
    name: 'HVAC System - 3 Ton',
    category: 'MEP',
    lineItems: 15,
    defaultTier: 'Standard',
    totalCost: 18500,
    parameterUnit: 'TON',
    costPerUnit: 6167,
    usageCount: 31,
    lastUsed: '2 weeks ago',
    createdAt: 'Oct 1, 2024',
    description: 'Condenser, air handler, ductwork, thermostat, permits, startup',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: false,
    costChange: -3.2,
    costChangeDirection: 'down',
  },
  {
    id: '6',
    name: 'Luxury Master Closet',
    category: 'Interior',
    lineItems: 10,
    defaultTier: 'Luxury',
    totalCost: 15000,
    parameterUnit: 'EA',
    costPerUnit: 15000,
    usageCount: 12,
    lastUsed: '3 weeks ago',
    createdAt: 'Nov 18, 2024',
    description: 'Custom shelving, island, lighting, flooring, mirrors, hardware',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
  },
  {
    id: '7',
    name: 'Framing Package - Single Story',
    category: 'Structural',
    lineItems: 20,
    defaultTier: 'Standard',
    totalCost: 85000,
    parameterUnit: 'SF',
    costPerUnit: 24.29,
    usageCount: 18,
    lastUsed: '1 week ago',
    createdAt: 'Jul 12, 2024',
    description: 'Wall framing, roof trusses, sheathing, hardware, hurricane clips',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: true,
    wasteFactorApplied: true,
    aiNote: 'Missing hurricane clips - commonly forgotten item',
  },
  {
    id: '8',
    name: 'Electrical Rough-In',
    category: 'MEP',
    lineItems: 14,
    defaultTier: 'Standard',
    totalCost: 22000,
    parameterUnit: 'SF',
    costPerUnit: 6.29,
    usageCount: 35,
    lastUsed: '5 days ago',
    createdAt: 'Jun 1, 2024',
    description: 'Panel, circuits, outlets, switches, low voltage, permits',
    isFavorite: false,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: false,
  },
  {
    id: '9',
    name: 'Exterior Wall Assembly',
    category: 'Structural',
    lineItems: 8,
    defaultTier: 'Standard',
    totalCost: 18.50,
    parameterUnit: 'LF',
    costPerUnit: 18.50,
    usageCount: 41,
    lastUsed: '4 days ago',
    createdAt: 'May 15, 2024',
    description: 'Framing labor, framing material, sheathing, housewrap, insulation',
    isFavorite: true,
    isActive: true,
    hasNestedAssemblies: false,
    wasteFactorApplied: true,
    costChange: 4.2,
    costChangeDirection: 'up',
    aiNote: 'Lumber prices trending up 4.2% - review framing material costs',
  },
  {
    id: '10',
    name: 'Plumbing Rough-In (Retired)',
    category: 'MEP',
    lineItems: 11,
    defaultTier: 'Standard',
    totalCost: 15200,
    parameterUnit: 'EA',
    costPerUnit: 15200,
    usageCount: 8,
    lastUsed: '6 months ago',
    createdAt: 'Mar 1, 2024',
    description: 'Water supply, drain/waste/vent, fixtures rough, gas piping',
    isFavorite: false,
    isActive: false,
    hasNestedAssemblies: false,
    wasteFactorApplied: false,
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
  return '$' + value.toFixed(2)
}

function AssemblyCard({ assembly }: { assembly: Assembly }) {
  const tierCfg = tierConfig[assembly.defaultTier]

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      !assembly.isActive && "opacity-60 border-dashed",
      assembly.isActive && "border-gray-200",
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
              {assembly.category}
            </span>
            {assembly.isFavorite && (
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            )}
            {!assembly.isActive && (
              <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Inactive</span>
            )}
            {assembly.hasNestedAssemblies && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Layers className="h-3 w-3" />
                Nested
              </span>
            )}
            {assembly.costChange !== undefined && assembly.costChangeDirection === 'up' && (
              <span className="flex items-center gap-0.5 text-xs text-red-600">
                <TrendingUp className="h-3 w-3" />
                +{assembly.costChange}%
              </span>
            )}
            {assembly.costChange !== undefined && assembly.costChangeDirection === 'down' && (
              <span className="flex items-center gap-0.5 text-xs text-green-600">
                <TrendingDown className="h-3 w-3" />
                {assembly.costChange}%
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
        <div className="flex items-center gap-1.5">
          <Ruler className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{formatCurrency(assembly.costPerUnit)}/{assembly.parameterUnit}</span>
        </div>
      </div>

      {assembly.wasteFactorApplied && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <RefreshCw className="h-3 w-3" />
          <span>Waste factors applied</span>
        </div>
      )}

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
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
          <Edit2 className="h-3.5 w-3.5" />
          Edit
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
    <tr className={cn(
      "hover:bg-gray-50",
      !assembly.isActive && "opacity-60",
    )}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {assembly.isFavorite && (
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{assembly.name}</span>
              {!assembly.isActive && (
                <span className="text-xs bg-red-50 text-red-600 px-1 py-0.5 rounded">Inactive</span>
              )}
              {assembly.hasNestedAssemblies && (
                <span title="Contains nested assemblies"><Layers className="h-3.5 w-3.5 text-indigo-500" /></span>
              )}
            </div>
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
          {assembly.costChange !== undefined && assembly.costChangeDirection === 'up' && (
            <span className="text-xs text-red-600">+{assembly.costChange}%</span>
          )}
          {assembly.costChange !== undefined && assembly.costChangeDirection === 'down' && (
            <span className="text-xs text-green-600">{assembly.costChange}%</span>
          )}
        </div>
        <div className="text-xs text-gray-400">{formatCurrency(assembly.costPerUnit)}/{assembly.parameterUnit}</div>
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
  const activeAssemblies = mockAssemblies.filter(a => a.isActive)
  const totalAssemblies = activeAssemblies.length
  const totalValue = activeAssemblies.reduce((sum, a) => sum + a.totalCost, 0)
  const totalUsage = activeAssemblies.reduce((sum, a) => sum + a.usageCount, 0)
  const favorites = activeAssemblies.filter(a => a.isFavorite).length
  const withCostIncreases = activeAssemblies.filter(a => a.costChangeDirection === 'up').length
  const withCostDecreases = activeAssemblies.filter(a => a.costChangeDirection === 'down').length
  const nestedCount = activeAssemblies.filter(a => a.hasNestedAssemblies).length
  const inactiveCount = mockAssemblies.filter(a => !a.isActive).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Assemblies & Templates</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {totalAssemblies} active
            </span>
            {inactiveCount > 0 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {inactiveCount} inactive
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Reusable building blocks for estimates -- parameterized recipes that auto-calculate child items
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
            { value: 'costPerUnit', label: 'Cost/Unit' },
            { value: 'usageCount', label: 'Usage' },
            { value: 'category', label: 'Category' },
            { value: 'lastUsed', label: 'Last Used' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'New Assembly', onClick: () => {}, variant: 'primary' },
            { icon: Upload, label: 'Import', onClick: () => {} },
            { icon: Download, label: 'Export', onClick: () => {} },
          ]}
          resultCount={filteredAssemblies.length}
          totalCount={mockAssemblies.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-7 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Package className="h-4 w-4" />
              Active
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
              <BarChart3 className="h-4 w-4" />
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
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-indigo-600 text-sm">
              <Layers className="h-4 w-4" />
              Nested
            </div>
            <div className="text-xl font-bold text-indigo-700 mt-1">{nestedCount}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            withCostIncreases > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              withCostIncreases > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <TrendingUp className="h-4 w-4" />
              Cost Increases
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              withCostIncreases > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {withCostIncreases}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            withCostDecreases > 0 ? "bg-green-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              withCostDecreases > 0 ? "text-green-600" : "text-gray-500"
            )}>
              <TrendingDown className="h-4 w-4" />
              Cost Decreases
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              withCostDecreases > 0 ? "text-green-700" : "text-gray-900"
            )}>
              {withCostDecreases}
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

      {/* Cross-Module Connection Badges */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Connected:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Package className="h-3 w-3" />
            Selections Catalog
          </span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Estimates
          </span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Cost Codes
          </span>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Price Intelligence
          </span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span>Standard Kitchen Package most used -- consider creating Budget and Luxury variants</span>
            <span>|</span>
            <span>Coastal Master Bathroom costs up 8.5% -- review tile selections</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Framing Package may be missing hurricane clips
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
