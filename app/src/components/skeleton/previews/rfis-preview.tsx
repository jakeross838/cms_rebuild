'use client'

import { useState } from 'react'

import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Sparkles,
  ArrowRight,
  Flag,
  DollarSign,
  FileText,
  MapPin,
  Link2,
  Download,
  Eye,
  Send,
  RotateCcw,
  Hash,
  Bell,
  ArrowUpCircle,
  ThumbsUp,
  HelpCircle,
  TrendingUp,
  Users,
  Search,
  Target,
  BarChart3,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────

type RFIStatus = 'draft' | 'submitted' | 'under_review' | 'response_received' | 'accepted' | 'closed'
type RFIPriority = 'low' | 'standard' | 'urgent' | 'critical'
type ResponseType = 'answer' | 'clarification_request' | 'partial' | 'forward'

interface RFIRouting {
  recipientName: string
  recipientCompany: string
  recipientRole: string
  ballInCourt: boolean
  routedAt: string
  viewedAt?: string
  respondedAt?: string
}

interface RFIResponse {
  responderName: string
  responderCompany: string
  responseType: ResponseType
  responseText: string
  createdAt: string
  attachmentCount: number
}

interface RFI {
  id: string
  number: string
  subject: string
  question: string
  from: {
    name: string
    company: string
  }
  routing: RFIRouting[]
  responses: RFIResponse[]
  dateSubmitted: string
  dueDate: string
  daysOpen: number
  priority: RFIPriority
  status: RFIStatus
  tradeCategory: string
  specReference?: string
  drawingReference?: string
  planMarkup: boolean
  costImpact?: number
  scheduleImpactDays?: number
  changeOrderId?: string
  changeOrderNumber?: string
  linkedScheduleTask?: string
  responseCount: number
  photoCount: number
  aiNote?: string
  aiSuggestedResponse?: string
}

// ── Mock Data ────────────────────────────────────────────────

