'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { DailyLogsPreview } from '@/components/skeleton/previews/daily-logs-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Job', 'Schedule', 'Daily Logs', 'Photos', 'Client Portal', 'Reports'
]

export default function DailyLogsSkeleton() {
  
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <DailyLogsPreview />
      ) : (
        <PageSpec
      title="Daily Logs"
      phase="Phase 2 - Construction Core"
      planFile="docs/modules/08-daily-logs.md"
      description="Field reports with voice-to-text entry and AI-powered extraction. Speak into your phone, and the system transcribes, extracts structured work items, updates schedule task progress, assigns follow-up tasks to vendors, and logs weather automatically. Logs are legally defensible with immutable post-submission records, amendment tracking, and configurable review workflows."
      workflow={constructionWorkflow}
      features={[
        'One-tap daily log start with auto-populated date, weather, project, and expected vendors',
        'Voice-to-text dictation for hands-free field entry (construction terminology optimized)',
        'Quick log form optimized for mobile field use with large tap targets',
        'Weather auto-fill from job location API (temp high/low, conditions, precipitation, wind, humidity)',
        'Manpower tracking by vendor with headcount, hours, trade, and check-in method (manual/QR/geofence)',
        'AI-extracted structured work items with trade, phase, location, and schedule progress %',
        'Deliveries received with PO matching, photo documentation, and discrepancy flagging',
        'Issues/delays with categorization (weather, material, rework, safety, design, inspection), severity, schedule impact',
        'Issue workflow triggers: delay creates schedule note, defect creates punch item, safety creates incident, RFI needed creates draft RFI',
        'Visitor log for inspectors, clients, and architects with time in/out',
        'Photo attachment per log section (work, delivery, safety, issue) with minimum photo requirement enforcement',
        'Photo annotation: draw circles, arrows, and text on photos to highlight issues',
        'Configurable required fields per builder (date, weather, work performed minimum)',
        'Custom fields defined by builder (checkbox, text, number, dropdown, date)',
        'Phase-specific templates: Foundation, Framing, MEP Rough, Finishes',
        'Multi-user logging mode: multiple field staff contribute, PM consolidates',
        'Submission reminders at configurable time (4 PM, 5:30 PM, etc.)',
        'Review workflow: none, single review (PM submits, director reviews), or multi-review',
        'Immutable after submission with amendment support (original preserved, reason required)',
        'Late submission badge showing actual creation date vs log date',
        'Missing log detection: gaps shown with "Create Missing Log" quick action',
        'Export to PDF with all photos, amendments, and digital signatures',
        'Calendar view of all logs with weather/status indicators',
        'Quick actions: photo capture, issue report, delivery verification, inspection result, safety observation, client visit log, change directive capture',
        'End-of-day PM review dashboard with bulk approval',
        'Offline mode with sync when connectivity returns',
        'Configurable retention (default 10 years for statute of limitations)',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Log scoped to job with auto-populated project info' },
        { name: 'Schedule', type: 'bidirectional', description: 'Scheduled tasks auto-listed; work logged auto-updates task progress %' },
        { name: 'Photos', type: 'bidirectional', description: 'Photos attached per section and fed to project gallery' },
        { name: 'Cost Codes', type: 'input', description: 'Work items tagged to cost codes by AI' },
        { name: 'Vendors', type: 'bidirectional', description: 'Manpower tracked by vendor; check-in/out records' },
        { name: 'Purchase Orders', type: 'bidirectional', description: 'Delivery verification matched to POs with discrepancy detection' },
        { name: 'Weather API', type: 'input', description: 'Auto-fill weather conditions for job location' },
        { name: 'Client Portal', type: 'output', description: 'AI-generated client-friendly summary (no internal notes/pricing)' },
        { name: 'Punch List', type: 'output', description: 'Defect issues auto-create punch items' },
        { name: 'RFIs', type: 'output', description: 'RFI-needed issues auto-create draft RFIs' },
        { name: 'Safety & Compliance', type: 'output', description: 'Safety issues route to safety manager' },
        { name: 'Change Orders', type: 'output', description: 'Field change directives captured and linked to formal CO workflow' },
        { name: 'Schedule Intelligence', type: 'output', description: 'Actual durations, vendor productivity learned from logs' },
        { name: 'Vendor Intelligence', type: 'output', description: 'Vendor presence, punctuality, and productivity tracked' },
        { name: 'Notification Engine', type: 'output', description: 'Submission reminders, review requests, escalation alerts' },
        { name: 'Reports', type: 'output', description: 'Weekly client reports auto-generated from approved logs' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_id', type: 'uuid', required: true, description: 'FK to companies (multi-tenant)' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'log_date', type: 'date', required: true, description: 'Log date (adjustable for backdating)' },
        { name: 'template_id', type: 'uuid', description: 'FK to daily_log_templates (phase-based)' },
        { name: 'status', type: 'enum', required: true, description: 'draft | submitted | in_review | approved | returned' },
        { name: 'is_immutable', type: 'boolean', description: 'True after submission (enforced by DB trigger)' },
        { name: 'weather_source', type: 'enum', description: 'api | manual' },
        { name: 'weather_temp_high_f', type: 'decimal', description: 'High temperature (Fahrenheit)' },
        { name: 'weather_temp_low_f', type: 'decimal', description: 'Low temperature (Fahrenheit)' },
        { name: 'weather_conditions', type: 'string', description: 'sunny, cloudy, rain, snow, etc.' },
        { name: 'weather_precipitation_in', type: 'decimal', description: 'Precipitation in inches' },
        { name: 'weather_wind_mph', type: 'decimal', description: 'Wind speed in mph' },
        { name: 'work_performed', type: 'text', description: 'Main narrative of work done' },
        { name: 'work_performed_structured', type: 'jsonb', description: 'AI-extracted: [{description, trade, phase, cost_code_id, schedule_task_id, percent_complete, location}]' },
        { name: 'manpower', type: 'jsonb', description: 'Labor: [{vendor_id, vendor_name, headcount, hours, trade, checked_in_via}]' },
        { name: 'deliveries', type: 'jsonb', description: 'Deliveries: [{description, vendor_id, po_id, received_by}]' },
        { name: 'issues', type: 'jsonb', description: 'Issues: [{description, category, severity, schedule_impact_days, triggered_entity_type, triggered_entity_id}]' },
        { name: 'visitors', type: 'jsonb', description: 'Visitors: [{name, company, purpose, time_in, time_out}]' },
        { name: 'custom_fields', type: 'jsonb', description: 'Builder-configured custom field values' },
        { name: 'submitted_by', type: 'uuid', description: 'User who submitted' },
        { name: 'submitted_at', type: 'timestamp', description: 'Submission timestamp' },
        { name: 'reviewed_by', type: 'uuid', description: 'Reviewer user ID' },
        { name: 'reviewed_at', type: 'timestamp', description: 'Review timestamp' },
        { name: 'review_notes', type: 'text', description: 'Reviewer comments' },
        { name: 'voice_transcript', type: 'text', description: 'Original voice transcription' },
        { name: 'ai_summary', type: 'text', description: 'AI-generated concise summary' },
        { name: 'ai_client_summary', type: 'text', description: 'Client-friendly version (no pricing/internal issues)' },
        { name: 'schedule_updates', type: 'jsonb', description: 'Auto-suggested schedule updates: [{task_id, previous_%, new_%}]' },
        { name: 'created_by', type: 'uuid', required: true, description: 'User who created log' },
        { name: 'created_at', type: 'timestamp', required: true, description: 'Creation timestamp' },
      ]}
      aiFeatures={[
        {
          name: 'Voice-to-Text Transcription',
          description: 'Speak daily log into phone: "Framing looks good, completed first floor walls today. ABC Framing had 4 guys on site. Windows delivered but two were damaged, need replacements." AI transcribes with construction terminology optimization and structures into work items, manpower, deliveries, and issues.',
          trigger: 'On voice recording'
        },
        {
          name: 'Structured Data Extraction',
          description: 'From narrative text or voice transcript, extracts: work performed by trade/phase/location, manpower counts by vendor, deliveries with PO matching, issues categorized by type and severity, and weather impact assessment. All structured for analytics and downstream systems.',
          trigger: 'On log save'
        },
        {
          name: 'Schedule Auto-Update',
          description: 'Suggests schedule progress updates from log content: "Log mentions completed first floor walls -- mark Wall Framing as 100%? Started roof trusses -- mark Roof Framing as 25%?" User confirms each update. Feeds into schedule intelligence for future duration predictions.',
          trigger: 'On log save'
        },
        {
          name: 'Issue Workflow Triggers',
          description: 'Issues auto-create downstream records: delay issues create schedule impact notes, defect issues create punch list items, safety issues create safety incidents and notify safety manager, RFI-needed issues create draft RFIs. All linked back to the daily log.',
          trigger: 'On issue categorization'
        },
        {
          name: 'Vendor Task Assignment',
          description: 'When issues mention vendors, auto-creates follow-up: "Log mentions ABC Framing needs to fix header -- create task for ABC Framing? Send notification to vendor?" Tracks vendor responsiveness.',
          trigger: 'On issue detection'
        },
        {
          name: 'Issue Categorization & Learning',
          description: 'Auto-categorizes issues (weather_delay, material_delay, rework, safety, design_conflict, inspection_fail) and learns patterns. "This vendor has had material issues on 3 of last 5 jobs." Feeds vendor scorecards and risk assessment.',
          trigger: 'On issue entry'
        },
        {
          name: 'Weather Delay Documentation',
          description: 'Auto-documents weather delays for excusable delay claims: "Rain delay logged Feb 10. Total weather delays this project: 2.5 days. Contract allows 10 excusable weather days." Creates legally defensible weather delay record.',
          trigger: 'When weather impacts work'
        },
        {
          name: 'Client Report Generation',
          description: 'Generates client-friendly summary excluding internal notes, pricing, and safety issues: "Great progress today -- roof sheathing nearly complete and impact windows delivered to site." Compiles weekly narrative from approved logs.',
          trigger: 'On log save + weekly compilation'
        },
        {
          name: 'Manpower & Productivity Intelligence',
          description: 'Tracks vendor productivity over time: "ABC Framing averaging 8.5 hrs/person -- above 7.2 benchmark." Detects anomalies: "Crew dropped from 6 to 2 -- potential issue?" Feeds schedule duration predictions.',
          trigger: 'Continuous learning from logs'
        },
        {
          name: 'Delivery Verification',
          description: 'Matches deliveries to purchase orders by vendor and items. Flags discrepancies: wrong items, short quantities, damaged materials. Accepted deliveries auto-update PO received quantities.',
          trigger: 'On delivery entry'
        },
        {
          name: 'Photo Auto-Tagging',
          description: 'Auto-tags log photos by trade, phase, location, and section based on log context and image analysis. Detects milestones and client-suitable shots. Tags feed into project photo gallery.',
          trigger: 'On photo upload'
        },
        {
          name: 'Anomaly Detection',
          description: 'Flags unusual patterns: missing daily logs for active jobs, manpower drops, repeated vendor issues, below-minimum photo counts, late submissions. Alerts PM and builder admin.',
          trigger: 'Daily monitoring'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Daily Logs - Smith Residence       [+ New Log] [🎤 Voice] [Calendar] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ December 2024                                                       │
│ ────────────────────────────────────────────────────────────────── │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ December 18, 2024 (Today)           ☀️ 72°F Clear   [AI Summary] │ │
│ │ ────────────────────────────────────────────────────────────── │ │
│ │ 🎤 Voice Input: "Framing looks good, completed first floor..."  │ │
│ │                                                                 │ │
│ │ WORK PERFORMED                            [AI extracted ✓]      │ │
│ │ ✓ Completed first floor wall framing                           │ │
│ │ ○ Started roof truss installation                              │ │
│ │   → AI: "Update schedule? Mark walls 100%, roof started?"      │ │
│ │                                                                 │ │
│ │ MANPOWER                                  [AI extracted ✓]      │ │
│ │ • ABC Framing: 4 workers, 8 hrs each                          │ │
│ │ • General Labor: 1 worker, 8 hrs                              │ │
│ │                                                                 │ │
│ │ DELIVERIES                                                      │ │
│ │ • Impact Windows - 12 units received                          │ │
│ │   ⚠ 2 units damaged in shipping → Issue created               │ │
│ │   → AI: "Notify window vendor? Create replacement order?"      │ │
│ │                                                                 │ │
│ │ ISSUES: Damaged windows (Material)                             │ │
│ │   → Task created: "Follow up on window replacements"           │ │
│ │                                                                 │ │
│ │ [6 Photos] [Auto-tagged: Framing, Delivery]   [Edit] [Delete]   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ December 17, 2024                    🌧️ 65°F Rain - No work      │ │
│ │ Weather delay logged (Day 3 of 10 allowed)                      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
