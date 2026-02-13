'use client'

import { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Sparkles,
  Building2,
  Users,
  User,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Printer,
  ChevronRight,
  MessageSquare,
  Camera,
  Eye,
  EyeOff,
  FileText,
  Activity,
  Target,
  Link2,
  ArrowRight,
  BarChart3,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ── Types ───────────────────────────────────────────────────────────────

interface SafetyMetric {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  status: 'success' | 'warning' | 'danger' | 'neutral'
  icon: React.ElementType
}

interface ToolboxTalk {
  id: string
  topic: string
  job: string
  scheduledDate: string
  scheduledTime: string
  conductedBy: string
  durationMinutes: number
  requiredAttendees: number
  actualAttendees?: number
  status: 'upcoming' | 'in-progress' | 'completed'
  hasSignInSheet: boolean
}

interface SafetyObservation {
  id: string
  observationType: 'positive' | 'hazard'
  category: 'fall_protection' | 'electrical' | 'excavation' | 'scaffolding' | 'ppe' | 'housekeeping' | 'fire_protection' | 'confined_space'
  severity: 'informational' | 'minor_hazard' | 'serious_hazard' | 'imminent_danger'
  description: string
  correctiveAction?: string
  job: string
  observedBy: string
  vendorName?: string
  date: string
  hasPhotos: boolean
  photoCount: number
  isAnonymous: boolean
}

interface SafetyIncident {
  id: string
  type: 'injury' | 'near_miss' | 'property_damage'
  description: string
  job: string
  reportedBy: string
  date: string
  time: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'investigating' | 'root_cause' | 'corrective_action' | 'closed'
  investigationStatus: 'pending' | 'in_progress' | 'complete'
  oshaClassification?: 'first_aid' | 'recordable' | 'lost_time' | 'fatality'
  oshaReportable: boolean
  oshaDeadlineHours?: number
  correctiveAction?: string
  rootCause?: string
  vendorName?: string
  employeeName?: string
  witnessCount: number
  hasPhotos: boolean
  daysAway?: number
  daysRestricted?: number
  drugTestRequired: boolean
  returnToWorkDate?: string
}

interface SafetyInspection {
  id: string
  type: string
  job: string
  inspector: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'issues-found'
  issueCount?: number
  checklistItems?: number
  completedItems?: number
}

interface SafetyScore {
  projectName: string
  observationScore: number
  incidentScore: number
  trainingScore: number
  certificationScore: number
  compositeScore: number
  trend: 'up' | 'down' | 'stable'
}

interface TrainingGap {
  employee: string
  training: string
  job: string
  dueDate: string
  isAutoBlocked: boolean
}

interface VendorSafetyStatus {
  vendorName: string
  emrRating: number
  incidentCount: number
  certificationStatus: 'compliant' | 'expiring' | 'non_compliant'
  lastIncidentDate?: string
  activeProjects: number
}

// ── Mock Data ───────────────────────────────────────────────────────────

const safetyMetrics: SafetyMetric[] = [
  {
    label: 'Days Without Incident',
    value: '127',
    change: 'Record!',
    status: 'success',
    icon: Shield,
  },
  {
    label: 'TRIR (12-mo)',
    value: '1.8',
    change: 'Below industry avg 3.0',
    trend: 'down',
    status: 'success',
    icon: Activity,
  },
  {
    label: 'DART Rate',
    value: '0.9',
    change: '-0.3 vs LY',
    trend: 'down',
    status: 'success',
    icon: Target,
  },
  {
    label: 'Near Misses This Month',
    value: '5',
    change: '+2 under review',
    trend: 'up',
    status: 'warning',
    icon: AlertCircle,
  },
  {
    label: 'EMR',
    value: '0.82',
    change: 'Favorable',
    status: 'success',
    icon: BarChart3,
  },
  {
    label: 'Training Compliance',
    value: '94%',
    change: '3 gaps',
    status: 'warning',
    icon: Users,
  },
]

const upcomingToolboxTalks: ToolboxTalk[] = [
  {
    id: '1',
    topic: 'Fall Protection & Guardrail Systems',
    job: 'Smith Residence',
    scheduledDate: 'Tomorrow',
    scheduledTime: '7:00 AM',
    conductedBy: 'Mike Smith',
    durationMinutes: 30,
    requiredAttendees: 8,
    status: 'upcoming',
    hasSignInSheet: true,
  },
  {
    id: '2',
    topic: 'Electrical Safety & Lockout/Tagout',
    job: 'Johnson Beach House',
    scheduledDate: 'Feb 14',
    scheduledTime: '7:00 AM',
    conductedBy: 'Tom Wilson',
    durationMinutes: 30,
    requiredAttendees: 6,
    status: 'upcoming',
    hasSignInSheet: true,
  },
  {
    id: '3',
    topic: 'Heat Illness Prevention',
    job: 'All Sites',
    scheduledDate: 'Feb 17',
    scheduledTime: '7:00 AM',
    conductedBy: 'Sarah Johnson',
    durationMinutes: 45,
    requiredAttendees: 15,
    status: 'upcoming',
    hasSignInSheet: false,
  },
  {
    id: '4',
    topic: 'Scaffold Safety & Inspection',
    job: 'Harbor View Custom Home',
    scheduledDate: 'Feb 10',
    scheduledTime: '7:00 AM',
    conductedBy: 'Mike Smith',
    durationMinutes: 30,
    requiredAttendees: 10,
    actualAttendees: 10,
    status: 'completed',
    hasSignInSheet: true,
  },
]

const safetyObservations: SafetyObservation[] = [
  {
    id: '1',
    observationType: 'hazard',
    category: 'fall_protection',
    severity: 'serious_hazard',
    description: 'Missing guardrail on 2nd floor east wall opening',
    correctiveAction: 'Temporary barricade installed immediately. Permanent guardrail ordered.',
    job: 'Smith Residence',
    observedBy: 'Mike Smith',
    vendorName: 'ABC Framing',
    date: 'Feb 10',
    hasPhotos: true,
    photoCount: 3,
    isAnonymous: false,
  },
  {
    id: '2',
    observationType: 'positive',
    category: 'ppe',
    severity: 'informational',
    description: 'Entire crew wearing proper PPE including safety glasses and hard hats in active demo area',
    job: 'Johnson Beach House',
    observedBy: 'Tom Wilson',
    date: 'Feb 9',
    hasPhotos: true,
    photoCount: 1,
    isAnonymous: false,
  },
  {
    id: '3',
    observationType: 'hazard',
    category: 'housekeeping',
    severity: 'minor_hazard',
    description: 'Debris and materials blocking emergency exit path in garage',
    correctiveAction: 'Area cleared within 30 minutes of observation',
    job: 'Miller Addition',
    observedBy: 'Anonymous',
    date: 'Feb 8',
    hasPhotos: true,
    photoCount: 2,
    isAnonymous: true,
  },
  {
    id: '4',
    observationType: 'hazard',
    category: 'electrical',
    severity: 'imminent_danger',
    description: 'Exposed live wiring in unfinished bathroom. No warning signs posted.',
    correctiveAction: 'Power isolated to circuit immediately. Electrician recalled to secure wiring. Incident report filed.',
    job: 'Harbor View Custom Home',
    observedBy: 'Carlos Mendez',
    vendorName: 'Coastal Electric',
    date: 'Feb 7',
    hasPhotos: true,
    photoCount: 4,
    isAnonymous: false,
  },
  {
    id: '5',
    observationType: 'positive',
    category: 'housekeeping',
    severity: 'informational',
    description: 'Site left very clean at end of day - all materials stored, walkways clear',
    job: 'Smith Residence',
    observedBy: 'Jake Ross',
    vendorName: 'Premium Drywall',
    date: 'Feb 6',
    hasPhotos: false,
    photoCount: 0,
    isAnonymous: false,
  },
]

const recentIncidents: SafetyIncident[] = [
  {
    id: '1',
    type: 'near_miss',
    description: 'Unsecured ladder nearly fell when worker climbed. No safety tie-off at top.',
    job: 'Smith Residence',
    reportedBy: 'Mike Smith',
    date: 'Jan 25',
    time: '10:15 AM',
    location: 'Main stairwell, 2nd floor',
    severity: 'medium',
    status: 'corrective_action',
    investigationStatus: 'complete',
    oshaReportable: false,
    correctiveAction: 'Ladder securing protocol added to daily checklist. All ladders must be tied off.',
    rootCause: 'No standard operating procedure for ladder placement on stairwell landings',
    vendorName: 'ABC Framing',
    witnessCount: 2,
    hasPhotos: true,
    drugTestRequired: false,
  },
  {
    id: '2',
    type: 'near_miss',
    description: 'Material stack shifted during 25mph wind gusts. Plywood sheets slid off pile.',
    job: 'Johnson Beach House',
    reportedBy: 'Tom Wilson',
    date: 'Jan 22',
    time: '2:30 PM',
    location: 'Exterior staging area',
    severity: 'low',
    status: 'closed',
    investigationStatus: 'complete',
    oshaReportable: false,
    correctiveAction: 'Max stack height reduced. Wind speed monitoring protocol established.',
    rootCause: 'Materials stacked above recommended height without wind considerations',
    witnessCount: 1,
    hasPhotos: true,
    drugTestRequired: false,
  },
  {
    id: '3',
    type: 'injury',
    description: 'Worker struck hand with hammer resulting in bruised knuckle. First aid administered on site.',
    job: 'Miller Addition',
    reportedBy: 'Sarah Johnson',
    date: 'Jan 18',
    time: '11:45 AM',
    location: 'Kitchen rough-in area',
    severity: 'low',
    status: 'closed',
    investigationStatus: 'complete',
    oshaClassification: 'first_aid',
    oshaReportable: false,
    correctiveAction: 'First aid kit restocked. Worker cleared to continue.',
    employeeName: 'David Nguyen',
    witnessCount: 1,
    hasPhotos: false,
    drugTestRequired: false,
  },
  {
    id: '4',
    type: 'property_damage',
    description: 'Excavator struck underground utility line during grading. Water line ruptured.',
    job: 'Harbor View Custom Home',
    reportedBy: 'Carlos Mendez',
    date: 'Jan 10',
    time: '9:00 AM',
    location: 'East side yard',
    severity: 'high',
    status: 'closed',
    investigationStatus: 'complete',
    oshaReportable: false,
    correctiveAction: 'Utility locate required before all excavation. Pre-dig checklist updated.',
    rootCause: 'Utility locate markings were faded and not refreshed before work began',
    vendorName: 'Coastal Excavation',
    witnessCount: 3,
    hasPhotos: true,
    drugTestRequired: false,
  },
  {
    id: '5',
    type: 'injury',
    description: 'Worker fell from scaffold (4 ft height) and sustained sprained ankle. Transported to urgent care.',
    job: 'Smith Residence',
    reportedBy: 'Mike Smith',
    date: 'Dec 15',
    time: '1:30 PM',
    location: 'Exterior south wall',
    severity: 'high',
    status: 'closed',
    investigationStatus: 'complete',
    oshaClassification: 'recordable',
    oshaReportable: true,
    correctiveAction: 'Scaffold inspection protocol reinforced. Daily scaffold checklist required.',
    rootCause: 'Scaffold plank not properly secured. Missing mid-rail on south side.',
    vendorName: 'ABC Framing',
    employeeName: 'Roberto Sanchez',
    witnessCount: 2,
    hasPhotos: true,
    daysAway: 5,
    daysRestricted: 10,
    drugTestRequired: true,
    returnToWorkDate: 'Jan 2',
  },
]

const safetyInspections: SafetyInspection[] = [
  {
    id: '1',
    type: 'Site Safety Inspection',
    job: 'Johnson Beach House',
    inspector: 'Mike Smith',
    scheduledDate: 'Wed',
    scheduledTime: '9:00 AM',
    status: 'scheduled',
    checklistItems: 32,
  },
  {
    id: '2',
    type: 'Fall Protection Audit',
    job: 'Smith Residence',
    inspector: 'Tom Wilson',
    scheduledDate: 'Thu',
    scheduledTime: '10:00 AM',
    status: 'scheduled',
    checklistItems: 18,
  },
  {
    id: '3',
    type: 'Fire Extinguisher Check',
    job: 'All Sites',
    inspector: 'Sarah Johnson',
    scheduledDate: 'Fri',
    scheduledTime: '2:00 PM',
    status: 'scheduled',
    checklistItems: 8,
  },
  {
    id: '4',
    type: 'Confined Space Assessment',
    job: 'Harbor View Custom Home',
    inspector: 'Carlos Mendez',
    scheduledDate: 'Mon (Completed)',
    scheduledTime: '8:00 AM',
    status: 'completed',
    checklistItems: 15,
    completedItems: 15,
  },
  {
    id: '5',
    type: 'OSHA Readiness Review',
    job: 'Smith Residence',
    inspector: 'Jake Ross',
    scheduledDate: 'Last Fri',
    scheduledTime: '1:00 PM',
    status: 'issues-found',
    checklistItems: 45,
    completedItems: 42,
    issueCount: 3,
  },
]

const trainingGaps: TrainingGap[] = [
  { employee: 'David Nguyen', training: 'OSHA 10-Hour', job: 'Smith Residence', dueDate: 'Before start', isAutoBlocked: true },
  { employee: 'Roberto Sanchez', training: 'OSHA 10-Hour', job: 'Smith Residence', dueDate: 'Before start', isAutoBlocked: true },
  { employee: 'Tom Wilson', training: 'Fall Protection Refresher', job: 'All Sites', dueDate: 'Feb 28', isAutoBlocked: false },
  { employee: 'Carlos Mendez', training: 'Confined Space Entry', job: 'Harbor View Custom Home', dueDate: 'Mar 15', isAutoBlocked: false },
  { employee: 'Lisa Martinez', training: 'First Aid/CPR Renewal', job: 'All Sites', dueDate: 'Apr 1', isAutoBlocked: false },
]

const safetyScores: SafetyScore[] = [
  { projectName: 'Smith Residence', observationScore: 85, incidentScore: 70, trainingScore: 92, certificationScore: 88, compositeScore: 84, trend: 'up' },
  { projectName: 'Johnson Beach House', observationScore: 92, incidentScore: 95, trainingScore: 88, certificationScore: 100, compositeScore: 94, trend: 'stable' },
  { projectName: 'Harbor View Custom Home', observationScore: 78, incidentScore: 85, trainingScore: 80, certificationScore: 75, compositeScore: 80, trend: 'down' },
  { projectName: 'Miller Addition', observationScore: 90, incidentScore: 100, trainingScore: 95, certificationScore: 100, compositeScore: 96, trend: 'up' },
]

const vendorSafetyStatuses: VendorSafetyStatus[] = [
  { vendorName: 'ABC Framing', emrRating: 1.15, incidentCount: 2, certificationStatus: 'expiring', lastIncidentDate: 'Jan 25', activeProjects: 2 },
  { vendorName: 'Coastal Electric', emrRating: 0.85, incidentCount: 1, certificationStatus: 'compliant', lastIncidentDate: 'Feb 7', activeProjects: 3 },
  { vendorName: 'Premium Drywall', emrRating: 0.72, incidentCount: 0, certificationStatus: 'compliant', activeProjects: 2 },
  { vendorName: 'Coastal Excavation', emrRating: 1.25, incidentCount: 1, certificationStatus: 'non_compliant', lastIncidentDate: 'Jan 10', activeProjects: 1 },
]

// ── Category/Severity Helpers ───────────────────────────────────────────

const categoryLabels: Record<SafetyObservation['category'], string> = {
  fall_protection: 'Fall Protection',
  electrical: 'Electrical',
  excavation: 'Excavation',
  scaffolding: 'Scaffolding',
  ppe: 'PPE',
  housekeeping: 'Housekeeping',
  fire_protection: 'Fire Protection',
  confined_space: 'Confined Space',
}

const severityLabels: Record<SafetyObservation['severity'], string> = {
  informational: 'Informational',
  minor_hazard: 'Minor Hazard',
  serious_hazard: 'Serious Hazard',
  imminent_danger: 'Imminent Danger',
}

const severityColors: Record<SafetyObservation['severity'], string> = {
  informational: 'bg-blue-100 text-blue-700',
  minor_hazard: 'bg-amber-100 text-amber-700',
  serious_hazard: 'bg-orange-100 text-orange-700',
  imminent_danger: 'bg-red-100 text-red-700',
}

const incidentStatusLabels: Record<SafetyIncident['status'], string> = {
  reported: 'Reported',
  investigating: 'Investigating',
  root_cause: 'Root Cause Analysis',
  corrective_action: 'Corrective Action',
  closed: 'Closed',
}

const incidentStatusColors: Record<SafetyIncident['status'], string> = {
  reported: 'bg-red-100 text-red-700',
  investigating: 'bg-amber-100 text-amber-700',
  root_cause: 'bg-purple-100 text-purple-700',
  corrective_action: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
}

// ── Sub-components ──────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: SafetyMetric }) {
  const Icon = metric.icon

  return (
    <div className={cn(
      "rounded-lg p-4",
      metric.status === 'success' ? "bg-green-50" :
      metric.status === 'warning' ? "bg-amber-50" :
      metric.status === 'danger' ? "bg-red-50" :
      "bg-gray-50"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          metric.status === 'success' ? "bg-green-100" :
          metric.status === 'warning' ? "bg-amber-100" :
          metric.status === 'danger' ? "bg-red-100" :
          "bg-gray-100"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            metric.status === 'success' ? "text-green-600" :
            metric.status === 'warning' ? "text-amber-600" :
            metric.status === 'danger' ? "text-red-600" :
            "text-gray-600"
          )} />
        </div>
        {metric.change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            metric.trend === 'down' ? "text-green-600" :
            metric.trend === 'up' && metric.status === 'warning' ? "text-amber-600" :
            "text-gray-600"
          )}>
            {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {metric.change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
      <div className="text-sm text-gray-500">{metric.label}</div>
    </div>
  )
}

function ToolboxTalkCard({ talk }: { talk: ToolboxTalk }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors",
      talk.status === 'completed' && "bg-gray-50"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            talk.status === 'completed' ? "bg-green-100" : "bg-blue-100"
          )}>
            <MessageSquare className={cn(
              "h-4 w-4",
              talk.status === 'completed' ? "text-green-600" : "text-blue-600"
            )} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{talk.topic}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {talk.job}
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {talk.scheduledDate} {talk.scheduledTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {talk.status === 'completed'
              ? `${talk.actualAttendees}/${talk.requiredAttendees} attended`
              : `${talk.requiredAttendees} required`
            }
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {talk.durationMinutes}min
          </span>
        </div>
        <div className="flex items-center gap-1">
          {talk.status === 'completed' ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : (
            <>
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="View Materials">
                <BookOpen className="h-4 w-4" />
              </button>
              <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Print Sign-In">
                <Printer className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Led by: {talk.conductedBy}
      </div>
    </div>
  )
}

function ObservationCard({ observation }: { observation: SafetyObservation }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      observation.severity === 'imminent_danger' ? "border-red-300 bg-red-50" :
      observation.severity === 'serious_hazard' ? "border-orange-200" :
      observation.severity === 'minor_hazard' ? "border-amber-200" :
      "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            observation.observationType === 'positive' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {observation.observationType === 'positive' ? 'Positive' : 'Hazard'}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium", severityColors[observation.severity])}>
            {severityLabels[observation.severity]}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {categoryLabels[observation.category]}
          </span>
        </div>
        <span className="text-xs text-gray-500">{observation.date}</span>
      </div>
      <p className="text-sm text-gray-900 mb-2">{observation.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {observation.job}
        </span>
        <span className="flex items-center gap-1">
          {observation.isAnonymous ? (
            <><EyeOff className="h-3 w-3" /> Anonymous</>
          ) : (
            <><User className="h-3 w-3" /> {observation.observedBy}</>
          )}
        </span>
        {observation.vendorName && (
          <span className="flex items-center gap-1 text-orange-600">
            <Link2 className="h-3 w-3" />
            {observation.vendorName}
          </span>
        )}
        {observation.hasPhotos && (
          <span className="flex items-center gap-1 text-blue-600">
            <Camera className="h-3 w-3" />
            {observation.photoCount} photo{observation.photoCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {observation.correctiveAction && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
          <span className="font-medium">Corrective Action:</span> {observation.correctiveAction}
        </div>
      )}
    </div>
  )
}

function IncidentCard({ incident }: { incident: SafetyIncident }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      incident.severity === 'critical' ? "border-red-300 bg-red-50" :
      incident.severity === 'high' ? "border-red-200" :
      incident.severity === 'medium' ? "border-amber-200" :
      "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            incident.type === 'injury' ? "bg-red-100 text-red-700" :
            incident.type === 'near_miss' ? "bg-amber-100 text-amber-700" :
            "bg-purple-100 text-purple-700"
          )}>
            {incident.type === 'injury' ? 'Injury' :
             incident.type === 'near_miss' ? 'Near Miss' :
             'Property Damage'}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium", incidentStatusColors[incident.status])}>
            {incidentStatusLabels[incident.status]}
          </span>
          {incident.oshaClassification && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded font-medium",
              incident.oshaClassification === 'first_aid' ? "bg-green-100 text-green-700" :
              incident.oshaClassification === 'recordable' ? "bg-orange-100 text-orange-700" :
              incident.oshaClassification === 'lost_time' ? "bg-red-100 text-red-700" :
              "bg-red-200 text-red-800"
            )}>
              OSHA: {incident.oshaClassification === 'first_aid' ? 'First Aid' :
                     incident.oshaClassification === 'recordable' ? 'Recordable' :
                     incident.oshaClassification === 'lost_time' ? 'Lost Time' : 'Fatality'}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{incident.date}</span>
      </div>
      <p className="text-sm text-gray-900 mb-2">{incident.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
        <span className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {incident.job}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {incident.reportedBy}
        </span>
        <span className="text-gray-400">
          {incident.time} at {incident.location}
        </span>
        {incident.vendorName && (
          <span className="flex items-center gap-1 text-orange-600">
            <Link2 className="h-3 w-3" />
            {incident.vendorName}
          </span>
        )}
        {incident.witnessCount > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {incident.witnessCount} witness{incident.witnessCount !== 1 ? 'es' : ''}
          </span>
        )}
        {incident.hasPhotos && (
          <span className="flex items-center gap-1 text-blue-600">
            <Camera className="h-3 w-3" />
            Photos
          </span>
        )}
      </div>
      {incident.rootCause && (
        <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
          <span className="font-medium">Root Cause:</span> {incident.rootCause}
        </div>
      )}
      {incident.correctiveAction && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
          <span className="font-medium">Corrective Action:</span> {incident.correctiveAction}
        </div>
      )}
      {(incident.daysAway !== undefined || incident.daysRestricted !== undefined) && (
        <div className="mt-2 flex items-center gap-3 text-xs">
          {incident.daysAway !== undefined && (
            <span className="text-red-600 font-medium">{incident.daysAway} days away</span>
          )}
          {incident.daysRestricted !== undefined && (
            <span className="text-amber-600 font-medium">{incident.daysRestricted} days restricted</span>
          )}
          {incident.returnToWorkDate && (
            <span className="text-green-600">Returned: {incident.returnToWorkDate}</span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {incident.oshaReportable && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">OSHA Reportable</span>
          )}
          {incident.drugTestRequired && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Drug Test Required</span>
          )}
          <span className={cn(
            "text-xs px-2 py-0.5 rounded",
            incident.investigationStatus === 'complete' ? "bg-green-100 text-green-700" :
            incident.investigationStatus === 'in_progress' ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          )}>
            Investigation: {incident.investigationStatus === 'complete' ? 'Complete' :
                           incident.investigationStatus === 'in_progress' ? 'In Progress' : 'Pending'}
          </span>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View Details <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function InspectionItem({ inspection }: { inspection: SafetyInspection }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          inspection.status === 'issues-found' ? "bg-red-100" :
          inspection.status === 'completed' ? "bg-green-100" :
          "bg-green-100"
        )}>
          <ClipboardCheck className={cn(
            "h-4 w-4",
            inspection.status === 'issues-found' ? "text-red-600" :
            inspection.status === 'completed' ? "text-green-600" :
            "text-green-600"
          )} />
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{inspection.type}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{inspection.job}</span>
            <span className="text-gray-300">|</span>
            <span>{inspection.inspector}</span>
            {inspection.checklistItems && (
              <>
                <span className="text-gray-300">|</span>
                <span>{inspection.completedItems ?? 0}/{inspection.checklistItems} items</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        {inspection.status === 'issues-found' && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
            {inspection.issueCount} issues
          </span>
        )}
        {inspection.status === 'completed' && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
            <CheckCircle2 className="h-3 w-3 inline" /> Done
          </span>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">{inspection.scheduledDate}</div>
          <div className="text-xs text-gray-500">{inspection.scheduledTime}</div>
        </div>
      </div>
    </div>
  )
}

function SafetyScoreRow({ score }: { score: SafetyScore }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2 text-sm font-medium text-gray-900">{score.projectName}</td>
      <td className="px-3 py-2 text-sm text-center">{score.observationScore}</td>
      <td className="px-3 py-2 text-sm text-center">{score.incidentScore}</td>
      <td className="px-3 py-2 text-sm text-center">{score.trainingScore}</td>
      <td className="px-3 py-2 text-sm text-center">{score.certificationScore}</td>
      <td className="px-3 py-2 text-sm text-center">
        <span className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold",
          score.compositeScore >= 90 ? "bg-green-100 text-green-700" :
          score.compositeScore >= 75 ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        )}>
          {score.compositeScore}
          {score.trend === 'up' && <TrendingUp className="h-3 w-3" />}
          {score.trend === 'down' && <TrendingDown className="h-3 w-3" />}
        </span>
      </td>
    </tr>
  )
}

