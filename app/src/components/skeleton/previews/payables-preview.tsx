'use client'

import { useState } from 'react'
import {
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Building2,
  Briefcase,
  Sparkles,
  MoreHorizontal,
  CreditCard,
  FileCheck,
  Send,
  Upload,
  Mail,
  Smartphone,
  ShieldAlert,
  Copy,
  ArrowRightLeft,
  FileText,
  TrendingDown,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type PayableStatus = 'pending' | 'approved' | 'scheduled' | 'paid' | 'disputed'

type UploadSource = 'web' | 'mobile' | 'email' | 'api'

type InvoiceType = 'standard' | 'credit_memo' | 'debit_memo'

interface AnomalyAlert {
  type: 'amount' | 'duplicate' | 'frequency' | 'new_code'
  severity: 'low' | 'medium' | 'high'
  message: string
}

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
  lienWaiverStatus: 'received' | 'pending' | 'not_required' | 'verified'
  retainage?: number
  aiNote?: string
  aiConfidence?: number
  uploadSource: UploadSource
  invoiceType: InvoiceType
  poNumber?: string
  costCodes?: string[]
  anomaly?: AnomalyAlert
  duplicateWarning?: boolean
  qboSyncStatus?: 'synced' | 'pending' | 'error' | 'not_synced'
  invoiceDate: string
  drawNumber?: number
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
    aiConfidence: 0.97,
    uploadSource: 'email',
    invoiceType: 'standard',
    poNumber: 'PO-2024-0145',
    costCodes: ['06-100', '06-200'],
    qboSyncStatus: 'synced',
    invoiceDate: '2026-01-15',
    drawNumber: 4,
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
    aiConfidence: 0.92,
    uploadSource: 'web',
    invoiceType: 'standard',
    poNumber: 'PO-2024-0132',
    costCodes: ['16-100'],
    qboSyncStatus: 'synced',
    invoiceDate: '2026-01-17',
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
    aiConfidence: 0.95,
    uploadSource: 'email',
    invoiceType: 'standard',
    costCodes: ['15-100', '15-200'],
    qboSyncStatus: 'pending',
    invoiceDate: '2026-02-04',
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
    aiConfidence: 0.88,
    uploadSource: 'mobile',
    invoiceType: 'standard',
    costCodes: ['15-100'],
    qboSyncStatus: 'not_synced',
    invoiceDate: '2026-01-20',
    anomaly: {
      type: 'amount',
      severity: 'medium',
      message: 'Amount 42% higher than average for this vendor/scope.',
    },
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
    lienWaiverStatus: 'verified',
    retainage: 3450,
    aiConfidence: 0.99,
    uploadSource: 'api',
    invoiceType: 'standard',
    poNumber: 'PO-2024-0118',
    costCodes: ['08-500'],
    qboSyncStatus: 'synced',
    invoiceDate: '2026-01-07',
    drawNumber: 3,
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
    aiConfidence: 0.94,
    uploadSource: 'web',
    invoiceType: 'standard',
    poNumber: 'PO-2024-0155',
    costCodes: ['06-100'],
    qboSyncStatus: 'not_synced',
    invoiceDate: '2026-01-25',
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
    aiConfidence: 0.91,
    uploadSource: 'email',
    invoiceType: 'standard',
    poNumber: 'PO-2024-0098',
    costCodes: ['06-400'],
    qboSyncStatus: 'synced',
    invoiceDate: '2025-12-28',
    drawNumber: 5,
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
    lienWaiverStatus: 'verified',
    aiConfidence: 0.96,
    uploadSource: 'web',
    invoiceType: 'standard',
    costCodes: ['16-200'],
    qboSyncStatus: 'synced',
    invoiceDate: '2026-01-10',
  },
  {
    id: '9',
    invoiceNumber: 'CM-2024-0015',
    vendorName: 'ABC Lumber Supply',
    jobName: 'Smith Residence',
    amount: -1200,
    amountPaid: 0,
    dueDate: '2026-02-15',
    status: 'approved',
    paymentTerms: 'Net 30',
    lienWaiverStatus: 'not_required',
    aiConfidence: 0.85,
    uploadSource: 'email',
    invoiceType: 'credit_memo',
    costCodes: ['06-100'],
    qboSyncStatus: 'pending',
    invoiceDate: '2026-01-20',
    aiNote: 'Credit memo detected for returned materials. Auto-matched to original INV-2024-0810.',
  },
  {
    id: '10',
    invoiceNumber: 'INV-2024-0845',
    vendorName: 'Coastal Plumbing',
    jobName: 'Johnson Beach House',
    amount: 9800,
    amountPaid: 0,
    dueDate: '2026-02-05',
    status: 'disputed',
    paymentTerms: 'Net 30',
    lienWaiverStatus: 'not_required',
    aiConfidence: 0.72,
    uploadSource: 'email',
    invoiceType: 'standard',
    costCodes: ['15-100'],
    qboSyncStatus: 'not_synced',
    invoiceDate: '2026-01-05',
    duplicateWarning: true,
    anomaly: {
      type: 'duplicate',
      severity: 'high',
      message: 'Possible duplicate of INV-2024-0840 (same vendor, similar amount, 2 days apart).',
    },
  },
]

