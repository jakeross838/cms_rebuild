'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { WarrantyClaimsPreview } from '@/components/skeleton/previews/warranty-claims-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Client Report', 'Warranty Check', 'Claim Filed', 'Resolution', 'Closeout'
]

export default function WarrantyClaimsSkeleton() {
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
      {activeTab === 'preview' ? <WarrantyClaimsPreview /> :
    <PageSpec
      title="Warranty Claims"
      phase="Phase 5 - Warranty"
      planFile="views/warranty/WARRANTY_CLAIMS.md"
      description="Manage post-completion warranty service requests. Clients report issues, system checks warranty coverage, claims are filed with appropriate parties (manufacturer, vendor, or builder), and resolution is tracked to completion."
      workflow={constructionWorkflow}
      features={[
        'Client-facing claim submission via client portal (photos, description, location)',
        'Builder-side manual claim creation for phone/email reports',
        'AI automatic categorization (structural, mechanical, electrical, plumbing, finish, exterior)',
        'Duplicate detection for claims on same defect from same property',
        'Priority assignment: Emergency (24hr SLA), Urgent (48hr), Standard (5 days), Cosmetic (10 days)',
        'Configurable SLA timers per priority with escalation rules',
        'Determination tracking: covered, manufacturer issue, homeowner responsibility, goodwill',
        'Approval workflow for claims over configurable cost threshold',
        'Auto-dispatch to original trade vendor when claim matches scope',
        'Vendor dispatch tracking: dispatched, accepted, declined, scheduled, completed',
        'Vendor dispute workflow with arbitration',
        'Escalation rules when vendor does not respond in time',
        'Photo documentation with location-in-home tagging',
        'Per-claim cost tracking: labor, materials, vendor invoices',
        'Cost roll-up by category, vendor, project, and time period',
        'Client satisfaction tracking per resolved claim',
        'SLA breach detection with PM/superintendent notification',
        'Walkthrough-linked claims (30-day, 11-month findings auto-create claims)',
        'Rejection workflow with templated reason explanations to homeowner',
        'Warranty reserve draw-down tracking per claim',
        'Historical warranty cost analytics feeding future reserve recommendations',
        'Vendor performance tracking for warranty work (response time, fix rate, callback rate)',
      ]}
      connections={[
        { name: 'Warranties (M31)', type: 'input', description: 'Claims filed against specific warranties, coverage check' },
        { name: 'Client Portal (M29)', type: 'bidirectional', description: 'Clients submit claims and track status in real-time' },
        { name: 'Vendor Management (M10)', type: 'bidirectional', description: 'Vendor dispatch, response tracking, performance scoring' },
        { name: 'Vendor Portal (M30)', type: 'output', description: 'Vendors see assigned claims, accept/decline, mark complete' },
        { name: 'Vendor Performance (M22)', type: 'output', description: 'Claim data feeds vendor warranty scorecards' },
        { name: 'Document Storage (M6)', type: 'bidirectional', description: 'Claim photos, before/after documentation' },
        { name: 'Core Data (M3)', type: 'input', description: 'Project, property, and homeowner records' },
        { name: 'Notification Engine (M5)', type: 'output', description: 'SLA alerts, dispatch notifications, client updates' },
        { name: 'Financial Reporting (M19)', type: 'output', description: 'Warranty cost aggregation into financial reports' },
        { name: 'Estimating Engine (M20)', type: 'output', description: 'Historical warranty costs inform future reserve estimates' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'FK to builders (tenant)' },
        { name: 'project_id', type: 'uuid', required: true, description: 'FK to projects' },
        { name: 'property_id', type: 'uuid', description: 'FK to property records' },
        { name: 'warranty_id', type: 'uuid', description: 'FK to specific warranty being claimed against' },
        { name: 'submitted_by', type: 'uuid', required: true, description: 'User who submitted (client or builder team)' },
        { name: 'claim_number', type: 'string', required: true, description: 'Auto-generated claim reference' },
        { name: 'description', type: 'text', required: true, description: 'Detailed issue description' },
        { name: 'category', type: 'string', required: true, description: 'structural, mechanical, electrical, plumbing, finish, exterior, appliance' },
        { name: 'priority', type: 'string', required: true, description: 'emergency, urgent, standard, cosmetic' },
        { name: 'status', type: 'string', required: true, description: 'submitted, evaluating, dispatched, in_progress, resolved, closed' },
        { name: 'determination', type: 'string', description: 'covered, manufacturer_issue, homeowner_responsibility, goodwill, pending' },
        { name: 'assigned_vendor_id', type: 'uuid', description: 'FK to vendor dispatched for repair' },
        { name: 'assigned_crew_id', type: 'uuid', description: 'FK to builder crew if internal repair' },
        { name: 'sla_deadline', type: 'timestamp', description: 'Calculated SLA response deadline' },
        { name: 'vendor_dispatch_status', type: 'string', description: 'not_dispatched, dispatched, accepted, declined, scheduled, completed' },
        { name: 'scheduled_service_date', type: 'date', description: 'Vendor service appointment date' },
        { name: 'resolved_at', type: 'timestamp', description: 'When resolved' },
        { name: 'resolution_notes', type: 'text', description: 'How the issue was resolved' },
        { name: 'cost', type: 'decimal', description: 'Total claim cost' },
        { name: 'cost_labor', type: 'decimal', description: 'Labor cost component' },
        { name: 'cost_materials', type: 'decimal', description: 'Materials cost component' },
        { name: 'cost_vendor', type: 'decimal', description: 'Vendor invoice cost component' },
        { name: 'satisfaction_score', type: 'integer', description: 'Client satisfaction percentage' },
        { name: 'photos', type: 'jsonb', description: 'Issue photos with captions' },
        { name: 'from_walkthrough_id', type: 'uuid', description: 'FK if claim created from walkthrough finding' },
      ]}
      aiFeatures={[
        {
          name: 'Coverage Analysis',
          description: 'Automatically checks warranty coverage: "Issue: HVAC not cooling. Coverage check: Compressor (10yr - covered), Labor (1yr - expired). Recommend: File parts claim with Trane, schedule service at builder cost for labor."',
          trigger: 'On claim submission'
        },
        {
          name: 'Routing Intelligence',
          description: 'Routes to appropriate party: "Tile grout cracking in bathroom. Pattern matches installation issue (not product defect). Routing to ABC Tile for workmanship warranty."',
          trigger: 'On claim evaluation'
        },
        {
          name: 'Pattern Detection',
          description: 'Identifies recurring issues: "3rd window seal failure at Smith residence. All PGT windows from same lot. Recommend: Contact PGT for batch inspection."',
          trigger: 'On claim submission'
        },
        {
          name: 'Priority Assessment',
          description: 'AI assesses true priority: "Client reports \'water issue\' - analyzing photos shows active roof leak over electrical panel. Escalating to Emergency."',
          trigger: 'On claim submission'
        },
        {
          name: 'Resolution Suggestions',
          description: 'Suggests resolution based on similar past claims: "Similar HVAC claims resolved by: capacitor replacement (60%), refrigerant recharge (25%), thermostat reset (15%)."',
          trigger: 'On claim assignment'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Warranty Claims                             [+ New Claim]           │
├─────────────────────────────────────────────────────────────────────┤
│ 6 claims | 2 open | 1 in progress | Avg Resolution: 4.2 days       │
├─────────────────────────────────────────────────────────────────────┤
│ All (6) | Submitted (1) | Evaluating (1) | In Progress (1) | ...    │
│ Priority: 🔴 Emergency (1) | 🟠 High (2) | 🔵 Normal (2) | ⚪ Low   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 🔴 CLM-2024-089 Water leak - Smith Residence      [Submitted]      │
│ Master Bathroom | 2 hrs ago | 3 photos | Emergency Priority        │
│ AI: "Active leak over electrical panel. Photos show water staining.│
│ Escalate to Emergency. Contact Smith immediately."                 │
│                                                                     │
│ 🟠 CLM-2024-085 HVAC not cooling - Johnson        [In Progress]    │
│ Main Floor | 3 days ago | 2 photos | High Priority                 │
│ Assigned to: ABC HVAC Services                                     │
│ Coverage: Trane warranty (parts only, labor expired)               │
│                                                                     │
│ ✓ CLM-2024-082 Cabinet door alignment - Davis    [Resolved] ★95%  │
│ Kitchen | 6 days ago | 1 photo | Normal Priority                  │
│ Resolved by: Cabinet Pros LLC | Client satisfied                   │
│                                                                     │
│ Timeline: Reported (Jan 28) → Evaluated (Jan 29) → Assigned (Jan 30)
│          → Resolved (Feb 2)                                        │
│                                                                     │
│ AI Pattern Detection:                                               │
│ • 3 window seal failures this quarter (same batch) - recommend      │
│   proactive inspection of all affected units                       │
│ • HVAC cooling issues peak in warm months - allocate more vendors  │
│ • Cabinet adjustments resolve 95% of issues - schedule routine     │
└─────────────────────────────────────────────────────────────────────┘
`}
      />
    }
    </div>
  )
}
