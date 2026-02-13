'use client'

import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  MoreHorizontal,
  Sparkles,
  Building2,
  Users,
  User,
  MapPin,
  GraduationCap,
  ExternalLink,
  BookOpen,
  Link2,
  Shield,
  ShieldAlert,
  FileText,
  RefreshCw,
  Ban,
  Calendar,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

// ── Types ───────────────────────────────────────────────────────────────

interface License {
  id: string
  entityName: string
  entityType: 'company' | 'employee' | 'vendor'
  licenseType: string
  licenseCategory: 'contractor' | 'trade' | 'safety' | 'professional' | 'equipment_operator'
  licenseNumber: string
  issuingAuthority: string
  jurisdiction: string
  issueDate: string
  expirationDate: string | null
  daysUntilExpiry: number | null
  status: 'active' | 'expiring' | 'expired' | 'renewed' | 'lapsed'
  renewalStatus?: 'not_started' | 'reminder_sent' | 'renewal_submitted' | 'renewed' | 'lapsed'
  ceuRequired?: number
  ceuCompleted?: number
  verified: boolean
  verificationDate?: string
  verificationSource?: string
  documentUrl?: boolean
  autoBlockEnabled: boolean
  autoBlockedTasks?: string[]
  stateVerificationAvailable: boolean
  linkedModules: string[]
}

// ── Mock Data ───────────────────────────────────────────────────────────

const mockCompanyLicenses: License[] = [
  {
    id: '1',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    licenseType: 'General Contractor',
    licenseCategory: 'contractor',
    licenseNumber: 'CGC123456',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2020-01-15',
    expirationDate: '2025-12-31',
    daysUntilExpiry: 322,
    status: 'active',
    renewalStatus: 'not_started',
    verified: true,
    verificationDate: '2025-01-15',
    verificationSource: 'DBPR Online Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Auth (M01)', 'Vendors (M10)'],
  },
  {
    id: '2',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    licenseType: 'Roofing Contractor',
    licenseCategory: 'contractor',
    licenseNumber: 'CCC098765',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2021-06-01',
    expirationDate: '2025-12-31',
    daysUntilExpiry: 322,
    status: 'active',
    renewalStatus: 'not_started',
    verified: true,
    verificationDate: '2025-06-01',
    verificationSource: 'DBPR Online Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Auth (M01)'],
  },
]

