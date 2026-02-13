'use client'

import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  PenTool,
  DollarSign,
  Sparkles,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  User,
  Calendar,
  FileSignature,
  TrendingUp,
  Shield,
  Building2,
  Scale,
  Landmark,
  BookOpen,
  Layers,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

type ContractStatus = 'draft' | 'internal_review' | 'sent' | 'signed' | 'active' | 'complete' | 'amended'
type ContractType = 'fixed_price' | 'cost_plus' | 'gmp' | 't_and_m' | 'hybrid'
type PartyType = 'owner' | 'subcontractor' | 'vendor' | 'precon'

interface Contract {
  id: string
  contractNumber: string
  clientName: string
  projectName: string
  contractValue: number
  retainagePct: number
  date: string
  status: ContractStatus
  signatureStatus: 'pending' | 'client_signed' | 'fully_signed' | 'not_required'
  type: ContractType
  partyType: PartyType
  templateName?: string
  clauseCount?: number
  state: string
  daysSinceSent?: number
  closeoutProgress?: number
  amendments?: number
  changeDirectives?: number
  depositAmount?: number
  depositReceived?: boolean
  warrantyTerms?: string
  drawScheduleType?: string
  lenderName?: string
  insuranceVerified?: boolean
  aiNote?: string
}

const mockContracts: Contract[] = [
  {
    id: '1',
    contractNumber: 'CTR-2026-001',
    clientName: 'John & Sarah Smith',
    projectName: 'Smith Residence',
    contractValue: 2450000,
    retainagePct: 10,
    date: '2026-01-15',
    status: 'active',
    signatureStatus: 'fully_signed',
    type: 'cost_plus',
    partyType: 'owner',
    templateName: 'Standard Cost-Plus with GMP',
    clauseCount: 34,
    state: 'SC',
    closeoutProgress: 0,
    amendments: 1,
    changeDirectives: 2,
    depositAmount: 50000,
    depositReceived: true,
    warrantyTerms: '10yr structural, 2yr systems, 1yr finishes',
    drawScheduleType: 'milestone',
    lenderName: 'First Coastal Bank',
    insuranceVerified: true,
  },
  {
    id: '2',
    contractNumber: 'CTR-2026-007',
    clientName: 'Robert Johnson',
    projectName: 'Johnson Beach House',
    contractValue: 320000,
    retainagePct: 5,
    date: '2026-02-01',
    status: 'sent',
    signatureStatus: 'pending',
    type: 'fixed_price',
    partyType: 'owner',
    templateName: 'Fixed Price Residential',
    clauseCount: 28,
    state: 'SC',
    daysSinceSent: 5,
    depositAmount: 15000,
    depositReceived: false,
    drawScheduleType: 'percentage',
    aiNote: 'Client typically signs within 3 days. Consider follow-up. SC right-to-cancel clause included.',
  },
  {
    id: '3',
    contractNumber: 'CTR-2026-009',
    clientName: 'David Miller',
    projectName: 'Miller Addition',
    contractValue: 250000,
    retainagePct: 10,
    date: '2026-02-08',
    status: 'sent',
    signatureStatus: 'client_signed',
    type: 'fixed_price',
    partyType: 'owner',
    templateName: 'Fixed Price Residential',
    clauseCount: 26,
    state: 'SC',
    daysSinceSent: 2,
    depositAmount: 10000,
    depositReceived: false,
    warrantyTerms: '10yr structural, 2yr systems, 1yr finishes',
  },
  {
    id: '4',
    contractNumber: 'CTR-2026-012',
    clientName: 'Thomas Wilson',
    projectName: 'Wilson Custom Home',
    contractValue: 1200000,
    retainagePct: 10,
    date: '2026-02-10',
    status: 'draft',
    signatureStatus: 'not_required',
    type: 'gmp',
    partyType: 'owner',
    templateName: 'GMP with Savings Split',
    clauseCount: 42,
    state: 'SC',
    drawScheduleType: 'hybrid',
    lenderName: 'Southeastern Mortgage',
    aiNote: 'High-value GMP contract. Savings split clause set at 50/50 above $1.15M. Review audit rights provisions.',
  },
  {
    id: '5',
    contractNumber: 'SUB-2026-015',
    clientName: 'Elite Framing LLC',
    projectName: 'Smith Residence',
    contractValue: 185000,
    retainagePct: 10,
    date: '2026-01-20',
    status: 'active',
    signatureStatus: 'fully_signed',
    type: 'fixed_price',
    partyType: 'subcontractor',
    templateName: 'Standard Subcontract',
    clauseCount: 22,
    state: 'SC',
    amendments: 0,
    insuranceVerified: true,
    warrantyTerms: '2yr workmanship',
  },
  {
    id: '6',
    contractNumber: 'CTR-2025-042',
    clientName: 'Michael Davis',
    projectName: 'Davis Coastal Home',
    contractValue: 920000,
    retainagePct: 10,
    date: '2025-12-20',
    status: 'complete',
    signatureStatus: 'fully_signed',
    type: 'cost_plus',
    partyType: 'owner',
    templateName: 'Standard Cost-Plus',
    clauseCount: 30,
    state: 'SC',
    closeoutProgress: 85,
    warrantyTerms: '10yr structural, 2yr systems, 1yr finishes',
  },
  {
    id: '7',
    contractNumber: 'PRE-2026-003',
    clientName: 'David & Mai Nguyen',
    projectName: 'Nguyen Waterfront Estate',
    contractValue: 25000,
    retainagePct: 0,
    date: '2026-01-28',
    status: 'active',
    signatureStatus: 'fully_signed',
    type: 'fixed_price',
    partyType: 'precon',
    templateName: 'Pre-Construction Agreement',
    clauseCount: 12,
    state: 'SC',
    aiNote: 'Pre-con agreement for design phase. Billing: 5 milestones at $5K each. 2 of 5 milestones invoiced.',
  },
]

