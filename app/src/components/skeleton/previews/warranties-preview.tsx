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
  DollarSign,
  ClipboardCheck,
  Users,
  Phone,
  Mail,
  Link2,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WarrantyStatus = 'active' | 'expiring_soon' | 'expired'
type WarrantyType = 'builder' | 'manufacturer' | 'workmanship' | 'extended'
type CoverageType = 'full' | 'parts' | 'labor' | 'limited'
type CategoryType = 'appliances' | 'roofing' | 'hvac' | 'plumbing' | 'electrical' | 'structural' | 'windows' | 'exterior' | 'finish'

interface Warranty {
  id: string
  itemName: string
  category: CategoryType
  warrantyType: WarrantyType
  vendor: string
  manufacturer?: string
  startDate: string
  endDate: string
  duration: string
  documentUrl?: string
  status: WarrantyStatus
  daysUntilExpiry?: number
  coverageType: CoverageType
  registrationNumber?: string
  claimContact?: string
  claimPhone?: string
  selectionLink?: string
  costToDate?: number
  claimCount?: number
  aiNote?: string
}

interface WalkthroughSchedule {
  id: string
  type: '30_day' | '11_month' | '6_month' | '2_year' | 'custom'
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'overdue'
  findingsCount?: number
  completedBy?: string
  homeownerSigned?: boolean
}

