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
  XCircle,
  Link,
  Eye,
  MousePointer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { SubmissionForm, ViewModeToggle, AIFeaturesPanel, type ViewMode } from '@/components/skeleton/ui'

type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+'
type LocalViewMode = 'list' | 'grid' | 'table'

interface PaymentLinkTracking {
  sentAt?: string
  viewedAt?: string
  clickedAt?: string
  paidAt?: string
}

interface WriteOffRecord {
  id: string
  amount: number
  reason: string
  approvedBy?: string
  approvalRequired: boolean
  date: string
}

interface EmailFollowUp {
  id: string
  subject: string
  recipient: string
  date: string
}

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
  lienDeadline?: string
  aiNote?: string
  aiCollectionProbability?: number
  paymentLinkTracking?: PaymentLinkTracking
  writeOffHistory?: WriteOffRecord[]
  emailFollowUps?: EmailFollowUp[]
}

interface PaidReceivable {
  amount: number
  daysToCollect: number
}

const mockPaidReceivables: PaidReceivable[] = [
  { amount: 45000, daysToCollect: 22 },
  { amount: 85000, daysToCollect: 18 },
  { amount: 32000, daysToCollect: 35 },
  { amount: 67000, daysToCollect: 28 },
  { amount: 125000, daysToCollect: 31 },
  { amount: 28000, daysToCollect: 25 },
  { amount: 95000, daysToCollect: 30 },
  { amount: 42000, daysToCollect: 27 },
]

const lastMonthDSO = 31

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
    paymentLinkTracking: {
      sentAt: '2026-02-10',
      viewedAt: '2026-02-11',
    },
    emailFollowUps: [
      { id: 'e1', subject: 'Payment Reminder - Draw #5', recipient: 'billing@smithfamily.com', date: '2026-02-10' },
    ],
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
    paymentLinkTracking: {
      sentAt: '2026-02-01',
      viewedAt: '2026-02-02',
      clickedAt: '2026-02-02',
    },
    emailFollowUps: [
      { id: 'e2', subject: 'Overdue Notice - Draw #3', recipient: 'ap@johnsondev.com', date: '2026-02-01' },
      { id: 'e3', subject: 'Second Notice - Immediate Attention Required', recipient: 'ap@johnsondev.com', date: '2026-02-08' },
    ],
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
    paymentLinkTracking: {
      sentAt: '2026-02-10',
      viewedAt: '2026-02-12',
      clickedAt: '2026-02-12',
      paidAt: '2026-02-12',
    },
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
    paymentLinkTracking: {
      sentAt: '2026-02-08',
    },
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
    emailFollowUps: [
      { id: 'e4', subject: 'Lien Waiver Request', recipient: 'accounting@millerinvest.com', date: '2026-02-06' },
    ],
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
    lienDeadline: '2026-03-25',
    emailFollowUps: [
      { id: 'e5', subject: 'Final Notice Before Lien Filing', recipient: 'wilson@wilsoncustom.com', date: '2026-02-08' },
    ],
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
    lienDeadline: '2026-03-15',
    writeOffHistory: [
      { id: 'w1', amount: 2500, reason: 'Disputed work quality - partial settlement', approvedBy: 'John Manager', approvalRequired: true, date: '2026-01-20' },
    ],
    emailFollowUps: [
      { id: 'e6', subject: 'Urgent: Account Escalation Notice', recipient: 'legal@parkerdev.com', date: '2026-02-05' },
    ],
  },
]

