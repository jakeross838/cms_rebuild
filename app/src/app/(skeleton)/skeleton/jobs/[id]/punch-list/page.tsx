'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PunchListPreview } from '@/components/skeleton/previews/punch-list-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobPunchListPage() {
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
      {activeTab === 'preview' ? <PunchListPreview /> : <PageSpec
      title="Punch List"
      phase="Phase 1 - Project Management"
      planFile="views/jobs/PUNCH_LIST.md"
      description="Track punch list items for project closeout. Document deficiencies, assign responsibility, and track completion. Essential for final payment and client satisfaction."
      workflow={['Identify Item', 'Document', 'Assign', 'Complete', 'Verify', 'Close']}
      features={[
        'Punch item list',
        'Room/area organization',
        'Photo documentation',
        'Assign to trade/person',
        'Priority levels',
        'Due dates',
        'Completion tracking',
        'Verification workflow',
        'Client walkthrough mode',
        'Bulk item entry',
        'Progress dashboard',
        'Print punch list',
        'Export for trades',
        'Historical comparison',
      ]}
      connections={[
        { name: 'Photos', type: 'bidirectional', description: 'Photo documentation' },
        { name: 'Team', type: 'input', description: 'Assign to team' },
        { name: 'Vendors', type: 'input', description: 'Assign to subs' },
        { name: 'Warranty', type: 'output', description: 'Warranty items' },
        { name: 'Draws', type: 'output', description: 'Final draw hold' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'item_number', type: 'integer', required: true, description: 'Sequential number' },
        { name: 'location', type: 'string', required: true, description: 'Room/area' },
        { name: 'description', type: 'text', required: true, description: 'What needs fixing' },
        { name: 'trade', type: 'string', description: 'Responsible trade' },
        { name: 'assigned_to', type: 'uuid', description: 'Person assigned' },
        { name: 'priority', type: 'string', description: 'High, Medium, Low' },
        { name: 'due_date', type: 'date', description: 'Complete by' },
        { name: 'photos', type: 'jsonb', description: 'Before photos' },
        { name: 'status', type: 'string', required: true, description: 'Open, In Progress, Complete, Verified' },
        { name: 'completed_at', type: 'timestamp', description: 'When completed' },
        { name: 'completed_by', type: 'uuid', description: 'Who completed' },
        { name: 'verified_at', type: 'timestamp', description: 'When verified' },
        { name: 'verified_by', type: 'uuid', description: 'Who verified' },
        { name: 'completion_photos', type: 'jsonb', description: 'After photos' },
      ]}
      aiFeatures={[
        {
          name: 'Smart Assignment',
          description: 'Routes to correct trade. "Paint touch-up items auto-assigned to ABC Painting based on scope."',
          trigger: 'On item creation'
        },
        {
          name: 'Progress Tracking',
          description: 'Monitors completion. "68% complete. At current rate, estimated completion in 4 days."',
          trigger: 'Daily update'
        },
        {
          name: 'Pattern Recognition',
          description: 'Identifies trends. "15 paint items, 8 trim items. Consider dedicated paint/trim day."',
          trigger: 'On list analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Punch List - Smith Residence                    Total: 45 Items     │
├─────────────────────────────────────────────────────────────────────┤
│ PROGRESS                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 68%     │ │
│ │ Verified: 25 | Complete: 6 | In Progress: 8 | Open: 6          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All Areas ▾]  [All Trades ▾]  Status: [Open ▾]            │
├─────────────────────────────────────────────────────────────────────┤
│ OPEN ITEMS                                                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ #42  Master Bedroom - Paint touch-up above window               │ │
│ │      Trade: Painting | Assigned: ABC Painting | Priority: Med  │ │
│ │      📷 Photo attached | Due: Feb 1                             │ │
│ │      [Mark Complete] [Reassign] [View Photo]                    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ #43  Kitchen - Cabinet door alignment                           │ │
│ │      Trade: Cabinets | Assigned: Cabinet Co | Priority: High   │ │
│ │      📷 Photo attached | Due: Jan 30                            │ │
│ │      [Mark Complete] [Reassign] [View Photo]                    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ #44  Guest Bath - Grout haze on floor tile                     │ │
│ │      Trade: Tile | Assigned: XYZ Tile | Priority: Low          │ │
│ │      📷 Photo attached | Due: Feb 2                             │ │
│ │      [Mark Complete] [Reassign] [View Photo]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ [+ Add Item] [Client Walkthrough Mode] [Export for Trades]          │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
