'use client'
import dynamic from 'next/dynamic'

import { useState } from 'react'

import { PageSpec } from '@/components/skeleton/page-spec'
const EmailMarketingPreview = dynamic(() => import('@/components/skeleton/previews/email-marketing-preview').then(mod => mod.EmailMarketingPreview), { ssr: false })

const constructionWorkflow = [
  'Audience', 'Campaign', 'Content', 'Send', 'Analytics'
]

export default function EmailMarketingSkeleton() {
  const [activeTab, setActiveTab] = useState<'specs' | 'preview'>('specs')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-warm-200">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'specs'
              ? 'border-stone-500 text-stone-600'
              : 'border-transparent text-warm-600 hover:text-warm-900'
          }`}
        >
          Specifications
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-stone-500 text-stone-600'
              : 'border-transparent text-warm-600 hover:text-warm-900'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'specs' ? (
        <PageSpec
          title="Email Marketing"
          phase="Phase 6 - Advanced"
          planFile="views/advanced/EMAIL_MARKETING.md"
          description="Client outreach and marketing campaigns for past, current, and prospective clients. Send project updates, newsletters, referral requests, and seasonal maintenance reminders. Track engagement and integrate with Client Intelligence."
          workflow={constructionWorkflow}
          features={[
            'Campaign creation with templates (email, SMS, social)',
            'Audience segmentation (past clients, active projects, prospects, referrals, high engagement)',
            'Email template builder with drag-and-drop and merge fields',
            'Personalization tokens ({{client_name}}, {{project_name}}, etc.)',
            'A/B testing for subject lines and content',
            'AI-optimized send time scheduling',
            'Automated drip campaigns with configurable triggers',
            'Project milestone auto-updates (frame, dry-in, trim, completion)',
            'Annual maintenance reminder automation',
            'Post-completion review request workflow (Google, Houzz, Facebook)',
            'Referral program management with reward tracking',
            'Final photography workflow at project completion',
            'Portfolio project showcase with photo curation',
            'Case study generation from project data',
            'Social media post drafts with AI-generated hashtags',
            'Multi-platform review/reputation monitoring (Google, Houzz, BBB, Yelp)',
            'New review alerts with response drafting assistance',
            'Channel ROI tracking (per-channel spend vs leads vs revenue)',
            'UTM parameter capture for digital attribution',
            'Multi-touch marketing attribution (first-touch, last-touch)',
            'Monthly marketing performance report (automated)',
            'SEO/content performance tracking per portfolio page',
            'Unsubscribe and bounce management',
            'Negative review response workflow',
          ]}
          connections={[
            { name: 'Clients', type: 'input', description: 'Client list for audience segmentation' },
            { name: 'Lead Pipeline & CRM', type: 'bidirectional', description: 'Lead source attribution, campaign tracking (Module 36)' },
            { name: 'Jobs / Projects', type: 'input', description: 'Project data and milestones for automated updates' },
            { name: 'Photos / Document Storage', type: 'input', description: 'Project photos for campaigns and portfolio (Module 6)' },
            { name: 'Client Portal', type: 'bidirectional', description: 'Review request delivery to clients (Module 29)' },
            { name: 'Notification Engine', type: 'output', description: 'Review request and referral thank-you delivery (Module 5)' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'name', type: 'string', required: true, description: 'Campaign name' },
            { name: 'type', type: 'string', required: true, description: 'One-time, Automated, Drip' },
            { name: 'status', type: 'string', required: true, description: 'Draft, Scheduled, Sent, Completed' },
            { name: 'subject', type: 'string', required: true, description: 'Email subject line' },
            { name: 'preview_text', type: 'string', description: 'Email preview text' },
            { name: 'body_html', type: 'text', description: 'Email HTML content' },
            { name: 'audience_filter', type: 'jsonb', description: 'Audience criteria' },
            { name: 'recipient_count', type: 'integer', description: 'Number of recipients' },
            { name: 'scheduled_at', type: 'timestamp', description: 'Scheduled send time' },
            { name: 'sent_at', type: 'timestamp', description: 'Actual send time' },
            { name: 'opens', type: 'integer', description: 'Open count' },
            { name: 'clicks', type: 'integer', description: 'Click count' },
            { name: 'unsubscribes', type: 'integer', description: 'Unsubscribe count' },
            { name: 'open_rate', type: 'decimal', description: 'Open rate percentage' },
            { name: 'click_rate', type: 'decimal', description: 'Click rate percentage' },
          ]}
          aiFeatures={[
            {
              name: 'Optimal Send Time',
              description: 'Recommends best send time based on audience: "Past clients typically open emails at 9am Tuesday. Scheduling for highest engagement."',
              trigger: 'On campaign scheduling'
            },
            {
              name: 'Subject Line Optimization',
              description: 'Suggests high-performing subject lines: "Subject lines with project photos have 40% higher open rates. Suggested: \'See the latest progress on Oceanfront Drive\'"',
              trigger: 'On campaign creation'
            },
            {
              name: 'Audience Suggestions',
              description: 'Suggests relevant audiences: "For referral campaign, targeting clients who completed projects 6-18 months ago with satisfaction score > 4. This segment has 3x referral rate."',
              trigger: 'On campaign creation'
            },
            {
              name: 'Engagement Scoring',
              description: 'Updates client engagement scores: "John Smith opened last 5 emails, clicked 3 links. High engagement score. Good candidate for referral ask."',
              trigger: 'After campaign send'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Email Marketing                            [+ New Campaign]         │
├─────────────────────────────────────────────────────────────────────┤
│ This Month: 3 campaigns | 450 emails | 38% open rate | 12% clicks  │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Drafts | Scheduled | Sent | Automated                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 📅 SCHEDULED                                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ February Newsletter                        Scheduled: Feb 1 9am │ │
│ │ Audience: All past clients (127 recipients)                     │ │
│ │ Subject: "New Year, New Projects - See What We're Building"    │ │
│ │ AI: "Optimal send time selected based on past engagement"       │ │
│ │ [Edit] [Preview] [Reschedule] [Send Now]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🔄 AUTOMATED CAMPAIGNS                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Project Milestone Updates                  Active | 24 sent/mo  │ │
│ │ Triggers: Frame complete, Dry-in, Trim-out, Completion          │ │
│ │ 45% open rate | Clients love progress photos                    │ │
│ │ [Edit Triggers] [View Analytics] [Pause]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Annual Maintenance Reminder                Active | 8 sent/mo   │ │
│ │ Trigger: 1 year after completion                                │ │
│ │ "Time to check your roof, HVAC filters, caulking..."           │ │
│ │ [Edit] [View Analytics] [Pause]                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 📊 RECENT PERFORMANCE                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ January Newsletter                         Sent: Jan 5          │ │
│ │ 125 sent | 52 opened (42%) | 18 clicked (14%) | 0 unsub        │ │
│ │ Top link: "View Smith Residence Progress Photos" - 12 clicks    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      ) : (
        <EmailMarketingPreview />
      )}
    </div>
  )
}
