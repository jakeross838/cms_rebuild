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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface SelectionItem {
  id: string
  name: string
  category: string
  subcategory: string
  manufacturer: string
  model: string
  tier: 'Builder' | 'Standard' | 'Premium' | 'Luxury'
  materialCost: number
  laborCost: number
  unit: string
  leadTimeDays: number
  vendor: string
  isCoastalRated: boolean
  isActive: boolean
  priceChange?: number
  aiNote?: string
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
    tier: 'Premium',
    materialCost: 8.50,
    laborCost: 4.00,
    unit: 'LF',
    leadTimeDays: 14,
    vendor: 'ABC Lumber',
    isCoastalRated: true,
    isActive: true,
    priceChange: 18,
    aiNote: 'Price increased 18% in 6 months - consider alternatives',
  },
  {
    id: '2',
    name: 'Hardie Soffit Panel',
    category: 'Finishes',
    subcategory: 'Porch Ceiling',
    manufacturer: 'James Hardie',
    model: 'HSP-12',
    tier: 'Standard',
    materialCost: 4.25,
    laborCost: 3.50,
    unit: 'SF',
    leadTimeDays: 7,
    vendor: 'ABC Lumber',
    isCoastalRated: true,
    isActive: true,
  },
  {
    id: '3',
    name: 'White Oak 5" Engineered',
    category: 'Finishes',
    subcategory: 'Flooring',
    manufacturer: 'Mohawk',
    model: 'WO-ENG-5',
    tier: 'Premium',
    materialCost: 12.00,
    laborCost: 4.50,
    unit: 'SF',
    leadTimeDays: 21,
    vendor: 'Flooring Warehouse',
    isCoastalRated: false,
    isActive: true,
  },
  {
    id: '4',
    name: 'Porcelain Tile 24x24',
    category: 'Finishes',
    subcategory: 'Tile',
    manufacturer: 'Daltile',
    model: 'DT-2424-GR',
    tier: 'Standard',
    materialCost: 6.50,
    laborCost: 8.00,
    unit: 'SF',
    leadTimeDays: 10,
    vendor: 'Tile World',
    isCoastalRated: true,
    isActive: true,
    priceChange: -5,
  },
  {
    id: '5',
    name: 'PGT WinGuard Impact',
    category: 'Windows/Doors',
    subcategory: 'Windows',
    manufacturer: 'PGT',
    model: 'WG-2448',
    tier: 'Premium',
    materialCost: 450.00,
    laborCost: 85.00,
    unit: 'EA',
    leadTimeDays: 42,
    vendor: 'PGT Industries',
    isCoastalRated: true,
    isActive: true,
    aiNote: 'Lead time averaging 6 weeks - catalog says 4',
  },
  {
    id: '6',
    name: 'Kohler Farmhouse Sink 33"',
    category: 'Fixtures',
    subcategory: 'Plumbing',
    manufacturer: 'Kohler',
    model: 'K-5827-0',
    tier: 'Premium',
    materialCost: 850.00,
    laborCost: 150.00,
    unit: 'EA',
    leadTimeDays: 14,
    vendor: 'Plumbing Supply Co',
    isCoastalRated: false,
    isActive: true,
  },
  {
    id: '7',
    name: 'Delta Faucet Trinsic',
    category: 'Fixtures',
    subcategory: 'Plumbing',
    manufacturer: 'Delta',
    model: '9159-DST',
    tier: 'Standard',
    materialCost: 385.00,
    laborCost: 75.00,
    unit: 'EA',
    leadTimeDays: 7,
    vendor: 'Plumbing Supply Co',
    isCoastalRated: false,
    isActive: true,
  },
  {
    id: '8',
    name: 'Sub-Zero 48" Built-in',
    category: 'Appliances',
    subcategory: 'Kitchen',
    manufacturer: 'Sub-Zero',
    model: 'BI-48S',
    tier: 'Luxury',
    materialCost: 12500.00,
    laborCost: 450.00,
    unit: 'EA',
    leadTimeDays: 84,
    vendor: 'Elite Appliances',
    isCoastalRated: false,
    isActive: true,
  },
]

