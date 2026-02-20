'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  Calendar,
  Building2,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  ClipboardList,
  Hash,
  RotateCcw,
  User,
  Paperclip,
  Link2,
  ShoppingCart,
  Truck,
  Stamp,
  CalendarClock,
  Package,
  ChevronDown,
  ChevronRight,
  Check,
  PenLine,
  FileDown,
  BadgeCheck,
  Layers,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { BulkSelectBar, AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ────────────────────────────────────────────────────

type SubmittalStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'approved_as_noted'
  | 'revise_resubmit'
  | 'rejected'

type ResponseAction = 'approved' | 'approved_as_noted' | 'revise_and_resubmit' | 'rejected' | 'no_exceptions'

interface DigitalSignature {
  signedBy: string
  signedAt: string
  licenseNumber?: string
}

interface ReviewStamp {
  action: ResponseAction
  reviewerName: string
  reviewerCompany: string
  reviewerRole: string
  stampedAt: string
  comments?: string
  licenseNumber?: string
  digitalSignature?: DigitalSignature
}

interface SubmittalDistribution {
  recipientName: string
  recipientCompany: string
  recipientRole: string
  sentAt: string
  viewedAt?: string
  responded: boolean
}

interface Submittal {
  id: string
  number: string
  description: string
  specSection: string
  tradeCategory: string
  vendor: string
  dateSubmitted: string
  requiredDate: string
  daysInReview: number
  status: SubmittalStatus
  revision: number
  leadTimeDays?: number
  documentCount: number
  distribution: SubmittalDistribution[]
  stamps: ReviewStamp[]
  selectionLink?: { selectionName: string; room: string }
  scheduleDependency?: { taskName: string; impactDays: number; critical: boolean }
  linkedPO?: { poNumber: string; holdStatus: 'on_hold' | 'released'; amount?: number; vendor?: string }
  permitRequired: boolean
  aiNote?: string
  aiPredictedApprovalDays?: number
  packageId?: string
  packageName?: string
}

interface SubmittalPackage {
  id: string
  name: string
  submittals: Submittal[]
}

// ── Mock Data ────────────────────────────────────────────────

const mockSubmittals: Submittal[] = [
  {
    id: '1',
    number: 'SUB-001',
    description: 'Impact-rated aluminum storefront system — shop drawings and product data',
    specSection: '08 41 13 - Aluminum Storefronts',
    tradeCategory: 'Openings',
    vendor: 'PGT Industries',
    dateSubmitted: '2024-11-28',
    requiredDate: '2024-12-10',
    daysInReview: 14,
    status: 'under_review',
    revision: 1,
    leadTimeDays: 42,
    documentCount: 3,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-11-28', viewedAt: '2024-11-29', responded: false },
      { recipientName: 'Dan Ross', recipientCompany: 'Ross Custom Homes', recipientRole: 'PM (CC)', sentAt: '2024-11-28', viewedAt: '2024-11-28', responded: false },
    ],
    stamps: [],
    scheduleDependency: { taskName: 'Storefront installation', impactDays: 4, critical: true },
    linkedPO: { poNumber: 'PO-2024-038', holdStatus: 'on_hold' },
    permitRequired: false,
    aiNote: 'Review exceeds typical 10-day cycle — follow up recommended. Architect has not opened since Nov 29.',
    aiPredictedApprovalDays: 3,
  },
  {
    id: '2',
    number: 'SUB-002',
    description: 'Structural steel shop drawings — connections and erection plan',
    specSection: '05 12 00 - Structural Steel',
    tradeCategory: 'Structural',
    vendor: 'Gulf Coast Steel',
    dateSubmitted: '2024-11-25',
    requiredDate: '2024-12-05',
    daysInReview: 17,
    status: 'approved',
    revision: 2,
    leadTimeDays: 28,
    documentCount: 8,
    distribution: [
      { recipientName: 'Mark Thompson', recipientCompany: 'Bay Engineering', recipientRole: 'Structural Engineer', sentAt: '2024-11-25', viewedAt: '2024-11-25', responded: true },
    ],
    stamps: [
      { action: 'revise_and_resubmit', reviewerName: 'Mark Thompson', reviewerCompany: 'Bay Engineering', reviewerRole: 'Structural Engineer', stampedAt: '2024-11-30', comments: 'Connection details at grid B-4 need revision per updated soils report', licenseNumber: 'PE-48291-FL' },
      { action: 'approved', reviewerName: 'Mark Thompson', reviewerCompany: 'Bay Engineering', reviewerRole: 'Structural Engineer', stampedAt: '2024-12-08', comments: 'Approved. Revised connections acceptable.', licenseNumber: 'PE-48291-FL', digitalSignature: { signedBy: 'Mark Thompson, PE', signedAt: '2024-12-08', licenseNumber: 'PE-48291-FL' } },
    ],
    linkedPO: { poNumber: 'PO-2024-022', holdStatus: 'released' },
    permitRequired: true,
    scheduleDependency: { taskName: 'Steel erection', impactDays: 0, critical: false },
  },
  {
    id: '3',
    number: 'SUB-003',
    description: 'Kitchen cabinet elevations, materials, and hardware selections',
    specSection: '06 41 00 - Custom Casework',
    tradeCategory: 'Finishes',
    vendor: 'Custom Cabinet Co',
    dateSubmitted: '2024-12-02',
    requiredDate: '2024-12-12',
    daysInReview: 10,
    status: 'under_review',
    revision: 1,
    leadTimeDays: 56,
    documentCount: 5,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-12-02', viewedAt: '2024-12-03', responded: false },
      { recipientName: 'Lisa Anderson', recipientCompany: 'Client', recipientRole: 'Owner', sentAt: '2024-12-02', viewedAt: '2024-12-04', responded: false },
    ],
    stamps: [],
    selectionLink: { selectionName: 'Kitchen Cabinetry Package', room: 'Kitchen' },
    scheduleDependency: { taskName: 'Cabinet installation', impactDays: 8, critical: true },
    linkedPO: { poNumber: 'PO-2024-041', holdStatus: 'on_hold', amount: 12400, vendor: 'ABC Cabinets' },
    permitRequired: false,
    aiNote: 'Vendor historically requires 2 revision cycles. 56-day lead time — order by Jan 10 to meet install date.',
    aiPredictedApprovalDays: 18,
    packageId: 'pkg-kitchen',
    packageName: 'Kitchen Appliance Package',
  },
  {
    id: '4',
    number: 'SUB-004',
    description: 'HVAC equipment cut sheets, specs, and energy calculations',
    specSection: '23 05 00 - HVAC',
    tradeCategory: 'MEP',
    vendor: 'Cool Air HVAC',
    dateSubmitted: '2024-12-05',
    requiredDate: '2024-12-19',
    daysInReview: 7,
    status: 'submitted',
    revision: 1,
    leadTimeDays: 35,
    documentCount: 4,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Mechanical Engineer', sentAt: '2024-12-05', viewedAt: undefined, responded: false },
    ],
    stamps: [],
    permitRequired: true,
    scheduleDependency: { taskName: 'Mechanical rough-in', impactDays: 2, critical: false },
    aiNote: 'Engineer has not yet viewed. 35-day lead time requires approval by Dec 19.',
    aiPredictedApprovalDays: 8,
  },
  {
    id: '5',
    number: 'SUB-005',
    description: 'Roofing system — underlayment, flashing, and shingle details',
    specSection: '07 31 00 - Shingles',
    tradeCategory: 'Exterior',
    vendor: 'ABC Roofing Supply',
    dateSubmitted: '2024-12-08',
    requiredDate: '2024-12-22',
    daysInReview: 4,
    status: 'approved_as_noted',
    revision: 1,
    leadTimeDays: 7,
    documentCount: 2,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-12-08', viewedAt: '2024-12-08', responded: true },
    ],
    stamps: [
      { action: 'approved_as_noted', reviewerName: 'Sarah Chen', reviewerCompany: 'Smith Architects', reviewerRole: 'Architect', stampedAt: '2024-12-11', comments: 'Approved — use ice & water shield at all valleys per local code', digitalSignature: { signedBy: 'Sarah Chen, AIA', signedAt: '2024-12-11' } },
    ],
    linkedPO: { poNumber: 'PO-2024-045', holdStatus: 'released' },
    permitRequired: false,
  },
  {
    id: '6',
    number: 'SUB-006',
    description: 'Plumbing fixtures and trim selections — master bath and powder room',
    specSection: '22 40 00 - Plumbing Fixtures',
    tradeCategory: 'MEP',
    vendor: 'Jones Plumbing Supply',
    dateSubmitted: '2024-12-10',
    requiredDate: '2024-12-24',
    daysInReview: 2,
    status: 'pending',
    revision: 1,
    documentCount: 3,
    distribution: [],
    stamps: [],
    selectionLink: { selectionName: 'Master Bath Fixtures', room: 'Master Bathroom' },
    permitRequired: false,
    aiNote: 'Owner selection meeting scheduled for Dec 15 — submittal pending owner decisions',
    aiPredictedApprovalDays: 12,
  },
  {
    id: '7',
    number: 'SUB-007',
    description: 'Exterior paint colors and finish schedule',
    specSection: '09 91 00 - Painting',
    tradeCategory: 'Finishes',
    vendor: 'Sherwin-Williams',
    dateSubmitted: '2024-11-20',
    requiredDate: '2024-12-04',
    daysInReview: 22,
    status: 'revise_resubmit',
    revision: 2,
    documentCount: 1,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-11-20', viewedAt: '2024-11-21', responded: true },
      { recipientName: 'Lisa Anderson', recipientCompany: 'Client', recipientRole: 'Owner', sentAt: '2024-11-20', viewedAt: '2024-11-22', responded: true },
    ],
    stamps: [
      { action: 'rejected', reviewerName: 'Lisa Anderson', reviewerCompany: 'Client', reviewerRole: 'Owner', stampedAt: '2024-11-24', comments: 'Colors do not match HOA requirements — need earth tones per HOA covenant Section 4.2' },
      { action: 'revise_and_resubmit', reviewerName: 'Sarah Chen', reviewerCompany: 'Smith Architects', reviewerRole: 'Architect', stampedAt: '2024-11-25', comments: 'New colors must comply with HOA palette. Please resubmit with 3 compliant options.' },
    ],
    permitRequired: false,
    aiNote: 'Rev 2 pending resubmission. HOA palette restrictions noted. Vendor notified Dec 1.',
  },
  {
    id: '8',
    number: 'SUB-008',
    description: 'Electrical panel schedules and circuit layout',
    specSection: '26 24 00 - Switchboards',
    tradeCategory: 'MEP',
    vendor: 'Smith Electric',
    dateSubmitted: '2024-12-01',
    requiredDate: '2024-12-15',
    daysInReview: 11,
    status: 'under_review',
    revision: 1,
    leadTimeDays: 21,
    documentCount: 6,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Electrical Engineer', sentAt: '2024-12-01', viewedAt: '2024-12-02', responded: false },
    ],
    stamps: [],
    permitRequired: true,
    scheduleDependency: { taskName: 'Electrical rough-in', impactDays: 3, critical: false },
    aiPredictedApprovalDays: 5,
  },
  {
    id: '9',
    number: 'SUB-009',
    description: 'Window schedule — impact-rated units with NOA documentation',
    specSection: '08 51 13 - Aluminum Windows',
    tradeCategory: 'Openings',
    vendor: 'PGT Industries',
    dateSubmitted: '2024-12-12',
    requiredDate: '2024-12-26',
    daysInReview: 0,
    status: 'approved',
    revision: 1,
    leadTimeDays: 49,
    documentCount: 4,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-12-12', viewedAt: '2024-12-12', responded: true },
    ],
    stamps: [
      { action: 'no_exceptions', reviewerName: 'Sarah Chen', reviewerCompany: 'Smith Architects', reviewerRole: 'Architect', stampedAt: '2024-12-12', comments: 'All units match spec. NOA documentation verified.', digitalSignature: { signedBy: 'Sarah Chen, AIA', signedAt: '2024-12-12' } },
    ],
    linkedPO: { poNumber: 'PO-2024-050', holdStatus: 'released' },
    permitRequired: true,
    scheduleDependency: { taskName: 'Window installation', impactDays: 0, critical: false },
  },
  {
    id: '10',
    number: 'SUB-010',
    description: 'Tile selections — floor and wall for all bathrooms',
    specSection: '09 30 00 - Tiling',
    tradeCategory: 'Finishes',
    vendor: 'Florida Tile Distributors',
    dateSubmitted: '2024-12-01',
    requiredDate: '2024-12-28',
    daysInReview: 12,
    status: 'pending',
    revision: 1,
    documentCount: 2,
    distribution: [],
    stamps: [],
    selectionLink: { selectionName: 'Bathroom Tile Package', room: 'Master Bathroom' },
    permitRequired: false,
    aiNote: 'Awaiting owner selection confirmation. 3 options under review by client. Tile samples requested 12 days ago.',
    aiPredictedApprovalDays: 14,
  },
  {
    id: '11',
    number: 'SUB-011',
    description: 'Kitchen range hood and ventilation',
    specSection: '23 37 00 - Kitchen Ventilation',
    tradeCategory: 'MEP',
    vendor: 'Viking Range Corp',
    dateSubmitted: '2024-12-02',
    requiredDate: '2024-12-16',
    daysInReview: 10,
    status: 'under_review',
    revision: 1,
    leadTimeDays: 42,
    documentCount: 2,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-12-02', viewedAt: '2024-12-08', responded: false },
    ],
    stamps: [],
    permitRequired: false,
    packageId: 'pkg-kitchen',
    packageName: 'Kitchen Appliance Package',
  },
  {
    id: '12',
    number: 'SUB-012',
    description: 'Built-in refrigerator specifications',
    specSection: '11 31 00 - Residential Appliances',
    tradeCategory: 'Finishes',
    vendor: 'Sub-Zero Group',
    dateSubmitted: '2024-12-02',
    requiredDate: '2024-12-16',
    daysInReview: 10,
    status: 'under_review',
    revision: 1,
    leadTimeDays: 60,
    documentCount: 3,
    distribution: [
      { recipientName: 'Sarah Chen', recipientCompany: 'Smith Architects', recipientRole: 'Architect', sentAt: '2024-12-02', viewedAt: '2024-12-08', responded: false },
    ],
    stamps: [],
    permitRequired: false,
    packageId: 'pkg-kitchen',
    packageName: 'Kitchen Appliance Package',
  },
]