interface WarrantyReserve {
  projectValue: number
  reservePercentage: number
  reserveAmount: number
  spentAmount: number
  remainingAmount: number
  utilizationPercentage: number
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockWarranties: Warranty[] = [
  {
    id: '1',
    itemName: 'Central HVAC System - Trane XR17',
    category: 'hvac',
    warrantyType: 'manufacturer',
    vendor: 'Cool Air HVAC',
    manufacturer: 'Trane',
    startDate: '2025-01-15',
    endDate: '2035-01-15',
    duration: '10 years (compressor)',
    documentUrl: '/docs/hvac-warranty.pdf',
    status: 'active',
    coverageType: 'parts',
    registrationNumber: 'TR-4428819-01',
    claimContact: 'Trane Warranty Dept',
    claimPhone: '(800) 555-TRANE',
    costToDate: 0,
    claimCount: 0,
    aiNote: 'Manufacturer warranty includes annual maintenance requirement. Schedule service before Jan 2026 to maintain coverage.',
  },
  {
    id: '2',
    itemName: 'HVAC Labor & Installation',
    category: 'hvac',
    warrantyType: 'workmanship',
    vendor: 'Cool Air HVAC',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    duration: '1 year',
    status: 'expiring_soon',
    daysUntilExpiry: 28,
    coverageType: 'labor',
    claimContact: 'Cool Air HVAC',
    claimPhone: '(843) 555-2200',
    costToDate: 0,
    claimCount: 0,
    aiNote: 'Workmanship warranty expires in 28 days. Schedule 11-month walkthrough before expiration to document any issues.',
  },
  {
    id: '3',
    itemName: 'Standing Seam Metal Roof',
    category: 'roofing',
    warrantyType: 'manufacturer',
    vendor: 'Gulf Coast Roofing',
    manufacturer: 'Galvalume Plus',
    startDate: '2024-06-20',
    endDate: '2054-06-20',
    duration: '30 years',
    documentUrl: '/docs/roof-warranty.pdf',
    status: 'active',
    coverageType: 'limited',
    registrationNumber: 'GP-887221',
    claimContact: 'Galvalume Plus Claims',
    claimPhone: '(800) 555-ROOF',
    costToDate: 0,
    claimCount: 0,
  },
  {
    id: '4',
    itemName: 'Roofing Installation',
    category: 'roofing',
    warrantyType: 'workmanship',
    vendor: 'Gulf Coast Roofing',
    startDate: '2024-06-20',
    endDate: '2026-06-20',
    duration: '2 years',
    status: 'active',
    daysUntilExpiry: 128,
    coverageType: 'labor',
    claimContact: 'Gulf Coast Roofing',
    claimPhone: '(843) 555-7700',
    costToDate: 0,
    claimCount: 0,
  },
  {
    id: '5',
    itemName: 'Tankless Water Heater - Rinnai RU199',
    category: 'plumbing',
    warrantyType: 'manufacturer',
    vendor: 'Jones Plumbing',
    manufacturer: 'Rinnai',
    startDate: '2025-03-10',
    endDate: '2037-03-10',
    duration: '12 years (heat exchanger)',
    documentUrl: '/docs/water-heater-warranty.pdf',
    status: 'active',
    coverageType: 'parts',
    registrationNumber: 'RN-55821-HE',
    claimContact: 'Rinnai Technical Support',
    claimPhone: '(800) 555-RINN',
    selectionLink: 'Plumbing > Water Heater > Rinnai RU199',
    costToDate: 0,
    claimCount: 0,
  },
  {
    id: '6',
    itemName: 'PGT WinGuard Impact Windows',
    category: 'windows',
    warrantyType: 'manufacturer',
    vendor: 'Coastal Windows & Doors',
    manufacturer: 'PGT Industries',
    startDate: '2025-02-01',
    endDate: '2035-02-01',
    duration: '10 years',
    documentUrl: '/docs/windows-warranty.pdf',
    status: 'active',
    coverageType: 'full',
    registrationNumber: 'PGT-2025-44821',
    claimContact: 'PGT Warranty',
    claimPhone: '(800) 555-WNDW',
    selectionLink: 'Windows & Doors > Impact Windows > PGT WinGuard 770',
    costToDate: 450,
    claimCount: 1,
    aiNote: '1 seal failure claim filed (CLM-2026-078). Same batch as Taylor Estate issue. Monitor other units from lot 2024-B.',
  },
  {
    id: '7',
    itemName: 'Electrical Panel & Wiring',
    category: 'electrical',
    warrantyType: 'workmanship',
    vendor: 'Smith Electric',
    startDate: '2025-02-15',
    endDate: '2026-02-15',
    duration: '1 year',
    status: 'expiring_soon',
    daysUntilExpiry: 3,
    coverageType: 'labor',
    claimContact: 'Smith Electric',
    claimPhone: '(843) 555-3300',
    costToDate: 150,
    claimCount: 1,
    aiNote: 'Workmanship warranty expires in 3 days. 1 claim for outlet not functioning in bedroom #2. Ensure all items resolved before expiration.',
  },
  {
    id: '8',
    itemName: 'Kitchen Appliance Package - SubZero/Wolf',
    category: 'appliances',
    warrantyType: 'manufacturer',
    vendor: 'Sub-Zero Group',
    manufacturer: 'Sub-Zero / Wolf',
    startDate: '2024-11-01',
    endDate: '2026-11-01',
    duration: '2 years',
    status: 'active',
    daysUntilExpiry: 262,
    coverageType: 'full',
    registrationNumber: 'SZ-WF-2024-88213',
    claimContact: 'Sub-Zero Customer Care',
    claimPhone: '(800) 222-7820',
    selectionLink: 'Kitchen > Appliances > Sub-Zero/Wolf Package',
    costToDate: 0,
    claimCount: 0,
  },
  {
    id: '9',
    itemName: 'Foundation Slab - 10yr Structural',
    category: 'structural',
    warrantyType: 'builder',
    vendor: 'Gulf Coast Concrete',
    startDate: '2024-05-01',
    endDate: '2034-05-01',
    duration: '10 years',
    documentUrl: '/docs/foundation-warranty.pdf',
    status: 'active',
    coverageType: 'limited',
    costToDate: 0,
    claimCount: 0,
  },
  {
    id: '10',
    itemName: 'Builder General Warranty',
    category: 'finish',
    warrantyType: 'builder',
    vendor: 'Coastal Custom Homes',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    duration: '1 year',
    documentUrl: '/docs/builder-warranty.pdf',
    status: 'expiring_soon',
    daysUntilExpiry: 28,
    coverageType: 'full',
    claimContact: 'Warranty Coordinator',
    claimPhone: '(843) 555-1000',
    costToDate: 2840,
    claimCount: 4,
    aiNote: 'Builder 1-year warranty expires in 28 days. 4 claims filed, $2,840 in warranty costs. Schedule 11-month walkthrough immediately.',
  },
  {
    id: '11',
    itemName: 'Exterior Paint & Siding',
    category: 'exterior',
    warrantyType: 'workmanship',
    vendor: 'Low Country Painting',
    startDate: '2024-12-01',
    endDate: '2024-12-01',
    duration: '2 years',
    status: 'expired',
    coverageType: 'labor',
    costToDate: 0,
    claimCount: 0,
    aiNote: 'Warranty expired. Consider extended protection plan or goodwill repairs for client retention.',
  },
]

const mockWalkthroughs: WalkthroughSchedule[] = [
  {
    id: '1',
    type: '30_day',
    scheduledDate: '2025-02-15',
    status: 'completed',
    findingsCount: 3,
    completedBy: 'Mike Johnson',
    homeownerSigned: true,
  },
  {
    id: '2',
    type: '11_month',
    scheduledDate: '2025-12-15',
    status: 'scheduled',
  },
  {
    id: '3',
    type: '2_year',
    scheduledDate: '2027-01-15',
    status: 'scheduled',
  },
]

const mockReserve: WarrantyReserve = {
  projectValue: 1250000,
  reservePercentage: 1.5,
  reserveAmount: 18750,
  spentAmount: 3440,
  remainingAmount: 15310,
  utilizationPercentage: 18.3,
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: ShieldCheck },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700', icon: ShieldAlert },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: ShieldX },
}

