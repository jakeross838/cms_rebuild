'use client'

import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface MatchExplanationTooltipProps {
  type: 'vendor' | 'cost_code'
  confidence: number
  extractedText: string
  matchedText: string
  autoAssigned: boolean
}

export function MatchExplanationTooltip({
  type,
  confidence,
  extractedText,
  matchedText,
  autoAssigned,
}: MatchExplanationTooltipProps) {
  const pct = Math.round(confidence * 100)

  const strategies =
    type === 'vendor'
      ? 'exact match, containment, string similarity (Levenshtein), token overlap (Jaccard)'
      : 'exact match, containment, Levenshtein, Jaccard, token-fuzzy'

  const matchLabel =
    type === 'vendor' ? 'name similarity' : 'code/description similarity'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Why this suggestion?"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs bg-popover text-popover-foreground border border-border shadow-md px-3 py-2"
      >
        <div className="space-y-1 text-xs">
          <p>
            Matched using {matchLabel}.{' '}
            <span className="text-muted-foreground">
              &apos;{extractedText}&apos; &rarr; &apos;{matchedText}&apos;
            </span>{' '}
            ({pct}% confidence).
          </p>
          <p className="text-muted-foreground">
            Strategies: {strategies}.
          </p>
          <p className="font-medium">
            {autoAssigned ? 'Auto-assigned (above threshold).' : 'Manual review recommended.'}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
