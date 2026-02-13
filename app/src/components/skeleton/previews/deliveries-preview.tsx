'use client'

import {
  Plus,
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
  expectedDate: string
  expectedTime: string
  status: 'scheduled' | 'in-transit' | 'delivered' | 'delayed' | 'partial'
  siteContact: string
  specialInstructions?: string
  items: number
  aiNote?: string
  daysUntil: number
}

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    description: 'Windows - PGT Impact',
    poNumber: 'PO-089',
    jobName: 'Smith Residence',
    vendor: 'ABC Glass',
    expectedDate: 'Today',
    expectedTime: '9:00 AM - 12:00 PM',
    status: 'scheduled',
    siteContact: 'Mike Rodriguez',
    specialInstructions: 'Forklift needed for unloading',
    items: 20,
    daysUntil: 0,
  },
  {
    id: '2',
    description: 'Lumber Package - 2nd Floor',
    poNumber: 'PO-092',
    jobName: 'Johnson Beach House',
    vendor: 'Coastal Lumber',
    expectedDate: 'Tomorrow',
    expectedTime: '7:00 AM - 9:00 AM',
    status: 'scheduled',
    siteContact: 'Carlos Mendez',
    items: 150,
    daysUntil: 1,
  },
  {
    id: '3',
    description: 'Roofing Materials',
    poNumber: 'PO-085',
    jobName: 'Harbor View Custom',
    vendor: 'Building Supply Co',
    expectedDate: 'Feb 14',
    expectedTime: '8:00 AM - 10:00 AM',
    status: 'in-transit',
    siteContact: 'Tom Williams',
    items: 45,
    daysUntil: 2,
    aiNote: 'Truck GPS shows 2 hours away',
  },
  {
    id: '4',
    description: 'Plumbing Fixtures',
    poNumber: 'PO-091',
    jobName: 'Smith Residence',
    vendor: 'Plumbing Supply Co',
    expectedDate: 'Feb 15',
    expectedTime: '10:00 AM - 2:00 PM',
    status: 'scheduled',
    siteContact: 'Mike Rodriguez',
    items: 28,
    daysUntil: 3,
  },
  {
    id: '5',
    description: 'HVAC Equipment',
    poNumber: 'PO-088',
    jobName: 'Davis Addition',
    vendor: 'Cool Air Supply',
    expectedDate: 'Feb 16',
    expectedTime: '8:00 AM - 11:00 AM',
    status: 'scheduled',
    siteContact: 'Jake Ross',
    items: 8,
    daysUntil: 4,
  },
  {
    id: '6',
    description: 'Appliances - Kitchen',
    poNumber: 'PO-078',
    jobName: 'Smith Residence',
    vendor: 'Elite Appliances',
    expectedDate: 'Was: Jan 25',
    expectedTime: '-',
    status: 'delayed',
    siteContact: 'Mike Rodriguez',
    items: 6,
    daysUntil: -18,
    aiNote: '10 day delay may impact trim-out schedule. New ETA: Feb 5',
  },
  {
    id: '7',
    description: 'Drywall Delivery',
    poNumber: 'PO-093',
    jobName: 'Johnson Beach House',
    vendor: 'Building Supply Co',
    expectedDate: 'Feb 17',
    expectedTime: '7:00 AM - 9:00 AM',
    status: 'scheduled',
    siteContact: 'Carlos Mendez',
    specialInstructions: 'Boom truck required - 2nd floor delivery',
    items: 200,
    daysUntil: 5,
  },
  {
    id: '8',
    description: 'Tile - Master Bath',
    poNumber: 'PO-090',
    jobName: 'Harbor View Custom',
    vendor: 'Tile World',
    expectedDate: 'Feb 11',
    expectedTime: '11:00 AM',
    status: 'delivered',
    siteContact: 'Tom Williams',
    items: 35,
    daysUntil: -1,
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
  'Davis Addition': 'border-l-amber-500',
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const config = statusConfig[delivery.status]
  const StatusIcon = config.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4",
      jobColors[delivery.jobName] || 'border-l-gray-300',
      delivery.status === 'delayed' && "border-red-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            delivery.status === 'delayed' ? 'bg-red-100' :
            delivery.status === 'in-transit' ? 'bg-purple-100' :
            delivery.status === 'delivered' ? 'bg-green-100' : 'bg-blue-100'
          )}>
            <Truck className={cn(
              "h-5 w-5",
              delivery.status === 'delayed' ? 'text-red-600' :
              delivery.status === 'in-transit' ? 'text-purple-600' :
              delivery.status === 'delivered' ? 'text-green-600' : 'text-blue-600'
            )} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{delivery.description}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
              <span>{delivery.jobName}</span>
              <span className="text-gray-300">|</span>
              <span>{delivery.poNumber}</span>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className={delivery.status === 'delayed' ? 'text-red-600 font-medium' : ''}>
            {delivery.expectedDate}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{delivery.expectedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Truck className="h-4 w-4 text-gray-400" />
          <span>{delivery.vendor}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{delivery.items} items</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
        <User className="h-4 w-4 text-gray-400" />
        <span>Site Contact: {delivery.siteContact}</span>
      </div>

      {delivery.specialInstructions && (
        <div className="mb-3 p-2 rounded bg-amber-50 flex items-start gap-2 text-xs">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          <span className="text-amber-700">{delivery.specialInstructions}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", config.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
        <div className="flex items-center gap-2">
          {delivery.status !== 'delivered' && delivery.status !== 'delayed' && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 border border-green-200 rounded hover:bg-green-50">
              <CheckCircle className="h-3.5 w-3.5" />
              Mark Received
            </button>
          )}
          {delivery.status === 'delivered' && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              <Camera className="h-3.5 w-3.5" />
              Add Photos
            </button>
          )}
        </div>
      </div>

      {delivery.aiNote && (
        <div className="mt-3 p-2 rounded-md bg-blue-50 flex items-start gap-2 text-xs">
          <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
          <span className="text-blue-700">{delivery.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function DeliveriesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState()

  const filteredDeliveries = sortItems(
    mockDeliveries.filter(delivery => {
      if (!matchesSearch(delivery, search, ['description', 'poNumber', 'jobName', 'vendor', 'siteContact'])) return false
      if (activeTab !== 'all' && delivery.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Delivery | '',
    sortDirection,
  )

  // Group deliveries by date
  const todayDeliveries = filteredDeliveries.filter(d => d.daysUntil === 0)
  const tomorrowDeliveries = filteredDeliveries.filter(d => d.daysUntil === 1)
  const upcomingDeliveries = filteredDeliveries.filter(d => d.daysUntil > 1)
  const delayedDeliveries = filteredDeliveries.filter(d => d.status === 'delayed')
  const deliveredRecently = filteredDeliveries.filter(d => d.status === 'delivered')

  // Calculate stats
  const totalDeliveries = mockDeliveries.length
  const scheduledCount = mockDeliveries.filter(d => d.status === 'scheduled').length
  const inTransitCount = mockDeliveries.filter(d => d.status === 'in-transit').length
  const delayedCount = mockDeliveries.filter(d => d.status === 'delayed').length
  const deliveredCount = mockDeliveries.filter(d => d.status === 'delivered').length

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
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Track incoming material deliveries across all jobs
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="h-4 w-4" />
              Scheduled
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{scheduledCount}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <Truck className="h-4 w-4" />
              In Transit
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{inTransitCount}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            delayedCount > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              delayedCount > 0 ? "text-red-600" : "text-gray-500"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Delayed
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              delayedCount > 0 ? "text-red-700" : "text-gray-900"
            )}>
              {delayedCount}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Delivered
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{deliveredCount}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Package className="h-4 w-4" />
              This Week
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">8</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search deliveries..."
          tabs={[
            { key: 'all', label: 'All', count: mockDeliveries.length },
            { key: 'scheduled', label: 'Scheduled', count: scheduledCount },
            { key: 'in-transit', label: 'In Transit', count: inTransitCount },
            { key: 'delayed', label: 'Delayed', count: delayedCount },
            { key: 'delivered', label: 'Delivered', count: deliveredCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'daysUntil', label: 'Date' },
            { value: 'description', label: 'Description' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'jobName', label: 'Job' },
            { value: 'items', label: 'Item Count' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[
            { icon: Plus, label: 'Manual Delivery', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredDeliveries.length}
          totalCount={mockDeliveries.length}
        />
      </div>

      {/* Delivery List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Delayed Section */}
        {delayedDeliveries.length > 0 && activeTab !== 'delivered' && (
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
        {deliveredRecently.length > 0 && activeTab !== 'scheduled' && activeTab !== 'delayed' && (
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
              Appliance delay may impact trim-out schedule at Smith Residence
            </span>
            <span className="text-amber-400">|</span>
            <span>Window delivery today requires forklift - confirm equipment on site</span>
            <span className="text-amber-400">|</span>
            <span>ABC Lumber deliveries 15% more likely to be delayed - add buffer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
