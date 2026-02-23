'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { ChartOfAccountsPreview } from '@/components/skeleton/previews/chart-of-accounts-preview'
import { cn } from '@/lib/utils'

const chartOfAccountsWorkflow = ['Create Account', 'Configure Hierarchy', 'Post Transactions', 'Review Balances', 'Close Period']

export default function ChartOfAccountsPage() {
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
      {activeTab === 'preview' ? <ChartOfAccountsPreview /> : <PageSpec
        title="Chart of Accounts / General Ledger"
        phase="Phase 2 - Construction Core"
        planFile="views/financial/CHART_OF_ACCOUNTS.md"
        description="Full chart of accounts with hierarchical account structure, debit/credit tracking, YTD activity, and balance verification. Supports construction-specific accounts including WIP, retainage, and cost-of-revenue categories."
        workflow={chartOfAccountsWorkflow}
        features={[
          'Hierarchical account structure with parent/child relationships',
          'Account types: Asset, Liability, Equity, Revenue, Expense',
          'Debit/Credit normal balance indicators',
          'YTD activity tracking per account',
          'Balance sheet verification (Assets = Liabilities + Equity)',
          'Account status: Active, Inactive, Locked',
          'Search and filter by type, status, account number',
          'Construction-specific accounts (WIP, Retainage, Cost Codes)',
          'Expand/collapse account groups',
          'Export chart of accounts',
          'AI account health analysis',
          'Missing account suggestions',
          'Unusual balance detection',
        ]}
        connections={[
          { name: 'Journal Entries', type: 'input', description: 'All journal entries post to GL accounts' },
          { name: 'Accounts Payable', type: 'bidirectional', description: 'AP transactions update liability accounts' },
          { name: 'Accounts Receivable', type: 'bidirectional', description: 'AR transactions update asset accounts' },
          { name: 'Bank Reconciliation', type: 'bidirectional', description: 'Cash accounts reconciled with bank statements' },
          { name: 'Budget', type: 'output', description: 'Account balances feed budget vs actual reports' },
          { name: 'Financial Reports', type: 'output', description: 'Trial balance, P&L, balance sheet' },
          { name: 'QuickBooks', type: 'bidirectional', description: 'Sync chart of accounts with external accounting' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'account_number', type: 'string', required: true, description: 'Account number (e.g., 1010)' },
          { name: 'account_name', type: 'string', required: true, description: 'Display name' },
          { name: 'account_type', type: 'enum', required: true, description: 'Asset, Liability, Equity, Revenue, Expense' },
          { name: 'parent_account_id', type: 'uuid', description: 'Parent account for hierarchy' },
          { name: 'balance', type: 'decimal', required: true, description: 'Current balance' },
          { name: 'ytd_activity', type: 'decimal', description: 'Year-to-date transaction total' },
          { name: 'normal_balance', type: 'enum', description: 'Debit or Credit' },
          { name: 'status', type: 'enum', required: true, description: 'Active, Inactive, Locked' },
          { name: 'description', type: 'text', description: 'Account description' },
          { name: 'is_system_account', type: 'boolean', description: 'System-managed account flag' },
        ]}
        aiFeatures={[
          {
            name: 'Account Health Analysis',
            description: 'Monitors account balances for anomalies, verifies debit/credit integrity, and checks balance sheet equation.',
            trigger: 'Daily',
          },
          {
            name: 'Missing Account Suggestions',
            description: 'Analyzes transaction patterns and suggests new accounts needed (e.g., separate retainage sub-accounts).',
            trigger: 'Weekly',
          },
          {
            name: 'Unusual Balance Detection',
            description: 'Flags accounts with abnormal balances (wrong normal balance, sudden spikes, dormant accounts with activity).',
            trigger: 'Real-time',
          },
        ]}
        mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Chart of Accounts                    [Export] [Configure] [+ Add]   │
├─────────────────────────────────────────────────────────────────────┤
│ [All] [Assets] [Liabilities] [Equity] [Revenue] [Expenses]         │
│ Search: [____________]  Sort: [Account # ▾]                         │
├──────┬───────────────────────┬──────┬───────────┬──────┬───────────┤
│ Acct │ Account Name          │ Type │ Balance   │ YTD  │ Status    │
├──────┼───────────────────────┼──────┼───────────┼──────┼───────────┤
│ 1000 │ ▼ Cash & Bank         │Asset │ $847,230  │ $1.2M│ Active    │
│ 1010 │   Operating Account   │Asset │ $623,450  │ $892K│ Active    │
│ 1020 │   Payroll Account     │Asset │  $89,780  │ $245K│ Active    │
│ 1030 │   Trust Account       │Asset │ $134,000  │ $108K│ Locked    │
│ 1100 │ ▼ Accounts Receivable │Asset │ $412,500  │ $3.4M│ Active    │
│ ...  │                       │      │           │      │           │
├──────────────────────────────────────────────────────────────────────┤
│ Balance: Assets $2,678,070 = Liabilities $404,750 + Equity $2.28M  │
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
