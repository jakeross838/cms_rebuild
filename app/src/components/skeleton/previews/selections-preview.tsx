'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
  Package,
  Calendar,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Selection {
  id: string
  category: string
  itemName: string
  selectedProduct: string | null
  price: number
  allowance: number
  status: 'pending' | 'selected' | 'ordered' | 'installed'
  deadline: string
  daysUntilDeadline: number
  vendor?: string
  aiNote?: string
}

const mockSelections: Selection[] = [
  {
    id: '1',
    category: 'Flooring',
    itemName: 'Master Bedroom Hardwood',
    selectedProduct: 'White Oak 5" Engineered',
    price: 8500,
    allowance: 7500,
    status: 'ordered',
    deadline: 'Dec 15',
    daysUntilDeadline: 18,
    vendor: 'ABC Flooring',
  },
  {
    id: '2',
    category: 'Flooring',
    itemName: 'Living Area Tile',
    selectedProduct: 'Porcelain 24x24 Gray',
    price: 4200,
    allowance: 4500,
    status: 'selected',
    deadline: 'Dec 20',
    daysUntilDeadline: 23,
    vendor: 'Tile Warehouse',
  },
  {
    id: '3',
    category: 'Fixtures',
    itemName: 'Master Bath Faucets',
    selectedProduct: null,
    price: 0,
    allowance: 1200,
    status: 'pending',
    deadline: 'Dec 10',
    daysUntilDeadline: 3,
    aiNote: 'Decision needed in 3 days to avoid schedule delay',
  },
  {
    id: '4',
    category: 'Fixtures',
    itemName: 'Kitchen Sink',
    selectedProduct: 'Kohler Farmhouse 33"',
    price: 850,
    allowance: 800,
    status: 'installed',
    deadline: 'Nov 25',
    daysUntilDeadline: -12,
    vendor: 'Plumbing Supply Co',
  },
  {
    id: '5',
    category: 'Appliances',
    itemName: 'Refrigerator',
    selectedProduct: 'Sub-Zero 48" Built-in',
    price: 12500,
    allowance: 8000,
    status: 'ordered',
    deadline: 'Jan 5',
    daysUntilDeadline: 39,
    vendor: 'Elite Appliances',
    aiNote: '12-week lead time - on track for install',
  },
  {
    id: '6',
    category: 'Appliances',
    itemName: 'Range/Oven',
    selectedProduct: null,
    price: 0,
    allowance: 6000,
    status: 'pending',
    deadline: 'Dec 8',
    daysUntilDeadline: 1,
    aiNote: 'Critical: Must select today to meet schedule',
  },
  {
    id: '7',
    category: 'Appliances',
    itemName: 'Dishwasher',
    selectedProduct: 'Miele G7000',
    price: 1800,
    allowance: 1500,
    status: 'selected',
    deadline: 'Dec 15',
    daysUntilDeadline: 18,
    vendor: 'Elite Appliances',
  },
  {
    id: '8',
    category: 'Countertops',
    itemName: 'Kitchen Counters',
    selectedProduct: 'Calacatta Quartz',
    price: 9200,
    allowance: 8500,
    status: 'ordered',
    deadline: 'Dec 18',
    daysUntilDeadline: 21,
    vendor: 'Stone Masters',
  },
  {
    id: '9',
    category: 'Countertops',
    itemName: 'Master Bath Vanity Top',
    selectedProduct: null,
    price: 0,
    allowance: 2500,
    status: 'pending',
    deadline: 'Dec 22',
    daysUntilDeadline: 25,
  },
  {
    id: '10',
    category: 'Lighting',
    itemName: 'Dining Chandelier',
    selectedProduct: 'Visual Comfort Darlana',
    price: 2400,
    allowance: 2000,
    status: 'selected',
    deadline: 'Jan 10',
    daysUntilDeadline: 44,
    vendor: 'Lighting Design Co',
  },
  {
    id: '11',
    category: 'Lighting',
    itemName: 'Recessed Lighting Package',
    selectedProduct: 'Lutron LED 4"',
    price: 3200,
    allowance: 3500,
    status: 'installed',
    deadline: 'Nov 20',
    daysUntilDeadline: -17,
    vendor: 'Electric Supply',
  },
  {
    id: '12',
    category: 'Cabinetry',
    itemName: 'Kitchen Cabinets',
    selectedProduct: 'Custom Shaker Maple',
    price: 28000,
    allowance: 25000,
    status: 'ordered',
    deadline: 'Dec 1',
    daysUntilDeadline: 4,
    vendor: 'Custom Cabinet Co',
  },
]

