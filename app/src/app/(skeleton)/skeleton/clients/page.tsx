'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { ClientsPreview } from '@/components/skeleton/previews/clients-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Leads', 'Clients', 'Jobs', 'Client Portal', 'Selections', 'Warranty'
]

export default function ClientsListSkeleton() {
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
      {activeTab === 'preview' ? <ClientsPreview /> :
    <PageSpec
      title="Clients"
      phase="Phase 0 - Foundation"
      planFile="views/directory/VENDORS_CLIENTS_COSTCODES.md"
      description="Client Intelligence Profiles that learn preferences, communication patterns, and decision-making styles. The system builds understanding over time to personalize selections, predict delays, and improve client satisfaction—automatically."
      workflow={constructionWorkflow}
      features={[
        'Client list with search and filtering',
        'Client detail with all contact information',
        'Associated jobs listing with history',
        'Communication history and response patterns',
        'Portal access management and activity tracking',
        'Document sharing settings per client',
        'Notes and relationship tracking',
        'AI-learned preferences (finishes, brands, styles)',
        'Decision-maker identification (primary, spouse, designer)',
        'Quick actions: Email, Call, Create Job',
        'Client merge for duplicates',
        'Referral source tracking and attribution',
        'Import from CSV or QuickBooks',
      ]}
      connections={[
        { name: 'Leads', type: 'input', description: 'Client created from converted lead' },
        { name: 'Jobs', type: 'bidirectional', description: 'Client has multiple jobs' },
        { name: 'Client Portal', type: 'output', description: 'Portal access per client' },
        { name: 'Proposals', type: 'input', description: 'Proposals sent to client' },
        { name: 'Contracts', type: 'input', description: 'Signed contracts' },
        { name: 'Communication', type: 'bidirectional', description: 'Email/message history' },
        { name: 'Selections', type: 'input', description: 'Selection decisions and preferences' },
        { name: 'Warranty', type: 'output', description: 'Warranty service requests' },
        { name: 'QuickBooks', type: 'bidirectional', description: 'Synced as customers' },
        { name: 'Client Intelligence', type: 'output', description: 'Learned preferences and patterns' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'name', type: 'string', required: true, description: 'Client name' },
        { name: 'email', type: 'string', description: 'Primary email' },
        { name: 'phone', type: 'string', description: 'Primary phone' },
        { name: 'address', type: 'string', description: 'Home address' },
        { name: 'secondary_contact', type: 'jsonb', description: 'Spouse/partner info' },
        { name: 'notes', type: 'text', description: 'General notes' },
        { name: 'portal_enabled', type: 'boolean', description: 'Has portal access' },
        { name: 'portal_user_id', type: 'uuid', description: 'Portal auth user' },
        { name: 'source', type: 'string', description: 'Referral source' },
        { name: 'referral_client_id', type: 'uuid', description: 'Who referred them' },
        { name: 'ai_communication_preference', type: 'string', description: 'Preferred contact method/frequency' },
        { name: 'ai_decision_speed', type: 'string', description: 'Fast, moderate, deliberate' },
        { name: 'ai_style_preferences', type: 'jsonb', description: 'Learned finish/brand preferences' },
        { name: 'ai_budget_sensitivity', type: 'string', description: 'Low, moderate, high' },
        { name: 'total_contract_value', type: 'decimal', description: 'Lifetime value' },
        { name: 'referrals_given', type: 'integer', description: 'Number of referrals provided' },
        { name: 'qb_customer_id', type: 'string', description: 'QuickBooks customer ID' },
      ]}
      aiFeatures={[
        {
          name: 'Communication Pattern Learning',
          description: 'Tracks response times and preferred methods: "The Smiths typically respond within 2 hours to text but 2 days to email. Sarah is the primary decision-maker. Best contact: text to Sarah\'s number."',
          trigger: 'Continuous learning from interactions'
        },
        {
          name: 'Decision Speed Prediction',
          description: 'Learns how quickly clients make decisions: "This client takes an average of 12 days to approve selections. Budget for 2-week response on tile selection or schedule may slip. Send reminder at day 7."',
          trigger: 'From selection and approval history'
        },
        {
          name: 'Style Preference Learning',
          description: 'Builds preference profile from selections: "Client tends toward: Modern/contemporary finishes, White/gray palettes, High-end appliances (Sub-Zero/Wolf), Minimalist hardware. Pre-filter selections catalog accordingly."',
          trigger: 'From selection history'
        },
        {
          name: 'Budget Sensitivity Analysis',
          description: 'Understands price tolerance: "Client approved 8 of 10 over-allowance selections. Average overage: $2,200. Budget sensitivity: Low—prioritize quality options over economy."',
          trigger: 'From selection approvals and change orders'
        },
        {
          name: 'Referral Attribution',
          description: 'Tracks referral networks: "The Smiths were referred by the Johnsons. They have since referred the Davis and Wilson families (2 closed contracts, $3.2M total). High-value relationship."',
          trigger: 'From lead source tracking'
        },
        {
          name: 'Communication Sentiment',
          description: 'Monitors communication tone: "Recent emails from client show increased questions about timeline—possible frustration building. Consider proactive call to address concerns before they escalate."',
          trigger: 'On communication analysis'
        },
        {
          name: 'Duplicate Detection',
          description: 'Identifies potential duplicates based on name, email, phone, and address similarities. Suggests merge when confidence is high.',
          trigger: 'On client create'
        },
        {
          name: 'Warranty Prediction',
          description: 'Predicts potential warranty needs: "Based on selections and home age, expect: HVAC service (12 months), appliance calls (6-18 months), exterior touch-ups (24 months)."',
          trigger: 'Post-completion analysis'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Clients                                    [+ New Client] [Import]   │
├─────────────────────────────────────────────────────────────────────┤
│ Total Clients: 48 | Active Projects: 12 | Lifetime Value: $18.5M    │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [________________]                     [Filter ▾] [Sort ▾]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌────────────────┬────────────────┬──────────────┬────────────────┐ │
│ │ Client         │ Jobs / Value   │ AI Profile   │ Portal / Refs  │ │
│ ├────────────────┼────────────────┼──────────────┼────────────────┤ │
│ │ John & Sue Smith│ 2 / $3.8M     │ Modern, Fast │ ● Active | 2 ★ │ │
│ │ 📱 Text pref   │ 1 active       │ Low budget   │ Referred 2     │ │
│ ├────────────────┼────────────────┼──────────────┼────────────────┤ │
│ │ Sarah Johnson  │ 1 / $2.1M      │ Traditional  │ ● Active | 1 ★ │ │
│ │ 📧 Email pref  │ active         │ deliberate   │ Via Smith ref  │ │
│ ├────────────────┼────────────────┼──────────────┼────────────────┤ │
│ │ Mike Wilson    │ 1 / $1.9M      │ Coastal      │ ○ Inactive     │ │
│ │ ⚠ Slow responder│ warranty      │ Mod budget   │ Warranty phase │ │
│ └────────────────┴────────────────┴──────────────┴────────────────┘ │
│                                                                     │
│ AI Insight: "3 clients in warranty phase—schedule annual reviews"   │
└─────────────────────────────────────────────────────────────────────┘
`}
    />}
    </div>
  )
}