const mockRFIs: RFI[] = [
  {
    id: '1',
    number: '2026-SMITH-RFI-001',
    subject: 'Foundation reinforcement detail at grid line B-4',
    question: 'Drawing S-102 shows #4 rebar at 12" OC but the soils report recommends additional reinforcement in this area due to soft soil conditions. Please clarify the required reinforcement detail.',
    from: { name: 'Mike Johnson', company: 'Coastal Framing' },
    routing: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Structural Engineer', ballInCourt: true, routedAt: '2026-01-15', viewedAt: '2026-01-16' },
      { recipientName: 'Dan Ross', recipientCompany: 'Ross Custom Homes', recipientRole: 'PM (CC)', ballInCourt: false, routedAt: '2026-01-15', viewedAt: '2026-01-15' },
    ],
    responses: [],
    dateSubmitted: '2026-01-15',
    dueDate: '2026-01-22',
    daysOpen: 28,
    priority: 'urgent',
    status: 'submitted',
    tradeCategory: 'Structural',
    specReference: '03 30 00 - Cast-in-Place Concrete, 3.2.B',
    drawingReference: 'S-102, Detail 4',
    planMarkup: true,
    costImpact: 2400,
    scheduleImpactDays: 3,
    linkedScheduleTask: 'Foundation pour - Phase 2',
    responseCount: 0,
    photoCount: 2,
    aiNote: 'Overdue by 21 days. Escalation triggered. Similar RFIs on past projects took avg 5 days. Schedule impact: delays foundation pour by 3 days if unresolved this week.',
    aiSuggestedResponse: 'Based on similar projects with soft soil conditions, typical resolution involves upgrading to #5 rebar at 8" OC with additional grade beam at B-4.',
  },
  {
    id: '2',
    number: '2026-SMITH-RFI-002',
    subject: 'Exterior paint color clarification - south elevation',
    question: 'The finish schedule references "Oyster White" but does not specify the manufacturer. Client previously mentioned Benjamin Moore. Please confirm manufacturer and sheen for south elevation siding.',
    from: { name: 'Tom Williams', company: 'Premier Painting' },
    routing: [
      { recipientName: 'Lisa Anderson', recipientCompany: 'Owner Rep', recipientRole: 'Owner', ballInCourt: true, routedAt: '2026-01-18', viewedAt: '2026-01-20' },
    ],
    responses: [],
    dateSubmitted: '2026-01-18',
    dueDate: '2026-02-01',
    daysOpen: 25,
    priority: 'low',
    status: 'under_review',
    tradeCategory: 'Finishes',
    specReference: '09 91 00 - Painting, 2.1',
    drawingReference: 'A-301, South Elevation',
    planMarkup: false,
    responseCount: 0,
    photoCount: 0,
  },
  {
    id: '3',
    number: '2026-SMITH-RFI-003',
    subject: 'HVAC ductwork routing conflict with beam at corridor',
    question: 'The 14" main trunk duct shown on M-101 conflicts with the 6x12 beam at corridor grid C-3. The beam is already installed. Need routing resolution: soffit down, reroute, or reduce duct size.',
    from: { name: 'James Garcia', company: 'CoolAir HVAC' },
    routing: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', ballInCourt: false, routedAt: '2026-01-20', viewedAt: '2026-01-20', respondedAt: '2026-01-28' },
      { recipientName: 'Mike Johnson', recipientCompany: 'Coastal Framing', recipientRole: 'Framing Sub (CC)', ballInCourt: false, routedAt: '2026-01-20', viewedAt: '2026-01-21' },
    ],
    responses: [
      { responderName: 'Sarah Chen', responderCompany: 'Smith Architects', responseType: 'answer', responseText: 'Route duct around beam to north side. See attached sketch. Soffit will be required - coordinate with drywall sub for furring dimensions. No change to design intent.', createdAt: '2026-01-28', attachmentCount: 1 },
    ],
    dateSubmitted: '2026-01-20',
    dueDate: '2026-01-27',
    daysOpen: 0,
    priority: 'critical',
    status: 'response_received',
    tradeCategory: 'MEP',
    drawingReference: 'M-101, Section AA',
    planMarkup: true,
    costImpact: 1800,
    scheduleImpactDays: 2,
    linkedScheduleTask: 'HVAC rough-in',
    responseCount: 1,
    photoCount: 3,
    aiNote: 'Response received. Cost impact $1,800 for soffit framing and drywall. Consider creating CO for scope change. Similar conflicts in past projects averaged $2,200.',
  },
  {
    id: '4',
    number: '2026-SMITH-RFI-004',
    subject: 'Window header size confirmation for impact windows',
    question: 'Structural drawings show 2-2x10 headers for all window openings, but the PGT impact window specs require minimum 4x10 solid headers for openings over 6ft. Three openings exceed this. Please confirm header sizing.',
    from: { name: 'Mike Johnson', company: 'Coastal Framing' },
    routing: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Structural Engineer', ballInCourt: false, routedAt: '2026-01-10', viewedAt: '2026-01-10', respondedAt: '2026-01-14' },
    ],
    responses: [
      { responderName: 'Sarah Chen', responderCompany: 'Smith Architects', responseType: 'answer', responseText: 'Upgrade to LVL 3-1/2x9-1/4 headers for openings 1-03, 1-07, and 1-12. See attached structural calc revision.', createdAt: '2026-01-14', attachmentCount: 2 },
    ],
    dateSubmitted: '2026-01-10',
    dueDate: '2026-01-17',
    daysOpen: 0,
    priority: 'urgent',
    status: 'accepted',
    tradeCategory: 'Structural',
    specReference: '06 10 00 - Rough Carpentry, 2.3.A',
    drawingReference: 'S-201, S-202',
    planMarkup: false,
    costImpact: 850,
    scheduleImpactDays: 0,
    changeOrderId: 'co-005',
    changeOrderNumber: 'CO-005',
    responseCount: 1,
    photoCount: 0,
    aiNote: 'Resolved. CO-005 created for LVL header upgrade ($850). No schedule impact.',
  },
  {
    id: '5',
    number: '2026-SMITH-RFI-005',
    subject: 'Tile layout pattern for master bathroom',
    question: 'Finish schedule specifies 24x48 porcelain tile for master bath floor but does not indicate layout direction or pattern. Client prefers herringbone but architect spec shows running bond. Please clarify.',
    from: { name: 'Robert Lee', company: 'Quality Tile Co' },
    routing: [
      { recipientName: 'Lisa Anderson', recipientCompany: 'Owner Rep', recipientRole: 'Owner', ballInCourt: true, routedAt: '2026-01-22', viewedAt: '2026-01-23' },
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect (CC)', ballInCourt: false, routedAt: '2026-01-22', viewedAt: '2026-01-22' },
    ],
    responses: [],
    dateSubmitted: '2026-01-22',
    dueDate: '2026-01-29',
    daysOpen: 21,
    priority: 'standard',
    status: 'under_review',
    tradeCategory: 'Finishes',
    specReference: '09 30 00 - Tiling, 3.4',
    drawingReference: 'A-401, Floor Finish Plan',
    planMarkup: true,
    responseCount: 0,
    photoCount: 1,
    aiNote: 'Overdue by 14 days. Ball in court with owner. Tile lead time is 3 weeks -- decision needed by Feb 5 to avoid schedule delay.',
  },
  {
    id: '6',
    number: '2026-SMITH-RFI-006',
    subject: 'Electrical panel location per code requirements',
    question: 'Current plans show electrical panel in the garage west wall. Inspector flagged that NEC requires 36" clear working space and current location has only 30" to the water heater. Please provide revised location.',
    from: { name: 'David Park', company: 'Sparks Electric' },
    routing: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', ballInCourt: false, routedAt: '2025-12-28', viewedAt: '2025-12-28', respondedAt: '2026-01-03' },
    ],
    responses: [
      { responderName: 'Sarah Chen', responderCompany: 'Smith Architects', responseType: 'answer', responseText: 'Relocate panel to garage north wall per attached revised plan. Maintain minimum 36" clearance. No other trades affected.', createdAt: '2026-01-03', attachmentCount: 1 },
    ],
    dateSubmitted: '2025-12-28',
    dueDate: '2026-01-04',
    daysOpen: 0,
    priority: 'urgent',
    status: 'closed',
    tradeCategory: 'MEP',
    drawingReference: 'E-101, Panel Schedule',
    planMarkup: false,
    costImpact: 0,
    scheduleImpactDays: 0,
    responseCount: 1,
    photoCount: 1,
  },
]

