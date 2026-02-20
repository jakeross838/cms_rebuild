'use client'

import { useState } from 'react'
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
  ChevronDown,
  FileText,
  Lock,
  RefreshCw,
  Settings,
  CheckCircle,
  Receipt,
  Banknote,
  Filter,
  MessageSquare,
  Users,
  ClipboardCheck,
  Cloud,
  Sun,
  CloudRain,
  Phone,
  Mail,
  Bell,
  Send,
  Eye,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState } from '@/hooks/use-filter-state'
import { AIFeaturesPanel, type AIFeatureCardProps } from '@/components/skeleton/ui'

// ── Types ───────────────────────────────────────────────────────

interface SummaryCard {
  id: string
  label: string
  value: number
  change: number
  changeLabel: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
  color: 'blue' | 'green' | 'amber' | 'purple'
  sparklineData?: number[]
}

interface PaymentDue {
  id: string
  vendor: string
  job: string
  amount: number
  dueDate: string
  daysUntilDue: number
  type: 'bill' | 'payroll' | 'subcontractor'
  lienWaiverRequired: boolean
  earlyPayDiscount?: string
}

interface OverdueReceivable {
  id: string
  client: string
  job: string
  amount: number
  invoiceDate: string
  daysOverdue: number
  lastContact?: string
  drawNumber?: number
  retainageAmount?: number
}

interface JobProfitability {
  id: string
  name: string
  pm: string
  contractAmount: number
  changeOrders: number
  revisedContract: number
  costToDate: number
  committedCost: number
  projectedCost: number
  projectedMargin: number
  percentComplete: number
  status: 'on-track' | 'at-risk' | 'over-budget'
  overheadAllocation: number
  netProfit: number
}

interface KPIWidget {
  id: string
  label: string
  value: string
  subLabel: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
  sparklineData?: number[]
  changePercent?: number
  changeDirection?: 'up' | 'down'
}

interface OutstandingDraw {
  id: string
  job: string
  drawNumber: number
  amount: number
  status: 'draft' | 'review' | 'approved' | 'submitted'
  daysInStatus: number
}

interface PendingApproval {
  type: 'invoice' | 'change-order' | 'po' | 'draw'
  count: number
  label: string
  color: string
}

interface ActivityItem {
  id: string
  type: 'payment-received' | 'invoice-sent' | 'po-approved' | 'draw-submitted'
  description: string
  amount: number
  timestamp: string
  job?: string
}

interface VendorFollowUp {
  id: string
  vendor: string
  reason: string
  daysWaiting: number
  job?: string
}

interface ClientMessage {
  id: string
  client: string
  subject: string
  daysAging: number
  job?: string
}

interface UpcomingInspection {
  id: string
  job: string
  permitRef: string
  inspectorName?: string
  date: string
  status: 'scheduled' | 'pending-confirmation'
}

interface WeatherInfo {
  jobSite: string
  temperature: number
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  outdoorRisk: 'low' | 'medium' | 'high'
}

type DateRangePreset = 'last-7-days' | 'last-30-days' | 'mtd' | 'qtd' | 'ytd' | 'custom'

// ── Data ────────────────────────────────────────────────────────

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
    sparklineData: [420, 445, 438, 460, 472, 485, 487.5],
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
    sparklineData: [380, 365, 352, 340, 335, 328, 324.8],
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
    sparklineData: [120, 128, 135, 142, 148, 152, 156.2],
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
    sparklineData: [580, 595, 610, 625, 640, 648, 655.1],
  },
]

const secondaryKPIs: KPIWidget[] = [
  { id: '1', label: 'Active Contract Value', value: '$8.4M', subLabel: '5 active jobs', icon: FileText, color: 'blue', sparklineData: [7.8, 7.9, 8.1, 8.2, 8.3, 8.35, 8.4], changePercent: 2.4, changeDirection: 'up' },
  { id: '2', label: 'Revenue MTD', value: '$485K', subLabel: 'Feb 2026', icon: DollarSign, color: 'green', sparklineData: [65, 120, 180, 260, 340, 420, 485], changePercent: 8.1, changeDirection: 'up' },
  { id: '3', label: 'Revenue YTD', value: '$2.1M', subLabel: '$2.3M target', icon: BarChart3, color: 'purple', sparklineData: [1.5, 1.6, 1.75, 1.85, 1.95, 2.0, 2.1], changePercent: 5.0, changeDirection: 'up' },
  { id: '4', label: 'Outstanding Draws', value: '3', subLabel: '$310K pending', icon: Receipt, color: 'amber', sparklineData: [5, 4, 4, 3, 3, 3, 3], changePercent: -25, changeDirection: 'down' },
  { id: '5', label: 'Pending Invoices', value: '7', subLabel: '$89K to approve', icon: Banknote, color: 'red', sparklineData: [4, 5, 6, 5, 6, 7, 7], changePercent: 16.7, changeDirection: 'up' },
  { id: '6', label: 'Avg Profit Margin', value: '14.8%', subLabel: 'Target: 18%', icon: TrendingUp, color: 'amber', sparklineData: [13.2, 13.8, 14.1, 14.4, 14.5, 14.6, 14.8], changePercent: 1.4, changeDirection: 'up' },
]