const agingConfig: Record<AgingBucket, { label: string; color: string; bgColor: string }> = {
  'current': { label: 'Current', color: 'text-green-700', bgColor: 'bg-green-100' },
  '1-30': { label: '1-30 Days', color: 'text-stone-700', bgColor: 'bg-stone-100' },
  '31-60': { label: '31-60 Days', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  '61-90': { label: '61-90 Days', color: 'text-sand-700', bgColor: 'bg-sand-100' },
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

function calculateDSO(paidReceivables: PaidReceivable[]): number {
  if (paidReceivables.length === 0) return 0
  const totalWeightedDays = paidReceivables.reduce((sum, r) => sum + (r.amount * r.daysToCollect), 0)
  const totalAmount = paidReceivables.reduce((sum, r) => sum + r.amount, 0)
  return Math.round(totalWeightedDays / totalAmount)
}

function getDaysUntilDeadline(deadlineDate: string): number {
  const deadline = new Date(deadlineDate)
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

function PaymentLinkStatus({ tracking }: { tracking?: PaymentLinkTracking }) {
  if (!tracking || !tracking.sentAt) return null

  if (tracking.paidAt) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        <Link className="h-3 w-3" />
        <span>Link sent {formatDate(tracking.sentAt)}, Paid {formatDate(tracking.paidAt)} ✓</span>
      </div>
    )
  }

  const parts: string[] = [`Link sent ${formatDate(tracking.sentAt)}`]
  if (tracking.viewedAt) {
    parts.push(`Viewed ${formatDate(tracking.viewedAt)}`)
  }
  if (tracking.clickedAt) {
    parts.push(`Clicked ${formatDate(tracking.clickedAt)}`)
  } else if (tracking.viewedAt) {
    parts.push('Not clicked')
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-2 py-1 rounded">
      <Link className="h-3 w-3" />
      {tracking.viewedAt && <Eye className="h-3 w-3" />}
      {tracking.clickedAt && <MousePointer className="h-3 w-3" />}
      <span>{parts.join(', ')}</span>
    </div>
  )
}

function LienDeadlineAlert({ deadline, collectionStatus }: { deadline?: string; collectionStatus: string }) {
  if (!deadline || (collectionStatus !== 'escalated' && collectionStatus !== 'lien_notice')) return null

  const daysUntil = getDaysUntilDeadline(deadline)
  const isUrgent = daysUntil < 30
  const isWarning = daysUntil < 60

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs px-2 py-1 rounded",
      isUrgent ? "bg-red-50 text-red-700" : isWarning ? "bg-amber-50 text-amber-700" : "bg-warm-50 text-warm-700"
    )}>
      <AlertTriangle className="h-3 w-3" />
      <span>Lien deadline: {formatDate(deadline)} ({daysUntil} days)</span>
    </div>
  )
}

function WriteOffHistory({ history }: { history?: WriteOffRecord[] }) {
  if (!history || history.length === 0) return null

  return (
    <div className="mt-2 p-2 bg-warm-50 rounded border border-warm-200">
      <div className="text-xs font-medium text-warm-700 mb-1">Write-off History</div>
      {history.map(record => (
        <div key={record.id} className="text-xs text-warm-600 flex items-center gap-2">
          <XCircle className="h-3 w-3 text-warm-400" />
          <span>{formatDate(record.date)}: {formatCurrency(record.amount)} - {record.reason}</span>
          {record.approvedBy && <span className="text-warm-400">| Approved by: {record.approvedBy}</span>}
        </div>
      ))}
    </div>
  )
}

function EmailFollowUpHistory({ emails }: { emails?: EmailFollowUp[] }) {
  if (!emails || emails.length === 0) return null

  return (
    <div className="mt-2 p-2 bg-stone-50 rounded border border-stone-100">
      <div className="text-xs font-medium text-stone-700 mb-1">Email Follow-up History</div>
      {emails.map(email => (
        <div key={email.id} className="text-xs text-stone-600 flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span>{formatDate(email.date)}: "{email.subject}" to {email.recipient}</span>
        </div>
      ))}
    </div>
  )
}

interface WriteOffModalProps {
  isOpen: boolean
  onClose: () => void
  receivable: Receivable
}

