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
        'Inspection type library per jurisdiction with configurable sequences',
        'Prerequisite enforcement (cannot schedule framing before foundation passes)',
        'Inspection request workflow: ready to schedule, requested, confirmed, completed',
        'Result recording: Pass, Fail, Conditional/Partial, Cancelled, No-Show',
        'Failure documentation: deficiency list with photos, required corrections, re-inspection scope',
        'Correction assignment: auto-create tasks for responsible trade on failure',
        'Re-inspection scheduling linked to original failure',
        'Pre-inspection checklists per inspection type (interactive, mobile-friendly)',
        'Inspector contact management per jurisdiction',
        'Calendar integration: inspection dates on project schedule and builder-wide calendar',
        'Batch inspection requests across multiple projects',
        'Photo documentation attached to results and deficiencies',
        'Historical pass/fail rates by trade and inspector (analytics)',
        'Schedule impact propagation: failed inspection delays downstream tasks',
        'Repeated failure escalation: risk flag on project dashboard after configurable threshold',
        'Daily log auto-population with inspection results',
        'Final building inspection coordination with preparation checklist',
        'Notification to PM, superintendent, and affected vendors on results',
      ]}
      connections={[
        { name: 'Permits (M32)', type: 'input', description: 'Required inspections generated from permit types per jurisdiction' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Inspection passes unlock downstream tasks; failures propagate delays' },
        { name: 'Daily Logs (M8)', type: 'output', description: 'Inspection results auto-populate in daily log for inspection date' },
        { name: 'Document Storage (M6)', type: 'bidirectional', description: 'Inspection photos, deficiency documentation' },
        { name: 'Vendor Management (M10)', type: 'output', description: 'Correction tasks assigned to responsible trade on failure' },
        { name: 'Notification Engine (M5)', type: 'output', description: 'Result notifications, scheduling reminders, escalation alerts' },
        { name: 'Punch List (M28)', type: 'output', description: 'Failed inspection items can generate punch list entries' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (tenant)' },
        { name: 'project_id', type: 'uuid', required: true, description: 'FK to projects' },
        { name: 'permit_id', type: 'uuid', description: 'FK to related permit' },
        { name: 'inspection_type_id', type: 'uuid', description: 'FK to inspection type in jurisdiction' },
        { name: 'sequence_order', type: 'integer', description: 'Order in inspection sequence' },
        { name: 'prerequisite_inspection_id', type: 'uuid', description: 'Must pass before this can be scheduled' },
        { name: 'scheduled_date', type: 'date', description: 'Confirmed inspection date' },
        { name: 'scheduled_time', type: 'string', description: 'Time window or specific time' },
        { name: 'inspector_name', type: 'string', description: 'Inspector name' },
        { name: 'inspector_phone', type: 'string', description: 'Inspector phone number' },
        { name: 'status', type: 'string', required: true, description: 'ready_to_schedule, scheduled, passed, failed, conditional, cancelled, rescheduled' },
        { name: 'result', type: 'string', description: 'pass, fail, conditional_pass, no_show' },
        { name: 'result_notes', type: 'text', description: 'Inspector comments and findings' },
        { name: 'completed_at', type: 'timestamp', description: 'When inspection was completed' },
        { name: 'photos', type: 'jsonb', description: 'Inspection documentation photos' },
        { name: 'deficiencies', type: 'jsonb', description: 'Deficiency list with descriptions, photos, vendor assignment' },
        { name: 'reinspection_of', type: 'uuid', description: 'FK to original failed inspection if re-inspection' },
        { name: 'pre_inspection_checklist', type: 'jsonb', description: 'Interactive pre-inspection readiness checklist' },
        { name: 'schedule_impact', type: 'text', description: 'Description of schedule impact if failed' },
      ]}
      aiFeatures={[
        {
          name: 'Pre-Inspection Readiness Check',
          description: 'Day before inspection: verifies all prerequisite work is complete, checklist items are checked, and common fail points are addressed.',
          trigger: 'Day before scheduled inspection'
        },
        {
          name: 'Scheduling Optimization',
          description: 'Recommends optimal inspection timing based on work completion, inspector availability, and historical approval patterns per inspector.',
          trigger: 'On work completion milestone'
        },
        {
          name: 'Failure Resolution & Correction Routing',
          description: 'On failure: auto-creates correction tasks for responsible vendor, calculates schedule impact, and schedules re-inspection.',
          trigger: 'On inspection failure'
        },
        {
          name: 'Inspector Pattern Analysis',
          description: 'Tracks pass/fail patterns by inspector and trade. Warns when a specific inspector commonly flags certain issues.',
          trigger: 'On inspection scheduling'
        },
        {
          name: 'Schedule Impact Propagation',
          description: 'When inspection fails, recalculates critical path, propagates delays to all downstream tasks, and notifies affected parties.',
          trigger: 'On inspection failure'
        },
        {
          name: 'Vendor Quality Monitoring',
          description: 'Tracks first-pass inspection rates per vendor. Flags vendors with below-average rates and recommends extra QC.',
          trigger: 'Periodic analysis'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
