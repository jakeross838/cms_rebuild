'use client'

import { useState } from 'react'
import {
  Plus,
  Star,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  PaintBucket,
  DollarSign,
  FileText,
  ShoppingCart,
  Award,
  Clock,
  Ban,
  CheckCircle,
  Target,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface PerformanceScores {
  quality: number
  timeliness: number
  communication: number
  budget: number
  safety: number
  composite: number
}

interface Vendor {
  id: string
  name: string
  trade: string
  type: 'subcontractor' | 'supplier' | 'service'
  status: 'approved' | 'preferred' | 'conditional' | 'blacklisted' | 'pending'
  scores: PerformanceScores
  reliability: number
  phone: string
  email: string
  paymentTerms: string
  insuranceStatus: 'valid' | 'expiring' | 'expired'
  insuranceExpiry: string
  licenseStatus: 'valid' | 'expired' | 'na'
  w9OnFile: boolean
  projectsCompleted: number
  activeJobs: number
  totalSpend: number
  activePOs: number
  openPunchItems: number
  bidWinRate: number
  avgResponseTime: string
  warrantyCallbacks: number
  aiNote?: string
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'ABC Framing Co.',
    trade: 'Framing',
    type: 'subcontractor',
    status: 'preferred',
    scores: { quality: 4.8, timeliness: 4.5, communication: 4.7, budget: 4.3, safety: 4.9, composite: 92 },
    reliability: 96,
    phone: '(850) 555-0101',
    email: 'contact@abcframing.com',
    paymentTerms: 'Net 30',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Dec 2026',
    licenseStatus: 'valid',
    w9OnFile: true,
    projectsCompleted: 47,
    activeJobs: 3,
    totalSpend: 1850000,
    activePOs: 4,
    openPunchItems: 2,
    bidWinRate: 78,
    avgResponseTime: '2 hrs',
    warrantyCallbacks: 1,
    aiNote: 'Top performer for coastal elevated homes. On-time start rate: 94%. Typically +2 days on complex roofs but quality is excellent.',
  },
  {
    id: '2',
    name: 'Smith Electric',
    trade: 'Electrical',
    type: 'subcontractor',
    status: 'approved',
    scores: { quality: 4.5, timeliness: 4.2, communication: 4.0, budget: 4.4, safety: 4.6, composite: 85 },
    reliability: 92,
    phone: '(850) 555-0102',
    email: 'info@smithelectric.com',
    paymentTerms: 'Net 30',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Mar 2027',
    licenseStatus: 'valid',
    w9OnFile: true,
    projectsCompleted: 32,
    activeJobs: 2,
    totalSpend: 920000,
    activePOs: 3,
    openPunchItems: 5,
    bidWinRate: 65,
    avgResponseTime: '4 hrs',
    warrantyCallbacks: 3,
  },
  {
    id: '3',
    name: 'Jones Plumbing',
    trade: 'Plumbing',
    type: 'subcontractor',
    status: 'conditional',
    scores: { quality: 3.8, timeliness: 3.5, communication: 3.2, budget: 4.0, safety: 4.1, composite: 72 },
    reliability: 88,
    phone: '(850) 555-0103',
    email: 'service@jonesplumbing.com',
    paymentTerms: '2/10 Net 30',
    insuranceStatus: 'expiring',
    insuranceExpiry: 'Mar 2026',
    licenseStatus: 'valid',
    w9OnFile: true,
    projectsCompleted: 28,
    activeJobs: 2,
    totalSpend: 645000,
    activePOs: 2,
    openPunchItems: 8,
    bidWinRate: 55,
    avgResponseTime: '6 hrs',
    warrantyCallbacks: 5,
    aiNote: 'Insurance expiring in 30 days. Declining quality trend: 3 consecutive jobs with above-average punch items. Recommend performance review.',
  },
  {
    id: '4',
    name: 'Cool Air HVAC',
    trade: 'HVAC',
    type: 'subcontractor',
    status: 'preferred',
    scores: { quality: 4.6, timeliness: 4.7, communication: 4.5, budget: 4.2, safety: 4.8, composite: 89 },
    reliability: 94,
    phone: '(850) 555-0104',
    email: 'quotes@coolairhvac.com',
    paymentTerms: 'Net 30',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Aug 2026',
    licenseStatus: 'valid',
    w9OnFile: true,
    projectsCompleted: 41,
    activeJobs: 3,
    totalSpend: 1340000,
    activePOs: 5,
    openPunchItems: 1,
    bidWinRate: 72,
    avgResponseTime: '3 hrs',
    warrantyCallbacks: 2,
  },
  {
    id: '5',
    name: 'Coastal Paint Pros',
    trade: 'Painting',
    type: 'subcontractor',
    status: 'conditional',
    scores: { quality: 4.0, timeliness: 3.6, communication: 3.8, budget: 4.3, safety: 4.0, composite: 76 },
    reliability: 85,
    phone: '(850) 555-0105',
    email: 'hello@coastalpaint.com',
    paymentTerms: 'Net 15',
    insuranceStatus: 'expired',
    insuranceExpiry: 'Jan 2026',
    licenseStatus: 'valid',
    w9OnFile: true,
    projectsCompleted: 19,
    activeJobs: 0,
    totalSpend: 285000,
    activePOs: 0,
    openPunchItems: 3,
    bidWinRate: 45,
    avgResponseTime: '8 hrs',
    warrantyCallbacks: 4,
    aiNote: 'Insurance expired. PO creation blocked until renewed. 3 late completions in last 5 jobs. Consider backup painter.',
  },
  {
    id: '6',
    name: 'ABC Lumber Supply',
    trade: 'Lumber',
    type: 'supplier',
    status: 'preferred',
    scores: { quality: 4.7, timeliness: 4.8, communication: 4.5, budget: 4.1, safety: 5.0, composite: 90 },
    reliability: 95,
    phone: '(850) 555-0106',
    email: 'orders@abclumber.com',
    paymentTerms: '2/10 Net 30',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Oct 2026',
    licenseStatus: 'na',
    w9OnFile: true,
    projectsCompleted: 156,
    activeJobs: 4,
    totalSpend: 3200000,
    activePOs: 8,
    openPunchItems: 0,
    bidWinRate: 82,
    avgResponseTime: '1 hr',
    warrantyCallbacks: 0,
  },
  {
    id: '7',
    name: 'PGT Industries',
    trade: 'Windows & Doors',
    type: 'supplier',
    status: 'approved',
    scores: { quality: 4.4, timeliness: 3.9, communication: 4.2, budget: 4.5, safety: 5.0, composite: 84 },
    reliability: 91,
    phone: '(850) 555-0107',
    email: 'sales@pgt.com',
    paymentTerms: 'Net 45',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Nov 2026',
    licenseStatus: 'na',
    w9OnFile: true,
    projectsCompleted: 89,
    activeJobs: 3,
    totalSpend: 2100000,
    activePOs: 6,
    openPunchItems: 0,
    bidWinRate: 70,
    avgResponseTime: '24 hrs',
    warrantyCallbacks: 2,
    aiNote: '8-week lead time on impact windows. Order early for schedule compliance. Price increase effective April 2026.',
  },
  {
    id: '8',
    name: 'Gulf Coast Concrete',
    trade: 'Concrete',
    type: 'subcontractor',
    status: 'preferred',
    scores: { quality: 4.9, timeliness: 4.8, communication: 4.6, budget: 4.5, safety: 4.9, composite: 95 },
    reliability: 98,
    phone: '(850) 555-0108',
    email: 'dispatch@gulfcoastconcrete.com',
    paymentTerms: 'Net 30',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Jun 2026',
    licenseStatus: 'valid',
    w9OnFile: true,
    projectsCompleted: 72,
    activeJobs: 4,
    totalSpend: 2650000,
    activePOs: 5,
    openPunchItems: 0,
    bidWinRate: 88,
    avgResponseTime: '2 hrs',
    warrantyCallbacks: 0,
  },
  {
    id: '9',
    name: 'Bayou Tile & Stone',
    trade: 'Tile',
    type: 'subcontractor',
    status: 'pending',
    scores: { quality: 0, timeliness: 0, communication: 0, budget: 0, safety: 0, composite: 0 },
    reliability: 0,
    phone: '(850) 555-0109',
    email: 'info@bayoutile.com',
    paymentTerms: 'Net 30',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Sep 2026',
    licenseStatus: 'valid',
    w9OnFile: false,
    projectsCompleted: 0,
    activeJobs: 0,
    totalSpend: 0,
    activePOs: 0,
    openPunchItems: 0,
    bidWinRate: 0,
    avgResponseTime: '-',
    warrantyCallbacks: 0,
    aiNote: 'New vendor — prequalification pending. Missing W-9. Awaiting EMR rating and references.',
  },
]