const statusConfig: Record<ContractStatus, { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  internal_review: { label: 'Internal Review', color: 'bg-amber-100 text-amber-700', icon: BookOpen },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  signed: { label: 'Signed', color: 'bg-purple-100 text-purple-700', icon: PenTool },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  complete: { label: 'Closeout', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  amended: { label: 'Amended', color: 'bg-orange-100 text-orange-700', icon: FileText },
}

const signatureConfig = {
  pending: { label: 'Awaiting Signature', color: 'text-amber-600', icon: Clock },
  client_signed: { label: 'Client Signed', color: 'text-blue-600', icon: PenTool },
  fully_signed: { label: 'Fully Executed', color: 'text-green-600', icon: CheckCircle },
  not_required: { label: 'Not Sent', color: 'text-gray-400', icon: FileText },
}

const typeConfig: Record<ContractType, { label: string; color: string }> = {
  fixed_price: { label: 'Fixed Price', color: 'bg-indigo-50 text-indigo-700' },
  cost_plus: { label: 'Cost Plus', color: 'bg-teal-50 text-teal-700' },
  gmp: { label: 'GMP', color: 'bg-amber-50 text-amber-700' },
  t_and_m: { label: 'T&M', color: 'bg-cyan-50 text-cyan-700' },
  hybrid: { label: 'Hybrid', color: 'bg-purple-50 text-purple-700' },
}

const partyLabels: Record<PartyType, { label: string; color: string }> = {
  owner: { label: 'Owner', color: 'bg-blue-50 text-blue-700' },
  subcontractor: { label: 'Subcontract', color: 'bg-green-50 text-green-700' },
  vendor: { label: 'Vendor', color: 'bg-orange-50 text-orange-700' },
  precon: { label: 'Pre-Con', color: 'bg-purple-50 text-purple-700' },
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  return '$' + value.toFixed(0)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ContractCard({ contract }: { contract: Contract }) {
  const status = statusConfig[contract.status]
  const signature = signatureConfig[contract.signatureStatus]
  const contractType = typeConfig[contract.type]
  const party = partyLabels[contract.partyType]
  const StatusIcon = status.icon
  const SignatureIcon = signature.icon

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-medium text-gray-900">{contract.projectName}</h4>
            <span className="text-[10px] text-gray-400 font-mono">{contract.contractNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <User className="h-3.5 w-3.5" />
            <span>{contract.clientName}</span>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1", status.color)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", contractType.color)}>
          {contractType.label}
        </span>
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", party.color)}>
          {party.label}
        </span>
        {contract.insuranceVerified && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600 flex items-center gap-0.5">
            <Shield className="h-3 w-3" />
            COI
          </span>
        )}
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Contract Value</span>
          </div>
          <span className="font-semibold text-gray-900">{formatCurrency(contract.contractValue)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>Date</span>
          </div>
          <span className="text-gray-700">{formatDate(contract.date)}</span>
        </div>
        {contract.retainagePct > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 text-xs">Retainage</span>
            <span className="text-gray-700 text-xs">{contract.retainagePct}%</span>
          </div>
        )}
        {contract.templateName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Layers className="h-3 w-3" />
            <span>{contract.templateName}</span>
            {contract.clauseCount && (
              <span className="text-gray-400">({contract.clauseCount} clauses)</span>
            )}
          </div>
        )}
        {contract.lenderName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Landmark className="h-3 w-3" />
            <span>{contract.lenderName}</span>
            {contract.drawScheduleType && (
              <span className="text-gray-400">({contract.drawScheduleType} draws)</span>
            )}
          </div>
        )}
        {contract.warrantyTerms && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span className="truncate" title={contract.warrantyTerms}>{contract.warrantyTerms}</span>
          </div>
        )}
      </div>

      {/* Amendments and change directives */}
      {(contract.amendments !== undefined && contract.amendments > 0) || (contract.changeDirectives !== undefined && contract.changeDirectives > 0) ? (
        <div className="flex items-center gap-3 mb-2 text-xs">
          {contract.amendments !== undefined && contract.amendments > 0 && (
            <span className="text-orange-600">{contract.amendments} amendment{contract.amendments > 1 ? 's' : ''}</span>
          )}
          {contract.changeDirectives !== undefined && contract.changeDirectives > 0 && (
            <span className="text-amber-600">{contract.changeDirectives} verbal directive{contract.changeDirectives > 1 ? 's' : ''} pending</span>
          )}
        </div>
      ) : null}

      {/* Closeout progress */}
      {contract.closeoutProgress !== undefined && contract.closeoutProgress > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Closeout Progress</span>
            <span className="font-medium text-gray-700">{contract.closeoutProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${contract.closeoutProgress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className={cn("flex items-center gap-1.5 text-sm", signature.color)}>
          <FileSignature className="h-4 w-4" />
          <SignatureIcon className="h-3.5 w-3.5" />
          <span className="text-xs">{signature.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {contract.state && (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{contract.state}</span>
          )}
          {contract.daysSinceSent && contract.status === 'sent' && (
            <span className="text-xs text-gray-500">
              {contract.daysSinceSent}d ago
            </span>
          )}
        </div>
      </div>

      {contract.aiNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-amber-700">{contract.aiNote}</span>
        </div>
      )}
    </div>
  )
}

export function ContractsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState()

  const allStatuses = ['all', 'draft', 'internal_review', 'sent', 'signed', 'active', 'complete']

  const filtered = sortItems(
    mockContracts.filter(c => {
      if (!matchesSearch(c, search, ['clientName', 'projectName', 'contractNumber', 'templateName'])) return false
      if (activeTab !== 'all' && c.status !== activeTab) return false
      return true
    }),
    activeSort as keyof Contract | '',
    sortDirection,
  )

  // Calculate quick stats
  const pendingSignature = mockContracts.filter(c =>
    c.signatureStatus === 'pending' || c.signatureStatus === 'client_signed'
  ).length
  const totalContractValue = mockContracts.filter(c => c.partyType === 'owner').reduce((sum, c) => sum + c.contractValue, 0)
  const totalSubValue = mockContracts.filter(c => c.partyType === 'subcontractor').reduce((sum, c) => sum + c.contractValue, 0)
  const activeContracts = mockContracts.filter(c => c.status === 'active').length
  const pendingCloseout = mockContracts.filter(c => c.status === 'complete' && (c.closeoutProgress || 0) < 100).length
  const verbalDirectives = mockContracts.reduce((sum, c) => sum + (c.changeDirectives || 0), 0)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Contracts & Agreements</h3>
          <span className="text-sm text-gray-500">{mockContracts.length} contracts | {formatCurrency(totalContractValue)} owner value</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs mb-1">
              <Clock className="h-3.5 w-3.5" />
              Pending Signature
            </div>
            <div className="text-xl font-bold text-amber-700">{pendingSignature}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-green-600 text-xs mb-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Active
            </div>
            <div className="text-xl font-bold text-green-700">{activeContracts}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-blue-600 text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Owner Value
            </div>
            <div className="text-xl font-bold text-blue-700">{formatCurrency(totalContractValue)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-purple-600 text-xs mb-1">
              <Building2 className="h-3.5 w-3.5" />
              Sub Value
            </div>
            <div className="text-xl font-bold text-purple-700">{formatCurrency(totalSubValue)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-orange-600 text-xs mb-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Verbal Directives
            </div>
            <div className="text-xl font-bold text-orange-700">{verbalDirectives}</div>
          </div>
        </div>
      </div>

      {/* E-Signature & Compliance Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">E-Signature</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">DocuSign Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-700">State Compliance</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">SC Clauses Active</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {mockContracts.filter(c => c.signatureStatus === 'fully_signed').length} executed
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {mockContracts.filter(c => c.signatureStatus === 'client_signed').length} client signed
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              {mockContracts.filter(c => c.signatureStatus === 'pending').length} pending
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Module Connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 font-medium">Connections:</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            <DollarSign className="h-3 w-3" />
            Budget (Module 9)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
            <FileText className="h-3 w-3" />
            Change Orders (Module 17)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
            <Shield className="h-3 w-3" />
            Warranty (Module 31)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
            <Landmark className="h-3 w-3" />
            Draws (Module 15)
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
            <Building2 className="h-3 w-3" />
            Vendors (Module 10)
          </span>
        </div>
      </div>

      {/* Status Tabs + FilterBar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contracts, clients, templates..."
          tabs={allStatuses.map(s => ({
            key: s,
            label: s === 'all' ? 'All' : s === 'internal_review' ? 'Review' : s.charAt(0).toUpperCase() + s.slice(1),
            count: s === 'all' ? undefined : mockContracts.filter(c => c.status === s).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'contractValue', label: 'Value' },
            { value: 'date', label: 'Date' },
            { value: 'clientName', label: 'Client' },
            { value: 'projectName', label: 'Project' },
            { value: 'type', label: 'Contract Type' },
            { value: 'partyType', label: 'Party Type' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'New Contract', onClick: () => {}, variant: 'primary' }]}
          resultCount={filtered.length}
          totalCount={mockContracts.length}
        />
      </div>

      {/* Contract Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
        {filtered.map(contract => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No contracts found
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700 space-y-1">
            <p>Johnson Beach House pending 5+ days - follow up recommended. SC mechanic's lien notice deadline is 90 days from first work.</p>
            <p>Wilson Custom: GMP contract has savings split at $1.15M threshold. Cost-to-complete projection shows $42K under GMP - client eligible for savings share.</p>
            <p>Smith Residence: 2 verbal change directives need formalization. Formalize within 7 days per contract terms.</p>
            <p>Davis Coastal: closeout at 85% - outstanding items: final lien waiver (unconditional), warranty letter, O&M manual.</p>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <AIFeaturesPanel
          title="Contract AI Features"
          columns={2}
          features={[
            {
              feature: 'Clause Analysis',
              trigger: 'On creation',
              insight: 'Identifies risky contract clauses',
              detail: 'AI scans contract language to flag potentially problematic clauses, including unfavorable indemnification terms, liability caps, and payment conditions that may expose the company to risk.',
              severity: 'warning',
              confidence: 92,
            },
            {
              feature: 'Scope Comparison',
              trigger: 'On change',
              insight: 'Compares contract scope to estimate',
              detail: 'Automatically compares contracted scope of work against the original estimate to identify gaps, exclusions, or scope creep that could impact profitability.',
              severity: 'info',
              confidence: 88,
            },
            {
              feature: 'Change Order Forecast',
              trigger: 'Real-time',
              insight: 'Predicts likely change order areas',
              detail: 'Analyzes historical project data and contract terms to predict areas most likely to result in change orders, helping teams proactively manage scope and client expectations.',
              severity: 'warning',
              confidence: 85,
            },
            {
              feature: 'Payment Terms Analysis',
              trigger: 'On creation',
              insight: 'Evaluates payment structure risks',
              detail: 'Reviews payment schedules, retainage terms, and milestone structures to identify cash flow risks and ensure alignment with project cost curves.',
              severity: 'info',
              confidence: 94,
            },
            {
              feature: 'Compliance Check',
              trigger: 'On submission',
              insight: 'Validates required clauses and terms',
              detail: 'Ensures contracts include all state-required clauses (SC right-to-cancel, lien notices), insurance requirements, and company-standard protective language.',
              severity: 'success',
              confidence: 97,
            },
          ]}
        />
      </div>
    </div>
  )
}
