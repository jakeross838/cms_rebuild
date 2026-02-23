'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { JobClosePreview } from '@/components/skeleton/previews/job-close-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobClosePage(): React.ReactElement {
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
        <JobClosePreview />
      ) : (
        <PageSpec
          title="Job Close Accounting"
          phase="Phase 3 - Financial Power"
          planFile="docs/modules/19-financial-reporting.md"
          description="Financial close-out for completed jobs — close checklist, final cost reconciliation (estimated vs actual by cost code), percentage of completion accounting, warranty reserve calculator, and CPA export package generation."
          workflow={['Job reaches substantial completion — close process begins', 'Job Close Checklist tracks 8 financial items (invoices, waivers, retainage, draws, POs, reserves)', 'Final Cost Reconciliation compares estimated vs actual by cost code with variance analysis', 'Percentage of Completion calculated for revenue recognition', 'Warranty Reserve calculated from historical warranty cost data', 'Post-Job Profit Analysis identifies margin erosion causes', 'CPA Export Package generated (job cost report, WIP, 1099s, depreciation, overhead, P&L)', 'Job archived with full financial record']}
          features={['Job Close Checklist (Financial) with 8-item tracker', 'Final Cost Reconciliation (estimated vs actual by cost code)', 'Percentage of Completion Accounting with quarterly breakdown', 'Warranty Reserve Calculator using historical data', 'CPA Export Package (QuickBooks, Excel, PDF formats)', 'Post-Job Profit Analysis with margin erosion breakdown']}
          connections={[
            { name: 'Budget & Cost Tracking', type: 'input', description: 'Final costs flow from budget module for reconciliation' },
            { name: 'Financial Reporting', type: 'output', description: 'Closed job data feeds company-level P&L and WIP reports' },
            { name: 'Warranty & Home Care', type: 'output', description: 'Warranty reserve amount feeds post-build warranty tracking' },
          ]}
          aiFeatures={[
            { name: 'Auto-Reconciliation', description: 'Matches estimated vs actual costs, flags variances, and identifies change order impacts — 96% accuracy' },
            { name: 'Warranty Reserve Prediction', description: 'Calculates optimal warranty reserve from historical data across similar projects — 89% accuracy' },
            { name: 'Margin Analysis', description: 'Identifies top margin erosion categories and recommends corrections for future bids' },
          ]}
        />
      )}
    </div>
  )
}
