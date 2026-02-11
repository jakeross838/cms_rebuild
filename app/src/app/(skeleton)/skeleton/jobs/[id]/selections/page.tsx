'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

export default function JobSelectionsPage() {
  return (
    <PageSpec
      title="Job Selections"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/SELECTIONS.md"
      description="Track all client selections for this job. See what's been selected, what's pending, and what's overdue. Manage allowances, upgrades, and keep the project moving forward."
      workflow={['Present Options', 'Client Reviews', 'Selection Made', 'Ordered', 'Delivered']}
      features={[
        'Selection status by category',
        'Pending decisions list',
        'Overdue selections',
        'Client portal view',
        'Selection history',
        'Allowance tracking',
        'Upgrade/downgrade amounts',
        'Selection deadlines',
        'Impact on schedule',
        'Photo attachments',
        'Vendor/product links',
        'Email client reminders',
        'Selection approvals',
        'Change tracking',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Available options' },
        { name: 'Budget', type: 'bidirectional', description: 'Cost impact' },
        { name: 'Schedule', type: 'bidirectional', description: 'Deadline impact' },
        { name: 'Purchase Orders', type: 'output', description: 'Order selections' },
        { name: 'Client Portal', type: 'output', description: 'Client view' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'category', type: 'string', required: true, description: 'Selection category' },
        { name: 'item_name', type: 'string', required: true, description: 'What needs selecting' },
        { name: 'allowance', type: 'decimal', description: 'Budget allowance' },
        { name: 'selected_option', type: 'uuid', description: 'Selected item' },
        { name: 'selected_price', type: 'decimal', description: 'Actual price' },
        { name: 'variance', type: 'decimal', description: 'Over/under allowance' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Selected, Ordered, Delivered' },
        { name: 'deadline', type: 'date', description: 'Decision deadline' },
        { name: 'selected_at', type: 'timestamp', description: 'When selected' },
        { name: 'selected_by', type: 'uuid', description: 'Who selected' },
      ]}
      aiFeatures={[
        {
          name: 'Deadline Tracking',
          description: 'Manages selection timing. "Cabinet selection overdue by 5 days. Lead time: 8 weeks. This may delay kitchen install by 1 week."',
          trigger: 'Daily check'
        },
        {
          name: 'Budget Impact',
          description: 'Shows running totals. "Current selections: $12K over allowance. Recommend reviewing countertop downgrade option."',
          trigger: 'On selection change'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Selections - Smith Residence                   Allowance: $125,000  │
├─────────────────────────────────────────────────────────────────────┤
│ Status: [All ▾]    Category: [All ▾]                               │
├─────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                             │
│ ┌──────────────┬───────────────┬──────────────┬──────────────┐     │
│ │ Selected     │ Pending       │ Overdue      │ Variance     │     │
│ │ 24 items     │ 8 items       │ 2 items ⚠   │ +$8,500      │     │
│ └──────────────┴───────────────┴──────────────┴──────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│ ⚠ OVERDUE SELECTIONS                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Kitchen Cabinets             Deadline: Jan 20 (8 days overdue)  │ │
│ │ Allowance: $35,000 | Options presented: 3                       │ │
│ │ AI: "8-week lead time. Every day delay = 1 day schedule slip"  │ │
│ │ [Send Reminder] [View Options] [Call Client]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ PENDING (Due Soon)                                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ □ Lighting Fixtures          Due: Feb 5      Allow: $8,000     │ │
│ │ □ Door Hardware              Due: Feb 10     Allow: $4,500     │ │
│ │ □ Tile - Master Bath         Due: Feb 12     Allow: $6,000     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Running Total: $133,500 (+$8,500 over allowance)                   │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
