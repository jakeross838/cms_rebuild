'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { LicensesPreview } from '@/components/skeleton/previews/licenses-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      phase="Phase 1 - Compliance"
      planFile="views/compliance/LICENSES.md"
      description="Track contractor licenses, trade certifications, and professional credentials for your company and team. Monitor expiration dates, CEU requirements, and ensure compliance with local regulations."
      workflow={['Add License', 'Verify', 'Monitor Expiration', 'Renew', 'Update Records']}
      features={[
        'Company license tracking',
        'Employee certifications',
        'Trade licenses',
        'Professional credentials',
        'Expiration alerts',
        'CEU/training tracking',
        'License verification',
        'Multi-state tracking',
        'Renewal reminders',
        'Document storage',
        'Compliance calendar',
        'Jurisdiction requirements',
        'Vendor license verification',
        'Audit trail',
      ]}
      connections={[
        { name: 'Team', type: 'bidirectional', description: 'Employee credentials' },
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor licenses' },
        { name: 'Jobs', type: 'input', description: 'Required licenses per job' },
        { name: 'Permits', type: 'input', description: 'License requirements' },
        { name: 'Document Storage', type: 'output', description: 'Store documents' },
        { name: 'Calendar', type: 'output', description: 'Renewal dates' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'entity_type', type: 'string', required: true, description: 'Company, Employee, Vendor' },
        { name: 'entity_id', type: 'uuid', description: 'Reference to entity' },
        { name: 'license_type', type: 'string', required: true, description: 'Type of license' },
        { name: 'license_number', type: 'string', required: true, description: 'License number' },
        { name: 'issuing_authority', type: 'string', required: true, description: 'Issuing body' },
        { name: 'jurisdiction', type: 'string', description: 'State/county/city' },
        { name: 'issue_date', type: 'date', description: 'When issued' },
        { name: 'expiration_date', type: 'date', description: 'Expiration' },
        { name: 'status', type: 'string', required: true, description: 'Active, Expiring, Expired' },
        { name: 'ceu_required', type: 'integer', description: 'CEUs needed for renewal' },
        { name: 'ceu_completed', type: 'integer', description: 'CEUs completed' },
        { name: 'document_url', type: 'string', description: 'License document' },
        { name: 'verified', type: 'boolean', description: 'Verified with authority' },
      ]}
      aiFeatures={[
        {
          name: 'Renewal Management',
          description: 'Tracks renewal requirements. "Contractor license expires in 60 days. 8 CEU hours needed. Recommended courses..."',
          trigger: 'Periodic check'
        },
        {
          name: 'Compliance Check',
          description: 'Validates job compliance. "Johnson Beach House requires coastal construction certification. Mike Smith qualified."',
          trigger: 'On job start'
        },
        {
          name: 'Verification Service',
          description: 'Verifies license status. "ABC Plumbing license verified active with FL DBPR. No disciplinary actions."',
          trigger: 'On vendor add'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Licenses & Certifications                      [+ Add License]      │
├─────────────────────────────────────────────────────────────────────┤
│ View: [Company] [Employees] [Vendors]    Status: [All ▾]           │
├─────────────────────────────────────────────────────────────────────┤
│ COMPANY LICENSES                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ License              Number        Jurisdiction   Expires       │ │
│ │ ────────────────────────────────────────────────────────────── │ │
│ │ General Contractor   CGC123456     Florida        Dec 31, 2025 │ │
│ │ ✓ Verified with DBPR                                           │ │
│ │ ────────────────────────────────────────────────────────────── │ │
│ │ Roofing Contractor   CCC098765     Florida        Dec 31, 2025 │ │
│ │ ✓ Verified with DBPR                                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ EMPLOYEE CERTIFICATIONS                                             │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Employee        Certification              Expires    CEU       │ │
│ │ ────────────────────────────────────────────────────────────── │ │
│ │ Jake Ross       CGC Qualifier              Dec 2025   14/14 ✓  │ │
│ │ Mike Smith      OSHA 30                    No Expiry  -        │ │
│ │ Mike Smith      Coastal Construction       Mar 2025   ⚠ 4/8    │ │
│ │ Sarah Johnson   Project Management         Jun 2025   12/12 ✓  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ⚠ ACTION NEEDED                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Mike Smith - Coastal Construction cert needs 4 more CEU hours  │ │
│ │ Expires: March 15, 2025                                        │ │
│ │ AI: "Recommended: Coastal Building Code Update course (4 CEU)" │ │
│ │ [View Courses] [Schedule Training]                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
