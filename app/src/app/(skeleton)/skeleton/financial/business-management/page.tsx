'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { BusinessManagementPreview } from '@/components/skeleton/previews/business-management-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BusinessManagementPage(): React.ReactElement {
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
      {activeTab === 'preview' ? (
        <BusinessManagementPreview />
      ) : (
        <PageSpec
          title="Business Management"
          phase="Phase 3 - Financial Power"
          planFile="docs/modules/19-financial-reporting.md"
          description="Company-level financial intelligence — P&L dashboard, overhead rate calculator, break-even analysis, capacity planner, annual budget builder, cash flow forecasting, goal/KPI tracking, and tax planning. See the health of your entire business at a glance."
          workflow={['Financial data aggregates from all active and completed jobs', 'Company P&L Dashboard shows revenue, COGS, gross margin, overhead, net profit', 'Overhead Rate Calculator breaks down monthly costs by category', 'Break-Even Analysis shows contracted vs pipeline revenue against break-even line', 'Capacity Planner visualizes team availability and job overlap', 'Cash Flow Forecast projects 90-day money in vs money out', 'Goal & KPI Dashboard tracks annual targets with progress bars', 'AI identifies trends, risks, and opportunities across all data']}
          features={['Company P&L Dashboard with YoY comparison', 'Overhead Rate Calculator with industry benchmarking', 'Break-Even Analysis with pipeline probability weighting', 'Capacity Planner showing PM/Super workload and job overlap', 'Annual Budget Builder', 'Company Cash Flow Forecast (90-day rolling)', 'Goal & KPI Setting with progress tracking', 'Tax Planning Dashboard']}
          connections={[
            { name: 'Financial Reporting', type: 'input', description: 'Job-level financials roll up to company P&L' },
            { name: 'Scheduling', type: 'input', description: 'Job timelines feed capacity planner' },
            { name: 'HR & Workforce', type: 'bidirectional', description: 'Team data informs capacity and overhead calculations' },
          ]}
          aiFeatures={[
            { name: 'Revenue Forecasting', description: 'Predicts quarterly revenue from pipeline probability and historical conversion rates' },
            { name: 'Cash Flow Prediction', description: 'Forecasts 90-day cash position from draw schedules, payables, and receivables' },
            { name: 'Margin Improvement', description: 'Identifies top margin erosion categories and suggests corrections' },
          ]}
        />
      )}
    </div>
  )
}
