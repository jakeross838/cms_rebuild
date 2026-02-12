'use client'

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  Building2,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCard {
  id: string
  label: string
  value: number
  change: number
  changeLabel: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
  color: 'blue' | 'green' | 'amber' | 'purple'
}

interface PaymentDue {
  id: string
  vendor: string
  job: string
  amount: number
  dueDate: string
  daysUntilDue: number
  type: 'bill' | 'payroll' | 'subcontractor'
}

interface OverdueReceivable {
  id: string
  client: string
  job: string
  amount: number
  invoiceDate: string
  daysOverdue: number
  lastContact?: string
}

interface JobProfitability {
  id: string
  name: string
  contractAmount: number
  costToDate: number
  projectedCost: number
  projectedMargin: number
  percentComplete: number
  status: 'on-track' | 'at-risk' | 'over-budget'
}

const summaryCards: SummaryCard[] = [
  {
    id: '1',
    label: 'Cash on Hand',
    value: 487500,
    change: 12.5,
    changeLabel: 'vs last month',
    icon: Wallet,
    trend: 'up',
    color: 'blue',
  },
  {
    id: '2',
    label: 'AR Outstanding',
    value: 324800,
    change: -8.2,
    changeLabel: 'vs last month',
    icon: ArrowUpRight,
    trend: 'down',
    color: 'green',
  },
  {
    id: '3',
    label: 'AP Due (30 days)',
    value: 156200,
    change: 15.3,
    changeLabel: 'vs last month',
    icon: ArrowDownRight,
    trend: 'up',
    color: 'amber',
  },
  {
    id: '4',
    label: 'Projected Cash Flow',
    value: 655100,
    change: 5.8,
    changeLabel: '90-day forecast',
    icon: TrendingUp,
    trend: 'up',
    color: 'purple',
  },
]

const upcomingPayments: PaymentDue[] = [
  {
    id: '1',
    vendor: 'ABC Lumber Supply',
    job: 'Smith Residence',
    amount: 28500,
    dueDate: 'Feb 15, 2026',
    daysUntilDue: 3,
    type: 'bill',
  },
  {
    id: '2',
    vendor: 'Jones Plumbing',
    job: 'Johnson Beach House',
    amount: 18200,
    dueDate: 'Feb 18, 2026',
    daysUntilDue: 6,
    type: 'subcontractor',
  },
  {
    id: '3',
    vendor: 'Bi-weekly Payroll',
    job: 'All Jobs',
    amount: 42000,
    dueDate: 'Feb 14, 2026',
    daysUntilDue: 2,
    type: 'payroll',
  },
  {
    id: '4',
    vendor: 'PGT Windows',
    job: 'Miller Addition',
    amount: 34500,
    dueDate: 'Feb 20, 2026',
    daysUntilDue: 8,
    type: 'bill',
  },
]

const overdueReceivables: OverdueReceivable[] = [
  {
    id: '1',
    client: 'Wilson Custom Homes',
    job: 'Wilson Custom',
    amount: 45000,
    invoiceDate: 'Jan 15, 2026',
    daysOverdue: 28,
    lastContact: 'Feb 5',
  },
  {
    id: '2',
    client: 'Davis Family Trust',
    job: 'Davis Coastal Home',
    amount: 32500,
    invoiceDate: 'Jan 25, 2026',
    daysOverdue: 18,
    lastContact: 'Feb 8',
  },
  {
    id: '3',
    client: 'Thompson Builders',
    job: 'Thompson Renovation',
    amount: 18750,
    invoiceDate: 'Feb 1, 2026',
    daysOverdue: 11,
  },
]

