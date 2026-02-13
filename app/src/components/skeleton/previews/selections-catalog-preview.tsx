'use client'

import { useState } from 'react'
import {
  Plus,
  Sparkles,
  DollarSign,
  Clock,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Image,
  Package,
  TrendingUp,
  TrendingDown,
  Star,
  Truck,
  Building2,
  Tag,
  Upload,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  ShoppingCart,
  AlertTriangle,
  Eye,
  Paperclip,
  History,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type AvailabilityStatus = 'in_stock' | 'low_stock' | 'backordered' | 'discontinued' | 'special_order'
type ItemSource = 'builder' | 'designer' | 'client' | 'catalog'

interface SelectionItem {
  id: string
  name: string
  category: string
  subcategory: string
  manufacturer: string
  model: string
  sku: string
  tier: 'Builder' | 'Standard' | 'Premium' | 'Luxury'
  materialCost: number
  laborCost: number
  unit: string
  leadTimeDays: number
  vendor: string
  isCoastalRated: boolean
  isActive: boolean
  isDefaultForTier: boolean
  isAllowanceItem: boolean
  allowanceAmount: number | null
  availabilityStatus: AvailabilityStatus
  source: ItemSource
  usageCount: number
  specCount: number
  priceChange: number | null
  priceChangeDirection: 'up' | 'down' | null
  lastPriceUpdate: string
  aiNote: string | null
}

interface Category {
  name: string
  subcategories: string[]
  count: number
}

const mockCategories: Category[] = [
  { name: 'Finishes', subcategories: ['Flooring', 'Tile', 'Porch Ceiling', 'Paint'], count: 48 },
  { name: 'Fixtures', subcategories: ['Plumbing', 'Lighting', 'Hardware'], count: 36 },
  { name: 'Structural', subcategories: ['Lumber', 'Trusses', 'Concrete'], count: 24 },
  { name: 'Windows/Doors', subcategories: ['Windows', 'Exterior Doors', 'Interior Doors'], count: 32 },
  { name: 'Appliances', subcategories: ['Kitchen', 'Laundry', 'HVAC'], count: 18 },
]

const mockSelections: SelectionItem[] = [
  {
    id: '1',
    name: 'Cypress T&G 1x6',
    category: 'Finishes',
    subcategory: 'Porch Ceiling',
    manufacturer: 'Southern Pine',
    model: 'CYP-TG-1X6',
    sku: 'FIN-PC-001',
    tier: 'Premium',
    materialCost: 8.50,
    laborCost: 4.00,
    unit: 'LF',
    leadTimeDays: 14,
    vendor: 'ABC Lumber',
    isCoastalRated: true,
    isActive: true,
    isDefaultForTier: true,
    isAllowanceItem: false,
    allowanceAmount: null,
    availabilityStatus: 'in_stock',
    source: 'builder',
    usageCount: 34,
    specCount: 2,
    priceChange: 18,
    priceChangeDirection: 'up',
    lastPriceUpdate: '2 weeks ago',
    aiNote: 'Price increased 18% in 6 months -- consider Hardie alternative',
  },
  {
    id: '2',
    name: 'Hardie Soffit Panel',
    category: 'Finishes',
    subcategory: 'Porch Ceiling',
    manufacturer: 'James Hardie',
    model: 'HSP-12',
    sku: 'FIN-PC-002',
    tier: 'Standard',
    materialCost: 4.25,
    laborCost: 3.50,
    unit: 'SF',
    leadTimeDays: 7,
    vendor: 'ABC Lumber',
    isCoastalRated: true,
    isActive: true,
    isDefaultForTier: true,
    isAllowanceItem: false,
    allowanceAmount: null,
    availabilityStatus: 'in_stock',
    source: 'builder',
    usageCount: 28,
    specCount: 1,
    priceChange: null,
    priceChangeDirection: null,
    lastPriceUpdate: '1 month ago',
    aiNote: null,
  },
  {
    id: '3',
    name: 'White Oak 5" Engineered',
    category: 'Finishes',
    subcategory: 'Flooring',
    manufacturer: 'Mohawk',
    model: 'WO-ENG-5',
    sku: 'FIN-FL-001',
    tier: 'Premium',
    materialCost: 12.00,
    laborCost: 4.50,
    unit: 'SF',
    leadTimeDays: 21,
    vendor: 'Flooring Warehouse',
    isCoastalRated: false,
    isActive: true,
    isDefaultForTier: true,
    isAllowanceItem: true,
    allowanceAmount: 14.00,
    availabilityStatus: 'in_stock',
    source: 'builder',
    usageCount: 41,
    specCount: 3,
    priceChange: null,
    priceChangeDirection: null,
    lastPriceUpdate: '3 weeks ago',
    aiNote: null,
  },
  {
    id: '4',
    name: 'Porcelain Tile 24x24',
    category: 'Finishes',
    subcategory: 'Tile',
    manufacturer: 'Daltile',
    model: 'DT-2424-GR',
    sku: 'FIN-TL-001',
    tier: 'Standard',
    materialCost: 6.50,
    laborCost: 8.00,
    unit: 'SF',
    leadTimeDays: 10,
    vendor: 'Tile World',
    isCoastalRated: true,
    isActive: true,
    isDefaultForTier: false,
    isAllowanceItem: true,
    allowanceAmount: 12.00,
    availabilityStatus: 'low_stock',
    source: 'designer',
    usageCount: 22,
    specCount: 1,
    priceChange: -5,
    priceChangeDirection: 'down',
    lastPriceUpdate: '1 week ago',
    aiNote: null,
  },
  {
    id: '5',
    name: 'PGT WinGuard Impact',
    category: 'Windows/Doors',
    subcategory: 'Windows',
    manufacturer: 'PGT',
    model: 'WG-2448',
    sku: 'WD-WN-001',
    tier: 'Premium',
    materialCost: 450.00,
    laborCost: 85.00,
    unit: 'EA',
    leadTimeDays: 42,
    vendor: 'PGT Industries',
    isCoastalRated: true,
    isActive: true,
    isDefaultForTier: true,
    isAllowanceItem: false,
    allowanceAmount: null,
    availabilityStatus: 'special_order',
    source: 'builder',
    usageCount: 19,
    specCount: 2,
    priceChange: null,
    priceChangeDirection: null,
    lastPriceUpdate: '2 months ago',
    aiNote: 'Actual lead time averaging 6 weeks vs catalog 4 weeks',
  },
  {
    id: '6',
    name: 'Kohler Farmhouse Sink 33"',
    category: 'Fixtures',
    subcategory: 'Plumbing',
    manufacturer: 'Kohler',
    model: 'K-5827-0',
    sku: 'FIX-PL-001',
    tier: 'Premium',
    materialCost: 850.00,
    laborCost: 150.00,
    unit: 'EA',
    leadTimeDays: 14,
    vendor: 'Plumbing Supply Co',
    isCoastalRated: false,
    isActive: true,
    isDefaultForTier: true,
    isAllowanceItem: true,
    allowanceAmount: 800.00,
    availabilityStatus: 'in_stock',
    source: 'builder',
    usageCount: 38,
    specCount: 1,
    priceChange: null,
    priceChangeDirection: null,
    lastPriceUpdate: '3 weeks ago',
    aiNote: null,
  },
  {
    id: '7',
    name: 'Delta Faucet Trinsic',
    category: 'Fixtures',
    subcategory: 'Plumbing',
    manufacturer: 'Delta',
    model: '9159-DST',
    sku: 'FIX-PL-002',
    tier: 'Standard',
    materialCost: 385.00,
    laborCost: 75.00,
    unit: 'EA',
    leadTimeDays: 7,
    vendor: 'Plumbing Supply Co',
    isCoastalRated: false,
    isActive: true,
    isDefaultForTier: false,
    isAllowanceItem: false,
    allowanceAmount: null,
    availabilityStatus: 'in_stock',
    source: 'builder',
    usageCount: 45,
    specCount: 0,
    priceChange: null,
    priceChangeDirection: null,
    lastPriceUpdate: '1 month ago',
    aiNote: null,
  },
  {
    id: '8',
    name: 'Sub-Zero 48" Built-in',
    category: 'Appliances',
    subcategory: 'Kitchen',
    manufacturer: 'Sub-Zero',
    model: 'BI-48S',
    sku: 'APP-KT-001',
    tier: 'Luxury',
    materialCost: 12500.00,
    laborCost: 450.00,
    unit: 'EA',
    leadTimeDays: 84,
    vendor: 'Elite Appliances',
    isCoastalRated: false,
    isActive: true,
    isDefaultForTier: true,
    isAllowanceItem: true,
    allowanceAmount: 8000.00,
    availabilityStatus: 'special_order',
    source: 'builder',
    usageCount: 8,
    specCount: 1,
    priceChange: 5,
    priceChangeDirection: 'up',
    lastPriceUpdate: '1 month ago',
    aiNote: null,
  },
  {
    id: '9',
    name: 'GE Profile Range (Discontinued)',
    category: 'Appliances',
    subcategory: 'Kitchen',
    manufacturer: 'GE',
    model: 'PGS960-OLD',
    sku: 'APP-KT-005',
    tier: 'Standard',
    materialCost: 2200.00,
    laborCost: 200.00,
    unit: 'EA',
    leadTimeDays: 0,
    vendor: 'N/A',
    isCoastalRated: false,
    isActive: false,
    isDefaultForTier: false,
    isAllowanceItem: false,
    allowanceAmount: null,
    availabilityStatus: 'discontinued',
    source: 'builder',
    usageCount: 15,
    specCount: 0,
    priceChange: null,
    priceChangeDirection: null,
    lastPriceUpdate: '3 months ago',
    aiNote: 'Discontinued by manufacturer. Suggest GE Profile PGS960-NEW as replacement.',
  },
]

const tiers = ['All', 'Builder', 'Standard', 'Premium', 'Luxury']

const tierConfig: Record<string, { color: string }> = {
  Builder: { color: 'bg-gray-100 text-gray-700' },
  Standard: { color: 'bg-blue-100 text-blue-700' },
  Premium: { color: 'bg-purple-100 text-purple-700' },
  Luxury: { color: 'bg-amber-100 text-amber-700' },
}

const availabilityConfig: Record<AvailabilityStatus, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'text-green-600' },
  low_stock: { label: 'Low Stock', color: 'text-amber-600' },
  backordered: { label: 'Backordered', color: 'text-red-600' },
  discontinued: { label: 'Discontinued', color: 'text-red-700' },
  special_order: { label: 'Special Order', color: 'text-blue-600' },
}

