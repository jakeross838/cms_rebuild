'use client'

import {
  Shield,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  MoreHorizontal,
  Sparkles,
  Building2,
  Users,
  Upload,
  RefreshCw,
  Bell,
  Mail,
  AlertTriangle,
  FileText,
  HardHat,
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface InsurancePolicy {
  id: string
  entityName: string
  entityType: 'company' | 'vendor' | 'project'
  policyType: 'General Liability' | 'Workers Comp' | 'Commercial Auto' | 'Umbrella' | 'Builders Risk' | 'Professional Liability'
  carrier: string
  policyNumber: string
  coverage: number
  deductible?: number
  effectiveDate: string
  expirationDate: string
  daysUntilExpiry: number
  status: 'active' | 'expiring' | 'expired' | 'pending'
  additionalInsured: boolean
  waiverSubrogation: boolean
  verified: boolean
  verifiedBy?: string
  verifiedAt?: string
  renewalRequested?: boolean
  stateRequirement?: string
  minimumRequired?: number
  meetsMinimum?: boolean
  emrRating?: number
  classCode?: string
  linkedProjects?: string[]
  complianceGrade?: 'A' | 'B' | 'C' | 'F'
  lastReviewDate?: string
  notes?: string
}

const mockCompanyPolicies: InsurancePolicy[] = [
  {
    id: '1',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    policyType: 'General Liability',
    carrier: 'State Farm',
    policyNumber: 'GL-2025-001234',
    coverage: 5000000,
    deductible: 5000,
    effectiveDate: '2024-07-01',
    expirationDate: '2025-06-30',
    daysUntilExpiry: 138,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-07-05',
    stateRequirement: 'FL',
    minimumRequired: 1000000,
    meetsMinimum: true,
    complianceGrade: 'A',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '2',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    policyType: 'Workers Comp',
    carrier: 'Hartford',
    policyNumber: 'WC-2025-005678',
    coverage: 2000000,
    effectiveDate: '2024-07-01',
    expirationDate: '2025-06-30',
    daysUntilExpiry: 138,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-07-05',
    emrRating: 0.85,
    classCode: '5403 - Carpentry',
    stateRequirement: 'FL',
    complianceGrade: 'A',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '3',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    policyType: 'Commercial Auto',
    carrier: 'Progressive',
    policyNumber: 'CA-2025-009012',
    coverage: 1000000,
    effectiveDate: '2024-03-15',
    expirationDate: '2025-03-14',
    daysUntilExpiry: 30,
    status: 'expiring',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Sarah Mitchell',
    verifiedAt: '2024-03-18',
    stateRequirement: 'FL',
    minimumRequired: 500000,
    meetsMinimum: true,
    complianceGrade: 'B',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '4',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    policyType: 'Umbrella',
    carrier: 'Chubb',
    policyNumber: 'UM-2025-003456',
    coverage: 10000000,
    effectiveDate: '2024-07-01',
    expirationDate: '2025-06-30',
    daysUntilExpiry: 138,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-07-05',
    complianceGrade: 'A',
    lastReviewDate: '2025-01-15',
  },
]

const mockVendorPolicies: InsurancePolicy[] = [
  {
    id: '5',
    entityName: 'ABC Electric',
    entityType: 'vendor',
    policyType: 'General Liability',
    carrier: 'Liberty Mutual',
    policyNumber: 'VGL-2025-111',
    coverage: 2000000,
    effectiveDate: '2024-02-15',
    expirationDate: '2025-02-14',
    daysUntilExpiry: 2,
    status: 'expiring',
    additionalInsured: true,
    waiverSubrogation: true,
    verified: true,
    verifiedBy: 'Sarah Mitchell',
    verifiedAt: '2024-02-20',
    renewalRequested: true,
    stateRequirement: 'FL',
    minimumRequired: 1000000,
    meetsMinimum: true,
    linkedProjects: ['Smith Residence', 'Harbor View Custom'],
    complianceGrade: 'A',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '6',
    entityName: 'Coastal Plumbing',
    entityType: 'vendor',
    policyType: 'Workers Comp',
    carrier: 'Travelers',
    policyNumber: 'VWC-2025-222',
    coverage: 1000000,
    effectiveDate: '2024-02-22',
    expirationDate: '2025-02-21',
    daysUntilExpiry: 9,
    status: 'expiring',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Sarah Mitchell',
    verifiedAt: '2024-02-25',
    renewalRequested: false,
    emrRating: 1.15,
    classCode: '5183 - Plumbing',
    stateRequirement: 'FL',
    linkedProjects: ['Johnson Remodel'],
    complianceGrade: 'B',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '7',
    entityName: 'ABC Framing Co.',
    entityType: 'vendor',
    policyType: 'General Liability',
    carrier: 'Nationwide',
    policyNumber: 'VGL-2025-333',
    coverage: 2000000,
    effectiveDate: '2024-06-01',
    expirationDate: '2025-05-31',
    daysUntilExpiry: 108,
    status: 'active',
    additionalInsured: true,
    waiverSubrogation: true,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-06-05',
    stateRequirement: 'FL',
    minimumRequired: 1000000,
    meetsMinimum: true,
    linkedProjects: ['Smith Residence', 'Coastal Retreat'],
    complianceGrade: 'A',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '8',
    entityName: 'Cool Air HVAC',
    entityType: 'vendor',
    policyType: 'General Liability',
    carrier: 'Zurich',
    policyNumber: 'VGL-2025-444',
    coverage: 1500000,
    effectiveDate: '2024-08-15',
    expirationDate: '2025-08-14',
    daysUntilExpiry: 183,
    status: 'active',
    additionalInsured: true,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Sarah Mitchell',
    verifiedAt: '2024-08-20',
    stateRequirement: 'FL',
    minimumRequired: 1000000,
    meetsMinimum: true,
    linkedProjects: ['Johnson Remodel', 'Smith Residence'],
    complianceGrade: 'B',
    notes: 'Missing waiver of subrogation — requested 2025-01-20',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '9',
    entityName: 'Coastal Paint Pros',
    entityType: 'vendor',
    policyType: 'General Liability',
    carrier: 'CNA',
    policyNumber: 'VGL-2024-555',
    coverage: 1000000,
    effectiveDate: '2024-01-10',
    expirationDate: '2025-01-09',
    daysUntilExpiry: -33,
    status: 'expired',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: false,
    stateRequirement: 'FL',
    minimumRequired: 1000000,
    meetsMinimum: true,
    linkedProjects: ['Johnson Remodel'],
    complianceGrade: 'F',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '10',
    entityName: 'Gulf Coast Concrete',
    entityType: 'vendor',
    policyType: 'Workers Comp',
    carrier: 'FCCI',
    policyNumber: 'VWC-2025-666',
    coverage: 1000000,
    effectiveDate: '2024-09-01',
    expirationDate: '2025-08-31',
    daysUntilExpiry: 200,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-09-05',
    emrRating: 0.92,
    classCode: '5213 - Concrete',
    stateRequirement: 'FL',
    linkedProjects: ['Harbor View Custom'],
    complianceGrade: 'A',
    lastReviewDate: '2025-01-15',
  },
  {
    id: '11',
    entityName: 'Solo Tile Works',
    entityType: 'vendor',
    policyType: 'Workers Comp',
    carrier: 'N/A — Exempt',
    policyNumber: 'EXEMPT-FL-2025',
    coverage: 0,
    effectiveDate: '2024-10-01',
    expirationDate: '2025-09-30',
    daysUntilExpiry: 230,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Sarah Mitchell',
    verifiedAt: '2024-10-05',
    stateRequirement: 'FL',
    linkedProjects: ['Smith Residence'],
    complianceGrade: 'B',
    notes: 'Sole proprietor — WC exempt per FL statute. Exemption cert on file, expires 2025-09-30.',
  },
]

const mockProjectPolicies: InsurancePolicy[] = [
  {
    id: '12',
    entityName: 'Smith Residence',
    entityType: 'project',
    policyType: 'Builders Risk',
    carrier: 'Zurich',
    policyNumber: 'BR-2025-SMITH-001',
    coverage: 1800000,
    deductible: 10000,
    effectiveDate: '2024-11-01',
    expirationDate: '2025-11-01',
    daysUntilExpiry: 264,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-11-03',
    complianceGrade: 'A',
    notes: 'Coverage matches contract value. Named insured: Ross Built + First National Bank (lender).',
  },
  {
    id: '13',
    entityName: 'Harbor View Custom',
    entityType: 'project',
    policyType: 'Builders Risk',
    carrier: 'Zurich',
    policyNumber: 'BR-2025-HARBOR-002',
    coverage: 2500000,
    deductible: 15000,
    effectiveDate: '2024-12-15',
    expirationDate: '2025-12-15',
    daysUntilExpiry: 308,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Jake Ross',
    verifiedAt: '2024-12-18',
    complianceGrade: 'A',
  },
  {
    id: '14',
    entityName: 'Johnson Remodel',
    entityType: 'project',
    policyType: 'Builders Risk',
    carrier: 'State Farm',
    policyNumber: 'BR-2024-JOHN-003',
    coverage: 450000,
    deductible: 5000,
    effectiveDate: '2024-06-01',
    expirationDate: '2025-03-01',
    daysUntilExpiry: 17,
    status: 'expiring',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
    verifiedBy: 'Sarah Mitchell',
    verifiedAt: '2024-06-03',
    complianceGrade: 'B',
    notes: 'Project expected to close mid-March. May need 30-day extension.',
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K'
  if (value === 0) return 'N/A'
  return '$' + value.toLocaleString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ComplianceGradeBadge({ grade }: { grade?: string }) {
  if (!grade) return null
  const styles: Record<string, string> = {
    A: 'bg-green-100 text-green-700 border-green-200',
    B: 'bg-blue-100 text-blue-700 border-blue-200',
    C: 'bg-amber-100 text-amber-700 border-amber-200',
    F: 'bg-red-100 text-red-700 border-red-200',
  }
  return (
    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded border', styles[grade] || 'bg-gray-100 text-gray-600')}>
      {grade}
    </span>
  )
}

function PolicyTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'General Liability': return <Shield className="h-4 w-4" />
    case 'Workers Comp': return <HardHat className="h-4 w-4" />
    case 'Commercial Auto': return <FileText className="h-4 w-4" />
    case 'Umbrella': return <Shield className="h-4 w-4" />
    case 'Builders Risk': return <Building2 className="h-4 w-4" />
    case 'Professional Liability': return <Star className="h-4 w-4" />
    default: return <Shield className="h-4 w-4" />
  }
}

function PolicyCard({ policy }: { policy: InsurancePolicy }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      policy.status === 'expired' ? "border-red-300 bg-red-50" :
      policy.status === 'expiring' ? "border-amber-300 bg-amber-50" :
      policy.status === 'pending' ? "border-blue-300 bg-blue-50" :
      "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            policy.status === 'expired' ? "bg-red-100" :
            policy.status === 'expiring' ? "bg-amber-100" :
            "bg-green-100"
          )}>
            <PolicyTypeIcon type={policy.policyType} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{policy.entityName}</h4>
              <ComplianceGradeBadge grade={policy.complianceGrade} />
            </div>
            <p className="text-sm text-gray-500">{policy.policyType}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-xs text-gray-500">Carrier</span>
          <p className="text-sm font-medium text-gray-900">{policy.carrier}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Coverage</span>
          <p className="text-sm font-medium text-gray-900">{formatCurrency(policy.coverage)}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Policy #</span>
          <p className="text-sm font-mono text-gray-700">{policy.policyNumber}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Expires</span>
          <p className={cn(
            "text-sm font-medium",
            policy.status === 'expired' ? "text-red-600" :
            policy.status === 'expiring' ? "text-amber-600" :
            "text-gray-900"
          )}>
            {formatDate(policy.expirationDate)}
          </p>
        </div>
      </div>

      {/* State requirement & minimum check */}
      {policy.minimumRequired && (
        <div className="flex items-center gap-2 mb-2 text-xs">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500">{policy.stateRequirement} min: {formatCurrency(policy.minimumRequired)}</span>
          {policy.meetsMinimum ? (
            <span className="text-green-600 flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />Meets</span>
          ) : (
            <span className="text-red-600 flex items-center gap-0.5"><XCircle className="h-3 w-3" />Below</span>
          )}
        </div>
      )}

      {/* EMR rating for workers comp */}
      {policy.emrRating && (
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className="text-gray-500">EMR: </span>
          <span className={cn(
            "font-medium",
            policy.emrRating <= 1.0 ? "text-green-600" :
            policy.emrRating <= 1.2 ? "text-amber-600" : "text-red-600"
          )}>
            {policy.emrRating.toFixed(2)}
          </span>
          {policy.emrRating <= 1.0 && <TrendingDown className="h-3 w-3 text-green-500" />}
          {policy.emrRating > 1.2 && <TrendingUp className="h-3 w-3 text-red-500" />}
          {policy.classCode && <span className="text-gray-400 ml-1">{policy.classCode}</span>}
        </div>
      )}

      {/* Deductible for Builders Risk */}
      {policy.deductible && (
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className="text-gray-500">Deductible: {formatCurrency(policy.deductible)}</span>
        </div>
      )}

      {/* Linked projects */}
      {policy.linkedProjects && policy.linkedProjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {policy.linkedProjects.map(proj => (
            <span key={proj} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{proj}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        {policy.additionalInsured && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">AI Endorsed</span>
        )}
        {policy.waiverSubrogation && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">WOS</span>
        )}
        {policy.verified && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified{policy.verifiedBy ? ` by ${policy.verifiedBy}` : ''}
          </span>
        )}
        {!policy.verified && policy.status !== 'pending' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Unverified
          </span>
        )}
      </div>

      {/* Notes */}
      {policy.notes && (
        <div className="text-xs text-gray-500 italic mb-3 bg-gray-50 rounded p-2">
          {policy.notes}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className={cn(
          "text-xs px-2 py-1 rounded font-medium flex items-center gap-1",
          policy.status === 'expired' ? "bg-red-100 text-red-700" :
          policy.status === 'expiring' ? "bg-amber-100 text-amber-700" :
          policy.status === 'pending' ? "bg-blue-100 text-blue-700" :
          "bg-green-100 text-green-700"
        )}>
          {policy.status === 'expired' && <XCircle className="h-3 w-3" />}
          {policy.status === 'expiring' && <Clock className="h-3 w-3" />}
          {policy.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
          {policy.status === 'pending' && <Clock className="h-3 w-3" />}
          {policy.status === 'expired' ? `Expired ${Math.abs(policy.daysUntilExpiry)} days ago` :
           policy.status === 'expiring' ? `Expires in ${policy.daysUntilExpiry} days` :
           policy.status === 'pending' ? 'Pending verification' :
           'Active'}
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="View COI">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Download">
            <Download className="h-4 w-4" />
          </button>
          {policy.status === 'expiring' && !policy.renewalRequested && (
            <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Request Renewal">
              <Mail className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {policy.renewalRequested && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700 flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Renewal requested - awaiting response
        </div>
      )}
    </div>
  )
}

export function InsurancePreview() {
  const allPolicies = [...mockCompanyPolicies, ...mockVendorPolicies, ...mockProjectPolicies]
  const expiringPolicies = allPolicies.filter(p => p.status === 'expiring' || p.status === 'expired')

  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'expiring' })

  const filteredPolicies = sortItems(
    (() => {
      let policies: InsurancePolicy[]
      if (activeTab === 'expiring') policies = expiringPolicies
      else if (activeTab === 'company') policies = mockCompanyPolicies
      else if (activeTab === 'vendors') policies = mockVendorPolicies
      else if (activeTab === 'projects') policies = mockProjectPolicies
      else policies = allPolicies

      return policies.filter(p => matchesSearch(p, search, ['entityName', 'policyType', 'carrier', 'policyNumber']))
    })(),
    activeSort as keyof InsurancePolicy | '',
    sortDirection,
  )

  const vendorPolicyCount = mockVendorPolicies.length
  const compliantVendors = mockVendorPolicies.filter(p => p.status === 'active' && p.complianceGrade !== 'F').length
  const expiringCount = allPolicies.filter(p => p.status === 'expiring').length
  const expiredCount = allPolicies.filter(p => p.status === 'expired').length
  const projectPoliciesActive = mockProjectPolicies.filter(p => p.status === 'active' || p.status === 'expiring').length
  const avgCompliance = (() => {
    const grades = allPolicies.filter(p => p.complianceGrade).map(p => {
      switch (p.complianceGrade) {
        case 'A': return 4
        case 'B': return 3
        case 'C': return 2
        case 'F': return 0
        default: return 0
      }
    })
    return (grades.reduce((s: number, g: number) => s + g, 0) / grades.length).toFixed(1)
  })()

  // Monthly review data
  const thisMonthExpiring = allPolicies.filter(p => p.daysUntilExpiry > 0 && p.daysUntilExpiry <= 30).length
  const nextMonthExpiring = allPolicies.filter(p => p.daysUntilExpiry > 30 && p.daysUntilExpiry <= 60).length
  const missingWOS = mockVendorPolicies.filter(p => p.policyType === 'General Liability' && !p.waiverSubrogation && p.status !== 'expired').length
  const missingAI = mockVendorPolicies.filter(p => p.policyType === 'General Liability' && !p.additionalInsured && p.status !== 'expired').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Insurance & Compliance Tracking</h3>
            <p className="text-sm text-gray-500">COI management for company, vendors, and per-project Builders Risk</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              Monthly Review
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Upload COI
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Certificate
            </button>
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search policies, carriers, vendors..."
          tabs={[
            { key: 'expiring', label: 'Expiring / Expired', count: expiringPolicies.length },
            { key: 'company', label: 'Company', count: mockCompanyPolicies.length },
            { key: 'vendors', label: 'Vendors', count: mockVendorPolicies.length },
            { key: 'projects', label: "Builder's Risk", count: mockProjectPolicies.length },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'entityName', label: 'Name' },
            { value: 'carrier', label: 'Carrier' },
            { value: 'coverage', label: 'Coverage' },
            { value: 'daysUntilExpiry', label: 'Expiration' },
            { value: 'policyType', label: 'Policy Type' },
            { value: 'complianceGrade', label: 'Compliance Grade' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          resultCount={filteredPolicies.length}
          totalCount={allPolicies.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-7 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockCompanyPolicies.length}</div>
              <div className="text-xs text-gray-500">Company</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{vendorPolicyCount}</div>
              <div className="text-xs text-gray-500">Vendor COIs</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{projectPoliciesActive}</div>
              <div className="text-xs text-gray-500">Builder&apos;s Risk</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{compliantVendors}</div>
              <div className="text-xs text-gray-500">Compliant</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">{expiringCount}</div>
              <div className="text-xs text-gray-500">Expiring</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{expiredCount}</div>
              <div className="text-xs text-gray-500">Expired</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{avgCompliance}</div>
              <div className="text-xs text-gray-500">Avg Grade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Review Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Monthly Compliance Review — February 2026</p>
              <p className="text-xs text-blue-600">
                This month: {thisMonthExpiring} expiring | Next month: {nextMonthExpiring} expiring |
                Missing WOS: {missingWOS} | Missing AI endorsement: {missingAI}
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'expiring' && filteredPolicies.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {expiringPolicies.length} policies need attention
              </p>
              <p className="text-xs text-amber-700">
                {expiredCount} expired, {expiringCount} expiring within 30 days.
                {expiredCount > 0 && ' PO creation blocked for expired vendors.'}
              </p>
            </div>
            <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              Send Bulk Reminders
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {filteredPolicies.map(policy => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
        {filteredPolicies.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No policies found matching your criteria
          </div>
        )}
      </div>

      {/* Audit Data Summary */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Annual Audit Data:</span>
            <span>Total vendor payments: $1.85M</span>
            <span>|</span>
            <span>5 class codes tracked</span>
            <span>|</span>
            <span>Last audit: Dec 2024</span>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Insurance Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              <span className="font-medium">COI Verification:</span> ABC Electric renewal received — GL $2M meets FL minimum. Missing: Waiver of Subrogation endorsement. Auto-request sent.
            </p>
            <p>
              <span className="font-medium">Compliance Block:</span> Coastal Paint Pros GL expired 33 days ago — PO creation blocked. Active on Johnson Remodel. Escalation: 3 reminder emails sent, no response.
            </p>
            <p>
              <span className="font-medium">Risk Alert:</span> Coastal Plumbing EMR 1.15 (above 1.0 threshold). Factor into prequalification scoring. Johnson Remodel Builder&apos;s Risk expires in 17 days — project closeout expected mid-March, may need extension.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
