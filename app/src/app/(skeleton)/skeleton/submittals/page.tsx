'use client'
import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SubmittalsPreview } from '@/components/skeleton/previews/submittals-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Specifications', 'Submittals', 'Review', 'Approval', 'Procurement'
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
      phase="Phase 3 - Advanced PM"
      planFile="views/advanced-pm/SUBMITTALS.md"
      description="Track product submittals from vendors through the approval process. Manage submittal packages, route for architect/engineer review, track revisions, and maintain approval status for procurement authorization."
      workflow={constructionWorkflow}
      features={[
        'Submittal register with status tracking',
        'Create submittal packages by specification section',
        'Upload vendor product data sheets',
        'Route to architect/engineer for review',
        'Track reviewer comments and markups',
        'Revision management (Rev A, B, C...)',
        'Approval workflow: Submitted, Under Review, Approved, Rejected, Revise & Resubmit',
        'Link submittals to specifications',
        'Link approved submittals to POs',
        'Submittal log export for meetings',
        'Due date tracking with reminders',
        'Bulk submittal creation from spec sections',
        'Email notifications to reviewers',
        'Mobile review and markup',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'input', description: 'Product selections need submittal approval' },
        { name: 'Vendors', type: 'input', description: 'Vendors provide product data' },
        { name: 'Purchase Orders', type: 'output', description: 'Approved submittals enable procurement' },
        { name: 'Documents', type: 'bidirectional', description: 'Product data sheets stored' },
        { name: 'Schedule', type: 'bidirectional', description: 'Submittal deadlines from schedule' },
        { name: 'RFIs', type: 'bidirectional', description: 'Submittals may generate RFIs' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'submittal_number', type: 'string', required: true, description: 'Submittal ID (e.g., 08-001)' },
        { name: 'spec_section', type: 'string', description: 'Specification section' },
        { name: 'title', type: 'string', required: true, description: 'Submittal title' },
        { name: 'description', type: 'text', description: 'Detailed description' },
        { name: 'vendor_id', type: 'uuid', description: 'FK to vendors' },
        { name: 'selection_id', type: 'uuid', description: 'FK to selections' },
        { name: 'status', type: 'string', required: true, description: 'Submitted, Under Review, Approved, Rejected, Revise & Resubmit' },
        { name: 'revision', type: 'string', description: 'Current revision (A, B, C...)' },
        { name: 'submitted_date', type: 'date', description: 'Date submitted' },
        { name: 'due_date', type: 'date', description: 'Review due date' },
        { name: 'reviewed_date', type: 'date', description: 'Date reviewed' },
        { name: 'reviewer_id', type: 'uuid', description: 'Architect/Engineer reviewer' },
        { name: 'reviewer_comments', type: 'text', description: 'Review comments' },
        { name: 'documents', type: 'jsonb', description: 'Attached documents' },
      ]}
      aiFeatures={[
        {
          name: 'Spec Section Matching',
          description: 'Automatically matches submittals to spec sections: "Product data matches Division 08 - Openings, Section 08 51 13 - Aluminum Windows."',
          trigger: 'On submittal creation'
        },
        {
          name: 'Compliance Check',
          description: 'Checks submittal against specifications: "Window submittal shows U-factor 0.30, spec requires 0.25 or better. Flag for review."',
          trigger: 'On document upload'
        },
        {
          name: 'Schedule Impact',
          description: 'Warns of schedule impacts: "Window submittal 2 weeks overdue. Lead time 12 weeks. Current delay impacts installation by 2 weeks."',
          trigger: 'On status review'
        },
        {
          name: 'Similar Submittal Search',
          description: 'Finds similar past submittals: "Found 3 approved PGT window submittals from past projects. View for reference?"',
          trigger: 'On submittal creation'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Submittals - Smith Residence                [+ New] [Export Log]    │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 45 | Pending: 12 | Under Review: 8 | Approved: 22 | Rej: 3  │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All ▾] Section: [All ▾] Status: [All ▾]                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ⏳ UNDER REVIEW                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 08-001 Impact Windows - PGT WinGuard        Rev B   Due: Feb 1  │ │
│ │ Spec: 08 51 13 | Reviewer: ABC Architects                       │ │
│ │ Submitted: Jan 20 | ⚠ 3 days until due                         │ │
│ │ [View Documents] [Send Reminder] [Track]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 09-003 Tile - Master Bath Floor             Rev A   Due: Feb 5  │ │
│ │ Spec: 09 30 00 | Reviewer: Interior Design Co                   │ │
│ │ Client selection pending - will submit when finalized           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ✓ RECENTLY APPROVED                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 06-002 Exterior Trim - Azek                 Rev A   ✓ Approved  │ │
│ │ Approved: Jan 25 | Ready for PO creation                        │ │
│ │ [View Approval] [Create PO] [View Specs]                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "3 submittals overdue for review. Window submittal critical     │
│ path—12 week lead time. Recommend escalation to architect."         │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
