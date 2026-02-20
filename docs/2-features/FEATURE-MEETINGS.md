# Meeting Templates Feature Specification

**Priority:** 3 - Medium
**Dependencies:** Discussion Capture, Communications
**Status:** Planning

---

## Overview

Pre-built meeting templates for common construction meetings (OAC, progress, client walkthrough) with automatic agenda generation based on project status and AI-assisted meeting notes.

---

## User Stories

1. **As a PM**, I want to select a meeting template and have the agenda auto-populated
2. **As a PM**, I want meeting attendees to receive agenda before the meeting
3. **As a user**, I want to take notes during meeting that link to agenda items
4. **As a PM**, I want meeting summaries auto-generated and distributed
5. **As a user**, I want action items from meetings to auto-create tasks

---

## Database Schema

```sql
-- Meeting templates
CREATE TABLE meeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id), -- NULL for system templates

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT NOT NULL, -- 'oac', 'progress', 'kickoff', 'closeout', 'client_walkthrough', 'subcontractor', 'safety', 'custom'

  -- Timing defaults
  default_duration_minutes INTEGER DEFAULT 60,
  default_recurrence TEXT, -- 'weekly', 'biweekly', 'monthly', 'as_needed'

  -- Attendee defaults
  default_attendee_roles TEXT[] DEFAULT '{}', -- ['pm', 'superintendent', 'client']
  external_attendees_allowed BOOLEAN DEFAULT true,

  -- Agenda structure
  agenda_sections JSONB NOT NULL, -- [{ title, items: [{ text, dynamic_source?, required }] }]

  -- Settings
  auto_generate_agenda BOOLEAN DEFAULT true,
  record_meeting BOOLEAN DEFAULT false,
  client_visible BOOLEAN DEFAULT false,

  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system templates
INSERT INTO meeting_templates (name, description, meeting_type, agenda_sections, is_system) VALUES
(
  'OAC Meeting',
  'Owner-Architect-Contractor progress meeting',
  'oac',
  '[
    {
      "title": "Previous Meeting Review",
      "items": [
        {"text": "Review previous meeting minutes", "dynamic_source": "previous_meeting"},
        {"text": "Outstanding action items", "dynamic_source": "open_action_items"}
      ]
    },
    {
      "title": "Schedule Review",
      "items": [
        {"text": "Current schedule status", "dynamic_source": "schedule_status"},
        {"text": "Critical path items", "dynamic_source": "critical_path"},
        {"text": "Weather impacts", "dynamic_source": "weather_delays"}
      ]
    },
    {
      "title": "Budget Review",
      "items": [
        {"text": "Budget status overview", "dynamic_source": "budget_status"},
        {"text": "Pending change orders", "dynamic_source": "pending_change_orders"},
        {"text": "Payment status", "dynamic_source": "payment_status"}
      ]
    },
    {
      "title": "RFIs & Submittals",
      "items": [
        {"text": "Open RFIs", "dynamic_source": "open_rfis"},
        {"text": "Pending submittals", "dynamic_source": "pending_submittals"}
      ]
    },
    {
      "title": "Selections",
      "items": [
        {"text": "Upcoming selection deadlines", "dynamic_source": "selection_deadlines"}
      ]
    },
    {
      "title": "New Business",
      "items": [
        {"text": "Discussion items", "required": false}
      ]
    }
  ]',
  true
),
(
  'Weekly Progress Meeting',
  'Internal team weekly progress sync',
  'progress',
  '[
    {
      "title": "Safety",
      "items": [
        {"text": "Safety observations this week", "dynamic_source": "safety_observations"},
        {"text": "Upcoming safety concerns"}
      ]
    },
    {
      "title": "Schedule",
      "items": [
        {"text": "Work completed this week", "dynamic_source": "work_completed_week"},
        {"text": "Next week lookahead", "dynamic_source": "lookahead"},
        {"text": "Schedule concerns"}
      ]
    },
    {
      "title": "Resources",
      "items": [
        {"text": "Labor on site today", "dynamic_source": "labor_count"},
        {"text": "Equipment needs"},
        {"text": "Material deliveries", "dynamic_source": "upcoming_deliveries"}
      ]
    },
    {
      "title": "Issues & Blockers",
      "items": [
        {"text": "Current blockers"},
        {"text": "Required decisions"}
      ]
    }
  ]',
  true
),
(
  'Client Walkthrough',
  'Scheduled client site visit',
  'client_walkthrough',
  '[
    {
      "title": "Progress Overview",
      "items": [
        {"text": "Overall progress since last visit", "dynamic_source": "progress_summary"},
        {"text": "Completed milestones", "dynamic_source": "recent_milestones"}
      ]
    },
    {
      "title": "Selections Review",
      "items": [
        {"text": "Installed selections tour"},
        {"text": "Upcoming selection decisions", "dynamic_source": "selection_deadlines"}
      ]
    },
    {
      "title": "Change Orders",
      "items": [
        {"text": "Review pending changes", "dynamic_source": "pending_change_orders"}
      ]
    },
    {
      "title": "Questions & Concerns",
      "items": [
        {"text": "Client questions"},
        {"text": "Address any concerns"}
      ]
    }
  ]',
  true
);

-- Scheduled meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),

  -- From template
  template_id UUID REFERENCES meeting_templates(id),
  meeting_type TEXT NOT NULL,

  -- Meeting details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  location_type TEXT DEFAULT 'site', -- 'site', 'office', 'virtual', 'hybrid'
  video_link TEXT,

  -- Timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  recurring_series_id UUID,

  -- Attendees
  organizer_id UUID REFERENCES users(id),

  -- Generated content
  agenda JSONB, -- Generated agenda with dynamic data filled in
  agenda_generated_at TIMESTAMPTZ,

  -- Notes & outcomes
  notes TEXT,
  notes_html TEXT,

  -- Discussion capture
  discussion_id UUID REFERENCES discussions(id),
  recording_url TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'

  -- Distribution
  agenda_sent BOOLEAN DEFAULT false,
  agenda_sent_at TIMESTAMPTZ,
  minutes_sent BOOLEAN DEFAULT false,
  minutes_sent_at TIMESTAMPTZ,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting attendees
CREATE TABLE meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id),

  -- Attendee info
  attendee_type TEXT NOT NULL, -- 'user', 'client', 'vendor', 'external'
  user_id UUID REFERENCES users(id),
  contact_id UUID,
  email TEXT,
  name TEXT,

  -- Status
  rsvp_status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'tentative'
  rsvp_at TIMESTAMPTZ,

  -- Attendance
  attended BOOLEAN,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,

  -- Permissions
  can_edit_notes BOOLEAN DEFAULT false,
  receive_minutes BOOLEAN DEFAULT true,

  UNIQUE(meeting_id, user_id),
  UNIQUE(meeting_id, email)
);

-- Meeting agenda items (for tracking during meeting)
CREATE TABLE meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id),

  -- From template
  section_title TEXT NOT NULL,
  item_text TEXT NOT NULL,
  dynamic_source TEXT,

  -- Generated content
  dynamic_content TEXT, -- Auto-populated content

  -- During meeting
  notes TEXT,
  discussed BOOLEAN DEFAULT false,
  discussed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Outcomes
  action_items JSONB DEFAULT '[]', -- [{ text, assigned_to, due_date }]
  decisions JSONB DEFAULT '[]',

  sort_order INTEGER DEFAULT 0
);

-- Meeting series (for recurring meetings)
CREATE TABLE meeting_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),

  template_id UUID REFERENCES meeting_templates(id),
  title TEXT NOT NULL,
  recurrence_rule TEXT NOT NULL, -- iCal RRULE

  -- Defaults for instances
  default_duration_minutes INTEGER,
  default_location TEXT,
  default_attendees JSONB,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_meetings_job ON meetings(job_id);
CREATE INDEX idx_meetings_date ON meetings(scheduled_start);
CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_user ON meeting_attendees(user_id);
```