function WriteOffModal({ isOpen, onClose, receivable }: WriteOffModalProps) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [approvalRequired, setApprovalRequired] = useState(true)

  if (!isOpen) return null

  const balance = receivable.amount - receivable.amountPaid

  return (
    <div className="fixed inset-0 bg-warm-1000 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-warm-900 mb-4">Write Off Receivable</h3>
        <p className="text-sm text-warm-600 mb-4">
          Invoice: {receivable.invoiceNumber} | Balance: {formatCurrency(balance)}
        </p>
        <SubmissionForm
          isOpen={true}
          onClose={onClose}
          title="Write-off Details"
          fields={[
            {
              id: 'amount',
              label: 'Write-off Amount',
              type: 'text',
              placeholder: 'Enter amount to write off',
            },
            {
              id: 'reason',
              label: 'Reason for Write-off',
              type: 'textarea',
              placeholder: 'Enter reason for write-off (e.g., uncollectable, disputed work, bankruptcy)',
            },
            {
              id: 'approvalRequired',
              label: 'Requires Management Approval',
              type: 'text',
              placeholder: 'Yes or No',
            },
          ]}
          onSubmit={() => {
            console.log('Write-off submitted:', { amount, reason, approvalRequired })
            onClose()
          }}
          submitLabel="Submit Write-off"
        />
        {receivable.writeOffHistory && receivable.writeOffHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-warm-200">
            <WriteOffHistory history={receivable.writeOffHistory} />
          </div>
        )}
      </div>
    </div>
  )
}

interface EmailLogModalProps {
  isOpen: boolean
  onClose: () => void
  receivable: Receivable
}

function EmailLogModal({ isOpen, onClose, receivable }: EmailLogModalProps) {
  const [subject, setSubject] = useState('')
  const [recipient, setRecipient] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-warm-1000 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-warm-900 mb-4">Log Email Follow-up</h3>
        <p className="text-sm text-warm-600 mb-4">
          Invoice: {receivable.invoiceNumber} | Client: {receivable.clientName}
        </p>
        <SubmissionForm
          isOpen={true}
          onClose={onClose}
          title="Log Email Follow-up"
          fields={[
            {
              id: 'subject',
              label: 'Email Subject',
              type: 'text',
              placeholder: 'Enter email subject',
            },
            {
              id: 'recipient',
              label: 'Recipient Email',
              type: 'text',
              placeholder: 'recipient@example.com',
            },
            {
              id: 'date',
              label: 'Date Sent',
              type: 'date',
            },
          ]}
          onSubmit={() => {
            console.log('Email logged:', { subject, recipient, date })
            onClose()
          }}
          submitLabel="Log Email"
        />
        {receivable.emailFollowUps && receivable.emailFollowUps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-warm-200">
            <EmailFollowUpHistory emails={receivable.emailFollowUps} />
          </div>
        )}
      </div>
    </div>
  )
}

