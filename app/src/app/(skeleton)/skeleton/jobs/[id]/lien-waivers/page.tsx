'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { LienWaiversPreview } from '@/components/skeleton/previews/lien-waivers-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobLienWaiversPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <LienWaiversPreview />
      ) : (
        <PageSpec
          title="Lien Waivers"
          phase="Phase 1 - Compliance"
          planFile="views/jobs/LIEN_WAIVERS.md"
          description="Track lien waivers from all vendors and subcontractors for this job. Ensure waivers are collected before payments and maintain proper documentation for project closeout and title insurance."
          workflow={['Payment Due', 'Request Waiver', 'Waiver Received', 'Verify', 'Approve Payment']}
          features={[
            'Waiver tracking by vendor with status pipeline',
            '4-type waiver matrix (conditional/unconditional x progress/final)',
            'State-specific statutory form library (all 50 states)',
            'Auto-request on invoice approval or payment',
            'Template management with versioning',
            'E-signature, wet signature, and notarization support',
            'Payment hold enforcement (strict/warn/none)',
            'Draw package waiver checklist',
            'Compliance risk scoring per vendor per project',
            'Missing waiver alerts with escalation',
            'Multi-tier waiver tracking (prime and sub-tier)',
            'Preliminary notice tracking with deadlines',
            'Mechanics lien deadline calendar',
            'Vendor portal for waiver submission',
            'Bulk waiver request for draw packages',
            'Reminder schedule with auto-escalation',
            'Signed document storage and viewer',
            'Submission method tracking (portal, email, manual)',
          ]}
          connections={[
            { name: 'Invoices', type: 'bidirectional', description: 'Payment hold enforcement per waiver status' },
            { name: 'Accounts Payable', type: 'bidirectional', description: 'Block payment without waiver (configurable)' },
            { name: 'Vendors', type: 'input', description: 'Vendor contacts for waiver requests' },
            { name: 'Draws', type: 'bidirectional', description: 'Draw package waiver completeness check' },
            { name: 'Document Storage', type: 'output', description: 'Signed waiver file storage' },
            { name: 'Vendor Portal', type: 'output', description: 'Vendor self-service waiver submission' },
            { name: 'E-Signature', type: 'bidirectional', description: 'Electronic signature workflow' },
            { name: 'Contracts', type: 'input', description: 'Contract closeout waiver requirements' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
            { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
            { name: 'waiver_type', type: 'string', required: true, description: 'conditional_progress, unconditional_progress, conditional_final, unconditional_final' },
            { name: 'through_date', type: 'date', description: 'Work through date' },
            { name: 'amount', type: 'decimal', description: 'Amount covered' },
            { name: 'invoice_id', type: 'uuid', description: 'Related invoice' },
            { name: 'payment_id', type: 'uuid', description: 'Related payment' },
            { name: 'template_id', type: 'uuid', description: 'State-specific form template' },
            { name: 'status', type: 'string', required: true, description: 'draft, requested, submitted, approved, rejected, void' },
            { name: 'request_sent_at', type: 'timestamp', description: 'When request sent' },
            { name: 'request_channel', type: 'string', description: 'email, portal, sms' },
            { name: 'submitted_at', type: 'timestamp', description: 'When vendor submitted' },
            { name: 'approved_at', type: 'timestamp', description: 'When approved' },
            { name: 'signature_type', type: 'string', description: 'electronic, wet, notarized' },
            { name: 'signed_document_url', type: 'string', description: 'Signed waiver document' },
            { name: 'reminders_sent', type: 'integer', description: 'Number of reminders' },
            { name: 'next_reminder_at', type: 'timestamp', description: 'Next reminder scheduled' },
            { name: 'tier', type: 'string', description: 'prime, sub_tier' },
            { name: 'parent_vendor_id', type: 'uuid', description: 'Prime vendor if sub_tier' },
            { name: 'state_code', type: 'string', description: 'State for statutory form selection' },
            { name: 'compliance_risk', type: 'string', description: 'low, medium, high' },
            { name: 'payment_hold', type: 'boolean', description: 'Payment blocked until received' },
            { name: 'submission_method', type: 'string', description: 'portal, email, manual' },
          ]}
          aiFeatures={[
            {
              name: 'Auto-Request',
              description: 'Sends waiver requests on triggers. "Invoice approved for ABC Lumber. Conditional progress waiver request sent via portal."',
              trigger: 'On invoice approval or payment'
            },
            {
              name: 'Compliance Check',
              description: 'Validates completeness for draws. "Draw #5 requires waivers from 8 vendors (including 2 sub-tier). Received: 6. Missing: ABC Electric, XYZ Plumbing."',
              trigger: 'Before draw submission'
            },
            {
              name: 'Payment Hold Enforcement',
              description: 'Blocks payment per enforcement level. "Strict mode: Cannot process payment to Smith Electric. Conditional waiver not received. Lien deadline in 45 days."',
              trigger: 'On payment attempt'
            },
            {
              name: 'Lien Waiver AI Extraction',
              description: 'Extracts waiver details from uploaded documents. Detects type, vendor, amount, through-date, and signature presence with confidence scoring.',
              trigger: 'On document upload'
            },
            {
              name: 'Deadline Monitoring',
              description: 'Tracks mechanics lien filing deadlines. "Coastal Concrete lien deadline in 30 days. Final waiver required for project closeout."',
              trigger: 'Continuous monitoring'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Lien Waivers - Smith Residence                 Compliance: 94%      │
├─────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│ │ Received     │ Pending      │ For Draw #5  │ Total Value  │      │
│ │ 45 waivers   │ 3 waivers    │ 6 of 8       │ $892,000     │      │
│ └──────────────┴──────────────┴──────────────┴──────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING WAIVERS (Payment Hold)                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ABC Electric                              Requested: Jan 25     │ │
│ │ Conditional Progress Waiver | Amount: $12,450                   │ │
│ │ Invoice: E-2024-156 | Payment: ON HOLD                          │ │
│ │ [Send Reminder] [Mark Received] [Call Vendor]                   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ XYZ Plumbing                              Requested: Jan 26     │ │
│ │ Conditional Progress Waiver | Amount: $8,900                    │ │
│ │ Invoice: 1234 | Payment: ON HOLD                                │ │
│ │ [Send Reminder] [Mark Received] [Call Vendor]                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ RECENTLY RECEIVED                                                   │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ABC Lumber - Conditional - $24,500 - Received Jan 27            │ │
│ │ Coastal Concrete - Unconditional - $18,000 - Received Jan 26    │ │
│ │ PGT Windows - Conditional - $45,000 - Received Jan 25           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 2 invoices cannot be paid until waivers received                    │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
