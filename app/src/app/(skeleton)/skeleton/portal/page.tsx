'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PortalPreview } from '@/components/skeleton/previews/portal-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Client Login', 'Portal Dashboard', 'Project View', 'Selections', 'Documents', 'Payments'
]

export default function ClientPortalSkeleton() {
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
      {activeTab === 'preview' ? <PortalPreview /> : <PageSpec
      title="Client Portal"
      phase="Phase 0 - Foundation"
      planFile="views/portal/CLIENT_PORTAL.md"
      description="White-labeled client portal with AI-powered updates and personalized experience. Clients see real-time progress, make selections from the Selections Catalog (Materio-style visual chooser), approve change orders, and pay draws—all reflecting their learned preferences for a premium experience."
      workflow={constructionWorkflow}
      features={[
        'White-label branding: logo, favicon, colors, custom domain, portal name',
        'Branded login page with builder logo and colors -- zero platform branding leak',
        'Project dashboard with real-time progress overview and milestone timeline',
        'AI-generated weekly narrative summaries (client-friendly, no internal data)',
        'AI completion prediction with confidence percentage',
        'Photo gallery with AI-curated highlights, albums, and before/after comparison',
        'Document library with per-document acknowledgment and e-signature',
        'Content visibility toggles: builder controls every section per project',
        'Budget visibility levels: hidden, summary only, or detailed breakdown',
        'Selection approval: options with photos, pricing, lead times, allowance impact',
        'Selection comparison: side-by-side with mood board / room board view',
        'Selection deadline tracking with schedule impact warnings',
        'Change order review and approval with e-signature capture',
        'Draw request visibility with payment schedule',
        'In-portal messaging with read receipts and attachment support',
        'External communication logging (calls, texts, meetings outside portal)',
        'Client notification preferences: immediate, daily digest, weekly digest',
        'Push/email/SMS notification channels (builder-configurable)',
        'Guest invite: client can invite others with view-only access',
        'Builder "Preview as Client" mode',
        'Client engagement analytics: login frequency, sections viewed, response time',
        'Stage-aware content: preconstruction, construction, warranty phases',
        'Weekly/periodic update posts from builder (rich text with photos)',
        'AI FAQ chatbot answering project-specific questions',
        'Mobile-responsive design inheriting builder branding',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Project data displayed in portal' },
        { name: 'Photos', type: 'input', description: 'AI-curated client-suitable photos only' },
        { name: 'Documents', type: 'input', description: 'Shared documents with acknowledgment tracking' },
        { name: 'Draws', type: 'input', description: 'Draw requests for client approval/payment' },
        { name: 'Schedule', type: 'input', description: 'Simplified milestone timeline (not full Gantt)' },
        { name: 'Selections', type: 'bidirectional', description: 'Client reviews, compares, and approves selections' },
        { name: 'Change Orders', type: 'bidirectional', description: 'Client reviews and approves COs with e-signature' },
        { name: 'Payments', type: 'output', description: 'Online payment processing via Stripe' },
        { name: 'Messaging', type: 'bidirectional', description: 'Chat with read receipts and attachment support' },
        { name: 'Budget', type: 'input', description: 'Contract values only -- never internal cost/margin data' },
        { name: 'Daily Logs', type: 'input', description: 'AI client-friendly summary (no pricing, no internal issues)' },
        { name: 'Client Intelligence', type: 'input', description: 'Personalized experience from learned preferences' },
        { name: 'Portal Branding', type: 'input', description: 'White-label config: logo, colors, domain, footer' },
        { name: 'Portal Analytics', type: 'output', description: 'Client engagement metrics for builder dashboard' },
        { name: 'Notifications', type: 'output', description: 'Email/push/SMS per builder notification rules' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'portal_user_id', type: 'uuid', required: true, description: 'Client auth user' },
        { name: 'last_login', type: 'timestamp', description: 'Last portal access' },
        { name: 'login_frequency', type: 'string', description: 'daily | weekly | monthly | never' },
        { name: 'notification_preferences', type: 'jsonb', description: 'Channel (email/push/sms) and frequency settings' },
        { name: 'visible_sections', type: 'jsonb', description: 'Builder-configured section visibility toggles' },
        { name: 'budget_visibility', type: 'string', description: 'none | summary | detail' },
        { name: 'selection_deadlines', type: 'jsonb', description: 'Pending selections with deadlines and options' },
        { name: 'unread_messages', type: 'integer', description: 'Unread message count' },
        { name: 'engagement_score', type: 'decimal', description: 'Composite engagement metric' },
        { name: 'avg_response_time_hours', type: 'decimal', description: 'Average time to respond to messages' },
        { name: 'pending_actions', type: 'integer', description: 'Unsigned docs + unapproved selections + COs' },
        { name: 'portal_branding_id', type: 'uuid', description: 'FK to builder branding config' },
        { name: 'guest_invites_enabled', type: 'boolean', description: 'Whether client can invite guest users' },
      ]}
      aiFeatures={[
        {
          name: 'Weekly Narrative Summary',
          description: 'AI compiles daily logs into client-friendly narrative: "This week your home saw exciting progress! The framing crew completed all second-floor walls and began installing roof trusses. Your beautiful impact windows arrived and are ready for installation next week. We lost one day to weather but remain on track for your March completion."',
          trigger: 'Weekly (configurable day/time)'
        },
        {
          name: 'Photo Curation',
          description: 'AI selects best photos for client viewing—removes duplicates, blurry images, and construction debris shots. Organizes by phase and highlights significant milestones: "AI selected 12 of 47 photos—best showing framing progress, window delivery, and milestone completion."',
          trigger: 'On photo upload'
        },
        {
          name: 'Selection Personalization',
          description: 'Pre-filters selection options based on learned preferences: "Based on your previous choices, showing: Modern style, white/gray palette, premium brands. 8 tile options curated from 45 available."',
          trigger: 'On selection view'
        },
        {
          name: 'Deadline Reminders',
          description: 'Intelligent reminders based on client response patterns: "Client typically takes 10 days to decide. Tile selection due in 14 days. First reminder sent. If no response by day 7, send follow-up with schedule impact warning."',
          trigger: 'Adaptive scheduling based on client behavior'
        },
        {
          name: 'Budget Translation',
          description: 'Presents budget in client-friendly terms: "Your project is 63% complete. You\'ve invested $1.54M of your $2.45M contract. Current projections show completion within budget. 3 change orders totaling $28K have been approved."',
          trigger: 'On budget view'
        },
        {
          name: 'FAQ Chatbot',
          description: 'AI answers common questions about their specific project: "When will my windows be installed?" → "Based on your schedule, window installation is planned for January 15-17. The windows are already on site and passed inspection."',
          trigger: 'On chat initiation'
        },
        {
          name: 'Completion Prediction',
          description: 'Shows completion prediction with confidence: "Based on current progress, your home is predicted to complete by March 15 (85% confidence). Your move-in timeline should plan for mid-March."',
          trigger: 'On dashboard view'
        },
        {
          name: 'Satisfaction Monitoring',
          description: 'Monitors portal engagement for satisfaction signals: "Client hasn\'t logged in for 14 days during active construction. Last message was a question about timeline. Consider proactive outreach."',
          trigger: 'Engagement analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ [Ross Built Logo]  Smith Residence           Welcome, John & Sarah   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    YOUR HOME'S PROGRESS                      │   │
│  │  [████████████████████████░░░░░░░░░] 65% Complete            │   │
│  │                                                              │   │
│  │  Current Phase: Interior Rough-in                            │   │
│  │  Predicted Completion: March 15, 2025 (85% confidence)       │   │
│  │                                                              │   │
│  │  📝 "Great progress this week! Framing complete, windows     │   │
│  │     arrived. Electrical rough-in starts Monday." - AI Summary│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ 📸 Photos    │  │ 📄 Documents │  │ ✅ Selections│               │
│  │ 12 curated   │  │ 15 files     │  │ ⚠ 3 pending  │               │
│  │ this week    │  │              │  │ Due: Jan 15  │               │
│  │ [View All]   │  │ [View All]   │  │ [Review Now] │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ 💰 Budget    │  │ 💬 Messages  │  │ 📅 Schedule  │               │
│  │ On track     │  │ 1 new        │  │ View timeline│               │
│  │ Draw #5 due  │  │ from Jake    │  │ & milestones │               │
│  │ [$185K]      │  │ [View]       │  │ [View]       │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
