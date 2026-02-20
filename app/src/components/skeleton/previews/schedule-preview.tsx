'use client'

import { useState, useMemo, useRef } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Cloud,
  CloudRain,
  Sun,
  Sparkles,
  User,
  Clock,
  Plus,
  Download,
  ChevronsDownUp,
  ChevronsUpDown,
  Eye,
  CheckSquare,
  Square,
  ExternalLink,
  Truck,
  HardHat,
  CalendarClock,
  Flag,
  Diamond,
  Ruler,
  Users,
  CloudOff,
  Check,
  CircleDashed,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileText,
  Package,
  CalendarDays,
  Activity,
  ArrowRight,
  HelpCircle,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import {
  differenceInCalendarDays,
  addDays,
  format,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachDayOfInterval,
  isWeekend,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns'

// ============================================================================
// 1. Types & Constants
// ============================================================================

type TaskType = 'construction' | 'inspection' | 'delivery' | 'deadline' | 'milestone' | 'survey' | 'meeting' | 'weather_hold'
type ItemKind = 'task' | 'checklist'
type SubConfirmation = 'not_sent' | 'pending' | 'confirmed'
type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked'
type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'
type ZoomLevel = 'day' | 'week' | 'month'

interface ScheduleItem {
  id: string
  groupId: string
  name: string
  kind: ItemKind
  taskType?: TaskType
  trade?: string
  startDate?: string
  endDate?: string
  actualStartDate?: string
  actualEndDate?: string
  baselineStartDate?: string
  baselineEndDate?: string
  aiPredictedEndDate?: string
  aiConfidence?: number
  aiReasoning?: string[]
  durationDays?: number
  percentComplete?: number
  status?: TaskStatus
  isCriticalPath?: boolean
  totalFloat?: number
  isChecked?: boolean
  vendor?: string
  assignee?: string
  subConfirmation?: SubConfirmation
  isWeatherSensitive?: boolean
  aiNote?: string
  linkedInspection?: string
  linkedPO?: string
  linkedDailyLog?: string
}

interface ScheduleGroup {
  id: string
  phaseId: string
  name: string
  sortOrder: number
  items: ScheduleItem[]
}

interface SchedulePhase {
  id: string
  name: string
  sortOrder: number
  groups: ScheduleGroup[]
}

interface ScheduleDependency {
  predecessorId: string
  successorId: string
  type: DependencyType
  lagDays: number
}

interface WeatherDay {
  date: string
  icon: 'sun' | 'cloud' | 'rain' | 'storm'
  high: number
}

// ============================================================================
// 2. Color Map & Status Config
// ============================================================================

const TASK_TYPE_CONFIG: Record<TaskType, { label: string; barColor: string; bgColor: string; badgeColor: string; icon: typeof HardHat }> = {
  construction: { label: 'Construction', barColor: 'bg-stone-500', bgColor: 'bg-stone-200', badgeColor: 'bg-stone-100 text-stone-700', icon: HardHat },
  inspection:   { label: 'Inspection', barColor: 'bg-purple-500', bgColor: 'bg-purple-200', badgeColor: 'bg-purple-100 text-purple-700', icon: Eye },
  delivery:     { label: 'Delivery', barColor: 'bg-amber-500', bgColor: 'bg-amber-200', badgeColor: 'bg-amber-100 text-amber-700', icon: Truck },
  deadline:     { label: 'Deadline', barColor: 'bg-red-500', bgColor: 'bg-red-200', badgeColor: 'bg-red-100 text-red-700', icon: Flag },
  milestone:    { label: 'Milestone', barColor: 'bg-emerald-500', bgColor: 'bg-emerald-200', badgeColor: 'bg-emerald-100 text-emerald-700', icon: Diamond },
  survey:       { label: 'Survey', barColor: 'bg-cyan-500', bgColor: 'bg-cyan-200', badgeColor: 'bg-cyan-100 text-cyan-700', icon: Ruler },
  meeting:      { label: 'Meeting', barColor: 'bg-teal-500', bgColor: 'bg-teal-200', badgeColor: 'bg-teal-100 text-teal-700', icon: Users },
  weather_hold: { label: 'Weather Hold', barColor: 'bg-warm-400', bgColor: 'bg-warm-200', badgeColor: 'bg-warm-100 text-warm-600', icon: CloudOff },
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  complete: 'Complete',
  blocked: 'Blocked',
}

const SUB_CONFIRMATION_CONFIG: Record<SubConfirmation, { label: string; badgeClass: string }> = {
  not_sent:   { label: 'Not Sent', badgeClass: 'bg-warm-100 text-warm-500' },
  pending:    { label: 'Pending', badgeClass: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Confirmed', badgeClass: 'bg-green-100 text-green-700' },
}

const DEPENDENCY_TYPE_CONFIG: Record<DependencyType, { label: string; color: string; arrowColor: string }> = {
  FS: { label: 'Finish-to-Start', color: 'text-stone-600', arrowColor: '#3b82f6' },
  SS: { label: 'Start-to-Start', color: 'text-green-600', arrowColor: '#16a34a' },
  FF: { label: 'Finish-to-Finish', color: 'text-orange-600', arrowColor: '#ea580c' },
  SF: { label: 'Start-to-Finish', color: 'text-purple-600', arrowColor: '#9333ea' },
}

// ============================================================================
// 3. Mock Data — "Smith Residence" Build (~20 weeks, ~40 items)
// ============================================================================

const PROJECT_START = '2025-11-04'
const PROJECT_END = '2026-03-20'
const TODAY = '2026-01-22'

const mockPhases: SchedulePhase[] = [
  {
    id: 'p1', name: 'Site Prep', sortOrder: 1,
    groups: [
      {
        id: 'g1a', phaseId: 'p1', name: 'Clearing & Grading', sortOrder: 1,
        items: [
          { id: 't1', groupId: 'g1a', name: 'Clear lot & remove debris', kind: 'task', taskType: 'construction', trade: 'Earthwork', startDate: '2025-11-04', endDate: '2025-11-06', actualStartDate: '2025-11-04', actualEndDate: '2025-11-06', durationDays: 3, percentComplete: 100, status: 'complete', totalFloat: 5, vendor: 'Site Works', assignee: 'Mike R.', subConfirmation: 'confirmed', isWeatherSensitive: true },
          { id: 't2', groupId: 'g1a', name: 'Grade & compact pad', kind: 'task', taskType: 'construction', trade: 'Earthwork', startDate: '2025-11-07', endDate: '2025-11-08', actualStartDate: '2025-11-07', actualEndDate: '2025-11-09', durationDays: 2, percentComplete: 100, status: 'complete', totalFloat: 4, vendor: 'Site Works', assignee: 'Mike R.', subConfirmation: 'confirmed', isWeatherSensitive: true, linkedDailyLog: 'DL-001' },
          { id: 'c1', groupId: 'g1a', name: 'Confirm elevation survey matches plans', kind: 'checklist', isChecked: true },
        ],
      },
      {
        id: 'g1b', phaseId: 'p1', name: 'Temporary Utilities', sortOrder: 2,
        items: [
          { id: 't3', groupId: 'g1b', name: 'Install temp power pole', kind: 'task', taskType: 'construction', trade: 'Electrical', startDate: '2025-11-06', endDate: '2025-11-07', actualStartDate: '2025-11-06', actualEndDate: '2025-11-07', durationDays: 2, percentComplete: 100, status: 'complete', totalFloat: 8, vendor: 'Smith Electric', assignee: 'Dan S.', subConfirmation: 'confirmed' },
          { id: 't4', groupId: 'g1b', name: 'Set up portable facilities', kind: 'task', taskType: 'delivery', trade: 'General', startDate: '2025-11-04', endDate: '2025-11-04', actualStartDate: '2025-11-04', actualEndDate: '2025-11-04', durationDays: 1, percentComplete: 100, status: 'complete', linkedPO: 'PO-001' },
          { id: 'c2', groupId: 'g1b', name: 'Verify power is live', kind: 'checklist', isChecked: true },
        ],
      },
      {
        id: 'g1c', phaseId: 'p1', name: 'Site Protection', sortOrder: 3,
        items: [
          { id: 't5', groupId: 'g1c', name: 'Install silt fence & erosion control', kind: 'task', taskType: 'construction', trade: 'Earthwork', startDate: '2025-11-04', endDate: '2025-11-05', actualStartDate: '2025-11-04', actualEndDate: '2025-11-05', durationDays: 2, percentComplete: 100, status: 'complete', vendor: 'Site Works', subConfirmation: 'confirmed' },
          { id: 'c3', groupId: 'g1c', name: 'Photo-document initial site conditions', kind: 'checklist', isChecked: true },
        ],
      },
    ],
  },
  {
    id: 'p2', name: 'Foundation', sortOrder: 2,
    groups: [
      {
        id: 'g2a', phaseId: 'p2', name: 'Excavation & Pilings', sortOrder: 1,
        items: [
          { id: 't6', groupId: 'g2a', name: 'Excavate footings', kind: 'task', taskType: 'construction', trade: 'Earthwork', startDate: '2025-11-11', endDate: '2025-11-14', actualStartDate: '2025-11-11', actualEndDate: '2025-11-14', durationDays: 4, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0, vendor: 'Site Works', assignee: 'Mike R.', subConfirmation: 'confirmed', isWeatherSensitive: true, linkedDailyLog: 'DL-005' },
          { id: 't7', groupId: 'g2a', name: 'Drive pilings (32 total)', kind: 'task', taskType: 'construction', trade: 'Foundation', startDate: '2025-11-15', endDate: '2025-11-22', actualStartDate: '2025-11-15', actualEndDate: '2025-11-23', durationDays: 6, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0, vendor: 'Deep South Pilings', assignee: 'Joe T.', subConfirmation: 'confirmed', aiNote: 'Requires low tide windows — AI scheduled around tides' },
          { id: 'i1', groupId: 'g2a', name: 'Foundation inspection', kind: 'task', taskType: 'inspection', trade: 'Inspection', startDate: '2025-11-25', endDate: '2025-11-25', actualStartDate: '2025-11-25', actualEndDate: '2025-11-25', durationDays: 1, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0, linkedInspection: 'BLD-2025-1847' },
        ],
      },
      {
        id: 'g2b', phaseId: 'p2', name: 'Concrete Work', sortOrder: 2,
        items: [
          { id: 't8', groupId: 'g2b', name: 'Form & pour grade beams', kind: 'task', taskType: 'construction', trade: 'Foundation', startDate: '2025-11-26', endDate: '2025-12-03', actualStartDate: '2025-11-26', actualEndDate: '2025-12-04', durationDays: 6, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0, vendor: 'Deep South Pilings', subConfirmation: 'confirmed', isWeatherSensitive: true },
          { id: 't9', groupId: 'g2b', name: 'Cure period (7 days)', kind: 'task', taskType: 'weather_hold', trade: 'Foundation', startDate: '2025-12-04', endDate: '2025-12-10', actualStartDate: '2025-12-05', actualEndDate: '2025-12-11', durationDays: 7, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0 },
          { id: 't10', groupId: 'g2b', name: 'Strip forms & backfill', kind: 'task', taskType: 'construction', trade: 'Foundation', startDate: '2025-12-11', endDate: '2025-12-13', actualStartDate: '2025-12-12', durationDays: 3, percentComplete: 75, status: 'in_progress', isCriticalPath: true, totalFloat: 0, vendor: 'Deep South Pilings', subConfirmation: 'confirmed', aiPredictedEndDate: '2025-12-15', aiConfidence: 78, aiReasoning: ['Weather forecast (+1 day)', 'Crew availability normal', 'Similar task history (+0.5 days)'] },
          { id: 'c4', groupId: 'g2b', name: 'Verify rebar placement per structural drawings', kind: 'checklist', isChecked: true },
        ],
      },
      {
        id: 'g2c', phaseId: 'p2', name: 'Under-Slab Utilities', sortOrder: 3,
        items: [
          { id: 't11', groupId: 'g2c', name: 'Plumbing rough under slab', kind: 'task', taskType: 'construction', trade: 'Plumbing', startDate: '2025-12-02', endDate: '2025-12-04', actualStartDate: '2025-12-02', actualEndDate: '2025-12-04', durationDays: 3, percentComplete: 100, status: 'complete', totalFloat: 3, vendor: 'Jones Plumbing', assignee: 'Rick J.', subConfirmation: 'confirmed', linkedPO: 'PO-003' },
          { id: 'i2', groupId: 'g2c', name: 'Plumbing under-slab inspection', kind: 'task', taskType: 'inspection', trade: 'Inspection', startDate: '2025-12-05', endDate: '2025-12-05', actualStartDate: '2025-12-05', actualEndDate: '2025-12-05', durationDays: 1, percentComplete: 100, status: 'complete', linkedInspection: 'PLB-2025-0422' },
        ],
      },
    ],
  },
  {
    id: 'p3', name: 'Framing', sortOrder: 3,
    groups: [
      {
        id: 'g3a', phaseId: 'p3', name: 'Floor System', sortOrder: 1,
        items: [
          { id: 't12', groupId: 'g3a', name: 'Install floor trusses', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2025-12-15', endDate: '2025-12-19', actualStartDate: '2025-12-16', actualEndDate: '2025-12-20', durationDays: 5, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0, vendor: 'ABC Framing', assignee: 'Tom A.', subConfirmation: 'confirmed', linkedPO: 'PO-004', baselineStartDate: '2025-12-15', baselineEndDate: '2025-12-19' },
          { id: 't13', groupId: 'g3a', name: 'Subfloor sheathing', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2025-12-20', endDate: '2025-12-23', actualStartDate: '2025-12-21', actualEndDate: '2025-12-24', durationDays: 3, percentComplete: 100, status: 'complete', isCriticalPath: true, totalFloat: 0, vendor: 'ABC Framing', assignee: 'Tom A.', subConfirmation: 'confirmed', baselineStartDate: '2025-12-20', baselineEndDate: '2025-12-22' },
        ],
      },
      {
        id: 'g3b', phaseId: 'p3', name: 'Wall Framing', sortOrder: 2,
        items: [
          { id: 't14', groupId: 'g3b', name: 'Frame exterior walls', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2025-12-26', endDate: '2026-01-06', actualStartDate: '2025-12-27', durationDays: 8, percentComplete: 80, status: 'in_progress', isCriticalPath: true, totalFloat: 0, vendor: 'ABC Framing', assignee: 'Tom A.', subConfirmation: 'confirmed', baselineStartDate: '2025-12-24', baselineEndDate: '2026-01-02', aiPredictedEndDate: '2026-01-08', aiConfidence: 85, aiReasoning: ['Weather forecast (+2 days)', 'Vendor history (+1 day)', 'Similar task duration analysis'], aiNote: 'ABC typically +2 days on coastal elevated homes' },
          { id: 't15', groupId: 'g3b', name: 'Frame interior walls', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2026-01-07', endDate: '2026-01-13', actualStartDate: '2026-01-09', durationDays: 5, percentComplete: 30, status: 'in_progress', isCriticalPath: true, totalFloat: 0, vendor: 'ABC Framing', assignee: 'Tom A.', subConfirmation: 'confirmed', baselineStartDate: '2026-01-03', baselineEndDate: '2026-01-08', aiPredictedEndDate: '2026-01-16', aiConfidence: 72, aiReasoning: ['Exterior walls delay (+2 days)', 'Material availability normal', 'Crew efficiency trending down'] },
          { id: 'sv1', groupId: 'g3b', name: 'Wall plumb & square check', kind: 'task', taskType: 'survey', trade: 'Survey', startDate: '2026-01-14', endDate: '2026-01-14', durationDays: 1, percentComplete: 0, status: 'not_started', totalFloat: 2 },
        ],
      },
      {
        id: 'g3c', phaseId: 'p3', name: 'Roof Framing', sortOrder: 3,
        items: [
          { id: 't16', groupId: 'g3c', name: 'Set roof trusses', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2026-01-15', endDate: '2026-01-22', durationDays: 6, percentComplete: 10, status: 'in_progress', isCriticalPath: true, totalFloat: 0, vendor: 'ABC Framing', assignee: 'Tom A.', subConfirmation: 'confirmed', isWeatherSensitive: true, linkedPO: 'PO-005', baselineStartDate: '2026-01-09', baselineEndDate: '2026-01-15', aiPredictedEndDate: '2026-01-25', aiConfidence: 68, aiReasoning: ['Complex hip roof geometry (+2 days)', 'Weather risk window (+1 day)', 'Crane scheduling dependency'], aiNote: 'Complex hip roof — AI suggests 18 days total' },
          { id: 't17', groupId: 'g3c', name: 'Roof sheathing & dry-in', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2026-01-23', endDate: '2026-01-29', durationDays: 5, percentComplete: 0, status: 'not_started', isCriticalPath: true, totalFloat: 0, vendor: 'ABC Framing', subConfirmation: 'pending', isWeatherSensitive: true, baselineStartDate: '2026-01-16', baselineEndDate: '2026-01-21' },
          { id: 'i3', groupId: 'g3c', name: 'Structural framing inspection', kind: 'task', taskType: 'inspection', trade: 'Inspection', startDate: '2026-01-30', endDate: '2026-01-30', durationDays: 1, percentComplete: 0, status: 'not_started', isCriticalPath: true, totalFloat: 0, linkedInspection: 'STR-2026-0112' },
          { id: 'm1', groupId: 'g3c', name: 'Dried In milestone', kind: 'task', taskType: 'milestone', startDate: '2026-01-30', endDate: '2026-01-30', durationDays: 0, percentComplete: 0, status: 'not_started', isCriticalPath: true },
          { id: 'c5', groupId: 'g3c', name: 'Confirm truss layout matches engineering', kind: 'checklist', isChecked: false },
        ],
      },
    ],
  },
  {
    id: 'p4', name: 'Exterior', sortOrder: 4,
    groups: [
      {
        id: 'g4a', phaseId: 'p4', name: 'Windows & Doors', sortOrder: 1,
        items: [
          { id: 't18', groupId: 'g4a', name: 'Impact windows delivery', kind: 'task', taskType: 'delivery', trade: 'Windows', startDate: '2026-01-20', endDate: '2026-01-20', durationDays: 1, percentComplete: 0, status: 'not_started', vendor: 'PGT Industries', subConfirmation: 'confirmed', linkedPO: 'PO-002', aiNote: '16-week lead time — ordered Aug 2025' },
          { id: 't19', groupId: 'g4a', name: 'Install windows & doors', kind: 'task', taskType: 'construction', trade: 'Framing', startDate: '2026-02-02', endDate: '2026-02-07', durationDays: 5, percentComplete: 0, status: 'not_started', totalFloat: 3, vendor: 'ABC Framing', assignee: 'Tom A.', subConfirmation: 'pending' },
        ],
      },
      {
        id: 'g4b', phaseId: 'p4', name: 'Roofing', sortOrder: 2,
        items: [
          { id: 't20', groupId: 'g4b', name: 'Install roofing underlayment', kind: 'task', taskType: 'construction', trade: 'Roofing', startDate: '2026-02-02', endDate: '2026-02-04', durationDays: 3, percentComplete: 0, status: 'not_started', totalFloat: 5, isWeatherSensitive: true },
          { id: 't21', groupId: 'g4b', name: 'Install standing seam metal roof', kind: 'task', taskType: 'construction', trade: 'Roofing', startDate: '2026-02-05', endDate: '2026-02-12', durationDays: 6, percentComplete: 0, status: 'not_started', totalFloat: 5, isWeatherSensitive: true },
        ],
      },
      {
        id: 'g4c', phaseId: 'p4', name: 'Siding & Trim', sortOrder: 3,
        items: [
          { id: 't22', groupId: 'g4c', name: 'Install house wrap', kind: 'task', taskType: 'construction', trade: 'Siding', startDate: '2026-02-09', endDate: '2026-02-11', durationDays: 3, percentComplete: 0, status: 'not_started', totalFloat: 8 },
          { id: 't23', groupId: 'g4c', name: 'Install fiber cement siding', kind: 'task', taskType: 'construction', trade: 'Siding', startDate: '2026-02-12', endDate: '2026-02-21', durationDays: 8, percentComplete: 0, status: 'not_started', totalFloat: 8 },
          { id: 'dl1', groupId: 'g4c', name: 'Exterior trim deadline', kind: 'task', taskType: 'deadline', startDate: '2026-02-25', endDate: '2026-02-25', durationDays: 0, percentComplete: 0, status: 'not_started' },
          { id: 'c6', groupId: 'g4c', name: 'Verify flashing details at all penetrations', kind: 'checklist', isChecked: false },
        ],
      },
    ],
  },
  {
    id: 'p5', name: 'MEP Rough-In', sortOrder: 5,
    groups: [
      {
        id: 'g5a', phaseId: 'p5', name: 'Electrical', sortOrder: 1,
        items: [
          { id: 't24', groupId: 'g5a', name: 'Electrical rough-in', kind: 'task', taskType: 'construction', trade: 'Electrical', startDate: '2026-02-16', endDate: '2026-02-27', durationDays: 10, percentComplete: 0, status: 'not_started', isCriticalPath: true, totalFloat: 0, vendor: 'Smith Electric', assignee: 'Dan S.', subConfirmation: 'pending' },
          { id: 'mt1', groupId: 'g5a', name: 'MEP coordination meeting', kind: 'task', taskType: 'meeting', trade: 'General', startDate: '2026-02-13', endDate: '2026-02-13', durationDays: 1, percentComplete: 0, status: 'not_started' },
          { id: 'c7', groupId: 'g5a', name: 'Verify panel schedule matches plans', kind: 'checklist', isChecked: false },
        ],
      },
      {
        id: 'g5b', phaseId: 'p5', name: 'Plumbing', sortOrder: 2,
        items: [
          { id: 't25', groupId: 'g5b', name: 'Plumbing rough-in (top-out)', kind: 'task', taskType: 'construction', trade: 'Plumbing', startDate: '2026-02-16', endDate: '2026-02-25', durationDays: 8, percentComplete: 0, status: 'not_started', totalFloat: 2, vendor: 'Jones Plumbing', assignee: 'Rick J.', subConfirmation: 'not_sent' },
          { id: 'i4', groupId: 'g5b', name: 'Plumbing top-out inspection', kind: 'task', taskType: 'inspection', trade: 'Inspection', startDate: '2026-02-26', endDate: '2026-02-26', durationDays: 1, percentComplete: 0, status: 'not_started', linkedInspection: 'PLB-2026-0088' },
          { id: 'c8', groupId: 'g5b', name: 'Pressure test all supply lines', kind: 'checklist', isChecked: false },
        ],
      },
      {
        id: 'g5c', phaseId: 'p5', name: 'HVAC', sortOrder: 3,
        items: [
          { id: 't26', groupId: 'g5c', name: 'HVAC ductwork rough-in', kind: 'task', taskType: 'construction', trade: 'HVAC', startDate: '2026-02-20', endDate: '2026-02-28', durationDays: 7, percentComplete: 0, status: 'not_started', totalFloat: 4 },
          { id: 't27', groupId: 'g5c', name: 'Set condensing unit', kind: 'task', taskType: 'construction', trade: 'HVAC', startDate: '2026-03-03', endDate: '2026-03-04', durationDays: 2, percentComplete: 0, status: 'not_started', totalFloat: 4 },
          { id: 'wh1', groupId: 'g5c', name: 'Weather hold — outdoor HVAC', kind: 'task', taskType: 'weather_hold', trade: 'HVAC', startDate: '2026-03-05', endDate: '2026-03-06', durationDays: 2, percentComplete: 0, status: 'not_started', isWeatherSensitive: true },
          { id: 'c9', groupId: 'g5c', name: 'Verify duct sizing per Manual D', kind: 'checklist', isChecked: false },
        ],
      },
    ],
  },
]

const mockDependencies: ScheduleDependency[] = [
  { predecessorId: 't1', successorId: 't2', type: 'FS', lagDays: 0 },
  { predecessorId: 't2', successorId: 't6', type: 'FS', lagDays: 1 },
  { predecessorId: 't6', successorId: 't7', type: 'FS', lagDays: 0 },
  { predecessorId: 't7', successorId: 'i1', type: 'FS', lagDays: 1 },
  { predecessorId: 'i1', successorId: 't8', type: 'FS', lagDays: 0 },
  { predecessorId: 't8', successorId: 't9', type: 'FS', lagDays: 0 },
  { predecessorId: 't9', successorId: 't10', type: 'FS', lagDays: 0 },
  { predecessorId: 't11', successorId: 'i2', type: 'FS', lagDays: 0 },
  { predecessorId: 't10', successorId: 't12', type: 'FS', lagDays: 1 },
  { predecessorId: 't12', successorId: 't13', type: 'SS', lagDays: 2 },  // SS: Start-to-Start
  { predecessorId: 't13', successorId: 't14', type: 'FS', lagDays: 1 },
  { predecessorId: 't14', successorId: 't15', type: 'SS', lagDays: 3 },  // SS: Start-to-Start (can start interior while exterior ongoing)
  { predecessorId: 't15', successorId: 't16', type: 'FS', lagDays: 1 },
  { predecessorId: 't16', successorId: 't17', type: 'FS', lagDays: 0 },
  { predecessorId: 't17', successorId: 'i3', type: 'FF', lagDays: 0 },   // FF: Finish-to-Finish (inspection must finish when sheathing finishes)
  { predecessorId: 'i3', successorId: 't19', type: 'FS', lagDays: 2 },
  { predecessorId: 'i3', successorId: 't24', type: 'FS', lagDays: 14 },
  { predecessorId: 't24', successorId: 't25', type: 'SS', lagDays: 0 },  // SS: Electrical and plumbing can start together
  { predecessorId: 't25', successorId: 'i4', type: 'FS', lagDays: 0 },
  { predecessorId: 't20', successorId: 't21', type: 'SF', lagDays: 1 },  // SF: Start-to-Finish (underlayment must start before roof can finish)
]

const mockWeather: WeatherDay[] = (() => {
  const start = new Date(TODAY)
  const icons: Array<'sun' | 'cloud' | 'rain' | 'storm'> = ['sun', 'cloud', 'sun', 'rain', 'rain', 'sun', 'sun', 'cloud', 'sun', 'sun', 'cloud', 'rain', 'sun', 'sun']
  const temps = [72, 68, 74, 65, 63, 70, 72, 67, 73, 75, 69, 64, 71, 74]
  return icons.map((icon, i) => ({
    date: format(addDays(start, i), 'yyyy-MM-dd'),
    icon,
    high: temps[i],
  }))
})()

// ============================================================================
// 4. Timeline Helpers
// ============================================================================

function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(new Date(b), new Date(a))
}

function getDatePosition(date: string, timelineStart: string, totalDays: number): number {
  const days = daysBetween(timelineStart, date)
  return (days / totalDays) * 100
}

function getBarWidth(start: string, end: string, totalDays: number): number {
  const days = daysBetween(start, end) + 1
  return Math.max((days / totalDays) * 100, 0.5)
}

function computeAggregateRange(items: ScheduleItem[]): { start: string; end: string; percent: number } | null {
  const tasks = items.filter(i => i.kind === 'task' && i.startDate && i.endDate)
  if (tasks.length === 0) return null
  const starts = tasks.map(t => t.startDate!).sort()
  const ends = tasks.map(t => t.endDate!).sort()
  const totalWeight = tasks.reduce((sum, t) => sum + (t.durationDays ?? 1), 0)
  const weightedPct = tasks.reduce((sum, t) => sum + (t.percentComplete ?? 0) * (t.durationDays ?? 1), 0)
  return { start: starts[0], end: ends[ends.length - 1], percent: totalWeight > 0 ? Math.round(weightedPct / totalWeight) : 0 }
}

function getVarianceDays(item: ScheduleItem): number | null {
  if (!item.baselineEndDate || !item.endDate) return null
  const variance = daysBetween(item.baselineEndDate, item.endDate)
  if (variance === 0) return null
  return variance
}

function getTimelineColumns(start: string, end: string, zoom: ZoomLevel): { label: string; subLabel?: string; date: Date }[] {
  const s = new Date(start)
  const e = new Date(end)
  if (zoom === 'month') {
    return eachMonthOfInterval({ start: s, end: e }).map(d => ({ label: format(d, 'MMM yyyy'), date: d }))
  }
  if (zoom === 'day') {
    return eachDayOfInterval({ start: s, end: e }).map(d => ({ label: format(d, 'd'), subLabel: format(d, 'EEE'), date: d }))
  }
  return eachWeekOfInterval({ start: s, end: e }, { weekStartsOn: 1 }).map(d => ({ label: format(d, 'MMM d'), date: d }))
}

function getPxPerDay(zoom: ZoomLevel): number {
  if (zoom === 'day') return 36
  if (zoom === 'week') return 12
  return 4
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-green-600'
  if (confidence >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function getConfidenceBgColor(confidence: number): string {
  if (confidence >= 80) return 'bg-green-100'
  if (confidence >= 60) return 'bg-amber-100'
  return 'bg-red-100'
}

// ============================================================================
// 5. Schedule Stats Helpers
// ============================================================================

function computeScheduleStats(phases: SchedulePhase[]) {
  const allItems = phases.flatMap(p => p.groups.flatMap(g => g.items))
  const tasks = allItems.filter(i => i.kind === 'task')
  const checklists = allItems.filter(i => i.kind === 'checklist')

  const totalTasks = tasks.length
  const completeTasks = tasks.filter(t => t.status === 'complete').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length

  const totalWeight = tasks.reduce((s, t) => s + (t.durationDays ?? 1), 0)
  const weightedPct = tasks.reduce((s, t) => s + (t.percentComplete ?? 0) * (t.durationDays ?? 1), 0)
  const overallPercent = totalWeight > 0 ? Math.round(weightedPct / totalWeight) : 0

  const daysRemaining = daysBetween(TODAY, PROJECT_END)

  const behindBaseline = tasks.filter(t => {
    const v = getVarianceDays(t)
    return v !== null && v > 0
  }).length

  const vendorTasks = tasks.filter(t => t.vendor)
  const unconfirmedSubs = vendorTasks.filter(t => t.subConfirmation && t.subConfirmation !== 'confirmed' && t.status !== 'complete').length

  const pendingInspections = tasks.filter(t => t.taskType === 'inspection' && t.status !== 'complete').length

  const zeroFloatNotComplete = tasks.filter(t => t.totalFloat === 0 && t.status !== 'complete').length

  const checklistsDone = checklists.filter(c => c.isChecked).length
  const checklistsTotal = checklists.length

  // Health: behind if >3 tasks behind baseline, or any blocked; at-risk if >1 behind
  let health: 'on_track' | 'at_risk' | 'behind' = 'on_track'
  if (blockedTasks > 0 || behindBaseline > 3) health = 'behind'
  else if (behindBaseline > 0 || unconfirmedSubs > 2) health = 'at_risk'

  return { totalTasks, completeTasks, inProgressTasks, blockedTasks, overallPercent, daysRemaining, behindBaseline, unconfirmedSubs, pendingInspections, zeroFloatNotComplete, checklistsDone, checklistsTotal, health }
}

// ============================================================================
// 6. Sub-components
// ============================================================================

function WeatherIcon({ type, className }: { type: 'sun' | 'cloud' | 'rain' | 'storm'; className?: string }) {
  if (type === 'sun') return <Sun className={cn('text-amber-500', className)} />
  if (type === 'rain' || type === 'storm') return <CloudRain className={cn('text-amber-500', className)} />
  return <Cloud className={cn('text-warm-400', className)} />
}

function ScheduleStats({ stats }: { stats: ReturnType<typeof computeScheduleStats> }) {
  const healthColor = stats.health === 'on_track' ? 'bg-green-100 text-green-700' : stats.health === 'at_risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  const healthLabel = stats.health === 'on_track' ? 'On Track' : stats.health === 'at_risk' ? 'At Risk' : 'Behind'
  const HealthIcon = stats.health === 'on_track' ? Activity : stats.health === 'at_risk' ? AlertTriangle : TrendingDown

  return (
    <div className="bg-white border-b border-warm-200 px-4 py-2.5">
      <div className="flex items-center gap-6 text-xs flex-wrap">
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full font-medium', healthColor)}>
          <HealthIcon className="h-3.5 w-3.5" />
          {healthLabel}
        </div>
        <div className="flex items-center gap-1 text-warm-600">
          <span className="font-semibold text-warm-900">{stats.overallPercent}%</span>
          <span>complete</span>
          <span className="text-warm-300 mx-1">|</span>
          <span>{stats.completeTasks}/{stats.totalTasks} tasks</span>
        </div>
        <div className="flex items-center gap-1 text-warm-500">
          <Clock className="h-3 w-3" />
          {stats.daysRemaining}d remaining
        </div>
        {stats.behindBaseline > 0 && (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown className="h-3 w-3" />
            {stats.behindBaseline} behind baseline
          </div>
        )}
        {stats.zeroFloatNotComplete > 0 && (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertTriangle className="h-3 w-3" />
            {stats.zeroFloatNotComplete} zero-float
          </div>
        )}
        {stats.unconfirmedSubs > 0 && (
          <div className="flex items-center gap-1 text-amber-600">
            <CircleDashed className="h-3 w-3" />
            {stats.unconfirmedSubs} unconfirmed subs
          </div>
        )}
        {stats.pendingInspections > 0 && (
          <div className="flex items-center gap-1 text-purple-600">
            <Eye className="h-3 w-3" />
            {stats.pendingInspections} pending inspections
          </div>
        )}
        <div className="flex items-center gap-1 text-warm-500">
          <CheckSquare className="h-3 w-3" />
          {stats.checklistsDone}/{stats.checklistsTotal} checklists
        </div>
      </div>
    </div>
  )
}

function WeatherStrip({ weather, timelineStart, totalDays, timelineWidth }: {
  weather: WeatherDay[]; timelineStart: string; totalDays: number; timelineWidth: number
}) {
  return (
    <div className="relative h-10 border-b border-warm-200 bg-warm-50" style={{ width: timelineWidth }}>
      {weather.map((w) => {
        const pos = getDatePosition(w.date, timelineStart, totalDays)
        return (
          <div key={w.date} className={cn('absolute top-0 h-full flex flex-col items-center justify-center', (w.icon === 'rain' || w.icon === 'storm') && 'bg-amber-50/60')} style={{ left: `${pos}%`, width: `${100 / totalDays}%` }}>
            <WeatherIcon type={w.icon} className="h-3.5 w-3.5" />
            <span className="text-[10px] text-warm-500">{w.high}°</span>
          </div>
        )
      })}
    </div>
  )
}

function TimelineHeader({ columns, zoom, timelineWidth }: {
  columns: { label: string; subLabel?: string; date: Date }[]; zoom: ZoomLevel; timelineWidth: number
}) {
  const colWidth = columns.length > 0 ? timelineWidth / columns.length : 0
  return (
    <div className="flex border-b border-warm-200 bg-warm-100" style={{ width: timelineWidth }}>
      {columns.map((col, i) => (
        <div key={i} className={cn('text-center py-1.5 text-xs text-warm-500 border-l border-warm-200 flex-shrink-0', zoom === 'day' && isWeekend(col.date) && 'bg-warm-200/60')} style={{ width: colWidth }}>
          {col.subLabel && <div className="text-[10px] text-warm-400">{col.subLabel}</div>}
          <div>{col.label}</div>
        </div>
      ))}
    </div>
  )
}

function WeekendShading({ timelineStart, totalDays, timelineWidth, zoom, height }: {
  timelineStart: string; totalDays: number; timelineWidth: number; zoom: ZoomLevel; height: number
}) {
  if (zoom !== 'day') return null

  const startDate = new Date(timelineStart)
  const days = eachDayOfInterval({ start: startDate, end: addDays(startDate, totalDays - 1) })

  return (
    <div className="absolute top-0 left-0 pointer-events-none" style={{ width: timelineWidth, height }}>
      {days.map((day, i) => {
        if (!isWeekend(day)) return null
        const pos = (i / totalDays) * 100
        const width = (1 / totalDays) * 100
        return (
          <div
            key={i}
            className="absolute top-0 h-full bg-warm-200/30"
            style={{ left: `${pos}%`, width: `${width}%` }}
          />
        )
      })}
    </div>
  )
}

function TodayLine({ timelineStart, totalDays, height }: { timelineStart: string; totalDays: number; height: number }) {
  const pos = getDatePosition(TODAY, timelineStart, totalDays)
  if (pos < 0 || pos > 100) return null
  return (
    <div className="absolute top-0 z-20 pointer-events-none" style={{ left: `${pos}%`, height }}>
      <div className="w-px h-full border-l-2 border-dashed border-red-400" />
      <div className="absolute -top-0.5 -left-2.5 bg-red-500 text-white text-[9px] px-1 rounded">Today</div>
    </div>
  )
}

function AIWhyTooltip({ item }: { item: ScheduleItem }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!item.aiPredictedEndDate || !item.aiReasoning) return null

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-1 text-warm-400 hover:text-warm-600 transition-colors"
      >
        <HelpCircle className="h-3 w-3" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-3 bg-white rounded-lg shadow-lg border border-warm-200">
          <div className="text-xs font-medium text-warm-900 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            AI Prediction Factors
          </div>
          <ul className="space-y-1">
            {item.aiReasoning.map((reason, i) => (
              <li key={i} className="text-xs text-warm-600 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">-</span>
                {reason}
              </li>
            ))}
          </ul>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-white border-b border-r border-warm-200 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}

function GanttBar({ item, timelineStart, totalDays, showBaseline }: {
  item: ScheduleItem; timelineStart: string; totalDays: number; showBaseline: boolean
}) {
  if (!item.startDate || !item.endDate) return null
  const config = item.taskType ? TASK_TYPE_CONFIG[item.taskType] : TASK_TYPE_CONFIG.construction
  const isCp = item.isCriticalPath
  const barBg = isCp ? 'bg-red-200' : config.bgColor
  const barFill = isCp ? 'bg-red-500' : config.barColor

  // Milestone: diamond marker
  if (item.taskType === 'milestone' || (item.durationDays === 0 && item.taskType !== 'deadline')) {
    const pos = getDatePosition(item.startDate, timelineStart, totalDays)
    return (
      <div className="relative h-7 flex items-center">
        <div className="absolute flex items-center gap-1.5" style={{ left: `${pos}%`, marginLeft: '-8px' }}>
          <div className={cn('w-4 h-4 rotate-45 border-2', isCp ? 'bg-red-500 border-red-600' : 'bg-emerald-500 border-emerald-600')} />
          <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap ml-1">{item.name}</span>
        </div>
      </div>
    )
  }
  if (item.taskType === 'deadline') {
    const pos = getDatePosition(item.startDate, timelineStart, totalDays)
    return (
      <div className="relative h-7 flex items-center">
        <div className="absolute" style={{ left: `${pos}%`, marginLeft: '-6px' }}>
          <div className="w-3 h-3 rotate-45 bg-red-500" />
        </div>
      </div>
    )
  }

  const left = getDatePosition(item.startDate, timelineStart, totalDays)
  const width = getBarWidth(item.startDate, item.endDate, totalDays)
  const pct = item.percentComplete ?? 0

  return (
    <div className="relative h-7 flex items-center">
      {/* Baseline bar (ghost) */}
      {showBaseline && item.baselineStartDate && item.baselineEndDate && (
        <div className={cn('absolute h-2 rounded opacity-30', config.barColor)} style={{ left: `${getDatePosition(item.baselineStartDate, timelineStart, totalDays)}%`, width: `${getBarWidth(item.baselineStartDate, item.baselineEndDate, totalDays)}%`, top: '2px' }} />
      )}
      {/* Actual dates overlay (thin solid bar above) */}
      {item.actualStartDate && (
        <div className="absolute h-1.5 rounded bg-emerald-500 opacity-60" style={{ left: `${getDatePosition(item.actualStartDate, timelineStart, totalDays)}%`, width: `${getBarWidth(item.actualStartDate, item.actualEndDate ?? item.endDate, totalDays)}%`, top: '1px' }} />
      )}
      {/* Main bar track */}
      <div className={cn('absolute h-5 rounded', barBg)} style={{ left: `${left}%`, width: `${width}%` }}>
        {pct > 0 && (
          <div className={cn('h-full rounded-l', barFill, pct >= 100 && 'rounded-r')} style={{ width: `${Math.min(pct, 100)}%` }} />
        )}
        {/* Progress % label inside bar */}
        {pct > 0 && pct < 100 && width > 3 && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-medium text-white/80">{pct}%</span>
        )}
      </div>
      {/* AI predicted end marker with confidence */}
      {item.aiPredictedEndDate && (
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center" style={{ left: `${getDatePosition(item.aiPredictedEndDate, timelineStart, totalDays)}%` }}>
          <div className="w-0 h-5 border-l-2 border-dashed border-orange-400 opacity-70" />
          {item.aiConfidence && (
            <div className={cn('ml-1 px-1 py-0.5 rounded text-[9px] font-medium', getConfidenceBgColor(item.aiConfidence), getConfidenceColor(item.aiConfidence))}>
              {item.aiConfidence}%
            </div>
          )}
        </div>
      )}
      {/* Sub confirmation on bar */}
      {item.vendor && item.subConfirmation === 'confirmed' && (
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${left + width}%`, marginLeft: '2px' }}>
          <Check className="h-3 w-3 text-green-600" />
        </div>
      )}
      {item.vendor && item.subConfirmation === 'pending' && (
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${left + width}%`, marginLeft: '2px' }}>
          <CircleDashed className="h-3 w-3 text-amber-600" />
        </div>
      )}
      {/* Weather icon */}
      {item.isWeatherSensitive && (
        <div className="absolute -top-1" style={{ left: `${left + width / 2}%`, marginLeft: '-6px' }}>
          <Cloud className="h-3 w-3 text-warm-400" />
        </div>
      )}
    </div>
  )
}

function AggregateBar({ range, timelineStart, totalDays, level }: {
  range: { start: string; end: string; percent: number } | null; timelineStart: string; totalDays: number; level: 'phase' | 'group'
}) {
  if (!range) return <div className="h-5" />
  const left = getDatePosition(range.start, timelineStart, totalDays)
  const width = getBarWidth(range.start, range.end, totalDays)
  const barH = level === 'phase' ? 'h-3' : 'h-2'
  const barColor = level === 'phase' ? 'bg-warm-400' : 'bg-warm-300'
  const fillColor = level === 'phase' ? 'bg-warm-600' : 'bg-warm-500'
  return (
    <div className="relative h-5 flex items-center">
      <div className={cn('absolute rounded', barH, barColor)} style={{ left: `${left}%`, width: `${width}%` }}>
        {range.percent > 0 && (
          <div className={cn('h-full rounded-l', fillColor, range.percent >= 100 && 'rounded-r')} style={{ width: `${range.percent}%` }} />
        )}
      </div>
    </div>
  )
}

function PhaseRow({ phase, isExpanded, onToggle, timelineStart, totalDays, timelineWidth }: {
  phase: SchedulePhase; isExpanded: boolean; onToggle: () => void; timelineStart: string; totalDays: number; timelineWidth: number
}) {
  const allItems = phase.groups.flatMap(g => g.items)
  const range = computeAggregateRange(allItems)
  const taskCount = allItems.filter(i => i.kind === 'task').length
  const checkCount = allItems.filter(i => i.kind === 'checklist').length
  return (
    <div className="flex border-b border-warm-200 bg-warm-100 cursor-pointer hover:bg-warm-200 group" onClick={onToggle}>
      <div className="w-64 flex-shrink-0 px-3 py-2 flex items-center gap-2 sticky left-0 z-10 bg-warm-100 group-hover:bg-warm-200 border-r border-warm-200">
        {isExpanded ? <ChevronDown className="h-4 w-4 text-warm-500 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-warm-500 flex-shrink-0" />}
        <span className="font-semibold text-warm-900 text-sm truncate">{phase.name}</span>
        <span className="text-xs text-warm-400 flex-shrink-0">({taskCount}t, {checkCount}c)</span>
        {range && (
          <span className={cn('text-xs px-1.5 py-0.5 rounded ml-auto flex-shrink-0', range.percent >= 100 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700')}>{range.percent}%</span>
        )}
      </div>
      <div className="relative" style={{ width: timelineWidth }}>
        <AggregateBar range={range} timelineStart={timelineStart} totalDays={totalDays} level="phase" />
      </div>
    </div>
  )
}

function GroupRow({ group, isExpanded, onToggle, timelineStart, totalDays, timelineWidth }: {
  group: ScheduleGroup; isExpanded: boolean; onToggle: () => void; timelineStart: string; totalDays: number; timelineWidth: number
}) {
  const range = computeAggregateRange(group.items)
  const itemCount = group.items.filter(i => i.kind === 'task').length
  return (
    <div className="flex border-b border-warm-100 bg-warm-50 cursor-pointer hover:bg-warm-100 group" onClick={onToggle}>
      <div className="w-64 flex-shrink-0 px-3 py-1.5 flex items-center gap-2 pl-8 sticky left-0 z-10 bg-warm-50 group-hover:bg-warm-100 border-r border-warm-200">
        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-warm-400 flex-shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-warm-400 flex-shrink-0" />}
        <span className="font-medium text-warm-700 text-sm truncate">{group.name}</span>
        <span className="text-xs text-warm-400 flex-shrink-0">({itemCount})</span>
      </div>
      <div className="relative" style={{ width: timelineWidth }}>
        <AggregateBar range={range} timelineStart={timelineStart} totalDays={totalDays} level="group" />
      </div>
    </div>
  )
}

function TaskRow({ item, timelineStart, totalDays, timelineWidth, showBaseline }: {
  item: ScheduleItem; timelineStart: string; totalDays: number; timelineWidth: number; showBaseline: boolean
}) {
  const variance = getVarianceDays(item)

  return (
    <div className="flex border-b border-warm-50 hover:bg-stone-50/50 group">
      <div className="w-64 flex-shrink-0 px-3 py-1.5 pl-14 sticky left-0 z-10 bg-white group-hover:bg-stone-50/50 border-r border-warm-200">
        <div className="flex items-center gap-1.5 min-w-0">
          {item.taskType === 'milestone' ? (
            <span className="font-medium text-sm truncate text-emerald-600 flex items-center gap-1">
              <Diamond className="h-3 w-3 text-emerald-500" />
              {item.name}
            </span>
          ) : item.taskType === 'deadline' ? (
            <span className="font-medium text-sm truncate text-red-600">
              <Flag className="h-3 w-3 inline mr-1" />
              {item.name}
            </span>
          ) : (
            <span className="text-sm text-warm-700 truncate">{item.name}</span>
          )}
          {item.isCriticalPath && item.taskType !== 'milestone' && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded flex-shrink-0">CP</span>
          )}
          {item.totalFloat === 0 && item.status !== 'complete' && !item.isCriticalPath && (
            <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded flex-shrink-0">0F</span>
          )}
          {variance !== null && variance > 0 && (
            <span className="text-[10px] text-red-500 flex items-center gap-0.5 flex-shrink-0">
              <TrendingDown className="h-2.5 w-2.5" />+{variance}d
            </span>
          )}
          {variance !== null && variance < 0 && (
            <span className="text-[10px] text-green-500 flex items-center gap-0.5 flex-shrink-0">
              <TrendingUp className="h-2.5 w-2.5" />{variance}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-warm-400 flex-wrap">
          {item.trade && (
            <span className="text-warm-300">{item.trade}</span>
          )}
          {item.vendor && (
            <span className="flex items-center gap-0.5 truncate">
              <User className="h-3 w-3 flex-shrink-0" />{item.vendor}
            </span>
          )}
          {item.vendor && item.subConfirmation && (() => {
            const cfg = SUB_CONFIRMATION_CONFIG[item.subConfirmation]
            return (
              <span className={cn('flex items-center gap-0.5 px-1 py-px rounded text-[10px] font-medium flex-shrink-0', cfg.badgeClass)}>
                {item.subConfirmation === 'confirmed' && <ShieldCheck className="h-2.5 w-2.5" />}
                {item.subConfirmation === 'pending' && <CircleDashed className="h-2.5 w-2.5" />}
                {cfg.label}
              </span>
            )
          })()}
          {item.linkedInspection && (
            <span className="flex items-center gap-0.5 text-purple-500 flex-shrink-0">
              <ExternalLink className="h-3 w-3" />{item.linkedInspection}
            </span>
          )}
          {item.linkedPO && (
            <span className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
              <Package className="h-3 w-3" />{item.linkedPO}
            </span>
          )}
          {item.linkedDailyLog && (
            <span className="flex items-center gap-0.5 text-stone-500 flex-shrink-0">
              <FileText className="h-3 w-3" />{item.linkedDailyLog}
            </span>
          )}
          {/* AI Predicted date with confidence */}
          {item.aiPredictedEndDate && item.aiConfidence && (
            <span className={cn('flex items-center gap-0.5 text-[10px] font-medium flex-shrink-0', getConfidenceColor(item.aiConfidence))}>
              <Sparkles className="h-2.5 w-2.5" />
              Predicted: {format(parseISO(item.aiPredictedEndDate), 'MMM d')} ({item.aiConfidence}%)
              <AIWhyTooltip item={item} />
            </span>
          )}
        </div>
      </div>
      <div className="relative" style={{ width: timelineWidth }}>
        <GanttBar item={item} timelineStart={timelineStart} totalDays={totalDays} showBaseline={showBaseline} />
      </div>
    </div>
  )
}

function ChecklistRow({ item }: { item: ScheduleItem; timelineWidth: number }) {
  return (
    <div className="flex border-b border-warm-50 hover:bg-stone-50/30 group">
      <div className="w-64 flex-shrink-0 px-3 py-1 pl-14 flex items-center gap-2 sticky left-0 z-10 bg-white group-hover:bg-stone-50/30 border-r border-warm-200">
        {item.isChecked ? <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" /> : <Square className="h-4 w-4 text-warm-300 flex-shrink-0" />}
        <span className={cn('text-sm truncate', item.isChecked ? 'text-warm-400 line-through' : 'text-warm-600')}>{item.name}</span>
      </div>
      <div className="flex-1" />
    </div>
  )
}

function DependencyArrows({ dependencies, itemMap, timelineStart, totalDays, rowHeight }: {
  dependencies: ScheduleDependency[]; itemMap: Map<string, { item: ScheduleItem; rowIndex: number }>; timelineStart: string; totalDays: number; rowHeight: number
}) {
  const lines = dependencies
    .filter(dep => itemMap.has(dep.predecessorId) && itemMap.has(dep.successorId))
    .map(dep => {
      const pred = itemMap.get(dep.predecessorId)!
      const succ = itemMap.get(dep.successorId)!
      const predStart = pred.item.startDate
      const predEnd = pred.item.endDate ?? pred.item.startDate
      const succStart = succ.item.startDate
      const succEnd = succ.item.endDate ?? succ.item.startDate
      if (!predStart || !predEnd || !succStart || !succEnd) return null

      const depConfig = DEPENDENCY_TYPE_CONFIG[dep.type]
      const isCritical = pred.item.isCriticalPath && succ.item.isCriticalPath

      // Calculate positions based on dependency type
      let x1Pct: number, x2Pct: number
      switch (dep.type) {
        case 'SS': // Start-to-Start
          x1Pct = getDatePosition(predStart, timelineStart, totalDays)
          x2Pct = getDatePosition(succStart, timelineStart, totalDays)
          break
        case 'FF': // Finish-to-Finish
          x1Pct = getDatePosition(predEnd, timelineStart, totalDays)
          x2Pct = getDatePosition(succEnd, timelineStart, totalDays)
          break
        case 'SF': // Start-to-Finish
          x1Pct = getDatePosition(predStart, timelineStart, totalDays)
          x2Pct = getDatePosition(succEnd, timelineStart, totalDays)
          break
        case 'FS': // Finish-to-Start (default)
        default:
          x1Pct = getDatePosition(predEnd, timelineStart, totalDays)
          x2Pct = getDatePosition(succStart, timelineStart, totalDays)
          break
      }

      const y1 = pred.rowIndex * rowHeight + rowHeight / 2
      const y2 = succ.rowIndex * rowHeight + rowHeight / 2

      return {
        x1Pct,
        x2Pct,
        y1,
        y2,
        isCritical,
        type: dep.type,
        color: isCritical ? '#ef4444' : depConfig.arrowColor,
        key: `${dep.predecessorId}-${dep.successorId}`
      }
    })
    .filter(Boolean) as { x1Pct: number; x2Pct: number; y1: number; y2: number; isCritical: boolean; type: DependencyType; color: string; key: string }[]

  if (lines.length === 0) return null

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
      <defs>
        <marker id="arrow-gray" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4 Z" fill="#9ca3af" /></marker>
        <marker id="arrow-red" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4 Z" fill="#ef4444" /></marker>
        <marker id="arrow-blue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4 Z" fill="#3b82f6" /></marker>
        <marker id="arrow-green" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4 Z" fill="#16a34a" /></marker>
        <marker id="arrow-orange" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4 Z" fill="#ea580c" /></marker>
        <marker id="arrow-purple" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4 Z" fill="#9333ea" /></marker>
      </defs>
      {lines.map(({ x1Pct, x2Pct, y1, y2, isCritical, type, color, key }) => {
        const markerMap: Record<DependencyType, string> = {
          FS: isCritical ? 'url(#arrow-red)' : 'url(#arrow-blue)',
          SS: isCritical ? 'url(#arrow-red)' : 'url(#arrow-green)',
          FF: isCritical ? 'url(#arrow-red)' : 'url(#arrow-orange)',
          SF: isCritical ? 'url(#arrow-red)' : 'url(#arrow-purple)',
        }
        const marker = markerMap[type]
        const midXPct = x1Pct + 0.3

        // Calculate badge position at midpoint of the arrow path
        const badgeXPct = (x1Pct + x2Pct) / 2
        const badgeY = (y1 + y2) / 2 - 8

        // Badge colors: use lighter fill behind the type label
        const badgeFillMap: Record<DependencyType, string> = {
          FS: '#dbeafe', // stone-100
          SS: '#dcfce7', // green-100
          FF: '#ffedd5', // orange-100
          SF: '#f3e8ff', // purple-100
        }
        const badgeFill = isCritical ? '#fee2e2' : badgeFillMap[type]
        const badgeStroke = isCritical ? '#fca5a5' : color

        return (
          <g key={key}>
            <path
              d={`M ${x1Pct}% ${y1} L ${midXPct}% ${y1} L ${midXPct}% ${y2} L ${x2Pct}% ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth={isCritical ? 1.5 : 1}
              markerEnd={marker}
              opacity={0.7}
            />
            {/* Dependency type badge pill */}
            <g className="select-none">
              <rect
                x={`${badgeXPct}%`}
                y={badgeY - 7}
                width="22"
                height="14"
                rx="7"
                ry="7"
                fill={badgeFill}
                stroke={badgeStroke}
                strokeWidth="0.75"
                opacity={0.95}
                transform={`translate(-11, 0)`}
              />
              <text
                x={`${badgeXPct}%`}
                y={badgeY + 2}
                fontSize="8"
                fill={color}
                textAnchor="middle"
                fontWeight="600"
                letterSpacing="0.3"
              >
                {type}
              </text>
            </g>
          </g>
        )
      })}
    </svg>
  )
}

function ScheduleToolbar({ zoom, onZoomChange, onExpandAll, onCollapseAll, showBaseline, onToggleBaseline, criticalPathOnly, onToggleCriticalPath, hideCompleted, onToggleHideCompleted }: {
  zoom: ZoomLevel; onZoomChange: (z: ZoomLevel) => void; onExpandAll: () => void; onCollapseAll: () => void
  showBaseline: boolean; onToggleBaseline: () => void; criticalPathOnly: boolean; onToggleCriticalPath: () => void
  hideCompleted: boolean; onToggleHideCompleted: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-warm-200">
      <div className="flex items-center gap-2">
        <div className="flex border border-warm-200 rounded-lg overflow-hidden">
          {(['day', 'week', 'month'] as ZoomLevel[]).map(z => (
            <button key={z} onClick={() => onZoomChange(z)} className={cn('px-3 py-1.5 text-xs font-medium capitalize transition-colors', zoom === z ? 'bg-stone-50 text-stone-600' : 'text-warm-500 hover:bg-warm-50')}>{z}</button>
          ))}
        </div>
        <div className="w-px h-6 bg-warm-200" />
        <button onClick={onExpandAll} className="flex items-center gap-1 px-2 py-1.5 text-xs text-warm-500 hover:bg-warm-100 rounded transition-colors" title="Expand all">
          <ChevronsUpDown className="h-3.5 w-3.5" /><span className="hidden sm:inline">Expand</span>
        </button>
        <button onClick={onCollapseAll} className="flex items-center gap-1 px-2 py-1.5 text-xs text-warm-500 hover:bg-warm-100 rounded transition-colors" title="Collapse all">
          <ChevronsDownUp className="h-3.5 w-3.5" /><span className="hidden sm:inline">Collapse</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-warm-500 cursor-pointer">
          <input type="checkbox" checked={criticalPathOnly} onChange={onToggleCriticalPath} className="rounded border-warm-300 text-red-500 focus:ring-red-500" />
          Critical Path
        </label>
        <label className="flex items-center gap-1.5 text-xs text-warm-500 cursor-pointer">
          <input type="checkbox" checked={hideCompleted} onChange={onToggleHideCompleted} className="rounded border-warm-300 text-stone-500 focus:ring-stone-500" />
          Hide Completed
        </label>
        <label className="flex items-center gap-1.5 text-xs text-warm-500 cursor-pointer">
          <input type="checkbox" checked={showBaseline} onChange={onToggleBaseline} className="rounded border-warm-300 text-warm-500 focus:ring-warm-500" />
          Baselines
        </label>
      </div>
    </div>
  )
}

function ScheduleLegend() {
  return (
    <div className="bg-white border-t border-warm-200 px-4 py-2.5">
      <div className="flex items-center gap-4 text-xs text-warm-500 flex-wrap">
        {(Object.entries(TASK_TYPE_CONFIG) as [TaskType, typeof TASK_TYPE_CONFIG[TaskType]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            {key === 'milestone' ? <div className={cn('w-2.5 h-2.5 rotate-45', cfg.barColor)} /> : <div className={cn('w-4 h-2.5 rounded-sm', cfg.barColor)} />}
            <span>{cfg.label}</span>
          </div>
        ))}
        <div className="w-px h-4 bg-warm-200" />
        <div className="flex items-center gap-1.5"><div className="w-4 h-2.5 rounded-sm bg-red-500" /><span>Critical Path</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-2.5 rounded-sm bg-stone-300 opacity-30" /><span>Baseline</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-1.5 rounded-sm bg-emerald-500 opacity-60" /><span>Actual Dates</span></div>
        <div className="flex items-center gap-1.5"><div className="w-0 h-4 border-l-2 border-dashed border-orange-400 opacity-70" /><span>AI Predicted</span></div>
        <div className="flex items-center gap-1.5"><div className="w-0 h-4 border-l-2 border-dashed border-red-400" /><span>Today</span></div>
        <div className="w-px h-4 bg-warm-200" />
        <div className="flex items-center gap-1.5"><Check className="h-3 w-3 text-green-600" /><span>Sub Confirmed</span></div>
        <div className="flex items-center gap-1.5"><CircleDashed className="h-3 w-3 text-amber-600" /><span>Awaiting Sub</span></div>
      </div>
      {/* Dependency type legend */}
      <div className="flex items-center gap-4 text-xs text-warm-500 mt-2 pt-2 border-t border-warm-100">
        <span className="font-medium text-warm-600">Dependencies:</span>
        {(Object.entries(DEPENDENCY_TYPE_CONFIG) as [DependencyType, typeof DEPENDENCY_TYPE_CONFIG[DependencyType]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-0.5 rounded', key === 'FS' ? 'bg-stone-500' : key === 'SS' ? 'bg-green-500' : key === 'FF' ? 'bg-orange-500' : 'bg-purple-500')} />
            <span className={cfg.color}>{key}</span>
            <span className="text-warm-400">({cfg.label})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LookAheadPanel({ phases }: { phases: SchedulePhase[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const today = parseISO(TODAY)
  const twoWeeks = addDays(today, 14)

  const allTasks = phases.flatMap(p => p.groups.flatMap(g => g.items)).filter(i => i.kind === 'task' && i.startDate && i.endDate)

  const starting = allTasks.filter(t => {
    const s = parseISO(t.startDate!)
    return !isBefore(s, today) && isBefore(s, twoWeeks) && t.status === 'not_started'
  })
  const continuing = allTasks.filter(t => t.status === 'in_progress')
  const deliveries = allTasks.filter(t => {
    const s = parseISO(t.startDate!)
    return t.taskType === 'delivery' && !isBefore(s, today) && isBefore(s, twoWeeks)
  })
  const inspections = allTasks.filter(t => {
    const s = parseISO(t.startDate!)
    return t.taskType === 'inspection' && !isBefore(s, today) && isBefore(s, twoWeeks) && t.status !== 'complete'
  })
  const needConfirmation = allTasks.filter(t => {
    const s = parseISO(t.startDate!)
    return t.vendor && t.subConfirmation !== 'confirmed' && !isBefore(s, today) && isBefore(s, addDays(today, 21)) && t.status !== 'complete'
  })

  return (
    <div className="bg-white border-t border-warm-200">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-warm-50 transition-colors">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-stone-600" />
          <span className="font-medium text-sm text-warm-900">Two-Week Look-Ahead</span>
          <span className="text-xs text-warm-400">Next 14 days</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-warm-500">
          <span>{starting.length} starting</span>
          <span>{continuing.length} continuing</span>
          {deliveries.length > 0 && <span className="text-amber-600">{deliveries.length} deliveries</span>}
          {inspections.length > 0 && <span className="text-purple-600">{inspections.length} inspections</span>}
          {needConfirmation.length > 0 && <span className="text-amber-600">{needConfirmation.length} need confirmation</span>}
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-4 text-sm">
          {/* Starting soon */}
          <div>
            <h4 className="font-medium text-warm-700 mb-1.5 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 text-stone-500" /> Starting Soon</h4>
            {starting.length === 0 ? <p className="text-xs text-warm-400">None</p> : (
              <div className="space-y-1">
                {starting.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className="text-warm-400 w-12">{format(parseISO(t.startDate!), 'MMM d')}</span>
                    <span className="text-warm-700 truncate">{t.name}</span>
                    {t.vendor && <span className="text-warm-400 truncate">— {t.vendor}</span>}
                    {t.subConfirmation === 'pending' && <CircleDashed className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                    {t.subConfirmation === 'not_sent' && <AlertTriangle className="h-3 w-3 text-warm-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Continuing */}
          <div>
            <h4 className="font-medium text-warm-700 mb-1.5 flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-green-500" /> In Progress</h4>
            {continuing.length === 0 ? <p className="text-xs text-warm-400">None</p> : (
              <div className="space-y-1">
                {continuing.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className="text-warm-400 w-12">{t.percentComplete}%</span>
                    <span className="text-warm-700 truncate">{t.name}</span>
                    {t.vendor && <span className="text-warm-400 truncate">— {t.vendor}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Deliveries & Inspections */}
          {(deliveries.length > 0 || inspections.length > 0) && (
            <>
              <div>
                <h4 className="font-medium text-warm-700 mb-1.5 flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-amber-500" /> Deliveries Expected</h4>
                {deliveries.length === 0 ? <p className="text-xs text-warm-400">None</p> : (
                  <div className="space-y-1">
                    {deliveries.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <span className="text-warm-400 w-12">{format(parseISO(t.startDate!), 'MMM d')}</span>
                        <span className="text-warm-700 truncate">{t.name}</span>
                        {t.linkedPO && <span className="text-amber-500">{t.linkedPO}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-warm-700 mb-1.5 flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-purple-500" /> Inspections Scheduled</h4>
                {inspections.length === 0 ? <p className="text-xs text-warm-400">None</p> : (
                  <div className="space-y-1">
                    {inspections.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <span className="text-warm-400 w-12">{format(parseISO(t.startDate!), 'MMM d')}</span>
                        <span className="text-warm-700 truncate">{t.name}</span>
                        {t.linkedInspection && <span className="text-purple-500">{t.linkedInspection}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {/* Vendor confirmations needed */}
          {needConfirmation.length > 0 && (
            <div className="col-span-2">
              <h4 className="font-medium text-amber-700 mb-1.5 flex items-center gap-1"><CircleDashed className="h-3.5 w-3.5" /> Vendor Confirmations Needed</h4>
              <div className="flex gap-3 flex-wrap">
                {needConfirmation.map(t => (
                  <div key={t.id} className="flex items-center gap-1.5 text-xs bg-amber-50 px-2 py-1 rounded">
                    <span className="text-amber-700 font-medium">{t.vendor}</span>
                    <span className="text-amber-600">— {t.name}</span>
                    <span className="text-amber-500">({format(parseISO(t.startDate!), 'MMM d')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 7. Main Component
// ============================================================================

export function SchedulePreview() {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(mockPhases.map(p => p.id)))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(mockPhases.flatMap(p => p.groups.map(g => g.id))))
  const [zoom, setZoom] = useState<ZoomLevel>('week')
  const [showBaseline, setShowBaseline] = useState(false)
  const [criticalPathOnly, setCriticalPathOnly] = useState(false)
  const [hideCompleted, setHideCompleted] = useState(false)

  const filters = useFilterState({ defaultTab: 'all', defaultSort: 'start_date' })
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')

  const ganttRef = useRef<HTMLDivElement>(null)

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const expandAll = () => { setExpandedPhases(new Set(mockPhases.map(p => p.id))); setExpandedGroups(new Set(mockPhases.flatMap(p => p.groups.map(g => g.id)))) }
  const collapseAll = () => { setExpandedPhases(new Set()); setExpandedGroups(new Set()) }

  const totalDays = daysBetween(PROJECT_START, PROJECT_END) + 1
  const pxPerDay = getPxPerDay(zoom)
  const timelineWidth = totalDays * pxPerDay
  const columns = useMemo(() => getTimelineColumns(PROJECT_START, PROJECT_END, zoom), [zoom])

  const allVendors = useMemo(() => {
    const vendors = new Set<string>()
    mockPhases.forEach(p => p.groups.forEach(g => g.items.forEach(i => { if (i.vendor) vendors.add(i.vendor) })))
    return [...vendors].sort()
  }, [])

  const filteredPhases = useMemo(() => {
    return mockPhases.map(phase => {
      if (filters.activeTab !== 'all' && phase.id !== filters.activeTab) return null
      const filteredGroups = phase.groups.map(group => {
        const filteredItems = group.items.filter(item => {
          if (filters.search && !matchesSearch(item, filters.search, ['name', 'vendor', 'assignee', 'trade'])) return false
          if (typeFilter !== 'all' && item.kind === 'task' && item.taskType !== typeFilter) return false
          if (typeFilter !== 'all' && item.kind === 'checklist') return false
          if (statusFilter !== 'all' && item.kind === 'task' && item.status !== statusFilter) return false
          if (statusFilter !== 'all' && item.kind === 'checklist') return false
          if (vendorFilter !== 'all' && item.vendor !== vendorFilter) return false
          if (criticalPathOnly && !item.isCriticalPath) return false
          if (hideCompleted && item.kind === 'task' && item.status === 'complete') return false
          if (hideCompleted && item.kind === 'checklist' && item.isChecked) return false
          return true
        })
        if (filteredItems.length === 0) return null
        return { ...group, items: filteredItems }
      }).filter(Boolean) as ScheduleGroup[]
      if (filteredGroups.length === 0) return null
      return { ...phase, groups: filteredGroups }
    }).filter(Boolean) as SchedulePhase[]
  }, [filters.activeTab, filters.search, typeFilter, statusFilter, vendorFilter, criticalPathOnly, hideCompleted])

  const rowPositionMap = useMemo(() => {
    const map = new Map<string, { item: ScheduleItem; rowIndex: number }>()
    let rowIndex = 0
    filteredPhases.forEach(phase => {
      rowIndex++
      if (!expandedPhases.has(phase.id)) return
      phase.groups.forEach(group => {
        rowIndex++
        if (!expandedGroups.has(group.id)) return
        group.items.forEach(item => {
          if (item.kind === 'task') map.set(item.id, { item, rowIndex })
          rowIndex++
        })
      })
    })
    return map
  }, [filteredPhases, expandedPhases, expandedGroups])

  const totalRenderedRows = useMemo(() => {
    let count = 0
    filteredPhases.forEach(phase => {
      count++
      if (!expandedPhases.has(phase.id)) return
      phase.groups.forEach(group => { count++; if (!expandedGroups.has(group.id)) return; count += group.items.length })
    })
    return count
  }, [filteredPhases, expandedPhases, expandedGroups])

  const totalItems = mockPhases.reduce((sum, p) => sum + p.groups.reduce((s, g) => s + g.items.length, 0), 0)
  const filteredItemCount = filteredPhases.reduce((sum, p) => sum + p.groups.reduce((s, g) => s + g.items.length, 0), 0)

  const phaseTabs = useMemo(() => [
    { key: 'all', label: 'All Phases', count: totalItems },
    ...mockPhases.map(p => ({ key: p.id, label: p.name, count: p.groups.reduce((s, g) => s + g.items.length, 0) })),
  ], [totalItems])

  const stats = useMemo(() => computeScheduleStats(mockPhases), [])

  const ROW_HEIGHT = 32

  // AI Features for the schedule
  const aiFeatures = [
    {
      feature: 'Duration Learning',
      trigger: 'Real-time',
      insight: 'Framing tasks averaging 12% longer than estimated. Suggest: Adjust template durations.',
      detail: 'Based on analysis of 47 similar framing tasks across 12 projects over the past 6 months.',
      confidence: 89,
      severity: 'warning' as const,
      action: { label: 'Adjust Templates', onClick: () => {} },
    },
    {
      feature: 'Weather Integration',
      trigger: 'Daily',
      insight: 'Rain forecast Thu-Fri. 3 outdoor tasks may be affected. Recommend: Move interior work forward.',
      detail: 'Tasks affected: Set roof trusses, Roof sheathing & dry-in, Install roofing underlayment',
      confidence: 92,
      severity: 'warning' as const,
      action: { label: 'View Reschedule Options', onClick: () => {} },
    },
    {
      feature: 'Completion Prediction',
      trigger: 'Real-time',
      insight: 'Project completion: Mar 28 (was Mar 22). Delay factors: Framing (+3 days), Weather (+2 days)',
      detail: 'Critical path analysis indicates 6-day slip from baseline. Recovery possible with crew addition.',
      confidence: 85,
      severity: 'critical' as const,
      action: { label: 'View Recovery Plan', onClick: () => {} },
    },
    {
      feature: 'Schedule Optimization',
      trigger: 'On change',
      insight: 'Moving HVAC rough-in before electrical could save 2 days. Both crews available.',
      detail: 'No resource conflicts detected. Requires coordination meeting with Smith Electric and HVAC contractor.',
      confidence: 78,
      severity: 'success' as const,
      action: { label: 'Apply Optimization', onClick: () => {} },
    },
    {
      feature: 'Vendor Reliability',
      trigger: 'On submission',
      insight: 'ABC Drywall: 2 of last 5 tasks started late. Consider buffer or backup vendor.',
      detail: 'Average delay: 1.8 days. Root causes: Material availability (60%), Crew scheduling (40%)',
      confidence: 94,
      severity: 'warning' as const,
      action: { label: 'View Vendor History', onClick: () => {} },
    },
    {
      feature: 'Variance Analysis',
      trigger: 'Weekly',
      insight: 'Phase 1 completed 4 days late. Root cause: Permit delay (3 days), Rain (1 day)',
      detail: 'Recommend: Add 2-day buffer for permit-dependent phases. Weather contingency adequate.',
      confidence: 96,
      severity: 'info' as const,
      action: { label: 'Update Risk Register', onClick: () => {} },
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-warm-900">Schedule — Smith Residence</h3>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', stats.health === 'on_track' ? 'bg-green-100 text-green-700' : stats.health === 'at_risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                {stats.health === 'on_track' ? 'On Track' : stats.health === 'at_risk' ? 'At Risk' : 'Behind Schedule'}
              </span>
            </div>
            <div className="text-sm text-warm-500 mt-0.5 flex items-center gap-4">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Nov 4, 2025 — Mar 20, 2026 ({totalDays} days)</span>
              <span className="flex items-center gap-1">
                <CalendarClock className="h-4 w-4" />
                Predicted: Mar 28
                <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium ml-1', getConfidenceBgColor(85), getConfidenceColor(85))}>
                  85% confidence
                </span>
                <AIWhyTooltip item={{
                  id: 'project',
                  groupId: '',
                  name: 'Project',
                  kind: 'task',
                  aiPredictedEndDate: '2026-03-28',
                  aiConfidence: 85,
                  aiReasoning: ['Framing phase delay (+3 days)', 'Weather forecast impact (+2 days)', 'Vendor reliability adjustment (+1 day)']
                }} />
              </span>
              <span className="flex items-center gap-1 text-amber-600"><CloudRain className="h-4 w-4" />Rain forecast Thu-Fri</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50"><Download className="h-4 w-4" />Export</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-600 text-white rounded-lg hover:bg-stone-700"><Plus className="h-4 w-4" />Add Task</button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <ScheduleStats stats={stats} />

      {/* FilterBar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <FilterBar
          search={filters.search} onSearchChange={filters.setSearch} searchPlaceholder="Search tasks, vendors, trades..."
          tabs={phaseTabs} activeTab={filters.activeTab} onTabChange={filters.setActiveTab}
          dropdowns={[
            { label: 'Task Type', value: typeFilter, options: (Object.entries(TASK_TYPE_CONFIG) as [TaskType, typeof TASK_TYPE_CONFIG[TaskType]][]).map(([k, v]) => ({ value: k, label: v.label })), onChange: setTypeFilter },
            { label: 'Status', value: statusFilter, options: (Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([k, v]) => ({ value: k, label: v })), onChange: setStatusFilter },
            { label: 'Vendor', value: vendorFilter, options: allVendors.map(v => ({ value: v, label: v })), onChange: setVendorFilter },
          ]}
          resultCount={filteredItemCount} totalCount={totalItems}
        />
      </div>

      {/* Toolbar */}
      <ScheduleToolbar zoom={zoom} onZoomChange={setZoom} onExpandAll={expandAll} onCollapseAll={collapseAll} showBaseline={showBaseline} onToggleBaseline={() => setShowBaseline(b => !b)} criticalPathOnly={criticalPathOnly} onToggleCriticalPath={() => setCriticalPathOnly(b => !b)} hideCompleted={hideCompleted} onToggleHideCompleted={() => setHideCompleted(b => !b)} />

      {/* Gantt Chart */}
      <div className="overflow-x-auto" ref={ganttRef}>
        <div className="flex min-w-max">
          <div className="w-64 flex-shrink-0 sticky left-0 z-20 bg-white" />
          <div className="flex-shrink-0">
            <WeatherStrip weather={mockWeather} timelineStart={PROJECT_START} totalDays={totalDays} timelineWidth={timelineWidth} />
            <TimelineHeader columns={columns} zoom={zoom} timelineWidth={timelineWidth} />
          </div>
        </div>

        <div className="relative">
          {/* Weekend shading layer (only on day zoom) */}
          <div className="absolute top-0 left-64 right-0 pointer-events-none" style={{ width: timelineWidth, height: totalRenderedRows * ROW_HEIGHT }}>
            <WeekendShading timelineStart={PROJECT_START} totalDays={totalDays} timelineWidth={timelineWidth} zoom={zoom} height={totalRenderedRows * ROW_HEIGHT} />
          </div>

          {filteredPhases.map(phase => {
            const phaseExpanded = expandedPhases.has(phase.id)
            return (
              <div key={phase.id}>
                <PhaseRow phase={phase} isExpanded={phaseExpanded} onToggle={() => togglePhase(phase.id)} timelineStart={PROJECT_START} totalDays={totalDays} timelineWidth={timelineWidth} />
                {phaseExpanded && phase.groups.map(group => {
                  const groupExpanded = expandedGroups.has(group.id)
                  return (
                    <div key={group.id}>
                      <GroupRow group={group} isExpanded={groupExpanded} onToggle={() => toggleGroup(group.id)} timelineStart={PROJECT_START} totalDays={totalDays} timelineWidth={timelineWidth} />
                      {groupExpanded && group.items.map(item => (
                        item.kind === 'checklist' ? (
                          <ChecklistRow key={item.id} item={item} timelineWidth={timelineWidth} />
                        ) : (
                          <TaskRow key={item.id} item={item} timelineStart={PROJECT_START} totalDays={totalDays} timelineWidth={timelineWidth} showBaseline={showBaseline} />
                        )
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}

          <div className="absolute top-0 left-64 right-0 h-full pointer-events-none" style={{ width: timelineWidth }}>
            <TodayLine timelineStart={PROJECT_START} totalDays={totalDays} height={9999} />
          </div>

          {rowPositionMap.size > 0 && (
            <div className="absolute top-0 left-64 right-0 pointer-events-none" style={{ width: timelineWidth, height: totalRenderedRows * ROW_HEIGHT }}>
              <DependencyArrows dependencies={mockDependencies} itemMap={rowPositionMap} timelineStart={PROJECT_START} totalDays={totalDays} rowHeight={ROW_HEIGHT} />
            </div>
          )}
        </div>
      </div>

      {/* Two-Week Look-Ahead */}
      <LookAheadPanel phases={mockPhases} />

      {/* Legend */}
      <ScheduleLegend />

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Schedule Intelligence"
          features={aiFeatures}
          columns={2}
        />
      </div>
    </div>
  )
}
