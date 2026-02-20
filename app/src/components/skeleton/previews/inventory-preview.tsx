'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRightLeft,
  Sparkles,
  MoreHorizontal,
  MapPin,
  Truck,
  Warehouse,
  TrendingUp,
  ArrowDownToLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// -- Types -------------------------------------------------------------------

type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

type LocationType = 'warehouse' | 'job_site' | 'vehicle'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  location: string
  locationType: LocationType
  qtyOnHand: number
  reorderPoint: number
  uom: string
  unitCost: number
  totalValue: number
  status: InventoryStatus
  lastActivity: string
  lastActivityType: string
}

// -- Mock Data ---------------------------------------------------------------

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: '12/2 Romex NM-B Wire',
    sku: 'ELEC-1202-NMB',
    category: 'Electrical',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 2400,
    reorderPoint: 500,
    uom: 'ft',
    unitCost: 0.58,
    totalValue: 1392.00,
    status: 'in_stock',
    lastActivity: '2026-02-18',
    lastActivityType: 'Received 1,000 ft',
  },
  {
    id: '2',
    name: '2x4x8 SPF Studs',
    sku: 'LBR-2048-SPF',
    category: 'Lumber',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 850,
    reorderPoint: 200,
    uom: 'ea',
    unitCost: 3.89,
    totalValue: 3306.50,
    status: 'in_stock',
    lastActivity: '2026-02-17',
    lastActivityType: 'Issued 120 to Smith Residence',
  },
  {
    id: '3',
    name: '1/2" Type L Copper Pipe',
    sku: 'PLMB-050-COPL',
    category: 'Plumbing',
    location: 'Job Site - Smith Residence',
    locationType: 'job_site',
    qtyOnHand: 120,
    reorderPoint: 200,
    uom: 'ft',
    unitCost: 4.25,
    totalValue: 510.00,
    status: 'low_stock',
    lastActivity: '2026-02-16',
    lastActivityType: 'Issued 80 ft to rough-in',
  },
  {
    id: '4',
    name: '5/8" Drywall Sheets',
    sku: 'DRY-058-4X8',
    category: 'Drywall',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 240,
    reorderPoint: 50,
    uom: 'sheets',
    unitCost: 14.50,
    totalValue: 3480.00,
    status: 'in_stock',
    lastActivity: '2026-02-15',
    lastActivityType: 'Received 100 sheets',
  },
  {
    id: '5',
    name: 'PEX Crimp Rings 3/4"',
    sku: 'PLMB-PEX-CR34',
    category: 'Plumbing',
    location: 'Truck #3 - Carlos M.',
    locationType: 'vehicle',
    qtyOnHand: 45,
    reorderPoint: 100,
    uom: 'ea',
    unitCost: 0.85,
    totalValue: 38.25,
    status: 'low_stock',
    lastActivity: '2026-02-14',
    lastActivityType: 'Transferred from warehouse',
  },
  {
    id: '6',
    name: 'Concrete Mix 80lb bags',
    sku: 'CONC-080-QK',
    category: 'Concrete',
    location: 'Job Site - Harbor View',
    locationType: 'job_site',
    qtyOnHand: 32,
    reorderPoint: 10,
    uom: 'bags',
    unitCost: 6.48,
    totalValue: 207.36,
    status: 'in_stock',
    lastActivity: '2026-02-13',
    lastActivityType: 'Delivered 40 bags',
  },
  {
    id: '7',
    name: '3" PVC DWV Pipe',
    sku: 'PLMB-300-DWV',
    category: 'Plumbing',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 0,
    reorderPoint: 100,
    uom: 'ft',
    unitCost: 3.12,
    totalValue: 0,
    status: 'out_of_stock',
    lastActivity: '2026-02-12',
    lastActivityType: 'Issued last 60 ft to Harbor View',
  },
  {
    id: '8',
    name: 'R-19 Kraft Faced Insulation',
    sku: 'INS-R19-KF',
    category: 'Insulation',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 18,
    reorderPoint: 5,
    uom: 'rolls',
    unitCost: 42.99,
    totalValue: 773.82,
    status: 'in_stock',
    lastActivity: '2026-02-11',
    lastActivityType: 'Received 24 rolls',
  },
  {
    id: '9',
    name: '15lb Felt Paper',
    sku: 'ROOF-15LB-FP',
    category: 'Roofing',
    location: 'Job Site - Oak Manor',
    locationType: 'job_site',
    qtyOnHand: 6,
    reorderPoint: 10,
    uom: 'rolls',
    unitCost: 24.50,
    totalValue: 147.00,
    status: 'low_stock',
    lastActivity: '2026-02-10',
    lastActivityType: 'Issued 4 rolls to framing crew',
  },
  {
    id: '10',
    name: 'Simpson Strong-Tie H10',
    sku: 'HDW-SST-H10',
    category: 'Hardware',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 500,
    reorderPoint: 100,
    uom: 'ea',
    unitCost: 1.42,
    totalValue: 710.00,
    status: 'in_stock',
    lastActivity: '2026-02-09',
    lastActivityType: 'Issued 50 to Johnson Beach House',
  },
  {
    id: '11',
    name: 'Interior Latex Paint (5gal)',
    sku: 'PNT-INT-LTX5',
    category: 'Paint',
    location: 'Truck #1 - Mike R.',
    locationType: 'vehicle',
    qtyOnHand: 3,
    reorderPoint: 5,
    uom: 'buckets',
    unitCost: 148.00,
    totalValue: 444.00,
    status: 'low_stock',
    lastActivity: '2026-02-08',
    lastActivityType: 'Loaded 3 buckets for touch-up',
  },
  {
    id: '12',
    name: '200A Main Breaker Panel',
    sku: 'ELEC-200A-MBP',
    category: 'Electrical',
    location: 'Main Warehouse',
    locationType: 'warehouse',
    qtyOnHand: 4,
    reorderPoint: 2,
    uom: 'ea',
    unitCost: 189.00,
    totalValue: 756.00,
    status: 'in_stock',
    lastActivity: '2026-02-07',
    lastActivityType: 'Received 2 panels from HD Supply',
  },
]

