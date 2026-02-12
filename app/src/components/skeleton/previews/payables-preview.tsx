'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Building2,
  Briefcase,
  Sparkles,
  MoreHorizontal,
  CreditCard,
  FileCheck,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PayableStatus = 'pending' | 'approved' | 'scheduled' | 'paid'

interface Payable {
  id: string
  invoiceNumber: string
  vendorName: string
  jobName: string
  amount: number
  amountPaid: number
  dueDate: string
  status: PayableStatus
  paymentTerms: string
  earlyPayDiscount?: { percent: number; deadline: string; savings: number }
  lienWaiverStatus: 'received' | 'pending' | 'not_required'
  retainage?: number
  aiNote?: string
}

const mockPayables: Payable[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0892',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Smith Residence',
    amount: 24000,
    amountPaid: 0,
    dueDate: '2026-02-15',
    status: 'approved',
    paymentTerms: 'Net 30',
    earlyPayDiscount: { percent: 2, deadline: '2026-02-12', savings: 480 },
    lienWaiverStatus: 'received',
    aiNote: 'Pay by Feb 12 for 2% discount ($480 savings). Cash available.',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0888',
    vendorName: 'XYZ Electric',
    jobName: 'Smith Residence',
    amount: 12450,
    amountPaid: 0,
    dueDate: '2026-02-17',
    status: 'approved',
    paymentTerms: 'Net 30',
    lienWaiverStatus: 'pending',
    aiNote: 'Lien waiver pending. Request before payment.',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0885',
    vendorName: 'Coastal Plumbing',
    jobName: 'Multiple Jobs',
    amount: 18900,
    amountPaid: 0,
    dueDate: '2026-02-19',
    status: 'scheduled',
    paymentTerms: 'Net 15',
    lienWaiverStatus: 'received',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0880',
    vendorName: 'Jones Plumbing',
    jobName: 'Johnson Beach House',
    amount: 8750,
    amountPaid: 0,
    dueDate: '2026-02-20',
    status: 'pending',
    paymentTerms: 'Net 30',
    lienWaiverStatus: 'not_required',
    retainage: 875,
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-0875',
    vendorName: 'PGT Windows',
    jobName: 'Miller Addition',
    amount: 34500,
    amountPaid: 0,
    dueDate: '2026-02-22',
    status: 'approved',
    paymentTerms: 'Net 45',
    lienWaiverStatus: 'received',
    retainage: 3450,
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-0870',
    vendorName: 'ABC Framing',
    jobName: 'Wilson Custom',
    amount: 52000,
    amountPaid: 0,
    dueDate: '2026-02-25',
    status: 'pending',
    paymentTerms: 'Net 30',
    lienWaiverStatus: 'pending',
    retainage: 5200,
    aiNote: 'Large payment - verify lien waiver before scheduling.',
  },
  {
    id: '7',
    invoiceNumber: 'INV-2024-0860',
    vendorName: 'Custom Cabinet Co',
    jobName: 'Davis Coastal Home',
    amount: 28400,
    amountPaid: 14200,
    dueDate: '2026-02-28',
    status: 'scheduled',
    paymentTerms: 'Net 60',
    lienWaiverStatus: 'received',
    retainage: 2840,
  },
  {
    id: '8',
    invoiceNumber: 'INV-2024-0850',
    vendorName: 'Smith Electric',
    jobName: 'Miller Addition',
    amount: 6200,
    amountPaid: 6200,
    dueDate: '2026-02-10',
    status: 'paid',
    paymentTerms: 'Net 30',
    lienWaiverStatus: 'received',
  },
]

const statusConfig: Record<PayableStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending Approval', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  approved: { label: 'Approved', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  scheduled: { label: 'Scheduled', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Calendar },
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
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

