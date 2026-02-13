'use client'
import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { InvoicesPreview } from '@/components/skeleton/previews/invoices-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobInvoicesPage() {
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
      {activeTab === 'preview' ? <InvoicesPreview /> : <PageSpec
        title="Job Invoices"
      phase="Phase 0 - Foundation"
      planFile="views/jobs/INVOICES.md"
      description="Manage all invoices received for this job. Review, approve, code to budget, and track payment status. Match invoices to POs and ensure accurate job costing."
      workflow={['Receive', 'Review', 'Code', 'Approve', 'Pay', 'Reconcile']}
      features={[
        'Invoice list by job with status pipeline badges',
        'Full state machine: needs_review > ready_for_approval > approved > in_draw > paid',
        'Invoice types: standard, progress, final, credit_memo, retainage_release',
        'Contract type handling: lump sum, T&M, unit price, cost plus',
        'PO matching with three-way match and variance tracking',
        'Multi-level approval workflow with configurable chains and thresholds',
        'Cost code assignment with split coding across multiple codes',
        'Budget impact preview before approval',
        'Retainage tracking and release workflow',
        'Dispute management with resolution tracking',
        'Vendor payment tracking: check, ACH, wire, credit card',
        'Lien waiver prerequisite enforcement',
        'Duplicate detection (vendor + invoice number + amount hash)',
        'PDF stamping with status-aware design',
        'Bulk approval for qualifying invoices',
        'Batch payment recommendations by due date',
        'Aging reports: current / 30 / 60 / 90 / 120+ days',
        'Credit memo linkage to original invoice and PO',
        'Payment prerequisite checklist (insurance, W-9, lien waiver)',
        'Early payment discount tracking (2/10 Net 30)',
      ]}
      connections={[
        { name: 'Purchase Orders', type: 'input', description: 'Three-way match: PO vs receipt vs invoice' },
        { name: 'Budget', type: 'bidirectional', description: 'Actuals posted on approval, variance tracking' },
        { name: 'Accounts Payable', type: 'output', description: 'Payment queue with batch recommendations' },
        { name: 'Lien Waivers', type: 'bidirectional', description: 'Payment prerequisite enforcement' },
        { name: 'Vendors', type: 'input', description: 'Vendor info, insurance, W-9 status' },
        { name: 'Draws', type: 'output', description: 'Approved invoices included in draws' },
        { name: 'Change Orders', type: 'input', description: 'CO-linked allocations auto-inherited' },
        { name: 'QuickBooks', type: 'output', description: 'Synced as bills with cost code mapping' },
        { name: 'Cost Intelligence', type: 'output', description: 'Line items feed pricing database' },
        { name: 'AI Processing', type: 'input', description: 'OCR extraction, vendor matching, cost coding' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'This job' },
        { name: 'vendor_id', type: 'uuid', required: true, description: 'Vendor' },
        { name: 'invoice_number', type: 'string', required: true, description: 'Vendor invoice #' },
        { name: 'invoice_date', type: 'date', required: true, description: 'Invoice date' },
        { name: 'due_date', type: 'date', description: 'Payment due' },
        { name: 'amount', type: 'decimal', required: true, description: 'Total amount' },
        { name: 'tax_amount', type: 'decimal', description: 'Sales tax' },
        { name: 'retainage_amount', type: 'decimal', description: 'Retainage held' },
        { name: 'net_amount', type: 'decimal', description: 'Amount payable after retainage' },
        { name: 'invoice_type', type: 'string', required: true, description: 'standard | progress | final | credit_memo | retainage_release' },
        { name: 'contract_type', type: 'string', description: 'lump_sum | time_materials | unit_price | cost_plus' },
        { name: 'po_id', type: 'uuid', description: 'Matched PO' },
        { name: 'po_variance', type: 'decimal', description: 'Difference from PO amount' },
        { name: 'cost_code_id', type: 'uuid', description: 'Primary cost code' },
        { name: 'status', type: 'string', required: true, description: 'needs_review | ready_for_approval | approved | in_draw | paid | disputed | denied | split | voided' },
        { name: 'approval_step', type: 'string', description: 'Current approval step' },
        { name: 'lien_waiver_status', type: 'string', description: 'not_required | required | pending | received' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, 2/10 Net 30, Due on Receipt' },
        { name: 'payment_method', type: 'string', description: 'check | ach | wire | credit_card' },
        { name: 'paid_date', type: 'date', description: 'Date payment issued' },
        { name: 'draw_id', type: 'uuid', description: 'Associated draw request' },
        { name: 'ai_confidence', type: 'decimal', description: 'AI extraction confidence 0-1' },
        { name: 'duplicate_hash', type: 'string', description: 'vendor_id|invoice_number|amount hash' },
      ]}
      aiFeatures={[
        {
          name: 'Invoice OCR & Extraction',
          description: 'Drop PDF or snap photo -- AI extracts vendor, invoice number, date, amount, tax, and line items. Handles multi-vendor invoice formats.',
          trigger: 'On file upload'
        },
        {
          name: 'PO Matching & Variance',
          description: 'Auto-matches to POs with three-way match. "Invoice matches PO-089 for ABC Lumber. Amount: $12,450 (+$920 over PO). Verify change order."',
          trigger: 'After extraction'
        },
        {
          name: 'Cost Code Auto-Suggestion',
          description: 'Suggests cost codes based on vendor trade, line items, and history. "ABC Electric invoices typically code 95% to 16000-Electrical."',
          trigger: 'On allocation screen'
        },
        {
          name: 'Duplicate Detection',
          description: 'Hash-based detection (vendor|invoice#|amount). Flags near-duplicates within 30-day window. 409 on >=95% confidence match.',
          trigger: 'Before save'
        },
        {
          name: 'Budget Impact Preview',
          description: 'Shows budget impact before approval: "This invoice puts 16000-Electrical at 92% of budget ($45,200 of $49,000)."',
          trigger: 'On approval review'
        },
        {
          name: 'Payment Optimization',
          description: 'Suggests optimal payment timing for early discounts. Tracks batch payment opportunities by due date.',
          trigger: 'On payment scheduling'
        },
        {
          name: 'PDF Stamping',
          description: 'Status-aware stamp regenerated from original PDF. Shows cost codes, PO billing progress, approval metadata.',
          trigger: 'On status change'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Invoices - Smith Residence                     Job Total: $892,000  │
├─────────────────────────────────────────────────────────────────────┤
│ Status: [All ▾]    Vendor: [All ▾]              [+ Enter Invoice]  │
├─────────────────────────────────────────────────────────────────────┤
│ NEEDS REVIEW (3)                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ABC Lumber #45678            $24,500         Received: Jan 27   │ │
│ │ Framing package - 2nd floor                                     │ │
│ │ ✓ Matches PO-089 | ✓ Lien waiver received                      │ │
│ │ AI Suggested: 03-Framing-Materials                              │ │
│ │ [Approve] [Review] [Dispute]                                    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ XYZ Electric #E-2024-156     $14,200         Received: Jan 26   │ │
│ │ Rough-in electrical                                             │ │
│ │ ⚠ 14% over PO estimate ($12,450)                               │ │
│ │ ⚠ Lien waiver pending                                          │ │
│ │ [Approve] [Review] [Dispute]                                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ APPROVED - AWAITING PAYMENT                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Coastal Concrete #CC-890     $18,000         Due: Feb 5         │ │
│ │ Coastal Plumbing #1234       $8,900          Due: Feb 8         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ This Month: $65,600 invoiced | $42,000 approved | $18,000 paid     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