const outstandingDraws: OutstandingDraw[] = [
  { id: '1', job: 'Smith Residence', drawNumber: 6, amount: 125000, status: 'draft', daysInStatus: 3 },
  { id: '2', job: 'Johnson Beach House', drawNumber: 3, amount: 60000, status: 'submitted', daysInStatus: 5 },
  { id: '3', job: 'Davis Coastal Home', drawNumber: 9, amount: 125000, status: 'review', daysInStatus: 2 },
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
    lienWaiverRequired: true,
    earlyPayDiscount: '2% if paid by Feb 13',
  },
  {
    id: '2',
    vendor: 'Jones Plumbing',
    job: 'Johnson Beach House',
    amount: 18200,
    dueDate: 'Feb 18, 2026',
    daysUntilDue: 6,
    type: 'subcontractor',
    lienWaiverRequired: true,
  },
  {
    id: '3',
    vendor: 'Bi-weekly Payroll',
    job: 'All Jobs',
    amount: 42000,
    dueDate: 'Feb 14, 2026',
    daysUntilDue: 2,
    type: 'payroll',
    lienWaiverRequired: false,
  },
  {
    id: '4',
    vendor: 'PGT Windows',
    job: 'Miller Addition',
    amount: 34500,
    dueDate: 'Feb 20, 2026',
    daysUntilDue: 8,
    type: 'bill',
    lienWaiverRequired: true,
  },
  {
    id: '5',
    vendor: 'Cool Air HVAC',
    job: 'Smith Residence',
    amount: 22800,
    dueDate: 'Feb 22, 2026',
    daysUntilDue: 10,
    type: 'subcontractor',
    lienWaiverRequired: true,
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
    drawNumber: 4,
    retainageAmount: 4500,
  },
  {
    id: '2',
    client: 'Davis Family Trust',
    job: 'Davis Coastal Home',
    amount: 32500,
    invoiceDate: 'Jan 25, 2026',
    daysOverdue: 18,
    lastContact: 'Feb 8',
    drawNumber: 8,
    retainageAmount: 3250,
  },
  {
    id: '3',
    client: 'Thompson Builders',
    job: 'Thompson Renovation',
    amount: 18750,
    invoiceDate: 'Feb 1, 2026',
    daysOverdue: 11,
    drawNumber: 6,
    retainageAmount: 1875,
  },
]

const jobProfitability: JobProfitability[] = [
  {
    id: '1',
    name: 'Smith Residence',
    pm: 'Mike Torres',
    contractAmount: 2400000,
    changeOrders: 150000,
    revisedContract: 2550000,
    costToDate: 1420000,
    committedCost: 245000,
    projectedCost: 2180000,
    projectedMargin: 14.5,
    percentComplete: 65,
    status: 'at-risk',
    overheadAllocation: 218000,
    netProfit: 152000,
  },
  {
    id: '2',
    name: 'Johnson Beach House',
    pm: 'Sarah Chen',
    contractAmount: 845000,
    changeOrders: 45000,
    revisedContract: 890000,
    costToDate: 312000,
    committedCost: 120000,
    projectedCost: 756500,
    projectedMargin: 15.0,
    percentComplete: 35,
    status: 'on-track',
    overheadAllocation: 75650,
    netProfit: 57850,
  },
  {
    id: '3',
    name: 'Miller Addition',
    pm: 'Mike Torres',
    contractAmount: 425000,
    changeOrders: 0,
    revisedContract: 425000,
    costToDate: 285000,
    committedCost: 42000,
    projectedCost: 382500,
    projectedMargin: 10.0,
    percentComplete: 75,
    status: 'at-risk',
    overheadAllocation: 38250,
    netProfit: 4250,
  },
  {
    id: '4',
    name: 'Davis Coastal Home',
    pm: 'Sarah Chen',
    contractAmount: 1750000,
    changeOrders: 100000,
    revisedContract: 1850000,
    costToDate: 1620000,
    committedCost: 85000,
    projectedCost: 1720000,
    projectedMargin: 7.0,
    percentComplete: 92,
    status: 'over-budget',
    overheadAllocation: 172000,
    netProfit: -42000,
  },
  {
    id: '5',
    name: 'Williams Remodel',
    pm: 'Mike Torres',
    contractAmount: 450000,
    changeOrders: 25000,
    revisedContract: 475000,
    costToDate: 290000,
    committedCost: 35000,
    projectedCost: 381000,
    projectedMargin: 19.8,
    percentComplete: 76,
    status: 'on-track',
    overheadAllocation: 38100,
    netProfit: 55900,
  },
]

