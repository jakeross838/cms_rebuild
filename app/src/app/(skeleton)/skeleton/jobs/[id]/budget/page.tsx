'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { BudgetPreview } from '@/components/skeleton/previews/budget-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Estimate', 'Contract', 'Job', 'Budget', 'POs', 'Invoices', 'Draws', 'Reports'
]

export default function BudgetSkeleton() {
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
        <BudgetPreview />
      ) : (
        <PageSpec
          title="Budget"
          phase="Phase 0 - Foundation"
          planFile="views/jobs/BUDGET.md"
          description="Detailed budget view with AI-powered cost projection, variance analysis, and estimate-to-actual feedback loop."
          workflow={constructionWorkflow}
          features={[
            'Cost code breakdown with hierarchical view',
            'Columns: Original Budget, Approved Changes, Revised Budget, Committed, Actual, Projected, Variance',
            'Drill-down to line item detail with linked invoices/POs',
            'Visual variance indicators (heat map: green/yellow/red)',
            'Budget vs Actual charts with trend lines',
            'Export to Excel for stakeholders',
          ]}
          connections={[
            { name: 'Estimates', type: 'input', description: 'Original budget from estimate with selections' },
            { name: 'Change Orders', type: 'input', description: 'Approved changes (including selection upgrades)' },
            { name: 'Purchase Orders', type: 'input', description: 'POs create commitments (by selection)' },
            { name: 'Invoices', type: 'input', description: 'Invoice allocations become actuals' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
            { name: 'cost_code_id', type: 'uuid', required: true, description: 'FK to cost codes' },
            { name: 'original_budget', type: 'decimal', required: true, description: 'Original estimate amount' },
            { name: 'projected', type: 'decimal', description: 'AI-estimated final cost' },
            { name: 'variance', type: 'decimal', description: 'Revised - Projected' },
          ]}
          aiFeatures={[
            { name: 'Cost-to-Complete Projection', description: 'AI predicts final cost for each category with confidence intervals.', trigger: 'Real-time on every data change' },
            { name: 'Variance Root Cause', description: 'When variance exceeds threshold, AI explains why.', trigger: 'On variance threshold exceeded' },
            { name: 'Early Warning Alerts', description: 'Proactive alerts when cost codes trend toward overrun.', trigger: 'Weekly analysis' },
          ]}
        />
      )}
    </div>
  )
}
