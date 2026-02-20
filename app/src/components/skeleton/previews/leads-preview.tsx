'use client'

import { useState } from 'react'
import {
  User,
  DollarSign,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Building2,
  Landmark,
  Users,
  FileText,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Calculator,
  ChevronRight,
  Star,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { StatusTransition, PriorityFilter, StatusFilter, AIFeaturesPanel } from '@/components/skeleton/ui'

interface Lead {
  id: string
  firstName: string
  lastName: string
  name: string
  contact: string
  email: string
  phone: string
  preferredContactMethod: 'email' | 'phone' | 'text'
  projectType: 'New Construction' | 'Renovation' | 'Addition' | 'Remodel'
  preconType: 'design_build' | 'plan_bid_build'
  estimatedSf: number
  estimatedValue: number
  stage: string
  source: string
  sourceDetail?: string
  aiScore: number
  winProbability: number
  budgetRealismScore: number
  assignedTo: string
  lotStatus: 'owned' | 'under_contract' | 'looking' | 'unknown'
  financingStatus: 'pre_approved' | 'cash' | 'needs_approval' | 'unknown'
  timeline: string
  daysInStage: number
  lastActivityDate: string
  lastActivityType: string
  competitor?: string
  competitivePosition?: 'strong' | 'neutral' | 'weak'
  scopeIteration?: string
  designMilestone?: string
  alert?: string
  status: 'active' | 'won' | 'lost' | 'archived'
  lostReason?: string
  // Stage gate validation fields
  budgetConfirmed?: boolean
  timelineDiscussed?: boolean
  decisionMakerIdentified?: boolean
  requirementsDocumented?: boolean
  siteVisitCompleted?: boolean
  proposalReviewed?: boolean
  // Lot evaluation checklist
  surveyReceived?: boolean
  soilTestCompleted?: boolean
  floodZoneVerified?: boolean
  utilitiesConfirmed?: boolean
  setbacksChecked?: boolean
  // Duplicate detection
  potentialDuplicate?: {
    name: string
    phone: string
    id: string
  }
  // Estimator lead data
  fromEstimator?: boolean
  estimatorData?: {
    sqft: number
    finishLevel: 'builder' | 'standard' | 'premium' | 'luxury'
    estimateLow: number
    estimateHigh: number
    bedrooms: number
    bathrooms: number
    style: string
    breakdown: Array<{ category: string; costLow: number; costHigh: number }>
  }
}

const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    name: 'Smith Residence',
    contact: 'John & Sarah Smith',
    email: 'john@smithfamily.com',
    phone: '(843) 555-0142',
    preferredContactMethod: 'phone',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 3500,
    estimatedValue: 850000,
    stage: 'consultation',
    source: 'Referral',
    sourceDetail: 'Davis family (past client)',
    aiScore: 87,
    winProbability: 78,
    budgetRealismScore: 82,
    assignedTo: 'Jake',
    lotStatus: 'owned',
    financingStatus: 'pre_approved',
    timeline: '3-6 months',
    daysInStage: 4,
    lastActivityDate: 'Feb 10, 2026',
    lastActivityType: 'Site Visit',
    designMilestone: 'Schematic Design',
    status: 'active',
    budgetConfirmed: true,
    timelineDiscussed: true,
    decisionMakerIdentified: true,
    requirementsDocumented: false,
    siteVisitCompleted: true,
    surveyReceived: true,
    soilTestCompleted: true,
    floodZoneVerified: true,
    utilitiesConfirmed: false,
    setbacksChecked: true,
  },
  {
    id: 'est-1',
    firstName: 'Michael',
    lastName: 'Chen',
    name: 'Chen Custom Home',
    contact: 'Michael & Amy Chen',
    email: 'michael.chen@email.com',
    phone: '(941) 555-0847',
    preferredContactMethod: 'email',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 4200,
    estimatedValue: 980000,
    stage: 'new',
    source: 'Website Estimator',
    sourceDetail: 'Completed full estimate wizard',
    aiScore: 91,
    winProbability: 68,
    budgetRealismScore: 94,
    assignedTo: 'Unassigned',
    lotStatus: 'looking',
    financingStatus: 'pre_approved',
    timeline: '6-12 months',
    daysInStage: 0,
    lastActivityDate: 'Feb 20, 2026',
    lastActivityType: 'Estimate Submitted',
    status: 'active',
    fromEstimator: true,
    estimatorData: {
      sqft: 4200,
      finishLevel: 'premium',
      estimateLow: 890000,
      estimateHigh: 1100000,
      bedrooms: 5,
      bathrooms: 4,
      style: 'Coastal',
      breakdown: [
        { category: 'Foundation & Concrete', costLow: 75600, costHigh: 92400 },
        { category: 'Lumber & Framing', costLow: 67200, costHigh: 84000 },
        { category: 'Cabinets & Countertops', costLow: 67200, costHigh: 100800 },
        { category: 'Flooring', costLow: 37800, costHigh: 58800 },
      ],
    },
  },
  {
    id: '2',
    firstName: 'Robert',
    lastName: 'Johnson',
    name: 'Johnson Beach House',
    contact: 'Robert Johnson',
    email: 'rjohnson@gmail.com',
    phone: '(843) 555-0298',
    preferredContactMethod: 'email',
    projectType: 'Renovation',
    preconType: 'plan_bid_build',
    estimatedSf: 2200,
    estimatedValue: 320000,
    stage: 'qualified',
    source: 'Houzz',
    aiScore: 72,
    winProbability: 45,
    budgetRealismScore: 58,
    assignedTo: 'Mike',
    lotStatus: 'owned',
    financingStatus: 'needs_approval',
    timeline: '6+ months',
    daysInStage: 12,
    lastActivityDate: 'Feb 5, 2026',
    lastActivityType: 'Email',
    competitor: 'Coastal Builders Inc',
    competitivePosition: 'neutral',
    status: 'active',
    alert: 'Budget realism score low (58) - client expectations may exceed budget',
    budgetConfirmed: false,
    timelineDiscussed: true,
    decisionMakerIdentified: true,
    surveyReceived: true,
    soilTestCompleted: false,
    floodZoneVerified: true,
    utilitiesConfirmed: true,
    setbacksChecked: false,
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Miller',
    name: 'Miller Addition',
    contact: 'David Miller',
    email: 'dmiller@outlook.com',
    phone: '(843) 555-0415',
    preferredContactMethod: 'phone',
    projectType: 'Addition',
    preconType: 'design_build',
    estimatedSf: 800,
    estimatedValue: 250000,
    stage: 'proposal',
    source: 'Website',
    sourceDetail: 'UTM: google_ads/custom_builder',
    aiScore: 91,
    winProbability: 82,
    budgetRealismScore: 90,
    assignedTo: 'Jake',
    lotStatus: 'owned',
    financingStatus: 'cash',
    timeline: '1-3 months',
    daysInStage: 8,
    lastActivityDate: 'Feb 4, 2026',
    lastActivityType: 'Proposal Sent',
    scopeIteration: 'V2 - Revised scope',
    status: 'active',
    alert: 'Waiting 8 days - follow up recommended. Similar leads convert within 5 days.',
    budgetConfirmed: true,
    timelineDiscussed: true,
    decisionMakerIdentified: true,
    requirementsDocumented: true,
    siteVisitCompleted: true,
    proposalReviewed: false,
    surveyReceived: true,
    soilTestCompleted: true,
    floodZoneVerified: true,
    utilitiesConfirmed: true,
    setbacksChecked: true,
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Wilson',
    name: 'Wilson Custom Home',
    contact: 'Thomas & Lisa Wilson',
    email: 'twilson@wilsonlaw.com',
    phone: '(843) 555-0631',
    preferredContactMethod: 'phone',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 4200,
    estimatedValue: 1200000,
    stage: 'new',
    source: 'Parade of Homes',
    aiScore: 94,
    winProbability: 85,
    budgetRealismScore: 95,
    assignedTo: 'Jake',
    lotStatus: 'under_contract',
    financingStatus: 'pre_approved',
    timeline: '3-6 months',
    daysInStage: 1,
    lastActivityDate: 'Feb 11, 2026',
    lastActivityType: 'Phone Call',
    status: 'active',
    surveyReceived: false,
    soilTestCompleted: false,
    floodZoneVerified: false,
    utilitiesConfirmed: false,
    setbacksChecked: false,
    potentialDuplicate: {
      name: 'Tom Wilson',
      phone: '(843) 555-0632',
      id: '99',
    },
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Davis',
    name: 'Davis Coastal Home',
    contact: 'Michael Davis',
    email: 'mdavis@coastalins.com',
    phone: '(843) 555-0877',
    preferredContactMethod: 'email',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 3800,
    estimatedValue: 920000,
    stage: 'won',
    source: 'Referral',
    sourceDetail: 'Architect referral - Bay Design Group',
    aiScore: 95,
    winProbability: 100,
    budgetRealismScore: 88,
    assignedTo: 'Sarah',
    lotStatus: 'owned',
    financingStatus: 'pre_approved',
    timeline: 'Ready to start',
    daysInStage: 3,
    lastActivityDate: 'Feb 9, 2026',
    lastActivityType: 'Contract Signed',
    designMilestone: 'Construction Documents',
    status: 'won',
    budgetConfirmed: true,
    timelineDiscussed: true,
    decisionMakerIdentified: true,
    requirementsDocumented: true,
    siteVisitCompleted: true,
    proposalReviewed: true,
    surveyReceived: true,
    soilTestCompleted: true,
    floodZoneVerified: true,
    utilitiesConfirmed: true,
    setbacksChecked: true,
  },
  {
    id: '6',
    firstName: 'Amanda',
    lastName: 'Taylor',
    name: 'Taylor Kitchen Remodel',
    contact: 'Amanda Taylor',
    email: 'ataylor@gmail.com',
    phone: '(843) 555-0523',
    preferredContactMethod: 'text',
    projectType: 'Remodel',
    preconType: 'plan_bid_build',
    estimatedSf: 400,
    estimatedValue: 95000,
    stage: 'lost',
    source: 'Angi',
    aiScore: 45,
    winProbability: 0,
    budgetRealismScore: 35,
    assignedTo: 'Mike',
    lotStatus: 'owned',
    financingStatus: 'unknown',
    timeline: 'Just exploring',
    daysInStage: 0,
    lastActivityDate: 'Jan 28, 2026',
    lastActivityType: 'Email',
    competitor: 'Quick Reno LLC',
    competitivePosition: 'weak',
    status: 'lost',
    lostReason: 'Went with competitor - price',
  },
  {
    id: '7',
    firstName: 'David',
    lastName: 'Nguyen',
    name: 'Nguyen Waterfront Estate',
    contact: 'David & Mai Nguyen',
    email: 'dnguyen@techcorp.com',
    phone: '(843) 555-0719',
    preferredContactMethod: 'phone',
    projectType: 'New Construction',
    preconType: 'design_build',
    estimatedSf: 5200,
    estimatedValue: 1850000,
    stage: 'negotiation',
    source: 'Referral',
    sourceDetail: 'Past client - Williams family',
    aiScore: 88,
    winProbability: 70,
    budgetRealismScore: 75,
    assignedTo: 'Jake',
    lotStatus: 'owned',
    financingStatus: 'pre_approved',
    timeline: '3-6 months',
    daysInStage: 6,
    lastActivityDate: 'Feb 8, 2026',
    lastActivityType: 'Meeting',
    competitor: 'Luxury Living Builders',
    competitivePosition: 'strong',
    scopeIteration: 'V3 - Final revision',
    designMilestone: 'Design Development',
    status: 'active',
    budgetConfirmed: true,
    timelineDiscussed: true,
    decisionMakerIdentified: true,
    requirementsDocumented: true,
    siteVisitCompleted: true,
    proposalReviewed: true,
    surveyReceived: true,
    soilTestCompleted: true,
    floodZoneVerified: true,
    utilitiesConfirmed: true,
    setbacksChecked: true,
  },
]