const sourceConfig: Record<ItemSource, { label: string; color: string }> = {
  builder: { label: 'Builder', color: 'bg-gray-100 text-gray-600' },
  designer: { label: 'Designer', color: 'bg-pink-100 text-pink-600' },
  client: { label: 'Client', color: 'bg-blue-100 text-blue-600' },
  catalog: { label: 'Catalog', color: 'bg-indigo-100 text-indigo-600' },
}

function formatCurrency(value: number): string {
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function SelectionCard({ selection }: { selection: SelectionItem }) {
  const tierCfg = tierConfig[selection.tier]
  const availCfg = availabilityConfig[selection.availabilityStatus]
  const srcCfg = sourceConfig[selection.source]
  const totalCost = selection.materialCost + selection.laborCost

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      !selection.isActive && "opacity-60 border-dashed border-gray-300",
      selection.availabilityStatus === 'discontinued' && "border-red-200",
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Image className="h-8 w-8 text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {selection.isCoastalRated && (
              <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">Coastal</span>
            )}
            {selection.isDefaultForTier && (
              <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star className="h-3 w-3" />
                Default
              </span>
            )}
            {selection.isAllowanceItem && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                Allow: {formatCurrency(selection.allowanceAmount ?? 0)}
              </span>
            )}
            <span className={cn("text-xs px-1.5 py-0.5 rounded", srcCfg.color)}>
              {srcCfg.label}
            </span>
            {selection.priceChange !== null && selection.priceChangeDirection === 'up' && (
              <span className="flex items-center gap-0.5 text-xs text-red-600">
                <TrendingUp className="h-3 w-3" />
                +{selection.priceChange}%
              </span>
            )}
            {selection.priceChange !== null && selection.priceChangeDirection === 'down' && (
              <span className="flex items-center gap-0.5 text-xs text-green-600">
                <TrendingDown className="h-3 w-3" />
                {selection.priceChange}%
              </span>
            )}
          </div>
          <h4 className={cn(
            "font-medium truncate",
            selection.isActive ? "text-gray-900" : "text-gray-500 line-through"
          )}>{selection.name}</h4>
          <p className="text-sm text-gray-500">{selection.manufacturer} | {selection.model}</p>
          <p className="text-xs text-gray-400 font-mono">{selection.sku}</p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Material:</span>
          <span className="ml-1 font-medium text-gray-900">${selection.materialCost.toFixed(2)}/{selection.unit}</span>
        </div>
        <div>
          <span className="text-gray-500">Labor:</span>
          <span className="ml-1 font-medium text-gray-900">${selection.laborCost.toFixed(2)}/{selection.unit}</span>
        </div>
        <div>
          <span className="text-gray-500">Total:</span>
          <span className="ml-1 font-semibold text-gray-900">${totalCost.toFixed(2)}/{selection.unit}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-2 py-1 rounded font-medium", tierCfg.color)}>
            {selection.tier}
          </span>
          <span className={cn("text-xs font-medium", availCfg.color)}>
            {availCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {selection.leadTimeDays}d
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {selection.vendor}
          </span>
        </div>
      </div>

      {/* Usage & specs indicators */}
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1" title="Used in estimates/jobs">
          <BarChart3 className="h-3 w-3" />
          Used {selection.usageCount}x
        </span>
        {selection.specCount > 0 && (
          <span className="flex items-center gap-1" title="Specification documents">
            <Paperclip className="h-3 w-3" />
            {selection.specCount} spec{selection.specCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="flex items-center gap-1" title="Last price update">
          <History className="h-3 w-3" />
          {selection.lastPriceUpdate}
        </span>
      </div>

      {selection.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2 text-xs",
          selection.availabilityStatus === 'discontinued' ? "bg-red-50" : "bg-amber-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            selection.availabilityStatus === 'discontinued' ? "text-red-500" : "text-amber-500"
          )} />
          <span className={selection.availabilityStatus === 'discontinued' ? "text-red-700" : "text-amber-700"}>
            {selection.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

function CategorySidebar({
  categories,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory
}: {
  categories: Category[]
  selectedCategory: string
  selectedSubcategory: string
  onSelectCategory: (cat: string) => void
  onSelectSubcategory: (sub: string) => void
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Finishes']))

  const toggleCategory = (cat: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat)
    } else {
      newExpanded.add(cat)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="w-48 border-r border-gray-200 bg-white">
      <div className="p-3 border-b border-gray-200">
        <h4 className="font-medium text-gray-700 text-sm">Categories</h4>
      </div>
      <div className="py-2">
        {categories.map(cat => {
          const isExpanded = expandedCategories.has(cat.name)
          return (
            <div key={cat.name}>
              <button
                onClick={() => toggleCategory(cat.name)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50",
                  selectedCategory === cat.name && "bg-blue-50 text-blue-700"
                )}
              >
                <span className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  {cat.name}
                </span>
                <span className="text-xs text-gray-400">{cat.count}</span>
              </button>
              {isExpanded && (
                <div className="ml-6 py-1">
                  {cat.subcategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        onSelectCategory(cat.name)
                        onSelectSubcategory(sub)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50",
                        selectedSubcategory === sub && "bg-blue-50 text-blue-700 font-medium"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SelectionsCatalogPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Finishes')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Porch Ceiling')
  const [selectedTier, setSelectedTier] = useState<string>('All')
  const { search, setSearch, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })

  const filteredSelections = sortItems(
    mockSelections.filter(selection => {
      if (!matchesSearch(selection, search, ['name', 'manufacturer', 'model', 'vendor', 'sku'])) return false
      const tierMatch = selectedTier === 'All' || selection.tier === selectedTier
      const categoryMatch = !selectedCategory || selection.category === selectedCategory
      const subcategoryMatch = !selectedSubcategory || selection.subcategory === selectedSubcategory
      return tierMatch && categoryMatch && subcategoryMatch
    }),
    activeSort as keyof SelectionItem | '',
    sortDirection,
  )

  // Calculate stats
  const activeSelections = mockSelections.filter(s => s.isActive)
  const totalSelections = activeSelections.length
  const totalCategories = mockCategories.length
  const coastalRated = activeSelections.filter(s => s.isCoastalRated).length
  const priceIncreases = activeSelections.filter(s => s.priceChangeDirection === 'up').length
  const priceDecreases = activeSelections.filter(s => s.priceChangeDirection === 'down').length
  const uniqueVendors = [...new Set(activeSelections.map(s => s.vendor))].length
  const discontinuedCount = mockSelections.filter(s => s.availabilityStatus === 'discontinued').length
  const allowanceItems = activeSelections.filter(s => s.isAllowanceItem).length
  const defaultItems = activeSelections.filter(s => s.isDefaultForTier).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Selections Catalog</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {totalSelections} active
            </span>
            {discontinuedCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {discontinuedCount} discontinued
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Master library of products, materials, and finishes with pricing tiers and vendor sources
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, SKU, manufacturer, vendor..."
          tabs={tiers.map(tier => ({
            key: tier === 'All' ? 'all' : tier,
            label: tier,
            count: tier === 'All' ? mockSelections.length : mockSelections.filter(s => s.tier === tier).length,
          }))}
          activeTab={selectedTier === 'All' ? 'all' : selectedTier}
          onTabChange={(tab) => setSelectedTier(tab === 'all' ? 'All' : tab)}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'materialCost', label: 'Material Cost' },
            { value: 'leadTimeDays', label: 'Lead Time' },
            { value: 'manufacturer', label: 'Manufacturer' },
            { value: 'usageCount', label: 'Usage' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'Add Selection', onClick: () => {}, variant: 'primary' },
            { icon: Upload, label: 'Bulk Import', onClick: () => {} },
            { icon: Download, label: 'Export', onClick: () => {} },
          ]}
          resultCount={filteredSelections.length}
          totalCount={mockSelections.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-8 gap-3">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Package className="h-3.5 w-3.5" />
              Active
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{totalSelections}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Tag className="h-3.5 w-3.5" />
              Categories
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{totalCategories}</div>
          </div>
          <div className="bg-cyan-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-cyan-600 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Coastal
            </div>
            <div className="text-lg font-bold text-cyan-700 mt-0.5">{coastalRated}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <Star className="h-3.5 w-3.5" />
              Defaults
            </div>
            <div className="text-lg font-bold text-green-700 mt-0.5">{defaultItems}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Allowances
            </div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{allowanceItems}</div>
          </div>
          <div className={cn(
            "rounded-lg p-2.5",
            priceIncreases > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-xs",
              priceIncreases > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <TrendingUp className="h-3.5 w-3.5" />
              Price Up
            </div>
            <div className={cn(
              "text-lg font-bold mt-0.5",
              priceIncreases > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {priceIncreases}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-2.5",
            priceDecreases > 0 ? "bg-green-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-xs",
              priceDecreases > 0 ? "text-green-600" : "text-gray-500"
            )}>
              <TrendingDown className="h-3.5 w-3.5" />
              Price Down
            </div>
            <div className={cn(
              "text-lg font-bold mt-0.5",
              priceDecreases > 0 ? "text-green-700" : "text-gray-900"
            )}>
              {priceDecreases}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Truck className="h-3.5 w-3.5" />
              Vendors
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{uniqueVendors}</div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        <CategorySidebar
          categories={mockCategories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={setSelectedCategory}
          onSelectSubcategory={setSelectedSubcategory}
        />

        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedSubcategory || selectedCategory}</span>
              <span className="text-gray-400 ml-2">({filteredSelections.length} selections)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
            {filteredSelections.map(selection => (
              <SelectionCard key={selection.id} selection={selection} />
            ))}
            {filteredSelections.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-500">
                No selections match the current filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cross-Module Connection Badges */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Connected:</span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Estimates
          </span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Job Selections
          </span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Proposals
          </span>
          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            Purchase Orders
          </span>
          <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Vendors
          </span>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Price Intelligence
          </span>
          <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Package className="h-3 w-3" />
            Assemblies
          </span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Price Intelligence:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Cypress T&G increased 18% -- Hardie alternative saves 40%
            </span>
            <span>|</span>
            <span>PGT actual lead time 6 weeks vs catalog 4 weeks</span>
            <span>|</span>
            <span>GE Profile range discontinued -- replacement available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
