'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { EstimatesPreview } from '@/components/skeleton/previews/estimates-preview'
import { Eye, BookOpen } from 'lucide-react'
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
          phase="Phase 0 - Foundation"
          planFile="views/precon/ESTIMATES_PROPOSALS_CONTRACTS.md"
          description="Create detailed construction estimates using selection-based pricing. Every line item requiring a material/product choice pulls from the Selections Catalog."
          workflow={constructionWorkflow}
          features={[
            'Selection-based line items: Pick product/material, pricing auto-fills',
            'Catalog integration: All selections pull from Selections Catalog',
            'Tier options: See builder-grade, standard, premium, luxury prices side-by-side',
            'Allowance items: Mark as client-choice with default allowance amount',
            'Assembly templates: Pre-built groups with default selections',
            'Override pricing: Manual adjustment with reason tracking',
          ]}
          connections={[
            { name: 'Selections Catalog', type: 'input', description: 'All product/material choices and pricing' },
            { name: 'Leads', type: 'input', description: 'Estimate created from qualified lead' },
            { name: 'Proposals', type: 'output', description: 'Estimate converts to client proposal' },
            { name: 'Budget', type: 'output', description: 'Approved estimate becomes job budget baseline' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'name', type: 'string', required: true, description: 'Estimate name/version' },
            { name: 'status', type: 'string', required: true, description: 'Draft, In Review, Approved, Converted' },
            { name: 'default_tier', type: 'string', description: 'Default selection tier for this estimate' },
            { name: 'subtotal', type: 'decimal', description: 'Sum of all line items' },
            { name: 'total', type: 'decimal', description: 'Final estimate amount' },
          ]}
          aiFeatures={[
            { name: 'Selection Recommendations', description: 'AI recommends selections based on project type and client tier.', trigger: 'On line item category selection' },
            { name: 'Tier Comparison', description: 'Shows all tier options side-by-side when selecting.', trigger: 'On selection picker open' },
            { name: 'Lead Time Warnings', description: 'Flags selections with long lead times.', trigger: 'On selection' },
          ]}
        />
      )}
    </div>
  )
}
