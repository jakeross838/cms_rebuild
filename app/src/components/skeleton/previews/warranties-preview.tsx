'use client'

import { useState } from 'react'
import {
  Plus,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  Building2,
  Wrench,
  Zap,
  Droplets,
  Home,
  Thermometer,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Warranty {
  id: string
  itemName: string
  category: 'appliances' | 'roofing' | 'hvac' | 'plumbing' | 'electrical' | 'structural' | 'windows'
  vendor: string
  startDate: string
  endDate: string
  duration: string
  documentUrl?: string
  status: 'active' | 'expiring_soon' | 'expired'
  daysUntilExpiry?: number
  coverageType: 'full' | 'parts' | 'labor' | 'limited'
  aiNote?: string
}

const mockWarranties: Warranty[] = [
  {
    id: '1',
    itemName: 'Central HVAC System',
    category: 'hvac',
    vendor: 'Cool Air HVAC',
    startDate: '2024-01-15',
    endDate: '2029-01-15',
    duration: '5 years',
    documentUrl: '/docs/hvac-warranty.pdf',
    status: 'active',
    coverageType: 'full',
    aiNote: 'Manufacturer warranty includes annual maintenance. Schedule service before Jan 2025.',
  },
  {
    id: '2',
    itemName: 'Metal Roof System',
    category: 'roofing',
    vendor: 'Gulf Coast Roofing',
    startDate: '2023-06-20',
    endDate: '2053-06-20',
    duration: '30 years',
    documentUrl: '/docs/roof-warranty.pdf',
    status: 'active',
    coverageType: 'limited',
  },
  {
    id: '3',
    itemName: 'Water Heater',
    category: 'plumbing',
    vendor: 'Jones Plumbing',
    startDate: '2022-03-10',
    endDate: '2025-03-10',
    duration: '3 years',
    documentUrl: '/docs/water-heater-warranty.pdf',
    status: 'expiring_soon',
    daysUntilExpiry: 28,
    coverageType: 'parts',
    aiNote: 'Warranty expires in 28 days. Consider extended coverage or replacement.',
  },
  {
    id: '4',
    itemName: 'Impact Windows (Front)',
    category: 'windows',
    vendor: 'PGT Industries',
    startDate: '2024-02-01',
    endDate: '2034-02-01',
    duration: '10 years',
    documentUrl: '/docs/windows-warranty.pdf',
    status: 'active',
    coverageType: 'full',
  },
  {
    id: '5',
    itemName: 'Electrical Panel',
    category: 'electrical',
    vendor: 'Smith Electric',
    startDate: '2023-08-15',
    endDate: '2025-08-15',
    duration: '2 years',
    documentUrl: '/docs/electrical-warranty.pdf',
    status: 'active',
    daysUntilExpiry: 180,
    coverageType: 'labor',
  },
  {
    id: '6',
    itemName: 'Kitchen Appliances Bundle',
    category: 'appliances',
    vendor: 'Home Depot',
    startDate: '2022-11-01',
    endDate: '2024-11-01',
    duration: '2 years',
    status: 'expired',
    coverageType: 'full',
    aiNote: 'Warranty expired. Consider extended protection plan for high-value items.',
  },
  {
    id: '7',
    itemName: 'Foundation Slab',
    category: 'structural',
    vendor: 'Gulf Coast Concrete',
    startDate: '2023-05-01',
    endDate: '2033-05-01',
    duration: '10 years',
    documentUrl: '/docs/foundation-warranty.pdf',
    status: 'active',
    coverageType: 'limited',
  },
  {
    id: '8',
    itemName: 'Garage Door Opener',
    category: 'appliances',
    vendor: 'LiftMaster',
    startDate: '2023-09-15',
    endDate: '2025-03-15',
    duration: '18 months',
    documentUrl: '/docs/garage-warranty.pdf',
    status: 'expiring_soon',
    daysUntilExpiry: 35,
    coverageType: 'parts',
  },
]

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: ShieldCheck,
  },
  expiring_soon: {
    label: 'Expiring Soon',
    color: 'bg-amber-100 text-amber-700',
    icon: ShieldAlert,
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-700',
    icon: ShieldX,
  },
}

const categoryConfig = {
  appliances: { label: 'Appliances', icon: Home, color: 'bg-blue-50 text-blue-700' },
  roofing: { label: 'Roofing', icon: Building2, color: 'bg-orange-50 text-orange-700' },
  hvac: { label: 'HVAC', icon: Thermometer, color: 'bg-cyan-50 text-cyan-700' },
  plumbing: { label: 'Plumbing', icon: Droplets, color: 'bg-indigo-50 text-indigo-700' },
  electrical: { label: 'Electrical', icon: Zap, color: 'bg-yellow-50 text-yellow-700' },
  structural: { label: 'Structural', icon: Building2, color: 'bg-gray-100 text-gray-700' },
  windows: { label: 'Windows', icon: Home, color: 'bg-purple-50 text-purple-700' },
}

