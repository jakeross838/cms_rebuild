'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  ChevronRight,
  ChevronDown,
  BarChart3,
  LineChart,
  Building2,
  Users,
  ClipboardCheck,
  Sparkles,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wrench,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel, type AIFeatureCardProps } from '@/components/skeleton/ui'

// ── Types ───────────────────────────────────────────────────────

type DateRangePreset = 'last-30-days' | 'last-90-days' | '6-months' | '12-months' | 'custom'

type FTQTrend = 'up' | 'down' | 'stable'

interface CompanyFTQ {
  score: number
  previousScore: number
  trend: FTQTrend
  delta: number
  inspectionsThisPeriod: number
  passedInspections: number
  failedInspections: number
  activeProjects: number
  averageProjectFTQ: number
  topPerformingTrade: string
  topPerformingTradeFTQ: number
}

interface TradeFTQScore {
  id: string
  trade: string
  ftqScore: number
  inspections: number
  passed: number
  failed: number
  trend: FTQTrend
  thresholdStatus: 'above' | 'at' | 'below'
}

interface ProjectFTQScore {
  id: string
  project: string
  phase: string
  ftqScore: number
  trend: FTQTrend
  trendDelta: number
  inspections: number
  passed: number
  failed: number
  lastUpdated: string
}

interface VendorRanking {
  rank: number
  vendor: string
  trade: string
  ftqScore: number
  trend: FTQTrend
  trendDelta: number
  inspections: number
  isTop: boolean
}

interface FTQAlert {
  id: string
  type: 'trade_drop' | 'vendor_below_threshold' | 'project_failures'
  severity: 'warning' | 'critical'
  title: string
  description: string
  actionLabel: string
}

interface RecentInspection {
  id: string
  project: string
  inspectionType: string
  result: 'pass' | 'fail'
  ftqScore: number
  itemsRequiringRework: number
  timestamp: string
  inspector: string
}

interface TrendDataPoint {
  date: string
  ftqScore: number
  benchmark: number
  annotation?: string
}

// ── Mock Data ───────────────────────────────────────────────────

const mockCompanyFTQ: CompanyFTQ = {
  score: 91.4,
  previousScore: 89.2,
  trend: 'up',
  delta: 2.2,
  inspectionsThisPeriod: 247,
  passedInspections: 226,
  failedInspections: 21,
  activeProjects: 12,
  averageProjectFTQ: 90.8,
  topPerformingTrade: 'Drywall',
  topPerformingTradeFTQ: 95,
}

const mockTradeScores: TradeFTQScore[] = [
  { id: '1', trade: 'Framing', ftqScore: 94, inspections: 45, passed: 42, failed: 3, trend: 'up', thresholdStatus: 'above' },
  { id: '2', trade: 'Electrical', ftqScore: 89, inspections: 38, passed: 34, failed: 4, trend: 'down', thresholdStatus: 'at' },
  { id: '3', trade: 'Plumbing', ftqScore: 92, inspections: 42, passed: 39, failed: 3, trend: 'stable', thresholdStatus: 'above' },
  { id: '4', trade: 'HVAC', ftqScore: 87, inspections: 35, passed: 30, failed: 5, trend: 'down', thresholdStatus: 'below' },
  { id: '5', trade: 'Drywall', ftqScore: 95, inspections: 48, passed: 46, failed: 2, trend: 'up', thresholdStatus: 'above' },
  { id: '6', trade: 'Paint', ftqScore: 91, inspections: 29, passed: 26, failed: 3, trend: 'stable', thresholdStatus: 'above' },
  { id: '7', trade: 'Tile', ftqScore: 88, inspections: 22, passed: 19, failed: 3, trend: 'up', thresholdStatus: 'at' },
]

