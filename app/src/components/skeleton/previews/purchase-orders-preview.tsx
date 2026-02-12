'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Package,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Inbox,
  Truck,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PurchaseOrder {
  id: string
  poNumber: string
  vendorName: string
  jobName: string
  amount: number
  date: string
  itemsCount: number
  status: 'draft' | 'sent' | 'acknowledged' | 'received' | 'invoiced'
  expectedDelivery?: string
  aiNote?: string
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-0142',
    vendorName: 'ABC Lumber',
    jobName: 'Smith Residence',
    amount: 24500,
    date: '2024-11-08',
    itemsCount: 12,
    status: 'acknowledged',
    expectedDelivery: '2024-11-15',
  },
  {
    id: '2',
    poNumber: 'PO-2024-0141',
    vendorName: 'PGT Industries',
    jobName: 'Smith Residence',
    amount: 45000,
    date: '2024-11-06',
    itemsCount: 24,
    status: 'acknowledged',
    expectedDelivery: '2024-12-20',
    aiNote: 'Lead time 6+ weeks - order early for next job',
  },
  {
    id: '3',
    poNumber: 'PO-2024-0140',
    vendorName: 'Custom Cabinet Co',
    jobName: 'Johnson Beach House',
    amount: 18500,
    date: '2024-11-05',
    itemsCount: 8,
    status: 'sent',
    aiNote: 'No acknowledgment in 3 days - follow up recommended',
  },
  {
    id: '4',
    poNumber: 'PO-2024-0139',
    vendorName: 'Sherwin-Williams',
    jobName: 'Miller Addition',
    amount: 3200,
    date: '2024-11-04',
    itemsCount: 6,
    status: 'received',
  },
  {
    id: '5',
    poNumber: 'PO-2024-0138',
    vendorName: 'Jones Plumbing Supply',
    jobName: 'Smith Residence',
    amount: 12800,
    date: '2024-11-02',
    itemsCount: 15,
    status: 'invoiced',
  },
  {
    id: '6',
    poNumber: 'PO-2024-0143',
    vendorName: 'ABC Lumber',
    jobName: 'Wilson Custom',
    amount: 8500,
    date: '2024-11-09',
    itemsCount: 5,
    status: 'draft',
    aiNote: 'Combine with PO-0142 for volume discount',
  },
  {
    id: '7',
    poNumber: 'PO-2024-0137',
    vendorName: 'Cool Air HVAC',
    jobName: 'Johnson Beach House',
    amount: 28000,
    date: '2024-10-30',
    itemsCount: 4,
    status: 'received',
    expectedDelivery: '2024-11-10',
  },
  {
    id: '8',
    poNumber: 'PO-2024-0136',
    vendorName: 'Smith Electric Supply',
    jobName: 'Miller Addition',
    amount: 9200,
    date: '2024-10-28',
    itemsCount: 22,
    status: 'invoiced',
  },
]

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    icon: FileText,
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-700',
    icon: Send,
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'bg-purple-100 text-purple-700',
    icon: Inbox,
  },
  received: {
    label: 'Received',
    color: 'bg-green-100 text-green-700',
    icon: Truck,
  },
  invoiced: {
    label: 'Invoiced',
    color: 'bg-amber-100 text-amber-700',
    icon: Receipt,
  },
}

const vendors = [...new Set(mockPurchaseOrders.map(po => po.vendorName))]
const jobs = [...new Set(mockPurchaseOrders.map(po => po.jobName))]
const statuses = ['draft', 'sent', 'acknowledged', 'received', 'invoiced'] as const

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function POCard({ po }: { po: PurchaseOrder }) {
  const config = statusConfig[po.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{po.poNumber}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", config.color)}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Building2 className="h-3.5 w-3.5" />
            <span>{po.vendorName}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{po.jobName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(po.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            <span>{po.itemsCount} items</span>
          </div>
        </div>
        {po.expectedDelivery && po.status !== 'received' && po.status !== 'invoiced' && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Truck className="h-3.5 w-3.5" />
            <span>Expected: {formatDate(po.expectedDelivery)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-lg font-semibold text-gray-900">
          <DollarSign className="h-4 w-4 text-gray-500" />
          {formatCurrency(po.amount)}
        </div>
        {po.status === 'draft' && (
          <button className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            <Send className="h-3 w-3" />
            Send PO
          </button>
        )}
        {po.status === 'received' && (
          <button className="text-xs text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Mark Invoiced
          </button>
        )}
      </div>

      {po.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{po.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function PurchaseOrdersPreview() {
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredPOs = mockPurchaseOrders.filter(po => {
    if (vendorFilter !== 'all' && po.vendorName !== vendorFilter) return false
    if (jobFilter !== 'all' && po.jobName !== jobFilter) return false
    if (statusFilter !== 'all' && po.status !== statusFilter) return false
    return true
  })

  // Calculate quick stats
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const posThisMonth = mockPurchaseOrders.filter(po => {
    const date = new Date(po.date)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  })

  const totalCommitted = mockPurchaseOrders
    .filter(po => po.status !== 'draft')
    .reduce((sum, po) => sum + po.amount, 0)

  const pendingDelivery = mockPurchaseOrders
    .filter(po => po.status === 'sent' || po.status === 'acknowledged')
    .reduce((sum, po) => sum + po.amount, 0)

  const activeFiltersCount = [vendorFilter, jobFilter, statusFilter].filter(f => f !== 'all').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Purchase Orders</h3>
            <span className="text-sm text-gray-500">{mockPurchaseOrders.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search POs..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg",
                showFilters || activeFiltersCount > 0
                  ? "border-blue-200 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <Filter className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New PO
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Vendor:</label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Job:</label>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{statusConfig[status].label}</option>
                ))}
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setVendorFilter('all')
                  setJobFilter('all')
                  setStatusFilter('all')
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="h-4 w-4" />
              POs This Month
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{posThisMonth.length}</div>
            <div className="text-xs text-gray-500">{formatCurrency(posThisMonth.reduce((sum, po) => sum + po.amount, 0))} total</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Committed
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(totalCommitted)}</div>
            <div className="text-xs text-blue-600">{mockPurchaseOrders.filter(po => po.status !== 'draft').length} active POs</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Truck className="h-4 w-4" />
              Pending Delivery
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(pendingDelivery)}</div>
            <div className="text-xs text-amber-600">{mockPurchaseOrders.filter(po => po.status === 'sent' || po.status === 'acknowledged').length} awaiting</div>
          </div>
        </div>
      </div>

      {/* PO List */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[480px] overflow-y-auto">
        {filteredPOs.map(po => (
          <POCard key={po.id} po={po} />
        ))}
        {filteredPOs.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No purchase orders match your filters</p>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Procurement Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              1 PO awaiting vendor acknowledgment
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              PGT order on track for Dec 20
            </span>
            <span>|</span>
            <span>Combine ABC Lumber orders to save ~$850</span>
          </div>
        </div>
      </div>
    </div>
  )
}
