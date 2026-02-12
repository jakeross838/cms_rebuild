'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  Sparkles,
  MoreHorizontal,
  Send,
  FileCheck,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type WaiverStatus = 'pending' | 'requested' | 'received' | 'missing'
type WaiverType = 'conditional' | 'unconditional'

interface LienWaiver {
  id: string
  vendorName: string
  waiverType: WaiverType
  amount: number
  drawNumber: number
  dateRequested: string
  dateReceived?: string
  status: WaiverStatus
  jobName: string
  aiNote?: string
}

const mockLienWaivers: LienWaiver[] = [
  {
    id: '1',
    vendorName: 'ABC Lumber Supply',
    waiverType: 'conditional',
    amount: 24500,
    drawNumber: 3,
    dateRequested: '2024-12-01',
    status: 'received',
    dateReceived: '2024-12-05',
    jobName: 'Smith Residence',
  },
  {
    id: '2',
    vendorName: 'PGT Industries',
    waiverType: 'unconditional',
    amount: 45800,
    drawNumber: 2,
    dateRequested: '2024-11-15',
    status: 'received',
    dateReceived: '2024-11-20',
    jobName: 'Smith Residence',
  },
  {
    id: '3',
    vendorName: 'Jones Plumbing',
    waiverType: 'conditional',
    amount: 12750,
    drawNumber: 3,
    dateRequested: '2024-12-01',
    status: 'requested',
    jobName: 'Smith Residence',
    aiNote: 'Vendor typically responds in 3-5 days. Follow-up in 2 days.',
  },
  {
    id: '4',
    vendorName: 'Smith Electric',
    waiverType: 'conditional',
    amount: 18200,
    drawNumber: 3,
    dateRequested: '2024-12-01',
    status: 'pending',
    jobName: 'Johnson Beach House',
  },
  {
    id: '5',
    vendorName: 'Cool Air HVAC',
    waiverType: 'unconditional',
    amount: 28000,
    drawNumber: 2,
    dateRequested: '2024-11-10',
    status: 'missing',
    jobName: 'Smith Residence',
    aiNote: 'Waiver overdue by 15 days. Contact vendor immediately.',
  },
  {
    id: '6',
    vendorName: 'Custom Cabinet Co',
    waiverType: 'conditional',
    amount: 32400,
    drawNumber: 3,
    dateRequested: '2024-12-02',
    status: 'requested',
    jobName: 'Johnson Beach House',
  },
  {
    id: '7',
    vendorName: 'Sherwin-Williams',
    waiverType: 'unconditional',
    amount: 4200,
    drawNumber: 1,
    dateRequested: '2024-10-15',
    status: 'received',
    dateReceived: '2024-10-18',
    jobName: 'Miller Addition',
  },
  {
    id: '8',
    vendorName: 'ABC Framing',
    waiverType: 'conditional',
    amount: 38500,
    drawNumber: 3,
    dateRequested: '2024-12-01',
    status: 'pending',
    jobName: 'Wilson Custom',
  },
  {
    id: '9',
    vendorName: 'Coastal Concrete',
    waiverType: 'unconditional',
    amount: 22000,
    drawNumber: 1,
    dateRequested: '2024-10-01',
    status: 'missing',
    jobName: 'Davis Coastal Home',
    aiNote: 'Critical: Blocking Draw 4 release. Escalate to project manager.',
  },
]