const mockProjectScores: ProjectFTQScore[] = [
  { id: '1', project: 'Smith Residence', phase: 'Rough-In', ftqScore: 93.2, trend: 'up', trendDelta: 1.8, inspections: 24, passed: 22, failed: 2, lastUpdated: 'Feb 12, 2026' },
  { id: '2', project: 'Johnson Beach House', phase: 'Foundation', ftqScore: 96.5, trend: 'up', trendDelta: 3.2, inspections: 18, passed: 17, failed: 1, lastUpdated: 'Feb 11, 2026' },
  { id: '3', project: 'Williams Remodel', phase: 'Finishing', ftqScore: 89.1, trend: 'down', trendDelta: -2.4, inspections: 32, passed: 29, failed: 3, lastUpdated: 'Feb 12, 2026' },
  { id: '4', project: 'Miller Addition', phase: 'Drywall', ftqScore: 91.8, trend: 'stable', trendDelta: 0.2, inspections: 15, passed: 14, failed: 1, lastUpdated: 'Feb 10, 2026' },
  { id: '5', project: 'Davis Coastal Home', phase: 'Roofing', ftqScore: 87.3, trend: 'down', trendDelta: -4.1, inspections: 28, passed: 24, failed: 4, lastUpdated: 'Feb 12, 2026' },
  { id: '6', project: 'Thompson Renovation', phase: 'Final', ftqScore: 94.7, trend: 'up', trendDelta: 2.1, inspections: 22, passed: 21, failed: 1, lastUpdated: 'Feb 9, 2026' },
  { id: '7', project: 'Lot 47 New Construction', phase: 'Framing', ftqScore: 82.1, trend: 'down', trendDelta: -5.6, inspections: 19, passed: 16, failed: 3, lastUpdated: 'Feb 12, 2026' },
]

const mockVendorRankings: VendorRanking[] = [
  // Top 10
  { rank: 1, vendor: 'Elite Drywall Co', trade: 'Drywall', ftqScore: 98.2, trend: 'up', trendDelta: 1.5, inspections: 28, isTop: true },
  { rank: 2, vendor: 'Precision Framing', trade: 'Framing', ftqScore: 97.8, trend: 'stable', trendDelta: 0.1, inspections: 32, isTop: true },
  { rank: 3, vendor: 'Master Plumbers LLC', trade: 'Plumbing', ftqScore: 96.5, trend: 'up', trendDelta: 2.3, inspections: 24, isTop: true },
  { rank: 4, vendor: 'Pro Paint Solutions', trade: 'Paint', ftqScore: 95.9, trend: 'up', trendDelta: 1.8, inspections: 18, isTop: true },
  { rank: 5, vendor: 'Quality Electric', trade: 'Electrical', ftqScore: 95.2, trend: 'stable', trendDelta: 0.3, inspections: 26, isTop: true },
  { rank: 6, vendor: 'Summit Roofing', trade: 'Roofing', ftqScore: 94.8, trend: 'down', trendDelta: -0.5, inspections: 15, isTop: true },
  { rank: 7, vendor: 'Coastal Tile Works', trade: 'Tile', ftqScore: 94.1, trend: 'up', trendDelta: 3.2, inspections: 12, isTop: true },
  { rank: 8, vendor: 'Premier HVAC', trade: 'HVAC', ftqScore: 93.6, trend: 'stable', trendDelta: 0.2, inspections: 21, isTop: true },
  { rank: 9, vendor: 'Solid Foundation Inc', trade: 'Concrete', ftqScore: 93.2, trend: 'up', trendDelta: 1.1, inspections: 14, isTop: true },
  { rank: 10, vendor: 'Advanced Insulation', trade: 'Insulation', ftqScore: 92.8, trend: 'stable', trendDelta: -0.1, inspections: 16, isTop: true },
  // Bottom 10
  { rank: 41, vendor: 'Budget HVAC Services', trade: 'HVAC', ftqScore: 78.5, trend: 'down', trendDelta: -3.2, inspections: 18, isTop: false },
  { rank: 42, vendor: 'Quick Fix Electric', trade: 'Electrical', ftqScore: 77.8, trend: 'down', trendDelta: -2.8, inspections: 14, isTop: false },
  { rank: 43, vendor: 'ABC Electric', trade: 'Electrical', ftqScore: 76.2, trend: 'down', trendDelta: -4.5, inspections: 22, isTop: false },
  { rank: 44, vendor: 'Fast Plumbing Co', trade: 'Plumbing', ftqScore: 75.9, trend: 'stable', trendDelta: 0.2, inspections: 16, isTop: false },
  { rank: 45, vendor: 'Economy Drywall', trade: 'Drywall', ftqScore: 74.3, trend: 'down', trendDelta: -1.9, inspections: 12, isTop: false },
  { rank: 46, vendor: 'Discount Framing', trade: 'Framing', ftqScore: 73.8, trend: 'down', trendDelta: -5.1, inspections: 19, isTop: false },
  { rank: 47, vendor: 'Basic Tile Install', trade: 'Tile', ftqScore: 72.1, trend: 'down', trendDelta: -3.8, inspections: 11, isTop: false },
  { rank: 48, vendor: 'Bargain Paint Pros', trade: 'Paint', ftqScore: 71.4, trend: 'down', trendDelta: -2.2, inspections: 9, isTop: false },
  { rank: 49, vendor: 'Cut-Rate Roofing', trade: 'Roofing', ftqScore: 68.9, trend: 'down', trendDelta: -6.4, inspections: 13, isTop: false },
  { rank: 50, vendor: 'Low Cost HVAC', trade: 'HVAC', ftqScore: 65.2, trend: 'down', trendDelta: -8.1, inspections: 8, isTop: false },
]