const mockEmployeeCertifications: License[] = [
  {
    id: '3',
    entityName: 'Jake Ross',
    entityType: 'employee',
    licenseType: 'CGC Qualifier',
    licenseCategory: 'contractor',
    licenseNumber: 'QA-789012',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2020-01-15',
    expirationDate: '2025-12-31',
    daysUntilExpiry: 322,
    status: 'active',
    renewalStatus: 'not_started',
    ceuRequired: 14,
    ceuCompleted: 14,
    verified: true,
    verificationDate: '2025-01-15',
    verificationSource: 'DBPR Online Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
  },
  {
    id: '4',
    entityName: 'Mike Smith',
    entityType: 'employee',
    licenseType: 'OSHA 30-Hour',
    licenseCategory: 'safety',
    licenseNumber: 'OSHA-30-445566',
    issuingAuthority: 'OSHA',
    jurisdiction: 'Federal',
    issueDate: '2022-03-15',
    expirationDate: null,
    daysUntilExpiry: null,
    status: 'active',
    verified: true,
    documentUrl: true,
    autoBlockEnabled: true,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
  },
  {
    id: '5',
    entityName: 'Mike Smith',
    entityType: 'employee',
    licenseType: 'Coastal Construction',
    licenseCategory: 'trade',
    licenseNumber: 'CC-2023-001',
    issuingAuthority: 'FL Building Commission',
    jurisdiction: 'Florida',
    issueDate: '2023-03-15',
    expirationDate: '2025-03-14',
    daysUntilExpiry: 30,
    status: 'expiring',
    renewalStatus: 'reminder_sent',
    ceuRequired: 8,
    ceuCompleted: 4,
    verified: true,
    verificationDate: '2024-03-15',
    verificationSource: 'FL Building Commission',
    documentUrl: true,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Coastal zone framing', 'Beach foundation work'],
    stateVerificationAvailable: true,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Scheduling (M07)'],
  },
  {
    id: '6',
    entityName: 'Sarah Johnson',
    entityType: 'employee',
    licenseType: 'Project Management Professional',
    licenseCategory: 'professional',
    licenseNumber: 'PMP-123456',
    issuingAuthority: 'PMI',
    jurisdiction: 'International',
    issueDate: '2022-06-01',
    expirationDate: '2025-06-01',
    daysUntilExpiry: 109,
    status: 'active',
    renewalStatus: 'not_started',
    ceuRequired: 60,
    ceuCompleted: 52,
    verified: true,
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)'],
  },
  {
    id: '7',
    entityName: 'Tom Wilson',
    entityType: 'employee',
    licenseType: 'First Aid/CPR',
    licenseCategory: 'safety',
    licenseNumber: 'FA-2024-789',
    issuingAuthority: 'Red Cross',
    jurisdiction: 'National',
    issueDate: '2024-01-10',
    expirationDate: '2026-01-10',
    daysUntilExpiry: 332,
    status: 'active',
    verified: true,
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
  },
  {
    id: '8',
    entityName: 'Tom Wilson',
    entityType: 'employee',
    licenseType: 'Fall Protection Competent Person',
    licenseCategory: 'safety',
    licenseNumber: 'FP-2023-456',
    issuingAuthority: 'National Safety Council',
    jurisdiction: 'National',
    issueDate: '2023-06-15',
    expirationDate: '2025-06-15',
    daysUntilExpiry: 123,
    status: 'active',
    renewalStatus: 'not_started',
    verified: true,
    documentUrl: true,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Roof framing', 'Elevated platform work'],
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Scheduling (M07)'],
  },
  {
    id: '9',
    entityName: 'Carlos Mendez',
    entityType: 'employee',
    licenseType: 'OSHA 10-Hour',
    licenseCategory: 'safety',
    licenseNumber: 'OSHA-10-778899',
    issuingAuthority: 'OSHA',
    jurisdiction: 'Federal',
    issueDate: '2024-09-01',
    expirationDate: null,
    daysUntilExpiry: null,
    status: 'active',
    verified: true,
    documentUrl: true,
    autoBlockEnabled: true,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
  },
  {
    id: '10',
    entityName: 'Carlos Mendez',
    entityType: 'employee',
    licenseType: 'Forklift Operator',
    licenseCategory: 'equipment_operator',
    licenseNumber: 'FLO-2024-001',
    issuingAuthority: 'OSHA',
    jurisdiction: 'Federal',
    issueDate: '2024-05-10',
    expirationDate: '2027-05-10',
    daysUntilExpiry: 817,
    status: 'active',
    verified: true,
    documentUrl: false,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Forklift operation', 'Material loading'],
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Equipment (M35)'],
  },
]

