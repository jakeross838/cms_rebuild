'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { NotificationsPreview } from '@/components/skeleton/previews/notifications-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Module emits event', 'Resolve recipients (role + project)', 'Render template per channel', 'Deliver via channel adapters', 'Track delivery status'
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
      title="Notification Engine"
      phase="Phase 1 - Foundation"
      planFile="docs/modules/05-notification-engine.md"
      description="Centralized notification engine through which all platform events reach users. Every module emits events routed to correct recipients via correct channels based on builder-level configuration and user-level preferences. Supports in-app (SSE), email, SMS, push (V1), plus Slack and webhooks (Phase 2). Multi-tenant: every notification type, template, and routing rule configurable per builder. 6 categories: Financial, Schedule, Documents, Field Operations, Approvals, System."
      workflow={constructionWorkflow}
      features={[
        'Declarative event registration: modules register event types with default channels, roles, variables, urgency (GAP-481)',
        'Builder-level config: enable/disable events, override channels/roles/urgency per event type (GAP-481)',
        'Multi-channel delivery: in-app (SSE <1s), email (SendGrid/SES <30s), SMS (Twilio <10s), push (VAPID <5s) (GAP-482)',
        '5 priority levels: critical, urgent, high, normal, low (spec urgency field)',
        '6 notification categories: Financial, Schedule, Documents, Field Operations, Approvals, System',
        '5 notification types: alert, reminder, approval, ai_insight, update',
        'User channel preferences: matrix of categories x channels (in-app/email/sms/push) (GAP-482)',
        'Quiet hours: per-user + builder-level floor, timezone-aware, critical bypass opt-in (GAP-484)',
        'Quiet hours conflict resolution: most restrictive wins (union of user + builder ranges)',
        'Project muting: mute per project (1 hour, until tomorrow, indefinite) with unmute',
        'Individual notification snooze for specified duration',
        'Digest mode: real-time vs batched (hourly, twice daily, daily at configurable time) (GAP-485)',
        'Auto-batching: >5 same events in 5 min auto-collapses to summary (threshold configurable per builder)',
        'Cross-project daily summary email for users on 5+ projects (GAP-485)',
        'Notification storm protection: bulk op detection, per-event-type throttling (default 50/hr/user)',
        'Customizable templates per builder: Handlebars variables, live preview, test send (GAP-483)',
        'HTML email with builder branding (logo, colors), responsive MJML, plain-text fallback, unsubscribe',
        'In-app notification center: bell badge, dropdown with latest 20 + infinite scroll, real-time SSE (GAP-529)',
        'Delivery tracking per channel: queued > processing > sent > delivered / failed / bounced',
        'Bounce handling: auto-mark undeliverable after 2 hard bounces (email) or 3 failures (SMS)',
        'Dead letter queue: 3 retries with exponential backoff (1m/5m/30m), admin alert on threshold',
        'Idempotency: unique key (hash of event_type + entity_id + timestamp window) prevents duplicates',
        'Deep linking: each notification references entity_type + entity_id + url_path for navigation',
        'Mark as read/unread, mark all read, dismiss, bulk actions',
        'Filter by: priority, category, type, project, unread/all',
        'Search within notifications',
        'Notification retention: 90 days in main table, then archived (GAP open question)',
        'Admin delivery report: success/failure rates per channel',
      ]}
      connections={[
        { name: 'Module 1 (Auth)', type: 'input', description: 'User identity, role resolution for recipient determination' },
        { name: 'Module 2 (Config)', type: 'input', description: 'Builder-level notification config, quiet hours, event type overrides' },
        { name: 'Module 4 (Nav & Dashboard)', type: 'bidirectional', description: 'Bell icon UI, "My Day" cross-references, unread count' },
        { name: 'All Other Modules', type: 'input', description: 'Each module emits notification events via notificationService.emit()' },
        { name: 'SendGrid / AWS SES', type: 'output', description: 'Email channel delivery with bounce webhooks' },
        { name: 'Twilio', type: 'output', description: 'SMS channel delivery with delivery receipts' },
        { name: 'Web Push (VAPID)', type: 'output', description: 'Browser push notification delivery' },
        { name: 'Redis / BullMQ', type: 'bidirectional', description: 'Job queue for async delivery and digest scheduling' },
        { name: 'SSE Infrastructure', type: 'output', description: 'Real-time in-app notification delivery' },
        { name: 'Slack (Phase 2)', type: 'output', description: 'Slack incoming webhooks for channel routing' },
        { name: 'Webhooks (Phase 2)', type: 'output', description: 'Custom HTTP POST for Zapier/Make/n8n automation' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key (notifications table)' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant context' },
        { name: 'user_id', type: 'uuid', required: true, description: 'Recipient FK to users' },
        { name: 'event_type', type: 'string', required: true, description: 'Registered event type (e.g., invoice.approved)' },
        { name: 'title', type: 'string', required: true, description: 'Notification title' },
        { name: 'body', type: 'text', description: 'Notification body text' },
        { name: 'entity_type', type: 'string', description: 'Source entity type (invoice, project, rfi, etc.)' },
        { name: 'entity_id', type: 'uuid', description: 'FK to source entity for deep linking' },
        { name: 'url_path', type: 'string', description: 'Deep link URL path' },
        { name: 'urgency', type: 'string', required: true, description: 'critical | urgent | high | normal | low' },
        { name: 'read', type: 'boolean', required: true, description: 'Read status (default false)' },
        { name: 'read_at', type: 'timestamp', description: 'When marked as read' },
        { name: 'snoozed_until', type: 'timestamp', description: 'Snooze until this time' },
        { name: 'idempotency_key', type: 'string', description: 'Unique key to prevent duplicate notifications' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'When notification was created' },
        { name: 'channel (deliveries)', type: 'string', required: true, description: 'Delivery channel: in_app, email, sms, push' },
        { name: 'status (deliveries)', type: 'string', required: true, description: 'queued | processing | sent | delivered | failed | bounced' },
        { name: 'provider_message_id', type: 'string', description: 'External ID from SendGrid/Twilio for tracking' },
        { name: 'attempts', type: 'int', description: 'Delivery attempt count (max 3)' },
        { name: 'category (event_types)', type: 'string', required: true, description: 'financial | schedule | documents | field_operations | approvals | system' },
        { name: 'default_channels (event_types)', type: 'string[]', description: 'Default channels for event type' },
        { name: 'default_roles (event_types)', type: 'string[]', description: 'Default recipient roles for event type' },
        { name: 'variables (event_types)', type: 'string[]', description: 'Available template variables for event type' },
        { name: 'quiet_start', type: 'time', description: 'User quiet hours start (e.g., 20:00)' },
        { name: 'quiet_end', type: 'time', description: 'User quiet hours end (e.g., 07:00)' },
        { name: 'digest_mode', type: 'boolean', description: 'Real-time vs digest delivery' },
        { name: 'digest_frequency', type: 'string', description: 'hourly | twice_daily | daily' },
        { name: 'critical_bypass_quiet', type: 'boolean', description: 'Allow critical notifications to bypass quiet hours' },
      ]}
      aiFeatures={[
        {
          name: 'Priority Intelligence',
          description: 'AI determines notification priority based on context, deadlines, and downstream impact. "Invoice approval usually normal priority, but this one blocks a draw payment due tomorrow -- marked as Urgent."',
          trigger: 'On notification creation'
        },
        {
          name: 'Digest Optimization',
          description: 'Groups related notifications intelligently by project and event type. "12 photo uploads from Smith job grouped into single notification. 3 invoice approvals grouped by vendor." Batching threshold auto-adjusts based on user engagement patterns.',
          trigger: 'On digest generation'
        },
        {
          name: 'Quiet Hours Learning',
          description: 'Learns user activity patterns over time. "You typically don\'t respond to notifications after 7pm. Non-urgent notifications held until morning." Suggests optimal quiet hour settings.',
          trigger: 'Continuous learning'
        },
        {
          name: 'Action Prediction',
          description: 'Predicts likely user action based on historical behavior. "You approve 95% of POs under $5K from preferred vendors. Quick-approve option shown." Reduces friction for routine approvals.',
          trigger: 'On notification display'
        },
        {
          name: 'Storm Detection & Auto-Batching',
          description: 'Detects notification storms from bulk operations (>10 events same type within 60s). Auto-collapses into digest: "500 invoices were imported -- View Summary." Priority bypass for safety and payment alerts.',
          trigger: 'On high-volume event emission'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Notification Center                [Mark All Read] [⚙ Preferences]  │
├─────────────────────────────────────────────────────────────────────┤
│ [All] [Unread] [Critical] [Urgent] [High] [Normal] [Low]           │
│ Category: [All ▾]  Type: [All ▾]   🔍 Search                       │
│ Channels: In-App(all) Email(Fin,Approvals) Push(Sched) Quiet:10-7  │
├─────────────────────────────────────────────────────────────────────┤
│ Unread: 4 | Today: 6 | This Week: 10 | AI Insights: 2              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 🔴 CRITICAL  [Module 15]                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Draw #5 payment overdue - Smith Residence          2 hrs ago │ │
│ │   $185,000 due yesterday. Lender submission affected.           │ │
│ │   📧✓ 💬✓ 📱✓   [View Draw] [Call Client] [Snooze] [Dismiss]    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🟡 HIGH  [Module 11]                                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✅ Invoice needs approval - ABC Electric              4 hrs ago  │ │
│ │   $12,450 matched to PO, within budget. Confidence: 94%.        │ │
│ │   📧✓ 📱✓   [Approve] [Review Details] [Snooze] [Dismiss]       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ⚪ NORMAL  [Module 23]                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✨ AI Insight: Lumber cost trend detected            Yesterday   │ │
│ │   8% higher than estimates across 3 projects.                   │ │
│ │   📱✓   [View Analysis] [Dismiss]                                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 📧 Digest: Daily 7am | 📱 Push: Urgent+Critical | 🔇 Muted: 0     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
