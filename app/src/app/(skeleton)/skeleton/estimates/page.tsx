'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { EstimatesPreview } from '@/components/skeleton/previews/estimates-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts', 'Jobs', 'Budget'
]

export default function EstimatesListSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <EstimatesPreview />
      ) : (
        <PageSpec
          title="Estimates"
          phase="Phase 4 - Intelligence"
          planFile="docs/modules/20-estimating-engine.md"
          description="Full-featured estimating system supporting assembly-based, line-by-line, unit-pricing, and hybrid approaches. Supports all contract types (NTE, GMP, Cost-Plus, Fixed), configurable markup structures, allowances, exclusions, alternates, versioning with comparison, approval workflows, and AI-powered pricing from historical data. Estimates convert to budgets and proposals."
          workflow={constructionWorkflow}
          features={[
            'Selection-based line items: Pick product/material, pricing auto-fills',
            'Catalog integration: All selections pull from Selections Catalog',
            'Tier options: See builder-grade, standard, premium, luxury prices side-by-side',
            'Allowance items: Mark as client-choice with default allowance amount',
            'Exclusion tracking: Explicit $0 line items marked EXCLUDED',
            'Alternate/option pricing: If client chooses A=$X, B=$Y with toggle',
            'Assembly templates: Pre-built groups with default selections',
            'Override pricing: Manual adjustment with reason tracking',
            'Contract types: NTE, GMP, Cost-Plus, Fixed Price support',
            'Markup config: Flat %, tiered, per-line, or built-in markup',
            'Separate overhead and profit percentages',
            'Versioning: V1, V2, V3 with side-by-side diff comparison',
            'Approval workflows: Configurable routing, threshold-based',
            'Estimate expiration: Configurable validity period with alerts',
            'Waste factors: Per-material waste % auto-applied to quantities',
            'Cost code mapping: Every line item ties to builder cost code',
            'Bid comparison: Invite vendors, compare bids side-by-side',
            'Value engineering log: Track VE candidates with savings',
            'Multi-view presentation: Client summary, builder detail, bank/AIA format',
            'Pre-construction cost tracking: Soft costs separate from construction budget',
            'Cost escalation calculator: Project material/labor increases for delayed starts',
            'One-click convert to Budget: Automatically maps Estimate Lines to Locked Budget Lines',
          ]}
          connections={[
            { name: 'Selections Catalog', type: 'input', description: 'All product/material choices and pricing' },
            { name: 'Leads', type: 'input', description: 'Estimate created from qualified lead' },
            { name: 'Proposals', type: 'output', description: 'Estimate converts to client proposal' },
            { name: 'Budget', type: 'output', description: 'Approved estimate becomes job budget baseline' },
            { name: 'Price Intelligence', type: 'bidirectional', description: 'AI pricing data, historical cost lookups, anomaly detection' },
            { name: 'Bid Management', type: 'bidirectional', description: 'Invite vendors to bid, compare responses, populate estimate' },
            { name: 'Schedule', type: 'output', description: 'AI generates schedule from estimate task durations' },
            { name: 'Cost Codes', type: 'input', description: 'Builder cost code library for line item mapping' },
            { name: 'Document Storage', type: 'input', description: 'Plan uploads for AI takeoff (future)' },
            { name: 'Vendor Management', type: 'input', description: 'Vendor data for bid invitations' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'name', type: 'string', required: true, description: 'Estimate name/version' },
            { name: 'status', type: 'string', required: true, description: 'draft | pending_approval | approved | sent | expired | converted' },
            { name: 'contract_type', type: 'string', required: true, description: 'nte | gmp | cost_plus | fixed' },
            { name: 'version', type: 'integer', required: true, description: 'Version number (V1, V2, V3)' },
            { name: 'parent_version_id', type: 'uuid', description: 'FK to previous version for comparison' },
            { name: 'markup_type', type: 'string', description: 'flat | tiered | per_line | built_in' },
            { name: 'markup_pct', type: 'decimal', description: 'Overall markup percentage' },
            { name: 'overhead_pct', type: 'decimal', description: 'Overhead percentage' },
            { name: 'profit_pct', type: 'decimal', description: 'Profit percentage' },
            { name: 'valid_until', type: 'date', description: 'Estimate expiration date' },
            { name: 'default_tier', type: 'string', description: 'Default selection tier for this estimate' },
            { name: 'subtotal', type: 'decimal', description: 'Sum of all line items' },
            { name: 'total', type: 'decimal', description: 'Final estimate amount with markup + contingency' },
            { name: 'created_by', type: 'uuid', required: true, description: 'Who created the estimate' },
            { name: 'approved_by', type: 'uuid', description: 'Who approved the estimate' },
            { name: 'approved_at', type: 'timestamp', description: 'When approved' },
          ]}
          aiFeatures={[
            { name: 'Historical Cost Intelligence', description: 'Suggests unit prices from builder past projects, filtered by type/region/date. Shows confidence score and data point count.', trigger: 'On line item creation' },
            { name: 'AI Confidence Scoring', description: 'Each AI suggestion shows data points and high/medium/low confidence level.', trigger: 'Per line item' },
            { name: 'Cold-Start Benchmarking', description: 'New builders get industry benchmarks by region. Clearly indicates when using benchmarks vs builder history.', trigger: 'When builder has < 10 projects' },
            { name: 'Lead Time Warnings', description: 'Flags selections where lead time exceeds project start buffer.', trigger: 'On selection with lead time' },
            { name: 'Allowance Strategy', description: 'AI recommends allowance amounts based on historical selection costs by finish tier and region.', trigger: 'On allowance line item creation' },
            { name: 'Cost Escalation Calculator', description: 'Projects material/labor cost increases for delayed starts using published indices.', trigger: 'On estimate with future start date' },
            { name: 'Plan Takeoff (future)', description: 'Upload plans, AI identifies rooms, counts fixtures, calculates SF, generates preliminary estimate.', trigger: 'On plan upload' },
            { name: 'Schedule Generation', description: 'From completed estimate, AI suggests construction schedule based on historical task durations.', trigger: 'On estimate approval' },
            { name: 'Price Anomaly Detection', description: 'Flags material prices that changed >10% vs trailing 90-day average. Cross-vendor comparison.', trigger: 'On pricing review' },
          ]}
        />
      )}
    </div>
  )
}