const mockVendorLicenses: License[] = [
  {
    id: '11',
    entityName: 'ABC Electric',
    entityType: 'vendor',
    licenseType: 'Electrical Contractor',
    licenseCategory: 'trade',
    licenseNumber: 'EC-13001234',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2021-04-01',
    expirationDate: '2025-08-31',
    daysUntilExpiry: 200,
    status: 'active',
    renewalStatus: 'not_started',
    verified: true,
    verificationDate: '2025-01-10',
    verificationSource: 'DBPR Online Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)', 'Safety (M33)'],
  },
  {
    id: '12',
    entityName: 'Coastal Plumbing',
    entityType: 'vendor',
    licenseType: 'Plumbing Contractor',
    licenseCategory: 'trade',
    licenseNumber: 'CFC-057891',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2022-02-15',
    expirationDate: '2025-08-31',
    daysUntilExpiry: 200,
    status: 'active',
    renewalStatus: 'not_started',
    verified: true,
    verificationDate: '2025-02-15',
    verificationSource: 'DBPR Online Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)', 'Safety (M33)'],
  },
  {
    id: '13',
    entityName: 'Cool Air HVAC',
    entityType: 'vendor',
    licenseType: 'HVAC Contractor',
    licenseCategory: 'trade',
    licenseNumber: 'CAC-1818232',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2020-09-01',
    expirationDate: '2024-12-31',
    daysUntilExpiry: -43,
    status: 'expired',
    renewalStatus: 'lapsed',
    verified: false,
    documentUrl: true,
    autoBlockEnabled: true,
    autoBlockedTasks: ['All HVAC scope'],
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)', 'Safety (M33)', 'Bid Mgmt (M26)'],
  },
  {
    id: '14',
    entityName: 'Premium Drywall',
    entityType: 'vendor',
    licenseType: 'Drywall Contractor',
    licenseCategory: 'trade',
    licenseNumber: 'DWC-2023-567',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2023-01-15',
    expirationDate: '2025-04-15',
    daysUntilExpiry: 62,
    status: 'expiring',
    renewalStatus: 'renewal_submitted',
    verified: true,
    verificationDate: '2024-01-15',
    verificationSource: 'DBPR Online Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)'],
  },
]

interface TrainingCourse {
  id: string
  name: string
  provider: string
  ceuHours: number
  duration: string
  relevantFor: string[]
  format: 'online' | 'in-person' | 'hybrid'
}

const recommendedCourses: TrainingCourse[] = [
  {
    id: '1',
    name: 'Coastal Building Code Update 2025',
    provider: 'FL Building Commission',
    ceuHours: 4,
    duration: '4 hours',
    relevantFor: ['Coastal Construction'],
    format: 'online',
  },
  {
    id: '2',
    name: 'Advanced PM Techniques',
    provider: 'PMI',
    ceuHours: 8,
    duration: '2 days',
    relevantFor: ['Project Management Professional'],
    format: 'hybrid',
  },
  {
    id: '3',
    name: 'Construction Safety Leadership',
    provider: 'OSHA',
    ceuHours: 4,
    duration: '4 hours',
    relevantFor: ['CGC Qualifier', 'OSHA 30-Hour'],
    format: 'in-person',
  },
  {
    id: '4',
    name: 'Fall Protection for Competent Persons - Refresher',
    provider: 'National Safety Council',
    ceuHours: 8,
    duration: '1 day',
    relevantFor: ['Fall Protection Competent Person'],
    format: 'in-person',
  },
]

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const categoryLabels: Record<License['licenseCategory'], string> = {
  contractor: 'Contractor',
  trade: 'Trade',
  safety: 'Safety',
  professional: 'Professional',
  equipment_operator: 'Equipment Operator',
}

const categoryColors: Record<License['licenseCategory'], string> = {
  contractor: 'bg-blue-100 text-blue-700',
  trade: 'bg-green-100 text-green-700',
  safety: 'bg-red-100 text-red-700',
  professional: 'bg-purple-100 text-purple-700',
  equipment_operator: 'bg-amber-100 text-amber-700',
}

const renewalLabels: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
  reminder_sent: { label: 'Reminder Sent', color: 'bg-blue-100 text-blue-700' },
  renewal_submitted: { label: 'Submitted', color: 'bg-purple-100 text-purple-700' },
  renewed: { label: 'Renewed', color: 'bg-green-100 text-green-700' },
  lapsed: { label: 'Lapsed', color: 'bg-red-100 text-red-700' },
}

// ── Sub-components ──────────────────────────────────────────────────────

