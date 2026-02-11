'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function FinancialDashboardPage() {
  return (
    <PageSpec
      title="Financial Dashboard"
      phase="Phase 0 - Foundation"
      planFile="views/financial/DASHBOARD.md"
      description="Company-wide financial overview showing cash position, accounts receivable, accounts payable, profitability, and key financial metrics. The command center for understanding your company's financial health at a glance."
      workflow={['View Metrics', 'Drill Down', 'Take Action', 'Monitor Trends']}
      features={[
        'Cash position summary',
        'Accounts receivable aging',
        'Accounts payable aging',
        'Revenue by period',
        'Profit margins by job',
        'Cash flow forecast',
        'Outstanding draws',
        'Pending invoices',
        'Payment collection rate',
        'Budget vs actual trends',
        'QuickBooks sync status',
        'Key financial KPIs',
        'Alerts for issues',
        'Drill-down to details',
      ]}
      connections={[
        { name: 'Accounts Receivable', type: 'output', description: 'AR details' },
        { name: 'Accounts Payable', type: 'output', description: 'AP details' },
        { name: 'Cash Flow', type: 'output', description: 'Forecast details' },
        { name: 'Job Profitability', type: 'output', description: 'Margin analysis' },
        { name: 'Draws', type: 'input', description: 'Outstanding draws' },
        { name: 'Invoices', type: 'input', description: 'Pending invoices' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Sync status' },
      ]}
      dataFields={[
        { name: 'cash_on_hand', type: 'decimal', description: 'Current cash balance' },
        { name: 'ar_total', type: 'decimal', description: 'Total receivables' },
        { name: 'ar_current', type: 'decimal', description: 'Current (0-30 days)' },
        { name: 'ar_30_60', type: 'decimal', description: '30-60 days' },
        { name: 'ar_60_90', type: 'decimal', description: '60-90 days' },
        { name: 'ar_over_90', type: 'decimal', description: 'Over 90 days' },
        { name: 'ap_total', type: 'decimal', description: 'Total payables' },
        { name: 'revenue_mtd', type: 'decimal', description: 'Month to date revenue' },
        { name: 'revenue_ytd', type: 'decimal', description: 'Year to date revenue' },
        { name: 'profit_margin', type: 'decimal', description: 'Average profit margin' },
        { name: 'active_contract_value', type: 'decimal', description: 'Total contract value' },
      ]}
      aiFeatures={[
        {
          name: 'Cash Flow Alert',
          description: 'Warns of potential cash issues. "Based on AP due and AR collection rates, cash may be tight in 3 weeks. Accelerate Draw #5?"',
          trigger: 'Daily analysis'
        },
        {
          name: 'Collection Recommendations',
          description: 'Suggests collection actions. "2 draws over 30 days. Historical: these clients pay after 2nd reminder."',
          trigger: 'Weekly review'
        },
        {
          name: 'Profitability Insights',
          description: 'Highlights margin trends. "Profit margins declining 2% this quarter. Primary driver: lumber costs."',
          trigger: 'Monthly analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Financial Dashboard                          Last sync: 5 min ago   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│ │ 💵 CASH     │ │ 📥 AR       │ │ 📤 AP       │ │ 📈 MARGIN   │    │
│ │ $847,500   │ │ $485,000    │ │ $312,000    │ │ 17.5%       │    │
│ │ ▲ +$125K   │ │ 3 overdue   │ │ 5 due soon  │ │ ▼ -0.5%     │    │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                                     │
│ ┌────────────────────────────────┐ ┌────────────────────────────┐  │
│ │ ACCOUNTS RECEIVABLE AGING     │ │ 30-DAY CASH FORECAST       │  │
│ │                               │ │                            │  │
│ │ Current   ████████████ $320K │ │  Week 1: $892K ▲           │  │
│ │ 30-60     ████ $95K          │ │  Week 2: $745K ▼           │  │
│ │ 60-90     ██ $45K            │ │  Week 3: $680K ⚠ Low       │  │
│ │ 90+       █ $25K ⚠           │ │  Week 4: $820K ▲           │  │
│ │                               │ │                            │  │
│ │ [View Details]                │ │ [View Forecast]            │  │
│ └────────────────────────────────┘ └────────────────────────────┘  │
│                                                                     │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ ALERTS                                                       │ │
│ │ • Draw #5 Smith Residence overdue by 5 days ($185,000)        │ │
│ │ • AP to ABC Lumber due in 3 days ($24,000)                    │ │
│ │ • Cash forecast shows potential shortfall Week 3              │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Active Contracts: $8.4M | Revenue MTD: $485K | YTD: $2.1M          │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
