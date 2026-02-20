'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
  Download,
  RefreshCw,
  Building2,
  Sliders,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

interface CashFlowWeek {
  id: string
  weekLabel: string
  startDate: string
  endDate: string
  openingBalance: number
  expectedInflows: number
  expectedOutflows: number
  closingBalance: number
  target: number
  confidence: number
  lowScenario: number
  highScenario: number
  inflows: { source: string; amount: number; probability: number; type: string }[]
  outflows: { vendor: string; amount: number; type: string; lienWaiverStatus?: string }[]
  status: 'healthy' | 'warning' | 'danger'
  aiNote?: string
  bankAccount?: string
}

const mockCashFlowWeeks: CashFlowWeek[] = [
  {
    id: '1',
    weekLabel: 'This Week',
    startDate: 'Feb 10',
    endDate: 'Feb 16',
    openingBalance: 847500,
    expectedInflows: 125000,
    expectedOutflows: 88500,
    closingBalance: 884000,
    target: 100000,
    confidence: 92,
    lowScenario: 865000,
    highScenario: 910000,
    status: 'healthy',
    bankAccount: 'Operating',
    inflows: [
      { source: 'Smith Residence - Draw #5', amount: 85000, probability: 95, type: 'draw' },
      { source: 'Miller Addition - Draw #2', amount: 40000, probability: 88, type: 'draw' },
    ],
    outflows: [
      { vendor: 'Bi-weekly Payroll', amount: 42000, type: 'payroll' },
      { vendor: 'ABC Lumber Supply', amount: 28500, type: 'material', lienWaiverStatus: 'pending' },
      { vendor: 'Jones Plumbing', amount: 18000, type: 'subcontractor', lienWaiverStatus: 'received' },
    ],
  },
  {
    id: '2',
    weekLabel: 'Week 2',
    startDate: 'Feb 17',
    endDate: 'Feb 23',
    openingBalance: 884000,
    expectedInflows: 60000,
    expectedOutflows: 95000,
    closingBalance: 849000,
    target: 100000,
    confidence: 85,
    lowScenario: 820000,
    highScenario: 875000,
    status: 'healthy',
    bankAccount: 'Operating',
    inflows: [
      { source: 'Johnson Beach House - Draw #3', amount: 60000, probability: 80, type: 'draw' },
    ],
    outflows: [
      { vendor: 'Bi-weekly Payroll', amount: 42000, type: 'payroll' },
      { vendor: 'PGT Windows', amount: 34500, type: 'material', lienWaiverStatus: 'pending' },
      { vendor: 'Cool Air HVAC', amount: 18500, type: 'subcontractor', lienWaiverStatus: 'pending' },
    ],
  },
  {
    id: '3',
    weekLabel: 'Week 3',
    startDate: 'Feb 24',
    endDate: 'Mar 2',
    openingBalance: 849000,
    expectedInflows: 45000,
    expectedOutflows: 156000,
    closingBalance: 738000,
    target: 100000,
    confidence: 72,
    lowScenario: 684000,
    highScenario: 785000,
    status: 'warning',
    bankAccount: 'Operating',
    aiNote: 'Large subcontractor payments due. Consider accelerating Draw #6 request or deferring ABC Lumber payment.',
    inflows: [
      { source: 'Davis Coastal Home - Draw #8', amount: 45000, probability: 90, type: 'draw' },
    ],
    outflows: [
      { vendor: 'Bi-weekly Payroll', amount: 42000, type: 'payroll' },
      { vendor: 'ABC Framing', amount: 52000, type: 'subcontractor', lienWaiverStatus: 'pending' },
      { vendor: 'Custom Cabinet Co', amount: 38000, type: 'material', lienWaiverStatus: 'not_required' },
      { vendor: 'Smith Electric', amount: 24000, type: 'subcontractor', lienWaiverStatus: 'pending' },
    ],
  },
  {
    id: '4',
    weekLabel: 'Week 4',
    startDate: 'Mar 3',
    endDate: 'Mar 9',
    openingBalance: 738000,
    expectedInflows: 185000,
    expectedOutflows: 78000,
    closingBalance: 845000,
    target: 100000,
    confidence: 68,
    lowScenario: 795000,
    highScenario: 890000,
    status: 'healthy',
    bankAccount: 'Operating',
    inflows: [
      { source: 'Smith Residence - Draw #6', amount: 125000, probability: 75, type: 'draw' },
      { source: 'Wilson Custom - Draw #4', amount: 60000, probability: 85, type: 'draw' },
    ],
    outflows: [
      { vendor: 'Bi-weekly Payroll', amount: 42000, type: 'payroll' },
      { vendor: 'Coastal Plumbing', amount: 18000, type: 'subcontractor', lienWaiverStatus: 'received' },
      { vendor: 'Misc Vendors', amount: 18000, type: 'material' },
    ],
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function CashFlowChart() {
  const weeks = mockCashFlowWeeks
  const maxValue = Math.max(...weeks.flatMap(w => [w.closingBalance, w.highScenario]))
  const minValue = Math.min(...weeks.flatMap(w => [w.lowScenario]))
  const range = maxValue - minValue
  const target = 100000

  const getYPosition = (value: number) => {
    return 100 - ((value - minValue) / range) * 100
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-warm-900 text-sm">30-Day Cash Flow Forecast</h4>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-stone-500 rounded" />
            Projected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-stone-100 rounded" />
            Range
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-400 rounded border-dashed" />
            Target
          </span>
        </div>
      </div>

      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-warm-500">
          <span>{formatCurrency(maxValue)}</span>
          <span>{formatCurrency((maxValue + minValue) / 2)}</span>
          <span>{formatCurrency(minValue)}</span>
        </div>

        {/* Chart area */}
        <div className="ml-14 h-full relative">
          {/* Target line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-300"
            style={{ top: `${getYPosition(target)}%` }}
          >
            <span className="absolute right-0 -top-3 text-xs text-red-500 bg-white px-1">Target</span>
          </div>

          {/* Range area (simplified) */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="rangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d={`M ${weeks.map((w, i) => `${(i / (weeks.length - 1)) * 100}% ${getYPosition(w.highScenario)}%`).join(' L ')} L 100% ${getYPosition(weeks[weeks.length - 1].lowScenario)}% ${weeks.slice().reverse().map((w, i) => `${((weeks.length - 1 - i) / (weeks.length - 1)) * 100}% ${getYPosition(w.lowScenario)}%`).join(' L ')} Z`}
              fill="url(#rangeGradient)"
            />
          </svg>

          {/* Data points and line */}
          <div className="absolute inset-0 flex items-end">
            {weeks.map((week, index) => (
              <div
                key={week.id}
                className="flex-1 flex flex-col items-center justify-end relative"
                style={{ height: '100%' }}
              >
                <div
                  className={cn(
                    "absolute w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-pointer z-10",
                    week.status === 'healthy' ? "bg-stone-500" :
                    week.status === 'warning' ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ bottom: `${100 - getYPosition(week.closingBalance)}%`, transform: 'translateY(50%)' }}
                  title={`${week.weekLabel}: ${formatCurrency(week.closingBalance)}`}
                />
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-warm-500">
            {weeks.map(week => (
              <span key={week.id} className="text-center flex-1">{week.weekLabel}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WeekDetailRow({ week, expanded, onToggle }: { week: CashFlowWeek; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        className={cn(
          "hover:bg-warm-50 cursor-pointer",
          expanded && "bg-stone-50",
          week.status === 'warning' && "bg-amber-50/50",
          week.status === 'danger' && "bg-red-50/50"
        )}
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-warm-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-warm-400" />
            )}
            <div>
              <span className="font-medium text-warm-900">{week.weekLabel}</span>
              <div className="text-xs text-warm-500">{week.startDate} - {week.endDate}</div>
            </div>
            {week.status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            {week.status === 'danger' && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        </td>
        <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(week.openingBalance)}</td>
        <td className="py-3 px-3 text-right">
          <div className="flex items-center justify-end gap-1 text-green-600">
            <ArrowUpRight className="h-3 w-3" />
            {formatCurrency(week.expectedInflows)}
          </div>
        </td>
        <td className="py-3 px-3 text-right">
          <div className="flex items-center justify-end gap-1 text-red-600">
            <ArrowDownRight className="h-3 w-3" />
            {formatCurrency(week.expectedOutflows)}
          </div>
        </td>
        <td className={cn(
          "py-3 px-3 text-right font-semibold",
          week.closingBalance >= week.target ? "text-green-600" : "text-amber-600"
        )}>
          {formatCurrency(week.closingBalance)}
        </td>
        <td className="py-3 px-3 text-center">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            week.confidence >= 85 ? "bg-green-100 text-green-700" :
            week.confidence >= 70 ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          )}>
            {week.confidence}%
          </span>
        </td>
        <td className="py-3 px-3 text-right text-xs text-warm-500">
          {formatCurrency(week.lowScenario)} - {formatCurrency(week.highScenario)}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-stone-50/50">
          <td colSpan={7} className="py-4 px-8">
            <div className="grid grid-cols-2 gap-6">
              {/* Inflows */}
              <div>
                <h5 className="text-sm font-medium text-warm-700 mb-2 flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  Expected Inflows
                </h5>
                <div className="space-y-2">
                  {week.inflows.map((inflow, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-white rounded p-2">
                      <span className="text-warm-700">{inflow.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">{formatCurrency(inflow.amount)}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          inflow.probability >= 90 ? "bg-green-100 text-green-600" :
                          inflow.probability >= 75 ? "bg-amber-100 text-amber-600" :
                          "bg-warm-100 text-warm-600"
                        )}>
                          {inflow.probability}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Outflows */}
              <div>
                <h5 className="text-sm font-medium text-warm-700 mb-2 flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  Expected Outflows
                </h5>
                <div className="space-y-2">
                  {week.outflows.map((outflow, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-white rounded p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-warm-700">{outflow.vendor}</span>
                        <span className="text-xs text-warm-400">{outflow.type}</span>
                        {outflow.lienWaiverStatus === 'pending' && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Lien waiver pending</span>
                        )}
                        {outflow.lienWaiverStatus === 'received' && (
                          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Waiver received</span>
                        )}
                      </div>
                      <span className="text-red-600 font-medium">{formatCurrency(outflow.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {week.aiNote && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-700">{week.aiNote}</span>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export function CashFlowPreview() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(['3']))
  const { search, setSearch, activeTab, setActiveTab } = useFilterState()

  const toggleWeek = (id: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const currentCash = mockCashFlowWeeks[0].openingBalance
  const projectedCash30 = mockCashFlowWeeks[mockCashFlowWeeks.length - 1].closingBalance
  const cashChange = projectedCash30 - currentCash
  const cashChangePercent = (cashChange / currentCash) * 100
  const lowestPoint = Math.min(...mockCashFlowWeeks.map(w => w.closingBalance))
  const weeksWithWarning = mockCashFlowWeeks.filter(w => w.status !== 'healthy').length
  const totalInflows = mockCashFlowWeeks.reduce((s, w) => s + w.expectedInflows, 0)
  const totalOutflows = mockCashFlowWeeks.reduce((s, w) => s + w.expectedOutflows, 0)

  const aiFeatures = [
    {
      feature: 'Forecast Accuracy',
      trigger: 'Weekly',
      insight: 'Last 12 weeks: 87% accuracy. Predicted vs actual variance averages +/- $12K.',
      detail: 'Inflows predicted within 5% accuracy 92% of the time. Outflows slightly less predictable due to timing shifts.',
      confidence: 87,
      severity: 'success' as const,
      action: { label: 'View Accuracy Report', onClick: () => {} },
    },
    {
      feature: 'Gap Warning',
      trigger: 'Real-time',
      insight: 'Week 3 cash position drops to $738K. Recommend accelerating Draw #6 or deferring payments.',
      detail: 'Large subcontractor payments ($114K) coincide with lower inflows. Buffer still above $100K target but margin is thin.',
      confidence: 92,
      severity: 'warning' as const,
      action: { label: 'View Recommendations', onClick: () => {} },
    },
    {
      feature: 'Payment Timing',
      trigger: 'On change',
      insight: 'Shifting ABC Framing and Smith Electric to Week 4 improves Week 3 balance by $76K.',
      detail: 'Both vendors have Net 45 terms with 8 days remaining. No late fee impact. Lien waivers pending for 3 payments.',
      confidence: 95,
      severity: 'info' as const,
      action: { label: 'Optimize Schedule', onClick: () => {} },
    },
    {
      feature: 'Collection Prediction',
      trigger: 'Daily',
      insight: 'Smith Residence Draw #6 has 75% probability of payment by Mar 7. Historical: 5-day avg.',
      detail: 'Client payment history shows consistent 5-day turnaround. Current draw request submitted Feb 28.',
      confidence: 88,
      severity: 'info' as const,
      action: { label: 'View Collection Forecast', onClick: () => {} },
    },
    {
      feature: 'Scenario Modeling',
      trigger: 'On demand',
      insight: 'What-if: Delaying all sub payments 1 week improves cash position by $152K at lowest point.',
      detail: 'Trade-off analysis available for payment timing, draw acceleration, and emergency credit line scenarios.',
      confidence: 90,
      severity: 'info' as const,
      action: { label: 'Run What-If Analysis', onClick: () => {} },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Cash Flow Forecast</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                weeksWithWarning === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {weeksWithWarning === 0 ? 'Healthy' : `${weeksWithWarning} Week${weeksWithWarning > 1 ? 's' : ''} Need Attention`}
              </span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Updated 10 minutes ago
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Time Horizon Selector (Gap #87) */}
            <select className="px-3 py-1.5 text-sm border border-warm-200 rounded-lg bg-white text-warm-600">
              <option>30 Days</option>
              <option>60 Days</option>
              <option>90 Days</option>
              <option>180 Days</option>
              <option>Custom Range</option>
            </select>
            {/* Granularity Toggle */}
            <select className="px-3 py-1.5 text-sm border border-warm-200 rounded-lg bg-white text-warm-600">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            {/* Bank Account Selector (Gap #435) */}
            <select className="px-3 py-1.5 text-sm border border-warm-200 rounded-lg bg-white text-warm-600">
              <option>All Accounts</option>
              <option>Operating Account</option>
              <option>Trust Account</option>
              <option>Payroll Account</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <GitBranch className="h-4 w-4" />
              What-If
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search inflows/outflows..."
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'inflows', label: 'Inflows Only' },
            { key: 'outflows', label: 'Outflows Only' },
            { key: 'warnings', label: 'Warnings', count: weeksWithWarning },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Current Cash
            </div>
            <div className="text-xl font-bold text-warm-900 mt-1">{formatCurrency(currentCash)}</div>
            <div className="text-xs text-warm-500 mt-0.5">Operating acct</div>
          </div>
          <div className={cn(
            "rounded-lg p-3",
            cashChange >= 0 ? "bg-green-50" : "bg-red-50"
          )}>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              cashChange >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {cashChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              30-Day Change
            </div>
            <div className={cn(
              "text-xl font-bold mt-1",
              cashChange >= 0 ? "text-green-700" : "text-red-700"
            )}>
              {cashChange >= 0 ? '+' : ''}{formatCurrency(cashChange)}
            </div>
            <div className="text-xs text-warm-500 mt-0.5">{cashChangePercent.toFixed(1)}%</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              Total Inflows
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalInflows)}</div>
            <div className="text-xs text-warm-500 mt-0.5">Draws + payments</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <ArrowDownRight className="h-4 w-4" />
              Total Outflows
            </div>
            <div className="text-xl font-bold text-red-700 mt-1">{formatCurrency(totalOutflows)}</div>
            <div className="text-xs text-warm-500 mt-0.5">AP + payroll + subs</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Lowest Point
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(lowestPoint)}</div>
            <div className="text-xs text-amber-600 mt-0.5">Week 3</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <Target className="h-4 w-4" />
              Reserve Target
            </div>
            <div className="text-xl font-bold text-warm-700 mt-1">$100K</div>
            <div className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              All weeks above
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 bg-white border-b border-warm-200">
        <CashFlowChart />
      </div>

      {/* Detail Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-100 border-b border-warm-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-warm-600">Period</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Opening</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Inflows</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Outflows</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Closing</th>
              <th className="text-center py-3 px-3 font-medium text-warm-600">Confidence</th>
              <th className="text-right py-3 px-3 font-medium text-warm-600">Range</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-warm-100">
            {mockCashFlowWeeks.map(week => (
              <WeekDetailRow
                key={week.id}
                week={week}
                expanded={expandedWeeks.has(week.id)}
                onToggle={() => toggleWeek(week.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Scenario Modeling Summary */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-stone-600" />
            <span className="font-medium text-warm-700">Scenario Modeling:</span>
          </div>
          <div className="flex items-center gap-6 text-warm-600">
            <span>Best Case: <span className="font-semibold text-green-600">{formatCurrency(mockCashFlowWeeks[mockCashFlowWeeks.length - 1].highScenario)}</span></span>
            <span>Likely: <span className="font-semibold text-stone-600">{formatCurrency(mockCashFlowWeeks[mockCashFlowWeeks.length - 1].closingBalance)}</span></span>
            <span>Worst Case: <span className="font-semibold text-red-600">{formatCurrency(mockCashFlowWeeks[mockCashFlowWeeks.length - 1].lowScenario)}</span></span>
            <button className="text-stone-600 hover:text-warm-700 font-medium flex items-center gap-1">
              Run What-If <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Historical Accuracy */}
      <div className="bg-warm-50 border-t border-warm-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-warm-500">
          <span>Forecast accuracy (last 12 weeks): <span className="font-semibold text-warm-700">87%</span> within projected range</span>
          <span>Seasonal pattern: Collections slow 15% in Q1 historically</span>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Cash Flow Optimization:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Week 3 shows increased outflows due to multiple subcontractor payments. Recommendation: Request Smith Residence Draw #6
              by Feb 20 (1 week early) to avoid lowest cash position. Based on client history, Smith typically pays within 5 days of draw
              approval. This would improve Week 3 closing balance by approximately $125K.
            </p>
            <p>
              Shifting ABC Framing and Smith Electric payments from Week 3 to Week 4 would improve Week 3 balance by $76K with no
              late fee impact (both have Net 45 terms). 3 lien waivers pending collection before payments can be released.
            </p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Cash Flow Intelligence"
          features={aiFeatures}
          columns={2}
        />
      </div>
    </div>
  )
}