function LicenseCard({ license }: { license: License }) {
  const showCEU = license.ceuRequired !== undefined && license.ceuRequired > 0
  const ceuProgress = showCEU ? (license.ceuCompleted! / license.ceuRequired!) * 100 : 0
  const ceuNeeded = showCEU ? license.ceuRequired! - license.ceuCompleted! : 0

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      license.status === 'expired' ? "border-red-300 bg-red-50" :
      license.status === 'expiring' ? "border-amber-300 bg-amber-50" :
      license.status === 'lapsed' ? "border-red-300 bg-red-50" :
      "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            license.status === 'expired' || license.status === 'lapsed' ? "bg-red-100" :
            license.status === 'expiring' ? "bg-amber-100" :
            "bg-blue-100"
          )}>
            {license.entityType === 'company' ? (
              <Building2 className={cn(
                "h-5 w-5",
                license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
                license.status === 'expiring' ? "text-amber-600" :
                "text-blue-600"
              )} />
            ) : license.entityType === 'employee' ? (
              <User className={cn(
                "h-5 w-5",
                license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
                license.status === 'expiring' ? "text-amber-600" :
                "text-blue-600"
              )} />
            ) : (
              <Users className={cn(
                "h-5 w-5",
                license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
                license.status === 'expiring' ? "text-amber-600" :
                "text-blue-600"
              )} />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{license.entityName}</h4>
            <p className="text-sm text-gray-500">{license.licenseType}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Category + Entity Type badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={cn("text-xs px-2 py-0.5 rounded font-medium", categoryColors[license.licenseCategory])}>
          {categoryLabels[license.licenseCategory]}
        </span>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded",
          license.entityType === 'company' ? "bg-purple-100 text-purple-700" :
          license.entityType === 'employee' ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-700"
        )}>
          {license.entityType}
        </span>
        {license.autoBlockEnabled && (
          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded flex items-center gap-1 border border-red-200">
            <Ban className="h-3 w-3" />
            Auto-Block
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-xs text-gray-500">License #</span>
          <p className="text-sm font-mono text-gray-700">{license.licenseNumber}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Issuing Authority</span>
          <p className="text-sm font-medium text-gray-900">{license.issuingAuthority}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Jurisdiction</span>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {license.jurisdiction}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Expires</span>
          <p className={cn(
            "text-sm font-medium",
            license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
            license.status === 'expiring' ? "text-amber-600" :
            "text-gray-900"
          )}>
            {license.expirationDate ? formatDate(license.expirationDate) : 'No Expiry'}
          </p>
        </div>
      </div>

      {/* Renewal status */}
      {license.renewalStatus && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Renewal:</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1",
            renewalLabels[license.renewalStatus].color
          )}>
            <RefreshCw className="h-3 w-3" />
            {renewalLabels[license.renewalStatus].label}
          </span>
        </div>
      )}

      {showCEU && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              CEU Progress
            </span>
            <span className={cn(
              "text-xs font-medium",
              ceuNeeded > 0 ? "text-amber-600" : "text-green-600"
            )}>
              {license.ceuCompleted}/{license.ceuRequired} hours
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                ceuProgress >= 100 ? "bg-green-500" : "bg-amber-500"
              )}
              style={{ width: `${Math.min(ceuProgress, 100)}%` }}
            />
          </div>
          {ceuNeeded > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {ceuNeeded} hours needed for renewal
            </p>
          )}
        </div>
      )}

      {/* Auto-blocked tasks */}
      {license.autoBlockEnabled && license.autoBlockedTasks && license.autoBlockedTasks.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded text-xs">
          <div className="font-medium text-red-700 flex items-center gap-1 mb-1">
            <ShieldAlert className="h-3 w-3" />
            Auto-blocked tasks (requires valid cert):
          </div>
          <div className="text-red-600">
            {license.autoBlockedTasks.join(', ')}
          </div>
        </div>
      )}

      {/* Verification and linked modules */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {license.verified ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
            {license.verificationDate && <span className="text-green-500">({license.verificationDate})</span>}
          </span>
        ) : (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Unverified
          </span>
        )}
        {license.documentUrl && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Doc on file
          </span>
        )}
        {license.stateVerificationAvailable && (
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Online verify
          </span>
        )}
      </div>

      {/* Linked modules */}
      {license.linkedModules.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {license.linkedModules.map(mod => (
            <span key={mod} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-0.5">
              <Link2 className="h-2.5 w-2.5" />
              {mod}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1",
          license.status === 'expired' || license.status === 'lapsed' ? "bg-red-100 text-red-700" :
          license.status === 'expiring' ? "bg-amber-100 text-amber-700" :
          license.status === 'renewed' ? "bg-blue-100 text-blue-700" :
          "bg-green-100 text-green-700"
        )}>
          {(license.status === 'expired' || license.status === 'lapsed') && <XCircle className="h-3 w-3" />}
          {license.status === 'expiring' && <Clock className="h-3 w-3" />}
          {license.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
          {license.status === 'renewed' && <RefreshCw className="h-3 w-3" />}
          {license.status === 'expired' ? 'Expired' :
           license.status === 'lapsed' ? 'Lapsed' :
           license.status === 'expiring' ? `Expires in ${license.daysUntilExpiry} days` :
           license.status === 'renewed' ? 'Renewed' :
           'Active'}
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="View">
            <Eye className="h-4 w-4" />
          </button>
          {license.stateVerificationAvailable && (
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Verify with Authority">
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Download">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: TrainingCourse }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-medium text-gray-900 text-sm">{course.name}</h5>
          <p className="text-xs text-gray-500">{course.provider}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
          {course.ceuHours} CEU
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{course.duration}</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            course.format === 'online' ? "bg-blue-50 text-blue-600" :
            course.format === 'in-person' ? "bg-green-50 text-green-600" :
            "bg-purple-50 text-purple-600"
          )}>
            {course.format}
          </span>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          View Course
        </button>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export function LicensesPreview() {
  const allLicenses = [...mockCompanyLicenses, ...mockEmployeeCertifications, ...mockVendorLicenses]
  const actionNeeded = allLicenses.filter(l =>
    l.status === 'expiring' ||
    l.status === 'expired' ||
    l.status === 'lapsed' ||
    (l.ceuRequired && l.ceuCompleted && l.ceuCompleted < l.ceuRequired)
  )

  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'action' })

  const filteredLicenses = sortItems(
    (() => {
      let licenses: License[]
      if (activeTab === 'action') licenses = actionNeeded
      else if (activeTab === 'company') licenses = mockCompanyLicenses
      else if (activeTab === 'employees') licenses = mockEmployeeCertifications
      else if (activeTab === 'vendors') licenses = mockVendorLicenses
      else if (activeTab === 'safety') licenses = allLicenses.filter(l => l.licenseCategory === 'safety')
      else licenses = allLicenses

      return licenses.filter(l => matchesSearch(l, search, ['entityName', 'licenseType', 'licenseNumber', 'issuingAuthority', 'jurisdiction']))
    })(),
    activeSort as keyof License | '',
    sortDirection,
  )

  const expiredCount = allLicenses.filter(l => l.status === 'expired' || l.status === 'lapsed').length
  const expiringCount = allLicenses.filter(l => l.status === 'expiring').length
  const autoBlockCount = allLicenses.filter(l => l.autoBlockEnabled).length
  const safetyCount = allLicenses.filter(l => l.licenseCategory === 'safety').length

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Licenses & Certifications</h3>
            <p className="text-sm text-gray-500">Track contractor licenses, trade certifications, safety credentials, and professional certifications</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              Upload Cert
            </button>
          </div>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search licenses, names, numbers..."
          tabs={[
            { key: 'action', label: 'Action Needed', count: actionNeeded.length },
            { key: 'all', label: 'All', count: allLicenses.length },
            { key: 'company', label: 'Company', count: mockCompanyLicenses.length },
            { key: 'employees', label: 'Employees', count: mockEmployeeCertifications.length },
            { key: 'vendors', label: 'Vendors', count: mockVendorLicenses.length },
            { key: 'safety', label: 'Safety Certs', count: safetyCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'entityName', label: 'Name' },
            { value: 'licenseType', label: 'License Type' },
            { value: 'daysUntilExpiry', label: 'Expiration' },
            { value: 'issuingAuthority', label: 'Authority' },
            { value: 'licenseCategory', label: 'Category' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[
            { icon: Download, label: 'Export', onClick: () => {} },
            { icon: Plus, label: 'Add License', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredLicenses.length}
          totalCount={allLicenses.length}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-7 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockCompanyLicenses.length}</div>
              <div className="text-xs text-gray-500">Company</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockEmployeeCertifications.length}</div>
              <div className="text-xs text-gray-500">Employee</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockVendorLicenses.length}</div>
              <div className="text-xs text-gray-500">Vendor</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{safetyCount}</div>
              <div className="text-xs text-gray-500">Safety</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {allLicenses.filter(l => l.verified).length}
              </div>
              <div className="text-xs text-gray-500">Verified</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">{expiringCount}</div>
              <div className="text-xs text-gray-500">Expiring</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{autoBlockCount}</div>
              <div className="text-xs text-gray-500">Auto-Block</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-module connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Connected to:</span>
          {[
            { label: 'HR & Workforce (M34)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { label: 'Safety & Compliance (M33)', color: 'bg-red-50 text-red-700 border-red-200' },
            { label: 'Vendor Management (M10)', color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { label: 'Scheduling (M07)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { label: 'Bid Management (M26)', color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Document Storage (M06)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Notifications (M05)', color: 'bg-pink-50 text-pink-700 border-pink-200' },
          ].map(badge => (
            <span key={badge.label} className={cn("text-xs px-2 py-0.5 rounded border flex items-center gap-1", badge.color)}>
              <Link2 className="h-3 w-3" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredLicenses.map(license => (
            <LicenseCard key={license.id} license={license} />
          ))}
        </div>

        {filteredLicenses.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No licenses found matching your criteria
          </div>
        )}

        {/* Recommended Training (only on action tab) */}
        {activeTab === 'action' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Recommended Training</h4>
              <span className="text-xs text-gray-500">(AI-matched to expiring certifications)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recommendedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* Expiration timeline (on all/company/employees/vendors tabs) */}
        {activeTab !== 'action' && activeTab !== 'safety' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Upcoming Expirations (Next 6 Months)
            </h4>
            <div className="space-y-2">
              {allLicenses
                .filter(l => l.daysUntilExpiry !== null && l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 180)
                .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999))
                .map(l => (
                  <div key={l.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        (l.daysUntilExpiry ?? 999) <= 30 ? "bg-red-500" :
                        (l.daysUntilExpiry ?? 999) <= 90 ? "bg-amber-500" :
                        "bg-green-500"
                      )} />
                      <span className="text-sm font-medium text-gray-900">{l.entityName}</span>
                      <span className="text-xs text-gray-500">{l.licenseType}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      (l.daysUntilExpiry ?? 999) <= 30 ? "text-red-600" :
                      (l.daysUntilExpiry ?? 999) <= 90 ? "text-amber-600" :
                      "text-gray-600"
                    )}>
                      {l.daysUntilExpiry} days
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">License Intelligence:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              Mike Smith needs 4 CEU hours for Coastal Construction renewal (expires in 30 days) - "Coastal Building Code Update" course covers this requirement.
            </p>
            <p>
              Cool Air HVAC license expired 43 days ago - auto-blocked from all HVAC scope. Recommend verification before next job assignment.
              Premium Drywall renewal submitted - pending approval.
              Johnson Beach House requires coastal construction certification - Mike Smith and Jake Ross are qualified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
