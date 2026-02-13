'use client'

import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Plus,
  MoreHorizontal,
  Link2,
  Sparkles,
  RefreshCw,
  Download,
  ExternalLink,
  Building2,
  Undo2,
  Timer,
  Banknote,
  Receipt,
  BookCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Payment {
  id: string
  job: string
  clientName: string
  drawNumber: number
  amount: number
  method?: 'ACH' | 'Credit Card' | 'Wire' | 'Check'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partial'
  linkSent?: string
  linkViewed?: string
  linkExpires?: string
  paidAt?: string
  fee?: number
  netAmount?: number
  receiptUrl?: string
  qbSynced?: boolean
  refundAmount?: number
  refundReason?: string
  partialAmount?: number
  stripePaymentId?: string
}

const mockPayments: Payment[] = [
  {
    id: '1',
    job: 'Smith Residence',
    clientName: 'Smith Family Trust',
    drawNumber: 5,
    amount: 185000,
    status: 'pending',
    linkSent: 'Jan 25',
    linkViewed: 'Jan 26',
    linkExpires: 'Feb 25',
    stripePaymentId: 'pi_3Oa...',
  },
  {
    id: '2',
    job: 'Johnson Beach House',
    clientName: 'Johnson Development LLC',
    drawNumber: 3,
    amount: 60000,
    status: 'pending',
    linkSent: 'Today',
    linkExpires: 'Mar 12',
    stripePaymentId: 'pi_3Ob...',
  },
  {
    id: '3',
    job: 'Smith Residence',
    clientName: 'Smith Family Trust',
    drawNumber: 4,
    amount: 225000,
    method: 'ACH',
    status: 'completed',
    paidAt: 'Jan 20',
    fee: 15,
    netAmount: 224985,
    receiptUrl: '/receipts/r-2026-0034.pdf',
    qbSynced: true,
    stripePaymentId: 'pi_3N9...',
  },
  {
    id: '4',
    job: 'Williams Remodel',
    clientName: 'Williams Contractors',
    drawNumber: 2,
    amount: 45000,
    method: 'Credit Card',
    status: 'completed',
    paidAt: 'Jan 18',
    fee: 1305,
    netAmount: 43695,
    receiptUrl: '/receipts/r-2026-0033.pdf',
    qbSynced: true,
    stripePaymentId: 'pi_3N8...',
  },
  {
    id: '5',
    job: 'Davis Custom Home',
    clientName: 'Davis Family Trust',
    drawNumber: 1,
    amount: 120000,
    method: 'ACH',
    status: 'completed',
    paidAt: 'Jan 15',
    fee: 15,
    netAmount: 119985,
    receiptUrl: '/receipts/r-2026-0030.pdf',
    qbSynced: true,
    stripePaymentId: 'pi_3N5...',
  },
  {
    id: '6',
    job: 'Miller Addition',
    clientName: 'Miller Investment Group',
    drawNumber: 2,
    amount: 42000,
    method: 'Wire',
    status: 'processing',
    fee: 25,
    stripePaymentId: 'pi_3Oc...',
  },
  {
    id: '7',
    job: 'Thompson Renovation',
    clientName: 'Thompson Builders',
    drawNumber: 5,
    amount: 18000,
    method: 'Credit Card',
    status: 'failed',
    stripePaymentId: 'pi_3Od...',
  },
  {
    id: '8',
    job: 'Wilson Custom',
    clientName: 'Wilson Custom Homes',
    drawNumber: 3,
    amount: 55000,
    method: 'ACH',
    status: 'refunded',
    paidAt: 'Jan 10',
    fee: 15,
    netAmount: 54985,
    refundAmount: 55000,
    refundReason: 'Draw recalculated - overpayment',
    receiptUrl: '/receipts/r-2026-0028.pdf',
    qbSynced: true,
    stripePaymentId: 'pi_3N3...',
  },
  {
    id: '9',
    job: 'Parker Commercial',
    clientName: 'Parker Developments',
    drawNumber: 1,
    amount: 95000,
    method: 'Check',
    status: 'partial',
    paidAt: 'Feb 5',
    partialAmount: 50000,
    qbSynced: false,
    stripePaymentId: 'pi_3Oe...',
  },
]

const statusConfig: Record<Payment['status'], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  completed: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700', icon: Undo2 },
  partial: { label: 'Partial', color: 'bg-orange-100 text-orange-700', icon: Timer },
}

