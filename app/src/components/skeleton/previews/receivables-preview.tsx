'use client'

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
  Phone,
  Mail,
  Send,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Shield,
  FileWarning,
  Percent,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+'

interface Receivable {
  id: string
  invoiceNumber: string
  clientName: string
  jobName: string
  drawNumber: number
  amount: number
  amountPaid: number
  retainageAmount: number
  retainageReleaseDate?: string
  dueDate: string
  agingBucket: AgingBucket
  daysOutstanding: number
  collectionStatus: 'none' | 'reminder_sent' | 'called' | 'escalated' | 'lien_notice'
  lastContact?: string
  paymentHistory: 'good' | 'slow' | 'poor'
  paymentMethod?: string
  lienWaiverStatus?: 'not_required' | 'pending' | 'received'
  aiNote?: string
  aiCollectionProbability?: number
}

const mockReceivables: Receivable[] = [
  {
    id: '1',
    invoiceNumber: 'DRW-2026-0145',
    clientName: 'Smith Family Trust',
    jobName: 'Smith Residence',
    drawNumber: 5,
    amount: 185000,
    amountPaid: 0,
    retainageAmount: 18500,
    retainageReleaseDate: '2026-06-15',
    dueDate: '2026-02-07',
    agingBucket: '1-30',
    daysOutstanding: 5,
    collectionStatus: 'reminder_sent',
    lastContact: '2026-02-10',
    paymentHistory: 'good',
    paymentMethod: 'ACH',
    lienWaiverStatus: 'received',
    aiCollectionProbability: 92,
    aiNote: 'Client usually pays within 7 days of reminder. Expected payment: Feb 14.',
  },
  {
    id: '2',
    invoiceNumber: 'DRW-2026-0142',
    clientName: 'Johnson Development LLC',
    jobName: 'Johnson Beach House',
    drawNumber: 3,
    amount: 45000,
    amountPaid: 0,
    retainageAmount: 4500,
    dueDate: '2026-01-12',
    agingBucket: '31-60',
    daysOutstanding: 31,
    collectionStatus: 'called',
    lastContact: '2026-02-05',
    paymentHistory: 'slow',
    lienWaiverStatus: 'pending',
    aiCollectionProbability: 68,
    aiNote: 'Client has history of 45-day payments. Consider escalation if no payment by Feb 20.',
  },
  {
    id: '3',
    invoiceNumber: 'DRW-2026-0140',
    clientName: 'Williams Contractors',
    jobName: 'Williams Remodel',
    drawNumber: 4,
    amount: 28500,
    amountPaid: 15000,
    retainageAmount: 2850,
    dueDate: '2026-02-10',
    agingBucket: 'current',
    daysOutstanding: 2,
    collectionStatus: 'none',
    paymentHistory: 'good',
    paymentMethod: 'Credit Card',
    lienWaiverStatus: 'received',
    aiCollectionProbability: 97,
  },
  {
    id: '4',
    invoiceNumber: 'DRW-2026-0138',
    clientName: 'Davis Family Trust',
    jobName: 'Davis Coastal Home',
    drawNumber: 8,
    amount: 95000,
    amountPaid: 0,
    retainageAmount: 9500,
    retainageReleaseDate: '2026-08-01',
    dueDate: '2026-02-05',
    agingBucket: '1-30',
    daysOutstanding: 7,
    collectionStatus: 'reminder_sent',
    lastContact: '2026-02-08',
    paymentHistory: 'good',
    paymentMethod: 'ACH',
    lienWaiverStatus: 'received',
    aiCollectionProbability: 88,
  },
  {
    id: '5',
    invoiceNumber: 'DRW-2026-0135',
    clientName: 'Miller Investment Group',
    jobName: 'Miller Addition',
    drawNumber: 3,
    amount: 42000,
    amountPaid: 0,
    retainageAmount: 4200,
    dueDate: '2026-01-28',
    agingBucket: '1-30',
    daysOutstanding: 15,
    collectionStatus: 'called',
    lastContact: '2026-02-06',
    paymentHistory: 'slow',
    lienWaiverStatus: 'pending',
    aiCollectionProbability: 72,
    aiNote: 'Lien waiver not yet received. Payment may be delayed until waiver is provided.',
  },
  {
    id: '6',
    invoiceNumber: 'DRW-2026-0128',
    clientName: 'Wilson Custom Homes',
    jobName: 'Wilson Custom',
    drawNumber: 4,
    amount: 60000,
    amountPaid: 0,
    retainageAmount: 6000,
    dueDate: '2026-01-05',
    agingBucket: '31-60',
    daysOutstanding: 38,
    collectionStatus: 'lien_notice',
    lastContact: '2026-02-10',
    paymentHistory: 'poor',
    aiCollectionProbability: 45,
    aiNote: 'Lien notice sent Feb 8. Historical: Client paid 3 days after notice on previous project.',
  },
  {
    id: '7',
    invoiceNumber: 'DRW-2026-0120',
    clientName: 'Thompson Builders',
    jobName: 'Thompson Renovation',
    drawNumber: 6,
    amount: 18750,
    amountPaid: 0,
    retainageAmount: 1875,
    dueDate: '2026-01-01',
    agingBucket: '31-60',
    daysOutstanding: 42,
    collectionStatus: 'called',
    lastContact: '2026-02-01',
    paymentHistory: 'slow',
    aiCollectionProbability: 55,
  },
  {
    id: '8',
    invoiceNumber: 'DRW-2026-0115',
    clientName: 'Parker Developments',
    jobName: 'Parker Commercial',
    drawNumber: 2,
    amount: 15000,
    amountPaid: 0,
    retainageAmount: 1500,
    dueDate: '2025-12-15',
    agingBucket: '61-90',
    daysOutstanding: 59,
    collectionStatus: 'escalated',
    lastContact: '2026-02-05',
    paymentHistory: 'poor',
    aiCollectionProbability: 30,
    aiNote: 'High risk. Consider filing mechanics lien within 30 days. Lien deadline: Mar 15.',
  },
]

