'use client'

import { useState } from 'react'
import {
  Award,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Download,
  MoreHorizontal,
  Sparkles,
  Building2,
  Users,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface License {
  id: string
  entityName: string
  entityType: 'company' | 'employee' | 'vendor'
  licenseType: string
  licenseNumber: string
  issuingAuthority: string
  jurisdiction: string
  issueDate: string
  expirationDate: string | null
  daysUntilExpiry: number | null
  status: 'active' | 'expiring' | 'expired'
  ceuRequired?: number
  ceuCompleted?: number
  verified: boolean
}

const mockCompanyLicenses: License[] = [
  {
    id: '1',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    licenseType: 'General Contractor',
    licenseNumber: 'CGC123456',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2020-01-15',
    expirationDate: '2025-12-31',
    daysUntilExpiry: 322,
    status: 'active',
    verified: true,
  },
  {
    id: '2',
    entityName: 'Ross Built Custom Homes',
    entityType: 'company',
    licenseType: 'Roofing Contractor',
    licenseNumber: 'CCC098765',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2021-06-01',
    expirationDate: '2025-12-31',
    daysUntilExpiry: 322,
    status: 'active',
    verified: true,
  },
]

const mockEmployeeCertifications: License[] = [
  {
    id: '3',
    entityName: 'Jake Ross',
    entityType: 'employee',
    licenseType: 'CGC Qualifier',
    licenseNumber: 'QA-789012',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2020-01-15',
    expirationDate: '2025-12-31',
    daysUntilExpiry: 322,
    status: 'active',
    ceuRequired: 14,
    ceuCompleted: 14,
    verified: true,
  },
  {
    id: '4',
    entityName: 'Mike Smith',
    entityType: 'employee',
    licenseType: 'OSHA 30',
    licenseNumber: 'OSHA-30-445566',
    issuingAuthority: 'OSHA',
    jurisdiction: 'Federal',
    issueDate: '2022-03-15',
    expirationDate: null,
    daysUntilExpiry: null,
    status: 'active',
    verified: true,
  },
  {
    id: '5',
    entityName: 'Mike Smith',
    entityType: 'employee',
    licenseType: 'Coastal Construction',
    licenseNumber: 'CC-2023-001',
    issuingAuthority: 'FL Building Commission',
    jurisdiction: 'Florida',
    issueDate: '2023-03-15',
    expirationDate: '2025-03-14',
    daysUntilExpiry: 30,
    status: 'expiring',
    ceuRequired: 8,
    ceuCompleted: 4,
    verified: true,
  },
  {
    id: '6',
    entityName: 'Sarah Johnson',
    entityType: 'employee',
    licenseType: 'Project Management Professional',
    licenseNumber: 'PMP-123456',
    issuingAuthority: 'PMI',
    jurisdiction: 'International',
    issueDate: '2022-06-01',
    expirationDate: '2025-06-01',
    daysUntilExpiry: 109,
    status: 'active',
    ceuRequired: 60,
    ceuCompleted: 52,
    verified: true,
  },
  {
    id: '7',
    entityName: 'Tom Wilson',
    entityType: 'employee',
    licenseType: 'First Aid/CPR',
    licenseNumber: 'FA-2024-789',
    issuingAuthority: 'Red Cross',
    jurisdiction: 'National',
    issueDate: '2024-01-10',
    expirationDate: '2026-01-10',
    daysUntilExpiry: 332,
    status: 'active',
    verified: true,
  },
]

const mockVendorLicenses: License[] = [
  {
    id: '8',
    entityName: 'ABC Electric',
    entityType: 'vendor',
    licenseType: 'Electrical Contractor',
    licenseNumber: 'EC-13001234',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2021-04-01',
    expirationDate: '2025-08-31',
    daysUntilExpiry: 200,
    status: 'active',
    verified: true,
  },
  {
    id: '9',
    entityName: 'Coastal Plumbing',
    entityType: 'vendor',
    licenseType: 'Plumbing Contractor',
    licenseNumber: 'CFC-057891',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2022-02-15',
    expirationDate: '2025-08-31',
    daysUntilExpiry: 200,
    status: 'active',
    verified: true,
  },
  {
    id: '10',
    entityName: 'Cool Air HVAC',
    entityType: 'vendor',
    licenseType: 'HVAC Contractor',
    licenseNumber: 'CAC-1818232',
    issuingAuthority: 'Florida DBPR',
    jurisdiction: 'Florida',
    issueDate: '2020-09-01',
    expirationDate: '2024-12-31',
    daysUntilExpiry: -43,
    status: 'expired',
    verified: false,
  },
]

interface TrainingCourse {
  id: string
  name: string
  provider: string
  ceuHours: number
  duration: string
  relevantFor: string[]
}

const recommendedCourses: TrainingCourse[] = [
  {
    id: '1',
    name: 'Coastal Building Code Update 2024',
    provider: 'FL Building Commission',
    ceuHours: 4,
    duration: '4 hours',
    relevantFor: ['Coastal Construction'],
  },
  {
    id: '2',
    name: 'Advanced PM Techniques',
    provider: 'PMI',
    ceuHours: 8,
    duration: '2 days',
    relevantFor: ['Project Management Professional'],
  },
  {
    id: '3',
    name: 'Construction Safety Leadership',
    provider: 'OSHA',
    ceuHours: 4,
    duration: '4 hours',
    relevantFor: ['CGC Qualifier', 'OSHA 30'],
  },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function LicenseCard({ license }: { license: License }) {
  const showCEU = license.ceuRequired !== undefined && license.ceuRequired > 0
  const ceuProgress = showCEU ? (license.ceuCompleted! / license.ceuRequired!) * 100 : 0
  const ceuNeeded = showCEU ? license.ceuRequired! - license.ceuCompleted! : 0

  return (
    <div className={cn(
      "bg-white rounded-lg border p-4",
      license.status === 'expired' ? "border-red-300 bg-red-50" :
      license.status === 'expiring' ? "border-amber-300 bg-amber-50" :
      "border-gray-200"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            license.status === 'expired' ? "bg-red-100" :
            license.status === 'expiring' ? "bg-amber-100" :
            "bg-blue-100"
          )}>
            {license.entityType === 'company' ? (
              <Building2 className={cn(
                "h-5 w-5",
                license.status === 'expired' ? "text-red-600" :
                license.status === 'expiring' ? "text-amber-600" :
                "text-blue-600"
              )} />
            ) : license.entityType === 'employee' ? (
              <User className={cn(
                "h-5 w-5",
                license.status === 'expired' ? "text-red-600" :
                license.status === 'expiring' ? "text-amber-600" :
                "text-blue-600"
              )} />
            ) : (
              <Users className={cn(
                "h-5 w-5",
                license.status === 'expired' ? "text-red-600" :
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
            license.status === 'expired' ? "text-red-600" :
            license.status === 'expiring' ? "text-amber-600" :
            "text-gray-900"
          )}>
            {license.expirationDate ? formatDate(license.expirationDate) : 'No Expiry'}
          </p>
        </div>
      </div>

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

      <div className="flex items-center gap-2 mb-3">
        {license.verified && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        )}
        <span className={cn(
          "text-xs px-2 py-0.5 rounded",
          license.entityType === 'company' ? "bg-purple-100 text-purple-700" :
          license.entityType === 'employee' ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-700"
        )}>
          {license.entityType}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1",
          license.status === 'expired' ? "bg-red-100 text-red-700" :
          license.status === 'expiring' ? "bg-amber-100 text-amber-700" :
          "bg-green-100 text-green-700"
        )}>
          {license.status === 'expired' && <XCircle className="h-3 w-3" />}
          {license.status === 'expiring' && <Clock className="h-3 w-3" />}
          {license.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
          {license.status === 'expired' ? 'Expired' :
           license.status === 'expiring' ? `Expires in ${license.daysUntilExpiry} days` :
           'Active'}
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="View">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Verify">
            <ExternalLink className="h-4 w-4" />
          </button>
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
        <span className="text-xs text-gray-500">{course.duration}</span>
        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          View Course
        </button>
      </div>
    </div>
  )
}

export function LicensesPreview() {
  const [activeTab, setActiveTab] = useState<'company' | 'employees' | 'vendors' | 'action'>('action')

  const allLicenses = [...mockCompanyLicenses, ...mockEmployeeCertifications, ...mockVendorLicenses]
  const actionNeeded = allLicenses.filter(l =>
    l.status === 'expiring' ||
    l.status === 'expired' ||
    (l.ceuRequired && l.ceuCompleted && l.ceuCompleted < l.ceuRequired)
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Licenses & Certifications</h3>
            <p className="text-sm text-gray-500">Track contractor licenses and professional credentials</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add License
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockCompanyLicenses.length}</div>
              <div className="text-xs text-gray-500">Company Licenses</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockEmployeeCertifications.length}</div>
              <div className="text-xs text-gray-500">Employee Certs</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{mockVendorLicenses.length}</div>
              <div className="text-xs text-gray-500">Vendor Licenses</div>
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
              <div className="text-xl font-bold text-amber-600">{actionNeeded.length}</div>
              <div className="text-xs text-gray-500">Action Needed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('action')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
              activeTab === 'action' ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            Action Needed
            <span className="bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-xs">
              {actionNeeded.length}
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
            onClick={() => setActiveTab('employees')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
              activeTab === 'employees' ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <User className="h-4 w-4" />
            Employees
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
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'action' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {actionNeeded.map(license => (
                <LicenseCard key={license.id} license={license} />
              ))}
            </div>

            {/* Recommended Training */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Recommended Training</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {recommendedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="grid grid-cols-2 gap-4">
            {mockCompanyLicenses.map(license => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="grid grid-cols-2 gap-4">
            {mockEmployeeCertifications.map(license => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="grid grid-cols-2 gap-4">
            {mockVendorLicenses.map(license => (
              <LicenseCard key={license.id} license={license} />
            ))}
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
          <p className="text-sm text-amber-700">
            Mike Smith needs 4 CEU hours for Coastal Construction renewal - "Coastal Building Code Update" course covers this requirement.
            Cool Air HVAC license expired 43 days ago - recommend verification before next job assignment.
            Johnson Beach House requires coastal construction certification - Mike Smith qualified.
          </p>
        </div>
      </div>
    </div>
  )
}
