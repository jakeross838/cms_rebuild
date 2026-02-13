'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  Lightbulb,
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────

export interface AIFeatureCardProps {
  /** Name of the AI feature (e.g., "Cost Estimation", "Schedule Impact") */
  feature: string
  /** When this insight is triggered (e.g., "On creation", "Real-time", "Daily") */
  trigger?: string
  /** The actual AI insight text */
  insight: string
  /** Optional detailed explanation */
  detail?: string
  /** Confidence score 0-100 */
  confidence?: number
  /** Priority/severity: info, warning, success, critical */
  severity?: 'info' | 'warning' | 'success' | 'critical'
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** When the insight was generated */
  timestamp?: Date
  /** Whether the card is collapsible */
  collapsible?: boolean
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Custom icon */
  icon?: React.ReactNode
  /** Additional class names */
  className?: string
}

// ── Severity config ─────────────────────────────────────────────

const severityConfig = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
  },
}

const severityIcons = {
  info: Lightbulb,
  warning: AlertTriangle,
  success: CheckCircle2,
  critical: Zap,
}

// ── Trigger badge config ────────────────────────────────────────

const triggerConfig: Record<string, { icon: typeof Clock; label: string }> = {
  'real-time': { icon: Zap, label: 'Real-time' },
  'on-creation': { icon: Sparkles, label: 'On creation' },
  'daily': { icon: Clock, label: 'Daily' },
  'weekly': { icon: Clock, label: 'Weekly' },
  'on-change': { icon: TrendingUp, label: 'On change' },
  'on-submission': { icon: Target, label: 'On submission' },
}

// ── Confidence meter ────────────────────────────────────────────

function ConfidenceMeter({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 80) return 'bg-emerald-500'
    if (value >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{value}%</span>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────

export function AIFeatureCard({
  feature,
  trigger,
  insight,
  detail,
  confidence,
  severity = 'info',
  action,
  timestamp,
  collapsible = false,
  defaultCollapsed = false,
  icon,
  className,
}: AIFeatureCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const config = severityConfig[severity]
  const SeverityIcon = severityIcons[severity]

  // Normalize trigger for lookup
  const normalizedTrigger = trigger?.toLowerCase().replace(/\s+/g, '-')
  const triggerInfo = normalizedTrigger ? triggerConfig[normalizedTrigger] : null
  const TriggerIcon = triggerInfo?.icon || Clock

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        config.bg,
        config.border,
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-start gap-2',
          collapsible && 'cursor-pointer'
        )}
        onClick={handleToggle}
      >
        {/* Icon */}
        <div className={cn('mt-0.5', config.icon)}>
          {icon || <Brain className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Feature name + trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-sm font-medium', config.text)}>
              {feature}
            </span>
            {trigger && (
              <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', config.badge)}>
                <TriggerIcon className="h-2.5 w-2.5" />
                {triggerInfo?.label || trigger}
              </span>
            )}
            {confidence !== undefined && (
              <ConfidenceMeter value={confidence} />
            )}
          </div>

          {/* Insight text */}
          {(!collapsible || !isCollapsed) && (
            <p className={cn('mt-1 text-sm', config.text)}>
              {insight}
            </p>
          )}

          {/* Detail (if expanded) */}
          {detail && !isCollapsed && (
            <p className="mt-2 text-xs text-muted-foreground">
              {detail}
            </p>
          )}

          {/* Footer: timestamp + action */}
          {(!collapsible || !isCollapsed) && (timestamp || action) && (
            <div className="mt-2 flex items-center justify-between">
              {timestamp && (
                <span className="text-[10px] text-muted-foreground">
                  {timestamp.toLocaleString()}
                </span>
              )}
              {action && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    action.onClick()
                  }}
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded transition-colors',
                    'bg-white/50 hover:bg-white',
                    config.text
                  )}
                >
                  {action.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {collapsible && (
          <div className={cn('mt-0.5', config.icon)}>
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── AI Features Panel (groups multiple cards) ───────────────────

export interface AIFeaturesPanelProps {
  title?: string
  features: AIFeatureCardProps[]
  columns?: 1 | 2 | 3
  className?: string
}

export function AIFeaturesPanel({
  title = 'AI Insights',
  features,
  columns = 1,
  className,
}: AIFeaturesPanelProps) {
  if (features.length === 0) return null

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          ({features.length} insight{features.length !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Cards grid */}
      <div className={cn('grid gap-3', gridCols[columns])}>
        {features.map((feature, index) => (
          <AIFeatureCard key={`${feature.feature}-${index}`} {...feature} />
        ))}
      </div>
    </div>
  )
}

// ── Compact AI Insight (for inline use) ─────────────────────────

export interface AIInsightBadgeProps {
  insight: string
  severity?: 'info' | 'warning' | 'success' | 'critical'
  className?: string
}

export function AIInsightBadge({
  insight,
  severity = 'info',
  className,
}: AIInsightBadgeProps) {
  const config = severityConfig[severity]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
        config.bg,
        config.text,
        className
      )}
    >
      <Brain className="h-3 w-3" />
      <span>{insight}</span>
    </div>
  )
}