const warrantyTypeConfig: Record<WarrantyType, { label: string; color: string }> = {
  builder: { label: 'Builder', color: 'bg-blue-100 text-blue-700' },
  manufacturer: { label: 'Manufacturer', color: 'bg-purple-100 text-purple-700' },
  workmanship: { label: 'Workmanship', color: 'bg-orange-100 text-orange-700' },
  extended: { label: 'Extended', color: 'bg-teal-100 text-teal-700' },
}

const categoryConfig: Record<CategoryType, { label: string; icon: typeof Wrench; color: string }> = {
  appliances: { label: 'Appliances', icon: Home, color: 'bg-blue-50 text-blue-700' },
  roofing: { label: 'Roofing', icon: Building2, color: 'bg-orange-50 text-orange-700' },
  hvac: { label: 'HVAC', icon: Thermometer, color: 'bg-cyan-50 text-cyan-700' },
  plumbing: { label: 'Plumbing', icon: Droplets, color: 'bg-indigo-50 text-indigo-700' },
  electrical: { label: 'Electrical', icon: Zap, color: 'bg-yellow-50 text-yellow-700' },
  structural: { label: 'Structural', icon: Building2, color: 'bg-gray-100 text-gray-700' },
  windows: { label: 'Windows', icon: Home, color: 'bg-purple-50 text-purple-700' },
  exterior: { label: 'Exterior', icon: Building2, color: 'bg-emerald-50 text-emerald-700' },
  finish: { label: 'Finish', icon: Wrench, color: 'bg-pink-50 text-pink-700' },
}

const coverageConfig: Record<CoverageType, { label: string; color: string }> = {
  full: { label: 'Full Coverage', color: 'bg-green-50 text-green-700' },
  parts: { label: 'Parts Only', color: 'bg-blue-50 text-blue-700' },
  labor: { label: 'Labor Only', color: 'bg-purple-50 text-purple-700' },
  limited: { label: 'Limited', color: 'bg-gray-100 text-gray-600' },
}