---

## Dynamic Agenda Generation

```typescript
// lib/meetings/agenda-generator.ts

interface AgendaSection {
  title: string
  items: AgendaItem[]
}

interface AgendaItem {
  text: string
  dynamicSource?: string
  dynamicContent?: string
  required?: boolean
}

const dynamicSourceHandlers: Record<string, (jobId: string) => Promise<string>> = {
  // Schedule sources
  schedule_status: async (jobId) => {
    const schedule = await getScheduleStatus(jobId)
    return `**Progress:** ${schedule.percentComplete}% complete
**Variance:** ${schedule.varianceDays > 0 ? '+' : ''}${schedule.varianceDays} days vs baseline
**Projected Completion:** ${formatDate(schedule.projectedEnd)}`
  },

  critical_path: async (jobId) => {
    const tasks = await getCriticalPathTasks(jobId)
    if (tasks.length === 0) return 'No critical path items this week'
    return tasks.slice(0, 5).map(t =>
      `- ${t.name} (${formatDate(t.plannedStart)} - ${formatDate(t.plannedEnd)})`
    ).join('\n')
  },

  weather_delays: async (jobId) => {
    const delays = await getWeatherDelays(jobId, 30) // Last 30 days
    if (delays.length === 0) return 'No weather delays recorded'
    const totalDays = delays.reduce((sum, d) => sum + d.days, 0)
    return `${totalDays} weather delay days in the past 30 days`
  },

  lookahead: async (jobId) => {
    const tasks = await getTwoWeekLookahead(jobId)
    return tasks.map(t =>
      `- ${t.name} | ${formatDate(t.plannedStart)} | ${t.trade}`
    ).join('\n')
  },

  // Budget sources
  budget_status: async (jobId) => {
    const budget = await getBudgetStatus(jobId)
    return `**Contract:** ${formatCurrency(budget.contractAmount)}
