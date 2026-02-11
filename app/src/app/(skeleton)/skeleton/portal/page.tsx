'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Client Login', 'Portal Dashboard', 'Project View', 'Selections', 'Documents', 'Payments'
]

export default function ClientPortalSkeleton() {
  return (
    <PageSpec
      title="Client Portal"
      phase="Phase 0 - Foundation"
      planFile="views/portal/CLIENT_PORTAL.md"
      description="White-labeled client portal with AI-powered updates and personalized experience. Clients see real-time progress, make selections from the Selections Catalog (Materio-style visual chooser), approve change orders, and pay draws—all reflecting their learned preferences for a premium experience."
      workflow={constructionWorkflow}
      features={[
        'Branded login page with builder logo and colors',
        'Project dashboard with real-time progress overview',
        'AI-generated weekly narrative summaries',
        'Photo gallery with timeline view and AI-selected highlights',
        'Document library: contracts, permits, warranties, manuals',
        'SELECTIONS: Catalog items marked as allowances appear for client choice',
        'Visual selection picker: See options with photos, specs, pricing tiers',
        'Selection comparison: Compare 2-3 options side-by-side',
        'Upgrade/downgrade impact: "This tile is +$1,200 vs. allowance"',
        'Selection deadline tracking with schedule impact warnings',
        'One-click selection confirmation with e-signature',
        'Draw/invoice viewing with budget breakdown',
        'Online payment processing (Stripe integration)',
        'Messaging with project team (logged to project)',
        'Schedule visibility with milestones and predictions',
        'Push/email notifications for selection deadlines',
        'Mobile-responsive design',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Project data displayed in portal' },
        { name: 'Photos', type: 'input', description: 'Progress photos with AI curation' },
        { name: 'Documents', type: 'input', description: 'Shared documents accessible' },
        { name: 'Draws', type: 'input', description: 'Draw requests for client approval/payment' },
        { name: 'Schedule', type: 'input', description: 'Schedule milestones with predictions' },
        { name: 'Selections', type: 'bidirectional', description: 'Client reviews and approves selections' },
        { name: 'Change Orders', type: 'bidirectional', description: 'Client reviews and approves COs' },
        { name: 'Payments', type: 'output', description: 'Online payment processing' },
        { name: 'Messaging', type: 'bidirectional', description: 'Client-team communication' },
        { name: 'Budget', type: 'input', description: 'Budget summary (not vendor details)' },
        { name: 'Client Intelligence', type: 'input', description: 'Personalized experience' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'client_id', type: 'uuid', required: true, description: 'FK to clients' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'portal_user_id', type: 'uuid', required: true, description: 'Client auth user' },
        { name: 'last_login', type: 'timestamp', description: 'Last portal access' },
        { name: 'notification_preferences', type: 'jsonb', description: 'Email/push notification settings' },
        { name: 'visible_sections', type: 'string[]', description: 'Which sections client can see' },
        { name: 'budget_visibility', type: 'string', description: 'Summary, detailed, or hidden' },
        { name: 'selection_deadlines', type: 'jsonb', description: 'Pending selections with deadlines' },
        { name: 'unread_messages', type: 'integer', description: 'Unread message count' },
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
    />
  )
}
