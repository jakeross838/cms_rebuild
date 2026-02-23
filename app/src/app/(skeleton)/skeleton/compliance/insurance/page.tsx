'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { InsurancePreview } from '@/components/skeleton/previews/insurance-preview'
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
      title="Insurance & Compliance Tracking"
      phase="Phase 1 - Compliance"
      planFile="views/compliance/INSURANCE.md"
      description="Comprehensive insurance management for company policies, vendor COIs, and per-project Builder's Risk. State-specific requirements, workers comp class codes, EMR tracking, additional insured endorsements, and monthly compliance review workflows. Escalating alerts with configurable PO-blocking for non-compliant vendors."
      workflow={['Request COI', 'AI Verifies Coverage', 'Review & Approve', 'Monitor Expiration', 'Auto-Request Renewal', 'Monthly Review']}
      features={[
        'Company policy tracking across all policy types (GL, WC, Auto, Umbrella)',
        'Vendor/sub COI tracking with compliance grading (A/B/C/F)',
        'Builder\'s Risk insurance tracked per project with named insured parties',
        'State-specific insurance requirements from jurisdiction config database',
        'Coverage validation against project state requirements (not just home-state defaults)',
        'Workers compensation tracking: carrier, class codes, EMR rating, exemptions',
        'Sole proprietor WC exemption handling with uploaded exemption certificates',
        'EMR ratings factored into vendor prequalification scoring',
        'Additional insured endorsement tracking with auto-request on onboarding',
        'Waiver of subrogation tracking with auto-request on renewal',
        'Configurable expiration alerts: 90/60/30/14/7-day warnings',
        'Escalation ladder: warnings > conditional status > PO block (configurable)',
        'Monthly insurance certificate review workflow with batch actions',
        'Monthly license renewal review with state database verification',
        'Compliance dashboard: green/yellow/red per vendor with trend tracking',
        'Compliance history: all past certificates retained, not just current',
        'Non-compliant vendor PO blocking (hard block or warning, configurable)',
        'Bulk COI request and renewal reminders',
        'Annual insurance audit data preparation (payroll/sub costs by class code)',
        'Audit-ready reports: vendor payments, class codes, project breakdowns (CSV/PDF)',
        'Coverage gap analysis: compare vendor coverage to project requirements',
        'COI document storage with version history',
      ]}
      connections={[
        { name: 'Vendors', type: 'bidirectional', description: 'Vendor compliance status, COI tracking, W-9' },
        { name: 'Jobs/Projects', type: 'input', description: 'Per-project insurance requirements and Builder\'s Risk' },
        { name: 'Contracts', type: 'input', description: 'Required coverage levels per subcontract' },
        { name: 'Purchase Orders', type: 'input', description: 'PO blocked if vendor COI expired or below minimum' },
        { name: 'Document Storage', type: 'output', description: 'COI documents, exemptions, endorsements stored' },
        { name: 'Notifications', type: 'output', description: 'Expiration alerts to builder and vendor' },
        { name: 'Vendor Portal', type: 'bidirectional', description: 'Vendors upload renewed COIs through portal' },
        { name: 'Budget', type: 'output', description: 'Builder\'s Risk premium tracked as project cost' },
        { name: 'Prequalification', type: 'output', description: 'Insurance status and EMR factor into prequal score' },
        { name: 'HR/Workforce', type: 'input', description: 'Employee payroll by class code for audit reports' },
        { name: 'Jurisdiction Config', type: 'input', description: 'State-specific insurance minimums and requirements' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'entity_type', type: 'enum', required: true, description: 'company, vendor, project' },
        { name: 'entity_id', type: 'uuid', required: true, description: 'FK to company, vendor, or project' },
        { name: 'policy_type', type: 'enum', required: true, description: 'gl, workers_comp, auto, umbrella, builders_risk, professional_liability' },
        { name: 'carrier', type: 'string', description: 'Insurance company name' },
        { name: 'policy_number', type: 'string', description: 'Policy number' },
        { name: 'coverage_amount', type: 'decimal', description: 'Coverage limit' },
        { name: 'deductible', type: 'decimal', description: 'Policy deductible (esp. Builder\'s Risk)' },
        { name: 'effective_date', type: 'date', required: true, description: 'Coverage start date' },
        { name: 'expiration_date', type: 'date', required: true, description: 'Coverage end date' },
        { name: 'additional_insured', type: 'boolean', description: 'Builder named as additional insured' },
        { name: 'waiver_subrogation', type: 'boolean', description: 'Waiver of subrogation endorsement' },
        { name: 'certificate_url', type: 'string', description: 'Uploaded COI document URL' },
        { name: 'endorsement_url', type: 'string', description: 'AI/WOS endorsement document URL' },
        { name: 'status', type: 'enum', required: true, description: 'active, expiring, expired, pending' },
        { name: 'compliance_grade', type: 'enum', description: 'A, B, C, F — computed from coverage and status' },
        { name: 'state_requirement', type: 'string', description: 'Applicable state for requirements' },
        { name: 'minimum_required', type: 'decimal', description: 'Minimum coverage required (state/builder)' },
        { name: 'meets_minimum', type: 'boolean', description: 'Coverage meets or exceeds minimum' },
        { name: 'emr_rating', type: 'decimal', description: 'Experience modification rate (WC only)' },
        { name: 'class_code', type: 'string', description: 'Workers comp class code' },
        { name: 'is_exempt', type: 'boolean', description: 'WC exempt (sole proprietor)' },
        { name: 'exemption_cert_url', type: 'string', description: 'Uploaded exemption certificate' },
        { name: 'named_insured', type: 'jsonb', description: 'Named insured parties (Builder\'s Risk)' },
        { name: 'verified_by', type: 'uuid', description: 'Who verified the COI' },
        { name: 'verified_at', type: 'timestamp', description: 'Verification date' },
        { name: 'renewal_requested_at', type: 'timestamp', description: 'When renewal was requested' },
        { name: 'last_review_date', type: 'date', description: 'Last monthly review date' },
        { name: 'notes', type: 'text', description: 'Internal notes' },
      ]}
      aiFeatures={[
        {
          name: 'COI Verification & Extraction',
          description: 'AI reads uploaded COI documents, extracts policy details, validates coverage meets state-specific minimums, checks for additional insured and WOS endorsements. "ABC Electric COI: GL $2M (meets FL $1M min). AI endorsement: present. WOS: missing — auto-request sent."',
          trigger: 'On COI upload'
        },
        {
          name: 'Expiration Management & Escalation',
          description: 'Proactive renewal workflow with configurable escalation. 90/60/30/14/7-day warnings. Auto-send renewal requests. On expiration: vendor status changed to conditional, PO creation blocked. "5 vendor COIs expire in 30 days. 2 renewal requests already sent."',
          trigger: 'Daily scan + event-driven'
        },
        {
          name: 'Coverage Gap Analysis',
          description: 'Identifies coverage gaps when vendor assigned to new project. "Coastal Plumbing on Smith job — FL requires $1M GL, vendor has $500K. Cannot issue PO until coverage increased."',
          trigger: 'On vendor assignment to project'
        },
        {
          name: 'Monthly Compliance Review',
          description: 'Generates monthly report with all expiring certificates, compliance trends, batch renewal actions. "February review: 4 expiring, 1 expired, 2 missing WOS. Compliance rate: 89% (down from 92% last month)."',
          trigger: 'Monthly (configurable day)'
        },
        {
          name: 'Annual Audit Preparation',
          description: 'Auto-generates audit-ready reports with vendor payments by class code, employee payroll breakdowns, and project-level cost summaries. Exportable CSV/PDF for insurance auditor.',
          trigger: 'On demand / annual'
        },
        {
          name: 'EMR Risk Assessment',
          description: 'Factors EMR ratings into vendor risk assessment. "Coastal Plumbing EMR 1.15 — above 1.0 threshold. Higher workers comp costs. Factor into bid comparison and prequalification scoring."',
          trigger: 'On vendor prequalification and bid evaluation'
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