const mockAlerts: FTQAlert[] = [
  {
    id: '1',
    type: 'trade_drop',
    severity: 'warning',
    title: 'HVAC FTQ dropped 8% this month',
    description: 'HVAC trade FTQ has declined from 95% to 87% over the past 30 days. Primary issues: ductwork sealing and refrigerant line clearances.',
    actionLabel: 'View HVAC Details',
  },
  {
    id: '2',
    type: 'vendor_below_threshold',
    severity: 'critical',
    title: "Vendor 'ABC Electric' below 85% threshold",
    description: 'ABC Electric has fallen to 76.2% FTQ, well below the 85% minimum threshold. 4 failed inspections in the last 2 weeks.',
    actionLabel: 'Schedule Review',
  },
  {
    id: '3',
    type: 'project_failures',
    severity: 'warning',
    title: "'Lot 47' has 3 failed inspections",
    description: 'Lot 47 New Construction has accumulated 3 failed inspections this week. Framing and electrical issues identified.',
    actionLabel: 'View Project',
  },
  {
    id: '4',
    type: 'trade_drop',
    severity: 'warning',
    title: 'Tile FTQ trending down',
    description: 'Tile trade showing 5% decline over past 2 weeks. Grout application and tile alignment most common issues.',
    actionLabel: 'Review Inspections',
  },
]

const mockRecentInspections: RecentInspection[] = [
  { id: '1', project: 'Smith Residence', inspectionType: 'Electrical Rough-In', result: 'pass', ftqScore: 100, itemsRequiringRework: 0, timestamp: '2 hours ago', inspector: 'Sarah Chen' },
  { id: '2', project: 'Davis Coastal Home', inspectionType: 'HVAC Rough-In', result: 'fail', ftqScore: 75, itemsRequiringRework: 3, timestamp: '3 hours ago', inspector: 'Mike Thompson' },
  { id: '3', project: 'Johnson Beach House', inspectionType: 'Foundation', result: 'pass', ftqScore: 100, itemsRequiringRework: 0, timestamp: '4 hours ago', inspector: 'James Rodriguez' },
  { id: '4', project: 'Lot 47 New Construction', inspectionType: 'Framing', result: 'fail', ftqScore: 67, itemsRequiringRework: 4, timestamp: '5 hours ago', inspector: 'Mike Thompson' },
  { id: '5', project: 'Williams Remodel', inspectionType: 'Drywall Pre-Cover', result: 'pass', ftqScore: 95, itemsRequiringRework: 1, timestamp: '6 hours ago', inspector: 'Sarah Chen' },
  { id: '6', project: 'Miller Addition', inspectionType: 'Plumbing Final', result: 'pass', ftqScore: 100, itemsRequiringRework: 0, timestamp: 'Yesterday', inspector: 'James Rodriguez' },
]

