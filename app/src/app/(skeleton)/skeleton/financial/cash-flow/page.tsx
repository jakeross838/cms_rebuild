'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function CashFlowPage() {
  return (
    <PageSpec
      title="Cash Flow Forecast"
      phase="Phase 1 - Financial Planning"
      planFile="views/financial/CASH_FLOW.md"
      description="Project future cash position based on expected draw receipts, scheduled payments, and committed expenses. Identify potential cash crunches before they happen and plan accordingly."
      workflow={['Current Position', 'Project Inflows', 'Project Outflows', 'Identify Gaps', 'Plan Actions']}
      features={[
        'Current cash position',
        '30/60/90 day forecast',
        'Expected draw receipts',
        'Scheduled vendor payments',
        'Committed PO amounts',
        'Overhead projections',
        'Best/worst case scenarios',
        'What-if modeling',
        'Cash cushion targets',
        'Alert thresholds',
        'Historical accuracy tracking',
        'Seasonal patterns',
        'Line of credit tracking',
        'Recommended actions',
      ]}
      connections={[
        { name: 'Accounts Receivable', type: 'input', description: 'Expected receipts' },
        { name: 'Accounts Payable', type: 'input', description: 'Scheduled payments' },
        { name: 'Purchase Orders', type: 'input', description: 'Committed spend' },
        { name: 'Draws', type: 'input', description: 'Draw schedule' },
        { name: 'Job Schedules', type: 'input', description: 'Work timing' },
        { name: 'Financial Dashboard', type: 'output', description: 'Summary view' },
      ]}
      dataFields={[
        { name: 'date', type: 'date', required: true, description: 'Forecast date' },
        { name: 'opening_balance', type: 'decimal', description: 'Starting cash' },
        { name: 'expected_inflows', type: 'decimal', description: 'Expected receipts' },
        { name: 'expected_outflows', type: 'decimal', description: 'Expected payments' },
        { name: 'closing_balance', type: 'decimal', description: 'Ending cash' },
        { name: 'inflow_details', type: 'jsonb', description: 'Detailed inflows' },
        { name: 'outflow_details', type: 'jsonb', description: 'Detailed outflows' },
        { name: 'confidence', type: 'decimal', description: 'Forecast confidence' },
        { name: 'low_scenario', type: 'decimal', description: 'Pessimistic balance' },
        { name: 'high_scenario', type: 'decimal', description: 'Optimistic balance' },
      ]}
      aiFeatures={[
        {
          name: 'Gap Detection',
          description: 'Identifies cash shortfalls. "Week 3: Projected balance $45K below $100K target. Recommend: Accelerate Smith Draw #5 or defer lumber payment."',
          trigger: 'Daily analysis'
        },
        {
          name: 'Payment Timing',
          description: 'Suggests optimal payment timing. "Shifting 3 payments to week 4 improves week 3 balance by $65K with no late fees."',
          trigger: 'On forecast update'
        },
        {
          name: 'Receipt Prediction',
          description: 'Predicts actual receipt dates. "Smith typically pays 5 days after due. Adjusting forecast accordingly."',
          trigger: 'Using payment history'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Cash Flow Forecast                                 Target: $100K    │
├─────────────────────────────────────────────────────────────────────┤
│ Current Cash: $847,500                       Updated: 10 min ago   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 30-DAY FORECAST                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │  $900K ─┬─────────────────────────────────────────────────     │ │
│ │         │    ╭──╮                         ╭───╮                │ │
│ │  $800K ─┤───╯    ╰──╮                  ╭─╯   ╰──╮              │ │
│ │         │            ╰──╮          ╭──╯         ╰──            │ │
│ │  $700K ─┤                ╰────────╯         ⚠ Low              │ │
│ │         │                                                       │ │
│ │  $600K ─┤─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ Target ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ │
│ │         │                                                       │ │
│ │         └───────────────────────────────────────────────────    │ │
│ │           Week 1    Week 2    Week 3    Week 4                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ WEEK 3 DETAIL (⚠ Below Target)                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Opening: $745,000                                               │ │
│ │ + Expected: Draw #4 Johnson $60,000                             │ │
│ │ - Payments: ABC Lumber $24K, XYZ Electric $12K, Payroll $85K   │ │
│ │ = Closing: $684,000 (⚠ $16K below target)                      │ │
│ │                                                                 │ │
│ │ AI Recommendation: "Accelerate Smith Draw #5 request by 1 week  │ │
│ │ or defer ABC Lumber payment 5 days (no late fee impact)."       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
