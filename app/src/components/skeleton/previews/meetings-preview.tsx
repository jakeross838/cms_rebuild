'use client'

import { useState } from 'react'

import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Building,
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Circle,
  AlertCircle,
  FileText,
  Mic,
  List,
  Copy,
  Send,
  Edit3,
  Trash2,
  MoreHorizontal,
  Sparkles,
  ClipboardList,
  MessageSquare,
  User,
  Phone,
  ExternalLink,
  Play,
  Pause,
  Square,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// Types
type MeetingType = 'oac' | 'progress' | 'client_walkthrough' | 'kickoff' | 'closeout' | 'internal' | 'vendor'
type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
type AgendaItemStatus = 'pending' | 'discussed' | 'action_required' | 'resolved'

interface AgendaItem {
  id: string
  title: string
  duration: number // minutes
  presenter?: string
  status: AgendaItemStatus
  notes?: string
  actionItems?: string[]
}

interface Meeting {
  id: string
  title: string
  type: MeetingType
  status: MeetingStatus
  date: Date
  startTime: string
  endTime: string
  location?: string
  videoLink?: string
  jobId?: string
  jobName?: string
  attendees: { name: string; role: string; confirmed: boolean }[]
  agenda: AgendaItem[]
  notes?: string
  recordingUrl?: string
  transcriptUrl?: string
}

interface MeetingTemplate {
  id: string
  name: string
  type: MeetingType
  description: string
  defaultDuration: number
  defaultAgenda: { title: string; duration: number }[]
  requiredRoles: string[]
}

// Mock data
const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'OAC Meeting #8 - Johnson Kitchen',
    type: 'oac',
    status: 'scheduled',
    date: new Date(Date.now() + 86400000), // tomorrow
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    location: 'Project Site',
    jobId: 'job-1',
    jobName: 'Johnson Kitchen Remodel',
    attendees: [
      { name: 'John Johnson', role: 'Owner', confirmed: true },
      { name: 'Sarah Chen', role: 'Project Manager', confirmed: true },
      { name: 'Mike Thompson', role: 'Architect', confirmed: true },
      { name: 'David Park', role: 'Superintendent', confirmed: false },
    ],
    agenda: [
      { id: 'a1', title: 'Review Previous Action Items', duration: 10, status: 'pending' },
      { id: 'a2', title: 'Schedule Update & Critical Path', duration: 15, presenter: 'Sarah Chen', status: 'pending' },
      { id: 'a3', title: 'Budget Status Review', duration: 15, presenter: 'Sarah Chen', status: 'pending' },
      { id: 'a4', title: 'Change Order Discussion - Cabinet Upgrade', duration: 20, status: 'pending' },
      { id: 'a5', title: 'Upcoming Milestones', duration: 10, status: 'pending' },
      { id: 'a6', title: 'Open Issues & RFIs', duration: 15, status: 'pending' },
      { id: 'a7', title: 'Next Steps & Action Items', duration: 5, status: 'pending' },
    ],
  },
  {
    id: '2',
    title: 'Weekly Progress Meeting',
    type: 'progress',
    status: 'in_progress',
    date: new Date(),
    startTime: '2:00 PM',
    endTime: '3:00 PM',
    videoLink: 'https://zoom.us/j/123456789',
    jobId: 'job-2',
    jobName: 'Smith Residence',
    attendees: [
      { name: 'Sarah Chen', role: 'Project Manager', confirmed: true },
      { name: 'Mike Torres', role: 'Project Manager', confirmed: true },
      { name: 'David Park', role: 'Superintendent', confirmed: true },
    ],
    agenda: [
      { id: 'b1', title: 'Framing Progress Update', duration: 10, presenter: 'David Park', status: 'discussed' },
      { id: 'b2', title: 'Electrical Rough-in Schedule', duration: 15, presenter: 'Mike Torres', status: 'discussed' },
      { id: 'b3', title: 'Material Delivery Status', duration: 10, status: 'pending' },
      { id: 'b4', title: 'Weather Impact Assessment', duration: 10, status: 'pending' },
    ],
  },
  {
    id: '3',
    title: 'Client Walkthrough - Final Inspection',
    type: 'client_walkthrough',
    status: 'completed',
    date: new Date(Date.now() - 172800000),
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    location: 'Project Site - Downtown Office',
    jobId: 'job-3',
    jobName: 'Downtown Office Renovation',
    attendees: [
      { name: 'Tom Richards', role: 'Client', confirmed: true },
      { name: 'Sarah Chen', role: 'Project Manager', confirmed: true },
    ],
    agenda: [
      { id: 'c1', title: 'Walk through all spaces', duration: 45, status: 'resolved' },
      { id: 'c2', title: 'Punch list review', duration: 20, status: 'action_required', actionItems: ['Touch up paint in conference room', 'Replace damaged ceiling tile'] },
      { id: 'c3', title: 'Sign-off discussion', duration: 15, status: 'resolved' },
    ],
    notes: 'Client satisfied with overall work. Minor punch list items to be completed by Feb 20.',
    recordingUrl: '/recordings/meeting-3.mp4',
    transcriptUrl: '/transcripts/meeting-3.txt',
  },
]

