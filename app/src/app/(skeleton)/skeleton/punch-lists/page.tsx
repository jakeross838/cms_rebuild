'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { PunchListPreview } from '@/components/skeleton/previews/punch-list-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Identify Item', 'Photo + Pin', 'Assign to Trade', 'Vendor Repair', 'Verify', 'Close / Warranty'
]

export default function PunchListsSkeleton() {
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
      {activeTab === 'preview' ? <PunchListPreview /> : <PageSpec
      title="Punch List & Quality Control"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/28-punch-list-quality.md"
      description="Photo-documented punch list management with floor plan pin locations, vendor assignment and notification, 7-step completion verification workflow, quality checklists by trade/phase, warranty linkage, and cost tracking for back-charges. Supports pre-final inspection, client walkthrough, and closeout documentation."
      workflow={constructionWorkflow}
      features={[
        'Punch item list with sequential numbering (PL-NNN)',
        'Room/area and floor level organization',
        'Photo documentation with 4 stages (issue, repair, verification, rejection)',
        'Floor plan pin location for spatial reference',
        'Assign to trade and specific vendor/subcontractor',
        '5 priority levels (critical, high, medium, low, cosmetic)',
        '7 status workflow (open, assigned, in_progress, completed, rejected, verified, closed)',
        'Rejection tracking with count, reason, and re-assignment',
        'Before/after photo comparison for verification',
        'Client walkthrough mode for joint inspection',
        'Voice-to-text item description capture',
        'Bulk item entry from walkthroughs',
        'Quality checklists by trade and phase',
        'Item source tracking (walkthrough, checklist, client portal, daily log)',
        'Cost responsibility (vendor backcharge, builder warranty, shared, none)',
        'Estimated and actual cost tracking per item',
        'Warranty conversion flag for recurring items',
        'Trade, room, vendor, and priority filter dimensions',
        'Progress dashboard with completion percentage',
        'Export filtered list per trade for vendor distribution',
        'Print punch list with photos',
        'Historical punch data feeds vendor scorecards',
      ]}
      connections={[
        { name: 'Photos (M6)', type: 'bidirectional', description: 'Multi-stage photo documentation (issue, repair, verification, rejection)' },
        { name: 'Vendors (M10)', type: 'bidirectional', description: 'Items assigned to vendors; vendor notification via portal' },
        { name: 'Vendor Performance (M22)', type: 'output', description: 'Punch counts and rejection rates feed vendor scorecards' },
        { name: 'Vendor Portal (M30)', type: 'output', description: 'Vendors see assigned items and update status' },
        { name: 'Client Portal (M29)', type: 'bidirectional', description: 'Client-reported items; client walkthrough participation' },
        { name: 'Warranty (M31)', type: 'output', description: 'Unresolved items convert to warranty claims' },
        { name: 'Draw Requests (M15)', type: 'output', description: 'Final draw hold until punch list completion' },
        { name: 'Daily Logs (M8)', type: 'input', description: 'Field observations generate punch items' },
        { name: 'Budget (M9)', type: 'output', description: 'Back-charge costs tracked against vendor budget' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Closeout schedule task dependencies' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'item_number', type: 'string', required: true, description: 'Sequential (PL-NNN)' },
        { name: 'location', type: 'string', required: true, description: 'Room or area' },
        { name: 'floor', type: 'string', description: 'Floor level' },
        { name: 'description', type: 'text', required: true, description: 'Deficiency description' },
        { name: 'trade', type: 'string', required: true, description: 'Responsible trade' },
        { name: 'vendor_id', type: 'uuid', description: 'Assigned vendor' },
        { name: 'vendor_name', type: 'string', description: 'Vendor display name' },
        { name: 'priority', type: 'string', required: true, description: 'critical, high, medium, low, cosmetic' },
        { name: 'status', type: 'string', required: true, description: 'open, assigned, in_progress, completed, rejected, verified, closed' },
        { name: 'source', type: 'string', description: 'walkthrough, checklist, client_portal, daily_log' },
        { name: 'due_date', type: 'date', description: 'Completion deadline' },
        { name: 'photos', type: 'jsonb', description: 'Photos with stage tracking' },
        { name: 'plan_pin', type: 'boolean', description: 'Has floor plan pin' },
        { name: 'cost_responsibility', type: 'string', description: 'vendor_backcharge, builder_warranty, shared, none' },
        { name: 'estimated_cost', type: 'decimal', description: 'Estimated repair cost' },
        { name: 'actual_cost', type: 'decimal', description: 'Actual repair cost' },
        { name: 'rejection_count', type: 'integer', description: 'Times rejected' },
        { name: 'rejection_reason', type: 'text', description: 'Latest rejection reason' },
        { name: 'checklist_ref', type: 'string', description: 'Source quality checklist' },
        { name: 'warranty_item', type: 'boolean', description: 'Converted to warranty' },
        { name: 'completed_at', type: 'timestamp', description: 'When completed' },
        { name: 'verified_at', type: 'timestamp', description: 'When verified' },
      ]}
      aiFeatures={[
        {
          name: 'Smart Trade Assignment',
          description: 'Auto-assigns items to correct trade and vendor based on description analysis.',
          trigger: 'On item creation'
        },
        {
          name: 'Completion Rate Prediction',
          description: 'Monitors velocity and predicts total completion date. Alerts if pace will miss closeout deadline.',
          trigger: 'Daily update'
        },
        {
          name: 'Vendor Pattern Analysis',
          description: 'Identifies vendors with high punch counts or rejection rates. Flags repeat offenders.',
          trigger: 'On list analysis'
        },
        {
          name: 'Photo Verification',
          description: 'Compares issue photo to completion photo to verify deficiency was addressed.',
          trigger: 'On completion photo upload'
        },
        {
          name: 'Back-Charge Calculation',
          description: 'Estimates back-charge amounts by item type and trade rates. Generates vendor documentation.',
          trigger: 'On cost responsibility assignment'
        },
        {
          name: 'Warranty Risk Assessment',
          description: 'Identifies items likely to recur as warranty claims based on deficiency type and vendor history.',
          trigger: 'On item verification'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