const tiers = ['All', 'Builder', 'Standard', 'Premium', 'Luxury']

const tierConfig = {
  Builder: { color: 'bg-gray-100 text-gray-700' },
  Standard: { color: 'bg-blue-100 text-blue-700' },
  Premium: { color: 'bg-purple-100 text-purple-700' },
  Luxury: { color: 'bg-amber-100 text-amber-700' },
}

function formatCurrency(value: number): string {
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function SelectionCard({ selection }: { selection: SelectionItem }) {
  const tierCfg = tierConfig[selection.tier]
  const totalCost = selection.materialCost + selection.laborCost

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Image className="h-8 w-8 text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {selection.isCoastalRated && (
              <span className="text-xs bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">Coastal</span>
            )}
            {selection.priceChange && selection.priceChange > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-red-600">
                <TrendingUp className="h-3 w-3" />
                +{selection.priceChange}%
              </span>
            )}
            {selection.priceChange && selection.priceChange < 0 && (
              <span className="flex items-center gap-0.5 text-xs text-green-600">
                <TrendingDown className="h-3 w-3" />
                {selection.priceChange}%
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900 truncate">{selection.name}</h4>
          <p className="text-sm text-gray-500">{selection.manufacturer} | {selection.model}</p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Material:</span>
          <span className="ml-1 font-medium text-gray-900">${selection.materialCost.toFixed(2)}/{selection.unit}</span>
        </div>
        <div>
          <span className="text-gray-500">Labor:</span>
          <span className="ml-1 font-medium text-gray-900">${selection.laborCost.toFixed(2)}/{selection.unit}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-2 py-1 rounded font-medium", tierCfg.color)}>
            {selection.tier}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {selection.leadTimeDays}d lead
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {selection.vendor}
          </span>
        </div>
      </div>

      {selection.aiNote && (
        <div className="mt-3 p-2 rounded-md bg-amber-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="text-amber-700">{selection.aiNote}</span>
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
      if (!matchesSearch(selection, search, ['name', 'manufacturer', 'model', 'vendor'])) return false
      const tierMatch = selectedTier === 'All' || selection.tier === selectedTier
      const categoryMatch = !selectedCategory || selection.category === selectedCategory
      const subcategoryMatch = !selectedSubcategory || selection.subcategory === selectedSubcategory
      return tierMatch && categoryMatch && subcategoryMatch
    }),
    activeSort as keyof SelectionItem | '',
    sortDirection,
  )

  // Calculate stats
  const totalSelections = mockSelections.length
  const totalCategories = mockCategories.length
  const coastalRated = mockSelections.filter(s => s.isCoastalRated).length
  const priceChanges = mockSelections.filter(s => s.priceChange && s.priceChange > 0).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Selections Catalog</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {totalSelections} selections
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            Master library of products, materials, and finishes
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search selections..."
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
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'Add Selection', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredSelections.length}
          totalCount={mockSelections.length}
        />
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Package className="h-4 w-4" />
              Total Selections
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalSelections}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Tag className="h-4 w-4" />
              Categories
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalCategories}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Building2 className="h-4 w-4" />
              Coastal Rated
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{coastalRated}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            priceChanges > 0 ? "bg-amber-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              priceChanges > 0 ? "text-amber-600" : "text-gray-500"
            )}>
              <TrendingUp className="h-4 w-4" />
              Price Increases
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              priceChanges > 0 ? "text-amber-700" : "text-gray-900"
            )}>
              {priceChanges}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Truck className="h-4 w-4" />
              Vendors
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">12</div>
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

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Price Intelligence:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span>Cypress T&G increased 18% in 6 months - consider Hardie alternative</span>
            <span>|</span>
            <span>PGT lead time averaging 6 weeks vs catalog 4 weeks</span>
            <span>|</span>
            <span>ABC Supply offering 5% discount on tile orders over $5K</span>
          </div>
        </div>
      </div>
    </div>
  )
}
