'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SelectionsPreview } from '@/components/skeleton/previews/selections-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobSelectionsPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>
      {activeTab === 'preview' ? <SelectionsPreview /> : <PageSpec
      title="Job Selections"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/21-selection-management.md"
      description="Full client selection lifecycle management. Organized by room with comparison mode, real-time budget impact calculator, deadline countdowns tied to schedule, approval with e-signature, inspiration boards, comment threads, designer collaboration, and auto-PO generation from confirmed selections."
      workflow={['Not Started', 'Options Presented', 'Client Reviewing', 'Selected', 'Confirmed', 'Ordered', 'Received', 'Installed']}
      features={[
        'Room-by-room organization with progress indicators per room',
        '9 selection statuses: Not Started through Installed + Change Requested',
        'Comparison mode: Side-by-side 2-4 options per category',
        'Real-time budget impact calculator: allowance vs selected with running totals',
        'Deadline countdown tied to construction schedule + lead time',
        'Approval with e-signature capture',
        'Inspiration board: client uploads photos/Pinterest/notes per category',
        'Comment/question threads per category with role badges',
        'Decision history: all considered options retained, not just final',
        'Designer view: add/recommend options with mood boards',
        'Auto-PO generation from confirmed selections',
        'Change request workflow: cancel fees + restocking + delay impact',
        'Pricing models: allowance, fixed-price, cost-plus per category',
        'Selection summary PDF export with photos and pricing',
        'Client portal selection view',
        'Send reminder emails for pending selections',
        'Spec home mode: builder selects, no client portal',
        'Model home mode: base + upgrade pricing',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Available options with photos, pricing, and lead times' },
        { name: 'Budget', type: 'bidirectional', description: 'Allowance tracking, budget impact feeds' },
        { name: 'Schedule', type: 'bidirectional', description: 'Deadline calculation from schedule tasks + lead time integration' },
        { name: 'Purchase Orders', type: 'output', description: 'Auto-PO generation from confirmed selections' },
        { name: 'Client Portal', type: 'output', description: 'Client-facing selection experience' },
        { name: 'Change Orders', type: 'output', description: 'Selection overages generate change orders' },
        { name: 'Vendor Management', type: 'input', description: 'Vendor/supplier data for options' },
        { name: 'Document Storage', type: 'bidirectional', description: 'Photos/media for options and inspiration' },
        { name: 'Estimating Engine', type: 'input', description: 'Allowance amounts from estimate' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'category', type: 'string', required: true, description: 'Builder-defined selection category' },
        { name: 'room', type: 'string', required: true, description: 'Room assignment for room-by-room display' },
        { name: 'item_name', type: 'string', required: true, description: 'What needs selecting' },
        { name: 'pricing_model', type: 'string', required: true, description: 'allowance | fixed | cost_plus' },
        { name: 'allowance', type: 'decimal', description: 'Budget allowance (if allowance model)' },
        { name: 'selected_option_id', type: 'uuid', description: 'Selected option from catalog' },
        { name: 'selected_price', type: 'decimal', description: 'Actual price of selection' },
        { name: 'variance', type: 'decimal', description: 'Over/under allowance' },
        { name: 'status', type: 'string', required: true, description: 'not_started | options_presented | client_reviewing | selected | confirmed | ordered | received | installed | change_requested' },
        { name: 'deadline', type: 'date', description: 'Decision deadline from schedule' },
        { name: 'lead_time_days', type: 'integer', description: 'Vendor lead time for selected option' },
        { name: 'schedule_task_id', type: 'uuid', description: 'Linked schedule task for deadline calc' },
        { name: 'selected_by', type: 'uuid', description: 'Who selected (client/builder)' },
        { name: 'confirmed_by', type: 'uuid', description: 'Builder confirmation' },
        { name: 'signature_url', type: 'string', description: 'E-signature captured on approval' },
        { name: 'po_id', type: 'uuid', description: 'Generated purchase order' },
        { name: 'designer_access', type: 'boolean', description: 'Whether designer can access this category' },
      ]}
      aiFeatures={[
        {
          name: 'Deadline Tracking',
          description: 'Manages selection timing from schedule. "Cabinet selection overdue by 5 days. Lead time: 8 weeks. This will delay kitchen install by 1 week."',
          trigger: 'Daily check + schedule changes'
        },
        {
          name: 'Budget Impact Calculator',
          description: 'Real-time running totals. "Current selections: $12K over allowance. Recommend reviewing countertop downgrade option."',
          trigger: 'On every selection change'
        },
        {
          name: 'Discontinued Item Detection',
          description: 'Monitors for discontinued/backordered items and suggests alternatives within same price range.',
          trigger: 'Periodic sync + vendor notification'
        },
        {
          name: 'Schedule Impact Projection',
          description: 'When selection is late, shows exact schedule impact: "Selecting after Dec 15 will delay tile install by 8 days."',
          trigger: 'On overdue selections'
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
    />}
    </div>
  )
}