const meetingTemplates: MeetingTemplate[] = [
  {
    id: 't1',
    name: 'OAC Meeting',
    type: 'oac',
    description: 'Owner-Architect-Contractor meeting for project coordination',
    defaultDuration: 90,
    defaultAgenda: [
      { title: 'Review Previous Action Items', duration: 10 },
      { title: 'Schedule Update & Critical Path', duration: 15 },
      { title: 'Budget Status Review', duration: 15 },
      { title: 'Change Orders', duration: 20 },
      { title: 'Upcoming Milestones', duration: 10 },
      { title: 'Open Issues & RFIs', duration: 15 },
      { title: 'Next Steps & Action Items', duration: 5 },
    ],
    requiredRoles: ['Owner', 'Architect', 'Project Manager'],
  },
  {
    id: 't2',
    name: 'Weekly Progress Meeting',
    type: 'progress',
    description: 'Internal team meeting to review project progress',
    defaultDuration: 60,
    defaultAgenda: [
      { title: 'Safety Moment', duration: 5 },
      { title: 'Schedule Review', duration: 15 },
      { title: 'Trade Coordination', duration: 15 },
      { title: 'Issues & Blockers', duration: 15 },
      { title: 'Action Items', duration: 10 },
    ],
    requiredRoles: ['Project Manager', 'Superintendent'],
  },
  {
    id: 't3',
    name: 'Client Walkthrough',
    type: 'client_walkthrough',
    description: 'Site walkthrough with client for progress review or inspection',
    defaultDuration: 60,
    defaultAgenda: [
      { title: 'Site Tour', duration: 30 },
      { title: 'Discussion & Questions', duration: 20 },
      { title: 'Next Steps', duration: 10 },
    ],
    requiredRoles: ['Client', 'Project Manager'],
  },
  {
    id: 't4',
    name: 'Project Kickoff',
    type: 'kickoff',
    description: 'Initial project meeting to align all stakeholders',
    defaultDuration: 120,
    defaultAgenda: [
      { title: 'Introductions', duration: 10 },
      { title: 'Project Overview & Goals', duration: 20 },
      { title: 'Scope Review', duration: 30 },
      { title: 'Schedule Overview', duration: 20 },
      { title: 'Communication Plan', duration: 15 },
      { title: 'Roles & Responsibilities', duration: 15 },
      { title: 'Q&A', duration: 10 },
    ],
    requiredRoles: ['Client', 'Project Manager', 'Superintendent', 'Architect'],
  },
]

const typeConfig: Record<MeetingType, { label: string; color: string; bg: string }> = {
  oac: { label: 'OAC', color: 'text-blue-600', bg: 'bg-blue-100' },
  progress: { label: 'Progress', color: 'text-green-600', bg: 'bg-green-100' },
  client_walkthrough: { label: 'Walkthrough', color: 'text-amber-600', bg: 'bg-amber-100' },
  kickoff: { label: 'Kickoff', color: 'text-purple-600', bg: 'bg-purple-100' },
  closeout: { label: 'Closeout', color: 'text-stone-600', bg: 'bg-stone-100' },
  internal: { label: 'Internal', color: 'text-warm-600', bg: 'bg-warm-100' },
  vendor: { label: 'Vendor', color: 'text-orange-600', bg: 'bg-orange-100' },
}

const statusConfig: Record<MeetingStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-green-600', bg: 'bg-green-100', icon: Play },
  completed: { label: 'Completed', color: 'text-warm-600', bg: 'bg-warm-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle },
}

