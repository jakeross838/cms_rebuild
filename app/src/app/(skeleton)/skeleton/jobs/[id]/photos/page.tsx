'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Daily Logs', 'Photos', 'Client Portal', 'Documents'
]

export default function PhotosSkeleton() {
  return (
    <PageSpec
      title="Photos"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/PHOTOS.md"
      description="AI-curated photo gallery for construction progress documentation. Automatically organizes by date and phase, removes duplicates and poor quality images, and selects the best photos for client viewing. Tag photos by location, trade, or milestone."
      workflow={constructionWorkflow}
      features={[
        'Photo gallery with grid and lightbox views',
        'Upload from phone, desktop, or daily log',
        'Auto-organize by date and construction phase',
        'AI quality filtering: Remove blurry, dark, duplicate photos',
        'AI curation for client: Select best photos to share',
        'Tag by location (room, area, exterior)',
        'Tag by trade (framing, electrical, plumbing)',
        'Tag by milestone (foundation complete, dry-in, etc.)',
        'Before/after comparisons',
        'Photo markup and annotation',
        'Link photos to daily log entries',
        'Link photos to punch list items',
        'Bulk download by date range or tag',
        'Share albums with client via portal',
        'GPS location from photo metadata',
        'Timeline view showing progress over time',
      ]}
      connections={[
        { name: 'Daily Logs', type: 'input', description: 'Photos linked to daily log entries' },
        { name: 'Client Portal', type: 'output', description: 'AI-curated photos shared with client' },
        { name: 'Punch Lists', type: 'bidirectional', description: 'Photos document punch items' },
        { name: 'Schedule', type: 'input', description: 'Photos organized by schedule phase' },
        { name: 'Documents', type: 'output', description: 'Photos included in project documentation' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'file_url', type: 'string', required: true, description: 'Storage URL' },
        { name: 'thumbnail_url', type: 'string', description: 'Thumbnail URL' },
        { name: 'taken_at', type: 'timestamp', description: 'When photo was taken' },
        { name: 'uploaded_at', type: 'timestamp', required: true, description: 'When uploaded' },
        { name: 'uploaded_by', type: 'uuid', description: 'User who uploaded' },
        { name: 'phase', type: 'string', description: 'Construction phase' },
        { name: 'location_tags', type: 'string[]', description: 'Location tags' },
        { name: 'trade_tags', type: 'string[]', description: 'Trade tags' },
        { name: 'ai_quality_score', type: 'decimal', description: 'AI quality assessment' },
        { name: 'ai_client_suitable', type: 'boolean', description: 'AI recommends for client' },
        { name: 'is_milestone', type: 'boolean', description: 'Marks a milestone' },
        { name: 'daily_log_id', type: 'uuid', description: 'FK to daily_logs' },
        { name: 'punch_item_id', type: 'uuid', description: 'FK to punch_items' },
        { name: 'gps_lat', type: 'decimal', description: 'GPS latitude' },
        { name: 'gps_lng', type: 'decimal', description: 'GPS longitude' },
        { name: 'caption', type: 'text', description: 'Photo caption' },
      ]}
      aiFeatures={[
        {
          name: 'Quality Filtering',
          description: 'Automatically assesses photo quality: "47 photos uploaded today. AI filtered: 8 blurry, 5 duplicates, 3 too dark. 31 quality photos retained."',
          trigger: 'On photo upload'
        },
        {
          name: 'Client Curation',
          description: 'Selects best photos for client viewing: "Of 156 photos this week, AI selected 24 for client portal: 8 progress shots, 6 milestone photos, 10 detail shots. Excluded: construction debris, equipment, partial work."',
          trigger: 'Weekly or on-demand'
        },
        {
          name: 'Auto-Tagging',
          description: 'Automatically tags photos based on content: "Detected: Framing, second floor, bathroom area. Suggested tags applied. Confidence: 92%."',
          trigger: 'On photo upload'
        },
        {
          name: 'Progress Detection',
          description: 'Identifies significant progress by comparing to previous photos: "Roof trusses now visible compared to yesterday. Mark as milestone? This would be good for client update."',
          trigger: 'On photo analysis'
        },
        {
          name: 'Missing Documentation Alert',
          description: 'Alerts when expected photos are missing: "Electrical rough-in scheduled for completion today. No photos from electrical areas in last 3 days. Reminder sent to field."',
          trigger: 'Based on schedule milestones'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Photos - Smith Residence                    [Upload] [Share Album]  │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All ▾] Phase: [All ▾] Date: [Last 30 days ▾]              │
│ View: [Grid] [Timeline] [By Phase]    [Client View: 24 selected]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ TODAY - January 28 (12 photos)                    AI: 8 client-ready│
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │             │
│ │ ★    │ │ ★    │ │      │ │ ★    │ │      │ │ ★    │             │
│ │Framng│ │Roof  │ │Crew  │ │Detail│ │Equip │ │Progrs│             │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                                     │
│ JANUARY 27 (18 photos)                            AI: 12 client-rdy │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │             │
│ │ ★ 🏆 │ │ ★    │ │ ★    │ │      │ │ ★    │ │      │             │
│ │Milstn│ │Framng│ │Window│ │Parts │ │Progrs│ │Debris│             │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                                     │
│ ★ = AI selected for client | 🏆 = Milestone photo                   │
├─────────────────────────────────────────────────────────────────────┤
│ AI: "Roof trusses installed - significant milestone. Added to       │
│ client weekly summary. 3 great progress shots selected."            │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
