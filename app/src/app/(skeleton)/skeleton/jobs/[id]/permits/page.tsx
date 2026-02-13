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
        'Multi-jurisdiction permit tracking with configurable jurisdiction profiles',
        'Per-jurisdiction permit types, fee schedules, required documents, and timelines',
        'Permit application workflow: draft, submitted, under review, approved, issued, expired, on hold',
        'Permit fee tracking with estimated vs actual and per-project cost allocation',
        'Permit document storage: application forms, approved plans, stamped drawings, conditions',
        'Permit expiration tracking with configurable renewal alerts',
        'Permit hold/suspension tracking with reason codes and resolution workflow',
        'Multi-permit per project (building, electrical, plumbing, mechanical, grading, ROW, fire)',
        'Inspector contact management per jurisdiction',
        'Required inspections linked checklist per permit',
        'Schedule dependency integration: permit milestones block downstream tasks',
        'Building code edition tracking per project (IRC 2021, NEC 2023, etc.)',
        'Certificate of Occupancy prerequisites checklist and progress tracking',
        'Temporary CO management with expiration and conditions',
        'Utility final connection tracking (electric, water, sewer, gas, cable, irrigation)',
        'Homeowner utility account transfer checklist',
        'Online permit integration for supported jurisdictions',
        'Requirement change tracking with cost/schedule impact propagation',
        'Community-contributed jurisdiction templates',
      ]}
      connections={[
        { name: 'Documents (M6)', type: 'bidirectional', description: 'Permit documents, stamped plans, conditions of approval' },
        { name: 'Inspections (M32)', type: 'output', description: 'Required inspections generated from permit types' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Permit milestones as hard dependencies for construction tasks' },
        { name: 'Budget (M9)', type: 'output', description: 'Permit fee tracking (estimated vs actual)' },
        { name: 'Daily Logs (M8)', type: 'output', description: 'Inspection results auto-populate daily log entries' },
        { name: 'Notification Engine (M5)', type: 'output', description: 'Expiration alerts, inspection reminders, result notifications' },
        { name: 'Vendor Management (M10)', type: 'output', description: 'Correction assignment to responsible trade on failure' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (tenant)' },
        { name: 'project_id', type: 'uuid', required: true, description: 'FK to projects' },
        { name: 'jurisdiction_id', type: 'uuid', required: true, description: 'FK to jurisdiction profile' },
        { name: 'permit_type_id', type: 'uuid', description: 'FK to permit type in jurisdiction' },
        { name: 'permit_number', type: 'string', description: 'Issued permit number' },
        { name: 'status', type: 'string', required: true, description: 'not_applied, draft, submitted, under_review, approved, issued, expired, on_hold' },
        { name: 'applied_date', type: 'date', description: 'Application submission date' },
        { name: 'issued_date', type: 'date', description: 'When permit was issued' },
        { name: 'expiration_date', type: 'date', description: 'Permit expiration date' },
        { name: 'fee_estimated', type: 'decimal', description: 'Estimated permit fee' },
        { name: 'fee_actual', type: 'decimal', description: 'Actual permit fee paid' },
        { name: 'conditions', type: 'jsonb', description: 'Conditions of approval' },
        { name: 'code_edition', type: 'string', description: 'Applicable building code edition' },
        { name: 'required_documents', type: 'jsonb', description: 'Required documents and upload status' },
        { name: 'schedule_dependencies', type: 'jsonb', description: 'Tasks blocked by this permit' },
        { name: 'inspector', type: 'string', description: 'Assigned inspector name' },
        { name: 'inspector_phone', type: 'string', description: 'Inspector contact phone' },
        { name: 'notes', type: 'text', description: 'Notes and conditions' },
      ]}
      aiFeatures={[
        {
          name: 'Permit Requirement Detection',
          description: 'Analyzes project scope and jurisdiction to identify all required permits. Flags missing permits based on project type and location.',
          trigger: 'On job creation / scope change'
        },
        {
          name: 'Timeline Intelligence',
          description: 'Uses historical approval times per jurisdiction to predict approval dates and warn when permits risk blocking scheduled work.',
          trigger: 'On schedule planning'
        },
        {
          name: 'Expiration & Renewal Monitoring',
          description: 'Tracks all permit expirations, sends configurable alerts (60/30/7 days), and blocks dependent work when permits expire.',
          trigger: 'Periodic check'
        },
        {
          name: 'Document Extraction',
          description: 'AI extracts permit details from uploaded PDF permits: permit number, dates, fees, conditions, required inspections.',
          trigger: 'On document upload'
        },
        {
          name: 'Schedule Impact Analysis',
          description: 'When permit is delayed or denied, propagates impact to downstream schedule tasks and recalculates completion date.',
          trigger: 'On permit status change'
        },
        {
          name: 'CO Readiness Assessment',
          description: 'Continuously evaluates CO prerequisites: all inspections passed, permits current, utilities connected. Flags blockers.',
          trigger: 'Periodic check'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
