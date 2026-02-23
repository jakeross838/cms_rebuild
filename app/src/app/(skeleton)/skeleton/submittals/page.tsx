'use client'
import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { SubmittalsPreview } from '@/components/skeleton/previews/submittals-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Specifications', 'Vendor Docs', 'Internal Review', 'Route to A/E', 'Stamp', 'Approval → PO Release'
]

export default function SubmittalsSkeleton() {
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
      {activeTab === 'preview' ? <SubmittalsPreview /> : <PageSpec
        title="Submittals"
        phase="Phase 4 - Intelligence"
        planFile="docs/modules/27-rfi-management.md"
        description="Track product submittals through the full approval lifecycle: vendor submission, internal review, architect/engineer routing with distribution tracking, stamp workflow (approved, approved as noted, revise and resubmit, rejected), revision management, and PO hold integration. AI predicts approval timelines and flags overdue reviews."
        workflow={constructionWorkflow}
        features={[
          'Submittal register with status tracking and revision history',
          'Create submittal packages by specification section',
          'Upload vendor product data sheets with document count',
          'Route to architect/engineer with distribution tracking',
          'Ball-in-court indicator showing current responsible party',
          'Review stamp workflow (Approved, Approved as Noted, No Exceptions, Revise & Resubmit, Rejected)',
          'Engineer license number tracking on stamps',
          'Revision management with full version history',
          'Trade category classification and filtering',
          'Link submittals to selections module (product choices)',
          'Link approved submittals to POs with hold/release tracking',
          'Schedule dependency warnings for delayed submittals',
          'Lead time tracking (days from approval to delivery)',
          'Permit requirement flag for structural submittals',
          'Submittal log export with stamp history',
          'Due date tracking with overdue alerts',
          'Bulk submittal creation from spec sections',
          'Email notifications to reviewers and vendors',
          'AI-predicted approval timeline per submittal',
        ]}
        connections={[
          { name: 'Vendors (M10)', type: 'input', description: 'Vendors provide submittal documents' },
          { name: 'Selections (M21)', type: 'input', description: 'Product selections drive submittal requirements' },
          { name: 'Purchase Orders (M18)', type: 'bidirectional', description: 'PO held until approved; approval triggers release' },
          { name: 'Documents (M6)', type: 'bidirectional', description: 'Product data sheets stored and referenced' },
          { name: 'Schedule (M7)', type: 'bidirectional', description: 'Lead time planning and schedule dependency warnings' },
          { name: 'RFIs (M27)', type: 'bidirectional', description: 'Submittals may generate RFIs' },
          { name: 'Architect/Engineer', type: 'bidirectional', description: 'Route for review, stamp, and engineer tracking' },
          { name: 'Permitting (M32)', type: 'output', description: 'Structural submittals link to permit applications' },
          { name: 'Notifications (M5)', type: 'output', description: 'Overdue alerts and distribution notifications' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
          { name: 'submittal_number', type: 'string', required: true, description: 'Submittal ID (SUB-NNN)' },
          { name: 'spec_section', type: 'string', description: 'Specification section' },
          { name: 'trade_category', type: 'string', description: 'Trade classification' },
          { name: 'description', type: 'string', required: true, description: 'Submittal description' },
          { name: 'vendor_id', type: 'uuid', description: 'FK to vendors' },
          { name: 'selection_link', type: 'jsonb', description: 'Link to selection (name, room)' },
          { name: 'status', type: 'string', required: true, description: 'pending, submitted, under_review, approved, approved_as_noted, revise_resubmit, rejected' },
          { name: 'revision', type: 'integer', description: 'Current revision number' },
          { name: 'submitted_date', type: 'date', description: 'Date received from vendor' },
          { name: 'required_date', type: 'date', description: 'Approval needed by' },
          { name: 'lead_time_days', type: 'integer', description: 'Days from approval to delivery' },
          { name: 'distribution', type: 'jsonb', description: 'Routing with sent/viewed/responded tracking' },
          { name: 'stamps', type: 'jsonb', description: 'Review stamps with action, reviewer, license, comments' },
          { name: 'linked_po', type: 'jsonb', description: 'Linked PO with hold/released status' },
          { name: 'schedule_dependency', type: 'jsonb', description: 'Schedule task link with impact and critical flag' },
          { name: 'permit_required', type: 'boolean', description: 'Requires engineer stamp for permitting' },
          { name: 'document_count', type: 'integer', description: 'Number of attached documents' },
        ]}
        aiFeatures={[
          {
            name: 'Approval Timeline Prediction',
            description: 'Predicts days to approval based on reviewer patterns, complexity, and vendor revision history. Shows predicted days on each submittal card.',
            trigger: 'On submission and daily recalculation'
          },
          {
            name: 'Spec Section Matching',
            description: 'Automatically matches submitted product data to specification sections using document AI analysis.',
            trigger: 'On submittal creation'
          },
          {
            name: 'Compliance Check',
            description: 'Checks submittal data against specification requirements and flags non-compliance before routing to reviewer.',
            trigger: 'On document upload'
          },
          {
            name: 'Schedule Impact Warning',
            description: 'Calculates downstream schedule impact when reviews are delayed. Alerts when lead time plus review time threatens installation dates.',
            trigger: 'On status review and daily check'
          },
          {
            name: 'Distribution Monitoring',
            description: 'Tracks reviewer engagement: flags submittals not viewed or not responded to beyond typical response window.',
            trigger: 'Real-time tracking'
          },
          {
            name: 'PO Release Automation',
            description: 'Triggers PO release notification on approval. Alerts PM if lead time ordering deadline has passed.',
            trigger: 'On stamp action'
          },
        ]}
        mockupAscii=""
      />}
    </div>
  )
}
