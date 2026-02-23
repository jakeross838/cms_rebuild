'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { CashFlowPreview } from '@/components/skeleton/previews/cash-flow-preview'
import { cn } from '@/lib/utils'

const cashFlowWorkflow = ['Current Position', 'Project Inflows', 'Project Outflows', 'Identify Gaps', 'Plan Actions']

export default function CashFlowPage() {
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
      {activeTab === 'preview' ? <CashFlowPreview /> : <PageSpec
      title="Cash Flow Forecast"
      phase="Phase 1 - Financial Planning"
      planFile="views/financial/CASH_FLOW.md"
      description="Project future cash position based on expected draw receipts, scheduled payments, and committed expenses. Identify potential cash crunches before they happen and plan accordingly."
      workflow={cashFlowWorkflow}
      features={[
        'Current cash position by bank account (Gap #435)',
        'Configurable time horizon: 30/60/90/180 days or custom range',
        'Weekly or monthly granularity toggle',
        'Expected draw receipts with collection probability',
        'Scheduled vendor payments with lien waiver status',
        'Committed PO amounts and payment terms',
        'Overhead projections (configurable recurring)',
        'Retainage release date tracking',
        'Best/worst/likely scenario modeling',
        'What-if scenario builder (delay draw, add project, lose project)',
        'Cash reserve minimum threshold with alerts',
        'Forecast confidence scoring per period',
        'Historical forecast accuracy tracking',
        'Seasonal payment pattern recognition',
        'Line of credit tracking',
        'Loan payment scheduling',
        'Payment timing optimization recommendations',
        'Filter by inflows/outflows/warnings',
      ]}
      connections={[
        { name: 'Accounts Receivable', type: 'input', description: 'Expected client receipts' },
        { name: 'Accounts Payable', type: 'input', description: 'Scheduled vendor payments' },
        { name: 'Purchase Orders', type: 'input', description: 'Committed spend with payment terms' },
        { name: 'Draws', type: 'input', description: 'Draw schedule with expected amounts' },
        { name: 'Job Schedules', type: 'input', description: 'Work timing for draw projections' },
        { name: 'Lien Waivers', type: 'input', description: 'Waiver status blocking payments' },
        { name: 'Vendor Terms', type: 'input', description: 'Payment terms per vendor' },
        { name: 'Financial Settings', type: 'input', description: 'Bank accounts, reserve targets' },
        { name: 'Financial Dashboard', type: 'output', description: 'Summary cash position' },
      ]}
      dataFields={[
        { name: 'date', type: 'date', required: true, description: 'Forecast date' },
        { name: 'bank_account', type: 'string', description: 'Bank account (operating, trust, payroll)' },
        { name: 'opening_balance', type: 'decimal', description: 'Starting cash' },
        { name: 'expected_inflows', type: 'decimal', description: 'Expected receipts' },
        { name: 'expected_outflows', type: 'decimal', description: 'Expected payments' },
        { name: 'closing_balance', type: 'decimal', description: 'Ending cash' },
        { name: 'inflow_details', type: 'jsonb', description: 'Detailed inflows with source, amount, probability, type' },
        { name: 'outflow_details', type: 'jsonb', description: 'Detailed outflows with vendor, amount, type, lien waiver status' },
        { name: 'confidence', type: 'decimal', description: 'Forecast confidence percentage' },
        { name: 'low_scenario', type: 'decimal', description: 'Pessimistic scenario balance' },
        { name: 'high_scenario', type: 'decimal', description: 'Optimistic scenario balance' },
        { name: 'retainage_inflows', type: 'decimal', description: 'Expected retainage releases' },
        { name: 'overhead_recurring', type: 'decimal', description: 'Configurable overhead amount' },
        { name: 'loan_payments', type: 'decimal', description: 'Scheduled loan payments' },
        { name: 'reserve_target', type: 'decimal', description: 'Minimum cash reserve threshold' },
        { name: 'forecast_accuracy', type: 'decimal', description: 'Historical accuracy percentage' },
      ]}
      aiFeatures={[
        {
          name: 'Gap Detection',
          description: 'Identifies cash shortfalls before they happen. "Week 3: Projected balance drops to $738K. Recommend accelerating Draw #6 or deferring payments."',
          trigger: 'Daily analysis'
        },
        {
          name: 'Payment Timing Optimization',
          description: 'Suggests optimal payment timing. "Shifting ABC Framing and Smith Electric to Week 4 improves Week 3 balance by $76K with no late fees."',
          trigger: 'On forecast update'
        },
        {
          name: 'Receipt Prediction',
          description: 'Predicts actual receipt dates based on client payment history. "Smith typically pays 5 days after draw approval."',
          trigger: 'Using payment history patterns'
        },
        {
          name: 'Seasonal Pattern Recognition',
          description: 'Identifies seasonal cash flow patterns. "Collections slow 15% in Q1 historically. Adjust expectations."',
          trigger: 'Quarterly analysis'
        },
        {
          name: 'Lien Waiver Blocking Alert',
          description: 'Flags payments blocked by missing lien waivers. "3 payments totaling $94.5K pending lien waiver collection."',
          trigger: 'On payment scheduling'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Cash Flow Forecast                                 Target: $100K    │
├─────────────────────────────────────────────────────────────────────┤
│ Current Cash: $847,500                       Updated: 10 min ago   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 30-DAY FORECAST                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │  $900K ─┬─────────────────────────────────────────────────     │ │
│ │         │    ╭──╮                         ╭───╮                │ │
│ │  $800K ─┤───╯    ╰──╮                  ╭─╯   ╰──╮              │ │
│ │         │            ╰──╮          ╭──╯         ╰──            │ │
│ │  $700K ─┤                ╰────────╯         ⚠ Low              │ │
│ │         │                                                       │ │
│ │  $600K ─┤─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ Target ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ │
│ │         │                                                       │ │
│ │         └───────────────────────────────────────────────────    │ │
│ │           Week 1    Week 2    Week 3    Week 4                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ WEEK 3 DETAIL (⚠ Below Target)                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Opening: $745,000                                               │ │
│ │ + Expected: Draw #4 Johnson $60,000                             │ │
│ │ - Payments: ABC Lumber $24K, XYZ Electric $12K, Payroll $85K   │ │
│ │ = Closing: $684,000 (⚠ $16K below target)                      │ │
│ │                                                                 │ │
│ │ AI Recommendation: "Accelerate Smith Draw #5 request by 1 week  │ │
│ │ or defer ABC Lumber payment 5 days (no late fee impact)."       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
