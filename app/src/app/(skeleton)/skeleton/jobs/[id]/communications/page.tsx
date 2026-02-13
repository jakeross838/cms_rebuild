'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { CommunicationsPreview } from '@/components/skeleton/previews/communications-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobCommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <CommunicationsPreview />
      ) : (
        <PageSpec
          title="Job Communications & Notification Center"
          phase="Phase 1 - Foundation"
          planFile="docs/modules/05-notification-engine.md"
          description="Centralized notification engine and communication hub for all project events. Multi-channel delivery (in-app, email, SMS, push) with builder-configurable event routing, user-level preferences, quiet hours, digest batching, and real-time SSE delivery. Every module emits events that flow through this engine to the correct recipients via the correct channels. Includes communication timeline, decision extraction, and full audit trail."
          workflow={['Event Emitted', 'Route to Recipients', 'Deliver via Channels', 'Track & Audit']}
          features={[
            'Notification event model with declarative schema registration per module',
            'Builder-level configuration: enable/disable event types, route to roles, assign channels, set urgency',
            'Multi-channel delivery: in-app (SSE real-time), email (SendGrid/SES), SMS (Twilio), push (Web Push/VAPID)',
            'User-level channel preferences per category (Financial, Schedule, Documents, Field Ops, Approvals, System)',
            'Quiet hours per user with timezone support (push/SMS held until quiet-end)',
            'Builder-level quiet hours floor (no notifications before/after configured times)',
            'Critical urgency bypass for quiet hours (safety incidents, payment failures)',
            'Mute/snooze: mute project notifications temporarily, snooze individual notifications',
            'Digest mode: hourly, twice daily, or daily email digests grouped by project then event type',
            'Auto-batching: >5 same events in 5 minutes collapses into summary notification',
            'Notification storm protection for bulk operations (import, mass updates)',
            'Cross-project daily summary email for users on 5+ projects',
            'Notification templates with Handlebars variable substitution per channel',
            'Builder-customizable template text with live preview and test send',
            'HTML email templates with builder branding (logo, colors from white-label)',
            'Notification bell/inbox in top nav with unread count badge',
            'Real-time SSE delivery with automatic reconnection and missed notification fetch',
            'Notification filtering: all, unread, by category, by project',
            'Communication timeline: email, call, meeting, note, SMS in unified view',
            'AI decision extraction from emails and meeting notes',
            'AI communication summary (weekly topics, decisions, pending actions)',
            'Delivery tracking: queued > processing > sent > delivered / failed / bounced',
            'Dead letter queue with admin retry capability',
            'Idempotency keys to prevent duplicate notifications',
            'Email bounce handling: auto-mark undeliverable after consecutive hard bounces',
            'SMS failure handling: auto-mark invalid numbers after consecutive failures',
            'Undeliverable user banner and admin report for invalid contact info',
            'Fallback to in-app when external channels are all undeliverable',
          ]}
          connections={[
            { name: 'Auth & Access Control', type: 'input', description: 'User identity and role resolution for recipient determination (Module 1)' },
            { name: 'Configuration Engine', type: 'input', description: 'Builder-level notification config and settings (Module 2)' },
            { name: 'Navigation & Dashboard', type: 'output', description: 'Notification bell UI, My Day cross-references (Module 4)' },
            { name: 'All Modules', type: 'input', description: 'Every module emits notification events through this engine' },
            { name: 'SendGrid / AWS SES', type: 'output', description: 'Email delivery provider with bounce webhooks' },
            { name: 'Twilio', type: 'output', description: 'SMS delivery provider with delivery receipts' },
            { name: 'Web Push (VAPID)', type: 'output', description: 'Browser push notification delivery' },
            { name: 'SSE Infrastructure', type: 'output', description: 'Real-time in-app notification stream' },
            { name: 'Redis / BullMQ', type: 'bidirectional', description: 'Job queue for async channel delivery and digest scheduling' },
            { name: 'White-Label & Branding', type: 'input', description: 'Builder branding for email templates (Module 44)' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (multi-tenant)' },
            { name: 'user_id', type: 'uuid', required: true, description: 'Recipient user' },
            { name: 'event_type', type: 'string', required: true, description: 'Event type (e.g., invoice.approved, schedule.updated)' },
            { name: 'title', type: 'string', required: true, description: 'Notification title' },
            { name: 'body', type: 'text', description: 'Notification body text' },
            { name: 'entity_type', type: 'string', description: 'Related entity type (invoice, project, rfi, etc.)' },
            { name: 'entity_id', type: 'uuid', description: 'Related entity ID for deep linking' },
            { name: 'url_path', type: 'string', description: 'Deep link path within the app' },
            { name: 'urgency', type: 'string', required: true, description: 'low, normal, high, critical' },
            { name: 'category', type: 'string', required: true, description: 'financial, schedule, documents, field_ops, approvals, system' },
            { name: 'read', type: 'boolean', required: true, description: 'Whether notification has been read' },
            { name: 'read_at', type: 'timestamp', description: 'When notification was read' },
            { name: 'snoozed_until', type: 'timestamp', description: 'Snooze expiration time' },
            { name: 'idempotency_key', type: 'string', description: 'Unique key to prevent duplicates' },
            { name: 'created_at', type: 'timestamp', required: true, description: 'When notification was created' },
            { name: 'delivery_channel', type: 'string', required: true, description: 'in_app, email, sms, push' },
            { name: 'delivery_status', type: 'string', required: true, description: 'queued, processing, sent, delivered, failed, bounced' },
            { name: 'provider_message_id', type: 'string', description: 'External ID from SendGrid/Twilio' },
            { name: 'attempts', type: 'integer', description: 'Number of delivery attempts' },
            { name: 'error_message', type: 'string', description: 'Error details for failed deliveries' },
          ]}
          aiFeatures={[
            {
              name: 'Decision Extraction',
              description: 'Identifies key decisions from emails and meetings: "Decision logged: Client approved upgraded white oak shaker cabinets (+$4,200) per email Feb 12."',
              trigger: 'On email/meeting capture'
            },
            {
              name: 'Communication Summary',
              description: 'Summarizes communication history: "This week: 12 emails, 5 calls, 2 meetings with client. Key topics: cabinet selections, kitchen layout change. 2 decisions logged, 3 action items pending."',
              trigger: 'On request or weekly digest'
            },
            {
              name: 'Smart Search',
              description: 'Finds relevant communication history: "Search: window delivery. Found: 3 emails discussing delivery date change to Feb 15, 1 call confirming, and 1 CO related to window upgrade."',
              trigger: 'On search'
            },
            {
              name: 'Storm Protection',
              description: 'Detects notification storms from bulk operations: "500 invoices imported - collapsed into single digest notification instead of 500 individual alerts."',
              trigger: 'On bulk event detection'
            },
            {
              name: 'Channel Optimization',
              description: 'Optimizes delivery based on user behavior: "Jake reads in-app notifications within 5 minutes. Consider disabling email for schedule updates to reduce noise."',
              trigger: 'On preference review'
            },
            {
              name: 'Action Item Tracking',
              description: 'Tracks unresolved action items from communications: "3 action items pending: architect layout review (due Fri), staging area prep (due Wed), CO documentation (no deadline)."',
              trigger: 'On daily summary'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Communications - Smith Residence    [+ New Message] [Preferences]   │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Email | Call | Meeting | SMS | Push | In-App | Notes    │
│ Filter: [All People] [All Urgency] [All Categories]    SSE: ● Live │
├─────────────────────────────────────────────────────────────────────┤
│ Unread: 2 | Critical: 1 | High: 4 | Decisions: 2 | Actions: 3     │
│ Channels: In-App ✓ | Email ✓ | SMS ✓ | Push ✓                     │
│ Quiet: 10pm-7am | Digest: Daily 8am | Critical bypass: On          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL: Hurricane Watch - Charleston County    5 hrs ago   │ │
│ │    Delivered: Push + SMS + Email + In-App | All team             │ │
│ │    "Secure site materials. Outdoor work suspended Feb 13 6am."  │ │
│ │    [View Details] [Acknowledge]                    Safety (33)   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ● Email from John Smith (Client)               2 hours ago      │ │
│ │    RE: Selection Decisions - Kitchen Cabinets                    │ │
│ │    ✓ Decision: Approved white oak shaker cabinets (+$4,200)     │ │
│ │    Delivered: Email + In-App | selection.approved                │ │
│ │    [Reply] [Snooze] [View]                     Selections (21)  │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Invoice #INV-2026-089 Approved for Payment     ● 4 hours ago    │ │
│ │    ABC Lumber $12,450 approved by Sarah Ross                    │ │
│ │    Delivered: Email + In-App | invoice.approved                 │ │
│ │    [View Invoice] [Mark Read]                  Invoicing (11)   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Daily Digest: 7 Notifications Batched          Yesterday        │ │
│ │    3 invoices, 2 schedule updates, 1 lien waiver, 1 inspection │ │
│ │    [Expand All]                                Digest (5)       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ AI: This week 12 emails, 5 calls, 2 meetings. 2 decisions logged,  │
│ 3 action items pending. Digest reduced notification volume by 58%.  │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