const stages = [
  { id: 'new', label: 'New', color: 'bg-stone-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-cyan-500' },
  { id: 'consultation', label: 'Consultation', color: 'bg-indigo-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
]

// Stage gate requirements
const stageGateRequirements: Record<string, { field: keyof Lead; label: string }[]> = {
  qualified: [
    { field: 'budgetConfirmed', label: 'Budget confirmed' },
    { field: 'timelineDiscussed', label: 'Timeline discussed' },
  ],
  consultation: [
    { field: 'budgetConfirmed', label: 'Budget confirmed' },
    { field: 'timelineDiscussed', label: 'Timeline discussed' },
    { field: 'decisionMakerIdentified', label: 'Decision maker identified' },
  ],
  proposal: [
    { field: 'budgetConfirmed', label: 'Budget confirmed' },
    { field: 'timelineDiscussed', label: 'Timeline discussed' },
    { field: 'decisionMakerIdentified', label: 'Decision maker identified' },
    { field: 'requirementsDocumented', label: 'Requirements documented' },
    { field: 'siteVisitCompleted', label: 'Site visit completed' },
  ],
  negotiation: [
    { field: 'budgetConfirmed', label: 'Budget confirmed' },
    { field: 'timelineDiscussed', label: 'Timeline discussed' },
    { field: 'decisionMakerIdentified', label: 'Decision maker identified' },
    { field: 'requirementsDocumented', label: 'Requirements documented' },
    { field: 'siteVisitCompleted', label: 'Site visit completed' },
    { field: 'proposalReviewed', label: 'Proposal reviewed with client' },
  ],
  won: [
    { field: 'budgetConfirmed', label: 'Budget confirmed' },
    { field: 'timelineDiscussed', label: 'Timeline discussed' },
    { field: 'decisionMakerIdentified', label: 'Decision maker identified' },
    { field: 'requirementsDocumented', label: 'Requirements documented' },
    { field: 'siteVisitCompleted', label: 'Site visit completed' },
    { field: 'proposalReviewed', label: 'Proposal reviewed with client' },
  ],
}

const lotStatusLabels: Record<string, { label: string; color: string }> = {
  owned: { label: 'Lot Owned', color: 'text-green-600' },
  under_contract: { label: 'Under Contract', color: 'text-stone-600' },
  looking: { label: 'Lot Shopping', color: 'text-amber-600' },
  unknown: { label: 'Unknown', color: 'text-warm-400' },
}

const financingStatusLabels: Record<string, { label: string; color: string }> = {
  pre_approved: { label: 'Pre-Approved', color: 'text-green-600' },
  cash: { label: 'Cash Buyer', color: 'text-emerald-600' },
  needs_approval: { label: 'Needs Approval', color: 'text-amber-600' },
  unknown: { label: 'Unknown', color: 'text-warm-400' },
}

const preferredContactLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  text: 'Text',
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  return '$' + (value / 1000).toFixed(0) + 'K'
}

