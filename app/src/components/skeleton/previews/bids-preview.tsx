'use client'

import { useState } from 'react'
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  MoreHorizontal,
  Plus,
  User,
  TrendingDown,
  Building2,
  AlertCircle,
  Award,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  MessageSquare,
  Paperclip,
  MapPin,
  Shield,
  BarChart3,
  Calendar,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ── Types ────────────────────────────────────────────────────

type BidPackageStatus = 'draft' | 'published' | 'closed' | 'awarded'
type InvitationStatus = 'sent' | 'viewed' | 'acknowledged' | 'submitted' | 'declined' | 'no_response'
type FTQTrend = 'up' | 'down' | 'stable'

interface BidLineItem {
  description: string
  quantity?: number
  unit?: string
  unitPrice?: number
  amount: number
  costCodeId?: string
}

interface BidAlternate {
  description: string
  addDeduct: 'add' | 'deduct'
  amount: number
}

interface BidInvitation {
  vendorId: string
  vendorName: string
  status: InvitationStatus
  sentAt: string
  viewedAt?: string
  respondedAt?: string
  declineReason?: string
  prequalified: boolean
  performanceScore?: number
}

interface BidResponse {
  vendorId: string
  vendorName: string
  totalAmount: number
  lineItems: BidLineItem[]
  alternates: BidAlternate[]
  exclusions: string[]
  inclusions: string[]
  proposedSchedule?: string
  paymentTerms?: string
  validityDays: number
  scopeCoverage: number // percent of scope checklist covered
  aiExtracted: boolean
  anomalyFlag?: 'low' | 'high' | null
  anomalyNote?: string
}

interface BidPackage {
  id: string
  name: string
  jobName: string
  jobNumber: string
  tradeCategory: string
  costCodes: string[]
  budgetAmount: number
  dueDate: string
  preBidMeetingDate?: string
  status: BidPackageStatus
  scopeChecklist: string[]
  planVersion: string
  invitations: BidInvitation[]
  responses: BidResponse[]
  clarificationCount: number
  recommendedVendor?: string
  recommendedAmount?: number
  awardedVendor?: string
  awardedAmount?: number
  aiRecommendation?: string
  aiScopeGaps?: string[]
  templateName?: string
}

// ── Mock Data ────────────────────────────────────────────────

