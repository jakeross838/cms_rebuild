import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Confidence level helpers
// ---------------------------------------------------------------------------

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very-low'

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.85) return 'high'
  if (confidence >= 0.70) return 'medium'
  if (confidence >= 0.50) return 'low'
  return 'very-low'
}

export function getConfidenceLabel(confidence: number): string {
  const level = getConfidenceLevel(confidence)
  switch (level) {
    case 'high': return 'High'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    case 'very-low': return 'Very Low'
  }
}

const BADGE_STYLES: Record<ConfidenceLevel, string> = {
  'high': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'medium': 'bg-amber-100 text-amber-700 border-amber-200',
  'low': 'bg-orange-100 text-orange-700 border-orange-200',
  'very-low': 'bg-red-100 text-red-700 border-red-200',
}

const BAR_COLORS: Record<ConfidenceLevel, string> = {
  'high': 'bg-emerald-500',
  'medium': 'bg-amber-500',
  'low': 'bg-orange-500',
  'very-low': 'bg-red-500',
}

const TEXT_COLORS: Record<ConfidenceLevel, string> = {
  'high': 'text-emerald-600',
  'medium': 'text-amber-600',
  'low': 'text-orange-600',
  'very-low': 'text-red-600',
}

// ---------------------------------------------------------------------------
// AIConfidenceBadge
// ---------------------------------------------------------------------------

interface AIConfidenceBadgeProps {
  confidence: number
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function AIConfidenceBadge({
  confidence,
  label,
  showPercent = true,
  size = 'sm',
  className,
}: AIConfidenceBadgeProps) {
  const level = getConfidenceLevel(confidence)
  const percent = Math.round(confidence * 100)

  return (
    <Badge
      variant="outline"
      className={cn(
        BADGE_STYLES[level],
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1',
        'font-medium',
        className,
      )}
    >
      {label && <span className="mr-1">{label}:</span>}
      {showPercent ? `${percent}%` : getConfidenceLabel(confidence)}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// AIConfidenceBar
// ---------------------------------------------------------------------------

interface AIConfidenceBarProps {
  confidence: number
  label?: string
  className?: string
}

export function AIConfidenceBar({ confidence, label, className }: AIConfidenceBarProps) {
  const level = getConfidenceLevel(confidence)
  const percent = Math.round(confidence * 100)

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={TEXT_COLORS[level]}>{percent}%</span>
        </div>
      )}
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', BAR_COLORS[level])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