const pendingApprovals: PendingApproval[] = [
  { type: 'invoice', count: 3, label: 'Invoices', color: 'bg-stone-100 text-stone-700' },
  { type: 'change-order', count: 2, label: 'Change Orders', color: 'bg-amber-100 text-amber-700' },
  { type: 'po', count: 5, label: 'POs', color: 'bg-warm-100 text-warm-700' },
  { type: 'draw', count: 1, label: 'Draws', color: 'bg-green-100 text-green-700' },
]

const recentActivities: ActivityItem[] = [
  { id: '1', type: 'payment-received', description: 'Payment received from Davis Family Trust', amount: 32500, timestamp: '10 min ago', job: 'Davis Coastal Home' },
  { id: '2', type: 'invoice-sent', description: 'Invoice #1024 sent to Wilson Custom Homes', amount: 45000, timestamp: '25 min ago', job: 'Wilson Custom' },
  { id: '3', type: 'po-approved', description: 'PO #892 approved for ABC Lumber Supply', amount: 28500, timestamp: '1 hour ago', job: 'Smith Residence' },
  { id: '4', type: 'draw-submitted', description: 'Draw #3 submitted for review', amount: 60000, timestamp: '2 hours ago', job: 'Johnson Beach House' },
  { id: '5', type: 'payment-received', description: 'Payment received from Thompson Builders', amount: 18750, timestamp: '3 hours ago', job: 'Thompson Renovation' },
  { id: '6', type: 'po-approved', description: 'PO #893 approved for Cool Air HVAC', amount: 22800, timestamp: '4 hours ago', job: 'Smith Residence' },
  { id: '7', type: 'invoice-sent', description: 'Invoice #1025 sent to Miller family', amount: 42500, timestamp: '5 hours ago', job: 'Miller Addition' },
]

const vendorFollowUps: VendorFollowUp[] = [
  { id: '1', vendor: 'ABC Lumber Supply', reason: 'Invoice overdue', daysWaiting: 12, job: 'Smith Residence' },
  { id: '2', vendor: 'Florida Electric Co', reason: 'PO confirmation needed', daysWaiting: 5, job: 'Johnson Beach House' },
  { id: '3', vendor: 'Gulf Coast Windows', reason: 'Payment terms expiring', daysWaiting: 3, job: 'Davis Coastal Home' },
  { id: '4', vendor: 'Jones Plumbing', reason: 'Lien waiver pending', daysWaiting: 8, job: 'Miller Addition' },
]

const clientMessages: ClientMessage[] = [
  { id: '1', client: 'Wilson Custom Homes', subject: 'Re: Invoice #1024 payment schedule', daysAging: 5, job: 'Wilson Custom' },
  { id: '2', client: 'Davis Family Trust', subject: 'Draw #9 documentation request', daysAging: 2, job: 'Davis Coastal Home' },
  { id: '3', client: 'Thompson Builders', subject: 'Change order approval needed', daysAging: 3, job: 'Thompson Renovation' },
]

const upcomingInspections: UpcomingInspection[] = [
  { id: '1', job: 'Smith Residence', permitRef: 'BLD-2026-0142', inspectorName: 'Tom Martinez', date: 'Feb 14, 9:00 AM', status: 'scheduled' },
  { id: '2', job: 'Johnson Beach House', permitRef: 'BLD-2026-0156', date: 'Feb 15, 2:00 PM', status: 'pending-confirmation' },
  { id: '3', job: 'Miller Addition', permitRef: 'BLD-2026-0148', inspectorName: 'Sarah Lee', date: 'Feb 17, 10:30 AM', status: 'scheduled' },
  { id: '4', job: 'Davis Coastal Home', permitRef: 'BLD-2026-0161', date: 'Feb 18, 11:00 AM', status: 'pending-confirmation' },
]

const weatherData: WeatherInfo[] = [
  { jobSite: 'Smith Residence', temperature: 72, conditions: 'sunny', outdoorRisk: 'low' },
  { jobSite: 'Johnson Beach House', temperature: 68, conditions: 'cloudy', outdoorRisk: 'low' },
  { jobSite: 'Davis Coastal Home', temperature: 65, conditions: 'rainy', outdoorRisk: 'high' },
]