const statusConfig: Record<PayableStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending Approval', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  approved: { label: 'Approved', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  scheduled: { label: 'Scheduled', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Calendar },
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100', icon: Ban },
}

const sourceIcons: Record<UploadSource, typeof Upload> = {
  web: Upload,
  mobile: Smartphone,
  email: Mail,
  api: ArrowRightLeft,
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absValue >= 1000000) return sign + '$' + (absValue / 1000000).toFixed(2) + 'M'
  if (absValue >= 1000) return sign + '$' + (absValue / 1000).toFixed(1) + 'K'
  return sign + '$' + absValue.toFixed(2)
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

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = score >= 0.95 ? 'text-green-600 bg-green-50' :
    score >= 0.80 ? 'text-blue-600 bg-blue-50' :
    score >= 0.70 ? 'text-amber-600 bg-amber-50' :
    'text-red-600 bg-red-50'
  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1', color)}>
      <Sparkles className="h-3 w-3" />
      {pct}%
    </span>
  )
}

function LienWaiverBadge({ status }: { status: Payable['lienWaiverStatus'] }) {
  switch (status) {
    case 'verified':
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <FileCheck className="h-3 w-3" />
          Waiver verified
        </span>
      )
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

function QboSyncBadge({ status }: { status: Payable['qboSyncStatus'] }) {
  if (!status || status === 'not_synced') return null
  const config = {
    synced: { label: 'QBO', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    pending: { label: 'QBO Pending', color: 'text-amber-600 bg-amber-50', icon: Clock },
    error: { label: 'QBO Error', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
    not_synced: { label: '', color: '', icon: Clock },
  }
  const cfg = config[status]
  const Icon = cfg.icon
  return (
    <span className={cn('text-xs px-1.5 py-0.5 rounded flex items-center gap-1', cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function PayableRow({ payable, selected, onSelect }: { payable: Payable; selected: boolean; onSelect: () => void }) {
  const status = statusConfig[payable.status]
  const StatusIcon = status.icon
  const dueInfo = getDaysUntilDue(payable.dueDate)
  const balance = payable.amount - payable.amountPaid
  const SourceIcon = sourceIcons[payable.uploadSource]

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow",
      selected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200",
      payable.anomaly?.severity === 'high' && "border-l-4 border-l-red-500",
      payable.duplicateWarning && "border-l-4 border-l-orange-500"
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
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-sm font-medium text-gray-900">{payable.invoiceNumber}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1", status.bgColor, status.color)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
              {payable.invoiceType === 'credit_memo' && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                  Credit Memo
                </span>
              )}
              {payable.earlyPayDiscount && payable.status !== 'paid' && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {payable.earlyPayDiscount.percent}% discount available
                </span>
              )}
              {payable.aiConfidence !== undefined && (
                <ConfidenceBadge score={payable.aiConfidence} />
              )}
              {payable.duplicateWarning && (
                <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-medium flex items-center gap-1">
                  <Copy className="h-3 w-3" />
                  Possible Duplicate
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

            <div className="mt-2 flex items-center gap-3 text-sm flex-wrap">
              <span className="text-gray-500">{payable.paymentTerms}</span>
              <LienWaiverBadge status={payable.lienWaiverStatus} />
              {payable.retainage && payable.retainage > 0 && (
                <span className="text-xs text-gray-500">
                  Retainage: {formatCurrency(payable.retainage)}
                </span>
              )}
              {payable.poNumber && (
                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  {payable.poNumber}
                </span>
              )}
              {payable.drawNumber && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                  Draw #{payable.drawNumber}
                </span>
              )}
              {payable.costCodes && payable.costCodes.length > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {payable.costCodes.join(', ')}
                </span>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1" title={`Uploaded via ${payable.uploadSource}`}>
                <SourceIcon className="h-3 w-3" />
              </span>
              <QboSyncBadge status={payable.qboSyncStatus} />
            </div>

            {payable.anomaly && (
              <div className={cn(
                "mt-2 p-2 rounded-md flex items-start gap-2 text-sm",
                payable.anomaly.severity === 'high' ? "bg-red-50" :
                payable.anomaly.severity === 'medium' ? "bg-amber-50" :
                "bg-yellow-50"
              )}>
                <ShieldAlert className={cn(
                  "h-4 w-4 mt-0.5 flex-shrink-0",
                  payable.anomaly.severity === 'high' ? "text-red-500" :
                  payable.anomaly.severity === 'medium' ? "text-amber-500" :
                  "text-yellow-500"
                )} />
                <span className={
                  payable.anomaly.severity === 'high' ? "text-red-700" :
                  payable.anomaly.severity === 'medium' ? "text-amber-700" :
                  "text-yellow-700"
                }>
                  {payable.anomaly.message}
                </span>
                <button className="ml-auto text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap">
                  Dismiss
                </button>
              </div>
            )}

            {payable.aiNote && !payable.anomaly && (
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
            <div className={cn(
              "text-lg font-semibold",
              payable.amount < 0 ? "text-purple-700" : "text-gray-900"
            )}>
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
            <div className="text-xs text-gray-400 mt-0.5">
              Inv: {formatDate(payable.invoiceDate)}
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {payable.status !== 'paid' && payable.status !== 'disputed' && (
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
          {payable.qboSyncStatus === 'not_synced' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Sync to QBO
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function PayablesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [jobFilter, setJobFilter] = useState<string>('all')

  const jobs = [...new Set(mockPayables.map(p => p.jobName))]

  const filteredPayables = sortItems(
    mockPayables.filter(p => {
      if (!matchesSearch(p, search, ['invoiceNumber', 'vendorName', 'jobName', 'poNumber'])) return false
      if (activeTab !== 'all' && p.status !== activeTab) return false
      if (jobFilter !== 'all' && p.jobName !== jobFilter) return false
      return true
    }),
    activeSort as keyof Payable | '',
    sortDirection,
  )

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

  const overdueAmount = mockPayables
    .filter(p => {
      if (p.status === 'paid') return false
      const dueInfo = getDaysUntilDue(p.dueDate)
      return dueInfo.isOverdue
    })
    .reduce((sum, p) => sum + (p.amount - p.amountPaid), 0)

  const overdueCount = mockPayables.filter(p => {
    if (p.status === 'paid') return false
    return getDaysUntilDue(p.dueDate).isOverdue
  }).length

  const pendingWaivers = mockPayables.filter(p => p.lienWaiverStatus === 'pending' && p.status !== 'paid').length

  const availableDiscounts = mockPayables
    .filter(p => p.earlyPayDiscount && p.status !== 'paid')
    .reduce((sum, p) => sum + (p.earlyPayDiscount?.savings || 0), 0)

  const totalRetainage = mockPayables
    .filter(p => p.retainage && p.status !== 'paid')
    .reduce((sum, p) => sum + (p.retainage || 0), 0)

  const anomalyCount = mockPayables.filter(p => p.anomaly).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Accounts Payable</h3>
              <span className="text-sm text-gray-500">{mockPayables.length} invoices | {formatCurrency(totalOutstanding)} outstanding</span>
              {anomalyCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  {anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ArrowRightLeft className="h-4 w-4" />
              Export to QBO
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
        <div className="grid grid-cols-6 gap-3">
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
            overdueCount > 0 ? "bg-red-50" : "bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              overdueCount > 0 ? "text-red-600" : "text-gray-600"
            )}>
              <TrendingDown className="h-4 w-4" />
              Overdue
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              overdueCount > 0 ? "text-red-700" : "text-gray-500"
            )}>
              {overdueCount > 0 ? formatCurrency(overdueAmount) : '$0'}
            </div>
            {overdueCount > 0 && <div className="text-xs text-red-600">{overdueCount} invoice{overdueCount !== 1 ? 's' : ''}</div>}
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
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Retainage Held
            </div>
            <div className="text-xl font-bold text-gray-700 mt-1">{formatCurrency(totalRetainage)}</div>
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
              <div className="text-sm font-medium text-red-600">$9,800</div>
              <div className="text-xs text-gray-500">60+ Days</div>
            </div>
          </div>
          <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            DSO: 28 days (industry avg: 34)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoices, vendors, POs..."
          tabs={[
            { key: 'all', label: 'All', count: mockPayables.length },
            { key: 'pending', label: 'Pending', count: mockPayables.filter(p => p.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: mockPayables.filter(p => p.status === 'approved').length },
            { key: 'scheduled', label: 'Scheduled', count: mockPayables.filter(p => p.status === 'scheduled').length },
            { key: 'disputed', label: 'Disputed', count: mockPayables.filter(p => p.status === 'disputed').length },
            { key: 'paid', label: 'Paid', count: mockPayables.filter(p => p.status === 'paid').length },
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
          ]}
          sortOptions={[
            { value: 'vendorName', label: 'Vendor' },
            { value: 'amount', label: 'Amount' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'invoiceNumber', label: 'Invoice #' },
            { value: 'status', label: 'Status' },
            { value: 'jobName', label: 'Job' },
            { value: 'aiConfidence', label: 'AI Confidence' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredPayables.length}
          totalCount={mockPayables.length}
        />
      </div>

      {/* Selected Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIds.size} selected | Total: {formatCurrency(selectedAmount)}
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-white">
                Export Selected
              </button>
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
            (XYZ Electric, ABC Framing). 1 possible duplicate flagged for review (Coastal Plumbing INV-0845).
            Consider deferring Coastal Plumbing payment to Feb 22 to maintain cash cushion during Week 3.
            AI extraction accuracy this month: 94.2% (up 2.1% from last month).
          </p>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            title: 'Payment Prioritization',
            description: 'AI ranks payments by vendor importance and discount opportunity',
          },
          {
            title: 'Cash Flow Impact',
            description: 'Shows effect of payment on cash position',
          },
          {
            title: 'Discount Capture',
            description: 'Highlights available early payment discounts',
          },
          {
            title: 'Batch Optimization',
            description: 'Groups payments for efficient processing',
          },
          {
            title: 'Vendor Relationship',
            description: 'Tracks payment history and vendor health',
          },
        ]}
      />
    </div>
  )
}