function formatDate(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function MeetingCard({ meeting, onSelect }: { meeting: Meeting; onSelect: () => void }) {
  const type = typeConfig[meeting.type]
  const status = statusConfig[meeting.status]
  const StatusIcon = status.icon
  const confirmedCount = meeting.attendees.filter(a => a.confirmed).length

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-warm-0 border rounded-lg p-4 hover:border-warm-300 transition-colors cursor-pointer',
        meeting.status === 'in_progress' ? 'border-green-300 bg-green-50/30' : 'border-warm-200'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-1.5 py-0.5 rounded', type.bg, type.color)}>
              {type.label}
            </span>
            <span className={cn('text-xs px-1.5 py-0.5 rounded flex items-center gap-1', status.bg, status.color)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <h3 className="font-medium text-warm-800">{meeting.title}</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-warm-400" />
      </div>

      <div className="space-y-2 text-sm text-warm-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-warm-400" />
          <span>{formatDate(meeting.date)}</span>
          <span className="text-warm-400">|</span>
          <Clock className="h-4 w-4 text-warm-400" />
          <span>{meeting.startTime} - {meeting.endTime}</span>
        </div>

        {meeting.location ? <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-warm-400" />
            <span>{meeting.location}</span>
          </div> : null}

        {meeting.videoLink ? <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-warm-400" />
            <span className="text-blue-600">Video Conference</span>
          </div> : null}

        {meeting.jobName ? <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-warm-400" />
            <span>{meeting.jobName}</span>
          </div> : null}

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-warm-400" />
          <span>{confirmedCount}/{meeting.attendees.length} confirmed</span>
        </div>
      </div>

      {meeting.status === 'in_progress' && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Meeting in progress
            </span>
            <button className="text-xs text-green-700 hover:text-green-800 font-medium">
              Join Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MeetingDetail({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const type = typeConfig[meeting.type]
  const status = statusConfig[meeting.status]
  const [activeAgendaItem, setActiveAgendaItem] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-warm-0 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-warm-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs px-1.5 py-0.5 rounded', type.bg, type.color)}>
                {type.label}
              </span>
              <span className={cn('text-xs px-1.5 py-0.5 rounded', status.bg, status.color)}>
                {status.label}
              </span>
            </div>
            <h2 className="font-semibold text-warm-900">{meeting.title}</h2>
          </div>
          <button onClick={onClose} className="text-warm-500 hover:text-warm-700 text-xl">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-180px)]">
          {/* Meeting Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-warm-600">
                <Calendar className="h-4 w-4 text-warm-400" />
                <span>{formatDate(meeting.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-warm-600">
                <Clock className="h-4 w-4 text-warm-400" />
                <span>{meeting.startTime} - {meeting.endTime}</span>
              </div>
              {meeting.location ? <div className="flex items-center gap-2 text-warm-600">
                  <MapPin className="h-4 w-4 text-warm-400" />
                  <span>{meeting.location}</span>
                </div> : null}
              {meeting.videoLink ? <a href={meeting.videoLink} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Video className="h-4 w-4" />
                  <span>Join Video Call</span>
                  <ExternalLink className="h-3 w-3" />
                </a> : null}
            </div>
            <div>
              <p className="text-xs text-warm-500 mb-2">Attendees</p>
              <div className="space-y-1">
                {meeting.attendees.map((attendee, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      attendee.confirmed ? 'bg-green-500' : 'bg-warm-300'
                    )} />
                    <span className="text-warm-700">{attendee.name}</span>
                    <span className="text-xs text-warm-400">({attendee.role})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recording Controls (for in-progress meetings) */}
          {meeting.status === 'in_progress' && (
            <div className="bg-warm-50 border border-warm-200 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                      isRecording ? 'bg-red-100 text-red-700' : 'bg-warm-200 text-warm-700'
                    )}
                  >
                    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  {isRecording ? <span className="text-xs text-red-600 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Recording...
                    </span> : null}
                </div>
                <span className="text-xs text-warm-500">AI transcription enabled</span>
              </div>
            </div>
          )}

          {/* Agenda */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-warm-800 flex items-center gap-2">
                <List className="h-4 w-4 text-warm-500" />
                Agenda
              </h3>
              <span className="text-xs text-warm-500">
                {meeting.agenda.reduce((sum, item) => sum + item.duration, 0)} min total
              </span>
            </div>
            <div className="space-y-2">
              {meeting.agenda.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    'border rounded-lg p-3 transition-colors',
                    activeAgendaItem === item.id ? 'border-stone-400 bg-stone-50' : 'border-warm-200 hover:border-warm-300'
                  )}
                  onClick={() => setActiveAgendaItem(activeAgendaItem === item.id ? null : item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.status === 'resolved' || item.status === 'discussed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : item.status === 'action_required' ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-warm-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-warm-800">{item.title}</span>
                        <span className="text-xs text-warm-500">{item.duration} min</span>
                      </div>
                      {item.presenter ? <p className="text-xs text-warm-500 mt-0.5">Presenter: {item.presenter}</p> : null}
                      {activeAgendaItem === item.id && item.actionItems ? <div className="mt-2 pt-2 border-t border-warm-100">
                          <p className="text-xs text-warm-500 mb-1">Action Items:</p>
                          <ul className="space-y-1">
                            {item.actionItems.map((action, i) => (
                              <li key={i} className="text-sm text-warm-600 flex items-center gap-2">
                                <ChevronRight className="h-3 w-3 text-warm-400" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {meeting.notes ? <div className="mb-6">
              <h3 className="font-medium text-warm-800 flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-warm-500" />
                Meeting Notes
              </h3>
              <p className="text-sm text-warm-600 bg-warm-50 p-3 rounded-lg">{meeting.notes}</p>
            </div> : null}

          {/* Completed meeting resources */}
          {meeting.status === 'completed' && (meeting.recordingUrl || meeting.transcriptUrl) ? <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
              <h3 className="font-medium text-stone-800 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-stone-600" />
                AI-Generated Resources
              </h3>
              <div className="flex items-center gap-4">
                {meeting.recordingUrl ? <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
                    <Video className="h-4 w-4" />
                    View Recording
                  </button> : null}
                {meeting.transcriptUrl ? <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
                    <FileText className="h-4 w-4" />
                    View Transcript
                  </button> : null}
                <button className="flex items-center gap-2 px-3 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50">
                  <ClipboardList className="h-4 w-4" />
                  Action Items Summary
                </button>
              </div>
            </div> : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-warm-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-warm-600 hover:bg-warm-100 rounded-lg text-sm">
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-warm-600 hover:bg-warm-100 rounded-lg text-sm">
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg text-sm hover:bg-stone-800">
              <Send className="h-4 w-4" />
              Send Recap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, onUse }: { template: MeetingTemplate; onUse: () => void }) {
  const type = typeConfig[template.type]

  return (
    <div className="bg-warm-0 border border-warm-200 rounded-lg p-4 hover:border-warm-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className={cn('text-xs px-1.5 py-0.5 rounded', type.bg, type.color)}>
            {type.label}
          </span>
          <h3 className="font-medium text-warm-800 mt-1">{template.name}</h3>
        </div>
        <span className="text-xs text-warm-500">{template.defaultDuration} min</span>
      </div>
      <p className="text-sm text-warm-600 mb-3">{template.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-warm-500">
          {template.defaultAgenda.length} agenda items
        </span>
        <button
          onClick={onUse}
          className="text-sm text-stone-600 hover:text-stone-800 font-medium"
        >
          Use Template
        </button>
      </div>
    </div>
  )
}

export default function MeetingsPreview() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'templates'>('upcoming')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  const upcomingMeetings = mockMeetings.filter(m => m.status === 'scheduled' || m.status === 'in_progress')
  const pastMeetings = mockMeetings.filter(m => m.status === 'completed' || m.status === 'cancelled')

  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 font-display flex items-center gap-2">
              <Calendar className="h-6 w-6 text-stone-600" />
              Meetings
            </h1>
            <p className="text-warm-600 mt-1">Schedule and manage project meetings with AI-powered agendas</p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg text-sm hover:bg-stone-800">
            <Plus className="h-4 w-4" />
            New Meeting
          </button>
        </div>

        {/* Today's Quick View */}
        <div className="bg-gradient-to-r from-stone-700 to-stone-800 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-300 text-sm">Today's Schedule</p>
              <h2 className="text-2xl font-semibold mt-1">
                {upcomingMeetings.filter(m => m.date.toDateString() === new Date().toDateString()).length} meetings
              </h2>
            </div>
            <div className="text-right">
              <p className="text-stone-300 text-sm">Next Meeting</p>
              {upcomingMeetings[0] ? <p className="font-medium mt-1">
                  {upcomingMeetings[0].startTime} - {upcomingMeetings[0].title.substring(0, 25)}...
                </p> : null}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-purple-800 mb-1">Meeting Intelligence</h3>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• OAC Meeting #8 agenda auto-generated from open RFIs and change orders</li>
                <li>• Last week's progress meeting had 3 unresolved action items - added to today's agenda</li>
                <li>• Suggested: Schedule client walkthrough for Smith Residence (50% milestone reached)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-warm-100 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length },
            { key: 'past', label: 'Past', count: pastMeetings.length },
            { key: 'templates', label: 'Templates', count: meetingTemplates.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key
                  ? 'bg-warm-0 text-warm-800 shadow-sm'
                  : 'text-warm-600 hover:text-warm-800'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tab.key ? 'bg-stone-200 text-stone-700' : 'bg-warm-200 text-warm-600'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-2 gap-4">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onSelect={() => setSelectedMeeting(meeting)}
              />
            ))}
            {upcomingMeetings.length === 0 && (
              <div className="col-span-2 bg-warm-0 border border-warm-200 rounded-lg p-8 text-center">
                <Calendar className="h-12 w-12 text-warm-300 mx-auto mb-3" />
                <p className="text-warm-600">No upcoming meetings scheduled</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="grid grid-cols-2 gap-4">
            {pastMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onSelect={() => setSelectedMeeting(meeting)}
              />
            ))}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-2 gap-4">
            {meetingTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => console.log('Use template', template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Meeting Detail Modal */}
      {selectedMeeting ? <MeetingDetail
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        /> : null}
    </div>
  )
}
