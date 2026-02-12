'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { InspectionsPreview } from '@/components/skeleton/previews/inspections-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobInspectionsPage() {
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
      {activeTab === 'preview' ? <InspectionsPreview /> : <PageSpec
      title="Inspections"
      phase="Phase 1 - Compliance"
      planFile="views/jobs/INSPECTIONS.md"
      description="Manage all inspections for this job. Schedule inspections, prepare for them, track results, and address any failures. Critical for maintaining schedule and ensuring quality."
      workflow={['Work Complete', 'Request Inspection', 'Scheduled', 'Inspector On-Site', 'Pass/Fail', 'Re-inspect if Needed']}
      features={[
        'Inspection checklist by permit',
        'Request scheduling',
        'Pre-inspection checklists',
        'Inspector availability',
        'Result tracking',
        'Failure documentation',
        'Re-inspection scheduling',
        'Inspection history',
        'Photo documentation',
        'Notes and comments',
        'Schedule integration',
        'Notification to team',
        'Inspector contact info',
        'Compliance calendar',
      ]}
      connections={[
        { name: 'Permits', type: 'input', description: 'Required inspections' },
        { name: 'Schedule', type: 'bidirectional', description: 'Work timing' },
        { name: 'Daily Logs', type: 'output', description: 'Log results' },
        { name: 'Photos', type: 'bidirectional', description: 'Documentation' },
        { name: 'Building Department', type: 'bidirectional', description: 'Schedule requests' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'permit_id', type: 'uuid', description: 'Related permit' },
        { name: 'inspection_type', type: 'string', required: true, description: 'Type of inspection' },
        { name: 'requested_date', type: 'date', description: 'Preferred date' },
        { name: 'scheduled_date', type: 'date', description: 'Confirmed date' },
        { name: 'scheduled_time', type: 'string', description: 'Time window' },
        { name: 'inspector', type: 'string', description: 'Inspector name' },
        { name: 'status', type: 'string', required: true, description: 'Pending, Scheduled, Passed, Failed, Cancelled' },
        { name: 'result', type: 'string', description: 'Pass, Fail, Partial' },
        { name: 'comments', type: 'text', description: 'Inspector comments' },
        { name: 'corrections_needed', type: 'text', description: 'Required fixes' },
        { name: 'reinspection_date', type: 'date', description: 'Re-inspect date' },
        { name: 'photos', type: 'jsonb', description: 'Photos taken' },
      ]}
      aiFeatures={[
        {
          name: 'Pre-Inspection Check',
          description: 'Ensures readiness.',
          trigger: 'Day before inspection'
        },
        {
          name: 'Scheduling Optimization',
          description: 'Plans inspection timing.',
          trigger: 'On work completion'
        },
        {
          name: 'Failure Resolution',
          description: 'Addresses failures.',
          trigger: 'On failure'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