// ── Status & Priority Config ────────────────────────────────

const statusConfig: Record<RFIStatus, { label: string; color: string; dotColor: string }> = {
  draft: { label: 'Draft', color: 'bg-warm-100 text-warm-600', dotColor: 'bg-warm-400' },
  submitted: { label: 'Submitted', color: 'bg-stone-100 text-stone-700', dotColor: 'bg-stone-500' },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
  response_received: { label: 'Response Received', color: 'bg-stone-100 text-stone-700', dotColor: 'bg-stone-500' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  closed: { label: 'Closed', color: 'bg-warm-100 text-warm-600', dotColor: 'bg-warm-400' },
}

const priorityConfig: Record<RFIPriority, { label: string; color: string; bgColor: string; sla: string }> = {
  low: { label: 'Low', color: 'text-warm-500', bgColor: 'bg-warm-100', sla: '14 day SLA' },
  standard: { label: 'Standard', color: 'text-stone-600', bgColor: 'bg-stone-50', sla: '7 day SLA' },
  urgent: { label: 'Urgent', color: 'text-amber-600', bgColor: 'bg-amber-50', sla: '3 day SLA' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50', sla: '24 hour SLA' },
}

// ── Response Type Config ────────────────────────────────────

const responseTypeConfig: Record<ResponseType, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  answer: { label: 'Answer', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  clarification_request: { label: 'Clarification', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: HelpCircle },
  partial: { label: 'Partial', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: RotateCcw },
  forward: { label: 'Forwarded', color: 'text-warm-700', bgColor: 'bg-warm-100', icon: ArrowRight },
}

// ── Sub-Components ──────────────────────────────────────────

function ResponseTypeBadge({ type }: { type: ResponseType }) {
  const config = responseTypeConfig[type]
  const Icon = config.icon

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
      config.bgColor,
      config.color
    )}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  )
}

