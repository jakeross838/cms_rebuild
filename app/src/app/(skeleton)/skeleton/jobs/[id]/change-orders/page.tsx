'use client'

import { PageSpec } from '@/components/skeleton/page-spec'
import { ChangeOrdersPreview } from '@/components/skeleton/previews/change-orders-preview'
import { useState } from 'react'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobChangeOrdersPage() {
  
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
        <ChangeOrdersPreview />
      ) : (
        <PageSpec
      title="Change Orders"
      phase="Phase 1 - Project Management"
      planFile="docs/modules/17-change-orders.md"
      description="Full lifecycle change order management from initiation through approval, execution, and financial cascade. COs originate from field conditions, client requests, design changes, allowance overages, or code requirements. Each CO calculates cost impact (materials, labor, equipment, subcontractor + configurable markup), schedule impact, and cascades to contract value, budget, and draw schedule. Client-facing COs presented through client portal with e-signature approval. Negotiation tracking with version history."
      workflow={['Initiate CO', 'Cost & Schedule Impact', 'Internal Approval', 'Client Presentation', 'Negotiation / E-Sign', 'Budget & Schedule Cascade']}
      features={[
        'Filterable CO list with all 8 statuses (draft, internal_review, client_presented, negotiation, approved, rejected, withdrawn, voided)',
        'Multi-section CO form: scope, line items, markup calculation, schedule impact',
        'Live cost impact calculator: materials + labor + equipment + subcontractor + configurable markup',
        'Configurable markup: single %, split OH/profit, tiered, or fixed fee',
        'Credit COs with configurable credit markup (lower than add markup)',
        'Schedule impact with affected task linking and critical path warning',
        'Configurable multi-level approval workflow with threshold routing',
        'Auto-escalation if not approved within configurable days',
        'Client portal presentation with branded template',
        'E-signature widget (ESIGN Act / UETA compliant)',
        'Negotiation tracking: proposed, countered, revised, final states',
        'Version history with side-by-side diff comparison',
        'Communication thread with internal-only notes',
        'Configurable CO numbering per builder',
        'Builder-defined cause categories with primary/secondary tagging',
        'CO analytics: by cause, trade, project, trend over time',
        'Contract value cascade on approval (atomic transaction)',
        'Budget line adjustment with CO-tagged items',
        'Draw schedule recalculation on approval',
        'Auto-CO generation from selection allowance overages',
        'RFI-to-design revision-to-CO linked workflow',
        'CO-triggered PO creation for additional materials',
        'PDF generation for internal and client-facing templates',
        'CO withdrawal window (configurable, default 48 hours)',
        'Void with financial reversal',
        'Photo documentation and supporting documents',
      ]}
      connections={[
        { name: 'Budget', type: 'bidirectional', description: 'Budget line adjustment and cost code impact on approval' },
        { name: 'Schedule', type: 'bidirectional', description: 'Task duration extension, critical path analysis' },
        { name: 'Contract', type: 'bidirectional', description: 'Contract value increase/decrease on approval' },
        { name: 'Draw Schedule', type: 'output', description: 'Remaining draws recalculated on approval' },
        { name: 'RFIs', type: 'input', description: 'RFI-to-design revision-to-CO workflow' },
        { name: 'Selections', type: 'input', description: 'Allowance overage auto-CO trigger' },
        { name: 'Purchase Orders', type: 'output', description: 'CO-triggered PO creation' },
        { name: 'Client Portal', type: 'output', description: 'Client-facing CO with e-signature' },
        { name: 'QuickBooks', type: 'output', description: 'Sync approved COs to accounting' },
        { name: 'Notifications', type: 'output', description: 'Approval alerts, client notifications' },
        { name: 'Vendor Portal', type: 'output', description: 'Sub-related CO visibility' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'builder_id', type: 'uuid', required: true, description: 'Tenant isolation' },
        { name: 'project_id', type: 'uuid', required: true, description: 'This project' },
        { name: 'co_number', type: 'string', required: true, description: 'Formatted per builder template (e.g., CO-001)' },
        { name: 'title', type: 'string', required: true, description: 'Brief title' },
        { name: 'description', type: 'text', description: 'Detailed scope description' },
        { name: 'status', type: 'string', required: true, description: 'draft | internal_review | client_presented | negotiation | approved | rejected | withdrawn | voided' },
        { name: 'source_type', type: 'string', required: true, description: 'field | client_request | design_change | allowance_overage | code_change | builder_initiated' },
        { name: 'cause_category', type: 'string', description: 'Builder-defined cause category' },
        { name: 'cause_secondary', type: 'text[]', description: 'Optional secondary causes' },
        { name: 'initiated_by', type: 'uuid', description: 'User who created the CO' },
        { name: 'materials_cost', type: 'decimal', description: 'Materials subtotal' },
        { name: 'labor_cost', type: 'decimal', description: 'Labor subtotal' },
        { name: 'equipment_cost', type: 'decimal', description: 'Equipment subtotal' },
        { name: 'subcontractor_cost', type: 'decimal', description: 'Subcontractor subtotal' },
        { name: 'subtotal', type: 'decimal', description: 'Generated: sum of cost components' },
        { name: 'markup_type', type: 'string', description: 'single_pct | split_oh_profit | tiered | fixed_fee' },
        { name: 'markup_config', type: 'jsonb', description: 'Markup parameters (e.g., {"pct": 15})' },
        { name: 'markup_amount', type: 'decimal', description: 'Calculated markup' },
        { name: 'total_amount', type: 'decimal', description: 'Subtotal + markup = client-facing total' },
        { name: 'is_credit', type: 'boolean', description: 'True if CO reduces contract' },
        { name: 'schedule_days_impact', type: 'integer', description: 'Additional days (negative for reduction)' },
        { name: 'schedule_impact_description', type: 'text', description: 'Description of schedule effect' },
        { name: 'affected_task_ids', type: 'uuid[]', description: 'Linked schedule tasks' },
        { name: 'rfi_id', type: 'uuid', description: 'Originating RFI if applicable' },
        { name: 'selection_id', type: 'uuid', description: 'Originating selection overage' },
        { name: 'contract_id', type: 'uuid', description: 'Associated contract' },
        { name: 'current_approval_step', type: 'integer', description: 'Current step in approval chain' },
        { name: 'internal_approved_at', type: 'timestamp', description: 'Internal approval timestamp' },
        { name: 'internal_approved_by', type: 'uuid', description: 'Internal approver' },
        { name: 'client_approved_at', type: 'timestamp', description: 'Client approval timestamp' },
        { name: 'client_signature_data', type: 'jsonb', description: 'E-signature: name, IP, timestamp, fingerprint' },
        { name: 'negotiation_status', type: 'string', description: 'proposed | client_counter | builder_counter | revised | final' },
        { name: 'version_number', type: 'integer', description: 'Incremented during negotiation' },
      ]}
      aiFeatures={[
        {
          name: 'Cost Estimation',
          description: 'Compares to similar COs across portfolio. "Similar tray ceiling change on Johnson project cost $4,200. Current lumber prices +8%. Recommend: $4,540."',
          trigger: 'On CO creation'
        },
        {
          name: 'Schedule Impact Analysis',
          description: 'Calculates cascading schedule effects. "This CO adds 3 days to framing. Critical path impact: +2 days to project completion. Target date shifts from Apr 15 to Apr 17."',
          trigger: 'On scope and task linking'
        },
        {
          name: 'Cause Pattern Detection',
          description: 'Identifies CO patterns by cause, trade, and project. "40% of COs from design errors (portfolio avg: 15%). Consider architect pre-review process."',
          trigger: 'On CO analytics view'
        },
        {
          name: 'Negotiation Age Alert',
          description: 'Warns when negotiations stall. "CO-003 in negotiation for 8 days. Auto-escalation triggers in 2 days. Similar COs averaged 4 day resolution."',
          trigger: 'On aging COs'
        },
        {
          name: 'Allowance Overage Detection',
          description: 'Auto-generates draft CO when selection exceeds allowance. "Kitchen appliances: selected $23,200 vs. allowance $8,000. Draft CO-004 created for $16,720 (incl. markup)."',
          trigger: 'On selection overage'
        },
        {
          name: 'Documentation Completeness',
          description: 'Validates CO readiness. "CO missing: cause category, supporting photos (2 attached, 0 tagged). Required for internal approval step 2."',
          trigger: 'Before submission'
        },
        {
          name: 'Budget Cascade Preview',
          description: 'Shows full financial impact before approval. "Approval will: update 09-Finishes budget +$5,060, increase contract to $2,455,060, add $5,060 to next draw (Draw #4)."',
          trigger: 'Before approval'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Change Orders - Smith Residence                 Net Change: +$45,000│
├─────────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                             │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐      │
│ │ Approved     │ Pending      │ Schedule     │ New Contract │      │
│ │ +$38,000     │ +$7,000      │ +8 days      │ $2,438,000   │      │
│ │ 4 COs        │ 1 CO         │              │              │      │
│ └──────────────┴──────────────┴──────────────┴──────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│ PENDING APPROVAL                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CO #5 - Add Tray Ceiling in Master                              │ │
│ │ Requested by: Client | Created: Jan 25                          │ │
│ │ Cost: $5,500 + $1,500 markup = $7,000                           │ │
│ │ Schedule Impact: +3 days                                        │ │
│ │ Status: Submitted to client Jan 26                              │ │
│ │ [View Details] [Send Reminder] [Edit]                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ APPROVED CHANGE ORDERS                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CO #4  Upgrade to impact windows     +$18,000   ✓ Approved 1/15│ │
│ │ CO #3  Add outdoor shower            +$8,500    ✓ Approved 1/10│ │
│ │ CO #2  Relocate HVAC return          +$2,500    ✓ Approved 12/5│ │
│ │ CO #1  Additional electrical outlets +$9,000    ✓ Approved 11/20│ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Original Contract: $2,400,000 | Changes: +$45,000 | New: $2,445,000│
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
