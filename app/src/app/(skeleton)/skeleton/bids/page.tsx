'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Estimates', 'Bid Requests', 'Bid Comparison', 'Vendor Selection', 'POs', 'Execution'
]

export default function BidsListSkeleton() {
  return (
    <PageSpec
      title="Bid Requests"
      phase="Phase 2 - Vendor Collaboration"
      planFile="views/bids/BIDS_RFIS_SUBMITTALS.md"
      description="Intelligent bid management that learns from every bid received. The system automatically compares bids to historical pricing, flags missing scope items, detects anomalies, and recommends vendors based on total value (not just price). Every bid feeds the Cost Intelligence database."
      workflow={constructionWorkflow}
      features={[
        'Create bid packages with scope of work auto-generated from plans',
        'Attach drawings, specs, and documents to bid',
        'Send to recommended vendors based on trade, history, and capacity',
        'Vendor portal for digital bid submission',
        'Bid comparison matrix with historical context',
        'Leveling adjustments for apples-to-apples comparison',
        'Missing scope detection—flag what\'s NOT included',
        'Vendor selection with one-click PO creation',
        'Bid history tracking per vendor',
        'Due date management and automatic reminders',
        'Template bid packages for common scopes',
        'Bid tabulation export for owner/architect review',
      ]}
      connections={[
        { name: 'Vendors', type: 'input', description: 'Bids sent to vendors with intelligence' },
        { name: 'Jobs', type: 'input', description: 'Bids scoped to jobs' },
        { name: 'Cost Codes', type: 'input', description: 'Bid items linked to cost codes' },
        { name: 'Documents', type: 'input', description: 'Plans and specs attached to bids' },
        { name: 'Vendor Portal', type: 'output', description: 'Vendors submit bids via portal' },
        { name: 'Purchase Orders', type: 'output', description: 'PO created from accepted bid' },
        { name: 'Budget', type: 'output', description: 'Bid amounts inform budget planning' },
        { name: 'Email', type: 'output', description: 'Bid invitations sent via email' },
        { name: 'Cost Intelligence', type: 'bidirectional', description: 'All bid prices feed and pull from database' },
        { name: 'Vendor Intelligence', type: 'input', description: 'Vendor scores inform selection' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'title', type: 'string', required: true, description: 'Bid package title' },
        { name: 'scope', type: 'text', description: 'Scope of work description' },
        { name: 'scope_structured', type: 'jsonb', description: 'AI-extracted scope items' },
        { name: 'status', type: 'string', required: true, description: 'Draft, Sent, Closed, Awarded' },
        { name: 'due_date', type: 'date', description: 'Bid submission deadline' },
        { name: 'cost_code_id', type: 'uuid', description: 'Primary cost code for bid' },
        { name: 'budget_amount', type: 'decimal', description: 'Budget target for comparison' },
        { name: 'awarded_vendor_id', type: 'uuid', description: 'Vendor who won the bid' },
        { name: 'awarded_amount', type: 'decimal', description: 'Winning bid amount' },
        { name: 'ai_recommended_vendor_id', type: 'uuid', description: 'AI-recommended winner' },
        { name: 'ai_recommendation_reason', type: 'text', description: 'Why AI recommended' },
        { name: 'attachments', type: 'jsonb', description: 'Attached documents' },
      ]}
      aiFeatures={[
        {
          name: 'Vendor Recommendation',
          description: 'Suggests qualified vendors to invite based on: trade match, past performance score, similar project experience, current availability, and pricing history. "Recommend: ABC Electric (score 92, 8 similar jobs), XYZ Electric (score 85, competitive pricing)."',
          trigger: 'On new bid creation'
        },
        {
          name: 'Scope Completeness Check',
          description: 'Reviews scope description against similar bid packages: "Electrical scope typically includes: rough-in, trim, fixtures, panel, low voltage. This scope missing: low voltage. Add to scope?"',
          trigger: 'Before sending'
        },
        {
          name: 'Bid Price Analysis',
          description: 'Compares each bid to historical pricing and market rates: "ABC Electric: $12,450 (+8% vs. your historical avg). XYZ Electric: $11,200 (-3% vs. avg). Market rate: $11,800. XYZ is competitive."',
          trigger: 'On bid receipt'
        },
        {
          name: 'Missing Scope Detection',
          description: 'Analyzes bid responses to identify exclusions: "ABC Electric excluded low voltage, permits, and final connections. XYZ Electric excluded permits only. Leveled comparison: ABC = $13,100, XYZ = $11,500."',
          trigger: 'On bid comparison'
        },
        {
          name: 'Award Recommendation',
          description: 'Recommends vendor considering total value: "Recommend XYZ Electric. Lower bid (-$1,250), good reliability (88 score), no callbacks on last 3 jobs. ABC is preferred vendor but 11% higher with similar quality."',
          trigger: 'When all bids received'
        },
        {
          name: 'Bid Response Tracking',
          description: 'Monitors vendor responsiveness: "3 of 5 vendors responded. ABC Electric: viewed but not submitted. DEF Electric: declined (capacity). Follow up with ABC?"',
          trigger: 'Real-time tracking'
        },
        {
          name: 'Historical Comparison',
          description: 'Shows how this bid package compares to similar past bids: "Electrical rough-in for similar 3,500 SF coastal home: Smith bid $12,450, Johnson bid $11,800, Davis bid $12,200. This bid range is typical."',
          trigger: 'On bid review'
        },
        {
          name: 'Price Intelligence Capture',
          description: 'Extracts unit pricing from bids even when not awarded: "From XYZ Electric bid: Outlets $165/ea, Switches $85/ea, Panel $2,200. Added to cost database for future estimates."',
          trigger: 'On bid receipt (all bids, not just winner)'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Bid Requests                              [+ New Bid] [Templates]    │
├─────────────────────────────────────────────────────────────────────┤
│ Open Bids: 4 | Awaiting Response: $125K | Savings this month: $8.2K │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: All | Draft | Awaiting | Ready to Award | Awarded             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌────────────────────┬──────────┬─────────┬─────────┬─────────────┐ │
│ │ Bid Package        │ Job      │ Budget  │ Bids    │ AI Rec      │ │
│ ├────────────────────┼──────────┼─────────┼─────────┼─────────────┤ │
│ │ Electrical Rough   │ Smith    │ $12,000 │ 3 of 4  │ XYZ $11,200 │ │
│ │ Due: Dec 15        │ 16000    │         │ ● Ready │ -7% vs budg │ │
│ ├────────────────────┼──────────┼─────────┼─────────┼─────────────┤ │
│ │ Plumbing Finish    │ Smith    │ $8,500  │ 2 of 3  │ Awaiting 1  │ │
│ │ Due: Dec 18        │ 15000    │         │ ● Wait  │             │ │
│ ├────────────────────┼──────────┼─────────┼─────────┼─────────────┤ │
│ │ HVAC Installation  │ Johnson  │ $22,000 │ Awarded │ ✓ ABC HVAC  │ │
│ │ Closed: Dec 8      │ 15500    │         │ ● Done  │ $21,500     │ │
│ └────────────────────┴──────────┴─────────┴─────────┴─────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ AI: "Electrical bid ready. XYZ Electric lowest at $11,200 (7%  │ │
│ │ under budget). Good reliability (88). Recommend award."         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