const coverageConfig = {
  full: { label: 'Full Coverage', color: 'bg-green-50 text-green-700' },
  parts: { label: 'Parts Only', color: 'bg-blue-50 text-blue-700' },
  labor: { label: 'Labor Only', color: 'bg-purple-50 text-purple-700' },
  limited: { label: 'Limited', color: 'bg-gray-100 text-gray-600' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function WarrantyCard({ warranty }: { warranty: Warranty }) {
  const status = statusConfig[warranty.status]
  const category = categoryConfig[warranty.category]
  const coverage = coverageConfig[warranty.coverageType]
  const StatusIcon = status.icon
  const CategoryIcon = category.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      warranty.status === 'expired' ? "border-red-200" :
      warranty.status === 'expiring_soon' ? "border-amber-200" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{warranty.itemName}</h4>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{warranty.vendor}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", category.color)}>
          <CategoryIcon className="h-3 w-3" />
          {category.label}
        </span>
        <span className={cn("text-xs px-2 py-1 rounded font-medium", coverage.color)}>
          {coverage.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>Start Date</span>
          </div>
          <span className="text-gray-700">{formatDate(warranty.startDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>End Date</span>
          </div>
          <span className={cn(
            "font-medium",
            warranty.status === 'expired' ? "text-red-600" :
            warranty.status === 'expiring_soon' ? "text-amber-600" : "text-gray-700"
          )}>
            {formatDate(warranty.endDate)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="h-3.5 w-3.5" />
            <span>Duration</span>
          </div>
          <span className="text-gray-700">{warranty.duration}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {warranty.documentUrl ? (
          <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
            <FileText className="h-4 w-4" />
            <span>View Document</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        ) : (
          <span className="text-xs text-gray-400">No document attached</span>
        )}
        {warranty.daysUntilExpiry !== undefined && warranty.status !== 'expired' && (
          <span className={cn(
            "text-xs font-medium",
            warranty.daysUntilExpiry <= 30 ? "text-amber-600" : "text-gray-500"
          )}>
            {warranty.daysUntilExpiry}d remaining
          </span>
        )}
      </div>

      {warranty.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2",
          warranty.status === 'expired' || warranty.status === 'expiring_soon'
            ? "bg-amber-50"
            : "bg-blue-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            warranty.status === 'expired' || warranty.status === 'expiring_soon'
              ? "text-amber-500"
              : "text-blue-500"
          )} />
          <span className={cn(
            "text-xs",
            warranty.status === 'expired' || warranty.status === 'expiring_soon'
              ? "text-amber-700"
              : "text-blue-700"
          )}>
            {warranty.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

export function WarrantiesPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({})

  const filteredWarranties = sortItems(
    mockWarranties.filter(warranty => {
      if (!matchesSearch(warranty, search, ['itemName', 'vendor', 'category'])) return false
      if (selectedCategory !== 'all' && warranty.category !== selectedCategory) return false
      if (activeTab !== 'all' && warranty.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Warranty | '',
    sortDirection,
  )

  // Calculate quick stats
  const activeWarranties = mockWarranties.filter(w => w.status === 'active').length
  const expiringIn30Days = mockWarranties.filter(w =>
    w.status === 'expiring_soon' && w.daysUntilExpiry !== undefined && w.daysUntilExpiry <= 30
  ).length
  const totalCoverage = mockWarranties.filter(w => w.status !== 'expired').length
  const totalItems = mockWarranties.length
  const coveragePercentage = Math.round((totalCoverage / totalItems) * 100)

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'structural', label: 'Structural' },
    { value: 'windows', label: 'Windows' },
  ]

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Warranties</h3>
          <span className="text-sm text-gray-500">{totalItems} items tracked | {coveragePercentage}% coverage active</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search warranties..."
          tabs={[
            { key: 'all', label: 'All', count: mockWarranties.length },
            { key: 'active', label: 'Active', count: mockWarranties.filter(w => w.status === 'active').length },
            { key: 'expiring_soon', label: 'Expiring Soon', count: mockWarranties.filter(w => w.status === 'expiring_soon').length },
            { key: 'expired', label: 'Expired', count: mockWarranties.filter(w => w.status === 'expired').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Categories',
              value: selectedCategory,
              options: categoryOptions.filter(o => o.value !== 'all'),
              onChange: (v) => setSelectedCategory(v),
            },
          ]}
          sortOptions={[
            { value: 'itemName', label: 'Item Name' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'endDate', label: 'End Date' },
            { value: 'category', label: 'Category' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Add Warranty', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredWarranties.length}
          totalCount={mockWarranties.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Active Warranties
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{activeWarranties}</div>
            <div className="text-xs text-green-600 mt-0.5">currently covered items</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Expiring in 30 Days
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{expiringIn30Days}</div>
            <div className="text-xs text-amber-600 mt-0.5">require attention soon</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Total Coverage
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{coveragePercentage}%</div>
            <div className="text-xs text-blue-600 mt-0.5">{totalCoverage} of {totalItems} items protected</div>
          </div>
        </div>
      </div>

      {/* Warranty Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredWarranties.map(warranty => (
          <WarrantyCard key={warranty.id} warranty={warranty} />
        ))}
        {filteredWarranties.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No warranties found
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Water heater warranty expires in 28 days
            </span>
            <span>|</span>
            <span>HVAC annual maintenance due before January</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <ShieldX className="h-3.5 w-3.5" />
              Kitchen appliances need coverage review
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