function SLAEscalationWarning({ rfi }: { rfi: RFI }) {
  const isOpen = ['submitted', 'under_review', 'response_received'].includes(rfi.status)
  if (!isOpen) return null

  const dueDate = new Date(rfi.dueDate)
  const today = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Overdue - SLA breach
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays)
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-300 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
        <span className="text-sm font-medium text-red-700">
          SLA Breach: {overdueDays} day{overdueDays > 1 ? 's' : ''} overdue
        </span>
      </div>
    )
  }

  // Approaching SLA - warning (within 2 days)
  if (diffDays <= 2) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 border border-amber-300 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <span className="text-sm font-medium text-amber-700">
          SLA Warning: Due in {diffDays} day{diffDays !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return null
}

function ResponseWorkflowButtons({ rfi }: { rfi: RFI }) {
  const isOpen = ['submitted', 'under_review'].includes(rfi.status)
  const hasResponse = rfi.status === 'response_received'
  const isOverdue = rfi.daysOpen > 0 && isOpen && new Date(rfi.dueDate) < new Date()

  if (!isOpen && !hasResponse) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isOpen ? <>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-stone-50 text-stone-700 hover:bg-stone-100 rounded-md transition-colors">
            <Bell className="h-3 w-3" />
            Send Reminder
          </button>
          {isOverdue ? <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors">
              <ArrowUpCircle className="h-3 w-3" />
              Escalate
            </button> : null}
        </> : null}
      {hasResponse ? <>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors">
            <ThumbsUp className="h-3 w-3" />
            Accept Answer
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors">
            <HelpCircle className="h-3 w-3" />
            Request Clarification
          </button>
        </> : null}
    </div>
  )
}

function BallInCourtBadge({ routing }: { routing: RFIRouting[] }) {
  const current = routing.find(r => r.ballInCourt)
  if (!current) return null

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Eye className="h-3 w-3 text-stone-600" />
      <span className="text-warm-700 font-medium">Ball: {current.recipientName}</span>
      <span className="text-stone-600">({current.recipientRole})</span>
    </div>
  )
}

function ImpactBadges({ rfi }: { rfi: RFI }) {
  if (!rfi.costImpact && !rfi.scheduleImpactDays && !rfi.changeOrderNumber) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {rfi.costImpact !== undefined && rfi.costImpact > 0 && (
        <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-700 rounded flex items-center gap-0.5">
          <DollarSign className="h-3 w-3" />
          ${rfi.costImpact.toLocaleString()}
        </span>
      )}
      {rfi.costImpact === 0 && rfi.status === 'closed' && (
        <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded flex items-center gap-0.5">
          <DollarSign className="h-3 w-3" />
          No cost impact
        </span>
      )}
      {rfi.scheduleImpactDays !== undefined && rfi.scheduleImpactDays > 0 && (
        <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded flex items-center gap-0.5">
          <Clock className="h-3 w-3" />
          +{rfi.scheduleImpactDays}d schedule
        </span>
      )}
      {rfi.changeOrderNumber ? <span className="text-xs px-1.5 py-0.5 bg-warm-50 text-warm-700 rounded flex items-center gap-0.5">
          <Link2 className="h-3 w-3" />
          {rfi.changeOrderNumber}
        </span> : null}
      {rfi.linkedScheduleTask ? <span className="text-xs px-1.5 py-0.5 bg-stone-50 text-stone-700 rounded flex items-center gap-0.5">
          <Calendar className="h-3 w-3" />
          {rfi.linkedScheduleTask}
        </span> : null}
    </div>
  )
}

