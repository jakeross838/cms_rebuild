'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts',
  'Jobs List', 'Budget', 'Schedule', 'Execution'
]

export default function LeadsPipelineSkeleton() {
  return (
    <PageSpec
      title="Leads Pipeline"
      phase="Phase 0 - Foundation"
      planFile="views/leads/LEADS_PIPELINE.md"
      description="Manage sales pipeline for potential construction projects. Kanban board view for visual pipeline management with drag-and-drop stage changes. AI-powered lead scoring and qualification based on project characteristics, client fit, and historical win patterns."
      workflow={constructionWorkflow}
      features={[
        'Kanban board view with drag-and-drop between stages',
        'Table list view with sortable columns',
        'Stages: New, Qualified, Proposal Sent, Won, Lost',
        'Convert to Job: Auto-creates client and job on winning',
        'Quick filters by stage, assigned user, source, project type',
        'Estimated value tracking with range filtering',
        'Activity feed and notes per lead',
        'Bulk actions: Change stage, Assign user, Delete',
        'Lost reason tracking for analytics',
        'Lead source attribution (referral, website, direct)',
        'Preliminary project details capture (SF, stories, location)',
        'Client budget sensitivity indicators',
        'Project type classification (new construction, renovation, addition)',
        'Coastal/elevation requirements flagging',
      ]}
      connections={[
        { name: 'Users', type: 'input', description: 'Lead assignment to team members' },
        { name: 'Clients', type: 'output', description: 'Auto-creates client when lead converts' },
        { name: 'Jobs', type: 'output', description: 'Creates job when lead marked as Won' },
        { name: 'Estimates', type: 'output', description: 'Estimate can be created from lead' },
        { name: 'Activities', type: 'bidirectional', description: 'Activity/note tracking on leads' },
        { name: 'Dashboard', type: 'output', description: 'Pipeline metrics feed dashboard' },
        { name: 'Cost Intelligence', type: 'input', description: 'Preliminary pricing from historical data' },
        { name: 'Client Intelligence', type: 'output', description: 'Client preferences feed learning engine' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Client/project name' },
        { name: 'contact_name', type: 'string', description: 'Primary contact person' },
        { name: 'email', type: 'string', description: 'Contact email' },
        { name: 'phone', type: 'string', description: 'Contact phone' },
        { name: 'address', type: 'string', description: 'Project address' },
        { name: 'project_type', type: 'string', description: 'New construction, renovation, addition' },
        { name: 'estimated_sf', type: 'integer', description: 'Estimated square footage' },
        { name: 'estimated_value', type: 'decimal', description: 'Estimated project value' },
        { name: 'source', type: 'string', description: 'Referral, Website, Direct, Other' },
        { name: 'referral_source', type: 'string', description: 'Who referred if source=referral' },
        { name: 'stage', type: 'string', required: true, description: 'New, Qualified, Proposal Sent, Won, Lost' },
        { name: 'assigned_user_id', type: 'uuid', description: 'Assigned team member' },
        { name: 'client_id', type: 'uuid', description: 'Created client on conversion' },
        { name: 'job_id', type: 'uuid', description: 'Created job on conversion' },
        { name: 'lost_reason', type: 'string', description: 'Reason if lead was lost' },
        { name: 'last_contact_at', type: 'timestamp', description: 'Last activity date' },
        { name: 'ai_score', type: 'decimal', description: 'AI-generated lead score' },
        { name: 'win_probability', type: 'decimal', description: 'AI-predicted win likelihood' },
        { name: 'flood_zone', type: 'string', description: 'FEMA flood zone if applicable' },
        { name: 'coastal_requirements', type: 'boolean', description: 'Requires coastal compliance' },
      ]}
      aiFeatures={[
        {
          name: 'Lead Scoring',
          description: 'AI scores leads 1-100 based on project type, value, source, location, and engagement patterns. Learns from historical win/loss data to improve predictions. Factors in project characteristics that match Ross Built strengths (coastal, custom, luxury).',
          trigger: 'On lead create and every update'
        },
        {
          name: 'Win Probability',
          description: 'Predicts likelihood of winning based on historical patterns. Analyzes: project type match, budget alignment, referral quality, communication responsiveness, and client profile similarity to past wins.',
          trigger: 'Real-time calculation, updates with each interaction'
        },
        {
          name: 'Follow-up Intelligence',
          description: 'Suggests optimal follow-up timing based on lead activity, stage duration, and historical conversion patterns. Alerts: "Leads in Qualified stage for >7 days have 40% lower win rate—follow up today."',
          trigger: 'Daily analysis and real-time alerts'
        },
        {
          name: 'Preliminary Pricing',
          description: 'Provides instant ballpark estimate from minimal inputs (SF, location, project type, finish level). Uses Cost Intelligence database: "Based on 15 similar coastal projects, expect $650-$750/SF."',
          trigger: 'On demand when estimating lead value'
        },
        {
          name: 'Client Fit Analysis',
          description: 'Analyzes client communication style, budget sensitivity signals, and decision-making patterns to predict fit. Flags potential mismatches: "Client expecting $400/SF for luxury coastal—below your historical minimum of $500/SF."',
          trigger: 'After initial qualification'
        },
        {
          name: 'Lost Lead Learning',
          description: 'Analyzes lost lead patterns to improve future qualification. Identifies common loss reasons by project type, price point, and source. Feeds into lead scoring model improvements.',
          trigger: 'On lead marked as Lost'
        },
      ]}
      mockupAscii={`
┌─────────────┬─────────────┬─────────────┬─────────────┐
│    NEW      │  QUALIFIED  │  PROPOSAL   │    WON      │
│    (3)      │    (5)      │   SENT (2)  │    (12)     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ Smith   │ │ │ Johnson │ │ │ Miller  │ │ │ Davis   │ │
│ │ New Cnst│ │ │ Renov   │ │ │ Addition│ │ │ Custom  │ │
│ │ $850k   │ │ │ $120k   │ │ │ $250k   │ │ │ $920k   │ │
│ │ ○ Jake  │ │ │ ○ Mike  │ │ │ ○ Jake  │ │ │ ○ Sarah │ │
│ │ Score:87│ │ │ Score:72│ │ │ Score:91│ │ │ Score:95│ │
│ │ Win: 78%│ │ │ Win: 45%│ │ │ Win: 82%│ │ │ ✓ Won   │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │
│ ┌─────────┐ │ ┌─────────┐ │             │             │
│ │ Wilson  │ │ │ Brown   │ │  AI Alert:  │             │
│ │ Custom  │ │ │ Pool    │ │  "Miller    │             │
│ │ $1.2M   │ │ │ $85k    │ │  waiting 8  │             │
│ │ Score:94│ │ │ Score:58│ │  days-act!" │             │
│ └─────────┘ │ └─────────┘ │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
`}
    />
  )
}