// ── Config ────────────────────────────────────────────────────

const statusConfig: Record<SubmittalStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', color: 'text-warm-700', bgColor: 'bg-warm-100', icon: FileText },
  submitted: { label: 'Submitted', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: Send },
  under_review: { label: 'Under Review', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Eye },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  approved_as_noted: { label: 'Approved as Noted', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
  revise_resubmit: { label: 'Revise & Resubmit', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: RotateCcw },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
}

const actionConfig: Record<ResponseAction, { label: string; color: string; bgColor: string }> = {
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  approved_as_noted: { label: 'Approved as Noted', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  no_exceptions: { label: 'No Exceptions Taken', color: 'text-green-700', bgColor: 'bg-green-50' },
  revise_and_resubmit: { label: 'Revise & Resubmit', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
}

const specSections = [...new Set(mockSubmittals.map(s => s.specSection))]
const tradeCategories = [...new Set(mockSubmittals.map(s => s.tradeCategory))]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Utility Functions ────────────────────────────────────────

function calculateDueStatus(requiredDate: string): { text: string; color: string; isOverdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const required = new Date(requiredDate)
  required.setHours(0, 0, 0, 0)

  const diffTime = required.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)} days overdue`,
      color: 'text-red-600 bg-red-50',
      isOverdue: true,
    }
  } else if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      color: 'text-amber-600 bg-amber-50',
      isOverdue: false,
    }
  } else {
    return {
      text: `Due in ${diffDays} days`,
      color: 'text-green-600 bg-green-50',
      isOverdue: false,
    }
  }
}

function calculateDeliveryDate(approvalDate: Date, leadTimeDays: number): string {
  const delivery = new Date(approvalDate)
  delivery.setDate(delivery.getDate() + leadTimeDays)
  return delivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function checkLeadTimeRisk(submittal: Submittal): { isAtRisk: boolean; message: string } | null {
  if (!submittal.leadTimeDays || !submittal.scheduleDependency) return null

  const today = new Date()
  const requiredDate = new Date(submittal.requiredDate)
  const approvalBuffer = submittal.aiPredictedApprovalDays || 7

  // Calculate expected approval date
  const expectedApproval = new Date(today)
  expectedApproval.setDate(expectedApproval.getDate() + approvalBuffer)

  // Calculate delivery date after approval
  const deliveryDate = new Date(expectedApproval)
  deliveryDate.setDate(deliveryDate.getDate() + submittal.leadTimeDays)

  // Check if delivery date exceeds schedule requirement
  if (deliveryDate > requiredDate) {
    const daysLate = Math.ceil((deliveryDate.getTime() - requiredDate.getTime()) / (1000 * 60 * 60 * 24))
    return {
      isAtRisk: true,
      message: `Lead time threatens schedule by ${daysLate} days`,
    }
  }

  return null
}

// ── Sub-Components ────────────────────────────────────────────

function DigitalSignatureIndicator({ signature }: { signature: DigitalSignature }) {
  return (
    <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
      <BadgeCheck className="h-3.5 w-3.5" />
      <span>Signed by {signature.signedBy} on {formatDate(signature.signedAt)}</span>
      {signature.licenseNumber && (
        <span className="text-green-600 font-mono text-[10px]">({signature.licenseNumber})</span>
      )}
    </div>
  )
}

function ReviewStampBadge({ stamp }: { stamp: ReviewStamp }) {
  const config = actionConfig[stamp.action]
  return (
    <div className="space-y-1">
      <div className={cn('text-xs px-2 py-1 rounded flex items-center gap-1.5', config.bgColor)}>
        <Stamp className="h-3 w-3" />
        <span className={cn('font-medium', config.color)}>{config.label}</span>
        <span className="text-warm-500">by {stamp.reviewerName}</span>
        {stamp.licenseNumber && (
          <span className="text-warm-400 font-mono text-[10px]">({stamp.licenseNumber})</span>
        )}
      </div>
      {stamp.digitalSignature && (
        <DigitalSignatureIndicator signature={stamp.digitalSignature} />
      )}
    </div>
  )
}

function DistributionIndicator({ distribution }: { distribution: SubmittalDistribution[] }) {
  if (distribution.length === 0) return (
    <span className="text-xs text-warm-400 italic">Not yet distributed</span>
  )

  const viewed = distribution.filter(d => d.viewedAt).length
  const responded = distribution.filter(d => d.responded).length
  const ballInCourt = distribution.find(d => !d.responded && d.viewedAt)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-warm-500">
        <Eye className="h-3 w-3" />
        <span>{viewed}/{distribution.length} viewed</span>
      </div>
      {responded > 0 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>{responded} responded</span>
        </div>
      )}
      {ballInCourt && (
        <span className="text-xs bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
          Ball: {ballInCourt.recipientName}
        </span>
      )}
    </div>
  )
}

function ConnectionBadges({ submittal }: { submittal: Submittal }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {submittal.selectionLink && (
        <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded flex items-center gap-1">
          <Link2 className="h-2.5 w-2.5" />
          {submittal.selectionLink.selectionName} ({submittal.selectionLink.room})
        </span>
      )}
      {submittal.linkedPO && (
        <span className={cn(
          'text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1',
          submittal.linkedPO.holdStatus === 'on_hold'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-green-50 text-green-700'
        )}>
          <ShoppingCart className="h-2.5 w-2.5" />
          {submittal.linkedPO.poNumber}
          {submittal.linkedPO.holdStatus === 'on_hold' ? ' (HOLD)' : ' (Released)'}
        </span>
      )}
      {submittal.scheduleDependency && (
        <span className={cn(
          'text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1',
          submittal.scheduleDependency.critical
            ? 'bg-red-50 text-red-700'
            : 'bg-stone-50 text-stone-700'
        )}>
          <CalendarClock className="h-2.5 w-2.5" />
          {submittal.scheduleDependency.taskName}
          {submittal.scheduleDependency.impactDays > 0 && (
            <span className="font-medium">+{submittal.scheduleDependency.impactDays}d</span>
          )}
        </span>
      )}
      {submittal.permitRequired && (
        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded flex items-center gap-1">
          <FileText className="h-2.5 w-2.5" />
          Permit Req
        </span>
      )}
    </div>
  )
}

function LeadTimeDisplay({ submittal }: { submittal: Submittal }) {
  if (!submittal.leadTimeDays) return null

  const leadTimeRisk = checkLeadTimeRisk(submittal)
  const today = new Date()
  const expectedDelivery = calculateDeliveryDate(today, submittal.leadTimeDays + (submittal.aiPredictedApprovalDays || 7))

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs">
        <Truck className="h-3 w-3 text-warm-400" />
        <span className="text-warm-600">Lead Time: {submittal.leadTimeDays} days</span>
        <span className="text-warm-400">|</span>
        <span className="text-warm-500">Est. delivery: {expectedDelivery}</span>
      </div>
      {leadTimeRisk?.isAtRisk && (
        <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
          <AlertTriangle className="h-3 w-3" />
          <span>{leadTimeRisk.message}</span>
        </div>
      )}
    </div>
  )
}

function DueStatusBadge({ requiredDate, status }: { requiredDate: string; status: SubmittalStatus }) {
  // Don't show due status for completed items
  if (['approved', 'approved_as_noted', 'rejected'].includes(status)) return null

  const dueStatus = calculateDueStatus(requiredDate)

  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', dueStatus.color)}>
      {dueStatus.text}
    </span>
  )
}

// ── Main Card ────────────────────────────────────────────────

interface SubmittalCardProps {
  submittal: Submittal
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

function SubmittalCard({ submittal, isSelected, onToggleSelect }: SubmittalCardProps) {
  const statusInfo = statusConfig[submittal.status]
  const StatusIcon = statusInfo.icon
  const latestStamp = submittal.stamps.length > 0 ? submittal.stamps[submittal.stamps.length - 1] : null
  const dueStatus = calculateDueStatus(submittal.requiredDate)
  const isOverdue = dueStatus.isOverdue && !['approved', 'approved_as_noted', 'rejected'].includes(submittal.status)

  return (
    <div className={cn(
      'bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
      isOverdue ? 'border-red-200' : 'border-warm-200',
      isSelected && 'ring-2 ring-stone-500 border-stone-300'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(submittal.id)
            }}
            className={cn(
              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-stone-500 border-stone-500 text-white'
                : 'border-warm-300 hover:border-stone-400'
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>
          <span className="font-mono font-semibold text-warm-900">{submittal.number}</span>
          <span className="text-xs text-warm-400">Rev {submittal.revision}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1', statusInfo.bgColor, statusInfo.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
          <DueStatusBadge requiredDate={submittal.requiredDate} status={submittal.status} />
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-warm-700 mb-2 line-clamp-2">{submittal.description}</p>

      {/* Spec + Vendor + Trade */}
      <div className="space-y-1.5 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-warm-600">
          <Hash className="h-3 w-3 text-warm-400" />
          <span>{submittal.specSection}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-warm-600">
            <Building2 className="h-3 w-3 text-warm-400" />
            <span>{submittal.vendor}</span>
          </div>
          <span className="text-[10px] bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded">{submittal.tradeCategory}</span>
        </div>
      </div>

      {/* Cross-module connections */}
      <div className="mb-2">
        <ConnectionBadges submittal={submittal} />
      </div>

      {/* Distribution / Ball-in-court */}
      <div className="mb-2">
        <DistributionIndicator distribution={submittal.distribution} />
      </div>

      {/* Latest stamp */}
      {latestStamp && (
        <div className="mb-2">
          <ReviewStampBadge stamp={latestStamp} />
          {latestStamp.comments && (
            <p className="text-[11px] text-warm-500 mt-1 ml-5 italic line-clamp-2">"{latestStamp.comments}"</p>
          )}
        </div>
      )}

      {/* Lead Time Display */}
      {submittal.leadTimeDays && (
        <div className="mb-2">
          <LeadTimeDisplay submittal={submittal} />
        </div>
      )}

      {/* Footer: dates, docs */}
      <div className="flex items-center gap-3 pt-2 border-t border-warm-100 text-xs text-warm-600 flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(submittal.dateSubmitted)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className={cn(
            submittal.daysInReview > 14 ? 'text-red-600 font-medium' :
            submittal.daysInReview > 10 ? 'text-amber-600 font-medium' :
            'text-warm-500'
          )}>
            {submittal.daysInReview}d in review
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Paperclip className="h-3 w-3" />
          <span>{submittal.documentCount}</span>
        </div>
        {submittal.aiPredictedApprovalDays !== undefined && (
          <div className="flex items-center gap-1 text-amber-600">
            <Sparkles className="h-3 w-3" />
            <span>~{submittal.aiPredictedApprovalDays}d to approve</span>
          </div>
        )}
      </div>

      {/* AI Note */}
      {submittal.aiNote && (
        <div className={cn(
          'mt-2 p-2 rounded-md flex items-start gap-2',
          submittal.status === 'rejected' ? 'bg-red-50' :
          submittal.status === 'revise_resubmit' ? 'bg-orange-50' :
          'bg-amber-50'
        )}>
          <Sparkles className={cn(
            'h-3.5 w-3.5 mt-0.5 flex-shrink-0',
            submittal.status === 'rejected' ? 'text-red-500' :
            submittal.status === 'revise_resubmit' ? 'text-orange-500' :
            'text-amber-500'
          )} />
          <span className={cn(
            'text-xs',
            submittal.status === 'rejected' ? 'text-red-700' :
            submittal.status === 'revise_resubmit' ? 'text-orange-700' :
            'text-amber-700'
          )}>{submittal.aiNote}</span>
        </div>
      )}
    </div>
  )
}

// ── Package Group Component ──────────────────────────────────

interface PackageGroupProps {
  pkg: SubmittalPackage
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}

function PackageGroup({ pkg, selectedIds, onToggleSelect }: PackageGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const allSelected = pkg.submittals.every(s => selectedIds.has(s.id))
  const someSelected = pkg.submittals.some(s => selectedIds.has(s.id))

  const handleSelectAll = () => {
    pkg.submittals.forEach(s => {
      if (!selectedIds.has(s.id)) {
        onToggleSelect(s.id)
      }
    })
  }

  const handleDeselectAll = () => {
    pkg.submittals.forEach(s => {
      if (selectedIds.has(s.id)) {
        onToggleSelect(s.id)
      }
    })
  }

  return (
    <div className="col-span-2 bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Package Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-b border-warm-200 cursor-pointer hover:bg-warm-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              allSelected ? handleDeselectAll() : handleSelectAll()
            }}
            className={cn(
              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
              allSelected
                ? 'bg-stone-500 border-stone-500 text-white'
                : someSelected
                ? 'bg-stone-200 border-stone-400'
                : 'border-warm-300 hover:border-stone-400'
            )}
          >
            {allSelected && <Check className="h-3 w-3" />}
            {someSelected && !allSelected && <div className="w-2 h-0.5 bg-stone-500" />}
          </button>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-warm-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-warm-500" />
          )}
          <Package className="h-4 w-4 text-purple-500" />
          <span className="font-medium text-warm-900">{pkg.name}</span>
          <span className="text-xs text-warm-500">({pkg.submittals.length} items)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Package</span>
        </div>
      </div>

      {/* Package Contents */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-2 gap-4">
          {pkg.submittals.map(submittal => (
            <SubmittalCard
              key={submittal.id}
              submittal={submittal}
              isSelected={selectedIds.has(submittal.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────

export function SubmittalsPreview() {
  const [specFilter, setSpecFilter] = useState<string>('all')
  const [tradeFilter, setTradeFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const filteredSubmittals = sortItems(
    mockSubmittals.filter(s => {
      if (!matchesSearch(s, search, ['number', 'description', 'vendor', 'specSection', 'tradeCategory'])) return false
      if (activeTab !== 'all' && s.status !== activeTab) return false
      if (specFilter !== 'all' && s.specSection !== specFilter) return false
      if (tradeFilter !== 'all' && s.tradeCategory !== tradeFilter) return false
      return true
    }),
    activeSort as keyof Submittal | '',
    sortDirection,
  )

  // Group submittals by package
  const { packages, ungroupedSubmittals } = useMemo(() => {
    const packageMap = new Map<string, SubmittalPackage>()
    const ungrouped: Submittal[] = []

    filteredSubmittals.forEach(submittal => {
      if (submittal.packageId && submittal.packageName) {
        const existing = packageMap.get(submittal.packageId)
        if (existing) {
          existing.submittals.push(submittal)
        } else {
          packageMap.set(submittal.packageId, {
            id: submittal.packageId,
            name: submittal.packageName,
            submittals: [submittal],
          })
        }
      } else {
        ungrouped.push(submittal)
      }
    })

    return {
      packages: Array.from(packageMap.values()),
      ungroupedSubmittals: ungrouped,
    }
  }, [filteredSubmittals])

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredSubmittals.map(s => s.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // Bulk action handlers
  const handleBulkApprove = () => {
    console.log('Approving:', Array.from(selectedIds))
    // Implementation would go here
  }

  const handleRequestRevision = () => {
    console.log('Requesting revision:', Array.from(selectedIds))
    // Implementation would go here
  }

  const handleExport = () => {
    console.log('Exporting:', Array.from(selectedIds))
    // Implementation would go here
  }

  const handleBulkAssign = () => {
    console.log('Assigning:', Array.from(selectedIds))
    // Implementation would go here
  }

  // Derived selection state for "select all" checkbox in header
  const allFilteredSelected = filteredSubmittals.length > 0 && filteredSubmittals.every(s => selectedIds.has(s.id))
  const someFilteredSelected = filteredSubmittals.some(s => selectedIds.has(s.id))

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      clearSelection()
    } else {
      selectAll()
    }
  }

  // ── Stats ────────────────────────────────────────────────────
  const totalSubmittals = mockSubmittals.length
  const pendingReview = mockSubmittals.filter(s =>
    s.status === 'pending' || s.status === 'submitted' || s.status === 'under_review'
  ).length
  const approvedCount = mockSubmittals.filter(s =>
    s.status === 'approved' || s.status === 'approved_as_noted'
  ).length
  const reviseCount = mockSubmittals.filter(s => s.status === 'revise_resubmit').length
  const rejectedCount = mockSubmittals.filter(s => s.status === 'rejected').length
  const overdueCount = mockSubmittals.filter(s => {
    const dueStatus = calculateDueStatus(s.requiredDate)
    return dueStatus.isOverdue && !['approved', 'approved_as_noted', 'rejected'].includes(s.status)
  }).length
  const avgDaysInReview = Math.round(
    mockSubmittals.reduce((sum, s) => sum + s.daysInReview, 0) / mockSubmittals.length
  )
  const posOnHold = mockSubmittals.filter(s => s.linkedPO?.holdStatus === 'on_hold').length
  const criticalPathItems = mockSubmittals.filter(s => s.scheduleDependency?.critical).length

  // ── AI Insights ────────────────────────────────────────────────
  const aiFeatures = [
    {
      feature: 'Approval Timeline',
      trigger: 'Real-time',
      insight: 'Based on similar submittals, expect approval in 5-7 days. Current reviewer typically takes 4 days.',
      severity: 'info' as const,
      confidence: 85,
    },
    {
      feature: 'Schedule Impact',
      trigger: 'On change',
      insight: 'Cabinet submittal on critical path. Delayed approval impacts install date Mar 15 → Mar 22.',
      severity: 'critical' as const,
      confidence: 92,
      action: {
        label: 'View Schedule',
        onClick: () => console.log('View schedule'),
      },
    },
    {
      feature: 'Vendor Follow-up',
      trigger: 'Daily',
      insight: 'Tile samples requested 12 days ago. Vendor typically ships in 5 days. Recommend: Call vendor.',
      severity: 'warning' as const,
      confidence: 78,
      action: {
        label: 'Contact Vendor',
        onClick: () => console.log('Contact vendor'),
      },
    },
    {
      feature: 'Distribution Alert',
      trigger: 'Real-time',
      insight: 'Architect viewed submittal 4 days ago but hasn\'t responded. Pattern suggests action needed.',
      severity: 'warning' as const,
      confidence: 88,
      action: {
        label: 'Send Reminder',
        onClick: () => console.log('Send reminder'),
      },
    },
    {
      feature: 'PO Release',
      trigger: 'On submission',
      insight: 'Upon approval, ready to release PO-0234 ($12,400) to ABC Cabinets.',
      severity: 'success' as const,
      confidence: 100,
    },
  ]

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Submittals - Smith Residence</h3>
          <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{totalSubmittals} Total</span>
          <span className="text-sm text-warm-500">{approvedCount} approved | {pendingReview} pending review</span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search submittals..."
          tabs={[
            { key: 'all', label: 'All', count: mockSubmittals.length },
            { key: 'pending', label: 'Pending', count: mockSubmittals.filter(s => s.status === 'pending').length },
            { key: 'submitted', label: 'Submitted', count: mockSubmittals.filter(s => s.status === 'submitted').length },
            { key: 'under_review', label: 'Under Review', count: mockSubmittals.filter(s => s.status === 'under_review').length },
            { key: 'approved', label: 'Approved', count: mockSubmittals.filter(s => s.status === 'approved').length },
            { key: 'approved_as_noted', label: 'As Noted', count: mockSubmittals.filter(s => s.status === 'approved_as_noted').length },
            { key: 'revise_resubmit', label: 'Revise', count: reviseCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Sections',
              value: specFilter,
              options: specSections.map(s => ({ value: s, label: s.split(' - ')[0] })),
              onChange: setSpecFilter,
            },
            {
              label: 'All Trades',
              value: tradeFilter,
              options: tradeCategories.map(t => ({ value: t, label: t })),
              onChange: setTradeFilter,
            },
          ]}
          sortOptions={[
            { value: 'number', label: 'Submittal #' },
            { value: 'dateSubmitted', label: 'Date Submitted' },
            { value: 'requiredDate', label: 'Required Date' },
            { value: 'daysInReview', label: 'Days in Review' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'leadTimeDays', label: 'Lead Time' },
            { value: 'revision', label: 'Revision #' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export Log', onClick: () => {} },
            { icon: Plus, label: 'New Submittal', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredSubmittals.length}
          totalCount={mockSubmittals.length}
        />
        {/* Select All Checkbox + View Mode Toggle */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-warm-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              onClick={handleToggleSelectAll}
              className={cn(
                'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                allFilteredSelected
                  ? 'bg-stone-500 border-stone-500 text-white'
                  : someFilteredSelected
                  ? 'bg-stone-200 border-stone-400'
                  : 'border-warm-300 hover:border-stone-400'
              )}
            >
              {allFilteredSelected && <Check className="h-3 w-3" />}
              {someFilteredSelected && !allFilteredSelected && <div className="w-2 h-0.5 bg-stone-500" />}
            </button>
            <span className="text-xs text-warm-600">
              {allFilteredSelected ? 'Deselect all' : `Select all ${filteredSubmittals.length} submittals`}
            </span>
          </label>
          <button
            onClick={() => setViewMode(viewMode === 'flat' ? 'grouped' : 'flat')}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors',
              viewMode === 'grouped'
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white border-warm-200 text-warm-600 hover:bg-warm-50'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            {viewMode === 'grouped' ? 'Grouped by Package' : 'Flat List'}
          </button>
        </div>
      </div>

      {/* Bulk Select Bar */}
      <div className="px-4 pt-4">
        <BulkSelectBar
          selectedCount={selectedIds.size}
          totalCount={filteredSubmittals.length}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
        >
          <button
            onClick={handleBulkApprove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-100 rounded-lg transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Selected
          </button>
          <button
            onClick={handleRequestRevision}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <PenLine className="h-4 w-4" />
            Request Revision
          </button>
          <button
            onClick={handleBulkAssign}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            Bulk Assign
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-warm-600 hover:bg-warm-100 rounded-lg transition-colors"
          >
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </BulkSelectBar>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <div className="grid grid-cols-6 gap-3">
          <div className="bg-warm-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warm-500 text-xs">
              <ClipboardList className="h-3.5 w-3.5" />
              Total
            </div>
            <div className="text-lg font-bold text-warm-900 mt-1">{totalSubmittals}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-xs">
              <Clock className="h-3.5 w-3.5" />
              Pending Review
            </div>
            <div className="text-lg font-bold text-amber-700 mt-1">{pendingReview}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-xs">
              <CheckCircle className="h-3.5 w-3.5" />
              Approved
            </div>
            <div className="text-lg font-bold text-green-700 mt-1">{approvedCount}</div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            overdueCount > 0 ? 'bg-red-50' : 'bg-stone-50'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-xs',
              overdueCount > 0 ? 'text-red-600' : 'text-stone-600'
            )}>
              {overdueCount > 0 ? <AlertTriangle className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {overdueCount > 0 ? 'Overdue' : 'Avg Review'}
            </div>
            <div className={cn(
              'text-lg font-bold mt-1',
              overdueCount > 0 ? 'text-red-700' : 'text-stone-700'
            )}>
              {overdueCount > 0 ? overdueCount : `${avgDaysInReview}d`}
            </div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            posOnHold > 0 ? 'bg-amber-50' : 'bg-warm-50'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-xs',
              posOnHold > 0 ? 'text-amber-600' : 'text-warm-500'
            )}>
              <ShoppingCart className="h-3.5 w-3.5" />
              POs on Hold
            </div>
            <div className={cn(
              'text-lg font-bold mt-1',
              posOnHold > 0 ? 'text-amber-700' : 'text-warm-900'
            )}>
              {posOnHold}
            </div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            criticalPathItems > 0 ? 'bg-red-50' : 'bg-warm-50'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-xs',
              criticalPathItems > 0 ? 'text-red-600' : 'text-warm-500'
            )}>
              <CalendarClock className="h-3.5 w-3.5" />
              Critical Path
            </div>
            <div className={cn(
              'text-lg font-bold mt-1',
              criticalPathItems > 0 ? 'text-red-700' : 'text-warm-900'
            )}>
              {criticalPathItems}
            </div>
          </div>
        </div>
      </div>

      {/* Submittals Grid */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
        {viewMode === 'grouped' ? (
          <>
            {/* Render packages first */}
            {packages.map(pkg => (
              <PackageGroup
                key={pkg.id}
                pkg={pkg}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            ))}

            {/* Render ungrouped submittals */}
            {ungroupedSubmittals.map(submittal => (
              <SubmittalCard
                key={submittal.id}
                submittal={submittal}
                isSelected={selectedIds.has(submittal.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </>
        ) : (
          /* Flat list view — all submittals without package grouping */
          filteredSubmittals.map(submittal => (
            <SubmittalCard
              key={submittal.id}
              submittal={submittal}
              isSelected={selectedIds.has(submittal.id)}
              onToggleSelect={toggleSelect}
            />
          ))
        )}

        {filteredSubmittals.length === 0 && (
          <div className="col-span-2 text-center py-8 text-warm-400">
            No submittals match the selected filters
          </div>
        )}
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="Submittal Intelligence"
          features={aiFeatures}
          columns={2}
        />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Quick Insights:</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700 flex-wrap">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdueCount} overdue (past required date)
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5" />
              {posOnHold} PO{posOnHold !== 1 ? 's' : ''} held pending approval
            </span>
            <span>|</span>
            <span>Architect avg response: 8.5 days</span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              SUB-003 (cabinets): 56d lead — order deadline approaching
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