const mockBidPackages: BidPackage[] = [
  {
    id: '1',
    name: 'Electrical Rough-In',
    jobName: 'Smith Residence',
    jobNumber: '2026-SMITH',
    tradeCategory: 'Electrical',
    costCodes: ['26-100', '26-200'],
    budgetAmount: 12000,
    dueDate: '2026-02-15',
    status: 'closed',
    scopeChecklist: ['Rough-in wiring', 'Panel installation', 'Low voltage rough', 'Fixture connections', 'Permit coordination'],
    planVersion: 'Rev C - Jan 15, 2026',
    invitations: [
      { vendorId: 'v1', vendorName: 'XYZ Electric', status: 'submitted', sentAt: '2026-01-25', viewedAt: '2026-01-25', respondedAt: '2026-02-08', prequalified: true, performanceScore: 88 },
      { vendorId: 'v2', vendorName: 'Sparks Electric', status: 'submitted', sentAt: '2026-01-25', viewedAt: '2026-01-26', respondedAt: '2026-02-10', prequalified: true, performanceScore: 92 },
      { vendorId: 'v3', vendorName: 'Gulf Coast Electrical', status: 'submitted', sentAt: '2026-01-25', viewedAt: '2026-01-27', respondedAt: '2026-02-12', prequalified: true, performanceScore: 68 },
      { vendorId: 'v4', vendorName: 'A+ Electric', status: 'declined', sentAt: '2026-01-25', viewedAt: '2026-01-26', respondedAt: '2026-01-28', declineReason: 'At capacity through March', prequalified: true, performanceScore: 95 },
    ],
    responses: [
      { vendorId: 'v1', vendorName: 'XYZ Electric', totalAmount: 11200, lineItems: [{ description: 'Rough-in wiring', amount: 6200 }, { description: 'Panel', amount: 2200 }, { description: 'Low voltage', amount: 1600 }, { description: 'Trim & connections', amount: 1200 }], alternates: [{ description: 'Whole house surge protector', addDeduct: 'add', amount: 450 }], exclusions: ['Permits', 'Fixtures (owner supplied)'], inclusions: ['Wire & conduit', 'Devices & plates', 'Panel', 'Final connections'], proposedSchedule: '3 weeks rough, 1 week trim', paymentTerms: 'Net 30', validityDays: 30, scopeCoverage: 95, aiExtracted: false, anomalyFlag: null },
      { vendorId: 'v2', vendorName: 'Sparks Electric', totalAmount: 13800, lineItems: [{ description: 'Complete electrical package', amount: 13800 }], alternates: [], exclusions: ['Permits'], inclusions: ['All labor', 'Wire', 'Devices', 'Panel', 'Low voltage', 'Fixtures install'], proposedSchedule: '4 weeks total', paymentTerms: 'Net 45', validityDays: 60, scopeCoverage: 100, aiExtracted: false, anomalyFlag: null },
      { vendorId: 'v3', vendorName: 'Gulf Coast Electrical', totalAmount: 8900, lineItems: [{ description: 'Electrical rough & trim', amount: 8900 }], alternates: [], exclusions: ['Permits', 'Fixtures', 'Low voltage', 'Panel upgrade'], inclusions: ['Basic wiring', 'Standard devices'], proposedSchedule: '2 weeks', paymentTerms: 'Net 15', validityDays: 14, scopeCoverage: 65, aiExtracted: true, anomalyFlag: 'low', anomalyNote: 'Bid is 35% below median. Missing low voltage, panel upgrade, and fixture connections. Review scope carefully.' },
    ],
    clarificationCount: 2,
    recommendedVendor: 'XYZ Electric',
    recommendedAmount: 11200,
    aiRecommendation: 'XYZ Electric: lowest complete bid at $11,200 (7% under budget). 95% scope coverage, strong reliability (88). Sparks is $2,600 higher but includes fixture install. Gulf Coast suspiciously low -- missing significant scope items.',
    aiScopeGaps: ['Low voltage not included in Gulf Coast bid', 'Panel upgrade excluded by Gulf Coast'],
  },
  {
    id: '2',
    name: 'Plumbing Finish',
    jobName: 'Smith Residence',
    jobNumber: '2026-SMITH',
    tradeCategory: 'Plumbing',
    costCodes: ['22-200'],
    budgetAmount: 8500,
    dueDate: '2026-02-18',
    status: 'published',
    scopeChecklist: ['Fixture installation', 'Final connections', 'Testing', 'Cleanup'],
    planVersion: 'Rev C - Jan 15, 2026',
    invitations: [
      { vendorId: 'v5', vendorName: 'Bayshore Plumbing', status: 'submitted', sentAt: '2026-02-01', viewedAt: '2026-02-01', respondedAt: '2026-02-10', prequalified: true, performanceScore: 85 },
      { vendorId: 'v6', vendorName: 'Island Plumbing', status: 'viewed', sentAt: '2026-02-01', viewedAt: '2026-02-03', prequalified: true, performanceScore: 90 },
      { vendorId: 'v7', vendorName: 'Jones Plumbing', status: 'sent', sentAt: '2026-02-01', prequalified: false },
    ],
    responses: [
      { vendorId: 'v5', vendorName: 'Bayshore Plumbing', totalAmount: 7800, lineItems: [{ description: 'Plumbing finish labor', amount: 6200 }, { description: 'Materials', amount: 1600 }], alternates: [], exclusions: ['Fixtures (owner supplied)'], inclusions: ['All labor', 'Connections', 'Testing', 'Cleanup'], proposedSchedule: '1 week', paymentTerms: 'Net 30', validityDays: 30, scopeCoverage: 90, aiExtracted: false, anomalyFlag: null },
    ],
    clarificationCount: 0,
    aiRecommendation: 'Awaiting 2 more bids. Bayshore at $7,800 (8% under budget). Jones Plumbing has not viewed invitation -- follow up recommended.',
  },
  {
    id: '3',
    name: 'HVAC Installation',
    jobName: 'Johnson Beach House',
    jobNumber: '2026-JOHN',
    tradeCategory: 'HVAC',
    costCodes: ['23-100', '23-200'],
    budgetAmount: 22000,
    dueDate: '2026-02-08',
    status: 'awarded',
    scopeChecklist: ['Equipment supply', 'Ductwork', 'Controls', 'Start-up', 'Balancing', 'Permits'],
    planVersion: 'Rev B - Dec 20, 2025',
    invitations: [
      { vendorId: 'v8', vendorName: 'CoolAir HVAC', status: 'submitted', sentAt: '2026-01-15', viewedAt: '2026-01-15', respondedAt: '2026-01-28', prequalified: true, performanceScore: 89 },
      { vendorId: 'v9', vendorName: 'Gulf Mechanical', status: 'submitted', sentAt: '2026-01-15', viewedAt: '2026-01-16', respondedAt: '2026-01-30', prequalified: true, performanceScore: 74 },
      { vendorId: 'v10', vendorName: 'Comfort Systems', status: 'submitted', sentAt: '2026-01-15', viewedAt: '2026-01-15', respondedAt: '2026-01-25', prequalified: true, performanceScore: 82 },
      { vendorId: 'v11', vendorName: 'Atlantic Air', status: 'submitted', sentAt: '2026-01-15', viewedAt: '2026-01-17', respondedAt: '2026-02-01', prequalified: true, performanceScore: 78 },
    ],
    responses: [
      { vendorId: 'v8', vendorName: 'CoolAir HVAC', totalAmount: 21500, lineItems: [{ description: 'HVAC complete', amount: 21500 }], alternates: [{ description: 'Upgrade to variable speed', addDeduct: 'add', amount: 2800 }], exclusions: ['Electrical hookup'], inclusions: ['Equipment', 'Ductwork', 'Controls', 'Start-up', 'Balancing'], proposedSchedule: '3 weeks', paymentTerms: 'Net 30', validityDays: 45, scopeCoverage: 92, aiExtracted: false, anomalyFlag: null },
      { vendorId: 'v9', vendorName: 'Gulf Mechanical', totalAmount: 23200, lineItems: [{ description: 'HVAC installation', amount: 23200 }], alternates: [], exclusions: ['Permits', 'Electrical'], inclusions: ['Equipment', 'Ductwork', 'Controls', 'Start-up'], proposedSchedule: '4 weeks', paymentTerms: 'Net 30', validityDays: 30, scopeCoverage: 85, aiExtracted: true, anomalyFlag: null },
      { vendorId: 'v10', vendorName: 'Comfort Systems', totalAmount: 20800, lineItems: [{ description: 'HVAC package', amount: 20800 }], alternates: [{ description: 'Wi-Fi thermostat upgrade', addDeduct: 'add', amount: 350 }], exclusions: ['Permits', 'Electrical', 'Balancing'], inclusions: ['Equipment', 'Ductwork', 'Controls', 'Start-up'], proposedSchedule: '3 weeks', paymentTerms: 'Net 45', validityDays: 30, scopeCoverage: 78, aiExtracted: false, anomalyFlag: null },
      { vendorId: 'v11', vendorName: 'Atlantic Air', totalAmount: 22100, lineItems: [{ description: 'Complete HVAC', amount: 22100 }], alternates: [], exclusions: ['Permits'], inclusions: ['Equipment', 'Ductwork', 'Controls', 'Start-up', 'Balancing', 'Permit coordination'], proposedSchedule: '3.5 weeks', paymentTerms: 'Net 30', validityDays: 30, scopeCoverage: 98, aiExtracted: false, anomalyFlag: null },
    ],
    clarificationCount: 4,
    awardedVendor: 'CoolAir HVAC',
    awardedAmount: 21500,
    aiRecommendation: 'Awarded to CoolAir HVAC at $21,500. Strong performance score (89), 92% scope coverage. Comfort Systems was lower but excluded balancing.',
  },
  {
    id: '4',
    name: 'Framing Package',
    jobName: 'Miller Addition',
    jobNumber: '2026-MILL',
    tradeCategory: 'Framing',
    costCodes: ['06-100', '06-200'],
    budgetAmount: 45000,
    dueDate: '2026-02-28',
    preBidMeetingDate: '2026-02-18',
    status: 'draft',
    scopeChecklist: ['Floor framing', 'Wall framing', 'Roof framing', 'Sheathing', 'Hardware', 'Blocking', 'Cleanup'],
    planVersion: 'Rev A - Feb 1, 2026',
    invitations: [],
    responses: [],
    clarificationCount: 0,
    templateName: 'Residential Framing - Addition',
    aiRecommendation: 'Recommend inviting: Coastal Framing (score 91, 18 jobs), Elite Framing (score 87, 11 jobs), QuickFrame LLC (score 52, budget option). Consider adding 2 more for competitive field.',
  },
  {
    id: '5',
    name: 'Windows & Doors Supply',
    jobName: 'Wilson Custom Home',
    jobNumber: '2026-WILS',
    tradeCategory: 'Windows & Doors',
    costCodes: ['08-100', '08-200'],
    budgetAmount: 68000,
    dueDate: '2026-02-25',
    status: 'published',
    scopeChecklist: ['Impact windows', 'Entry doors', 'Interior doors', 'Sliding doors', 'Hardware', 'Delivery coordination'],
    planVersion: 'Rev D - Jan 28, 2026',
    invitations: [
      { vendorId: 'v12', vendorName: 'PGT Industries', status: 'submitted', sentAt: '2026-02-05', viewedAt: '2026-02-05', respondedAt: '2026-02-14', prequalified: true, performanceScore: 86 },
      { vendorId: 'v13', vendorName: 'Andersen Dealer', status: 'acknowledged', sentAt: '2026-02-05', viewedAt: '2026-02-06', prequalified: true, performanceScore: 81 },
      { vendorId: 'v14', vendorName: 'Pella Direct', status: 'sent', sentAt: '2026-02-05', prequalified: true, performanceScore: 79 },
    ],
    responses: [
      { vendorId: 'v12', vendorName: 'PGT Industries', totalAmount: 65800, lineItems: [{ description: 'Impact windows (14)', amount: 42500 }, { description: 'Entry & sliding doors', amount: 18200 }, { description: 'Interior doors', amount: 5100 }], alternates: [{ description: 'Upgrade to triple-pane', addDeduct: 'add', amount: 8400 }], exclusions: ['Installation labor', 'Hardware'], inclusions: ['All windows & doors', 'Screens', 'Delivery'], proposedSchedule: '8-10 weeks lead time', paymentTerms: '50% deposit, 50% on delivery', validityDays: 30, scopeCoverage: 85, aiExtracted: true, anomalyFlag: null },
    ],
    clarificationCount: 1,
    aiRecommendation: 'PGT at $65,800 (3% under budget). Waiting on Andersen and Pella for comparison. PGT excludes hardware -- add $2,200 to level. Lead time is 8-10 weeks -- order decision needed by Mar 5 to meet schedule.',
    aiScopeGaps: ['Hardware excluded by PGT -- budget $2,200 separately'],
  },
]

