'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Job', 'Schedule', 'Daily Logs', 'Photos', 'Client Portal', 'Reports'
]

export default function DailyLogsSkeleton() {
  return (
    <PageSpec
      title="Daily Logs"
      phase="Phase 0 - Foundation"
      planFile="views/field/SCHEDULE_LOGS_PHOTOS.md"
      description="Field reports with voice-to-text entry and AI-powered extraction. Speak into your phone, and the system transcribes, extracts schedule updates, assigns tasks to vendors, and logs weather—all automatically. Every log entry feeds schedule intelligence."
      workflow={constructionWorkflow}
      features={[
        'Voice-to-text log entry—speak and AI transcribes',
        'Quick log form optimized for mobile field use',
        'Weather auto-fill from job location (temperature, conditions, precipitation)',
        'Manpower tracking by trade (vendor, headcount, hours)',
        'Work performed notes with auto-tagging to cost codes and schedule tasks',
        'Deliveries received with photo documentation',
        'Issues/delays documentation with categorization',
        'Photo attachment per log entry (auto-geotagged, timestamped)',
        'Calendar view of all logs with visual indicators',
        'Export to PDF for client reports',
        'Template for recurring log items',
        'Offline mode with sync when connectivity returns',
        'Visitor log for inspectors, clients, architects',
      ]}
      connections={[
        { name: 'Jobs', type: 'input', description: 'Log scoped to job' },
        { name: 'Schedule', type: 'bidirectional', description: 'Log entries auto-update schedule task status' },
        { name: 'Photos', type: 'bidirectional', description: 'Photos attached to log entries' },
        { name: 'Cost Codes', type: 'input', description: 'Work tagged by cost code' },
        { name: 'Vendors', type: 'input', description: 'Manpower tracked by vendor' },
        { name: 'Weather API', type: 'input', description: 'Auto-fill weather conditions' },
        { name: 'Client Portal', type: 'output', description: 'Logs visible to client (configurable)' },
        { name: 'Reports', type: 'output', description: 'Logs feed project reports' },
        { name: 'Schedule Intelligence', type: 'output', description: 'Actual durations learned from logs' },
        { name: 'Vendor Intelligence', type: 'output', description: 'Vendor presence and performance tracked' },
        { name: 'Todos', type: 'output', description: 'Issues can create follow-up tasks' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'date', type: 'date', required: true, description: 'Log date' },
        { name: 'weather', type: 'string', description: 'Weather conditions (auto-filled)' },
        { name: 'temperature_high', type: 'integer', description: 'High temp' },
        { name: 'temperature_low', type: 'integer', description: 'Low temp' },
        { name: 'precipitation', type: 'decimal', description: 'Inches of rain' },
        { name: 'work_performed', type: 'text', description: 'Description of work done' },
        { name: 'work_performed_structured', type: 'jsonb', description: 'AI-extracted structured work items' },
        { name: 'manpower', type: 'jsonb', description: 'Workers by vendor [{vendor_id, trade, count, hours}]' },
        { name: 'deliveries', type: 'text', description: 'Materials received' },
        { name: 'deliveries_structured', type: 'jsonb', description: 'AI-extracted delivery items' },
        { name: 'issues', type: 'text', description: 'Problems/delays encountered' },
        { name: 'issue_category', type: 'string', description: 'Weather, Vendor, Material, Client, Other' },
        { name: 'visitors', type: 'jsonb', description: 'Visitors [{name, company, purpose}]' },
        { name: 'created_by', type: 'uuid', required: true, description: 'User who created log' },
        { name: 'photos', type: 'uuid[]', description: 'Attached photo IDs' },
        { name: 'voice_transcript', type: 'text', description: 'Original voice transcript' },
        { name: 'ai_summary', type: 'text', description: 'AI-generated summary' },
      ]}
      aiFeatures={[
        {
          name: 'Voice-to-Text Transcription',
          description: 'Speak daily log into phone: "Framing looks good, completed first floor walls today. ABC Framing had 4 guys on site. Windows delivered but two were damaged, need replacements. Weather was clear, 72 degrees." AI transcribes and structures.',
          trigger: 'On voice recording'
        },
        {
          name: 'Structured Data Extraction',
          description: 'From narrative text, extracts: work performed by trade, manpower counts by vendor, deliveries received, issues encountered, weather conditions. Creates structured data for analytics.',
          trigger: 'On log save'
        },
        {
          name: 'Schedule Auto-Update',
          description: 'Suggests schedule updates from log content: "Log mentions \'completed first floor walls\'—mark Wall Framing as 100% complete? Log mentions \'started roof trusses\'—mark Roof Framing as started?" User confirms.',
          trigger: 'On log save'
        },
        {
          name: 'Vendor Task Assignment',
          description: 'When issues mention vendors, auto-creates follow-up: "Log mentions \'ABC Framing needs to return tomorrow to fix header\'—create task for ABC Framing? Send notification to vendor?"',
          trigger: 'On issue detection'
        },
        {
          name: 'Issue Categorization & Learning',
          description: 'Categorizes issues (weather, vendor, material, client, inspection) and learns patterns: "This vendor has had material issues on 3 of last 5 jobs." Feeds into vendor scorecards.',
          trigger: 'On issue entry'
        },
        {
          name: 'Weather Delay Documentation',
          description: 'Auto-documents weather delays for excusable delay claims: "Rain delay logged Dec 15-16. Total weather delays this project: 5 days. Contract allows 10 excusable weather days."',
          trigger: 'When weather impacts work'
        },
        {
          name: 'Client Report Generation',
          description: 'Compiles weekly logs into client-friendly narrative: "This week: Framing completed, windows installed, electrical rough-in started. On track for drywall next week. 2 days lost to weather."',
          trigger: 'Weekly (configurable)'
        },
        {
          name: 'Manpower Intelligence',
          description: 'Tracks vendor productivity over time: "ABC Electric averages 3.2 workers per day on your jobs. Industry benchmark is 2.8 for similar scope. Good productivity." Feeds schedule duration predictions.',
          trigger: 'Continuous learning from logs'
        },
        {
          name: 'Photo Organization',
          description: 'Auto-tags photos by phase, trade, and location based on log content and image analysis: "Photo 1: Framing - First Floor Walls. Photo 2: Delivery - Window Shipment (damaged)."',
          trigger: 'On photo upload'
        },
        {
          name: 'Anomaly Detection',
          description: 'Flags unusual patterns: "No daily log in 3 days for active job." "Manpower dropped from 8 to 2—potential issue?" "Multiple issues logged for same vendor this week."',
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
  )
}