const aiFeatures: AIFeatureCardProps[] = [
  {
    feature: 'Cash Flow Alert',
    trigger: 'real-time',
    insight: 'Payables due next week: $45,200. AR expected: $28,000. May need to delay 2 vendor payments.',
    severity: 'warning',
    confidence: 88,
    action: { label: 'View Details', onClick: () => {} },
  },
  {
    feature: 'Collection Recommendations',
    trigger: 'daily',
    insight: 'Smith Residence 45 days overdue ($12,400). Suggest: Call this week, sent 2 emails with no response.',
    severity: 'warning',
    confidence: 82,
    action: { label: 'Create Task', onClick: () => {} },
  },
  {
    feature: 'Profitability Insights',
    trigger: 'real-time',
    insight: 'Harbor View trending 3% below target margin. Labor costs 12% over budget on framing phase.',
    severity: 'critical',
    confidence: 91,
    action: { label: 'Analyze', onClick: () => {} },
  },
  {
    feature: 'Inspection Pass Probability',
    trigger: 'on-submission',
    insight: 'Electrical rough-in inspection tomorrow: 85% pass probability based on similar jobs.',
    severity: 'success',
    confidence: 85,
    action: { label: 'View Checklist', onClick: () => {} },
  },
  {
    feature: 'Priority Queue Ranking',
    trigger: 'daily',
    insight: 'Top 3 actions: 1) Collect Smith $12,400, 2) Submit Draw #4 Johnson, 3) Approve ABC Electric PO',
    severity: 'info',
    confidence: 94,
    action: { label: 'Start Queue', onClick: () => {} },
  },
  {
    feature: 'Overnight Summary',
    trigger: 'daily',
    insight: 'Since yesterday: 2 payments received ($18,400), 1 CO approved, Draw #3 Harbor View funded',
    severity: 'success',
    confidence: 100,
  },
]

const dateRangePresets: { key: DateRangePreset; label: string }[] = [
  { key: 'last-7-days', label: 'Last 7 Days' },
  { key: 'last-30-days', label: 'Last 30 Days' },
  { key: 'mtd', label: 'MTD' },
  { key: 'qtd', label: 'QTD' },
  { key: 'ytd', label: 'YTD' },
  { key: 'custom', label: 'Custom' },
]

// ── Utilities ───────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

const cardColorClasses = {
  blue: {
    bg: 'bg-stone-50',
    icon: 'bg-stone-100 text-stone-600',
    text: 'text-stone-600',
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
    bg: 'bg-warm-50',
    icon: 'bg-warm-100 text-stone-600',
    text: 'text-stone-600',
  },
}

// ── Sparkline Component ─────────────────────────────────────────

function Sparkline({ data, color = 'blue', width = 60, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const colorMap: Record<string, string> = {
    blue: 'stroke-stone-500',
    green: 'stroke-green-500',
    amber: 'stroke-amber-500',
    purple: 'stroke-purple-500',
    red: 'stroke-red-500',
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        className={cn('stroke-[1.5]', colorMap[color] || 'stroke-stone-500')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Summary Card Component ──────────────────────────────────────

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
      <div className="text-2xl font-bold text-warm-900">{formatCurrency(card.value)}</div>
      <div className="text-sm text-warm-500 mt-1">{card.label}</div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-xs text-warm-400">{card.changeLabel}</div>
        {card.sparklineData && (
          <Sparkline data={card.sparklineData} color={card.color} width={50} height={16} />
        )}
      </div>
    </div>
  )
}

// ── Chart Placeholder ───────────────────────────────────────────

function ChartPlaceholder({ title, icon: Icon, height = "h-48" }: { title: string; icon: React.ElementType; height?: string }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-warm-900 text-sm">{title}</h4>
        <Icon className="h-4 w-4 text-warm-400" />
      </div>
      <div className={cn("bg-warm-50 rounded-lg flex items-center justify-center", height)}>
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
              <div
                key={i}
                className="w-4 bg-gradient-to-t from-stone-500 to-stone-300 rounded-t"
                style={{ height: `${h}%`, maxHeight: '120px' }}
              />
            ))}
          </div>
          <span className="text-xs text-warm-400">Chart visualization</span>
        </div>
      </div>
    </div>
  )
}

// ── Secondary KPI Row ───────────────────────────────────────────