// Stage Gate Validation Component
function StageGateValidation({ lead, targetStage }: { lead: Lead; targetStage: string }) {
  const requirements = stageGateRequirements[targetStage] || []
  if (requirements.length === 0) return null

  const validationResults = requirements.map((req) => ({
    ...req,
    passed: Boolean(lead[req.field]),
  }))

  const allPassed = validationResults.every((r) => r.passed)
  const passedCount = validationResults.filter((r) => r.passed).length

  return (
    <div className="mt-3 p-3 bg-warm-50 rounded-lg border border-warm-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-warm-700">
          Stage Gate: Advance to {stages.find((s) => s.id === targetStage)?.label}
        </span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded',
            allPassed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          )}
        >
          {passedCount}/{requirements.length} Complete
        </span>
      </div>
      <div className="space-y-1.5">
        {validationResults.map((req) => (
          <div key={req.field} className="flex items-center gap-2 text-xs">
            {req.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className={req.passed ? 'text-warm-600' : 'text-red-600'}>{req.label}</span>
          </div>
        ))}
      </div>
      {!allPassed && (
        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>Complete all requirements before advancing to {stages.find((s) => s.id === targetStage)?.label}</span>
        </div>
      )}
      <div className="mt-2">
        <StatusTransition
          currentStatus={lead.stage}
          nextStatus={targetStage}
          onTransition={() => {}}
          disabled={!allPassed}
        />
      </div>
    </div>
  )
}

