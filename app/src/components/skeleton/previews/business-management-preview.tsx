'use client'

import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Brain,
  Target,
  BarChart3,
  PieChart,
  Clock,
  AlertTriangle,
  CheckCircle,
  Minus,
  Activity,
  Gauge,
  Calculator,
  Wallet,
  LineChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface PLLineItem {
  label: string
  amount: string
  percentage?: string
  indent?: boolean
  bold?: boolean
  separator?: boolean
  color?: string
}

interface OverheadItem {
  category: string
  monthly: string
  annual: string
}

interface CapacityPerson {
  name: string
  role: string
  currentJobs: number
  maxJobs: number
}

interface CashFlowWeek {
  week: string
  moneyIn: number
  moneyOut: number
  net: number
  alert?: boolean
}

interface KPICard {
  label: string
  target: string
  current: string
  progress: number
  status: 'on-track' | 'behind' | 'at-risk'
  statusLabel: string
  statusColor: string
  icon: React.ElementType
}

// ── Mock Data ─────────────────────────────────────────────────────────

const plItems: PLLineItem[] = [
  { label: 'Revenue', amount: '$2,400,000', bold: true },
  { label: 'Cost of Goods Sold (COGS)', amount: '($1,850,000)', color: 'text-red-600' },
  { label: '', amount: '', separator: true },
  { label: 'Gross Profit', amount: '$550,000', percentage: '22.9%', bold: true, color: 'text-emerald-700' },
  { label: 'Total Overhead', amount: '($342,000)', percentage: '14.25%', color: 'text-red-600' },
  { label: '', amount: '', separator: true },
  { label: 'Net Profit', amount: '$208,000', percentage: '8.7%', bold: true, color: 'text-emerald-700' },
]

const monthlyTrend = [
  { month: 'Sep', revenue: 340, profit: 28 },
  { month: 'Oct', revenue: 380, profit: 32 },
  { month: 'Nov', revenue: 420, profit: 38 },
  { month: 'Dec', revenue: 360, profit: 25 },
  { month: 'Jan', revenue: 450, profit: 42 },
  { month: 'Feb', revenue: 450, profit: 43 },
]

const yoyComparison = [
  { metric: 'Revenue', last: '$1.9M', current: '$2.4M', change: '+26%', positive: true },
  { metric: 'Gross Margin', last: '20.1%', current: '22.9%', change: '+2.8pts', positive: true },
  { metric: 'Net Margin', last: '6.2%', current: '8.7%', change: '+2.5pts', positive: true },
  { metric: 'Jobs Completed', last: '6', current: '5 (YTD)', change: 'On pace', positive: true },
]

const overheadItems: OverheadItem[] = [
  { category: 'Office Staff', monthly: '$12,000', annual: '$144,000' },
  { category: 'Rent', monthly: '$4,200', annual: '$50,400' },
  { category: 'Insurance', monthly: '$3,800', annual: '$45,600' },
  { category: 'Marketing', monthly: '$2,800', annual: '$33,600' },
  { category: 'Vehicles', monthly: '$2,500', annual: '$30,000' },
  { category: 'Other', monthly: '$2,000', annual: '$24,000' },
  { category: 'Software', monthly: '$1,200', annual: '$14,400' },
]

const capacityPeople: CapacityPerson[] = [
  { name: 'Mike Torres', role: 'Project Manager', currentJobs: 2, maxJobs: 4 },
  { name: 'Sarah Kim', role: 'Project Manager', currentJobs: 2, maxJobs: 4 },
  { name: 'Dave Ross', role: 'Superintendent', currentJobs: 4, maxJobs: 6 },
]

const jobTimeline = [
  { name: 'Henderson Residence', start: 0, duration: 60, status: 'active' as const },
  { name: 'Chen Waterfront', start: 10, duration: 75, status: 'active' as const },
  { name: 'Smith Remodel', start: 20, duration: 45, status: 'active' as const },
  { name: 'Davis Coastal', start: 25, duration: 55, status: 'active' as const },
  { name: 'Johnson Beach', start: 55, duration: 65, status: 'upcoming' as const },
  { name: 'Martinez Pool', start: 60, duration: 40, status: 'upcoming' as const },
]

