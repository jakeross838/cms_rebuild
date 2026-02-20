'use client'

import { useState } from 'react'
import {
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  BarChart3,
  LineChart,
  Trophy,
  Shield,
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  Minus,
  Building2,
  Wrench,
  Zap,
  Droplets,
  PaintBucket,
  Star,
  Info,
  Brain,
  Activity,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  History,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FTQByTrade {
  trade: string
  ftqScore: number
  inspections: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface FTQHistoryItem {
  date: string
  projectName: string
  trade: string
  result: 'pass' | 'fail' | 'conditional'
  defectCategory?: string
  notes?: string
}

interface VendorPerformanceData {
  id: string
  name: string
  trade: string
  type: 'subcontractor' | 'supplier'
  status: 'preferred' | 'approved' | 'conditional' | 'pending'
  // Overall scores
  compositeScore: number
  qualityScore: number
  timelinessScore: number
  communicationScore: number
  safetyScore: number
  // FTQ specific data
  ftq_score_current: number
  ftq_score_6mo: number
  ftq_score_12mo: number
  ftq_trend: 'up' | 'down' | 'stable'
  ftq_trend_value: number
  ftq_by_trade: FTQByTrade[]
  ftq_rank: number
  ftq_total_vendors: number
  ftq_percentile: number
  ftq_history: FTQHistoryItem[]
  // Predictions
  predicted_ftq: number
  prediction_confidence: number
  risk_factors: string[]
  suggested_mitigations: string[]
  // Quality dimension breakdown
  quality_dimension_weight: number
  ftq_weight_in_quality: number
  ftq_contribution_to_score: number
  // Additional metrics
  totalInspections: number
  passRate: number
  avgDefectsPerJob: number
  warrantyCallbackRate: number
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockVendor: VendorPerformanceData = {
  id: '1',
  name: 'ABC Framing Co.',
  trade: 'Framing',
  type: 'subcontractor',
  status: 'preferred',
  // Overall scores
  compositeScore: 92,
  qualityScore: 94,
  timelinessScore: 88,
  communicationScore: 91,
  safetyScore: 96,
  // FTQ specific data
  ftq_score_current: 94,
  ftq_score_6mo: 91,
  ftq_score_12mo: 88,
  ftq_trend: 'up',
  ftq_trend_value: 3.2,
  ftq_by_trade: [
    { trade: 'Framing', ftqScore: 96, inspections: 45, trend: 'up', trendValue: 2.1 },
    { trade: 'Electrical Rough', ftqScore: 88, inspections: 12, trend: 'down', trendValue: -1.5 },
    { trade: 'Plumbing Rough', ftqScore: 92, inspections: 18, trend: 'stable', trendValue: 0.3 },
    { trade: 'Insulation', ftqScore: 91, inspections: 8, trend: 'up', trendValue: 4.2 },
  ],
  ftq_rank: 3,
  ftq_total_vendors: 12,
  ftq_percentile: 85,
  ftq_history: [
    { date: '2026-02-10', projectName: 'Smith Residence', trade: 'Framing', result: 'pass', notes: 'Excellent work on complex roof structure' },
    { date: '2026-02-05', projectName: 'Johnson Waterfront', trade: 'Framing', result: 'pass' },
    { date: '2026-01-28', projectName: 'Davis Custom Home', trade: 'Framing', result: 'conditional', defectCategory: 'Blocking', notes: 'Minor blocking issues corrected same day' },
    { date: '2026-01-20', projectName: 'Miller Beach House', trade: 'Framing', result: 'pass' },
    { date: '2026-01-15', projectName: 'Wilson Renovation', trade: 'Electrical Rough', result: 'fail', defectCategory: 'Box Placement', notes: 'Boxes not at correct height - rework required' },
    { date: '2026-01-08', projectName: 'Thompson Estate', trade: 'Framing', result: 'pass' },
    { date: '2025-12-18', projectName: 'Anderson Home', trade: 'Plumbing Rough', result: 'pass' },
    { date: '2025-12-10', projectName: 'Garcia Residence', trade: 'Framing', result: 'pass' },
  ],
  // Predictions
  predicted_ftq: 91,
  prediction_confidence: 78,
  risk_factors: [
    'New crew members on next project (2 of 5)',
    'Complex architectural design with cathedral ceilings',
    'Compressed timeline may impact quality checks',
    'Weather delays may cause rushing in final phases',
  ],
  suggested_mitigations: [
    'Schedule mid-phase quality checkpoint',
    'Assign senior lead to oversee new crew members',
    'Pre-review architectural details with crew before start',
    'Build in 2-day buffer for weather contingency',
  ],
  // Quality dimension breakdown
  quality_dimension_weight: 35,
  ftq_weight_in_quality: 60,
  ftq_contribution_to_score: 19.7,
  // Additional metrics
  totalInspections: 156,
  passRate: 94,
  avgDefectsPerJob: 0.8,
  warrantyCallbackRate: 1.2,
}

const peerComparison = {
  avgFTQ: 86,
  topPerformerFTQ: 97,
  bottomPerformerFTQ: 72,
  vendorPosition: 'above_average',
}

const rollingAverages = {
  thirtyDay: 95,
  sixtyDay: 93,
  ninetyDay: 91,
}

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function getFTQColor(score: number): string {
  if (score >= 95) return 'text-green-600'
  if (score >= 85) return 'text-amber-600'
  if (score >= 70) return 'text-orange-600'
  return 'text-red-600'
}

function getFTQBgColor(score: number): string {
  if (score >= 95) return 'bg-green-100'
  if (score >= 85) return 'bg-amber-100'
  if (score >= 70) return 'bg-orange-100'
  return 'bg-red-100'
}

function getFTQBorderColor(score: number): string {
  if (score >= 95) return 'border-green-300'
  if (score >= 85) return 'border-amber-300'
  if (score >= 70) return 'border-orange-300'
  return 'border-red-300'
}

function TrendIndicator({ trend, value }: { trend: 'up' | 'down' | 'stable'; value: number }) {
  if (trend === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-green-600 text-sm font-medium">
        <TrendingUp className="h-3.5 w-3.5" />
        +{value.toFixed(1)}%
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-red-600 text-sm font-medium">
        <TrendingDown className="h-3.5 w-3.5" />
        {value.toFixed(1)}%
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-warm-500 text-sm font-medium">
      <Minus className="h-3.5 w-3.5" />
      {value.toFixed(1)}%
    </span>
  )
}

function FTQScoreBadge({ score, size = 'default' }: { score: number; size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'text-sm px-2 py-0.5',
    default: 'text-base px-3 py-1',
    large: 'text-2xl px-4 py-2 font-bold',
  }

  return (
    <span className={cn(
      'rounded-full font-semibold inline-flex items-center gap-1',
      getFTQBgColor(score),
      getFTQColor(score),
      getFTQBorderColor(score),
      'border',
      sizeClasses[size]
    )}>
      {score}% FTQ
    </span>
  )
}

function ResultBadge({ result }: { result: 'pass' | 'fail' | 'conditional' }) {
  const config = {
    pass: { label: 'Pass', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    fail: { label: 'Fail', color: 'bg-red-100 text-red-700', icon: XCircle },
    conditional: { label: 'Conditional', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  }
  const { label, color, icon: Icon } = config[result]
  return (
    <span className={cn('flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium', color)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

function PercentileBar({ percentile }: { percentile: number }) {
  return (
    <div className="relative w-full h-2 bg-warm-200 rounded-full overflow-hidden">
      <div
        className={cn(
          'absolute top-0 left-0 h-full rounded-full transition-all',
          percentile >= 75 ? 'bg-green-500' :
          percentile >= 50 ? 'bg-stone-500' :
          percentile >= 25 ? 'bg-amber-500' : 'bg-red-500'
        )}
        style={{ width: `${percentile}%` }}
      />
      <div
        className="absolute top-0 h-full w-0.5 bg-warm-800"
        style={{ left: `${percentile}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function VendorPerformancePreview() {
  const [ftqHistoryExpanded, setFtqHistoryExpanded] = useState(false)
  const vendor = mockVendor

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-stone-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-stone-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-warm-900">{vendor.name}</h2>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded font-medium',
                  vendor.status === 'preferred' ? 'bg-green-100 text-green-700' :
                  vendor.status === 'approved' ? 'bg-stone-100 text-stone-700' :
                  'bg-amber-100 text-amber-700'
                )}>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-warm-500">{vendor.trade} | Subcontractor</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-warm-500 mb-1">Vendor Performance Dashboard</p>
            <p className="text-xs text-warm-400">Last updated: Feb 13, 2026</p>
          </div>
        </div>
      </div>

      {/* Primary Score Cards - FTQ Prominently Displayed */}
      <div className="bg-white border-b border-warm-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          {/* FTQ Score - Primary */}
          <div className={cn(
            'rounded-xl p-4 border-2',
            getFTQBgColor(vendor.ftq_score_current),
            getFTQBorderColor(vendor.ftq_score_current)
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className={cn('h-5 w-5', getFTQColor(vendor.ftq_score_current))} />
                <span className="text-sm font-semibold text-warm-700">FTQ Score</span>
              </div>
              <TrendIndicator trend={vendor.ftq_trend} value={vendor.ftq_trend_value} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-4xl font-bold', getFTQColor(vendor.ftq_score_current))}>
                {vendor.ftq_score_current}%
              </span>
              <span className="text-sm text-warm-500">FTQ</span>
            </div>
            <div className="mt-2 text-xs text-warm-500">
              6mo: {vendor.ftq_score_6mo}% | 12mo: {vendor.ftq_score_12mo}%
            </div>
          </div>

          {/* Overall Composite Score */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-stone-600" />
              <span className="text-sm font-semibold text-warm-700">Overall Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-stone-600">{vendor.compositeScore}</span>
              <span className="text-sm text-warm-500">/ 100</span>
            </div>
            <div className="mt-2 text-xs text-warm-500">
              Composite performance rating
            </div>
          </div>

          {/* FTQ Rank */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-warm-700">FTQ Ranking</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-600">#{vendor.ftq_rank}</span>
              <span className="text-sm text-warm-500">of {vendor.ftq_total_vendors}</span>
            </div>
            <div className="mt-2 text-xs text-warm-500">
              {vendor.trade} Contractors
            </div>
          </div>

          {/* Percentile */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-warm-700">Percentile</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-600">{vendor.ftq_percentile}th</span>
            </div>
            <div className="mt-2">
              <PercentileBar percentile={vendor.ftq_percentile} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 space-y-6">
        {/* FTQ by Trade/Scope Section */}
        <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-warm-100 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-warm-500" />
            <h3 className="font-semibold text-warm-900">FTQ by Trade/Scope</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {vendor.ftq_by_trade.map((item) => (
                <div
                  key={item.trade}
                  className={cn(
                    'rounded-lg p-3 border',
                    getFTQBgColor(item.ftqScore),
                    getFTQBorderColor(item.ftqScore)
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-warm-700">{item.trade}</span>
                    <TrendIndicator trend={item.trend} value={item.trendValue} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn('text-2xl font-bold', getFTQColor(item.ftqScore))}>
                      {item.ftqScore}%
                    </span>
                    <span className="text-xs text-warm-500">FTQ</span>
                  </div>
                  <div className="mt-1 text-xs text-warm-500">
                    {item.inspections} inspections
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* FTQ Trend Chart */}
            <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-warm-100 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-warm-500" />
                <h3 className="font-semibold text-warm-900">FTQ Trend</h3>
              </div>
              <div className="p-4">
                {/* Mock Chart Visualization */}
                <div className="h-40 bg-gradient-to-b from-warm-50 to-white rounded-lg border border-warm-100 flex items-end justify-around px-4 pb-4 relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-2 top-2 text-[10px] text-warm-400">100%</div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-warm-400">85%</div>
                  <div className="absolute left-2 bottom-2 text-[10px] text-warm-400">70%</div>

                  {/* Threshold line */}
                  <div className="absolute left-8 right-4 top-[15%] border-t border-dashed border-green-300" />
                  <div className="absolute right-6 top-[13%] text-[9px] text-green-500">Target: 95%</div>

                  {/* Mock bars representing months */}
                  {[82, 85, 84, 88, 91, 94].map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'w-8 rounded-t transition-all',
                          val >= 95 ? 'bg-green-400' :
                          val >= 85 ? 'bg-amber-400' :
                          val >= 70 ? 'bg-orange-400' : 'bg-red-400'
                        )}
                        style={{ height: `${(val - 70) * 3}px` }}
                      />
                      <span className="text-[10px] text-warm-400">
                        {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][i]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rolling Averages */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-warm-50 rounded">
                    <p className="text-xs text-warm-500">30-Day Avg</p>
                    <p className={cn('text-lg font-bold', getFTQColor(rollingAverages.thirtyDay))}>
                      {rollingAverages.thirtyDay}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-warm-50 rounded">
                    <p className="text-xs text-warm-500">60-Day Avg</p>
                    <p className={cn('text-lg font-bold', getFTQColor(rollingAverages.sixtyDay))}>
                      {rollingAverages.sixtyDay}%
                    </p>
                  </div>
                  <div className="text-center p-2 bg-warm-50 rounded">
                    <p className="text-xs text-warm-500">90-Day Avg</p>
                    <p className={cn('text-lg font-bold', getFTQColor(rollingAverages.ninetyDay))}>
                      {rollingAverages.ninetyDay}%
                    </p>
                  </div>
                </div>

                {/* Peer Comparison */}
                <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <h4 className="text-sm font-medium text-stone-800 mb-2 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Peer Comparison ({vendor.trade})
                  </h4>
                  <div className="relative h-8 bg-gradient-to-r from-red-100 via-amber-100 to-green-100 rounded-full">
                    {/* Range indicator */}
                    <div className="absolute inset-y-1 left-1 right-1 flex items-center justify-between px-2 text-[10px] text-warm-600">
                      <span>{peerComparison.bottomPerformerFTQ}%</span>
                      <span>{peerComparison.avgFTQ}% avg</span>
                      <span>{peerComparison.topPerformerFTQ}%</span>
                    </div>
                    {/* Vendor marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-stone-600 rounded-full border-2 border-white shadow-md"
                      style={{ left: `${((vendor.ftq_score_current - 70) / 30) * 100}%` }}
                      title={`${vendor.name}: ${vendor.ftq_score_current}%`}
                    />
                  </div>
                  <p className="mt-2 text-xs text-stone-700 text-center">
                    {vendor.ftq_score_current - peerComparison.avgFTQ > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        {(vendor.ftq_score_current - peerComparison.avgFTQ).toFixed(1)}% above peer average
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(vendor.ftq_score_current - peerComparison.avgFTQ).toFixed(1)}% below peer average
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* FTQ Impact on Overall Score */}
            <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-warm-100 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-warm-500" />
                <h3 className="font-semibold text-warm-900">FTQ Impact on Overall Score</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Visual breakdown */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-warm-600">Quality Dimension</span>
                      <span className="font-medium">{vendor.quality_dimension_weight}% of total</span>
                    </div>
                    <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-500 rounded-full" style={{ width: `${vendor.quality_dimension_weight}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-warm-600">FTQ Weight in Quality</span>
                      <span className="font-medium">{vendor.ftq_weight_in_quality}%</span>
                    </div>
                    <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${vendor.ftq_weight_in_quality}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-800">FTQ Contribution to Overall Score</span>
                    <span className="text-lg font-bold text-emerald-700">+{vendor.ftq_contribution_to_score} pts</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Calculation: Quality ({vendor.quality_dimension_weight}%) x FTQ Weight ({vendor.ftq_weight_in_quality}%) x FTQ Score ({vendor.ftq_score_current}%)
                  </p>
                </div>

                {/* Score dimensions breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-warm-500 uppercase tracking-wide">Score Dimensions</p>
                  {[
                    { label: 'Quality', score: vendor.qualityScore, weight: 35, color: 'bg-stone-500' },
                    { label: 'Timeliness', score: vendor.timelinessScore, weight: 25, color: 'bg-green-500' },
                    { label: 'Communication', score: vendor.communicationScore, weight: 15, color: 'bg-purple-500' },
                    { label: 'Safety', score: vendor.safetyScore, weight: 25, color: 'bg-amber-500' },
                  ].map((dim) => (
                    <div key={dim.label} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-warm-600">{dim.label}</div>
                      <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', dim.color)} style={{ width: `${dim.score}%` }} />
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{dim.score}</div>
                      <div className="w-12 text-xs text-warm-400 text-right">{dim.weight}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quality Prediction Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-indigo-200 flex items-center gap-2 bg-white/50">
                <Brain className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold text-warm-900">AI Quality Prediction</h3>
                <Sparkles className="h-3 w-3 text-indigo-500 ml-auto" />
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-warm-600">Predicted FTQ for Next Project</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={cn('text-3xl font-bold', getFTQColor(vendor.predicted_ftq))}>
                        {vendor.predicted_ftq}%
                      </span>
                      <span className="text-sm text-warm-500">expected</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-warm-500">Confidence</p>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-warm-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            vendor.prediction_confidence >= 80 ? 'bg-green-500' :
                            vendor.prediction_confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${vendor.prediction_confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{vendor.prediction_confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Risk Factors
                  </p>
                  <ul className="space-y-1">
                    {vendor.risk_factors.map((risk, i) => (
                      <li key={i} className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">-</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Mitigations */}
                <div>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Suggested Mitigations
                  </p>
                  <ul className="space-y-1">
                    {vendor.suggested_mitigations.map((mitigation, i) => (
                      <li key={i} className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1 flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {mitigation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* FTQ History */}
            <div className="bg-white rounded-lg border border-warm-200 overflow-hidden">
              <button
                onClick={() => setFtqHistoryExpanded(!ftqHistoryExpanded)}
                className="w-full px-4 py-3 border-b border-warm-100 flex items-center justify-between hover:bg-warm-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-warm-500" />
                  <h3 className="font-semibold text-warm-900">FTQ History</h3>
                  <span className="text-xs text-warm-500">({vendor.ftq_history.length} recent inspections)</span>
                </div>
                {ftqHistoryExpanded ? (
                  <ChevronDown className="h-4 w-4 text-warm-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-warm-400" />
                )}
              </button>

              {ftqHistoryExpanded && (
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                  {vendor.ftq_history.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-3 rounded-lg border',
                        item.result === 'pass' ? 'bg-green-50 border-green-200' :
                        item.result === 'fail' ? 'bg-red-50 border-red-200' :
                        'bg-amber-50 border-amber-200'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-warm-900">{item.projectName}</span>
                          <span className="text-xs text-warm-500">{item.trade}</span>
                        </div>
                        <ResultBadge result={item.result} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-warm-500">
                        <CalendarDays className="h-3 w-3" />
                        {item.date}
                        {item.defectCategory && (
                          <>
                            <span className="text-warm-300">|</span>
                            <span className="text-amber-600">Defect: {item.defectCategory}</span>
                          </>
                        )}
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-xs text-warm-600 italic">{item.notes}</p>
                      )}
                    </div>
                  ))}

                  {/* Defect Pattern Summary */}
                  <div className="mt-4 p-3 bg-warm-50 rounded-lg border border-warm-200">
                    <h4 className="text-xs font-medium text-warm-700 mb-2">Defect Pattern Analysis</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-warm-600">Box Placement Issues</span>
                        <span className="text-red-600 font-medium">2 occurrences</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-warm-600">Blocking Issues</span>
                        <span className="text-amber-600 font-medium">1 occurrence</span>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-warm-500">
                      <Sparkles className="h-3 w-3 inline mr-1 text-purple-500" />
                      AI Note: Box placement errors are decreasing. Focus training on electrical scope work.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-warm-200 p-4">
              <h3 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-warm-500" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-warm-50 rounded">
                  <p className="text-xs text-warm-500">Total Inspections</p>
                  <p className="text-lg font-bold text-warm-900">{vendor.totalInspections}</p>
                </div>
                <div className="p-2 bg-warm-50 rounded">
                  <p className="text-xs text-warm-500">Pass Rate</p>
                  <p className="text-lg font-bold text-green-600">{vendor.passRate}%</p>
                </div>
                <div className="p-2 bg-warm-50 rounded">
                  <p className="text-xs text-warm-500">Avg Defects/Job</p>
                  <p className="text-lg font-bold text-amber-600">{vendor.avgDefectsPerJob}</p>
                </div>
                <div className="p-2 bg-warm-50 rounded">
                  <p className="text-xs text-warm-500">Warranty Callbacks</p>
                  <p className="text-lg font-bold text-stone-600">{vendor.warrantyCallbackRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Bar */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-sm text-indigo-800">AI Quality Intelligence:</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-indigo-700">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                FTQ improved 6.2% over last 6 months
              </span>
              <span className="text-indigo-300">|</span>
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                On track to reach 95% FTQ target by Q2
              </span>
              <span className="text-indigo-300">|</span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Electrical scope needs attention - 12% lower than framing FTQ
              </span>
              <span className="text-indigo-300">|</span>
              <span>Recommend for Miller Beach House project based on coastal expertise</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Quality Prediction',
            trigger: 'On assignment',
            insight: 'AI predicts vendor FTQ performance on upcoming work based on project complexity, crew availability, and historical patterns.',
            severity: 'info',
          },
          {
            feature: 'Risk Assessment',
            trigger: 'Real-time',
            insight: 'Identifies quality risk factors including crew changes, timeline pressure, weather impacts, and scope complexity.',
            severity: 'warning',
          },
          {
            feature: 'Peer Comparison',
            trigger: 'Daily',
            insight: 'Shows how vendor compares to others in the same trade across FTQ, timeliness, and cost metrics.',
            severity: 'info',
          },
          {
            feature: 'Improvement Recommendations',
            trigger: 'Weekly',
            insight: 'AI suggests specific actions to improve FTQ scores based on defect patterns and industry best practices.',
            severity: 'success',
          },
          {
            feature: 'Optimal Assignment',
            trigger: 'On bid request',
            insight: 'Suggests best project types for this vendor based on FTQ history by scope, complexity, and project characteristics.',
            severity: 'info',
          },
        ]}
        columns={3}
      />
    </div>
  )
}
