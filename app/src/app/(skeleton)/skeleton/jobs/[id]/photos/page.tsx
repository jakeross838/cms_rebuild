'use client'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PhotosPreview } from '@/components/skeleton/previews/photos-preview'
import { useState } from 'react'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Daily Logs', 'Photos', 'Client Portal', 'Documents'
]

export default function PhotosSkeleton() {
  
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
        <PhotosPreview />
      ) : (
        <PageSpec
      title="Photos"
      phase="Phase 2 - Construction Core"
      planFile="docs/modules/08-daily-logs.md (photos section)"
      description="AI-powered photo gallery for construction progress documentation. Every photo passes through a 10-step AI processing pipeline: EXIF extraction, quality assessment, trade/phase/location classification, milestone detection, duplicate detection, client suitability scoring, and schedule task matching. Photos are auto-organized by date, phase, trade, and room, with intelligent curation for client portal sharing."
      workflow={constructionWorkflow}
      features={[
        'Photo gallery with grid view, lightbox, and timeline view',
        'Upload from phone camera, desktop, or daily log entry',
        'One-tap quick photo capture auto-tagged to project, date, GPS location, and phase',
        'AI auto-organize by date, construction phase, trade, and room/location',
        'AI quality assessment: blur, exposure, composition scored 0-1',
        'AI duplicate/similar detection against existing project photos',
        'AI client suitability scoring: clean, well-lit, shows progress vs debris/equipment',
        'AI milestone detection: first pour, framed, dried-in, drywall complete, trim complete',
        'AI-generated captions for every photo',
        'Tag by location (room, area, exterior) -- AI-suggested with user override',
        'Tag by trade (framing, electrical, plumbing, etc.) -- AI-classified',
        'Tag by milestone type with visual star badge',
        'Before/after comparisons for punch list items and progress documentation',
        'Photo markup and annotation: draw circles, arrows, text, and measurements',
        'Link photos to daily log entries with section (work, delivery, safety, issue)',
        'Link photos to punch list items for before/after documentation',
        'Link photos to schedule tasks when identifiable',
        'Bulk select with tag, download, share, and archive operations',
        'Bulk mark as client-ready or remove from client view',
        'Share photo albums with client via portal (client-suitable photos only)',
        'GPS location from EXIF metadata with map view',
        'Timeline view showing construction progress over time',
        'Photo annotation: draw on photos to highlight issues',
        'Optional voice note overlay on captured photos',
        'Compressed versions and thumbnails auto-generated',
        'Soft delete (archive) only -- no permanent deletion',
      ]}
      connections={[
        { name: 'Daily Logs', type: 'bidirectional', description: 'Photos attached to log sections; auto-filed to gallery and log simultaneously' },
        { name: 'Client Portal', type: 'output', description: 'AI-curated client-suitable photos shared via portal' },
        { name: 'Punch List', type: 'bidirectional', description: 'Before/after photos document punch items' },
        { name: 'Schedule', type: 'bidirectional', description: 'Photos matched to schedule tasks; milestone photos mark progress' },
        { name: 'Documents', type: 'output', description: 'Photos stored in project document system' },
        { name: 'Draws', type: 'output', description: 'Progress photos included in draw documentation' },
        { name: 'Selections', type: 'input', description: 'Selection photos showing installed products' },
        { name: 'Safety & Compliance', type: 'output', description: 'Safety observation photos routed to safety module' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_id', type: 'uuid', required: true, description: 'FK to companies (multi-tenant)' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'file_url', type: 'string', required: true, description: 'Full-resolution storage path' },
        { name: 'thumbnail_url', type: 'string', description: 'Compressed thumbnail path' },
        { name: 'taken_at', type: 'timestamp', description: 'From EXIF or upload time' },
        { name: 'uploaded_at', type: 'timestamp', required: true, description: 'When uploaded' },
        { name: 'uploaded_by', type: 'uuid', required: true, description: 'User who uploaded' },
        { name: 'gps_lat', type: 'decimal', description: 'GPS latitude from EXIF' },
        { name: 'gps_lng', type: 'decimal', description: 'GPS longitude from EXIF' },
        { name: 'device', type: 'string', description: 'Device info from EXIF' },
        { name: 'ai_tags.trade', type: 'string', description: 'AI-classified trade (framing, electrical, plumbing, etc.)' },
        { name: 'ai_tags.phase', type: 'string', description: 'AI-classified phase (foundation, framing, rough_in, finish, etc.)' },
        { name: 'ai_tags.location', type: 'string', description: 'AI-detected location (kitchen, master_bath, exterior_front, etc.)' },
        { name: 'ai_tags.room_confidence', type: 'decimal', description: 'Room detection confidence 0-1' },
        { name: 'ai_tags.is_milestone', type: 'boolean', description: 'AI-detected milestone photo' },
        { name: 'ai_tags.milestone_type', type: 'string', description: 'Type: first_pour, framed, dried_in, drywall_complete, etc.' },
        { name: 'ai_tags.quality_score', type: 'decimal', description: 'Quality assessment 0-1' },
        { name: 'ai_tags.client_suitable', type: 'boolean', description: 'Suitable for client portal' },
        { name: 'ai_tags.is_duplicate', type: 'boolean', description: 'Detected as duplicate/similar' },
        { name: 'ai_tags.duplicate_of', type: 'uuid', description: 'Original photo if duplicate' },
        { name: 'ai_tags.description', type: 'string', description: 'AI-generated caption' },
        { name: 'daily_log_id', type: 'uuid', description: 'FK to daily_logs if from log entry' },
        { name: 'punch_item_id', type: 'uuid', description: 'FK to punch_items if documenting punch item' },
        { name: 'schedule_task_id', type: 'uuid', description: 'FK to schedule tasks if matched' },
        { name: 'section', type: 'enum', description: 'Log section: work | material | safety | issue | general' },
        { name: 'caption', type: 'text', description: 'User or AI-generated caption' },
        { name: 'annotations', type: 'jsonb', description: 'Drawing overlay data (circles, arrows, text)' },
        { name: 'portal_visible', type: 'boolean', description: 'Visible in client portal based on client_suitable + builder setting' },
      ]}
      aiFeatures={[
        {
          name: 'Quality Assessment',
          description: 'Automatically scores photo quality (blur, exposure, composition) 0-1. Filters out poor quality: "14 photos uploaded today. AI filtered: 1 blurry (score 0.45). Quality photos retained."',
          trigger: 'On photo upload'
        },
        {
          name: 'Duplicate & Similar Detection',
          description: 'Compares new photos against existing project gallery to detect duplicates and near-duplicates. "Photo #11 appears similar to photo #10 (same angle, slightly different). Flagged as duplicate."',
          trigger: 'On photo upload'
        },
        {
          name: 'Trade & Phase Classification',
          description: 'Classifies photos by construction trade (framing, electrical, plumbing, roofing, etc.) and phase (foundation, rough-in, drywall, finish). "Detected: Framing trade, Rough-In phase. Confidence: 94%."',
          trigger: 'On photo upload'
        },
        {
          name: 'Room & Location Detection',
          description: 'Detects the room/area in the photo: kitchen, master bath, exterior front, garage, etc. Uses EXIF GPS + image analysis for accuracy. "Detected: Master Bathroom, room confidence 87%."',
          trigger: 'On photo upload'
        },
        {
          name: 'Milestone Detection',
          description: 'Identifies significant construction milestones by comparing to progress history: "Ridge beam visible -- roof framing milestone. Walls complete -- major milestone. Mark for client update?"',
          trigger: 'On photo analysis'
        },
        {
          name: 'Client Suitability Scoring',
          description: 'Scores photos for client portal suitability: clean scenes, well-lit, shows progress. Excludes: debris, equipment close-ups, partial work. "Of 14 photos this week, 9 selected for client portal."',
          trigger: 'On photo upload'
        },
        {
          name: 'AI-Generated Captions',
          description: 'Generates descriptive captions: "Roof sheathing installation in progress, north elevation" or "Plumbing top-out complete, master bathroom." Captions used for search and client reports.',
          trigger: 'On photo upload'
        },
        {
          name: 'Schedule Task Matching',
          description: 'Matches photos to active schedule tasks when trade/phase/location can be identified. Links photo evidence to task progress documentation.',
          trigger: 'On photo upload'
        },
        {
          name: 'Missing Documentation Alert',
          description: 'Flags when expected photos are missing based on schedule: "Electrical rough-in scheduled for completion today. No photos from electrical areas in last 3 days. Reminder sent to field."',
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
      )}
    </div>
  )
}
