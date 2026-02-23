'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { BankReconciliationPreview } from '@/components/skeleton/previews/bank-reconciliation-preview'
import { cn } from '@/lib/utils'

const bankReconciliationWorkflow = ['Import Statement', 'Auto-Match', 'Manual Match', 'Resolve Differences', 'Complete Reconciliation']

export default function BankReconciliationPage() {
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
      {activeTab === 'preview' ? <BankReconciliationPreview /> : <PageSpec
        title="Bank Reconciliation"
        phase="Phase 2 - Construction Core"
        planFile="views/financial/BANK_RECONCILIATION.md"
        description="Reconcile bank statements against book entries with a split-view workspace. Auto-match transactions, identify outstanding checks and deposits in transit, and resolve differences with full reconciliation summary and audit trail."
        workflow={bankReconciliationWorkflow}
        features={[
          'Bank account selector with multiple accounts',
          'Split-view workspace: Bank Transactions vs Book Entries',
          'Auto-matching engine by amount, date, and payee',
          'Manual match with checkbox selection',
          'Match status indicators: Matched, Unmatched, Outstanding',
          'Reconciliation summary with beginning/ending balance',
          'Outstanding checks and deposits in transit tracking',
          'Bank fee and adjustment recording',
          'Difference calculation with balanced/unbalanced indicator',
          'Bank feed sync integration',
          'Create journal entries directly from unmatched bank items',
          'Search within bank and book sides independently',
          'Statement date and ending balance input',
          'Complete reconciliation with audit trail',
          'Export reconciliation report',
        ]}
        connections={[
          { name: 'Chart of Accounts', type: 'bidirectional', description: 'Cash accounts provide book balances' },
          { name: 'Journal Entries', type: 'bidirectional', description: 'Book entries matched to bank; new JEs created for bank items' },
          { name: 'Accounts Payable', type: 'input', description: 'AP payments appear as bank debits' },
          { name: 'Accounts Receivable', type: 'input', description: 'AR receipts appear as bank credits' },
          { name: 'Payroll', type: 'input', description: 'Payroll ACH transactions in bank feed' },
          { name: 'Financial Reports', type: 'output', description: 'Reconciliation status for cash reports' },
          { name: 'Bank Feed', type: 'input', description: 'Automatic bank transaction import' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'bank_account_id', type: 'uuid', required: true, description: 'GL account for this reconciliation' },
          { name: 'statement_date', type: 'date', required: true, description: 'Bank statement date' },
          { name: 'statement_ending_balance', type: 'decimal', required: true, description: 'Ending balance per bank' },
          { name: 'book_balance', type: 'decimal', required: true, description: 'GL book balance at statement date' },
          { name: 'adjusted_book_balance', type: 'decimal', description: 'Book balance after adjustments' },
          { name: 'difference', type: 'decimal', description: 'Difference between bank and adjusted book' },
          { name: 'status', type: 'enum', required: true, description: 'in_progress, completed, locked' },
          { name: 'completed_by', type: 'uuid', description: 'User who completed reconciliation' },
          { name: 'completed_at', type: 'timestamp', description: 'When reconciliation was completed' },
        ]}
        aiFeatures={[
          {
            name: 'Auto-Match Engine',
            description: 'Automatically matches bank transactions to book entries by amount, date proximity, and payee/description similarity.',
            trigger: 'On bank sync',
          },
          {
            name: 'Missing Entry Detection',
            description: 'Identifies bank transactions with no book entries and suggests journal entries to create.',
            trigger: 'On reconciliation',
          },
          {
            name: 'Outstanding Check Aging',
            description: 'Monitors outstanding checks and alerts when clearing times exceed vendor norms.',
            trigger: 'Daily',
          },
        ]}
        mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Bank Reconciliation          Feb 2026    [Sync] [Export] [Complete] │
├─────────────────────────────────────────────────────────────────────┤
│ Account: [1010 Operating ▾]  Date: Feb 18  Balance: $671,555.00    │
├────────────────────────────────┬────────────────────────────────────┤
│ BANK TRANSACTIONS (8)          │ BOOK ENTRIES (7)                   │
│ □ DEP 02/15 Online Dep  $87.5K│ □ JE-0146 Client Pmt    $87.5K ✓  │
│ □ CHK 4521 ABC Lumber  -$24K  │ □ JE-0147 ABC Lumber   -$24K  ✓   │
│ □ ACH ADP Payroll     -$34.2K │ □ JE-0145 Payroll      -$34.2K ✓  │
│ □ FEE Service Fee        -$45 │ □ JE-0143 Retainage    -$12.4K ⚠  │
│ □ DEP Wire Transfer    $42K ⚠ │ □ JE-0144 Depreciation  -$3.5K ⚠  │
├────────────────────────────────┴────────────────────────────────────┤
│ Reconciliation Summary                                              │
│ Beginning: $574,450  + Deposits: $129,500  - Payments: $82,395     │
│ Ending: $621,555    Bank: $671,555   Difference: $0.00  ✓          │
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