function VendorSafetyRow({ vendor }: { vendor: VendorSafetyStatus }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2 text-sm font-medium text-gray-900">{vendor.vendorName}</td>
      <td className="px-3 py-2 text-sm text-center">
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium",
          vendor.emrRating <= 0.9 ? "bg-green-100 text-green-700" :
          vendor.emrRating <= 1.1 ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        )}>
          {vendor.emrRating.toFixed(2)}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-center">{vendor.incidentCount}</td>
      <td className="px-3 py-2 text-sm text-center">
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium",
          vendor.certificationStatus === 'compliant' ? "bg-green-100 text-green-700" :
          vendor.certificationStatus === 'expiring' ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        )}>
          {vendor.certificationStatus === 'compliant' ? 'Compliant' :
           vendor.certificationStatus === 'expiring' ? 'Expiring' : 'Non-Compliant'}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-center text-gray-500">{vendor.lastIncidentDate ?? 'None'}</td>
      <td className="px-3 py-2 text-sm text-center">{vendor.activeProjects}</td>
    </tr>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export function SafetyPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'dashboard' })
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredIncidents = sortItems(
    recentIncidents.filter(incident => {
      if (!matchesSearch(incident, search, ['description', 'job', 'reportedBy', 'type', 'vendorName', 'employeeName'])) return false
      return true
    }),
    activeSort as keyof SafetyIncident | '',
    sortDirection,
  )

  const filteredObservations = sortItems(
    safetyObservations.filter(obs => {
      if (!matchesSearch(obs, search, ['description', 'job', 'observedBy', 'category', 'vendorName'])) return false
      if (selectedSeverity !== 'all' && obs.severity !== selectedSeverity) return false
      if (selectedCategory !== 'all' && obs.category !== selectedCategory) return false
      return true
    }),
    activeSort as keyof SafetyObservation | '',
    sortDirection,
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Safety & Compliance</h3>
            <p className="text-sm text-gray-500">OSHA compliance, incident reporting, observations, training & vendor safety</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              Submit Observation
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ClipboardCheck className="h-4 w-4" />
              New Inspection
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              <AlertTriangle className="h-4 w-4" />
              Report Incident
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar with Search + Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search safety records..."
          tabs={[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'observations', label: 'Observations', count: safetyObservations.length },
            { key: 'incidents', label: 'Incidents', count: recentIncidents.length },
            { key: 'training', label: 'Training & Compliance' },
            { key: 'scores', label: 'Safety Scores' },
            { key: 'vendors', label: 'Vendor Safety' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={
            activeTab === 'observations'
              ? [
                  {
                    label: 'All Severities',
                    value: selectedSeverity,
                    options: [
                      { value: 'informational', label: 'Informational' },
                      { value: 'minor_hazard', label: 'Minor Hazard' },
                      { value: 'serious_hazard', label: 'Serious Hazard' },
                      { value: 'imminent_danger', label: 'Imminent Danger' },
                    ],
                    onChange: setSelectedSeverity,
                  },
                  {
                    label: 'All Categories',
                    value: selectedCategory,
                    options: Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
                    onChange: setSelectedCategory,
                  },
                ]
              : []
          }
          sortOptions={
            activeTab === 'incidents'
              ? [
                  { value: 'date', label: 'Date' },
                  { value: 'severity', label: 'Severity' },
                  { value: 'status', label: 'Status' },
                  { value: 'job', label: 'Job' },
                  { value: 'type', label: 'Type' },
                ]
              : activeTab === 'observations'
              ? [
                  { value: 'date', label: 'Date' },
                  { value: 'severity', label: 'Severity' },
                  { value: 'category', label: 'Category' },
                  { value: 'job', label: 'Job' },
                  { value: 'observationType', label: 'Type' },
                ]
              : []
          }
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={activeTab === 'incidents' || activeTab === 'observations' ? [
            { icon: Download, label: 'Export', onClick: () => {} },
          ] : []}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-6 gap-3">
              {safetyMetrics.map((metric, i) => (
                <MetricCard key={i} metric={metric} />
              ))}
            </div>

            {/* Cross-module connection badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Connected to:</span>
              {[
                { label: 'Daily Logs', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Vendor Scorecards', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                { label: 'HR & Workforce', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Document Storage', color: 'bg-green-50 text-green-700 border-green-200' },
                { label: 'Scheduling', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { label: 'Notifications', color: 'bg-pink-50 text-pink-700 border-pink-200' },
              ].map(badge => (
                <span key={badge.label} className={cn("text-xs px-2 py-0.5 rounded border flex items-center gap-1", badge.color)}>
                  <Link2 className="h-3 w-3" />
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Upcoming Toolbox Talks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Toolbox Talks
                  </h4>
                  <button className="text-xs text-blue-600 hover:text-blue-700">Schedule New</button>
                </div>
                <div className="space-y-2">
                  {upcomingToolboxTalks.map(talk => (
                    <ToolboxTalkCard key={talk.id} talk={talk} />
                  ))}
                </div>
              </div>

              {/* Upcoming Inspections */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                    Inspections
                  </h4>
                  <button className="text-xs text-blue-600 hover:text-blue-700">View All</button>
                </div>
                <div>
                  {safetyInspections.map(inspection => (
                    <InspectionItem key={inspection.id} inspection={inspection} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Observations + Incidents side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Recent Observations
                  </h4>
                  <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {safetyObservations.slice(0, 3).map(obs => (
                    <ObservationCard key={obs.id} observation={obs} />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Recent Incidents (Review Required)
                  </h4>
                </div>
                <div className="space-y-3">
                  {recentIncidents.filter(i => i.status !== 'closed').map(incident => (
                    <IncidentCard key={incident.id} incident={incident} />
                  ))}
                  {recentIncidents.filter(i => i.status !== 'closed').length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-green-300" />
                      No open incidents requiring review
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Observations Tab ── */}
        {activeTab === 'observations' && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">
                  {safetyObservations.filter(o => o.observationType === 'positive').length}
                </div>
                <div className="text-xs text-green-600">Positive</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-700">
                  {safetyObservations.filter(o => o.observationType === 'hazard').length}
                </div>
                <div className="text-xs text-red-600">Hazards</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-700">
                  {safetyObservations.filter(o => o.hasPhotos).length}
                </div>
                <div className="text-xs text-blue-600">With Photos</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-700">
                  {safetyObservations.filter(o => o.isAnonymous).length}
                </div>
                <div className="text-xs text-gray-600">Anonymous</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredObservations.map(obs => (
                <ObservationCard key={obs.id} observation={obs} />
              ))}
            </div>
            {filteredObservations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No observations found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {/* ── Incidents Tab ── */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {/* Incident summary bar */}
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-700">
                  {recentIncidents.filter(i => i.type === 'injury').length}
                </div>
                <div className="text-xs text-red-600">Injuries</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-700">
                  {recentIncidents.filter(i => i.type === 'near_miss').length}
                </div>
                <div className="text-xs text-amber-600">Near Misses</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-700">
                  {recentIncidents.filter(i => i.type === 'property_damage').length}
                </div>
                <div className="text-xs text-purple-600">Property Damage</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-700">
                  {recentIncidents.filter(i => i.oshaReportable).length}
                </div>
                <div className="text-xs text-orange-600">OSHA Reportable</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-700">
                  {recentIncidents.filter(i => i.status !== 'closed').length}
                </div>
                <div className="text-xs text-blue-600">Open</div>
              </div>
            </div>
            <div className="space-y-4">
              {filteredIncidents.map(incident => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
            {filteredIncidents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No incidents found matching your search</p>
              </div>
            )}
          </div>
        )}

        {/* ── Training & Compliance Tab ── */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            {/* Training Gaps */}
            <div className="bg-white rounded-lg border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h4 className="font-medium text-gray-900">Training Gaps</h4>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                  {trainingGaps.length} employees
                </span>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Employee</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Required Training</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Job Assignment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trainingGaps.map((gap, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-sm text-gray-900">{gap.employee}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{gap.training}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{gap.job}</td>
                      <td className="px-3 py-2 text-sm text-amber-600 font-medium">{gap.dueDate}</td>
                      <td className="px-3 py-2">
                        {gap.isAutoBlocked ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Blocked
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Needed</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button className="text-xs text-blue-600 hover:text-blue-700">Schedule</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Training Compliance by Category */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-4">Training Compliance by Category</h4>
              <div className="space-y-3">
                {[
                  { category: 'OSHA 10-Hour', compliant: 12, total: 15, percentage: 80 },
                  { category: 'OSHA 30-Hour', compliant: 4, total: 5, percentage: 80 },
                  { category: 'Fall Protection', compliant: 14, total: 15, percentage: 93 },
                  { category: 'First Aid/CPR', compliant: 10, total: 15, percentage: 67 },
                  { category: 'Hazard Communication', compliant: 15, total: 15, percentage: 100 },
                  { category: 'Equipment Operator', compliant: 6, total: 6, percentage: 100 },
                  { category: 'Confined Space Entry', compliant: 2, total: 3, percentage: 67 },
                ].map(item => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.category}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.compliant}/{item.total} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.percentage >= 90 ? "bg-green-500" :
                          item.percentage >= 70 ? "bg-amber-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OSHA 300 Log summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  OSHA 300 Log Summary (2026)
                </h4>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Download className="h-3 w-3" /> Export 300A
                  </button>
                  <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Full 300 Log
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm font-bold text-gray-900">1</div>
                  <div className="text-xs text-gray-500">Recordable Cases</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm font-bold text-gray-900">5</div>
                  <div className="text-xs text-gray-500">Days Away</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm font-bold text-gray-900">10</div>
                  <div className="text-xs text-gray-500">Restricted Days</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm font-bold text-gray-900">0</div>
                  <div className="text-xs text-gray-500">Fatalities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Safety Scores Tab ── */}
        {activeTab === 'scores' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Project Safety Scores
              </h4>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Project</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Observations</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Incidents</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Training</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Certifications</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Composite</th>
                  </tr>
                </thead>
                <tbody>
                  {safetyScores.map(score => (
                    <SafetyScoreRow key={score.projectName} score={score} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rate calculations */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">TRIR Calculation</h5>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Recordable Cases: 1</div>
                  <div>Total Hours Worked: 112,000</div>
                  <div className="pt-1 border-t border-gray-100 font-medium text-gray-900">
                    TRIR = (1 x 200,000) / 112,000 = 1.79
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">DART Rate</h5>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>DART Cases: 1 (5 days away + 10 restricted)</div>
                  <div>Total Hours Worked: 112,000</div>
                  <div className="pt-1 border-t border-gray-100 font-medium text-gray-900">
                    DART = (1 x 200,000) / 112,000 = 0.89
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">EMR Worksheet</h5>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Current EMR: 0.82</div>
                  <div>Industry Average: 1.00</div>
                  <div className="pt-1 border-t border-gray-100 font-medium text-green-700">
                    Below average - favorable insurance rates
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Vendor Safety Tab ── */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  Vendor Safety Compliance
                </h4>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Feeds into Vendor Scorecard (Module 22)
                </span>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Vendor</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">EMR Rating</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Incidents (12mo)</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Cert Status</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Last Incident</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Active Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorSafetyStatuses.map(vendor => (
                    <VendorSafetyRow key={vendor.vendorName} vendor={vendor} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-amber-800 text-sm">Vendor Safety Alerts</h5>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    <li>Coastal Excavation: EMR 1.25 exceeds threshold (1.20). Consider advisory before next assignment.</li>
                    <li>ABC Framing: Safety certifications expiring within 30 days. Renewal required for continued work.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Safety Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Consider heat safety toolbox talk - forecast shows 95F this week.
              Near-misses up 40% this month - common factor: afternoon timeframe. Consider fatigue management discussion.
            </p>
            <p>
              Fall protection observations trending up at Smith Residence - 3 in 2 weeks. Pre-task safety plan recommended before roofing phase.
              ABC Framing involved in 2 of last 3 incidents - flag for vendor safety review.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
