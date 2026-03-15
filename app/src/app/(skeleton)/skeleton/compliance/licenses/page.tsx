'use client'
import dynamic from 'next/dynamic'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { cn } from '@/lib/utils'
const LicensesPreview = dynamic(() => import('@/components/skeleton/previews/licenses-preview').then(mod => mod.LicensesPreview), { ssr: false })

export default function LicensesPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <LicensesPreview /> : <PageSpec
      title="Licenses & Certifications"
      phase="Phase 5 - Full Platform (Modules 33 + 34)"
      planFile="docs/modules/33-safety-compliance.md, docs/modules/34-hr-workforce.md"
      description="Unified license and certification tracking across company, employees, and vendors. Covers contractor licenses, trade licenses, safety certifications (OSHA 10/30, first aid, fall protection, equipment operator), professional credentials, and CEU/training tracking. Features expiration alerts at configurable intervals, auto-block to prevent uncertified workers from tasks, renewal tracking workflow, state license verification integration, and AI-matched training recommendations. Shared between HR (M34) and Safety (M33) modules."
      workflow={['Add License/Cert', 'Upload Document', 'Verify with Authority', 'Monitor Expiration', 'Send Renewal Reminder', 'Complete Training/CEU', 'Renew', 'Update Records']}
      features={[
        'Company license tracking (general contractor, roofing, specialty)',
        'Employee certifications: OSHA 10/30, first aid/CPR, equipment operator, fall protection',
        'Employee trade licenses with state-specific requirements',
        'Vendor/subcontractor license tracking and verification',
        'Professional credentials (PMP, PE, etc.)',
        'License categories: contractor, trade, safety, professional, equipment operator',
        'CEU/continuing education tracking with progress bar',
        'Expiration alerts at configurable intervals (90, 60, 30 days)',
        'Renewal tracking workflow: not started -> reminder -> submitted -> renewed -> lapsed',
        'Auto-block: prevent uncertified workers from tasks requiring certification',
        'State license verification integration where APIs exist',
        'Document upload and storage per license/certification',
        'Multi-jurisdiction tracking (state, federal, international)',
        'Vendor license verification link to state licensing boards',
        'AI-matched training course recommendations for expiring certifications',
        'Expiration timeline view for upcoming 6 months',
        'Certification compliance reports for audits',
        'Integration between HR and Safety modules for shared certifications',
        'Audit trail for all license/certification changes',
      ]}
      connections={[
        { name: 'HR & Workforce (M34)', type: 'bidirectional', description: 'Employee certification tracking, training records' },
        { name: 'Safety & Compliance (M33)', type: 'bidirectional', description: 'Safety certifications shared, training compliance' },
        { name: 'Vendor Management (M10)', type: 'bidirectional', description: 'Vendor license status and verification' },
        { name: 'Scheduling (M07)', type: 'output', description: 'Auto-block uncertified workers from certified tasks' },
        { name: 'Bid Management (M26)', type: 'output', description: 'Vendor license status visible in bid evaluation' },
        { name: 'Document Storage (M06)', type: 'output', description: 'License documents stored and versioned' },
        { name: 'Notification Engine (M05)', type: 'output', description: 'Expiration alerts at configurable intervals' },
        { name: 'Auth & Access (M01)', type: 'input', description: 'Company licensing affects platform access' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant ID (company_id)' },
        { name: 'entity_type', type: 'string', required: true, description: 'company | employee | vendor' },
        { name: 'entity_id', type: 'uuid', required: true, description: 'Reference to entity' },
        { name: 'license_type', type: 'string', required: true, description: 'Type of license/certification' },
        { name: 'license_category', type: 'string', required: true, description: 'contractor | trade | safety | professional | equipment_operator' },
        { name: 'license_number', type: 'string', required: true, description: 'License/certification number' },
        { name: 'issuing_authority', type: 'string', required: true, description: 'Issuing body' },
        { name: 'jurisdiction', type: 'string', description: 'State/county/city/federal' },
        { name: 'issue_date', type: 'date', description: 'When issued' },
        { name: 'expiration_date', type: 'date', description: 'Expiration date (null if no expiry)' },
        { name: 'status', type: 'string', required: true, description: 'active | expiring | expired | renewed | lapsed' },
        { name: 'renewal_status', type: 'string', description: 'not_started | reminder_sent | renewal_submitted | renewed | lapsed' },
        { name: 'ceu_required', type: 'integer', description: 'CEUs needed for renewal' },
        { name: 'ceu_completed', type: 'integer', description: 'CEUs completed toward renewal' },
        { name: 'document_url', type: 'string', description: 'License document in storage' },
        { name: 'verified', type: 'boolean', description: 'Verified with issuing authority' },
        { name: 'verification_date', type: 'date', description: 'When last verified' },
        { name: 'verification_source', type: 'string', description: 'How verified (portal, API, manual)' },
        { name: 'auto_block_enabled', type: 'boolean', description: 'Prevents scheduling without valid cert' },
        { name: 'state_verification_available', type: 'boolean', description: 'Online verification link exists' },
      ]}
      aiFeatures={[
        {
          name: 'Renewal Management',
          description: 'Tracks renewal requirements and CEU gaps. "Mike Smith Coastal Construction expires in 30 days. 4 CEU hours needed. Recommended: Coastal Building Code Update course (4 CEU, online, FL Building Commission)."',
          trigger: 'Periodic check (configurable intervals)'
        },
        {
          name: 'Job Compliance Check',
          description: 'Validates all required certifications for a job are met by assigned crew. "Johnson Beach House requires coastal construction certification. Mike Smith and Jake Ross are qualified. David Nguyen is NOT qualified."',
          trigger: 'On job start + crew assignment changes'
        },
        {
          name: 'Vendor License Verification',
          description: 'Verifies vendor license status with state boards where APIs are available. "ABC Electric license verified active with FL DBPR. No disciplinary actions on file."',
          trigger: 'On vendor add + periodic re-verification'
        },
        {
          name: 'Auto-Block Enforcement',
          description: 'Prevents scheduling uncertified workers for tasks requiring certification. "David Nguyen cannot be assigned to coastal zone framing - missing Coastal Construction certification."',
          trigger: 'On task assignment + certification expiration'
        },
        {
          name: 'Training Course Matching',
          description: 'Matches expiring certifications to available training courses. "Tom Wilson Fall Protection cert needs renewal in 123 days. Matched course: Fall Protection Refresher (8 CEU, in-person, National Safety Council)."',
          trigger: 'On expiration approaching + course catalog updates'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Licenses & Certifications              [Upload Cert] [+ Add License]│
├─────────────────────────────────────────────────────────────────────┤
│ Action(4) | All(14) | Company(2) | Employees(8) | Vendors(4) |Safety│
├─────────────────────────────────────────────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                       │
│ │ 2 │ │ 8 │ │ 4 │ │ 4 │ │12 │ │ 2 │ │ 6 │                       │
│ │Cmp│ │Emp│ │Vnd│ │Saf│ │Ver│ │Exp│ │Blk│                       │
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                       │
│ Connected: HR(M34) | Safety(M33) | Vendors(M10) | Sched(M07) |...│
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐ ┌───────────────────────────────────┐│
│ │ Mike Smith                │ │ Cool Air HVAC                     ││
│ │ Coastal Construction      │ │ HVAC Contractor                   ││
│ │ CC-2023-001 | FL          │ │ CAC-1818232 | FL DBPR             ││
│ │ ⚠ Expires in 30 days      │ │ ✗ EXPIRED (43 days)               ││
│ │ Renewal: Reminder Sent    │ │ Renewal: Lapsed                   ││
│ │ CEU: 4/8 ████░░░░         │ │ 🚫 Auto-blocked: All HVAC scope  ││
│ │ 🚫 Auto-block: Coast zone │ │ Unverified                        ││
│ │ ✓ Verified | Doc on file  │ │ Linked: Vendors, Safety, Bids     ││
│ │ Linked: HR, Safety, Sched │ │                                   ││
│ └───────────────────────────┘ └───────────────────────────────────┘│
│                                                                     │
│ RECOMMENDED TRAINING (AI-matched)                                   │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Coastal Building Code 2025  │ 4 CEU │ Online │ FL Bldg Comm    ││
│ │ Fall Protection Refresher   │ 8 CEU │ In-Person│ Natl Safety   ││
│ └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│ 💡 AI: "Mike needs 4 CEU for Coastal Construction - Code Update    │
│ course covers it. Cool Air HVAC expired - auto-blocked. Premium    │
│ Drywall renewal submitted."                                        │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
