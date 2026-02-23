'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PunchListPreview } from '@/components/skeleton/previews/punch-list-preview'
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
      title="Punch List & Quality Control"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/28-punch-list-quality.md"
      description="Photo-documented punch list management with floor plan pin locations, vendor assignment and notification, completion verification workflow, quality checklists by trade/phase, warranty linkage, and cost tracking for back-charges. Supports pre-final inspection, final cleaning, client orientation, O&M manual assembly, and key handover."
      workflow={['Identify Item', 'Document (Photo + Pin)', 'Assign to Trade', 'Vendor Repairs', 'Verification Photo', 'Accept or Reject', 'Close / Convert to Warranty']}
      features={[
        'Punch item list with sequential numbering (PL-NNN)',
        'Room/area and floor level organization',
        'Photo documentation with 4 stages (issue, repair, verification, rejection)',
        'Floor plan pin location for spatial reference',
        'Assign to trade and specific vendor/subcontractor',
        '5 priority levels (critical, high, medium, low, cosmetic)',
        '7 status workflow (open, assigned, in_progress, completed, rejected, verified, closed)',
        'Rejection tracking with count, reason, and re-assignment',
        'Completion verification workflow with before/after comparison',
        'Client walkthrough mode for joint inspection',
        'Bulk item entry from walkthroughs',
        'Quality checklists by trade and phase',
        'Item source tracking (walkthrough, checklist, client portal, daily log)',
        'Cost responsibility assignment (vendor backcharge, builder warranty, shared, none)',
        'Estimated and actual cost tracking per item',
        'Warranty conversion flag for items that become warranty claims',
        'Trade filter, room filter, vendor filter, priority filter',
        'Progress dashboard with completion percentage',
        'Export filtered list per trade for vendor distribution',
        'Print punch list with photos',
      ]}
      connections={[
        { name: 'Photos (M6)', type: 'bidirectional', description: 'Multi-stage photo documentation (issue, repair, verification, rejection)' },
        { name: 'Vendors (M10)', type: 'input', description: 'Assign items to subcontractors with notification' },
        { name: 'Vendor Performance (M22)', type: 'output', description: 'Punch item counts and rejection rates feed vendor scorecards' },
        { name: 'Warranty (M31)', type: 'output', description: 'Convert punch items to warranty claims after closeout' },
        { name: 'Draw Requests (M15)', type: 'output', description: 'Final draw hold until punch list completion' },
        { name: 'Daily Logs (M8)', type: 'input', description: 'Field observations that generate punch items' },
        { name: 'Client Portal (M29)', type: 'bidirectional', description: 'Client-reported items via portal; client walkthrough participation' },
        { name: 'Budget (M9)', type: 'output', description: 'Back-charge costs tracked against vendor budget' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Closeout schedule task dependencies' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'item_number', type: 'string', required: true, description: 'Sequential number (PL-NNN format)' },
        { name: 'location', type: 'string', required: true, description: 'Room or area name' },
        { name: 'floor', type: 'string', description: 'Floor level (1st, 2nd, Exterior, etc.)' },
        { name: 'description', type: 'text', required: true, description: 'Detailed deficiency description' },
        { name: 'trade', type: 'string', required: true, description: 'Responsible trade category' },
        { name: 'vendor_id', type: 'uuid', description: 'Assigned vendor/subcontractor' },
        { name: 'vendor_name', type: 'string', description: 'Vendor display name' },
        { name: 'assigned_to', type: 'uuid', description: 'Specific person assigned' },
        { name: 'priority', type: 'string', required: true, description: 'critical, high, medium, low, cosmetic' },
        { name: 'status', type: 'string', required: true, description: 'open, assigned, in_progress, completed, rejected, verified, closed' },
        { name: 'source', type: 'string', description: 'walkthrough, checklist, client_portal, daily_log' },
        { name: 'due_date', type: 'date', description: 'Completion deadline' },
        { name: 'photos', type: 'jsonb', description: 'Photos with stage (issue, repair, verification, rejection)' },
        { name: 'plan_pin', type: 'boolean', description: 'Has floor plan pin location' },
        { name: 'cost_responsibility', type: 'string', description: 'vendor_backcharge, builder_warranty, shared, none' },
        { name: 'estimated_cost', type: 'decimal', description: 'Estimated repair cost' },
        { name: 'actual_cost', type: 'decimal', description: 'Actual repair cost' },
        { name: 'rejection_count', type: 'integer', description: 'Number of times rejected' },
        { name: 'rejection_reason', type: 'text', description: 'Latest rejection reason' },
        { name: 'checklist_ref', type: 'string', description: 'Source quality checklist reference' },
        { name: 'warranty_item', type: 'boolean', description: 'Converted to warranty claim' },
        { name: 'completed_at', type: 'timestamp', description: 'When marked complete' },
        { name: 'completed_by', type: 'uuid', description: 'Who completed' },
        { name: 'verified_at', type: 'timestamp', description: 'When verified by PM' },
        { name: 'verified_by', type: 'uuid', description: 'Who verified' },
      ]}
      aiFeatures={[
        {
          name: 'Smart Trade Assignment',
          description: 'Auto-assigns items to correct trade and vendor based on description analysis. Routes paint items to painting sub, drywall items to drywall sub, etc.',
          trigger: 'On item creation'
        },
        {
          name: 'Completion Rate Prediction',
          description: 'Monitors completion velocity and predicts total completion date. Alerts if current pace will miss closeout deadline.',
          trigger: 'Daily update'
        },
        {
          name: 'Vendor Pattern Analysis',
          description: 'Identifies vendors with high punch item counts or rejection rates. Flags repeat offenders and suggests process improvements.',
          trigger: 'On list analysis'
        },
        {
          name: 'Photo Verification',
          description: 'Compares issue photo to completion photo to verify deficiency was actually addressed. Flags items where repair photo does not appear to show resolution.',
          trigger: 'On completion photo upload'
        },
        {
          name: 'Back-Charge Calculation',
          description: 'Estimates back-charge amounts based on item type, trade rates, and historical costs. Generates back-charge documentation per vendor.',
          trigger: 'On cost responsibility assignment'
        },
        {
          name: 'Warranty Risk Assessment',
          description: 'Identifies punch items likely to recur as warranty claims based on deficiency type, vendor history, and material/installation patterns.',
          trigger: 'On item verification'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
