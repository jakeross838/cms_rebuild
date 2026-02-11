'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function EmailMarketingPage() {
  return (
    <PageSpec
      title="Email Marketing"
      phase="Phase 2 - Marketing"
      planFile="views/company/EMAIL_MARKETING.md"
      description="Manage email campaigns to past and potential clients. Seasonal reminders, company updates, and nurture campaigns to stay top-of-mind with your network."
      workflow={['Plan Campaign', 'Design Email', 'Select Audience', 'Schedule', 'Track Results']}
      features={[
        'Email templates',
        'Drag-and-drop editor',
        'Audience segmentation',
        'Past client lists',
        'Prospect lists',
        'Campaign scheduling',
        'A/B testing',
        'Open/click tracking',
        'Unsubscribe management',
        'Bounce handling',
        'Analytics dashboard',
        'Template library',
        'Automated sequences',
        'Personalization tokens',
      ]}
      connections={[
        { name: 'Clients', type: 'input', description: 'Client list' },
        { name: 'Leads', type: 'input', description: 'Prospect list' },
        { name: 'Contacts', type: 'input', description: 'All contacts' },
        { name: 'Email Service', type: 'bidirectional', description: 'Delivery and tracking' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Campaign name' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject' },
        { name: 'content', type: 'text', required: true, description: 'Email content' },
        { name: 'template_id', type: 'uuid', description: 'Template used' },
        { name: 'audience', type: 'jsonb', description: 'Recipient criteria' },
        { name: 'scheduled_at', type: 'timestamp', description: 'Send time' },
        { name: 'sent_at', type: 'timestamp', description: 'Actual send time' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Scheduled, Sent' },
        { name: 'sent_count', type: 'integer', description: 'Emails sent' },
        { name: 'open_count', type: 'integer', description: 'Opens' },
        { name: 'click_count', type: 'integer', description: 'Clicks' },
        { name: 'bounce_count', type: 'integer', description: 'Bounces' },
        { name: 'unsubscribe_count', type: 'integer', description: 'Unsubscribes' },
      ]}
      aiFeatures={[
        {
          name: 'Campaign Suggestions',
          description: 'Recommends campaigns. "Hurricane season approaching. Suggest: Impact window maintenance email to past clients."',
          trigger: 'Seasonal triggers'
        },
        {
          name: 'Subject Optimization',
          description: 'Improves open rates. "Subject line A: 22% open rate. Suggest: Add urgency for 35% improvement."',
          trigger: 'On campaign creation'
        },
        {
          name: 'Audience Insights',
          description: 'Identifies targets. "45 past clients haven\'t heard from you in 6+ months. Consider re-engagement campaign."',
          trigger: 'Periodic analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Email Marketing                                [+ Create Campaign]  │
├─────────────────────────────────────────────────────────────────────┤
│ ACTIVE CAMPAIGNS                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📧 Spring Maintenance Reminder            Scheduled: Mar 1      │ │
│ │    Audience: Past clients (last 5 years) | 127 recipients      │ │
│ │    Status: Ready to send                                        │ │
│ │    [Preview] [Edit] [Send Now] [Cancel]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENT PERFORMANCE                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Campaign              Sent    Opens   Clicks  Rate              │ │
│ │ ─────────────────────────────────────────────────────────────── │ │
│ │ Holiday Greeting      145     89      12      61% open          │ │
│ │ Fall Newsletter       142     78      23      55% open          │ │
│ │ Summer Tips           138     71      18      51% open          │ │
│ │                                                                 │ │
│ │ Average: 56% open rate (Industry: 21%)                         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ TEMPLATES                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Seasonal Reminder  📋 Project Update  📋 Newsletter         │ │
│ │ 📋 Holiday Greeting   📋 Referral Ask    📋 Thank You          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Lists: 3 | Total Contacts: 458 | Unsubscribed: 12                  │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
