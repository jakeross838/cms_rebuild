'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
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
  Users,
  Building2,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  PaintBucket,
  Grid3X3,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Vendor {
  id: string
  name: string
  trade: string
  type: 'subcontractor' | 'supplier'
  rating: number
  reliability: number
  phone: string
  email: string
  insuranceStatus: 'valid' | 'expiring' | 'expired'
  insuranceExpiry: string
  projectsCompleted: number
  avgResponseTime: string
  aiNote?: string
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'ABC Framing Co.',
    trade: 'Framing',
    type: 'subcontractor',
    rating: 4.8,
    reliability: 96,
    phone: '(850) 555-0101',
    email: 'contact@abcframing.com',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Dec 2025',
    projectsCompleted: 47,
    avgResponseTime: '2 hrs',
    aiNote: 'Top performer for coastal elevated homes. Typically +2 days on complex roofs.',
  },
  {
    id: '2',
    name: 'Smith Electric',
    trade: 'Electrical',
    type: 'subcontractor',
    rating: 4.5,
    reliability: 92,
    phone: '(850) 555-0102',
    email: 'info@smithelectric.com',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Mar 2025',
    projectsCompleted: 32,
    avgResponseTime: '4 hrs',
  },
  {
    id: '3',
    name: 'Jones Plumbing',
    trade: 'Plumbing',
    type: 'subcontractor',
    rating: 4.2,
    reliability: 88,
    phone: '(850) 555-0103',
    email: 'service@jonesplumbing.com',
    insuranceStatus: 'expiring',
    insuranceExpiry: 'Feb 2025',
    projectsCompleted: 28,
    avgResponseTime: '6 hrs',
    aiNote: 'Insurance expiring in 30 days. Recommend renewal confirmation.',
  },
  {
    id: '4',
    name: 'Cool Air HVAC',
    trade: 'HVAC',
    type: 'subcontractor',
    rating: 4.6,
    reliability: 94,
    phone: '(850) 555-0104',
    email: 'quotes@coolairhvac.com',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Aug 2025',
    projectsCompleted: 41,
    avgResponseTime: '3 hrs',
  },
  {
    id: '5',
    name: 'Coastal Paint Pros',
    trade: 'Painting',
    type: 'subcontractor',
    rating: 4.3,
    reliability: 85,
    phone: '(850) 555-0105',
    email: 'hello@coastalpaint.com',
    insuranceStatus: 'expired',
    insuranceExpiry: 'Jan 2025',
    projectsCompleted: 19,
    avgResponseTime: '8 hrs',
    aiNote: 'Insurance expired. Do not assign until renewed.',
  },
  {
    id: '6',
    name: 'ABC Lumber Supply',
    trade: 'Lumber',
    type: 'supplier',
    rating: 4.7,
    reliability: 95,
    phone: '(850) 555-0106',
    email: 'orders@abclumber.com',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Oct 2025',
    projectsCompleted: 156,
    avgResponseTime: '1 hr',
  },
  {
    id: '7',
    name: 'PGT Industries',
    trade: 'Windows & Doors',
    type: 'supplier',
    rating: 4.4,
    reliability: 91,
    phone: '(850) 555-0107',
    email: 'sales@pgt.com',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Nov 2025',
    projectsCompleted: 89,
    avgResponseTime: '24 hrs',
    aiNote: '8-week lead time on impact windows. Order early.',
  },
  {
    id: '8',
    name: 'Gulf Coast Concrete',
    trade: 'Concrete',
    type: 'subcontractor',
    rating: 4.9,
    reliability: 98,
    phone: '(850) 555-0108',
    email: 'dispatch@gulfcoastconcrete.com',
    insuranceStatus: 'valid',
    insuranceExpiry: 'Jun 2025',
    projectsCompleted: 72,
    avgResponseTime: '2 hrs',
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
              : "text-gray-300"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  )
}