const methodConfig: Record<string, { icon: typeof CreditCard; label: string }> = {
  'ACH': { icon: Banknote, label: 'ACH Transfer' },
  'Credit Card': { icon: CreditCard, label: 'Credit Card' },
  'Wire': { icon: ExternalLink, label: 'Wire Transfer' },
  'Check': { icon: Receipt, label: 'Check' },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function PaymentCard({ payment }: { payment: Payment }) {
  const status = statusConfig[payment.status]
  const StatusIcon = status.icon
  const methodInfo = payment.method ? methodConfig[payment.method] : null
  const MethodIcon = methodInfo?.icon

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      payment.status === 'failed' ? "border-red-200" :
      payment.status === 'refunded' ? "border-purple-200" : "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{payment.job}</h4>
            <span className="text-sm text-gray-500">- Draw #{payment.drawNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
            <Building2 className="h-3 w-3" />
            <span>{payment.clientName}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        {methodInfo && MethodIcon && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
            <MethodIcon className="h-3 w-3" />
            {methodInfo.label}
          </span>
        )}
        {payment.qbSynced !== undefined && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
            payment.qbSynced ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          )}>
            <BookCheck className="h-3 w-3" />
            {payment.qbSynced ? 'QB synced' : 'Not synced'}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
        </div>
        {payment.status === 'partial' && payment.partialAmount !== undefined && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Received</span>
              <span className="font-medium text-orange-600">{formatCurrency(payment.partialAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Remaining</span>
              <span className="font-medium text-gray-900">{formatCurrency(payment.amount - payment.partialAmount)}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(payment.partialAmount / payment.amount) * 100}%` }} />
            </div>
          </>
        )}
        {payment.fee !== undefined && payment.status !== 'partial' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Processing Fee</span>
            <span className="text-gray-500">-{formatCurrency(payment.fee)}</span>
          </div>
        )}
        {payment.netAmount !== undefined && payment.status !== 'partial' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Net Amount</span>
            <span className="font-medium text-green-600">{formatCurrency(payment.netAmount)}</span>
          </div>
        )}
        {payment.status === 'refunded' && payment.refundAmount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Refunded</span>
            <span className="font-medium text-purple-600">-{formatCurrency(payment.refundAmount)}</span>
          </div>
        )}
      </div>

      {payment.status === 'refunded' && payment.refundReason && (
        <div className="mb-3 text-xs text-purple-600 bg-purple-50 px-2 py-1.5 rounded">
          Reason: {payment.refundReason}
        </div>
      )}

      {payment.status === 'pending' && (
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-2 flex-wrap">
            {payment.linkSent && <span>Link sent: {payment.linkSent}</span>}
            {payment.linkViewed && <span>| Viewed: {payment.linkViewed}</span>}
            {payment.linkExpires && (
              <span className="text-amber-500 flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Expires: {payment.linkExpires}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1">
              <Send className="h-3 w-3" />
              Send Reminder
            </button>
            <button className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1">
              <Link2 className="h-3 w-3" />
              Copy Link
            </button>
          </div>
        </div>
      )}

      {payment.status === 'failed' && (
        <div className="pt-3 border-t border-red-100">
          <div className="text-xs text-red-600 mb-2">Payment declined. Card may be expired or insufficient funds.</div>
          <div className="flex gap-2">
            <button className="flex-1 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Retry Payment
            </button>
            <button className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1">
              <Send className="h-3 w-3" />
              New Link
            </button>
          </div>
        </div>
      )}

      {payment.status === 'processing' && (
        <div className="pt-3 border-t border-blue-100 text-xs text-blue-600 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Processing... Expected completion: 1-2 business days
        </div>
      )}

      {payment.status === 'completed' && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Paid: {payment.paidAt}</span>
          <div className="flex items-center gap-2">
            {payment.receiptUrl && (
              <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Download className="h-3 w-3" />
                Receipt
              </button>
            )}
          </div>
        </div>
      )}

      {payment.status === 'partial' && (
        <div className="pt-3 border-t border-orange-100">
          <div className="text-xs text-orange-600 mb-2">Partial payment received {payment.paidAt}</div>
          <button className="w-full py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center justify-center gap-1">
            <Send className="h-3 w-3" />
            Send Remaining Balance Link
          </button>
        </div>
      )}
    </div>
  )
}

export function PaymentsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const thisMonth = mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const pending = mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const processing = mockPayments.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.amount, 0)
  const totalFees = mockPayments.filter(p => p.fee).reduce((sum, p) => sum + (p.fee ?? 0), 0)
  const refunded = mockPayments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount ?? 0), 0)
  const partialRemaining = mockPayments.filter(p => p.status === 'partial').reduce((sum, p) => sum + p.amount - (p.partialAmount ?? 0), 0)
  const notSyncedCount = mockPayments.filter(p => p.qbSynced === false).length

  const filteredPayments = sortItems(
    mockPayments.filter(p => {
      if (!matchesSearch(p, search, ['job', 'clientName'])) return false
      if (activeTab !== 'all' && p.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Payment | '',
    sortDirection,
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Payments</h3>
            <span className="text-sm text-gray-500">{mockPayments.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            {notSyncedCount > 0 && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                <BookCheck className="h-3 w-3" />
                {notSyncedCount} not synced to QB
              </span>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="text-xs text-green-600">Collected (Month)</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(thisMonth)}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5">
            <div className="text-xs text-amber-600">Pending</div>
            <div className="text-lg font-bold text-amber-700">{formatCurrency(pending)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5">
            <div className="text-xs text-blue-600">Processing</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(processing)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2.5">
            <div className="text-xs text-orange-600">Partial Due</div>
            <div className="text-lg font-bold text-orange-700">{formatCurrency(partialRemaining)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2.5">
            <div className="text-xs text-purple-600">Refunded</div>
            <div className="text-lg font-bold text-purple-700">{formatCurrency(refunded)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-xs text-gray-600">Fees (Month)</div>
            <div className="text-lg font-bold text-gray-700">{formatCurrency(totalFees)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search payments by job or client..."
          tabs={[
            { key: 'all', label: 'All', count: mockPayments.length },
            { key: 'pending', label: 'Pending', count: mockPayments.filter(p => p.status === 'pending').length },
            { key: 'processing', label: 'Processing', count: mockPayments.filter(p => p.status === 'processing').length },
            { key: 'completed', label: 'Completed', count: mockPayments.filter(p => p.status === 'completed').length },
            { key: 'partial', label: 'Partial', count: mockPayments.filter(p => p.status === 'partial').length },
            { key: 'failed', label: 'Failed', count: mockPayments.filter(p => p.status === 'failed').length },
            { key: 'refunded', label: 'Refunded', count: mockPayments.filter(p => p.status === 'refunded').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'job', label: 'Job' },
            { value: 'clientName', label: 'Client' },
            { value: 'amount', label: 'Amount' },
            { value: 'drawNumber', label: 'Draw #' },
            { value: 'status', label: 'Status' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'New Payment Link', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredPayments.length}
          totalCount={mockPayments.length}
        />
      </div>

      {/* Payments Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
        {filteredPayments.map(payment => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
        {filteredPayments.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No payments found
          </div>
        )}
      </div>

      {/* Fee Comparison Summary */}
      <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Fee Summary:</span>
            <span className="text-blue-700">
              ACH: $15 flat ({mockPayments.filter(p => p.method === 'ACH' && p.status === 'completed').length} payments) |
              Card: 2.9%+$0.30 ({mockPayments.filter(p => p.method === 'Credit Card' && p.status === 'completed').length} payments) |
              Wire: $25 flat ({mockPayments.filter(p => p.method === 'Wire').length} payments)
            </span>
          </div>
          <span className="text-xs text-blue-600">Fees saved by ACH vs card: ~$5,300</span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <div className="text-sm text-amber-700">
            Smith Residence ($185K pending) typically pays within 5 days - now 6 days out, recommend sending reminder.
            For this amount, ACH saves $5,350 vs credit card.
            Thompson Renovation ($18K) payment failed - suggest sending a new payment link with ACH option.
            Parker Commercial has $45K remaining on partial payment - consider sending balance link.
            {notSyncedCount > 0 && ` ${notSyncedCount} payment(s) awaiting QuickBooks sync.`}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CreditCard className="h-4 w-4" />
            <span>Stripe Connected | Processing: 2.9% + $0.30 card, $15 flat ACH, $25 wire</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            <span>Fee pass-through: Enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}
