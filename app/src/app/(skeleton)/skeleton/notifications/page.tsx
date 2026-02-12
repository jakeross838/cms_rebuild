'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { NotificationsPreview } from '@/components/skeleton/previews/notifications-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'All System Events', 'Notifications', 'Actions', 'Resolution'
]

export default function NotificationsSkeleton() {
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
      {activeTab === 'preview' ? <NotificationsPreview /> : <PageSpec
      title="Notifications"
      phase="Phase 1 - Communication"
      planFile="views/communication/NOTIFICATIONS.md"
      description="Centralized notification hub for all system alerts, AI insights, and action items. Filter by type, priority, and source. Configure notification preferences for email, push, and in-app delivery."
      workflow={constructionWorkflow}
      features={[
        'Unified notification feed',
        'Filter by: Type, Priority, Job, Source',
        'Mark as read/unread',
        'Bulk actions (mark all read, dismiss)',
        'Notification categories: Alerts, Reminders, AI Insights, Updates',
        'Priority levels: Urgent, High, Normal, Low',
        'Quick actions from notification (approve, dismiss, view)',
        'Notification preferences by category',
        'Email digest options (immediate, daily, weekly)',
        'Push notification configuration',
        'Do not disturb schedule',
        'Notification history/archive',
        'Search notifications',
        'Link to source (invoice, PO, schedule, etc.)',
      ]}
      connections={[
        { name: 'All Modules', type: 'input', description: 'Receives notifications from all system modules' },
        { name: 'Email', type: 'output', description: 'Email notifications sent' },
        { name: 'Push', type: 'output', description: 'Mobile push notifications' },
        { name: 'Todos', type: 'output', description: 'Some notifications create tasks' },
        { name: 'User Preferences', type: 'input', description: 'Delivery preferences' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'user_id', type: 'uuid', required: true, description: 'FK to users' },
        { name: 'type', type: 'string', required: true, description: 'Alert, Reminder, AI Insight, Update' },
        { name: 'priority', type: 'string', required: true, description: 'Urgent, High, Normal, Low' },
        { name: 'title', type: 'string', required: true, description: 'Notification title' },
        { name: 'message', type: 'text', required: true, description: 'Notification body' },
        { name: 'source_type', type: 'string', description: 'Source module (invoice, schedule, etc.)' },
        { name: 'source_id', type: 'uuid', description: 'FK to source record' },
        { name: 'job_id', type: 'uuid', description: 'FK to jobs if job-specific' },
        { name: 'action_url', type: 'string', description: 'Link to take action' },
        { name: 'action_label', type: 'string', description: 'Action button text' },
        { name: 'is_read', type: 'boolean', required: true, description: 'Read status' },
        { name: 'read_at', type: 'timestamp', description: 'When read' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'When created' },
        { name: 'expires_at', type: 'timestamp', description: 'When notification expires' },
        { name: 'email_sent', type: 'boolean', description: 'Email notification sent' },
        { name: 'push_sent', type: 'boolean', description: 'Push notification sent' },
      ]}
      aiFeatures={[
        {
          name: 'Priority Intelligence',
          description: 'AI determines notification priority based on context: "Invoice approval usually normal priority, but this one blocks a draw payment due tomorrow—marked as Urgent."',
          trigger: 'On notification creation'
        },
        {
          name: 'Digest Optimization',
          description: 'Groups related notifications intelligently: "12 photo uploads from Smith job grouped into single notification. 3 invoice approvals grouped by vendor."',
          trigger: 'On digest generation'
        },
        {
          name: 'Quiet Hours Learning',
          description: 'Learns user patterns: "You typically don\'t respond to notifications after 7pm. Non-urgent notifications held until morning."',
          trigger: 'Continuous learning'
        },
        {
          name: 'Action Prediction',
          description: 'Predicts likely action: "You approve 95% of POs under $5K from preferred vendors. Quick-approve option shown."',
          trigger: 'On notification display'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Notifications                      [Mark All Read] [⚙ Preferences]  │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All ▾] Priority: [All ▾] Job: [All ▾]  🔍 Search          │
│ Unread: 8 | Today: 15 | This Week: 47                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 🔴 URGENT                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Draw #5 payment overdue - Smith Residence          2 hrs ago │ │
│ │   Payment of $185,000 was due yesterday. Client notified.       │ │
│ │   [View Draw] [Send Reminder] [Call Client]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🟡 HIGH                                                             │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 Invoice needs approval - ABC Electric             4 hrs ago  │ │
│ │   $12,450 for Smith Residence electrical rough-in               │ │
│ │   AI: Matches PO, within budget   [Approve] [Review] [Reject]   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🗓 Selection deadline approaching - Johnson         5 hrs ago   │ │
│ │   Tile selection due in 3 days. Client hasn't logged in.       │ │
│ │   [Send Reminder] [Extend Deadline] [View Selections]           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ⚪ NORMAL                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🤖 AI Insight: Cost trend detected                  Yesterday   │ │
│ │   Lumber costs trending 8% higher than estimates this month.    │ │
│ │   [View Analysis] [Dismiss]                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 📧 Email digest: Daily at 7am | 📱 Push: Urgent only               │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