const statusConfig: Record<WaiverStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Clock },
  requested: { label: 'Requested', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Send },
  received: { label: 'Received', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  missing: { label: 'Missing', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
}

const waiverTypeConfig: Record<WaiverType, { label: string; color: string }> = {
  conditional: { label: 'Conditional', color: 'bg-purple-50 text-purple-700' },
  unconditional: { label: 'Unconditional', color: 'bg-teal-50 text-teal-700' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDaysSinceRequested(dateRequested: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const requested = new Date(dateRequested)
  requested.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - requested.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function WaiverRow({ waiver }: { waiver: LienWaiver }) {
  const status = statusConfig[waiver.status]
  const waiverType = waiverTypeConfig[waiver.waiverType]
  const StatusIcon = status.icon
  const daysSinceRequested = getDaysSinceRequested(waiver.dateRequested)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-gray-900">{waiver.vendorName}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.bgColor, status.color)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded font-medium", waiverType.color)}>
              {waiverType.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-semibold">{formatCurrency(waiver.amount)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <span>Draw #{waiver.drawNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{waiver.jobName}</span>
            </div>
          </div>

          {waiver.aiNote && (
            <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              waiver.status === 'missing' ? "bg-red-50" : "bg-amber-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                waiver.status === 'missing' ? "text-red-500" : "text-amber-500"
              )} />
              <span className={waiver.status === 'missing' ? "text-red-700" : "text-amber-700"}>
                {waiver.aiNote}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Requested {formatDate(waiver.dateRequested)}</span>
            </div>
            {waiver.status === 'received' && waiver.dateReceived && (
              <div className="text-xs text-green-600 mt-1">
                Received {formatDate(waiver.dateReceived)}
              </div>
            )}
            {(waiver.status === 'requested' || waiver.status === 'missing') && (
              <div className={cn(
                "text-xs mt-1",
                daysSinceRequested > 14 ? "text-red-600" :
                daysSinceRequested > 7 ? "text-amber-600" :
                "text-gray-500"
              )}>
                {daysSinceRequested} days ago
              </div>
            )}
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function LienWaiversPreview() {
  const [statusFilter, setStatusFilter] = useState<WaiverStatus | 'all'>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [drawFilter, setDrawFilter] = useState<string>('all')

  const vendors = [...new Set(mockLienWaivers.map(w => w.vendorName))]
  const draws = [...new Set(mockLienWaivers.map(w => w.drawNumber))].sort((a, b) => a - b)

  const filteredWaivers = mockLienWaivers.filter(w => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false
    if (vendorFilter !== 'all' && w.vendorName !== vendorFilter) return false
    if (drawFilter !== 'all' && w.drawNumber !== parseInt(drawFilter)) return false
    return true
  })

  // Calculate quick stats
  const receivedCount = mockLienWaivers.filter(w => w.status === 'received').length
  const receivedAmount = mockLienWaivers
    .filter(w => w.status === 'received')
    .reduce((sum, w) => sum + w.amount, 0)

  const pendingCount = mockLienWaivers.filter(w => w.status === 'pending' || w.status === 'requested').length
  const pendingAmount = mockLienWaivers
    .filter(w => w.status === 'pending' || w.status === 'requested')
    .reduce((sum, w) => sum + w.amount, 0)

  const missingCount = mockLienWaivers.filter(w => w.status === 'missing').length
  const missingAmount = mockLienWaivers
    .filter(w => w.status === 'missing')
    .reduce((sum, w) => sum + w.amount, 0)

  // Calculate collection progress
  const totalWaivers = mockLienWaivers.length
  const collectionProgress = Math.round((receivedCount / totalWaivers) * 100)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Lien Waivers</h3>
              <span className="text-sm text-gray-500">{mockLienWaivers.length} waivers | {formatCurrency(mockLienWaivers.reduce((sum, w) => sum + w.amount, 0))} total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Request Waiver
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Received ({receivedCount})
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{formatCurrency(receivedAmount)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending ({pendingCount})
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(pendingAmount)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            missingCount > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              missingCount > 0 ? "text-red-600" : "text-gray-600"
            )}>
              {missingCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <FileCheck className="h-4 w-4" />}
              Missing ({missingCount})
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              missingCount > 0 ? "text-red-700" : "text-gray-700"
            )}>
              {missingCount > 0 ? formatCurrency(missingAmount) : '$0'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg transition-colors",
                    statusFilter === 'all'
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  All
                </button>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key as WaiverStatus)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-lg transition-colors",
                      statusFilter === key
                        ? cn(config.bgColor, config.color, "font-medium")
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Draw Filter */}
            <div className="relative">
              <select
                value={drawFilter}
                onChange={(e) => setDrawFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Draws</option>
                {draws.map(draw => (
                  <option key={draw} value={draw}>Draw #{draw}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Vendor Filter */}
            <div className="relative">
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search waivers..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Waiver List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredWaivers.map(waiver => (
          <WaiverRow key={waiver.id} waiver={waiver} />
        ))}
        {filteredWaivers.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No lien waivers match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Collection Progress:</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 bg-amber-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${collectionProgress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-amber-800">{collectionProgress}%</span>
            </div>
            <p className="text-sm text-amber-700">
              {missingCount > 0 && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 inline" />
                  {missingCount} missing waiver{missingCount > 1 ? 's' : ''} blocking draw releases.
                </span>
              )}
              {missingCount === 0 && pendingCount > 0 && (
                <span>All waivers on track. {pendingCount} pending - expected within 5 business days.</span>
              )}
              {missingCount === 0 && pendingCount === 0 && (
                <span>All lien waivers collected! Ready for draw processing.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
