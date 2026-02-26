'use client'

import { useState } from 'react'

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
  History,
  Mail,
  Search,
  Loader2,
  X,
  Bell,
} from 'lucide-react'

import { FilterBar } from '@/components/skeleton/filter-bar'
import { AIFeaturesPanel, ProgressSteps, SubmissionForm, type ProgressStep, type FormField } from '@/components/skeleton/ui'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────

type VerificationSource = 'Portal' | 'API' | 'Manual'

interface AuditEvent {
  id: string
  action: 'added' | 'verified' | 'renewed' | 'expired' | 'updated' | 'reminder_sent' | 'ceu_logged'
  timestamp: string
  user: string
  details?: string
}

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
  verificationSource?: VerificationSource
  documentUrl?: boolean
  autoBlockEnabled: boolean
  autoBlockedTasks?: string[]
  stateVerificationAvailable: boolean
  linkedModules: string[]
  auditTrail?: AuditEvent[]
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
    verificationSource: 'Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Auth (M01)', 'Vendors (M10)'],
    auditTrail: [
      { id: 'a1', action: 'added', timestamp: '2020-01-15T10:00:00Z', user: 'Jake Ross', details: 'Initial license registration' },
      { id: 'a2', action: 'verified', timestamp: '2025-01-15T14:30:00Z', user: 'System', details: 'Verified via DBPR Portal' },
    ],
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
    verificationSource: 'API',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Auth (M01)'],
    auditTrail: [
      { id: 'a3', action: 'added', timestamp: '2021-06-01T09:00:00Z', user: 'Jake Ross' },
      { id: 'a4', action: 'verified', timestamp: '2025-06-01T11:00:00Z', user: 'System', details: 'API verification successful' },
    ],
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
    verificationSource: 'Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
    auditTrail: [
      { id: 'a5', action: 'added', timestamp: '2020-01-15T10:00:00Z', user: 'Jake Ross' },
      { id: 'a6', action: 'ceu_logged', timestamp: '2024-06-15T10:00:00Z', user: 'Jake Ross', details: 'Logged 8 CEU hours - Construction Safety' },
      { id: 'a7', action: 'ceu_logged', timestamp: '2024-11-20T14:00:00Z', user: 'Jake Ross', details: 'Logged 6 CEU hours - Code Updates' },
      { id: 'a8', action: 'verified', timestamp: '2025-01-15T14:30:00Z', user: 'System' },
    ],
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
    expirationDate: '2025-03-20',
    daysUntilExpiry: 35,
    status: 'expiring',
    verified: true,
    verificationSource: 'Manual',
    documentUrl: true,
    autoBlockEnabled: true,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
    auditTrail: [
      { id: 'a9', action: 'added', timestamp: '2022-03-15T09:00:00Z', user: 'HR Admin' },
      { id: 'a10', action: 'verified', timestamp: '2022-03-16T10:00:00Z', user: 'HR Admin', details: 'Manual document review' },
    ],
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
    expirationDate: '2025-03-15',
    daysUntilExpiry: 30,
    status: 'expiring',
    renewalStatus: 'reminder_sent',
    ceuRequired: 8,
    ceuCompleted: 4,
    verified: true,
    verificationDate: '2024-03-15',
    verificationSource: 'Portal',
    documentUrl: true,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Coastal zone framing', 'Beach foundation work'],
    stateVerificationAvailable: true,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Scheduling (M07)'],
    auditTrail: [
      { id: 'a11', action: 'added', timestamp: '2023-03-15T09:00:00Z', user: 'HR Admin' },
      { id: 'a12', action: 'ceu_logged', timestamp: '2024-09-10T14:00:00Z', user: 'Mike Smith', details: 'Logged 4 CEU hours' },
      { id: 'a13', action: 'reminder_sent', timestamp: '2025-02-01T08:00:00Z', user: 'System', details: 'Renewal reminder email sent' },
    ],
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
    verificationSource: 'API',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)'],
    auditTrail: [
      { id: 'a14', action: 'added', timestamp: '2022-06-01T09:00:00Z', user: 'Sarah Johnson' },
      { id: 'a15', action: 'verified', timestamp: '2022-06-02T10:00:00Z', user: 'System', details: 'PMI API verification' },
    ],
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
    expirationDate: '2025-03-25',
    daysUntilExpiry: 40,
    status: 'expiring',
    verified: true,
    verificationSource: 'Manual',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
    auditTrail: [
      { id: 'a16', action: 'added', timestamp: '2024-01-10T09:00:00Z', user: 'Tom Wilson' },
      { id: 'a17', action: 'verified', timestamp: '2024-01-11T10:00:00Z', user: 'HR Admin', details: 'Certificate reviewed' },
    ],
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
    verificationSource: 'Manual',
    documentUrl: true,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Roof framing', 'Elevated platform work'],
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Scheduling (M07)'],
    auditTrail: [
      { id: 'a18', action: 'added', timestamp: '2023-06-15T09:00:00Z', user: 'Tom Wilson' },
    ],
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
    verificationSource: 'Manual',
    documentUrl: true,
    autoBlockEnabled: true,
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)'],
    auditTrail: [
      { id: 'a19', action: 'added', timestamp: '2024-09-01T09:00:00Z', user: 'Carlos Mendez' },
    ],
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
    verificationSource: 'Manual',
    documentUrl: false,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Forklift operation', 'Material loading'],
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Equipment (M35)'],
    auditTrail: [
      { id: 'a20', action: 'added', timestamp: '2024-05-10T09:00:00Z', user: 'Carlos Mendez' },
    ],
  },
  {
    id: '15',
    entityName: 'Sarah Martinez',
    entityType: 'employee',
    licenseType: 'OSHA 30-Hour',
    licenseCategory: 'safety',
    licenseNumber: 'OSHA-30-991122',
    issuingAuthority: 'OSHA',
    jurisdiction: 'Federal',
    issueDate: '2021-02-01',
    expirationDate: '2025-02-01',
    daysUntilExpiry: -12,
    status: 'expired',
    verified: false,
    documentUrl: true,
    autoBlockEnabled: true,
    autoBlockedTasks: ['Foundation work (Harbor View)', 'Framing (Smith Residence)'],
    stateVerificationAvailable: false,
    linkedModules: ['HR (M34)', 'Safety (M33)', 'Scheduling (M07)'],
    auditTrail: [
      { id: 'a21', action: 'added', timestamp: '2021-02-01T09:00:00Z', user: 'HR Admin' },
      { id: 'a22', action: 'expired', timestamp: '2025-02-01T00:00:00Z', user: 'System', details: 'License expired' },
    ],
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
    expirationDate: '2026-12-31',
    daysUntilExpiry: 687,
    status: 'active',
    renewalStatus: 'not_started',
    verified: true,
    verificationDate: '2025-01-10',
    verificationSource: 'Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)', 'Safety (M33)'],
    auditTrail: [
      { id: 'a23', action: 'added', timestamp: '2021-04-01T09:00:00Z', user: 'Vendor Admin' },
      { id: 'a24', action: 'verified', timestamp: '2025-01-10T11:00:00Z', user: 'System', details: 'SC LLR Portal verification' },
    ],
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
    verificationSource: 'API',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)', 'Safety (M33)'],
    auditTrail: [
      { id: 'a25', action: 'added', timestamp: '2022-02-15T09:00:00Z', user: 'Vendor Admin' },
      { id: 'a26', action: 'verified', timestamp: '2025-02-15T10:00:00Z', user: 'System', details: 'API verification' },
    ],
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
    auditTrail: [
      { id: 'a27', action: 'added', timestamp: '2020-09-01T09:00:00Z', user: 'Vendor Admin' },
      { id: 'a28', action: 'expired', timestamp: '2024-12-31T00:00:00Z', user: 'System', details: 'License expired' },
    ],
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
    verificationSource: 'Portal',
    documentUrl: true,
    autoBlockEnabled: false,
    stateVerificationAvailable: true,
    linkedModules: ['Vendors (M10)'],
    auditTrail: [
      { id: 'a29', action: 'added', timestamp: '2023-01-15T09:00:00Z', user: 'Vendor Admin' },
      { id: 'a30', action: 'verified', timestamp: '2024-01-15T10:00:00Z', user: 'System' },
      { id: 'a31', action: 'reminder_sent', timestamp: '2025-01-15T08:00:00Z', user: 'System' },
    ],
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
  contractor: 'bg-stone-100 text-stone-700',
  trade: 'bg-green-100 text-green-700',
  safety: 'bg-red-100 text-red-700',
  professional: 'bg-warm-100 text-warm-700',
  equipment_operator: 'bg-amber-100 text-amber-700',
}

