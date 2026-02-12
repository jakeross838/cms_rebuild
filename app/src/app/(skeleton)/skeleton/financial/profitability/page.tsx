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
        'Job-by-job profitability',
        'Gross margin analysis',
        'Estimated vs actual comparison',
        'Cost code variance drill-down',
        'Margin trend over time',
        'Profitability ranking',
        'Change order impact',
        'Overhead allocation',
        'Labor productivity analysis',
        'Material cost analysis',
        'Subcontractor performance',
        'Phase-by-phase margins',
        'Completion percentage vs profit',
        'Historical comparison',
        'Export for analysis',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'All job data' },
        { name: 'Budgets', type: 'input', description: 'Estimated costs' },
        { name: 'Invoices', type: 'input', description: 'Actual costs' },
        { name: 'Change Orders', type: 'input', description: 'Scope changes' },
        { name: 'Draws', type: 'input', description: 'Revenue recognized' },
        { name: 'Financial Dashboard', type: 'output', description: 'Summary metrics' },
        { name: 'Estimates', type: 'output', description: 'Feedback for future' },
      ]}
      dataFields={[
        { name: 'job_id', type: 'uuid', required: true, description: 'Job reference' },
        { name: 'contract_amount', type: 'decimal', description: 'Original contract' },
        { name: 'change_orders', type: 'decimal', description: 'Approved COs' },
        { name: 'revised_contract', type: 'decimal', description: 'Total contract' },
        { name: 'estimated_cost', type: 'decimal', description: 'Budgeted cost' },
        { name: 'actual_cost', type: 'decimal', description: 'Costs to date' },
        { name: 'projected_cost', type: 'decimal', description: 'Total projected' },
        { name: 'gross_profit', type: 'decimal', description: 'Revenue - Cost' },
        { name: 'gross_margin', type: 'decimal', description: 'Margin percentage' },
        { name: 'variance', type: 'decimal', description: 'Budget variance' },
        { name: 'completion_pct', type: 'decimal', description: 'Percent complete' },
      ]}
      aiFeatures={[
        {
          name: 'Margin Erosion Alert',
          description: 'Detects declining margins early. "Smith Residence margin dropped from 18% to 14%. Primary driver: Framing labor 40% over budget."',
          trigger: 'On cost entry'
        },
        {
          name: 'Pattern Recognition',
          description: 'Finds profitability patterns. "Jobs with ABC Electric average 3% higher margin than XYZ Electric. Consider for future bids."',
          trigger: 'Monthly analysis'
        },
        {
          name: 'Estimate Feedback',
          description: 'Improves future estimates. "Coastal homes consistently 8% over on foundation costs. Adjust estimate templates."',
          trigger: 'On job completion'
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