**Spent:** ${formatCurrency(budget.spentToDate)} (${budget.percentSpent}%)
**Remaining:** ${formatCurrency(budget.remaining)}
**Projected Final:** ${formatCurrency(budget.projectedFinal)}`
  },

  pending_change_orders: async (jobId) => {
    const cos = await getPendingChangeOrders(jobId)
    if (cos.length === 0) return 'No pending change orders'
    return cos.map(co =>
      `- CO #${co.number}: ${co.title} (${formatCurrency(co.amount)}) - ${co.status}`
    ).join('\n')
  },

  payment_status: async (jobId) => {
    const payments = await getPaymentStatus(jobId)
    return `**Total Billed:** ${formatCurrency(payments.totalBilled)}
**Total Received:** ${formatCurrency(payments.totalReceived)}
**Outstanding:** ${formatCurrency(payments.outstanding)}
${payments.pendingDraws.length > 0 ? `\n**Pending Draws:** ${payments.pendingDraws.length}` : ''}`
  },

  // RFIs & Submittals
  open_rfis: async (jobId) => {
    const rfis = await getOpenRFIs(jobId)
    if (rfis.length === 0) return 'No open RFIs'
    return rfis.map(rfi =>
      `- RFI #${rfi.number}: ${rfi.subject} (${rfi.daysOpen} days open)`
    ).join('\n')
  },

  pending_submittals: async (jobId) => {
    const submittals = await getPendingSubmittals(jobId)
    if (submittals.length === 0) return 'No pending submittals'
    return submittals.map(s =>
      `- ${s.type}: ${s.description} (Due: ${formatDate(s.dueDate)})`
    ).join('\n')
  },

  // Selections
  selection_deadlines: async (jobId) => {
    const selections = await getUpcomingSelections(jobId, 14) // Next 2 weeks
    if (selections.length === 0) return 'No selection deadlines in next 2 weeks'
    return selections.map(s =>
      `- ${s.category}: ${s.name} (Due: ${formatDate(s.dueDate)})`
    ).join('\n')
  },

  // Previous meeting
  previous_meeting: async (jobId) => {
    const lastMeeting = await getLastMeeting(jobId)
    if (!lastMeeting) return 'No previous meeting recorded'
    return `Previous meeting: ${formatDate(lastMeeting.scheduledStart)}\n${lastMeeting.notes?.slice(0, 200) || 'No notes recorded'}`
  },

  open_action_items: async (jobId) => {
    const items = await getOpenActionItems(jobId)
    if (items.length === 0) return 'All action items complete'
    return items.map(item =>
      `- [ ] ${item.text} (@${item.assignedTo}) - Due: ${formatDate(item.dueDate)}`
    ).join('\n')
  },

  // Progress
  work_completed_week: async (jobId) => {
    const logs = await getDailyLogsThisWeek(jobId)
    const workItems = logs.flatMap(l => l.workCompleted || [])
    if (workItems.length === 0) return 'No work logged this week'
    return workItems.slice(0, 10).map(w => `- ${w}`).join('\n')
  },

  progress_summary: async (jobId) => {
    const progress = await getProgressSummary(jobId)
    return `${progress.percentComplete}% complete. ${progress.recentMilestones.length} milestones completed recently.`
  },

  recent_milestones: async (jobId) => {
    const milestones = await getRecentMilestones(jobId, 30)
    if (milestones.length === 0) return 'No milestones completed recently'
    return milestones.map(m =>
      `- ${m.name} (${formatDate(m.completedDate)})`
    ).join('\n')
  },

  // Resources
  labor_count: async (jobId) => {
    const labor = await getTodayLabor(jobId)
    return `${labor.total} workers on site (${labor.breakdown.map(b => `${b.trade}: ${b.count}`).join(', ')})`
  },

  upcoming_deliveries: async (jobId) => {
    const deliveries = await getUpcomingDeliveries(jobId, 7)
    if (deliveries.length === 0) return 'No deliveries scheduled this week'
    return deliveries.map(d =>
      `- ${d.description} | ${formatDate(d.expectedDate)} | ${d.vendor}`
    ).join('\n')
  },

  // Safety
  safety_observations: async (jobId) => {
    const observations = await getSafetyObservations(jobId, 7)
    if (observations.length === 0) return 'No safety observations this week'
    return observations.map(o =>
      `- ${o.type}: ${o.description} (${o.severity})`
    ).join('\n')
  },
}

