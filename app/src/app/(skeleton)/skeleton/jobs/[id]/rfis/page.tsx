'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { RFIsPreview } from '@/components/skeleton/previews/rfis-preview'
import { cn } from '@/lib/utils'

export default function JobRFIsPage() {
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
      {activeTab === 'preview' ? <RFIsPreview /> : <PageSpec
      title="RFI Management"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/27-rfi-management.md"
      description="Full Request for Information lifecycle management. Document questions with plan markup references, route to architects/engineers with ball-in-court tracking, enforce SLA deadlines by priority, assess cost and schedule impact, and link to change orders when scope changes are identified. AI suggests responses from similar resolved RFIs across the builder's project history."
      workflow={['Identify Question', 'Create RFI + Plan Markup', 'Route to Design Team', 'Track Ball-in-Court', 'Receive Response', 'Assess Impact', 'Close or Create CO']}
      features={[
        'RFI log with sequential numbering per project',
        'Question documentation with detailed description',
        'Photo and drawing markup attachment',
        'Spec reference and drawing reference linking',
        'Plan markup indicator for marked-up drawings',
        'Route to correct party (architect, engineer, owner, consultant)',
        'Ball-in-court tracking showing current responsible party',
        'Distribution routing with viewed/responded timestamps',
        'Response thread with multiple response types (answer, clarification, partial, forward)',
        'Priority levels with configurable SLA deadlines (low/standard/urgent/critical)',
        'Due date management with automatic escalation',
        'Cost impact assessment with dollar amounts',
        'Schedule impact assessment with day estimates',
        'Change order linkage when scope change identified',
        'Linked schedule task display for impact visualization',
        'Trade-based filtering and categorization',
        'Export RFI log with full response history',
        'AI-suggested responses from similar resolved RFIs',
        'Cumulative impact dashboard (total cost/schedule impact across all RFIs)',
        'Architect/engineer transition workflow for mid-project team changes',
      ]}
      connections={[
        { name: 'Documents (M6)', type: 'input', description: 'Drawing and spec references; plan markup attachments' },
        { name: 'Change Orders (M17)', type: 'output', description: 'CO creation when RFI identifies scope change' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Schedule task linkage for impact assessment' },
        { name: 'Daily Logs (M8)', type: 'input', description: 'Field conditions that trigger RFIs' },
        { name: 'Vendors (M10)', type: 'input', description: 'External party directory for routing' },
        { name: 'Budget (M9)', type: 'output', description: 'Cost impact tracking feeds budget variance' },
        { name: 'Submittals', type: 'bidirectional', description: 'RFIs may reference or be triggered by submittal reviews' },
        { name: 'Notifications (M5)', type: 'output', description: 'SLA alerts, escalation, and follow-up reminders' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'rfi_number', type: 'string', required: true, description: 'Sequential number (YYYY-JOB-RFI-NNN format)' },
        { name: 'subject', type: 'string', required: true, description: 'Brief subject line' },
        { name: 'question', type: 'text', required: true, description: 'Detailed question with context' },
        { name: 'from_user_id', type: 'uuid', required: true, description: 'Who submitted the RFI' },
        { name: 'from_company', type: 'string', description: 'Submitter company name' },
        { name: 'trade_category', type: 'string', description: 'Trade classification (Structural, MEP, Finishes, etc.)' },
        { name: 'priority', type: 'string', required: true, description: 'low, standard, urgent, critical — drives SLA' },
        { name: 'status', type: 'string', required: true, description: 'draft, submitted, under_review, response_received, accepted, closed' },
        { name: 'spec_reference', type: 'string', description: 'Specification section reference' },
        { name: 'drawing_reference', type: 'string', description: 'Drawing sheet and detail reference' },
        { name: 'plan_markup', type: 'boolean', description: 'Has marked-up plan attachment' },
        { name: 'date_submitted', type: 'date', description: 'When RFI was submitted' },
        { name: 'due_date', type: 'date', description: 'Response due date per SLA' },
        { name: 'days_open', type: 'integer', description: 'Calculated days since submission' },
        { name: 'cost_impact', type: 'decimal', description: 'Estimated cost impact in dollars' },
        { name: 'schedule_impact_days', type: 'integer', description: 'Estimated schedule impact in days' },
        { name: 'change_order_id', type: 'uuid', description: 'FK to change order if scope change' },
        { name: 'linked_schedule_task', type: 'string', description: 'Schedule task affected by this RFI' },
        { name: 'routing', type: 'jsonb', description: 'Distribution list with ball-in-court tracking' },
        { name: 'responses', type: 'jsonb', description: 'Response thread with attachments' },
        { name: 'ai_suggested_response', type: 'text', description: 'AI-generated response suggestion' },
        { name: 'photo_count', type: 'integer', description: 'Number of photos attached' },
      ]}
      aiFeatures={[
        {
          name: 'Similar RFI Search',
          description: 'Finds related resolved RFIs across the builder project history and suggests responses. Cross-references spec sections, drawing details, and trade categories.',
          trigger: 'On RFI creation'
        },
        {
          name: 'AI-Suggested Response',
          description: 'Generates draft response based on similar resolved RFIs, spec requirements, and drawing context. Builder reviews and edits before sending.',
          trigger: 'When RFI is routed'
        },
        {
          name: 'Impact Assessment',
          description: 'Predicts cost and schedule impact based on RFI category, complexity, and historical resolution patterns. Links to affected schedule tasks.',
          trigger: 'On submission'
        },
        {
          name: 'SLA Escalation',
          description: 'Monitors response deadlines per priority level. Auto-escalates overdue RFIs with reminders to responsible parties and CC to PM.',
          trigger: 'Daily check, real-time for critical'
        },
        {
          name: 'Cumulative Impact Analysis',
          description: 'Aggregates cost and schedule impact across all open RFIs. Compares to similar projects to identify if RFI volume/impact is abnormal.',
          trigger: 'Dashboard update'
        },
        {
          name: 'Ball-in-Court Intelligence',
          description: 'Tracks response patterns by external party. Identifies which architects/engineers are slow responders and suggests alternate routing.',
          trigger: 'On routing and daily analysis'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
