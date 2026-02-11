'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Construction', 'Punch List', 'Final Inspection', 'Closeout', 'Warranty'
]

export default function PunchListsSkeleton() {
  return (
    <PageSpec
      title="Punch Lists"
      phase="Phase 0 - Foundation"
      planFile="views/closeout/PUNCH_LISTS.md"
      description="Track and resolve punch list items before project closeout. Capture items via mobile with photo markup, assign to vendors, track completion status, and get client sign-off. Integrates with warranty tracking for post-completion issues."
      workflow={constructionWorkflow}
      features={[
        'Punch list organized by location/room',
        'Mobile capture with photo and markup',
        'Voice-to-text item description',
        'Assign items to vendors/trades',
        'Priority levels: Critical, Major, Minor, Cosmetic',
        'Due date tracking',
        'Photo before/after comparison',
        'Vendor notification via email/portal',
        'Bulk status updates',
        'Client walkthrough mode',
        'Client sign-off on completed items',
        'Export punch list to PDF',
        'Link to warranty items if not resolved',
        'Statistics: Items by trade, completion rate',
        'Historical punch data for vendor scorecards',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Punch list scoped to job' },
        { name: 'Vendors', type: 'bidirectional', description: 'Items assigned to vendors' },
        { name: 'Photos', type: 'input', description: 'Photo documentation of items' },
        { name: 'Vendor Portal', type: 'output', description: 'Vendors see assigned items' },
        { name: 'Client Portal', type: 'output', description: 'Client can view and sign off' },
        { name: 'Warranties', type: 'output', description: 'Unresolved items become warranty' },
        { name: 'Vendor Intelligence', type: 'output', description: 'Punch data feeds vendor scores' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'location', type: 'string', required: true, description: 'Room/area' },
        { name: 'description', type: 'text', required: true, description: 'Item description' },
        { name: 'priority', type: 'string', required: true, description: 'Critical, Major, Minor, Cosmetic' },
        { name: 'status', type: 'string', required: true, description: 'Open, In Progress, Complete, Verified' },
        { name: 'assigned_vendor_id', type: 'uuid', description: 'FK to vendors' },
        { name: 'assigned_trade', type: 'string', description: 'Trade responsible' },
        { name: 'due_date', type: 'date', description: 'Target completion date' },
        { name: 'photo_before', type: 'string', description: 'Photo URL before fix' },
        { name: 'photo_after', type: 'string', description: 'Photo URL after fix' },
        { name: 'markup_data', type: 'jsonb', description: 'Photo markup annotations' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'When created' },
        { name: 'created_by', type: 'uuid', description: 'User who created' },
        { name: 'completed_at', type: 'timestamp', description: 'When marked complete' },
        { name: 'verified_at', type: 'timestamp', description: 'When client verified' },
        { name: 'notes', type: 'text', description: 'Additional notes' },
      ]}
      aiFeatures={[
        {
          name: 'Voice Capture',
          description: 'Convert voice descriptions to punch items: "Scratch on master bath vanity near the left sink" becomes structured punch item with location auto-detected.',
          trigger: 'On voice input'
        },
        {
          name: 'Trade Assignment',
          description: 'Automatically suggests responsible trade: "Paint scratch on wall" → Assigned to Painter. "Loose outlet cover" → Assigned to Electrician.',
          trigger: 'On item creation'
        },
        {
          name: 'Similar Item Detection',
          description: 'Groups similar items for efficient resolution: "5 similar drywall touch-up items in upstairs bedrooms. Assign all to drywall contractor?"',
          trigger: 'On punch list review'
        },
        {
          name: 'Vendor Performance Tracking',
          description: 'Tracks punch item patterns by vendor: "ABC Drywall has 40% more punch items than average. Most common: Nail pops, corner bead issues."',
          trigger: 'On punch list completion'
        },
        {
          name: 'Completion Prediction',
          description: 'Predicts punch list completion timeline: "32 items remaining. Based on current pace and vendor schedules, estimated completion: 5 business days."',
          trigger: 'Real-time calculation'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Punch List - Smith Residence                [+ Add Item] [Export]   │
├─────────────────────────────────────────────────────────────────────┤
│ Progress: ████████████░░░░░░░░ 62% (31/50 complete)                │
│ Filter: [All ▾] Location: [All ▾] Trade: [All ▾] Status: [All ▾]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 📍 MASTER BATHROOM (8 items - 5 complete)                          │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [📷] Scratch on vanity countertop          ⚠ Major   ● Open    │ │
│ │      Assigned: Stone Solutions | Due: Jan 30                    │ │
│ │      [View Photo] [Reassign] [Mark Complete]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [📷] Grout haze on floor tile              ○ Minor   ✓ Complete │ │
│ │      Completed by: ABC Tile | Jan 28                            │ │
│ │      [Before/After] [Verify]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 📍 KITCHEN (6 items - 4 complete)                                  │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [📷] Cabinet door alignment                ○ Minor   ● In Prog  │ │
│ │      Assigned: Cabinet Pros | Scheduled: Tomorrow               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "19 items remaining. Drywall (8), Paint (6), Trim (3), Other   │
│ (2). Recommend scheduling drywall first—others depend on it."      │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
