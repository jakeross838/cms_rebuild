'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PermitsPreview } from '@/components/skeleton/previews/permits-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobPermitsPage() {
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
      {activeTab === 'preview' ? <PermitsPreview /> : <PageSpec
      title="Permits"
      phase="Phase 1 - Compliance"
      planFile="views/jobs/PERMITS.md"
      description="Track all permits required for this job. Manage applications, approvals, and ensure compliance. Know permit status before scheduling related work and avoid costly delays."
      workflow={['Identify Required', 'Apply', 'Under Review', 'Approved', 'Posted on Site', 'Closed']}
      features={[
        'Permit checklist by job type',
        'Application tracking',
        'Required documents list',
        'Submission status',
        'Approval tracking',
        'Permit fees',
        'Expiration dates',
        'Renewal reminders',
        'Inspector contacts',
        'Related inspections',
        'Document attachments',
        'Permit card storage',
        'Schedule integration',
        'Compliance reporting',
      ]}
      connections={[
        { name: 'Documents', type: 'bidirectional', description: 'Permit documents' },
        { name: 'Inspections', type: 'output', description: 'Required inspections' },
        { name: 'Schedule', type: 'bidirectional', description: 'Work dependencies' },
        { name: 'Budget', type: 'output', description: 'Permit fees' },
        { name: 'Building Department', type: 'bidirectional', description: 'Submissions' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'permit_type', type: 'string', required: true, description: 'Building, Electrical, Plumbing, etc.' },
        { name: 'permit_number', type: 'string', description: 'Assigned number' },
        { name: 'jurisdiction', type: 'string', required: true, description: 'City/county' },
        { name: 'application_date', type: 'date', description: 'When applied' },
        { name: 'approval_date', type: 'date', description: 'When approved' },
        { name: 'expiration_date', type: 'date', description: 'When expires' },
        { name: 'fee_amount', type: 'decimal', description: 'Permit fee' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Applied, Under Review, Approved, Expired' },
        { name: 'documents', type: 'jsonb', description: 'Required documents' },
        { name: 'notes', type: 'text', description: 'Notes' },
        { name: 'inspector', type: 'string', description: 'Assigned inspector' },
      ]}
      aiFeatures={[
        {
          name: 'Permit Requirements',
          description: 'Identifies needed permits.',
          trigger: 'On job creation'
        },
        {
          name: 'Timeline Management',
          description: 'Plans permit timing.',
          trigger: 'On schedule planning'
        },
        {
          name: 'Expiration Alerts',
          description: 'Monitors permit validity.',
          trigger: 'Periodic check'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
