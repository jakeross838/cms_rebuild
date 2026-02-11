'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Estimate', 'Contract', 'Job', 'Budget', 'POs', 'Invoices', 'Draws', 'Reports'
]

export default function BudgetSkeleton() {
  return (
    <PageSpec
      title="Budget"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/BUDGET.md"
      description="Detailed budget view with AI-powered cost projection, variance analysis, and estimate-to-actual feedback loop. Every completed line item improves future estimates—the system learns where you're consistently over or under."
      workflow={constructionWorkflow}
      features={[
        'Cost code breakdown with hierarchical view',
        'Columns: Original Budget, Approved Changes, Revised Budget, Committed, Actual, Projected, Variance',
        'SELECTION TRACKING: Drill into any line to see selection vs. actual',
        'Selection variance: "Porch ceiling estimated $8.50/LF, actual $9.25/LF"',
        'Selection summary: Total estimated selections vs. actual selection costs',
        'Drill-down to line item detail with linked invoices/POs',
        'Change order tracking inline with CO impact by category',
        'PO commitments linked to budget lines (by selection)',
        'Invoice actuals linked to budget lines and selections',
        'Visual variance indicators (heat map: green/yellow/red)',
        'Budget vs Actual charts with trend lines',
        'Cost-to-complete projections by category',
        'Export to Excel for stakeholders',
        'Budget lock for approved baselines',
        'Estimate vs. Actual comparison with variance explanation',
        'Similar job benchmark overlay',
      ]}
      connections={[
        { name: 'Estimates', type: 'input', description: 'Original budget from estimate with selections' },
        { name: 'Selections Catalog', type: 'bidirectional', description: 'Tracks selection vs. actual; updates catalog pricing' },
        { name: 'Change Orders', type: 'input', description: 'Approved changes (including selection upgrades)' },
        { name: 'Cost Codes', type: 'input', description: 'Budget organized by cost codes' },
        { name: 'Purchase Orders', type: 'input', description: 'POs create commitments (by selection)' },
        { name: 'Invoices', type: 'input', description: 'Invoice allocations become actuals' },
        { name: 'Draws', type: 'output', description: 'Budget lines feed draw schedule' },
        { name: 'Reports', type: 'output', description: 'Budget data feeds reports' },
        { name: 'Job Dashboard', type: 'output', description: 'Summary shown on dashboard' },
        { name: 'Cost Intelligence', type: 'output', description: 'Selection actuals update catalog for future estimates' },
        { name: 'Estimating Feedback', type: 'output', description: 'Selection variance data improves estimate accuracy' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'cost_code_id', type: 'uuid', required: true, description: 'FK to cost codes' },
        { name: 'original_budget', type: 'decimal', required: true, description: 'Original estimate amount' },
        { name: 'approved_changes', type: 'decimal', description: 'Sum of approved change orders' },
        { name: 'revised_budget', type: 'decimal', description: 'Original + changes' },
        { name: 'committed', type: 'decimal', description: 'Sum of PO amounts' },
        { name: 'actual', type: 'decimal', description: 'Sum of invoice allocations' },
        { name: 'projected', type: 'decimal', description: 'AI-estimated final cost' },
        { name: 'variance', type: 'decimal', description: 'Revised - Projected' },
        { name: 'percent_complete', type: 'decimal', description: 'Completion %' },
        { name: 'notes', type: 'text', description: 'Budget line notes' },
        { name: 'ai_confidence', type: 'decimal', description: 'Projection confidence level' },
        { name: 'selection_id', type: 'uuid', description: 'FK to selections_catalog (for selection-based items)' },
        { name: 'estimated_selection_price', type: 'decimal', description: 'Catalog price at estimate time' },
        { name: 'actual_selection_price', type: 'decimal', description: 'Actual price paid' },
        { name: 'selection_variance', type: 'decimal', description: 'Actual minus estimated selection cost' },
      ]}
      aiFeatures={[
        {
          name: 'Cost-to-Complete Projection',
          description: 'AI predicts final cost for each category based on: current burn rate, historical patterns for this trade/vendor, similar job comparisons, and remaining scope. Shows confidence intervals: "Framing projected at $92K (90% confidence: $88K-$96K)."',
          trigger: 'Real-time on every data change'
        },
        {
          name: 'Variance Root Cause Analysis',
          description: 'When variance exceeds threshold, AI explains why: "Electrical $8K over: $5K from additional outlets (scope change), $3K from copper price increase (material volatility)." Links to specific invoices and change orders.',
          trigger: 'On variance threshold exceeded'
        },
        {
          name: 'Early Warning Alerts',
          description: 'Proactive alerts when cost codes trend toward overrun before it happens: "Framing at 60% complete but 75% spent—trending $15K over. Similar jobs had 80% of framing cost by this point."',
          trigger: 'Weekly analysis and real-time monitoring'
        },
        {
          name: 'Change Order Recommendation',
          description: 'Suggests when variances warrant a change order request to client: "Site conditions ($12K) and design clarifications ($8K) total $20K in out-of-scope costs. Recommend change order for owner-directed items."',
          trigger: 'On significant unbudgeted costs'
        },
        {
          name: 'Estimate Feedback Loop',
          description: 'Compares actual costs to original estimate and updates future estimating: "Your framing estimates for elevated coastal homes are 12% low on average. Suggested adjustment applied to future estimates in this category."',
          trigger: 'On job completion, continuous learning'
        },
        {
          name: 'Profitability Projection',
          description: 'Shows projected profit margin with trend: "Current: 18% margin. Projected at completion: 15% margin. Similar jobs averaged 17%." Alerts when margin erodes below acceptable threshold.',
          trigger: 'Real-time calculation'
        },
        {
          name: 'Similar Job Benchmark',
          description: 'Overlays budget performance against similar completed jobs: "Your foundation costs are $8K (15%) higher than average for 3,500 SF elevated homes. Difference is pile depth due to soil conditions."',
          trigger: 'On demand and on significant variance'
        },
        {
          name: 'Cash Flow Impact',
          description: 'Projects cash flow based on budget burn rate and draw timing: "At current pace, you\'ll need $45K before next draw. Consider accelerating Draw #4 or adjusting vendor payment timing."',
          trigger: 'Weekly projection'
        },
        {
          name: 'Selection Variance Analysis',
          description: 'Tracks catalog price vs. actual for every selection: "12 selections have variance >5%. Largest: Cypress T&G estimated $8.50/LF, actual $9.25/LF (+8.8%). Recommend updating catalog."',
          trigger: 'On PO/invoice completion'
        },
        {
          name: 'Selection Price Update Recommendations',
          description: 'After job completion, recommends catalog updates based on actuals: "Based on this job: Update Cypress T&G to $9.10/LF (avg of last 5 purchases). Impact on future estimates: +$2,400 per 3,500 SF home."',
          trigger: 'On job completion'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Budget - Smith Residence                   [Export] [Lock Budget]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ SUMMARY  Contract: $2.45M | Projected: $2.52M | Margin: 15% (▼ 3%)  │
│ AI: "Trending $70K over—$45K from scope changes, $25K from cost"    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────┬─────────┬─────────┬─────────┬────────┬────────┬──────┐ │
│ │ Code     │ Orig Bdg│ Changes │ Revised │ Actual │Projected│ Var │ │
│ ├──────────┼─────────┼─────────┼─────────┼────────┼────────┼──────┤ │
│ │ 01 Gen   │ $45,000 │ $5,000  │ $50,000 │$42,000 │$52,000 │-$2k ⚠│ │
│ │ 02 Site  │ $85,000 │ $12,000 │ $97,000 │$95,000 │$98,000 │-$1k  │ │
│ │ 03 Conc  │ $125,000│ $8,000  │ $133,000│$128,000│$135,000│-$2k  │ │
│ │ 04 Mason │ $35,000 │ $0      │ $35,000 │$28,000 │$34,000 │+$1k ✓│ │
│ │ 05 Steel │ $28,000 │ $0      │ $28,000 │$28,000 │$28,000 │ $0  ✓│ │
│ │ 06 Carp  │ $185,000│ $15,000 │ $200,000│$165,000│$215,000│-$15k⚠│ │
│ │   └ AI: "Complex roof design + lumber prices"                    │ │
│ │ 07 Therm │ $45,000 │ $0      │ $45,000 │$0      │$45,000 │ $0   │ │
│ │ ... more │         │         │         │        │        │      │ │
│ └──────────┴─────────┴─────────┴─────────┴────────┴────────┴──────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ AI Insight: "06 Carpentry trending over. Your framing costs on  │ │
│ │ elevated coastal homes are typically 8% over estimate. Recommend│ │
│ │ change order for owner-approved roof complexity ($12K)."        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ✓ On/Under budget | ⚠ Trending over | ● Over budget                 │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