const renewalLabels: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-warm-100 text-warm-600' },
  reminder_sent: { label: 'Reminder Sent', color: 'bg-stone-100 text-stone-700' },
  renewal_submitted: { label: 'Submitted', color: 'bg-warm-100 text-warm-700' },
  renewed: { label: 'Renewed', color: 'bg-green-100 text-green-700' },
  lapsed: { label: 'Lapsed', color: 'bg-red-100 text-red-700' },
}

const verificationSourceColors: Record<VerificationSource, string> = {
  Portal: 'bg-stone-50 text-stone-600',
  API: 'bg-green-50 text-green-600',
  Manual: 'bg-warm-50 text-warm-600',
}

const auditActionLabels: Record<AuditEvent['action'], { label: string; color: string }> = {
  added: { label: 'Added', color: 'bg-stone-100 text-stone-700' },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700' },
  renewed: { label: 'Renewed', color: 'bg-warm-100 text-warm-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  updated: { label: 'Updated', color: 'bg-amber-100 text-amber-700' },
  reminder_sent: { label: 'Reminder Sent', color: 'bg-stone-100 text-stone-700' },
  ceu_logged: { label: 'CEU Logged', color: 'bg-stone-100 text-stone-700' },
}

// ── Sub-components ──────────────────────────────────────────────────────

// CEU Logging Modal
function CEULoggingModal({
  isOpen,
  onClose,
  license,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  license: License
  onSubmit: (data: Record<string, string | File>) => void
}) {
  const ceuFields: FormField[] = [
    { id: 'courseName', label: 'Course Name', type: 'text', required: true, placeholder: 'e.g., Construction Safety Update 2025' },
    { id: 'hours', label: 'Hours', type: 'text', required: true, placeholder: 'e.g., 4' },
    { id: 'date', label: 'Completion Date', type: 'date', required: true },
    { id: 'provider', label: 'Provider', type: 'text', required: true, placeholder: 'e.g., OSHA, PMI, Red Cross' },
    { id: 'certificate', label: 'Certificate Upload', type: 'file', required: false },
  ]

  return (
    <SubmissionForm
      isOpen={isOpen}
      onClose={onClose}
      title="Log CEU Hours"
      description={`Recording continuing education for ${license.licenseType}`}
      fields={ceuFields}
      onSubmit={onSubmit}
      submitLabel="Log Hours"
    />
  )
}

// Audit Trail Modal
function AuditTrailModal({
  isOpen,
  onClose,
  license,
}: {
  isOpen: boolean
  onClose: () => void
  license: License
}) {
  if (!isOpen) return null

  const events = license.auditTrail || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-warm-1000" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
          <div>
            <h2 className="text-lg font-semibold text-warm-900">Audit History</h2>
            <p className="text-sm text-warm-500">{license.licenseType} - {license.entityName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm-100 rounded-lg">
            <X className="h-4 w-4 text-warm-500" />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-warm-500 text-center py-4">No audit history available</p>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      event.action === 'expired' ? 'bg-red-500' :
                      event.action === 'verified' ? 'bg-green-500' :
                      event.action === 'renewed' ? 'bg-warm-500' :
                      'bg-stone-500'
                    )} />
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-warm-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded font-medium",
                        auditActionLabels[event.action].color
                      )}>
                        {auditActionLabels[event.action].label}
                      </span>
                      <span className="text-xs text-warm-500">{formatDateTime(event.timestamp)}</span>
                    </div>
                    <p className="text-sm text-warm-700">by {event.user}</p>
                    {event.details ? <p className="text-xs text-warm-500 mt-1">{event.details}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-warm-200 bg-warm-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-warm-700 bg-white border border-warm-300 rounded-lg hover:bg-warm-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Renewal Workflow Modal
function RenewalWorkflowModal({
  isOpen,
  onClose,
  license,
}: {
  isOpen: boolean
  onClose: () => void
  license: License
}) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const renewalSteps: ProgressStep[] = [
    { id: 'gather', label: 'Gather Docs', status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'upcoming' },
    { id: 'submit', label: 'Submit Application', status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming' },
    { id: 'pay', label: 'Pay Fee', status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming' },
    { id: 'await', label: 'Await Approval', status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming' },
  ]

  const stepContent = [
    {
      title: 'Gather Required Documents',
      description: 'Collect all necessary documentation for renewal',
      items: ['Current license copy', 'CEU certificates', 'Proof of insurance', 'Application form'],
    },
    {
      title: 'Submit Application',
      description: 'Submit your renewal application to the issuing authority',
      items: ['Complete online application', 'Upload required documents', 'Review and submit'],
    },
    {
      title: 'Pay Renewal Fee',
      description: 'Complete payment for the renewal',
      items: ['Review fee amount', 'Select payment method', 'Confirm payment'],
    },
    {
      title: 'Await Approval',
      description: 'Your application is being processed',
      items: ['Application under review', 'Estimated processing: 5-10 business days', 'You will be notified upon approval'],
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-warm-1000" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
          <div>
            <h2 className="text-lg font-semibold text-warm-900">Renewal Workflow</h2>
            <p className="text-sm text-warm-500">{license.licenseType} - {license.entityName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm-100 rounded-lg">
            <X className="h-4 w-4 text-warm-500" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-warm-200">
          <ProgressSteps steps={renewalSteps} orientation="horizontal" />
        </div>

        <div className="px-6 py-6">
          <h3 className="font-semibold text-warm-900 mb-2">{stepContent[currentStep].title}</h3>
          <p className="text-sm text-warm-500 mb-4">{stepContent[currentStep].description}</p>
          <ul className="space-y-2">
            {stepContent[currentStep].items.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-warm-700">
                <CheckCircle2 className="h-4 w-4 text-warm-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-warm-200 bg-warm-50">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-warm-700 bg-white border border-warm-300 rounded-lg hover:bg-warm-50 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-warm-500 hover:text-warm-700"
            >
              Cancel
            </button>
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 text-sm font-medium bg-stone-600 text-white rounded-lg hover:bg-stone-700"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// State Verification Component
function StateVerificationButton({ license }: { license: License }) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'verified' | 'not_found'>('idle')

  const handleVerify = () => {
    setStatus('checking')
    // Simulate API call
    setTimeout(() => {
      setStatus(license.verified ? 'verified' : 'not_found')
    }, 2000)
  }

  if (status === 'idle') {
    return (
      <button
        onClick={handleVerify}
        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded hover:bg-stone-100"
      >
        <Search className="h-3 w-3" />
        Verify with State
      </button>
    )
  }

  if (status === 'checking') {
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking...
      </span>
    )
  }

  if (status === 'verified') {
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded">
      <AlertTriangle className="h-3 w-3" />
      Not Found
    </span>
  )
}

function LicenseCard({ license }: { license: License }) {
  const showCEU = license.ceuRequired !== undefined && license.ceuRequired > 0
  const ceuProgress = showCEU ? (license.ceuCompleted! / license.ceuRequired!) * 100 : 0
  const ceuNeeded = showCEU ? license.ceuRequired! - license.ceuCompleted! : 0

  const [showCEUModal, setShowCEUModal] = useState(false)
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [showRenewalModal, setShowRenewalModal] = useState(false)

  const handleCEUSubmit = (data: Record<string, string | File>) => {
    // TODO: implement CEU logging
    setShowCEUModal(false)
  }

  const isExpiringOrExpired = license.status === 'expiring' || license.status === 'expired' || license.status === 'lapsed'

  return (
    <>
      <div className={cn(
        "bg-white rounded-lg border p-4",
        license.status === 'expired' ? "border-red-300 bg-red-50" :
        license.status === 'expiring' ? "border-amber-300 bg-amber-50" :
        license.status === 'lapsed' ? "border-red-300 bg-red-50" :
        "border-warm-200"
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              license.status === 'expired' || license.status === 'lapsed' ? "bg-red-100" :
              license.status === 'expiring' ? "bg-amber-100" :
              "bg-stone-100"
            )}>
              {license.entityType === 'company' ? (
                <Building2 className={cn(
                  "h-5 w-5",
                  license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
                  license.status === 'expiring' ? "text-amber-600" :
                  "text-stone-600"
                )} />
              ) : license.entityType === 'employee' ? (
                <User className={cn(
                  "h-5 w-5",
                  license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
                  license.status === 'expiring' ? "text-amber-600" :
                  "text-stone-600"
                )} />
              ) : (
                <Users className={cn(
                  "h-5 w-5",
                  license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
                  license.status === 'expiring' ? "text-amber-600" :
                  "text-stone-600"
                )} />
              )}
            </div>
            <div>
              <h4 className="font-medium text-warm-900">{license.entityName}</h4>
              <p className="text-sm text-warm-500">{license.licenseType}</p>
            </div>
          </div>
          <button className="p-1 hover:bg-warm-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-warm-400" />
          </button>
        </div>

        {/* Category + Entity Type badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={cn("text-xs px-2 py-0.5 rounded font-medium", categoryColors[license.licenseCategory])}>
            {categoryLabels[license.licenseCategory]}
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded",
            license.entityType === 'company' ? "bg-warm-100 text-warm-700" :
            license.entityType === 'employee' ? "bg-stone-100 text-stone-700" :
            "bg-warm-100 text-warm-700"
          )}>
            {license.entityType}
          </span>
          {license.autoBlockEnabled ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded flex items-center gap-1 border border-red-200">
              <Ban className="h-3 w-3" />
              Auto-Block
            </span> : null}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-xs text-warm-500">License #</span>
            <p className="text-sm font-mono text-warm-700">{license.licenseNumber}</p>
          </div>
          <div>
            <span className="text-xs text-warm-500">Issuing Authority</span>
            <p className="text-sm font-medium text-warm-900">{license.issuingAuthority}</p>
          </div>
          <div>
            <span className="text-xs text-warm-500">Jurisdiction</span>
            <p className="text-sm text-warm-700 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {license.jurisdiction}
            </p>
          </div>
          <div>
            <span className="text-xs text-warm-500">Expires</span>
            <p className={cn(
              "text-sm font-medium",
              license.status === 'expired' || license.status === 'lapsed' ? "text-red-600" :
              license.status === 'expiring' ? "text-amber-600" :
              "text-warm-900"
            )}>
              {license.expirationDate ? formatDate(license.expirationDate) : 'No Expiry'}
            </p>
          </div>
        </div>

        {/* Renewal status */}
        {license.renewalStatus ? <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-warm-500">Renewal:</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1",
              renewalLabels[license.renewalStatus].color
            )}>
              <RefreshCw className="h-3 w-3" />
              {renewalLabels[license.renewalStatus].label}
            </span>
          </div> : null}

        {showCEU ? <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500 flex items-center gap-1">
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
            <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  ceuProgress >= 100 ? "bg-green-500" : "bg-amber-500"
                )}
                style={{ width: `${Math.min(ceuProgress, 100)}%` }}
              />
            </div>
            {ceuNeeded > 0 && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-amber-600">
                  {ceuNeeded} hours needed for renewal
                </p>
                <button
                  onClick={() => setShowCEUModal(true)}
                  className="text-xs text-stone-600 hover:text-stone-700 font-medium flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Log CEU Hours
                </button>
              </div>
            )}
          </div> : null}

        {/* Auto-blocked tasks */}
        {license.autoBlockEnabled && license.autoBlockedTasks && license.autoBlockedTasks.length > 0 ? <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded text-xs">
            <div className="font-medium text-red-700 flex items-center gap-1 mb-1">
              <ShieldAlert className="h-3 w-3" />
              Auto-blocked tasks (requires valid cert):
            </div>
            <div className="text-red-600">
              {license.autoBlockedTasks.join(', ')}
            </div>
          </div> : null}

        {/* Verification and linked modules */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {license.verified ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
              {license.verificationDate ? <span className="text-green-500">({license.verificationDate})</span> : null}
            </span>
          ) : (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Unverified
            </span>
          )}
          {license.verificationSource ? <span className={cn(
              "text-xs px-2 py-0.5 rounded flex items-center gap-1",
              verificationSourceColors[license.verificationSource]
            )}>
              {license.verificationSource}
            </span> : null}
          {license.documentUrl ? <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Doc on file
            </span> : null}
          {license.stateVerificationAvailable ? <span className="text-xs bg-stone-50 text-stone-600 px-2 py-0.5 rounded flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Online verify
            </span> : null}
        </div>

        {/* State Verification */}
        {license.stateVerificationAvailable ? <div className="mb-3">
            <StateVerificationButton license={license} />
          </div> : null}

        {/* Linked modules */}
        {license.linkedModules.length > 0 && (
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {license.linkedModules.map(mod => (
              <span key={mod} className="text-xs bg-stone-50 text-stone-600 px-1.5 py-0.5 rounded border border-stone-100 flex items-center gap-0.5">
                <Link2 className="h-2.5 w-2.5" />
                {mod}
              </span>
            ))}
          </div>
        )}

        {/* Workflow Action Buttons */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {isExpiringOrExpired ? <>
              <button
                onClick={() => setShowRenewalModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-stone-600 bg-warm-50 border border-warm-200 rounded hover:bg-warm-100"
              >
                <RefreshCw className="h-3 w-3" />
                Start Renewal
              </button>
              <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded hover:bg-stone-100">
                <Mail className="h-3 w-3" />
                Send Reminder
              </button>
            </> : null}
          {(license.status === 'expired' || license.status === 'lapsed') && (
            <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100">
              <Calendar className="h-3 w-3" />
              Schedule Training
            </button>
          )}
          <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-warm-600 bg-warm-50 border border-warm-200 rounded hover:bg-warm-100">
            <RefreshCw className="h-3 w-3" />
            Re-verify
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-warm-200">
          <span className={cn(
            "text-xs px-2 py-1 rounded font-medium flex items-center gap-1",
            license.status === 'expired' || license.status === 'lapsed' ? "bg-red-100 text-red-700" :
            license.status === 'expiring' ? "bg-amber-100 text-amber-700" :
            license.status === 'renewed' ? "bg-stone-100 text-stone-700" :
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
            <button
              onClick={() => setShowAuditModal(true)}
              className="p-1.5 text-warm-500 hover:bg-warm-100 rounded"
              title="View History"
            >
              <History className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-warm-500 hover:bg-warm-100 rounded" title="View">
              <Eye className="h-4 w-4" />
            </button>
            {license.stateVerificationAvailable ? <button className="p-1.5 text-warm-500 hover:bg-warm-100 rounded" title="Verify with Authority">
                <ExternalLink className="h-4 w-4" />
              </button> : null}
            <button className="p-1.5 text-warm-500 hover:bg-warm-100 rounded" title="Download">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CEULoggingModal
        isOpen={showCEUModal}
        onClose={() => setShowCEUModal(false)}
        license={license}
        onSubmit={handleCEUSubmit}
      />
      <AuditTrailModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        license={license}
      />
      <RenewalWorkflowModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        license={license}
      />
    </>
  )
}

function CourseCard({ course }: { course: TrainingCourse }) {
  return (
    <div className="bg-white rounded-lg border border-warm-200 p-3 hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-medium text-warm-900 text-sm">{course.name}</h5>
          <p className="text-xs text-warm-500">{course.provider}</p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
          {course.ceuHours} CEU
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-500">{course.duration}</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            course.format === 'online' ? "bg-stone-50 text-stone-600" :
            course.format === 'in-person' ? "bg-green-50 text-green-600" :
            "bg-warm-50 text-stone-600"
          )}>
            {course.format}
          </span>
        </div>
        <button className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          View Course
        </button>
      </div>
    </div>
  )
}

// ── AI Features Data ────────────────────────────────────────────────────

const licenseAIFeatures = [
  {
    feature: 'Renewal Management',
    trigger: 'Daily',
    insight: '3 licenses expiring in 30 days: Contractor (Mar 15), OSHA-30 Mike (Mar 20), First Aid Tom (Mar 25). Renewal cost: ~$450',
    severity: 'warning' as const,
    action: {
      label: 'View Renewal Queue',
      onClick: () => {/* TODO: implement */},
    },
  },
  {
    feature: 'Job Compliance Check',
    trigger: 'Real-time',
    insight: 'Harbor View project requires: Licensed Electrician, OSHA-30. Current team: Compliant. Upcoming: Need licensed plumber by Mar 1',
    severity: 'info' as const,
    action: {
      label: 'View Requirements',
      onClick: () => {/* TODO: implement */},
    },
  },
  {
    feature: 'Vendor License Verification',
    trigger: 'On-change',
    insight: 'ABC Electric license verified via SC LLR portal. Valid through Dec 2026. All coverage requirements met.',
    severity: 'success' as const,
    action: {
      label: 'View Details',
      onClick: () => {/* TODO: implement */},
    },
  },
  {
    feature: 'Training Course Matching',
    trigger: 'Daily',
    insight: "Tom's First Aid expiring. Recommended: Red Cross First Aid/CPR, Mar 10, $85, 4 hours. 2 other team members could also attend.",
    severity: 'info' as const,
    action: {
      label: 'Schedule Training',
      onClick: () => {/* TODO: implement */},
    },
  },
  {
    feature: 'Auto-Block Enforcement',
    trigger: 'Real-time',
    insight: 'Sarah Martinez OSHA-30 expired. Auto-blocked from: Foundation work (Harbor View), Framing (Smith Residence)',
    severity: 'critical' as const,
    action: {
      label: 'Review Blocks',
      onClick: () => {/* TODO: implement */},
    },
  },
]

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
    <div className="bg-warm-50 rounded-lg border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-warm-900">Licenses & Certifications</h3>
            <p className="text-sm text-warm-500">Track contractor licenses, trade certifications, safety credentials, and professional certifications</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-600 border border-warm-200 rounded-lg hover:bg-warm-50">
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
      <div className="bg-white border-b border-warm-200 px-4 py-3">
        <div className="grid grid-cols-7 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warm-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{mockCompanyLicenses.length}</div>
              <div className="text-xs text-warm-500">Company</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <User className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{mockEmployeeCertifications.length}</div>
              <div className="text-xs text-warm-500">Employee</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warm-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-warm-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-warm-900">{mockVendorLicenses.length}</div>
              <div className="text-xs text-warm-500">Vendor</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{safetyCount}</div>
              <div className="text-xs text-warm-500">Safety</div>
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
              <div className="text-xs text-warm-500">Verified</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">{expiringCount}</div>
              <div className="text-xs text-warm-500">Expiring</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{autoBlockCount}</div>
              <div className="text-xs text-warm-500">Auto-Block</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-module connections */}
      <div className="bg-white border-b border-warm-200 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-warm-500">Connected to:</span>
          {[
            { label: 'HR & Workforce (M34)', color: 'bg-warm-50 text-warm-700 border-warm-200' },
            { label: 'Safety & Compliance (M33)', color: 'bg-red-50 text-red-700 border-red-200' },
            { label: 'Vendor Management (M10)', color: 'bg-sand-50 text-sand-700 border-sand-200' },
            { label: 'Scheduling (M07)', color: 'bg-stone-50 text-stone-700 border-stone-200' },
            { label: 'Bid Management (M26)', color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Document Storage (M06)', color: 'bg-stone-50 text-stone-700 border-stone-200' },
            { label: 'Notifications (M05)', color: 'bg-warm-50 text-sand-700 border-warm-200' },
          ].map(badge => (
            <span key={badge.label} className={cn("text-xs px-2 py-0.5 rounded border flex items-center gap-1", badge.color)}>
              <Link2 className="h-3 w-3" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-b border-warm-200 px-4 py-4">
        <AIFeaturesPanel
          title="License Intelligence"
          features={licenseAIFeatures}
          columns={2}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredLicenses.map(license => (
            <LicenseCard key={license.id} license={license} />
          ))}
        </div>

        {filteredLicenses.length === 0 && (
          <div className="text-center py-8 text-warm-400 text-sm border-2 border-dashed border-warm-200 rounded-lg">
            No licenses found matching your criteria
          </div>
        )}

        {/* Recommended Training (only on action tab) */}
        {activeTab === 'action' && (
          <div className="bg-white rounded-lg border border-warm-200 p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-stone-600" />
              <h4 className="font-medium text-warm-900">Recommended Training</h4>
              <span className="text-xs text-warm-500">(AI-matched to expiring certifications)</span>
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
          <div className="bg-white rounded-lg border border-warm-200 p-4 mt-4">
            <h4 className="font-medium text-warm-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warm-500" />
              Upcoming Expirations (Next 6 Months)
            </h4>
            <div className="space-y-2">
              {allLicenses
                .filter(l => l.daysUntilExpiry !== null && l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 180)
                .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999))
                .map(l => (
                  <div key={l.id} className="flex items-center justify-between py-2 px-3 bg-warm-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        (l.daysUntilExpiry ?? 999) <= 30 ? "bg-red-500" :
                        (l.daysUntilExpiry ?? 999) <= 90 ? "bg-amber-500" :
                        "bg-green-500"
                      )} />
                      <span className="text-sm font-medium text-warm-900">{l.entityName}</span>
                      <span className="text-xs text-warm-500">{l.licenseType}</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      (l.daysUntilExpiry ?? 999) <= 30 ? "text-red-600" :
                      (l.daysUntilExpiry ?? 999) <= 90 ? "text-amber-600" :
                      "text-warm-600"
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
      <div className="bg-warm-50 border-t border-amber-200 px-4 py-3">
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