function SlowResponderAnalytics() {
  // Mock slow responder data
  const responderStats = [
    { role: 'Architect', avgDays: 4.2, isAboveAverage: false },
    { role: 'Engineer', avgDays: 6.1, isAboveAverage: true },
    { role: 'Owner', avgDays: 8.3, isAboveAverage: true },
  ]

  const projectAverage = 5.2

  return (
    <div className="bg-sand-50 rounded-lg p-3 border border-sand-200">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-sand-600" />
        <span className="text-sm font-medium text-orange-800">Slowest Responders</span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {responderStats.map((stat) => (
          <div
            key={stat.role}
            className={cn(
              "flex items-center gap-1",
              stat.isAboveAverage ? "text-sand-700 font-medium" : "text-sand-600"
            )}
          >
            <Users className="h-3 w-3" />
            <span>{stat.role} avg:</span>
            <span className={cn(
              "font-semibold",
              stat.isAboveAverage && "text-red-600"
            )}>
              {stat.avgDays} days
            </span>
            {stat.isAboveAverage ? <span className="text-red-500 text-[10px]">(above avg)</span> : null}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-sand-600">
        Project average: {projectAverage} days
      </div>
    </div>
  )
}

function RFICard({ rfi }: { rfi: RFI }) {
  const status = statusConfig[rfi.status]
  const priority = priorityConfig[rfi.priority]
  const isOpen = ['submitted', 'under_review', 'response_received'].includes(rfi.status)
  const isOverdue = rfi.daysOpen > 0 && isOpen && new Date(rfi.dueDate) < new Date()

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer",
      isOverdue ? "border-red-200" : "border-warm-200"
    )}>
      {/* SLA Escalation Warning - Prominent Position */}
      <SLAEscalationWarning rfi={rfi} />
      {(isOverdue || (isOpen && Math.ceil((new Date(rfi.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 2)) ? <div className="mb-3" /> : null}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            priority.bgColor
          )}>
            <MessageSquare className={cn("h-4 w-4", priority.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-warm-500">{rfi.number}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.color)}>
                {status.label}
              </span>
              <span className={cn("text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5", priority.bgColor, priority.color)}>
                <Flag className="h-3 w-3" />
                {priority.label}
              </span>
              {rfi.responses.length > 0 && rfi.responses.map((resp, idx) => (
                <ResponseTypeBadge key={idx} type={resp.responseType} />
              ))}
            </div>
            <h4 className="font-medium text-warm-900 mt-1 line-clamp-2">{rfi.subject}</h4>
          </div>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded flex-shrink-0">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Routing info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-warm-400" />
          <div className="truncate">
            <span className="text-warm-500">From: </span>
            <span className="text-warm-700">{rfi.from.name}</span>
            <span className="text-warm-400 text-xs ml-1">({rfi.from.company})</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ArrowRight className="h-3.5 w-3.5 text-warm-400" />
          <div className="truncate">
            <span className="text-warm-500">To: </span>
            <span className="text-warm-700">{rfi.routing[0]?.recipientName}</span>
            <span className="text-warm-400 text-xs ml-1">({rfi.routing[0]?.recipientRole})</span>
          </div>
        </div>
      </div>

      {/* References */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {rfi.drawingReference ? <span className="text-xs text-stone-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {rfi.drawingReference}
          </span> : null}
        {rfi.specReference ? <span className="text-xs text-stone-600 flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {rfi.specReference}
          </span> : null}
        {rfi.planMarkup ? <span className="text-xs text-stone-600 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Plan markup
          </span> : null}
        {rfi.photoCount > 0 && (
          <span className="text-xs text-warm-500">
            {rfi.photoCount} photo{rfi.photoCount > 1 ? 's' : ''}
          </span>
        )}
        {rfi.tradeCategory ? <span className="text-xs px-2 py-0.5 bg-warm-100 text-warm-600 rounded">
            {rfi.tradeCategory}
          </span> : null}
      </div>

      {/* Ball in court + Impact badges */}
      <div className="space-y-2 mb-3">
        {isOpen ? <BallInCourtBadge routing={rfi.routing} /> : null}
        <ImpactBadges rfi={rfi} />
      </div>

      {/* Response thread preview with Response Type Badge */}
      {rfi.responses.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 rounded-md border border-green-100">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Response from {rfi.responses[0].responderName}
            </span>
            <ResponseTypeBadge type={rfi.responses[0].responseType} />
            <span className="text-xs text-green-500 ml-auto">{rfi.responses[0].createdAt}</span>
          </div>
          <p className="text-xs text-green-700 line-clamp-2">{rfi.responses[0].responseText}</p>
          {rfi.responses[0].attachmentCount > 0 && (
            <span className="text-[10px] text-green-600 mt-1 inline-block">
              {rfi.responses[0].attachmentCount} attachment{rfi.responses[0].attachmentCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Response Workflow Buttons */}
      <div className="mb-3">
        <ResponseWorkflowButtons rfi={rfi} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-warm-100">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-warm-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{rfi.dateSubmitted}</span>
          </div>
          {isOpen ? <div className={cn(
              "flex items-center gap-1.5",
              isOverdue ? "text-red-600" : "text-warm-500"
            )}>
              <Clock className="h-3.5 w-3.5" />
              <span>{rfi.daysOpen}d open</span>
              {isOverdue ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
            </div> : null}
          {rfi.status === 'closed' && (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Closed</span>
            </div>
          )}
        </div>
        <div className="text-xs text-warm-400">
          Due: {rfi.dueDate}
        </div>
      </div>

      {rfi.aiNote ? <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{rfi.aiNote}</span>
        </div> : null}

      {rfi.aiSuggestedResponse && isOpen ? <div className="mt-2 p-2 bg-warm-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-stone-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-medium text-warm-700">AI-Suggested Response: </span>
            <span className="text-xs text-stone-600">{rfi.aiSuggestedResponse}</span>
          </div>
        </div> : null}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────

export function RFIsPreview() {
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [tradeFilter, setTradeFilter] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const trades = [...new Set(mockRFIs.map(r => r.tradeCategory))]

  const filteredRFIs = sortItems(
    mockRFIs.filter(rfi => {
      if (!matchesSearch(rfi, search, ['number', 'subject', 'tradeCategory'])) return false
      if (activeTab !== 'all' && rfi.status !== activeTab) return false
      if (priorityFilter !== 'all' && rfi.priority !== priorityFilter) return false
      if (tradeFilter !== 'all' && rfi.tradeCategory !== tradeFilter) return false
      return true
    }),
    activeSort as keyof RFI | '',
    sortDirection,
  )

  // Calculate stats
  const openRFIs = mockRFIs.filter(r => ['submitted', 'under_review', 'response_received'].includes(r.status)).length
  const overdueRFIs = mockRFIs.filter(r =>
    r.daysOpen > 0 && ['submitted', 'under_review'].includes(r.status) && new Date(r.dueDate) < new Date()
  ).length
  const avgResponseTime = Math.round(
    mockRFIs
      .filter(r => r.responses.length > 0)
      .reduce((sum, r) => {
        const submitted = new Date(r.dateSubmitted).getTime()
        const responded = new Date(r.responses[0].createdAt).getTime()
        return sum + (responded - submitted) / (1000 * 60 * 60 * 24)
      }, 0) /
    Math.max(mockRFIs.filter(r => r.responses.length > 0).length, 1)
  )
  const closedCount = mockRFIs.filter(r => r.status === 'closed' || r.status === 'accepted').length
  const totalCostImpact = mockRFIs
    .filter(r => r.costImpact && r.costImpact > 0)
    .reduce((sum, r) => sum + (r.costImpact || 0), 0)
  const totalScheduleImpact = mockRFIs
    .filter(r => r.scheduleImpactDays && r.scheduleImpactDays > 0)
    .reduce((sum, r) => sum + (r.scheduleImpactDays || 0), 0)

  // AI Features for AIFeaturesPanel
  const aiFeatures = [
    {
      feature: 'Similar RFI Search',
      trigger: 'On creation',
      insight: 'Found 3 similar RFIs from past projects. RFI-047 (Johnson) has approved answer that may apply.',
      severity: 'info' as const,
      icon: <Search className="h-4 w-4" />,
      action: {
        label: 'View Similar RFIs',
        onClick: () => {},
      },
    },
    {
      feature: 'Impact Assessment',
      trigger: 'Real-time',
      insight: 'This RFI affects framing schedule. 2-day delay if not resolved by Feb 15.',
      severity: 'warning' as const,
      icon: <Target className="h-4 w-4" />,
      confidence: 87,
    },
    {
      feature: 'SLA Intelligence',
      trigger: 'Daily',
      insight: 'Architect typically responds in 3-4 days. Current wait: 6 days. Recommend: Escalate to principal.',
      severity: 'critical' as const,
      icon: <Clock className="h-4 w-4" />,
      action: {
        label: 'Escalate Now',
        onClick: () => {},
      },
    },
    {
      feature: 'Ball-in-Court Analysis',
      trigger: 'Real-time',
      insight: 'RFI pending with architect for 5 days. Pattern: This architect averages 4 days, currently 25% slower than usual.',
      severity: 'warning' as const,
      icon: <BarChart3 className="h-4 w-4" />,
      confidence: 92,
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">RFIs - Smith Residence</h3>
          <span className="text-sm text-warm-500">{mockRFIs.length} total</span>
          {overdueRFIs > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {overdueRFIs} overdue
            </span>
          )}
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search RFIs..."
          tabs={[
            { key: 'all', label: 'All', count: mockRFIs.length },
            { key: 'submitted', label: 'Submitted', count: mockRFIs.filter(r => r.status === 'submitted').length },
            { key: 'under_review', label: 'Under Review', count: mockRFIs.filter(r => r.status === 'under_review').length },
            { key: 'response_received', label: 'Responded', count: mockRFIs.filter(r => r.status === 'response_received').length },
            { key: 'accepted', label: 'Accepted', count: mockRFIs.filter(r => r.status === 'accepted').length },
            { key: 'closed', label: 'Closed', count: mockRFIs.filter(r => r.status === 'closed').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Priorities',
              value: priorityFilter,
              options: [
                { value: 'critical', label: 'Critical' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'standard', label: 'Standard' },
                { value: 'low', label: 'Low' },
              ],
              onChange: setPriorityFilter,
            },
            {
              label: 'All Trades',
              value: tradeFilter,
              options: trades.map(t => ({ value: t, label: t })),
              onChange: setTradeFilter,
            },
          ]}
          sortOptions={[
            { value: 'number', label: 'RFI Number' },
            { value: 'dateSubmitted', label: 'Date Submitted' },
            { value: 'daysOpen', label: 'Days Open' },
            { value: 'priority', label: 'Priority' },
            { value: 'dueDate', label: 'Due Date' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export Log', onClick: () => {} },
            { icon: Plus, label: 'New RFI', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredRFIs.length}
          totalCount={mockRFIs.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-stone-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-stone-600 text-sm">
              <MessageSquare className="h-4 w-4" />
              Open RFIs
            </div>
            <div className="text-2xl font-bold text-stone-700 mt-1">{openRFIs}</div>
          </div>
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-600 text-sm">
              <Clock className="h-4 w-4" />
              Avg Response
            </div>
            <div className="text-2xl font-bold text-warm-900 mt-1">{avgResponseTime}d</div>
          </div>
          <div className={cn("rounded-lg p-3", overdueRFIs > 0 ? "bg-red-50" : "bg-green-50")}>
            <div className={cn("flex items-center gap-2 text-sm", overdueRFIs > 0 ? "text-red-600" : "text-green-600")}>
              <AlertTriangle className="h-4 w-4" />
              Overdue
            </div>
            <div className={cn("text-2xl font-bold mt-1", overdueRFIs > 0 ? "text-red-700" : "text-green-700")}>
              {overdueRFIs}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Resolved
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{closedCount}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Cost Impact
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">${(totalCostImpact / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <Calendar className="h-4 w-4" />
              Schedule Impact
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">+{totalScheduleImpact}d</div>
          </div>
        </div>

        {/* Slow Responder Analytics */}
        <div className="mt-4">
          <SlowResponderAnalytics />
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="RFI Intelligence"
          features={aiFeatures}
          columns={2}
        />
      </div>

      {/* RFI List */}
      <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
        {filteredRFIs.length > 0 ? (
          filteredRFIs.map(rfi => (
            <RFICard key={rfi.id} rfi={rfi} />
          ))
        ) : (
          <div className="text-center py-8 text-warm-400">
            No RFIs match the selected filters
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <div className="flex flex-col gap-1 text-sm text-amber-700">
            <span>RFI-001 (foundation reinforcement) is 21 days overdue and blocking critical path work. Escalation sent to builder principal. AI-suggested response available based on similar projects.</span>
            <span>Cumulative RFI impact: ${(totalCostImpact / 1000).toFixed(1)}K in cost and +{totalScheduleImpact} days. 2 RFIs resulted in change orders.</span>
            <span>This project has 67% more structural RFIs than similar projects -- possible design quality issue with foundation details.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