function getDaysUntilDue(dueDate: string): { days: number; label: string; isOverdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)}d overdue`, isOverdue: true }
  } else if (diffDays === 0) {
    return { days: 0, label: 'Due today', isOverdue: false }
  } else {
    return { days: diffDays, label: `${diffDays}d`, isOverdue: false }
  }
}

function LienWaiverBadge({ status }: { status: Payable['lienWaiverStatus'] }) {
  switch (status) {
    case 'received':
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <FileCheck className="h-3 w-3" />
          Waiver received
        </span>
      )
    case 'pending':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Waiver pending
        </span>
      )
    case 'not_required':
      return (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          Not required
        </span>
      )
  }
}

function PayableRow({ payable, selected, onSelect }: { payable: Payable; selected: boolean; onSelect: () => void }) {
  const status = statusConfig[payable.status]
  const StatusIcon = status.icon
  const dueInfo = getDaysUntilDue(payable.dueDate)
  const balance = payable.amount - payable.amountPaid

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow",
      selected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-medium text-gray-900">{payable.invoiceNumber}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", status.bgColor, status.color)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
              {payable.earlyPayDiscount && payable.status !== 'paid' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {payable.earlyPayDiscount.percent}% discount available
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>{payable.vendorName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span>{payable.jobName}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-500">{payable.paymentTerms}</span>
              <LienWaiverBadge status={payable.lienWaiverStatus} />
              {payable.retainage && (
                <span className="text-xs text-gray-500">
                  Retainage: {formatCurrency(payable.retainage)}
                </span>
              )}
            </div>

            {payable.aiNote && (
              <div className={cn(
                "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
                payable.lienWaiverStatus === 'pending' ? "bg-amber-50" : "bg-blue-50"
              )}>
                <Sparkles className={cn(
                  "h-4 w-4 mt-0.5 flex-shrink-0",
                  payable.lienWaiverStatus === 'pending' ? "text-amber-500" : "text-blue-500"
                )} />
                <span className={payable.lienWaiverStatus === 'pending' ? "text-amber-700" : "text-blue-700"}>
                  {payable.aiNote}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {payable.amountPaid > 0 ? (
                <>
                  <span className="text-gray-400 line-through text-sm mr-2">{formatCurrency(payable.amount)}</span>
                  {formatCurrency(balance)}
                </>
              ) : (
                formatCurrency(payable.amount)
              )}
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Due {formatDate(payable.dueDate)}</span>
              {payable.status !== 'paid' && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium",
                  dueInfo.isOverdue ? "bg-red-100 text-red-700" :
                  dueInfo.days <= 7 ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {dueInfo.label}
                </span>
              )}
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {payable.status !== 'paid' && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          {payable.lienWaiverStatus === 'pending' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50">
              <Send className="h-3.5 w-3.5" />
              Request Waiver
            </button>
          )}
          {payable.status === 'pending' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
              <CheckCircle className="h-3.5 w-3.5" />
              Approve
            </button>
          )}
          {payable.status === 'approved' && payable.lienWaiverStatus !== 'pending' && (
            <>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Calendar className="h-3.5 w-3.5" />
                Schedule
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <CreditCard className="h-3.5 w-3.5" />
                Pay Now
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function PayablesPreview() {
  const [statusFilter, setStatusFilter] = useState<PayableStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredPayables = mockPayables.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedAmount = mockPayables
    .filter(p => selectedIds.has(p.id))
    .reduce((sum, p) => sum + (p.amount - p.amountPaid), 0)

  // Calculate stats
  const totalOutstanding = mockPayables
    .filter(p => p.status !== 'paid')
    .reduce((sum, p) => sum + (p.amount - p.amountPaid), 0)

  const dueThisWeek = mockPayables
    .filter(p => {
      if (p.status === 'paid') return false
      const dueInfo = getDaysUntilDue(p.dueDate)
      return dueInfo.days <= 7 && !dueInfo.isOverdue
    })
    .reduce((sum, p) => sum + (p.amount - p.amountPaid), 0)

  const pendingWaivers = mockPayables.filter(p => p.lienWaiverStatus === 'pending' && p.status !== 'paid').length

  const availableDiscounts = mockPayables
    .filter(p => p.earlyPayDiscount && p.status !== 'paid')
    .reduce((sum, p) => sum + (p.earlyPayDiscount?.savings || 0), 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Accounts Payable</h3>
              <span className="text-sm text-gray-500">{mockPayables.length} invoices | {formatCurrency(totalOutstanding)} outstanding</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <CreditCard className="h-4 w-4" />
              Batch Pay
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Outstanding
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalOutstanding)}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Clock className="h-4 w-4" />
              Due This Week
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(dueThisWeek)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            pendingWaivers > 0 ? "bg-red-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              pendingWaivers > 0 ? "text-red-600" : "text-green-600"
            )}>
              {pendingWaivers > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              Pending Waivers
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              pendingWaivers > 0 ? "text-red-700" : "text-green-700"
            )}>
              {pendingWaivers} invoice{pendingWaivers !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Available Discounts
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{formatCurrency(availableDiscounts)}</div>
            <div className="text-xs text-green-600 mt-0.5">If paid early</div>
          </div>
        </div>
      </div>

      {/* Aging Summary */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-500">Aging:</span>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">$85,400</div>
              <div className="text-xs text-gray-500">Current</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-amber-600">$52,000</div>
              <div className="text-xs text-gray-500">1-30 Days</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-orange-600">$28,400</div>
              <div className="text-xs text-gray-500">31-60 Days</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-red-600">$0</div>
              <div className="text-xs text-gray-500">60+ Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                  onClick={() => setStatusFilter(key as PayableStatus)}
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

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payables..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIds.size} selected | Total: {formatCurrency(selectedAmount)}
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-100">
                Schedule All
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Pay Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payable List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredPayables.map(payable => (
          <PayableRow
            key={payable.id}
            payable={payable}
            selected={selectedIds.has(payable.id)}
            onSelect={() => toggleSelect(payable.id)}
          />
        ))}
        {filteredPayables.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No payables match your filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Payment Optimization:</span>
          </div>
          <p className="text-sm text-amber-700">
            Pay ABC Lumber by Feb 12 to capture $480 early payment discount. 2 invoices need lien waivers before payment
            (XYZ Electric, ABC Framing). Consider deferring Coastal Plumbing payment to Feb 22 to maintain cash cushion during
            Week 3 when large subcontractor payments are due.
          </p>
        </div>
      </div>
    </div>
  )
}
