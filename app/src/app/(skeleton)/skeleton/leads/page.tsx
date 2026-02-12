'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { LeadsPipelinePreview } from '@/components/skeleton/previews/leads-preview'
import { Eye, BookOpen } from 'lucide-react'
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
            'Stages: New, Qualified, Proposal Sent, Won, Lost',
            'Convert to Job: Auto-creates client and job on winning',
            'Quick filters by stage, assigned user, source, project type',
            'Estimated value tracking with range filtering',
            'Activity feed and notes per lead',
            'Bulk actions: Change stage, Assign user, Delete',
          ]}
          connections={[
            { name: 'Users', type: 'input', description: 'Lead assignment to team members' },
            { name: 'Clients', type: 'output', description: 'Auto-creates client when lead converts' },
            { name: 'Jobs', type: 'output', description: 'Creates job when lead marked as Won' },
            { name: 'Estimates', type: 'output', description: 'Estimate can be created from lead' },
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
            { name: 'stage', type: 'string', required: true, description: 'New, Qualified, Proposal Sent, Won, Lost' },
            { name: 'assigned_user_id', type: 'uuid', description: 'Assigned team member' },
            { name: 'ai_score', type: 'decimal', description: 'AI-generated lead score' },
            { name: 'win_probability', type: 'decimal', description: 'AI-predicted win likelihood' },
          ]}
          aiFeatures={[
            { name: 'Lead Scoring', description: 'AI scores leads 1-100 based on project type, value, source, location, and engagement patterns.', trigger: 'On lead create and every update' },
            { name: 'Win Probability', description: 'Predicts likelihood of winning based on historical patterns.', trigger: 'Real-time calculation' },
            { name: 'Follow-up Intelligence', description: 'Suggests optimal follow-up timing based on lead activity and stage duration.', trigger: 'Daily analysis and real-time alerts' },
          ]}
        />
      )}
    </div>
  )
}