const agingConfig: Record<AgingBucket, { label: string; color: string; bgColor: string }> = {
  'current': { label: 'Current', color: 'text-green-700', bgColor: 'bg-green-100' },
  '1-30': { label: '1-30 Days', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  '31-60': { label: '31-60 Days', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  '61-90': { label: '61-90 Days', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  '90+': { label: '90+ Days', color: 'text-red-700', bgColor: 'bg-red-100' },
}

const collectionStatusConfig: Record<string, { label: string; icon: typeof CheckCircle }> = {
  'none': { label: 'No action', icon: Clock },
  'reminder_sent': { label: 'Reminder sent', icon: Mail },
  'called': { label: 'Called', icon: Phone },
  'escalated': { label: 'Escalated', icon: AlertTriangle },
  'lien_notice': { label: 'Lien notice sent', icon: FileWarning },
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

function PaymentHistoryBadge({ history }: { history: Receivable['paymentHistory'] }) {
  switch (history) {
    case 'good':
      return <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Good payer</span>
    case 'slow':
      return <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Slow payer</span>
    case 'poor':
      return <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Problem payer</span>
  }
}

function LienWaiverBadge({ status }: { status?: Receivable['lienWaiverStatus'] }) {
  if (!status || status === 'not_required') return null
  return (
    <span className={cn(
      "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
      status === 'received' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
    )}>
      <Shield className="h-3 w-3" />
      {status === 'received' ? 'Waiver received' : 'Waiver pending'}
    </span>
  )
}

function CollectionProbabilityBadge({ probability }: { probability?: number }) {
  if (probability === undefined) return null
  return (
    <span className={cn(
      "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
      probability >= 80 ? "bg-green-50 text-green-700" :
      probability >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
    )}>
      <Percent className="h-3 w-3" />
      {probability}% likely
    </span>
  )
}

function ReceivableRow({ receivable }: { receivable: Receivable }) {
  const aging = agingConfig[receivable.agingBucket]
  const collectionStatus = collectionStatusConfig[receivable.collectionStatus]
  const StatusIcon = collectionStatus.icon
  const balance = receivable.amount - receivable.amountPaid
  const isHighRisk = receivable.paymentHistory === 'poor' || receivable.collectionStatus === 'escalated' || receivable.collectionStatus === 'lien_notice'

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow",
      receivable.agingBucket === '61-90' || receivable.agingBucket === '90+' ? "border-red-200" :
      receivable.agingBucket === '31-60' ? "border-amber-200" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-gray-900">{receivable.invoiceNumber}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", aging.bgColor, aging.color)}>
              {receivable.agingBucket === 'current' ? 'Current' : `${receivable.daysOutstanding} days overdue`}
            </span>
            <PaymentHistoryBadge history={receivable.paymentHistory} />
            <LienWaiverBadge status={receivable.lienWaiverStatus} />
            <CollectionProbabilityBadge probability={receivable.aiCollectionProbability} />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{receivable.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span>{receivable.jobName} - Draw #{receivable.drawNumber}</span>
            </div>
          </div>

          {/* Partial payment progress */}
          {receivable.amountPaid > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  Partial payment: {formatCurrency(receivable.amountPaid)} of {formatCurrency(receivable.amount)}
                </span>
                <span>{((receivable.amountPaid / receivable.amount) * 100).toFixed(0)}% paid</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(receivable.amountPaid / receivable.amount) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1 text-gray-500">
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{collectionStatus.label}</span>
            </div>
            {receivable.lastContact && (
              <span className="text-xs text-gray-400">
                Last contact: {formatDate(receivable.lastContact)}
              </span>
            )}
            {receivable.paymentMethod && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                Preferred: {receivable.paymentMethod}
              </span>
            )}
          </div>

          {/* Retainage info */}
          {receivable.retainageAmount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <DollarSign className="h-3 w-3" />
              <span>Retainage held: {formatCurrency(receivable.retainageAmount)}</span>
              {receivable.retainageReleaseDate && (
                <span className="text-purple-400">| Release: {formatDate(receivable.retainageReleaseDate)}</span>
              )}
            </div>
          )}

          {receivable.aiNote && (
            <div className={cn(
              "mt-3 p-2 rounded-md flex items-start gap-2 text-sm",
              isHighRisk ? "bg-red-50" : "bg-blue-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                isHighRisk ? "text-red-500" : "text-blue-500"
              )} />
              <span className={isHighRisk ? "text-red-700" : "text-blue-700"}>
                {receivable.aiNote}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(balance)}</div>
            {receivable.amountPaid > 0 && (
              <div className="text-xs text-gray-400">of {formatCurrency(receivable.amount)}</div>
            )}
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Due {formatDate(receivable.dueDate)}</span>
            </div>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
        {receivable.collectionStatus === 'none' && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">
            <Send className="h-3.5 w-3.5" />
            Send Reminder
          </button>
        )}
        {receivable.collectionStatus === 'reminder_sent' && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50">
            <Send className="h-3.5 w-3.5" />
            Send 2nd Reminder
          </button>
        )}
        {(receivable.collectionStatus === 'called' || receivable.collectionStatus === 'reminder_sent') && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Phone className="h-3.5 w-3.5" />
            Log Call
          </button>
        )}
        {receivable.collectionStatus !== 'escalated' && receivable.collectionStatus !== 'lien_notice' && receivable.daysOutstanding > 30 && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50">
            <AlertTriangle className="h-3.5 w-3.5" />
            Escalate
          </button>
        )}
        {receivable.collectionStatus === 'escalated' && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 border border-red-200 rounded-lg hover:bg-red-50">
            <FileWarning className="h-3.5 w-3.5" />
            Send Lien Notice
          </button>
        )}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          <ExternalLink className="h-3.5 w-3.5" />
          Payment Link
        </button>
      </div>
    </div>
  )
}