export async function generateAgenda(
  templateId: string,
  jobId: string
): Promise<AgendaSection[]> {
  const template = await getMeetingTemplate(templateId)
  const agenda: AgendaSection[] = []

  for (const section of template.agenda_sections) {
    const items: AgendaItem[] = []

    for (const item of section.items) {
      let dynamicContent: string | undefined

      if (item.dynamic_source && dynamicSourceHandlers[item.dynamic_source]) {
        try {
          dynamicContent = await dynamicSourceHandlers[item.dynamic_source](jobId)
        } catch (error) {
          dynamicContent = 'Unable to load data'
        }
      }

      items.push({
        text: item.text,
        dynamicSource: item.dynamic_source,
        dynamicContent,
        required: item.required,
      })
    }

    agenda.push({
      title: section.title,
      items,
    })
  }

  return agenda
}
```

---

## Meeting Component

```tsx
// components/meetings/meeting-scheduler.tsx

'use client'

import { useState } from 'react'
import {
  Calendar, Clock, MapPin, Users, Video, FileText,
  ChevronRight, Sparkles, Send
} from 'lucide-react'

interface MeetingSchedulerProps {
  jobId?: string
  onScheduled: (meetingId: string) => void
}

export function MeetingScheduler({ jobId, onScheduled }: MeetingSchedulerProps) {
  const [step, setStep] = useState<'template' | 'details' | 'attendees' | 'agenda'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate | null>(null)
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    locationType: 'site' as 'site' | 'office' | 'virtual',
    videoLink: '',
  })
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [agenda, setAgenda] = useState<AgendaSection[]>([])
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false)

  const templates = useMeetingTemplates()

  const handleTemplateSelect = async (template: MeetingTemplate) => {
    setSelectedTemplate(template)
    setMeetingData(prev => ({
      ...prev,
      title: `${template.name} - ${jobId ? 'Job Name' : 'General'}`,
      duration: template.default_duration_minutes,
    }))

    // Pre-populate attendees based on template
    const defaultAttendees = await getDefaultAttendees(template.default_attendee_roles)
    setAttendees(defaultAttendees)

    setStep('details')
  }

  const handleGenerateAgenda = async () => {
    if (!selectedTemplate || !jobId) return

    setIsGeneratingAgenda(true)
    try {
      const generatedAgenda = await generateAgenda(selectedTemplate.id, jobId)
      setAgenda(generatedAgenda)
    } finally {
      setIsGeneratingAgenda(false)
    }
  }

  const handleSchedule = async () => {
    const meeting = await createMeeting({
      templateId: selectedTemplate?.id,
      jobId,
      ...meetingData,
      attendees,
      agenda,
    })

    onScheduled(meeting.id)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['template', 'details', 'attendees', 'agenda'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? 'bg-stone-700 text-white' :
              ['template', 'details', 'attendees', 'agenda'].indexOf(step) > i
                ? 'bg-success text-white' : 'bg-warm-200 text-warm-500'
            }`}>
              {i + 1}
            </div>
            {i < 3 && <ChevronRight className="h-4 w-4 text-warm-400 mx-2" />}
          </div>
        ))}
      </div>

      {/* Template selection */}
      {step === 'template' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-800">Select Meeting Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-4 bg-warm-0 border border-warm-200 rounded-xl text-left hover:border-stone-300 transition-colors"
              >
                <h3 className="font-medium text-warm-800">{template.name}</h3>
                <p className="text-sm text-warm-500 mt-1">{template.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-warm-400">
                  <Clock className="h-3 w-3" />
                  {template.default_duration_minutes} min
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meeting details */}
      {step === 'details' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-800">Meeting Details</h2>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Title</label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-warm-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Date</label>
              <input
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Time</label>
              <input
                type="time"
                value={meetingData.time}
                onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Location Type</label>
            <div className="flex gap-2">
              {[
                { id: 'site', label: 'On Site', icon: MapPin },
                { id: 'office', label: 'Office', icon: MapPin },
                { id: 'virtual', label: 'Virtual', icon: Video },
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setMeetingData(prev => ({ ...prev, locationType: loc.id as any }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    meetingData.locationType === loc.id
                      ? 'border-stone-600 bg-stone-50'
                      : 'border-warm-200'
                  }`}
                >
                  <loc.icon className="h-4 w-4" />
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setStep('template')} className="px-4 py-2 text-warm-600">
              Back
            </button>
            <button
              onClick={() => setStep('attendees')}
              className="px-4 py-2 bg-stone-700 text-white rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Attendees */}
      {step === 'attendees' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-warm-800">Attendees</h2>

          <div className="space-y-2">
            {attendees.map((attendee, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-warm-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium">
                    {attendee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-800">{attendee.name}</p>
                    <p className="text-xs text-warm-500">{attendee.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAttendees(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-warm-400 hover:text-warm-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800">
            <Users className="h-4 w-4" />
            Add attendee
          </button>

          <div className="flex justify-end gap-2">
            <button onClick={() => setStep('details')} className="px-4 py-2 text-warm-600">
              Back
            </button>
            <button
              onClick={() => {
                handleGenerateAgenda()
                setStep('agenda')
              }}
              className="px-4 py-2 bg-stone-700 text-white rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Agenda */}
      {step === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-warm-800">Agenda</h2>
            <button
              onClick={handleGenerateAgenda}
              disabled={isGeneratingAgenda}
              className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingAgenda ? 'Generating...' : 'Regenerate'}
            </button>
          </div>

          {agenda.map((section, si) => (
            <div key={si} className="border border-warm-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-warm-50 border-b border-warm-200">
                <h3 className="font-medium text-warm-800">{section.title}</h3>
              </div>
              <div className="divide-y divide-warm-100">
                {section.items.map((item, ii) => (
                  <div key={ii} className="p-4">
                    <p className="text-sm font-medium text-warm-700">{item.text}</p>
                    {item.dynamicContent && (
                      <div className="mt-2 p-3 bg-warm-50 rounded-lg text-xs text-warm-600 whitespace-pre-line font-mono">
                        {item.dynamicContent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <button onClick={() => setStep('attendees')} className="px-4 py-2 text-warm-600">
              Back
            </button>
            <button
              onClick={handleSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg"
            >
              <Send className="h-4 w-4" />
              Schedule & Send Invites
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1 | Database schema, template structure |
| Phase 2 | Week 2 | Dynamic agenda generation |
| Phase 3 | Week 3 | Meeting scheduling UI |
| Phase 4 | Week 4 | Calendar integration, invites |

---

*BuildDesk Feature Specification v1.0*
