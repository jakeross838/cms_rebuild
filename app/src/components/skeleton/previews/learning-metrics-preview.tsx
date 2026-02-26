'use client'

import { useState } from 'react'
import {
  Brain,
  Sparkles,
  Database,
  Activity,
  RefreshCw,
  Globe,
  DollarSign,
  Calendar,
  Shield,
  MessageSquare,
  HardHat,
  Tag,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Zap,
  ArrowRight,
  Network,
  CircleDot,
  Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface TradeMetric {
  num: number
  metric: string
  tracks: string
  accuracy: string
  trend: string
  trendDir: 'up' | 'down' | 'stable'
}

interface MetricCategory {
  id: string
  name: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  iconBg: string
  metrics: TradeMetric[]
}

interface MaterialMetric {
  num: number
  metric: string
  example: string
  datapoints: string
}

interface JobMetric {
  name: string
  value: string
  trend: 'up' | 'down' | 'stable'
  bars: number[]
}

interface LearningAgent {
  name: string
  color: string
  bgColor: string
  flows: string[]
}

// ── Mock Data ─────────────────────────────────────────────────────────

const learningSources = [
  {
    label: 'Industry Knowledge Base',
    detail: 'Pre-loaded',
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    cardBg: 'bg-blue-50',
  },
  {
    label: 'Your Historical Data',
    detail: '142 jobs analyzed',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    cardBg: 'bg-green-50',
  },
  {
    label: 'Error Corrections',
    detail: '2,847 corrections learned',
    icon: RefreshCw,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    cardBg: 'bg-amber-50',
  },
  {
    label: 'Community Learning',
    detail: '10,000+ builders',
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    cardBg: 'bg-purple-50',
  },
]

const metricCategories: MetricCategory[] = [
  {
    id: 'financial',
    name: 'Financial Accuracy',
    icon: DollarSign,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-green-100',
    metrics: [
      { num: 1, metric: 'Bid vs Actual Cost', tracks: 'Total bid vs final invoiced', accuracy: '91.2%', trend: '+2.1%', trendDir: 'up' },
      { num: 2, metric: 'Material Bid vs Actual', tracks: 'Material portion accuracy', accuracy: '88.7%', trend: '+1.4%', trendDir: 'up' },
      { num: 3, metric: 'Labor Bid vs Actual', tracks: 'Labor portion accuracy', accuracy: '85.3%', trend: '+3.2%', trendDir: 'up' },
      { num: 4, metric: 'Change Order Frequency', tracks: '# of COs per trade per job', accuracy: '1.8 avg', trend: '-0.3', trendDir: 'down' },
      { num: 5, metric: 'Change Order Value', tracks: 'Total CO $ per trade per job', accuracy: '$4,200 avg', trend: 'stable', trendDir: 'stable' },
      { num: 6, metric: 'Waste Factor (Est vs Actual)', tracks: 'Estimated waste vs actual', accuracy: '89.1%', trend: '+1.8%', trendDir: 'up' },
      { num: 7, metric: 'Unit Price Accuracy', tracks: '$/SF, $/LF, $/unit accuracy', accuracy: '93.4%', trend: '+0.7%', trendDir: 'up' },
      { num: 8, metric: 'Markup Realization', tracks: 'Planned margin vs actual', accuracy: '96.2%', trend: 'stable', trendDir: 'stable' },
      { num: 9, metric: 'Payment Speed', tracks: 'Days from invoice to payment', accuracy: '18 days avg', trend: '-2 days', trendDir: 'down' },
      { num: 10, metric: 'Back-charge Frequency', tracks: '# back-charges to sub', accuracy: '0.4 avg', trend: '-0.1', trendDir: 'down' },
    ],
  },
  {
    id: 'schedule',
    name: 'Schedule Performance',
    icon: Calendar,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    metrics: [
      { num: 11, metric: 'Duration Est vs Actual', tracks: 'Days estimated vs taken', accuracy: '87.5%', trend: '+2.8%', trendDir: 'up' },
      { num: 12, metric: 'Start Date Reliability', tracks: 'Showed up on time?', accuracy: '82.1%', trend: '+1.5%', trendDir: 'up' },
      { num: 13, metric: 'Daily Production Rate', tracks: 'Units completed per day', accuracy: 'Tracked', trend: '142 entries', trendDir: 'stable' },
      { num: 14, metric: 'Weather Impact Days', tracks: 'Days lost to weather', accuracy: '3.2 avg', trend: 'stable', trendDir: 'stable' },
      { num: 15, metric: 'Prerequisite Wait Time', tracks: 'Hours waiting for prior trade', accuracy: '4.1h avg', trend: '-1.2h', trendDir: 'down' },
      { num: 16, metric: 'Overtime Hours', tracks: 'Regular vs overtime', accuracy: '8.3% avg', trend: 'stable', trendDir: 'stable' },
      { num: 17, metric: 'Schedule Recovery Rate', tracks: 'How fast they catch up', accuracy: '1.4 days/day', trend: 'improving', trendDir: 'up' },
      { num: 18, metric: 'Crew Size vs Productivity', tracks: 'Diminishing returns?', accuracy: 'Tracked', trend: '89 entries', trendDir: 'stable' },
    ],
  },
  {
    id: 'quality',
    name: 'Quality Metrics',
    icon: Shield,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    metrics: [
      { num: 19, metric: 'First-Time Quality (FTQ)', tracks: 'Pass inspection first time', accuracy: '91.4%', trend: '+1.2%', trendDir: 'up' },
      { num: 20, metric: 'Punch List Items', tracks: 'Items per trade per job', accuracy: '3.2 avg', trend: '-0.8', trendDir: 'down' },
      { num: 21, metric: 'Callback Rate (1yr)', tracks: 'Warranty callbacks year 1', accuracy: '0.7 avg', trend: '-0.2', trendDir: 'down' },
      { num: 22, metric: 'Inspection Pass Rate', tracks: 'Inspections passed first try', accuracy: '94.1%', trend: 'stable', trendDir: 'stable' },
      { num: 23, metric: 'Rework Events', tracks: 'Tear-out-and-redo count', accuracy: '0.3 avg', trend: '-0.1', trendDir: 'down' },
      { num: 24, metric: 'Rework Cost', tracks: '$ spent on rework', accuracy: '$1,200 avg', trend: '-$400', trendDir: 'down' },
      { num: 25, metric: 'Photo Documentation', tracks: '% work photographed', accuracy: '78.3%', trend: '+5.1%', trendDir: 'up' },
      { num: 26, metric: 'Defect Severity', tracks: 'Worst defect level', accuracy: 'Tracked', trend: 'Pattern data', trendDir: 'stable' },
    ],
  },
  {
    id: 'communication',
    name: 'Communication & Professionalism',
    icon: MessageSquare,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    metrics: [
      { num: 27, metric: 'Response Time', tracks: 'Hours to respond', accuracy: '4.2h avg', trend: '-1.1h', trendDir: 'down' },
      { num: 28, metric: 'CO Response Time', tracks: 'Days to return CO pricing', accuracy: '2.8 days', trend: '-0.5', trendDir: 'down' },
      { num: 29, metric: 'RFI Turnaround', tracks: 'Days to answer RFIs', accuracy: '1.9 days', trend: 'stable', trendDir: 'stable' },
      { num: 30, metric: 'Documentation Complete', tracks: 'Required docs on file', accuracy: '84.7%', trend: '+3.2%', trendDir: 'up' },
      { num: 31, metric: 'Meeting Attendance', tracks: '% meetings attended', accuracy: '91.2%', trend: 'stable', trendDir: 'stable' },
      { num: 32, metric: 'Issue Escalation Rate', tracks: '% escalated to PM', accuracy: '12.3%', trend: '-2.1%', trendDir: 'down' },
      { num: 33, metric: 'Client Complaints', tracks: 'Homeowner complaints', accuracy: '0.2 avg', trend: 'stable', trendDir: 'stable' },
    ],
  },
  {
    id: 'safety',
    name: 'Safety & Compliance',
    icon: HardHat,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    metrics: [
      { num: 34, metric: 'Safety Incidents', tracks: 'Incidents count', accuracy: '0.1 avg', trend: 'stable', trendDir: 'stable' },
      { num: 35, metric: 'Insurance Current', tracks: 'COI tracked', accuracy: '97.8%', trend: '+1.2%', trendDir: 'up' },
      { num: 36, metric: 'License Current', tracks: 'License tracked', accuracy: '99.1%', trend: 'stable', trendDir: 'stable' },
      { num: 37, metric: 'OSHA Violations', tracks: 'Violations observed', accuracy: '0.0 avg', trend: 'stable', trendDir: 'stable' },
      { num: 38, metric: 'Cleanup Score', tracks: 'Site condition (1-10)', accuracy: '7.8 avg', trend: '+0.3', trendDir: 'up' },
    ],
  },
]

const contextualTags = [
  { label: 'Project Type', values: ['New Construction (64%)', 'Remodel (28%)', 'Addition (8%)'] },
  { label: 'Complexity', values: ['Simple (20%)', 'Standard (45%)', 'Complex (30%)', 'Custom (5%)'] },
  { label: 'Price Range', values: ['$500K-$1M (15%)', '$1M-$2M (40%)', '$2M-$5M (35%)', '$5M+ (10%)'] },
  { label: 'Region', values: ['Coastal (72%)', 'Inland (28%)'] },
  { label: 'Season', values: ['Spring (28%)', 'Summer (32%)', 'Fall (24%)', 'Winter (16%)'] },
  { label: 'Crew Lead', values: ['Mike T. (18 jobs)', 'Jose R. (14 jobs)', 'Dave K. (12 jobs)', 'Chris L. (9 jobs)', 'Brian M. (7 jobs)'] },
  { label: 'Material Brands', values: ['Marvin (42)', 'Pella (38)', 'James Hardie (35)', 'Trex (28)', 'Kohler (24)', 'Viking (18)', 'Sub-Zero (15)', 'Benjamin Moore (48)', 'Sherwin-Williams (44)', 'GAF (32)'] },
]

const materialMetrics: MaterialMetric[] = [
  { num: 1, metric: 'Price per unit (over time)', example: 'LVL Beam: $14.20/LF to $15.80/LF (12mo)', datapoints: '2,341' },
  { num: 2, metric: 'Lead time (quoted vs actual)', example: 'Quoted: 3wk, Actual avg: 4.2wk', datapoints: '567' },
  { num: 3, metric: 'Defect rate', example: 'Porcelain tile: 2.1% defect rate', datapoints: '234' },
  { num: 4, metric: 'Return rate', example: 'Cabinet hardware: 4.3% return rate', datapoints: '189' },
  { num: 5, metric: 'Waste factor (est vs actual)', example: 'Drywall: Est 10%, Actual 8.2%', datapoints: '456' },
  { num: 6, metric: 'Vendor reliability per material', example: 'ABC Lumber: 94% on-time for framing', datapoints: '678' },
  { num: 7, metric: 'Regional price variance', example: 'Coastal +12% vs inland baseline', datapoints: '1,234' },
  { num: 8, metric: 'Seasonal price patterns', example: 'Lumber peaks May-Jul (+18%)', datapoints: '3,456' },
  { num: 9, metric: 'Substitution success rate', example: 'Alternative tiles: 87% client approval', datapoints: '123' },
  { num: 10, metric: 'Client satisfaction per product', example: 'Viking appliances: 4.8/5.0', datapoints: '89' },
  { num: 11, metric: 'Warranty claim rate', example: 'Composite decking: 1.2% claim rate', datapoints: '234' },
  { num: 12, metric: 'Installation difficulty', example: 'Natural stone: 4.2/5.0 difficulty', datapoints: '345' },
]

const jobMetrics: JobMetric[] = [
  { name: 'Budget Accuracy', value: '91.2%', trend: 'up', bars: [70, 78, 82, 86, 91] },
  { name: 'Schedule Accuracy', value: '87.5%', trend: 'up', bars: [65, 72, 78, 83, 87] },
  { name: 'Change Order Ratio', value: '8.4% of contract', trend: 'down', bars: [14, 12, 10, 9, 8] },
  { name: 'Client Satisfaction', value: '4.6/5.0', trend: 'up', bars: [72, 80, 85, 88, 92] },
  { name: 'Warranty Claims (1yr)', value: '2.1 avg', trend: 'down', bars: [50, 42, 35, 28, 21] },
  { name: 'Profit Margin Realized', value: '18.4%', trend: 'stable', bars: [80, 82, 78, 84, 82] },
  { name: 'Communication Volume', value: '847 msgs/job avg', trend: 'stable', bars: [75, 80, 82, 85, 84] },
  { name: 'Decision Turnaround', value: '1.8 days avg', trend: 'down', bars: [60, 50, 42, 35, 28] },
  { name: 'Document Completeness', value: '92.1%', trend: 'up', bars: [68, 74, 80, 86, 92] },
  { name: 'AI Prediction Accuracy', value: '94.2%', trend: 'up', bars: [72, 80, 86, 90, 94] },
]

const crossModuleAgents: LearningAgent[] = [
  { name: 'Estimating AI', color: 'text-green-700', bgColor: 'bg-green-50', flows: ['Bid vs actual costs', 'Material waste factors', 'Labor productivity rates'] },
  { name: 'Scheduling AI', color: 'text-blue-700', bgColor: 'bg-blue-50', flows: ['Duration accuracy', 'Crew speed data', 'Weather impact patterns'] },
  { name: 'Bidding AI', color: 'text-purple-700', bgColor: 'bg-purple-50', flows: ['Vendor scorecards', 'Price competitiveness', 'Reliability ratings'] },
  { name: 'Communication AI', color: 'text-orange-700', bgColor: 'bg-orange-50', flows: ['Response time patterns', 'Issue escalation triggers', 'Client satisfaction signals'] },
  { name: 'Procurement AI', color: 'text-teal-700', bgColor: 'bg-teal-50', flows: ['Material price trends', 'Lead time accuracy', 'Vendor performance per material'] },
  { name: 'Quality AI', color: 'text-amber-700', bgColor: 'bg-amber-50', flows: ['FTQ scores', 'Punch list patterns', 'Rework frequency data'] },
]

// ── Component ─────────────────────────────────────────────────────────

function TrendIcon({ dir }: { dir: 'up' | 'down' | 'stable' }): React.ReactElement {
  if (dir === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />
  if (dir === 'down') return <TrendingDown className="h-3 w-3 text-blue-500" />
  return <Minus className="h-3 w-3 text-stone-400" />
}

export function LearningMetricsPreview(): React.ReactElement {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['financial'])
  )

  const toggleCategory = (id: string): void => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Dark Gradient Header ───────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Self-Learning Metrics Dashboard</h1>
              <p className="text-sm text-slate-400">
                67 metrics across trades, materials, and jobs &mdash; every datapoint makes the AI smarter
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">45</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Trade Metrics</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">12</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Material Metrics</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">10</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Job Metrics</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">94.2%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">AI Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Learning Progress Overview ─────────────────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-900">Learning Progress Overview</div>
              <div className="text-xs text-warm-500">4 training sources that compound over time</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 4 source cards */}
          <div className="grid grid-cols-4 gap-3">
            {learningSources.map((source) => (
              <div
                key={source.label}
                className={cn(
                  'rounded-lg border p-3',
                  source.cardBg,
                  source.borderColor,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', source.bgColor)}>
                    <source.icon className={cn('h-4 w-4', source.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-warm-900 truncate">{source.label}</div>
                    <div className={cn('text-[10px] font-medium', source.color)}>{source.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Maturity Progress Bar */}
          <div className="bg-warm-50 rounded-lg border border-warm-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-warm-600" />
              <span className="text-sm font-semibold text-warm-900">AI Maturity</span>
            </div>

            {/* Progress bar */}
            <div className="relative mb-2">
              <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-green-500 rounded-full transition-all"
                  style={{ width: '78%' }}
                />
              </div>
              {/* Position marker */}
              <div
                className="absolute top-[-4px] h-5 w-0.5 bg-warm-900 rounded"
                style={{ left: '78%' }}
              />
            </div>

            {/* Stage labels */}
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-warm-500">Cold Start</span>
              <span className="text-warm-500">Learning</span>
              <span className="text-amber-700 font-bold">Calibrated</span>
              <span className="text-warm-500">Expert</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-warm-400 mb-2">
              <span>0-10 jobs</span>
              <span>10-30 jobs</span>
              <span>30-50 jobs</span>
              <span>50+ jobs</span>
            </div>

            <div className="text-center">
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                42 jobs &mdash; Calibrated (78%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Trade Performance Metrics (45 metrics) ─────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-900">Trade Performance Metrics</div>
              <div className="text-xs text-warm-500">45 metrics across 5 categories + 7 contextual tags</div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-warm-100">
          {metricCategories.map((cat) => {
            const isExpanded = expandedCategories.has(cat.id)
            const IconComp = cat.icon
            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors"
                >
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', cat.iconBg)}>
                    <IconComp className={cn('h-4 w-4', cat.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={cn('text-sm font-semibold', cat.color)}>{cat.name}</div>
                    <div className="text-xs text-warm-500">{cat.metrics.length} metrics tracked</div>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded',
                    cat.bgColor,
                    cat.color,
                  )}>
                    #{cat.metrics[0].num}-{cat.metrics[cat.metrics.length - 1].num}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-warm-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-warm-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3">
                    <div className="overflow-hidden rounded-lg border border-warm-100">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-warm-50 text-warm-600">
                            <th scope="col" className="px-3 py-2 text-left font-medium w-8">#</th>
                            <th scope="col" className="px-3 py-2 text-left font-medium">Metric</th>
                            <th scope="col" className="px-3 py-2 text-left font-medium">What It Tracks</th>
                            <th scope="col" className="px-3 py-2 text-right font-medium">Current</th>
                            <th scope="col" className="px-3 py-2 text-right font-medium w-24">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-warm-50">
                          {cat.metrics.map((m) => (
                            <tr key={m.num} className="hover:bg-warm-50/50">
                              <td className="px-3 py-2 text-warm-400 font-mono">{m.num}</td>
                              <td className="px-3 py-2 font-medium text-warm-900">{m.metric}</td>
                              <td className="px-3 py-2 text-warm-500">{m.tracks}</td>
                              <td className="px-3 py-2 text-right font-semibold text-warm-800">{m.accuracy}</td>
                              <td className="px-3 py-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <TrendIcon dir={m.trendDir} />
                                  <span className={cn(
                                    'text-[10px] font-medium',
                                    m.trendDir === 'up' && 'text-green-600',
                                    m.trendDir === 'down' && 'text-blue-600',
                                    m.trendDir === 'stable' && 'text-stone-400',
                                  )}>
                                    {m.trendDir === 'up' && '\u2191'}{m.trendDir === 'down' && '\u2193'}{m.trendDir === 'stable' && '\u2192'} {m.trend}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Contextual Tags section */}
          <div>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center">
                <Tag className="h-4 w-4 text-stone-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-stone-700">Contextual Tags</div>
                <div className="text-xs text-warm-500">7 contextual dimensions for every trade data point</div>
              </div>
            </div>
            <div className="px-4 pb-4 space-y-3">
              {contextualTags.map((tag) => (
                <div key={tag.label}>
                  <div className="text-[10px] font-semibold text-warm-600 uppercase tracking-wider mb-1.5">
                    {tag.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tag.values.map((val) => (
                      <span
                        key={val}
                        className="text-[10px] px-2 py-1 rounded bg-stone-100 text-stone-700 font-medium border border-stone-200"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Material Metrics (12 metrics) ──────────────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <Database className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-900">Material Metrics</div>
              <div className="text-xs text-warm-500">12 material-level metrics tracked across every product</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-warm-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-warm-50 text-warm-600">
                  <th scope="col" className="px-3 py-2 text-left font-medium w-8">#</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Metric</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Example</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium w-24">Datapoints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-50">
                {materialMetrics.map((m) => (
                  <tr key={m.num} className="hover:bg-warm-50/50">
                    <td className="px-3 py-2 text-warm-400 font-mono">{m.num}</td>
                    <td className="px-3 py-2 font-medium text-warm-900">{m.metric}</td>
                    <td className="px-3 py-2 text-warm-500">{m.example}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                        {m.datapoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. Job Aggregate Metrics (10 metrics) ─────────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-900">Job Aggregate Metrics</div>
              <div className="text-xs text-warm-500">10 project-level metrics that summarize overall performance</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {jobMetrics.map((jm) => (
              <div
                key={jm.name}
                className="rounded-lg border border-warm-100 p-3 hover:bg-warm-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-warm-900">{jm.name}</span>
                  <div className="flex items-center gap-1">
                    <TrendIcon dir={jm.trend} />
                    <span className={cn(
                      'text-[10px] font-medium',
                      jm.trend === 'up' && 'text-green-600',
                      jm.trend === 'down' && 'text-blue-600',
                      jm.trend === 'stable' && 'text-stone-400',
                    )}>
                      {jm.trend === 'up' && '\u2191'}{jm.trend === 'down' && '\u2193'}{jm.trend === 'stable' && '\u2192'}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold text-warm-800 mb-2">{jm.value}</div>
                {/* Sparkline-style mini bars */}
                <div className="flex items-end gap-0.5 h-4">
                  {jm.bars.map((bar, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex-1 rounded-sm',
                        idx === jm.bars.length - 1
                          ? 'bg-amber-400'
                          : 'bg-warm-200',
                      )}
                      style={{ height: `${(bar / 100) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Cross-Module Learning Flow ─────────────────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Network className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-900">Cross-Module Learning Flow</div>
              <div className="text-xs text-warm-500">How data flows between AI agents from the central Trade Intuition engine</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Central hub */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 rounded-xl px-6 py-3 flex items-center gap-3">
              <Brain className="h-6 w-6 text-amber-600" />
              <div>
                <div className="text-sm font-bold text-amber-800">Trade Intuition</div>
                <div className="text-[10px] text-amber-600">Central learning engine — 45 metrics, 142 jobs</div>
              </div>
            </div>
          </div>

          {/* Connection arrows */}
          <div className="flex items-center justify-center gap-1 text-warm-300">
            <ArrowRight className="h-3 w-3 rotate-90" />
            <span className="text-[9px] text-warm-400 font-medium">Feeds data to all agents</span>
            <ArrowRight className="h-3 w-3 rotate-90" />
          </div>

          {/* Agent cards */}
          <div className="grid grid-cols-3 gap-3">
            {crossModuleAgents.map((agent) => (
              <div
                key={agent.name}
                className={cn('rounded-lg border p-3', agent.bgColor, 'border-warm-200')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Link className={cn('h-3.5 w-3.5', agent.color)} />
                  <span className={cn('text-xs font-bold', agent.color)}>{agent.name}</span>
                </div>
                <div className="space-y-1">
                  {agent.flows.map((flow) => (
                    <div key={flow} className="flex items-start gap-1.5 text-[10px] text-warm-600">
                      <CircleDot className="h-2.5 w-2.5 mt-0.5 shrink-0 text-warm-400" />
                      <span>{flow}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. Live Learning Example ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warm-900">Live Learning Example</div>
              <div className="text-xs text-warm-500">Real-time AI adjustment from a completed trade</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-warm-50 rounded-lg border border-warm-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-bold text-warm-900">Learning Event #2,847 &mdash; Just Now</span>
            </div>
            <p className="text-xs text-warm-600 mb-3">
              Framing on Smith Residence completed. Duration: 12 days (estimated 10). Trade Intuition updating:
            </p>

            <div className="space-y-2">
              {[
                { agent: 'Estimating AI', update: 'Framing duration for $2M coastal updated to 12 days (was 10)', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
                { agent: 'Scheduling AI', update: 'ABC Framing crew speed adjusted -16.7%', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
                { agent: 'Bidding AI', update: 'ABC Framing schedule score -3 points', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
                { agent: 'Quality AI', update: 'FTQ 94% (above average \u2014 compensates for schedule)', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
              ].map((item) => (
                <div
                  key={item.agent}
                  className={cn('flex items-start gap-2 rounded-lg border p-2', item.bg, item.border)}
                >
                  <ArrowRight className={cn('h-3 w-3 mt-0.5 shrink-0', item.color)} />
                  <div>
                    <span className={cn('text-[10px] font-bold', item.color)}>{item.agent}:</span>
                    <span className="text-[10px] text-warm-600 ml-1">{item.update}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 bg-amber-50 rounded-lg border border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-amber-800">Net Assessment: </span>
                  <span className="text-[10px] text-amber-700">
                    &ldquo;Slower but higher quality. AI will recommend ABC Framing for quality-critical path work, not schedule-critical.&rdquo;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. AI Insights Bar ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 rounded-xl border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-200/50 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-800 mb-1">
              AI Learning at Scale
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              AI has processed 142 completed jobs with 45 metrics each = 6,390 trade performance records.
              Material database contains 2,341 price points across 340 products. Prediction accuracy has
              improved 12.4% since job #20. Next accuracy milestone: 95% at approximately job #55.
            </p>
          </div>
        </div>
      </div>

      {/* ── 9. AI Features Panel ──────────────────────────────── */}
      <AIFeaturesPanel
        features={[
          {
            feature: 'Trade Performance Scoring',
            confidence: 94,
            severity: 'success' as const,
            insight: 'Scores every trade across 45 metrics. After 142 jobs, bid-to-actual accuracy is 91.2% and improving 2.1% per quarter.',
          },
          {
            feature: 'Material Price Prediction',
            confidence: 91,
            severity: 'success' as const,
            insight: 'Tracks 2,341 price points across 340 products. Seasonal patterns and regional variances detected with 91% accuracy.',
          },
          {
            feature: 'Duration Forecasting',
            confidence: 87,
            severity: 'info' as const,
            insight: 'Predicts trade durations based on project type, crew, and complexity. Currently 87.5% accurate and improving 2.8% per quarter.',
          },
          {
            feature: 'Vendor Reliability Index',
            confidence: 93,
            severity: 'success' as const,
            insight: 'Composite reliability score from schedule adherence, quality, communication, and cost accuracy across all tracked trades.',
          },
          {
            feature: 'Cross-Module Pattern Detection',
            severity: 'info' as const,
            insight: '847 patterns identified across modules. Correlations between weather, crew performance, material quality, and client satisfaction surfaced automatically.',
          },
          {
            feature: 'Anomaly Detection',
            confidence: 99,
            severity: 'success' as const,
            insight: '99.1% specificity in identifying cost anomalies, schedule deviations, and quality outliers. Zero false-positive safety alerts.',
          },
        ]}
      />
    </div>
  )
}