const mockTrendData: TrendDataPoint[] = [
  { date: 'Jan 15', ftqScore: 88.2, benchmark: 90 },
  { date: 'Jan 22', ftqScore: 87.5, benchmark: 90, annotation: 'Weather delays' },
  { date: 'Jan 29', ftqScore: 89.1, benchmark: 90 },
  { date: 'Feb 5', ftqScore: 90.3, benchmark: 90, annotation: 'New QC process' },
  { date: 'Feb 12', ftqScore: 91.4, benchmark: 90 },
]

const aiFeatures: AIFeatureCardProps[] = [
  {
    feature: 'FTQ Prediction',
    trigger: 'daily',
    insight: 'Company FTQ projected to reach 92.1% by end of month based on current trajectory. HVAC improvements needed to hit 93% target.',
    severity: 'info',
    confidence: 87,
    action: { label: 'View Forecast', onClick: () => {} },
  },
  {
    feature: 'Risk Identification',
    trigger: 'real-time',
    insight: 'High risk: Lot 47 framing crew has 40% higher defect rate than average. Recommend additional supervision or crew change.',
    severity: 'critical',
    confidence: 92,
    action: { label: 'View Details', onClick: () => {} },
  },
  {
    feature: 'Improvement Recommendations',
    trigger: 'weekly',
    insight: 'Top 3 focus areas: 1) HVAC ductwork sealing (+3% potential), 2) Electrical panel clearances (+1.5%), 3) Tile grout consistency (+1%).',
    severity: 'warning',
    confidence: 85,
    action: { label: 'Create Action Plan', onClick: () => {} },
  },
  {
    feature: 'Vendor Intervention Alerts',
    trigger: 'real-time',
    insight: 'ABC Electric requires immediate intervention. 3 consecutive failed inspections. Recommend quality meeting before next inspection.',
    severity: 'critical',
    confidence: 94,
    action: { label: 'Schedule Meeting', onClick: () => {} },
  },
  {
    feature: 'Benchmark Comparison',
    trigger: 'daily',
    insight: 'Your 91.4% FTQ is 1.4% above industry benchmark (90%). Top performers in your region average 94.2%. Gap analysis available.',
    severity: 'success',
    confidence: 89,
    action: { label: 'View Benchmarks', onClick: () => {} },
  },
]

const dateRangePresets: { key: DateRangePreset; label: string }[] = [
  { key: 'last-30-days', label: 'Last 30 Days' },
  { key: 'last-90-days', label: 'Last 90 Days' },
  { key: '6-months', label: '6 Months' },
  { key: '12-months', label: '12 Months' },
  { key: 'custom', label: 'Custom' },
]

// ── Utilities ───────────────────────────────────────────────────

function formatPercent(value: number): string {
  return value.toFixed(1) + '%'
}

function getScoreColor(score: number): string {
  if (score >= 95) return 'text-green-600'
  if (score >= 90) return 'text-emerald-600'
  if (score >= 85) return 'text-amber-600'
  return 'text-red-600'
}

function getScoreBgColor(score: number): string {
  if (score >= 95) return 'bg-green-50'
  if (score >= 90) return 'bg-emerald-50'
  if (score >= 85) return 'bg-amber-50'
  return 'bg-red-50'
}

function getBarColor(score: number): string {
  if (score >= 95) return 'bg-green-500'
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 85) return 'bg-amber-500'
  return 'bg-red-500'
}

// ── Components ──────────────────────────────────────────────────

