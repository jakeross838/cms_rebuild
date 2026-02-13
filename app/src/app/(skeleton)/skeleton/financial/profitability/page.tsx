'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ProfitabilityPreview } from '@/components/skeleton/previews/profitability-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const profitabilityWorkflow = ['Select Job', 'View Margins', 'Analyze Variances', 'Identify Patterns', 'Apply Learnings']

export default function ProfitabilityPage() {
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
      {activeTab === 'preview' ? <ProfitabilityPreview /> : <PageSpec
      title="Job Profitability"
      phase="Phase 1 - Financial Planning"
      planFile="views/financial/PROFITABILITY.md"
      description="Analyze profit margins across all jobs. Compare estimated vs actual costs, identify margin erosion, and understand what drives profitability. Learn from every project to improve future estimates."
      workflow={profitabilityWorkflow}
      features={[
        'Portfolio profitability with sort/filter by margin, PM, status',
        'Profitability heat map (green/yellow/red by margin health)',
        'Gross and net margin analysis with overhead allocation',
        'Overhead allocation methods: % of direct cost, fixed, pro-rata by revenue',
        'Committed cost tracking (open POs) alongside actual costs',
        'Revenue recognized vs billings to date',
        'Cost code variance drill-down with budget/committed/actual/projected',
        'Earned value metrics (planned value, earned value, CPI, SPI)',
        'Margin trend indicator (improving/declining/stable)',
        'Cost per square foot comparison across projects',
        'Change order impact on contract and margin',
        'PM profitability ranking',
        'Cross-project benchmarking (cost/SF, margin %, CO rate)',
        'Variance from original estimate vs current projected profit',
        'Profitability trend chart over time (monthly data points)',
        'Phase-by-phase margin breakdown',
        'Filter by active/completed, sort by any column',
        'Export for analysis (PDF, Excel)',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Project and PM data' },
        { name: 'Budgets', type: 'input', description: 'Estimated costs by cost code' },
        { name: 'Invoices', type: 'input', description: 'Actual costs (AI-processed)' },
        { name: 'Purchase Orders', type: 'input', description: 'Committed costs' },
        { name: 'Change Orders', type: 'input', description: 'Scope changes and CO amounts' },
        { name: 'Draws', type: 'input', description: 'Revenue recognized' },
        { name: 'Schedule', type: 'input', description: '% complete for earned value' },
        { name: 'Financial Settings', type: 'input', description: 'Overhead rate, target margin' },
        { name: 'Financial Dashboard', type: 'output', description: 'Portfolio summary metrics' },
        { name: 'Estimates', type: 'output', description: 'Feedback loop for future estimates' },
        { name: 'Benchmarking', type: 'bidirectional', description: 'Cross-project comparison data' },
      ]}
      dataFields={[
        { name: 'job_id', type: 'uuid', required: true, description: 'Job reference' },
        { name: 'pm', type: 'string', description: 'Project manager name' },
        { name: 'contract_amount', type: 'decimal', description: 'Original contract' },
        { name: 'change_orders', type: 'decimal', description: 'Approved CO total' },
        { name: 'revised_contract', type: 'decimal', description: 'Original + COs' },
        { name: 'estimated_cost', type: 'decimal', description: 'Original budgeted cost' },
        { name: 'actual_cost', type: 'decimal', description: 'Costs to date' },
        { name: 'committed_cost', type: 'decimal', description: 'Open PO commitments' },
        { name: 'projected_cost', type: 'decimal', description: 'Total projected cost' },
        { name: 'revenue_recognized', type: 'decimal', description: 'Revenue earned to date' },
        { name: 'gross_profit', type: 'decimal', description: 'Revenue - Direct Costs' },
        { name: 'gross_margin', type: 'decimal', description: 'Gross margin percentage' },
        { name: 'overhead_allocation', type: 'decimal', description: 'Allocated overhead amount' },
        { name: 'overhead_method', type: 'string', description: 'pct_direct_cost | fixed | pro_rata' },
        { name: 'net_profit', type: 'decimal', description: 'Gross profit - overhead' },
        { name: 'variance', type: 'decimal', description: 'Budget variance ($ and %)' },
        { name: 'completion_pct', type: 'decimal', description: 'Percent complete' },
        { name: 'cost_per_sqft', type: 'decimal', description: 'Projected cost per SF' },
        { name: 'margin_trend', type: 'string', description: 'improving | declining | stable' },
        { name: 'target_margin', type: 'decimal', description: 'Builder target margin %' },
      ]}
      aiFeatures={[
        {
          name: 'Margin Erosion Alert',
          description: 'Detects declining margins early. "Smith Residence margin dropped from 18% to 14%. Primary driver: Framing labor 40% over budget."',
          trigger: 'On cost entry'
        },
        {
          name: 'Vendor Pattern Recognition',
          description: 'Finds profitability patterns by vendor. "Jobs using ABC Framing average 3% higher margins than XYZ Framing over last 8 projects."',
          trigger: 'Monthly analysis'
        },
        {
          name: 'Estimate Feedback Loop',
          description: 'Improves future estimates. "Coastal homes consistently 12% over on foundation costs. Recommend adjusting estimate templates."',
          trigger: 'On job completion'
        },
        {
          name: 'Benchmarking Intelligence',
          description: 'Cross-project comparison. "Your avg cost/SF of $385 is 6% below industry average of $410. Margin improvement opportunity in electrical trades."',
          trigger: 'Quarterly analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Job Profitability                               Avg Margin: 17.5%   │
├─────────────────────────────────────────────────────────────────────┤
│ View: [All Jobs] [Active] [Completed]    Sort: [Margin]            │
├─────────────────────────────────────────────────────────────────────┤
│ ACTIVE JOBS SUMMARY                                                 │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Job                    Contract    Est Cost   Act Cost   Margin│  │
│ │ ─────────────────────────────────────────────────────────────── │  │
│ │ Smith Residence        $2.4M       $1.97M     $985K      14.2% │  │
│ │                        Margin below target (was 18%)           │  │
│ │ Johnson Beach House    $1.8M       $1.47M     $420K      18.5% │  │
│ │                        On track                                │  │
│ │ Williams Remodel       $450K       $360K      $290K      19.8% │  │
│ │                        Above target                            │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│ SMITH RESIDENCE - VARIANCE ANALYSIS                                 │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Cost Code          Budget      Actual      Variance            │  │
│ │ ─────────────────────────────────────────────────────────────── │  │
│ │ Framing Labor      $85,000     $119,000    -$34,000            │  │
│ │ Framing Material   $124,000    $131,000    -$7,000             │  │
│ │ Electrical         $95,000     $92,000     +$3,000             │  │
│ │ Plumbing           $78,000     $76,500     +$1,500             │  │
│ │                                                                │  │
│ │ AI: "Framing labor over due to scope creep in tray ceilings.  │  │
│ │ Recommend: Change order for $18K additional work."             │  │
│ └────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│ YTD: $8.4M Revenue | $6.9M Cost | $1.5M Profit | 17.5% Margin      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