function InsuranceStatus({ status, expiry }: { status: Vendor['insuranceStatus']; expiry: string }) {
  const config = {
    valid: {
      icon: ShieldCheck,
      label: 'Valid',
      color: 'text-green-600 bg-green-50',
    },
    expiring: {
      icon: ShieldAlert,
      label: 'Expiring',
      color: 'text-amber-600 bg-amber-50',
    },
    expired: {
      icon: ShieldX,
      label: 'Expired',
      color: 'text-red-600 bg-red-50',
    },
  }

  const { icon: Icon, label, color } = config[status]

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="text-gray-500">({expiry})</span>
    </div>
  )
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      vendor.insuranceStatus === 'expired' ? "border-red-200" :
      vendor.insuranceStatus === 'expiring' ? "border-amber-200" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{vendor.name}</h4>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              vendor.type === 'subcontractor' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
            )}>
              {vendor.type === 'subcontractor' ? 'Sub' : 'Supplier'}
            </span>
          </div>
          <p className="text-sm text-gray-500">{vendor.trade}</p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <StarRating rating={vendor.rating} />
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            vendor.reliability >= 95 ? "bg-green-100 text-green-700" :
            vendor.reliability >= 90 ? "bg-blue-100 text-blue-700" :
            vendor.reliability >= 85 ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          )}>
            {vendor.reliability}% reliable
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          <span>{vendor.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Mail className="h-3.5 w-3.5" />
          <span>{vendor.email}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <InsuranceStatus status={vendor.insuranceStatus} expiry={vendor.insuranceExpiry} />
        <span className="text-xs text-gray-500">{vendor.projectsCompleted} projects</span>
      </div>

      {vendor.aiNote && (
        <div className={cn(
          "mt-3 p-2 rounded-md flex items-start gap-2",
          vendor.insuranceStatus === 'expired' || vendor.insuranceStatus === 'expiring'
            ? "bg-amber-50"
            : "bg-blue-50"
        )}>
          <Sparkles className={cn(
            "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
            vendor.insuranceStatus === 'expired' || vendor.insuranceStatus === 'expiring'
              ? "text-amber-500"
              : "text-blue-500"
          )} />
          <span className={cn(
            "text-xs",
            vendor.insuranceStatus === 'expired' || vendor.insuranceStatus === 'expiring'
              ? "text-amber-700"
              : "text-blue-700"
          )}>
            {vendor.aiNote}
          </span>
        </div>
      )}
    </div>
  )
}

export function VendorsPreview() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTrade, setSelectedTrade] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<number>(0)

  const filteredVendors = mockVendors.filter(vendor => {
    if (selectedTrade !== 'all' && vendor.trade !== selectedTrade) return false
    if (vendor.rating < ratingFilter) return false
    return true
  })

  const totalVendors = mockVendors.length
  const subcontractors = mockVendors.filter(v => v.type === 'subcontractor').length
  const suppliers = mockVendors.filter(v => v.type === 'supplier').length
  const insuranceAlerts = mockVendors.filter(v => v.insuranceStatus !== 'valid').length
  const avgRating = mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Vendor Directory</h3>
            <p className="text-sm text-gray-500">Subcontractors & Suppliers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
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
              Add Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{totalVendors}</div>
              <div className="text-xs text-gray-500">Total Vendors</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Hammer className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{subcontractors}</div>
              <div className="text-xs text-gray-500">Subcontractors</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{suppliers}</div>
              <div className="text-xs text-gray-500">Suppliers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Avg Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              insuranceAlerts > 0 ? "bg-red-100" : "bg-green-100"
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                insuranceAlerts > 0 ? "text-red-600" : "text-green-600"
              )} />
            </div>
            <div>
              <div className={cn(
                "text-xl font-bold",
                insuranceAlerts > 0 ? "text-red-600" : "text-gray-900"
              )}>
                {insuranceAlerts}
              </div>
              <div className="text-xs text-gray-500">Insurance Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trades.map(trade => {
            const Icon = trade.icon
            return (
              <button
                key={trade.id}
                onClick={() => setSelectedTrade(trade.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
                  selectedTrade === trade.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {trade.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Min Rating:</span>
          <div className="flex items-center gap-1">
            {[0, 3, 4, 4.5].map(rating => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  ratingFilter === rating
                    ? "bg-amber-100 text-amber-700 font-medium"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {rating === 0 ? 'Any' : `${rating}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredVendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
          {filteredVendors.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-500">
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
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              ABC Framing is your top performer (96% reliability)
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              2 vendors need insurance renewal
            </span>
            <span>|</span>
            <span>Consider adding backup HVAC vendor for Q2 demand</span>
          </div>
        </div>
      </div>
    </div>
  )
}
