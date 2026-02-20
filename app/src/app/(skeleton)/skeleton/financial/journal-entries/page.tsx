'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { JournalEntriesPreview } from '@/components/skeleton/previews/journal-entries-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const journalEntriesWorkflow = ['Create Entry', 'Add Line Items', 'Verify Balance', 'Submit for Approval', 'Post to GL']

export default function JournalEntriesPage() {
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
      {activeTab === 'preview' ? <JournalEntriesPreview /> : <PageSpec
        title="Journal Entries"
        phase="Phase 2 - Construction Core"
        planFile="views/financial/JOURNAL_ENTRIES.md"
        description="Create, review, and post journal entries to the general ledger. Supports auto-posted entries from AP/AR/Payroll, manual entries, recurring entries, and adjusting entries with full debit/credit line item detail and approval workflows."
        workflow={journalEntriesWorkflow}
        features={[
          'Multi-line debit/credit journal entries',
          'Auto-posted entries from AP, AR, Payroll modules',
          'Manual entry creation with balanced validation',
          'Recurring entry templates (monthly depreciation, insurance)',
          'Adjusting entries for accruals and reclassifications',
          'Approval workflow for manual and adjusting entries',
          'Entry type badges: Auto, Manual, Recurring, Adjusting',
          'Status tracking: Draft, Pending Approval, Posted',
          'Expandable line item detail view',
          'Source module cross-reference',
          'Debit/Credit balance verification per entry and MTD totals',
          'Search by entry number, description, source module',
          'Filter by type, status, date range',
          'Export journal entries',
          'Audit trail with created by and approver tracking',
        ]}
        connections={[
          { name: 'Chart of Accounts', type: 'output', description: 'All entries post to GL accounts' },
          { name: 'Accounts Payable', type: 'input', description: 'AP transactions auto-generate journal entries' },
          { name: 'Accounts Receivable', type: 'input', description: 'AR transactions auto-generate journal entries' },
          { name: 'Payroll', type: 'input', description: 'Payroll processing auto-generates journal entries' },
          { name: 'Purchase Orders', type: 'input', description: 'PO receipts auto-generate accrual entries' },
          { name: 'Bank Reconciliation', type: 'bidirectional', description: 'Bank entries matched to journal entries' },
          { name: 'Financial Reports', type: 'output', description: 'Entries feed all financial reports' },
          { name: 'Audit Log', type: 'output', description: 'All entry changes tracked for audit' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'entry_number', type: 'string', required: true, description: 'Auto-generated entry number (JE-XXXX)' },
          { name: 'entry_date', type: 'date', required: true, description: 'Transaction date' },
          { name: 'description', type: 'text', required: true, description: 'Entry description' },
          { name: 'entry_type', type: 'enum', required: true, description: 'auto, manual, recurring, adjusting' },
          { name: 'status', type: 'enum', required: true, description: 'draft, pending_approval, posted, voided' },
          { name: 'total_amount', type: 'decimal', required: true, description: 'Total entry amount' },
          { name: 'source_module', type: 'string', description: 'Originating module (AP, AR, Payroll, etc.)' },
          { name: 'source_document_id', type: 'uuid', description: 'Reference to source document' },
          { name: 'memo', type: 'text', description: 'Additional notes' },
          { name: 'created_by', type: 'uuid', required: true, description: 'User who created the entry' },
          { name: 'approved_by', type: 'uuid', description: 'Approver for manual/adjusting entries' },
          { name: 'posted_at', type: 'timestamp', description: 'When entry was posted to GL' },
        ]}
        aiFeatures={[
          {
            name: 'Auto-Posting Accuracy',
            description: 'Tracks accuracy of auto-posted entries from source modules. Flags entries that may need correction.',
            trigger: 'On posting',
          },
          {
            name: 'Approval Workflow Intelligence',
            description: 'Monitors approval queue, escalates overdue approvals, and suggests fast-track for low-risk entries.',
            trigger: 'Daily',
          },
          {
            name: 'Recurring Entry Monitor',
            description: 'Tracks recurring entry schedules, alerts on missed entries, and suggests new recurring patterns.',
            trigger: 'Daily',
          },
          {
            name: 'Reclassification Detection',
            description: 'Identifies patterns in reclassification entries that may indicate systemic coding issues.',
            trigger: 'On posting',
          },
        ]}
        mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Journal Entries              February 2026    [Export] [+ New Entry] │
├─────────────────────────────────────────────────────────────────────┤
│ [All (10)] [Posted (9)] [Pending (1)] [Draft (0)]                   │
│ Type: [All Types ▾]  Search: [____________]                         │
├─────────────────────────────────────────────────────────────────────┤
│ MTD: Debits $191,345.00  Credits $191,345.00  ✓ Balanced            │
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ JE-0147 | Feb 18 | Invoice #892 ABC Lumber                   │   │
│ │ [Auto] [Posted]                         $24,000.00            │   │
│ │   ▸ Dr 5100 Materials          $24,000.00                     │   │
│ │   ▸ Cr 2000 Accounts Payable              $24,000.00          │   │
│ └───────────────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ JE-0143 | Feb 16 | Retainage Release Harbor View             │   │
│ │ [Manual] [Pending Approval]              $12,400.00           │   │
│ │ Approver: Mike Ross                                           │   │
│ │ [Approve & Post] [Reject]                                     │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