const cashFlowWeeks: CashFlowWeek[] = [
  { week: 'Feb 24', moneyIn: 85000, moneyOut: 72000, net: 13000 },
  { week: 'Mar 3', moneyIn: 45000, moneyOut: 68000, net: -23000 },
  { week: 'Mar 10', moneyIn: 30000, moneyOut: 65000, net: -35000, alert: true },
  { week: 'Mar 17', moneyIn: 25000, moneyOut: 71000, net: -46000, alert: true },
  { week: 'Mar 24', moneyIn: 120000, moneyOut: 58000, net: 62000 },
  { week: 'Mar 31', moneyIn: 90000, moneyOut: 55000, net: 35000 },
  { week: 'Apr 7', moneyIn: 75000, moneyOut: 62000, net: 13000 },
  { week: 'Apr 14', moneyIn: 95000, moneyOut: 60000, net: 35000 },
]

const kpiCards: KPICard[] = [
  {
    label: 'Revenue Target',
    target: '$3.0M',
    current: '$2.4M',
    progress: 80,
    status: 'on-track',
    statusLabel: 'On Track',
    statusColor: 'text-emerald-700',
    icon: DollarSign,
  },
  {
    label: 'Margin Target',
    target: '18%',
    current: '14.8%',
    progress: 82,
    status: 'behind',
    statusLabel: 'Behind',
    statusColor: 'text-amber-700',
    icon: TrendingUp,
  },
  {
    label: 'Jobs Completed',
    target: '8',
    current: '5',
    progress: 63,
    status: 'on-track',
    statusLabel: 'On Track',
    statusColor: 'text-emerald-700',
    icon: Briefcase,
  },
  {
    label: 'Client Satisfaction',
    target: '4.5/5',
    current: '4.3/5',
    progress: 86,
    status: 'at-risk',
    statusLabel: 'At Risk',
    statusColor: 'text-amber-700',
    icon: Users,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

// ── Component ──────────────────────────────────────────────────────────

export function BusinessManagementPreview(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Building2 className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Business Management</h1>
            <p className="text-sm text-slate-300">
              Company P&amp;L, overhead analysis, capacity planning, and strategic growth tools
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Annual Revenue', value: '$2.4M' },
            { label: 'Net Margin', value: '14.8%' },
            { label: 'Active Jobs', value: '6' },
            { label: 'Capacity', value: '75%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Company P&L Dashboard ───────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Company P&amp;L Dashboard</h2>
          <span className="text-xs text-stone-500">FY 2025-2026</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* P&L Statement */}
          <div className="lg:col-span-1 bg-stone-50 rounded-lg border border-stone-200 p-4">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Profit &amp; Loss Summary
            </div>
            <div className="space-y-1.5">
              {plItems.map((item, i) =>
                item.separator ? (
                  <div key={i} className="border-t border-stone-300 my-1" />
                ) : (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between text-xs',
                      item.bold && 'font-semibold',
                      item.indent && 'pl-4'
                    )}
                  >
                    <span className="text-stone-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn('font-mono', item.color || 'text-stone-900')}>
                        {item.amount}
                      </span>
                      {item.percentage && (
                        <span className="text-[10px] text-stone-400">{item.percentage}</span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="lg:col-span-1 bg-stone-50 rounded-lg border border-stone-200 p-4">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Monthly Trend (6 months)
            </div>
            <div className="flex items-end gap-2 h-32">
              {monthlyTrend.map((m) => {
                const maxRev = 450
                const heightPct = (m.revenue / maxRev) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '100px' }}>
                      <div
                        className="w-full bg-amber-400 rounded-t relative"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t"
                          style={{ height: `${(m.profit / m.revenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500">{m.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-amber-400 rounded" />
                <span className="text-[10px] text-stone-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-emerald-500 rounded" />
                <span className="text-[10px] text-stone-500">Profit</span>
              </div>
            </div>
          </div>

          {/* Year-over-Year */}
          <div className="lg:col-span-1 bg-stone-50 rounded-lg border border-stone-200 p-4">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Year-over-Year
            </div>
            <div className="space-y-2">
              {yoyComparison.map((item) => (
                <div key={item.metric} className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 w-24">{item.metric}</span>
                  <span className="text-stone-400 font-mono text-[11px]">{item.last}</span>
                  <ArrowRight className="h-3 w-3 text-stone-300" />
                  <span className="text-stone-900 font-mono text-[11px] font-medium">{item.current}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      item.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Overhead Rate Calculator ────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Overhead Rate Calculator</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Breakdown table */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Category</th>
                    <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-500">Monthly</th>
                    <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-500">Annual</th>
                    <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-500">% of Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {overheadItems.map((item) => {
                    const annual = parseInt(item.annual.replace(/[$,]/g, ''))
                    const pct = ((annual / 2400000) * 100).toFixed(1)
                    return (
                      <tr key={item.category} className="hover:bg-stone-50">
                        <td className="py-2 px-3 text-stone-900">{item.category}</td>
                        <td className="py-2 px-3 text-right font-mono text-stone-600">{item.monthly}</td>
                        <td className="py-2 px-3 text-right font-mono text-stone-600">{item.annual}</td>
                        <td className="py-2 px-3 text-right text-stone-500">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-300 font-semibold">
                    <td className="py-2 px-3 text-stone-900">Total Overhead</td>
                    <td className="py-2 px-3 text-right font-mono text-stone-900">$28,500</td>
                    <td className="py-2 px-3 text-right font-mono text-stone-900">$342,000</td>
                    <td className="py-2 px-3 text-right text-stone-900">14.25%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Industry comparison */}
          <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-3">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Industry Comparison
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Your Rate</span>
                  <span className="font-semibold text-stone-900">14.25%</span>
                </div>
                <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '59%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Industry Low</span>
                  <span className="font-medium text-emerald-600">12%</span>
                </div>
                <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-600">Industry High</span>
                  <span className="font-medium text-stone-500">18%</span>
                </div>
                <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 rounded border border-emerald-200 p-2">
              <p className="text-[10px] text-emerald-700">
                Your overhead rate is within the healthy range (12-18%) for residential construction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Capacity Planner ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Capacity Planner</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Team capacity */}
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Team Capacity
            </div>
            {capacityPeople.map((person) => {
              const pct = (person.currentJobs / person.maxJobs) * 100
              return (
                <div key={person.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-stone-900">{person.name}</span>
                      <span className="text-stone-500 ml-1">({person.role})</span>
                    </div>
                    <span className="text-stone-600">{person.currentJobs}/{person.maxJobs} jobs</span>
                  </div>
                  <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        pct < 60 && 'bg-emerald-500',
                        pct >= 60 && pct < 85 && 'bg-amber-500',
                        pct >= 85 && 'bg-red-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-3 mt-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Capacity Summary</span>
              </div>
              <p className="text-xs text-amber-700">
                Current: 4 active + 2 starting in 60 days = 6 jobs. Max capacity: 6-8 jobs.
                <span className="font-semibold"> You have room for 0-2 more starts in Q2.</span>
              </p>
            </div>
          </div>

          {/* Job overlap timeline */}
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Job Timeline (120-day view)
            </div>
            <div className="space-y-1.5">
              {jobTimeline.map((job) => {
                const totalDays = 120
                const leftPct = (job.start / totalDays) * 100
                const widthPct = Math.min((job.duration / totalDays) * 100, 100 - leftPct)
                return (
                  <div key={job.name} className="flex items-center gap-2">
                    <div className="w-28 text-xs text-stone-700 font-medium truncate">{job.name}</div>
                    <div className="flex-1 h-5 bg-stone-100 rounded relative">
                      <div
                        className={cn(
                          'absolute top-0 h-full rounded text-[9px] flex items-center justify-center text-white font-medium overflow-hidden',
                          job.status === 'active' ? 'bg-amber-500' : 'bg-stone-400'
                        )}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        {widthPct > 15 && `${job.duration}d`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-amber-500 rounded" />
                <span className="text-[10px] text-stone-500">Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-stone-400 rounded" />
                <span className="text-[10px] text-stone-500">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Break-Even Analysis ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Break-Even Analysis</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Key numbers */}
          <div className="space-y-3">
            <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-1">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Break-Even Point</div>
              <div className="text-xl font-bold text-stone-900">$2.1M</div>
              <p className="text-[10px] text-stone-500">Fixed overhead + minimum margin requirement</p>
            </div>
            <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-1">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Contracted</div>
              <div className="text-xl font-bold text-emerald-700">$1.8M</div>
              <p className="text-[10px] text-stone-500">Signed contracts in progress</p>
            </div>
            <div className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-1">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Pipeline (60% prob.)</div>
              <div className="text-xl font-bold text-amber-700">$360K</div>
              <p className="text-[10px] text-stone-500">$600K pipeline x 60% probability</p>
            </div>
          </div>

          {/* Visual break-even chart */}
          <div className="lg:col-span-2 bg-stone-50 rounded-lg border border-stone-200 p-4">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Revenue vs Break-Even
            </div>
            <div className="relative h-40">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-stone-400 font-mono">
                <span>$3M</span>
                <span>$2M</span>
                <span>$1M</span>
                <span>$0</span>
              </div>
              {/* Chart area */}
              <div className="ml-14 h-full relative">
                {/* Break-even line */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-red-400"
                  style={{ top: '30%' }}
                >
                  <span className="absolute -top-4 right-0 text-[10px] font-medium text-red-500">Break-Even $2.1M</span>
                </div>
                {/* Bars */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-4 h-full px-4">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-emerald-400 rounded-t" style={{ height: '60%' }} />
                    <span className="text-[10px] text-stone-500">Contracted</span>
                    <span className="text-[10px] font-medium text-stone-700">$1.8M</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t overflow-hidden" style={{ height: '72%' }}>
                      <div className="h-[83%] bg-emerald-400" />
                      <div className="h-[17%] bg-amber-400 bg-stripes" />
                    </div>
                    <span className="text-[10px] text-stone-500">Expected</span>
                    <span className="text-[10px] font-medium text-stone-700">$2.16M</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-stone-300 rounded-t" style={{ height: '80%' }} />
                    <span className="text-[10px] text-stone-500">Pipeline</span>
                    <span className="text-[10px] font-medium text-stone-700">$2.4M</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 bg-amber-50 rounded border border-amber-200 p-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium">
                  BARELY above break-even. Expected revenue of $2.16M exceeds break-even by only $60K (2.9% buffer).
                  Close pipeline deals to build a stronger margin of safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 6: Cash Flow Forecast (90-Day) ─────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Cash Flow Forecast (90-Day)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Week</th>
                <th scope="col" className="text-right py-2 px-3 font-semibold text-emerald-600">Money In</th>
                <th scope="col" className="text-right py-2 px-3 font-semibold text-red-600">Money Out</th>
                <th scope="col" className="text-right py-2 px-3 font-semibold text-stone-500">Net</th>
                <th scope="col" className="text-left py-2 px-3 font-semibold text-stone-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {cashFlowWeeks.map((week) => (
                <tr
                  key={week.week}
                  className={cn('hover:bg-stone-50', week.alert && 'bg-red-50')}
                >
                  <td className="py-2 px-3 text-stone-900 font-medium">{week.week}</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700">
                    {formatCurrency(week.moneyIn)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-red-600">
                    {formatCurrency(week.moneyOut)}
                  </td>
                  <td className={cn(
                    'py-2 px-3 text-right font-mono font-medium',
                    week.net >= 0 ? 'text-emerald-700' : 'text-red-700'
                  )}>
                    {week.net >= 0 ? '+' : ''}{formatCurrency(week.net)}
                  </td>
                  <td className="py-2 px-3">
                    {week.alert ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Cash Tight
                      </span>
                    ) : week.net >= 0 ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-2.5 w-2.5" />
                        OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                        <Minus className="h-2.5 w-2.5" />
                        Watch
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual bars */}
        <div className="bg-stone-50 rounded-lg border border-stone-200 p-4">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Cash Flow Visualization
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {cashFlowWeeks.map((week) => {
              const maxAbs = 80000
              const inH = Math.min((week.moneyIn / maxAbs) * 100, 100)
              const outH = Math.min((week.moneyOut / maxAbs) * 100, 100)
              return (
                <div key={week.week} className="flex-1 flex gap-0.5 items-end h-full">
                  <div
                    className="flex-1 bg-emerald-400 rounded-t"
                    style={{ height: `${inH}%` }}
                  />
                  <div
                    className="flex-1 bg-red-400 rounded-t"
                    style={{ height: `${outH}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-1">
            {cashFlowWeeks.map((week) => (
              <span key={week.week} className="text-[8px] text-stone-400 flex-1 text-center">
                {week.week}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-emerald-400 rounded" />
              <span className="text-[10px] text-stone-500">In (draws, payments)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 bg-red-400 rounded" />
              <span className="text-[10px] text-stone-500">Out (payables, payroll, overhead)</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs text-red-700 font-medium">
              Cash gets tight week of March 10-17. Consider accelerating a draw request or deferring non-critical payments.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 7: Goal & KPI Dashboard ────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Goal &amp; KPI Dashboard</h2>
          <span className="text-xs text-stone-500">2026 Annual Goals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="bg-stone-50 rounded-lg border border-stone-200 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 bg-white rounded border border-stone-200">
                    <Icon className="h-4 w-4 text-stone-600" />
                  </div>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      kpi.status === 'on-track' && 'bg-emerald-100 text-emerald-700',
                      kpi.status === 'behind' && 'bg-amber-100 text-amber-700',
                      kpi.status === 'at-risk' && 'bg-amber-100 text-amber-700'
                    )}
                  >
                    {kpi.statusLabel}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-stone-500">{kpi.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-stone-900">{kpi.current}</span>
                    <span className="text-xs text-stone-400">/ {kpi.target}</span>
                  </div>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      kpi.status === 'on-track' && 'bg-emerald-500',
                      kpi.status === 'behind' && 'bg-amber-500',
                      kpi.status === 'at-risk' && 'bg-amber-500'
                    )}
                    style={{ width: `${kpi.progress}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400 text-right">{kpi.progress}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Business Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          Revenue is up 26% year-over-year but net margin at 8.7% is below your 18% target. Overhead rate (14.25%)
          is healthy but office staff costs ($12K/mo) are the largest line item — consider whether your next hire
          should be revenue-generating. Cash flow turns negative weeks of March 10-17. Accelerate the Henderson
          draw ($85K) to bridge the gap. You have capacity for 0-2 more job starts in Q2.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="Business Management AI Features"
        columns={2}
        features={[
          {
            feature: 'Revenue Forecasting',
            insight: 'Projects annual revenue based on contracted work, pipeline probability, and historical close rates. Current forecast: $2.4M.',
            confidence: 88,
            severity: 'success',
          },
          {
            feature: 'Overhead Optimization',
            insight: 'Analyzes overhead categories against industry benchmarks and suggests cost reduction opportunities. Your rate: 14.25% (within range).',
            severity: 'info',
          },
          {
            feature: 'Capacity Planning AI',
            insight: 'Models team workload, job overlap, and hiring impact. Current utilization: 75%. Adding 1 PM would increase capacity by 33%.',
            confidence: 91,
            severity: 'success',
          },
          {
            feature: 'Cash Flow Prediction',
            insight: 'Forecasts cash position 90 days out using draw schedules, payables, and payroll. Alert: negative cash flow predicted March 10-17.',
            confidence: 94,
            severity: 'warning',
          },
          {
            feature: 'Break-Even Analysis',
            insight: 'Continuously calculates break-even point vs contracted and expected revenue. Current buffer: $60K (2.9%) — thin margin.',
            confidence: 96,
            severity: 'warning',
          },
          {
            feature: 'Margin Improvement Suggestions',
            insight: 'Identifies highest-margin job types, underperforming cost codes, and pricing adjustments to improve net margin toward 18% target.',
            severity: 'info',
          },
        ]}
      />
    </div>
  )
}
