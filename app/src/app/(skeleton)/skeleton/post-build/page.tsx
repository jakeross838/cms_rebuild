'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PostBuildPreview } from '@/components/skeleton/previews/post-build-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PostBuildPage(): React.ReactElement {
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
        <PostBuildPreview />
      ) : (
        <PageSpec
          title="Post-Build Client Lifecycle"
          phase="Phase 5 - Full Platform"
          planFile="docs/modules/31-warranty-home-care.md"
          description="Everything after the keys are handed over — 30-day and 11-month warranty walkthroughs, seasonal maintenance programs, anniversary touches, client lifetime value tracking, referral pipeline, and a personalized home maintenance knowledge base."
          workflow={['Job closes — post-build lifecycle activates', '30-Day Walkthrough auto-scheduled with checklist', 'Walkthrough items assigned to trades with photo documentation', '11-Month Warranty Walkthrough scheduled before builder warranty expires', 'Seasonal Maintenance reminders auto-sent to homeowners', 'Anniversary & holiday touches maintain relationship', 'Client Lifetime Value tracks total spend + referral value', 'Referral program tracks leads and conversion with bonuses', 'Home Maintenance Knowledge Base answers care questions based on actual installed materials']}
          features={['30-Day Walkthrough Scheduler with checklist', '11-Month Warranty Walkthrough with auto-scheduling', 'Seasonal Maintenance Program (Spring/Summer/Fall/Winter)', 'Anniversary & Holiday Touch automation', 'Client Lifetime Value Tracker (project + referral value)', 'Repeat Client Pipeline', 'Home Maintenance Knowledge Base personalized to installed selections']}
          connections={[
            { name: 'Warranty & Home Care', type: 'bidirectional', description: 'Walkthrough items feed warranty claims; warranty data informs future builds' },
            { name: 'Lead Pipeline & CRM', type: 'output', description: 'Referrals create new leads in the CRM pipeline' },
            { name: 'Selection Management', type: 'input', description: 'Installed selections inform personalized maintenance advice' },
          ]}
          aiFeatures={[
            { name: 'Walkthrough Scheduling AI', description: 'Auto-schedules walkthroughs based on completion date and homeowner availability' },
            { name: 'Referral Timing Optimization', description: 'Identifies optimal moments to request referrals based on satisfaction signals' },
            { name: 'Maintenance Prediction', description: 'Predicts maintenance needs based on installed materials, climate, and coastal conditions' },
          ]}
        />
      )}
    </div>
  )
}
