'use client'

import { useState } from 'react'
import {
  Plus,
  Download,
  Sparkles,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  User,
  MoreHorizontal,
  Camera,
  AlertCircle,
  CalendarDays,
  Link2,
  ExternalLink,
  ShieldAlert,
  MapPin,
  BarChart3,
  Image,
  Clipboard,
  PackageX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Delivery {
  id: string
  description: string
  poNumber: string
  jobName: string
  vendor: string
  // Dates & times
  expectedDate: string
  expectedTime: string
  actualDate?: string
  // Status
  status: 'scheduled' | 'in-transit' | 'delivered' | 'delayed' | 'partial'
  daysUntil: number
  // Quantities
  orderedItems: number
  receivedItems: number
  backorderedItems: number
  // Financial
  poAmount: number
  costCode: string
  // Receiving
  siteContact: string
  receivedBy?: string
  receivedLocation?: 'job_site' | 'warehouse' | 'office'
  specialInstructions?: string
  // Tracking
  trackingNumber?: string
  carrier?: string
  // Condition
  conditionStatus?: 'good' | 'damaged' | 'wrong_item'
  damageNotes?: string
  hasPhotos: boolean
  photoCount: number
  // Cross-module
  scheduleTaskName?: string
  scheduleImpactDays?: number
  invoiceMatched: boolean
  // AI
  aiNote?: string
  vendorOnTimeRate?: number
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    description: 'Windows - PGT WinGuard Impact',
    poNumber: 'PO-2026-0141',
    jobName: 'Smith Residence',
    vendor: 'PGT Industries',
    expectedDate: 'Today',
    expectedTime: '9:00 AM - 12:00 PM',
    status: 'scheduled',
    daysUntil: 0,
    orderedItems: 24,
    receivedItems: 0,
    backorderedItems: 0,
    poAmount: 45000,
    costCode: '08 - Doors & Windows',
    siteContact: 'Mike Rodriguez',
    specialInstructions: 'Forklift required for unloading. Stage in garage area.',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS Freight',
    hasPhotos: false,
    photoCount: 0,
    scheduleTaskName: 'Window Installation',
    scheduleImpactDays: 0,
    invoiceMatched: false,
    vendorOnTimeRate: 94,
  },
  {
    id: '2',
    description: 'Lumber Package - 2nd Floor Framing',
    poNumber: 'PO-2026-0142',
    jobName: 'Johnson Beach House',
    vendor: 'ABC Lumber Supply',
    expectedDate: 'Tomorrow',
    expectedTime: '7:00 AM - 9:00 AM',
    status: 'scheduled',
    daysUntil: 1,
    orderedItems: 150,
    receivedItems: 0,
    backorderedItems: 0,
    poAmount: 24500,
    costCode: '06 - Carpentry',
    siteContact: 'Carlos Mendez',
    hasPhotos: false,
    photoCount: 0,
    scheduleTaskName: '2nd Floor Framing',
    scheduleImpactDays: 0,
    invoiceMatched: false,
    vendorOnTimeRate: 82,
    aiNote: 'ABC Lumber has 18% late delivery rate. Consider buffer. Weather: clear tomorrow.',
  },
  {
    id: '3',
    description: 'Roofing Materials - Standing Seam Metal',
    poNumber: 'PO-2026-0135',
    jobName: 'Harbor View Custom',
    vendor: 'Building Supply Co',
    expectedDate: 'Feb 14',
    expectedTime: '8:00 AM - 10:00 AM',
    status: 'in-transit',
    daysUntil: 2,
    orderedItems: 45,
    receivedItems: 0,
    backorderedItems: 0,
    poAmount: 18200,
    costCode: '07 - Roofing',
    siteContact: 'Tom Williams',
    trackingNumber: 'PRO-87654321',
    carrier: 'Estes Express',
    hasPhotos: false,
    photoCount: 0,
    scheduleTaskName: 'Roof Install',
    scheduleImpactDays: 0,
    invoiceMatched: false,
    vendorOnTimeRate: 91,
    aiNote: 'GPS tracking: truck 2.5 hours away. On schedule for morning delivery window.',
  },
  {
    id: '4',
    description: 'Plumbing Fixtures - Kohler Bath Package',
    poNumber: 'PO-2026-0138',
    jobName: 'Smith Residence',
    vendor: 'Jones Plumbing Supply',
    expectedDate: 'Feb 15',
    expectedTime: '10:00 AM - 2:00 PM',
    status: 'scheduled',
    daysUntil: 3,
    orderedItems: 28,
    receivedItems: 0,
    backorderedItems: 0,
    poAmount: 12800,
    costCode: '15 - Plumbing',
    siteContact: 'Mike Rodriguez',
    hasPhotos: false,
    photoCount: 0,
    scheduleTaskName: 'Plumbing Trim',
    scheduleImpactDays: 0,
    invoiceMatched: false,
    vendorOnTimeRate: 96,
  },
  {
    id: '5',
    description: 'HVAC Equipment - Trane XR17 System',
    poNumber: 'PO-2026-0137',
    jobName: 'Johnson Beach House',
    vendor: 'Cool Air HVAC',
    expectedDate: 'Feb 16',
    expectedTime: '8:00 AM - 11:00 AM',
    status: 'partial',
    daysUntil: 4,
    orderedItems: 4,
    receivedItems: 2,
    backorderedItems: 2,
    poAmount: 28000,
    costCode: '23 - HVAC',
    siteContact: 'Carlos Mendez',
    receivedBy: 'Carlos Mendez',
    receivedLocation: 'job_site',
    hasPhotos: true,
    photoCount: 3,
    scheduleTaskName: 'HVAC Install',
    scheduleImpactDays: 5,
    invoiceMatched: false,
    vendorOnTimeRate: 88,
    aiNote: '2 items backordered: condensing unit (ETA Feb 20) & handler (ETA Feb 25). HVAC Install task may slip 5 days.',
  },
  {
    id: '6',
    description: 'Appliances - Wolf/Sub-Zero Kitchen Package',
    poNumber: 'PO-2026-0130',
    jobName: 'Smith Residence',
    vendor: 'Elite Appliances',
    expectedDate: 'Was: Jan 25',
    expectedTime: '-',
    status: 'delayed',
    daysUntil: -18,
    orderedItems: 6,
    receivedItems: 0,
    backorderedItems: 6,
    poAmount: 23200,
    costCode: '11 - Equipment',
    siteContact: 'Mike Rodriguez',
    hasPhotos: false,
    photoCount: 0,
    scheduleTaskName: 'Appliance Install',
    scheduleImpactDays: 10,
    invoiceMatched: false,
    vendorOnTimeRate: 72,
    aiNote: '18-day delay. New ETA: Feb 12. Trim-out schedule at risk. Elite Appliances: 72% on-time rate (below 85% threshold).',
  },
  {
    id: '7',
    description: 'Drywall - 5/8" Type X Fire-Rated',
    poNumber: 'PO-2026-0145',
    jobName: 'Johnson Beach House',
    vendor: 'Building Supply Co',
    expectedDate: 'Feb 17',
    expectedTime: '7:00 AM - 9:00 AM',
    status: 'scheduled',
    daysUntil: 5,
    orderedItems: 200,
    receivedItems: 0,
    backorderedItems: 0,
    poAmount: 8400,
    costCode: '09 - Finishes',
    siteContact: 'Carlos Mendez',
    specialInstructions: 'Boom truck required - 2nd floor direct delivery. Clear area below east wall.',
    hasPhotos: false,
    photoCount: 0,
    scheduleTaskName: 'Drywall Hang',
    scheduleImpactDays: 0,
    invoiceMatched: false,
    vendorOnTimeRate: 91,
  },
  {
    id: '8',
    description: 'Tile - Porcelain Slab Master Bath',
    poNumber: 'PO-2026-0139',
    jobName: 'Harbor View Custom',
    vendor: 'Tile World',
    expectedDate: 'Feb 11',
    expectedTime: '11:00 AM',
    actualDate: '2026-02-11',
    status: 'delivered',
    daysUntil: -1,
    orderedItems: 35,
    receivedItems: 35,
    backorderedItems: 0,
    poAmount: 6800,
    costCode: '09 - Finishes',
    siteContact: 'Tom Williams',
    receivedBy: 'Tom Williams',
    receivedLocation: 'job_site',
    conditionStatus: 'good',
    hasPhotos: true,
    photoCount: 4,
    scheduleTaskName: 'Master Bath Tile',
    scheduleImpactDays: 0,
    invoiceMatched: true,
    vendorOnTimeRate: 95,
  },
  {
    id: '9',
    description: 'Electrical Panel & Sub-panels',
    poNumber: 'PO-2026-0136',
    jobName: 'Miller Addition',
    vendor: 'Smith Electric Supply',
    expectedDate: 'Feb 10',
    expectedTime: '2:00 PM',
    actualDate: '2026-02-10',
    status: 'delivered',
    daysUntil: -2,
    orderedItems: 22,
    receivedItems: 20,
    backorderedItems: 0,
    poAmount: 9200,
    costCode: '16 - Electrical',
    siteContact: 'Jake Ross',
    receivedBy: 'Jake Ross',
    receivedLocation: 'job_site',
    conditionStatus: 'damaged',
    damageNotes: '2 breakers damaged in transit. Vendor notified for replacement.',
    hasPhotos: true,
    photoCount: 6,
    scheduleTaskName: 'Electrical Rough',
    scheduleImpactDays: 0,
    invoiceMatched: true,
    vendorOnTimeRate: 97,
    aiNote: 'Damage reported: 2 breakers. Replacement shipment confirmed for Feb 13. No schedule impact.',
  },
]

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
  'in-transit': { label: 'In Transit', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  delayed: { label: 'Delayed', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700', icon: Package },
}

const jobColors: Record<string, string> = {
  'Smith Residence': 'border-l-blue-500',
  'Johnson Beach House': 'border-l-green-500',
  'Harbor View Custom': 'border-l-purple-500',
  'Miller Addition': 'border-l-amber-500',
  'Davis Addition': 'border-l-rose-500',
}

const conditionColors: Record<string, { label: string; color: string }> = {
  good: { label: 'Good Condition', color: 'text-green-600' },
  damaged: { label: 'Damage Reported', color: 'text-red-600' },
  wrong_item: { label: 'Wrong Item', color: 'text-red-600' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const config = statusConfig[delivery.status]
  const StatusIcon = config.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4",
      jobColors[delivery.jobName] || 'border-l-gray-300',
      delivery.status === 'delayed' && "border-red-200",
      delivery.conditionStatus === 'damaged' && "ring-1 ring-red-200",
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
            delivery.status === 'delayed' ? 'bg-red-100' :
            delivery.status === 'in-transit' ? 'bg-purple-100' :
            delivery.status === 'delivered' ? 'bg-green-100' :
            delivery.status === 'partial' ? 'bg-amber-100' : 'bg-blue-100'
          )}>
            <Truck className={cn(
              "h-5 w-5",
              delivery.status === 'delayed' ? 'text-red-600' :
              delivery.status === 'in-transit' ? 'text-purple-600' :
              delivery.status === 'delivered' ? 'text-green-600' :
              delivery.status === 'partial' ? 'text-amber-600' : 'text-blue-600'
            )} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{delivery.description}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
              <span>{delivery.jobName}</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                <Link2 className="h-3 w-3" />
                {delivery.poNumber}
              </span>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
          <span className={delivery.status === 'delayed' ? 'text-red-600 font-medium' : ''}>
            {delivery.expectedDate}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span>{delivery.expectedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Truck className="h-3.5 w-3.5 text-gray-400" />
          <span>{delivery.vendor}</span>
          {delivery.vendorOnTimeRate !== undefined && delivery.vendorOnTimeRate < 85 && (
            <span className="text-xs text-red-500 font-medium">{delivery.vendorOnTimeRate}% on-time</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="h-3.5 w-3.5 text-gray-400" />
          <span>{delivery.orderedItems} items</span>
          {delivery.receivedItems > 0 && delivery.receivedItems < delivery.orderedItems && (
            <span className="text-xs text-amber-600">({delivery.receivedItems} received)</span>
          )}
        </div>
      </div>

      {/* Receiving progress for partial deliveries */}
      {delivery.status === 'partial' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Received</span>
            <span>{delivery.receivedItems}/{delivery.orderedItems} items ({delivery.backorderedItems} backordered)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(delivery.receivedItems / delivery.orderedItems) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tracking info */}
      {delivery.trackingNumber && delivery.status !== 'delivered' && (
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{delivery.carrier}: {delivery.trackingNumber}</span>
          <button className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5">
            Track <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Site contact & receiving info */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
        <User className="h-3.5 w-3.5 text-gray-400" />
        {delivery.receivedBy ? (
          <span>Received by: {delivery.receivedBy}
            {delivery.receivedLocation && (
              <span className="text-xs text-gray-400 ml-1">({delivery.receivedLocation.replace('_', ' ')})</span>
            )}
          </span>
        ) : (
          <span>Site Contact: {delivery.siteContact}</span>
        )}
      </div>

      {/* Condition status for delivered items */}
      {delivery.conditionStatus && delivery.status === 'delivered' && (
        <div className={cn(
          "mb-2 p-2 rounded flex items-start gap-2 text-xs",
          delivery.conditionStatus === 'good' ? "bg-green-50" : "bg-red-50"
        )}>
          {delivery.conditionStatus === 'good' ? (
            <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <span className={conditionColors[delivery.conditionStatus].color + " font-medium"}>
              {conditionColors[delivery.conditionStatus].label}
            </span>
            {delivery.damageNotes && (
              <p className="text-red-600 mt-0.5">{delivery.damageNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* Special instructions */}
      {delivery.specialInstructions && delivery.status !== 'delivered' && (
        <div className="mb-2 p-2 rounded bg-amber-50 flex items-start gap-2 text-xs">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="text-amber-700">{delivery.specialInstructions}</span>
        </div>
      )}

      {/* Footer - Status & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", config.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          <span className="text-xs text-gray-400">{formatCurrency(delivery.poAmount)}</span>
        </div>
        <div className="flex items-center gap-2">
          {delivery.hasPhotos && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Image className="h-3.5 w-3.5" />
              {delivery.photoCount}
            </span>
          )}
          {delivery.status !== 'delivered' && delivery.status !== 'delayed' && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 border border-green-200 rounded hover:bg-green-50">
              <Clipboard className="h-3.5 w-3.5" />
              Receive
            </button>
          )}
          {delivery.status === 'delivered' && !delivery.hasPhotos && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              <Camera className="h-3.5 w-3.5" />
              Add Photos
            </button>
          )}
          {delivery.status === 'delayed' && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50">
              <AlertTriangle className="h-3.5 w-3.5" />
              Contact Vendor
            </button>
          )}
        </div>
      </div>

      {/* Cross-module badges */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="text-xs bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">{delivery.costCode}</span>
        {delivery.scheduleTaskName && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded inline-flex items-center gap-0.5",
            delivery.scheduleImpactDays && delivery.scheduleImpactDays > 0
              ? "bg-red-50 text-red-600"
              : "bg-gray-50 text-gray-500"
          )}>
            <CalendarDays className="h-3 w-3" />
            {delivery.scheduleTaskName}
            {delivery.scheduleImpactDays !== undefined && delivery.scheduleImpactDays > 0 && (
              <span className="font-medium ml-0.5">+{delivery.scheduleImpactDays}d</span>
            )}
          </span>
        )}
        {delivery.invoiceMatched && (
          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <CheckCircle className="h-3 w-3" />
            Invoice Matched
          </span>
        )}
        {delivery.backorderedItems > 0 && (
          <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
            <PackageX className="h-3 w-3" />
            {delivery.backorderedItems} backordered
          </span>
        )}
      </div>

      {/* AI Note */}
      {delivery.aiNote && (
        <div className="mt-2 p-2 rounded-md bg-blue-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
          <span className="text-blue-700">{delivery.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function DeliveriesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState()
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')

  const jobs = [...new Set(mockDeliveries.map(d => d.jobName))]
  const vendors = [...new Set(mockDeliveries.map(d => d.vendor))]

  const filteredDeliveries = sortItems(
    mockDeliveries.filter(delivery => {
      if (!matchesSearch(delivery, search, ['description', 'poNumber', 'jobName', 'vendor', 'siteContact', 'costCode'])) return false
      if (activeTab !== 'all' && delivery.status !== activeTab) return false
      if (jobFilter !== 'all' && delivery.jobName !== jobFilter) return false
      if (vendorFilter !== 'all' && delivery.vendor !== vendorFilter) return false
      return true
    }),
    activeSort as keyof Delivery | '',
    sortDirection,
  )

  // Group deliveries by date
  const todayDeliveries = filteredDeliveries.filter(d => d.daysUntil === 0 && d.status !== 'delayed' && d.status !== 'delivered')
  const tomorrowDeliveries = filteredDeliveries.filter(d => d.daysUntil === 1 && d.status !== 'delayed' && d.status !== 'delivered')
  const upcomingDeliveries = filteredDeliveries.filter(d => d.daysUntil > 1 && d.status !== 'delayed' && d.status !== 'delivered')
  const delayedDeliveries = filteredDeliveries.filter(d => d.status === 'delayed')
  const partialDeliveries = filteredDeliveries.filter(d => d.status === 'partial')
  const deliveredRecently = filteredDeliveries.filter(d => d.status === 'delivered')

  // Calculate stats
  const totalDeliveries = mockDeliveries.length
  const scheduledCount = mockDeliveries.filter(d => d.status === 'scheduled').length
  const inTransitCount = mockDeliveries.filter(d => d.status === 'in-transit').length
  const delayedCount = mockDeliveries.filter(d => d.status === 'delayed').length
  const partialCount = mockDeliveries.filter(d => d.status === 'partial').length
  const deliveredCount = mockDeliveries.filter(d => d.status === 'delivered').length
  const totalBackordered = mockDeliveries.reduce((sum, d) => sum + d.backorderedItems, 0)
  const totalDeliveryValue = mockDeliveries.reduce((sum, d) => sum + d.poAmount, 0)
  const damageCount = mockDeliveries.filter(d => d.conditionStatus === 'damaged').length
  const scheduleAtRisk = mockDeliveries.filter(d => d.scheduleImpactDays !== undefined && d.scheduleImpactDays > 0).length
  const onTimeDelivered = mockDeliveries.filter(d => d.status === 'delivered' && d.daysUntil >= -2).length
  const onTimeRate = deliveredCount > 0 ? Math.round((onTimeDelivered / deliveredCount) * 100) : 100

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Deliveries</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {totalDeliveries} total
              </span>
              {scheduleAtRisk > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {scheduleAtRisk} schedule risk
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Track incoming material deliveries across all jobs | Total value: {formatCurrency(totalDeliveryValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Scheduled
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{scheduledCount}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-purple-600 text-xs">
              <Truck className="h-3.5 w-3.5" />
              In Transit
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{inTransitCount}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            delayedCount > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-xs",
              delayedCount > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <AlertTriangle className="h-3.5 w-3.5" />
              Delayed
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              delayedCount > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {delayedCount}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalBackordered > 0 ? "bg-orange-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-1.5 text-xs",
              totalBackordered > 0 ? "text-orange-600" : "text-gray-500"
            )}>
              <PackageX className="h-3.5 w-3.5" />
              Backordered
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              totalBackordered > 0 ? "text-orange-700" : "text-gray-900"
            )}>
              {totalBackordered} items
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-green-600 text-xs">
              <CheckCircle className="h-3.5 w-3.5" />
              Delivered
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{deliveredCount}</div>
            {damageCount > 0 && (
              <div className="text-xs text-red-500">{damageCount} w/ damage</div>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              On-Time Rate
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              onTimeRate >= 90 ? "text-green-700" :
              onTimeRate >= 75 ? "text-amber-700" : "text-red-700"
            )}>
              {onTimeRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search deliveries by item, PO, job, vendor, cost code..."
          tabs={[
            { key: 'all', label: 'All', count: mockDeliveries.length },
            { key: 'scheduled', label: 'Scheduled', count: scheduledCount },
            { key: 'in-transit', label: 'In Transit', count: inTransitCount },
            { key: 'partial', label: 'Partial', count: partialCount },
            { key: 'delayed', label: 'Delayed', count: delayedCount },
            { key: 'delivered', label: 'Delivered', count: deliveredCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Jobs',
              value: jobFilter,
              options: jobs.map(j => ({ value: j, label: j })),
              onChange: setJobFilter,
            },
            {
              label: 'All Vendors',
              value: vendorFilter,
              options: vendors.map(v => ({ value: v, label: v })),
              onChange: setVendorFilter,
            },
          ]}
          sortOptions={[
            { value: 'daysUntil', label: 'Date' },
            { value: 'description', label: 'Description' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'jobName', label: 'Job' },
            { value: 'poAmount', label: 'Value' },
            { value: 'orderedItems', label: 'Item Count' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'Manual Delivery', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredDeliveries.length}
          totalCount={mockDeliveries.length}
        />
      </div>

      {/* Delivery List */}
      <div className="p-4 max-h-[520px] overflow-y-auto">
        {/* Delayed Section */}
        {delayedDeliveries.length > 0 && activeTab !== 'delivered' && activeTab !== 'scheduled' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h4 className="font-medium text-red-700">Delayed</h4>
              <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">{delayedDeliveries.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {delayedDeliveries.map(delivery => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {/* Partial Deliveries Section */}
        {partialDeliveries.length > 0 && activeTab !== 'delivered' && activeTab !== 'scheduled' && activeTab !== 'delayed' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-amber-500" />
              <h4 className="font-medium text-amber-700">Partial Deliveries</h4>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{partialDeliveries.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {partialDeliveries.map(delivery => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {/* Today Section */}
        {todayDeliveries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-gray-900">Today - February 12</h4>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{todayDeliveries.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {todayDeliveries.map(delivery => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow Section */}
        {tomorrowDeliveries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <h4 className="font-medium text-gray-900">Tomorrow - February 13</h4>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{tomorrowDeliveries.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {tomorrowDeliveries.map(delivery => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Section */}
        {upcomingDeliveries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <h4 className="font-medium text-gray-900">Upcoming</h4>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{upcomingDeliveries.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {upcomingDeliveries.map(delivery => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Delivered */}
        {deliveredRecently.length > 0 && activeTab !== 'scheduled' && activeTab !== 'delayed' && activeTab !== 'partial' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <h4 className="font-medium text-gray-900">Recently Delivered</h4>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">{deliveredRecently.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {deliveredRecently.map(delivery => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          </div>
        )}

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No deliveries found matching your criteria</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Delivery Intelligence:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Appliance delay (18 days) impacts trim-out at Smith Residence
            </span>
            <span className="text-amber-400">|</span>
            <span>PGT windows today: forklift confirmed on site</span>
            <span className="text-amber-400">|</span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Elite Appliances: 72% on-time (flag for vendor review)
            </span>
            <span className="text-amber-400">|</span>
            <span>HVAC backorder may push schedule +5 days at Johnson Beach House</span>
          </div>
        </div>
      </div>
    </div>
  )
}