function ReceivableRow({ receivable, onWriteOff, onLogEmail }: {
  receivable: Receivable
  onWriteOff: (receivable: Receivable) => void
  onLogEmail: (receivable: Receivable) => void
}) {
  const aging = agingConfig[receivable.agingBucket]
  const collectionStatus = collectionStatusConfig[receivable.collectionStatus]
  const StatusIcon = collectionStatus.icon
  const balance = receivable.amount - receivable.amountPaid
  const isHighRisk = receivable.paymentHistory === 'poor' || receivable.collectionStatus === 'escalated' || receivable.collectionStatus === 'lien_notice'
  const isSeverelyOverdue = receivable.daysOutstanding >= 60 || receivable.agingBucket === '61-90' || receivable.agingBucket === '90+'

  return (
    <div className={cn(
      "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow",
      receivable.agingBucket === '61-90' || receivable.agingBucket === '90+' ? "border-red-200" :
      receivable.agingBucket === '31-60' ? "border-amber-200" : "border-warm-200"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-warm-900">{receivable.invoiceNumber}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", aging.bgColor, aging.color)}>
              {receivable.agingBucket === 'current' ? 'Current' : `${receivable.daysOutstanding} days overdue`}
            </span>
            <PaymentHistoryBadge history={receivable.paymentHistory} />
            <LienWaiverBadge status={receivable.lienWaiverStatus} />
            <CollectionProbabilityBadge probability={receivable.aiCollectionProbability} />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-2 text-warm-600">
              <Building2 className="h-4 w-4 text-warm-400" />
              <span>{receivable.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-warm-600">
              <Briefcase className="h-4 w-4 text-warm-400" />
              <span>{receivable.jobName} - Draw #{receivable.drawNumber}</span>
            </div>
          </div>

          {/* Partial payment progress */}
          {receivable.amountPaid > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                <span className="flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  Partial payment: {formatCurrency(receivable.amountPaid)} of {formatCurrency(receivable.amount)}
                </span>
                <span>{((receivable.amountPaid / receivable.amount) * 100).toFixed(0)}% paid</span>
              </div>
              <div className="h-1.5 bg-warm-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(receivable.amountPaid / receivable.amount) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1 text-warm-500">
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{collectionStatus.label}</span>
            </div>
            {receivable.lastContact && (
              <span className="text-xs text-warm-400">
                Last contact: {formatDate(receivable.lastContact)}
              </span>
            )}
            {receivable.paymentMethod && (
              <span className="text-xs text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded">
                Preferred: {receivable.paymentMethod}
              </span>
            )}
          </div>

          {/* Payment Link Tracking */}
          {receivable.paymentLinkTracking && (
            <div className="mt-2">
              <PaymentLinkStatus tracking={receivable.paymentLinkTracking} />
            </div>
          )}

          {/* Lien Deadline Alert */}
          {receivable.lienDeadline && (
            <div className="mt-2">
              <LienDeadlineAlert deadline={receivable.lienDeadline} collectionStatus={receivable.collectionStatus} />
            </div>
          )}

          {/* Retainage info */}
          {receivable.retainageAmount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-stone-600 bg-warm-50 px-2 py-1 rounded">
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
              isHighRisk ? "bg-red-50" : "bg-stone-50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                isHighRisk ? "text-red-500" : "text-stone-500"
              )} />
              <span className={isHighRisk ? "text-red-700" : "text-stone-700"}>
                {receivable.aiNote}
              </span>
            </div>
          )}

          {/* Write-off History */}
          <WriteOffHistory history={receivable.writeOffHistory} />

          {/* Email Follow-up History */}
          <EmailFollowUpHistory emails={receivable.emailFollowUps} />
        </div>

        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-warm-900">{formatCurrency(balance)}</div>
            {receivable.amountPaid > 0 && (
              <div className="text-xs text-warm-400">of {formatCurrency(receivable.amount)}</div>
            )}
            <div className="flex items-center gap-2 text-sm mt-1">
              <Calendar className="h-3.5 w-3.5 text-warm-400" />
              <span className="text-warm-500">Due {formatDate(receivable.dueDate)}</span>
            </div>
          </div>
          <button className="p-1.5 hover:bg-warm-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-warm-400" />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-end gap-2 flex-wrap">
        {receivable.collectionStatus === 'none' && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50">
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
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-700 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Phone className="h-3.5 w-3.5" />
              Log Call
            </button>
            <button
              onClick={() => onLogEmail(receivable)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-700 border border-warm-200 rounded-lg hover:bg-warm-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Log Email
            </button>
          </>
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
        {isSeverelyOverdue && (
          <button
            onClick={() => onWriteOff(receivable)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-700 border border-warm-200 rounded-lg hover:bg-warm-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Write Off
          </button>
        )}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
          <ExternalLink className="h-3.5 w-3.5" />
          Payment Link
        </button>
      </div>
    </div>
  )
}

function groupReceivablesByClient(receivables: Receivable[]): Record<string, Receivable[]> {
  return receivables.reduce((acc, r) => {
    if (!acc[r.clientName]) {
      acc[r.clientName] = []
    }
    acc[r.clientName].push(r)
    return acc
  }, {} as Record<string, Receivable[]>)
}

function groupReceivablesByJob(receivables: Receivable[]): Record<string, Receivable[]> {
  return receivables.reduce((acc, r) => {
    if (!acc[r.jobName]) {
      acc[r.jobName] = []
    }
    acc[r.jobName].push(r)
    return acc
  }, {} as Record<string, Receivable[]>)
}

export function ReceivablesPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [viewMode, setViewMode] = useState<LocalViewMode>('list')
  const [writeOffModal, setWriteOffModal] = useState<{ isOpen: boolean; receivable: Receivable | null }>({ isOpen: false, receivable: null })
  const [emailLogModal, setEmailLogModal] = useState<{ isOpen: boolean; receivable: Receivable | null }>({ isOpen: false, receivable: null })

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

  // Calculate DSO dynamically
  const dso = calculateDSO(mockPaidReceivables)
  const dsoChange = lastMonthDSO - dso
  const dsoTrend = dsoChange > 0 ? 'down' : dsoChange < 0 ? 'up' : 'flat'

  const totalRetainage = mockReceivables.reduce((sum, r) => sum + r.retainageAmount, 0)
  const pendingLienWaivers = mockReceivables.filter(r => r.lienWaiverStatus === 'pending').length
  const avgCollectionProbability = Math.round(
    mockReceivables.filter(r => r.aiCollectionProbability !== undefined).reduce((sum, r) => sum + (r.aiCollectionProbability ?? 0), 0) /
    mockReceivables.filter(r => r.aiCollectionProbability !== undefined).length
  )

  const handleWriteOff = (receivable: Receivable) => {
    setWriteOffModal({ isOpen: true, receivable })
  }

  const handleLogEmail = (receivable: Receivable) => {
    setEmailLogModal({ isOpen: true, receivable })
  }

  const renderReceivables = () => {
    if (viewMode === 'grid') {
      const grouped = groupReceivablesByClient(filteredReceivables)
      return Object.entries(grouped).map(([clientName, receivables]) => (
        <div key={clientName} className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Building2 className="h-5 w-5 text-warm-500" />
            <h4 className="font-semibold text-warm-800">{clientName}</h4>
            <span className="text-sm text-warm-500">
              ({receivables.length} items, {formatCurrency(receivables.reduce((sum, r) => sum + (r.amount - r.amountPaid), 0))})
            </span>
          </div>
          <div className="space-y-3">
            {receivables.map(receivable => (
              <ReceivableRow
                key={receivable.id}
                receivable={receivable}
                onWriteOff={handleWriteOff}
                onLogEmail={handleLogEmail}
              />
            ))}
          </div>
        </div>
      ))
    }

    if (viewMode === 'table') {
      const grouped = groupReceivablesByJob(filteredReceivables)
      return Object.entries(grouped).map(([jobName, receivables]) => (
        <div key={jobName} className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Briefcase className="h-5 w-5 text-warm-500" />
            <h4 className="font-semibold text-warm-800">{jobName}</h4>
            <span className="text-sm text-warm-500">
              ({receivables.length} items, {formatCurrency(receivables.reduce((sum, r) => sum + (r.amount - r.amountPaid), 0))})
            </span>
          </div>
          <div className="space-y-3">
            {receivables.map(receivable => (
              <ReceivableRow
                key={receivable.id}
                receivable={receivable}
                onWriteOff={handleWriteOff}
                onLogEmail={handleLogEmail}
              />
            ))}
          </div>
        </div>
      ))
    }

    // Default: aging view
    return filteredReceivables.map(receivable => (
      <ReceivableRow
        key={receivable.id}
        receivable={receivable}
        onWriteOff={handleWriteOff}
        onLogEmail={handleLogEmail}
      />
    ))
  }

  // AI Feature configurations
  const aiFeatures = [
    {
      feature: 'Collection Priority',
      insight: 'Priority collection: 1) Smith $12,400 (45 days, responds to calls), 2) Johnson $8,200 (30 days, prefers email)',
    },
    {
      feature: 'Payment Prediction',
      insight: 'Smith likely to pay within 7 days based on past pattern. Johnson may need escalation - slow payer historically.',
    },
    {
      feature: 'Lien Waiver Impact',
      insight: 'Coastal Plumbing lien waiver pending. Blocking: Draw #4 submission ($18,400)',
    },
    {
      feature: 'DSO Trend',
      insight: `DSO trending ${dsoTrend === 'up' ? 'up' : 'down'}: ${dso} days this month vs ${lastMonthDSO} last month. 3 accounts driving ${dsoTrend === 'up' ? 'increase' : 'improvement'}.`,
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Accounts Receivable</h3>
              <span className="text-sm text-warm-500">{mockReceivables.length} outstanding | {formatCurrency(totalAR)} total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Outstanding
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(totalAR)}</div>
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
              {dsoTrend === 'down' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              DSO (Days Sales Outstanding)
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              dso <= 30 ? "text-green-700" : dso <= 45 ? "text-amber-700" : "text-red-700"
            )}>
              {dso} days
            </div>
            <div className="text-xs text-warm-500 mt-0.5">
              {dsoTrend === 'down' ? `↓${Math.abs(dsoChange)}` : dsoTrend === 'up' ? `↑${Math.abs(dsoChange)}` : '→'} from last month | Industry avg: 35 days
            </div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Retainage Held
            </div>
            <div className="text-xl font-bold text-warm-700 mt-1">{formatCurrency(totalRetainage)}</div>
            <div className="text-xs text-warm-500 mt-0.5">Across {mockReceivables.filter(r => r.retainageAmount > 0).length} draws</div>
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
            <div className="text-xs text-warm-500 mt-0.5">Avg collection: {avgCollectionProbability}% probability</div>
          </div>
        </div>
      </div>

      {/* Aging Summary Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-warm-500">Aging Summary:</span>
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
        <div className="flex items-center justify-between mt-2 text-xs text-warm-500">
          <span>Current: {formatCurrency(agingSummary.current)} ({((agingSummary.current / totalAR) * 100).toFixed(0)}%)</span>
          <span>1-30: {formatCurrency(agingSummary['1-30'])}</span>
          <span>31-60: {formatCurrency(agingSummary['31-60'])}</span>
          <span>61-90: {formatCurrency(agingSummary['61-90'])}</span>
          <span>90+: {formatCurrency(agingSummary['90+'])}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
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
          <ViewModeToggle
            value={viewMode}
            onChange={(mode: ViewMode) => setViewMode(mode as LocalViewMode)}
            options={['list', 'grid', 'table']}
          />
        </div>
      </div>

      {/* Receivable List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {renderReceivables()}
        {filteredReceivables.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No receivables match your filters
          </div>
        )}
      </div>

      {/* Retainage Summary */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-stone-600" />
            <span className="font-medium text-warm-800">Retainage Summary:</span>
            <span className="text-warm-700">{formatCurrency(totalRetainage)} held across all active draws</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-600">
            {mockReceivables.filter(r => r.retainageReleaseDate).map(r => (
              <span key={r.id}>{r.jobName}: {formatCurrency(r.retainageAmount)} release {formatDate(r.retainageReleaseDate!)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        title="AI Collection Insights"
        features={aiFeatures}
        className="border-t border-warm-200"
      />

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
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
            {' '}Collection rate this month: 94% (above 90% target). DSO: {dso} days ({dsoTrend === 'down' ? `↓${Math.abs(dsoChange)}` : `↑${Math.abs(dsoChange)}`} from last month).
          </p>
        </div>
      </div>

      {/* Write-off Modal */}
      {writeOffModal.receivable && (
        <WriteOffModal
          isOpen={writeOffModal.isOpen}
          onClose={() => setWriteOffModal({ isOpen: false, receivable: null })}
          receivable={writeOffModal.receivable}
        />
      )}

      {/* Email Log Modal */}
      {emailLogModal.receivable && (
        <EmailLogModal
          isOpen={emailLogModal.isOpen}
          onClose={() => setEmailLogModal({ isOpen: false, receivable: null })}
          receivable={emailLogModal.receivable}
        />
      )}
    </div>
  )
}
