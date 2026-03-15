'use client'
import dynamic from 'next/dynamic'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { cn } from '@/lib/utils'
const SafetyPreview = dynamic(() => import('@/components/skeleton/previews/safety-preview').then(mod => mod.SafetyPreview), { ssr: false })

export default function SafetyPage() {
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
      {activeTab === 'preview' ? <SafetyPreview /> : <PageSpec
      title="Safety & Compliance"
      phase="Phase 5 - Full Platform (Module 33)"
      planFile="docs/modules/33-safety-compliance.md"
      description="Comprehensive job site safety management covering safety observations (positive and hazard), incident/accident reporting with multi-step investigation, OSHA compliance tracking (300 log, 300A summary, 301 forms), toolbox talks with sign-in sheets, safety inspections with configurable checklists, vendor safety scoring, and project safety scores. Integrates with vendor scorecards, HR certifications, daily logs, and scheduling."
      workflow={['Observe/Report', 'Classify & Document', 'Investigate', 'Root Cause Analysis', 'Corrective Action', 'Close & Score']}
      features={[
        'Safety observations: positive and hazard with photo documentation',
        'Observation categories: fall protection, electrical, excavation, scaffolding, PPE, housekeeping, fire, confined space',
        'Severity levels: informational, minor hazard, serious hazard, imminent danger',
        'Anonymous observation submission option',
        'Incident reporting: injury, near-miss, property damage',
        'Multi-step investigation: reported -> investigating -> root cause -> corrective action -> closed',
        'OSHA classification: first aid, recordable, lost time, fatality',
        'OSHA 300 log auto-population and 300A annual summary generation',
        'OSHA reporting deadline countdown (8hr fatality, 24hr amputation)',
        'Witness statement collection with digital signatures',
        'Drug/alcohol testing tracking',
        'Return-to-work tracking for lost-time injuries',
        'Toolbox talk scheduling with sign-in sheets and attendance tracking',
        'Safety inspection checklists (configurable per job/type)',
        'Project safety scores: observation, incident, training, certification, composite',
        'TRIR, DART, and EMR calculation from platform data',
        'Vendor safety compliance: EMR tracking, incident history, cert status',
        'Auto-block: prevent uncertified workers from certified-required tasks',
        'Observation trend analysis (category frequency, project, trade)',
        'Corrective action tracking with follow-up verification',
        'Major incident lockdown mode for legal defensibility',
        'Configurable safety program templates (simple vs full mode)',
        'OSHA inspection preparation checklists',
        'Hot work permits and confined space entry permits',
      ]}
      connections={[
        { name: 'Daily Logs (M08)', type: 'bidirectional', description: 'Safety observations linked to daily log entries' },
        { name: 'Vendor Management (M10)', type: 'bidirectional', description: 'Vendor safety records affect vendor scorecard' },
        { name: 'Vendor Performance (M22)', type: 'output', description: 'Safety violations create negative marks on scorecard' },
        { name: 'HR & Workforce (M34)', type: 'bidirectional', description: 'Shared certification tracking, safety training records' },
        { name: 'Document Storage (M06)', type: 'output', description: 'Incident photos, certification docs, training materials' },
        { name: 'Notification Engine (M05)', type: 'output', description: 'Certification expiration alerts, OSHA deadline reminders' },
        { name: 'Scheduling (M07)', type: 'input', description: 'High-risk tasks trigger safety checklist requirements' },
        { name: 'Core Data Model (M03)', type: 'input', description: 'Project and crew context' },
        { name: 'Bid Management (M26)', type: 'output', description: 'Vendor safety record visible during bid evaluation' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant ID (company_id)' },
        { name: 'project_id', type: 'uuid', description: 'Related project' },
        { name: 'observation_type', type: 'string', description: 'positive | hazard' },
        { name: 'category', type: 'string', description: 'fall_protection, electrical, excavation, scaffolding, ppe, housekeeping, etc.' },
        { name: 'severity', type: 'string', description: 'informational, minor_hazard, serious_hazard, imminent_danger' },
        { name: 'description', type: 'text', description: 'Detailed description' },
        { name: 'corrective_action', type: 'text', description: 'Immediate action taken' },
        { name: 'photo_urls', type: 'jsonb', description: 'Observation/incident photos' },
        { name: 'vendor_id', type: 'uuid', description: 'Linked vendor (for scorecard)' },
        { name: 'employee_id', type: 'uuid', description: 'Involved employee' },
        { name: 'is_anonymous', type: 'boolean', description: 'Anonymous submission flag' },
        { name: 'incident_type', type: 'string', description: 'injury | near_miss | property_damage' },
        { name: 'osha_classification', type: 'string', description: 'first_aid | recordable | lost_time | fatality' },
        { name: 'investigation_status', type: 'string', description: 'pending | in_progress | complete' },
        { name: 'root_cause', type: 'text', description: 'Root cause analysis result' },
        { name: 'is_osha_reportable', type: 'boolean', description: 'OSHA reportable flag' },
        { name: 'witness_count', type: 'integer', description: 'Number of witness statements' },
        { name: 'days_away', type: 'integer', description: 'Lost time days (DART)' },
        { name: 'days_restricted', type: 'integer', description: 'Restricted duty days (DART)' },
        { name: 'drug_test_required', type: 'boolean', description: 'Drug testing flag' },
        { name: 'return_to_work_date', type: 'date', description: 'Return date for lost-time' },
        { name: 'status', type: 'string', description: 'reported, investigating, root_cause, corrective_action, closed' },
        { name: 'created_by', type: 'uuid', description: 'Reporter user ID' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'Record creation timestamp' },
      ]}
      aiFeatures={[
        {
          name: 'Hazard Pattern Detection',
          description: 'Identifies emerging hazard patterns from observation trends. "Fall protection observations up 40% this month on Smith Residence. Pre-task safety plan recommended before roofing phase."',
          trigger: 'On observation entry + weekly trend analysis'
        },
        {
          name: 'Training Gap Analysis',
          description: 'Cross-references crew assignments with certification requirements. "3 crew members on Smith job missing fall protection training. Auto-blocked from roofing tasks."',
          trigger: 'On job staffing + certification expiration'
        },
        {
          name: 'Vendor Safety Scoring',
          description: 'Aggregates vendor incident data, EMR, and certification status into safety score. "ABC Framing involved in 2 of last 3 incidents. EMR above threshold. Flag for vendor safety review."',
          trigger: 'On incident close + vendor assignment'
        },
        {
          name: 'Proactive Risk Assessment',
          description: 'Analyzes project characteristics and schedule to predict high-risk periods. "Heavy equipment phase starting next week - ensure confined space and equipment operator certifications current."',
          trigger: 'Schedule milestone + weather data'
        },
        {
          name: 'OSHA Compliance Monitor',
          description: 'Tracks OSHA deadlines and auto-populates 300 log. "Incident SC-005 is OSHA recordable. 300 log updated. 300A summary reflects new case."',
          trigger: 'On incident classification'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Safety & Compliance      [Submit Observation] [Inspection] [Report]│
├─────────────────────────────────────────────────────────────────────┤
│ Dashboard | Observations | Incidents | Training | Scores | Vendors │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │ 127  │ │ 1.8  │ │ 0.9  │ │  5   │ │ 0.82 │ │ 94%  │           │
│ │ Days │ │ TRIR │ │ DART │ │ Near │ │ EMR  │ │ Train│           │
│ │w/o   │ │12-mo │ │ Rate │ │Miss  │ │      │ │Comp  │           │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                                     │
│ Connected: Daily Logs | Vendor Scorecards | HR | Docs | Schedule   │
│                                                                     │
│ TOOLBOX TALKS            │ INSPECTIONS                              │
│ ┌───────────────────────┐│ ┌──────────────────────────────────────┐│
│ │ Fall Protection  Tmrw ││ │ Site Safety - Johnson Beach  Wed     ││
│ │ Electrical       2/14 ││ │ Fall Protection Audit - Smith Thu    ││
│ │ Heat Prevention  2/17 ││ │ OSHA Readiness - Smith  ⚠ 3 issues  ││
│ │ Scaffold (Done)  2/10 ││ │ Confined Space - Harbor  ✓ Done     ││
│ └───────────────────────┘│ └──────────────────────────────────────┘│
│                                                                     │
│ OBSERVATIONS              │ INCIDENTS (Review Required)             │
│ ┌───────────────────────┐ │ ┌────────────────────────────────────┐ │
│ │ 🔴 Hazard: Guardrail  │ │ │ Near Miss: Unsecured ladder       │ │
│ │ 🟢 Positive: PPE      │ │ │   Status: Corrective Action       │ │
│ │ 🔴 Hazard: Exit block │ │ │   Root Cause: No SOP              │ │
│ │ 🔴 Imminent: Wiring   │ │ │   Vendor: ABC Framing             │ │
│ └───────────────────────┘ │ └────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 💡 AI: "Near-misses up 40% - afternoon timeframe. ABC Framing in  │
│ 2 of 3 incidents. Fall protection trending up at Smith Residence." │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