function DateRangeSelector({
  selectedRange,
  onRangeChange,
}: {
  selectedRange: DateRangePreset
  onRangeChange: (range: DateRangePreset) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50"
      >
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{dateRangePresets.find(p => p.key === selectedRange)?.label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-warm-200 shadow-lg z-10">
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

function KPICard({
  label,
  value,
  subLabel,
  icon: Icon,
  trend,
  delta,
  color = 'blue',
}: {
  label: string
  value: string
  subLabel?: string
  icon: React.ElementType
  trend?: FTQTrend
  delta?: number
  color?: 'blue' | 'green' | 'amber' | 'purple'
}) {
  const colorClasses = {
    blue: { bg: 'bg-stone-50', icon: 'bg-stone-100 text-stone-600' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600' },
  }

  return (
    <div className={cn("rounded-lg p-4", colorClasses[color].bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", colorClasses[color].icon)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && delta !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-warm-500"
          )}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-warm-900">{value}</div>
      <div className="text-sm text-warm-600 mt-1">{label}</div>
      {subLabel && <div className="text-xs text-warm-400 mt-0.5">{subLabel}</div>}
    </div>
  )
}

function TradeFTQChart({ trades }: { trades: TradeFTQScore[] }) {
  const maxScore = 100

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-warm-900">FTQ by Trade</h4>
        <BarChart3 className="h-4 w-4 text-warm-400" />
      </div>
      <div className="space-y-3">
        {trades.map(trade => (
          <div key={trade.id} className="flex items-center gap-3">
            <div className="w-20 text-sm font-medium text-warm-700 truncate">{trade.trade}</div>
            <div className="flex-1 h-6 bg-warm-100 rounded-full overflow-hidden relative">
              <div
                className={cn("h-full rounded-full transition-all", getBarColor(trade.ftqScore))}
                style={{ width: `${(trade.ftqScore / maxScore) * 100}%` }}
              />
              {/* Benchmark line at 90% */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-warm-400" style={{ left: '90%' }} />
            </div>
            <div className={cn("w-12 text-sm font-semibold text-right", getScoreColor(trade.ftqScore))}>
              {trade.ftqScore}%
            </div>
            <div className="w-6">
              {trade.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trade.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-4 mt-3 text-xs text-warm-500">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-warm-400" /> 90% Benchmark</span>
      </div>
    </div>
  )
}

function ProjectFTQTable({ projects }: { projects: ProjectFTQScore[] }) {
  const [sortColumn, setSortColumn] = useState<keyof ProjectFTQScore>('ftqScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sortedProjects = [...projects].sort((a, b) => {
    const aVal = a[sortColumn]
    const bVal = b[sortColumn]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  const handleSort = (column: keyof ProjectFTQScore) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDir('desc')
    }
  }

  return (
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-warm-200">
        <h4 className="font-semibold text-warm-900">FTQ by Project</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-50 border-b border-warm-200">
            <tr>
              <th
                className="text-left py-2 px-4 font-medium text-warm-600 cursor-pointer hover:bg-warm-100"
                onClick={() => handleSort('project')}
              >
                Project
              </th>
              <th
                className="text-left py-2 px-3 font-medium text-warm-600 cursor-pointer hover:bg-warm-100"
                onClick={() => handleSort('phase')}
              >
                Phase
              </th>
              <th
                className="text-right py-2 px-3 font-medium text-warm-600 cursor-pointer hover:bg-warm-100"
                onClick={() => handleSort('ftqScore')}
              >
                FTQ Score
              </th>
              <th className="text-center py-2 px-3 font-medium text-warm-600">Trend</th>
              <th
                className="text-right py-2 px-3 font-medium text-warm-600 cursor-pointer hover:bg-warm-100"
                onClick={() => handleSort('inspections')}
              >
                Inspections
              </th>
              <th className="text-left py-2 px-3 font-medium text-warm-600">Last Updated</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {sortedProjects.map(project => (
              <tr
                key={project.id}
                className={cn(
                  "hover:bg-warm-50 cursor-pointer",
                  project.ftqScore < 85 && "bg-red-50/30"
                )}
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-warm-900">{project.project}</span>
                </td>
                <td className="py-3 px-3 text-warm-600">{project.phase}</td>
                <td className="py-3 px-3 text-right">
                  <span className={cn("font-semibold", getScoreColor(project.ftqScore))}>
                    {formatPercent(project.ftqScore)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-center gap-1">
                    {project.trend === 'up' && (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">+{project.trendDelta.toFixed(1)}%</span>
                      </>
                    )}
                    {project.trend === 'down' && (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">{project.trendDelta.toFixed(1)}%</span>
                      </>
                    )}
                    {project.trend === 'stable' && (
                      <span className="text-xs text-warm-400">--</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-warm-600">
                  <span className="text-green-600">{project.passed}</span>
                  {' / '}
                  <span className="text-red-600">{project.failed}</span>
                  <span className="text-warm-400 ml-1">({project.inspections})</span>
                </td>
                <td className="py-3 px-3 text-warm-500 text-sm">{project.lastUpdated}</td>
                <td className="py-3 px-3">
                  <ChevronRight className="h-4 w-4 text-warm-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FTQTrendChart({ data }: { data: TrendDataPoint[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-warm-900">FTQ Trend Over Time</h4>
        <LineChart className="h-4 w-4 text-warm-400" />
      </div>
      <div className="h-48 bg-warm-50 rounded-lg flex items-end justify-between px-4 pb-4 relative">
        {/* Benchmark line */}
        <div className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400" style={{ bottom: `${90 * 1.6}px` }}>
          <span className="absolute right-2 -top-3 text-xs text-amber-600 bg-white px-1">90% Benchmark</span>
        </div>

        {/* Data points */}
        {data.map((point, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={cn(
                "w-full mx-1 rounded-t transition-all relative",
                point.ftqScore >= 90 ? "bg-green-500" : "bg-amber-500"
              )}
              style={{ height: `${point.ftqScore * 1.6}px` }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-warm-700">
                {point.ftqScore}%
              </span>
              {point.annotation && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-warm-500 whitespace-nowrap bg-white px-1 rounded">
                  {point.annotation}
                </span>
              )}
            </div>
            <span className="text-xs text-warm-500">{point.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VendorRankingsTable({ vendors, type }: { vendors: VendorRanking[]; type: 'top' | 'bottom' }) {
  const filteredVendors = vendors.filter(v => type === 'top' ? v.isTop : !v.isTop)

  return (
    <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
      <div className={cn(
        "px-4 py-3 border-b",
        type === 'top' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      )}>
        <div className="flex items-center gap-2">
          {type === 'top' ? (
            <Award className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <h4 className={cn(
            "font-semibold",
            type === 'top' ? "text-green-700" : "text-red-700"
          )}>
            {type === 'top' ? 'Top 10 Vendors' : 'Bottom 10 Vendors'}
          </h4>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-warm-50 border-b border-warm-200">
            <tr>
              <th className="text-left py-2 px-3 font-medium text-warm-600 w-12">Rank</th>
              <th className="text-left py-2 px-3 font-medium text-warm-600">Vendor</th>
              <th className="text-left py-2 px-3 font-medium text-warm-600">Trade</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">FTQ</th>
              <th className="text-center py-2 px-3 font-medium text-warm-600">Trend</th>
              <th className="text-right py-2 px-3 font-medium text-warm-600">Inspections</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {filteredVendors.map(vendor => (
              <tr key={vendor.rank} className="hover:bg-warm-50 cursor-pointer">
                <td className="py-2 px-3">
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                    type === 'top' && vendor.rank <= 3 ? "bg-green-100 text-green-700" : "bg-warm-100 text-warm-600"
                  )}>
                    {vendor.rank}
                  </span>
                </td>
                <td className="py-2 px-3 font-medium text-warm-900">{vendor.vendor}</td>
                <td className="py-2 px-3 text-warm-600">{vendor.trade}</td>
                <td className="py-2 px-3 text-right">
                  <span className={cn("font-semibold", getScoreColor(vendor.ftqScore))}>
                    {formatPercent(vendor.ftqScore)}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-center gap-1">
                    {vendor.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {vendor.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    <span className={cn(
                      "text-xs",
                      vendor.trendDelta > 0 ? "text-green-600" : vendor.trendDelta < 0 ? "text-red-600" : "text-warm-400"
                    )}>
                      {vendor.trendDelta > 0 ? '+' : ''}{vendor.trendDelta.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right text-warm-600">{vendor.inspections}</td>
                <td className="py-2 px-3">
                  <ExternalLink className="h-4 w-4 text-warm-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AlertCard({ alert }: { alert: FTQAlert }) {
  return (
    <div className={cn(
      "rounded-lg border p-4",
      alert.severity === 'critical' ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0",
          alert.severity === 'critical' ? "bg-red-100" : "bg-amber-100"
        )}>
          <AlertTriangle className={cn(
            "h-4 w-4",
            alert.severity === 'critical' ? "text-red-600" : "text-amber-600"
          )} />
        </div>
        <div className="flex-1">
          <h5 className={cn(
            "font-medium",
            alert.severity === 'critical' ? "text-red-800" : "text-amber-800"
          )}>
            {alert.title}
          </h5>
          <p className={cn(
            "text-sm mt-1",
            alert.severity === 'critical' ? "text-red-700" : "text-amber-700"
          )}>
            {alert.description}
          </p>
          <button className={cn(
            "mt-2 text-sm font-medium flex items-center gap-1",
            alert.severity === 'critical' ? "text-red-700 hover:text-red-800" : "text-amber-700 hover:text-amber-800"
          )}>
            {alert.actionLabel}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function RecentInspectionsList({ inspections }: { inspections: RecentInspection[] }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200">
      <div className="px-4 py-3 border-b border-warm-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-warm-900">Recent Inspections</h4>
          <span className="text-xs text-warm-500">{inspections.length} inspections</span>
        </div>
      </div>
      <div className="divide-y divide-warm-100 max-h-[350px] overflow-y-auto">
        {inspections.map(inspection => (
          <div key={inspection.id} className="px-4 py-3 hover:bg-warm-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  inspection.result === 'pass' ? "bg-green-100" : "bg-red-100"
                )}>
                  {inspection.result === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-warm-900">{inspection.project}</div>
                  <div className="text-sm text-warm-600">{inspection.inspectionType}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-warm-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {inspection.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {inspection.inspector}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-sm font-semibold",
                  inspection.result === 'pass' ? "text-green-600" : "text-red-600"
                )}>
                  {inspection.ftqScore}%
                </div>
                {inspection.itemsRequiringRework > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <Wrench className="h-3 w-3" />
                    {inspection.itemsRequiringRework} rework items
                  </div>
                )}
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

// ── Main Component ──────────────────────────────────────────────

export function FTQDashboardPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()
  const [dateRange, setDateRange] = useState<DateRangePreset>('last-30-days')

  const passRate = Math.round((mockCompanyFTQ.passedInspections / mockCompanyFTQ.inspectionsThisPeriod) * 100)

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">First-Time Quality Dashboard</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                mockCompanyFTQ.score >= 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {mockCompanyFTQ.score >= 90 ? 'Above Benchmark' : 'Below Benchmark'}
              </span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                As of February 12, 2026
              </span>
              <span className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                {mockCompanyFTQ.inspectionsThisPeriod} inspections this period
              </span>
              <span className={cn(
                "flex items-center gap-1",
                mockCompanyFTQ.trend === 'up' ? "text-green-600" : "text-warm-500"
              )}>
                {mockCompanyFTQ.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                FTQ {mockCompanyFTQ.trend === 'up' ? 'improving' : 'stable'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeSelector selectedRange={dateRange} onRangeChange={setDateRange} />
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Top-Level KPIs */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="Company FTQ Score"
            value={formatPercent(mockCompanyFTQ.score)}
            icon={Target}
            trend={mockCompanyFTQ.trend}
            delta={mockCompanyFTQ.delta}
            color="green"
          />
          <KPICard
            label="Inspections This Period"
            value={mockCompanyFTQ.inspectionsThisPeriod.toString()}
            subLabel={`${mockCompanyFTQ.passedInspections} passed / ${mockCompanyFTQ.failedInspections} failed`}
            icon={ClipboardCheck}
            color="blue"
          />
          <KPICard
            label="Active Projects"
            value={mockCompanyFTQ.activeProjects.toString()}
            subLabel={`Avg FTQ: ${formatPercent(mockCompanyFTQ.averageProjectFTQ)}`}
            icon={Building2}
            color="purple"
          />
          <KPICard
            label="Top Performing Trade"
            value={mockCompanyFTQ.topPerformingTrade}
            subLabel={`FTQ: ${formatPercent(mockCompanyFTQ.topPerformingTradeFTQ)}`}
            icon={Award}
            color="amber"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search projects, trades, vendors..."
          tabs={[
            { key: 'all', label: 'All', count: mockProjectScores.length },
            { key: 'above-benchmark', label: 'Above 90%', count: mockProjectScores.filter(p => p.ftqScore >= 90).length },
            { key: 'at-risk', label: 'At Risk (85-90%)', count: mockProjectScores.filter(p => p.ftqScore >= 85 && p.ftqScore < 90).length },
            { key: 'critical', label: 'Critical (<85%)', count: mockProjectScores.filter(p => p.ftqScore < 85).length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          resultCount={mockProjectScores.length}
          totalCount={mockProjectScores.length}
        />
      </div>

      {/* FTQ by Trade Chart */}
      <div className="p-4">
        <TradeFTQChart trades={mockTradeScores} />
      </div>

      {/* FTQ by Project Table */}
      <div className="px-4 pb-4">
        <ProjectFTQTable projects={mockProjectScores} />
      </div>

      {/* FTQ Trend Over Time */}
      <div className="px-4 pb-4">
        <FTQTrendChart data={mockTrendData} />
      </div>

      {/* Vendor Rankings - Top and Bottom */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">
        <VendorRankingsTable vendors={mockVendorRankings} type="top" />
        <VendorRankingsTable vendors={mockVendorRankings} type="bottom" />
      </div>

      {/* Low FTQ Alerts */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <h4 className="font-semibold text-warm-900">Low FTQ Alerts</h4>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
            {mockAlerts.length} items need attention
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mockAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="px-4 pb-4">
        <RecentInspectionsList inspections={mockRecentInspections} />
      </div>

      {/* AI Features Panel */}
      <div className="px-4 pb-4">
        <AIFeaturesPanel
          title="AI FTQ Intelligence"
          features={aiFeatures}
          columns={2}
        />
      </div>

      {/* Summary Footer */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-warm-400" />
            <span className="font-medium text-warm-700">Period Summary:</span>
          </div>
          <div className="flex items-center gap-6 text-warm-600">
            <span>Pass Rate: <span className="font-semibold text-green-600">{passRate}%</span></span>
            <span>Total Inspections: <span className="font-semibold text-warm-900">{mockCompanyFTQ.inspectionsThisPeriod}</span></span>
            <span>Active Projects: <span className="font-semibold text-warm-900">{mockCompanyFTQ.activeProjects}</span></span>
            <span>Vendors Tracked: <span className="font-semibold text-warm-900">{mockVendorRankings.length}</span></span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Quality Insights:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Company FTQ has improved 2.2% this month, driven by drywall and framing improvements.
              HVAC remains the primary area of concern with 8% decline - ductwork sealing issues account for 60% of failures.
            </p>
            <p>
              Vendor ABC Electric requires immediate intervention (76.2% FTQ). Historical data suggests vendors below 80%
              rarely recover without structured quality improvement plan. Recommend scheduling performance review within 48 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