const jobProfitability: JobProfitability[] = [
  {
    id: '1',
    name: 'Smith Residence',
    contractAmount: 2450000,
    costToDate: 1420000,
    projectedCost: 2180000,
    projectedMargin: 11.0,
    percentComplete: 65,
    status: 'at-risk',
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    contractAmount: 890000,
    costToDate: 312000,
    projectedCost: 756500,
    projectedMargin: 15.0,
    percentComplete: 35,
    status: 'on-track',
  },
  {
    id: '3',
    name: 'Miller Addition',
    contractAmount: 425000,
    costToDate: 285000,
    projectedCost: 382500,
    projectedMargin: 10.0,
    percentComplete: 75,
    status: 'at-risk',
  },
  {
    id: '4',
    name: 'Davis Coastal Home',
    contractAmount: 1850000,
    costToDate: 1620000,
    projectedCost: 1720000,
    projectedMargin: 7.0,
    percentComplete: 92,
    status: 'over-budget',
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

const cardColorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
}

function SummaryCardComponent({ card }: { card: SummaryCard }) {
  const colors = cardColorClasses[card.color]
  const Icon = card.icon

  return (
    <div className={cn("rounded-lg p-4", colors.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          card.trend === 'up' && card.color !== 'amber' ? "text-green-600" :
          card.trend === 'down' && card.color !== 'green' ? "text-red-600" :
          card.trend === 'up' && card.color === 'amber' ? "text-amber-600" :
          "text-green-600"
        )}>
          {card.trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {card.change > 0 ? '+' : ''}{card.change}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{formatCurrency(card.value)}</div>
      <div className="text-sm text-gray-500 mt-1">{card.label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{card.changeLabel}</div>
    </div>
  )
}

function ChartPlaceholder({ title, icon: Icon, height = "h-48" }: { title: string; icon: React.ElementType; height?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className={cn("bg-gray-50 rounded-lg flex items-center justify-center", height)}>
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
              <div
                key={i}
                className="w-4 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                style={{ height: `${h}%`, maxHeight: '120px' }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">Chart visualization</span>
        </div>
      </div>
    </div>
  )
}

function PaymentsList({ payments }: { payments: PaymentDue[] }) {
  const getTypeIcon = (type: PaymentDue['type']) => {
    switch (type) {
      case 'payroll': return CreditCard
      case 'subcontractor': return Building2
      default: return DollarSign
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 text-sm">Upcoming Payments</h4>
          <span className="text-xs text-gray-500">{payments.length} due soon</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {payments.map(payment => {
          const Icon = getTypeIcon(payment.type)
          return (
            <div key={payment.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    payment.daysUntilDue <= 3 ? "bg-red-100" : "bg-gray-100"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      payment.daysUntilDue <= 3 ? "text-red-600" : "text-gray-600"
                    )} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{payment.vendor}</div>
                    <div className="text-xs text-gray-500">{payment.job}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-sm">{formatCurrency(payment.amount)}</div>
                  <div className={cn(
                    "text-xs flex items-center gap-1 justify-end",
                    payment.daysUntilDue <= 3 ? "text-red-600" : "text-gray-500"
                  )}>
                    <Clock className="h-3 w-3" />
                    {payment.daysUntilDue === 0 ? 'Due today' :
                     payment.daysUntilDue === 1 ? 'Due tomorrow' :
                     `Due in ${payment.daysUntilDue} days`}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View all payments
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function OverdueList({ receivables }: { receivables: OverdueReceivable[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 text-sm">Overdue Receivables</h4>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-xs font-medium text-red-600">
            {formatCurrency(receivables.reduce((sum, r) => sum + r.amount, 0))} total
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {receivables.map(receivable => (
          <div key={receivable.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 text-sm">{receivable.client}</div>
                <div className="text-xs text-gray-500">{receivable.job}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 text-sm">{formatCurrency(receivable.amount)}</div>
                <div className={cn(
                  "text-xs",
                  receivable.daysOverdue > 21 ? "text-red-600" :
                  receivable.daysOverdue > 14 ? "text-amber-600" : "text-gray-500"
                )}>
                  {receivable.daysOverdue} days overdue
                </div>
              </div>
            </div>
            {receivable.lastContact && (
              <div className="mt-1 text-xs text-gray-400">
                Last contact: {receivable.lastContact}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          View all receivables
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function JobProfitabilityTable({ jobs }: { jobs: JobProfitability[] }) {
  const getStatusBadge = (status: JobProfitability['status']) => {
    switch (status) {
      case 'on-track':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">On Track</span>
      case 'at-risk':
        return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">At Risk</span>
      case 'over-budget':
        return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">Over Budget</span>
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 text-sm">Job Profitability Summary</h4>
          <span className="text-xs text-gray-500">{jobs.length} active jobs</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-medium text-gray-600">Job</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">Contract</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">Cost to Date</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">Projected Cost</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600">Margin</th>
              <th className="py-2 px-3 font-medium text-gray-600 w-24">Progress</th>
              <th className="py-2 px-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{job.name}</span>
                </td>
                <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(job.contractAmount)}</td>
                <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(job.costToDate)}</td>
                <td className="py-3 px-3 text-right font-medium text-gray-900">{formatCurrency(job.projectedCost)}</td>
                <td className={cn(
                  "py-3 px-3 text-right font-semibold",
                  job.projectedMargin >= 12 ? "text-green-600" :
                  job.projectedMargin >= 8 ? "text-amber-600" : "text-red-600"
                )}>
                  {job.projectedMargin.toFixed(1)}%
                </td>
                <td className="py-3 px-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        job.status === 'on-track' ? "bg-green-500" :
                        job.status === 'at-risk' ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${job.percentComplete}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 text-center">{job.percentComplete}%</div>
                </td>
                <td className="py-3 px-3">{getStatusBadge(job.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FinancialDashboardPreview() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Financial Dashboard</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Healthy</span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                As of February 12, 2026
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Cash position improving
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              Date Range
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <BarChart3 className="h-4 w-4" />
              Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <SummaryCardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <ChartPlaceholder title="Revenue by Month" icon={BarChart3} />
        <ChartPlaceholder title="Profit Margin Trend" icon={LineChart} />
        <ChartPlaceholder title="AR Aging" icon={PieChart} />
      </div>

      {/* Quick Lists Row */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">
        <PaymentsList payments={upcomingPayments} />
        <OverdueList receivables={overdueReceivables} />
      </div>

      {/* Job Profitability */}
      <div className="px-4 pb-4">
        <JobProfitabilityTable jobs={jobProfitability} />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Cash Flow Prediction:</span>
          </div>
          <p className="text-sm text-amber-700">
            Based on historical patterns, expect a $45K shortfall in early March due to delayed draws on Smith Residence.
            Recommend accelerating Draw #4 request or deferring ABC Lumber payment to Feb 28. Wilson Custom payment (28 days overdue)
            has 78% collection probability within 2 weeks based on client history.
          </p>
        </div>
      </div>
    </div>
  )
}
