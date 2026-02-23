'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { LeadsPipelinePreview } from '@/components/skeleton/previews/leads-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts',
  'Jobs List', 'Budget', 'Schedule', 'Execution'
]

export default function LeadsPipelineSkeleton() {
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
        <LeadsPipelinePreview />
      ) : (
        <PageSpec
          title="Leads Pipeline"
          phase="Phase 0 - Foundation"
          planFile="views/leads/LEADS_PIPELINE.md"
          description="Manage sales pipeline for potential construction projects. Kanban board view for visual pipeline management with drag-and-drop stage changes."
          workflow={constructionWorkflow}
          features={[
            'Kanban board view with drag-and-drop between stages',
            'Table list view with sortable columns',
            'Builder-defined pipeline stages (default: New, Qualified, Consultation, Proposal, Negotiation, Won, Lost)',
            'Stage gates: required fields/actions before advancing',
            'Convert to Job: Auto-creates client and job on winning with data carryover',
            'Quick filters by stage, assigned user, source, project type, lot status',
            'Pipeline value tracking: expected value x probability per stage',
            'Pipeline velocity: average days per stage, overall cycle time',
            'Stale lead alerts: configurable per stage (luxury precon 3 months is normal)',
            'Competitive tracking: known competitors, perceived position, win/loss reasons',
            'Lead deduplication on name, email, phone, address with merge workflow',
            'Lead source ROI tracking: spend vs conversions vs contract value',
            'Automated nurturing sequences: drip campaigns, follow-up tasks',
            'Consultation scheduling with pre-consultation checklist',
            'Dream board capture: inspiration images, must-have features, lifestyle needs',
            'Preconstruction workflows: design-build and plan-bid-build tracks',
            'Pre-construction agreement management with billing',
            'Scope iterations: V1/V2/V3 estimate versions linked to pipeline progression',
            'Design team assembly: architect, engineer, interior designer tracking',
            'Design milestone tracking with client review gates',
            'Lot evaluation checklist: soil, survey, flood zone, setbacks, utilities, HOA',
            'Quick feasibility calculator: configurable formula per builder',
            'Win/loss analytics with reason codes and competitive analysis',
            'Activity logging: calls, emails, meetings, site visits',
            'Networking & event tracking with follow-up generation',
            'Strategic lot watch list with alerts',
            'Bulk actions: Change stage, Assign user, Archive',
          ]}
          connections={[
            { name: 'Users', type: 'input', description: 'Lead assignment and routing to team members' },
            { name: 'Clients', type: 'output', description: 'Auto-creates client when lead converts' },
            { name: 'Jobs', type: 'output', description: 'Creates job when lead marked as Won' },
            { name: 'Estimating Engine', type: 'output', description: 'Scope iterations generate estimates (Module 20)' },
            { name: 'Contracts & E-Sign', type: 'output', description: 'Contract generation on deal close (Module 38)' },
            { name: 'Notification Engine', type: 'bidirectional', description: 'Follow-up reminders, nurturing email delivery (Module 5)' },
            { name: 'Marketing & Portfolio', type: 'input', description: 'Lead capture form integration, source tracking (Module 37)' },
            { name: 'Scheduling & Calendar', type: 'bidirectional', description: 'Consultation calendar integration (Module 7)' },
            { name: 'Contact/Vendor Management', type: 'bidirectional', description: 'Contact records shared (Module 10)' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'name', type: 'string', required: true, description: 'Client/project name' },
            { name: 'first_name', type: 'string', required: true, description: 'Contact first name' },
            { name: 'last_name', type: 'string', required: true, description: 'Contact last name' },
            { name: 'email', type: 'string', description: 'Contact email' },
            { name: 'phone', type: 'string', description: 'Contact phone' },
            { name: 'address', type: 'string', description: 'Project address' },
            { name: 'lot_address', type: 'string', description: 'Lot address (if different)' },
            { name: 'project_type', type: 'string', description: 'New construction, renovation, addition, remodel' },
            { name: 'preconstruction_type', type: 'string', description: 'design_build or plan_bid_build' },
            { name: 'estimated_sf', type: 'integer', description: 'Estimated square footage' },
            { name: 'budget_range_low', type: 'decimal', description: 'Budget range lower bound' },
            { name: 'budget_range_high', type: 'decimal', description: 'Budget range upper bound' },
            { name: 'expected_contract_value', type: 'decimal', description: 'Expected contract value' },
            { name: 'probability_pct', type: 'decimal', description: 'Probability at current stage' },
            { name: 'stage_id', type: 'uuid', required: true, description: 'FK to pipeline_stages' },
            { name: 'source', type: 'string', description: 'Lead source (Referral, Houzz, Website, etc.)' },
            { name: 'source_detail', type: 'string', description: 'Source detail or referrer name' },
            { name: 'utm_source', type: 'string', description: 'UTM source parameter' },
            { name: 'utm_medium', type: 'string', description: 'UTM medium parameter' },
            { name: 'utm_campaign', type: 'string', description: 'UTM campaign parameter' },
            { name: 'assigned_to', type: 'uuid', description: 'Assigned PM user ID' },
            { name: 'lot_status', type: 'string', description: 'owned, under_contract, looking' },
            { name: 'financing_status', type: 'string', description: 'pre_approved, cash, needs_approval' },
            { name: 'timeline', type: 'string', description: 'Client readiness timeline' },
            { name: 'score', type: 'integer', description: 'AI-generated lead score (0-100)' },
            { name: 'budget_realism_score', type: 'integer', description: 'Budget-to-wish alignment score' },
            { name: 'status', type: 'string', required: true, description: 'active, won, lost, archived' },
            { name: 'lost_reason', type: 'string', description: 'Reason code when marked lost' },
            { name: 'lost_competitor', type: 'string', description: 'Competitor who won (if applicable)' },
            { name: 'won_project_id', type: 'uuid', description: 'FK to jobs on conversion' },
          ]}
          aiFeatures={[
            { name: 'Lead Scoring', description: 'AI scores leads 0-100 based on project type, value, source, lot status, financing, engagement, and budget realism. Weighted scoring model with builder-configurable criteria.', trigger: 'On lead create and every update' },
            { name: 'Win Probability', description: 'Predicts likelihood of winning based on historical win/loss patterns, stage velocity, and competitive landscape.', trigger: 'Real-time recalculation on data changes' },
            { name: 'Budget Realism Score', description: 'Composite score assessing whether client budget aligns with wish list. Factors: lot ownership, financing pre-approval, comparable project data, scope complexity.', trigger: 'On lead create and scope changes' },
            { name: 'Follow-up Intelligence', description: 'Suggests optimal follow-up timing based on lead activity and stage duration. Alerts on stale leads with configurable thresholds per stage.', trigger: 'Daily analysis and real-time alerts' },
            { name: 'Lead Source ROI Analysis', description: 'Calculates ROI per lead source: marketing spend vs. contracts won. Identifies highest-performing channels.', trigger: 'Monthly analysis with dashboard display' },
            { name: 'Competitive Intelligence', description: 'Tracks which competitors you are losing to and why. Surfaces patterns in win/loss data to inform positioning.', trigger: 'On win/loss recording' },
            { name: 'Quick Feasibility Calculator', description: 'Configurable formula producing rough cost range from lot characteristics, desired scope, and current cost data.', trigger: 'On demand during consultation' },
            { name: 'Duplicate Detection', description: 'Checks name, email, phone, address against existing leads. Prompts for merge if match found.', trigger: 'On lead creation' },
          ]}
        />
      )}
    </div>
  )
}