const trades = [
  { id: 'all', label: 'All Trades', icon: Wrench },
  { id: 'Framing', label: 'Framing', icon: Hammer },
  { id: 'Electrical', label: 'Electrical', icon: Zap },
  { id: 'Plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'HVAC', label: 'HVAC', icon: Building2 },
  { id: 'Painting', label: 'Painting', icon: PaintBucket },
]

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : i === fullStars && hasHalfStar
              ? "fill-amber-400/50 text-amber-400"
              : "text-warm-300"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-warm-700">{rating.toFixed(1)}</span>
    </div>
  )
}

function VendorStatusBadge({ status }: { status: Vendor['status'] }) {
  const config = {
    preferred: { label: 'Preferred', color: 'bg-green-100 text-green-700', icon: Award },
    approved: { label: 'Approved', color: 'bg-stone-100 text-stone-700', icon: CheckCircle },
    conditional: { label: 'Conditional', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    blacklisted: { label: 'Blacklisted', color: 'bg-red-100 text-red-700', icon: Ban },
    pending: { label: 'Pending', color: 'bg-warm-100 text-warm-600', icon: Clock },
  }
  const { label, color, icon: Icon } = config[status]
  return (
    <span className={cn("flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium", color)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function InsuranceStatus({ status, expiry }: { status: Vendor['insuranceStatus']; expiry: string }) {
  const config = {
    valid: { icon: ShieldCheck, label: 'Valid', color: 'text-green-600 bg-green-50' },
    expiring: { icon: ShieldAlert, label: 'Expiring', color: 'text-amber-600 bg-amber-50' },
    expired: { icon: ShieldX, label: 'Expired', color: 'text-red-600 bg-red-50' },
  }
  const { icon: Icon, label, color } = config[status]
  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="text-warm-500">({expiry})</span>
    </div>
  )
}

function CompositeScoreBadge({ score }: { score: number }) {
  if (score === 0) return <span className="text-xs text-warm-400">No data</span>
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
      score >= 90 ? "bg-green-100 text-green-700" :
      score >= 80 ? "bg-stone-100 text-stone-700" :
      score >= 70 ? "bg-amber-100 text-amber-700" :
      "bg-red-100 text-red-700"
    )}>
      <Target className="h-3 w-3" />
      {score}
    </div>
  )
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      vendor.status === 'blacklisted' ? "border-red-200 bg-red-50/30" :
      vendor.insuranceStatus === 'expired' ? "border-red-200" :
      vendor.insuranceStatus === 'expiring' ? "border-amber-200" : "border-warm-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-warm-900">{vendor.name}</h4>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              vendor.type === 'subcontractor' ? "bg-stone-100 text-stone-700" :
              vendor.type === 'supplier' ? "bg-purple-100 text-purple-700" :
              "bg-teal-100 text-teal-700"
            )}>
              {vendor.type === 'subcontractor' ? 'Sub' : vendor.type === 'supplier' ? 'Supplier' : 'Service'}
            </span>
          </div>
          <p className="text-sm text-warm-500">{vendor.trade}</p>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Status + Score Row */}
      <div className="flex items-center gap-2 mb-3">
        <VendorStatusBadge status={vendor.status} />
        <CompositeScoreBadge score={vendor.scores.composite} />
        <span className="text-xs text-warm-400 ml-auto">{vendor.paymentTerms}</span>
      </div>

      {/* Rating + Reliability */}
      <div className="flex items-center gap-4 mb-3">
        <StarRating rating={vendor.scores.quality} />
        <div className={cn(
          "text-xs font-medium px-1.5 py-0.5 rounded",
          vendor.reliability >= 95 ? "bg-green-100 text-green-700" :
          vendor.reliability >= 90 ? "bg-stone-100 text-stone-700" :
          vendor.reliability >= 85 ? "bg-amber-100 text-amber-700" :
          vendor.reliability > 0 ? "bg-red-100 text-red-700" :
          "bg-warm-100 text-warm-500"
        )}>
          {vendor.reliability > 0 ? `${vendor.reliability}% reliable` : 'New'}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-warm-600">
          <Phone className="h-3.5 w-3.5" />
          <span>{vendor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-600">
          <Mail className="h-3.5 w-3.5" />
          <span>{vendor.email}</span>
        </div>
      </div>

      {/* Cross-module stats */}
      <div className="flex items-center gap-3 mb-3 text-xs">
        <span className="flex items-center gap-1 text-warm-500" title="Total spend">
          <DollarSign className="h-3 w-3" />{formatCurrency(vendor.totalSpend)}
        </span>
        <span className="flex items-center gap-1 text-stone-500" title="Active POs">
          <ShoppingCart className="h-3 w-3" />{vendor.activePOs} POs
        </span>
        <span className="flex items-center gap-1 text-warm-500" title="Active jobs">
          <Briefcase className="h-3 w-3" />{vendor.activeJobs} jobs
        </span>
        {vendor.openPunchItems > 0 && (
          <span className="flex items-center gap-1 text-amber-500" title="Open punch items">
            <AlertTriangle className="h-3 w-3" />{vendor.openPunchItems} punch
          </span>
        )}
        {vendor.warrantyCallbacks > 0 && (
          <span className="flex items-center gap-1 text-red-500" title="Warranty callbacks">
            <FileText className="h-3 w-3" />{vendor.warrantyCallbacks} callbacks
          </span>
        )}
      </div>

      {/* Insurance + Compliance */}
      <div className="flex items-center justify-between pt-3 border-t border-warm-100">
        <InsuranceStatus status={vendor.insuranceStatus} expiry={vendor.insuranceExpiry} />
        <div className="flex items-center gap-2">
          {vendor.w9OnFile ? (
            <span className="text-[10px] bg-green-50 text-green-600 px-1 py-0.5 rounded">W-9</span>
          ) : (
            <span className="text-[10px] bg-red-50 text-red-600 px-1 py-0.5 rounded">No W-9</span>
          )}
          {vendor.licenseStatus === 'valid' && (
            <span className="text-[10px] bg-green-50 text-green-600 px-1 py-0.5 rounded">Licensed</span>
          )}
          {vendor.licenseStatus === 'expired' && (
            <span className="text-[10px] bg-red-50 text-red-600 px-1 py-0.5 rounded">Lic Expired</span>
          )}
        </div>
      </div>

      {vendor.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2",
          vendor.insuranceStatus === 'expired' || vendor.status === 'conditional'
            ? "bg-amber-50"
            : "bg-stone-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            vendor.insuranceStatus === 'expired' || vendor.status === 'conditional'
              ? "text-amber-500"
              : "text-stone-500"
          )} />
          <span className={cn(
            "text-xs",
            vendor.insuranceStatus === 'expired' || vendor.status === 'conditional'
              ? "text-amber-700"
              : "text-stone-700"
          )}>
            {vendor.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

export function VendorsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [ratingFilter, setRatingFilter] = useState<number>(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = sortItems(
    mockVendors.filter(vendor => {
      if (!matchesSearch(vendor, search, ['name', 'trade', 'email'])) return false
      if (activeTab !== 'all' && vendor.trade !== activeTab) return false
      if (vendor.scores.quality > 0 && vendor.scores.quality < ratingFilter) return false
      if (statusFilter !== 'all' && vendor.status !== statusFilter) return false
      return true
    }),
    activeSort as keyof Vendor | '',
    sortDirection,
  )

  const totalVendors = mockVendors.length
  const subcontractors = mockVendors.filter(v => v.type === 'subcontractor').length
  const suppliers = mockVendors.filter(v => v.type === 'supplier').length
  const preferredCount = mockVendors.filter(v => v.status === 'preferred').length
  const insuranceAlerts = mockVendors.filter(v => v.insuranceStatus !== 'valid').length
  const avgCompositeScore = Math.round(
    mockVendors.filter(v => v.scores.composite > 0).reduce((sum, v) => sum + v.scores.composite, 0) /
    mockVendors.filter(v => v.scores.composite > 0).length
  )
  const totalSpend = mockVendors.reduce((sum, v) => sum + v.totalSpend, 0)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-warm-900">Vendor Directory</h3>
            <p className="text-sm text-warm-500">Subcontractors, Suppliers & Service Providers</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-7 gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{totalVendors}</div>
              <div className="text-[10px] text-warm-500">Total</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Hammer className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{subcontractors}</div>
              <div className="text-[10px] text-warm-500">Subs</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{suppliers}</div>
              <div className="text-[10px] text-warm-500">Suppliers</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{preferredCount}</div>
              <div className="text-[10px] text-warm-500">Preferred</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-stone-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{avgCompositeScore}</div>
              <div className="text-[10px] text-warm-500">Avg Score</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", insuranceAlerts > 0 ? "bg-red-100" : "bg-green-100")}>
              <AlertTriangle className={cn("h-4 w-4", insuranceAlerts > 0 ? "text-red-600" : "text-green-600")} />
            </div>
            <div>
              <div className={cn("text-lg font-bold", insuranceAlerts > 0 ? "text-red-600" : "text-warm-900")}>{insuranceAlerts}</div>
              <div className="text-[10px] text-warm-500">Ins. Alerts</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-warm-900">{formatCurrency(totalSpend)}</div>
              <div className="text-[10px] text-warm-500">Total Spend</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vendors..."
          tabs={trades.map(trade => ({
            key: trade.id,
            label: trade.label,
            count: trade.id === 'all' ? mockVendors.length : mockVendors.filter(v => v.trade === trade.id).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'reliability', label: 'Reliability' },
            { value: 'totalSpend', label: 'Total Spend' },
            { value: 'projectsCompleted', label: 'Projects' },
            { value: 'activeJobs', label: 'Active Jobs' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'Add Vendor', onClick: () => {}, variant: 'primary' }]}
          resultCount={filtered.length}
          totalCount={mockVendors.length}
        >
          {/* Additional filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-warm-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-warm-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                <option value="all">All</option>
                <option value="preferred">Preferred</option>
                <option value="approved">Approved</option>
                <option value="conditional">Conditional</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-warm-500">Min Rating:</span>
              <div className="flex items-center gap-1">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating)}
                    className={cn(
                      "px-2 py-1 text-xs rounded",
                      ratingFilter === rating
                        ? "bg-amber-100 text-amber-700 font-medium"
                        : "text-warm-500 hover:bg-warm-100"
                    )}
                  >
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterBar>
      </div>

      {/* Vendor Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
          {filtered.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-warm-500">
              No vendors match your filters
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Vendor Intelligence:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Gulf Coast Concrete is your top performer (score: 95, 0 callbacks)
            </span>
            <span className="text-amber-300">|</span>
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Jones Plumbing declining: quality score dropped from 4.2 to 3.8 over 3 jobs
            </span>
            <span className="text-amber-300">|</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              2 vendors need insurance renewal, 1 missing W-9
            </span>
            <span className="text-amber-300">|</span>
            <span>Consider adding backup HVAC vendor for Q2 demand (3 concurrent jobs projected)</span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Performance Scoring',
            insight: 'Rates vendors on quality, timeliness, pricing',
          },
          {
            feature: 'Price Trend Analysis',
            insight: 'Tracks vendor pricing changes over time',
          },
          {
            feature: 'Capacity Planning',
            insight: 'Identifies vendors with available capacity',
          },
          {
            feature: 'Risk Assessment',
            insight: 'Flags vendors with insurance/license issues',
          },
          {
            feature: 'Recommendation Engine',
            insight: 'Suggests vendors for specific trade needs',
          },
        ]}
      />
    </div>
  )
}
