'use client'

import { useState } from 'react'
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Link2,
  Building2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  job: string
  drawNumber: number
  amount: number
  method?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  linkSent?: string
  linkViewed?: string
  paidAt?: string
  fee?: number
  netAmount?: number
}

const mockPayments: Payment[] = [
  {
    id: '1',
    job: 'Smith Residence',
    drawNumber: 5,
    amount: 185000,
    status: 'pending',
    linkSent: 'Jan 25',
    linkViewed: 'Jan 26',
  },
  {
    id: '2',
    job: 'Johnson Beach House',
    drawNumber: 3,
    amount: 60000,
    status: 'pending',
    linkSent: 'Today',
  },
  {
    id: '3',
    job: 'Smith Residence',
    drawNumber: 4,
    amount: 225000,
    method: 'ACH',
    status: 'completed',
    paidAt: 'Jan 20',
    fee: 15,
    netAmount: 224985,
  },
  {
    id: '4',
    job: 'Williams Remodel',
    drawNumber: 2,
    amount: 45000,
    method: 'Credit Card',
    status: 'completed',
    paidAt: 'Jan 18',
    fee: 1305,
    netAmount: 43695,
  },
  {
    id: '5',
    job: 'Davis Custom Home',
    drawNumber: 1,
    amount: 120000,
    method: 'ACH',
    status: 'completed',
    paidAt: 'Jan 15',
    fee: 15,
    netAmount: 119985,
  },
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  completed: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function PaymentCard({ payment }: { payment: Payment }) {
  const status = statusConfig[payment.status]
  const StatusIcon = status.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{payment.job}</h4>
            <span className="text-sm text-gray-500">- Draw #{payment.drawNumber}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        {payment.method && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {payment.method}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
        </div>
        {payment.fee !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Processing Fee</span>
            <span className="text-gray-500">-{formatCurrency(payment.fee)}</span>
          </div>
        )}
        {payment.netAmount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Net Amount</span>
            <span className="font-medium text-green-600">{formatCurrency(payment.netAmount)}</span>
          </div>
        )}
      </div>

      {payment.status === 'pending' && (
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">
            {payment.linkSent && <span>Link sent: {payment.linkSent}</span>}
            {payment.linkViewed && <span className="ml-2">| Viewed: {payment.linkViewed}</span>}
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

      {payment.status === 'completed' && payment.paidAt && (
        <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
          Paid: {payment.paidAt}
        </div>
      )}
    </div>
  )
}

export function PaymentsPreview() {
  const [statusFilter, setStatusFilter] = useState('all')

  const thisMonth = mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const pending = mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

  const filteredPayments = statusFilter === 'all'
    ? mockPayments
    : mockPayments.filter(p => p.status === statusFilter)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Payments</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Payment Link
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">This Month:</span>
            <span className="ml-2 font-semibold text-green-600">{formatCurrency(thisMonth)}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-gray-500">Pending:</span>
            <span className="ml-2 font-semibold text-amber-600">{formatCurrency(pending)}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-gray-500">Overdue:</span>
            <span className="ml-2 font-semibold text-gray-900">$0</span>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        {['all', 'pending', 'processing', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors capitalize",
              statusFilter === status
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Payments Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredPayments.map(payment => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
        {filteredPayments.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No payments found
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <div className="text-sm text-amber-700">
            Smith Residence typically pays within 5 days. Draw #5 is now 6 days out. Recommend sending reminder. For $185K, ACH saves $5,350 vs credit card.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className="h-4 w-4" />
          <span>Stripe Connected | Processing: 2.9% + $0.30 card, $15 flat ACH</span>
        </div>
      </div>
    </div>
  )
}