const categories = ['All', 'Flooring', 'Fixtures', 'Appliances', 'Countertops', 'Lighting', 'Cabinetry']
const statuses = ['All', 'Pending', 'Selected', 'Ordered', 'Installed']

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  selected: { label: 'Selected', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  ordered: { label: 'Ordered', color: 'bg-purple-100 text-purple-700', icon: Package },
  installed: { label: 'Installed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function SelectionCard({ selection }: { selection: Selection }) {
  const config = statusConfig[selection.status]
  const StatusIcon = config.icon
  const overAllowance = selection.price > selection.allowance
  const variance = selection.price - selection.allowance

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      selection.status === 'pending' && selection.daysUntilDeadline <= 3
        ? "border-amber-300"
        : "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase">{selection.category}</span>
            {selection.status === 'pending' && selection.daysUntilDeadline <= 3 && (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            )}
          </div>
          <h4 className="font-medium text-gray-900">{selection.itemName}</h4>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="mb-3">
        {selection.selectedProduct ? (
          <p className="text-sm text-gray-700">{selection.selectedProduct}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No selection made</p>
        )}
        {selection.vendor && (
          <p className="text-xs text-gray-500 mt-1">{selection.vendor}</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            <span className={cn(
              "font-medium",
              overAllowance ? "text-red-600" : "text-gray-900"
            )}>
              {selection.price > 0 ? formatCurrency(selection.price) : '-'}
            </span>
          </div>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{formatCurrency(selection.allowance)} allow.</span>
        </div>
        {selection.price > 0 && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            overAllowance ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          )}>
            {overAllowance ? '+' : ''}{formatCurrency(variance)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", config.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs",
          selection.daysUntilDeadline <= 3 && selection.status === 'pending'
            ? "text-amber-600 font-medium"
            : "text-gray-500"
        )}>
          <Calendar className="h-3.5 w-3.5" />
          <span>{selection.deadline}</span>
          {selection.status === 'pending' && selection.daysUntilDeadline > 0 && (
            <span className="text-gray-400">({selection.daysUntilDeadline}d)</span>
          )}
        </div>
      </div>

      {selection.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2 text-xs",
          selection.daysUntilDeadline <= 3 ? "bg-amber-50" : "bg-blue-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            selection.daysUntilDeadline <= 3 ? "text-amber-500" : "text-blue-500"
          )} />
          <span className={selection.daysUntilDeadline <= 3 ? "text-amber-700" : "text-blue-700"}>
            {selection.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

function SelectionRow({ selection }: { selection: Selection }) {
  const config = statusConfig[selection.status]
  const StatusIcon = config.icon
  const overAllowance = selection.price > selection.allowance
  const variance = selection.price - selection.allowance

  return (
    <tr className={cn(
      "hover:bg-gray-50",
      selection.status === 'pending' && selection.daysUntilDeadline <= 3 && "bg-amber-50/50"
    )}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
            {selection.category}
          </span>
          {selection.status === 'pending' && selection.daysUntilDeadline <= 3 && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900">{selection.itemName}</div>
        {selection.vendor && (
          <div className="text-xs text-gray-500">{selection.vendor}</div>
        )}
      </td>
      <td className="py-3 px-4">
        {selection.selectedProduct ? (
          <span className="text-sm text-gray-700">{selection.selectedProduct}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">Not selected</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <span className={cn(
          "font-medium",
          overAllowance ? "text-red-600" : "text-gray-900"
        )}>
          {selection.price > 0 ? formatCurrency(selection.price) : '-'}
        </span>
        <div className="text-xs text-gray-500">{formatCurrency(selection.allowance)} allow.</div>
      </td>
      <td className="py-3 px-4 text-right">
        {selection.price > 0 && (
          <span className={cn(
            "text-sm font-medium",
            overAllowance ? "text-red-600" : "text-green-600"
          )}>
            {overAllowance ? '+' : ''}{formatCurrency(variance)}
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", config.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className={cn(
          "text-sm",
          selection.daysUntilDeadline <= 3 && selection.status === 'pending'
            ? "text-amber-600 font-medium"
            : "text-gray-600"
        )}>
          {selection.deadline}
        </div>
      </td>
    </tr>
  )
}

export function SelectionsPreview() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const filteredSelections = mockSelections.filter(selection => {
    const categoryMatch = selectedCategory === 'All' || selection.category === selectedCategory
    const statusMatch = selectedStatus === 'All' || selection.status === selectedStatus.toLowerCase()
    return categoryMatch && statusMatch
  })

  // Calculate stats
  const totalSelections = mockSelections.length
  const selectionsMade = mockSelections.filter(s => s.status !== 'pending').length
  const pendingDecisions = mockSelections.filter(s => s.status === 'pending').length
  const urgentDecisions = mockSelections.filter(s => s.status === 'pending' && s.daysUntilDeadline <= 3).length

  const totalAllowance = mockSelections.reduce((sum, s) => sum + s.allowance, 0)
  const totalSelected = mockSelections.reduce((sum, s) => sum + s.price, 0)
  const totalVariance = totalSelected - totalAllowance
  const selectionsWithPrices = mockSelections.filter(s => s.price > 0)
  const varianceFromSelected = selectionsWithPrices.reduce((sum, s) => sum + (s.price - s.allowance), 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Client Selections</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Smith Residence</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {selectionsMade} of {totalSelections} selections made | {pendingDecisions} pending
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search selections..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5",
                  viewMode === 'grid' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5",
                  viewMode === 'list' ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Selection
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <CheckCircle className="h-4 w-4" />
              Selections Made
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {selectionsMade} <span className="text-sm font-normal text-gray-500">/ {totalSelections}</span>
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            urgentDecisions > 0 ? "bg-amber-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              urgentDecisions > 0 ? "text-amber-600" : "text-gray-500"
            )}>
              <Clock className="h-4 w-4" />
              Pending Decisions
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              urgentDecisions > 0 ? "text-amber-700" : "text-gray-900"
            )}>
              {pendingDecisions}
              {urgentDecisions > 0 && (
                <span className="text-sm font-medium text-amber-600 ml-2">({urgentDecisions} urgent)</span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Allowance
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalAllowance)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            varianceFromSelected > 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              varianceFromSelected > 0 ? "text-red-600" : "text-green-600"
            )}>
              <DollarSign className="h-4 w-4" />
              Over/Under Allowance
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              varianceFromSelected > 0 ? "text-red-700" : "text-green-700"
            )}>
              {varianceFromSelected > 0 ? '+' : ''}{formatCurrency(varianceFromSelected)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Category:</span>
          <div className="flex items-center gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 text-sm rounded-lg transition-colors",
                  selectedCategory === cat
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="p-4 grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {filteredSelections.map(selection => (
            <SelectionCard key={selection.id} selection={selection} />
          ))}
          {filteredSelections.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No selections match the current filters
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Selected Product</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Variance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Deadline</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredSelections.map(selection => (
                <SelectionRow key={selection.id} selection={selection} />
              ))}
              {filteredSelections.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No selections match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Alert:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              2 selections need decisions this week to avoid schedule delays
            </span>
            <span>|</span>
            <span>Range/Oven selection critical - must select today</span>
            <span>|</span>
            <span>Master Bath Faucets deadline in 3 days</span>
          </div>
        </div>
      </div>
    </div>
  )
}
