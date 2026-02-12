'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SubmittalsPreview } from '@/components/skeleton/previews/submittals-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobSubmittalsPage() {
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
      phase="Phase 1 - Project Management"
      planFile="views/jobs/SUBMITTALS.md"
      description="Track product submittals for architect/engineer approval. Manage the submittal workflow from vendor to design team and back. Ensure all products are approved before ordering."
      workflow={['Request from Vendor', 'Review Internally', 'Submit for Approval', 'Revise if Needed', 'Approved']}
      features={[
        'Submittal log',
        'Submittal schedule',
        'Vendor submittal requests',
        'Internal review',
        'Route to design team',
        'Approval status tracking',
        'Revision management',
        'Due date tracking',
        'Spec section reference',
        'Related POs (hold until approved)',
        'Bulk approval',
        'Digital stamps',
        'Submittal packages',
        'Export submittal log',
      ]}
      connections={[
        { name: 'Vendors', type: 'input', description: 'Request submittals' },
        { name: 'Specifications', type: 'input', description: 'Spec requirements' },
        { name: 'Purchase Orders', type: 'bidirectional', description: 'Hold PO until approved' },
        { name: 'Schedule', type: 'bidirectional', description: 'Lead time planning' },
        { name: 'Architect/Engineer', type: 'bidirectional', description: 'Route for approval' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'submittal_number', type: 'string', required: true, description: 'Submittal ID' },
        { name: 'spec_section', type: 'string', description: 'Specification section' },
        { name: 'description', type: 'string', required: true, description: 'Item description' },
        { name: 'vendor_id', type: 'uuid', description: 'Providing vendor' },
        { name: 'submitted_date', type: 'date', description: 'When submitted' },
        { name: 'required_date', type: 'date', description: 'Need approval by' },
        { name: 'lead_time', type: 'integer', description: 'Days after approval' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Submitted, Approved, Revise and Resubmit, Rejected' },
        { name: 'revision', type: 'integer', description: 'Revision number' },
        { name: 'reviewer', type: 'string', description: 'Who reviews' },
        { name: 'review_date', type: 'date', description: 'When reviewed' },
        { name: 'comments', type: 'text', description: 'Review comments' },
        { name: 'documents', type: 'jsonb', description: 'Attached files' },
      ]}
      aiFeatures={[
        {
          name: 'Schedule Integration',
          description: 'Manages timing.',
          trigger: 'On schedule update'
        },
        {
          name: 'Vendor Follow-up',
          description: 'Tracks requests.',
          trigger: 'Daily check'
        },
        {
          name: 'Approval Prediction',
          description: 'Estimates timelines.',
          trigger: 'On submission'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
