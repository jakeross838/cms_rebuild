'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Copy,
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface LineItem {
  id: string
  category: string
  name: string
  selection: {
    name: string
    tier: 'builder' | 'standard' | 'premium' | 'luxury'
    materialCost: number
    laborCost: number
    leadTime: string
    vendor: string
  }
  quantity: number
  unit: string
  isAllowance?: boolean
  aiNote?: string
}

const mockLineItems: LineItem[] = [
  {
    id: '1',
    category: 'Exterior',
    name: 'Porch Ceiling',
    selection: {
      name: 'Cypress T&G 1x6',
      tier: 'premium',
      materialCost: 8.50,
      laborCost: 4.00,
      leadTime: '2 weeks',
      vendor: 'ABC Lumber',
    },
    quantity: 450,
    unit: 'SF',
    aiNote: 'Your most common choice for coastal homes (67%)',
  },
  {
    id: '2',
    category: 'Exterior',
    name: 'Exterior Paint',
    selection: {
      name: 'Sherwin-Williams Duration',
      tier: 'premium',
      materialCost: 2.80,
      laborCost: 1.70,
      leadTime: '3 days',
      vendor: 'Sherwin-Williams',
    },
    quantity: 3500,
    unit: 'SF',
  },
  {
    id: '3',
    category: 'Exterior',
    name: 'Impact Windows',
    selection: {
      name: 'PGT WinGuard',
      tier: 'premium',
      materialCost: 85.00,
      laborCost: 25.00,
      leadTime: '8 weeks',
      vendor: 'PGT Industries',
    },
    quantity: 24,
    unit: 'EA',
    aiNote: '⚠️ Lead time concern: 8 weeks vs. 4 week start',
  },
  {
    id: '4',
    category: 'Interior',
    name: 'Master Bath Tile',
    selection: {
      name: 'Client Selection Pending',
      tier: 'standard',
      materialCost: 18.00,
      laborCost: 12.00,
      leadTime: 'TBD',
      vendor: 'TBD',
    },
    quantity: 120,
    unit: 'SF',
    isAllowance: true,
    aiNote: 'Client likely to upgrade +$600 based on profile',
  },
  {
    id: '5',
    category: 'Interior',
    name: 'Kitchen Cabinets',
    selection: {
      name: 'Shaker Style Maple',
      tier: 'premium',
      materialCost: 450.00,
      laborCost: 150.00,
      leadTime: '6 weeks',
      vendor: 'Custom Cabinet Co',
    },
    quantity: 28,
    unit: 'LF',
  },
]

const tierColors = {
  builder: 'bg-gray-100 text-gray-700',
  standard: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
  luxury: 'bg-amber-100 text-amber-700',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(2)
}

function LineItemCard({ item }: { item: LineItem }) {
  const [expanded, setExpanded] = useState(false)
  const totalPerUnit = item.selection.materialCost + item.selection.laborCost
  const lineTotal = totalPerUnit * item.quantity

  return (
    <div className={cn(
      "border rounded-lg bg-white overflow-hidden",
      item.isAllowance ? "border-amber-200" : "border-gray-200"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              {item.isAllowance && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                  ALLOWANCE
                </span>
              )}
              <span className="font-medium text-gray-900">{item.name}</span>
            </div>
            <div className="text-sm text-gray-500">{item.selection.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={cn("text-xs px-2 py-1 rounded font-medium", tierColors[item.selection.tier])}>
            {item.selection.tier.charAt(0).toUpperCase() + item.selection.tier.slice(1)}
          </span>
          <span className="text-sm text-gray-600">
            {item.quantity} {item.unit} × ${totalPerUnit.toFixed(2)}
          </span>
          <span className="font-semibold text-gray-900 w-24 text-right">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Selection</label>
              <div className="mt-1 flex items-center gap-2">
                <select className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>{item.selection.name}</option>
                  <option>Hardie Soffit Panel</option>
                  <option>Brazilian Hardwood</option>
                  <option>Vinyl Soffit</option>
                </select>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Material</label>
                <div className="mt-1 text-sm">${item.selection.materialCost.toFixed(2)}/{item.unit}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Labor</label>
                <div className="mt-1 text-sm">${item.selection.laborCost.toFixed(2)}/{item.unit}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{item.selection.leadTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Package className="h-4 w-4" />
              <span>{item.selection.vendor}</span>
            </div>
          </div>

          {item.aiNote && (
            <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              item.aiNote.includes('⚠️') ? "bg-amber-50" : "bg-blue-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                item.aiNote.includes('⚠️') ? "text-amber-500" : "text-blue-500"
              )} />
              <span className={item.aiNote.includes('⚠️') ? "text-amber-700" : "text-blue-700"}>
                {item.aiNote.replace('⚠️ ', '')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function EstimatesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const categories = [...new Set(mockLineItems.map(item => item.category))]
  const filteredItems = sortItems(
    mockLineItems.filter(item => {
      if (!matchesSearch(item, search, ['name', 'category'])) return false
      if (activeTab !== 'all' && item.category !== activeTab) return false
      return true
    }),
    activeSort as keyof LineItem | '',
    sortDirection,
  )

  const subtotal = mockLineItems.reduce((sum, item) => {
    const total = (item.selection.materialCost + item.selection.laborCost) * item.quantity
    return sum + total
  }, 0)
  const markupAmount = subtotal * 0.18
  const contingency = subtotal * 0.05
  const grandTotal = subtotal + markupAmount + contingency
  const totalSf = 3500
  const costPerSf = grandTotal / totalSf

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Smith Residence Estimate</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">v2 Draft</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              3,500 SF | Coastal Elevated | Default Tier: Premium
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Copy className="h-4 w-4" />
              Clone
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FileText className="h-4 w-4" />
              Convert to Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search items..."
          tabs={[
            { key: 'all', label: 'All', count: mockLineItems.length },
            ...categories.map(cat => ({
              key: cat,
              label: cat,
              count: mockLineItems.filter(item => item.category === cat).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'category', label: 'Category' },
            { value: 'quantity', label: 'Quantity' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Add Line Item', onClick: () => {} }]}
          resultCount={filteredItems.length}
          totalCount={mockLineItems.length}
        />
      </div>

      {/* Line Items */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredItems.map(item => (
          <LineItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Subtotal</div>
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(subtotal)}</div>
          </div>
          <div>
            <div className="text-gray-500">Markup (18%)</div>
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(markupAmount)}</div>
          </div>
          <div>
            <div className="text-gray-500">Contingency (5%)</div>
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(contingency)}</div>
          </div>
          <div>
            <div className="text-gray-500">Total ({formatCurrency(costPerSf)}/SF)</div>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(grandTotal)}</div>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              1 lead time concern
            </span>
            <span>|</span>
            <span>1 allowance likely to upgrade</span>
            <span>|</span>
            <span>95% confidence on pricing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