export function ReceivablesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const filteredReceivables = sortItems(
    mockReceivables.filter(r => {
      if (!matchesSearch(r, search, ['invoiceNumber', 'clientName', 'jobName'])) return false
      if (activeTab !== 'all' && r.agingBucket !== activeTab) return false
      return true
    }),
    activeSort as keyof Receivable | '',
    sortDirection,
  )

  // Calculate aging buckets
  const agingSummary = {
    current: mockReceivables.filter(r => r.agingBucket === 'current').reduce((sum, r) => sum + r.amount, 0),
    '1-30': mockReceivables.filter(r => r.agingBucket === '1-30').reduce((sum, r) => sum + r.amount, 0),
    '31-60': mockReceivables.filter(r => r.agingBucket === '31-60').reduce((sum, r) => sum + r.amount, 0),
    '61-90': mockReceivables.filter(r => r.agingBucket === '61-90').reduce((sum, r) => sum + r.amount, 0),
    '90+': mockReceivables.filter(r => r.agingBucket === '90+').reduce((sum, r) => sum + r.amount, 0),
  }

  const totalAR = Object.values(agingSummary).reduce((sum, v) => sum + v, 0)
  const totalOverdue = agingSummary['1-30'] + agingSummary['31-60'] + agingSummary['61-90'] + agingSummary['90+']
  const actionNeeded = mockReceivables.filter(r => r.daysOutstanding > 7).length
  const dso = 28 // Days Sales Outstanding
  const totalRetainage = mockReceivables.reduce((sum, r) => sum + r.retainageAmount, 0)
  const pendingLienWaivers = mockReceivables.filter(r => r.lienWaiverStatus === 'pending').length
  const avgCollectionProbability = Math.round(
    mockReceivables.filter(r => r.aiCollectionProbability !== undefined).reduce((sum, r) => sum + (r.aiCollectionProbability ?? 0), 0) /
    mockReceivables.filter(r => r.aiCollectionProbability !== undefined).length
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Accounts Receivable</h3>
              <span className="text-sm text-gray-500">{mockReceivables.length} outstanding | {formatCurrency(totalAR)} total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Outstanding
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalAR)}</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            totalOverdue > 0 ? "bg-amber-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              totalOverdue > 0 ? "text-amber-600" : "text-green-600"
            )}>
              <Clock className="h-4 w-4" />
              Overdue Amount
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              totalOverdue > 0 ? "text-amber-700" : "text-green-700"
            )}>
              {formatCurrency(totalOverdue)}
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            actionNeeded > 3 ? "bg-red-50" : actionNeeded > 0 ? "bg-amber-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              actionNeeded > 3 ? "text-red-600" : actionNeeded > 0 ? "text-amber-600" : "text-green-600"
            )}>
              <AlertTriangle className="h-4 w-4" />
              Action Needed
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              actionNeeded > 3 ? "text-red-700" : actionNeeded > 0 ? "text-amber-700" : "text-green-700"
            )}>
              {actionNeeded} items
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className={cn(
            "rounded-lg p-3",
            dso <= 30 ? "bg-green-50" : dso <= 45 ? "bg-amber-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              dso <= 30 ? "text-green-600" : dso <= 45 ? "text-amber-600" : "text-red-600"
            )}>
              {dso <= 35 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              DSO (Days Sales Outstanding)
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              dso <= 30 ? "text-green-700" : dso <= 45 ? "text-amber-700" : "text-red-700"
            )}>
              {dso} days
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Industry avg: 35 days</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Retainage Held
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{formatCurrency(totalRetainage)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Across {mockReceivables.filter(r => r.retainageAmount > 0).length} draws</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            pendingLienWaivers > 0 ? "bg-amber-50" : "bg-green-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              pendingLienWaivers > 0 ? "text-amber-600" : "text-green-600"
            )}>
              <Shield className="h-4 w-4" />
              Lien Waivers
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              pendingLienWaivers > 0 ? "text-amber-700" : "text-green-700"
            )}>
              {pendingLienWaivers > 0 ? `${pendingLienWaivers} pending` : 'All received'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Avg collection: {avgCollectionProbability}% probability</div>
          </div>
        </div>
      </div>

      {/* Aging Summary Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">Aging Summary:</span>
        </div>
        <div className="flex items-center gap-1">
          {Object.entries(agingSummary).map(([bucket, amount]) => {
            const config = agingConfig[bucket as AgingBucket]
            const percentage = totalAR > 0 ? (amount / totalAR) * 100 : 0
            if (amount === 0) return null
            return (
              <div
                key={bucket}
                className={cn("h-6 flex items-center justify-center text-xs font-medium rounded", config.bgColor, config.color)}
                style={{ width: `${Math.max(percentage, 8)}%` }}
                title={`${config.label}: ${formatCurrency(amount)}`}
              >
                {percentage > 10 && formatCurrency(amount)}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Current: {formatCurrency(agingSummary.current)} ({((agingSummary.current / totalAR) * 100).toFixed(0)}%)</span>
          <span>1-30: {formatCurrency(agingSummary['1-30'])}</span>
          <span>31-60: {formatCurrency(agingSummary['31-60'])}</span>
          <span>61-90: {formatCurrency(agingSummary['61-90'])}</span>
          <span>90+: {formatCurrency(agingSummary['90+'])}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search receivables..."
          tabs={[
            { key: 'all', label: 'All', count: mockReceivables.length },
            { key: 'current', label: 'Current', count: mockReceivables.filter(r => r.agingBucket === 'current').length },
            { key: '1-30', label: '1-30 Days', count: mockReceivables.filter(r => r.agingBucket === '1-30').length },
            { key: '31-60', label: '31-60 Days', count: mockReceivables.filter(r => r.agingBucket === '31-60').length },
            { key: '61-90', label: '61-90 Days', count: mockReceivables.filter(r => r.agingBucket === '61-90').length },
            { key: '90+', label: '90+ Days', count: mockReceivables.filter(r => r.agingBucket === '90+').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'clientName', label: 'Client' },
            { value: 'amount', label: 'Amount' },
            { value: 'daysOutstanding', label: 'Days Outstanding' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'retainageAmount', label: 'Retainage' },
            { value: 'aiCollectionProbability', label: 'Collection Probability' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredReceivables.length}
          totalCount={mockReceivables.length}
        />
      </div>

      {/* Receivable List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredReceivables.map(receivable => (
          <ReceivableRow key={receivable.id} receivable={receivable} />
        ))}
        {filteredReceivables.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No receivables match your filters
          </div>
        )}
      </div>

      {/* Retainage Summary */}
      <div className="bg-purple-50 border-t border-purple-200 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-800">Retainage Summary:</span>
            <span className="text-purple-700">{formatCurrency(totalRetainage)} held across all active draws</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-purple-600">
            {mockReceivables.filter(r => r.retainageReleaseDate).map(r => (
              <span key={r.id}>{r.jobName}: {formatCurrency(r.retainageAmount)} release {formatDate(r.retainageReleaseDate!)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Collection Priority:</span>
          </div>
          <p className="text-sm text-amber-700">
            Focus on Smith Family Trust ($185K, 92% likely, 5 days over) - historically pays quickly after reminder.
            Wilson Custom ($60K, 45% likely) has lien notice sent - expect payment within 3-5 days based on history.
            Parker Developments ($15K, 30% likely) is high risk - recommend filing mechanics lien by Mar 15.
            {pendingLienWaivers > 0 && ` ${pendingLienWaivers} lien waivers pending - may delay collections.`}
            {' '}Collection rate this month: 94% (above 90% target). DSO trending down from 32 to {dso} days.
          </p>
        </div>
      </div>
    </div>
  )
}