const statusConfig: Record<BidPackageStatus, { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  published: { label: 'Published', color: 'bg-blue-100 text-blue-700', icon: Send },
  closed: { label: 'Closed', color: 'bg-amber-100 text-amber-700', icon: CheckCircle2 },
  awarded: { label: 'Awarded', color: 'bg-green-100 text-green-700', icon: Award },
}

const invitationStatusConfig: Record<InvitationStatus, { label: string; color: string }> = {
  sent: { label: 'Sent', color: 'bg-gray-100 text-gray-600' },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-700' },
  acknowledged: { label: 'Acknowledged', color: 'bg-indigo-100 text-indigo-700' },
  submitted: { label: 'Bid Submitted', color: 'bg-green-100 text-green-700' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700' },
  no_response: { label: 'No Response', color: 'bg-gray-100 text-gray-500' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K'
  return '$' + value.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Sub-Components ──────────────────────────────────────────

function InvitationTracker({ invitations }: { invitations: BidInvitation[] }) {
  if (invitations.length === 0) return null

  const submitted = invitations.filter(i => i.status === 'submitted').length
  const declined = invitations.filter(i => i.status === 'declined').length
  const pending = invitations.length - submitted - declined

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Invitations</span>
        <span className="text-xs text-gray-500">{submitted}/{invitations.length} submitted</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {invitations.map(inv => {
          const cfg = invitationStatusConfig[inv.status]
          return (
            <div
              key={inv.vendorId}
              className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', cfg.color)}
              title={inv.declineReason ? `Declined: ${inv.declineReason}` : inv.vendorName}
            >
              {inv.prequalified && <Shield className="h-2.5 w-2.5" />}
              <span className="truncate max-w-[100px]">{inv.vendorName}</span>
              {inv.performanceScore && (
                <span className="text-[10px] opacity-75">({inv.performanceScore})</span>
              )}
            </div>
          )
        })}
      </div>
      {pending > 0 && (
        <div className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pending} vendor{pending > 1 ? 's' : ''} have not responded
        </div>
      )}
    </div>
  )
}

function ScopeGapIndicator({ bid }: { bid: BidPackage }) {
  if (!bid.aiScopeGaps || bid.aiScopeGaps.length === 0) return null

  return (
    <div className="mt-2 p-2 bg-red-50 rounded-md">
      <div className="flex items-center gap-1.5 mb-1">
        <AlertTriangle className="h-3 w-3 text-red-500" />
        <span className="text-xs font-medium text-red-700">Scope Gaps Detected</span>
      </div>
      {bid.aiScopeGaps.map((gap, i) => (
        <div key={i} className="text-xs text-red-600 ml-5">{gap}</div>
      ))}
    </div>
  )
}

function BidComparisonRow({ response, budgetAmount, isRecommended }: { response: BidResponse; budgetAmount: number; isRecommended: boolean }) {
  const vsBudget = ((response.totalAmount - budgetAmount) / budgetAmount) * 100
  const vsBudgetLabel = vsBudget < 0 ? `${vsBudget.toFixed(0)}%` : `+${vsBudget.toFixed(0)}%`

  return (
    <div className={cn(
      'flex items-center gap-3 p-2 rounded-lg text-sm',
      isRecommended ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900 truncate">{response.vendorName}</span>
          {isRecommended && (
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Award className="h-2.5 w-2.5" /> Recommended
            </span>
          )}
          {response.aiExtracted && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> AI Parsed
            </span>
          )}
          {response.anomalyFlag && (
            <span className={cn(
              'text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5',
              response.anomalyFlag === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            )}>
              <AlertTriangle className="h-2.5 w-2.5" />
              {response.anomalyFlag === 'low' ? 'Suspiciously Low' : 'Suspiciously High'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
          <span>Scope: {response.scopeCoverage}%</span>
          <span>Valid: {response.validityDays}d</span>
          {response.paymentTerms && <span>{response.paymentTerms}</span>}
          {response.exclusions.length > 0 && (
            <span className="text-amber-600">{response.exclusions.length} exclusion{response.exclusions.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold text-gray-900">${response.totalAmount.toLocaleString()}</div>
        <div className={cn(
          'text-xs font-medium',
          vsBudget <= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {vsBudgetLabel} vs budget
        </div>
      </div>
    </div>
  )
}

function BidCard({ bid }: { bid: BidPackage }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[bid.status]
  const StatusIcon = status.icon
  const submitted = bid.invitations.filter(i => i.status === 'submitted').length
  const totalInvited = bid.invitations.length
  const lowestBid = bid.responses.length > 0
    ? Math.min(...bid.responses.map(r => r.totalAmount))
    : null
  const savings = lowestBid ? bid.budgetAmount - lowestBid : 0
  const savingsPercent = lowestBid ? ((savings / bid.budgetAmount) * 100).toFixed(0) : '0'

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{bid.name}</h4>
              {bid.templateName && (
                <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">Template</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
              <Building2 className="h-3.5 w-3.5" />
              <span>{bid.jobName}</span>
              <span className="text-gray-300">|</span>
              <Hash className="h-3 w-3" />
              <span className="font-mono text-xs">{bid.tradeCategory}</span>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={cn("text-xs px-2 py-1 rounded font-medium flex items-center gap-1", status.color)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
          {bid.status !== 'awarded' && bid.status !== 'draft' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due: {formatDate(bid.dueDate)}
            </span>
          )}
          {bid.preBidMeetingDate && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Pre-bid: {formatDate(bid.preBidMeetingDate)}
            </span>
          )}
          {bid.clarificationCount > 0 && (
            <span className="text-xs text-indigo-600 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {bid.clarificationCount} Q&A
            </span>
          )}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            {bid.planVersion}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Budget</span>
            </div>
            <span className="font-medium text-gray-900">{formatCurrency(bid.budgetAmount)}</span>
          </div>
          {totalInvited > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="h-3.5 w-3.5" />
                <span>Bids Received</span>
              </div>
              <span className={cn(
                "font-medium",
                submitted >= totalInvited ? "text-green-600" : "text-gray-900"
              )}>
                {submitted} of {totalInvited}
              </span>
            </div>
          )}
          {lowestBid && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Lowest Bid</span>
              </div>
              <span className={cn("font-medium", savings >= 0 ? "text-green-600" : "text-red-600")}>
                {formatCurrency(lowestBid)}
                <span className={cn("text-xs ml-1", savings >= 0 ? "text-green-500" : "text-red-500")}>
                  ({savings >= 0 ? '-' : '+'}{Math.abs(Number(savingsPercent))}%)
                </span>
              </span>
            </div>
          )}
          {bid.awardedVendor && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Award className="h-3.5 w-3.5" />
                <span>Awarded To</span>
              </div>
              <span className="font-medium text-green-700">
                {bid.awardedVendor} &mdash; {formatCurrency(bid.awardedAmount || 0)}
              </span>
            </div>
          )}
        </div>

        {/* Scope coverage bar */}
        {bid.responses.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Scope checklist: {bid.scopeChecklist.length} items</div>
            <div className="flex gap-1">
              {bid.responses.map(r => (
                <div key={r.vendorId} className="flex-1" title={`${r.vendorName}: ${r.scopeCoverage}% coverage`}>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        r.scopeCoverage >= 90 ? 'bg-green-500' : r.scopeCoverage >= 75 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${r.scopeCoverage}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5 truncate">{r.vendorName.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bid.recommendedVendor && bid.status === 'closed' && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="text-gray-600">Recommended:</span>
                <span className="font-medium text-gray-900">{bid.recommendedVendor}</span>
              </div>
              <button className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700">
                Award Bid
              </button>
            </div>
          </div>
        )}

        <InvitationTracker invitations={bid.invitations} />
        <ScopeGapIndicator bid={bid} />

        {bid.aiRecommendation && (
          <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-700">{bid.aiRecommendation}</span>
          </div>
        )}
      </div>

      {/* Expanded: Bid Comparison Matrix */}
      {expanded && bid.responses.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Bid Comparison Matrix
          </h5>
          <div className="space-y-2">
            {bid.responses
              .sort((a, b) => a.totalAmount - b.totalAmount)
              .map(response => (
                <BidComparisonRow
                  key={response.vendorId}
                  response={response}
                  budgetAmount={bid.budgetAmount}
                  isRecommended={response.vendorName === bid.recommendedVendor}
                />
              ))}
          </div>

          {/* Exclusions comparison */}
          {bid.responses.some(r => r.exclusions.length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h6 className="text-xs font-medium text-gray-700 mb-2">Exclusions by Vendor</h6>
              {bid.responses.map(r => (
                r.exclusions.length > 0 && (
                  <div key={r.vendorId} className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">{r.vendorName}:</span>{' '}
                    <span className="text-amber-700">{r.exclusions.join(', ')}</span>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Alternates */}
          {bid.responses.some(r => r.alternates.length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h6 className="text-xs font-medium text-gray-700 mb-2">Alternates</h6>
              {bid.responses.map(r =>
                r.alternates.map((alt, i) => (
                  <div key={`${r.vendorId}-${i}`} className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">{r.vendorName}:</span>{' '}
                    {alt.description}{' '}
                    <span className={cn(alt.addDeduct === 'add' ? 'text-red-600' : 'text-green-600')}>
                      ({alt.addDeduct === 'add' ? '+' : '-'}${alt.amount.toLocaleString()})
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────

export function BidsPreview() {
  const [tradeFilter, setTradeFilter] = useState<string>('all')
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'list' })

  const trades = [...new Set(mockBidPackages.map(b => b.tradeCategory))]

  const filteredBids = sortItems(
    mockBidPackages.filter(bid => {
      if (!matchesSearch(bid, search, ['name', 'jobName', 'tradeCategory'])) return false
      if (activeTab !== 'all' && bid.status !== activeTab) return false
      if (tradeFilter !== 'all' && bid.tradeCategory !== tradeFilter) return false
      return true
    }),
    activeSort as keyof BidPackage | '',
    sortDirection,
  )

  // Calculate quick stats
  const activeBids = mockBidPackages.filter(b => b.status === 'published' || b.status === 'closed').length
  const awaitingValue = mockBidPackages
    .filter(b => b.status === 'published' || b.status === 'closed')
    .reduce((sum, b) => sum + b.budgetAmount, 0)
  const totalSavings = mockBidPackages
    .filter(b => b.responses.length > 0)
    .reduce((sum, b) => {
      const lowest = Math.min(...b.responses.map(r => r.totalAmount))
      return sum + Math.max(0, b.budgetAmount - lowest)
    }, 0)
  const pendingInvitations = mockBidPackages
    .flatMap(b => b.invitations)
    .filter(i => !['submitted', 'declined'].includes(i.status)).length
  const anomalyCount = mockBidPackages
    .flatMap(b => b.responses)
    .filter(r => r.anomalyFlag).length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-semibold text-gray-900">Bid Packages</h3>
          <span className="text-sm text-gray-500">{mockBidPackages.length} packages</span>
          {anomalyCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {anomalyCount} anomal{anomalyCount > 1 ? 'ies' : 'y'}
            </span>
          )}
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search bid packages..."
          tabs={[
            { key: 'all', label: 'All', count: mockBidPackages.length },
            { key: 'draft', label: 'Draft', count: mockBidPackages.filter(b => b.status === 'draft').length },
            { key: 'published', label: 'Published', count: mockBidPackages.filter(b => b.status === 'published').length },
            { key: 'closed', label: 'Closed', count: mockBidPackages.filter(b => b.status === 'closed').length },
            { key: 'awarded', label: 'Awarded', count: mockBidPackages.filter(b => b.status === 'awarded').length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={[
            {
              label: 'All Trades',
              value: tradeFilter,
              options: trades.map(t => ({ value: t, label: t })),
              onChange: setTradeFilter,
            },
          ]}
          sortOptions={[
            { value: 'name', label: 'Package Name' },
            { value: 'budgetAmount', label: 'Budget' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'tradeCategory', label: 'Trade' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          actions={[{ icon: Plus, label: 'New Bid Package', onClick: () => {}, variant: 'primary' }]}
          resultCount={filteredBids.length}
          totalCount={mockBidPackages.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Send className="h-4 w-4" />
              Active Packages
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{activeBids}</div>
            <div className="text-xs text-blue-600 mt-0.5">published or ready to award</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <DollarSign className="h-4 w-4" />
              Awaiting Value
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(awaitingValue)}</div>
            <div className="text-xs text-amber-600 mt-0.5">pending award decisions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <TrendingDown className="h-4 w-4" />
              Potential Savings
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalSavings)}</div>
            <div className="text-xs text-green-600 mt-0.5">vs. budget from bids received</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <Clock className="h-4 w-4" />
              Pending Responses
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-1">{pendingInvitations}</div>
            <div className="text-xs text-purple-600 mt-0.5">vendors have not responded</div>
          </div>
        </div>
      </div>

      {/* Bid Package List */}
      <div className="p-4">
        <div className={cn(
          "max-h-[600px] overflow-y-auto",
          viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'
        )}>
          {filteredBids.map(bid => (
            <BidCard key={bid.id} bid={bid} />
          ))}
        </div>
        {filteredBids.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No bid packages found matching your criteria
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Bid Intelligence:</span>
          </div>
          <div className="flex flex-col gap-1 text-sm text-amber-700">
            <span>Electrical bid ready for award. XYZ Electric recommended at $11,200 (best value score). Gulf Coast bid flagged as suspiciously low -- missing key scope items.</span>
            <span>Jones Plumbing has not viewed their invitation (sent 11 days ago) -- consider follow-up or replacement vendor.</span>
            <span>Framing package: 3 recommended vendors identified from your vendor database. Pre-bid meeting suggested for Feb 18.</span>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <AIFeaturesPanel
        features={[
          {
            name: 'Bid Comparison',
            description: 'Compares vendor bids side-by-side',
          },
          {
            name: 'Scope Alignment',
            description: 'Validates bids cover full scope',
          },
          {
            name: 'Price Anomaly Detection',
            description: 'Flags unusually high/low bids',
          },
          {
            name: 'Vendor History',
            description: 'Shows past performance of bidders',
          },
          {
            name: 'Negotiation Insights',
            description: 'Suggests negotiation opportunities',
          },
        ]}
      />
    </div>
  )
}
