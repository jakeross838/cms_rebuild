'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { BudgetPreview } from '@/components/skeleton/previews/budget-preview'
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
            'Cost code breakdown with expandable hierarchical tree (Division > Category > Line)',
            'Columns: Original Budget, Approved Changes, Revised Budget, Committed, Actual, Projected, Variance, Cost to Complete',
            'Line types: Standard, Allowance, Contingency, Alternate — each visually badged',
            'Drill-down to line item detail with linked POs, invoices, and change orders',
            'Visual variance indicators (heat map: green/yellow/red) with configurable thresholds (80%/95%)',
            'Multi-audience view toggle: PM Detail, Owner Summary, Lender (AIA G702/G703)',
            'Contract type support: Fixed Price, Cost Plus, GMP, NTE',
            'Contingency tracker with drawdown history and remaining balance',
            'Earned value metrics: CPI and SPI with trend indicators',
            'Change order impact visualization: original vs CO-adjusted amounts',
            'Budget alerts banner for at-risk cost codes',
            'Budget line notes, attached documents, and audit trail per line',
            'Export to Excel preserving hierarchy and formatting',
            'Budget snapshots at milestones for historical comparison',
            'Benchmark comparison vs similar projects ($/SF)',
            'What-if scenario modeling for cost impact analysis',
          ]}
          connections={[
            { name: 'Estimates', type: 'input', description: 'Original budget from approved estimate with selections' },
            { name: 'Change Orders', type: 'input', description: 'Approved COs update budget lines and contract value' },
            { name: 'Purchase Orders', type: 'input', description: 'POs create committed costs per cost code' },
            { name: 'Invoices', type: 'input', description: 'AI-processed invoices become actual costs' },
            { name: 'Schedule', type: 'input', description: 'Progress % feeds earned value; auto-draw generation from schedule' },
            { name: 'Draw Requests', type: 'output', description: 'Budget data feeds AIA G702/G703 draw requests' },
            { name: 'Vendor Management', type: 'input', description: 'Committed costs from vendor subcontracts' },
            { name: 'Selections', type: 'input', description: 'Selection variance: allowance vs actual selection price' },
            { name: 'QuickBooks', type: 'bidirectional', description: 'Chart of accounts mapping and transaction sync' },
            { name: 'Financial Reports', type: 'output', description: 'WIP, P&L, cash flow, profitability reports' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
            { name: 'cost_code_id', type: 'uuid', required: true, description: 'FK to cost codes' },
            { name: 'line_type', type: 'enum', required: true, description: 'standard, allowance, contingency, alternate' },
            { name: 'original_budget', type: 'decimal', required: true, description: 'Original estimate amount' },
            { name: 'approved_changes', type: 'decimal', description: 'Sum of approved CO adjustments' },
            { name: 'revised_budget', type: 'decimal', description: 'original + approved changes' },
            { name: 'committed', type: 'decimal', description: 'Signed subcontracts + approved POs' },
            { name: 'actual', type: 'decimal', description: 'Paid invoices + cost entries' },
            { name: 'projected', type: 'decimal', description: 'AI cost-to-complete projection' },
            { name: 'cost_to_complete', type: 'decimal', description: 'Projected final - actual' },
            { name: 'variance', type: 'decimal', description: 'Revised - Projected' },
            { name: 'percent_complete', type: 'decimal', description: 'Actual/committed or schedule-based' },
            { name: 'alert_level', type: 'enum', description: 'none, warning (80%), critical (95%), over' },
            { name: 'contract_type', type: 'enum', description: 'fixed_price, cost_plus, gmp, nte' },
          ]}
          aiFeatures={[
            { name: 'Cost-to-Complete Projection', description: 'AI predicts final cost per line with confidence intervals based on spend rate, schedule progress, and similar project history.', trigger: 'Real-time on every data change' },
            { name: 'Variance Root Cause', description: 'When variance exceeds threshold, AI explains the cause: material price increase, scope change, vendor overrun, etc.', trigger: 'On variance threshold exceeded' },
            { name: 'Early Warning Alerts', description: 'Proactive alerts when cost codes trend toward overrun. Configurable thresholds (default: 80% warning, 95% critical).', trigger: 'Weekly analysis + real-time on invoice' },
            { name: 'Contingency Usage Analysis', description: 'Tracks contingency drawdown rate vs project completion %. Compares to similar project patterns.', trigger: 'On contingency draw' },
            { name: 'Earned Value Intelligence', description: 'CPI/SPI calculation with trend analysis. Alerts when cost or schedule performance index drops below 0.95.', trigger: 'Weekly recalculation' },
            { name: 'Benchmark Comparison', description: 'Compares $/SF per cost code against similar projects in your region. Flags outliers.', trigger: 'On budget view load' },
          ]}
        />
      )}
    </div>
  )
}