const walkthroughTypeConfig: Record<WalkthroughSchedule['type'], string> = {
  '30_day': '30-Day Walkthrough',
  '6_month': '6-Month Walkthrough',
  '11_month': '11-Month Walkthrough',
  '2_year': '2-Year Walkthrough',
  'custom': 'Custom Walkthrough',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function WarrantyCard({ warranty }: { warranty: Warranty }) {
  const status = statusConfig[warranty.status]
  const category = categoryConfig[warranty.category]
  const coverage = coverageConfig[warranty.coverageType]
  const wType = warrantyTypeConfig[warranty.warrantyType]
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
            <Wrench className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{warranty.vendor}</span>
            {warranty.manufacturer && (
              <>
                <span className="text-gray-300">|</span>
                <span className="truncate text-xs">{warranty.manufacturer}</span>
              </>
            )}
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
        <span className={cn("text-xs px-2 py-1 rounded font-medium", wType.color)}>
          {wType.label}
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
            <span>Start</span>
          </div>
          <span className="text-gray-700">{formatDate(warranty.startDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>End</span>
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

      {/* Claim & Cost info */}
      {(warranty.claimCount !== undefined && warranty.claimCount > 0) && (
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <ClipboardCheck className="h-3 w-3" />
            {warranty.claimCount} claim{warranty.claimCount !== 1 ? 's' : ''}
          </span>
          {warranty.costToDate !== undefined && warranty.costToDate > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(warranty.costToDate)} cost
            </span>
          )}
        </div>
      )}

      {/* Registration & Contact */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {warranty.documentUrl && (
            <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              <FileText className="h-3.5 w-3.5" />
              <span>Document</span>
            </button>
          )}
          {warranty.selectionLink && (
            <button className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700">
              <Link2 className="h-3.5 w-3.5" />
              <span>Selection</span>
            </button>
          )}
          {warranty.registrationNumber && (
            <span className="text-xs text-gray-400 font-mono">{warranty.registrationNumber}</span>
          )}
        </div>
        {warranty.daysUntilExpiry !== undefined && warranty.status !== 'expired' && (
          <span className={cn(
            "text-xs font-medium",
            warranty.daysUntilExpiry <= 30 ? "text-amber-600" : "text-gray-500"
          )}>
            {warranty.daysUntilExpiry}d remaining
          </span>
        )}
      </div>

      {/* Claim contact */}
      {warranty.claimContact && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <Phone className="h-3 w-3" />
          <span>{warranty.claimContact}</span>
          {warranty.claimPhone && <span>- {warranty.claimPhone}</span>}
        </div>
      )}

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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WarrantiesPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({})

  const filteredWarranties = sortItems(
    mockWarranties.filter(warranty => {
      if (!matchesSearch(warranty, search, ['itemName', 'vendor', 'category', 'manufacturer', 'registrationNumber'])) return false
      if (selectedCategory !== 'all' && warranty.category !== selectedCategory) return false
      if (selectedType !== 'all' && warranty.warrantyType !== selectedType) return false
      if (activeTab !== 'all' && warranty.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Warranty | '',
    sortDirection,
  )

  // Stats
  const activeWarranties = mockWarranties.filter(w => w.status === 'active').length
  const expiringIn30Days = mockWarranties.filter(w => w.daysUntilExpiry !== undefined && w.daysUntilExpiry <= 30 && w.status !== 'expired').length
  const totalCoverage = mockWarranties.filter(w => w.status !== 'expired').length
  const totalItems = mockWarranties.length
  const coveragePercentage = Math.round((totalCoverage / totalItems) * 100)
  const totalClaimCost = mockWarranties.reduce((sum, w) => sum + (w.costToDate ?? 0), 0)
  const totalClaimCount = mockWarranties.reduce((sum, w) => sum + (w.claimCount ?? 0), 0)

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.entries(categoryConfig).map(([key, cfg]) => ({ value: key, label: cfg.label })),
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(warrantyTypeConfig).map(([key, cfg]) => ({ value: key, label: cfg.label })),
  ]

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Warranty Binder</h3>
          <span className="text-sm text-gray-500">{totalItems} warranties | {coveragePercentage}% coverage active</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search warranties, vendors, registration numbers..."
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
            {
              label: 'All Types',
              value: selectedType,
              options: typeOptions.filter(o => o.value !== 'all'),
              onChange: (v) => setSelectedType(v),
            },
          ]}
          sortOptions={[
            { value: 'itemName', label: 'Item Name' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'endDate', label: 'Expiration Date' },
            { value: 'category', label: 'Category' },
            { value: 'warrantyType', label: 'Warranty Type' },
            { value: 'daysUntilExpiry', label: 'Days Remaining' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export Binder', onClick: () => {} },
            { icon: Plus, label: 'Add Warranty', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredWarranties.length}
          totalCount={mockWarranties.length}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Active
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{activeWarranties}</div>
            <div className="text-xs text-green-600 mt-0.5">covered items</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <ShieldAlert className="h-4 w-4" />
              Expiring 30d
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{expiringIn30Days}</div>
            <div className="text-xs text-amber-600 mt-0.5">need attention</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Coverage
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{coveragePercentage}%</div>
            <div className="text-xs text-blue-600 mt-0.5">{totalCoverage} of {totalItems} active</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <ClipboardCheck className="h-4 w-4" />
              Claims
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">{totalClaimCount}</div>
            <div className="text-xs text-red-600 mt-0.5">{formatCurrency(totalClaimCost)} cost to date</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Reserve
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(mockReserve.remainingAmount)}</div>
            <div className="text-xs text-purple-600 mt-0.5">
              {formatCurrency(mockReserve.spentAmount)} of {formatCurrency(mockReserve.reserveAmount)} used ({mockReserve.utilizationPercentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Walkthrough Schedule */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Scheduled Walkthroughs</span>
        </div>
        <div className="flex items-center gap-3">
          {mockWalkthroughs.map(wt => (
            <div key={wt.id} className={cn(
              "flex-1 rounded-lg p-3 border",
              wt.status === 'completed' ? 'bg-green-50 border-green-200' :
              wt.status === 'overdue' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{walkthroughTypeConfig[wt.type]}</span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded font-medium',
                  wt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  wt.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                )}>
                  {wt.status === 'completed' ? 'Done' : wt.status === 'overdue' ? 'Overdue' : 'Scheduled'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatDate(wt.scheduledDate)}</p>
              {wt.findingsCount !== undefined && (
                <p className="text-xs text-gray-500">{wt.findingsCount} findings | {wt.homeownerSigned ? 'Signed' : 'Unsigned'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Warranty Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
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
            <span className="font-medium text-sm text-amber-800">AI Warranty Intelligence:</span>
          </div>
          <div className="space-y-1 text-sm text-amber-700">
            <p>&#x2022; 11-month walkthrough needed within 28 days - 4 builder warranties expiring. Schedule immediately.</p>
            <p>&#x2022; PGT window seal failure matches pattern from lot 2024-B across 2 other projects. Recommend batch inspection.</p>
            <p>&#x2022; Warranty reserve at 18.3% utilization - historically similar projects average 35% at this stage. Reserve is healthy.</p>
            <p>&#x2022; HVAC annual maintenance required by Trane to maintain coverage - service overdue by 15 days.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
