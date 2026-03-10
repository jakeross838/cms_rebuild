'use client'

import Link from 'next/link'

import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExtractionMetrics } from '@/hooks/use-invoices'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricsData {
  summary: {
    totalExtractions: number
    completed: number
    failed: number
    processing: number
    reviewed: number
    accuracyRate: number | null
    avgConfidence: number | null
    avgProcessingTimeMs: number | null
  }
  corrections: {
    totalCorrections: number
    extractionsWithCorrections: number
    correctionRate: number | null
    topCorrectedFields: Array<{ field: string; count: number }>
  }
  confidenceDistribution: {
    high: number
    medium: number
    low: number
  }
  monthlyTrend: Array<{
    month: string
    total: number
    reviewed: number
    corrected: number
    avgConfidence: number | null
  }>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatFieldName(field: string): string {
  return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExtractionMetricsPage() {
  const { data: rawData, isLoading } = useExtractionMetrics()
  const metrics = (rawData as { data?: MetricsData })?.data as MetricsData | undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="text-base font-medium text-foreground">Failed to load metrics</p>
          <Link href="/invoices/extractions" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Back to Queue</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { summary, corrections, confidenceDistribution, monthlyTrend } = metrics
  const totalConfDist = confidenceDistribution.high + confidenceDistribution.medium + confidenceDistribution.low

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/invoices/extractions"
            className="mt-1 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              AI Extraction Metrics
            </h1>
            <p className="text-muted-foreground">
              Performance and accuracy trends for AI invoice processing
            </p>
          </div>
        </div>
        <Link href="/settings/general?tab=ai">
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Extractions"
          value={summary.totalExtractions}
          icon={BarChart3}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Accuracy Rate"
          value={summary.accuracyRate != null ? `${summary.accuracyRate}%` : '—'}
          icon={TrendingUp}
          bgColor="bg-emerald-50"
          textColor="text-emerald-700"
          iconColor="text-emerald-500"
        />
        <StatCard
          label="Avg. Confidence"
          value={summary.avgConfidence != null ? `${summary.avgConfidence}%` : '—'}
          icon={CheckCircle2}
          bgColor="bg-amber-50"
          textColor="text-amber-700"
          iconColor="text-amber-500"
        />
        <StatCard
          label="Avg. Processing"
          value={summary.avgProcessingTimeMs != null ? formatMs(summary.avgProcessingTimeMs) : '—'}
          icon={Clock}
          bgColor="bg-stone-50"
          textColor="text-stone-700"
          iconColor="text-stone-500"
        />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Confidence Distribution</h2>
          {totalConfDist > 0 ? (
            <div className="space-y-3">
              <ConfidenceBar
                label="High (90%+)"
                count={confidenceDistribution.high}
                total={totalConfDist}
                color="bg-emerald-500"
              />
              <ConfidenceBar
                label="Medium (70-90%)"
                count={confidenceDistribution.medium}
                total={totalConfDist}
                color="bg-amber-500"
              />
              <ConfidenceBar
                label="Low (<70%)"
                count={confidenceDistribution.low}
                total={totalConfDist}
                color="bg-red-500"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </div>

        {/* Correction Stats */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Corrections</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{corrections.totalCorrections}</p>
              <p className="text-xs text-muted-foreground">Total field corrections</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {corrections.correctionRate != null ? `${corrections.correctionRate}%` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Invoices needing corrections</p>
            </div>
          </div>
          {corrections.topCorrectedFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Most corrected fields
              </p>
              <div className="space-y-1.5">
                {corrections.topCorrectedFields.map(f => (
                  <div key={f.field} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{formatFieldName(f.field)}</span>
                    <span className="text-muted-foreground font-mono text-xs">{f.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Trend</h2>
        {monthlyTrend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Month</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Extractions</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Reviewed</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Corrected</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Avg. Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlyTrend.map(m => (
                  <tr key={m.month}>
                    <td className="py-2 text-foreground">{m.month}</td>
                    <td className="py-2 text-right font-mono">{m.total}</td>
                    <td className="py-2 text-right font-mono">{m.reviewed}</td>
                    <td className="py-2 text-right font-mono">{m.corrected}</td>
                    <td className="py-2 text-right">
                      {m.avgConfidence != null ? (
                        <span className={cn(
                          'font-mono',
                          m.avgConfidence >= 90 ? 'text-emerald-600' :
                          m.avgConfidence >= 70 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {m.avgConfidence}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet</p>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatusStat label="Completed" value={summary.completed} icon={CheckCircle2} className="text-emerald-600" />
          <StatusStat label="Reviewed" value={summary.reviewed} icon={CheckCircle2} className="text-blue-600" />
          <StatusStat label="Processing" value={summary.processing} icon={Loader2} className="text-amber-600" />
          <StatusStat label="Failed" value={summary.failed} icon={XCircle} className="text-red-600" />
          <StatusStat label="Total" value={summary.totalExtractions} icon={BarChart3} className="text-foreground" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label, value, icon: Icon, bgColor, textColor, iconColor,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  iconColor: string
}) {
  return (
    <div className={cn('rounded-lg p-3', bgColor)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-3.5 w-3.5', iconColor)} />
        <span className={cn('text-xs font-medium truncate', textColor)}>{label}</span>
      </div>
      <div className={cn('text-lg font-bold', textColor)}>{value}</div>
    </div>
  )
}

function ConfidenceBar({
  label, count, total, color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground font-mono text-xs">{count} ({pct}%)</span>
      </div>
      <div className="h-2 w-full rounded-full bg-stone-200">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatusStat({
  label, value, icon: Icon, className,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  className: string
}) {
  return (
    <div className="text-center">
      <Icon className={cn('h-5 w-5 mx-auto mb-1', className)} />
      <p className={cn('text-xl font-bold', className)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