// -- Status Config -----------------------------------------------------------

const statusConfig: Record<InventoryStatus, { label: string; color: string; bgColor: string }> = {
  in_stock: { label: 'In Stock', color: 'text-green-700', bgColor: 'bg-green-100' },
  low_stock: { label: 'Low Stock', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  out_of_stock: { label: 'Out of Stock', color: 'text-red-700', bgColor: 'bg-red-100' },
}

const locationIcons: Record<LocationType, typeof Warehouse> = {
  warehouse: Warehouse,
  job_site: MapPin,
  vehicle: Truck,
}

// -- Helpers -----------------------------------------------------------------

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatNumber(value: number): string {
  return value.toLocaleString()
}

// -- Main Component ----------------------------------------------------------

export function InventoryPreview() {
  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    activeSort,
    setActiveSort,
    sortDirection,
    toggleSortDirection,
  } = useFilterState()

  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const categories = [...new Set(mockInventory.map(i => i.category))]
  const locations = [...new Set(mockInventory.map(i => i.location))]

  // Filter items
  const filteredItems = sortItems(
    mockInventory.filter(item => {
      if (!matchesSearch(item, search, ['name', 'sku', 'category', 'location'])) return false
      if (activeTab !== 'all' && item.status !== activeTab) return false
      if (locationFilter !== 'all') {
        if (locationFilter === 'warehouse' && item.locationType !== 'warehouse') return false
        if (locationFilter === 'job_site' && item.locationType !== 'job_site') return false
        if (locationFilter === 'vehicle' && item.locationType !== 'vehicle') return false
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      return true
    }),
    activeSort as keyof InventoryItem | '',
    sortDirection,
  )

  // Calculate stats
  const totalItems = mockInventory.length
  const totalValue = mockInventory.reduce((sum, i) => sum + i.totalValue, 0)
  const lowStockCount = mockInventory.filter(i => i.status === 'low_stock').length
  const outOfStockCount = mockInventory.filter(i => i.status === 'out_of_stock').length
  const lowStockAlerts = lowStockCount + outOfStockCount
  const pendingTransfers = 3 // mock value

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Inventory & Materials</h3>
              <span className="text-sm text-warm-500">
                {totalItems} items | {formatCurrency(totalValue)} total value
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <ArrowDownToLine className="h-4 w-4" />
              Receive
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Package className="h-4 w-4" />
              Total Items
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{totalItems}</div>
            <div className="text-xs text-warm-500 mt-0.5">Across {locations.length} locations</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Value
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-green-600 mt-0.5">
              <TrendingUp className="h-3 w-3 inline mr-0.5" />
              +4.2% from last month
            </div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            lowStockAlerts > 0 ? 'bg-amber-50' : 'bg-warm-50',
          )}>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              lowStockAlerts > 0 ? 'text-amber-600' : 'text-warm-600',
            )}>
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts
            </div>
            <div className={cn(
              'text-xl font-bold mt-1',
              lowStockAlerts > 0 ? 'text-amber-700' : 'text-warm-500',
            )}>
              {lowStockAlerts}
            </div>
            {outOfStockCount > 0 && (
              <div className="text-xs text-red-600 mt-0.5">{outOfStockCount} out of stock</div>
            )}
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <ArrowRightLeft className="h-4 w-4" />
              Pending Transfers
            </div>
            <div className="text-xl font-bold text-warm-700 mt-1">{pendingTransfers}</div>
            <div className="text-xs text-stone-600 mt-0.5">2 inbound, 1 outbound</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search items, SKUs, categories..."
          tabs={[
            { key: 'all', label: 'All', count: mockInventory.length },
            { key: 'in_stock', label: 'In Stock', count: mockInventory.filter(i => i.status === 'in_stock').length },
            { key: 'low_stock', label: 'Low Stock', count: mockInventory.filter(i => i.status === 'low_stock').length },
            { key: 'out_of_stock', label: 'Out of Stock', count: mockInventory.filter(i => i.status === 'out_of_stock').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Locations',
              value: locationFilter,
              options: [
                { value: 'warehouse', label: 'Warehouse' },
                { value: 'job_site', label: 'Job Sites' },
                { value: 'vehicle', label: 'Vehicles' },
              ],
              onChange: setLocationFilter,
            },
            {
              label: 'All Categories',
              value: categoryFilter,
              options: categories.map(c => ({ value: c, label: c })),
              onChange: setCategoryFilter,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Item Name' },
            { value: 'sku', label: 'SKU' },
            { value: 'category', label: 'Category' },
            { value: 'qtyOnHand', label: 'Qty on Hand' },
            { value: 'totalValue', label: 'Total Value' },
            { value: 'status', label: 'Status' },
            { value: 'lastActivity', label: 'Last Activity' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredItems.length}
          totalCount={mockInventory.length}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-50 sticky top-0 z-10">
            <tr>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-500">Item Name</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-500">SKU</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-500">Category</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-500">Location</th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-warm-500">Qty</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-500">UOM</th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-warm-500">Unit Cost</th>
              <th className="text-right py-2.5 px-3 text-xs font-medium text-warm-500">Total Value</th>
              <th className="text-center py-2.5 px-3 text-xs font-medium text-warm-500">Status</th>
              <th className="text-left py-2.5 px-3 text-xs font-medium text-warm-500">Last Activity</th>
              <th className="text-center py-2.5 px-3 text-xs font-medium text-warm-500"></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const status = statusConfig[item.status]
              const LocationIcon = locationIcons[item.locationType]
              const isExpanded = expandedRow === item.id
              const stockPct = item.reorderPoint > 0
                ? Math.round((item.qtyOnHand / (item.reorderPoint * 3)) * 100)
                : 100

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-t border-warm-100 hover:bg-warm-50 transition-colors cursor-pointer',
                    item.status === 'out_of_stock' && 'bg-red-50/30',
                    item.status === 'low_stock' && 'bg-amber-50/20',
                  )}
                  onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-warm-900">{item.name}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs text-warm-500">{item.sku}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-warm-100 text-warm-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-warm-600">
                      <LocationIcon className="h-3.5 w-3.5 text-warm-400 flex-shrink-0" />
                      <span className="text-xs">{item.location}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn(
                      'font-medium',
                      item.status === 'out_of_stock' ? 'text-red-700' :
                      item.status === 'low_stock' ? 'text-amber-700' :
                      'text-warm-900',
                    )}>
                      {formatNumber(item.qtyOnHand)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-warm-500 text-xs">{item.uom}</td>
                  <td className="py-2.5 px-3 text-right text-warm-600">${item.unitCost.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-warm-900">
                    {formatCurrency(item.totalValue)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded font-medium inline-flex items-center gap-1',
                      status.bgColor,
                      status.color,
                    )}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-xs text-warm-500">{formatDate(item.lastActivity)}</div>
                    <div className="text-xs text-warm-400 truncate max-w-[140px]" title={item.lastActivityType}>
                      {item.lastActivityType}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      className="p-1 hover:bg-warm-100 rounded"
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <MoreHorizontal className="h-4 w-4 text-warm-400" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-warm-400 text-sm">
            <Package className="h-12 w-12 mx-auto mb-3 text-warm-300" />
            <p>No inventory items match your filters</p>
          </div>
        )}
      </div>

      {/* Stock Level Summary Bar */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm text-warm-500">Stock Levels:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
              <span className="text-xs text-warm-600">
                In Stock ({mockInventory.filter(i => i.status === 'in_stock').length})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              <span className="text-xs text-warm-600">
                Low Stock ({lowStockCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
              <span className="text-xs text-warm-600">
                Out of Stock ({outOfStockCount})
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-warm-500">
            <span>Warehouse: {mockInventory.filter(i => i.locationType === 'warehouse').length} items</span>
            <span className="text-warm-300">|</span>
            <span>Job Sites: {mockInventory.filter(i => i.locationType === 'job_site').length} items</span>
            <span className="text-warm-300">|</span>
            <span>Vehicles: {mockInventory.filter(i => i.locationType === 'vehicle').length} items</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Inventory Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            12/2 Romex running low at current usage rate -- recommend ordering 5,000 ft by Feb 25.
            PEX fittings 18% cheaper at HD Supply vs current vendor -- switching saves $340/month.
            3" PVC DWV Pipe is out of stock and needed for Harbor View rough-in scheduled Feb 22 -- place rush order.
            Drywall waste rate 8.2% this month (industry avg 5%) -- review cutting patterns on Smith Residence.
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Reorder Prediction',
            insight: '12/2 Romex running low at current usage rate. Recommend ordering 5,000 ft by Feb 25.',
          },
          {
            feature: 'Cost Optimization',
            insight: 'PEX fittings 18% cheaper from HD Supply vs current vendor. Switch saves $340/month.',
          },
          {
            feature: 'Waste Tracking',
            insight: 'Drywall waste rate 8.2% this month (industry avg 5%). Review cutting patterns on Smith Residence.',
          },
          {
            feature: 'Usage Forecasting',
            insight: 'Based on 3 active jobs, lumber consumption will spike 40% next month. Pre-order recommended.',
          },
          {
            feature: 'Transfer Optimization',
            insight: 'Smith Residence needs 200 ft copper pipe. Main Warehouse has 0 ft. Suggest reroute from Harbor View surplus.',
          },
        ]}
      />
    </div>
  )
}