// Convert to Job Component
function ConvertToJobButton({ lead }: { lead: Lead }) {
  const [showDetails, setShowDetails] = useState(false)

  if (lead.stage !== 'won') return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Building2 className="h-4 w-4" />
        Convert to Job
        <ArrowRight className="h-4 w-4" />
      </button>
      {showDetails && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="text-sm font-medium text-green-800 mb-2">What will be created:</h5>
          <ul className="space-y-1.5 text-xs text-green-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Job record: {lead.name}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Initial budget: {formatCurrency(lead.estimatedValue)}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Project type: {lead.projectType}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Square footage: {lead.estimatedSf.toLocaleString()} SF
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Client contact linked
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All lead documents transferred
            </li>
          </ul>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3 rounded">
              Confirm Conversion
            </button>
            <button
              onClick={() => setShowDetails(false)}
              className="px-3 py-1.5 text-sm text-green-700 hover:bg-green-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Duplicate Detection Warning
function DuplicateWarning({ lead }: { lead: Lead }) {
  if (!lead.potentialDuplicate) return null

  return (
    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-start gap-2">
        <Copy className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-medium text-orange-700">Possible duplicate detected</div>
          <div className="text-xs text-orange-600 mt-0.5">
            {lead.potentialDuplicate.name} ({lead.potentialDuplicate.phone})
          </div>
          <div className="flex gap-2 mt-2">
            <button className="text-xs px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-medium">
              Merge
            </button>
            <button className="text-xs px-2 py-1 bg-white hover:bg-warm-50 text-warm-600 rounded border border-warm-200">
              Keep Separate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Finish Level Colors
const finishLevelConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  builder: { label: 'Builder Grade', color: 'text-stone-700', bgColor: 'bg-stone-100' },
  standard: { label: 'Standard', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  premium: { label: 'Premium', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  luxury: { label: 'Luxury', color: 'text-amber-700', bgColor: 'bg-amber-100' },
}

// Estimator Data Display Component
function EstimatorDataDisplay({ lead }: { lead: Lead }) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (!lead.fromEstimator || !lead.estimatorData) return null

  const { estimatorData } = lead
  const finishConfig = finishLevelConfig[estimatorData.finishLevel]

  return (
    <div className="mt-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-700">Website Estimate</span>
        </div>
        <span className={cn('text-[10px] px-2 py-0.5 rounded font-medium', finishConfig.bgColor, finishConfig.color)}>
          {finishConfig.label}
        </span>
      </div>

      {/* Estimate Range */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-indigo-900">
          {formatCurrency(estimatorData.estimateLow)} - {formatCurrency(estimatorData.estimateHigh)}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 text-[10px] mb-2">
        <div className="text-center p-1.5 bg-white/60 rounded">
          <div className="font-bold text-indigo-800">{estimatorData.sqft.toLocaleString()}</div>
          <div className="text-indigo-600">Sq Ft</div>
        </div>
        <div className="text-center p-1.5 bg-white/60 rounded">
          <div className="font-bold text-indigo-800">{estimatorData.bedrooms}</div>
          <div className="text-indigo-600">Beds</div>
        </div>
        <div className="text-center p-1.5 bg-white/60 rounded">
          <div className="font-bold text-indigo-800">{estimatorData.bathrooms}</div>
          <div className="text-indigo-600">Baths</div>
        </div>
        <div className="text-center p-1.5 bg-white/60 rounded">
          <div className="font-bold text-indigo-800">{estimatorData.style}</div>
          <div className="text-indigo-600">Style</div>
        </div>
      </div>

      {/* Breakdown Toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full flex items-center justify-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 py-1 rounded hover:bg-white/50 transition-colors"
      >
        {showBreakdown ? 'Hide' : 'View'} Cost Breakdown
        <ChevronRight className={cn('h-3 w-3 transition-transform', showBreakdown && 'rotate-90')} />
      </button>

      {/* Cost Breakdown */}
      {showBreakdown && (
        <div className="mt-2 pt-2 border-t border-indigo-200 space-y-1.5">
          {estimatorData.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-indigo-700">{item.category}</span>
              <span className="font-medium text-indigo-800">
                {formatCurrency(item.costLow)} - {formatCurrency(item.costHigh)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-indigo-200">
        <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 px-2 rounded transition-colors">
          <FileText className="h-3 w-3" />
          View Full Estimate
        </button>
        <button className="flex items-center justify-center gap-1 text-[10px] font-medium text-indigo-600 bg-white hover:bg-indigo-50 py-1.5 px-2 rounded border border-indigo-200 transition-colors">
          <ArrowRight className="h-3 w-3" />
          Start Proposal
        </button>
      </div>
    </div>
  )
}

// Lot Evaluation Checklist
function LotEvaluationChecklist({ lead }: { lead: Lead }) {
  if (lead.lotStatus !== 'owned' && lead.lotStatus !== 'under_contract') return null

  const checklistItems = [
    { key: 'surveyReceived', label: 'Survey received', checked: lead.surveyReceived },
    { key: 'soilTestCompleted', label: 'Soil test', checked: lead.soilTestCompleted },
    { key: 'floodZoneVerified', label: 'Flood zone verified', checked: lead.floodZoneVerified },
    { key: 'utilitiesConfirmed', label: 'Utilities confirmed', checked: lead.utilitiesConfirmed },
    { key: 'setbacksChecked', label: 'Setbacks checked', checked: lead.setbacksChecked },
  ]

  const completedCount = checklistItems.filter((item) => item.checked).length
  const completionPercentage = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-700">Lot Evaluation</span>
        <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-medium">
          {completionPercentage}% Complete
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {checklistItems.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5 text-xs">
            {item.checked ? (
              <CheckCircle2 className="h-3 w-3 text-stone-500" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-stone-300" />
            )}
            <span className={item.checked ? 'text-stone-700' : 'text-stone-500'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quick Feasibility Calculator
function QuickFeasibilityCalculator({ lead }: { lead: Lead }) {
  const [showCalculator, setShowCalculator] = useState(false)

  const costPerSqFt = lead.estimatedValue / lead.estimatedSf
  const typicalRanges: Record<string, { min: number; max: number }> = {
    'New Construction': { min: 175, max: 275 },
    Renovation: { min: 125, max: 200 },
    Addition: { min: 200, max: 300 },
    Remodel: { min: 150, max: 250 },
  }

  const range = typicalRanges[lead.projectType] || { min: 150, max: 250 }
  const isFeasible = costPerSqFt >= range.min && costPerSqFt <= range.max
  const isLow = costPerSqFt < range.min
  const isHigh = costPerSqFt > range.max

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
      >
        <Calculator className="h-3.5 w-3.5" />
        Quick Feasibility
        <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showCalculator && 'rotate-90')} />
      </button>
      {showCalculator && (
        <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="text-xs text-indigo-700 space-y-2">
            <div className="flex justify-between">
              <span>Budget:</span>
              <span className="font-medium">{formatCurrency(lead.estimatedValue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Square Footage:</span>
              <span className="font-medium">{lead.estimatedSf.toLocaleString()} SF</span>
            </div>
            <div className="flex justify-between border-t border-indigo-200 pt-2">
              <span>Cost per SF:</span>
              <span className="font-bold">${Math.round(costPerSqFt)}/SF</span>
            </div>
            <div className="flex justify-between">
              <span>Typical range ({lead.projectType}):</span>
              <span className="font-medium">
                ${range.min}-${range.max}/SF
              </span>
            </div>
            <div
              className={cn(
                'mt-2 p-2 rounded text-xs font-medium',
                isFeasible && 'bg-green-100 text-green-700',
                isLow && 'bg-amber-100 text-amber-700',
                isHigh && 'bg-red-100 text-red-700'
              )}
            >
              {isFeasible && 'Feasible. Budget aligns with typical costs for this project type.'}
              {isLow && 'Budget may be tight. Consider scope adjustments or value engineering.'}
              {isHigh && 'Premium budget. Client may have high-end expectations to discuss.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced AI Insights Panel
function LeadAIInsights({ lead }: { lead: Lead }) {
  const costPerSqFt = lead.estimatedValue / lead.estimatedSf
  const daysSinceContact = Math.floor(
    (new Date().getTime() - new Date('2026-02-12').getTime()) / (1000 * 60 * 60 * 24)
  )

  const features = [
    {
      feature: 'Lead Scoring',
      insight: `Score: ${lead.aiScore}/100. Factors: Budget ${lead.budgetRealismScore >= 75 ? 'realistic (+20)' : 'questionable (-10)'}, Timeline ${lead.timeline.includes('6+') ? '6+ months (+15)' : lead.timeline.includes('3-6') ? '3-6 months (+10)' : '1-3 months (+5)'}, Lot ${lead.lotStatus === 'owned' ? 'owned (+25)' : lead.lotStatus === 'under_contract' ? 'under contract (+15)' : 'looking (-10)'}, ${lead.source === 'Referral' ? 'Referral source (+15)' : 'Direct inquiry (+5)'}`,
    },
    {
      feature: 'Win Probability',
      insight: `${lead.winProbability}% win probability. Similar leads: ${Math.round(lead.winProbability * 0.18)} of ${Math.round(lead.winProbability * 0.18 / (lead.winProbability / 100))} converted (${lead.winProbability}%)`,
    },
    {
      feature: 'Budget Realism',
      insight: `Budget ${formatCurrency(lead.estimatedValue)} for ${lead.projectType.toLowerCase()} is ${lead.budgetRealismScore >= 75 ? 'realistic' : lead.budgetRealismScore >= 50 ? 'potentially tight' : 'likely unrealistic'} for this market. Avg similar: ${formatCurrency(lead.estimatedValue * 0.95)}. $${Math.round(costPerSqFt)}/SF vs market avg $${Math.round(costPerSqFt * 0.98)}/SF.`,
    },
    {
      feature: 'Follow-up Intelligence',
      insight:
        lead.daysInStage > 5
          ? `No contact in ${lead.daysInStage} days. Recommend: Call tomorrow AM. Best response rate: Tue-Thu 10am-12pm for this lead type.`
          : `Recent contact ${lead.daysInStage} days ago. Next touchpoint recommended in ${Math.max(1, 5 - lead.daysInStage)} days.`,
    },
  ]

  if (lead.competitor) {
    features.push({
      feature: 'Competitive Intelligence',
      insight: `Competing with ${lead.competitor}. ${lead.competitivePosition === 'strong' ? 'You have competitive advantage - emphasize your unique value.' : lead.competitivePosition === 'neutral' ? 'Position is neutral - differentiate on service and quality.' : 'They typically quote lower but have longer timelines and mixed reviews.'}`,
    })
  }

  return (
    <AIFeaturesPanel title="AI Lead Intelligence" features={features} className="mt-3" />
  )
}

// Contact Fields Detail Component
function ContactFieldsDetail({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-1.5 mb-3">
      <div className="flex items-center gap-1.5 text-xs text-warm-600">
        <User className="h-3 w-3" />
        <span className="font-medium">{lead.firstName} {lead.lastName}</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-700"
        >
          <Mail className="h-3 w-3" />
          <span>{lead.email}</span>
        </a>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={`tel:${lead.phone.replace(/\D/g, '')}`}
          className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-700"
        >
          <Phone className="h-3 w-3" />
          <span>{lead.phone}</span>
        </a>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-warm-500">
        <Heart className="h-3 w-3" />
        <span>Preferred: {preferredContactLabels[lead.preferredContactMethod]}</span>
      </div>
    </div>
  )
}

function LeadCard({ lead }: { lead: Lead }) {
  const [showStageGate, setShowStageGate] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const lotInfo = lotStatusLabels[lead.lotStatus]
  const financingInfo = financingStatusLabels[lead.financingStatus]

  const currentStageIndex = stages.findIndex((s) => s.id === lead.stage)
  const nextStage = stages[currentStageIndex + 1]

  return (
    <div className="bg-white rounded-lg border border-warm-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-warm-900 text-sm">{lead.name}</h4>
          <p className="text-xs text-warm-500">{lead.projectType}</p>
        </div>
        <button className="p-1 hover:bg-warm-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-warm-400" />
        </button>
      </div>

      {/* Duplicate Warning */}
      <DuplicateWarning lead={lead} />

      {/* Contact Fields Detail */}
      <ContactFieldsDetail lead={lead} />

      {/* Estimator Data Display */}
      <EstimatorDataDisplay lead={lead} />

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-warm-600">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(lead.estimatedValue)}</span>
          <span className="text-warm-400">|</span>
          <span>{lead.estimatedSf.toLocaleString()} SF</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-600">
          <MapPin className="h-3 w-3" />
          <span className={lotInfo.color}>{lotInfo.label}</span>
          {lead.preconType === 'design_build' && (
            <>
              <span className="text-warm-400">|</span>
              <span className="text-indigo-600">Design-Build</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-600">
          <Landmark className="h-3 w-3" />
          <span className={financingInfo.color}>{financingInfo.label}</span>
        </div>
        {lead.source && (
          <div className="flex items-center gap-1.5 text-xs text-warm-600">
            <Target className="h-3 w-3" />
            <span>{lead.source}</span>
            {lead.sourceDetail && (
              <span className="text-warm-400 truncate max-w-[120px]" title={lead.sourceDetail}>
                - {lead.sourceDetail}
              </span>
            )}
          </div>
        )}
        {lead.competitor && (
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="h-3 w-3 text-warm-400" />
            <span className="text-warm-500">vs {lead.competitor}</span>
            {lead.competitivePosition && (
              <span
                className={cn(
                  'px-1 py-0.5 rounded text-[10px] font-medium',
                  lead.competitivePosition === 'strong'
                    ? 'bg-green-50 text-green-700'
                    : lead.competitivePosition === 'neutral'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                )}
              >
                {lead.competitivePosition}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stage activity */}
      <div className="flex items-center gap-2 text-xs text-warm-500 mb-2">
        <Clock className="h-3 w-3" />
        <span>{lead.daysInStage}d in stage</span>
        <span className="text-warm-300">|</span>
        <span>
          {lead.lastActivityType} - {lead.lastActivityDate}
        </span>
      </div>

      {/* Design milestone / Scope iteration */}
      {(lead.designMilestone || lead.scopeIteration) && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {lead.designMilestone && (
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">
              {lead.designMilestone}
            </span>
          )}
          {lead.scopeIteration && (
            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">
              {lead.scopeIteration}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-stone-100 flex items-center justify-center">
            <span className="text-xs font-medium text-stone-700">{lead.assignedTo[0]}</span>
          </div>
          <span className="text-xs text-warm-500">{lead.assignedTo}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded text-xs"
            title="AI Lead Score"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="font-medium text-amber-700">{lead.aiScore}</span>
          </div>
          <div
            className={cn(
              'text-xs px-1.5 py-0.5 rounded font-medium',
              lead.budgetRealismScore >= 75
                ? 'bg-green-50 text-green-700'
                : lead.budgetRealismScore >= 50
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
            )}
            title="Budget Realism Score"
          >
            BR:{lead.budgetRealismScore}
          </div>
          <div
            className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              lead.winProbability >= 70
                ? 'bg-green-50 text-green-700'
                : lead.winProbability >= 40
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
            )}
          >
            {lead.winProbability}%
          </div>
        </div>
      </div>

      {/* Lost reason */}
      {lead.status === 'lost' && lead.lostReason && (
        <div className="mt-2 p-2 bg-red-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-700">Lost: {lead.lostReason}</span>
        </div>
      )}

      {lead.alert && lead.status !== 'lost' && (
        <div className="mt-2 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{lead.alert}</span>
        </div>
      )}

      {/* Lot Evaluation Checklist */}
      <LotEvaluationChecklist lead={lead} />

      {/* Quick Feasibility Calculator */}
      <QuickFeasibilityCalculator lead={lead} />

      {/* AI Insights Toggle */}
      {lead.status === 'active' && (
        <button
          onClick={() => setShowAIInsights(!showAIInsights)}
          className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-medium text-amber-600 hover:text-amber-700 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Insights
          <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showAIInsights && 'rotate-90')} />
        </button>
      )}
      {showAIInsights && <LeadAIInsights lead={lead} />}

      {/* Stage Gate Validation */}
      {nextStage && lead.status === 'active' && lead.stage !== 'won' && lead.stage !== 'lost' && (
        <>
          <button
            onClick={() => setShowStageGate(!showStageGate)}
            className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-medium text-warm-600 hover:text-warm-700 py-1.5 px-3 bg-warm-100 hover:bg-warm-200 rounded-lg transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Advance Stage
            <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showStageGate && 'rotate-90')} />
          </button>
          {showStageGate && <StageGateValidation lead={lead} targetStage={nextStage.id} />}
        </>
      )}

      {/* Convert to Job Button */}
      <ConvertToJobButton lead={lead} />
    </div>
  )
}

// Extended Filter Bar Component
function ExtendedFilterBar({
  projectTypeFilter,
  setProjectTypeFilter,
  lotStatusFilter,
  setLotStatusFilter,
  financingFilter,
  setFinancingFilter,
  sourceFilter,
  setSourceFilter,
  aiScoreRange,
  setAiScoreRange,
}: {
  projectTypeFilter: string[]
  setProjectTypeFilter: (value: string[]) => void
  lotStatusFilter: string[]
  setLotStatusFilter: (value: string[]) => void
  financingFilter: string
  setFinancingFilter: (value: string) => void
  sourceFilter: string
  setSourceFilter: (value: string) => void
  aiScoreRange: [number, number]
  setAiScoreRange: (value: [number, number]) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-warm-200">
      <PriorityFilter value={projectTypeFilter} onChange={setProjectTypeFilter} />
      <StatusFilter
        value={lotStatusFilter}
        onChange={setLotStatusFilter}
        label="Lot Status"
        options={[
          { id: 'owned', label: 'Lot Owned', color: 'bg-green-500' },
          { id: 'under_contract', label: 'Under Contract', color: 'bg-stone-500' },
          { id: 'looking', label: 'Lot Shopping', color: 'bg-amber-500' },
          { id: 'unknown', label: 'Unknown', color: 'bg-warm-400' },
        ]}
      />

      <select
        value={financingFilter}
        onChange={(e) => setFinancingFilter(e.target.value)}
        className="text-xs px-2 py-1.5 border border-warm-200 rounded-lg bg-white"
      >
        <option value="">All Financing</option>
        <option value="pre_approved">Pre-Approved</option>
        <option value="cash">Cash</option>
        <option value="needs_approval">Needs Approval</option>
        <option value="unknown">Unknown</option>
      </select>

      <select
        value={sourceFilter}
        onChange={(e) => setSourceFilter(e.target.value)}
        className="text-xs px-2 py-1.5 border border-warm-200 rounded-lg bg-white"
      >
        <option value="">All Sources</option>
        <option value="Referral">Referral</option>
        <option value="Website">Website</option>
        <option value="Houzz">Houzz</option>
        <option value="Parade of Homes">Parade of Homes</option>
        <option value="Angi">Angi</option>
      </select>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-warm-500">AI Score:</span>
        <input
          type="number"
          min="0"
          max="100"
          value={aiScoreRange[0]}
          onChange={(e) => setAiScoreRange([parseInt(e.target.value) || 0, aiScoreRange[1]])}
          className="w-12 px-1.5 py-1 border border-warm-200 rounded text-center"
        />
        <span className="text-warm-400">-</span>
        <input
          type="number"
          min="0"
          max="100"
          value={aiScoreRange[1]}
          onChange={(e) => setAiScoreRange([aiScoreRange[0], parseInt(e.target.value) || 100])}
          className="w-12 px-1.5 py-1 border border-warm-200 rounded text-center"
        />
      </div>
    </div>
  )
}

export function LeadsPipelinePreview() {
  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    activeSort,
    setActiveSort,
    sortDirection,
    toggleSortDirection,
  } = useFilterState({ defaultView: 'grid' })

  // Extended filter states
  const [projectTypeFilter, setProjectTypeFilter] = useState<string[]>([])
  const [lotStatusFilter, setLotStatusFilter] = useState<string[]>([])

  const [financingFilter, setFinancingFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [aiScoreRange, setAiScoreRange] = useState<[number, number]>([0, 100])

  const activeLeads = mockLeads.filter((l) => l.status === 'active' || l.status === 'won' || l.status === 'lost')

  const searchedLeads = sortItems(
    activeLeads.filter((lead) => {
      // Search filter
      if (!matchesSearch(lead, search, ['name', 'contact', 'projectType', 'assignedTo', 'source', 'competitor']))
        return false

      // Extended filters
      if (projectTypeFilter.length > 0 && !projectTypeFilter.includes(lead.projectType)) return false
      if (lotStatusFilter.length > 0 && !lotStatusFilter.includes(lead.lotStatus)) return false
      if (financingFilter && lead.financingStatus !== financingFilter) return false
      if (sourceFilter && lead.source !== sourceFilter) return false
      if (lead.aiScore < aiScoreRange[0] || lead.aiScore > aiScoreRange[1]) return false

      return true
    }),
    activeSort as keyof Lead | '',
    sortDirection
  )

  // Stats
  const pipelineValue = mockLeads.filter((l) => l.status === 'active').reduce((sum, l) => sum + l.estimatedValue, 0)
  const weightedValue = mockLeads
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (l.estimatedValue * l.winProbability) / 100, 0)
  const hotLeads = mockLeads.filter((l) => l.aiScore >= 85 && l.status === 'active').length
  const staleLeads = mockLeads.filter((l) => l.daysInStage > 7 && l.status === 'active').length
  const winRate =
    Math.round(
      (mockLeads.filter((l) => l.status === 'won').length /
        mockLeads.filter((l) => l.status === 'won' || l.status === 'lost').length) *
        100
    ) || 0

  return (
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-warm-900">Leads Pipeline</h3>
          <span className="text-sm text-warm-500">
            {mockLeads.filter((l) => l.status === 'active').length} active | {formatCurrency(pipelineValue)} pipeline
          </span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search leads, contacts, sources..."
          tabs={[
            { key: 'all', label: 'All', count: activeLeads.length },
            ...stages.map((s) => ({
              key: s.id,
              label: s.label,
              count: activeLeads.filter((l) => l.stage === s.id).length,
            })),
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOptions={[
            { value: 'aiScore', label: 'AI Score' },
            { value: 'estimatedValue', label: 'Value' },
            { value: 'winProbability', label: 'Win %' },
            { value: 'daysInStage', label: 'Days in Stage' },
            { value: 'name', label: 'Name' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Add Lead', onClick: () => {}, variant: 'primary' }]}
          resultCount={searchedLeads.length}
          totalCount={activeLeads.length}
        />

        {/* Extended Filter Bar */}
        <ExtendedFilterBar
          projectTypeFilter={projectTypeFilter}
          setProjectTypeFilter={setProjectTypeFilter}
          lotStatusFilter={lotStatusFilter}
          setLotStatusFilter={setLotStatusFilter}
          financingFilter={financingFilter}
          setFinancingFilter={setFinancingFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          aiScoreRange={aiScoreRange}
          setAiScoreRange={setAiScoreRange}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-stone-500" />
            <div>
              <div className="text-sm font-semibold text-stone-700">{formatCurrency(pipelineValue)}</div>
              <div className="text-[10px] text-stone-600">Pipeline Value</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-semibold text-green-700">{formatCurrency(weightedValue)}</div>
              <div className="text-[10px] text-green-600">Weighted Value</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-sm font-semibold text-amber-700">{hotLeads}</div>
              <div className="text-[10px] text-amber-600">Hot Leads (85+)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-semibold text-red-700">{staleLeads}</div>
              <div className="text-[10px] text-red-600">Stale (7+ days)</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Target className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-semibold text-purple-700">{winRate}%</div>
              <div className="text-[10px] text-purple-600">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-warm-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-stone-50 text-stone-700 rounded">
            <FileText className="h-3 w-3" />
            Estimating
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            <Briefcase className="h-3 w-3" />
            Contracts
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <Building2 className="h-3 w-3" />
            Jobs
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <Mail className="h-3 w-3" />
            Nurturing
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
            <Calendar className="h-3 w-3" />
            Scheduling
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageLeads = searchedLeads.filter((l) => {
              if (activeTab !== 'all' && l.stage !== activeTab) return false
              return l.stage === stage.id
            })
            const stageTotal = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0)

            // If filtering by tab and this isn't the selected stage, skip rendering
            if (activeTab !== 'all' && activeTab !== stage.id) return null

            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2 w-2 rounded-full', stage.color)} />
                    <span className="font-medium text-warm-700 text-sm">{stage.label}</span>
                    <span className="text-xs text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-xs text-warm-500">{formatCurrency(stageTotal)}</span>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Source ROI Bar */}
      <div className="bg-white border-t border-warm-200 px-4 py-3">
        <h4 className="text-xs font-semibold text-warm-700 mb-2">Lead Source Performance</h4>
        <div className="flex items-center gap-3">
          {[
            { source: 'Referral', leads: 3, won: 1, value: '$2.8M', color: 'bg-green-100 text-green-700' },
            { source: 'Website', leads: 1, won: 0, value: '$250K', color: 'bg-stone-100 text-stone-700' },
            { source: 'Houzz', leads: 1, won: 0, value: '$320K', color: 'bg-orange-100 text-orange-700' },
            { source: 'Parade', leads: 1, won: 0, value: '$1.2M', color: 'bg-purple-100 text-purple-700' },
            { source: 'Angi', leads: 1, won: 0, value: '$95K', color: 'bg-red-100 text-red-700' },
          ].map((s) => (
            <div key={s.source} className={cn('flex items-center gap-2 px-2 py-1.5 rounded text-xs', s.color)}>
              <span className="font-medium">{s.source}</span>
              <span>
                {s.leads}L / {s.won}W
              </span>
              <span className="font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>
              Miller Addition has been in Proposal stage for 8 days. Similar leads that convert respond within 5 days.
              Follow up today.
            </p>
            <p>
              Johnson Beach House: budget realism score is 58 - client's wish list may exceed $320K budget. Recommend
              feasibility discussion before advancing.
            </p>
            <p>
              Nguyen Estate is in negotiation with Luxury Living Builders. Your competitive position is strong -
              emphasize coastal construction expertise in next meeting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
