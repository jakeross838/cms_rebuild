'use client'

import { useState } from 'react'
import {
  Shield,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Mail,
  Eye,
  Download,
  MoreHorizontal,
  Sparkles,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Upload,
  RefreshCw,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsurancePolicy {
  id: string
  entityName: string
  entityType: 'company' | 'vendor'
  policyType: string
  carrier: string
  policyNumber: string
  coverage: number
  effectiveDate: string
  expirationDate: string
  daysUntilExpiry: number
  status: 'active' | 'expiring' | 'expired'
  additionalInsured: boolean
  waiverSubrogation: boolean
  verified: boolean
  renewalRequested?: boolean
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
    effectiveDate: '2024-07-01',
    expirationDate: '2025-06-30',
    daysUntilExpiry: 138,
    status: 'active',
    additionalInsured: false,
    waiverSubrogation: false,
    verified: true,
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
    renewalRequested: true,
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
    renewalRequested: false,
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
  },
]

function formatCurrency(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(0) + 'M'
  return '$' + (value / 1000).toFixed(0) + 'K'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function PolicyCard({ policy }: { policy: InsurancePolicy }) {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      policy.status === 'expired' ? "border-red-300 bg-red-50" :
      policy.status === 'expiring' ? "border-amber-300 bg-amber-50" :
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
            <Shield className={cn(
              "h-5 w-5",
              policy.status === 'expired' ? "text-red-600" :
              policy.status === 'expiring' ? "text-amber-600" :
              "text-green-600"
            )} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{policy.entityName}</h4>
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
            Verified
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1",
          policy.status === 'expired' ? "bg-red-100 text-red-700" :
          policy.status === 'expiring' ? "bg-amber-100 text-amber-700" :
          "bg-green-100 text-green-700"
        )}>
          {policy.status === 'expired' && <XCircle className="h-3 w-3" />}
          {policy.status === 'expiring' && <Clock className="h-3 w-3" />}
          {policy.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
          {policy.status === 'expired' ? 'Expired' :
           policy.status === 'expiring' ? `Expires in ${policy.daysUntilExpiry} days` :
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
  const [activeTab, setActiveTab] = useState<'company' | 'vendors' | 'expiring'>('expiring')
  const [searchQuery, setSearchQuery] = useState('')

  const allPolicies = [...mockCompanyPolicies, ...mockVendorPolicies]
  const expiringPolicies = allPolicies.filter(p => p.status === 'expiring' || p.status === 'expired')
  const vendorCount = mockVendorPolicies.length
  const compliantVendors = mockVendorPolicies.filter(p => p.status === 'active').length
  const expiringCount = expiringPolicies.length
  const expiredCount = allPolicies.filter(p => p.status === 'expired').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Insurance Tracking</h3>
            <p className="text-sm text-gray-500">Monitor COIs for your company and vendors</p>
          </div>
          <div className="flex items-center gap-2">
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
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockCompanyPolicies.length}</div>
              <div className="text-xs text-gray-500">Company Policies</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{vendorCount}</div>
              <div className="text-xs text-gray-500">Vendors Tracked</div>
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
              <div className="text-xs text-gray-500">Expiring Soon</div>
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
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('expiring')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeTab === 'expiring' ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              Expiring / Expired
              <span className="bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-xs">
                {expiringPolicies.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeTab === 'company' ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Building2 className="h-4 w-4" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
                activeTab === 'vendors' ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Users className="h-4 w-4" />
              Vendors
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'expiring' && (
          <div className="space-y-4">
            {expiringPolicies.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                <Bell className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    {expiringPolicies.length} policies need attention
                  </p>
                  <p className="text-xs text-amber-700">
                    {expiredCount} expired, {expiringCount - expiredCount} expiring within 30 days
                  </p>
                </div>
                <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  Send Bulk Reminders
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {expiringPolicies.map(policy => (
                <PolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="grid grid-cols-2 gap-4">
            {mockCompanyPolicies.map(policy => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="grid grid-cols-2 gap-4">
            {mockVendorPolicies.map(policy => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Insurance Intelligence:</span>
          </div>
          <p className="text-sm text-amber-700">
            ABC Electric COI received - GL $2M meets minimum. Missing: Waiver of Subrogation endorsement.
            Coastal Paint Pros insurance expired 33 days ago - blocking PO creation recommended.
            Commercial Auto expires in 30 days - auto-renewal confirmation sent to Progressive.
          </p>
        </div>
      </div>
    </div>
  )
}
