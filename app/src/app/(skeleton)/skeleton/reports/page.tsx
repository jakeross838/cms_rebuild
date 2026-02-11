'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Jobs', 'Budget', 'Invoices', 'Draws', 'Reports', 'Dashboard'
]

export default function ReportsHubSkeleton() {
  return (
    <PageSpec
      title="Reports & Insights"
      phase="Phase 0 - Foundation"
      planFile="views/reports/REPORTS.md"
      description="AI-powered reporting that doesn't just show data—it tells you what matters. The system generates executive summaries, highlights anomalies, answers questions in plain English, and delivers proactive insights based on patterns across all your projects."
      workflow={constructionWorkflow}
      features={[
        'Pre-built report templates: Job Profitability, Budget vs Actual, Cash Flow',
        'Job Cost Report with cost code breakdown and variance analysis',
        'Vendor Payment Report with aging and relationship health',
        'Project Status Summary across all jobs',
        'WIP (Work in Progress) Report for accounting',
        'Draw History Report with completion verification',
        'Estimating Accuracy Report (estimate vs. actual by category)',
        'Vendor Scorecard Report with rankings',
        'Custom report builder with drag-drop fields',
        'Natural language queries: "How much did we spend on electrical last year?"',
        'Export to PDF, Excel, CSV',
        'Scheduled report delivery via email',
        'Report favorites and recent access',
        'Dashboard widgets from any report',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Job data for project reports' },
        { name: 'Budget', type: 'input', description: 'Budget data for variance reports' },
        { name: 'Invoices', type: 'input', description: 'Invoice data for cost reports' },
        { name: 'Draws', type: 'input', description: 'Draw data for billing reports' },
        { name: 'Vendors', type: 'input', description: 'Vendor data for payment and scorecard reports' },
        { name: 'Schedule', type: 'input', description: 'Schedule data for progress reports' },
        { name: 'Estimates', type: 'input', description: 'Estimate data for accuracy analysis' },
        { name: 'Cost Intelligence', type: 'input', description: 'Historical pricing for trend analysis' },
        { name: 'Email', type: 'output', description: 'Scheduled reports sent via email' },
        { name: 'Dashboard', type: 'output', description: 'Report widgets on dashboard' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Report name' },
        { name: 'type', type: 'string', required: true, description: 'Template type' },
        { name: 'config', type: 'jsonb', description: 'Report configuration' },
        { name: 'is_favorite', type: 'boolean', description: 'Marked as favorite' },
        { name: 'last_run_at', type: 'timestamp', description: 'Last time report was generated' },
        { name: 'schedule', type: 'jsonb', description: 'Scheduled delivery config' },
        { name: 'ai_summary', type: 'text', description: 'AI-generated summary of findings' },
        { name: 'created_by', type: 'uuid', description: 'User who created report' },
      ]}
      aiFeatures={[
        {
          name: 'Executive Summary Generation',
          description: 'Every report includes AI-generated key findings: "Job profitability report shows 3 of 5 active jobs above target margin. Smith Residence trending 3% below due to framing overrun. Recommend change order for roof complexity. Johnson and Miller projects on track."',
          trigger: 'On every report generation'
        },
        {
          name: 'Anomaly Detection & Highlighting',
          description: 'Automatically flags unusual data: "ALERT: Electrical costs on Smith job 22% above similar projects. Root cause: 15 additional outlets (scope change) + copper price increase. Partially covered by change order."',
          trigger: 'On report generation'
        },
        {
          name: 'Natural Language Queries',
          description: 'Ask questions in plain English: "How much have we spent on ABC Electric this year?" → "$245,000 across 4 jobs. 12% increase vs. last year. They remain your highest-volume electrical vendor with best reliability score."',
          trigger: 'On search/query'
        },
        {
          name: 'Trend Analysis',
          description: 'Identifies trends across time and projects: "Your cost per SF has increased 8% over 12 months. Primary drivers: Lumber (+15%), Windows (+12%), Labor (+6%). Adjust estimates accordingly."',
          trigger: 'On historical reports'
        },
        {
          name: 'Proactive Insights',
          description: 'Suggests reports and insights based on context: "You haven\'t run estimating accuracy in 60 days. Based on recent completions, your framing estimates are trending 12% low. Review recommended."',
          trigger: 'Periodic analysis and on page load'
        },
        {
          name: 'Comparison Intelligence',
          description: 'Contextualizes data against benchmarks: "Your average project profitability (17%) exceeds industry average (12%) but is down from your historical average (19%). Margin compression is primarily in foundation and framing."',
          trigger: 'On profitability reports'
        },
        {
          name: 'Stakeholder Customization',
          description: 'Formats reports for specific audiences: "Bank version: Focus on % complete, lien waivers, inspection status. Owner version: Profitability, cash flow, risk items. Accountant version: WIP detail, cost code variances."',
          trigger: 'On report export'
        },
        {
          name: 'Scheduled Insights Email',
          description: 'Weekly AI briefing email to owners/directors: "This week: $185K in draws submitted, 12 invoices processed ($47K), 2 jobs ahead of schedule, 1 job needs attention (framing delay on Smith). Action items: Review electrical bid for Johnson, follow up on tile selection with Davis."',
          trigger: 'Weekly (configurable)'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Reports & Insights                        [+ Custom] [Ask AI ▾]      │
├─────────────────────────────────────────────────────────────────────┤
│ 🤖 AI: "Your estimating accuracy has dropped 5%—review framing."    │
├─────────────────────────────────────────────────────────────────────┤
│ Categories: Financial | Project | Vendor | Intelligence | Custom    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FINANCIAL REPORTS                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ 📊 Job          │ │ 📈 Budget vs    │ │ 💰 Cash Flow    │        │
│  │ Profitability   │ │ Actual          │ │ Forecast        │        │
│  │                 │ │                 │ │                 │        │
│  │ AI: "3/5 above  │ │ AI: "Smith      │ │ AI: "Need $45K  │        │
│  │ target margin"  │ │ framing +12%"   │ │ before Jan draw"│        │
│  │ [Run Report]    │ │ [Run Report]    │ │ [Run Report]    │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                     │
│  INTELLIGENCE REPORTS                                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ 🎯 Estimating   │ │ ⭐ Vendor       │ │ 📉 Cost         │        │
│  │ Accuracy        │ │ Scorecards      │ │ Trends          │        │
│  │                 │ │                 │ │                 │        │
│  │ AI: "Framing    │ │ AI: "ABC Elec   │ │ AI: "Lumber up  │        │
│  │ -12% vs actual" │ │ top performer"  │ │ 15% this year"  │        │
│  │ [Run Report]    │ │ [Run Report]    │ │ [Run Report]    │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 💬 Ask AI: "How much did we spend on windows last year?"    │    │
│  │    → "$342,000 across 6 jobs. Avg lead time: 18 weeks.      │    │
│  │       Top vendor: Impact Windows Plus (78% of spend)."      │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
