'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { RFIsPreview } from '@/components/skeleton/previews/rfis-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Identify Question', 'Create RFI + Markup', 'Route to A/E', 'Ball-in-Court', 'Response', 'Impact → CO'
]

export default function RFIsSkeleton() {
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
      {activeTab === 'preview' ? <RFIsPreview /> : <PageSpec
      title="RFI Management"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/27-rfi-management.md"
      description="Full RFI lifecycle management with AI-powered similar RFI search and response drafting. Document questions with plan markup, route to architects/engineers with ball-in-court tracking, enforce SLA deadlines by priority, assess cost and schedule impact, and link to change orders. Every RFI answer feeds the project knowledge base."
      workflow={constructionWorkflow}
      features={[
        'RFI log with sequential numbering per project (YYYY-JOB-RFI-NNN)',
        'Question documentation with detailed context and drawing references',
        'Photo and drawing markup attachment with plan markup indicator',
        'Spec reference and drawing reference linking',
        'Route to architect, engineer, owner, or consultant',
        'Ball-in-court tracking showing current responsible party',
        'Distribution routing with viewed/responded timestamps',
        'Response thread with multiple types (answer, clarification, partial, forward)',
        'Priority levels with configurable SLA deadlines (low/standard/urgent/critical)',
        'Cost impact assessment with dollar amounts',
        'Schedule impact assessment with day estimates',
        'Change order linkage when scope change identified',
        'Linked schedule task display for impact visualization',
        'Trade-based filtering and categorization',
        'Export RFI log with full response history',
        'AI-suggested responses from similar resolved RFIs across projects',
        'Cumulative impact dashboard (total cost/schedule across all open RFIs)',
        'SLA escalation with automatic reminders',
        'Architect/engineer transition workflow for mid-project team changes',
        'Knowledge base building from all answered RFIs',
      ]}
      connections={[
        { name: 'Documents (M6)', type: 'bidirectional', description: 'Drawing/spec references and plan markup attachments' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Schedule task linkage for impact assessment' },
        { name: 'Change Orders (M17)', type: 'output', description: 'CO creation when RFI identifies scope change' },
        { name: 'Daily Logs (M8)', type: 'input', description: 'Field conditions that trigger RFIs' },
        { name: 'Vendors (M10)', type: 'input', description: 'External party directory for routing' },
        { name: 'Budget (M9)', type: 'output', description: 'Cost impact tracking feeds budget variance' },
        { name: 'Submittals', type: 'bidirectional', description: 'RFIs may reference or be triggered by submittal reviews' },
        { name: 'Notifications (M5)', type: 'output', description: 'SLA alerts, escalation, and follow-up reminders' },
        { name: 'Price Intelligence (M23)', type: 'output', description: 'RFI cost impacts feed future estimates' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'rfi_number', type: 'string', required: true, description: 'Sequential (YYYY-JOB-RFI-NNN)' },
        { name: 'subject', type: 'string', required: true, description: 'Brief subject line' },
        { name: 'question', type: 'text', required: true, description: 'Detailed question with context' },
        { name: 'from_user_id', type: 'uuid', required: true, description: 'Who submitted the RFI' },
        { name: 'trade_category', type: 'string', description: 'Trade classification' },
        { name: 'priority', type: 'string', required: true, description: 'low, standard, urgent, critical' },
        { name: 'status', type: 'string', required: true, description: 'draft, submitted, under_review, response_received, accepted, closed' },
        { name: 'spec_reference', type: 'string', description: 'Specification section reference' },
        { name: 'drawing_reference', type: 'string', description: 'Drawing sheet and detail' },
        { name: 'plan_markup', type: 'boolean', description: 'Has marked-up plan attachment' },
        { name: 'date_submitted', type: 'date', description: 'When submitted' },
        { name: 'due_date', type: 'date', description: 'Response due per SLA' },
        { name: 'cost_impact', type: 'decimal', description: 'Estimated cost impact ($)' },
        { name: 'schedule_impact_days', type: 'integer', description: 'Estimated schedule impact (days)' },
        { name: 'change_order_id', type: 'uuid', description: 'FK to change order if scope change' },
        { name: 'linked_schedule_task', type: 'string', description: 'Schedule task affected' },
        { name: 'routing', type: 'jsonb', description: 'Distribution with ball-in-court tracking' },
        { name: 'responses', type: 'jsonb', description: 'Response thread with attachments' },
        { name: 'ai_suggested_response', type: 'text', description: 'AI-generated response suggestion' },
      ]}
      aiFeatures={[
        {
          name: 'Similar RFI Search',
          description: 'Finds similar resolved RFIs across builder project history and suggests responses. Cross-references spec sections, drawings, and trade categories.',
          trigger: 'On RFI creation'
        },
        {
          name: 'AI-Suggested Response',
          description: 'Generates draft response based on similar resolved RFIs, spec requirements, and drawing context. Builder reviews before sending.',
          trigger: 'When RFI is routed'
        },
        {
          name: 'Impact Assessment',
          description: 'Predicts cost and schedule impact based on category, complexity, and historical patterns. Links to affected schedule tasks.',
          trigger: 'On submission'
        },
        {
          name: 'SLA Escalation',
          description: 'Monitors response deadlines per priority. Auto-escalates overdue RFIs with reminders. Tracks response time patterns by external party.',
          trigger: 'Daily check, real-time for critical'
        },
        {
          name: 'Change Order Prediction',
          description: 'Predicts likelihood of RFI resulting in change order based on subject matter and historical patterns.',
          trigger: 'On RFI creation'
        },
        {
          name: 'Cumulative Impact Analysis',
          description: 'Aggregates cost and schedule impact across all open RFIs. Compares to similar projects to identify if RFI volume is abnormal.',
          trigger: 'Dashboard update'
        },
        {
          name: 'Knowledge Base Building',
          description: 'Builds searchable knowledge base from all answered RFIs. Indexes by spec section, trade, and drawing reference for future lookups.',
          trigger: 'Continuous learning'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
