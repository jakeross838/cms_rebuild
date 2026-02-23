'use client'

import {
  MessageSquare,
  Mail,
  Phone,
  Mic,
  Smartphone,
  Hash,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  ArrowRight,
  ArrowDown,
  CircleDot,
  User,
  Tag,
  Search,
  Send,
  Shield,
  Zap,
  Globe,
  RefreshCw,
  Activity,
  Target,
  FileText,
  Calendar,
  DollarSign,
  ClipboardCheck,
  Users,
  Download,
  Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ─────────────────────────────────────────────────────────────

interface ChannelStatus {
  id: string
  name: string
  icon: React.ElementType
  status: 'connected' | 'active' | 'ready'
  statusLabel: string
  detail: string
  color: string
  bgColor: string
  borderColor: string
}

interface InboxMessage {
  id: string
  sender: string
  company: string
  channel: 'sms' | 'email-gmail' | 'email-outlook' | 'recording' | 'call' | 'whatsapp'
  channelLabel: string
  channelIcon: React.ElementType
  channelColor: string
  time: string
  subject: string
  preview: string
  jobTag: string
  aiSummary: string
  statusBadge: string
  statusColor: string
  initials: string
  initialsColor: string
}

interface PipelineStep {
  step: number
  label: string
  detail: string
  color: string
  bgColor: string
}

// ── Mock Data ─────────────────────────────────────────────────────────

const channels: ChannelStatus[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    status: 'connected',
    statusLabel: 'Connected',
    detail: 'Synced 2 min ago',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: Mail,
    status: 'connected',
    statusLabel: 'Connected',
    detail: 'Synced 5 min ago',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    icon: Smartphone,
    status: 'active',
    statusLabel: 'Active',
    detail: '3 business numbers',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: MessageSquare,
    status: 'connected',
    statusLabel: 'Connected',
    detail: 'Business API linked',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: Hash,
    status: 'connected',
    statusLabel: 'Connected',
    detail: '2 channels linked',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'voice',
    name: 'Voice / Recording',
    icon: Mic,
    status: 'ready',
    statusLabel: 'Ready',
    detail: 'Mobile app ready',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
]

const inboxMessages: InboxMessage[] = [
  {
    id: '1',
    sender: 'Josh Martinez',
    company: 'ABC Pool Co',
    channel: 'sms',
    channelLabel: 'SMS',
    channelIcon: Smartphone,
    channelColor: 'bg-blue-100 text-blue-700',
    time: '10:42 AM',
    subject: '',
    preview: 'Pool permit accepted and released by county, starting excavation Monday',
    jobTag: 'Henderson Residence',
    aiSummary: 'Schedule updated, owner notified',
    statusBadge: 'Confirmed',
    statusColor: 'bg-emerald-100 text-emerald-700',
    initials: 'JM',
    initialsColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: '2',
    sender: 'Sarah Chen',
    company: 'Homeowner',
    channel: 'email-gmail',
    channelLabel: 'Gmail',
    channelIcon: Mail,
    channelColor: 'bg-red-100 text-red-700',
    time: '10:15 AM',
    subject: 'RE: Tile selection',
    preview: 'Go ahead with the Calacatta marble for the master bath. Budget approved.',
    jobTag: 'Chen Residence',
    aiSummary: 'Selection approved, PO ready',
    statusBadge: 'Pending',
    statusColor: 'bg-amber-100 text-amber-700',
    initials: 'SC',
    initialsColor: 'bg-rose-100 text-rose-700',
  },
  {
    id: '3',
    sender: 'Mike Torres',
    company: 'PM',
    channel: 'recording',
    channelLabel: 'Recording',
    channelIcon: Mic,
    channelColor: 'bg-purple-100 text-purple-700',
    time: '9:30 AM',
    subject: 'On-site meeting with framing crew',
    preview: 'Discussed timeline adjustments, material substitution for header beams, and safety concerns on east wall',
    jobTag: 'Smith Residence',
    aiSummary: '3 action items extracted',
    statusBadge: 'Processed',
    statusColor: 'bg-blue-100 text-blue-700',
    initials: 'MT',
    initialsColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: '4',
    sender: 'Tom',
    company: 'Elite Framers',
    channel: 'call',
    channelLabel: 'Voicemail',
    channelIcon: Phone,
    channelColor: 'bg-stone-100 text-stone-700',
    time: '9:05 AM',
    subject: '',
    preview: 'Running 2 hours late, traffic on I-95. Will be there by 9:30.',
    jobTag: 'Smith Residence',
    aiSummary: 'Schedule note added',
    statusBadge: 'Noted',
    statusColor: 'bg-stone-100 text-stone-700',
    initials: 'TF',
    initialsColor: 'bg-stone-100 text-stone-700',
  },
  {
    id: '5',
    sender: 'Lisa',
    company: 'County Permits',
    channel: 'email-outlook',
    channelLabel: 'Outlook',
    channelIcon: Mail,
    channelColor: 'bg-sky-100 text-sky-700',
    time: '8:45 AM',
    subject: 'Inspection scheduled for Wednesday 2pm',
    preview: 'Your framing inspection for 742 Oceanview Dr has been confirmed for Wednesday Feb 25 at 2:00 PM.',
    jobTag: 'Johnson Beach House',
    aiSummary: 'Calendar updated',
    statusBadge: 'Confirmed',
    statusColor: 'bg-emerald-100 text-emerald-700',
    initials: 'LP',
    initialsColor: 'bg-sky-100 text-sky-700',
  },
  {
    id: '6',
    sender: 'ABC Lumber Supply',
    company: '',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp',
    channelIcon: MessageSquare,
    channelColor: 'bg-green-100 text-green-700',
    time: '8:30 AM',
    subject: '',
    preview: 'Delivery confirmed for 7am tomorrow. 2x4 SPF, 2x6 PT, and LVL beams per PO #2026-0341.',
    jobTag: 'Davis Coastal Home',
    aiSummary: 'Delivery calendar updated',
    statusBadge: 'Confirmed',
    statusColor: 'bg-emerald-100 text-emerald-700',
    initials: 'AL',
    initialsColor: 'bg-green-100 text-green-700',
  },
]

const filterTabs = [
  { label: 'All', count: 142 },
  { label: 'Email', count: 58 },
  { label: 'SMS', count: 34 },
  { label: 'Calls', count: 21 },
  { label: 'Meetings', count: 12 },
  { label: 'On-Site', count: 9 },
  { label: 'Portal', count: 8 },
]

const jobFilters = [
  { label: 'Henderson Residence', count: 28 },
  { label: 'Chen Residence', count: 22 },
  { label: 'Smith Residence', count: 41 },
  { label: 'Davis Coastal Home', count: 19 },
]

const pipelineSteps: PipelineStep[] = [
  {
    step: 1,
    label: 'IDENTIFICATION',
    detail: 'Matched to: Josh Martinez, ABC Pool Co. Job: Henderson Residence (#2026-018). Confidence: 98%',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    step: 2,
    label: 'CLASSIFICATION',
    detail: 'Type: Status Update + Decision. Urgency: Normal. Category: Permit / Schedule.',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  {
    step: 3,
    label: 'EXTRACTION',
    detail: 'Decisions: Pool permit accepted. Dates: Excavation starting Monday 2/24. Action items: Update schedule, notify homeowner, verify insurance.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  {
    step: 4,
    label: 'DOWNSTREAM UPDATES',
    detail: '5 systems updated automatically based on extracted data.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
]

const downstreamUpdates = [
  { icon: Calendar, label: 'Schedule', detail: 'Pool excavation task added to Monday', confirmed: true },
  { icon: Users, label: 'Vendor Record', detail: 'Permit status confirmed for ABC Pool Co', confirmed: true },
  { icon: ClipboardCheck, label: 'Daily Log', detail: 'Auto-entry created for Henderson Residence', confirmed: true },
  { icon: DollarSign, label: 'Budget', detail: 'Pool line item activated ($34,500)', confirmed: true },
  { icon: Globe, label: 'Client Portal', detail: 'Timeline updated, owner notified', confirmed: true },
]

const twoWayChannels = [
  {
    channel: 'Email',
    icon: Mail,
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    description: 'Reply shows as a normal email thread in their inbox',
    detail: 'Gmail / Outlook API',
  },
  {
    channel: 'SMS',
    icon: Smartphone,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    description: 'Reply shows as a text message from your business number',
    detail: 'Twilio API',
  },
  {
    channel: 'Portal',
    icon: Globe,
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    description: 'Reply shows in their client or vendor portal feed',
    detail: 'RossOS Portal',
  },
]

const setupGuides = [
  {
    title: 'Your Team',
    icon: Users,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    steps: [
      'Download the RossOS mobile app',
      'Link email via OAuth (Gmail or Outlook)',
      'Optional: Forward business number via Twilio',
    ],
  },
  {
    title: 'Clients',
    icon: User,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    steps: [
      'Portal invite (preferred channel)',
      'Or: Emails auto-captured via PM linked email',
      'SMS auto-captured via business number',
    ],
  },
  {
    title: 'Vendors / Subs',
    icon: Shield,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    steps: [
      'Portal invite for self-service',
      'Or: Text/email business number',
      'Auto-captured and matched to vendor record',
    ],
  },
]

// ── Component ──────────────────────────────────────────────────────────

export function CommunicationHubPreview(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* ── Section 1: Dark Header ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <MessageSquare className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Universal Communication Hub</h1>
            <p className="text-sm text-slate-300">
              Every message, every channel, every platform — one AI-powered inbox with two-way sync
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Connected Channels', value: '6' },
            { label: 'Messages Today', value: '142' },
            { label: 'AI Extractions', value: '23' },
            { label: 'Job Match Rate', value: '98.4%' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Connected Channels Status Bar ───────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Connected Channels</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Connect Channel
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {channels.map((ch) => {
            const Icon = ch.icon
            return (
              <div
                key={ch.id}
                className={cn(
                  'rounded-lg border p-3 text-center space-y-1.5',
                  ch.bgColor,
                  ch.borderColor
                )}
              >
                <Icon className={cn('h-5 w-5 mx-auto', ch.color)} />
                <div className="text-xs font-medium text-stone-900">{ch.name}</div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                  <CircleDot className="h-2.5 w-2.5" />
                  {ch.statusLabel}
                </span>
                <div className="text-[10px] text-stone-500">{ch.detail}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Universal Inbox ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">Universal Inbox</h2>
            <span className="text-xs text-stone-500">142 messages today</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search messages, people, jobs..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
              readOnly
            />
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar - Filters */}
          <div className="w-48 border-r border-stone-100 p-3 space-y-4 hidden md:block">
            <div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Channels
              </div>
              <div className="space-y-0.5">
                {filterTabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors',
                      i === 0
                        ? 'bg-amber-50 text-amber-700 font-medium'
                        : 'text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] text-stone-400">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                By Job
              </div>
              <div className="space-y-0.5">
                {jobFilters.map((job) => (
                  <button
                    key={job.label}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    <span className="truncate">{job.label}</span>
                    <span className="text-[10px] text-stone-400 ml-1">{job.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 divide-y divide-stone-100">
            {inboxMessages.map((msg) => {
              const ChannelIcon = msg.channelIcon
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold',
                        msg.initialsColor
                      )}
                    >
                      {msg.initials}
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white',
                        msg.channelColor
                      )}
                    >
                      <ChannelIcon className="h-2 w-2" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-stone-900">
                        {msg.sender}
                      </span>
                      {msg.company && (
                        <span className="text-xs text-stone-500">({msg.company})</span>
                      )}
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', msg.channelColor)}>
                        {msg.channelLabel}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-auto flex-shrink-0">
                        {msg.time}
                      </span>
                    </div>
                    {msg.subject && (
                      <div className="text-xs font-medium text-stone-700 mt-0.5">
                        {msg.subject}
                      </div>
                    )}
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                      {msg.preview}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                        <Tag className="h-2.5 w-2.5" />
                        {msg.jobTag}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
                        <Brain className="h-2.5 w-2.5" />
                        {msg.aiSummary}
                      </span>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium',
                          msg.statusColor
                        )}
                      >
                        {msg.statusBadge}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Section 4: AI Extraction Demo ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-stone-900">
            AI Processing Pipeline — Real Example
          </h2>
        </div>

        {/* Source Message */}
        <div className="bg-stone-50 rounded-lg border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-stone-700">Incoming SMS</span>
          </div>
          <p className="text-sm text-stone-800">
            <span className="font-medium">Josh from ABC Pool Co texted:</span>{' '}
            &ldquo;Pool permit accepted and released by county, starting excavation Monday&rdquo;
          </p>
        </div>

        {/* Pipeline Steps */}
        <div className="space-y-3">
          {pipelineSteps.map((step, i) => (
            <div key={step.step}>
              {i > 0 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-stone-300" />
                </div>
              )}
              <div className={cn('rounded-lg border p-3', step.bgColor, 'border-stone-200')}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                      step.step === 1 && 'bg-blue-500',
                      step.step === 2 && 'bg-purple-500',
                      step.step === 3 && 'bg-amber-500',
                      step.step === 4 && 'bg-emerald-500'
                    )}
                  >
                    {step.step}
                  </span>
                  <span className={cn('text-xs font-bold tracking-wide', step.color)}>
                    {step.label}
                  </span>
                </div>
                <p className="text-xs text-stone-600 ml-7">{step.detail}</p>

                {/* Step 4: Show downstream updates */}
                {step.step === 4 && (
                  <div className="ml-7 mt-2 space-y-1.5">
                    {downstreamUpdates.map((update) => {
                      const UpdateIcon = update.icon
                      return (
                        <div
                          key={update.label}
                          className="flex items-center gap-2 text-xs"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          <UpdateIcon className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                          <span className="font-medium text-stone-700">
                            {update.label}:
                          </span>
                          <span className="text-stone-500">{update.detail}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 ml-auto flex-shrink-0">
                            Confirmed
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Two-Way Sync Demo ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Two-Way Sync</h2>
        </div>

        {/* Flow description */}
        <div className="bg-gradient-to-r from-slate-50 to-stone-50 rounded-lg border border-stone-200 p-4">
          <div className="flex items-center gap-2 flex-wrap text-xs text-stone-600">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-stone-200 font-medium text-stone-800">
              <Send className="h-3 w-3" />
              You reply from RossOS
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-stone-200">
              Message routes through channel API
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-stone-200">
              Appears as normal reply in their inbox
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded border border-emerald-200 text-emerald-700 font-medium">
              <CheckCircle className="h-3 w-3" />
              They never know it came from RossOS
            </span>
          </div>
        </div>

        {/* Channel examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {twoWayChannels.map((ch) => {
            const Icon = ch.icon
            return (
              <div
                key={ch.channel}
                className={cn('rounded-lg border p-4 space-y-2', ch.color)}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-5 w-5', ch.iconColor)} />
                  <span className="text-sm font-medium text-stone-900">{ch.channel}</span>
                </div>
                <p className="text-xs text-stone-600">{ch.description}</p>
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Link className="h-3 w-3" />
                  {ch.detail}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 6: On-Site Recording Feature ───────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">On-Site Recording</h2>
        </div>

        <div className="flex flex-col items-center space-y-3">
          {/* Phone mockup */}
          <div className="w-56 bg-slate-900 rounded-2xl p-4 text-white space-y-3">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Recording</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-lg font-mono font-bold">02:34</span>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-slate-400">Participants</div>
              <div className="text-xs">Josh (ABC Pool)</div>
              <div className="text-xs">Mike Torres (PM)</div>
            </div>
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <Mic className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <ArrowDown className="h-5 w-5 text-stone-300" />

          {/* AI Transcription */}
          <div className="w-full max-w-md bg-purple-50 rounded-lg border border-purple-200 p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">AI Transcription</span>
            </div>
            <p className="text-[10px] text-purple-600 mt-1">
              Audio processed via Whisper API in ~30 seconds
            </p>
          </div>

          {/* Arrow */}
          <ArrowDown className="h-5 w-5 text-stone-300" />

          {/* Extracted Items */}
          <div className="w-full max-w-md bg-amber-50 rounded-lg border border-amber-200 p-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Extracted Items</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-amber-700">2</div>
                <div className="text-[10px] text-amber-600">Decisions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-700">1</div>
                <div className="text-[10px] text-amber-600">Date</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-700">3</div>
                <div className="text-[10px] text-amber-600">Action Items</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <ArrowDown className="h-5 w-5 text-stone-300" />

          {/* Confirm Updates */}
          <div className="w-full max-w-md bg-emerald-50 rounded-lg border border-emerald-200 p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Confirm Updates</span>
            </div>
            <button className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
              Confirm All
            </button>
            <p className="text-[10px] text-emerald-600 mt-2">
              Audio &rarr; Whisper API &rarr; 30 second processing &rarr; Full extraction
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 7: Channel Setup Guide ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">Channel Setup Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {setupGuides.map((guide) => {
            const Icon = guide.icon
            return (
              <div
                key={guide.title}
                className={cn(
                  'rounded-lg border p-4 space-y-3',
                  guide.bgColor,
                  guide.borderColor
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-5 w-5', guide.color)} />
                  <span className={cn('text-sm font-semibold', guide.color)}>
                    {guide.title}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-medium text-stone-500 flex-shrink-0 border border-stone-200">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              Nobody changes their behavior. RossOS wraps around their existing tools.
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 8: AI Insights Bar ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Communication Intelligence</span>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          142 messages processed today. 23 decisions extracted. 15 action items created. 3 schedule
          updates confirmed. Average job-match confidence: 98.4%. Communication AI has learned 847
          contact patterns for your company.
        </p>
      </div>

      {/* ── Section 9: AI Features Panel ───────────────────────────── */}
      <AIFeaturesPanel
        title="Communication AI Features"
        columns={2}
        features={[
          {
            feature: 'Job Auto-Tagging',
            insight: 'Automatically matches incoming messages to the correct job based on sender, content, and context.',
            confidence: 98,
            severity: 'success',
          },
          {
            feature: 'Decision Extraction',
            insight: 'Identifies decisions, approvals, and selections from natural language messages across all channels.',
            confidence: 94,
            severity: 'success',
          },
          {
            feature: 'Two-Way Channel Sync',
            insight: '6 channels connected with full two-way sync. Replies route through original channel automatically.',
            severity: 'info',
          },
          {
            feature: 'On-Site Transcription',
            insight: 'Real-time audio transcription via Whisper API with automatic extraction of decisions, dates, and action items.',
            severity: 'info',
          },
          {
            feature: 'Action Item Detection',
            insight: 'Detects action items and follow-ups from conversations, creating tasks and calendar entries automatically.',
            confidence: 91,
            severity: 'success',
          },
          {
            feature: 'Contact Pattern Learning',
            insight: '847 contact patterns learned for your company. Recognition improves with every processed message.',
            severity: 'info',
          },
        ]}
      />
    </div>
  )
}
