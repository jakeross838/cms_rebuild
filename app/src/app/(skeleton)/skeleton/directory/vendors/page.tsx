'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { VendorsPreview } from '@/components/skeleton/previews/vendors-preview'
import { cn } from '@/lib/utils'

export default function VendorsPage() {
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
      {activeTab === 'preview' ? <VendorsPreview /> :
    <PageSpec
      title="Vendors & Subcontractors"
      phase="Phase 0 - Foundation"
      planFile="views/directory/VENDORS.md"
      description="Comprehensive vendor management with AI-powered scorecards. Track subcontractors, suppliers, and service providers with performance metrics, insurance compliance, pricing history, and reliability scores. The system learns which vendors deliver quality on time and at fair prices."
      workflow={['Onboard Vendor', 'Track Performance', 'Manage Compliance', 'Build Intelligence']}
      features={[
        'Dual-layer vendor profiles: vendor-owned (platform) + builder-specific (private)',
        'Trade/category classification with builder-specific overrides',
        'Multiple contacts per vendor with key person tracking',
        'Vendor status management: Preferred, Approved, Conditional, Pending, Blacklisted',
        'Insurance/COI tracking with state-specific requirements and additional insured endorsement',
        'W-9 and tax documentation with 1099 reporting support',
        'License verification with state database integration',
        'Performance scorecards: Quality, Timeliness, Communication, Budget, Safety (5 dimensions)',
        'Composite performance score (0-100) with configurable weights',
        'Payment terms per vendor (Net 30, 2/10 Net 30, etc.) with early pay discount tracking',
        'Rate sheets with standing pricing agreements',
        'Job history with per-job performance breakdown',
        'Punch list and warranty callback history',
        'Total spend, active POs, and active job counts',
        'Bid history with win/loss ratio and pricing trends',
        'Prequalification workflow with scoring',
        'Vendor self-registration and onboarding wizard',
        'Blacklisting with documented reason (builder-level only)',
        'Communication timeline across all channels',
        'Platform-wide anonymous benchmarking (opt-in)',
        'Vendor portal access management',
        'Notes and interaction log with internal tags',
        'Capacity indicator showing current workload',
        'Quick actions: Create PO, Invite to Bid, Send Message, Schedule',
      ]}
      connections={[
        { name: 'Selections Catalog', type: 'bidirectional', description: 'Vendors linked to product selections with pricing' },
        { name: 'Purchase Orders', type: 'output', description: 'POs issued to vendors with rate sheet auto-populate' },
        { name: 'Invoices', type: 'input', description: 'Invoices from vendors feed actual costs and performance' },
        { name: 'Bids', type: 'input', description: 'Bid responses with win/loss tracking and pricing trends' },
        { name: 'Jobs', type: 'bidirectional', description: 'Per-job performance breakdown and work history' },
        { name: 'Insurance/Compliance', type: 'bidirectional', description: 'COI tracking, state-specific requirements, W-9, license verification' },
        { name: 'Vendor Portal', type: 'output', description: 'Self-service portal access for schedule, documents, invoicing' },
        { name: 'Lien Waivers', type: 'input', description: 'Conditional/unconditional waivers from vendors' },
        { name: 'Budget', type: 'input', description: 'Committed costs from vendor subcontracts per cost code' },
        { name: 'Schedule', type: 'bidirectional', description: 'Vendor availability calendar and task assignments' },
        { name: 'Punch List', type: 'input', description: 'Punch items and warranty callbacks by vendor' },
        { name: 'Price Intelligence', type: 'output', description: 'Unit cost benchmarks, pricing trends, market comparison' },
        { name: 'Change Orders', type: 'input', description: 'COs affecting vendor subcontracts' },
        { name: 'Contracts', type: 'output', description: 'Generated subcontracts from bid awards' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'company_name', type: 'string', required: true, description: 'Company name (normalized)' },
        { name: 'dba', type: 'string', description: 'Doing business as' },
        { name: 'type', type: 'enum', required: true, description: 'subcontractor, supplier, service' },
        { name: 'status', type: 'enum', required: true, description: 'preferred, approved, conditional, pending, blacklisted' },
        { name: 'trades', type: 'string[]', description: 'Trade categories (user-controlled taxonomy)' },
        { name: 'contacts', type: 'jsonb', description: 'Contact persons with key person flag' },
        { name: 'email', type: 'string', description: 'Primary email' },
        { name: 'phone', type: 'string', description: 'Primary phone' },
        { name: 'address', type: 'jsonb', description: 'Business address' },
        { name: 'tax_id', type: 'string', description: 'EIN/Tax ID (encrypted)' },
        { name: 'w9_on_file', type: 'boolean', description: 'W-9 received for 1099 reporting' },
        { name: 'insurance_expiry', type: 'date', description: 'GL COI expiration' },
        { name: 'workers_comp_expiry', type: 'date', description: 'Workers comp expiration' },
        { name: 'emr_rating', type: 'decimal', description: 'Experience modification rate' },
        { name: 'license_number', type: 'string', description: 'Contractor license number' },
        { name: 'license_state', type: 'string', description: 'License issuing state' },
        { name: 'license_expiry', type: 'date', description: 'License expiration date' },
        { name: 'payment_terms', type: 'string', description: 'Net 30, 2/10 Net 30, etc.' },
        { name: 'retainage_pct', type: 'decimal', description: 'Default retainage percentage' },
        { name: 'score_quality', type: 'decimal', description: 'Quality score 1-5' },
        { name: 'score_timeliness', type: 'decimal', description: 'Timeliness score 1-5' },
        { name: 'score_communication', type: 'decimal', description: 'Communication score 1-5' },
        { name: 'score_budget', type: 'decimal', description: 'Budget adherence score 1-5' },
        { name: 'score_safety', type: 'decimal', description: 'Safety score 1-5' },
        { name: 'composite_score', type: 'decimal', description: 'Weighted composite 0-100' },
        { name: 'total_spend', type: 'decimal', description: 'Lifetime spend with this builder' },
        { name: 'jobs_count', type: 'integer', description: 'Total jobs worked' },
        { name: 'active_jobs', type: 'integer', description: 'Currently active jobs' },
        { name: 'active_pos', type: 'integer', description: 'Open purchase orders' },
        { name: 'bid_win_rate', type: 'decimal', description: 'Bid win/loss ratio' },
        { name: 'warranty_callbacks', type: 'integer', description: 'Warranty callback count' },
        { name: 'blacklist_reason', type: 'text', description: 'Reason for blacklisting (builder-level only)' },
        { name: 'is_builder_managed', type: 'boolean', description: 'Manual mode (vendor refuses portal)' },
        { name: 'prequalification_score', type: 'decimal', description: 'Prequalification assessment score' },
        { name: 'is_active', type: 'boolean', required: true, description: 'Active vendor (soft delete)' },
      ]}
      aiFeatures={[
        {
          name: 'Performance Scoring',
          description: 'Calculates 5-dimension scores from job data. "Quality: 4.2 (punch list ratio 3%), Timeliness: 3.8 (2 delays in 10 jobs), Safety: 4.5 (zero incidents)." Composite score weighted by builder preferences.',
          trigger: 'Continuous — recalculated on job completion, invoice, and punch list'
        },
        {
          name: 'Price Intelligence',
          description: 'Tracks pricing trends per vendor per trade. "ABC Electric: $4.35/SF average, 5% above market but excellent quality justifies premium. Trend: +2% over 12 months."',
          trigger: 'On invoice processing'
        },
        {
          name: 'Compliance Alerts',
          description: 'Proactive compliance warnings with escalation. "3 vendors have GL insurance expiring in 30 days. 1 workers comp expired — PO creation blocked. Auto-renewal requests sent."',
          trigger: 'Daily scan + event-driven on PO creation'
        },
        {
          name: 'Vendor Recommendations',
          description: 'Suggests best vendor for scope with trade ranking. "For electrical rough-in: ABC Electric (preferred, 92/100, $4.35/SF) vs DEF Electric (approved, 76/100, $3.90/SF). ABC recommended for quality-critical work."',
          trigger: 'On PO creation and bid invitation'
        },
        {
          name: 'Risk Detection',
          description: 'Identifies declining vendor performance patterns. "XYZ Plumbing: 3 late completions in a row, punch items up 40% over 6 months, 2 warranty callbacks. Recommend: status review meeting."',
          trigger: 'Weekly pattern analysis'
        },
        {
          name: 'Vendor Auto-Creation',
          description: 'When AI processes an invoice from an unknown vendor, auto-creates vendor record with normalized name, detected trade, and extracted contact info. "New vendor detected: Gulf Coast Concrete. Trade: Concrete. Created from Invoice #4521."',
          trigger: 'On AI invoice processing'
        },
        {
          name: 'Prequalification Scoring',
          description: 'Evaluates vendor prequalification questionnaire with weighted scoring. "Bayou Tile: 3 years experience, $500K revenue, EMR 1.1, no OSHA violations. Prequalification score: 72/100. Recommend: Conditional approval."',
          trigger: 'On prequalification submission'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Vendors                                          [+ Add Vendor]     │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [_______________]  Trade: [All ▾]  Status: [Active ▾]      │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ⭐ ABC Electric                        ★★★★★ 4.8  Preferred    │ │
│ │    Electrical | Mike Johnson | (555) 111-2222                   │ │
│ │    Jobs: 24 | Total Spend: $485K | Avg Price: $4.35/SF         │ │
│ │    Insurance: ✓ Valid until Mar 15 | License: ✓ Active         │ │
│ │    [View Profile] [Create PO] [Request Bid]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ XYZ Plumbing                           ★★★☆☆ 3.4               │ │
│ │    Plumbing | Steve Wilson | (555) 333-4444                     │ │
│ │    Jobs: 12 | Total Spend: $220K | ⚠ 3 late completions        │ │
│ │    Insurance: ⚠ Expires in 15 days | License: ✓ Active         │ │
│ │    AI: "Declining performance trend. Review recommended."       │ │
│ │    [View Profile] [Create PO] [Request Bid]                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Total: 48 vendors | Preferred: 12 | ⚠ Compliance issues: 3        │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
