'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { AccuracyEnginePreview } from '@/components/skeleton/previews/accuracy-engine-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AccuracyEnginePage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? (
        <AccuracyEnginePreview />
      ) : (
        <PageSpec
          title="AI Accuracy Engine"
          phase="Phase 2 - Intelligence"
          planFile="docs/architecture/ai-engine-design.md"
          description="6-layer validation system that catches errors before they become costly mistakes. From live data entry guardrails to cross-reference validation and historical pattern matching, the Accuracy Engine ensures every number in RossOS makes sense."
          workflow={['Data enters the system (estimate, PO, invoice, daily log, etc.)', 'System 1: Reasonableness Bounds — does this number make sense?', 'System 2: Cross-Reference Validation — do the numbers agree across modules?', 'System 3: Plan-to-Data Reconciliation — does paperwork match plans?', 'System 4: Historical Pattern Matching — is this normal for your company?', 'System 5: Contract vs Estimate Reconciliation — does contract match what we priced?', 'System 6: Live Data Entry Guardrails — catching errors AS you type', 'Confidence flag shown (Safety Block / Strong Rec / Suggestion / Nudge / Info)', 'User confirms or overrides — override reason recorded for learning']}
          features={['Reasonableness Bounds with per-item high/low/extreme ranges', 'Cross-Reference Validation across budgets, POs, invoices, and draws', 'Plan-to-Data Reconciliation matching takeoffs to entered quantities', 'Historical Pattern Matching from completed project data', 'Contract vs Estimate Reconciliation catching scope drift', 'Live Data Entry Guardrails with real-time feedback', 'Accuracy Dashboard with error trends and savings tracking', 'Feedback Loop — learns from every confirm and override', '5-level confidence flag system (red/orange/amber/blue/white)', 'Bounds auto-update from completed projects']}
          connections={[
            { name: 'Estimating Engine', type: 'bidirectional', description: 'Validates estimates and learns from actual costs' },
            { name: 'Budget & Cost Tracking', type: 'input', description: 'Checks budget entries against historical and plan data' },
            { name: 'Trade Intuition AI', type: 'bidirectional', description: 'Feeds validation data to trade knowledge; receives trade-specific bounds' },
          ]}
          aiFeatures={[
            { name: 'Reasonableness Bounds', description: 'Auto-calculated min/max/extreme ranges per item type from 23+ completed projects' },
            { name: 'Cross-Reference Engine', description: 'Catches mismatches between budget, POs, invoices, draws — saved $37K on one fireplace error' },
            { name: 'Override Learning', description: 'Every confirm/override trains the model — false positive rate drops with each project' },
          ]}
        />
      )}
    </div>
  )
}