function SecondaryKPIRow({ widgets }: { widgets: KPIWidget[] }) {
  const colorMap: Record<string, string> = {
    blue: 'text-stone-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    purple: 'text-stone-600',
    gray: 'text-warm-600',
  }

  return (
    <div className="grid grid-cols-6 gap-3">
      {widgets.map(w => {
        const Icon = w.icon
        return (
          <div key={w.id} className="bg-white rounded-lg border border-warm-200 p-3 hover:shadow-sm cursor-pointer transition-shadow">
            <div className={cn("flex items-center gap-1.5 text-xs mb-1", colorMap[w.color])}>
              <Icon className="h-3.5 w-3.5" />
              {w.label}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-warm-900">{w.value}</div>
              {w.sparklineData && (
                <Sparkline data={w.sparklineData} color={w.color} width={40} height={14} />
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <div className="text-xs text-warm-500">{w.subLabel}</div>
              {w.changePercent !== undefined && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-medium",
                  w.changeDirection === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {w.changeDirection === 'up' ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {w.changePercent > 0 ? '+' : ''}{w.changePercent}%
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Outstanding Draws List ──────────────────────────────────────

function OutstandingDrawsList({ draws }: { draws: OutstandingDraw[] }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-warm-100 text-warm-700',
    review: 'bg-stone-100 text-stone-700',
    approved: 'bg-green-100 text-green-700',
    submitted: 'bg-warm-100 text-warm-700',
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-warm-900 text-sm">Outstanding Draws</h4>
          <span className="text-xs text-warm-500">{formatCurrency(draws.reduce((s, d) => s + d.amount, 0))} pending</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {draws.map(draw => (
          <div key={draw.id} className="px-4 py-2.5 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-warm-900">{draw.job}</span>
                <span className="text-xs text-warm-500 ml-2">Draw #{draw.drawNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded font-medium", statusColors[draw.status])}>
                  {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                </span>
                <span className="text-sm font-semibold text-warm-900">{formatCurrency(draw.amount)}</span>
              </div>
            </div>
            <div className="text-xs text-warm-400 mt-0.5">{draw.daysInStatus} days in status</div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all draws
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Payments List ───────────────────────────────────────────────

function PaymentsList({ payments }: { payments: PaymentDue[] }) {
  const getTypeIcon = (type: PaymentDue['type']) => {
    switch (type) {
      case 'payroll': return CreditCard
      case 'subcontractor': return Building2
      default: return DollarSign
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-warm-900 text-sm">Upcoming Payments</h4>
          <span className="text-xs text-warm-500">{payments.length} due soon | {formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {payments.map(payment => {
          const Icon = getTypeIcon(payment.type)
          return (
            <div key={payment.id} className="px-4 py-3 hover:bg-warm-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    payment.daysUntilDue <= 3 ? "bg-red-100" : "bg-warm-100"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      payment.daysUntilDue <= 3 ? "text-red-600" : "text-warm-600"
                    )} />
                  </div>
                  <div>
                    <div className="font-medium text-warm-900 text-sm">{payment.vendor}</div>
                    <div className="text-xs text-warm-500">{payment.job}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {payment.lienWaiverRequired && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Lien waiver req</span>
                      )}
                      {payment.earlyPayDiscount && (
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{payment.earlyPayDiscount}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-warm-900 text-sm">{formatCurrency(payment.amount)}</div>
                  <div className={cn(
                    "text-xs flex items-center gap-1 justify-end",
                    payment.daysUntilDue <= 3 ? "text-red-600" : "text-warm-500"
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
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all payments
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Overdue List ────────────────────────────────────────────────

function OverdueList({ receivables }: { receivables: OverdueReceivable[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-warm-900 text-sm">Overdue Receivables</h4>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-xs font-medium text-red-600">
            {formatCurrency(receivables.reduce((sum, r) => sum + r.amount, 0))} total
          </span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {receivables.map(receivable => (
          <div key={receivable.id} className="px-4 py-3 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-warm-900 text-sm">{receivable.client}</div>
                <div className="text-xs text-warm-500">
                  {receivable.job}
                  {receivable.drawNumber && <span> - Draw #{receivable.drawNumber}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-warm-900 text-sm">{formatCurrency(receivable.amount)}</div>
                <div className={cn(
                  "text-xs",
                  receivable.daysOverdue > 21 ? "text-red-600" :
                  receivable.daysOverdue > 14 ? "text-amber-600" : "text-warm-500"
                )}>
                  {receivable.daysOverdue} days overdue
                </div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-3">
              {receivable.retainageAmount && (
                <span className="text-xs text-warm-400">Retainage: {formatCurrency(receivable.retainageAmount)}</span>
              )}
              {receivable.lastContact && (
                <span className="text-xs text-warm-400">Last contact: {receivable.lastContact}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all receivables
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Job Profitability Table ─────────────────────────────────────

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
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-warm-900 text-sm">Job Profitability Summary</h4>
          <div className="flex items-center gap-3">
            <span className="text-xs text-warm-500">{jobs.length} active jobs</span>
            <span className="text-xs text-warm-500">
              Total: {formatCurrency(jobs.reduce((s, j) => s + j.revisedContract, 0))}
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-50 border-b border-warm-200">
            <tr>
              <th className="text-left py-2 px-4 font-medium text-warm-600">Job</th>
              <th className="text-left py-2 px-3 font-medium text-warm-600">PM</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">Contract</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">Cost to Date</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">Committed</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">Projected</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">Margin</th>
              <th className="py-2 px-3 font-medium text-warm-600 w-24">Progress</th>
              <th className="py-2 px-3 font-medium text-warm-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {jobs.map(job => (
              <tr key={job.id} className={cn(
                "hover:bg-warm-50 cursor-pointer",
                job.status === 'over-budget' && "bg-red-50/30"
              )}>
                <td className="py-3 px-4">
                  <span className="font-medium text-warm-900">{job.name}</span>
                  {job.changeOrders > 0 && (
                    <div className="text-xs text-warm-400">+{formatCurrency(job.changeOrders)} COs</div>
                  )}
                </td>
                <td className="py-3 px-3 text-sm text-warm-600">{job.pm}</td>
                <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(job.revisedContract)}</td>
                <td className="py-3 px-3 text-right text-warm-600">{formatCurrency(job.costToDate)}</td>
                <td className="py-3 px-3 text-right text-warm-500">{formatCurrency(job.committedCost)}</td>
                <td className="py-3 px-3 text-right font-medium text-warm-900">{formatCurrency(job.projectedCost)}</td>
                <td className={cn(
                  "py-3 px-3 text-right font-semibold",
                  job.projectedMargin >= 15 ? "text-green-600" :
                  job.projectedMargin >= 10 ? "text-amber-600" : "text-red-600"
                )}>
                  {job.projectedMargin.toFixed(1)}%
                </td>
                <td className="py-3 px-3">
                  <div className="w-full bg-warm-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        job.status === 'on-track' ? "bg-green-500" :
                        job.status === 'at-risk' ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${job.percentComplete}%` }}
                    />
                  </div>
                  <div className="text-xs text-warm-500 mt-0.5 text-center">{job.percentComplete}%</div>
                </td>
                <td className="py-3 px-3">{getStatusBadge(job.status)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-warm-50 border-t border-warm-200">
            <tr>
              <td className="py-2 px-4 font-semibold text-warm-700 text-sm" colSpan={2}>Totals</td>
              <td className="py-2 px-3 text-right font-semibold text-warm-700 text-sm">{formatCurrency(jobs.reduce((s, j) => s + j.revisedContract, 0))}</td>
              <td className="py-2 px-3 text-right font-semibold text-warm-700 text-sm">{formatCurrency(jobs.reduce((s, j) => s + j.costToDate, 0))}</td>
              <td className="py-2 px-3 text-right font-semibold text-warm-700 text-sm">{formatCurrency(jobs.reduce((s, j) => s + j.committedCost, 0))}</td>
              <td className="py-2 px-3 text-right font-semibold text-warm-700 text-sm">{formatCurrency(jobs.reduce((s, j) => s + j.projectedCost, 0))}</td>
              <td className="py-2 px-3 text-right font-bold text-sm text-amber-600">
                {(jobs.reduce((s, j) => s + j.projectedMargin, 0) / jobs.length).toFixed(1)}%
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Pending Approvals Bar ───────────────────────────────────────

function PendingApprovalsBar({ approvals }: { approvals: PendingApproval[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const total = approvals.reduce((sum, a) => sum + a.count, 0)

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />
          <h4 className="font-medium text-warm-900 text-sm">Pending Approvals</h4>
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">{total} total</span>
        </div>
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="text-xs text-warm-500 hover:text-warm-700"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {approvals.map(approval => (
          <button
            key={approval.type}
            onClick={() => setActiveFilter(activeFilter === approval.type ? null : approval.type)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              approval.color,
              activeFilter === approval.type && "ring-2 ring-offset-1 ring-stone-500"
            )}
          >
            <span>{approval.label}:</span>
            <span className="font-bold">{approval.count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Real-time Activity Feed ─────────────────────────────────────

function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const [filter, setFilter] = useState<string>('all')

  const activityTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    'payment-received': { icon: DollarSign, color: 'text-green-600 bg-green-100', label: 'Payments' },
    'invoice-sent': { icon: Send, color: 'text-stone-600 bg-stone-100', label: 'Invoices' },
    'po-approved': { icon: CheckCircle, color: 'text-stone-600 bg-warm-100', label: 'POs' },
    'draw-submitted': { icon: FileText, color: 'text-amber-600 bg-amber-100', label: 'Draws' },
  }

  const filteredActivities = filter === 'all'
    ? activities.slice(0, 7)
    : activities.filter(a => a.type === filter).slice(0, 7)

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-stone-500 animate-spin-slow" />
            <h4 className="font-medium text-warm-900 text-sm">Real-time Activity</h4>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-warm-200 rounded px-2 py-1 text-warm-600"
          >
            <option value="all">All</option>
            <option value="payment-received">Payments</option>
            <option value="invoice-sent">Invoices</option>
            <option value="po-approved">POs</option>
            <option value="draw-submitted">Draws</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-warm-100 max-h-64 overflow-y-auto">
        {filteredActivities.map(activity => {
          const config = activityTypeConfig[activity.type]
          const Icon = config.icon
          return (
            <div key={activity.id} className="px-4 py-2.5 hover:bg-warm-50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-lg", config.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-warm-900 truncate">{activity.description}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-warm-700">{formatCurrency(activity.amount)}</span>
                    <span className="text-xs text-warm-400">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all activity
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Vendor Follow-up Queue ──────────────────────────────────────

function VendorFollowUpQueue({ vendors }: { vendors: VendorFollowUp[] }) {
  const getReasonColor = (reason: string) => {
    if (reason.includes('overdue')) return 'text-red-600 bg-red-50'
    if (reason.includes('confirmation')) return 'text-amber-600 bg-amber-50'
    if (reason.includes('expiring')) return 'text-stone-600 bg-warm-50'
    return 'text-warm-600 bg-warm-50'
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-600" />
            <h4 className="font-medium text-warm-900 text-sm">Vendor Follow-up Queue</h4>
          </div>
          <span className="text-xs text-warm-500">{vendors.length} pending</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {vendors.map(vendor => (
          <div key={vendor.id} className="px-4 py-2.5 hover:bg-warm-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-warm-900 text-sm">{vendor.vendor}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", getReasonColor(vendor.reason))}>
                    {vendor.reason}
                  </span>
                  {vendor.job && <span className="text-xs text-warm-400">{vendor.job}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs font-medium",
                  vendor.daysWaiting > 7 ? "text-red-600" : "text-warm-500"
                )}>
                  {vendor.daysWaiting} days
                </span>
                <button className="text-xs bg-stone-600 text-white px-2 py-1 rounded hover:bg-stone-700 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Follow Up
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all vendors
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Client Communication Queue ──────────────────────────────────

function ClientCommunicationQueue({ messages }: { messages: ClientMessage[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-stone-500" />
            <h4 className="font-medium text-warm-900 text-sm">Client Messages Awaiting Response</h4>
          </div>
          <span className="text-xs text-warm-500">{messages.length} pending</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {messages.map(message => (
          <div key={message.id} className="px-4 py-2.5 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-warm-900 text-sm">{message.client}</div>
                <div className="text-xs text-warm-500 truncate mt-0.5">{message.subject}</div>
                {message.job && <div className="text-xs text-warm-400 mt-0.5">{message.job}</div>}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  message.daysAging > 3 ? "bg-red-100 text-red-700" : "bg-warm-100 text-warm-600"
                )}>
                  {message.daysAging} days
                </span>
                <button className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded hover:bg-warm-200 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all messages
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Upcoming Inspections Widget ─────────────────────────────────

function UpcomingInspectionsWidget({ inspections }: { inspections: UpcomingInspection[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-green-500" />
            <h4 className="font-medium text-warm-900 text-sm">Upcoming Inspections</h4>
          </div>
          <span className="text-xs text-warm-500">{inspections.length} scheduled</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {inspections.slice(0, 5).map(inspection => (
          <div key={inspection.id} className="px-4 py-2.5 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-warm-900 text-sm">{inspection.job}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-warm-500">Permit: {inspection.permitRef}</span>
                  {inspection.inspectorName && (
                    <span className="text-xs text-warm-400">Inspector: {inspection.inspectorName}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-warm-700">{inspection.date}</div>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block",
                  inspection.status === 'scheduled' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {inspection.status === 'scheduled' ? 'Scheduled' : 'Pending Confirmation'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-warm-200 bg-warm-50">
        <button className="text-sm text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
          View all inspections
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Weather Widget ──────────────────────────────────────────────

function WeatherWidget({ weatherData }: { weatherData: WeatherInfo[] }) {
  const getWeatherIcon = (conditions: WeatherInfo['conditions']) => {
    switch (conditions) {
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'stormy': return CloudRain
      default: return Cloud
    }
  }

  const getRiskColor = (risk: WeatherInfo['outdoorRisk']) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'high': return 'bg-red-100 text-red-700'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-stone-500" />
          <h4 className="font-medium text-warm-900 text-sm">Job Site Weather</h4>
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {weatherData.map((weather, index) => {
          const WeatherIcon = getWeatherIcon(weather.conditions)
          return (
            <div key={index} className="px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-stone-50 rounded-lg">
                    <WeatherIcon className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <div className="font-medium text-warm-900 text-sm">{weather.jobSite}</div>
                    <div className="text-xs text-warm-500 capitalize">{weather.conditions}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-warm-900">{weather.temperature}°F</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", getRiskColor(weather.outdoorRisk))}>
                    {weather.outdoorRisk === 'high' ? 'Outdoor Risk' : weather.outdoorRisk === 'medium' ? 'Caution' : 'Good'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Date Range Selector ─────────────────────────────────────────

function DateRangeSelector({
  selectedRange,
  onRangeChange
}: {
  selectedRange: DateRangePreset
  onRangeChange: (range: DateRangePreset) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const getDateRangeLabel = (range: DateRangePreset) => {
    const preset = dateRangePresets.find(p => p.key === range)
    if (!preset) return 'Select Range'

    const today = new Date()
    switch (range) {
      case 'last-7-days':
        return 'Feb 6 - Feb 12, 2026'
      case 'last-30-days':
        return 'Jan 14 - Feb 12, 2026'
      case 'mtd':
        return 'Feb 1 - Feb 12, 2026'
      case 'qtd':
        return 'Jan 1 - Feb 12, 2026'
      case 'ytd':
        return 'Jan 1 - Feb 12, 2026'
      case 'custom':
        return 'Custom Range'
      default:
        return preset.label
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50"
      >
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{dateRangePresets.find(p => p.key === selectedRange)?.label}</span>
        <span className="text-warm-400">|</span>
        <span className="text-xs text-warm-500">{getDateRangeLabel(selectedRange)}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-warm-200 shadow-lg z-10">
          <div className="py-1">
            {dateRangePresets.map(preset => (
              <button
                key={preset.key}
                onClick={() => {
                  onRangeChange(preset.key)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-warm-50",
                  selectedRange === preset.key ? "bg-stone-50 text-stone-700" : "text-warm-700"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────

export function FinancialDashboardPreview() {
  const { search, setSearch, activeTab, setActiveTab } = useFilterState()
  const [dateRange, setDateRange] = useState<DateRangePreset>('mtd')

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Financial Dashboard</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Healthy</span>
              <span className="text-xs bg-stone-50 text-stone-600 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Jan 2026 Locked
              </span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                As of February 12, 2026
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                Cash position improving
              </span>
              <span className="flex items-center gap-1 text-warm-400">
                <RefreshCw className="h-3 w-3" />
                QB synced 5 min ago
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Settings className="h-4 w-4" />
              Configure KPIs
            </button>
            <DateRangeSelector selectedRange={dateRange} onRangeChange={setDateRange} />
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700">
              <BarChart3 className="h-4 w-4" />
              Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Fiscal Year / Period indicator */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search dashboard..."
          tabs={[
            { key: 'all', label: 'All Jobs' },
            { key: 'active', label: 'Active Jobs', count: 5 },
            { key: 'at-risk', label: 'At Risk', count: 2 },
            { key: 'over-budget', label: 'Over Budget', count: 1 },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Pending Approvals Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <PendingApprovalsBar approvals={pendingApprovals} />
      </div>

      {/* Primary Summary Cards */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <SummaryCardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Secondary KPI Row - Configurable (Gap #438) */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <SecondaryKPIRow widgets={secondaryKPIs} />
      </div>

      {/* Charts Row */}
      <div className="p-4 grid grid-cols-3 gap-4">
        <ChartPlaceholder title="Revenue by Month" icon={BarChart3} />
        <ChartPlaceholder title="Profit Margin Trend" icon={LineChart} />
        <ChartPlaceholder title="AR/AP Aging" icon={PieChart} />
      </div>

      {/* Budget vs Actual Trend */}
      <div className="px-4 pb-4">
        <ChartPlaceholder title="Budget vs Actual (All Active Jobs)" icon={BarChart3} height="h-32" />
      </div>

      {/* Real-time Activity & Weather Row */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <ActivityFeed activities={recentActivities} />
        <UpcomingInspectionsWidget inspections={upcomingInspections} />
        <WeatherWidget weatherData={weatherData} />
      </div>

      {/* Quick Lists Row */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <PaymentsList payments={upcomingPayments} />
        <OverdueList receivables={overdueReceivables} />
        <OutstandingDrawsList draws={outstandingDraws} />
      </div>

      {/* Vendor & Client Communication Queues */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">
        <VendorFollowUpQueue vendors={vendorFollowUps} />
        <ClientCommunicationQueue messages={clientMessages} />
      </div>

      {/* Job Profitability */}
      <div className="px-4 pb-4">
        <JobProfitabilityTable jobs={jobProfitability} />
      </div>

      {/* AI Features Panel */}
      <div className="px-4 pb-4">
        <AIFeaturesPanel
          title="AI Financial Insights"
          features={aiFeatures}
          columns={3}
        />
      </div>

      {/* WIP Summary Bar */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-warm-400" />
            <span className="font-medium text-warm-700">WIP Summary (Jan 2026):</span>
          </div>
          <div className="flex items-center gap-6 text-warm-600">
            <span>Over-billed: <span className="font-semibold text-amber-600">$85K</span></span>
            <span>Under-billed: <span className="font-semibold text-stone-600">$42K</span></span>
            <span>Net: <span className="font-semibold text-amber-600">$43K over-billed</span></span>
            <button className="text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1">
              Full WIP Report <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Financial Summary:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Based on historical patterns, expect a $45K shortfall in early March due to delayed draws on Smith Residence.
              Recommend accelerating Draw #6 request or deferring ABC Lumber payment to Feb 28. Wilson Custom payment (28 days overdue)
              has 78% collection probability within 2 weeks based on client history.
            </p>
            <p>
              Month-end approaching: WIP report due for bank covenant review. 2 jobs show overbilling that should be reviewed.
              ABC Lumber offers 2% early pay discount ($570 savings) if paid by Feb 13.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
