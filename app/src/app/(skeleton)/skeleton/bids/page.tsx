'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { BidsPreview } from '@/components/skeleton/previews/bids-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Create Package', 'Attach Plans', 'Invite Vendors', 'Receive Bids', 'Level & Compare', 'Award & PO'
]

export default function BidsListSkeleton() {
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
      {activeTab === 'preview' ? <BidsPreview /> : <PageSpec
      title="Bid Management"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/26-bid-management.md"
      description="Intelligent bid management that learns from every bid received. Create bid packages with scope checklists, distribute plans to vendors, track invitation statuses, level bids with AI-powered comparison, detect scope gaps and pricing anomalies, and recommend vendors based on total value — not just price. Every bid feeds the Cost Intelligence database."
      workflow={constructionWorkflow}
      features={[
        'Create bid packages with scope of work and scope checklists',
        'Attach drawings, specs, and plan versions to bid packages',
        'Send invitations to vendors with prequalification tracking',
        'Invitation status tracking (sent, viewed, acknowledged, submitted, declined, no response)',
        'Vendor portal for digital bid submission with line-item breakdown',
        'Bid comparison matrix with historical context and anomaly flags',
        'Leveling adjustments for apples-to-apples comparison',
        'Scope coverage analysis — flag scope gaps and exclusions per bid',
        'Alternates comparison across all bidders',
        'Missing scope detection — flag what is NOT included',
        'Vendor selection with one-click PO creation',
        'Bid history tracking per vendor with AI-extracted price intelligence',
        'Due date management and automatic reminders',
        'Pre-bid meeting scheduling and clarification log',
        'Template bid packages for common scopes',
        'Bid tabulation export for owner/architect review',
        'Trade-based filtering and multi-package management',
        'Payment terms and validity period tracking per bid',
        'AI-extracted badge for parsed bid responses (PDF/email)',
      ]}
      connections={[
        { name: 'Vendors (M10)', type: 'input', description: 'Vendor directory with prequalification status' },
        { name: 'Vendor Performance (M22)', type: 'input', description: 'Performance scores inform bid recommendations' },
        { name: 'Jobs (M3)', type: 'input', description: 'Bids scoped to specific jobs' },
        { name: 'Cost Codes (M9)', type: 'input', description: 'Bid items linked to cost codes' },
        { name: 'Documents (M6)', type: 'input', description: 'Plans, specs, and addenda attached to bid packages' },
        { name: 'Vendor Portal (M30)', type: 'output', description: 'Vendors submit bids digitally via portal' },
        { name: 'Purchase Orders (M18)', type: 'output', description: 'PO created directly from awarded bid' },
        { name: 'Budget (M9)', type: 'bidirectional', description: 'Budget targets for comparison; awarded amounts update budget' },
        { name: 'Price Intelligence (M23)', type: 'bidirectional', description: 'All bid prices feed and pull from price database' },
        { name: 'Estimating (M20)', type: 'input', description: 'Estimate line items seed bid package scope' },
        { name: 'Email/Notifications (M5)', type: 'output', description: 'Bid invitations and reminders sent via email' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'title', type: 'string', required: true, description: 'Bid package title' },
        { name: 'trade_category', type: 'string', required: true, description: 'Trade classification' },
        { name: 'scope', type: 'text', description: 'Scope of work narrative' },
        { name: 'scope_checklist', type: 'jsonb', description: 'Structured scope items for coverage tracking' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Published, Closed, Awarded' },
        { name: 'due_date', type: 'date', description: 'Bid submission deadline' },
        { name: 'pre_bid_date', type: 'date', description: 'Pre-bid meeting/site visit date' },
        { name: 'plan_version', type: 'string', description: 'Current plan set version attached' },
        { name: 'budget_amount', type: 'decimal', description: 'Budget target for comparison' },
        { name: 'cost_code_id', type: 'uuid', description: 'Primary cost code for bid' },
        { name: 'awarded_vendor_id', type: 'uuid', description: 'Vendor who won the bid' },
        { name: 'awarded_amount', type: 'decimal', description: 'Winning bid amount' },
        { name: 'ai_recommended_vendor_id', type: 'uuid', description: 'AI-recommended winner' },
        { name: 'ai_recommendation_reason', type: 'text', description: 'Why AI recommended this vendor' },
        { name: 'attachments', type: 'jsonb', description: 'Attached plan sets and documents' },
        { name: 'clarification_count', type: 'integer', description: 'Number of pre-bid clarifications' },
      ]}
      aiFeatures={[
        {
          name: 'Vendor Recommendation',
          description: 'Suggests qualified vendors to invite based on trade match, past performance score, similar project experience, current availability, and pricing history.',
          trigger: 'On new bid creation'
        },
        {
          name: 'Scope Completeness Check',
          description: 'Reviews scope checklist against similar bid packages and flags missing typical items for the trade.',
          trigger: 'Before sending invitations'
        },
        {
          name: 'Bid Price Analysis',
          description: 'Compares each bid to historical pricing and market rates. Flags anomalies (unusually low or high) with severity indicators.',
          trigger: 'On bid receipt'
        },
        {
          name: 'Scope Gap Detection',
          description: 'Analyzes bid responses to identify exclusions and scope gaps. Calculates scope coverage percentage per bidder for true leveled comparison.',
          trigger: 'On bid comparison'
        },
        {
          name: 'Award Recommendation',
          description: 'Recommends vendor considering total value: price, scope coverage, reliability score, callback history, payment terms, and capacity.',
          trigger: 'When all bids received'
        },
        {
          name: 'Bid Response Tracking',
          description: 'Monitors vendor responsiveness: tracks views, acknowledgments, and submission statuses. Suggests follow-up for non-responsive vendors.',
          trigger: 'Real-time tracking'
        },
        {
          name: 'AI Bid Extraction',
          description: 'Parses bid responses from PDFs and emails. Extracts line items, alternates, exclusions, payment terms, and validity periods automatically.',
          trigger: 'On bid document upload'
        },
        {
          name: 'Price Intelligence Capture',
          description: 'Extracts unit pricing from all bids (not just winner) and feeds to Price Intelligence database for future estimates.',
          trigger: 'On bid receipt (all bids)'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
