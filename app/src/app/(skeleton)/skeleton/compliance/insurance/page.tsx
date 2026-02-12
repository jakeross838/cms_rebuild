'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { InsurancePreview } from '@/components/skeleton/previews/insurance-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InsurancePage() {
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
      {activeTab === 'preview' ? <InsurancePreview /> : <PageSpec
      title="Insurance Tracking"
      phase="Phase 1 - Compliance"
      planFile="views/compliance/INSURANCE.md"
      description="Track insurance certificates for your company and all subcontractors/vendors. Get alerts before policies expire, ensure coverage meets requirements, and maintain compliance documentation."
      workflow={['Request COI', 'Review Coverage', 'Approve', 'Monitor Expiration', 'Renew']}
      features={[
        'Company policy tracking',
        'Vendor/sub COI tracking',
        'Coverage requirements by job',
        'Expiration alerts (30/60/90 day)',
        'Automatic renewal reminders',
        'COI request workflow',
        'Coverage verification',
        'Additional insured tracking',
        'Waiver of subrogation',
        'Policy document storage',
        'Coverage gap analysis',
        'Compliance reporting',
        'Vendor insurance scoring',
        'Bulk COI requests',
      ]}
      connections={[
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor insurance status' },
        { name: 'Jobs', type: 'input', description: 'Job insurance requirements' },
        { name: 'Contracts', type: 'input', description: 'Required coverage levels' },
        { name: 'Purchase Orders', type: 'input', description: 'Block PO without COI' },
        { name: 'Document Storage', type: 'output', description: 'Store certificates' },
        { name: 'Notifications', type: 'output', description: 'Expiration alerts' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'entity_type', type: 'string', required: true, description: 'Company, Vendor, Sub' },
        { name: 'entity_id', type: 'uuid', description: 'Reference to entity' },
        { name: 'policy_type', type: 'string', required: true, description: 'GL, WC, Auto, Umbrella' },
        { name: 'carrier', type: 'string', description: 'Insurance company' },
        { name: 'policy_number', type: 'string', description: 'Policy number' },
        { name: 'coverage_amount', type: 'decimal', description: 'Coverage limit' },
        { name: 'effective_date', type: 'date', required: true, description: 'Start date' },
        { name: 'expiration_date', type: 'date', required: true, description: 'End date' },
        { name: 'additional_insured', type: 'boolean', description: 'AI endorsement' },
        { name: 'waiver_subrogation', type: 'boolean', description: 'WOS endorsement' },
        { name: 'certificate_url', type: 'string', description: 'COI document' },
        { name: 'status', type: 'string', required: true, description: 'Active, Expiring, Expired' },
        { name: 'verified_by', type: 'uuid', description: 'Who verified' },
        { name: 'verified_at', type: 'timestamp', description: 'Verification date' },
      ]}
      aiFeatures={[
        {
          name: 'Coverage Verification',
          description: 'Reads COI and verifies requirements. "ABC Electric COI received. GL $1M meets minimum. Missing: Waiver of Subrogation endorsement."',
          trigger: 'On COI upload'
        },
        {
          name: 'Expiration Management',
          description: 'Proactive renewal workflow. "5 vendor COIs expire in 30 days. Auto-request renewals sent."',
          trigger: 'Daily scan'
        },
        {
          name: 'Risk Assessment',
          description: 'Identifies coverage gaps. "XYZ Plumbing on Smith job - coverage $500K below job requirement of $1M."',
          trigger: 'On job assignment'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Insurance Tracking                             [+ Add Certificate]  │
├─────────────────────────────────────────────────────────────────────┤
│ View: [Company] [Vendors] [Expiring]    Status: [All ▾]            │
├─────────────────────────────────────────────────────────────────────┤
│ ⚠ EXPIRING SOON (Next 30 Days)                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ABC Electric                           Expires: Feb 15, 2025    │ │
│ │ General Liability - $2,000,000                                  │ │
│ │ Status: Renewal requested Jan 20                                │ │
│ │ [View COI] [Send Reminder] [Mark Renewed]                       │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Coastal Plumbing                       Expires: Feb 22, 2025    │ │
│ │ Workers Comp - $1,000,000                                       │ │
│ │ Status: Not yet requested                                       │ │
│ │ [View COI] [Request Renewal]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ COMPANY POLICIES                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Policy Type        Carrier          Coverage    Expires         │ │
│ │ ────────────────────────────────────────────────────────────── │ │
│ │ General Liability  State Farm       $5,000,000  Jun 30, 2025   │ │
│ │ Workers Comp       Hartford         $2,000,000  Jun 30, 2025   │ │
│ │ Commercial Auto    Progressive      $1,000,000  Mar 15, 2025   │ │
│ │ Umbrella           Chubb            $10,000,000 Jun 30, 2025   │ │
│ │ Builders Risk      Zurich           Per Project Per Project    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Vendors Tracked: 45 | Compliant: 42 | Expiring: 3 | Expired: 0     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
